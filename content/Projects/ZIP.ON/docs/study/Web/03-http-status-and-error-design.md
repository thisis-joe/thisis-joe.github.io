---
title: 03-http-status-and-error-design
created: 2026-07-01T00:06:00+09:00
updated: 2026-07-01T00:06:00+09:00
purpose: learning
status: active
code_sync_required: false
related_area: web, http-status, error-design
read_when: 
do_not_use_as: 
  - HTTP status code와 일관된 error response 설계를 학습할 때
  - 현재 ErrorResponse 전체 명세
  - 현재 예외 매핑 테스트 기준
---

# HTTP Status와 Error Design

## 한 줄 정의

HTTP status code는 요청 결과를 숫자로 표현하는 표준이고, Error Design은 실패 응답을 팀이 일관되게 다루기 위한 약속이다.

## 자주 쓰는 status code

```text
200 OK:
조회 성공

201 Created:
생성 성공

204 No Content:
삭제 성공 후 body가 필요 없음

400 Bad Request:
요청값이 잘못됨

401 Unauthorized:
인증이 필요함

403 Forbidden:
권한이 없음

404 Not Found:
대상을 찾을 수 없음

409 Conflict:
중복 또는 상태 충돌

500 Internal Server Error:
서버 내부 오류
```

## ZIP:ON에서 생각할 예외

```text
주소 정제 실패
법정동코드 변환 실패
물건 유형 판별 실패
community post 작성자가 아님
favorite가 이미 존재함
검색어가 너무 짧음
외부 실거래 API가 실패함
```

## 공통 ErrorResponse가 필요한 이유

프론트엔드는 실패 응답이 일정해야 UI를 안정적으로 처리할 수 있다.

예시 구조:

```json
{
  "success": false,
  "message": "주소를 확인할 수 없습니다.",
  "errorCode": "ADDRESS_NOT_FOUND",
  "fieldErrors": []
}
```

## status와 body의 역할

```text
status:
HTTP 표준 관점의 큰 결과

body:
서비스가 이해할 수 있는 자세한 실패 이유
```

둘 중 하나만 믿기보다 함께 설계한다.

## 실습 미션

```text
1. 삭제 성공 시 200과 204 중 무엇을 쓸지 팀 기준을 정한다.
2. 관심 지역 중복 저장은 400인지 409인지 고민한다.
3. GlobalExceptionHandler에 들어갈 예외 종류를 적는다.
```

## 공식 출처

- [MDN - HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
- [Spring Framework - Error Responses](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html)
