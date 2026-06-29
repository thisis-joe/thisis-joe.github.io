---
title: BACKEND_RESPONSE_CONTRACT_2026_06_23
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-30T05:00:06+09:00
purpose: backend-response-contract
status: active
code_sync_required: true
related_code: 
read_when: 
update_when: 
  - backend/src/main/java/com/zipon/common/ApiResponse.java
  - backend/src/main/java/com/zipon/exception/ErrorResponse.java
  - backend/src/main/java/com/zipon/exception/GlobalExceptionHandler.java
  - backend/src/main/java/com/zipon/security/JwtAuthenticationEntryPoint.java
  - backend/src/main/java/com/zipon/security/JwtAccessDeniedHandler.java
  - backend/src/main/java/com/zipon/domain/DataFallbackStatus.java
  - backend/src/main/java/com/zipon/dto/response/RentRiskDiagnosisResponse.java
  - frontend/src/api/axiosInstance.js
  - 공통 성공/오류 응답, 401/403, 위험진단 fallback 표시 계약을 수정할 때
  - 프론트엔드가 백엔드 응답을 해석하는 방식을 바꿀 때
  - ApiResponse, ErrorResponse, ErrorCode, DataFallbackStatus, RentRiskDiagnosisResponse field가 바뀔 때
---

# 백엔드 응답 계약: 오류 코드와 가격 데이터 기간 fallback

> Status: Implemented on 2026-06-23

이 문서는 프론트엔드가 백엔드 응답을 해석할 때 필요한 신규 계약을 정리한다. 핵심은 두 가지다. 첫째, 오류 응답은 `code` 중심으로 분기한다. 둘째, 가격성 데이터가 요청 기간과 정확히 맞지 않을 때 백엔드는 `dataBoundaries`로 fallback 상태를 명시한다.

## 공통 성공 응답

대표 코드:

```text
backend/src/main/java/com/zipon/common/ApiResponse.java
```

일반 JSON API 성공 응답은 `ApiResponse<T>`로 감싼다.

```json
{
  "success": true,
  "message": "요청이 정상 처리되었습니다.",
  "data": {}
}
```

성공 응답 규칙:

```text
ApiResponse.success(data) -> data가 있는 성공 응답
ApiResponse.ok()          -> 삭제/상태 변경처럼 별도 data가 없는 성공 응답
ApiResponse.empty()       -> 호환/빈 응답 계약에서 data=null과 별도 message 사용
```

파일 다운로드와 이미지 조회처럼 binary `Resource`를 직접 내려주는 API는 `ApiResponse`를 사용하지 않는다.

## 공통 오류 응답

대표 코드:

```text
backend/src/main/java/com/zipon/exception/ErrorCode.java
backend/src/main/java/com/zipon/exception/ErrorResponse.java
backend/src/main/java/com/zipon/exception/GlobalExceptionHandler.java
backend/src/main/java/com/zipon/security/JwtAuthenticationEntryPoint.java
backend/src/main/java/com/zipon/security/JwtAccessDeniedHandler.java
```

응답 예시:

```json
{
  "success": false,
  "status": 401,
  "code": "AUTH_401_TOKEN_MISSING",
  "message": "인증이 필요합니다.",
  "detail": "Authorization bearer token이 필요합니다.",
  "path": "/api/users/me",
  "timestamp": "2026-06-23T15:00:00"
}
```

프론트엔드 규칙:

```text
분기 기준: code
사용자 표시: message + 필요한 경우 detail
로그/디버깅: status, path, timestamp
```

`401`은 인증이 없거나 token/credential이 유효하지 않은 경우다. `403`은 로그인은 되었지만 해당 API에 필요한 authority가 없는 경우다.

## 가격 데이터 기간 fallback 응답

대표 코드:

```text
backend/src/main/java/com/zipon/domain/DataFallbackStatus.java
backend/src/main/java/com/zipon/domain/BoundaryFallbackResult.java
backend/src/main/java/com/zipon/service/TemporalBoundaryFallbackPolicy.java
backend/src/main/java/com/zipon/service/LeaseRiskDataBoundaryService.java
backend/src/main/java/com/zipon/dto/response/RentRiskDiagnosisResponse.java
```

`RentRiskDiagnosisResponse.dataBoundaries[]`는 백엔드가 어떤 기간의 가격성 데이터를 실제로 사용했는지 설명한다.

응답 예시:

```json
{
  "key": "rent-transaction",
  "sourceName": "전월세 실거래가",
  "requestedPeriodStart": "2026-06-01",
  "requestedPeriodEnd": "2026-06-30",
  "effectivePeriodStart": "2026-05-01",
  "effectivePeriodEnd": "2026-05-31",
  "availablePeriodStart": "2024-01-01",
  "availablePeriodEnd": "2026-05-31",
  "matchedPeriod": "2026-05",
  "dataAsOf": "2026-05-31",
  "displayPeriodLabel": "2026-05",
  "fallbackStatus": "LATEST_AVAILABLE_USED",
  "fallbackReason": "요청 기간 이후 데이터가 아직 공개되지 않아 최신 공개 데이터를 사용했습니다.",
  "userDisplayMessage": "최신 공개 전월세 실거래가 기준으로 해석했습니다.",
  "confidenceLevel": "MEDIUM",
  "sourceUpdatedAt": "2026-06-01T00:00:00",
  "sourceCollectedAt": "2026-06-23T00:00:00"
}
```

지원 상태:

```text
EXACT_MATCH
LATEST_AVAILABLE_USED
OLDEST_AVAILABLE_USED
REQUEST_AFTER_AVAILABLE_MAX
REQUEST_BEFORE_AVAILABLE_MIN
PARTIAL_RANGE_USED
NO_DATA
COMPARABLE_EXPANDED
EXTERNAL_API_EMPTY
EXTERNAL_API_ERROR
CACHE_USED
STALE_CACHE_USED
```

표시 규칙:

```text
EXACT_MATCH                  -> 일반 중립 표시
LATEST_AVAILABLE_USED        -> displayPeriodLabel과 fallback 안내 표시
OLDEST_AVAILABLE_USED        -> 요청 기간이 제공 데이터보다 과거임을 표시
REQUEST_AFTER_AVAILABLE_MAX  -> 요청 기간이 제공 데이터 최신 범위보다 뒤임을 표시
REQUEST_BEFORE_AVAILABLE_MIN -> 요청 기간이 제공 데이터 최저 범위보다 앞임을 표시
PARTIAL_RANGE_USED           -> 요청 범위 중 일부 기간만 사용했음을 표시
NO_DATA                      -> 가격 문장을 추정하지 말고 직접 확인 안내 표시
COMPARABLE_EXPANDED          -> 정확히 유사한 비교군이 부족해 비교 범위를 넓혔음을 표시
EXTERNAL_API_EMPTY           -> 외부 API가 정상 응답했지만 데이터가 없었음을 표시
EXTERNAL_API_ERROR           -> 외부 API 호출/파싱 오류로 제한 진단임을 표시
CACHE_USED                   -> 캐시 또는 저장 snapshot을 사용했음을 표시
STALE_CACHE_USED             -> 최신성이 낮은 캐시/저장 snapshot을 제한 근거로 사용했음을 표시
```

학습 포인트:

```text
백엔드는 "가격을 확인했다"라고 단정하지 않는다.
백엔드는 사용한 데이터의 실제 기간과 confidenceLevel을 함께 내려서 프론트가 과신하지 않게 만든다.
```

## 위험진단 계약 전 판단 응답

정확 주소 전세·월세 위험진단의 `RentRiskDiagnosisResponse`는 기존 `riskSummary`, `checklist`, `nextActions`, `riskAssessment`를 유지하면서 결과 화면 상단 판단용 필드를 추가로 내려준다. 이 필드는 계약 가능 여부를 확정하는 값이 아니라, 사용자가 계약 전 어떤 확인을 먼저 해야 하는지 정렬하기 위한 화면 계약이다.

대표 코드:

```text
backend/src/main/java/com/zipon/dto/response/RentRiskDiagnosisResponse.java
backend/src/main/java/com/zipon/service/LeaseRiskDiagnosisDecisionSummaryService.java
backend/src/main/java/com/zipon/service/RentRiskDiagnosisService.java
frontend/src/components/home/LeaseRiskDiagnosisResult.vue
```

추가 필드:

```json
{
  "decisionSummary": {
    "statusCode": "CONDITIONAL_CAUTION",
    "label": "조건부 주의",
    "title": "계약 전 확인 조건이 남아 있습니다",
    "summary": "일부 근거는 확인됐지만 등기부등본, 선순위 임차인, 건축물대장 원본, 현장 상태 확인 전에는 안전하다고 볼 수 없습니다.",
    "dataConfidenceLabel": "일부 핵심자료 확인됨",
    "primaryAction": "등기부등본을 열람해 갑구와 을구의 권리관계를 확인하세요.",
    "cautionMessage": "ZIP:ON은 계약 가능 여부를 확정하지 않고, 계약 전 확인해야 할 위험 신호와 다음 행동을 정리합니다."
  },
  "topRiskFindings": [
    {
      "category": "money",
      "severity": "주의 필요",
      "title": "보증금·월세 안전성",
      "evidence": "입력 보증금 12000만 원은 조회된 전월세 보증금 대표값 10000만 원 대비 약 120.0%입니다.",
      "limitation": "실거래가와 공시가격은 과거·공시 기준 자료이며 현재 호가, 권리관계, 선순위 보증금을 대체하지 않습니다.",
      "action": "보증금, 월세, 관리비, 보증보험 가능 여부를 계약 전 다시 확인하세요."
    }
  ],
  "confirmationMatrix": {
    "confirmed": [],
    "caution": [],
    "required": []
  }
}
```

`decisionSummary.statusCode` 표시 규칙:

| statusCode | 사용자 표시 | 의미 |
|---|---|---|
| `DOCUMENT_CHECK_REQUIRED` | 자료 기준 검토 가능 | 자동 산정상 큰 위험 신호는 제한적이지만 등기·현장 확인은 남아 있음 |
| `CONDITIONAL_CAUTION` | 조건부 주의 | 일부 근거는 있으나 계약 전 확인 조건이 중요함 |
| `STOP_BEFORE_CONTRACT` | 계약 전 중단 검토 필요 | 전문가 검토 전 계약 진행을 보류해야 할 수준의 위험 신호가 있음 |
| `JUDGMENT_HOLD` | 판단 보류 | 핵심 데이터가 부족해 위험 자체보다 판단 신뢰도가 낮음 |

프론트엔드 규칙:

```text
1. decisionSummary가 있으면 결과 화면 최상단 판단에 사용한다.
2. decisionSummary가 없으면 기존 riskSummary로 fallback한다.
3. topRiskFindings가 있으면 핵심 위험 신호 3개로 사용한다.
4. topRiskFindings가 없으면 riskSummary.reasons와 checklist로 기존 방식 fallback을 만든다.
5. confirmationMatrix가 있으면 확인됨/주의 필요/직접 확인 필요를 세 열로 표시한다.
6. confirmationMatrix가 없으면 dataStatuses와 checklist로 fallback한다.
7. riskAssessment는 상세 산정 근거로 표시하고, 화면 최상단 계약 판단을 대체하지 않는다.
```

학습 포인트:

```text
riskGrade는 점수 산정 결과이고, decisionSummary는 사용자의 계약 전 행동 순서를 정리하는 화면 계약이다.
데이터가 부족한 경우를 위험 확정처럼 보이면 안 된다.
등기부등본, 선순위 임차인, 보증보험, 실제 하자는 직접 확인 필요 상태로 남긴다.
```
