---
title: 세션,JWT는 저장방식이며, 토큰은 값이며, 그리고 쿠키는 운반수단이다.
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-24T05:00:07+09:00
---

쿠키
- 브라우저가 값을 저장하고 자동으로 보내는 방식
토큰
- 사용자를 증명하는 문자열

# 핵심

JWT
- 매 요청마다 토큰을 검증해서 Authentication을 다시 만든다.
- 로그인 요청은 “토큰을 발급받기 위한 요청”이고,
- 로그인 이후에는 “이미 발급받은 토큰으로 접근 요청”이다.

세션
- 매 요청마다 Session ID로 서버 세션을 찾아 SecurityContext를 복원한다.

# 표

| 구분             | JWT 방식                               | 세션 방식                    |
| -------------- | ------------------------------------ | ------------------------ |
| 로그인 성공 후       | JWT 발급                               | 서버 세션에 인증 정보 저장          |
| 클라이언트가 들고 있는 것 | access token                         | session id cookie        |
| 이후 요청에서 보내는 것  | `Authorization: Bearer access-token` | `Cookie: JSESSIONID=...` |
| 서버가 하는 일       | JWT 검증 후 Authentication 재구성          | 세션에서 SecurityContext 복원  |
| 상태 저장 위치       | 주로 클라이언트 토큰                          | 서버 HttpSession           |


# 흐름
## 세션
```
[로그인 요청]
username/password 제출
        ↓
검증 성공
        ↓
서버가 SecurityContext를 HttpSession에 저장
        ↓
클라이언트에게 Session ID 쿠키 발급
예: Set-Cookie: JSESSIONID=...
```

```
[로그인 이후 보호 API 요청]
브라우저가 Session ID 쿠키 자동 전송
예: Cookie: JSESSIONID=...
        ↓
서버가 Session ID로 HttpSession 조회
        ↓
세션에 저장된 SecurityContext 복원
        ↓
Authentication을 SecurityContextHolder에 올림
        ↓
AuthorizationFilter 권한 판단
        ↓
Controller 도착
```

## JWT
```
[로그인 요청]
username/password 제출
        ↓
검증 성공
        ↓
JWT 발급
```

```
[로그인 이후 API 요청]
Authorization: Bearer access-token 제출
        ↓
JWT 검증
        ↓
Authentication 재구성
        ↓
권한 판단
        ↓
Controller 도착
```