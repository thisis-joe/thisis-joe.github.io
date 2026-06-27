---
title: IMPLEMENTATION_BACKLOG
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
---

# 외부 API 구현 백로그

> Status: Current implementation + backlog

이 문서는 MVP 기준으로 API를 제외하는 목록이 아니라, 의존관계 기준으로 어떤 작업을 먼저 해야 하는지 정리한다. 구현은 항상 제품 기준인 목적 기반 사전진단 흐름을 따른다.

API 호출 결과를 무엇으로 저장하고, 어떤 위험 문장과 운영 통찰로 바꿀지는 [외부 API 데이터 활용과 통찰 산출 계획](/docs/api/external-api/DATA_USAGE_AND_INSIGHT_PLAN.md)을 기준으로 한다.

## 의존관계 기준 작업 순서

| 순서 | 작업 | 선행 조건 | 관련 API 문서 | 산출물 | 비고 |
| -: | --- | --- | --- | --- | --- |
| 1 | Juso 키 정리와 backend 주소검색 후보 운영 보강 | 현재 팝업/직접검색 flow 이해 | [ADDRESS_CODE_FLOW.md](/docs/api/external-api/ADDRESS_CODE_FLOW.md), `EXTERNAL_API_CONFIGURATION.md` | 구현됨: `JusoAddressProperties`, `.env.example`, `JusoAddressSearchController`, `JusoAddressSearchApiClient`, popup callback. 남음: 운영 key/도메인 검증과 전국 주소 실패 UX 보강 | 실제 키는 `.env`/secret에만 |
| 2 | 법정동코드 전국 동기화 | DB schema와 seed 전략 결정 | [legal-dong-code-api.md](/docs/api/external-api/specs/legal-dong-code-api.md) | 구현됨: `V25__create_legal_dong_code_source_rows.sql`, `LegalDongCodeSyncRunner`, `LegalDongCodeSyncService`, `LegalDongCodeMapper`, `backend-legal-dong-sync`, `LegalDongCodeSyncServiceTest`. 남음: 운영 sync 주기, 실패 알림, freshness 기준 | 로컬 starter seed만으로는 범위 제한 |
| 3 | 주소 정제/코드 변환 강화 | 1, 2 | [ADDRESS_CODE_FLOW.md](/docs/api/external-api/ADDRESS_CODE_FLOW.md) | 구현됨: Juso 선택값 기반 `LeaseRiskAddressNormalizer`, 법정동코드/지번 파싱, 제한 진단 상태. 남음: 도로명주소의 전국 단위 PNU 정밀 확정, 실패/ambiguous UX 고도화 | legal-dong catalog와 PNU 정밀화는 별개 |
| 4 | 건축HUB 표제부 adapter와 수동 seed 고도화 | 주소 코드 안정화, PNU 후보 universe | [building-hub-openapi-implementation-spec.md](/docs/api/external-api/specs/building-hub-openapi-implementation-spec.md), [외부 데이터 수동 seed와 sync](/docs/operations/EXTERNAL_DATA_SEEDING.md) | 구현됨: `DataGoKrBuildingRegisterApiClient`, parser, 30일 DB-first snapshot, `BuildingRegisterSeedRunner`, `backend-building-register-seed`. 남음: parser fixture 확대, 운영 seed 후보 품질 모니터링 | seed는 현재 매물 수집이 아니라 PNU 후보 기반 표제부 snapshot 보강 |
| 5 | 건축HUB 전유부/층별개요/지역지구구역 연동 | 표제부 조회 안정화 | 같은 건축HUB 명세 | 전유부 snapshot, 층별/용도지역 response section | 다세대/오피스텔/상가 판단 보조 |
| 6 | 공동주택 단지 식별 API adapter | 주소/PNU/단지명 매칭 기준 | [apartment-complex-identification-api.md](/docs/api/external-api/specs/apartment-complex-identification-api.md) | `AptIdInfoApiClient` 후보, 단지 snapshot | 아파트/연립/다세대 보조 |
| 7 | 유형별 실거래가 adapter 범위 확대 | 물건 유형 판별 gate | [real-estate-transaction-api-spec.md](/docs/api/external-api/specs/real-estate-transaction-api-spec.md) | 아파트/연립다세대 adapter 검증, 단독다가구/오피스텔 명세 추가 | 주소 입력 직후 호출 금지 |
| 8 | VWorld 공시가격/Geocoder/GIS 명세 보강 | PNU/동호 매칭 기준, 좌표 변환 기준 | [vworld-public-price-and-gis-api.md](/docs/api/external-api/specs/vworld-public-price-and-gis-api.md) | 구현됨: 공시가격 client/parser/snapshot store, Geocoder adapter, 공시가격 sync target/coverage metric, 수동 seed runner. 남음: 관리자 seed 입력 UI, GIS건물통합정보 endpoint 확인, 동·호 정밀 매칭 정책 | Geocoder 결과는 저장 금지 |
| 9 | API 조합 기반 위험도 계산 고도화 | 4, 7, 8 | [API_COMBINATION_MATRIX.md](/docs/api/external-api/API_COMBINATION_MATRIX.md) | 보증금-월세 환산, 분위 비교, 신뢰도 표시 | 확정 판정 금지 |
| 10 | 한국부동산원 R-ONE 과거 지표 분석 | 현재 매물 미제공 제품 결정, 통계표 allowlist | [kab-r-one-statistics-api.md](/docs/api/external-api/specs/kab-r-one-statistics-api.md) | 구현됨: table/item/data client, parser, MyBatis 저장, 수동 sync, `market_indicator_*` 정규화, `POST /api/regional-indicator-analyses`, `SearchResultView.vue` 첫 slice. 남음: 운영 적재 조합 확대, allowlist 관리, trend summary 품질 모니터링 | 현재 매물 목록으로 사용 금지 |
| 11 | Redis short TTL cache adapter | 반복 호출/traffic 문제 확인 | [DATA_STORAGE_AND_CACHE_POLICY.md](/docs/api/external-api/DATA_STORAGE_AND_CACHE_POLICY.md) | 외부 API cache interface, fake test, provider별 TTL 정책 | `VolatileStateStore`는 구현됨. 외부 API raw response cache는 별도 결정 필요 |
| 12 | 외부 API raw response 보존 write path | 운영 재현 필요성 확인, `external_api_raw_response_archives` metadata schema | 저장/캐시 정책, [DATA_STORAGE_POLICY.md](/docs/architecture/DATA_STORAGE_POLICY.md) | object storage adapter, redaction pipeline, retention job, 관리자 권한 정책 | API별 raw DB table 금지. metadata schema는 구현됨 |
| 13 | 생활/상권/환경 API 확장 | 좌표 변환 API 선택 | [API_DOMAIN_MAP.md](/docs/api/external-api/API_DOMAIN_MAP.md) | 생활/상권/환경 adapters | MVP core 후 보조 분석 |
| 14 | 중개업소/사업자 상태 확인 | 계약 전 확인 flow 설계 | 추가 명세 필요 | 중개사 확인 checklist | 신뢰도/사기 확정 금지 |
| 15 | 사용자 문서 업로드 분석 | 저장소/보안/보존 정책 | [ROADMAP.md](/docs/product/ROADMAP.md), [DATA_STORAGE_POLICY.md](/docs/architecture/DATA_STORAGE_POLICY.md) | 등기부등본/계약서 upload flow | OCR/AI는 후속 |

## 현재 구현된 것과 연결

| 구현 영역 | 현재 파일 |
| --- | --- |
| 건축HUB 표제부 조회/수동 seed | `DataGoKrBuildingRegisterApiClient`, `BuildingRegisterApiResponseParser`, `BuildingRegisterSnapshotConverter`, `BuildingRegisterSeedRunner`, `BuildingRegisterSeedService`, `BuildingRegisterSeedCandidateMapper`, `backend-building-register-seed` |
| 실거래가 조회 | `DataGoKrRentTransactionApiClient`, `DataGoKrSaleTransactionApiClient` |
| 공시가격 조회/수동 seed | `VWorldPublicPriceApiClient`, `PublicPriceApiResponseParser`, `PublicPriceSnapshotStore`, `PublicPriceSnapshotMapper`, `PublicPriceSeedRunner`, `PublicPriceSeedService`, `VWorldPublicPriceSyncTargetMapper`, `vworld_public_price_admin_seed_targets`, `vworld_public_price_sync_targets`, `vworld_public_price_coverage_metrics` |
| 좌표 변환 | `VWorldGeocodingApiClient`, `GeocodingApiResponseParser` |
| R-ONE 통계 조회/저장 | `KabROneStatisticsApiClient`, `KabROneApiResponseParser`, `KabROneSyncService`, `KabROneStatisticsMapper`, `kab_r_one_statistical_tables`, `kab_r_one_statistical_items`, `kab_r_one_statistical_data_points` |
| 지역·유형 과거 지표 분석 | `RegionalIndicatorAnalysisController`, `RegionalIndicatorAnalysisService`, `RegionalIndicatorAnalysisMapper`, `MarketIndicatorContextService`, `RegionalIndicatorAnalysisResponse`, `frontend/src/views/SearchResultView.vue` |
| 외부 API raw archive metadata | `external_api_raw_response_archives` |
| 외부 API 로그 | `ExternalApiCallLogger`, `external_api_call_logs` |
| 주소 정제 | `LeaseRiskAddressNormalizer`, `MyBatisLegalDongCodeCatalog` |
| 위험 문장 | `LeaseRiskDiagnosisRiskSummaryService`, `DepositRiskCalculator`, `BuildingRiskAnalyzer` |
| 현재 매물 목록 | 제공하지 않음 | 한국부동산원 R-ONE은 과거 지표 분석용 |

## 구현 전 결정해야 할 사항

- Juso 주소검색 운영 key와 popup return origin/domain을 환경별로 검증하는 절차
- VWorld Geocoder adapter를 진단 본 흐름의 어느 service boundary에 연결할지와 저장 금지 조건을 지키는 호출 방식
- Redis 도입 여부와 cache adapter interface
- 공시가격 원문 API와 VWorld API의 운영 우선순위
- 외부 API 원문 응답의 API별 보존 기간, masking/redaction 기준, 관리자 조회 권한
- 건축HUB 다중 후보를 사용자가 선택하는 UX/API
- 전국 법정동코드 catalog는 `LegalDongCodeSyncRunner`/`backend-legal-dong-sync` batch sync로 구현됨. 남은 결정은 운영 sync 주기, 실행 권한, 실패 알림, 전국 catalog freshness 기준이다.
- `KAB_R_ONE_SYNC_DATA_QUERIES`로 운영에서 실제 저장할 통계자료 기간/지역/항목 조합
- `POST /api/regional-indicator-analyses`가 보여줄 R-ONE/market indicator 조합의 우선순위와 데이터 품질 기준
- 지역/유형 입력을 현재 매물이 아닌 과거 지표 분석으로 분류하는 UX 문구

## Related documents

- [외부 API 구현 기준 문서](/docs/api/external-api/README.md)
- [외부 API 호출 전략](/docs/api/external-api/API_CALL_STRATEGY.md)
- [외부 API 데이터 활용과 통찰 산출 계획](/docs/api/external-api/DATA_USAGE_AND_INSIGHT_PLAN.md)
- [공공데이터 API 연동 전략](/docs/api/PUBLIC_API_STRATEGY.md)
- [ZIP:ON 성장 로드맵](/docs/product/ROADMAP.md)
