---
title: EXTERNAL_DATA_SCHEDULER
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
purpose: operations-runbook
status: active
code_sync_required: true
related_area: external-data, scheduler, transaction-facts, volatile-state
related_code: 
read_when: 
update_when: 
  - backend/src/main/java/com/zipon/config/ExternalDataSchedulerProperties.java
  - backend/src/main/java/com/zipon/service/ExternalDataWeeklyRefreshScheduler.java
  - backend/src/main/java/com/zipon/service/ExternalDataLatestTargetMaterializer.java
  - backend/src/main/java/com/zipon/service/ExternalDataTransactionMonthTargetRegistrationService.java
  - backend/src/main/java/com/zipon/service/ExternalDataRefreshSchedulerService.java
  - backend/src/main/java/com/zipon/mapper/ExternalDataRefreshTargetMapper.java
  - backend/src/main/resources/application.yml
  - .env.example
  - 외부 실거래가 최신월 scheduler를 켜거나 운영할 때
  - external_data_refresh_targets 수집 queue 또는 weekly refresh 동작을 수정할 때
  - Redis volatile lock 설정을 바꿀 때
  - ExternalDataSchedulerProperties 설정 키나 기본값이 바뀔 때
  - scheduler 실행 흐름, lock 이름, target 등록 규칙, due target 선택 SQL이 바뀔 때
  - 외부 실거래가 source code 목록이나 운영 검증 SQL이 바뀔 때
---

# 외부 실거래가 최신월 scheduler

> Status: Implemented, guarded scheduled path

## 목적

이 문서는 ZIP:ON 서비스 DB를 최신 공개 실거래가 기준으로 유지하기 위한 scheduler 운영 절차를 설명한다.

핵심은 전국 또는 운영자가 지정한 `LAWD_CD` 범위의 최신 완료월 실거래가 target을 DB queue에 먼저 등록하고, 기존 batch worker가 제한된 크기만큼 외부 API를 호출해 `real_estate_transaction_facts`와 `market_statistics_monthly`를 갱신하는 것이다.

이 scheduler는 현재 매물 목록, 매물 feed, 중개사 재고, 인기 매물을 만들지 않는다. ZIP:ON MVP의 과거 지표 분석과 정확 주소 위험진단에 필요한 월별 공개 실거래가 fact를 보강하는 운영 장치다.

## 역할 분리

| 경로 | 역할 | 실행 방식 |
| --- | --- | --- |
| 수동 seed | 과거 전체 기간 또는 큰 backfill을 운영자가 명시적으로 등록/수집 | `backend-seed` profile 또는 `zipon.external.data.seed.enabled=true` |
| 최신월 scheduler | 최신 완료월과 직전월 같은 작은 rolling window를 계속 target 등록/수집 | `EXTERNAL_DATA_SCHEDULER_ENABLED=true` |
| 사용자 진단 fallback | 사용자가 진단한 지역의 부족한 최근 거래를 즉시 보완 | `LeaseRiskExternalDataLookupService` 내부 DB-first fallback |

## 실행 흐름

```text
ExternalDataWeeklyRefreshScheduler
-> VolatileLockService(lock: external-data-weekly-refresh)
-> ExternalDataLatestTargetMaterializer
-> ExternalDataTransactionMonthTargetRegistrationService
-> external_data_refresh_targets(created_from = SCHEDULED_LATEST)
-> ExternalDataRefreshSchedulerService.refreshDueTransactionMonthTargets(...)
-> external_data_collection_runs(run_type = WEEKLY_SCHEDULED)
-> external_data_collection_attempts
-> DataGoKrRentTransactionApiClient / DataGoKrSaleTransactionApiClient
-> RealEstateTransactionFactStore
-> real_estate_transaction_facts
-> MarketStatisticsMonthlyService
-> market_statistics_monthly
```

target 등록과 API 호출을 분리하는 이유는 운영 제어 때문이다. 전국 최신월 target은 한 번에 수천 개가 될 수 있지만, 실제 외부 API 호출은 `EXTERNAL_DATA_SCHEDULER_BATCH_SIZE`만큼만 처리한다.

## 안전 기본값

| 설정 | 기본값 | 의미 |
| --- | --- | --- |
| `EXTERNAL_DATA_SCHEDULER_ENABLED` | `false` | 일반 local/test 실행에서 scheduler를 돌리지 않는다. |
| `EXTERNAL_DATA_WEEKLY_REFRESH_CRON` | `0 0 4 * * MON` | `ExternalDataWeeklyRefreshScheduler.refreshWeeklyTargets()`의 실행 cron이다. |
| `EXTERNAL_DATA_SCHEDULER_ZONE` | `Asia/Seoul` | 최신 완료월 계산과 scheduled cron 기준 시간대다. |
| `EXTERNAL_DATA_SCHEDULER_REGISTER_LATEST_TARGETS` | `true` | scheduler를 켜면 최신 완료월 target을 먼저 등록한다. |
| `EXTERNAL_DATA_SCHEDULER_BATCH_SIZE` | `50` | 한 번의 scheduler run에서 API 호출을 시도할 due target 수다. |
| `EXTERNAL_DATA_SCHEDULER_LOCK_TTL` | `30m` | `external-data-weekly-refresh` volatile lock의 TTL이다. |
| `EXTERNAL_DATA_SCHEDULER_SOURCE_CODES` | data.go.kr 실거래가 8개 source | 최신월 target을 등록할 source code 목록이다. |
| `EXTERNAL_DATA_SCHEDULER_LAWD_CODES` | 빈 값 | 직접 지정할 5자리 `LAWD_CD` 목록이다. 비우면 catalog 사용 여부를 본다. |
| `EXTERNAL_DATA_SCHEDULER_USE_CATALOG_LAWD_CODES` | `true` | `legal_dong_codes`의 active distinct `lawd_cd`를 target 범위로 사용할지 정한다. |
| `EXTERNAL_DATA_SCHEDULER_LATEST_MONTH_LOOKBACK_COUNT` | `2` | 최신 완료월과 직전월을 target 등록한다. 늦은 신고/정정 가능성을 반영한다. |
| `EXTERNAL_DATA_SCHEDULER_MAX_TARGETS_TO_REGISTER` | `0` | `0`은 계획된 최신 target을 모두 등록한다. API 호출량은 batch size가 제한한다. |
| `EXTERNAL_DATA_SCHEDULER_REQUIRE_NATIONWIDE_CATALOG` | `false` | `true`이면 catalog가 전국 수준이 아닐 때 target 등록을 중단한다. |
| `EXTERNAL_DATA_SCHEDULER_NATIONWIDE_MINIMUM_LAWD_CODE_COUNT` | `200` | 전국 catalog로 볼 최소 distinct `LAWD_CD` 수다. |
| `EXTERNAL_DATA_SCHEDULER_LAWD_CODE_OFFSET` | `0` | staged rollout 때 건너뛸 `LAWD_CD` 수다. |
| `EXTERNAL_DATA_SCHEDULER_LAWD_CODE_LIMIT` | `0` | staged rollout 때 사용할 `LAWD_CD` 수다. `0`은 전체다. |
| `ZIPON_REDIS_ENABLED` | `.env.example`은 `true`, `application.yml` fallback은 `false` | local Docker/운영은 Redis lock을 쓰고, 테스트/무설정 실행은 in-memory fallback을 쓴다. |

`EXTERNAL_DATA_SCHEDULER_ENABLED=false`가 가장 중요한 안전장치다. scheduler를 켜기 전에는 API key, 법정동 catalog, Redis 연결, batch size를 먼저 확인한다.

현재 기본 source code는 `DATA_GO_KR_APARTMENT_RENT`, `DATA_GO_KR_APARTMENT_TRADE`, `DATA_GO_KR_OFFICETEL_RENT`, `DATA_GO_KR_OFFICETEL_TRADE`, `DATA_GO_KR_ROW_HOUSE_RENT`, `DATA_GO_KR_ROW_HOUSE_TRADE`, `DATA_GO_KR_DETACHED_HOUSE_RENT`, `DATA_GO_KR_DETACHED_HOUSE_TRADE`이다.

## Redis 판단

Redis는 원본 DB가 아니다. scheduler에서 Redis가 맡는 책임은 `external-data-weekly-refresh` lock 같은 짧은 TTL volatile state다.

로컬 Docker 개발환경은 MySQL과 Redis를 함께 띄우므로 `.env.example`은 `ZIPON_REDIS_ENABLED=true`로 둔다. 반대로 `application.yml`의 기본 fallback은 `false`로 유지한다. 이 덕분에 `.env` 없이 테스트하거나 단일 프로세스 smoke test를 할 때는 Redis가 없어도 backend가 뜨고, 실제 local/운영 `.env`에서는 Redis lock을 사용한다.

다중 backend 인스턴스에서 scheduler를 켤 때는 Redis를 켜야 한다. Redis가 꺼지면 in-memory lock은 각 JVM 안에서만 유효해서 인스턴스 간 중복 실행을 막지 못한다.

## 전국 catalog 준비

scheduler가 `EXTERNAL_DATA_SCHEDULER_LAWD_CODES`를 비워 둔 상태로 동작하면 `legal_dong_codes`의 active distinct `lawd_cd`를 읽는다.

starter seed의 `legal_dong_codes`는 전국이 아니다. 전국 최신월 운영을 하려면 먼저 법정동코드 catalog sync를 실행한다.

```bash
LEGAL_DONG_CODE_SYNC_PAGE_SIZE=1000 \
LEGAL_DONG_CODE_SYNC_MAX_PAGES=0 \
docker compose --profile seeding run --rm backend-legal-dong-sync
```

catalog 범위를 확인한다.

```bash
docker compose -f docker-compose.yml exec mysql sh -lc '
mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "
SELECT COUNT(*) AS legal_dong_count,
       COUNT(DISTINCT lawd_cd) AS lawd_count
FROM legal_dong_codes
WHERE active = TRUE;
"
'
```

전국 catalog가 아니면 `EXTERNAL_DATA_SCHEDULER_REQUIRE_NATIONWIDE_CATALOG=true`에서 scheduler가 target 등록을 실패시키는 것이 정상이다.

`EXTERNAL_DATA_SCHEDULER_LAWD_CODES`를 직접 지정하면 catalog 부족 여부는 제한 catalog로 판단하지 않는다. 반대로 직접 지정하지 않고 catalog를 사용할 때는 `ExternalDataTransactionMonthTargetRegistrationService`가 distinct `lawd_cd` 수를 `EXTERNAL_DATA_SCHEDULER_NATIONWIDE_MINIMUM_LAWD_CODE_COUNT`와 비교한다.

## 로컬 smoke test

실제 외부 API를 호출하므로 `.env`에 `DATA_GO_KR_SERVICE_KEY`가 필요하다. 작은 지역과 한두 개 source로 먼저 확인한다.

```bash
cd "$(git rev-parse --show-toplevel)"
[ -f .env ] || cp .env.example .env
docker compose -f docker-compose.yml up -d mysql redis
```

로컬 JVM에서 scheduler를 켠다. 아래 예시는 관악구 `11620`의 연립/다세대 전월세만 최신 완료월 1개월로 제한한다.

```bash
cd backend
./mvnw spring-boot:run \
  -Dspring-boot.run.profiles=local \
  -Dspring-boot.run.arguments="--zipon.external.data.scheduler.enabled=true --zipon.external.data.scheduler.source-codes=DATA_GO_KR_ROW_HOUSE_RENT --zipon.external.data.scheduler.lawd-codes=11620 --zipon.external.data.scheduler.use-catalog-lawd-codes=false --zipon.external.data.scheduler.latest-month-lookback-count=1 --zipon.external.data.scheduler.batch-size=1 --zipon.external.data-go-kr.transaction-page-size=1000 --zipon.external.data-go-kr.transaction-max-pages=20"
```

주간 cron을 기다리지 않고 검증하려면 application을 띄운 뒤 scheduler method를 직접 호출하는 테스트를 작성하거나, 수동 seed 경로로 같은 target을 먼저 검증한다. scheduler 자체의 자동 실행은 `weekly-refresh-cron` 기준이다.

## 운영 설정 예시

전국 catalog가 준비된 운영 환경에서는 아래처럼 켠다.

```text
ZIPON_REDIS_ENABLED=true
EXTERNAL_DATA_SCHEDULER_ENABLED=true
EXTERNAL_DATA_WEEKLY_REFRESH_CRON=0 0 4 * * MON
EXTERNAL_DATA_SCHEDULER_ZONE=Asia/Seoul
EXTERNAL_DATA_SCHEDULER_REGISTER_LATEST_TARGETS=true
EXTERNAL_DATA_SCHEDULER_SOURCE_CODES=DATA_GO_KR_APARTMENT_RENT,DATA_GO_KR_APARTMENT_TRADE,DATA_GO_KR_OFFICETEL_RENT,DATA_GO_KR_OFFICETEL_TRADE,DATA_GO_KR_ROW_HOUSE_RENT,DATA_GO_KR_ROW_HOUSE_TRADE,DATA_GO_KR_DETACHED_HOUSE_RENT,DATA_GO_KR_DETACHED_HOUSE_TRADE
EXTERNAL_DATA_SCHEDULER_REQUIRE_NATIONWIDE_CATALOG=true
EXTERNAL_DATA_SCHEDULER_NATIONWIDE_MINIMUM_LAWD_CODE_COUNT=200
EXTERNAL_DATA_SCHEDULER_LATEST_MONTH_LOOKBACK_COUNT=2
EXTERNAL_DATA_SCHEDULER_BATCH_SIZE=50
EXTERNAL_DATA_SCHEDULER_LOCK_TTL=30m
EXTERNAL_DATA_SCHEDULER_MAX_TARGETS_TO_REGISTER=0
```

API quota가 작거나 운영 첫날이면 `EXTERNAL_DATA_SCHEDULER_LAWD_CODE_OFFSET`과 `EXTERNAL_DATA_SCHEDULER_LAWD_CODE_LIMIT`으로 단계적으로 rollout한다. 이 경우 `REQUIRE_NATIONWIDE_CATALOG=true`는 catalog가 전국인지 검증하고, offset/limit은 그중 일부만 선택한다.

## 검증 SQL

target 등록 상태:

```bash
docker compose -f docker-compose.yml exec mysql sh -lc "
mysql -u\"\$MYSQL_USER\" -p\"\$MYSQL_PASSWORD\" \"\$MYSQL_DATABASE\" <<'SQL'
SELECT created_from, refresh_status, COUNT(*) AS count
FROM external_data_refresh_targets
WHERE target_type = 'TRANSACTION_MONTH'
GROUP BY created_from, refresh_status
ORDER BY created_from, refresh_status;

SELECT source_id, lawd_code, deal_year_month, refresh_status, COUNT(*) AS count
FROM external_data_refresh_targets
WHERE created_from = 'SCHEDULED_LATEST'
GROUP BY source_id, lawd_code, deal_year_month, refresh_status
ORDER BY deal_year_month DESC, lawd_code
LIMIT 50;
SQL
"
```

수집 run과 fact/statistics:

```bash
docker compose -f docker-compose.yml exec mysql sh -lc "
mysql -u\"\$MYSQL_USER\" -p\"\$MYSQL_PASSWORD\" \"\$MYSQL_DATABASE\" <<'SQL'
SELECT run_type, run_status, target_count, success_count, empty_count, failure_count, skipped_count, started_at
FROM external_data_collection_runs
WHERE run_type = 'WEEKLY_SCHEDULED'
ORDER BY id DESC
LIMIT 5;

SELECT lawd_code, deal_year_month, transaction_api_type, COUNT(*) AS count
FROM real_estate_transaction_facts
GROUP BY lawd_code, deal_year_month, transaction_api_type
ORDER BY deal_year_month DESC, lawd_code, transaction_api_type
LIMIT 50;

SELECT lawd_code, deal_year_month, property_type, trade_kind, sample_count, data_quality
FROM market_statistics_monthly
ORDER BY deal_year_month DESC, lawd_code, property_type, trade_kind
LIMIT 50;
SQL
"
```

관리자 화면에서는 `GET /api/admin/external-data-status`와 Admin Dashboard의 "공공데이터 수집 상태"를 본다.

## 중단과 rollback

즉시 중단:

```text
EXTERNAL_DATA_SCHEDULER_ENABLED=false
```

기존 due target refresh만 남기고 최신월 target 등록만 끄기:

```text
EXTERNAL_DATA_SCHEDULER_REGISTER_LATEST_TARGETS=false
```

잘못 등록된 target이 API 호출 전이면 `enabled=false`로 비활성화하는 SQL migration 또는 운영 SQL을 별도 승인받아 적용한다. 이미 수집된 `real_estate_transaction_facts`는 정규화 fact이므로 삭제보다는 source, `lawd_code`, `deal_year_month`, collection attempt를 먼저 확인한다.

due target 선택 순서는 `ExternalDataRefreshTargetMapper.findDueTransactionMonthTargets(...)`에 고정되어 있다. `enabled=true`, source enabled, `target_type='TRANSACTION_MONTH'`, `refresh_status IN ('READY', 'SUCCESS', 'FAILED')`, `next_refresh_at IS NULL OR next_refresh_at <= now`인 row만 선택하고, `priority DESC`, 실패 재시도 우선, 오래된 `next_refresh_at`, `id` 순으로 처리한다.

## 테스트 원칙

- scheduler 단위 테스트는 실제 외부 API를 호출하지 않는다.
- `ExternalDataWeeklyRefreshSchedulerTest`는 enabled, lock, latest target registration flag, batch delegation을 확인한다.
- `ExternalDataLatestTargetMaterializerIntegrationTest`는 target row 등록만 검증하고 collection attempt가 늘지 않는지 확인한다.
- `ExternalDataRefreshSchedulerServiceTest`는 fake transaction client로 due target 수집, fact 저장, statistics 갱신을 검증한다.

## 읽는 순서

1. `ExternalDataWeeklyRefreshScheduler`
2. `ExternalDataLatestTargetMaterializer`
3. `ExternalDataTransactionMonthTargetRegistrationService`
4. `ExternalDataRefreshTargetMapper`
5. `ExternalDataRefreshSchedulerService`
6. `RealEstateTransactionFactStore`
7. `MarketStatisticsMonthlyService`

핵심 Spring 원리는 scheduling과 configuration properties다. `@Scheduled`는 실행 시점을 정하고, `ExternalDataSchedulerProperties`는 운영자가 바꿀 수 있는 target 범위와 batch size를 코드 밖으로 뺀다.
