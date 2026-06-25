---
title: README
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-26T05:00:07+09:00
purpose: external-api-implementation-rule
status: active
code_sync_required: true
related_code: 
read_when: 
update_when: 
  - backend/src/main/java/com/zipon/external
  - backend/src/main/java/com/zipon/service/LeaseRiskExternalDataLookupService.java
  - backend/src/main/java/com/zipon/service/LeaseRiskTransactionEvidenceService.java
  - backend/src/main/java/com/zipon/service/ExternalDataCollectionService.java
  - backend/src/main/java/com/zipon/service/KabROneSyncService.java
  - backend/src/main/java/com/zipon/mapper
  - backend/src/main/resources/db/migration
  - 외부 공공데이터 API adapter, parser, seed, scheduler, DB snapshot을 수정할 때
  - 정확 주소 위험진단이나 지역·유형 과거 지표 분석의 데이터 조합을 바꿀 때
  - 외부 API 종류, 호출 순서, 저장/캐시 정책, 필드 매핑, 오류 처리 방식이 바뀔 때
---

# 외부 API 구현 기준 문서

> Status: Current reference

이 폴더는 ZIP:ON이 사용하는 공공데이터와 외부 OpenAPI 명세를 공식 `docs/api` 체계 안에서 관리한다. 목적은 API 원문을 보관하는 것뿐 아니라, 후속 구현자가 주소 변환, 법정동코드 매핑, DB 저장, Redis 캐시, API 조합, 위험도 계산, 체크리스트 생성을 같은 기준으로 판단하게 하는 것이다.

ZIP:ON은 외부 API 결과를 그대로 보여주는 서비스가 아니다. 사용자의 계약 목적과 물건 정체를 먼저 확인한 뒤, 공공데이터를 위험 문장과 계약 전 확인 항목으로 바꾼다.

현재 구현은 `backend/src/main/java/com/zipon/external`의 adapter/parser, `service`의 lookup/sync/scheduler, `mapper`의 DB-first snapshot과 read model을 함께 사용한다. 문서를 고칠 때는 외부 API 원문 명세뿐 아니라 현재 코드의 저장 경계와 fallback 경계도 같이 확인한다.

## 반드시 읽는 순서

외부 API 구현 전에는 단일 API 명세만 보지 말고 아래 순서로 확인한다.

```text
ADDRESS_CODE_FLOW
-> API_DOMAIN_MAP
-> API_CALL_STRATEGY
-> DATA_STORAGE_AND_CACHE_POLICY
-> API_COMBINATION_MATRIX
-> FIELD_MAPPING_DICTIONARY
-> ERROR_HANDLING_POLICY
-> DATA_USAGE_AND_INSIGHT_PLAN
-> 개별 API specs
```

| 순서 | 문서 | 역할 |
| ---: | --- | --- |
| 1 | [ADDRESS_CODE_FLOW.md](/docs/api/external-api/ADDRESS_CODE_FLOW.md) | 사용자 주소를 법정동코드, 시군구코드, 본번, 부번, 좌표 후보로 바꾸는 기준 |
| 2 | [API_DOMAIN_MAP.md](/docs/api/external-api/API_DOMAIN_MAP.md) | ZIP:ON 기능 영역별로 어떤 API를 쓰는지 매핑 |
| 3 | [API_CALL_STRATEGY.md](/docs/api/external-api/API_CALL_STRATEGY.md) | 주소 입력 직후 전체 API를 호출하지 않는 gate 순서 |
| 4 | [DATA_STORAGE_AND_CACHE_POLICY.md](/docs/api/external-api/DATA_STORAGE_AND_CACHE_POLICY.md) | DB 저장, Redis 캐시, 실시간 호출, 원문 보존 판단 기준 |
| 5 | [API_COMBINATION_MATRIX.md](/docs/api/external-api/API_COMBINATION_MATRIX.md) | API 간 조합 키와 위험도 계산 후보 |
| 6 | [FIELD_MAPPING_DICTIONARY.md](/docs/api/external-api/FIELD_MAPPING_DICTIONARY.md) | 외부 필드와 ZIP:ON 내부 도메인 필드 후보 매핑 |
| 7 | [ERROR_HANDLING_POLICY.md](/docs/api/external-api/ERROR_HANDLING_POLICY.md) | 인증키 오류, 빈 결과, timeout, parser 오류 처리 기준 |
| 8 | [DATA_USAGE_AND_INSIGHT_PLAN.md](/docs/api/external-api/DATA_USAGE_AND_INSIGHT_PLAN.md) | API 호출 결과를 무엇으로 저장하고 어떤 위험 문장/통찰로 바꿀지 정리 |
| 9 | [INDEX.md](/docs/api/external-api/INDEX.md)와 [specs/](/docs/api/external-api/specs/) | 보존된 상세 명세와 원문별 확인 필요 사항 |
| 10 | [IMPLEMENTATION_BACKLOG.md](/docs/api/external-api/IMPLEMENTATION_BACKLOG.md) | 의존관계 기준 구현 순서 |

## 상세 API 명세 위치

| 원본 파일 | 보존 파일 |
| --- | --- |
| `행정안전부_행정표준코드_법정동코드_API_구현명세.md` | [legal-dong-code-api.md](/docs/api/external-api/specs/legal-dong-code-api.md) |
| `CODEX_BUILDING_HUB_OPENAPI_IMPLEMENTATION_SPEC.md` | [building-hub-openapi-implementation-spec.md](/docs/api/external-api/specs/building-hub-openapi-implementation-spec.md) |
| `zipon_external_api_spec_for_codex.md` | [real-estate-transaction-api-spec.md](/docs/api/external-api/specs/real-estate-transaction-api-spec.md) |
| `AptIdInfoSvc_공동주택_단지_식별정보_API_구현명세.md` | [apartment-complex-identification-api.md](/docs/api/external-api/specs/apartment-complex-identification-api.md) |
| 사용자 제공 VWorld 공시가격/GIS 정보 | [vworld-public-price-and-gis-api.md](/docs/api/external-api/specs/vworld-public-price-and-gis-api.md) |
| 사용자 제공 Juso 주소검색 팝업/직접검색 정보 | [juso-address-search-api.md](/docs/api/external-api/specs/juso-address-search-api.md) |
| 사용자 제공 한국부동산원 R-ONE 통계 OpenAPI XLS | [kab-r-one-statistics-api.md](/docs/api/external-api/specs/kab-r-one-statistics-api.md) |

## 외부 API 연동 기본 흐름

```text
사용자 목적 확인
-> 사용자 주소 입력
-> 주소 정제와 법정동코드 변환
-> 시군구코드, 본번, 부번, 산 여부 분리
-> 건축물/토지 존재와 물건 정체 판별
-> 목적별 후행 API 선택
-> 실거래가, 공시가격, 건축물, 토지, 생활/환경 데이터 조합
-> 지역/유형 과거 지표 분석이 필요하면 한국부동산원 R-ONE 통계 조회
-> 자동 확정 금지 영역 분리
-> 위험 문장과 계약 전 체크리스트 생성
```

## 현재 구현 코드 지도

| 영역 | 주요 코드 |
| --- | --- |
| Juso 주소 검색 | `JusoAddressSearchApiClient`, `JusoAddressSearchService`, `JusoAddressPopupPageRenderer` |
| 법정동코드 | `DataGoKrLegalDongCodeApiClient`, `LegalDongCodeSyncService`, `LegalDongCodeMapper`, `MyBatisLegalDongCodeCatalog` |
| 건축물대장 | `DataGoKrBuildingRegisterApiClient`, `BuildingRegisterSnapshotConverter`, `LeaseRiskBuildingRegisterLookupService`, `BuildingRegisterTitleSnapshotStore` |
| 실거래가 | `DataGoKrRentTransactionApiClient`, `DataGoKrSaleTransactionApiClient`, `TransactionApiSelector`, `LeaseRiskTransactionEvidenceService`, `RealEstateTransactionFactStore` |
| 공시가격 | `VWorldPublicPriceApiClient`, `PublicPriceSnapshotStore`, `PublicPriceSeedService`, `VWorldPublicPriceSyncTargetMapper` |
| 좌표/경계 | `VWorldGeocodingApiClient`, `VWorldLegalDongBoundaryApiClient`, map diagnosis services |
| R-ONE 통계 | `KabROneStatisticsApiClient`, `KabROneSyncService`, `MarketIndicatorSyncService`, `RegionalIndicatorAnalysisService` |
| 외부 호출 운영 | `ExternalApiCallLogger`, `ExternalApiHealthCheckService`, `ExternalDataRefreshSchedulerService`, `AdminExternalDataStatusService` |

## 금지사항

- 프론트엔드에서 `serviceKey`, `ServiceKey`, VWorld key, Juso 승인키를 직접 노출하지 않는다.
- 주소 입력 직후 모든 외부 API를 병렬 호출하지 않는다.
- 실거래가 API를 물건 유형 판별 전에 호출하지 않는다.
- 한국부동산원 R-ONE 통계 API를 현재 매물 목록 API처럼 사용하지 않는다.
- API 원문 응답을 사용자에게 그대로 덤프하지 않는다.
- 외부 API 하나만으로 계약 안전성, 등기 권리관계, 선순위 임차인, 보증보험 가능성, 위반건축물 여부를 확정하지 않는다.
- 원문에 없는 endpoint, parameter, response field를 만들어내지 않는다.
- 숫자처럼 보이는 코드값을 무조건 숫자 타입으로 처리하지 않는다.
- 모든 API 결과를 무조건 DB 저장하거나 무조건 실시간 호출한다고 가정하지 않는다.

## 새 API 문서 추가 규칙

1. 원문 변환 Markdown은 `docs/api/external-api/specs/`에 보존한다.
2. 원문 파일명을 바꾸면 [INDEX.md](/docs/api/external-api/INDEX.md)에 원래 이름과 새 이름을 모두 남긴다.
3. 새 API가 기능 영역에 영향을 주면 [API_DOMAIN_MAP.md](/docs/api/external-api/API_DOMAIN_MAP.md)를 갱신한다.
4. 새 API가 주소, 코드, 본번, 부번, 좌표를 요구하면 [ADDRESS_CODE_FLOW.md](/docs/api/external-api/ADDRESS_CODE_FLOW.md)를 갱신한다.
5. 새 API의 응답 필드를 내부 도메인 값으로 쓰면 [FIELD_MAPPING_DICTIONARY.md](/docs/api/external-api/FIELD_MAPPING_DICTIONARY.md)를 갱신한다.
6. 저장/캐시/원문 보존 판단이 달라지면 [DATA_STORAGE_AND_CACHE_POLICY.md](/docs/api/external-api/DATA_STORAGE_AND_CACHE_POLICY.md)를 갱신한다.
7. 불확실한 값은 확정하지 않고 `확인 필요`로 표시한다.

## Related documents

- [API Docs](/docs/api/README.md)
- [공공데이터 API 연동 전략](/docs/api/PUBLIC_API_STRATEGY.md)
- [과거 지표 분석과 정확 주소 위험진단 MVP API 호출 전략](/docs/api/API_CALL_FLOW.md)
- [외부 API 설정과 data.go.kr 키 관리](/docs/api/EXTERNAL_API_CONFIGURATION.md)
- [외부 API 데이터 활용과 통찰 산출 계획](/docs/api/external-api/DATA_USAGE_AND_INSIGHT_PLAN.md)
- [ZIP:ON 저장소 전략](/docs/architecture/DATA_STORAGE_POLICY.md)
- [Docs README](/docs/README.md)

## Learning path

1. First read: 이 문서의 `반드시 읽는 순서`
2. Then inspect: [ADDRESS_CODE_FLOW.md](/docs/api/external-api/ADDRESS_CODE_FLOW.md)
3. Then inspect code: `LeaseRiskAddressNormalizer`, `BuildingRegisterApiQuery`, `TransactionApiSelector`
4. Then run: 문서만 변경한 경우 `git diff --check`
5. Then debug: API 호출 실패를 `ERROR_HANDLING_POLICY.md`의 에러 유형으로 분류
6. Key concept to understand: 외부 API 연동은 HTTP 호출이 아니라 ZIP:ON의 목적 기반 진단 흐름에 맞게 데이터를 번역하는 일이다.
