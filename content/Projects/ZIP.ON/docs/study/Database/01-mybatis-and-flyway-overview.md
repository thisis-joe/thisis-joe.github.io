---
title: 01-mybatis-and-flyway-overview
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-29T05:00:06+09:00
---

# MyBatis와 Flyway 개요

## 한 줄 정의

MyBatis는 Java method와 SQL을 연결하는 persistence framework이고, Flyway는 DB schema 변경을 버전 관리하는 migration 도구입니다.

## 왜 필요한가

전세·월세 위험진단은 여러 공공데이터와 저장 데이터를 조합합니다. 데이터 접근 기준이 흐려지면 Service가 SQL과 외부 API 세부사항을 모두 알게 됩니다.

ZIP:ON은 아래 기준으로 역할을 나눕니다.

```text
Flyway:
테이블, 컬럼, 제약조건, 인덱스를 migration SQL로 정의한다.

MyBatis Mapper:
명시적인 SQL로 DB를 조회하고 저장한다.

Service:
주소 정제, 물건 정체 판별, 위험도 계산, 체크리스트 생성 순서를 조율한다.
```

## ZIP:ON 현재 구현

```text
Schema source:
backend/src/main/resources/db/migration/*.sql

Mapper source:
backend/src/main/java/com/zipon/mapper/*.java

Test profile:
backend/src/test/resources/application-test.yml
```

현재 source 기준으로 Flyway migration SQL 파일은 `44`개이고, 최신 migration version은 `V45`입니다. `V35` 파일이 없기 때문에 최신 version 번호와 파일 개수는 같지 않습니다. `backend/src/main/java/com/zipon/mapper` 패키지에는 Java 파일 `71`개가 있고, 그중 `*Mapper.java` interface는 `47`개이며 나머지는 mapper가 반환하거나 upsert에 사용하는 row/helper class입니다. 인증만 DB에 연결된 초기 상태가 아니라, 정확 주소 위험진단, 지역·유형 과거 지표, 외부 데이터 수집, 커뮤니티, 관리자, 관심 부동산, 지도 현장 확인, 건축물대장 seed, VWorld 공시가격 sync target과 운영자 seed target까지 MyBatis/Flyway 경계가 넓게 구현되어 있습니다.

대표 migration 흐름은 아래처럼 읽으면 됩니다.

| 영역 | 대표 migration | 대표 mapper |
| --- | --- | --- |
| 인증/토큰 | `V1__create_auth_schema.sql`, `V3__seed_admin_and_demo_users.sql`, `V43__reseed_demo_users_by_user_table_cases.sql` | `UserMapper`, `RefreshTokenMapper`, `RevokedAccessTokenMapper` |
| 지역/법정동 | `V2__create_region_schema.sql`, `V5__create_legal_dong_codes.sql`, `V10__create_legal_dong_alias_schema.sql`, `V25__create_legal_dong_code_source_rows.sql` | `RegionMapper`, `LegalDongCodeMapper` |
| 정확 주소 위험진단 | `V11__create_rent_risk_diagnosis_history.sql`, `V13__create_registry_document_confirmations.sql`, `V21__create_property_identity_candidates.sql`, `V24__create_risk_evidence_snapshots.sql` | `RentRiskDiagnosisHistoryMapper`, `RegistryDocumentConfirmationMapper`, `PropertyIdentityCandidateMapper`, `RiskEvidenceSnapshotMapper` |
| 외부 데이터 fact/statistics | `V20__create_external_data_fact_statistics_schema.sql`, `V27__create_kab_r_one_statistics_schema.sql`, `V38__create_market_indicator_domain_schema.sql` | `RealEstateTransactionFactMapper`, `MarketStatisticsMonthlyMapper`, `KabROneStatisticsMapper`, `MarketIndicatorMapper` |
| 건축물대장/공시가격 snapshot/seed | `V22__create_building_register_title_snapshots.sql`, `V23__create_public_price_snapshots.sql`, `V42__add_building_register_detail_use_name.sql`, `V44__create_vworld_public_price_sync_targets.sql`, `V45__create_vworld_public_price_admin_seed_targets.sql` | `BuildingRegisterTitleSnapshotMapper`, `BuildingRegisterSeedCandidateMapper`, `PublicPriceSnapshotMapper`, `VWorldPublicPriceSyncTargetMapper` |
| 커뮤니티/신고/제재 | `V4__create_community_board_schema.sql`, `V6__extend_community_moderation_schema.sql`, `V28__support_multi_board_community_posts.sql`, `V30__create_community_report_restrictions.sql`, `V33__create_community_policy_events.sql`, `V34__create_community_policy_operations.sql`, `V37__add_community_high_traffic_indexes.sql` | `CommunityPostMapper`, `CommunityCommentMapper`, `CommunityReportMapper`, `CommunityPolicyEventMapper`, `CommunityPolicySanctionMapper` |
| 관리자 감사 | `V29__create_admin_action_audit_logs.sql`, `V31__upgrade_admin_action_audit_logs_for_aop.sql` | `AdminActionAuditLogMapper` |
| 관심/지도/프로필 | `V9__create_favorite_schema.sql`, `V17__create_property_catalog.sql`, `V18__support_property_favorite_snapshots.sql`, `V36__create_map_field_check_records.sql`, `V39__create_user_profiles.sql`, `V40__extend_user_profiles_for_uploaded_images.sql` | `FavoriteMapper`, `PropertyMapper`, `MapFieldCheckRecordMapper`, `UserProfileMapper` |

주의할 점: migration 파일 존재 여부를 확인할 때는 `backend/target/classes`가 아니라 `backend/src/main/resources/db/migration`을 봐야 합니다. 과거 빌드 산출물이 `target/classes`에 남아 있으면 일반 `./mvnw test`가 오래된 migration을 읽을 수 있으므로, source 기준 검증은 `./mvnw clean test`로 확인합니다. 빠른 현황 확인은 아래처럼 합니다.

```bash
find backend/src/main/resources/db/migration -maxdepth 1 -type f -name 'V*.sql' | wc -l
find backend/src/main/java/com/zipon/mapper -maxdepth 1 -type f -name '*Mapper.java' | wc -l
find backend/src/main/java/com/zipon/mapper -maxdepth 1 -type f -name '*.java' | wc -l
```

JPA/Hibernate와 `ddl-auto`는 현재 persistence 경로가 아닙니다.

## 새 저장 기능을 붙일 때

새 저장 기능을 만들 때는 아래 순서로 생각합니다.

```text
1. 어떤 사용자 행동을 저장해야 하는가?
2. 어떤 테이블이 필요한가?
3. 어떤 컬럼이 필수인가?
4. 어떤 unique constraint와 index가 필요한가?
5. 어떤 Mapper method가 이 테이블을 읽고 쓰는가?
6. 어떤 Service가 transaction boundary를 갖는가?
7. 어떤 integration test가 migration과 Mapper를 검증하는가?
8. 어떤 문서가 이 schema와 mapper 책임을 설명해야 하는가?
```

## 실습 미션

```text
1. V1__create_auth_schema.sql에서 refresh_tokens.token_hash가 왜 raw token이 아닌지 설명한다.
2. UserMapper.findByUsername(...)의 SQL과 users/user_roles 테이블을 함께 읽는다.
3. V11__create_rent_risk_diagnosis_history.sql과 RentRiskDiagnosisHistoryMapper를 함께 읽고, 진단 snapshot을 왜 request/response JSON으로 남기는지 설명한다.
4. V20__create_external_data_fact_statistics_schema.sql과 RealEstateTransactionFactMapper를 함께 읽고, 실거래 원천 row와 월별 통계를 왜 분리했는지 설명한다.
5. V38__create_market_indicator_domain_schema.sql과 MarketIndicatorMapper를 함께 읽고, R-ONE 원천 통계를 화면용 trend summary로 바꾸는 이유를 설명한다.
```

## Learning path

1. First read: `backend/src/main/resources/db/migration/V1__create_auth_schema.sql`
2. Then inspect: `backend/src/main/java/com/zipon/mapper/UserMapper.java`, `RefreshTokenMapper.java`, `RevokedAccessTokenMapper.java`
3. Then inspect: `backend/src/main/resources/db/migration/V11__create_rent_risk_diagnosis_history.sql`, `V20__create_external_data_fact_statistics_schema.sql`, `V38__create_market_indicator_domain_schema.sql`
4. Then run: `cd backend && ./mvnw -Dtest=ZipOnApplicationTests test`
5. Then debug: Flyway 오류가 나면 migration 파일명, checksum, `backend/target/classes/db/migration` 잔존 파일, Testcontainers MySQL 실행 여부를 차례로 확인한다.
6. Key concept to understand: Flyway는 schema source of truth이고, MyBatis mapper는 data access source of truth이며, Service는 transaction과 use case 순서를 드러내는 계층이다.

## Related documents

- [MyBatis Mapper와 SQL](../Spring/10-mybatis-mapper-and-sql.md)
- [Domain Object와 Flyway Schema](../Spring/11-domain-object-and-flyway-schema.md)
- [공공데이터 API 연동 전략](/docs/api/PUBLIC_API_STRATEGY.md)

## 공식 출처

- [MyBatis Spring Boot Starter](https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/)
- [MyBatis Mapper XML Files](https://mybatis.org/mybatis-3/sqlmap-xml.html)
- [Flyway Versioned Migrations](https://documentation.red-gate.com/fd/versioned-migrations-273973333.html)
