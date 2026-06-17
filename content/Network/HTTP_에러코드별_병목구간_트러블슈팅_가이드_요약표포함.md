---
title: HTTP_에러코드별_병목구간_트러블슈팅_가이드_요약표포함
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-18T05:00:07+09:00
---

# HTTP 에러 코드별 병목 구간을 좁히는 클라이언트 측 트러블슈팅 가이드

> 이 문서는 이전 502 사례의 검증 흐름을 일반화한 문서다. 이전 사례에서는 DNS, TCP, TLS는 정상이고 Azure Application Gateway가 즉시 502를 반환하는 형태였으므로, “클라이언트가 어디까지 확인할 수 있고, 어디부터 운영자 확인 영역인지”를 나누는 것이 핵심이었다.

---

## 1. 문서 목적

웹 서비스 장애가 발생했을 때 사용자가 처음 보는 것은 보통 하나의 HTTP 상태 코드다. 예를 들면 `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `429 Too Many Requests`, `500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable`, `504 Gateway Timeout` 같은 코드다.

이 숫자 하나만으로 원인을 확정할 수는 없다. 그러나 이 코드는 “어디까지는 정상이고, 어느 구간부터 의심해야 하는지”를 좁히는 첫 단서가 된다. HTTP 상태 코드는 크게 1xx, 2xx, 3xx, 4xx, 5xx로 나뉘며, 실무 장애 분석에서는 특히 4xx와 5xx의 성격 차이를 먼저 봐야 한다.

| 구분 | 의미 | 장애 분석에서의 1차 해석 |
|---|---|---|
| 1xx | Informational | 요청 처리 중간 상태. 일반 사용자가 직접 볼 일은 적다. |
| 2xx | Successful | 요청이 정상 처리됨. 장애 코드가 아니다. |
| 3xx | Redirection | 추가 이동이 필요함. 보통 장애가 아니지만 리다이렉트 루프는 문제다. |
| 4xx | Client Error | 요청 구문, 인증, 권한, 경로, 크기, 요청 빈도 문제 가능성이 높다. |
| 5xx | Server Error | 서버, Gateway, Backend, DB, 외부 API 문제 가능성이 높다. |

이 문서의 목적은 다음 네 가지다. 첫째, HTTP 에러 코드별로 의심할 병목 구간을 정리한다. 둘째, 클라이언트 입장에서 확인 가능한 명령어와 방법을 정리한다. 셋째, 브라우저 문제, 네트워크 문제, 인증 문제, 서버 문제, Gateway 문제를 구분한다. 넷째, 운영자 또는 개발자에게 전달할 수 있는 증거를 만든다.

---

## 2. 먼저 전체 구조를 잡는다

웹 요청은 보통 다음 흐름으로 처리된다.

```text
Browser / Client
→ DNS
→ TCP
→ TLS
→ CDN / WAF
→ Load Balancer / Application Gateway / Reverse Proxy
→ Web Server
→ Application Server
→ Database / Cache / External API
```

장애를 볼 때는 에러 코드만 보지 말고, 이 흐름 중 어디에서 막혔는지 좁혀야 한다. DNS가 실패하면 애초에 목적지를 찾지 못한 것이고, TCP가 실패하면 포트 연결 또는 네트워크 경로 문제다. TLS가 실패하면 인증서, SNI, TLS 버전, cipher 협상 문제가 될 수 있다. HTTP 응답이 돌아왔다는 것은 최소한 HTTP 응답을 생성한 주체까지는 도달했다는 뜻이다. 다만 그 응답 주체가 실제 애플리케이션인지, CDN인지, WAF인지, Gateway인지 확인해야 한다.

| 구간 | 실패 시 보이는 현상 | 주로 확인할 것 |
|---|---|---|
| DNS | 도메인 해석 실패, `NXDOMAIN`, `SERVFAIL` | `dig`, `nslookup`, CNAME, A/AAAA record |
| TCP | timeout, connection refused | 포트, 방화벽, 라우팅, NSG, 보안그룹 |
| TLS | certificate error, handshake failure | 인증서 만료, SAN/CN, SNI, TLS 버전 |
| CDN/WAF | 403, 429, 5xx, 보안 차단 페이지 | `Server`, `Via`, `CF-*`, WAF 차단 메시지 |
| Gateway/Proxy | 502, 503, 504 | upstream, backend health, probe, timeout |
| Application | 400, 401, 403, 404, 422, 500 | 요청 형식, 인증, 권한, 라우팅, 코드 예외 |
| DB/외부 API | 느린 응답 후 500/503/504 | 쿼리 지연, connection pool, lock, 외부 API timeout |

핵심 질문은 다음과 같다.

```text
DNS 문제인가?
TCP 연결 문제인가?
TLS 인증서 문제인가?
브라우저 또는 쿠키 문제인가?
인증/인가 문제인가?
API 요청 형식 문제인가?
Gateway 또는 Proxy 문제인가?
Application Server 문제인가?
Database 또는 외부 API 문제인가?
```

---

## 3. 공통 점검 순서

어떤 에러 코드든 먼저 같은 순서로 확인하면 된다. 이 순서는 “아래 계층에서 위 계층으로 올라가는 방식”이다. DNS, TCP, TLS가 정상이라면 네트워크 하위 계층의 가능성을 낮출 수 있고, HTTP 헤더와 응답 시간까지 보면 응답 주체와 병목 위치를 더 좁힐 수 있다.

| 순서 | 확인 대상 | 명령어/방법 | 확인 포인트 | 판단 방향 |
|---|---|---|---|---|
| 1 | DNS | `dig`, `nslookup` | IP 해석, CNAME, timeout | 도메인을 찾는 단계가 정상인지 확인 |
| 2 | TCP | `nc -vz host 443` | succeeded, timeout, refused | 포트 연결 가능 여부 확인 |
| 3 | TLS | `openssl s_client` | 인증서, SNI, 만료, handshake | HTTPS 협상 문제 분리 |
| 4 | HTTP Header | `curl -vI` | 상태 코드, Server, Location, Retry-After | 누가 응답했는지 추정 |
| 5 | 응답 시간 | `curl -w` | DNS/TCP/TLS/first byte/total | 어느 단계가 느린지 확인 |
| 6 | 브라우저 | DevTools Network | Cookie, Payload, Response, CORS | 브라우저에서만 실패하는지 확인 |
| 7 | 다른 환경 | 핫스팟, VPN, 시크릿, 다른 브라우저 | 재현 범위 | 내 환경 문제인지 서비스 문제인지 분리 |

### 3.1 DNS 확인

DNS는 도메인을 IP로 바꾸는 단계다. 이 단계가 실패하면 애플리케이션이나 Gateway까지 요청이 가지 않는다.

```bash
dig +short example.com
nslookup example.com
```

`NXDOMAIN`이면 도메인 자체가 없거나 잘못 입력되었을 가능성이 높다. `SERVFAIL`이면 DNS 서버 또는 도메인 설정 문제일 수 있다. 정상 IP가 반환되면 적어도 도메인 해석 자체는 가능하므로 TCP와 TLS 단계로 넘어간다.

| 결과 | 해석 | 다음 확인 |
|---|---|---|
| 정상 IP 반환 | DNS 해석 가능 | TCP 80/443 연결 확인 |
| `NXDOMAIN` | 도메인 없음 또는 오타 | 도메인, DNS record, 배포 도메인 확인 |
| `SERVFAIL` | DNS 서버 또는 권한 DNS 문제 가능 | 다른 DNS 서버, 도메인 설정 확인 |
| timeout | DNS 서버 응답 지연 또는 네트워크 문제 | 네트워크, DNS 서버, VPN 확인 |

### 3.2 TCP 포트 확인

HTTPS 서비스라면 보통 443 포트를 확인한다. HTTP도 열려 있어야 하는 서비스라면 80도 확인한다.

```bash
nc -vz example.com 443
nc -vz example.com 80
```

`succeeded`가 나오면 TCP 연결은 가능하다. `timeout`이면 방화벽, 라우팅, 네트워크 차단 가능성이 있다. `connection refused`는 대상 서버나 Gateway까지는 도달했지만 해당 포트에서 수신하지 않는 상황에 가깝다.

| 결과 | 해석 | 의심 지점 |
|---|---|---|
| succeeded | TCP 연결 가능 | 상위 계층인 TLS/HTTP 확인 |
| timeout | 응답이 돌아오지 않음 | 방화벽, 라우팅, 네트워크 차단 |
| connection refused | 대상이 연결을 거부함 | 포트 미오픈, 프로세스 미기동, 리스너 없음 |

### 3.3 TLS 인증서 확인

HTTPS에서는 TCP 연결 이후 TLS handshake가 이루어진다. 이 단계에서 인증서, SNI, TLS 버전, cipher 협상 문제가 발생할 수 있다.

```bash
openssl s_client -connect example.com:443 -servername example.com </dev/null
```

`-servername`은 SNI를 명시하기 위한 옵션이다. 같은 IP에서 여러 HTTPS 서비스를 운영하는 경우 SNI가 없으면 서버가 잘못된 인증서를 줄 수 있다. `Verify return code: 0 (ok)`이면 클라이언트 기준으로 인증서 체인 검증이 성공한 것이다.

| 확인 항목 | 정상 예시 | 실패 시 의심 |
|---|---|---|
| Verify return code | `0 (ok)` | 인증서 체인, CA, 중간 인증서 문제 |
| CN/SAN | 접속 도메인 포함 | hostname mismatch |
| Not After | 미래 날짜 | 인증서 만료 |
| handshake | 완료 | TLS 버전, cipher, SNI, 인증서 설정 |

### 3.4 HTTP 응답 헤더 확인

HTTP 응답을 받았다면 이제 응답 주체를 봐야 한다. 같은 502라도 실제 애플리케이션이 만든 502인지, NGINX가 만든 502인지, Azure Application Gateway가 만든 502인지에 따라 대응이 달라진다.

```bash
curl -vI https://example.com
```

본문까지 보려면 다음을 사용한다.

```bash
curl -vk https://example.com
```

| 헤더 | 볼 이유 | 예시 해석 |
|---|---|---|
| `Server` | 응답 주체 추정 | `nginx`, `cloudflare`, `Microsoft-Azure-Application-Gateway/v2` |
| `Location` | 리다이렉트 목적지 확인 | 로그인 페이지 반복, http→https 이동 |
| `Set-Cookie` | 세션/쿠키 발급 여부 | 로그인 후 쿠키 발급 여부 확인 |
| `WWW-Authenticate` | 401 인증 방식 확인 | Bearer, Basic 등 challenge 확인 |
| `Allow` | 405에서 허용 method 확인 | `GET, POST` 등 |
| `Retry-After` | 재시도 대기 시간 확인 | 429, 503, 일부 3xx에서 확인 |
| `Via` | proxy 경유 여부 | 중간 proxy/CDN 추정 |
| `X-Cache` | CDN 캐시 여부 | HIT/MISS, Origin 도달 여부 추정 |

`Server` 헤더만으로 모든 것을 단정하면 안 된다. 다만 클라이언트 입장에서는 응답 주체를 추정할 수 있는 중요한 단서다.

### 3.5 응답 시간 확인

응답 시간은 병목 위치를 좁히는 데 매우 중요하다. `curl --write-out`을 사용하면 DNS, TCP, TLS, 첫 바이트, 전체 시간을 나누어 볼 수 있다.

```bash
curl -sS -o /dev/null \
-w "code=%{http_code}\nremote_ip=%{remote_ip}\ndns=%{time_namelookup}\nconnect=%{time_connect}\ntls=%{time_appconnect}\nfirst_byte=%{time_starttransfer}\ntotal=%{time_total}\n" \
https://example.com
```

| curl 항목 | 의미 | 길어질 때 의심할 병목 |
|---|---|---|
| `time_namelookup` | 이름 해석 완료까지 걸린 시간 | DNS 서버, 도메인 설정, 네트워크 DNS 문제 |
| `time_connect` | TCP 연결 완료까지 걸린 시간 | 방화벽, 라우팅, 포트 차단, 네트워크 지연 |
| `time_appconnect` | TLS handshake 완료까지 걸린 시간 | 인증서, TLS 버전, cipher, SNI 문제 |
| `time_starttransfer` | 첫 응답 바이트 수신까지 걸린 시간 | 서버 처리, DB, 외부 API, Backend 지연 |
| `time_total` | 전체 요청 완료 시간 | 전체 처리 지연, timeout, 대용량 응답 |

`first_byte`만 길면 서버가 요청을 받은 뒤 처리하는 시간이 길다는 뜻이다. DB 쿼리, 외부 API, lock, thread pool, connection pool 병목을 의심할 수 있다. 반대로 `total`이 매우 짧은 502/503이면 Gateway가 backend를 기다리지 않고 즉시 실패를 반환했을 가능성이 커진다.

### 3.6 브라우저 개발자도구 확인

브라우저에서만 실패하고 curl은 성공하는 경우가 있다. 이때는 네트워크보다 브라우저 상태, 쿠키, 세션, CORS, 확장 프로그램, 캐시를 봐야 한다.

```text
Chrome 기준
F12
→ Network 탭
→ 페이지 새로고침
→ 실패한 요청 클릭
→ Headers / Payload / Response 확인
```

| 확인 위치 | 볼 항목 | 의심 가능한 문제 |
|---|---|---|
| Headers | Request URL, Method, Cookie, Authorization | 인증 헤더 누락, 쿠키 미전송 |
| Payload | Request Body, Form Data | 잘못된 JSON, 필수값 누락 |
| Response | Error body | validation, 권한, 서버 예외 메시지 |
| Cookies | SameSite, Secure, Domain, Path | 로그인 유지 실패, cross-site 쿠키 문제 |
| Console | CORS, CSP, mixed content | 브라우저 보안 정책 차단 |

### 3.7 다른 환경에서 비교

같은 요청을 다른 환경에서 비교하면 로컬 문제와 서비스 문제를 나눌 수 있다.

| 비교 환경 | 의미 |
|---|---|
| 현재 Wi-Fi vs 휴대폰 핫스팟 | 로컬 네트워크/공유기/DNS 문제 분리 |
| VPN ON vs OFF | VPN 경로, 사내망, 지역 차단 문제 분리 |
| 일반 브라우저 vs 시크릿 모드 | 쿠키, 캐시, 확장 프로그램 영향 분리 |
| Chrome vs Safari/Firefox | 브라우저별 정책/확장 영향 분리 |
| 외부 다중 지역 체크 | 특정 사용자 환경인지 서비스 전체 문제인지 분리 |

여러 네트워크와 외부 지역에서 모두 실패하면 클라이언트 문제 가능성은 낮아진다. 반대로 내 브라우저에서만 실패하면 쿠키, 세션, 캐시, 확장 프로그램, 로컬 프록시, VPN을 먼저 의심한다.

---

## 4. 400 Bad Request

| 항목 | 내용 |
|---|---|
| 의미 | 요청 구문이나 요청 형식이 잘못되어 서버가 처리하지 않음 |
| 주된 병목 | Request Line, Query String, Header, Body, API Validation |
| 흔한 원인 | JSON 오류, 필수 파라미터 누락, Content-Type 오류, URL 인코딩 오류 |
| 먼저 볼 것 | Payload, Query, Header, Response Body |
| 운영자에게 줄 정보 | URL, Method, Header, Payload, 정상 요청과 실패 요청 차이 |

400은 서버가 요청을 이해할 수 없거나, 요청이 서버가 기대하는 형식과 다르다고 판단한 상황이다. 대부분 서버 인프라보다 요청 형식 자체가 문제일 가능성이 높다. 다만 WAF나 API Gateway가 잘못된 헤더, 너무 큰 헤더, 비정상적인 request line을 보고 400을 만들 수도 있으므로 응답 주체를 함께 봐야 한다.

브라우저 개발자도구에서 실패한 요청의 Payload와 Request Headers를 먼저 확인한다. JSON body가 있다면 `jq`로 문법 오류를 확인하고, curl로 같은 요청을 재현한다.

```bash
curl -v -X POST https://example.com/api/users \
-H "Content-Type: application/json" \
-d '{"name":"kim"}'
```

```bash
echo '{"name":"kim"}' | jq .
```

| 판단 | 해석 |
|---|---|
| 올바른 body를 넣으면 성공 | 요청 payload 문제 |
| 브라우저 요청만 실패하고 curl은 성공 | 프론트엔드 요청 생성, 헤더, 쿠키 문제 |
| 모든 요청이 400 | API 명세 변경, Gateway/WAF 요청 거부, 공통 validation 문제 |

---

## 5. 401 Unauthorized

| 항목 | 내용 |
|---|---|
| 의미 | 인증되지 않은 요청. 유효한 인증 정보가 없거나 실패함 |
| 주된 병목 | Cookie, Token, Authorization Header, Session Store, Identity Provider |
| 흔한 원인 | 로그인 안 됨, 세션 만료, 토큰 만료, Authorization 헤더 누락, 쿠키 미전송 |
| 먼저 볼 것 | `Authorization`, `Cookie`, `Set-Cookie`, `WWW-Authenticate` |
| 운영자에게 줄 정보 | 401 발생 API, 로그인 여부, 쿠키/토큰 전송 여부, 토큰 만료 시각 |

401은 “누구인지 모른다”에 가깝다. RFC 9110 기준으로 401 응답은 대상 리소스에 유효한 인증 자격 증명이 없기 때문에 요청이 적용되지 않았다는 뜻이며, 서버는 `WWW-Authenticate` 헤더를 보내야 한다. 따라서 401을 볼 때는 응답 헤더의 `WWW-Authenticate`와 요청 헤더의 `Authorization` 또는 `Cookie`를 같이 본다.

```bash
curl -v https://example.com/api/me \
-H "Authorization: Bearer ACCESS_TOKEN"
```

쿠키 기반 인증이면 쿠키가 실제 요청에 포함되는지 확인한다.

```bash
curl -v https://example.com/api/me \
-H "Cookie: SESSION=..."
```

| 판단 | 해석 |
|---|---|
| 토큰 없이 호출하면 401 | 정상 인증 보호 동작일 수 있음 |
| 토큰을 넣어도 401 | 토큰 만료, 서명 오류, issuer/audience 불일치 가능 |
| 브라우저는 401, curl은 성공 | 쿠키, SameSite, CORS, 브라우저 저장소 문제 가능 |
| 로그인 직후에도 401 | 세션 저장소, 인증 서버, JWT 발급/전달 문제 가능 |

---

## 6. 403 Forbidden

| 항목 | 내용 |
|---|---|
| 의미 | 인증은 되었지만 해당 리소스에 접근할 권한이 없음 |
| 주된 병목 | Authorization, Role, Permission, Resource Ownership, WAF/IP Policy |
| 흔한 원인 | Role 미부여, 관리자 API 접근, 본인 소유가 아닌 리소스 접근, CSRF, IP 차단 |
| 먼저 볼 것 | 사용자 Role, 권한, Origin/Referer, CSRF token, IP 정책 |
| 운영자에게 줄 정보 | 사용자 계정, Role, 실패 URL/Method, 성공 계정과 실패 계정 비교 |

403은 “누구인지는 알지만 허용하지 않는다”에 가깝다. 401과 구분해야 한다. 401은 인증 정보가 없거나 유효하지 않은 상황이고, 403은 인증 이후 권한 판단에서 막힌 상황이다.

```bash
curl -v https://example.com/api/me \
-H "Authorization: Bearer ACCESS_TOKEN"
```

```bash
curl -v https://example.com/admin \
-H "Authorization: Bearer ACCESS_TOKEN"
```

| 판단 | 해석 |
|---|---|
| 다른 권한 계정은 성공 | Role/Permission 문제 |
| 모든 계정이 실패 | 서버 권한 정책, WAF, CSRF, Origin 정책 문제 가능 |
| 특정 네트워크에서만 403 | IP allowlist, Geo Blocking, WAF 정책 가능 |
| GET은 되는데 POST만 403 | CSRF, Origin, 권한 정책 문제 가능 |

### 401과 403 비교

| 구분 | 401 Unauthorized | 403 Forbidden |
|---|---|---|
| 핵심 의미 | 인증되지 않음 | 인증은 되었지만 권한 없음 |
| 쉽게 말하면 | “로그인 필요” | “너는 이 리소스에 접근할 수 없음” |
| 주된 확인 | Token, Cookie, `WWW-Authenticate` | Role, Permission, CSRF, IP 정책 |
| 요청 재시도 방향 | 인증 정보 보완 후 재시도 | 권한/정책 변경 없이는 재시도해도 실패 가능 |
| 실무 예시 | 세션 만료, 토큰 누락 | 관리자 API 접근, 소유자 불일치 |

---

## 7. 404 Not Found

| 항목 | 내용 |
|---|---|
| 의미 | 요청한 리소스 또는 경로를 찾을 수 없음 |
| 주된 병목 | URL Path, Routing, Reverse Proxy Rule, Application Route, Static File, Resource ID |
| 흔한 원인 | URL 오타, API 경로 변경, proxy rewrite 오류, 정적 파일 누락, 삭제된 리소스 |
| 먼저 볼 것 | 정확한 URL, Method, base path, resource id, 배포 직후 여부 |
| 운영자에게 줄 정보 | 실패 URL, 유사 성공 URL, SPA 새로고침 여부, 배포 시점 |

404는 단순히 “서버가 죽었다”가 아니라 “해당 경로 또는 리소스를 찾지 못했다”는 뜻이다. 루트 페이지는 200인데 특정 API만 404라면 라우팅이나 리소스 ID 문제일 가능성이 높다. API 전체가 404라면 reverse proxy의 path rewrite, base path, upstream routing 문제를 의심한다.

```bash
curl -vI https://example.com/some/path
curl -vk https://example.com/some/path
curl -vI https://example.com/
curl -vI https://example.com/api
```

| 판단 | 해석 |
|---|---|
| 루트는 200, 특정 경로만 404 | 라우팅 또는 리소스 문제 |
| API 전체가 404 | Reverse Proxy routing, base path 설정 문제 가능 |
| SPA 새로고침 시에만 404 | History Router와 서버 fallback 설정 문제 가능 |
| 특정 ID만 404 | 리소스 없음 또는 권한상 숨김 처리 가능 |

---

## 8. 405 Method Not Allowed

| 항목 | 내용 |
|---|---|
| 의미 | URL은 존재하지만 해당 HTTP Method를 허용하지 않음 |
| 주된 병목 | Client Method, Router Method Mapping, CORS Preflight, Reverse Proxy Method Policy |
| 흔한 원인 | GET/POST 혼동, PUT/PATCH/DELETE 미지원, OPTIONS preflight 실패 |
| 먼저 볼 것 | 요청 Method, API 문서상 Method, `Allow` 헤더 |
| 운영자에게 줄 정보 | URL, 사용 Method, API 문서 Method, `Allow` 헤더, OPTIONS 여부 |

405는 경로 자체는 존재하지만 요청 Method가 맞지 않는 상황이다. RFC 9110 기준으로 origin server는 405 응답에 현재 리소스가 지원하는 method 목록을 담은 `Allow` 헤더를 생성해야 한다. 따라서 405에서는 `Allow`를 반드시 확인한다.

```bash
curl -vI https://example.com/api/items
```

```bash
curl -v -X GET https://example.com/api/items
curl -v -X POST https://example.com/api/items
curl -v -X OPTIONS https://example.com/api/items
```

| 판단 | 해석 |
|---|---|
| GET은 성공, POST는 405 | API method 사용 오류 가능 |
| OPTIONS만 405 | CORS preflight 또는 프록시 method 허용 문제 가능 |
| 문서상 POST인데 405 | 서버 라우팅 설정, 배포 버전, Gateway rule 문제 가능 |

---

## 9. 408 Request Timeout

| 항목 | 내용 |
|---|---|
| 의미 | 서버가 정해진 시간 안에 완전한 요청 메시지를 받지 못함 |
| 주된 병목 | Client Upload, Network, Proxy, Server Request Read Timeout |
| 흔한 원인 | 네트워크 지연, 대용량 업로드 지연, 요청 body 전송 중단, 프록시 request timeout |
| 먼저 볼 것 | 업로드 크기, 전송 시간, 네트워크 환경, timeout 발생 시점 |
| 운영자에게 줄 정보 | 요청 크기, 파일 크기, 발생까지 걸린 시간, 성공/실패 비교 |

408은 서버가 클라이언트의 요청을 기다리다가 timeout 처리한 상황이다. 특히 파일 업로드나 큰 body를 보내는 요청에서 발생할 수 있다. 서버가 응답을 오래 계산하다가 실패하는 504와 다르게, 408은 “요청을 다 받는 단계”에서의 timeout에 가깝다.

```bash
curl -sS -o /dev/null \
-w "connect=%{time_connect}\nstart=%{time_starttransfer}\ntotal=%{time_total}\n" \
https://example.com/upload
```

```bash
curl -v -F "file=@small.txt" https://example.com/upload
curl -v -F "file=@large.zip" https://example.com/upload
```

| 판단 | 해석 |
|---|---|
| 작은 파일은 성공, 큰 파일은 408 | 업로드 시간 또는 크기 제한 문제 |
| 특정 네트워크에서만 408 | 네트워크 품질 문제 가능 |
| 항상 일정 시간 후 408 | 서버 또는 프록시 request timeout 설정 가능 |

---

## 10. 409 Conflict

| 항목 | 내용 |
|---|---|
| 의미 | 요청이 현재 서버 상태와 충돌함 |
| 주된 병목 | Business Rule, Resource Version, Duplicate Check, Transaction, Concurrency Control |
| 흔한 원인 | 중복 가입, 중복 주문, 동시 수정, 버전 충돌, 낙관적 락 실패 |
| 먼저 볼 것 | 리소스 ID, 중복 여부, version/etag, 동시에 작업한 사용자 여부 |
| 운영자에게 줄 정보 | Payload, 리소스 ID, 중복 여부, conflict reason |

409는 요청 문법이 틀린 것이 아니라, 현재 서버 상태와 충돌해서 처리할 수 없다는 의미다. 예를 들어 이미 존재하는 이름으로 생성하거나, 동시에 같은 리소스를 수정하거나, 이미 처리된 요청을 다시 보내는 경우가 해당한다.

```bash
curl -v https://example.com/api/resource \
-H "Content-Type: application/json" \
-d '{"name":"same-name"}'
```

| 판단 | 해석 |
|---|---|
| 같은 값으로 요청할 때만 409 | 중복 또는 비즈니스 규칙 충돌 |
| 동시에 여러 사용자가 수정할 때 409 | 버전 충돌 또는 락 문제 |
| 아무 값이나 409 | 서버 상태 관리 또는 validation 문제 가능 |

---

## 11. 413 Content Too Large / Payload Too Large

| 항목 | 내용 |
|---|---|
| 의미 | 요청 데이터가 서버가 허용하는 크기보다 큼 |
| 주된 병목 | Client Upload, CDN/WAF, Gateway, Reverse Proxy, Web Server, Application Upload Limit |
| 흔한 원인 | 파일 업로드 크기 초과, JSON body 크기 초과, proxy body size 제한, multipart 제한 |
| 먼저 볼 것 | 파일 크기, Content-Length, Content-Type, 실패 기준 크기, Server 헤더 |
| 운영자에게 줄 정보 | 파일 크기, 업로드 URL, 실패 기준 크기, 응답 주체, 서버 제한값 |

IANA/RFC 9110 기준 명칭은 `413 Content Too Large`다. 다만 실무에서는 과거 표현인 `Payload Too Large` 또는 NGINX 계열의 `Request Entity Too Large`도 자주 보인다. 핵심은 요청 body가 어느 계층의 제한보다 크다는 것이다.

```bash
curl -v -F "file=@small.jpg" https://example.com/upload
curl -v -F "file=@large.zip" https://example.com/upload
ls -lh large.zip
```

NGINX를 사용하는 경우 `client_max_body_size`가 대표적인 제한 지점이 될 수 있다. 다만 실제 환경에서는 CDN, WAF, Gateway, reverse proxy, application framework, multipart 설정이 각각 별도 제한을 가질 수 있으므로 “어느 계층이 413을 만들었는지”를 응답 헤더와 로그로 확인해야 한다.

| 판단 | 해석 |
|---|---|
| 작은 파일 성공, 큰 파일 413 | 업로드 크기 제한 |
| 특정 크기 이상부터 실패 | Gateway, Proxy, Application 중 하나의 body size limit |
| 브라우저에서만 실패 | 프론트엔드 사전 제한, multipart 생성 문제 가능 |
| Server 헤더가 NGINX | NGINX body size 제한 또는 upstream 전 단계 제한 가능 |

---

## 12. 415 Unsupported Media Type

| 항목 | 내용 |
|---|---|
| 의미 | 서버가 요청의 Content-Type을 처리할 수 없음 |
| 주된 병목 | Request Header, Content-Type, Body Parser, API Controller |
| 흔한 원인 | JSON API에 text/plain 전송, multipart API에 JSON 전송, Content-Type 누락, boundary 문제 |
| 먼저 볼 것 | `Content-Type`, 요청 body 형식, API 문서상 요구 타입 |
| 운영자에게 줄 정보 | Request Headers, Content-Type, Body 형식, 문서상 요구 Content-Type |

415는 요청의 의미나 값보다 media type이 맞지 않는 상황이다. JSON API라면 `application/json`, 파일 업로드라면 보통 `multipart/form-data`가 필요하다. 특히 multipart는 boundary가 필요하므로 브라우저/라이브러리가 자동 설정하게 두는 것이 더 안전한 경우가 많다.

```bash
curl -v -X POST https://example.com/api/items \
-H "Content-Type: application/json" \
-d '{"name":"item"}'
```

```bash
curl -v -X POST https://example.com/api/items \
-H "Content-Type: text/plain" \
-d '{"name":"item"}'
```

| 판단 | 해석 |
|---|---|
| Content-Type을 바꾸면 성공 | 요청 헤더 문제 |
| 브라우저만 실패 | fetch/axios 설정 문제 |
| multipart 업로드만 실패 | form-data 처리 또는 boundary 문제 가능 |

---

## 13. 422 Unprocessable Content

| 항목 | 내용 |
|---|---|
| 의미 | 요청 문법은 맞지만 의미적으로 처리할 수 없음 |
| 주된 병목 | Request Body, DTO Binding, Validation, Business Rule |
| 흔한 원인 | 필수 필드 누락, 이메일 형식 오류, 날짜 범위 오류, 비즈니스 규칙 위반 |
| 먼저 볼 것 | validation error body, 필드 값, 정상 값과 실패 값 비교 |
| 운영자에게 줄 정보 | Payload, validation message, API 문서 기준, 정상/실패 값 비교 |

422는 400과 비슷하지만 보통 validation 실패에 더 가깝다. JSON 문법 자체는 맞고 Content-Type도 맞지만, 필드 값이 서버의 규칙을 통과하지 못하는 상황이다. 예를 들어 이메일 형식이 틀렸거나, 날짜 범위가 허용되지 않거나, 특정 상태에서는 요청이 허용되지 않는 경우가 해당한다.

```bash
curl -v -X POST https://example.com/api/users \
-H "Content-Type: application/json" \
-d '{"email":"wrong"}'
```

| 판단 | 해석 |
|---|---|
| 특정 필드 값에서만 실패 | validation 문제 |
| 문서상 맞는 값인데 실패 | API 문서 불일치 또는 서버 validation 변경 가능 |
| 프론트엔드는 통과, 서버에서 422 | 프론트엔드 validation 누락 또는 서버 규칙 강화 |

### 400과 422 비교

| 구분 | 400 Bad Request | 422 Unprocessable Content |
|---|---|---|
| 핵심 | 요청 형식 자체가 문제 | 형식은 맞지만 의미/검증 실패 |
| 예시 | JSON 문법 오류, Content-Type 오류 | 이메일 형식 오류, 날짜 범위 오류 |
| 먼저 볼 것 | 문법, Header, Query, Body 구조 | validation message, 필드 값 |
| 대응 | 요청 생성 로직 수정 | 입력값/비즈니스 규칙 확인 |

---

## 14. 429 Too Many Requests

| 항목 | 내용 |
|---|---|
| 의미 | 일정 시간 동안 너무 많은 요청을 보냄 |
| 주된 병목 | Client, CDN/WAF, API Gateway, Rate Limiter, Application |
| 흔한 원인 | 자동 새로고침, 재시도 루프, polling 폭증, 봇 탐지, IP/계정/API token 제한 |
| 먼저 볼 것 | `Retry-After`, RateLimit 계열 헤더, 요청 빈도, IP/계정 단위 |
| 운영자에게 줄 정보 | 발생 시각, 요청 빈도, IP, 계정, API token, 관련 헤더 |

429는 rate limiting을 나타내는 상태 코드다. RFC 6585 기준으로 응답 본문은 제한 조건을 설명하는 내용을 포함하는 것이 좋고, `Retry-After` 헤더를 포함할 수 있다. 즉 429에서 `Retry-After`는 매우 유용하지만 항상 존재한다고 가정하면 안 된다.

```bash
curl -vI https://example.com/api
```

```bash
for i in {1..20}; do
  curl -s -o /dev/null -w "$i %{http_code}\n" https://example.com/api
done
```

| 판단 | 해석 |
|---|---|
| `Retry-After`가 있음 | 해당 시간 이후 재시도 권장 |
| 특정 IP에서만 429 | IP 기반 제한 가능 |
| 로그인 계정별로 다름 | 계정 또는 token 기반 제한 가능 |
| 갑자기 요청이 폭증 | 프론트엔드 재시도 루프, polling, 자동 새로고침 가능 |

---

## 15. 500 Internal Server Error

| 항목 | 내용 |
|---|---|
| 의미 | 서버 내부에서 예상치 못한 오류가 발생함 |
| 주된 병목 | Application Server, Business Logic, DB, Cache, External API, File System |
| 흔한 원인 | 코드 예외, DB query 실패, 외부 API 실패, 환경변수 누락, 파일 권한 문제, 배포 오류 |
| 먼저 볼 것 | 특정 API 여부, Payload, Response Body, 발생 시각, 재현 가능성 |
| 운영자에게 줄 정보 | URL, Method, Payload, Response Body, 계정/데이터별 재현 여부 |

500은 서버 내부 오류의 일반적인 표현이다. 클라이언트가 원인을 확정하기는 어렵지만, “어떤 요청에서만 나는지”와 “얼마나 걸린 뒤 나는지”는 반드시 남겨야 한다. 특정 API만 500이면 해당 기능의 application logic 문제일 가능성이 있고, 모든 API가 500이면 공통 설정, DB 연결, 인증 서버, 배포 문제 가능성이 커진다.

```bash
curl -v https://example.com/api/problem
```

```bash
curl -sS -o /dev/null \
-w "code=%{http_code}\nfirst_byte=%{time_starttransfer}\ntotal=%{time_total}\n" \
https://example.com/api/problem
```

```bash
curl -vI https://example.com/
curl -vI https://example.com/health
curl -vI https://example.com/api/other
```

| 판단 | 해석 |
|---|---|
| 특정 API만 500 | 해당 기능의 application logic 문제 가능 |
| 모든 API가 500 | 공통 설정, DB, 인증 서버, 배포 문제 가능 |
| 오래 걸린 뒤 500 | DB, 외부 API, 서버 처리 지연 후 예외 가능 |
| 즉시 500 | 코드 예외, 설정 누락, routing 후 즉시 실패 가능 |

---

## 16. 501 Not Implemented

| 항목 | 내용 |
|---|---|
| 의미 | 서버가 해당 기능 또는 HTTP Method를 구현하지 않음 |
| 주된 병목 | Client Method, Server Capability, Gateway Method Support, Application Route |
| 흔한 원인 | API 미구현, 해당 Method 미지원, Gateway method 처리 불가, 문서와 배포 버전 불일치 |
| 먼저 볼 것 | 요청 Method, API 문서, 배포 버전, Allow 헤더 여부 |
| 운영자에게 줄 정보 | Method, URL, API 문서, 배포 버전, 응답 코드 |

501은 405와 구분해야 한다. 405는 대상 리소스는 있지만 method가 허용되지 않는 상황이고, 501은 서버가 해당 기능이나 method 자체를 구현하지 않았다는 쪽에 가깝다.

```bash
curl -v -X GET https://example.com/api/resource
curl -v -X POST https://example.com/api/resource
curl -v -X PATCH https://example.com/api/resource
```

| 판단 | 해석 |
|---|---|
| 특정 method만 501 | method 미구현 가능 |
| 문서상 지원인데 501 | 배포 버전 차이, Gateway 라우팅 문제 가능 |

---

## 17. 502 Bad Gateway

| 항목 | 내용 |
|---|---|
| 의미 | Gateway/Proxy가 upstream/backend로부터 유효한 응답을 받지 못함 |
| 주된 병목 | Gateway ↔ Backend Server |
| 흔한 원인 | Backend down, 포트 미응답, backend pool unhealthy, health probe 실패, upstream 설정 오류, backend TLS 문제, Host Header 문제, 방화벽 차단 |
| 먼저 볼 것 | Server 헤더, 응답 시간, 루트/API 동시 실패 여부, health endpoint |
| 운영자에게 줄 정보 | DNS 결과, Server 헤더, 응답 시간, 실패 경로, 외부 지역 재현 여부, TLS 결과 |

502는 Gateway, Load Balancer, Reverse Proxy가 뒤쪽 Backend Server에서 정상 응답을 받지 못했다는 뜻이다. RFC 9110 기준으로 502는 gateway 또는 proxy 역할을 하는 서버가 upstream 서버로부터 invalid response를 받은 상황이다.

```bash
curl -vI https://example.com
curl -vk https://example.com
```

```bash
curl -sS -o /dev/null \
-w "code=%{http_code}\nremote_ip=%{remote_ip}\nconnect=%{time_connect}\ntls=%{time_appconnect}\nfirst_byte=%{time_starttransfer}\ntotal=%{time_total}\n" \
https://example.com
```

```bash
curl -i https://example.com/api/health
curl -i https://example.com/api/v4/system/ping
```

DNS를 특정 IP로 고정해 확인할 수도 있다.

```bash
curl -vk --resolve example.com:443:1.2.3.4 https://example.com
```

Azure Application Gateway 환경에서는 backend health가 중요하다. Microsoft 공식 문서 기준으로 Application Gateway는 backend server 상태를 health probe로 확인하고, backend가 unhealthy이면 요청을 backend로 전달하지 못해 502가 발생할 수 있다. 기본 probe 또는 custom probe의 host, path, protocol, port, timeout, healthy status code 조건이 실제 backend 동작과 맞는지 확인해야 한다.

| 판단 | 해석 |
|---|---|
| Server 헤더가 Gateway | Gateway가 응답을 생성했을 가능성 |
| 루트와 API 모두 502 | Backend 공통 문제 가능 |
| 매우 짧은 502 | Gateway가 backend를 unhealthy로 보고 즉시 실패 가능 |
| 긴 시간 뒤 502 | Backend 연결 지연 또는 비정상 응답 가능 |
| 외부 다중 지역 모두 502 | 클라이언트 문제 가능성 낮음 |

---

## 18. 503 Service Unavailable

| 항목 | 내용 |
|---|---|
| 의미 | 서비스가 현재 요청을 처리할 수 없음 |
| 주된 병목 | Gateway, Service Availability, Application Instance, Auto Scaling, Maintenance Mode |
| 흔한 원인 | 점검, 배포 중, 인스턴스 모두 down, 과부하, autoscaling 지연, thread/connection pool 고갈, circuit breaker open |
| 먼저 볼 것 | `Retry-After`, 전체/특정 API 여부, 간헐/지속 여부, 부하 시간대 |
| 운영자에게 줄 정보 | 발생 시각, Retry-After, 전체 서비스 여부, 응답 시간, 외부 지역 재현 여부 |

503은 서비스가 현재 요청을 처리할 수 없다는 의미다. 일시적인 점검, 배포, 과부하, 인스턴스 부족, pool 고갈에서 자주 발생한다. RFC 9110 기준으로 503과 함께 `Retry-After`가 오면, 클라이언트가 얼마 후 재시도해야 하는지에 대한 힌트로 볼 수 있다.

```bash
curl -vI https://example.com
```

```text
Retry-After: 120
```

```bash
while true; do
  date
  curl -s -o /dev/null -w "code=%{http_code} total=%{time_total}\n" https://example.com
  sleep 10
done
```

```bash
curl -vI https://example.com/
curl -vI https://example.com/health
curl -vI https://example.com/api
```

| 판단 | 해석 |
|---|---|
| Retry-After 존재 | 서버가 재시도 가능 시간을 알려주는 상황 |
| 모든 경로가 503 | 서비스 전체 사용 불가 가능 |
| 특정 API만 503 | downstream 서비스 또는 특정 기능만 불가 가능 |
| 트래픽 시간대에만 발생 | 과부하 또는 리소스 부족 가능 |
| 배포 직후 발생 | 배포, readiness, health check 문제 가능 |

---

## 19. 504 Gateway Timeout

| 항목 | 내용 |
|---|---|
| 의미 | Gateway/Proxy가 upstream/backend 응답을 기다리다가 timeout됨 |
| 주된 병목 | Gateway → Backend → Application Processing → DB/External API |
| 흔한 원인 | DB query 지연, 외부 API 지연, thread/connection pool 고갈, 대용량 처리, lock 대기, Gateway timeout보다 긴 처리 |
| 먼저 볼 것 | total time, 특정 API 여부, 가벼운 API와 무거운 API 비교, 반복 측정 |
| 운영자에게 줄 정보 | 504까지 걸린 시간, 요청 payload, 정상 API와 느린 API 비교, 발생 시간대 |

504는 502와 비슷하지만 다르다. RFC 9110 기준으로 504는 gateway 또는 proxy가 요청을 완료하기 위해 필요한 upstream 서버로부터 timely response를 받지 못한 상황이다. 즉 “응답이 이상했다”보다 “제때 응답이 오지 않았다”에 가깝다.

```bash
curl -sS -o /dev/null \
-w "code=%{http_code}\nconnect=%{time_connect}\ntls=%{time_appconnect}\nfirst_byte=%{time_starttransfer}\ntotal=%{time_total}\n" \
https://example.com/api/slow
```

가벼운 API와 무거운 API를 비교한다.

```bash
curl -s -o /dev/null -w "home %{http_code} %{time_total}\n" https://example.com/
curl -s -o /dev/null -w "health %{http_code} %{time_total}\n" https://example.com/health
curl -s -o /dev/null -w "api %{http_code} %{time_total}\n" https://example.com/api/heavy
```

반복 측정한다.

```bash
for i in {1..10}; do
  curl -s -o /dev/null -w "$i code=%{http_code} total=%{time_total}\n" https://example.com/api/heavy
done
```

| 판단 | 해석 |
|---|---|
| 항상 일정 시간 후 504 | Gateway timeout 설정에 걸릴 가능성 |
| 가벼운 API는 200, 무거운 API는 504 | Application, DB, 외부 API 병목 가능 |
| 간헐적 504 | 서버 부하, connection pool, DB lock, 외부 API 지연 가능 |
| 외부 지역 모두 같은 시간 후 504 | Backend 처리 지연 가능성 높음 |

### 502 / 503 / 504 비교

| 코드 | 핵심 의미 | 주된 병목 | 응답 시간 특징 | 대표 원인 |
|---|---|---|---|---|
| 502 | Gateway가 backend에서 유효한 응답을 받지 못함 | Gateway ↔ Backend | 짧을 수도, 길 수도 있음 | backend down, upstream 오류, health probe 실패 |
| 503 | 서비스가 현재 처리 불가 | 서비스 가용성 | 상황에 따라 다름 | 점검, 과부하, 인스턴스 부족, pool 고갈 |
| 504 | Gateway가 backend 응답을 기다리다 timeout | Backend 처리 지연 | 보통 일정 시간 후 발생 | DB 지연, 외부 API 지연, thread/connection pool 고갈, lock 대기 |

---

## 20. 301, 302, 304는 기본적으로 에러가 아니다

301, 302, 304는 장애처럼 보일 수 있지만 기본적으로 에러가 아니다. 다만 리다이렉트 루프, 로그인 페이지 반복, 캐시 오염이 있으면 사용자는 장애처럼 느낄 수 있다.

| 코드 | 의미 | 병목 여부 | 확인 포인트 |
|---|---|---|---|
| 301 | 영구 리다이렉트 | 보통 정상 | `Location`, http→https, canonical URL |
| 302 | 임시 리다이렉트 | 보통 정상 | 로그인 페이지 반복, SSO 이동 |
| 304 | 변경 없음, 캐시 사용 | 보통 정상 | 브라우저 캐시, CDN 캐시, ETag/If-None-Match |

```bash
curl -vI http://example.com
```

`Location` 헤더를 확인한다.

```text
Location: https://example.com/
```

리다이렉트를 따라가려면 다음을 사용한다.

```bash
curl -vIL http://example.com
```

| 판단 | 해석 |
|---|---|
| http → https 301 | 정상적인 리다이렉트일 가능성 |
| 무한 리다이렉트 | http/https 설정, proxy header, load balancer 설정 문제 가능 |
| 로그인 페이지로 계속 리다이렉트 | 세션, 쿠키, 인증 문제 가능 |

---

## 21. CORS 오류는 HTTP 코드와 다르게 봐야 한다

브라우저 콘솔에서 CORS 오류가 보이는 경우가 있다. CORS는 HTTP 상태 코드라기보다 브라우저 보안 정책에 의해 응답 접근이 차단되는 상황이다. 서버가 실제로는 200을 반환했더라도, 브라우저가 `Access-Control-Allow-Origin` 같은 CORS 응답 헤더를 확인한 뒤 JavaScript에 응답을 넘기지 않을 수 있다.

| 항목 | 내용 |
|---|---|
| 의미 | 브라우저가 cross-origin 응답 접근을 차단함 |
| 주된 병목 | Browser, Preflight OPTIONS, CORS Response Headers, API Server |
| 흔한 원인 | `Access-Control-Allow-Origin` 누락, credentials 설정 불일치, OPTIONS 401/403/405, 허용 header/method 누락 |
| 먼저 볼 것 | Console 오류, OPTIONS 응답, Origin, Access-Control 계열 헤더 |
| 운영자에게 줄 정보 | Origin, Method, Request Headers, OPTIONS 응답 코드, CORS 응답 헤더 |

브라우저 Console과 Network를 본다.

```text
Access-Control-Allow-Origin
Access-Control-Allow-Methods
Access-Control-Allow-Headers
Access-Control-Allow-Credentials
```

OPTIONS 요청을 직접 확인한다.

```bash
curl -v -X OPTIONS https://api.example.com/resource \
-H "Origin: https://www.example.com" \
-H "Access-Control-Request-Method: POST"
```

| 판단 | 해석 |
|---|---|
| curl은 성공, 브라우저만 실패 | CORS 가능성 |
| OPTIONS가 401/403/405 | preflight 처리 문제 가능 |
| `Access-Control-Allow-Origin` 누락 | 서버 CORS 설정 문제 |
| credentials 요청인데 wildcard 사용 | 쿠키/인증 포함 요청에서 CORS 정책 불일치 가능 |

---

## 22. 에러 코드별 병목 구간 요약표

| 코드 | 이름 | 주된 병목 구간 | 클라이언트가 확인할 핵심 |
|---|---|---|---|
| 400 | Bad Request | 요청 형식 | Payload, Query, Header, Content-Type |
| 401 | Unauthorized | 인증 | Token, Cookie, Session, WWW-Authenticate |
| 403 | Forbidden | 권한 | Role, Permission, CSRF, IP 정책 |
| 404 | Not Found | 라우팅/리소스 | URL, Method, Resource ID, Proxy rewrite |
| 405 | Method Not Allowed | Method | GET/POST/PUT/PATCH/DELETE, Allow 헤더 |
| 408 | Request Timeout | 요청 수신 지연 | 업로드 크기, 네트워크, request timeout |
| 409 | Conflict | 상태 충돌 | 중복 요청, 버전 충돌, 비즈니스 규칙 |
| 413 | Content Too Large | 요청 크기 | 파일 크기, body size limit, 응답 주체 |
| 415 | Unsupported Media Type | 미디어 타입 | Content-Type, multipart/json, boundary |
| 422 | Unprocessable Content | validation | 필드 값, DTO validation, 비즈니스 규칙 |
| 429 | Too Many Requests | rate limit | Retry-After, 요청 빈도, IP/계정 제한 |
| 500 | Internal Server Error | 서버 내부 | 특정 API, payload, response body, 발생 시각 |
| 501 | Not Implemented | 미구현 | Method, API 문서, 배포 버전 |
| 502 | Bad Gateway | Gateway-Backend | Server 헤더, backend 공통 경로, 응답 시간 |
| 503 | Service Unavailable | 서비스 불가 | Retry-After, 과부하, 점검, 인스턴스 상태 |
| 504 | Gateway Timeout | Backend timeout | total time, 특정 API, DB/외부 API 지연 |

---

## 23. 실무적으로 가장 중요한 구분

장애 분석에서 가장 중요한 구분은 4xx와 5xx다. 4xx는 요청한 쪽의 입력, 인증, 권한, 경로 문제일 가능성이 높다. 5xx는 서버, Gateway, Backend, DB, 외부 API 문제일 가능성이 높다.

다만 예외가 있다. 403은 WAF나 IP 정책 때문에 서버 측 설정 문제일 수도 있다. 404는 proxy rewrite 문제일 수도 있다. 400은 Gateway나 WAF가 요청을 거부한 것일 수도 있다. 502는 Microsoft, AWS, NGINX 같은 이름이 보여도 해당 플랫폼 전체 장애라고 단정하면 안 된다.

| 구분 | 단정하면 안 되는 이유 | 실제 확인할 것 |
|---|---|---|
| 4xx | 클라이언트 입력 문제처럼 보여도 WAF/Gateway가 만들 수 있음 | 응답 주체, Response Body, 정책 헤더 |
| 5xx | 서버 문제처럼 보여도 특정 요청 payload나 계정에서만 날 수 있음 | 특정 API/계정/데이터 재현 여부 |
| 502 | Gateway 이름이 보여도 플랫폼 장애라는 뜻은 아님 | backend health, upstream, probe, 방화벽 |
| 504 | 네트워크 timeout처럼 보여도 DB/외부 API 지연일 수 있음 | 처리 시간, 가벼운 API와 무거운 API 비교 |

결국 핵심은 상태 코드 하나가 아니라 다음 조합이다.

```text
상태 코드
+ 응답 주체
+ 응답 시간
+ 실패 경로
+ 요청 payload
+ 인증 상태
+ 다른 네트워크 재현 여부
+ 외부 다중 지역 재현 여부
```

---

## 24. 장애 보고용 공통 템플릿

장애를 운영자 또는 개발자에게 전달할 때는 “그냥 안 된다”가 아니라 “어디까지 확인했고, 어디부터 의심된다”는 형태로 전달해야 한다. 아래 템플릿은 복사해서 그대로 사용할 수 있다.

| 항목 | 작성 내용 | 예시 |
|---|---|---|
| 문제 상황 | 어떤 기능에서 어떤 문제가 발생했는지 | Mattermost 채팅 전송 실패 |
| 발생 시각 | 시간대 포함 | 2026-06-12 18:40 KST |
| 요청 정보 | URL, Method, Payload, Header | `POST /api/v4/posts` |
| 응답 정보 | Status, Server, Body, Header | `502`, `Microsoft-Azure-Application-Gateway/v2` |
| 클라이언트 확인 | DNS/TCP/TLS/curl/브라우저/다른 네트워크 | DNS 정상, TCP 443 정상, TLS OK |
| 판단 | 클라이언트/서버/Gateway 가능성 | Gateway까지 도달, backend health 의심 |
| 추가 확인 요청 | 운영자가 봐야 할 것 | backend pool, health probe, app log, DB 상태 |

```text
[문제 상황]
어떤 기능에서 어떤 문제가 발생했는지 작성한다.

[발생 시각]
YYYY-MM-DD HH:mm 기준으로 작성한다.

[요청 정보]
URL:
HTTP Method:
Request Payload:
Request Headers 중 특이사항:

[응답 정보]
Status Code:
Server Header:
Response Body:
Response Headers:

[클라이언트 확인 결과]
DNS:
TCP 443:
TLS:
브라우저:
curl:
다른 네트워크:
외부 다중 지역 체크:

[판단]
클라이언트 문제 가능성:
서버/Gateway 문제 가능성:
추가 확인 필요 항목:
```

---

## 25. 결론

HTTP 에러 코드는 단순히 “무슨 문제가 났다”가 아니라, 병목 구간을 좁히기 위한 첫 단서다. 좋은 장애 분석은 상태 코드를 보고, 응답 주체를 보고, DNS/TCP/TLS/HTTP를 나누어 확인한 뒤, 특정 경로 문제인지 전체 문제인지 판단하는 순서로 진행된다.

| 사고 순서 | 질문 |
|---|---|
| 1 | 상태 코드는 무엇인가? |
| 2 | 누가 응답했는가? Application, Gateway, CDN, WAF 중 어디인가? |
| 3 | DNS/TCP/TLS는 정상인가? |
| 4 | 특정 경로만 실패하는가, 전체가 실패하는가? |
| 5 | 응답이 즉시 오는가, 오래 걸린 뒤 오는가? |
| 6 | 인증/권한/요청 형식 문제인가? |
| 7 | 다른 네트워크와 외부 지역에서도 재현되는가? |
| 8 | 클라이언트가 알 수 없는 영역은 무엇인가? |

결국 클라이언트가 할 수 있는 최선은 원인을 단정하는 것이 아니다. 내 환경 문제인지, 요청 문제인지, 인증/권한 문제인지, Gateway까지 도달했는지, Backend에서 막히는지, 서버 측 확인이 필요한지를 명확히 나누는 것이다.

이 경계를 명확히 만들면 운영자는 로그, Health Check, Backend 상태, DB 상태를 바로 확인할 수 있다. 사용자는 “그냥 안 된다”가 아니라 “DNS/TCP/TLS는 정상이고, Gateway가 즉시 502를 반환하며, 여러 네트워크에서 재현된다”처럼 장애를 전달할 수 있다. 이 차이가 문제 해결 시간을 크게 줄인다.


## 참고 근거

아래 문서는 기존 내용을 유지하되, 필요한 부분만 공식 또는 준공식 문서 기준으로 보강했다.

- IETF RFC 9110, HTTP Semantics: HTTP 상태 코드, `WWW-Authenticate`, `Allow`, `Retry-After`, 502/503/504 의미
  - https://www.rfc-editor.org/rfc/rfc9110.html
- IANA HTTP Status Code Registry: 표준 상태 코드 명칭과 참조 RFC
  - https://www.iana.org/assignments/http-status-codes
- RFC 6585, Additional HTTP Status Codes: 429 Too Many Requests
  - https://www.rfc-editor.org/rfc/rfc6585.html
- MDN Web Docs, HTTP response status codes: 상태 코드 분류와 개발자 설명
  - https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
- curl 공식 man page: `--write-out`, `time_namelookup`, `time_connect`, `time_appconnect`, `time_starttransfer`, `time_total`
  - https://curl.se/docs/manpage.html
- OpenSSL 공식 문서, `openssl-s_client`: TLS 연결 및 SNI 확인
  - https://docs.openssl.org/3.6/man1/openssl-s_client/
- Microsoft Learn, Azure Application Gateway 502 / Backend Health troubleshooting
  - https://learn.microsoft.com/en-us/troubleshoot/azure/application-gateway/application-gateway-troubleshooting-502
  - https://learn.microsoft.com/en-us/troubleshoot/azure/application-gateway/application-gateway-backend-health-troubleshooting
- WHATWG Fetch Standard / W3C CORS 문서: CORS preflight, Access-Control 계열 헤더
  - https://fetch.spec.whatwg.org/
  - https://www.w3.org/TR/2020/SPSD-cors-20200602/
- NGINX 공식 문서, `client_max_body_size`: 요청 body 크기 제한과 413
  - https://nginx.org/en/docs/http/ngx_http_core_module.html