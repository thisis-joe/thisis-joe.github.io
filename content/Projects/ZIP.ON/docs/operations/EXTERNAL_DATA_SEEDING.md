---
title: EXTERNAL_DATA_SEEDING
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-29T05:00:06+09:00
---

# 외부 데이터 수동 seed와 sync

> Status: Implemented, guarded manual path

## 목적

이 문서는 로컬 개발자가 Docker MySQL에 실거래가 seed 데이터, 한국부동산원 R-ONE 통계 데이터, VWorld 공시가격 snapshot을 제한적으로 적재하는 절차를 설명한다.

수동 seed/sync는 테스트가 아니다. `DATA_GO_KR_SERVICE_KEY`, `KAB_R_ONE_API_KEY`, `VWORLD_API_KEY`가 설정된 개발 환경에서 명시적으로 실행할 때만 실제 외부 API를 호출한다.

초기 적재, 과거 기간 backfill, 큰 범위 재처리는 이 문서의 수동 seed 경로를 사용한다. 운영 중 최신 완료월을 계속 보강하는 경로는 [외부 실거래가 최신월 scheduler](EXTERNAL_DATA_SCHEDULER.md)를 따른다.

## 저장 흐름

수동 seed는 API 응답을 임시 SQL이나 raw dump로 DB에 넣지 않는다. 모든 실거래가 응답은 아래 흐름을 통과한다.

```text
ExternalDataSeedRunner
-> ExternalDataSeedTargetService
-> external_data_refresh_targets
-> ExternalDataRefreshSchedulerService.refreshDueTransactionMonthTargetsForManualSeed(...)
-> external_data_collection_runs(run_type = MANUAL_SEED)
-> external_data_collection_attempts
-> DataGoKrRentTransactionApiClient / DataGoKrSaleTransactionApiClient
-> RealEstateTransactionFactStore
-> real_estate_transaction_facts
-> MarketStatisticsMonthlyService
-> market_statistics_monthly
```

`VWorldGeocodingApiClient`는 이 seed 흐름에 포함하지 않는다. VWorld Geocoder 좌표 결과는 저장 제약이 있으므로 DB에 저장하지 않는다.

R-ONE 수동 sync는 실거래가 refresh target을 만들지 않고 아래 흐름을 따른다.

```text
KabROneSyncRunner
-> KabROneSyncService
-> external_data_collection_runs(run_type = MANUAL_R_ONE_SYNC)
-> external_data_collection_attempts
-> KabROneStatisticsApiClient
-> KabROneStatisticsMapper
-> kab_r_one_statistical_tables
-> kab_r_one_statistical_items
-> kab_r_one_statistical_data_points
-> MarketIndicatorSyncService
-> market_region_mappings
-> market_indicator_observations
-> market_indicator_trend_summaries
```

R-ONE 통계는 현재 매물 feed가 아니다. 통계표/세부항목은 allowlist 기준으로 저장하고, 통계자료는 `KAB_R_ONE_SYNC_DATA_QUERIES`에 명시한 쿼리만 저장한다. 저장된 통계자료는 `market_indicator_definitions`, `market_indicator_source_bindings` 기준으로 ZIP:ON domain indicator에 연결된다.

R-ONE OpenAPI는 `.do`가 붙은 endpoint를 기준으로 호출한다. 로컬 smoke 확인 기준으로 `SttsApiTbl.do`, `SttsApiTblItm.do`, `SttsApiTblData.do`는 JSON 응답을 반환하지만 `.do`가 없는 경로는 HTML을 반환할 수 있다.

건축물대장 표제부 수동 seed는 이미 확보한 PNU 후보를 건축물대장 조회 파라미터로 되돌려 `building_register_title_snapshots`를 채운다.

```text
BuildingRegisterSeedRunner
-> BuildingRegisterSeedService
-> BuildingRegisterSeedCandidateMapper.findCandidates(...)
-> vworld_public_price_sync_targets / vworld_public_price_admin_seed_targets / property_identity_candidates
-> BuildingRegisterTitleSnapshotStore.findFreshSnapshots(...)
-> external_data_collection_runs(run_type = BUILDING_REGISTER_SEED)
-> external_data_collection_attempts
-> BuildingRegisterApiClient
-> BuildingRegisterTitleSnapshotStore.recordLookupResult(...)
-> building_register_title_snapshots
```

건축물대장 seed는 PNU 19자리에서 법정동코드 10자리, 대지구분, 본번, 부번을 복원할 수 있는 후보만 조회한다. 30일 이내 fresh snapshot이 있으면 API를 다시 호출하지 않고 건너뛴다. 이 seed로 쌓인 `building_register_title_snapshots.pnu`는 다시 VWorld 공시가격 후보 universe에 포함된다.

VWorld 공시가격 수동 seed는 이미 쌓인 주소/물건 근거에서 PNU 후보를 뽑고 아래 흐름을 따른다.

```text
PublicPriceSeedRunner
-> PublicPriceSeedService
-> VWorldPublicPriceSyncTargetMapper.findMaterializationCandidates(...)
-> property_identity_candidates / building_register_title_snapshots / favorites + property / real_estate_transaction_facts / vworld_public_price_admin_seed_targets / legal_dong_codes
-> vworld_public_price_sync_targets
-> VWorldPublicPriceSyncTargetMapper.findCallableTargets(...)
-> PublicPriceSnapshotStore.findFreshLatestAvailable(...)
-> external_data_collection_runs(run_type = PUBLIC_PRICE_SEED)
-> external_data_collection_attempts
-> VWorldPublicPriceApiClient
-> PublicPriceSnapshotStore.recordLookupResult(...)
-> public_price_snapshots
-> vworld_public_price_coverage_metrics
```

공시가격 seed는 주소를 새로 해석하는 흐름이 아니다. 운영자가 명시한 조사 대상은 먼저 `V45__create_vworld_public_price_admin_seed_targets.sql`의 `vworld_public_price_admin_seed_targets`에 넣고, runner가 이를 포함한 여러 후보를 `V44__create_vworld_public_price_sync_targets.sql`의 `vworld_public_price_sync_targets`에 materialize한다. PNU 19자리, 공시가격 data type, match status, confidence threshold를 통과한 target만 VWorld 호출 대상으로 삼는다. 30일 이내 fresh `public_price_snapshots`가 있으면 같은 target은 API를 다시 호출하지 않고 성공 처리한다. `VWORLD_API_KEY`가 없으면 실제 HTTP 호출은 `UNAVAILABLE`로 끝난다. HTTP 200인데 본문이 `INCORRECT_KEY`이면 `VWORLD_API_KEY`뿐 아니라 `VWORLD_DOMAIN`이 VWorld key 발급 시 등록한 도메인과 같은지도 확인한다.

후보 universe는 사용자 요청 cache 수준으로 제한하지 않는다. 현재 materializer는 최소한 아래 source를 target table에 모은다.

- `property_identity_candidates`: 사용자 진단 주소와 JUSO 기반 주소 정제 결과
- `building_register_title_snapshots`: 건축물대장 표제부에서 확정한 PNU
- `favorites + property`: 관심 부동산 주소. PNU가 없으면 `REGION_ONLY/HOLD`
- `real_estate_transaction_facts + legal_dong_codes`: 실거래 fact의 `LAWD_CD`, 법정동명, 지번 본번/부번으로 복원 가능한 PNU
- `vworld_public_price_admin_seed_targets`: 운영자가 명시 등록한 PNU 또는 조사 대상. `EXACT_PNU`와 data type이 있으면 우선순위 높은 callable target이 된다.
- `legal_dong_codes`: 서비스 대상 법정동 bulk coverage. 법정동만으로는 PNU를 만들 수 없으므로 `REGION_ONLY/HOLD`

운영자 seed는 `vworld_public_price_admin_seed_targets`에 먼저 넣는다. runner는 이를 `ADMIN_SEED` source로 `vworld_public_price_sync_targets`에 upsert한다. 이 방식은 운영자가 직접 sync target table을 조작하는 것보다 감사와 반복 실행이 쉽다.

## 안전 기본값

| 변수 | 기본값 | 의미 |
| --- | --- | --- |
| `EXTERNAL_DATA_SEED_ENABLED` | `false` | 일반 backend 실행에서는 runner가 동작하지 않는다. |
| `EXTERNAL_DATA_SEED_MAX_TARGETS_TO_REGISTER` | `1000` | 실수로 수십만 target을 한 번에 만들지 않도록 제한한다. |
| `EXTERNAL_DATA_SEED_MAX_RUNS` | `1` | 한 번에 collection run 하나만 수행한다. |
| `EXTERNAL_DATA_SEED_BATCH_SIZE` | `10` | 한 run에서 처리할 refresh target 수다. |
| `EXTERNAL_DATA_SEED_LAWD_CODE_OFFSET` | `0` | catalog 또는 직접 지정 LAWD_CD 목록에서 건너뛸 code 수다. 전국 수집을 구간별로 나눌 때 쓴다. |
| `EXTERNAL_DATA_SEED_LAWD_CODE_LIMIT` | `0` | 한 번에 사용할 LAWD_CD 수다. `0`은 전체 선택이다. |
| `DATA_GO_KR_TRANSACTION_PAGE_SIZE` | `10` | 일반 진단 호출 기본 페이징 크기다. seed 때만 키운다. |
| `DATA_GO_KR_TRANSACTION_MAX_PAGES` | `1` | 일반 진단 호출 기본 최대 페이지 수다. seed 때만 키운다. |
| `KAB_R_ONE_SYNC_ENABLED` | `false` | 일반 backend 실행에서는 R-ONE runner가 동작하지 않는다. |
| `KAB_R_ONE_SYNC_TABLES` | `true` | 통계표 목록을 sync할지 결정한다. |
| `KAB_R_ONE_SYNC_DATA` | `false` | 통계자료 저장은 명시적으로 켜야 한다. |
| `KAB_R_ONE_SYNC_TABLE_IDS` | ZIP:ON allowlist | 현재 매물 feed가 아니라 과거 지표 분석에 필요한 통계표만 제한한다. |
| `KAB_R_ONE_SYNC_DATA_QUERIES` | 빈 값 | 명시한 `tableId`, `cycle`, 기간, 그룹/분류/항목 조합만 통계자료로 저장한다. |
| `zipon.external.vworld.public-price.seed.enabled` | `false` | 일반 backend 실행에서는 공시가격 seed runner가 동작하지 않는다. |
| `zipon.external.vworld.public-price.seed.exit-when-finished` | `true` | seed 완료 후 Spring context를 닫는다. |
| `zipon.external.vworld.public-price.seed.dry-run` | `false` | 후보 수만 확인하고 VWorld를 호출하지 않는다. |
| `zipon.external.vworld.public-price.seed.standard-year` | 빈 값 | 비워 두면 최신 가용 공시가격을 조회한다. 값이 있으면 4자리 연도만 허용한다. |
| `zipon.external.vworld.public-price.seed.materialize-targets` | `true` | 원천 후보를 `vworld_public_price_sync_targets`에 upsert한다. |
| `zipon.external.vworld.public-price.seed.sync-targets` | `true` | callable sync target을 VWorld 공시가격 API로 조회한다. |
| `zipon.external.vworld.public-price.seed.max-materialization-candidates` | `100` | 프로토타입 운영에서 한 번에 target table로 materialize할 최신 후보 수다. `0` 이하는 SQL limit 없이 조회하므로 사용하지 않는다. |
| `zipon.external.vworld.public-price.seed.max-candidates` | `100` | 한 번에 VWorld 호출 대상으로 가져올 callable target 수다. 프로토타입은 지역별 최신순 100건을 기본 단위로 삼는다. |
| `zipon.external.vworld.public-price.seed.lawd-codes` | 빈 값 | 특정 5자리 `LAWD_CD` 지역만 materialize/sync할 때 쉼표로 지정한다. 프로토타입 seed에서는 비워 두지 말고 지역 단위로 실행한다. |
| `zipon.external.vworld.public-price.seed.include-property-identity-candidates` | `true` | `property_identity_candidates`에서 PNU 후보를 포함한다. |
| `zipon.external.vworld.public-price.seed.include-building-register-snapshots` | `true` | `building_register_title_snapshots`에서 PNU 후보를 포함한다. |
| `zipon.external.vworld.public-price.seed.include-favorite-properties` | `true` | 관심 부동산의 `property` 주소와 연결 가능한 PNU 후보를 포함한다. |
| `zipon.external.vworld.public-price.seed.include-transaction-fact-candidates` | `true` | 실거래 fact의 법정동명/본번/부번으로 만든 PNU 후보를 포함한다. |
| `zipon.external.vworld.public-price.seed.include-admin-seed-targets` | `true` | `vworld_public_price_admin_seed_targets`에 운영자가 등록한 후보를 포함한다. |
| `zipon.external.vworld.public-price.seed.include-service-region-bulk-targets` | `true` | 법정동 단위 coverage metric용 bulk 후보를 포함하되, PNU가 없으면 API 호출 target은 `HOLD`가 된다. |
| `zipon.external.vworld.public-price.seed.transaction-deal-year-month` | 빈 값 | 실거래 fact 후보를 특정 `YYYYMM`으로 제한한다. |
| `zipon.external.vworld.public-price.seed.minimum-callable-confidence-score` | `0.7` | 건축물대장/JUSO 등 일반 후보를 `READY` target으로 올릴 최소 confidence score다. |
| `zipon.external.vworld.public-price.seed.minimum-transaction-confidence-score` | `0.65` | 실거래 fact 파생 target을 callable로 인정할 최소 confidence score다. |
| `zipon.external.vworld.public-price.seed.max-failure-count` | `3` | 실패 횟수가 이 값 이상인 target은 다시 호출하지 않는다. |
| `zipon.external.building-register.seed.enabled` | `false` | 일반 backend 실행에서는 건축물대장 seed runner가 동작하지 않는다. |
| `zipon.external.building-register.seed.exit-when-finished` | `true` | seed 완료 후 Spring context를 닫는다. |
| `zipon.external.building-register.seed.dry-run` | `false` | 후보 수만 확인하고 건축물대장 API를 호출하지 않는다. |
| `zipon.external.building-register.seed.max-candidates` | `100` | 한 번에 건축물대장 조회 대상으로 가져올 최신 PNU 후보 수다. 프로토타입은 지역별 최신순 100건을 기본 단위로 삼는다. |
| `zipon.external.building-register.seed.lawd-codes` | 빈 값 | 특정 5자리 `LAWD_CD` 지역만 조회할 때 쉼표로 지정한다. 프로토타입 seed에서는 비워 두지 말고 지역 단위로 실행한다. |
| `zipon.external.building-register.seed.include-public-price-sync-targets` | `true` | `vworld_public_price_sync_targets`의 PNU 후보를 포함한다. |
| `zipon.external.building-register.seed.include-admin-seed-targets` | `true` | `vworld_public_price_admin_seed_targets`의 운영자 PNU 후보를 포함한다. |
| `zipon.external.building-register.seed.include-property-identity-candidates` | `true` | `property_identity_candidates`의 PNU 후보를 포함한다. |

전국/전체 기간 등록을 의도했다면 `EXTERNAL_DATA_SEED_MAX_TARGETS_TO_REGISTER=0`으로 명시한다. 전체 due target을 비울 때까지 수집하려면 `EXTERNAL_DATA_SEED_MAX_RUNS=0`으로 명시한다.

## 지역 범위

실거래가 API는 `LAWD_CD` 5자리와 `DEAL_YMD` 6자리로 조회한다.

수동 seed의 LAWD_CD 선택 방식은 두 가지다.

1. `EXTERNAL_DATA_SEED_LAWD_CODES`에 5자리 코드를 쉼표로 직접 지정한다.
2. 비워 두면 `legal_dong_codes`의 active row에서 distinct `lawd_cd`를 읽는다.

현재 Flyway starter seed의 `legal_dong_codes`는 전국 카탈로그가 아니다. 기본 DB에는 관악구와 성동구 일부 seed만 들어 있다. 따라서 `EXTERNAL_DATA_SEED_LAWD_CODES`를 비우고 실행하면 “현재 catalog가 가진 지역 전체”이지 “대한민국 전국”이 아니다.

전국 적재로 간주하려면 둘 중 하나를 만족해야 한다.

- 전국 시군구 `LAWD_CD` 목록을 `EXTERNAL_DATA_SEED_LAWD_CODES`에 제공한다.
- `legal_dong_codes`가 전국 catalog로 확장된 뒤 `EXTERNAL_DATA_SEED_REQUIRE_NATIONWIDE_CATALOG=true`를 켜고 실행한다.

`EXTERNAL_DATA_SEED_REQUIRE_NATIONWIDE_CATALOG=true`이면 distinct `lawd_cd` 수가 `EXTERNAL_DATA_SEED_NATIONWIDE_MINIMUM_LAWD_CODE_COUNT`보다 작을 때 실행을 중단한다.

## 전국 법정동코드 catalog sync

전국 seed를 catalog 기반으로 실행하려면 먼저 행정안전부 행정표준코드 법정동코드 API로 `legal_dong_codes`를 확장한다.

동기화는 원천 API row를 `legal_dong_code_source_rows`에 보존하고, 실거래가 `LAWD_CD` catalog로 쓸 수 있는 하위 법정동 row만 `legal_dong_codes`에 upsert한다. `legal_dong_code_source_rows`는 `region_cd`, `sido_cd`, `sgg_cd`, `umd_cd`, `ri_cd`, `locatjumin_cd`, `locatjijuk_cd`, `locatadd_nm`, `locathigh_cd`, `locallow_nm`, `adpt_de`처럼 원천 코드 계층을 다시 검토할 때 필요한 필드를 담는다.

```bash
LEGAL_DONG_CODE_SYNC_PAGE_SIZE=1000 \
LEGAL_DONG_CODE_SYNC_MAX_PAGES=0 \
docker compose --profile seeding run --rm backend-legal-dong-sync
```

작은 smoke test만 원하면 지역명과 page 제한을 둔다.

```bash
LEGAL_DONG_CODE_SYNC_LOCATADD_NAME=서울특별시 \
LEGAL_DONG_CODE_SYNC_MAX_PAGES=1 \
docker compose --profile seeding run --rm backend-legal-dong-sync
```

동기화 후 catalog 범위를 확인한다.

```bash
docker compose -f docker-compose.yml exec mysql sh -lc '
mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "
SELECT COUNT(*) AS legal_dong_count,
       COUNT(DISTINCT lawd_cd) AS lawd_count
FROM legal_dong_codes
WHERE active = TRUE;

SELECT COUNT(*) AS source_row_count
FROM legal_dong_code_source_rows
WHERE source_status = 'ACTIVE';
"
'
```

## 한국부동산원 R-ONE 통계 sync

`.env`의 `KAB_R_ONE_API_KEY`에는 한국부동산원 R-ONE OpenAPI 인증키를 넣는다. 저장소, 문서, 테스트 fixture, 로그에는 실제 키를 남기지 않는다.

통계표 목록과 세부항목만 먼저 수집한다. 이 명령은 `KAB_R_ONE_SYNC_DATA=false`가 기본이므로 통계자료 row를 저장하지 않는다.

```bash
KAB_R_ONE_SYNC_TABLES=true \
KAB_R_ONE_SYNC_ITEMS=true \
KAB_R_ONE_SYNC_DATA=false \
KAB_R_ONE_SYNC_PAGE_SIZE=1000 \
KAB_R_ONE_SYNC_MAX_PAGES=0 \
docker compose --profile seeding run --rm backend-kab-r-one-sync
```

특정 통계자료까지 저장하려면 `KAB_R_ONE_SYNC_DATA=true`와 `KAB_R_ONE_SYNC_DATA_QUERIES`를 함께 지정한다. 쿼리 하나는 `|`로 구분한 `key=value` 묶음이고, 여러 쿼리는 쉼표로 구분한다.

```bash
KAB_R_ONE_SYNC_DATA=true \
KAB_R_ONE_SYNC_DATA_QUERIES='tableId=A_2024_00615|cycle=MM|start=202401|end=202412|grpId=...|clsId=...|itmId=...' \
docker compose --profile seeding run --rm backend-kab-r-one-sync
```

`grpId`, `clsId`, `itmId`는 통계표별 세부항목 의미가 다르다. 먼저 `kab_r_one_statistical_items`를 확인한 뒤 해당 통계표에 맞는 값을 사용한다. 값이 불확실하면 통계자료를 저장하지 말고 통계표/세부항목만 sync한다.

## Docker MySQL에 seed 실행

`.env`에는 실제 key를 넣되, git에 남기지 않는다.

```bash
cd "$(git rev-parse --show-toplevel)"
[ -f .env ] || cp .env.example .env
```

Docker MySQL을 먼저 실행한다.

```bash
docker compose -f docker-compose.yml up -d mysql
docker compose -f docker-compose.yml ps
```

작은 실제 API 검증 예시다. 관악구 `11620`, 연립/다세대 전월세 1개월 1개 target만 등록하고 1개 target만 수집한다.

`backend-seed` profile은 전용 수동 실행 경로이므로 컨테이너 안에서는 `EXTERNAL_DATA_SEED_ENABLED=true`를 강제로 사용한다. 일반 backend 실행에서는 `.env`의 기본값 `false`가 유지된다.

```bash
EXTERNAL_DATA_SEED_SOURCE_CODES=DATA_GO_KR_ROW_HOUSE_RENT \
EXTERNAL_DATA_SEED_LAWD_CODES=11620 \
EXTERNAL_DATA_SEED_USE_CATALOG_LAWD_CODES=false \
EXTERNAL_DATA_SEED_FROM_YEAR_MONTH=202605 \
EXTERNAL_DATA_SEED_TO_YEAR_MONTH=202605 \
EXTERNAL_DATA_SEED_MAX_TARGETS_TO_REGISTER=1 \
EXTERNAL_DATA_SEED_BATCH_SIZE=1 \
EXTERNAL_DATA_SEED_MAX_RUNS=1 \
DATA_GO_KR_TRANSACTION_PAGE_SIZE=1000 \
DATA_GO_KR_TRANSACTION_MAX_PAGES=20 \
docker compose --profile seeding run --rm backend-seed
```

전국/전체 기간 target 등록을 의도한 실행 예시는 아래와 같다. API 호출량이 매우 커질 수 있으므로 먼저 `EXTERNAL_DATA_SEED_DRY_RUN=true`로 계획 수를 확인한다.

이 명령은 `legal_dong_codes`가 전국 catalog인지 먼저 검증한다. catalog가 starter seed 상태라면 실행이 중단되는 것이 정상이다.

```bash
EXTERNAL_DATA_SEED_DRY_RUN=true \
EXTERNAL_DATA_SEED_REQUIRE_NATIONWIDE_CATALOG=true \
EXTERNAL_DATA_SEED_MAX_TARGETS_TO_REGISTER=0 \
docker compose --profile seeding run --rm backend-seed
```

dry-run 결과를 확인한 뒤 실제 등록/수집을 실행한다.

전국/전체 기간은 호출량이 매우 크다. 먼저 LAWD_CD 구간을 작게 나눠 target 등록과 수집을 반복한다. 아래 예시는 전국 catalog 중 첫 10개 `LAWD_CD`만 대상으로 계획 수를 확인한다.

```bash
EXTERNAL_DATA_SEED_DRY_RUN=true \
EXTERNAL_DATA_SEED_REQUIRE_NATIONWIDE_CATALOG=true \
EXTERNAL_DATA_SEED_LAWD_CODE_OFFSET=0 \
EXTERNAL_DATA_SEED_LAWD_CODE_LIMIT=10 \
EXTERNAL_DATA_SEED_MAX_TARGETS_TO_REGISTER=0 \
docker compose --profile seeding run --rm backend-seed
```

실행 구간을 늘릴 때는 `EXTERNAL_DATA_SEED_LAWD_CODE_OFFSET`을 이전 구간만큼 증가시킨다. 예를 들어 `LIMIT=10`으로 돌렸다면 다음 구간은 `OFFSET=10`, 그 다음은 `OFFSET=20`이다. 같은 target은 `external_data_refresh_targets`의 unique key로 중복 등록되지 않는다.

```bash
EXTERNAL_DATA_SEED_DRY_RUN=false \
EXTERNAL_DATA_SEED_REQUIRE_NATIONWIDE_CATALOG=true \
EXTERNAL_DATA_SEED_LAWD_CODE_OFFSET=0 \
EXTERNAL_DATA_SEED_LAWD_CODE_LIMIT=10 \
EXTERNAL_DATA_SEED_MAX_TARGETS_TO_REGISTER=0 \
EXTERNAL_DATA_SEED_BATCH_SIZE=50 \
EXTERNAL_DATA_SEED_MAX_RUNS=0 \
DATA_GO_KR_TRANSACTION_PAGE_SIZE=1000 \
DATA_GO_KR_TRANSACTION_MAX_PAGES=100 \
docker compose --profile seeding run --rm backend-seed
```

## 로컬 JVM으로 seed 실행

Docker 컨테이너 대신 로컬 JVM에서 실행할 수도 있다. 이때도 저장소는 Docker MySQL이다.

```bash
cd "$(git rev-parse --show-toplevel)"
set -a
source .env
set +a

cd backend
./mvnw spring-boot:run \
  -Dspring-boot.run.profiles=local \
  -Dspring-boot.run.arguments="--zipon.external.data.seed.enabled=true --zipon.external.data.seed.source-codes=DATA_GO_KR_ROW_HOUSE_RENT --zipon.external.data.seed.lawd-codes=11620 --zipon.external.data.seed.use-catalog-lawd-codes=false --zipon.external.data.seed.from-year-month=202605 --zipon.external.data.seed.to-year-month=202605 --zipon.external.data.seed.max-targets-to-register=1 --zipon.external.data.seed.batch-size=1 --zipon.external.data.seed.max-runs=1 --zipon.external.data-go-kr.transaction-page-size=1000 --zipon.external.data-go-kr.transaction-max-pages=20"
```

## VWorld 공시가격 seed 실행

공시가격 seed는 `docker-compose.yml`의 `backend-public-price-seed` service로 실행한다. 이 service는 `PUBLIC_PRICE_SEED_*` 환경변수를 `zipon.external.vworld.public-price.seed.*` 설정에 연결한다.

먼저 후보 universe를 target table에만 물질화한다. 이 명령은 VWorld API를 호출하지 않는다.

```bash
cd "$(git rev-parse --show-toplevel)"
[ -f .env ] || cp .env.example .env

PUBLIC_PRICE_SEED_MATERIALIZE_TARGETS=true \
PUBLIC_PRICE_SEED_SYNC_TARGETS=false \
PUBLIC_PRICE_SEED_MAX_MATERIALIZATION_CANDIDATES=100 \
docker compose --profile seeding run --rm backend-public-price-seed
```

후보 universe와 coverage가 기대 범위라면 실제 조회를 실행한다. 이 명령은 이미 materialize된 target 중 callable target만 20개 조회한다.

```bash
cd "$(git rev-parse --show-toplevel)"

PUBLIC_PRICE_SEED_MATERIALIZE_TARGETS=false \
PUBLIC_PRICE_SEED_SYNC_TARGETS=true \
PUBLIC_PRICE_SEED_MAX_CANDIDATES=20 \
docker compose --profile seeding run --rm backend-public-price-seed
```

프로토타입에서는 전국 전체를 무작정 호출하지 않는다. `PUBLIC_PRICE_SEED_LAWD_CODES`와 `PUBLIC_PRICE_SEED_MAX_CANDIDATES`를 함께 지정하여 지역별 최신순 100건만 처리한다. 예를 들어 관악구(`11620`) 후보만 최대 100건 조회하려면 아래처럼 실행한다.

```bash
cd "$(git rev-parse --show-toplevel)"

PUBLIC_PRICE_SEED_LAWD_CODES=11620 \
PUBLIC_PRICE_SEED_MATERIALIZE_TARGETS=true \
PUBLIC_PRICE_SEED_SYNC_TARGETS=true \
PUBLIC_PRICE_SEED_MAX_MATERIALIZATION_CANDIDATES=100 \
PUBLIC_PRICE_SEED_MAX_CANDIDATES=100 \
docker compose --profile seeding run --rm backend-public-price-seed
```

특정 기준연도만 조회하려면 `standard-year`를 4자리로 지정한다. 실거래 fact 기반 후보까지 포함하려면 먼저 `sync-targets=false`로 target universe와 coverage를 보고, `minimum-transaction-confidence-score`를 높게 잡아 낮은 신뢰도 후보가 과도하게 호출되지 않게 한다.

```bash
PUBLIC_PRICE_SEED_STANDARD_YEAR=2025 \
PUBLIC_PRICE_SEED_INCLUDE_TRANSACTION_FACT_CANDIDATES=true \
PUBLIC_PRICE_SEED_TRANSACTION_DEAL_YEAR_MONTH=202605 \
PUBLIC_PRICE_SEED_MINIMUM_TRANSACTION_CONFIDENCE_SCORE=0.7 \
PUBLIC_PRICE_SEED_MAX_MATERIALIZATION_CANDIDATES=100 \
PUBLIC_PRICE_SEED_MAX_CANDIDATES=50 \
docker compose --profile seeding run --rm backend-public-price-seed
```

로컬 JVM으로도 동일하게 실행할 수 있다.

```bash
cd "$(git rev-parse --show-toplevel)"
set -a
source .env
set +a

cd backend
./mvnw spring-boot:run \
  -Dspring-boot.run.profiles=local \
  -Dspring-boot.run.arguments="--zipon.external.vworld.public-price.seed.enabled=true --zipon.external.vworld.public-price.seed.materialize-targets=true --zipon.external.vworld.public-price.seed.sync-targets=false --zipon.external.vworld.public-price.seed.max-materialization-candidates=100"
```

공시가격 seed는 보증금 위험판단의 보조 근거를 미리 채우는 작업이다. 공시가격은 시세, 권리관계, 선순위 보증금, 물리적 하자를 확정하지 않는다.

프로토타입 단계에서는 `vworld_public_price_sync_targets`의 모든 후보나 전국 모든 PNU를 전부 호출하지 않는다. 실제 로컬 측정에서 건축물대장 1,679건 처리에 약 14분, VWorld 공시가격 1,000건 처리에 약 2~3분이 걸렸고, 전국 모든 필지로 확장하면 API 쿼터와 실행 시간이 프로토타입 목적을 벗어난다. 따라서 ZIP:ON MVP 검증용 seed는 `LAWD_CD`를 명시한 지역별 최신순 100건을 기본 단위로 삼고, 사용자가 정확 주소를 진단하는 경우에는 필요한 PNU만 on-demand로 보강한다.

## 건축물대장 표제부 seed 실행

건축물대장 seed는 `docker-compose.yml`의 `backend-building-register-seed` service로 실행한다. 이 service는 `BUILDING_REGISTER_SEED_*` 환경변수를 `zipon.external.building-register.seed.*` 설정에 연결한다.

먼저 dry-run으로 PNU 후보 수를 확인한다. 이 명령은 건축물대장 API를 호출하지 않는다.

```bash
cd "$(git rev-parse --show-toplevel)"
[ -f .env ] || cp .env.example .env

BUILDING_REGISTER_SEED_DRY_RUN=true \
BUILDING_REGISTER_SEED_MAX_CANDIDATES=100 \
docker compose --profile seeding run --rm backend-building-register-seed
```

후보 수가 기대 범위라면 작은 batch부터 실제 조회한다.

```bash
cd "$(git rev-parse --show-toplevel)"

BUILDING_REGISTER_SEED_DRY_RUN=false \
BUILDING_REGISTER_SEED_MAX_CANDIDATES=20 \
docker compose --profile seeding run --rm backend-building-register-seed
```

지역별 최신순 100건 batch로 운영할 때는 `BUILDING_REGISTER_SEED_LAWD_CODES`를 지정한다. 예를 들어 관악구(`11620`) 후보만 최대 100건 조회하려면 아래처럼 실행한다.

```bash
cd "$(git rev-parse --show-toplevel)"

BUILDING_REGISTER_SEED_LAWD_CODES=11620 \
BUILDING_REGISTER_SEED_DRY_RUN=false \
BUILDING_REGISTER_SEED_MAX_CANDIDATES=100 \
docker compose --profile seeding run --rm backend-building-register-seed
```

운영자가 특정 PNU를 우선 확인하려면 `vworld_public_price_admin_seed_targets`에 해당 PNU를 넣고 아래처럼 admin seed만 대상으로 좁혀 실행한다.

```bash
BUILDING_REGISTER_SEED_DRY_RUN=false \
BUILDING_REGISTER_SEED_MAX_CANDIDATES=20 \
BUILDING_REGISTER_SEED_INCLUDE_PUBLIC_PRICE_SYNC_TARGETS=false \
BUILDING_REGISTER_SEED_INCLUDE_ADMIN_SEED_TARGETS=true \
BUILDING_REGISTER_SEED_INCLUDE_PROPERTY_IDENTITY_CANDIDATES=false \
docker compose --profile seeding run --rm backend-building-register-seed
```

건축물대장 seed는 주소/PNU 연결을 보강하는 작업이다. 대장에 조회 결과가 없거나 여러 결과가 나오는 경우에는 `external_data_collection_attempts`에 `EMPTY` 또는 성공/복수 snapshot으로 남고, 서비스는 지역 통계나 실거래가 같은 다른 근거를 계속 사용할 수 있어야 한다.

## 검증 SQL

실행 후 아래 count가 이어져야 한다.

```bash
docker compose -f docker-compose.yml exec mysql sh -lc '
mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "
SELECT run_type, run_status, target_count, success_count, empty_count, failure_count, skipped_count
FROM external_data_collection_runs
ORDER BY id DESC
LIMIT 5;

SELECT attempt_status, COUNT(*) AS count
FROM external_data_collection_attempts
GROUP BY attempt_status;

SELECT lawd_code, deal_year_month, transaction_api_type, COUNT(*) AS count
FROM real_estate_transaction_facts
GROUP BY lawd_code, deal_year_month, transaction_api_type
ORDER BY lawd_code, deal_year_month, transaction_api_type;

SELECT lawd_code, deal_year_month, property_type, trade_kind, COUNT(*) AS count
FROM market_statistics_monthly
GROUP BY lawd_code, deal_year_month, property_type, trade_kind
ORDER BY lawd_code, deal_year_month, property_type, trade_kind;

SELECT COUNT(*) AS r_one_table_count
FROM kab_r_one_statistical_tables;

SELECT table_id, COUNT(*) AS item_count
FROM kab_r_one_statistical_items
GROUP BY table_id
ORDER BY table_id;

SELECT table_id, data_cycle_code, COUNT(*) AS data_point_count
FROM kab_r_one_statistical_data_points
GROUP BY table_id, data_cycle_code
ORDER BY table_id, data_cycle_code;

SELECT COUNT(*) AS market_indicator_definition_count
FROM market_indicator_definitions;

SELECT binding_status, COUNT(*) AS count
FROM market_indicator_source_bindings
GROUP BY binding_status;

SELECT mapping_status, COUNT(*) AS count
FROM market_region_mappings
GROUP BY mapping_status;

SELECT indicator_code, COUNT(*) AS observation_count
FROM market_indicator_observations
GROUP BY indicator_code
ORDER BY indicator_code;

SELECT indicator_code, COUNT(*) AS trend_summary_count
FROM market_indicator_trend_summaries
GROUP BY indicator_code
ORDER BY indicator_code;

SELECT data_type, lookup_status, COUNT(*) AS public_price_snapshot_count
FROM public_price_snapshots
WHERE is_active = TRUE
GROUP BY data_type, lookup_status;

SELECT lookup_status, COUNT(*) AS building_register_snapshot_count
FROM building_register_title_snapshots
WHERE is_active = TRUE
GROUP BY lookup_status;

SELECT sync_status, match_status, COUNT(*) AS target_count
FROM vworld_public_price_sync_targets
GROUP BY sync_status, match_status
ORDER BY sync_status, match_status;

SELECT source_type, COUNT(*) AS target_count
FROM vworld_public_price_sync_targets
GROUP BY source_type
ORDER BY source_type;

SELECT total_transaction_fact_row_count,
       transaction_pnu_candidate_count,
       total_sync_target_count,
       callable_sync_target_count,
       exact_pnu_count,
       building_ledger_derived_count,
       juso_derived_count,
       transaction_derived_count,
       multiple_candidate_count,
       region_only_count,
       unresolved_count,
       vworld_lookup_success_count,
       vworld_lookup_failure_count,
       vworld_lookup_hold_count,
       public_price_snapshot_count,
       measured_at
FROM vworld_public_price_coverage_metrics
ORDER BY id DESC
LIMIT 5;
"
'
```

실거래가 수동 seed의 `external_data_collection_runs.run_type`은 `MANUAL_SEED`, R-ONE sync는 `MANUAL_R_ONE_SYNC`, 공시가격 seed는 `PUBLIC_PRICE_SEED`, 건축물대장 seed는 `BUILDING_REGISTER_SEED`여야 한다. API에 데이터가 없으면 attempt는 `EMPTY`가 될 수 있으며, 이 경우 fact/statistics/snapshot row가 생기지 않는 것이 정상이다. 공시가격 후보나 건축물대장 후보가 fresh DB snapshot에 걸리면 API 호출 없이 skipped count가 늘어날 수 있다.

`PublicPriceSeedServiceIntegrationTest`는 실거래 fact 3건에서 `DERIVED_FROM_TRANSACTION/READY` target이 만들어지는 경로, PNU가 없는 관심 부동산이 `REGION_ONLY/HOLD` target으로 남는 경로, 운영자 등록 row가 `ADMIN_SEED/READY` target으로 materialize되는 경로를 검증한다. `BuildingRegisterSeedServiceIntegrationTest`는 운영자 PNU 후보가 dry-run에서 건축물대장 조회 후보로 잡히고 실제 API 호출과 collection run 생성은 일어나지 않는 경로를 검증한다.

공시가격 seed만 좁혀 확인하려면 아래 SQL을 사용한다.

```bash
docker compose -f docker-compose.yml exec -T mysql sh -lc 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' <<'SQL'
SELECT run_type, run_status, target_count, success_count, empty_count, failure_count, skipped_count
FROM external_data_collection_runs
WHERE run_type = 'PUBLIC_PRICE_SEED'
ORDER BY id DESC
LIMIT 5;

SELECT attempt_status, COUNT(*) AS count
FROM external_data_collection_attempts a
JOIN external_data_collection_runs r ON r.id = a.run_id
WHERE r.run_type = 'PUBLIC_PRICE_SEED'
GROUP BY attempt_status;

SELECT data_type, COUNT(*) AS active_snapshot_count, MAX(last_seen_at) AS latest_seen_at
FROM public_price_snapshots
WHERE is_active = TRUE
GROUP BY data_type;

SELECT sync_status, match_status, COUNT(*) AS target_count
FROM vworld_public_price_sync_targets
GROUP BY sync_status, match_status
ORDER BY sync_status, match_status;

SELECT total_sync_target_count, callable_sync_target_count, public_price_snapshot_count, measured_at
FROM vworld_public_price_coverage_metrics
ORDER BY id DESC
LIMIT 5;
SQL
```

## 다른 PC에서 보기

실제 seed 결과는 Docker volume `zipon_mysql_data`에 저장된다. 이 volume은 로컬 PC 안에 있으므로 git push만으로 다른 PC에 데이터가 전달되지는 않는다.

다른 PC에서 같은 데이터를 보려면 SQL dump를 파일로 내보내고 별도 안전한 채널로 전달한다. dump에는 실제 거래 fact가 들어갈 수 있으므로 repository에 커밋하지 않는다.

seed 결과 공유용 dump는 schema 전체보다 아래 table만 우선 권장한다.

```text
legal_dong_code_source_rows
legal_dong_codes
external_data_refresh_targets
external_data_collection_runs
external_data_collection_attempts
real_estate_transaction_facts
market_statistics_monthly
kab_r_one_statistical_tables
kab_r_one_statistical_items
kab_r_one_statistical_data_points
market_indicator_definitions
market_indicator_source_bindings
market_region_mappings
market_indicator_observations
market_indicator_trend_summaries
market_indicator_sync_targets
```

```bash
mkdir -p tmp/db-dumps
docker compose -f docker-compose.yml exec mysql sh -lc \
  'mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" --no-tablespaces --replace --no-create-info "$MYSQL_DATABASE" legal_dong_code_source_rows legal_dong_codes external_data_refresh_targets external_data_collection_runs external_data_collection_attempts real_estate_transaction_facts market_statistics_monthly kab_r_one_statistical_tables kab_r_one_statistical_items kab_r_one_statistical_data_points market_indicator_definitions market_indicator_source_bindings market_region_mappings market_indicator_observations market_indicator_trend_summaries market_indicator_sync_targets' \
  > tmp/db-dumps/zipon-external-seed.sql
```

다른 PC에서는 같은 branch를 받은 뒤 MySQL을 띄우고 dump를 import한다.

```bash
docker compose -f docker-compose.yml up -d mysql
docker compose -f docker-compose.yml exec -T mysql sh -lc \
  'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  < tmp/db-dumps/zipon-external-seed.sql
```

## 테스트 원칙

- 테스트는 실제 외부 API를 호출하지 않는다.
- `ExternalDataSeedTargetServiceTest`는 target 등록과 제한 catalog 검증만 확인한다.
- `LegalDongCodeSyncServiceTest`는 fake 법정동코드 API client로 전국 catalog sync 전처리의 source row 보존과 leaf catalog upsert 계산을 확인한다.
- `ExternalDataRefreshSchedulerServiceTest`는 fake transaction client로 `MANUAL_SEED` run, attempt, fact, statistics 흐름을 확인한다.
- `KabROneSyncServiceTest`는 mock R-ONE client로 `MANUAL_R_ONE_SYNC` run, attempt, table/item/data upsert와 market indicator refresh 호출 흐름을 확인한다.
- `MarketIndicatorDomainIntegrationTest`는 저장된 R-ONE 통계자료가 `market_region_mappings`, `market_indicator_observations`, `market_indicator_trend_summaries`로 변환되는지 확인한다.
- `KabROneStatisticsSchemaIntegrationTest`는 Flyway가 R-ONE 통계 schema와 market indicator domain schema를 Testcontainers MySQL에 적용하는지 확인한다.
- `DataGoKrRentTransactionApiClientTest`, `DataGoKrSaleTransactionApiClientTest`는 `MockRestServiceServer`로 페이징 query와 parser 연동을 확인한다.
