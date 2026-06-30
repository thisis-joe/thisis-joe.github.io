---
title: 05-json-api-contract
created: 2026-07-01T00:06:00+09:00
updated: 2026-07-01T00:06:00+09:00
---

# JSON API Contract

## 한 줄 정의

API Contract는 프론트엔드와 백엔드가 요청과 응답의 모양을 약속하는 문서 또는 코드 기준이다.

## 왜 필요한가

프론트엔드와 백엔드가 동시에 작업하면 아래 문제가 자주 생긴다.

```text
프론트는 riskAssessment.criteria를 기대하는데 백엔드는 riskSummary만 내려준다.
백엔드는 address를 필수로 보는데 프론트는 지역 키워드만 보낸다.
응답이 배열인지 객체인지 다르게 이해한다.
에러 형식이 API마다 다르다.
```

API Contract가 있으면 이런 충돌을 줄일 수 있다.

## ZIP:ON의 공통 응답

성공 응답은 `ApiResponse`를 사용한다.

```json
{
  "success": true,
  "message": "요청이 정상 처리되었습니다.",
  "data": {}
}
```

페이지 목록 응답은 공통 wrapper 바깥에 pagination 필드를 추가하지 않고, `data` 안에 `PageResponse`를 담는다.

```json
{
  "success": true,
  "message": "요청이 정상 처리되었습니다.",
  "data": {
    "items": [],
    "page": 0,
    "size": 20,
    "totalElements": 0,
    "totalPages": 0,
    "hasNext": false
  }
}
```

실패 응답은 `ApiResponse`가 아니라 `ErrorResponse`를 사용한다.

```json
{
  "success": false,
  "status": 400,
  "code": "COMMON_400_BAD_REQUEST",
  "message": "잘못된 요청입니다.",
  "detail": "address 값이 올바르지 않습니다.",
  "path": "/api/rent-risk-diagnoses",
  "timestamp": "2026-06-26T10:30:00"
}
```

파일 다운로드처럼 JSON이 아닌 바이너리를 직접 반환하는 API는 이 공통 JSON wrapper를 사용하지 않는다.

## DTO가 Contract 역할을 한다

백엔드:

```text
RentRiskDiagnosisRequest
RentRiskDiagnosisResponse
RegionalIndicatorAnalysisRequest
RegionalIndicatorAnalysisResponse
```

프론트:

```text
rentRiskDiagnosisApi.js
regionalIndicatorAnalysisApi.js
regionApi.js
```

두 쪽 이름이 비슷하면 계약을 추적하기 쉽다.

## API Contract에 적을 것

```text
HTTP method
URL
Request params
Request body
Response body
Error response
예시 JSON
권한 필요 여부
```

## 실습 미션

```text
1. POST /api/rent-risk-diagnoses의 요청 조건과 응답 필드를 직접 적는다.
2. POST /api/regional-indicator-analyses의 요청 조건과 응답 필드를 직접 적는다.
3. PageResponse를 반환하는 endpoint와 단순 List를 반환하는 endpoint를 하나씩 찾아 차이를 적는다.
4. 데이터가 없을 때 `data`를 null로 둘지, 빈 배열/빈 PageResponse를 둘지, `dataStatuses` 또는 `indicatorStatuses`로 부족 상태를 설명할지 비교한다.
```

## 공식 출처

- [MDN - Overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)
- [Spring Framework - HTTP Message Conversion](https://docs.spring.io/spring-framework/reference/web/webmvc/message-converters.html)
