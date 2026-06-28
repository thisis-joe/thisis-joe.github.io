---
title: REGION_SCHEMA
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-29T05:00:06+09:00
---

# 지역 DB 스키마

> Status: Implemented

## 목적

이 문서는 ZIP:ON 지역 조회 기능이 사용하는 `regions` 테이블과 MyBatis mapper를 설명한다. 여기서 말하는 Region API는 법정동/지역 기준 데이터를 조회하는 legacy 보조 API이며, 사용자가 `강남 원룸`처럼 입력했을 때 실행되는 지역·유형 과거 지표 분석은 `RegionalIndicatorAnalysisController`와 `RegionalIndicatorAnalysisService`가 담당한다.

현재 지역 schema의 source of truth는 `backend/src/main/resources/db/migration/V2__create_region_schema.sql`이다. 애플리케이션 데이터 접근은 `backend/src/main/java/com/zipon/mapper/RegionMapper.java`가 담당한다.

관련 문서:

- [MySQL 개발환경과 Flyway migration](/docs/operations/DOCKER_MYSQL_REDIS.md)
- [인증 DB 스키마](/docs/architecture/security/AUTH_SCHEMA.md)
- [ZIP:ON API와 함수 학습 지도](/docs/api/API_FUNCTION_MAP.md)

## 현재 구현 범위

이번 단계에서 실제 DB와 연결된 API:

```text
GET /api/regions
GET /api/regions/{regionId}
GET /api/regions/{regionId}/summary
```

현재 legacy 빈 응답 계약으로 남긴 API:

```text
GET /api/regions/{regionId}/trend
```

`GET /api/regions/{regionId}/summary`는 현재 `RegionService.getRegionDetail(...)`과 같은 기본 지역 정보를 반환한다. `GET /api/regions/{regionId}/trend`는 응답 shape가 확정되지 않아 빈 `Map`을 반환한다. `real_estate_transaction_facts`, `market_statistics_monthly`, `market_indicator_trend_summaries` 같은 저장 schema는 생겼지만, 이 legacy region summary/trend endpoint에는 아직 연결하지 않았다. 평균 매매가, 평균 전세가, 거래량, 가격 변화율은 새 Region 상세 요구가 생기면 `RegionalIndicatorAnalysisService`의 지역·유형 과거 지표 분석과 중복되지 않게 별도 slice로 설계한다.

현재 프론트엔드 연결 상태:

- `frontend/src/api/regionApi.js`에는 `getRegionList`, `getRegionDetail`, `getRegionSummary`, `getRegionTrend` 함수가 있다.
- `frontend/src/views/RegionDetailView.vue`는 아직 이 함수들을 호출하지 않고, 현재 매물 목록이 아니라 지역·유형 과거 지표 기준과 정확 주소 진단 연결을 안내하는 정적 화면이다.
- 지역·유형 과거 지표 화면은 `frontend/src/views/SearchResultView.vue`가 `frontend/src/api/regionalIndicatorAnalysisApi.js`의 `createRegionalIndicatorAnalysis(payload)`를 호출하는 별도 흐름이다.

## regions

Domain object: `backend/src/main/java/com/zipon/domain/Region.java`

Mapper: `backend/src/main/java/com/zipon/mapper/RegionMapper.java`

Migration: `backend/src/main/resources/db/migration/V2__create_region_schema.sql`

Service owner: `backend/src/main/java/com/zipon/service/RegionService.java`

Test: `backend/src/test/java/com/zipon/RegionIntegrationTest.java`

목적:

- 시/도, 시/군/구, 동 같은 지역 단위를 저장한다.
- 매물, 실거래, 지도, 검색 기능이 참조할 기준 데이터를 제공한다.
- 지역명 검색과 법정동 코드 기반 조회의 시작점이 된다.

주요 컬럼:

```text
id                 PK, auto increment
region_name        화면 표시와 지역명 검색에 쓰는 이름
legal_code         법정동 코드 또는 행정구역 코드 후보, unique
parent_region_id   상위 지역을 가리키는 self foreign key
created_at         row 생성 시각
updated_at         row 수정 시각 후보
```

제약과 인덱스:

- `uk_regions_legal_code`: 같은 법정동 코드가 중복 저장되지 않게 막는다.
- `fk_regions_parent_region`: `regions.parent_region_id`가 같은 테이블의 `regions.id`를 참조한다.
- `idx_regions_region_name`: 지역명 검색 후보 경로를 지원한다.
- `idx_regions_parent_region_id`: 하위 지역 조회 후보 경로를 지원한다.

Nullable 결정:

- `region_name`: not null. 화면 표시와 검색의 기본값이므로 비어 있으면 안 된다.
- `legal_code`: not null. 외부 공공데이터와 연결할 기준 식별자로 사용한다.
- `parent_region_id`: nullable. 최상위 지역은 부모가 없을 수 있다.
- `created_at`, `updated_at`: not null. migration에서 기본값을 둔다.

## 요청 흐름

지역 목록 조회:

```text
GET /api/regions?regionName=강남
-> RegionController.getRegionList(...)
-> RegionService.getRegionList(...)
-> RegionMapper.findBySearchCondition(regionName, legalCode, limit)
-> regions table
-> RegionSummaryResponse
```

지역 요약 조회:

```text
GET /api/regions/{regionId}/summary
-> RegionController.getRegionSummary(...)
-> RegionService.getRegionSummary(...)
-> RegionService.getRegionDetail(...)
-> 현재는 RegionSummaryResponse의 통계 필드 null
```

지역 가격 추이 조회:

```text
GET /api/regions/{regionId}/trend
-> RegionController.getRegionTrend(...)
-> RegionService.getRegionTrend(...)
-> 현재는 차트 DTO 미확정으로 빈 Map 반환
```

지역 상세 조회:

```text
GET /api/regions/{regionId}
-> RegionController.getRegionDetail(...)
-> RegionService.getRegionDetail(...)
-> RegionMapper.findById(regionId)
-> 없으면 NotFoundException
-> GlobalExceptionHandler.handleNotFoundException(...)
-> 404 ErrorResponse
```

## Mapper SQL 기준

`RegionMapper.findBySearchCondition(...)`는 두 조건을 받는다.

```text
regionName: 부분 검색
legalCode: 정확히 일치
limit: 기본 20건
```

현재 SQL은 `regions`를 자기 자신과 `LEFT JOIN`해서 `parent_region_name`도 함께 읽는다. 지금 `RegionSummaryResponse`에는 부모 지역명을 직접 노출하지 않지만, domain object에는 `parentRegionId`, `parentRegionName`을 보존한다. 이후 지역 breadcrumb, 자동완성 설명, 지도 검색 결과 설명에 사용할 수 있다.

`RegionMapper`는 `market_statistics_monthly`나 `market_indicator_trend_summaries`를 읽지 않는다. 그 데이터는 현재 `RegionalIndicatorAnalysisService -> MarketIndicatorContextService -> RegionalIndicatorAnalysisMapper` 경계에서 읽는다. 이렇게 나누는 이유는 `regions` 기준 데이터 조회와 사용자 입력 기반 지표 해석의 책임이 다르기 때문이다.

## Service 책임

`RegionService`는 다음 책임을 가진다.

- 빈 문자열 검색 조건을 `null`로 정규화한다.
- mapper 결과인 `Region` domain object를 `RegionSummaryResponse`로 변환한다.
- 존재하지 않는 `regionId`를 `NotFoundException`으로 바꾼다.
- 아직 이 endpoint에 연결하지 않은 가격 통계 필드는 `null`로 둔다.
- `getRegionSummary(...)`는 현재 `getRegionDetail(...)`을 재사용한다.
- `getRegionTrend(...)`는 차트 응답 DTO를 정하기 전까지 빈 `Map`을 반환한다.

`RegionService`가 직접 SQL을 만들지 않는 이유:

- SQL은 `RegionMapper`가 가진다.
- Service는 요청 조건 해석, 예외 판단, DTO 변환을 담당한다.
- 이렇게 나누면 schema와 SQL을 바꿔도 Controller의 HTTP 계약은 크게 흔들리지 않는다.

## 테스트

테스트 파일:

```text
backend/src/test/java/com/zipon/RegionIntegrationTest.java
```

검증하는 동작:

- Flyway가 `V1__create_auth_schema.sql`과 `V2__create_region_schema.sql`을 순서대로 적용한다.
- `GET /api/regions?regionName=강남`이 지역명 부분 검색 결과를 반환한다.
- `GET /api/regions?legalCode=1171000000`이 법정동 코드 정확 일치 결과를 반환한다.
- `GET /api/regions/{regionId}`가 존재하는 지역을 반환한다.
- 없는 지역 ID는 404와 `"존재하지 않는 지역입니다."` 메시지를 반환한다.

현재 `RegionIntegrationTest`는 `summary`와 `trend` endpoint를 직접 검증하지 않는다. 이 두 endpoint에 실제 통계 계산을 붙이는 순간에는 별도 테스트를 추가해야 한다. 특히 `trend`는 `Map<String, Object>` 대신 전용 response DTO로 바꾸는 것이 먼저다.

실행:

```bash
cd backend
./mvnw -Dtest=RegionIntegrationTest test
```

## Debugging checklist

지역 조회가 실패하면 아래 순서로 확인한다.

```text
1. flyway_schema_history에 V2__create_region_schema.sql이 적용됐는가?
2. regions table에 테스트 또는 로컬 데이터가 들어 있는가?
3. RegionMapper SQL의 column alias가 Region 필드명과 맞는가?
4. mybatis.configuration.map-underscore-to-camel-case=true가 유지되는가?
5. legal_code unique constraint 때문에 중복 insert가 실패한 것은 아닌가?
6. parent_region_id가 존재하지 않는 regions.id를 참조하지 않는가?
7. GET /api/regions/** 경로가 SecurityConfig에서 permitAll인지 확인했는가?
8. 없는 ID가 500이 아니라 404로 내려가는가?
```

## Design tradeoffs

`regions`는 자기참조 FK를 사용한다. `parent_region_name` 문자열만 저장하면 조회는 단순하지만, 같은 이름의 지역이 생기거나 상위 지역명이 바뀔 때 데이터 정합성이 약해진다. 그래서 schema에는 `parent_region_id`를 두고, mapper에서 필요한 경우 부모 이름을 join해서 읽는다.

아직 `RegionDetailResponse`를 따로 만들지 않았다. 현재 화면과 API 지도는 `RegionSummaryResponse`를 사용하고 있고, 가격 통계가 아직 없기 때문이다. 상세 화면에 부모 지역, 하위 지역 목록, 지도 중심 좌표, 통계 기준일 같은 필드가 필요해지면 `RegionDetailResponse`를 분리한다.

`RegionService.getRegionSummary(...)`에 곧바로 R-ONE/실거래가 분석을 붙이지 않은 것은 의도적인 경계다. 지역·유형 입력은 `RegionalIndicatorAnalysisService.analyze(...)`가 `locationKeyword`, `typeHints`, `contractPurpose`, `precisionLevel`을 함께 해석해야 하고, 단순 `regionId` 조회와 필요한 문장/한계/다음 행동이 다르다.

## Learning path

1. First read: `backend/src/main/resources/db/migration/V2__create_region_schema.sql`
2. Then inspect: `backend/src/main/java/com/zipon/mapper/RegionMapper.java`
3. Then inspect: `backend/src/main/java/com/zipon/service/RegionService.java`
4. Then run: `cd backend && ./mvnw -Dtest=RegionIntegrationTest test`
5. Then debug: `flyway_schema_history`, `regions`, `RegionMapper.findBySearchCondition(...)`
6. Then compare: `backend/src/main/java/com/zipon/service/RegionalIndicatorAnalysisService.java`
7. Key concept to understand: Flyway migration이 table 구조를 만들고, MyBatis mapper SQL이 조회 방식을 정하며, Service가 HTTP 응답에 맞게 domain object를 DTO로 바꾼다. Region API는 기준 데이터 조회이고, Regional Indicator Analysis API는 사용자 입력을 과거 지표 리포트로 해석하는 use case다.
