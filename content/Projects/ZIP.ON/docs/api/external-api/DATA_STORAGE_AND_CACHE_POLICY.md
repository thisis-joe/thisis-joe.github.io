---
title: DATA_STORAGE_AND_CACHE_POLICY
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-27T05:00:07+09:00
---

# 외부 API 데이터 저장과 캐시 정책

> Status: Current External Data Policy

이 문서는 외부 API 결과를 MyBatis/Flyway DB에 저장할지, Redis에 캐시할지, 매번 실시간 호출할지, object storage에 원문을 보존할지 판단하는 기준이다. 현재 repository에는 Redis 기반 `VolatileStateStore` adapter가 있지만, 적용 범위는 access token denylist cache, 로그인 실패 rate limit, scheduler lock으로 제한되어 있다. 외부 API raw response short TTL cache와 object storage adapter는 아직 없다. 다만 원문 보존이 필요한 경우를 대비해 DB에는 raw body가 아니라 object metadata만 담는 `external_api_raw_response_archives` schema가 있다. 따라서 이 문서는 외부 API 저장/캐시를 즉시 넓게 도입하라는 지시가 아니라 구현 판단 기준이다.

## 판단 원칙

```text
코드표/기준정보: DB 저장 후보
월/연 단위 공개 데이터: DB 저장 또는 긴 TTL 캐시 후보
사용자 주소별 반복 조회: Redis short TTL 후보
실시간 상태 또는 민감 상태: 실시간 호출 후보
원문 재현이 필요한 큰 payload: object storage + DB metadata 후보
API key/개인정보/토큰: 저장 금지
```

## 데이터 종류별 정책

| 데이터 종류 | 예시 | 추천 처리 | TTL/갱신주기 | 이유 | 주의사항 |
| --- | --- | --- | --- | --- | --- |
| 행정코드/법정동코드 | `region_cd`, `sido_cd`, `sgg_cd`, `umd_cd`, `locatadd_nm` | DB 저장. 원천 row는 `legal_dong_code_source_rows`, leaf 조회 catalog는 `legal_dong_codes` | 수시/월 1회 동기화 후보 | 모든 외부 API의 선행 key이며 변경 빈도가 낮다. | 폐지/변경 코드 이력 처리 필요 |
| 읍면동 경계 polygon | VWorld `LT_C_ADEMD_INFO` GeoJSON 경계 | 현재 구현은 DB 저장 없음. 지도 응답 생성 시 실시간 조회 | 저장 없음. 후속 short TTL 후보 | 가능 지역을 원형이 아니라 실제 경계로 보여주기 위한 화면 보조 데이터 | VWorld key/권한/응답 실패 시 빈 경계로 두고 원형 fallback 금지 |
| 주소 정제 결과 | 사용자 주소 -> Juso 선택 결과 | Redis short TTL + 진단 snapshot | 수 분~수 일 | 같은 주소를 반복 입력할 수 있다. | 원문 주소는 개인정보 가능성이 있어 cache key hash 고려 |
| 물건 식별 후보 | 정규화 주소 + `AddressResolution` + 건축물대장 판별 결과 | DB `property_identity_candidates` | idempotent upsert, `last_seen_at` 갱신 | PNU, 본번/부번, match/confidence/data_quality를 후속 snapshot/evidence와 연결해야 한다. | 확정 물건이 아니라 후보. 동·호/단지/복수 필지 확인 전에는 사용자에게 단정 표현 금지 |
| 좌표 변환 결과 | VWorld Geocoder 주소 -> 좌표 | 저장하지 않음. 후행 API 호출 직전 실시간 사용 | 저장 없음 | 공식 문서가 별도 저장장치나 DB 저장을 금지한다. | 원문 주소와 좌표를 DB/Redis 캐시에 넣지 않는다. |
| 건축물대장성 기본정보 | 주용도, 대장구분, 가구수, 사용승인일 | DB `building_register_title_snapshots` + 실시간 fallback | 30일 DB-first | 같은 건물 반복 조회가 많고 진단 근거로 재사용 가능 | 원본 전체가 아니라 표제부 최소 snapshot. 위반건축물·전유부·권리관계 확정으로 표현 금지 |
| 토지/임야 기본정보 | 지목, 면적, 대장구분 | DB snapshot 또는 장기 캐시 | 1~3개월 후보 | 토지/임야 진단에서 반복 사용 | 소유자/권리정보로 오해 금지 |
| 실거래가 | `LAWD_CD + DEAL_YMD` 거래 목록 | DB fact 저장 우선. Redis는 후속 short TTL 보조 후보 | 일 1회 갱신 후보 | 외부 호출량을 줄이고 비교 표본과 월별 통계에 반복 사용 | 거래 없음은 안전함이 아님. 원본 raw response를 무제한 저장하지 않고 정규화 fact만 저장 |
| 한국부동산원 R-ONE 통계표/세부항목 | `STATBL_ID`, `ITM_ID`, `GRP_ID`, `CLS_ID` | DB `kab_r_one_statistical_tables`, `kab_r_one_statistical_items` | 월 1회/수동 갱신 후보 | 과거 지표 분석의 코드표이며 변경 빈도가 낮다. | 현재 매물 목록으로 해석 금지 |
| 한국부동산원 R-ONE 통계자료 | `STATBL_ID`, `DTACYCLE_CD`, 기간, 그룹/분류/항목별 `DTA_VAL` | DB `kab_r_one_statistical_data_points` | 통계 주기별 갱신 | 지역·유형 과거 지표 리포트에서 반복 사용 | `DTA_VAL` 단위는 `UI_NM` 기준으로 해석 |
| 공시가격/공시지가 | 공동주택가격, 개별주택가격, 개별공시지가 | DB `public_price_snapshots` + 실시간 fallback. Redis는 후속 보조 후보 | 30일 DB-first, 원문 bulk 적재는 별도 결정 | PNU와 기준연도 단위 반복 조회를 줄이고 진단 근거를 재현한다. | 현재 구현은 VWorld 공동주택/개별주택 공시가격 후보만 저장한다. 동·호 정밀 매칭 신뢰도 표시 필요 |
| 진단 판단 근거 | criterion evidence, missingData, limitation, user action | DB `risk_evidence_snapshots` | 진단 이력 보존 정책과 동일 | 응답 JSON만으로는 항목별 품질 점검과 재분석이 어렵다. | 원천 공공데이터 fact가 아니라 해당 진단 시점의 설명 가능한 claim이다. source row id 정밀 연결은 후속 확장 |
| 용도지역/지구/구역 | 용도지역명, 용도지구명 | DB 또는 긴 TTL cache | 고시 변경 기준 | 상가/토지/건물 투자 판단의 반복 기준 | 최종 인허가 가능성 확정 금지 |
| 상권 데이터 | 업소 분포, 폐업/영업 상태 | Redis/DB 후보 | 데이터 제공 주기 확인 | 창업 진단에서 반복 사용 | 장사 성공 가능성 확정 금지 |
| 생활 인프라 데이터 | 학교, 관리비, 안전시설 | DB 또는 긴 TTL cache | 제공기관 갱신주기 | 주거 적합성 보조 | 생활 만족도 확정 금지 |
| 환경·재난 데이터 | 침수, 산사태, 토지피복 | DB 또는 긴 TTL cache | 제공기관 갱신주기 | 저지대/토지/임야 리스크 보조 | 실제 현장 상태와 다를 수 있음 |
| 중개업소/사업자 상태 | 등록 여부, 행정처분, 사업자 상태 | 실시간 또는 짧은 TTL | 수 시간~1일 후보 | 계약 직전 확인 성격 | 신뢰도/사기 여부 확정 금지 |
| 외부 API 원천 응답 전문 | XML/JSON raw body | object storage 후보, DB에는 `external_api_raw_response_archives` metadata만 저장 | 보존 목적별 결정 | 장애 재현/감사 목적 | API별 raw DB table 금지. API key와 개인정보 redaction 필요 |
| 외부 API 에러 응답 | resultCode, resultMsg, status | DB log | 운영 보존 기간 | 장애 분석과 운영 관측성 | service key 원문 저장 금지 |
| 조회 결과 없음 | `totalCount=0`, 빈 item | short TTL cache 후보 | 짧게, 예: 수 분~수 시간 | 같은 빈 결과 반복 호출 방지 | 빈 결과를 안전함으로 해석 금지 |

## 현재 repository 기준

| 저장소 | 현재 상태 | 관련 파일 |
| --- | --- | --- |
| MySQL/MyBatis/Flyway | 구현됨 | `backend/src/main/resources/db/migration`, `com.zipon.mapper` |
| 외부 API 호출 로그 | 구현됨 | `external_api_call_logs`, `ExternalApiCallLogger`, `AdminExternalApiCallLogController` |
| 법정동코드 source row | 구현됨 | `legal_dong_code_source_rows`, `LegalDongCodeMapper.upsertLegalDongCodeSourceRow(...)`, `LegalDongCodeSyncService` |
| 읍면동 경계 polygon 조회 | 구현됨, 저장 없음 | `VWorldLegalDongBoundaryApiClient`, `LegalDongBoundaryApiResponseParser`, `MapAnalyzableLocationResponse.boundaryPolygons` |
| 외부 데이터 수집 lineage | 구현됨 | `external_data_sources`, `external_data_refresh_targets`, `external_data_collection_runs`, `external_data_collection_attempts`, `ExternalDataCollectionService`, `ExternalDataRefreshTargetMapper` |
| 외부 API raw archive metadata | schema 구현됨, object storage adapter 미구현 | `external_api_raw_response_archives`, `V26__create_external_api_raw_response_archives.sql` |
| 최신월 실거래가 refresh scheduler | 구현됨, 기본 비활성화 | `ExternalDataWeeklyRefreshScheduler`, `ExternalDataLatestTargetMaterializer`, `ExternalDataTransactionMonthTargetRegistrationService`, `ExternalDataRefreshSchedulerService`, `ExternalDataSchedulerProperties` |
| 건축물대장 표제부 snapshot | 구현됨 | `building_register_title_snapshots`, `BuildingRegisterTitleSnapshotStore`, `BuildingRegisterTitleSnapshotMapper` |
| 실거래가 fact 저장 | 구현됨 | `real_estate_transaction_facts`, `RealEstateTransactionFactStore`, `RealEstateTransactionFactMapper` |
| 월별 시장 통계 | 구현됨 | `market_statistics_monthly`, `MarketStatisticsMonthlyService`, `MarketStatisticsMonthlyMapper` |
| R-ONE 통계 저장 | 구현됨, 수동 sync 기본 비활성화 | `kab_r_one_statistical_tables`, `kab_r_one_statistical_items`, `kab_r_one_statistical_data_points`, `KabROneStatisticsApiClient`, `KabROneSyncService`, `KabROneStatisticsMapper` |
| 공시가격 snapshot/sync target | 구현됨 | `public_price_snapshots`, `vworld_public_price_admin_seed_targets`, `vworld_public_price_sync_targets`, `vworld_public_price_coverage_metrics`, `PublicPriceSnapshotStore`, `PublicPriceSnapshotMapper`, `VWorldPublicPriceSyncTargetMapper` |
| Redis/volatile state | 구현됨. local Docker `.env.example`은 활성화, app/test fallback은 비활성화. 외부 API raw response cache에는 아직 미적용 | `VolatileStateStore`, `RedisVolatileStateStore`, `InMemoryVolatileStateStore`, `docker-compose.yml`, `.env.example` |
| object storage | adapter 구현 없음 | [DATA_STORAGE_POLICY.md](/docs/architecture/DATA_STORAGE_POLICY.md), metadata는 `external_api_raw_response_archives` |
| local filesystem | 커뮤니티 첨부파일용 구현 | `CommunityAttachmentStorageService` |

## 캐시 key 후보

| API | key 후보 | 주의사항 |
| --- | --- | --- |
| 법정동코드 | `legal-dong:{locatadd_nm}` | 운영은 DB lookup 우선 |
| VWorld 읍면동 경계 | `vworld-boundary:ademd:{emd_cd}` | 현재 미구현. 도입 시 원문 주소 없이 8자리 읍면동코드 기준 short TTL부터 검토 |
| 건축HUB 표제부 | DB `building_register_title_snapshots.query_key_hash` 우선. Redis 후보 key는 `building-register:title:{sigunguCd}:{bjdongCd}:{platGbCd}:{bun}:{ji}` | 현재 구현은 30일 이내 active DB snapshot이 있으면 진단 흐름과 `BuildingRegisterSeedRunner` 모두 API를 호출하지 않는다. 수동 seed는 `vworld_public_price_sync_targets`, `vworld_public_price_admin_seed_targets`, `property_identity_candidates`의 PNU 후보에서 법정동코드/대지구분/본번/부번을 복원해 표제부 snapshot을 채운다. |
| 실거래가 | DB `real_estate_transaction_facts` 우선. scheduler 대상은 `external_data_refresh_targets.target_type = TRANSACTION_MONTH`. Redis 후보 key는 `transaction:{apiType}:{LAWD_CD}:{DEAL_YMD}:{pageNo}:{numOfRows}` | 현재 구현은 최근 3개월 fact가 3건 이상이면 API를 호출하지 않는다. fact가 1~2건이면 fallback API로 보강을 시도하지만, fallback이 `FOUND`가 아니어도 기존 sparse fact를 제한 근거로 사용한다. 부족해서 fallback을 호출한 조합과 scheduler가 materialize한 최신월 `source + LAWD_CD + DEAL_YMD` 조합은 refresh target으로 등록된다. Redis를 붙이더라도 DB source of truth를 대체하지 않는다. |
| access token denylist | `auth:access-token-revoked:{jti}` | 외부 API cache가 아니라 인증 volatile state다. DB `revoked_access_tokens`가 source of truth이고 TTL은 access token 만료시각까지다. |
| 로그인 실패 rate limit | `rate-limit:login:{sha256(username|clientKey)}` | 외부 API cache가 아니라 인증 방어용 counter다. 기본 15분 window, 5회 실패 제한이다. |
| scheduler lock | `lock:external-data-weekly-refresh` | 외부 데이터 수집 batch 중복 실행 완화용 lock이다. 기본 TTL은 `EXTERNAL_DATA_SCHEDULER_LOCK_TTL=30m`이다. |
| 한국부동산원 R-ONE 통계표 | `kab-r-one:table:{STATBL_ID}` | 통계표 코드 목록은 장기 캐시 후보 |
| 한국부동산원 R-ONE 세부항목 | `kab-r-one:item:{STATBL_ID}:{ITM_TAG}` | `ITM_TAG`가 없으면 `all` 같은 명시값 사용 |
| 한국부동산원 R-ONE 통계자료 | `kab-r-one:data:{STATBL_ID}:{DTACYCLE_CD}:{GRP_ID}:{CLS_ID}:{ITM_ID}:{START_WRTTIME}:{END_WRTTIME}` | key에 인증키를 넣지 않는다. 현재 매물 cache가 아니다. |
| 공시가격 | DB `public_price_snapshots.query_key_hash` 우선. 수동 seed 후보는 `vworld_public_price_sync_targets`에 materialize. Redis 후보 key는 `public-price:{dataType}:{pnu}:{stdrYear-or-LATEST}` | 현재 구현은 30일 이내 active DB snapshot이 있으면 진단 흐름과 `PublicPriceSeedRunner` 모두 API를 호출하지 않는다. 수동 seed는 `property_identity_candidates`, `building_register_title_snapshots`, `favorites/property`, `real_estate_transaction_facts`, `vworld_public_price_admin_seed_targets`, `legal_dong_codes`의 후보를 target table에 모은 뒤 callable target만 호출한다. 동·호 후보가 있으면 후속 key와 match 정책에 포함 |
| AptIdInfoSvc | `apt-id:{operation}:{complexPk-or-address-hash}:{page}:{perPage}` | 주소 LIKE 조건은 hash 고려 |
| VWorld Geocoder | cache key 사용 금지 | 공식 문서의 저장 금지 조건 때문에 DB/Redis 캐시로 두지 않는다. |

## 저장 금지 또는 마스킹

- `DATA_GO_KR_SERVICE_KEY`, `ServiceKey`, `serviceKey`
- `VWORLD_API_KEY`
- `JUSO_ADDRESS_CONFIRM_KEY`, `JUSO_ADDRESS_SEARCH_KEY`
- `KAB_R_ONE_API_KEY`
- 원본 등기부등본, 계약서, 주민등록번호, 계좌번호, 전화번호
- refresh token 원문, access token 원문, 비밀번호

## Raw response archive policy

외부 API 원문 보존이 필요해도 API별 raw DB table을 만들지 않는다. DB는 object storage에 저장된 원문을 찾고 삭제·만료·재처리할 수 있는 색인만 맡는다.

```text
external_data_collection_attempts
-> external_api_raw_response_archives
-> object storage raw object
```

`external_api_raw_response_archives`는 `source_id`, `collection_attempt_id`, `archive_sequence`, `archive_policy`, `storage_provider`, `storage_bucket`, `object_key`, `object_key_hash`, `request_key_hash`, `response_content_hash`, `redaction_status`, `encryption_status`, `retention_expires_at` 같은 metadata만 가진다. XML/JSON raw body, API key, 원문 주소 전문, 좌표 원문, 계약서/등기부등본 원문은 이 테이블에 넣지 않는다.

보존 정책은 API 성격별로 다르게 잡는다.

| API/데이터 | raw archive 기본 방향 | 이유 |
| --- | --- | --- |
| 법정동코드 | `FULL_RETENTION` 후보 | 기준정보이고 민감도가 낮아 parser 재처리 가치가 있다. |
| 실거래가 batch/seed | `SHORT_RETENTION` 또는 `ERROR_ONLY` 후보 | 수집 재현 가치는 있지만 정본은 `real_estate_transaction_facts`다. |
| 건축물대장 | `ERROR_ONLY` 또는 짧은 `SHORT_RETENTION` 후보 | 주소·건물 정보가 포함될 수 있어 무기한 보존하지 않는다. |
| 공시가격 | `ERROR_ONLY` 또는 짧은 `SHORT_RETENTION` 후보 | 정본은 `public_price_snapshots`이며 raw는 parser 장애 재현용이다. |
| Juso 주소검색 | 장기 archive 금지 | 사용자 검색어와 상세 주소가 개인정보가 될 수 있다. |
| VWorld Geocoder | archive 금지 | 좌표 변환 결과 저장 금지 정책을 우선한다. |
| R-ONE 통계 | `FULL_RETENTION` 또는 긴 `SHORT_RETENTION` 후보 | 공개 통계이고 과거 지표 재현 가치가 있다. |

object storage write path를 실제로 붙일 때는 redaction을 먼저 수행하고, redaction 실패 시 archive를 만들지 않는다. 관리자 화면에서 원문을 내려받는 기능은 별도 권한, 감사 로그, retention 정책이 확정된 뒤에만 추가한다.

## 확인 필요

- 외부 API raw response short TTL cache를 붙이기 전 provider별 key, TTL, 개인정보 hash, 장애 fallback 테스트 전략을 결정해야 한다.
- 외부 API raw response를 실제 보존할 경우 object storage adapter, redaction pipeline, retention job, 관리자 조회 권한과 감사 로그를 먼저 구현해야 한다.
- 법정동코드 전국 동기화는 full refresh인지 변경분 반영인지 결정해야 한다.
- 공시가격은 현재 VWorld adapter 기반 DB snapshot으로 동작한다. 원문 공공데이터 API를 병행 또는 전환할지, 원문 bulk data를 장기 적재할지는 별도 결정이 필요하다.
- R-ONE 통계자료 sync는 `KAB_R_ONE_SYNC_DATA_QUERIES`에 명시한 쿼리만 저장한다. 현재 지역/유형 지표 리포트 boundary는 `POST /api/regional-indicator-analyses`와 `SearchResultView.vue` 첫 slice이며, 남은 결정은 통계표 allowlist 운영 정책, 적재 조합, 데이터 품질 기준이다.

## Scheduler policy

현재 scheduler slice는 사용자 관심 target만 재수집하던 구조에서 최신 완료월 target materialization 구조로 확장되었다. `ExternalDataWeeklyRefreshScheduler`가 활성화되면 먼저 `ExternalDataLatestTargetMaterializer`가 전국 catalog 또는 운영자가 지정한 `LAWD_CD` 범위의 최신 완료월 `TRANSACTION_MONTH` target을 `external_data_refresh_targets`에 등록한다. 그 다음 기존 `ExternalDataRefreshSchedulerService`가 due target을 `EXTERNAL_DATA_SCHEDULER_BATCH_SIZE`만큼 처리한다.

즉 "전국 최신 데이터 후보를 DB queue에 올리는 일"과 "실제 외부 API를 호출해 fact/statistics를 갱신하는 일"을 분리한다. 이 구조는 service DB를 최신 공개 실거래가 기준으로 보강하기 위한 것이며, 현재 매물 목록이나 중개사 재고 feed를 만들지 않는다.

```text
LeaseRiskExternalDataLookupService
-> ExternalDataCollectionService.registerTransactionMonthTarget(...)
-> external_data_refresh_targets
-> ExternalDataWeeklyRefreshScheduler
-> ExternalDataLatestTargetMaterializer
-> ExternalDataTransactionMonthTargetRegistrationService
-> external_data_refresh_targets(created_from = SCHEDULED_LATEST)
-> ExternalDataRefreshSchedulerService
-> RentTransactionApiClient / SaleTransactionApiClient
-> RealEstateTransactionFactStore
-> MarketStatisticsMonthlyService
```

운영 설정:

| 설정 | 기본값 | 의미 |
| --- | --- | --- |
| `zipon.external.data.scheduler.enabled` / `EXTERNAL_DATA_SCHEDULER_ENABLED` | `false` | 테스트와 로컬 실행에서 의도치 않은 외부 API 호출을 막기 위해 기본 비활성화 |
| `zipon.external.data.scheduler.weekly-refresh-cron` / `EXTERNAL_DATA_WEEKLY_REFRESH_CRON` | `0 0 4 * * MON` | 주 1회 실행 후보 cron |
| `zipon.external.data.scheduler.zone` / `EXTERNAL_DATA_SCHEDULER_ZONE` | `Asia/Seoul` | cron 기준 시간대 |
| `zipon.external.data.scheduler.batch-size` / `EXTERNAL_DATA_SCHEDULER_BATCH_SIZE` | `50` | 한 번에 처리할 due target 수 |
| `zipon.external.data.scheduler.lock-ttl` / `EXTERNAL_DATA_SCHEDULER_LOCK_TTL` | `30m` | scheduler 중복 실행 방지 volatile lock TTL |
| `zipon.external.data.scheduler.register-latest-targets` / `EXTERNAL_DATA_SCHEDULER_REGISTER_LATEST_TARGETS` | `true` | scheduler 실행 시 최신 완료월 target을 먼저 등록할지 여부 |
| `zipon.external.data.scheduler.source-codes` / `EXTERNAL_DATA_SCHEDULER_SOURCE_CODES` | data.go.kr 실거래가 8개 source | 최신월 target을 등록할 source code 목록 |
| `zipon.external.data.scheduler.lawd-codes` / `EXTERNAL_DATA_SCHEDULER_LAWD_CODES` | 빈 값 | 직접 지정할 5자리 `LAWD_CD` 목록. 비우면 catalog 사용 |
| `zipon.external.data.scheduler.use-catalog-lawd-codes` / `EXTERNAL_DATA_SCHEDULER_USE_CATALOG_LAWD_CODES` | `true` | `legal_dong_codes` active row의 distinct `lawd_cd`를 target 범위로 쓸지 여부 |
| `zipon.external.data.scheduler.require-nationwide-catalog` / `EXTERNAL_DATA_SCHEDULER_REQUIRE_NATIONWIDE_CATALOG` | `false` | catalog가 전국 수준이 아닐 때 target 등록을 중단할지 여부 |
| `zipon.external.data.scheduler.nationwide-minimum-lawd-code-count` / `EXTERNAL_DATA_SCHEDULER_NATIONWIDE_MINIMUM_LAWD_CODE_COUNT` | `200` | 전국 catalog로 볼 최소 distinct `LAWD_CD` 수 |
| `zipon.external.data.scheduler.lawd-code-offset` / `EXTERNAL_DATA_SCHEDULER_LAWD_CODE_OFFSET` | `0` | staged rollout 때 건너뛸 `LAWD_CD` 수 |
| `zipon.external.data.scheduler.lawd-code-limit` / `EXTERNAL_DATA_SCHEDULER_LAWD_CODE_LIMIT` | `0` | staged rollout 때 사용할 `LAWD_CD` 수. `0`은 전체 |
| `zipon.external.data.scheduler.latest-month-lookback-count` / `EXTERNAL_DATA_SCHEDULER_LATEST_MONTH_LOOKBACK_COUNT` | `2` | 최신 완료월부터 몇 개월을 target 등록할지 |
| `zipon.external.data.scheduler.max-targets-to-register` / `EXTERNAL_DATA_SCHEDULER_MAX_TARGETS_TO_REGISTER` | `0` | 한 scheduler run에서 등록할 target 수 제한. `0`은 전체 등록 |
| `zipon.redis.enabled` / `ZIPON_REDIS_ENABLED` | `.env.example`은 `true`, app fallback은 `false` | Redis를 실제 volatile state store로 사용할지 여부 |
| `zipon.redis.key-prefix` / `ZIPON_REDIS_KEY_PREFIX` | `zipon` | Redis key namespace prefix |

현재 slice의 한계:

- `TRANSACTION_MONTH` 실거래가 target만 처리한다.
- `VolatileLockService`가 scheduler 실행 전에 lock을 잡는다. Redis가 꺼져 있으면 in-memory fallback이므로 여러 backend 인스턴스 사이의 distributed lock은 제공하지 못한다. 다중 인스턴스 운영에서는 `ZIPON_REDIS_ENABLED=true`가 필요하다.
- 최신 target 등록은 `legal_dong_codes` catalog 품질에 의존한다. starter seed catalog는 전국이 아니므로 전국 운영 전 법정동코드 sync가 필요하다.
- `EMPTY` 결과는 성공적으로 조회했지만 거래 fact가 없다는 뜻이므로 `last_success_at`과 `next_refresh_at`은 갱신된다. 사용자 판단에서는 여전히 데이터 부족으로 표현해야 한다.
- API key, 원문 상세 주소, raw response는 `target_key_hash`와 `target_payload_json`에 저장하지 않는다.

운영 절차와 SQL 검증은 [외부 실거래가 최신월 scheduler](/docs/operations/EXTERNAL_DATA_SCHEDULER.md)를 따른다.

## Kakao favorite snapshot exception

사용자가 명시적으로 저장한 지도 검토 위치 스냅샷은 Kakao 지도 marker/place 선택 결과를 `PropertySnapshotRequest`로 보내고 DB `property`에 upsert한다. 이 데이터는 사용자가 직접 저장한 관심 부동산의 상세보기와 로드뷰가 같은 `propertyId`를 따라가도록 하기 위한 favorite-linked catalog row다.

이 정책은 VWorld Geocoder 주소->좌표 변환 결과를 DB/Redis에 캐시하지 않는다는 규칙과 충돌하지 않는다. VWorld 좌표 변환 결과는 후행 API 호출 직전 실시간 값으로만 쓰고, Kakao favorite snapshot은 사용자가 지도에서 저장한 검토 위치를 보존하는 별도 use case로 취급한다.

## Related documents

- [ZIP:ON 저장소 전략](/docs/architecture/DATA_STORAGE_POLICY.md)
- [외부 API 설정과 data.go.kr 키 관리](/docs/api/EXTERNAL_API_CONFIGURATION.md)
- [외부 API 호출 전략](/docs/api/external-api/API_CALL_STRATEGY.md)
- [외부 API 에러 처리 정책](/docs/api/external-api/ERROR_HANDLING_POLICY.md)
