---
title: HTTP_에러코드별_병목구간_운영자관점_트러블슈팅_가이드_요약표포함
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-20T05:00:07+09:00
---

# HTTP 에러 코드별 병목 구간을 좁히는 운영자 관점 트러블슈팅 가이드

> 이 문서는 클라이언트 측 트러블슈팅 수정본과 1대1로 나란히 읽을 수 있도록 섹션 번호와 진단 흐름을 맞춘 운영자용 문서다. 클라이언트 문서가 “사용자가 어디까지 확인할 수 있는가”를 다룬다면, 이 문서는 “운영자가 그 단서를 받아 어느 로그·설정·메트릭·최근 변경 이력부터 확인해야 하는가”를 다룬다.

---

## 1. 문서 목적

웹 서비스 장애가 발생하면 클라이언트가 처음 전달하는 정보는 보통 “어떤 기능이 안 된다”, “브라우저에서 특정 HTTP 코드가 보인다”, “curl 결과가 이렇다”, “다른 네트워크에서도 재현된다” 정도다. 운영자는 이 정보를 받아서 한 단계 더 들어가야 한다. HTTP 상태 코드는 최종 결론이 아니라, 어느 계층부터 봐야 하는지 알려주는 첫 번째 라우팅 정보다.

운영자 관점에서 중요한 것은 상태 코드 자체보다 그 상태 코드를 만든 주체다. 같은 502라도 Azure Application Gateway가 만든 502인지, NGINX가 만든 502인지, 내부 API Gateway가 만든 502인지에 따라 확인할 로그와 조치가 달라진다. 마찬가지로 같은 403이라도 애플리케이션 권한 정책 때문인지, WAF 차단인지, IP allowlist 때문인지 분리해야 한다.

| 목적 | 운영자가 해야 할 일 | 산출물 |
|---|---|---|
| 상태 코드 해석 | 4xx/5xx 성격을 보고 1차 병목 후보를 세운다. | 의심 계층 목록 |
| 응답 주체 확인 | `Server`, `Via`, `X-Cache`, Request ID를 본다. | 응답 생성 계층 |
| 요청 도달 범위 확인 | Gateway/App/DB 중 어디까지 로그가 남는지 본다. | 요청이 도달한 마지막 계층 |
| 최근 변경 연결 | 배포, 설정, 인증서, DNS, WAF rule 변경과 시간대를 맞춘다. | 빠른 rollback/복구 후보 |
| 임시 완화와 근본 수정 분리 | scale out, restart, rollback과 code/config fix를 구분한다. | 복구 조치와 재발 방지 조치 |

운영자가 에러 코드를 볼 때 바로 원인을 단정하면 위험하다. 예를 들어 `Server: Microsoft-Azure-Application-Gateway/v2`와 함께 502가 보인다고 해서 곧바로 Azure 전체 장애라고 보면 안 된다. 정확히는 “응답을 만든 주체는 Azure Application Gateway이지만, 원인은 Gateway 설정, Backend Pool, Health Probe, Backend Port, NSG, Host Header, Backend TLS, Backend App 상태 중 하나일 수 있다”라고 봐야 한다.

이 문서의 목표는 상태 코드, 응답 주체, 로그 위치, 응답 시간, 영향 범위, 최근 변경 이력을 연결해서 병목을 좁히는 것이다.

---

## 2. 먼저 전체 구조를 잡는다

운영자는 클라이언트 요청이 지나가는 전체 경로를 먼저 그려야 한다. 클라이언트 문서에서는 Browser에서 Gateway까지 도달했는지 확인하는 데 초점이 있었다면, 운영자 문서에서는 Gateway 이후 Backend, Application, DB, Cache, Queue, External API까지 확인 범위가 확장된다.

```text
Browser / Client
→ DNS
→ TCP
→ TLS
→ CDN / WAF
→ Load Balancer / Application Gateway / Ingress
→ Reverse Proxy
→ Web Server
→ Application Server
→ Database / Cache / Queue / External API
```

운영자는 이 흐름을 “요청이 어디까지 도달했는가”라는 질문으로 쪼갠다. DNS가 잘못되면 요청은 서비스 앞단에 오지 않는다. Gateway 로그에는 있는데 App 로그에는 없다면 Gateway와 Backend 사이 문제다. App 로그에는 있는데 DB slow query가 같은 시간에 찍히면 애플리케이션 이후 DB 병목을 본다. App error log에 stack trace가 있으면 코드, 데이터, 설정, 의존성 문제를 본다.

| 구간 | 운영자가 확인할 것 | 로그/지표 위치 | 대표 병목 | 대표 조치 |
|---|---|---|---|---|
| DNS | A/CNAME/AAAA, 내부·외부 DNS 차이 | DNS provider, CDN DNS | 잘못된 레코드, 오래된 TTL | 레코드 수정, TTL 조정 |
| TCP / Listener | 80/443, backend port, 방화벽 | LB listener, SG/NSG, VM/K8s | 포트 미오픈, route/방화벽 차단 | listener/SG/NSG/route 수정 |
| TLS | Client→Gateway, Gateway→Backend | Gateway SSL log, backend cert | 인증서 만료, SNI, trust chain | 인증서/Trusted Root/SNI 수정 |
| CDN / WAF | 차단 rule, rate limit, cache | WAF log, CDN log | 403/429, cache 오류 | rule 조정, cache purge |
| Gateway / LB | Backend health, probe, pool | Gateway access/perf/health | unhealthy, port/protocol mismatch | probe/pool/port/protocol 수정 |
| Reverse Proxy | upstream, rewrite, timeout | NGINX/Envoy access/error log | upstream 실패, path rewrite 오류 | upstream/rewrite/timeout 수정 |
| Application | access/error log, trace ID | App log, APM, trace | exception, validation, authz | 코드/설정/배포 수정 |
| DB / Cache / Queue | slow query, pool, lock, backlog | DB metric, Redis, MQ | connection pool, lock, 지연 | 튜닝, pool 조정, 비동기화 |
| External API | latency, timeout, error rate | APM dependency trace | 외부 API 장애/지연 | timeout, fallback, circuit breaker |

가장 중요한 기준은 로그의 위치다. 아래 표는 운영자가 장애 초기에 가장 먼저 써야 하는 판단표다.

| 로그가 남은 위치 | 의미 | 우선 의심 구간 | 다음 확인 |
|---|---|---|---|
| 어떤 로그에도 없음 | 요청이 서비스 앞단까지 오지 않았을 수 있다. | DNS, CDN 앞단, 네트워크, Listener | DNS, LB listener, 방화벽, 외부 재현 여부 |
| Edge/CDN 로그만 있음 | CDN/WAF에서 처리되었고 Origin까지 가지 않았을 수 있다. | CDN/WAF rule, cache, origin route | WAF deny log, cache status, origin 설정 |
| Gateway 로그는 있음, App 로그는 없음 | Gateway 이후 Backend로 전달되지 않았다. | Backend pool, health probe, port, NSG, TLS | Backend Health, probe detail, backend connect test |
| Reverse Proxy 로그는 있음, App 로그는 없음 | Proxy에서 upstream 전달 실패 가능성이 높다. | NGINX/Envoy upstream, rewrite, timeout | proxy error log, upstream 설정 |
| App access log는 있음, error log 있음 | App 내부에서 요청 처리 중 실패했다. | application code, config, dependency | stack trace, trace ID, 최근 배포 |
| App log는 있고 DB가 느림 | App 이후 DB가 병목일 수 있다. | DB query, lock, connection pool | slow query, lock wait, pool metric |
| App log는 있고 외부 API trace가 느림 | downstream dependency 병목일 수 있다. | 외부 API, network, retry storm | dependency latency, retry count, circuit breaker |

---

## 3. 공통 점검 순서

상태 코드별 분석에 들어가기 전, 운영자는 공통 순서로 증거를 정리해야 한다. 이 순서는 클라이언트 수정본의 DNS/TCP/TLS/HTTP/응답시간/브라우저/다른 환경 비교와 나란히 대응된다. 차이는 운영자는 외부 확인 결과를 받아 내부 로그와 설정까지 이어서 본다는 점이다.

| 순서 | 클라이언트 문서의 확인 대상 | 운영자 문서의 대응 확인 | 대표 도구 | 판단 방향 |
|---|---|---|---|---|
| 1 | DNS | authoritative DNS, 내부 DNS, CDN origin | `dig`, DNS 콘솔 | 도메인이 의도한 앞단을 가리키는가 |
| 2 | TCP | LB listener, backend port, SG/NSG/firewall | `nc`, `ss`, cloud console | 외부와 내부 포트가 모두 열려 있는가 |
| 3 | TLS | Client→Gateway와 Gateway→Backend 분리 | `openssl s_client`, Gateway SSL 설정 | 어느 TLS 구간이 실패하는가 |
| 4 | HTTP Header | 응답 주체와 request/correlation ID 확인 | `curl -vI`, access log | 누가 응답을 만들었는가 |
| 5 | 응답 시간 | DNS/connect/TLS/first byte/total을 내부 metric과 대조 | `curl -w`, APM | 느린 구간이 어디인가 |
| 6 | 브라우저 | 쿠키/CORS/payload를 서버 로그와 대조 | DevTools, App log | 브라우저 한정 문제인가 |
| 7 | 다른 환경 | 영향 범위를 사용자/IP/지역/계정별로 분리 | CDN log, WAF log, APM | 전체 장애인가 부분 장애인가 |

### 3.1 클라이언트가 제공한 정보를 먼저 구조화한다

운영자는 제보를 받으면 먼저 정보를 같은 형식으로 정리해야 한다. 정보가 흩어져 있으면 원인보다 추측이 앞서게 된다. 최소한 정확한 URL, 발생 시각, HTTP Method, 상태 코드, 응답 헤더, 재현 범위는 필요하다.

| 항목 | 의미 | 없을 때 생기는 문제 |
|---|---|---|
| 발생 기능 | 사용자가 체감한 기능 단위 | 영향 범위를 가늠하기 어렵다. |
| 발생 URL | 실제 요청 경로 | 라우팅/프록시/API 문제를 좁히기 어렵다. |
| 발생 시각 | 로그 검색 기준 | 로그와 메트릭을 맞출 수 없다. |
| HTTP Method | GET/POST/PUT/DELETE/OPTIONS | 405, CORS, CSRF 판단이 어렵다. |
| Status Code | 400/401/403/500/502 등 | 1차 병목 후보를 세우기 어렵다. |
| Server Header | 응답 생성 주체 추정 | 어느 로그부터 볼지 정하기 어렵다. |
| Response Body | validation, auth, upstream 메시지 | 원인 메시지를 놓칠 수 있다. |
| 응답 시간 | 즉시 실패인지 timeout인지 | 502/504, app/DB 지연 판단이 어렵다. |
| 특정 계정 여부 | 계정/권한/세션 문제 분리 | 전체 장애와 일부 사용자 문제를 혼동한다. |
| 특정 네트워크 여부 | IP/WAF/Geo 정책 분리 | 네트워크·보안 정책 문제를 놓친다. |
| 외부 지역 재현 여부 | 로컬 문제와 서비스 문제 분리 | 클라이언트 환경 문제로 오판할 수 있다. |
| 최근 변경 여부 | 배포/설정/인증서/DNS 변경 연결 | 빠른 rollback 후보를 놓친다. |

운영자에게 가장 좋은 단서는 `curl -v` 결과, 브라우저 Network 탭 캡처, Request ID 또는 Trace ID, 응답 시간, 외부 다중 지역 체크 결과다. 이 다섯 가지가 있으면 로그 검색 범위가 크게 줄어든다.

```text
발생 기능:
발생 URL:
발생 시각:
HTTP Method:
Status Code:
Server Header:
Response Body:
응답 시간:
특정 계정 여부:
특정 네트워크 여부:
외부 지역 재현 여부:
최근 배포/설정 변경 여부:
```

### 3.2 DNS 확인

클라이언트가 DNS 정상이라고 했더라도 운영자는 authoritative DNS, 내부 DNS, CDN DNS, split-horizon DNS를 다시 본다. 외부 사용자는 정상 IP를 보지만 내부 Gateway나 Private DNS가 다른 대상을 가리키는 경우도 있다.

```bash
dig +short example.com
dig example.com CNAME
dig example.com A
dig example.com AAAA
nslookup example.com
```

| 확인 항목 | 운영자 판단 | 조치 |
|---|---|---|
| A/CNAME이 의도한 LB/CDN을 가리키는가 | 잘못된 대상이면 전체 또는 일부 지역 장애 가능 | A/CNAME 수정 |
| AAAA가 열려 있는가 | IPv6 경로만 실패할 수 있음 | 잘못된 AAAA 제거 또는 IPv6 경로 수정 |
| 내부 DNS와 외부 DNS가 다른가 | split-horizon 설정 문제 가능 | 내부 DNS zone 수정 |
| 최근 DNS 변경이 있었는가 | TTL 때문에 일부 사용자가 과거 IP를 볼 수 있음 | TTL 확인, 전파 상태 점검 |
| CDN origin이 올바른가 | CDN은 정상이나 origin route가 틀릴 수 있음 | CDN origin 설정 수정 |

### 3.3 TCP Listener와 방화벽 확인

외부에서 443이 열린 것과 Gateway가 Backend의 8080 또는 8443으로 붙을 수 있는 것은 다른 문제다. 운영자는 외부 Listener와 내부 Backend 연결을 분리해서 확인해야 한다.

```bash
nc -vz backend.internal 8080
curl -v http://backend.internal:8080/health
```

Kubernetes라면 Service, Endpoint, Pod가 서로 연결되어 있는지 본다.

```bash
kubectl get ingress -A
kubectl get svc -A
kubectl get endpoints -A
kubectl get pods -A -o wide
```

VM 기반이면 실제 프로세스가 포트를 열고 있는지 확인한다.

```bash
sudo ss -lntp
sudo lsof -iTCP -sTCP:LISTEN
sudo iptables -S
sudo ufw status
```

| 확인 항목 | 병목 신호 | 조치 |
|---|---|---|
| LB Listener | 80/443 listener 없음 | Listener 추가 또는 포트 수정 |
| Backend port | Gateway 설정 포트와 App listen port 불일치 | Backend port / targetPort 수정 |
| Security Group / NSG | Gateway subnet에서 backend port 차단 | 허용 규칙 추가 |
| Route Table | Backend subnet으로 경로 없음 | route table 수정 |
| Kubernetes Endpoint | endpoint 없음 | selector, readiness, pod 상태 확인 |
| VM Process | listen process 없음 | 서비스 재기동, systemd/docker 상태 확인 |

### 3.4 TLS 확인

클라이언트가 확인하는 TLS는 대개 `Client → Gateway` 구간이다. 운영자는 반드시 `Gateway → Backend` TLS도 분리해서 봐야 한다. 특히 Application Gateway, Ingress, Reverse Proxy가 Backend와 HTTPS로 통신하는 구조에서는 Backend 인증서, SNI, Host Header, trusted root가 모두 맞아야 한다.

```bash
openssl s_client -connect example.com:443 -servername example.com </dev/null
openssl s_client -connect backend.internal:443 -servername example.com </dev/null
```

| 구간 | 확인할 것 | 실패 시 조치 |
|---|---|---|
| Client → Gateway | 공개 인증서, SAN, 만료일, TLS 버전 | 인증서 교체, listener SSL 설정 수정 |
| Gateway → Backend | Backend 인증서, trusted root, SNI, protocol | trusted root 등록, backend cert 교체, protocol 수정 |
| SNI / Host Header | Backend가 기대하는 hostname | SNI 또는 Host Header override 수정 |
| HTTP/HTTPS protocol | Backend가 HTTP인데 Gateway가 HTTPS로 붙는지 | backend protocol 수정 |
| 인증서 체인 | 중간 인증서 누락 여부 | chain 보완 |

### 3.5 HTTP 응답 주체 확인

`Server`, `Via`, `X-Cache`, `X-Request-ID`, `X-Correlation-ID`는 운영자에게 “어느 로그부터 볼지”를 알려준다. 응답 주체를 모르면 App log부터 볼지, Gateway log부터 볼지, CDN/WAF log부터 볼지 결정할 수 없다.

```bash
curl -vI https://example.com
curl -vk https://example.com
```

| 헤더/단서 | 운영자 해석 | 먼저 볼 곳 |
|---|---|---|
| `Server: cloudflare` | Edge/CDN/WAF가 응답했을 가능성 | Cloudflare/CDN/WAF log |
| `Server: nginx` | NGINX 또는 reverse proxy 응답 가능성 | NGINX access/error log |
| `Server: Microsoft-Azure-Application-Gateway/v2` | Azure Application Gateway 응답 가능성 | App Gateway access log, backend health |
| `Server: envoy` | Envoy/Istio/Ingress Gateway 응답 가능성 | Envoy/Istio/Ingress log |
| `X-Cache: HIT` | Origin까지 가지 않은 캐시 응답 가능성 | CDN cache rule |
| `X-Cache: MISS` | Origin으로 전달되었거나 캐시 미스 | Origin/Gateway log |
| `X-Request-ID` / `X-Correlation-ID` | trace 검색 키 | APM, centralized log |
| `Retry-After` | 재시도 가능 시점 또는 제한 신호 | rate limit, 503, 413, 429 정책 |
| `WWW-Authenticate` | 인증 challenge 정보 | Auth filter, IdP, token 검증 |

### 3.6 응답 시간으로 병목 구간 판단

응답 시간은 상태 코드만큼 중요하다. 같은 502라도 0.1초 만에 오는 502와 60초 뒤 오는 502는 의미가 다르다. 전자는 Gateway가 Backend를 즉시 unhealthy로 판단했을 가능성이 있고, 후자는 연결 또는 응답 대기 후 실패했을 가능성이 크다.

```bash
curl -sS -o /dev/null \
-w "code=%{http_code}\ndns=%{time_namelookup}\nconnect=%{time_connect}\ntls=%{time_appconnect}\nfirst_byte=%{time_starttransfer}\ntotal=%{time_total}\n" \
https://example.com
```

| 길어진 값 | 운영자 관점의 병목 후보 | 확인할 로그/지표 |
|---|---|---|
| `time_namelookup` | DNS resolver, authoritative DNS, CDN DNS | DNS provider, resolver log |
| `time_connect` | 네트워크, 방화벽, LB listener, SYN backlog | LB metric, SG/NSG, node network |
| `time_appconnect` | TLS handshake, 인증서, cipher, TLS offload CPU | TLS log, Gateway CPU, cert 설정 |
| `time_starttransfer` | App 처리, DB, 외부 API, thread pool, connection pool | APM, App log, DB slow query |
| `time_total` | 응답 전송, timeout, 대용량 응답 | proxy timeout, response size, network |
| 매우 짧은 5xx | Gateway/Proxy가 즉시 실패 처리 | backend health, route, WAF/Gateway log |
| 일정 시간 후 504 | Gateway/proxy timeout에 걸림 | timeout 설정, slow query, dependency latency |

### 3.7 로그, 메트릭, 트레이스 확인 순서

운영자에게 가장 중요한 순서는 “앞단에서 뒤쪽으로”다. App log부터 보는 습관은 500에는 빠르지만, 502/503/504에서는 오히려 시간을 낭비할 수 있다.

| 순서 | 확인 위치 | 확인 목적 |
|---|---|---|
| 1 | Edge/CDN/Gateway access log | 요청이 앞단에 도달했는지, 누가 응답했는지 확인 |
| 2 | Gateway/Proxy error log | upstream 연결 실패, timeout, TLS 실패 확인 |
| 3 | Backend Health / Target Health | traffic을 받을 backend가 있는지 확인 |
| 4 | Application access log | App까지 요청이 도달했는지 확인 |
| 5 | Application error log | stack trace, auth failure, validation failure 확인 |
| 6 | Distributed Trace / APM | 어느 dependency에서 시간이 걸렸는지 확인 |
| 7 | DB slow query / lock / pool | DB 병목 확인 |
| 8 | Cache / Queue / External API | downstream 장애와 지연 확인 |
| 9 | Infra metric | CPU, memory, disk, network, restart 확인 |
| 10 | 최근 배포/설정 변경 | rollback 또는 config revert 후보 확인 |

예시 명령어는 다음과 같다.

```bash
# Kubernetes
kubectl logs -n namespace deploy/app --since=30m
kubectl describe pod -n namespace pod-name
kubectl get events -n namespace --sort-by=.lastTimestamp
kubectl get pods -n namespace
kubectl get deploy -n namespace
kubectl get hpa -n namespace
kubectl top pods -n namespace
kubectl top nodes

# Docker
docker ps
docker logs --since 30m container-name

# systemd
journalctl -u app.service --since "30 minutes ago"

# nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 4. 400 Bad Request

400은 요청 형식이 잘못되었거나 서버가 요청을 파싱할 수 없다고 판단한 상황이다. 운영자는 클라이언트 payload 문제만 보지 말고, Gateway/WAF가 요청을 거부했는지, Application parser까지 요청이 도달했는지를 먼저 나눠야 한다.

| 항목 | 운영자 관점 |
|---|---|
| 의미 | 요청 구문, header, query string, body, Content-Type 등이 서버 기대와 맞지 않음 |
| 먼저 볼 계층 | Gateway/WAF → Reverse Proxy → Application parser |
| 클라이언트 단서 | 특정 API만 400, payload 제공, parse/validation 메시지, 특정 화면에서만 실패 |
| 핵심 로그 | WAF deny log, NGINX error log, App request binding/parse error |
| 주요 병목 | malformed URL, JSON parse error, header too large, 잘못된 Content-Type, API contract 불일치 |
| 대표 조치 | payload 생성 수정, API validation 개선, WAF rule 조정, API 문서 동기화 |

```bash
curl -v -X POST https://example.com/api/users \
-H "Content-Type: application/json" \
-d '{"name":"kim"}'
```

운영자는 먼저 400을 만든 주체를 확인한다. Gateway/WAF 로그에는 있는데 Application 로그에는 없다면 요청이 App까지 가지 않았으므로 WAF rule, header size, URL encoding, request validation을 본다. Application 로그에 `JSON parse error`, `missing required field`, `invalid query parameter`가 있다면 DTO binding 또는 parser 단계 문제다.

| 증거 | 판단 | 조치 |
|---|---|---|
| App 로그 없음, WAF 로그 있음 | WAF/Gateway Request Validation 문제 | rule 예외/수정, header/body 제한 확인 |
| App 로그에 JSON parse error | body 문법 또는 Content-Type 문제 | 프론트 payload 수정, parser 설정 확인 |
| 특정 프론트 버전만 실패 | 프론트 요청 생성 문제 | 배포 diff 확인, rollback 또는 hotfix |
| API 문서와 실제 validation 불일치 | API contract 불일치 | API 문서/서버 validation 동기화 |
| header too large | 쿠키/헤더 크기 초과 | 쿠키 정리, proxy header limit 조정 |

---

## 5. 401 Unauthorized

401은 인증되지 않은 요청이다. 운영자 관점에서는 Authorization 헤더나 Cookie가 실제로 서버에 도달했는지, 토큰이 만료되었는지, JWT 검증 키와 issuer/audience가 맞는지, 세션 저장소가 정상인지 확인해야 한다. RFC 9110 기준으로 401 응답은 인증 challenge를 위해 `WWW-Authenticate` 헤더와 함께 사용될 수 있으므로 이 헤더도 확인 대상이다.

| 항목 | 운영자 관점 |
|---|---|
| 의미 | 사용자를 식별하지 못했거나 인증 자격 증명이 유효하지 않음 |
| 먼저 볼 계층 | Browser storage/Cookie → Proxy header forwarding → Auth filter → IdP/Session store |
| 클라이언트 단서 | 로그인 직후 401, 일정 시간 후 401, 특정 브라우저만 401, `WWW-Authenticate` 존재 |
| 핵심 로그 | Auth filter log, JWT validation log, Redis/session log, IdP log |
| 주요 병목 | Authorization 헤더 누락, 쿠키 미전송, token expired, key mismatch, clock skew, session store 장애 |
| 대표 조치 | refresh flow 수정, session store 복구, signing key 복구, cookie 설정 수정, NTP 동기화 |

```bash
curl -v https://example.com/api/me \
-H "Authorization: Bearer ACCESS_TOKEN"
```

JWT payload를 확인할 때는 민감 토큰을 외부 사이트에 넣지 않는다. 내부 개발 환경에서 payload만 디코딩하거나, 검증 가능한 내부 도구를 사용한다.

```bash
python3 - <<'PY'
import base64, json
payload="PAYLOAD_PART" + "=="
print(json.loads(base64.urlsafe_b64decode(payload)))
PY
```

| 증거 | 판단 | 조치 |
|---|---|---|
| Authorization 헤더가 App까지 오지 않음 | Proxy/Gateway header forwarding 문제 | `Authorization` 전달 설정 확인 |
| Cookie가 요청에 없음 | SameSite/Secure/Domain 또는 CORS credentials 문제 | Cookie 속성, `withCredentials` 확인 |
| 토큰 만료 | refresh flow 또는 session timeout 문제 | refresh rotation/재발급 로직 확인 |
| 서명 검증 실패 | JWT secret/public key mismatch, key rotation 문제 | key 설정 rollback/동기화 |
| 모든 사용자 401 | Auth 서버, 세션 저장소, 공통 config 문제 | IdP/Redis/DB/config 확인 |
| 특정 사용자만 401 | 계정 상태, 토큰 상태, 사용자별 세션 문제 | 사용자 세션/계정 상태 확인 |
| 서버 시간 차이 | `exp`, `nbf`, `iat` 검증 실패 가능 | NTP 동기화 |

---

## 6. 403 Forbidden

403은 인증은 되었지만 접근 권한이 없다는 의미다. 운영자 관점에서는 App authorization 정책과 WAF/IP 정책을 분리해야 한다. App 로그에 `AccessDenied`가 있으면 권한 정책을 보고, App 로그 없이 WAF deny log만 있으면 보안 정책을 본다.

| 항목 | 운영자 관점 |
|---|---|
| 의미 | 사용자는 식별되었지만 해당 리소스나 동작을 수행할 권한이 없음 |
| 먼저 볼 계층 | Authorization policy → RBAC/ACL → CSRF → WAF/IP/Geo policy |
| 클라이언트 단서 | 로그인은 됨, 특정 페이지/API만 403, POST만 403, 특정 IP만 403 |
| 핵심 로그 | App authorization log, Spring Security/Filter log, WAF deny log, audit log |
| 주요 병목 | Role 미부여, resource ownership 불일치, CSRF 실패, Origin/Referer 정책, IP allowlist |
| 대표 조치 | Role/permission 수정, ownership 조건 수정, CSRF/CORS 정책 수정, WAF/IP rule 조정 |

```bash
curl -v https://example.com/admin \
-H "Authorization: Bearer ACCESS_TOKEN"
```

| 증거 | 판단 | 조치 |
|---|---|---|
| App 로그에 permission denied | 애플리케이션 권한 정책 문제 | RBAC/ACL/ownership 조건 확인 |
| WAF 로그에 deny | WAF/IP/Geo 정책 문제 | WAF rule, allowlist, Geo policy 확인 |
| GET은 성공, POST만 403 | CSRF, Origin, write permission 문제 | CSRF token, Origin/Referer, method 권한 확인 |
| 특정 계정만 403 | Role 또는 resource ownership 문제 | 사용자 권한/소유권 재검증 |
| 특정 네트워크만 403 | IP allowlist 또는 보안 정책 문제 | NAT IP, office IP, VPN IP 확인 |

### 401과 403 운영자 비교

| 구분 | 401 Unauthorized | 403 Forbidden |
|---|---|---|
| 핵심 질문 | 사용자를 식별했는가? | 사용자는 식별됐는데 권한이 있는가? |
| 먼저 볼 것 | token, cookie, session, IdP | role, permission, ownership, CSRF, WAF |
| 대표 로그 | authentication failed, token expired | access denied, csrf invalid, ip denied |
| 인프라 가능성 | Authorization 헤더 누락, session store 장애 | WAF/IP/Geo policy, Origin policy |
| 조치 방향 | 인증 상태 복구 | 권한 또는 정책 조정 |

---

## 7. 404 Not Found

404는 요청한 경로나 리소스를 찾을 수 없다는 의미다. 운영자는 “정말 리소스가 없는지”보다 먼저 “라우팅 계층 중 어디에서 404를 만들었는지”를 봐야 한다. Gateway/Ingress가 만든 404와 App이 만든 404는 다르다.

| 항목 | 운영자 관점 |
|---|---|
| 의미 | URL path, route, static file, resource ID 중 하나를 찾지 못함 |
| 먼저 볼 계층 | Gateway/Ingress route → Reverse Proxy rewrite → Application route → Resource store |
| 클라이언트 단서 | 특정 URL만 404, API 전체 404, SPA 새로고침 404, 배포 후 정적 파일 404 |
| 핵심 로그 | Gateway route log, NGINX access/error log, App access log, CDN cache log |
| 주요 병목 | path rewrite 오류, base path 변경, route 누락, static asset 누락, resource ID 없음 |
| 대표 조치 | Ingress path 수정, rewrite 수정, SPA fallback 추가, static 재배포, CDN purge |

```bash
curl -vI https://example.com/
curl -vI https://example.com/api
curl -vI https://example.com/some/path
```

```bash
kubectl get ingress -A
kubectl describe ingress -n namespace ingress-name
kubectl get svc -n namespace
kubectl get endpoints -n namespace
```

| 증거 | 판단 | 조치 |
|---|---|---|
| Gateway 로그에는 404, App 로그 없음 | Gateway/Ingress routing 문제 | host/path rule, service 연결 확인 |
| App 로그에 404 | Application route 또는 resource 문제 | controller route, resource 존재 확인 |
| SPA 새로고침만 404 | History router fallback 누락 | `index.html` fallback 설정 |
| 배포 직후 asset 404 | 빌드 산출물 누락 또는 CDN stale cache | asset path 확인, CDN purge |
| API 전체 404 | base path, ingress rewrite, version route 문제 | base URL/version/rewrite 정렬 |
| 특정 ID만 404 | 리소스 삭제, 잘못된 ID, 권한상 숨김 처리 | DB/resource/ownership 확인 |

---

## 8. 405 Method Not Allowed

405는 URL은 존재하지만 해당 HTTP Method를 허용하지 않는다는 의미다. RFC 9110 기준으로 405 응답은 허용되는 method를 `Allow` 헤더로 알려줄 수 있으므로, 운영자는 이 헤더와 실제 route mapping을 함께 봐야 한다.

| 항목 | 운영자 관점 |
|---|---|
| 의미 | 경로는 존재하지만 GET/POST/PUT/PATCH/DELETE/OPTIONS 중 사용한 method가 허용되지 않음 |
| 먼저 볼 계층 | Application route mapping → Gateway method policy → CORS preflight route |
| 클라이언트 단서 | GET은 되는데 POST는 405, OPTIONS만 405, 문서와 실제 동작이 다름 |
| 핵심 로그 | App routing log, Gateway/WAF method policy log, CORS preflight log |
| 주요 병목 | controller method 누락, OPTIONS 미처리, proxy method 제한, 배포 버전 불일치 |
| 대표 조치 | method mapping 추가, OPTIONS handler/CORS 설정, Gateway allowlist 수정 |

```bash
curl -v -X GET https://example.com/api/items
curl -v -X POST https://example.com/api/items
curl -v -X OPTIONS https://example.com/api/items
```

| 증거 | 판단 | 조치 |
|---|---|---|
| App 로그에 405 | 애플리케이션 route method mapping 문제 | Controller/Router method 확인 |
| Gateway에서 405, App 로그 없음 | Gateway/Ingress/WAF method 제한 | method allowlist, route policy 확인 |
| OPTIONS만 405 | CORS preflight 처리 문제 | OPTIONS route 허용, CORS 설정 수정 |
| 문서상 POST인데 실제 405 | 배포 버전 또는 API 문서 불일치 | 배포 artifact/version/API doc 확인 |
| `Allow` 헤더와 문서 불일치 | 실제 서버 mapping이 문서와 다름 | 구현과 문서 동기화 |

---

## 9. 408 Request Timeout

408은 서버가 클라이언트의 요청을 기다리다가 timeout 처리한 상황이다. 운영자 관점에서는 응답 생성보다 “요청 body/header를 다 받지 못한 문제”로 보는 것이 먼저다. NGINX 공식 문서에서도 `client_header_timeout`, `client_body_timeout` 같은 요청 수신 timeout과 관련된다.

| 항목 | 운영자 관점 |
|---|---|
| 의미 | 클라이언트 요청을 서버가 정해진 시간 안에 다 받지 못함 |
| 먼저 볼 계층 | Client upload → Gateway request timeout → Reverse Proxy request read timeout → App request read |
| 클라이언트 단서 | 파일 업로드 중 408, 큰 요청만 실패, 특정 네트워크만 실패, 일정 시간 후 실패 |
| 핵심 로그 | NGINX error log, Gateway request timeout log, upload endpoint log |
| 주요 병목 | 느린 업로드, 대용량 body, proxy read timeout, request body timeout, 네트워크 품질 |
| 대표 조치 | upload timeout 조정, 대용량 업로드 분리, chunk/resume 지원, presigned URL 도입 |

```bash
curl -v -F "file=@small.txt" https://example.com/upload
curl -v -F "file=@large.zip" https://example.com/upload
```

```nginx
client_body_timeout 60s;
client_header_timeout 60s;
client_max_body_size 50m;
```

| 증거 | 판단 | 조치 |
|---|---|---|
| 작은 파일 성공, 큰 파일 408 | 업로드 시간 또는 크기 문제 | timeout/size limit 정렬 |
| NGINX error log에 client timed out | request body/header 수신 timeout | `client_body_timeout`, `client_header_timeout` 검토 |
| Gateway 로그에서 request timeout | Gateway request timeout 문제 | Gateway timeout 조정 |
| 특정 네트워크만 발생 | 클라이언트 네트워크 품질 문제 가능 | 재시도/resume 안내, 네트워크 비교 |
| 대용량 업로드가 자주 실패 | 구조적 업로드 방식 문제 | Object Storage 직접 업로드, chunk upload |

---

## 10. 409 Conflict

409는 요청이 현재 서버 상태와 충돌한다는 의미다. 운영자 관점에서는 단순 에러가 아니라 동시성, 중복 요청, unique constraint, optimistic locking, idempotency 설계 문제를 확인하는 신호다.

| 항목 | 운영자 관점 |
|---|---|
| 의미 | 요청 자체는 이해됐지만 현재 리소스 상태와 충돌함 |
| 먼저 볼 계층 | Business rule → Transaction → DB constraint → Lock/version control |
| 클라이언트 단서 | 중복 생성 시 409, 동시에 수정하면 409, 새로고침 후 재전송 시 409 |
| 핵심 로그 | duplicate key, unique constraint, optimistic lock, version mismatch |
| 주요 병목 | 중복 submit, 재시도 중복, unique key 충돌, optimistic lock failure |
| 대표 조치 | idempotency key, 중복 제출 방지, 충돌 메시지 개선, merge/retry 흐름 제공 |

| 증거 | 판단 | 조치 |
|---|---|---|
| DB unique constraint 에러 | 중복 데이터 생성 시도 | app validation과 DB constraint 정렬 |
| version mismatch | 동시 수정 충돌 | optimistic lock 처리와 사용자 안내 개선 |
| 동일 요청이 짧은 시간에 여러 번 | 프론트 중복 submit 또는 retry 문제 | 버튼 disable, retry 정책 수정 |
| 결제/주문에서 반복 | idempotency 부족 | idempotency key 저장/검증 도입 |
| 특정 리소스만 충돌 | 해당 리소스 상태 전이 문제 | 상태 머신/비즈니스 rule 확인 |

409를 무조건 서버 장애로 보면 안 된다. 정상적인 비즈니스 충돌일 수 있다. 다만 사용자가 같은 요청을 반복해도 해결되지 않는다면 에러 메시지, 재시도 가능 여부, 충돌 해소 UI를 개선해야 한다.

---

## 11. 413 Content Too Large / Payload Too Large

413은 요청 본문이 서버가 허용하는 크기보다 크다는 의미다. RFC 9110 이후 표준 reason phrase는 `Content Too Large`지만, 실무에서는 여전히 `Payload Too Large`도 많이 보인다. 운영자는 어느 계층의 제한값이 가장 작은지 찾아야 한다.

| 항목 | 운영자 관점 |
|---|---|
| 의미 | 요청 body 또는 업로드 파일이 허용 크기를 초과함 |
| 먼저 볼 계층 | CDN/WAF → Gateway → NGINX/Proxy → Application multipart → Storage policy |
| 클라이언트 단서 | 작은 파일은 성공, 특정 크기 이상 실패, Server 헤더가 Gateway/NGINX/App |
| 핵심 로그 | CDN/WAF body limit, NGINX 413, App multipart exception |
| 주요 병목 | `client_max_body_size`, Gateway body limit, multipart max-size, WAF inspection limit |
| 대표 조치 | 모든 계층 제한값 정렬, 사전 검증, Object Storage 직접 업로드, chunk upload |

```bash
curl -v -F "file=@small.jpg" https://example.com/upload
curl -v -F "file=@large.zip" https://example.com/upload
```

```nginx
client_max_body_size 100m;
```

Spring Boot 계열에서는 multipart 제한이 별도로 존재할 수 있으므로, reverse proxy 제한과 application 제한을 함께 맞춰야 한다.

```properties
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB
```

| 증거 | 판단 | 조치 |
|---|---|---|
| NGINX가 413 반환 | `client_max_body_size` 문제 | NGINX body size 조정 |
| App이 413 반환 | Application multipart limit 문제 | multipart max-file/request-size 조정 |
| App 로그 없음, CDN/WAF에서 413 | Edge body limit 또는 inspection limit | CDN/WAF limit 확인 |
| 특정 크기 이상부터 실패 | 가장 작은 제한값을 가진 계층이 병목 | 계층별 limit 표준화 |
| 브라우저에서만 실패 | 프론트 multipart 생성/사전 제한 문제 | UI 제한값과 서버 제한값 동기화 |

---

## 12. 415 Unsupported Media Type

415는 서버가 요청의 `Content-Type`을 처리할 수 없다는 의미다. 운영자 관점에서는 클라이언트가 보낸 Content-Type, body parser, controller consumes 설정, multipart boundary를 확인한다.

| 항목 | 운영자 관점 |
|---|---|
| 의미 | 요청 body의 media type이 서버가 처리 가능한 형식이 아님 |
| 먼저 볼 계층 | Request Header → Gateway content inspection → App body parser → Controller binding |
| 클라이언트 단서 | Content-Type을 바꾸면 성공, JSON/multipart에서만 실패, 브라우저만 실패 |
| 핵심 로그 | unsupported media type, no suitable converter, multipart boundary missing |
| 주요 병목 | Content-Type 누락/오류, parser 미설정, controller consumes 불일치, boundary 누락 |
| 대표 조치 | fetch/axios Content-Type 수정, server consumes/parser 수정, API 문서 보완 |

```bash
curl -v -X POST https://example.com/api/items \
-H "Content-Type: application/json" \
-d '{"name":"item"}'
```

| 증거 | 판단 | 조치 |
|---|---|---|
| Content-Type 변경 시 성공 | 클라이언트 요청 헤더 문제 | 프론트 요청 설정 수정 |
| App 로그에 unsupported media type | controller consumes 또는 body parser 문제 | consumes/parser 설정 확인 |
| multipart만 실패 | boundary 또는 multipart resolver 문제 | multipart 생성/서버 설정 확인 |
| Gateway에서 415, App 로그 없음 | Gateway/WAF content inspection 문제 | content-type policy 확인 |
| API 문서와 실제 요구 타입 불일치 | contract 불일치 | API 문서와 서버 구현 동기화 |

---

## 13. 422 Unprocessable Content

422는 요청의 Content-Type과 문법은 이해했지만, 의미적으로 처리할 수 없다는 뜻이다. 운영자 관점에서는 parser 문제가 아니라 validation schema, DTO binding 이후의 field validation, business rule을 본다.

| 항목 | 운영자 관점 |
|---|---|
| 의미 | 요청 문법은 맞지만 필드 값이나 비즈니스 규칙상 처리 불가 |
| 먼저 볼 계층 | DTO binding → Validation → Business rule → Domain state |
| 클라이언트 단서 | 특정 필드 값에서만 422, validation error body, 프론트 검증은 통과 |
| 핵심 로그 | validation failed, field required, out of range, business rule violation |
| 주요 병목 | 서버 validation 변경, 프론트/서버 validation 불일치, 문서 불일치 |
| 대표 조치 | validation rule 수정, 에러 메시지 구체화, API 문서/프론트 검증 동기화 |

| 증거 | 판단 | 조치 |
|---|---|---|
| 특정 필드만 실패 | validation rule 문제 | rule 확인, 메시지 개선 |
| 문서상 허용값인데 422 | API 문서와 서버 validation 불일치 | API 문서/서버 구현 동기화 |
| 배포 후 422 증가 | validation rule 변경 영향 | 배포 diff 확인, 하위 호환성 검토 |
| 프론트는 통과, 서버는 실패 | 클라이언트/서버 validation 불일치 | 프론트 validation 동기화 |
| 동일 요청 반복해도 실패 | 요청 수정 없이는 성공 불가 | 사용자에게 수정 항목 명시 |

### 400과 422 운영자 비교

| 구분 | 400 Bad Request | 422 Unprocessable Content |
|---|---|---|
| 실패 위치 | request parsing, syntax, header, body format | parsing 이후 validation/business rule |
| 먼저 볼 것 | Content-Type, JSON syntax, malformed URL | field validation, domain rule |
| 대표 로그 | parse error, bad request line | validation failed, business rule violation |
| 조치 방향 | 요청 형식/파서/계약 수정 | 값 검증/정책/메시지 수정 |

---

## 14. 429 Too Many Requests

429는 요청 제한에 걸렸다는 의미다. RFC 6585는 429가 일정 시간 동안 너무 많은 요청을 보낸 상황을 나타내며, 응답에 설명과 `Retry-After`를 포함할 수 있다고 설명한다. 운영자는 Rate Limiter가 Edge, Gateway, Application 중 어디에 있는지 먼저 찾아야 한다.

| 항목 | 운영자 관점 |
|---|---|
| 의미 | IP, 계정, token, resource 단위 요청 제한 초과 |
| 먼저 볼 계층 | CDN/WAF rate limit → API Gateway quota → App rate limiter |
| 클라이언트 단서 | 반복 요청 후 429, `Retry-After` 존재, 특정 IP/계정만 429 |
| 핵심 로그 | rate limit log, WAF bot/rate rule, API Gateway quota log, App limiter log |
| 주요 병목 | retry loop, polling 과다, NAT IP 공유, 계정 quota 초과, bot 탐지 |
| 대표 조치 | limit 조정, retry backoff, polling 주기 조정, `Retry-After` 명시, 정책 분리 |

```bash
curl -vI https://example.com/api

for i in {1..20}; do
  curl -s -o /dev/null -w "$i %{http_code}\n" https://example.com/api
done
```

| 증거 | 판단 | 조치 |
|---|---|---|
| CDN/WAF가 429 반환 | Edge rate limit | WAF/CDN rate rule 확인 |
| API Gateway가 429 반환 | Gateway quota/rate policy | Gateway policy 조정 |
| App이 429 반환 | Application rate limiter | limiter key/IP/account 정책 확인 |
| 특정 계정만 429 | 계정 quota 초과 | quota 상향 또는 사용량 안내 |
| 특정 IP만 429 | IP 기반 제한 또는 NAT 공유 | NAT 환경 확인, IP 정책 분리 |
| 요청 폭증 동반 | 프론트 retry loop/polling 문제 | exponential backoff, polling 주기 조정 |

---

## 15. 500 Internal Server Error

500은 서버 내부 예외다. 운영자 관점에서는 Application 로그와 Trace ID가 가장 중요하다. 다만 모든 500이 코드 버그는 아니다. 환경변수 누락, secret 변경, DB migration 실패, 파일 권한, 외부 API 장애도 500으로 나타날 수 있다.

| 항목 | 운영자 관점 |
|---|---|
| 의미 | 서버 내부 처리 중 예외 또는 예상하지 못한 실패 발생 |
| 먼저 볼 계층 | Application access/error log → Trace/APM → DB/Cache/External API → 최근 배포 |
| 클라이언트 단서 | 특정 API만 500, 특정 payload만 500, 전체 API 500, error id/request id 존재 |
| 핵심 로그 | exception stack trace, request id, dependency error, migration/config error |
| 주요 병목 | 코드 예외, DB 연결 실패, schema 불일치, env/secret 누락, 외부 API 실패 |
| 대표 조치 | 영향 크면 rollback, code/config fix, DB migration 확인, fallback/circuit breaker |

```bash
kubectl logs -n namespace deploy/app --since=30m
kubectl rollout history deploy/app -n namespace
kubectl describe pod -n namespace pod-name
```

| 증거 | 판단 | 조치 |
|---|---|---|
| 특정 API만 500 | 해당 비즈니스 로직 또는 데이터 문제 | stack trace, payload 재현, code fix |
| 모든 API가 500 | 공통 설정, DB, 인증 모듈, 배포 문제 | config/env/secret/DB 연결 확인 |
| 배포 직후 500 증가 | 코드 변경 또는 설정 변경 문제 | rollback 또는 hotfix |
| 특정 payload만 500 | validation 누락 또는 예외 처리 미흡 | validation 추가, 예외 처리 보완 |
| DB 에러 동반 | DB connection, schema, query 문제 | DB 상태, migration, pool 확인 |
| Pod restart 증가 | OOMKilled, CrashLoopBackOff 가능 | resource limit, memory leak, startup 확인 |

---

## 16. 501 Not Implemented

501은 서버가 요청 기능 또는 Method를 구현하지 않았다는 의미다. 운영자 관점에서는 API가 실제로 배포된 버전인지, Gateway/Proxy가 해당 method를 지원하는지, 문서와 운영 환경이 일치하는지 확인한다.

| 항목 | 운영자 관점 |
|---|---|
| 의미 | 서버가 요청 기능 또는 method를 처리할 구현을 갖고 있지 않음 |
| 먼저 볼 계층 | API implementation → Deployment version → Gateway/Proxy method support |
| 클라이언트 단서 | 문서에는 있는 API인데 501, 특정 method만 501, 일부 환경만 501 |
| 핵심 로그 | route not implemented, handler missing, gateway method unsupported |
| 주요 병목 | 기능 미배포, 운영/개발 환경 버전 차이, Gateway method 처리 문제 |
| 대표 조치 | 기능 구현 배포, 환경별 버전 정렬, Gateway method support 수정, API 문서 갱신 |

```bash
curl -v -X GET https://example.com/api/resource
curl -v -X PATCH https://example.com/api/resource
```

| 증거 | 판단 | 조치 |
|---|---|---|
| App 로그에 501 | 애플리케이션 기능 미구현 | 구현/배포 계획 확인 |
| Gateway에서 501, App 로그 없음 | Gateway method 처리 문제 | Gateway/Proxy method support 확인 |
| 운영 환경만 501 | 배포 누락 또는 버전 불일치 | release artifact/version 정렬 |
| 문서와 다름 | API 문서가 최신이 아님 | API 문서 업데이트 |

---

## 17. 502 Bad Gateway

502는 Gateway, Load Balancer, Reverse Proxy가 Backend에서 정상 응답을 받지 못했다는 의미다. 운영자 관점에서는 Gateway와 Backend 사이를 가장 먼저 본다. 특히 Azure Application Gateway에서는 backend health probe가 backend VM/서버에 도달하지 못하거나 backend가 unhealthy이면 클라이언트에 502가 반환될 수 있으므로 Backend Health 탭의 세부 메시지가 핵심 단서가 된다.

| 항목 | 운영자 관점 |
|---|---|
| 의미 | Gateway/Proxy가 upstream/backend로부터 유효한 응답을 받지 못함 |
| 먼저 볼 계층 | Gateway access/error log → Backend Health → Backend pool/port/protocol/TLS/firewall → Backend App |
| 클라이언트 단서 | Gateway Server 헤더, 루트와 API 모두 502, 외부 지역 모두 502, 매우 짧은 502 |
| 핵심 로그 | Gateway access log, backend health detail, NGINX upstream error, App health log |
| 주요 병목 | backend down, port mismatch, probe 실패, NSG 차단, Host Header mismatch, Backend TLS 실패 |
| 대표 조치 | backend 복구, pool/port/protocol/probe 수정, NSG 허용, Host Header/TLS 수정, rollback |

```bash
az network application-gateway show-backend-health \
  --resource-group RESOURCE_GROUP \
  --name APP_GATEWAY_NAME
```

```bash
kubectl get ingress -A
kubectl get svc -A
kubectl get endpoints -A
kubectl get pods -A -o wide
kubectl logs -n namespace deploy/app --since=30m
```

```text
connect() failed
upstream prematurely closed connection
no live upstreams
upstream timed out
connection refused
SSL_do_handshake() failed
host not found in upstream
```

| 증거 | 판단 | 조치 |
|---|---|---|
| Gateway 로그 있음, Backend/App 로그 없음 | Gateway → Backend 연결 문제 | backend pool, port, NSG, route 확인 |
| Backend Health Unhealthy | probe, port, path, response code, TLS, firewall 문제 | probe detail 기준으로 수정 |
| connection refused | Backend 프로세스 down 또는 port mismatch | 서비스 재기동, port 수정 |
| TLS handshake failure | Backend 인증서, trusted root, SNI 문제 | 인증서/Trusted Root/SNI 수정 |
| Host Header mismatch | Backend virtual host가 다른 요청으로 처리 | Host Header override 수정 |
| 매우 짧은 502 | Gateway가 backend를 즉시 unhealthy로 판단 | Backend Health와 Probe 우선 확인 |
| 긴 502 | 연결 또는 upstream 응답 대기 후 실패 | timeout, app 지연, network 지연 확인 |

---

## 18. 503 Service Unavailable

503은 서비스가 현재 요청을 처리할 수 없다는 의미다. 운영자 관점에서는 가용 인스턴스, readiness, maintenance, capacity, connection pool을 본다. Kubernetes 공식 문서 기준으로 readiness probe가 실패한 Pod는 Service endpoint에서 제외되어 트래픽을 받지 않으므로, `Running`이어도 실제 traffic-ready가 아닐 수 있다.

| 항목 | 운영자 관점 |
|---|---|
| 의미 | 서비스가 일시적으로 요청을 처리할 수 없음 |
| 먼저 볼 계층 | Gateway/LB target health → Endpoint/Readiness → Instance capacity → Dependency pool |
| 클라이언트 단서 | 모든 경로 503, 배포 중 503, 트래픽 시간대 503, `Retry-After` 존재 |
| 핵심 로그/지표 | LB target health, K8s endpoints/readiness, HPA, CPU/Memory, thread/connection pool |
| 주요 병목 | endpoint 없음, readiness false, instance 부족, maintenance, pool 고갈, autoscaling 지연 |
| 대표 조치 | rollback, scale out, readiness 수정, autoscaling 조정, pool 조정, maintenance 해제 |

```bash
kubectl get pods -n namespace
kubectl describe pod -n namespace pod-name
kubectl get hpa -n namespace
kubectl top pods -n namespace
kubectl get endpoints -n namespace
```

| 증거 | 판단 | 조치 |
|---|---|---|
| Backend endpoint 없음 | Pod readiness 실패 또는 service selector 문제 | readiness/selector/service 확인 |
| Pod Running, readiness false | App 초기화 실패 또는 readiness 조건 문제 | readiness endpoint와 dependency 확인 |
| CPU/Memory 포화 | capacity 부족 | scale out, request/limit 조정 |
| connection pool exhausted | DB/downstream 병목 | pool sizing, DB capacity, query 확인 |
| 배포 중 일시적 503 | rolling update 전략 문제 | maxUnavailable, readiness, preStop 확인 |
| Retry-After 존재 | 재시도 가능 시점 안내 | 사용자/클라이언트 retry 정책과 정렬 |

---

## 19. 504 Gateway Timeout

504는 Gateway가 Backend 응답을 기다리다가 timeout된 상황이다. 운영자 관점에서는 Gateway 자체보다 Backend 처리 시간, DB, 외부 API, thread pool, connection pool, timeout 설정 정렬을 본다. 클라이언트가 “항상 60초 후 504”라고 전달하면 Gateway 또는 proxy timeout 값과 거의 일치하는지 확인해야 한다.

| 항목 | 운영자 관점 |
|---|---|
| 의미 | Gateway/Proxy가 upstream/backend의 응답을 정해진 시간 안에 받지 못함 |
| 먼저 볼 계층 | Gateway/proxy timeout → App 처리 시간 → DB/External API → thread/connection pool |
| 클라이언트 단서 | 일정 시간 후 504, 특정 무거운 API만 504, 가벼운 API는 정상 |
| 핵심 로그/지표 | gateway timeout log, NGINX upstream timed out, APM trace, DB slow query, dependency latency |
| 주요 병목 | slow query, 외부 API 지연, lock wait, pool 고갈, 대용량 처리, timeout 설정 불일치 |
| 대표 조치 | query 튜닝, index, pagination, async job, timeout/retry/circuit breaker, cache, pool 조정 |

```nginx
proxy_connect_timeout 5s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

```sql
-- PostgreSQL
SELECT pid, now() - query_start AS duration, state, query
FROM pg_stat_activity
WHERE state <> 'idle'
ORDER BY duration DESC;
```

| 증거 | 판단 | 조치 |
|---|---|---|
| 항상 60초 후 504 | Gateway/proxy timeout 가능성 | timeout 설정과 요청 처리 시간 비교 |
| 특정 API만 504 | 해당 로직, DB query, 외부 API 병목 | APM trace, slow query 확인 |
| DB slow query와 시간 일치 | DB 병목 | query 튜닝, index, lock 해소 |
| 외부 API latency와 시간 일치 | downstream dependency 병목 | timeout/retry/circuit breaker |
| thread pool 고갈 | App capacity 문제 | thread/pool sizing, backpressure |
| 큰 payload/response에서만 504 | 처리량/전송량 문제 | pagination, streaming, async job |

### 502 / 503 / 504 운영자 비교

| 코드 | 핵심 의미 | 주 병목 | 로그 특징 | 대표 원인 | 우선 조치 |
|---|---|---|---|---|---|
| 502 | Gateway가 Backend 정상 응답을 못 받음 | Gateway ↔ Backend | Gateway 로그 있음, App 로그 없을 수 있음 | backend down, port mismatch, probe 실패, TLS 실패 | Backend Health, port, NSG, TLS 확인 |
| 503 | 처리 가능한 서비스 인스턴스 부족/불가 | Availability / Capacity | endpoint 없음, readiness false 가능 | 배포 중, instance 부족, pool 고갈, maintenance | readiness, autoscaling, instance 상태 확인 |
| 504 | Gateway가 Backend 응답을 기다리다 timeout | Backend latency | App 로그는 있으나 응답 지연 가능 | DB slow query, 외부 API 지연, lock, pool 고갈 | timeout, slow query, dependency latency 확인 |

---

## 20. 301, 302, 304는 기본적으로 에러가 아니다

301, 302, 304는 기본적으로 실패가 아니다. 다만 운영자 관점에서는 리다이렉트 루프, 로그인 무한 이동, HTTP→HTTPS 전환 오류, stale cache, asset versioning 문제를 확인해야 한다.

| 코드 | 의미 | 운영자 관점 |
|---|---|---|
| 301 | 영구 리다이렉트 | HTTP→HTTPS, 도메인 변경, canonical URL 정책 |
| 302 | 임시 리다이렉트 | 로그인 이동, 임시 경로, 인증 흐름 |
| 304 | 변경 없음 | 브라우저/CDN 캐시, ETag/Last-Modified |

```bash
curl -vIL http://example.com
curl -vI https://example.com
```

| 증거 | 판단 | 조치 |
|---|---|---|
| HTTP → HTTPS 301 후 HTTPS 502 | redirect는 정상, HTTPS backend 문제 | 502 절차로 Gateway/Backend 확인 |
| http ↔ https 무한 반복 | `X-Forwarded-Proto` 또는 TLS termination 문제 | proxy/LB forwarded header 수정 |
| 로그인 페이지로 계속 302 | 세션 쿠키, SameSite, 인증 상태 문제 | cookie/auth flow 확인 |
| 정적 파일이 갱신되지 않음 | 304/cache stale 가능성 | CDN purge, Cache-Control, asset hash 확인 |
| Location이 잘못된 host | Host Header 또는 app base URL 문제 | `X-Forwarded-Host`, base URL 수정 |

```nginx
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
```

---

## 21. CORS 오류는 HTTP 코드와 다르게 봐야 한다

CORS는 HTTP 상태 코드 자체라기보다 브라우저 보안 정책에 의해 응답 접근이 차단되는 상황이다. 운영자 관점에서는 curl이 성공하는데 브라우저만 실패하는지를 먼저 확인하고, OPTIONS preflight와 CORS 응답 헤더를 본다.

| 항목 | 운영자 관점 |
|---|---|
| 의미 | 브라우저가 cross-origin 응답 접근을 허용하지 않음 |
| 먼저 볼 계층 | Browser preflight → Gateway OPTIONS route → App CORS policy → Cookie credentials |
| 클라이언트 단서 | curl은 성공, 브라우저만 실패, Console CORS 오류, OPTIONS가 401/403/404/405 |
| 핵심 로그/헤더 | `Origin`, OPTIONS status, `Access-Control-Allow-*`, `Access-Control-Allow-Credentials` |
| 주요 병목 | OPTIONS 인증 요구, CORS header 누락, credentials와 wildcard 충돌, cookie SameSite 문제 |
| 대표 조치 | OPTIONS route 허용, origin allowlist, allowed methods/headers, credentials/cookie 정책 수정 |

```bash
curl -v -X OPTIONS https://api.example.com/resource \
-H "Origin: https://www.example.com" \
-H "Access-Control-Request-Method: POST" \
-H "Access-Control-Request-Headers: authorization,content-type"
```

```text
Access-Control-Allow-Origin: https://www.example.com
Access-Control-Allow-Methods: GET,POST,OPTIONS
Access-Control-Allow-Headers: authorization,content-type
Access-Control-Allow-Credentials: true
```

credentials가 필요한 요청에서는 `Access-Control-Allow-Origin: *`와 함께 처리할 수 없는 조합이 있으므로, 명시적 origin allowlist를 사용해야 한다.

| 증거 | 판단 | 조치 |
|---|---|---|
| curl은 성공, 브라우저만 실패 | CORS 가능성 높음 | OPTIONS와 CORS 헤더 확인 |
| OPTIONS가 401 | preflight에 인증을 요구함 | OPTIONS는 인증 없이 통과하도록 정책 조정 |
| OPTIONS가 404/405 | preflight route 누락 | OPTIONS route/method 허용 |
| CORS 헤더가 Gateway에서 사라짐 | Gateway header policy 문제 | Gateway response header policy 수정 |
| 쿠키가 안 붙음 | SameSite/Secure/Domain/credentials 문제 | cookie 속성, withCredentials 확인 |
| credentials=true + wildcard | 허용되지 않는 CORS 조합 | 구체 origin 반환 |

---

## 22. 에러 코드별 병목 구간 요약표

| 코드 | 운영자가 먼저 볼 계층 | 핵심 확인 | 개발자 관점 | 인프라/DevOps 관점 | 대표 조치 |
|---|---|---|---|---|---|
| 400 | Gateway/WAF/App parser | Payload, Header, Content-Type | DTO binding, validation, API contract | WAF rule, header/body limit | 요청 형식·validation·WAF rule 수정 |
| 401 | Auth/Session/Token | Cookie, JWT, Session store | refresh flow, JWT 검증 | IdP, Redis/session, clock skew | 토큰/세션/키 설정 복구 |
| 403 | Authz/WAF/Policy | Role, CSRF, IP 정책 | RBAC, ACL, ownership | WAF, IP allowlist, Origin policy | 권한/정책/CSRF 수정 |
| 404 | Routing/Resource | Ingress, rewrite, route | Controller route, resource 존재 | Ingress path, NGINX rewrite, CDN asset | 라우팅/fallback/resource 수정 |
| 405 | Method routing | Allow, OPTIONS, controller | method mapping | Gateway method policy | method mapping/CORS 수정 |
| 408 | Request read/upload | body timeout, upload size | upload API 처리 | proxy request timeout | timeout/upload 구조 수정 |
| 409 | Business/DB state | duplicate, version conflict | idempotency, lock 처리 | DB unique/transaction 상태 | 중복·동시성 처리 개선 |
| 413 | Body size limit | CDN/Gateway/Nginx/App limit | multipart limit, validation | body limit, WAF/CDN limit | 제한값 정렬, 대용량 업로드 개선 |
| 415 | Content parser | Content-Type, body parser | consumes/parser 설정 | content inspection policy | Content-Type/parser 수정 |
| 422 | Validation | DTO, schema, business rule | validation/business rule | 배포 버전/문서 정합성 | validation/API 문서 수정 |
| 429 | Rate limit | Retry-After, quota, IP/account | retry/backoff, polling | WAF/API Gateway quota | limit 조정, retry backoff |
| 500 | Application | stack trace, dependency | code fix, exception handling | env/secret/runtime/resource | rollback, 코드/설정/DB 수정 |
| 501 | API implementation | route, method, version | 기능 구현 | gateway method support | 구현/배포/문서 정렬 |
| 502 | Gateway-Backend | Backend Health, port, TLS | health endpoint, app process | pool, probe, NSG, TLS | probe/pool/NSG/backend 복구 |
| 503 | Availability/Capacity | readiness, instance, autoscale | readiness, pool 사용 | target health, HPA, instance | capacity/readiness/rollback |
| 504 | Backend latency | timeout, DB, external API | slow logic, query, dependency | gateway/proxy timeout, capacity | query 튜닝, timeout, 비동기화 |
| 301/302/304 | Redirect/Cache | Location, cache headers | base URL, auth redirect | forwarded headers, CDN cache | redirect/cache 정책 수정 |
| CORS | Browser/API policy | OPTIONS, CORS headers | CORS config, cookie flow | Gateway header policy | CORS/쿠키/Gateway 정책 수정 |

---

## 23. 실무적으로 가장 중요한 구분

운영자는 상태 코드를 크게 4xx와 5xx로 나누되, 그 구분만 믿으면 안 된다. 4xx라도 WAF나 Gateway 정책 때문에 발생할 수 있고, 5xx라도 애플리케이션 코드가 아니라 backend health, readiness, timeout, DB connection pool 때문에 발생할 수 있다.

| 큰 구분 | 1차 해석 | 운영자 주의점 |
|---|---|---|
| 4xx | 요청, 인증, 권한, 경로, 정책 문제 가능성이 높다. | WAF/Gateway가 만든 4xx일 수 있으므로 App 로그 도달 여부를 확인한다. |
| 5xx | 서버, Gateway, Backend, DB, 외부 API 문제 가능성이 높다. | 응답 주체가 Gateway인지 App인지 먼저 분리한다. |
| 3xx | 보통 에러는 아니다. | redirect loop, login loop, stale cache는 장애가 될 수 있다. |
| CORS | HTTP 코드보다 브라우저 정책 문제에 가깝다. | curl 성공 여부와 OPTIONS 응답을 반드시 본다. |

| 질문 | 의미 | 다음 행동 |
|---|---|---|
| 응답을 누가 만들었는가? | CDN/WAF/Gateway/App 중 시작 로그를 정한다. | `Server`, `Via`, `X-Cache`, request id 확인 |
| 요청이 App 로그까지 도달했는가? | App 문제인지 앞단 문제인지 나눈다. | App access log와 Gateway log 대조 |
| 실패가 특정 경로인가 전체 경로인가? | 기능 장애인지 공통 인프라 장애인지 나눈다. | health/home/api/heavy 경로 비교 |
| 응답 시간이 짧은가 긴가? | 즉시 차단/health 실패인지 처리 지연인지 나눈다. | curl timing, gateway timeout, APM 대조 |
| 특정 사용자/계정/IP/지역인가? | 권한, rate limit, WAF, 지역 장애를 나눈다. | 계정/IP/지역별 로그 필터링 |
| 최근 변경과 시간상 일치하는가? | 가장 빠른 복구 후보를 찾는다. | 배포, config, DNS, cert, WAF 변경 이력 확인 |
| 인프라 메트릭도 악화됐는가? | 용량/리소스 병목 여부를 본다. | CPU, memory, restart, pool, saturation 확인 |
| DB/Cache/Queue/외부 API도 나빠졌는가? | downstream 병목 여부를 본다. | dependency latency/error rate 확인 |

운영자는 “원인을 맞히는 사람”이 아니라 “증거를 줄 세우는 사람”이어야 한다. App log에 요청이 없으면 App부터 보지 않는다. Gateway log에 요청이 없으면 DNS/CDN/LB 앞단을 본다. Gateway에는 있고 App에는 없으면 Gateway→Backend 구간을 본다. App에는 있고 DB가 느리면 DB를 본다. App에는 있고 stack trace가 있으면 코드를 본다. 최근 배포 직후면 rollback 가능성을 항상 열어둔다.

---

## 24. 장애 보고용 공통 템플릿

운영자 관점의 장애 보고서는 클라이언트 수정본의 보고 템플릿과 대응되어야 한다. 클라이언트가 가져온 URL, 상태 코드, 응답 헤더, 응답 시간, 재현 범위를 받아서 운영자는 내부 로그, backend health, app error, DB metric, 최근 변경 이력으로 확장한다.

| 구역 | 작성 내용 | 담당 관점 |
|---|---|---|
| 문제 상황 | 어떤 기능에서 어떤 문제가 발생했는가 | 공통 |
| 영향 범위 | 전체/특정 사용자/특정 네트워크/특정 API/특정 지역 | 운영/기획/CS |
| 클라이언트 제공 정보 | URL, Method, Status, Header, Body, 응답 시간, 캡처 | CS/클라이언트 |
| 운영자 1차 판단 | 응답 주체, 요청 도달 계층, 의심 병목 | 운영자 |
| 내부 확인 결과 | Gateway/App/DB/Infra log와 metric | DevOps/Backend/DBA |
| 원인 후보 | 증거 기반 후보 1~3개 | 운영자 |
| 즉시 완화 조치 | rollback, scale out, restart, traffic shift 등 | 운영/DevOps |
| 근본 조치 | code/config/infra fix, monitoring, test, runbook | 개발/인프라 |
| 결론 | 최종 원인, 영향 범위, 복구 시각, 재발 방지 | 공통 |

```text
[문제 상황]
어떤 기능에서 어떤 문제가 발생했는가?

[영향 범위]
전체 사용자 / 특정 사용자 / 특정 네트워크 / 특정 API / 특정 지역

[발생 시각]
YYYY-MM-DD HH:mm:ss, timezone 포함

[클라이언트 제공 정보]
URL:
HTTP Method:
Status Code:
Server Header:
Response Body:
응답 시간:
curl 결과:
브라우저 Network 캡처:
외부 다중 지역 체크 결과:

[운영자 1차 판단]
응답 주체:
요청 도달 계층:
클라이언트 문제 가능성:
서버 문제 가능성:
가장 의심되는 병목 구간:

[내부 확인 결과]
Gateway access log:
Gateway error log:
Backend Health:
App access log:
App error log:
Trace ID:
DB metric:
Cache/Queue metric:
Infra metric:
최근 배포/설정 변경:

[원인 후보]
1.
2.
3.

[즉시 완화 조치]
rollback:
scale out:
restart:
traffic shift:
feature flag off:
WAF/Gateway rule rollback:
cache purge:

[근본 조치]
code fix:
config fix:
infra fix:
monitoring 추가:
alert 추가:
runbook 보완:
test 추가:

[결론]
최종 원인:
영향 범위:
복구 시각:
재발 방지:
```

---

## 25. 결론

클라이언트 관점의 트러블슈팅은 “내 PC 문제인지, 브라우저 문제인지, DNS/TCP/TLS는 정상인지, Gateway까지 도달했는지, 외부에서도 재현되는지”를 밝히는 데 목적이 있다. 운영자 관점의 트러블슈팅은 그 다음 단계다. 운영자는 Gateway가 응답을 만들었는지, App까지 요청이 도달했는지, Backend Health가 정상인지, 인증/권한/라우팅/프록시 설정은 맞는지, App 로그에 예외가 있는지, DB나 외부 API가 느린지, 최근 배포나 설정 변경과 관련이 있는지를 확인해야 한다.

| 클라이언트 수정본의 질문 | 운영자 수정본의 대응 질문 |
|---|---|
| DNS가 정상인가? | authoritative DNS, 내부 DNS, CDN origin이 모두 맞는가? |
| TCP 443이 열려 있는가? | Gateway listener와 backend port가 모두 열려 있는가? |
| TLS가 정상인가? | Client→Gateway뿐 아니라 Gateway→Backend TLS도 정상인가? |
| Server 헤더가 무엇인가? | 그 응답 주체의 access/error log에 무엇이 남았는가? |
| 응답 시간이 짧은가 긴가? | 즉시 차단/health 실패인가, app/DB/downstream 지연인가? |
| 브라우저에서만 실패하는가? | Cookie, CORS, CSRF, Origin 정책이 맞는가? |
| 다른 환경에서도 재현되는가? | 전체 장애인가, 특정 IP/계정/지역/경로 문제인가? |
| 운영자에게 무엇을 전달할 것인가? | 받은 단서를 어떤 로그·메트릭·설정·변경 이력과 연결할 것인가? |

운영자는 HTTP 상태 코드를 결론이 아니라 출발점으로 다뤄야 한다. 응답 헤더는 응답 주체를 알려주고, 응답 시간은 병목의 성격을 알려주며, 로그의 위치는 요청이 도달한 마지막 계층을 알려준다. 최근 변경 이력은 가장 빠른 복구 경로를 알려준다.

최종 목표는 단순히 에러를 없애는 것이 아니다. 병목 계층을 특정하고, 사용자 영향도를 줄이고, 안전한 임시 조치를 하며, 근본 원인을 수정하고, 같은 유형의 장애를 더 빨리 찾을 수 있도록 로그·메트릭·알림·문서를 보강하는 것이다.

```text
클라이언트가 가져온 HTTP 에러는 운영자에게 “어디를 봐야 하는지”를 알려주는 단서다.
운영자는 그 단서를 로그, 메트릭, 설정, 최근 변경 이력과 연결해 병목을 확정하고 복구해야 한다.
```



## 참고

아래 문서는 기존 운영자용 내용을 유지하되, 필요한 부분만 공식 또는 공식 문서급 자료 기준으로 보강했다.

- IETF RFC 9110, HTTP Semantics: HTTP 상태 코드, `WWW-Authenticate`, `Allow`, `Retry-After`, 502/503/504 의미
  - https://www.rfc-editor.org/rfc/rfc9110.html
- IANA HTTP Status Code Registry: 표준 HTTP 상태 코드 명칭과 참조 RFC
  - https://www.iana.org/assignments/http-status-codes
- RFC 6585, Additional HTTP Status Codes: 429 Too Many Requests, `Retry-After` 사용 가능성
  - https://www.rfc-editor.org/rfc/rfc6585.html
- curl 공식 man page: `--write-out`, `time_namelookup`, `time_connect`, `time_appconnect`, `time_starttransfer`, `time_total`
  - https://curl.se/docs/manpage.html
- OpenSSL 공식 문서, `openssl-s_client`: TLS 연결 확인과 `-servername` SNI 확인
  - https://docs.openssl.org/3.0/man1/openssl-s_client/
- Microsoft Learn, Azure Application Gateway 502 / Backend Health troubleshooting
  - https://learn.microsoft.com/en-us/troubleshoot/azure/application-gateway/application-gateway-troubleshooting-502
  - https://learn.microsoft.com/en-us/troubleshoot/azure/application-gateway/application-gateway-backend-health-troubleshooting
- Kubernetes 공식 문서, Liveness / Readiness / Startup Probes
  - https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
  - https://kubernetes.io/docs/concepts/workloads/pods/probes/
- NGINX 공식 문서, `client_max_body_size`, `client_header_timeout`, `client_body_timeout`
  - https://nginx.org/en/docs/http/ngx_http_core_module.html
- WHATWG Fetch Standard / W3C CORS 문서: CORS preflight, Access-Control 계열 헤더, credentials 처리
  - https://fetch.spec.whatwg.org/
  - https://www.w3.org/TR/2020/SPSD-cors-20200602/
- Spring Boot 공식 문서: multipart upload, server 설정, 외부 설정
  - https://docs.spring.io/spring-boot/reference/web/servlet.html
  - https://docs.spring.io/spring-boot/reference/features/external-config.html