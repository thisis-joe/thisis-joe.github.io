---
title: 12-dto-validation-error-response
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-29T05:00:06+09:00
---

# DTO, Validation, Error Response

## 한 줄 정의

DTO는 API 경계에서 오가는 데이터 모양이고, Validation은 들어온 값이 유효한지 확인하는 과정이며, Error Response는 실패를 일관된 형식으로 돌려주는 약속이다.

## DTO가 필요한 이유

Request DTO:

```text
클라이언트가 서버에 보내는 값
검색 조건
생성/수정 요청값
검증 annotation 후보
```

Response DTO:

```text
서버가 클라이언트에 보내는 값
화면에 필요한 데이터
domain object와 DB 구조를 숨기는 API 계약
```

## Validation이 필요한 이유

잘못된 요청은 Service 깊숙이 들어가기 전에 막는 것이 좋다.

예:

```text
검색어가 너무 짧다.
전세 보증금이 음수다.
주소가 비어 있다.
게시글 제목이 비어 있다.
가격 최소값이 최대값보다 크다.
favoriteId가 없다.
```

## ZIP:ON에서 검증 후보

```text
SearchRequest.searchKeyword:
빈 문자열 방지, 최소 길이

CommunityPostCreateRequest.title:
필수값, 최대 길이

FavoriteCreateRequest:
대상 타입과 대상 ID 필수

RegionalIndicatorAnalysisRequest:
지역·유형 키워드, 계약/거래 목적 힌트

RentRiskDiagnosisRequest:
주소, 보증금, 계약 목적 필수
```

## Error Response가 필요한 이유

API마다 실패 응답이 다르면 프론트엔드에서 처리하기 어렵다.

ZIP:ON의 현재 실패 응답은 `ErrorResponse` record가 담당한다.

```text
success: false
status: HTTP status code
code: ErrorCode enum name
message: 공통 오류 메시지
detail: 구체 원인 또는 사용자 안내 문장
path: 요청 URI
timestamp: 오류 응답 생성 시각
```

성공 응답은 `ApiResponse`, 실패 응답은 `ErrorResponse`를 사용한다.
두 응답을 일부러 분리해 두면 프론트엔드가 `success` 값과 HTTP status를 함께 보고 화면 상태를 안정적으로 결정할 수 있다.

현재 코드에서 읽을 파일:

```text
backend/src/main/java/com/zipon/common/ApiResponse.java
backend/src/main/java/com/zipon/exception/ErrorResponse.java
backend/src/main/java/com/zipon/exception/ErrorCode.java
backend/src/main/java/com/zipon/exception/BusinessException.java
backend/src/main/java/com/zipon/exception/GlobalExceptionHandler.java
```

`GlobalExceptionHandler`는 Controller 안쪽에서 발생한 아래 예외를 공통 실패 응답으로 바꾼다.

```text
BusinessException 계열
ConflictException
NotFoundException
ForbiddenException
MethodArgumentNotValidException
MethodArgumentTypeMismatchException
AuthenticationException
RuntimeException fallback
```

Spring Security filter chain에서 발생하는 401/403은 Controller까지 도달하지 않을 수 있다.
그래서 JWT 인증/인가 실패는 아래 handler가 같은 `ErrorResponse` 구조로 처리한다.

```text
backend/src/main/java/com/zipon/config/JwtAuthenticationEntryPoint.java
backend/src/main/java/com/zipon/config/JwtAccessDeniedHandler.java
```

Bean Validation 실패는 지금 첫 번째 field error만 `detail`에 담는다.
현재 응답에는 `fieldErrors` 배열이 없으므로, 여러 필드 오류를 화면별로 자세히 보여줘야 하는 시점에 `ErrorResponse` 계약을 다시 설계해야 한다.

## 실습 미션

```text
1. CommonErrorResponseIntegrationTest에서 401, 중복 회원가입 충돌 응답을 확인한다.
2. CommunityPostCreateRequest와 RentRiskDiagnosisRequest의 Bean Validation annotation을 비교한다.
3. fieldErrors 배열이 필요해지는 화면 요구사항을 하나 가정하고 ErrorResponse 변경 범위를 적어 본다.
4. Security filter chain의 401/403과 Controller 내부 BusinessException의 차이를 설명해 본다.
```

## 공식 출처

- [Spring Framework - Java Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
- [Spring Framework - Controller Advice](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-advice.html)
- [Spring Framework - Error Responses](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html)
