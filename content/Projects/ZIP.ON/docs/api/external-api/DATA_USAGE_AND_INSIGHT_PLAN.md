---
title: DATA_USAGE_AND_INSIGHT_PLAN
created: 2026-07-01T00:06:00+09:00
updated: 2026-07-01T00:06:00+09:00
---

# 외부 API 데이터 활용과 통찰 산출 계획

> Status: Current implementation + planned extensions

이 문서는 ZIP:ON이 외부 API를 실제로 붙일 때 어떤 일을 먼저 하고, 어떤 정보를 저장하며, 그 정보를 어떤 위험 문장과 체크리스트로 바꿀지 정리한다. 상세 endpoint와 원문 필드는 [외부 API 명세 인덱스](/docs/api/external-api/INDEX.md)와 `specs/` 문서를 기준으로 보고, 이 문서는 구현 순서와 데이터 활용 기준만 다룬다.

ZIP:ON은 외부 API 결과를 사용자에게 그대로 보여주는 서비스가 아니다. 사용자 목적, 주소 정제, 물건 정체 판별, 가격 비교, 자동 확정 금지 영역 분리를 거쳐 계약 전 행동으로 바꾼다.

## Goal

외부 API 연동의 목표는 API 호출 수를 늘리는 것이 아니라 전세·월세 위험진단의 근거를 더 정확하게 만드는 것이다.

```text
사용자 입력
-> 주소와 코드 정제
-> 물건 정체 판별
-> 목적별 API 선택
-> 가격/공시가격/건축물 정보 조합
-> 데이터 신뢰도와 한계 분리
-> 위험 문장과 계약 전 체크리스트
```

## Non-Goals

- 주소 입력 직후 모든 API를 병렬 호출하지 않는다.
- 현재 매물 목록을 제공하지 않는다.
- 한국부동산원 R-ONE 통계 API를 현재 매물 feed처럼 사용하지 않는다.
- 외부 API 하나만으로 계약 가능 여부, 등기 권리관계, 선순위 임차인, 보증보험 가능성, 위반건축물 여부를 확정하지 않는다.
- VWorld Geocoder 좌표 변환 결과를 DB나 Redis에 저장하지 않는다.
- API raw response를 무조건 DB에 누적하지 않는다.
- 외부 API raw response cache, object storage adapter, OCR, 추가 AI 분석을 이번 계획만으로 바로 도입하지 않는다. raw response 보존이 필요한 경우에도 API별 raw DB table이 아니라 `external_api_raw_response_archives` metadata와 object storage를 사용한다. Redis/volatile state는 현재 access token denylist cache, 로그인 실패 rate limit, scheduler lock에만 제한 적용되어 있다.

## Required Reading Order

구현자는 아래 순서로 읽은 뒤 코드를 만져야 한다.

1. [과거 지표 기반 부동산 분석 MVP 범위](/docs/product/MVP_SCOPE.md)
2. [공공데이터 API 연동 전략](/docs/api/PUBLIC_API_STRATEGY.md)
3. [외부 API 구현 기준 문서](/docs/api/external-api/README.md)
4. [주소와 코드 변환 흐름](/docs/api/external-api/ADDRESS_CODE_FLOW.md)
5. [외부 API 호출 전략](/docs/api/external-api/API_CALL_STRATEGY.md)
6. [외부 API 데이터 저장과 캐시 정책](/docs/api/external-api/DATA_STORAGE_AND_CACHE_POLICY.md)
7. [API 조합 매트릭스](/docs/api/external-api/API_COMBINATION_MATRIX.md)
8. 이 문서
9. [외부 API 구현 백로그](/docs/api/external-api/IMPLEMENTATION_BACKLOG.md)
10. 개별 `specs/` 원문 명세

## Current Implementation Baseline

현재 구현은 전세·월세 위험진단 첫 slice를 이미 가지고 있다.

| 영역 | 현재 파일 | 역할 |
| --- | --- | --- |
| 위험진단 진입 API | `RentRiskDiagnosisController`, `RentRiskDiagnosisService` | `POST /api/rent-risk-diagnoses` 요청을 받아 주소 정제, 외부 데이터 조회, 응답 조립을 조율 |
| 주소 정제 | `LeaseRiskAddressNormalizer`, `MyBatisLegalDongCodeCatalog` | Juso 선택 결과와 DB seed 또는 수동 sync catalog 기반 법정동코드 매칭 |
| 건축물대장 | `DataGoKrBuildingRegisterApiClient`, `BuildingRegisterApiResponseParser`, `BuildingRegisterTitleSnapshotStore`, `BuildingRegisterSeedRunner`, `BuildingRegisterSeedService`, `BuildingRegisterSeedCandidateMapper`, `backend-building-register-seed` compose profile | 건축HUB 표제부 조회, 30일 DB-first snapshot 조회와 저장. 수동 seed는 공시가격 sync target, 운영자 admin seed target, 물건 식별 후보의 PNU를 건축물대장 조회 파라미터로 복원해 fresh snapshot이 없는 후보를 보강 |
| 실거래가 adapter | `DataGoKrRentTransactionApiClient`, `DataGoKrSaleTransactionApiClient` | 유형별 전월세/매매 실거래가 조회, XML parsing, 설정 기반 페이징 수집 |
| 실거래가 DB-first 저장 | `LeaseRiskExternalDataLookupService`, `RealEstateTransactionFactStore`, `TransactionFactFingerprintService` | 최근 3개월 DB fact가 충분하면 API 호출을 생략하고, 부족하면 API fallback 결과를 idempotent upsert |
| 월별 실거래 통계 | `MarketStatisticsMonthlyService`, `market_statistics_monthly` | 저장된 fact 기반 sample_count, min/median/max, confidence_level, data_quality_status 계산 |
| 실거래가 최신월 갱신 | `ExternalDataCollectionService`, `ExternalDataTransactionMonthTargetRegistrationService`, `ExternalDataLatestTargetMaterializer`, `ExternalDataRefreshTargetMapper`, `ExternalDataWeeklyRefreshScheduler`, `ExternalDataRefreshSchedulerService`, `VolatileLockService` | 사용자 fallback target과 scheduler가 등록한 최신 완료월 `TRANSACTION_MONTH` refresh target을 배치로 조회하고 fact/statistics를 갱신하며, scheduler lock으로 중복 실행을 줄임 |
| 실거래가 수동 seed | `ExternalDataSeedRunner`, `ExternalDataSeedTargetService`, `backend-seed` compose profile | 명시적인 수동 실행에서만 `TRANSACTION_MONTH` target을 만들고 `MANUAL_SEED` run으로 기존 수집 흐름을 호출 |
| 법정동코드 수동 sync | `DataGoKrLegalDongCodeApiClient`, `LegalDongCodeSyncService`, `backend-legal-dong-sync` compose profile | 행정안전부 행정표준코드 법정동코드 API를 명시 실행으로 호출해 `legal_dong_codes` catalog를 확장 |
| R-ONE 통계 수동 sync | `KabROneStatisticsApiClient`, `KabROneApiResponseParser`, `KabROneSyncService`, `KabROneStatisticsMapper`, `MarketIndicatorSyncService`, `backend-kab-r-one-sync` compose profile | 한국부동산원 R-ONE `SttsApiTbl.do`, `SttsApiTblItm.do`, `SttsApiTblData.do`를 명시 실행으로 호출해 원천 통계표/세부항목/통계자료를 저장하고, 저장된 통계자료를 `market_indicator_*` domain table로 변환 |
| VWorld 공시가격 수동 seed | `PublicPriceSeedRunner`, `PublicPriceSeedService`, `VWorldPublicPriceSyncTargetMapper`, `backend-public-price-seed` compose profile | 여러 원천 후보를 `vworld_public_price_sync_targets`에 materialize하고 callable target만 VWorld 공시가격 API로 조회해 `public_price_snapshots`와 coverage metric을 갱신 |
| 건축물대장 표제부 수동 seed | `BuildingRegisterSeedRunner`, `BuildingRegisterSeedService`, `BuildingRegisterSeedCandidateMapper`, `backend-building-register-seed` compose profile | 공시가격 sync target, 운영자 admin seed target, 물건 식별 후보의 PNU를 건축물대장 조회 파라미터로 복원하고, fresh snapshot이 없는 후보만 `building_register_title_snapshots`에 저장 |
| 지역·유형 과거 지표 분석 | `RegionalIndicatorAnalysisController`, `RegionalIndicatorAnalysisService`, `MarketIndicatorContextService`, `RegionalIndicatorAnalysisMapper`, `SearchResultView.vue` | 저장된 `market_indicator_trend_summaries`와 `market_statistics_monthly`를 읽어 현재 매물이 아닌 과거 지표 분석 상태, 공부상 유형 후보, 통찰 문장, 데이터 한계, 다음 행동으로 변환 |
| 공시가격 | `VWorldPublicPriceApiClient`, `PublicPriceApiResponseParser`, `PublicPriceSnapshotStore`, `PublicPriceSnapshotMapper`, `VWorldPublicPriceSyncTargetMapper` | VWorld 공시가격 후보 조회, 30일 DB-first snapshot 재사용, 수동 seed target/coverage 관리 |
| 위험 계산 | `DepositRiskCalculator`, `BuildingRiskAnalyzer` | 가격 비율, 주용도 불일치, 노후도 안내 |
| 이력 저장 | `RentRiskDiagnosisHistoryMapper`, `rent_risk_diagnosis_histories` | 진단 입력/응답 snapshot 저장 |
| 외부 API 로그 | `ExternalApiCallLogger`, `external_api_call_logs` | provider, endpoint, status, duration 중심 운영 로그 |
| 외부 API raw archive metadata | `external_api_raw_response_archives`, `V26__create_external_api_raw_response_archives.sql` | raw body를 DB에 넣지 않고 object storage 위치, hash, redaction, encryption, retention metadata만 저장 |
| 직접 확인 상태 | `RegistryDocumentConfirmationService`, `registry_document_confirmations` | 등기부등본 수동 확인 상태와 memo 저장 |

## Work Plan

### 1. 주소와 코드 기반을 먼저 안정화한다

할 일:

- Juso 팝업과 backend 주소검색 후보를 분리한다.
- `JUSO_ADDRESS_CONFIRM_KEY`와 `JUSO_ADDRESS_SEARCH_KEY`는 backend secret으로만 사용한다.
- 행정표준코드 법정동코드 API sync 방식은 `LegalDongCodeSyncRunner`와 `backend-legal-dong-sync`로 구현되어 있다. 남은 일은 운영 sync 주기, 실패 알림, catalog freshness 기준을 정하는 것이다.
- `legal_dong_code_source_rows`와 `legal_dong_codes`는 전국 catalog를 담을 수 있다. 다만 도로명주소를 전국 단위 PNU로 정밀 확정하는 흐름은 별도 고도화가 필요하다.
- `LAWD_CD`, `sigunguCd`, `bjdongCd`, `bun`, `ji`, `platGbCd` 생성 규칙을 parser test로 고정한다.

저장:

| 데이터 | 저장 위치 후보 | 이유 |
| --- | --- | --- |
| 법정동코드 원천 row | MySQL `legal_dong_code_source_rows` | `region_cd`, `sido_cd`, `sgg_cd`, `umd_cd`, `ri_cd`, `locathigh_cd` 등 원천 계층 재검토 |
| 법정동코드 leaf catalog | MySQL `legal_dong_codes` 확장 | 실거래가 `LAWD_CD`, 건축HUB 코드 분리, 주소 lookup |
| 법정동 alias | MySQL `legal_dong_aliases` | 행정동/법정동 혼동 보정 |
| 진단에 사용한 정제 주소 snapshot | `rent_risk_diagnosis_histories.request_snapshot` | 사용자가 어떤 조건으로 진단했는지 재현 |
| Juso 검색 결과 | Redis short TTL 후보 | 같은 검색어 반복 조회 가능 |

저장 금지:

- Juso key 원문
- 주소검색 API raw response 전체의 장기 보존
- 개인정보가 포함된 주소 원문을 Redis key에 평문으로 넣는 것

산출 통찰:

- 주소 정제 성공/실패 상태
- 법정동코드 매칭 신뢰도
- 지번 본번/부번 부족 여부
- “주소 또는 법정동을 다시 확인해야 합니다” 체크리스트

### 2. VWorld Geocoder는 실시간 변환 adapter로만 붙인다

할 일:

- `VWORLD_API_KEY`를 backend 설정으로 바인딩한다.
- VWorld Geocoder API 2.0 `getCoord` adapter 후보를 만든다.
- 도로명주소면 `type=ROAD`, 지번주소면 `type=PARCEL`로 분기한다.
- 좌표가 필요한 후행 API 호출 직전에만 사용한다.
- `OK`, `NOT_FOUND`, `ERROR`, `OVER_REQUEST_LIMIT`, key 오류를 구분한다.

저장:

| 데이터 | 저장 위치 후보 | 이유 |
| --- | --- | --- |
| Geocoder 호출 로그 요약 | `external_api_call_logs` | 장애/쿼터/latency 운영 관측 |
| 좌표 변환 성공 여부 | 진단 응답의 `dataStatuses` 후보 | 사용자에게 제한 진단 사유 표시 |

저장 금지:

- `result.point.x`, `result.point.y` DB 저장
- Geocoder 결과 Redis cache
- 원문 주소와 좌표를 묶은 영구 snapshot

산출 통찰:

- 좌표 기반 API를 호출할 수 있는지 여부
- 좌표 변환 실패 시 생활안전/환경 분석이 제한된다는 안내
- VWorld 사용량 초과가 진단 품질에 미치는 영향

### 3. 물건 정체 판별을 보강한다

할 일:

- 건축HUB 표제부 adapter를 유지하고, 전유부/층별개요/지역지구구역을 다음 slice로 확장한다.
- VWorld GIS건물통합정보 endpoint와 응답 필드를 공식 문서로 확인한다.
- 공동주택이면 AptIdInfoSvc `getAptInfo`, `getDongInfo`, `getHistInfo`를 보조로 붙인다.
- 건축HUB, AptIdInfoSvc, VWorld GIS 결과가 불일치하면 확정하지 않고 후보와 신뢰도를 분리한다.

저장:

| 데이터 | 저장 위치 후보 | 이유 |
| --- | --- | --- |
| 건축물대장 주요 snapshot | DB `building_register_title_snapshots` | 같은 건물 반복 진단, 유형 판별 재사용 |
| AptIdInfoSvc 단지 snapshot | DB 또는 긴 TTL cache 후보 | 매년 갱신, 단지명/단지종류 반복 사용 |
| GIS건물 후보 요약 | endpoint 확인 후 결정 | 건축HUB와 공간정보 교차검증 |

저장 금지 또는 주의:

- 건축물대장 결과만으로 등기 권리관계를 확정하지 않는다.
- AptIdInfoSvc만으로 다가구/오피스텔/근린생활시설 여부를 확정하지 않는다.
- GIS건물통합정보 endpoint가 확정되기 전 schema를 만들지 않는다.

산출 통찰:

- 사용자 표현과 공부상 유형 불일치
- 다가구 가능성에 따른 선순위 임차인 확인 필요
- 집합건물 여부와 전유부 확인 필요
- 근린생활시설 주거 사용 가능성 주의
- 사용승인일 기준 노후도와 현장 하자 확인 필요

### 4. 가격 근거는 유형 판별 뒤에만 조회한다

할 일:

- 물건 유형별로 전월세/매매 실거래가 API를 선택한다.
- 아파트, 연립다세대는 기존 spec과 구현을 기준으로 고도화한다.
- 단독/다가구, 오피스텔 최신 실거래가 명세를 추가 보존한다.
- `LeaseRiskExternalDataLookupService`는 최근 3개월 같은 `lawd_code + property_type + trade_kind` fact가 3건 이상이면 외부 API client를 호출하지 않는다.
- DB fact가 1~2건이면 기존 실거래가 API client를 fallback으로 호출해 보강을 시도하고, 성공 snapshot을 `RealEstateTransactionFactCandidate`로 변환해 `real_estate_transaction_facts`에 upsert한다.
- fallback이 `FOUND`가 아니더라도 기존 sparse DB fact가 있으면 제한 근거로 사용한다. DB fact가 0건일 때만 API fallback의 `empty`, `unavailable`, `error` 상태를 그대로 사용자 진단에 반영한다.
- fallback 호출은 `external_data_collection_runs`, `external_data_collection_attempts`에 lineage를 남긴다.
- fallback 호출 대상은 `external_data_refresh_targets`에 `TRANSACTION_MONTH` target으로 등록한다. target key는 `source + LAWD_CD + DEAL_YMD`를 hash 처리하고 API key나 원문 주소를 넣지 않는다.
- fact upsert 후 affected key의 `market_statistics_monthly`를 갱신한다.
- `ExternalDataWeeklyRefreshScheduler`는 기본 비활성화이며, 활성화되면 `ExternalDataLatestTargetMaterializer`가 최신 완료월 rolling window의 `TRANSACTION_MONTH` target을 먼저 등록하고 due target을 `batch-size`만큼 처리한다. 실행 전 `VolatileLockService` lock을 잡아 중복 실행을 줄인다. 전국 운영은 `legal_dong_codes` 전국 catalog 또는 명시 `LAWD_CD` 목록을 전제로 한다.
- `ExternalDataSeedRunner`는 테스트가 아니라 수동 운영 경로다. `EXTERNAL_DATA_SEED_ENABLED=true`일 때만 실행되며, `ExternalDataSeedTargetService`가 source/LAWD_CD/month 조합을 `external_data_refresh_targets`에 등록한 뒤 `ExternalDataRefreshSchedulerService.refreshDueTransactionMonthTargetsForManualSeed(...)`를 호출한다.
- 전국 seed는 `EXTERNAL_DATA_SEED_LAWD_CODE_OFFSET`과 `EXTERNAL_DATA_SEED_LAWD_CODE_LIMIT`으로 LAWD_CD 구간을 나누어 실행한다. 이는 API quota와 실패 복구 범위를 제어하기 위한 운영 가드다.
- 수동 seed 실행 단위는 `external_data_collection_runs.run_type = MANUAL_SEED`로 남긴다. API 응답은 임시 SQL이나 raw dump가 아니라 `external_data_collection_attempts`, `real_estate_transaction_facts`, `market_statistics_monthly`를 통과한다.
- `PublicPriceSeedRunner`는 `zipon.external.vworld.public-price.seed.enabled=true`일 때만 실행된다. 실거래가 seed scheduler target과 섞지 않고 `vworld_public_price_sync_targets`에 별도 후보 universe를 만들며, 공시가격 조회 run은 `external_data_collection_runs.run_type = PUBLIC_PRICE_SEED`로 남긴다.
- 전국 seed로 인정하려면 전국 시군구 `LAWD_CD` 목록을 `EXTERNAL_DATA_SEED_LAWD_CODES`로 제공하거나, `backend-legal-dong-sync`로 `legal_dong_codes`가 전국 catalog로 확장된 뒤 `EXTERNAL_DATA_SEED_REQUIRE_NATIONWIDE_CATALOG=true` 검증을 통과해야 한다. 현재 starter seed catalog만으로는 전국 수집이 아니다.
- 최근 3개월 기준을 12~24개월 후보로 확장할지는 별도 slice에서 결정한다.
- `TransactionSimilarityFilter` 기준을 면적, 층, 지번, 단지명 신뢰도로 확장한다.

저장:

| 데이터 | 저장 위치 후보 | 이유 |
| --- | --- | --- |
| `LAWD_CD + DEAL_YMD` 거래 목록 | Redis short TTL 또는 월 단위 DB 적재 후보 | 같은 지역/월 반복 조회 |
| 진단에 사용한 대표 거래값 | `rent_risk_diagnosis_histories.response_snapshot` | 진단 결과 재현 |
| 거래 없음 상태 | 짧은 TTL cache 후보 | 반복 호출 방지 |

저장 금지 또는 주의:

- 거래 없음은 안전함이 아니다.
- 실거래가는 과거 거래이며 현재 호가, 급매, 권리관계, 하자를 반영하지 않는다.
- 원문 금액 문자열과 계산용 숫자의 단위를 분리한다.

산출 통찰:

- 입력 보증금이 유사 전월세 거래 중앙값 대비 높은지
- 월세와 관리비를 합친 월 고정 주거비가 과도한지
- 매매 실거래가 대비 보증금 비율이 높은지
- 유사 거래 표본 수가 부족한지
- 가격 판단 신뢰도가 높은지, 낮은지

운영 관측:

- scheduler가 처리한 실행 단위는 `external_data_collection_runs.run_type = WEEKLY_SCHEDULED`로 남긴다.
- 수동 seed runner가 처리한 실행 단위는 `external_data_collection_runs.run_type = MANUAL_SEED`로 남긴다.
- 각 API 요청은 `external_data_collection_attempts.target_id`로 refresh target과 연결된다.
- target 성공/실패는 `external_data_refresh_targets.refresh_status`, `last_success_at`, `last_failure_at`, `next_refresh_at`, `failure_count`로 추적한다.
- 실패 target은 다음 실행 후보로 남기되, 실패 횟수 기반 backoff로 즉시 반복 호출을 피한다.

### 4-1. 지역·유형 과거 지표 분석 화면에 저장 데이터를 연결한다

현재 구현:

- `SearchResultView.vue`는 `createRegionalIndicatorAnalysis(payload)`로 `POST /api/regional-indicator-analyses`를 호출한다.
- `MarketIndicatorContextService`는 R-ONE 원천 row에서 변환된 `market_indicator_trend_summaries`를 읽는다.
- `RegionalIndicatorAnalysisMapper`는 실거래가 월별 통계 테이블인 `market_statistics_monthly`를 읽는다.
- `RegionalIndicatorAnalysisService`는 원룸, 오피스텔, 빌라, 아파트 같은 사용자 표현을 공부상 후보 유형으로 분해한다.
- `indicatorStatuses`는 market indicator summary, 전월세 실거래가 월별 통계, 매매 실거래가 월별 통계, 공시가격 상태를 `success`, `empty`, `unavailable`로 구분한다.
- `marketIndicatorSummaries`는 display name, 지역 label, 최근값, 변화량, 방향, 신뢰도, 데이터 한계 문장을 포함한다.
- 공시가격은 지역 수준 입력에서 조회하지 않고 `unavailable`로 둔다. 정확 주소/PNU가 필요하기 때문이다.

중요한 경계:

```text
이 API는 요청 시점에 R-ONE이나 실거래가 외부 API를 직접 호출하지 않는다.
이 API는 현재 매물 목록, 현재 호가, broker inventory를 반환하지 않는다.
저장 데이터가 없으면 안전함이 아니라 empty/limitation/nextAction으로 표현한다.
```

검증:

- `RegionalIndicatorAnalysisIntegrationTest`는 Testcontainers MySQL에 R-ONE row와 `market_statistics_monthly` row를 직접 넣고, `MarketIndicatorSyncService`가 만든 summary를 API가 사용자-facing 응답으로 조립하는지 확인한다.
- `frontend npm run build`는 `SearchResultView.vue`와 `regionalIndicatorAnalysisApi.js` 연결이 production build에서 깨지지 않는지 확인한다.

### 5. 공시가격과 공시지가를 보조 기준으로 붙인다

할 일:

- VWorld `getIndvdHousingPriceAttr` parser에서 `housePc`, `pnu`, `stdrYear`, `stdrMt`를 명확히 매핑한다.
- VWorld 공동주택가격과 개별주택가격 조회 결과를 `public_price_snapshots`에 30일 DB-first snapshot으로 저장한다.
- 공동주택가격 속성조회 endpoint를 추가 확인한다.
- 건축HUB 주택가격 API와 VWorld 공시가격 중 운영 우선순위를 정한다.
- PNU 생성/검증과 동·호 매칭 신뢰도 정책을 별도 decision으로 남긴다.

저장:

| 데이터 | 저장 위치 후보 | 이유 |
| --- | --- | --- |
| 기준연도별 공시가격 snapshot | DB `public_price_snapshots` | PNU와 기준연도 단위 반복 조회 재사용 |
| PNU와 기준연도 | DB `query_key_hash`, `pnu`, `requested_standard_year` | 공시가격 재조회와 진단 재현 |
| 공시가격 후보 신뢰도 | DB `confidence_level`, `data_quality_status`, 진단 응답 snapshot | 동·호 정밀 매칭 여부 표시 |

저장 금지 또는 주의:

- 공시가격을 현재 시세로 표시하지 않는다.
- 동·호 매칭이 불확실한 값을 확정 기준가격처럼 쓰지 않는다.
- `housePc` 단위는 공식 문서 확인 전 변환 기준을 test로 고정하지 않는다.

산출 통찰:

- 공시가격 대비 보증금 비율
- 공시가격 조회 가능 여부
- 단독/다가구에서 개별주택가격 기반 보수적 확인 필요
- 공동주택에서 동·호 매칭 신뢰도 부족 안내

### 5-1. 한국부동산원 R-ONE으로 과거 지표 리포트를 만든다

할 일:

- 현재 매물 목록 제공을 제외한다.
- `KabROneStatisticsApiClient`가 공식 `.do` endpoint인 `SttsApiTbl.do`, `SttsApiTblItm.do`, `SttsApiTblData.do`를 호출한다.
- `KabROneApiResponseParser`가 R-ONE JSON wrapper의 `head.RESULT.CODE`, `list_total_count`, `row`를 파싱한다.
- `KabROneSyncService`가 수동 sync 실행에서 `external_data_collection_runs`, `external_data_collection_attempts` lineage를 남긴다.
- `KabROneSyncService`는 통계자료 row가 저장된 뒤 `MarketIndicatorSyncService.refreshFromStoredSourceRows()`를 호출해 원천 row를 domain indicator로 변환한다.
- `SttsApiTbl` 결과는 `kab_r_one_statistical_tables`에 저장하고, ZIP:ON에서 쓸 통계표 allowlist는 `KAB_R_ONE_SYNC_TABLE_IDS`로 제한한다.
- `SttsApiTblItm` 결과는 `kab_r_one_statistical_items`에 저장해 통계표별 지역/유형/항목 코드를 확인한다.
- `SttsApiTblData` 결과는 `KAB_R_ONE_SYNC_DATA_QUERIES`에 명시한 쿼리만 `kab_r_one_statistical_data_points`에 저장한다.
- `market_indicator_definitions`는 ZIP:ON이 사용자에게 해석할 지표 catalog를 관리한다.
- `market_indicator_source_bindings`는 R-ONE table/cycle/group/class/item code와 ZIP:ON 지표를 연결한다.
- `market_region_mappings`는 R-ONE 원천 지역 텍스트를 `NATION`, `SIGUNGU`, `PLACE_OR_STATION_CANDIDATE` 같은 분석 수준과 매핑 상태로 분리한다.
- `market_indicator_observations`와 `market_indicator_trend_summaries`는 화면과 관리자 API가 읽을 정규화 read model이다.
- `DTA_VAL`은 원문 `data_value_raw`와 계산 가능한 `data_value_decimal`을 함께 저장하되, 사용자 해석은 반드시 `UI_NM`과 통계표명을 함께 확인한다.
- `강남 원룸` 같은 입력은 현재 매물 검색이 아니라 지역/유형 과거 지표 분석으로 처리한다.

저장:

| 데이터 | 저장 위치 후보 | 이유 |
| --- | --- | --- |
| R-ONE 통계표 목록 | MySQL `kab_r_one_statistical_tables` | 통계표 코드와 주기 재사용 |
| R-ONE 세부항목 코드 | MySQL `kab_r_one_statistical_items` | 지역/유형/항목 조건 조립 |
| R-ONE 통계자료 | MySQL `kab_r_one_statistical_data_points` | 과거 지표 리포트 반복 사용 |
| ZIP:ON market indicator catalog | MySQL `market_indicator_definitions`, `market_indicator_source_bindings` | 원천 통계표 코드를 사용자-facing 지표로 해석 |
| R-ONE 지역 매핑 결과 | MySQL `market_region_mappings` | 원천 지역 텍스트를 자동 확정하지 않고 검토 상태와 함께 보존 |
| 지표 관측치와 추세 요약 | MySQL `market_indicator_observations`, `market_indicator_trend_summaries` | 지역·유형 과거 지표 API가 빠르고 일관되게 읽는 domain read model |
| 분석에 사용한 통계표/기간/항목 | 진단 또는 지표 리포트 snapshot 후보 | 사용자가 본 분석 재현 |

저장 금지 또는 주의:

- `KAB_R_ONE_API_KEY` 저장 금지
- R-ONE 통계를 현재 매물 가격으로 표시 금지
- R-ONE 통계만으로 개별 주소 안전성, 수익성, 계약 가능성 확정 금지
- `원룸`은 R-ONE 통계표에 없으므로 공부상 후보 유형으로 해석해야 함

산출 통찰:

- 지역별 매매가격지수, 전세가격지수, 월세가격지수 추세
- 오피스텔 가격, 전월세전환율, 수익률 흐름
- 상가 임대가격지수, 임대료, 공실률 흐름
- 지표 상승/하락이 개별 매물 안전성을 바로 뜻하지 않는다는 한계
- 데이터 기간, 통계 단위, 표본 한계

### 6. 최종 결과는 점수가 아니라 행동으로 만든다

할 일:

- `DepositRiskCalculator`는 비율과 신뢰도만 계산한다.
- `LeaseRiskDiagnosisRiskSummaryService`는 확인된 정보, 데이터 부족, 직접 확인 필요를 분리한다.
- `LeaseRiskDiagnosisChecklistService`와 `LeaseRiskDiagnosisNextActionService`는 계약 전 행동으로 마무리한다.

저장:

| 데이터 | 저장 위치 후보 | 이유 |
| --- | --- | --- |
| 진단 요청/응답 snapshot | `rent_risk_diagnosis_histories` | 사용자 이력, 관리자 품질 확인, 재분석 후보 |
| 진단 판단 근거 snapshot | `risk_evidence_snapshots` | criterion별 evidence, missingData, limitation, user action 재분석 후보 |
| 등기부등본 확인 상태 | `registry_document_confirmations` | 권리관계 자동 확정 금지 영역의 사용자 확인 상태 |
| 위험 기준 변경 이력 | future DB table 후보 | 운영자가 위험 룰을 조정할 때 감사 필요 |

산출 통찰:

- 계약 전 추가 확인 필요 여부
- 가격 비교가 가능한 영역과 불가능한 영역
- 등기부등본, 선순위 임차인, 보증보험, 중개대상물 확인설명서의 직접 확인 필요성
- “데이터 부족이므로 안전하다고 볼 수 없음” 안내

### 7. 운영 관측성을 먼저 작게 만든다

할 일:

- `external_api_call_logs`에 provider, apiName, endpointPath, key 없는 requestSummary, resultStatus, httpStatusCode, durationMillis만 남긴다.
- API별 `UNAVAILABLE`, `EMPTY`, `ERROR`, `AMBIGUOUS`를 일관된 domain status로 변환한다.
- 관리자 화면에서 API 실패율, key 누락, 쿼터 초과, parser 오류를 볼 수 있게 확장한다.

저장:

| 데이터 | 저장 위치 후보 | 이유 |
| --- | --- | --- |
| 외부 API 호출 요약 로그 | `external_api_call_logs` | 운영 장애 분석 |
| raw response 전문 | object storage + `external_api_raw_response_archives` metadata 후보 | parser 장애 재현 필요성이 확인될 때만 |
| rate limit/circuit 상태 | Redis 후보 | 호출량 문제가 실제로 발생할 때 |

저장 금지:

- `ServiceKey`, `serviceKey`, `VWORLD_API_KEY`, Juso key
- 원문 주소 전문이 포함된 불필요한 request body
- 민감 문서 원문

산출 통찰:

- 어떤 API가 자주 실패하는지
- 어떤 지역/유형에서 데이터 부족이 많은지
- parser 오류가 API 변경 때문인지 내부 구현 문제인지
- Redis나 object storage 도입이 필요한 실제 근거

## Data Storage Summary

| 데이터 | 저장한다 | 저장하지 않는다 | 후보 |
| --- | --- | --- | --- |
| 법정동코드 | `legal_dong_code_source_rows`, `legal_dong_codes` | - | 월 1회 또는 수시 동기화 |
| Juso 검색 결과 | 진단 snapshot 일부 | key, 장기 raw response | Redis short TTL |
| VWorld Geocoder 좌표 | 호출 성공/실패 상태만 | 좌표 DB/Redis 저장 | 실시간 호출 |
| 건축물대장 주요 정보 | `building_register_title_snapshots` | 권리관계 확정값 | DB 30일 DB-first |
| AptIdInfoSvc 단지 정보 | snapshot 또는 cache | 가격/권리 확정값 | DB/장기 TTL |
| 실거래가 | `real_estate_transaction_facts` 정규화 fact, `market_statistics_monthly` 월별 통계 | 안전 확정값, API raw response 무제한 누적 | Redis short TTL은 후속 보조 후보 |
| 공시가격 | `public_price_snapshots` 기준연도 snapshot | 현재 시세 확정값 | DB 30일 DB-first |
| R-ONE 통계표/세부항목 | `kab_r_one_statistical_tables`, `kab_r_one_statistical_items` | 현재 매물 목록 | 수동 sync 기본 비활성화 |
| R-ONE 통계자료 | `kab_r_one_statistical_data_points` 월/분기 단위 통계값 | 개별 매물 현재 가격 확정값 | `KAB_R_ONE_SYNC_DATA_QUERIES`로 명시한 쿼리만 저장 |
| R-ONE 기반 market indicator | `market_indicator_definitions`, `market_indicator_source_bindings`, `market_region_mappings`, `market_indicator_observations`, `market_indicator_trend_summaries`, `market_indicator_sync_targets` | 원천 지역명을 검토 없이 정확 주소처럼 확정하는 값 | domain read model과 disabled backfill target |
| 진단 결과 | request/response snapshot | API key, raw token | MySQL |
| 외부 API 로그 | key 없는 요약 | key 원문, 민감 raw body | MySQL |
| raw response | `external_api_raw_response_archives` object metadata만 | 무제한 DB 저장, API별 raw table | object storage adapter와 redaction pipeline 구현 후 |

## Insight Map

| 통찰 | 필요한 데이터 | 사용자 표현 |
| --- | --- | --- |
| 주소 신뢰도 | Juso, 법정동코드, 지번 분리 | “주소와 법정동코드가 확인되었습니다.” 또는 “주소를 다시 확인해야 합니다.” |
| 물건 정체 불일치 | 사용자 표현, 건축HUB, AptIdInfoSvc, GIS 후보 | “사용자는 원룸이라고 입력했지만 공부상 다가구주택일 가능성이 있습니다.” |
| 다가구 선순위 위험 | 건축물대장 주용도, 가구수, 대장구분 | “선순위 임차인 보증금 총액 확인이 필요합니다.” |
| 주거 목적 불일치 | 주용도, 근린생활시설 후보 | “주거 사용 가능성과 전입신고/보증보험 가능성을 확인하세요.” |
| 가격 과대 가능성 | 전월세 실거래가, 사용자 보증금/월세 | “유사 거래 대비 보증금 또는 월세가 높은 편인지 확인이 필요합니다.” |
| 전세가율 보수 판단 | 매매 실거래가, 공시가격, 사용자 보증금 | “매매가 또는 공시가격 대비 보증금 비율이 높게 추정됩니다.” |
| 지역 가격 흐름 | R-ONE 가격지수, 실거래가 월별 집계 후보 | “이 지역의 과거 전세·월세 지표는 최근 이런 흐름을 보입니다. 다만 현재 매물 가격이나 계약 안전성을 확정하지는 않습니다.” |
| 상가 임대시장 흐름 | R-ONE 상가 임대가격지수, 공실률 | “공실률과 임대료 흐름은 창업 전 참고 지표이며, 실제 매출과 권리금은 현장 확인이 필요합니다.” |
| 데이터 부족 | 빈 실거래가, 공시가격 없음, parser 오류 | “자료가 부족하므로 안전하다고 단정할 수 없습니다.” |
| 운영 품질 | `external_api_call_logs` | “이 API는 인증/쿼터/파싱 문제로 자주 실패합니다.” |

## Additional APIs Needed

현재 문서 기준으로 추가 확인 또는 명세 보존이 필요한 API는 아래다.

| 필요 API | 필요한 이유 | 우선순위 |
| --- | --- | --- |
| VWorld GIS건물통합정보 endpoint/필드 | 건축HUB 주소 조회와 공간 건물 후보 교차 검증 | 높음 |
| VWorld 공동주택가격 속성조회 endpoint | 공동주택 공시가격 동·호 매칭 | 높음 |
| 단독/다가구 전월세·매매 실거래가 최신 명세 | 원룸/다가구 전세 위험진단 핵심 | 높음 |
| 오피스텔 전월세·매매 실거래가 최신 명세 | 오피스텔 전세/월세 진단 | 높음 |
| 한국부동산원 R-ONE 세부항목 실제 응답 fixture | 지역·유형 과거 지표 분석 | 높음 |
| 토지임야정보, 지적도, 용도지역지구도 | 토지/임야, 상가, 꼬마빌딩 확장 | 중간 |
| K-apt 관리비/공동주택 기본정보 | 월세·관리비와 공동주택 생활비 보조 | 중간 |
| 부동산중개업소 현황, 사업자등록 상태조회 | 계약 상대방·중개사 확인 체크리스트 | 중간 |
| 생활안전지도, NEIS 학교, 교통사고, 환경·재난 API | 생활/안전/환경 보조 분석 | 후속 |

## Decision: API data becomes diagnosis evidence, not raw output

### Context

ZIP:ON에는 법정동코드, 건축물대장, 실거래가, 공시가격, VWorld, Juso, AptIdInfoSvc 같은 API가 들어온다. API를 많이 붙일수록 raw data는 늘어나지만, 사용자는 원문 필드보다 “계약 전 무엇을 확인해야 하는가”를 알고 싶어 한다.

### Options considered

1. 모든 API 응답을 화면에 원문 그대로 보여준다.
2. 모든 API 응답을 DB에 저장한 뒤 나중에 분석한다.
3. API별 저장 정책을 나누고, 위험진단에 필요한 snapshot과 통찰 문장만 사용자에게 제공한다.

### Decision

3번을 선택한다. 코드표와 기준정보는 DB에 저장하고, 실거래가는 `real_estate_transaction_facts` 정규화 fact와 `market_statistics_monthly` 통계로 저장한다. 공시가격은 `public_price_snapshots` DB snapshot으로 저장하며, VWorld Geocoder 좌표는 저장하지 않는다. 사용자 결과에는 raw field가 아니라 확인된 정보, 데이터 부족, 직접 확인 필요, 계약 전 행동을 보여준다. 최종 진단의 항목별 evidence와 missingData는 `risk_evidence_snapshots`로 분리해, 응답 JSON을 열지 않아도 어떤 근거와 한계가 사용됐는지 추적할 수 있게 한다. raw response 보존이 필요한 경우에도 DB에는 XML/JSON body가 아니라 `external_api_raw_response_archives`의 object metadata만 남긴다.

### Why

이 방식이 ZIP:ON의 제품 기준과 가장 잘 맞는다. 외부 API는 판단 근거일 뿐이고, 최종 산출물은 계약 전 위험 문장과 체크리스트다. 또한 저장소를 데이터 성격에 맞게 나누면 MyBatis/Flyway DB, Redis 후보, object storage 후보의 책임이 명확해진다.

### Tradeoffs

처음에는 API별 adapter, parser, snapshot, analyzer를 나누는 작업이 단순 raw dump보다 느리다. 대신 잘못된 데이터 확정, 개인정보 저장, API key 노출, 좌표 저장 위반, 데이터 없음의 안전 오해 같은 위험을 줄일 수 있다.

### Future revisit

외부 API 호출량이 실제 사용성을 막거나 관리자 운영에서 raw response 재현이 필요해지면 Redis cache adapter, object storage adapter, redaction pipeline, raw archive retention job을 별도 slice로 구현한다.

## Debugging Checklist

- 주소가 정제됐는데 `LAWD_CD`가 없으면 법정동코드 동기화 또는 alias 문제를 먼저 본다.
- 건축물대장 결과가 없으면 안전하다고 말하지 말고 주소/지번/원본 대장 확인으로 분리한다.
- 실거래가 결과가 없으면 최근 거래 부족으로 처리한다.
- 공시가격 후보가 여러 개면 대표값을 확정하지 말고 동·호/면적 매칭 신뢰도를 표시한다.
- VWorld Geocoder가 실패하면 좌표 기반 후행 분석만 제한하고 전체 진단을 실패시키지 않는다.
- 외부 API key 오류는 사용자 입력 문제가 아니라 운영 설정 문제로 분리한다.
- parser 오류 로그에 service key와 원문 주소 전문이 남지 않았는지 확인한다.

## Related Documents

- [외부 API 구현 기준 문서](/docs/api/external-api/README.md)
- [외부 API 호출 전략](/docs/api/external-api/API_CALL_STRATEGY.md)
- [외부 API 데이터 저장과 캐시 정책](/docs/api/external-api/DATA_STORAGE_AND_CACHE_POLICY.md)
- [API 조합 매트릭스](/docs/api/external-api/API_COMBINATION_MATRIX.md)
- [외부 API 구현 백로그](/docs/api/external-api/IMPLEMENTATION_BACKLOG.md)
- [ZIP:ON 저장소 전략](/docs/architecture/DATA_STORAGE_POLICY.md)

## Learning Path

1. First read: `Work Plan`
2. Then inspect: `Data Storage Summary`
3. Then inspect code: `RentRiskDiagnosisService`, `LeaseRiskExternalDataLookupService`, `RealEstateTransactionFactStore`, `MarketStatisticsMonthlyService`, `PublicPriceSnapshotStore`, `DepositRiskCalculator`
4. Then inspect DB: `V11__create_rent_risk_diagnosis_history.sql`, `V12__create_external_api_call_logs.sql`, `V20__create_external_data_fact_statistics_schema.sql`, `V23__create_public_price_snapshots.sql`, `V24__create_risk_evidence_snapshots.sql`, `V26__create_external_api_raw_response_archives.sql`, `V27__create_kab_r_one_statistics_schema.sql`
5. Then run: `cd backend && ./mvnw -Dtest=RealEstateTransactionFactStoreTest,MarketStatisticsMonthlyServiceTest,PublicPriceSnapshotStoreTest,LeaseRiskExternalDataLookupServiceTest,KabROneApiResponseParserTest,KabROneSyncServiceTest,KabROneStatisticsSchemaIntegrationTest test`
6. Then debug: `Debugging Checklist`
7. Key concept to understand: 외부 API adapter는 원문 호출을 담당하고, service/analyzer는 그 결과를 정규화 fact, 통계, 사용자 목적에 맞는 진단 근거로 번역한다.
