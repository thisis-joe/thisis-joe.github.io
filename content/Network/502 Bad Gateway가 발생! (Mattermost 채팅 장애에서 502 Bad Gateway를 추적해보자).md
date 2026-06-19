---
title: 502 Bad Gateway가 발생! (Mattermost 채팅 장애에서 502 Bad Gateway를 추적해보자)
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-20T05:00:07+09:00
---

## 1. 문제 상황

Mattermost에서 채팅이 정상적으로 전송되지 않는 문제가 발생했다.

채팅 기능만 일시적으로 멈춘 걸까..  웹사이트 주소를 브라우저에 직접 입력해 접속해보니 `502 Bad Gateway`가 표시되었다.

이게 무엇을 의미할까? 흐름을 생각해보자.

```text
Mattermost에서 채팅 전송 불가
→ 웹 브라우저에서 Mattermost 주소 직접 입력
→ 502 Bad Gateway 확인
→ 응답 화면에 Microsoft-Azure-Application-Gateway/v2 표시
→ 클라이언트 측에서 DNS, TCP, TLS, HTTP, API 경로, 외부 체크 순서로 확인
```

화면에 표시된 핵심 문구는 이랬다.

```text
502 Bad Gateway
Microsoft-Azure-Application-Gateway/v2
```

여기서 바로 결론을 내리면 안 된다.
`Microsoft-Azure-Application-Gateway/v2`가 보인다고 해서 곧바로 “Microsoft Azure 장애”라고 단정할 수는 없다.

정확히는 다음 의미에 가깝다.

```text
502 응답을 반환한 주체는 Azure Application Gateway이다.
하지만 실제 원인은 그 뒤쪽 Backend Server, Gateway 설정, Health Probe, 방화벽, 인증서, Host Header 문제일 수 있다.
```

## 2. 어디가 문제일까

일단, “에러 화면 자체도 하나의 응답”이다. 그렇다면 “어느 계층까지 정상이고, 어느 계층부터 실패할까?”

```text
내 브라우저는 무언가로부터 응답을 받았다.
그 응답을 만든 주체는 Azure Application Gateway이다.
```

아마 지금 이 화면에 계신 님(방문 감사합니다)처럼 나도 `ping` 이 먼저 떠오른다. `ping randomdomainwithoutwww.com` 보내보니, 정상적으로 반환된다. 
알아보니, `ping`은 ICMP 도달 여부만 확인한다고 한다.

 **ping으로 알 수 있는 것**
 ```text
DNS가 IP로 해석된다.
목적지 IP까지 ICMP 패킷이 도달한다.
네트워크 경로 일부는 살아 있다.
 ```
 
그럼 이제 병목구간을 알기 위해서 실제 웹 서비스는 어떤 순서를 거치는지 한번 볼까. 

```text
DNS 조회
→ TCP 연결
→ TLS Handshake
→ HTTP 요청
→ Application Gateway
→ Backend Server
→ Application
→ Database
```

따라서 ping이 된다는 것은 서버 앞단 IP까지 네트워크 도달은 가능하다는 뜻이다. 
하지만 웹 서비스가 정상이라는 뜻은 아니다. 
ping이 성공해도 502는 충분히 발생할 수 있다.

---

## 3. 가설

3가지 가설을 떠올릴 수 있다.

| 구분                    | 설명                                                               |
| --------------------- | ---------------------------------------------------------------- |
| 클라이언트 문제              | Mac, 브라우저, DNS 캐시, 로컬 네트워크, VPN, 프록시 문제                          |
| 서비스 측 문제              | Azure Application Gateway 뒤쪽 Mattermost Backend 또는 Gateway 설정 문제 |
| Microsoft Azure 전체 장애 | Azure Application Gateway 또는 Korea Central 리전 장애                 |

그렇다면 순서는 이렇다. 

```text
1. 내 Mac 또는 브라우저 문제인지 확인한다.
2. DNS가 정상인지 확인한다.
3. TCP 80/443 연결이 가능한지 확인한다.
4. TLS 인증서가 정상인지 확인한다.
5. 502를 반환한 주체가 누구인지 확인한다.
6. Mattermost 특정 화면 문제인지, API까지 포함한 공통 문제인지 확인한다.
7. 외부 여러 지역에서도 같은 문제가 발생하는지 확인한다.
8. Azure 전체 장애 정황이 있는지 확인한다.
```

---

## 4. DNS 확인

도메인이 어떤 IP로 해석되는지 확인했다.

```bash
dig +short randomdomainwithoutwww.com
```

결과는 이렇다.

```text
randomdomainwithoutwww
→ mattermost.koreacentral.cloudapp.azure.com
→ 56.234.111.123   (임의수정한 ip입니다.)
```

이는 다음을 의미한다

```text
도메인이 정상적으로 해석된다.
CNAME을 거쳐 Azure Korea Central 쪽 주소로 연결된다.
최종 접속 대상 IP가 확인된다.
```

DNS 장애라면 보통 다음과 같은 결과가 나온다.

```text
NXDOMAIN
SERVFAIL
timeout
엉뚱한 IP 반환
```

이번에는 그런 상황이 아니었다.

따라서 이 단계의 판단은 다음이다.

```text
DNS 문제 가능성은 낮다.
```

---

## 6. HTTP 80 확인

다음으로 HTTP 80 요청을 확인했다.

```bash
curl -vI http://meeting.ssafy.com
```

결과는 다음과 같았다.

```text
HTTP/1.1 301 Moved Permanently
Server: Microsoft-Azure-Application-Gateway/v2
Location: https://meeting.ssafy.com/
```

이 결과는 꽤 중요하다.

```text
HTTP 80 리스너는 살아 있다.
HTTP 요청은 Azure Application Gateway까지 도달한다.
HTTP → HTTPS 리다이렉트 규칙은 정상 동작한다.
```

즉, 도메인이나 Gateway 전체가 완전히 죽은 상태는 아니었다.

이 단계의 판단은 다음이다.

```text
Application Gateway의 HTTP 리스너와 리다이렉트 규칙은 정상 동작한다.
문제는 HTTPS 요청 또는 HTTPS 뒤쪽 Backend 연결 구간에 있을 가능성이 있다.
```

---

## 7. HTTPS 443 확인

실제 HTTPS 요청을 확인했다.

```bash
curl -vI https://meeting.ssafy.com
```

결과는 다음과 같았다.

```text
HTTP/1.1 502 Bad Gateway
Server: Microsoft-Azure-Application-Gateway/v2
```

여기서 알 수 있는 것은 다음이다.

```text
클라이언트는 HTTPS 443 포트로 접속했다.
Azure Application Gateway까지 요청이 도달했다.
Azure Application Gateway가 502를 반환했다.
```

즉, 내 브라우저가 아무 곳에도 도달하지 못한 상황은 아니다.
오히려 Gateway까지는 도달했고, Gateway가 “뒤쪽 서버에서 정상 응답을 받지 못했다”는 응답을 돌려준 상황에 가깝다.

이 단계의 판단은 다음이다.

```text
HTTPS 요청은 Gateway까지 도달한다.
장애 지점은 Gateway 뒤쪽일 가능성이 높다.
```

---

## 8. TLS 인증서 확인

TLS 인증서도 확인했다.

```bash
openssl s_client -connect meeting.ssafy.com:443 -servername meeting.ssafy.com </dev/null
```

결과에는 다음 내용이 포함되었다.

```text
Verify return code: 0 (ok)
```

이 결과는 다음을 의미한다.

```text
클라이언트 → Azure Application Gateway 구간의 TLS 인증서는 정상이다.
인증서 만료 문제 가능성은 낮다.
SNI도 정상적으로 처리된 것으로 볼 수 있다.
```

다만 이 결과로 알 수 없는 것도 있다.

```text
Application Gateway → Backend Server 구간의 TLS가 정상인지는 알 수 없다.
Backend 인증서가 Gateway에서 신뢰되는지는 알 수 없다.
Backend HTTPS 설정이 올바른지는 알 수 없다.
```

이 부분은 운영자가 Azure Portal 또는 서버 내부에서 확인해야 한다.

이 단계의 판단은 다음이다.

```text
클라이언트와 Azure Application Gateway 사이의 TLS 문제는 아니다.
```

---

## 9. Mattermost API 경로 확인

웹 첫 화면만 문제인지, API도 문제인지 확인했다.

```bash
curl -i https://meeting.ssafy.com/api/v4/system/ping
curl -i https://meeting.ssafy.com/api/v4/config/client
```

결과는 모두 다음과 같았다.

```text
HTTP/1.1 502 Bad Gateway
Server: Microsoft-Azure-Application-Gateway/v2
```

만약 `/` 경로만 502이고 API는 정상이라면, 프론트엔드 정적 파일, 특정 라우팅, 일부 upstream 문제를 의심할 수 있다.

하지만 이번에는 Mattermost API 경로도 모두 502였다.

이 단계의 판단은 다음이다.

```text
특정 화면 하나의 문제가 아니다.
Mattermost API도 Gateway를 통해 정상 접근되지 않는다.
Gateway → Backend 공통 구간 문제 가능성이 높다.
```

---

## 10. DNS 직접 지정 테스트

DNS 캐시나 DNS 응답 문제를 배제하기 위해 IP를 직접 지정했다.

```bash
curl -vk --resolve meeting.ssafy.com:443:52.231.108.127 https://meeting.ssafy.com
```

결과는 동일하게 502였다.

```text
HTTP/1.1 502 Bad Gateway
Server: Microsoft-Azure-Application-Gateway/v2
```

이 결과는 다음을 의미한다.

```text
DNS를 거치지 않고 직접 IP를 지정해도 같은 문제가 발생한다.
로컬 DNS 캐시 문제 가능성은 낮다.
DNS가 잘못된 IP를 주고 있어서 생긴 문제도 아니다.
```

이 단계의 판단은 다음이다.

```text
DNS 문제는 아니다.
해당 IP의 Azure Application Gateway 또는 그 뒤쪽 Backend 문제로 보는 것이 타당하다.
```

---

## 11. 응답 시간 확인

502가 즉시 발생하는지, 오래 기다린 뒤 발생하는지도 확인했다.

```bash
curl -sS -o /dev/null \
-w "code=%{http_code}\nremote_ip=%{remote_ip}\nconnect=%{time_connect}\ntls=%{time_appconnect}\nfirst_byte=%{time_starttransfer}\ntotal=%{time_total}\n" \
https://meeting.ssafy.com
```

결과는 다음과 같았다.

```text
code=502
remote_ip=52.231.108.127
connect=0.044214
tls=0.108993
first_byte=0.122044
total=0.122157
```

이 값은 중요하다.

```text
TCP 연결은 약 0.04초 만에 완료되었다.
TLS는 약 0.10초 만에 완료되었다.
전체 요청은 약 0.12초 만에 502로 끝났다.
```

즉, 오래 기다리다가 timeout이 발생한 것이 아니다.
Gateway가 매우 빠르게 502를 반환한 형태에 가깝다.

오래 기다린 뒤 502가 발생했다면 다음 가능성을 더 의심했을 것이다.

```text
Backend Server 응답 지연
Mattermost 서버 과부하
DB 지연
Gateway → Backend 연결 timeout
```

하지만 이번에는 빠른 502였다.

그래서 더 그럴듯한 후보는 다음이다.

```text
Application Gateway가 Backend를 이미 unhealthy로 판단하고 있을 가능성
Health Probe 실패 가능성
Backend Pool 설정 문제 가능성
Backend Port 설정 문제 가능성
NSG 또는 방화벽 차단 가능성
Host Header 설정 문제 가능성
Backend TLS 인증서 문제 가능성
```

이 단계의 판단은 다음이다.

```text
Backend가 오래 걸려 timeout 난 상황보다는,
Gateway가 Backend를 정상 대상으로 보지 못하거나 즉시 실패 처리하는 상황에 가깝다.
```

---

## 12. HTTP/1.1과 HTTP/2 비교

HTTP 프로토콜 버전에 따라 장애가 달라지는지도 확인했다.

```bash
curl -vI --http1.1 https://meeting.ssafy.com
curl -vI --http2 https://meeting.ssafy.com
```

결과는 둘 다 502였다.

이 결과는 다음을 의미한다.

```text
HTTP/1.1만의 문제도 아니다.
HTTP/2만의 문제도 아니다.
프로토콜 버전 차이로 발생한 문제일 가능성은 낮다.
```

이 단계의 판단은 다음이다.

```text
HTTP 프로토콜 협상 문제라기보다, Gateway 뒤쪽 공통 문제로 보는 것이 타당하다.
```

---

## 13. traceroute 확인

네트워크 경로를 보기 위해 `traceroute`도 사용할 수 있다.

```bash
traceroute meeting.ssafy.com
```

traceroute의 각 줄은 하나의 중간 경유지를 의미한다.

```text
1  192.168.45.1  3.650 ms  4.081 ms  4.500 ms
```

의미는 다음과 같다.

```text
1번 hop
→ 로컬 공유기 또는 게이트웨이

ms 값
→ 해당 구간까지의 왕복 응답 시간
```

중간에 다음처럼 나올 수 있다.

```text
* * *
```

이것은 반드시 장애를 의미하지 않는다.

```text
해당 장비가 traceroute 응답을 하지 않는다는 뜻이다.
클라우드, 통신사, 보안 장비는 traceroute 응답을 막는 경우가 많다.
```

이번 사례에서는 이미 `curl`로 502 응답을 받았다.
이는 HTTP 요청이 Azure Application Gateway까지 도달했고, Gateway가 직접 응답을 반환했다는 뜻이다.

따라서 traceroute가 끝까지 깔끔하게 나오지 않아도 핵심 판단에는 큰 영향을 주지 않는다.

이 단계의 판단은 다음이다.

```text
traceroute는 참고 자료이다.
이미 HTTP 502 응답을 받았으므로 Gateway까지 도달한 사실은 확인되었다.
```

---

## 14. 외부 다중 지역 체크

내 Mac이나 내 네트워크만의 문제인지 확인하기 위해 외부 다중 지역 체크도 확인했다.

예를 들면 다음과 같은 사이트를 사용할 수 있다.

```text
Check-Host
Site24x7
Host-Tracker
Uptrends
httpstatus.io
```

이번에는 외부 여러 지역에서도 모두 502가 나왔다.

이 결과는 다음을 의미한다.

```text
내 Mac만의 문제 가능성은 낮다.
내 Wi-Fi만의 문제 가능성은 낮다.
내 브라우저만의 문제 가능성은 낮다.
서비스 측 문제 가능성이 높다.
```

만약 외부 지역에서는 정상이고 내 환경에서만 502였다면 다음을 의심해야 한다.

```text
로컬 DNS 캐시
VPN
회사/학교 네트워크 프록시
방화벽
브라우저 캐시
확장 프로그램
```

하지만 이번에는 외부 다중 지역에서도 모두 502였다.

이 단계의 판단은 다음이다.

```text
클라이언트 측 문제 가능성은 매우 낮다.
```

---

## 15. Azure 상태 확인

Azure Status도 확인했다.

Azure 공개 상태가 정상이었다면 다음처럼 판단할 수 있다.

```text
Microsoft Azure 전체 장애 가능성은 낮다.
개별 Application Gateway 리소스 또는 Backend 구성 문제 가능성이 더 높다.
```

물론 Azure 공개 상태가 정상이라고 해서 개별 리소스 장애가 절대 없다는 뜻은 아니다.
정확한 상태는 운영자가 다음 항목을 확인해야 한다.

```text
Azure Service Health
Application Gateway Backend Health
Backend Pool 상태
Health Probe 결과
```

이 단계의 판단은 다음이다.

```text
Microsoft Azure 전체 장애보다는,
해당 서비스의 Application Gateway 설정 또는 Mattermost Backend 문제 가능성이 높다.
```

---

## 16. 판단 흐름 정리

이번 문제의 판단 흐름은 다음과 같다.

```text
Mattermost 채팅 전송 불가
→ 웹사이트 직접 접속
→ 502 Bad Gateway 확인
→ 응답 주체가 Microsoft-Azure-Application-Gateway/v2임을 확인
→ DNS 정상 확인
→ HTTP 80 리다이렉트 정상 확인
→ HTTPS 443 연결 정상 확인
→ TLS 인증서 정상 확인
→ Mattermost API도 502 확인
→ IP 직접 지정해도 502 확인
→ 응답 시간이 약 0.12초로 매우 짧음 확인
→ 외부 다중 지역에서도 502 확인
→ Azure 공개 상태 정상 확인
→ 클라이언트 문제 가능성 낮음
→ Gateway 뒤쪽 Backend 또는 Gateway 설정 문제 가능성 높음
```

표로 정리하면 다음과 같다.

| 확인 항목          | 결과                                     | 판단                     |
| -------------- | -------------------------------------- | ---------------------- |
| DNS            | 정상 해석                                  | DNS 문제 가능성 낮음          |
| HTTP 80        | 301 Redirect                           | HTTP 리스너 및 리다이렉트 정상    |
| HTTPS 443      | 연결 성공                                  | Gateway까지 도달 가능        |
| TLS            | Verify OK                              | 클라이언트 → Gateway TLS 정상 |
| `/` 경로         | 502                                    | 메인 요청 실패               |
| Mattermost API | 모두 502                                 | Backend 공통 문제 가능성      |
| Server Header  | Microsoft-Azure-Application-Gateway/v2 | Gateway가 502 반환        |
| 응답 시간          | 약 0.12초                                | 즉시 502에 가까움            |
| `--resolve`    | 직접 IP 지정해도 502                         | DNS 문제 가능성 낮음          |
| 외부 다중 지역       | 모두 502                                 | 클라이언트 문제 가능성 낮음        |
| Azure Status   | 정상                                     | Azure 전체 장애 가능성 낮음     |

---

## 17. 이 상황에서 알 수 있는 것

현재 정보로 알 수 있는 것은 다음이다.

```text
내 Mac 문제 가능성은 낮다.
브라우저 문제 가능성은 낮다.
DNS 문제 가능성은 낮다.
로컬 네트워크 문제 가능성은 낮다.
HTTPS 연결은 Azure Application Gateway까지 정상 도달한다.
TLS 인증서도 정상이다.
502는 Azure Application Gateway가 반환하고 있다.
Mattermost 웹 경로와 API 경로가 모두 502이다.
외부 여러 지역에서도 동일하게 502가 발생한다.
Microsoft Azure 전체 장애 정황은 강하지 않다.
```

따라서 클라이언트 측 결론은 다음과 같다.

```text
문제는 클라이언트 측보다 Azure Application Gateway 뒤쪽 Backend 구간에 있을 가능성이 높다.
```

---

## 18. 이 상황에서 알 수 없는 것

반대로 클라이언트가 알 수 없는 것도 명확하다.

```text
Mattermost 프로세스가 죽었는지
Backend VM이 꺼졌는지
Nginx 또는 Reverse Proxy가 죽었는지
DB 연결이 끊겼는지
Application Gateway Backend Health가 Unhealthy인지
Health Probe 경로가 잘못됐는지
Backend Pool IP가 잘못됐는지
Backend Port가 잘못됐는지
NSG가 Gateway → Backend 통신을 차단하는지
Host Header 설정이 잘못됐는지
Backend TLS 인증서 검증이 실패하는지
최근 배포 또는 설정 변경이 있었는지
```

이 부분은 운영자 또는 클라우드 관리자 권한이 있어야 확인할 수 있다.

즉, 클라이언트는 원인을 확정할 수 없다.
다만 다음 수준까지는 판단할 수 있다.

```text
내 문제는 아니다.
Gateway까지는 도달한다.
Gateway가 Backend로부터 정상 응답을 받지 못하고 있다.
운영자 확인이 필요하다.
```

---

## 19. 운영자가 확인해야 할 항목

운영자가 확인해야 할 항목은 다음과 같다.

```text
Application Gateway Backend Health
Health Probe 경로
Health Probe 응답 코드
Backend Pool 대상 IP 또는 FQDN
Backend Port
HTTP Settings 프로토콜
Host Header override 설정
Backend TLS 인증서
Trusted root certificate 설정
NSG 인바운드/아웃바운드 규칙
Backend VM 상태
Mattermost 프로세스 상태
Nginx 또는 Reverse Proxy 상태
Mattermost DB 연결 상태
서버 CPU, Memory, Disk 상태
최근 배포 또는 설정 변경 이력
```

Azure Application Gateway 환경에서는 특히 다음 항목을 우선 확인해야 한다.

```text
Backend Health가 Healthy인지
Unhealthy라면 Probe 실패 사유가 무엇인지
Probe 경로가 200 응답을 반환하는지
Gateway Subnet에서 Backend Port로 접근 가능한지
Backend 인증서가 Gateway에서 신뢰되는지
Host Header가 Mattermost 또는 Nginx 설정과 맞는지
```

---

## 20. 관리자에게 전달할 문장

장애를 보고할 때는 다음처럼 정리할 수 있다.

```text
Mattermost 채팅 전송 장애가 발생하여 웹사이트에 직접 접속한 결과 502 Bad Gateway가 확인되었습니다.

DNS 해석은 정상이며, meeting.ssafy.com은 mattermost.koreacentral.cloudapp.azure.com을 거쳐 52.231.108.127로 확인됩니다.
HTTP 80 요청은 정상적으로 HTTPS로 301 리다이렉트됩니다.
HTTPS 443 연결 및 TLS 인증서 검증도 정상입니다.

다만 HTTPS 요청 시 / 경로와 Mattermost API 경로인 /api/v4/system/ping, /api/v4/config/client 모두 502 Bad Gateway를 반환합니다.
응답 헤더상 Server는 Microsoft-Azure-Application-Gateway/v2입니다.
IP를 직접 지정한 --resolve 테스트에서도 동일하게 502가 발생하므로 DNS 문제 가능성은 낮습니다.
응답 시간도 약 0.12초 수준으로, 장시간 대기 후 timeout이 아니라 Application Gateway가 빠르게 502를 반환하는 형태입니다.
외부 다중 지역 체크에서도 모두 502가 재현되고, Azure 공개 상태는 정상으로 확인됩니다.

따라서 클라이언트, 브라우저, DNS, 로컬 네트워크 문제보다는 Azure Application Gateway 뒤쪽의 Backend Pool, Health Probe, Backend Port, NSG, Host Header, Backend TLS 인증서, Mattermost/Nginx/VM 상태 문제 가능성이 높습니다.
Azure Portal에서 Application Gateway Backend Health와 관련 설정 확인이 필요합니다.
```

---

## 21. 결론

이번 문제는 단순히 “Mattermost 채팅이 안 간다”에서 출발했다.

하지만 단계별로 확인하면서 범위를 좁힐 수 있었다.

```text
채팅 전송 불가
→ 웹 직접 접속 시 502
→ Gateway가 502 반환
→ DNS 정상
→ HTTP 리다이렉트 정상
→ HTTPS/TLS 정상
→ Mattermost API도 502
→ 외부 다중 지역에서도 502
→ Azure 공개 상태 정상
→ 클라이언트 문제 가능성 낮음
→ Gateway 뒤쪽 Backend 또는 Gateway 설정 문제 가능성 높음
```

최종 판단은 다음과 같다.

```text
502를 반환한 주체는 Azure Application Gateway이다.
그러나 Microsoft Azure 전체 장애라고 단정할 수는 없다.
현재 증거상으로는 해당 서비스의 Azure Application Gateway 설정 또는 Mattermost Backend 상태 문제일 가능성이 높다.
정확한 원인 확정은 운영자가 Backend Health, Health Probe, Backend Server, NSG, Host Header, Backend TLS 인증서, Mattermost/Nginx/VM 로그를 확인해야 가능하다.
```

한 줄로 정리하면 다음과 같다.

```text
클라이언트 측에서 확인 가능한 범위에서는 내 PC나 네트워크 문제가 아니라, Azure Application Gateway 뒤쪽 Backend 구간 문제로 보는 것이 타당하다.
```
