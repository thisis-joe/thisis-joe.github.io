---
title: 11-domain-object-and-flyway-schema
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-27T05:00:07+09:00
---

# Domain Object와 Flyway Schema

## 한 줄 정의

Domain object는 ZIP:ON 도메인 값을 담는 plain Java object이고, Flyway migration SQL은 DB schema의 source of truth입니다.

## 왜 JPA Entity가 아닌가

ZIP:ON은 application persistence에 JPA/Hibernate를 사용하지 않습니다.

```text
사용하지 않는 것:
@Entity
JpaRepository
Hibernate ddl-auto
Hibernate entity mapping을 schema source of truth로 삼는 방식
```

대신 DB 구조는 `backend/src/main/resources/db/migration`의 Flyway SQL로 정의하고, Java 객체는 MyBatis가 조회 결과를 담는 형태로 사용합니다.

## Domain object와 DTO를 구분하는 이유

Domain object:

```text
DB 조회 결과와 가까움
테이블 컬럼 또는 도메인 값과 가까움
API 표현 형식에 종속되지 않음
```

DTO:

```text
API 요청/응답 기준
화면에 필요한 값만 포함
검증과 표현 형식에 가까움
```

Domain object를 그대로 API로 내보내면 DB 구조와 API 계약이 서로 끌려갑니다.

## ZIP:ON 주요 domain object

```text
User:
users 테이블 조회 결과

RefreshToken:
refresh_tokens 테이블 조회 결과

RevokedAccessToken:
revoked_access_tokens 테이블 조회 결과

Region:
regions 테이블 조회 결과. RegionMapper가 V2 migration의 regions table을 읽는다.

Property:
property catalog와 관심 검토 대상 fallback 흐름에서 쓰는 물건 정보

Transaction:
초기 실거래 domain 후보. 현재 실거래 저장/분석의 중심은 real_estate_transaction_facts와 관련 mapper/service다.

EnvironmentInfo:
생활환경 domain 후보. 현재 EnvironmentService는 MVP 후순위 빈 응답 계약을 제공하며 전용 table/mapper는 없다.
```

## Flyway migration을 먼저 보는 이유

테이블, 컬럼, 제약조건, 인덱스는 Java class가 아니라 migration SQL에 있어야 합니다.

```text
V1__create_auth_schema.sql
-> users
-> user_roles
-> refresh_tokens
-> revoked_access_tokens
```

현재 source에는 인증뿐 아니라 지역, 법정동코드, 위험진단 이력, 건축물대장 snapshot, 공시가격 snapshot, 실거래 fact/statistics, R-ONE 통계, market indicator, favorite, community, admin, user profile schema가 Flyway migration으로 구현되어 있습니다. 예를 들어 지역/법정동과 위험진단 흐름은 아래처럼 읽습니다.

```text
V2__create_region_schema.sql
-> regions

V5__create_legal_dong_codes.sql
-> legal_dong_codes

V11__create_rent_risk_diagnosis_history.sql
-> rent_risk_diagnosis_histories

V27__create_kab_r_one_statistics_schema.sql
-> kab_r_one_statistical_tables
-> kab_r_one_statistical_data_points

V38__create_market_indicator_domain_schema.sql
-> market_indicator_definitions
-> market_indicator_observations
-> market_indicator_trend_summaries
```

새 기능이 필요해지면 domain object만 먼저 만들지 말고, 어떤 테이블과 제약조건이 필요한지 migration부터 설계합니다.
Java class가 존재하더라도 실제 persistence source of truth는 Flyway migration과 MyBatis mapper다.
예를 들어 `Region`은 구현된 DB 조회 객체이지만, `Transaction`과 `EnvironmentInfo`는 아직 대표 table/mapper와 직접 연결된 핵심 모델이 아니다.

## 실습 미션

```text
1. V1__create_auth_schema.sql에서 users.password_hash가 왜 필요한지 설명한다.
2. V2__create_region_schema.sql과 RegionMapper.findBySearchCondition(...)가 어떻게 연결되는지 적는다.
3. V11__create_rent_risk_diagnosis_history.sql과 RentRiskDiagnosisHistoryService.recordDiagnosis(...)가 왜 함께 읽혀야 하는지 설명한다.
```

## Related documents

- [인증 DB 스키마](/docs/architecture/security/AUTH_SCHEMA.md)
- [MySQL 개발환경과 Flyway migration](/docs/operations/DOCKER_MYSQL_REDIS.md)
- [과거 지표 기반 부동산 분석 MVP 범위](/docs/product/MVP_SCOPE.md)

## 공식 출처

- [Flyway Versioned Migrations](https://documentation.red-gate.com/fd/versioned-migrations-273973333.html)
- [MyBatis Mapper XML Files](https://mybatis.org/mybatis-3/sqlmap-xml.html)
