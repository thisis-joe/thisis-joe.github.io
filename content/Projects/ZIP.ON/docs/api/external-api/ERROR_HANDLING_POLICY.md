---
title: ERROR_HANDLING_POLICY
created: 2026-07-01T00:06:00+09:00
updated: 2026-07-01T00:06:00+09:00
purpose: external-api-error-handling-policy
status: active
code_sync_required: true
related_code: 
read_when: 
update_when: 
  - backend/src/main/java/com/zipon/external
  - backend/src/main/java/com/zipon/service/ExternalApiCallLogger.java
  - backend/src/main/java/com/zipon/service/ExternalApiCallLogService.java
  - backend/src/main/java/com/zipon/mapper/ExternalApiCallLogMapper.java
  - backend/src/main/java/com/zipon/domain/ExternalApiCallLogCommand.java
  - 외부 API adapter/parser 오류 처리나 사용자 data status 문구를 바꿀 때
  - 외부 호출 로그 저장 항목, key redaction, retry/fallback 정책을 수정할 때
  - 외부 API result code map, domain lookup status, 로그 필드, 사용자 오류 메시지가 바뀔 때
---

# 외부 API 에러 처리 정책

> Status: Current reference

외부 API 오류는 사용자 입력 문제, 운영 설정 문제, 제공기관 장애, 정상 빈 결과를 구분해야 한다. 외부 API의 원문 에러를 사용자에게 그대로 노출하지 않고, ZIP:ON의 `dataStatuses`, `riskSummary`, `checklist`, 관리자 로그로 변환한다.

## 에러 유형별 처리

| 에러 유형 | 외부 응답 예시 | 백엔드 예외 후보 | 재시도 여부 | 사용자 메시지 | 로그 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| 정상 | `resultCode=00`, `000`, `INFO-0` 등 | 없음 | 없음 | 확인된 정보로 표시 | 필요 시 success log |
| 빈 결과 | `totalCount=0`, `items` 없음 | 예외 아님 | 짧은 TTL 후 재조회 가능 | 조회 결과가 없어 제한 진단으로 안내 | 필요 |
| 인증키 오류 | 법정동코드 `290`, 공공데이터 `SERVICE_KEY_IS_NOT_REGISTERED_ERROR` 계열 | 설정 예외 또는 `UNAVAILABLE` | 재시도보다 관리자 확인 | 외부 API 인증 설정이 필요하다고 안내 | 필수. key 원문 저장 금지 |
| 서비스키 만료 | key expired 계열 | `UNAVAILABLE` | 관리자 조치 후 | 외부 API 인증이 만료되어 자동 조회 불가 | 필수 |
| 필수 파라미터 누락 | missing parameter 계열 | 개발 오류, validation error | 재시도 전 수정 | 주소/코드 변환이 부족해 조회 불가 | 필수 |
| 잘못된 파라미터 | invalid parameter 계열 | query validation error | 재시도 전 수정 | 주소 또는 조회 조건을 다시 확인해야 함 | 필수 |
| 서비스 접근 거부 | access denied 계열 | `UNAVAILABLE` | 설정 확인 후 | 외부 API 접근 권한 확인 필요 | 필수 |
| 트래픽 제한 | quota/rate limit 계열 | `UNAVAILABLE` 또는 retryable error | backoff 후 가능 | 잠시 후 다시 시도하거나 직접 확인 안내 | 필수 |
| 서비스 일시 장애 | 제공기관 HTTP 5xx, DB error | retryable external error | 제한적 재시도 가능 | 외부 기관 응답 실패로 제한 진단 | 필수 |
| 타임아웃 | connect/read timeout | retryable external error | 짧은 재시도 또는 circuit | 외부 조회가 지연되어 제한 진단 | 필수 |
| HTTP 4xx | bad request, unauthorized 등 | client/config error | 보통 재시도 안 함 | 조회 조건 또는 설정 확인 필요 | 필수 |
| 응답 파싱 실패 | XML/JSON 구조 불일치 | parser error | 재시도보다 parser 확인 | 외부 응답 해석 실패로 제한 진단 | 필수. raw body 저장은 redaction 후 후보 |
| 단건/배열 구조 불일치 | `items.item` 객체/배열 차이 | parser normalization error | parser 수정 후 | 사용자에게는 외부 응답 해석 실패 | 필수 |
| XML/JSON 차이 | `_type=json` 구조 다름 | parser error | 형식 고정 후 | 외부 응답 형식 확인 필요 | 필수 |
| TLS/프로토콜 불일치 | 문서는 `http`, 호출은 `https` 실패 또는 반대 | config error | base URL 수정 후 | 자동 조회 설정 확인 필요 | 필수 |
| VWorld Geocoder 필수값 누락 | `PARAM_REQUIRED` | request assembly error | 재시도 전 수정 | 주소 좌표 변환 요청값 확인 필요 | 필수 |
| VWorld Geocoder key 오류 | `INVALID_KEY`, `INCORRECT_KEY`, `UNAVAILABLE_KEY` | `UNAVAILABLE` | 관리자 조치 후 | VWorld 인증 설정 확인 필요 | 필수 |
| VWorld Geocoder 사용량 초과 | `OVER_REQUEST_LIMIT` | rate limit error | 당일 재시도 제한 | 좌표 변환 사용량 초과로 제한 진단 | 필수 |
| VWorld 읍면동 경계 빈 결과 | `status=NOT_FOUND`, 빈 `features` | 예외 아님 | 후속 재조회 가능 | 가능 지역 경계가 없어 지도 표시를 생략 | 필요 |
| VWorld 읍면동 경계 key/권한 오류 | `INVALID_KEY`, `INCORRECT_KEY`, `UNAVAILABLE_KEY` | `UNAVAILABLE` | 관리자 조치 후 | 가능 지역 경계 자동 표시가 제한됨 | 필수 |
| VWorld 읍면동 경계 parser 오류 | GeoJSON 구조 불일치, 좌표 파싱 실패 | parser error | parser 수정 후 | 해당 가능 지역은 경계 없이 처리. 원형 fallback 금지 | 필수 |
| VWorld 공시가격 빈 결과 | `status=NOT_FOUND`, `totalCount=0` | 예외 아님 | 조건 보완 또는 최신연도 fallback 확인 | 공시가격 후보가 없다고 안내. 안전 신호로 해석 금지 | 필요 |
| VWorld 공시가격 key/권한 오류 | `resultCode=INCORRECT_KEY` 등 | `ERROR` 또는 운영 설정 확인 | 관리자 조치 후 | VWorld 공시가격 인증 또는 API 권한 확인 필요 | 필수 |
| Juso 직접검색 정상 | `errorCode=0` | 없음 | 없음 | 주소 후보 표시 | 필요 |
| Juso 직접검색 빈 결과 | `errorCode=0`, `totalCount=0` | 예외 아님 | 검색어 보완 후 가능 | 검색된 주소 후보가 없다고 안내 | 필요 |
| Juso 직접검색 key 오류/만료 | `E0001`, `E0014` | `UNAVAILABLE` | 관리자 조치 후 | Juso 주소검색 인증 설정 확인 필요 | 필수. key 원문 저장 금지 |
| Juso 직접검색 검색어 오류 | `E0005`, `E0006`, `E0008`~`E0013`, `E0015` | `INVALID_REQUEST` | 검색어 보완 후 가능 | 주소 검색어를 더 구체적으로 입력하도록 안내 | 필요 |
| Juso 직접검색 시스템 오류 | `-999` | `ERROR` | 제공기관 상태 확인 후 | Juso 주소검색 응답 실패 안내 | 필수 |
| 한국부동산원 R-ONE 정상 | `INFO 000` | 없음 | 없음 | 과거 지표 분석에 사용 | 필요 시 success log |
| 한국부동산원 R-ONE 빈 결과 | `INFO 200` | 예외 아님 | 조건 완화 후 가능 | 해당 기간/지역/항목의 공개 통계가 부족하다고 안내 | 필요 |
| 한국부동산원 R-ONE key 제한 | `INFO 300`, `ERROR 290` | `UNAVAILABLE` | 관리자 조치 후 | 한국부동산원 통계 인증 설정 확인 필요 | 필수. `KEY` 원문 저장 금지 |
| 한국부동산원 R-ONE 필수값 누락 | `ERROR 300` | request assembly error | 재시도 전 수정 | 조회 조건 조립 오류로 과거 지표 분석 불가 | 필수 |
| 한국부동산원 R-ONE service/path 오류 | `ERROR 310` | endpoint/config error | 재시도 전 수정 | 외부 통계 조회 설정 확인 필요 | 필수 |
| 한국부동산원 R-ONE paging 오류 | `ERROR 333`, `ERROR 336` | request assembly error | `pIndex`, `pSize` 수정 후 | 통계 조회 조건 조정 필요 | 필수 |
| 한국부동산원 R-ONE traffic 초과 | `ERROR 337` | rate limit error | 당일 또는 backoff 후 | 통계 조회량 초과로 제한 분석 | 필수 |
| 한국부동산원 R-ONE 제공기관 장애 | `ERROR 500`, `ERROR 600`, `ERROR 601` | retryable external error | 제한적 재시도 가능 | 제공기관 응답 실패로 제한 분석 | 필수 |

## 사용자 메시지 원칙

- 사용자가 고칠 수 있는 문제: 주소 재검색, 동/호/번지 보완, 계약 목적/금액 입력 보완을 안내한다.
- 운영자가 고칠 문제: 인증키, base URL, timeout, traffic limit, parser 오류는 관리자 확인 대상으로 분리한다.
- 제공기관 문제: "외부 공공데이터 조회가 지연되어 제한 진단"처럼 표현한다.
- 빈 결과: "데이터가 없으므로 안전하다"가 아니라 "최근 거래 또는 공공데이터가 부족해 직접 확인 필요"로 표현한다.

## 관리자 로그 원칙

`external_api_call_logs`에는 아래 값만 저장한다.

```text
provider
apiName
endpointPath
serviceKey 없는 requestSummary
resultStatus
httpStatusCode
durationMillis
errorMessage
createdAt
```

저장하지 않는다.

```text
DATA_GO_KR_SERVICE_KEY
ServiceKey
serviceKey
VWORLD_API_KEY
JUSO_ADDRESS_CONFIRM_KEY
JUSO_ADDRESS_SEARCH_KEY
KAB_R_ONE_API_KEY
원본 등기부등본/계약서/개인정보
```

## 공통 status 매핑 후보

| 외부 상황 | domain lookup status 후보 | 화면 상태 후보 |
| --- | --- | --- |
| 성공 + 데이터 있음 | `FOUND`, `SUCCESS` | `success` |
| 성공 + 후보 여러 개 | `AMBIGUOUS` | `ambiguous` |
| 성공 + 데이터 없음 | `NOT_FOUND`, `EMPTY` | `empty` |
| key 없음/설정 안 됨 | `UNAVAILABLE`, `NOT_CONFIGURED` | `unavailable` |
| HTTP/parser/timeout 오류 | `ERROR` | `error` |

## 테스트 기준

외부 API adapter를 추가할 때 최소한 아래를 테스트한다.

- service key가 비어 있으면 실제 HTTP 호출을 하지 않는가?
- service key가 한 번만 인코딩되는가?
- 필수 query parameter가 빠지지 않는가?
- `totalCount=0`을 오류가 아닌 빈 결과로 처리하는가?
- `items.item` 단건과 배열을 모두 처리하는가?
- result code 오류를 `ERROR` 또는 `UNAVAILABLE`로 구분하는가?
- parser 실패 로그에 service key나 원본 민감정보가 남지 않는가?

## 확인 필요

- 공공데이터 API별 `resultCode` 값 체계가 서로 다르므로 새 API 추가 시 code map을 이 문서에 추가해야 한다.
- retry/circuit breaker를 도입할 경우 Resilience4j 또는 Spring Retry 도입 여부를 별도 decision note로 남겨야 한다.

## Related documents

- [외부 API 설정과 data.go.kr 키 관리](/docs/api/EXTERNAL_API_CONFIGURATION.md)
- [외부 API 데이터 저장과 캐시 정책](/docs/api/external-api/DATA_STORAGE_AND_CACHE_POLICY.md)
- [과거 지표 분석과 정확 주소 위험진단 MVP API 호출 전략](/docs/api/API_CALL_FLOW.md)
