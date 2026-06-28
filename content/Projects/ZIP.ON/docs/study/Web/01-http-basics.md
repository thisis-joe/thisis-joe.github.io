---
title: 01-http-basics
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-29T05:00:06+09:00
purpose: learning
status: active
code_sync_required: false
related_area: web, http
read_when: 
do_not_use_as: 
  - HTTP request/response와 stateless 개념을 학습할 때
  - 현재 auth API 구현 명세
---

# HTTP 기본

## 한 줄 정의

HTTP는 클라이언트와 서버가 요청과 응답을 주고받기 위한 웹의 기본 프로토콜이다.

## 왜 알아야 하나

Spring Controller는 결국 HTTP 요청을 Java method로 바꾸는 계층이다. HTTP를 모르면 `@GetMapping`, `@PostMapping`, status code, CORS가 모두 외워야 하는 암호처럼 보인다.

## 기본 구조

```text
Client
-> HTTP Request
-> Server
-> HTTP Response
```

Request에는 보통 아래 정보가 있다.

```text
method
path
headers
query string
body
```

Response에는 보통 아래 정보가 있다.

```text
status code
headers
body
```

## ZIP:ON 예시

```http
POST /api/auth/login HTTP/1.1
Host: localhost:8082
```

서버는 로그인 결과를 JSON으로 응답한다.

```json
{
  "success": true,
  "message": "요청이 정상 처리되었습니다.",
  "data": {
    "accessToken": "...",
    "refreshTokenExpiresAt": "..."
  }
}
```

ZIP:ON은 refresh token 원문을 JSON에 담지 않고 `HttpOnly` cookie로 내려준다.

## HTTP는 stateless

HTTP 자체는 이전 요청을 기억하지 않는다. 로그인 상태, 장바구니, 관심 목록 같은 상태는 쿠키, 세션, 토큰, DB 등을 통해 별도로 관리한다.

## 실습 미션

```text
1. 브라우저에서 /api/health를 호출하면 request와 response에 무엇이 있을지 적는다.
2. POST /api/auth/login과 POST /api/auth/refresh의 차이를 설명한다.
3. HTTP가 stateless라는 말이 로그인 구현에 어떤 영향을 주는지 생각한다.
```

## 공식 출처

- [MDN - Overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)
