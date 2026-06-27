---
title: DOCKER_MYSQL_REDIS
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
---

# MySQL 개발환경과 Flyway migration

> Status: Implemented

## 목적

이 문서는 ZIP:ON backend를 로컬 MySQL에 연결하고, schema 변경을 Flyway migration으로 관리하기 위한 실행 방법을 설명한다.

현재 구현된 범위:

- `docker-compose.yml` 기반 MySQL 8.4 컨테이너
- `.env.example` 환경변수 예시
- `application.yml` MySQL datasource와 root `.env` 자동 import
- `application-test.yml` Testcontainers MySQL test profile
- Flyway dependency와 migration 실행 설정
- `V1__create_auth_schema.sql` 인증 schema migration
- `V2__create_region_schema.sql` 지역 schema migration
- `V3__seed_admin_and_demo_users.sql` 로컬/학습용 seed user migration
- `V43__reseed_demo_users_by_user_table_cases.sql` `demo_user_*` 재시드와 사용자 테이블 조합 검증용 seed migration
- `V4__create_community_board_schema.sql` 커뮤니티 게시판 schema migration
- `V5__create_legal_dong_codes.sql` 전세·월세 위험진단용 법정동코드 starter seed
- `V6__extend_community_moderation_schema.sql` 커뮤니티 좋아요, 신고, 첨부파일, 관리자 조치 schema
- `V7__create_admin_user_permission_schema.sql` 관리자 사용자 권한 schema
- `V8__normalize_audit_timestamp_defaults.sql` audit timestamp 기본값 보정 migration
- `V9__create_favorite_schema.sql` 관심 부동산 검토 대상 schema
- `V10__create_legal_dong_alias_schema.sql` 관악구 행정동 alias와 법정동코드 매핑 seed
- `V11__create_rent_risk_diagnosis_history.sql` 전세·월세 위험진단 이력 schema
- `V18__support_property_favorite_snapshots.sql` 관심 부동산 검토 대상용 property snapshot schema 보정 migration
- `V19__grant_admin_all_permissions.sql` `admin` seed 계정의 전체 role/permission 보정 migration
- `V25__create_legal_dong_code_source_rows.sql` 행정표준코드 법정동코드 원천 row schema
- `V26__create_external_api_raw_response_archives.sql` 외부 API raw response archive metadata schema
- `V27__create_kab_r_one_statistics_schema.sql` 한국부동산원 R-ONE 통계표/세부항목/통계자료 schema
- `V44__create_vworld_public_price_sync_targets.sql` VWorld 공시가격 sync target과 coverage metric schema
- `V45__create_vworld_public_price_admin_seed_targets.sql` VWorld 공시가격 운영자 seed target schema
- JPA/Hibernate dependency, `@Entity`, `JpaRepository`, `ddl-auto` 제거
- MyBatis mapper SQL과 Flyway schema 정합성 반영
- `backend-seed` compose profile을 통한 data.go.kr 실거래가 수동 seed 실행 경로
- `backend-legal-dong-sync` compose profile을 통한 전국 법정동코드 catalog 수동 sync 경로
- `backend-kab-r-one-sync` compose profile을 통한 한국부동산원 R-ONE 통계 수동 sync 경로
- `backend-public-price-seed` compose profile을 통한 VWorld 공시가격 sync target materialize와 callable target 조회 경로
- `backend-building-register-seed` compose profile을 통한 PNU 후보 기반 건축물대장 표제부 snapshot 수동 seed 경로

Redis는 별도 [로컬 Docker 개발환경](/docs/operations/LOCAL_SETUP.md) 문서에서 다룬다. Redis는 MySQL schema source of truth가 아니라 optional volatile state/cache/lock 계층이므로, 이 문서는 MySQL/Flyway에 집중한다.

관련 문서:

- [인증 DB 스키마](/docs/architecture/security/AUTH_SCHEMA.md)
- [지역 DB 스키마](/docs/architecture/REGION_SCHEMA.md)
- [Spring Security JWT 인증 흐름](/docs/architecture/security/SECURITY_AUTHENTICATION.md)
- [커뮤니티 게시판 백엔드 학습 문서](/docs/community/README.md)
- [로컬 Docker 개발환경](/docs/operations/LOCAL_SETUP.md)
- [외부 데이터 수동 seed와 sync](/docs/operations/EXTERNAL_DATA_SEEDING.md)
- [외부 API 설정과 data.go.kr 키 관리](/docs/api/EXTERNAL_API_CONFIGURATION.md)
- [과거 지표 분석과 정확 주소 위험진단 MVP API 호출 전략](/docs/api/API_CALL_FLOW.md)

## MySQL local setup

로컬 MySQL은 저장소 루트의 `docker-compose.yml`로 실행한다.

ZIP:ON은 MySQL `8.4` 이미지를 사용한다. MySQL 8.4는 LTS 계열이라 로컬 개발환경에서 버전 변화가 덜하고, `utf8mb4` 문자셋과 현재 Spring Boot/MySQL JDBC 조합에 잘 맞는다.

처음 한 번:

```bash
cp .env.example .env
```

`.env`에는 로컬에서만 쓸 값을 둔다. 실제 비밀번호, API key, 운영 secret은 commit하지 않는다. 이 저장소는 root `.gitignore`에서 `.env`와 `.env.*`를 제외하고 `.env.example`만 추적한다.

현재 `.env`는 MySQL 값 외에도 JWT local secret과 data.go.kr OpenAPI 키를 담을 수 있다. JWT local secret은 `ZIPON_JWT_SECRET`에 저장한다. 외부 API 키는 `DATA_GO_KR_SERVICE_KEY`에 저장하고, 자세한 규칙은 [외부 API 설정과 data.go.kr 키 관리](/docs/api/EXTERNAL_API_CONFIGURATION.md)를 따른다.

MySQL 실행:

```bash
unset COMPOSE_FILE
docker compose -f docker-compose.yml up -d mysql
docker compose -f docker-compose.yml ps
```

로그 확인:

```bash
docker compose -f docker-compose.yml logs -f mysql
```

DB 접속 확인:

```bash
docker compose -f docker-compose.yml exec mysql sh -lc 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SELECT DATABASE();"'
```

종료:

```bash
docker compose -f docker-compose.yml down
```

데이터까지 초기화:

```bash
docker compose -f docker-compose.yml down -v
```

## Spring Boot datasource flow

기본 설정 파일:

```text
backend/src/main/resources/application.yml
```

공통 datasource 설정 파일:

```text
backend/src/main/resources/application.yml
```

`application.yml`은 root `.env`를 선택적으로 읽고, 기본 datasource를 Docker MySQL에 맞춘다.

```yaml
spring:
  config:
    import:
      - optional:file:../.env[.properties]
      - optional:file:.env[.properties]
```

두 경로를 둔 이유:

- `cd backend` 후 Maven을 실행하면 root `.env`는 `../.env`에 있다.
- IDE나 다른 실행 방식에서 working directory가 repository root라면 root `.env`는 `.env`에 있다.
- `optional:`은 파일 import가 선택이라는 뜻이다. 다만 JWT 서명에는 `ZIPON_JWT_SECRET`이 필요하므로 local profile을 실제로 띄울 때는 root `.env`를 만들거나 같은 환경변수를 직접 제공해야 한다.

`test` profile 설정 파일:

```text
backend/src/test/resources/application-test.yml
```

datasource는 아래 환경변수를 읽는다.

```text
MYSQL_HOST
MYSQL_PORT
MYSQL_DATABASE
MYSQL_USER
MYSQL_PASSWORD
ZIPON_JWT_SECRET
```

`.env`를 만든 뒤 backend를 실행하면 Docker Compose와 Spring Boot가 같은 값을 사용한다.

```bash
cp .env.example .env
unset COMPOSE_FILE
docker compose -f docker-compose.yml up -d mysql

cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

중요한 점:

- 이 프로젝트는 `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`를 필수로 요구하지 않는다.
- `echo $SPRING_DATASOURCE_URL`가 비어 있어도 그 자체는 실패 원인이 아니다.
- `application.yml`은 `MYSQL_*` 값을 읽어서 `spring.datasource.url`, `spring.datasource.username`, `spring.datasource.password`를 만든다.
- `ZIPON_JWT_SECRET`이 비어 있으면 JWT bean 생성이 실패한다. `.env.example`의 값은 로컬 학습용 예시이고 운영에서는 다른 고엔트로피 값으로 교체한다.
- shell 환경변수로 `SPRING_DATASOURCE_*`를 직접 지정하면 Spring Boot의 일반 property override 규칙에 따라 datasource 설정을 덮어쓸 수 있지만, ZIP:ON 로컬 개발 기본 경로는 아니다.

shell에 `.env`를 직접 올려서 일시적으로 override하고 싶을 때만 아래 방식을 사용한다.

```bash
set -a
source .env
set +a
```

현재 profile 역할:

| Profile | DB | Flyway | Schema source | 목적 |
| --- | --- | --- | --- | --- |
| default/local | MySQL | enabled | Flyway | 로컬 MySQL 연결과 migration 실행 경로 |
| `test` | Testcontainers MySQL | enabled | Flyway | MySQL 계열 SQL과 mapper 정합성 검증 |
| `prod` / `production` | 운영 DB | enabled | Flyway | 학습용 seed user가 남아 있으면 `ProductionSecurityStartupValidator`가 startup 중단 |

주의:

- Spring Boot가 모든 `.env` 파일을 자동으로 읽는 것은 아니다. ZIP:ON은 `application.yml`의 `spring.config.import`로 root `.env`를 명시적으로 가져온다.
- 테스트는 `application-test.yml`의 Testcontainers datasource와 테스트용 `zipon.security.jwt.secret`을 사용한다.
- JPA/Hibernate는 backend persistence에서 제거되었다.
- MyBatis mapper가 application data access layer이고, Flyway migration SQL이 schema source of truth이다.

## Generated output and stale classpath

Maven build output은 `backend/target`에 생긴다. `target`은 Git에 올리지 않는다.

과거에 IDE나 빌드 도구가 만든 `backend/bin` 산출물이 Git에 들어가 있으면 다음 문제가 생긴다.

- `rg datasource` 같은 검색에서 실제 source가 아닌 오래된 `application.yml`이 함께 잡힌다.
- 이미 제거한 `ddl-auto`나 repository class가 아직 있는 것처럼 보인다.
- `target/classes`에 예전 Flyway migration이 남아 있으면 `./mvnw test` 로그가 실제 source보다 많은 migration을 적용한 것처럼 보일 수 있다.

정확한 DB/Flyway 상태를 확인할 때는 clean build로 classpath를 새로 만든다.

```bash
cd backend
./mvnw clean test
```

정상 기준:

- `backend/src/main/resources/db/migration` 아래 migration만 classpath에 복사된다.
- 현재 source 기준으로는 `V1__create_auth_schema.sql`이 적용된다.
- `backend/bin`은 Git에서 제거되어야 하며, IDE가 다시 만들더라도 `backend/.gitignore`의 `bin/` 규칙으로 추적하지 않는다.

## Flyway migration flow

Flyway 설정은 공통 `application.yml`에서 켜진다. `default`, `test`, `local` profile 모두 같은 migration 위치를 사용한다.

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
```

Migration 파일 위치:

```text
backend/src/main/resources/db/migration
```

파일명 규칙:

```text
V1__create_auth_schema.sql
V2__create_region_schema.sql
V3__seed_admin_and_demo_users.sql
V4__create_community_board_schema.sql
V5__create_legal_dong_codes.sql
V6__extend_community_moderation_schema.sql
V7__create_admin_user_permission_schema.sql
V8__normalize_audit_timestamp_defaults.sql
V9__create_favorite_schema.sql
V10__create_legal_dong_alias_schema.sql
V11__create_rent_risk_diagnosis_history.sql
V12__create_external_api_call_logs.sql
V13__create_registry_document_confirmations.sql
V14__seed_seongdong_legal_dong_codes.sql
V15__extend_user_department_and_operator_roles.sql
V16__create_ai_risk_scoring_logs.sql
V17__create_property_catalog.sql
V18__support_property_favorite_snapshots.sql
V19__grant_admin_all_permissions.sql
V20__create_external_data_fact_statistics_schema.sql
V21__create_property_identity_candidates.sql
V22__create_building_register_title_snapshots.sql
V23__create_public_price_snapshots.sql
V24__create_risk_evidence_snapshots.sql
V25__create_legal_dong_code_source_rows.sql
V26__create_external_api_raw_response_archives.sql
V27__create_kab_r_one_statistics_schema.sql
```

여러 schema MR을 순서대로 합칠 때는 `flyway_schema_history`에 적용된 version과 새 migration 번호를 함께 확인한다. Flyway는 같은 version을 가진 migration 파일이 두 개 있으면 애플리케이션 시작 전에 validation 단계에서 실패한다.

## Temporal column rules

MySQL strict mode에서는 `DATETIME` 또는 `TIMESTAMP` 컬럼에 아래 기본값을 주면 migration 단계에서 실패할 수 있다.

```sql
created_at DATETIME NOT NULL DEFAULT ''
created_at DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00'
```

ZIP:ON에서는 audit timestamp에 아래 규칙을 적용한다.

```text
created_at:
DB 기본값을 CURRENT_TIMESTAMP(6)로 둔다.
애플리케이션이 명시적으로 넣어도 되지만, 누락되어도 row 생성 시각이 남아야 한다.

updated_at:
DB 기본값을 CURRENT_TIMESTAMP(6)로 둔다.
수정 시각은 MyBatis update SQL에서 명시적으로 갱신한다.

deleted_at, hidden_at, reviewed_at, revoked_at:
상태 변화가 실제로 일어난 시각이므로 nullable이거나, table 의미상 즉시 발생하는 경우에만 기본값을 둔다.

expires_at:
만료 정책은 애플리케이션이 정해야 하므로 DB 기본값을 두지 않는다.
```

`V8__normalize_audit_timestamp_defaults.sql`은 초기 migration에서 기본값 없이 만들어진 audit timestamp 컬럼에 `CURRENT_TIMESTAMP(6)` 기본값을 보정한다.

앱 시작 시 흐름:

```text
Spring Boot local profile
-> MySQL DataSource 생성
-> Flyway가 classpath:db/migration 확인
-> 아직 적용하지 않은 migration SQL 실행
-> flyway_schema_history에 적용 이력 저장
-> 이후 Spring bean 초기화 계속 진행
```

`flyway_schema_history`는 어떤 migration이 어느 순서로 적용됐는지 기록한다. 운영 가능한 DB 변경은 이 기록을 기준으로 재현되어야 한다.

현재 인증 schema는 `V1__create_auth_schema.sql`에 정의되어 있고, 지역 schema는 `V2__create_region_schema.sql`에 정의되어 있다. 로컬/학습용 seed user는 `V3__seed_admin_and_demo_users.sql`에서 시작하고, `V43__reseed_demo_users_by_user_table_cases.sql`이 `demo_user_*`만 삭제한 뒤 `department_code`, `enabled`, `profile_image_url` 존재 여부 조합별 100명씩 다시 만든다. `users.profile_image_url`과 커뮤니티 schema는 `V4__create_community_board_schema.sql`, 법정동코드 starter seed는 `V5__create_legal_dong_codes.sql`, 커뮤니티 운영 확장은 `V6__extend_community_moderation_schema.sql`, 관리자 사용자 권한은 `V7__create_admin_user_permission_schema.sql`, audit timestamp 기본값 보정은 `V8__normalize_audit_timestamp_defaults.sql`, 관심 부동산 검토 대상 schema는 `V9__create_favorite_schema.sql`, 행정동 alias seed는 `V10__create_legal_dong_alias_schema.sql`, 위험진단 이력은 `V11__create_rent_risk_diagnosis_history.sql`, 외부 API 호출 로그는 `V12__create_external_api_call_logs.sql`, 등기부등본 확인 상태는 `V13__create_registry_document_confirmations.sql`, 성동구 법정동코드 seed는 `V14__seed_seongdong_legal_dong_codes.sql`, 운영자 사용자 속성과 role 확장은 `V15__extend_user_department_and_operator_roles.sql`, AI 위험 산정 audit log는 `V16__create_ai_risk_scoring_logs.sql`, 검토 대상 catalog는 `V17__create_property_catalog.sql`, 관심 부동산 snapshot 보정은 `V18__support_property_favorite_snapshots.sql`, seed admin 전체 권한 보정은 `V19__grant_admin_all_permissions.sql`에 정의되어 있다. 외부 데이터 source/target/run/fact/statistics는 `V20__create_external_data_fact_statistics_schema.sql` 이후 migration들이 담당하고, 건축물대장 표제부 snapshot은 `V22__create_building_register_title_snapshots.sql`, 공시가격 snapshot은 `V23__create_public_price_snapshots.sql`, 행정표준코드 법정동코드 원천 row는 `V25__create_legal_dong_code_source_rows.sql`, 외부 API raw archive metadata는 `V26__create_external_api_raw_response_archives.sql`, 한국부동산원 R-ONE 통계 저장소는 `V27__create_kab_r_one_statistics_schema.sql`, VWorld 공시가격 sync target과 coverage metric은 `V44__create_vworld_public_price_sync_targets.sql`, 운영자 seed target은 `V45__create_vworld_public_price_admin_seed_targets.sql`에 정의되어 있다.

## Auth schema

현재 인증 기능이 기대하는 테이블:

```text
users
user_roles
refresh_tokens
revoked_access_tokens
```

현재 인증 mapper:

```text
backend/src/main/java/com/zipon/mapper/UserMapper.java
backend/src/main/java/com/zipon/mapper/RefreshTokenMapper.java
backend/src/main/java/com/zipon/mapper/RevokedAccessTokenMapper.java
```

중요 컬럼:

```text
users.id
users.username
users.email
users.nickname
users.profile_image_url
users.password_hash
users.enabled
users.created_at
users.password_changed_at
users.token_version

user_roles.user_id
user_roles.role_name
user_roles.created_at

refresh_tokens.id
refresh_tokens.user_id
refresh_tokens.token_hash
refresh_tokens.expires_at
refresh_tokens.revoked_at
refresh_tokens.replaced_by
refresh_tokens.created_at

revoked_access_tokens.jti
revoked_access_tokens.user_id
revoked_access_tokens.expires_at
revoked_access_tokens.revoked_at
revoked_access_tokens.reason
```

현재 migration에서 정한 것:

- `users.username` unique constraint
- `user_roles` primary key `(user_id, role_name)`
- `user_roles.user_id` foreign key
- `user_roles.role_name` 조회 index
- `refresh_tokens.token_hash` unique constraint
- `refresh_tokens.user_id` index와 foreign key
- `refresh_tokens.expires_at` 만료 정리용 index
- `revoked_access_tokens.jti` primary key
- `revoked_access_tokens.user_id` index와 foreign key
- `revoked_access_tokens.expires_at` 만료 정리용 index

## Admin user permission schema

관리자 사용자 권한 기능이 기대하는 테이블:

```text
user_permissions
user_page_permissions
```

현재 관리자/권한 mapper:

```text
backend/src/main/java/com/zipon/mapper/AdminUserMapper.java
backend/src/main/java/com/zipon/mapper/UserPermissionMapper.java
```

중요 컬럼:

```text
user_permissions.user_id
user_permissions.can_create_post
user_permissions.can_update_post
user_permissions.can_delete_post
user_permissions.can_create_comment
user_permissions.can_update_comment
user_permissions.can_delete_comment
user_permissions.can_access_all_pages
user_permissions.can_manage_users
user_permissions.can_manage_community
user_permissions.created_at
user_permissions.updated_at

user_page_permissions.user_id
user_page_permissions.page_key
user_page_permissions.allowed
user_page_permissions.created_at
user_page_permissions.updated_at
```

현재 migration에서 정한 것:

- `user_permissions.user_id` primary key와 `users.id` foreign key
- `user_page_permissions` primary key `(user_id, page_key)`
- `user_page_permissions.user_id` foreign key
- `user_page_permissions.page_key` 조회 index
- 기존 `users` row에는 기본 글/댓글 권한을 `TRUE`로 seed
- `ROLE_ADMIN` seed user는 `can_access_all_pages`, `can_manage_users`, `can_manage_community`를 `TRUE`로 seed
- `V19__grant_admin_all_permissions.sql`은 `username = 'admin'` 계정에 `UserRole` enum의 모든 role row를 추가하고, 모든 `user_permissions` 플래그를 `TRUE`로 다시 맞춘다.
- `UserMapper.findRoleNamesByUserId(...)`와 `CustomUserPrincipal.from(user, roleNames)`는 로그인과 JWT 인증 재검증 시 `user_roles` 전체를 Spring Security authority 목록으로 반영한다.
- `AdminUserService`는 `username = 'admin'` 계정의 role 변경, 권한 축소, 탈퇴 처리를 막는다. 이 계정은 로컬/학습용 root admin이므로 모든 권한을 유지해야 한다.

Lifecycle:

```text
회원가입
-> AuthService.signUp()
-> UserMapper.insert(...)
-> UserPermissionService.createDefaultPermissions(...)

관리자 회원 추가
-> AdminUserService.createUser()
-> UserMapper.insert(...)
-> AdminUserMapper.insertRole(...)
-> UserPermissionService.createDefaultPermissions(...)

관리자 권한 변경
-> AdminUserController.updatePermissions()
-> AdminUserService.updatePermissions()
-> UserPermissionService.updatePermissions()
-> user_permissions update + user_page_permissions replace
```

운영 의미:

- `user_permissions`는 백엔드 `CommunityService`가 게시글/댓글 작성, 수정, 삭제 전에 읽는다.
- `user_page_permissions`는 프론트 `frontend/src/router/index.js`가 route `pageKey`와 비교해 화면 접근을 제어한다.
- page 접근 제어는 사용자 경험을 위한 1차 제어이고, 보안이 필요한 API는 여전히 `SecurityConfig`와 backend authorization rule로 보호해야 한다.

## Region schema

현재 지역 기능이 기대하는 테이블:

```text
regions
```

현재 지역 mapper:

```text
backend/src/main/java/com/zipon/mapper/RegionMapper.java
```

중요 컬럼:

```text
regions.id
regions.region_name
regions.legal_code
regions.parent_region_id
regions.created_at
regions.updated_at
```

현재 migration에서 정한 것:

- `regions.id` primary key
- `regions.legal_code` unique constraint
- `regions.parent_region_id` self foreign key
- `regions.region_name` 조회 index
- `regions.parent_region_id` 조회 index

자세한 내용은 [지역 DB 스키마](/docs/architecture/REGION_SCHEMA.md)를 기준으로 확인한다.

## Community schema

현재 커뮤니티 게시판 기능이 기대하는 테이블:

```text
community_boards
community_posts
community_comments
community_reactions
community_reports
community_post_attachments
community_moderation_actions
```

현재 커뮤니티 mapper:

```text
backend/src/main/java/com/zipon/mapper/CommunityBoardMapper.java
backend/src/main/java/com/zipon/mapper/CommunityPostMapper.java
backend/src/main/java/com/zipon/mapper/CommunityCommentMapper.java
backend/src/main/java/com/zipon/mapper/CommunityReactionMapper.java
backend/src/main/java/com/zipon/mapper/CommunityReportMapper.java
backend/src/main/java/com/zipon/mapper/CommunityAttachmentMapper.java
backend/src/main/java/com/zipon/mapper/CommunityModerationActionMapper.java
```

중요 컬럼:

```text
community_boards.id
community_boards.code
community_boards.name
community_boards.sort_order
community_boards.active

community_posts.id
community_posts.board_id
community_posts.author_id
community_posts.title
community_posts.content
community_posts.status
community_posts.view_count
community_posts.comment_count
community_posts.like_count
community_posts.attachment_count
community_posts.report_count
community_posts.created_at
community_posts.updated_at
community_posts.deleted_at
community_posts.hidden_at
community_posts.hidden_by
community_posts.hidden_reason

community_comments.id
community_comments.post_id
community_comments.parent_comment_id
community_comments.author_id
community_comments.content
community_comments.status
community_comments.depth
community_comments.like_count
community_comments.report_count
community_comments.created_at
community_comments.updated_at
community_comments.deleted_at
community_comments.hidden_at
community_comments.hidden_by
community_comments.hidden_reason

community_reactions.target_type
community_reactions.target_id
community_reactions.user_id
community_reactions.reaction_type

community_reports.target_type
community_reports.target_id
community_reports.reporter_id
community_reports.reason
community_reports.status
community_reports.reviewer_id

community_post_attachments.post_id
community_post_attachments.uploader_id
community_post_attachments.original_file_name
community_post_attachments.stored_file_name
community_post_attachments.storage_path
community_post_attachments.content_type
community_post_attachments.size_bytes
community_post_attachments.status

community_moderation_actions.target_type
community_moderation_actions.target_id
community_moderation_actions.action_type
community_moderation_actions.actor_id
```

현재 migration에서 정한 것:

- `community_boards.code` unique constraint
- `community_posts.board_id` foreign key
- `community_posts.author_id` foreign key
- `community_posts.status` check constraint
- `community_comments.post_id` foreign key
- `community_comments.parent_comment_id` self foreign key
- `community_comments.author_id` foreign key
- `community_comments.status` check constraint
- `community_comments.depth` check constraint
- `community_reactions` user/target/reaction unique constraint
- `community_reports` reporter/target unique constraint
- `community_post_attachments.stored_file_name` unique constraint
- 게시글 목록/댓글 목록 조회용 indexes

## Lease risk legal dong code schema

전세·월세 위험진단 MVP는 주소를 정제한 뒤 실거래가 API의 `LAWD_CD`를 만들어야 한다. 실거래가 API의 `LAWD_CD`는 법정동코드 10자리 중 앞 5자리다.

현재 구현:

```text
backend/src/main/resources/db/migration/V5__create_legal_dong_codes.sql
backend/src/main/resources/db/migration/V10__create_legal_dong_alias_schema.sql
backend/src/main/resources/db/migration/V25__create_legal_dong_code_source_rows.sql
backend/src/main/java/com/zipon/mapper/LegalDongCodeMapper.java
backend/src/main/java/com/zipon/mapper/LegalDongCodeLookupRow.java
backend/src/main/java/com/zipon/domain/LegalDongCodeMatch.java
backend/src/main/java/com/zipon/service/LegalDongCodeCatalog.java
backend/src/main/java/com/zipon/service/MyBatisLegalDongCodeCatalog.java
backend/src/main/java/com/zipon/service/LeaseRiskAddressNormalizer.java
```

`legal_dong_codes` table:

| Column | Purpose |
| --- | --- |
| `id` | 내부 surrogate primary key |
| `legal_dong_code` | 행정표준코드관리시스템의 법정동코드 10자리 |
| `lawd_cd` | 실거래가 API 조회에 쓰는 앞 5자리 |
| `sido_name` | 시도명. 예: `서울특별시` |
| `sigungu_name` | 시군구명. 예: `관악구` |
| `legal_dong_name` | 법정동명. 예: `신림동` |
| `active` | 현재 사용 여부 |
| `created_at` | seed row 생성 시각 |
| `updated_at` | seed row 수정 시각 |

제약과 index:

- `uk_legal_dong_codes_code`: `legal_dong_code` 중복 방지
- `uk_legal_dong_codes_names`: `sido_name`, `sigungu_name`, `legal_dong_name` 조합 중복 방지
- `idx_legal_dong_codes_lawd_cd`: 실거래가 API 지역 단위 조회 보조
- `idx_legal_dong_codes_names`: 주소 정제 후 법정동코드 lookup 보조

`legal_dong_code_source_rows` table:

| Column | Purpose |
| --- | --- |
| `region_cd` | 행정표준코드 API의 10자리 지역코드 |
| `sido_cd`, `sgg_cd`, `umd_cd`, `ri_cd` | 시도/시군구/읍면동/리 원천 코드 |
| `locat_jumin_cd`, `locat_jijuk_cd` | 주민/지적 지역코드 후보 |
| `locat_add_nm` | 지역주소명 원문 |
| `locat_order`, `locat_rm`, `locat_high_cd`, `locallow_nm`, `adpt_de` | 정렬, 비고, 상위지역코드, 최하위지역명, 생성일 원천 필드 |
| `source_status` | 현재는 API sync로 확인된 `ACTIVE` row |
| `last_synced_at` | 마지막 수동 sync 시각 |

현재 seed 범위:

```text
서울특별시 관악구 봉천동 -> 1162010100, LAWD_CD 11620
서울특별시 관악구 신림동 -> 1162010200, LAWD_CD 11620
서울특별시 관악구 남현동 -> 1162010300, LAWD_CD 11620
```

`legal_dong_aliases` table:

| Column | Purpose |
| --- | --- |
| `id` | 내부 surrogate primary key |
| `legal_dong_code` | canonical 법정동코드. `legal_dong_codes.legal_dong_code`를 참조한다. |
| `alias_type` | alias 종류. 현재는 `ADMINISTRATIVE_DONG`만 사용한다. |
| `alias_code` | 행정기관코드 10자리. 예: `대학동`은 `1162073500` |
| `alias_name` | 사용자가 입력할 수 있는 행정동명 |
| `active` | 현재 사용 여부 |
| `created_at` | seed row 생성 시각 |
| `updated_at` | seed row 수정 시각 |

제약과 index:

- `fk_legal_dong_aliases_legal_dong_code`: alias가 존재하지 않는 법정동코드를 가리키지 못하게 한다.
- `uk_legal_dong_aliases_code`: 같은 행정동코드 중복 seed를 막는다.
- `uk_legal_dong_aliases_mapping`: 같은 법정동 아래 같은 alias 이름 중복을 막는다.
- `chk_legal_dong_aliases_type`: 현재 허용한 alias 종류를 `ADMINISTRATIVE_DONG`으로 제한한다.
- `idx_legal_dong_aliases_name`: 사용자가 입력한 행정동명 lookup을 보조한다.
- `idx_legal_dong_aliases_legal_dong_code`: 법정동 기준 alias 조회를 보조한다.

현재 alias seed 범위:

```text
관악구 봉천동 <- 보라매동, 청림동, 성현동, 행운동, 낙성대동, 청룡동, 은천동, 중앙동, 인헌동
관악구 남현동 <- 남현동
관악구 신림동 <- 서원동, 신원동, 서림동, 신사동, 신림동, 난향동, 조원동, 대학동, 삼성동, 미성동, 난곡동
```

예시:

```text
사용자 입력: 서울시 관악구 대학동 1422-5
alias lookup: 대학동(1162073500) -> 신림동(1162010200)
외부 API 기준: 법정동코드 1162010200, LAWD_CD 11620
```

중요한 설계 선택:

- `LeaseRiskAddressNormalizer`는 MyBatis mapper를 직접 호출하지 않고 `LegalDongCodeCatalog` interface에만 의존한다.
- 운영 Spring bean은 `MyBatisLegalDongCodeCatalog`가 맡는다.
- `InMemoryLegalDongCodeCatalog`는 `@Service`를 제거해 테스트 fake로만 사용한다.
- `LegalDongCodeCatalog`는 이제 `LegalDongCode` 하나가 아니라 `LegalDongCodeMatch`를 반환한다. 이 객체는 `inputDongName`, canonical `legalDongName`, `administrativeDongCode`, `administrativeDongMatched`를 함께 표현한다.
- DB seed는 아직 전국 법정동코드와 행정동-법정동 연계 데이터 전체를 담지 않는다. 주소 후보 검색은 Juso 팝업 API가 돕지만, `LeaseRiskAddressNormalizer`는 `legal_dong_codes`와 `legal_dong_aliases` seed 범위 안에서만 법정동코드를 확정한다. seed 밖 주소는 `LEGAL_DONG_CODE_NOT_FOUND`가 정상이며, 전국 지원은 법정동코드 seed 확장 작업으로 해결해야 한다.

## Rent risk diagnosis history schema

전세·월세 위험진단은 사용자의 입력 조건과 최종 위험 문장을 운영자가 추적할 수 있어야 한다. 이력 저장은 외부 API 원본 전체를 DB에 무조건 저장하는 기능이 아니라, 검색·비교·조인·운영 감사에 필요한 구조화 snapshot을 남기는 기능이다.

현재 구현:

```text
backend/src/main/resources/db/migration/V11__create_rent_risk_diagnosis_history.sql
backend/src/main/java/com/zipon/mapper/RentRiskDiagnosisHistoryMapper.java
backend/src/main/java/com/zipon/service/RentRiskDiagnosisHistoryService.java
backend/src/main/java/com/zipon/controller/AdminRentRiskDiagnosisHistoryController.java
```

`rent_risk_diagnosis_histories` table:

| Column | Purpose |
| --- | --- |
| `id` | 저장된 위험진단 이력 id. `RentRiskDiagnosisResponse.diagnosisId`로 내려간다. |
| `requester_user_id` | 로그인 사용자가 진단한 경우 `users.id`. 익명 진단이면 `null`이다. |
| `diagnosis_state` | `success`, `empty` 같은 최종 진단 상태다. |
| `risk_level` | 사용자에게 내려간 위험 수준 문장이다. |
| `contract_purpose` | `JEONSE`, `MONTHLY_RENT` 같은 계약 목적이다. |
| `address` | 사용자가 입력한 원본 주소다. |
| `normalized_address` | 주소 정제가 성공했을 때의 표준 주소다. |
| `legal_dong_code` | 법정동코드 10자리다. |
| `sigungu_code` | 실거래가 API 조회에 사용하는 앞 5자리 `LAWD_CD`다. |
| `known_property_type` | 사용자가 입력한 매물 유형 표현이다. |
| `deposit_amount_manwon` | 보증금. 단위는 만 원이다. |
| `monthly_rent_amount_manwon` | 월세. 단위는 만 원이다. |
| `maintenance_fee_amount_manwon` | 관리비. 단위는 만 원이다. |
| `request_payload_json` | 진단 요청 snapshot이다. |
| `response_payload_json` | 진단 응답 snapshot이다. |
| `created_at` | 이력 생성 시각이다. |

제약과 index:

- `fk_rent_risk_diagnosis_histories_requester`: `requester_user_id`가 `users.id`를 참조하고, 사용자가 삭제되면 `NULL`로 남긴다.
- `idx_rent_risk_diagnosis_histories_requester_user_id`: 사용자별 이력 조회 후보를 위한 index다.
- `idx_rent_risk_diagnosis_histories_created_at`: 최신순 관리자 목록 조회 보조 index다.
- `idx_rent_risk_diagnosis_histories_legal_dong_code`: 법정동코드 기준 운영 조회 보조 index다.
- `idx_rent_risk_diagnosis_histories_diagnosis_state`: 제한 진단/성공 진단 필터용 index다.

운영 의미:

```text
POST /api/rent-risk-diagnoses
-> RentRiskDiagnosisService.diagnose(...)
-> RentRiskDiagnosisHistoryService.saveHistory(...)
-> RentRiskDiagnosisHistoryMapper.insert(...)
-> rent_risk_diagnosis_histories
```

관리자 조회는 아래 제한된 도메인 API만 사용한다.

```text
GET /api/admin/rent-risk-diagnoses
GET /api/admin/rent-risk-diagnoses/{diagnosisId}
```

이 API는 `SecurityConfig`의 `/api/admin/rent-risk-diagnoses/**` 진단 데이터 authority 규칙으로 보호된다. 임의 SQL 실행 기능이 아니며, 검색 조건도 `keyword`, `diagnosisState`, `page`, `size`로 제한한다.

## Registry document confirmation schema

등기부등본은 공공 API만으로 권리관계를 확정할 수 없으므로, 현재 MVP는 원본 PDF 업로드나 OCR 분석 대신 로그인 사용자가 본인 위험진단 이력에 대해 수동 확인 상태를 남길 수 있게 한다. 이 테이블은 파일 원본을 저장하는 곳이 아니라, "확인 전/확인함/도움 필요"라는 구조화된 상태와 짧은 memo를 저장하는 DB 정본이다.

현재 구현:

```text
backend/src/main/resources/db/migration/V13__create_registry_document_confirmations.sql
backend/src/main/java/com/zipon/mapper/RegistryDocumentConfirmationMapper.java
backend/src/main/java/com/zipon/service/RegistryDocumentConfirmationService.java
backend/src/main/java/com/zipon/controller/RentRiskDiagnosisController.java
```

`registry_document_confirmations` table:

| Column | Purpose |
| --- | --- |
| `id` | 등기부등본 수동 확인 기록 id다. |
| `diagnosis_history_id` | 연결된 `rent_risk_diagnosis_histories.id`다. 진단 이력 하나당 확인 상태는 하나만 둔다. |
| `requester_user_id` | 확인 상태를 남긴 `users.id`다. 본인 이력 권한 확인과 사용자 삭제 cascade에 사용한다. |
| `confirmation_status` | `NOT_CHECKED`, `CHECKED`, `NEEDS_HELP` 중 하나다. |
| `memo` | 사용자가 등기부등본 확인 과정에서 남긴 짧은 메모다. 최대 1000자까지 받는다. |
| `created_at` | 확인 기록 생성 시각이다. |
| `updated_at` | 확인 기록 마지막 수정 시각이다. |

제약과 index:

- `uk_registry_document_confirmations_history`: 한 진단 이력에 중복 확인 row가 생기지 않게 한다.
- `fk_registry_document_confirmations_history`: 진단 이력이 삭제되면 확인 상태도 함께 삭제한다.
- `fk_registry_document_confirmations_requester`: 사용자가 삭제되면 확인 상태도 함께 삭제한다.
- `idx_registry_document_confirmations_requester`: 사용자별 확인 상태 조회 후보를 위한 index다.
- `idx_registry_document_confirmations_status`: 확인 전/도움 필요 상태 운영 조회 후보를 위한 index다.

운영 의미:

```text
GET /api/rent-risk-diagnoses/{diagnosisId}/registry-document-confirmation
PUT /api/rent-risk-diagnoses/{diagnosisId}/registry-document-confirmation
-> RegistryDocumentConfirmationService
-> RentRiskDiagnosisHistoryMapper.findByIdAndRequester(...)
-> RegistryDocumentConfirmationMapper
-> registry_document_confirmations
```

권한은 두 겹으로 막는다.

1. `SecurityConfig`가 해당 endpoint를 인증 필요 API로 분류한다.
2. `RegistryDocumentConfirmationService`가 `RentRiskDiagnosisHistoryMapper.findByIdAndRequester(...)`로 로그인 사용자의 본인 진단 이력인지 확인한다.

원본 등기부등본 PDF, OCR 대상 이미지, OCR 결과 원문은 아직 저장하지 않는다. 해당 데이터는 크고 민감한 binary 또는 원본 payload이므로 S3/object storage 전략, 암호화, 보존 기간, 삭제 정책이 정해진 뒤 별도 migration과 API로 분리해야 한다.

## External API call log schema

외부 API 호출 로그는 위험진단 운영자가 data.go.kr/VWorld 연동 상태를 확인하기 위한 append-only 운영 로그다. 원본 API 응답 전체나 API key를 저장하는 기능이 아니다.

현재 구현:

```text
backend/src/main/resources/db/migration/V12__create_external_api_call_logs.sql
backend/src/main/java/com/zipon/mapper/ExternalApiCallLogMapper.java
backend/src/main/java/com/zipon/service/ExternalApiCallLogService.java
backend/src/main/java/com/zipon/controller/AdminExternalApiCallLogController.java
```

`external_api_call_logs` table:

| Column | Purpose |
| --- | --- |
| `id` | 외부 API 호출 로그 id다. |
| `provider` | `data.go.kr`, `vworld` 같은 제공자다. |
| `api_name` | `building-register-title`, `APARTMENT_RENT`처럼 서비스 관점에서 식별할 API 이름이다. |
| `endpoint_path` | query string과 service key를 제외한 endpoint path다. |
| `http_method` | 현재는 `GET`이다. |
| `request_summary` | `LAWD_CD`, `DEAL_YMD`, `pnu`처럼 secret이 아닌 요청 요약이다. |
| `result_status` | `SUCCESS`, `EMPTY`, `UNAVAILABLE`, `ERROR` 중 하나다. |
| `http_status_code` | 실제 HTTP 호출을 시도한 경우의 status code다. key 미설정으로 호출하지 않으면 `null`이다. |
| `duration_millis` | 호출 또는 skip 처리에 걸린 시간이다. |
| `error_message` | 정제된 오류 메시지다. |
| `created_at` | 로그 생성 시각이다. |

제약과 index:

- `idx_external_api_call_logs_created_at`: 최신 운영 로그 조회 보조 index다.
- `idx_external_api_call_logs_provider_created_at`: 제공자별 필터 조회 보조 index다.
- `idx_external_api_call_logs_status_created_at`: 결과 상태별 필터 조회 보조 index다.

운영 의미:

```text
DataGoKrBuildingRegisterApiClient / DataGoKrRentTransactionApiClient
DataGoKrSaleTransactionApiClient / VWorldPublicPriceApiClient
-> ExternalApiCallLogger.recordExternalApiCall(...)
-> ExternalApiCallLogMapper.insert(...)
-> external_api_call_logs
```

관리자 조회는 아래 제한된 도메인 API만 사용한다.

```text
GET /api/admin/external-api-call-logs
```

이 API는 `SecurityConfig`의 `/api/admin/external-api-*` 외부 API 운영 authority 규칙으로 보호된다. 임의 SQL 실행 기능이 아니며, 검색 조건도 `keyword`, `resultStatus`, `page`, `size`로 제한한다.

## Test strategy

테스트는 Testcontainers MySQL에서 Flyway migration을 실행한다.

이유:

- 실제 MySQL 계열 datasource에서 같은 Flyway migration SQL을 테스트 시작 시 적용한다.
- 인증 MyBatis mapper가 migration schema와 맞는지 `AuthIntegrationTest`로 검증한다.
- 지역 MyBatis mapper가 migration schema와 맞는지 `RegionIntegrationTest`로 검증한다.
- 로컬/학습용 seed user와 `users` 테이블 조합별 데모 사용자 수는 `SeedUserIntegrationTest`로 검증한다.
- 커뮤니티 MyBatis mapper가 migration schema와 맞는지 `CommunityIntegrationTest`로 검증한다.
- 법정동코드 seed와 `LegalDongCodeMapper` 정합성은 `MyBatisLegalDongCodeCatalogIntegrationTest`로 검증한다.
- 관리자 사용자/권한 schema와 커뮤니티 권한 차단은 `AdminUserIntegrationTest`로 검증한다.
- 법정동/행정동 alias 정합성은 `LeaseRiskAddressNormalizerTest`, `MyBatisLegalDongCodeCatalogIntegrationTest`, `RentRiskDiagnosisIntegrationTest`로 검증한다.
- 위험진단 이력 schema와 관리자 조회 권한은 `RentRiskDiagnosisHistoryIntegrationTest`로 검증한다.
- 외부 API 호출 로그 schema와 관리자 조회 권한은 `ExternalApiCallLogIntegrationTest`로 검증한다.
- 등기부등본 수동 확인 schema, 본인 이력 권한, 필수 상태 validation은 `RentRiskDiagnosisHistoryIntegrationTest`의 `authenticatedUserCanSaveAndReadRegistryDocumentConfirmationForOwnDiagnosis()`, `registryDocumentConfirmationRequiresAuthenticatedOwner()`, `registryDocumentConfirmationRejectsMissingStatus()`로 검증한다.

명시된 test profile:

```text
backend/src/test/resources/application-test.yml
backend/src/test/java/com/zipon/AuthIntegrationTest.java
backend/src/test/java/com/zipon/RegionIntegrationTest.java
backend/src/test/java/com/zipon/SeedUserIntegrationTest.java
backend/src/test/java/com/zipon/CommunityIntegrationTest.java
backend/src/test/java/com/zipon/AdminUserIntegrationTest.java
backend/src/test/java/com/zipon/ZipOnApplicationTests.java
backend/src/test/java/com/zipon/service/MyBatisLegalDongCodeCatalogIntegrationTest.java
backend/src/test/java/com/zipon/RentRiskDiagnosisHistoryIntegrationTest.java
backend/src/test/java/com/zipon/ExternalApiCallLogIntegrationTest.java
```

실행:

```bash
cd backend
./mvnw test
```

Tradeoff:

- Testcontainers test는 Docker daemon이 필요하지만 MySQL SQL 호환성 리스크를 줄인다.
- Docker Desktop이 꺼져 있으면 backend test가 실패할 수 있으므로 테스트 전 container runtime 상태를 확인한다.
- 외부 API는 테스트에서 실제 호출하지 않고 fake/client fallback으로 검증한다.

## Debugging checklist

MySQL container:

- `docker` 명령이 없으면 Docker Desktop, Colima, OrbStack 같은 container runtime과 Docker CLI가 설치되어 있는지 확인한다.
- `docker compose -f docker-compose.yml ps`에서 `zipon-mysql`이 `healthy`인지 확인한다.
- `docker compose -f docker-compose.yml logs -f mysql`에서 초기화 실패가 없는지 확인한다.
- `MYSQL_PORT`가 이미 사용 중이면 `.env`에서 다른 port를 지정한다.
- macOS에서 Homebrew MySQL이 3306을 잡고 있는지 확인하려면 `lsof -nP -iTCP:3306 -sTCP:LISTEN`을 실행한다.
- `mysqld`가 이미 3306을 사용 중이면 Spring Boot local profile은 Docker MySQL이 아니라 그 MySQL에 연결할 수 있다. 이때 `Access denied for user 'zipon_user'@'localhost'`가 나면 DB 사용자/비밀번호가 `.env`와 맞지 않는 것이다.
- 해결 선택지는 둘 중 하나다. Docker MySQL을 쓸 거면 `.env`의 `MYSQL_PORT`를 예를 들어 `3307`로 바꾸고 container를 다시 띄운다. 이미 설치된 Homebrew MySQL을 쓸 거면 그 MySQL 안에 `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`와 일치하는 database/user/grant를 만든다.

Datasource:

- backend를 `local` profile로 실행했는지 확인한다.
- root `.env`가 있는지 확인한다.
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`가 Docker Compose와 Spring Boot에서 같은 값인지 확인한다.
- `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`가 비어 있어도 local profile 기본 경로에서는 정상이다.
- JDBC URL의 host, port, database 이름이 맞는지 확인한다.

Flyway:

- `spring.flyway.enabled=true`가 활성 profile에서 유지되는지 확인한다.
- migration 파일이 `backend/src/main/resources/db/migration` 아래에 있는지 확인한다.
- `flyway_schema_history`에 적용 이력이 남았는지 확인한다.
- test 로그에 source보다 많은 migration이 보이면 `cd backend && ./mvnw clean test`로 stale `target/classes`를 제거한다.
- JPA/Hibernate나 `ddl-auto` 설정이 다시 들어오지 않았는지 확인한다.

Auth/MyBatis:

- `UserMapper`, `RefreshTokenMapper`, `RevokedAccessTokenMapper`가 참조하는 컬럼이 migration SQL과 일치하는지 확인한다.
- token 원문이 아니라 `token_hash`만 저장되는지 확인한다.
- 시간 컬럼은 UTC 기준으로 저장/해석되는지 확인한다.

Region/MyBatis:

- `RegionMapper`가 참조하는 `regions` 컬럼이 `V2__create_region_schema.sql`과 일치하는지 확인한다.
- `region_name` 부분 검색과 `legal_code` 정확 일치 검색을 구분한다.
- 없는 region ID가 500이 아니라 404로 응답되는지 확인한다.

Community/MyBatis:

- `CommunityPostMapper`, `CommunityCommentMapper`가 참조하는 기본 컬럼이 `V4__create_community_board_schema.sql`과 일치하는지 확인한다.
- 좋아요, 신고, 첨부파일, 관리자 조치 컬럼과 table은 `V6__extend_community_moderation_schema.sql`과 일치하는지 확인한다.
- 게시글/댓글 작성, 수정, 삭제가 막히면 `user_permissions`의 해당 boolean과 `UserPermissionService` 검사를 확인한다.
- `community_posts.status = 'PUBLISHED'` 조건 때문에 삭제된 글은 목록/상세에서 제외된다.
- `community_posts.status = 'HIDDEN'`도 public 목록/상세에서 제외된다.
- `community_comments.depth`가 0 또는 1인지 확인한다.

Admin user permission/MyBatis:

- `user_permissions` table이 `V7__create_admin_user_permission_schema.sql`로 적용됐는지 확인한다.
- 신규 가입 사용자는 `AuthService.signUp()` 이후 `user_permissions` row가 생기는지 확인한다.
- 관리자 추가 사용자는 `AdminUserService.createUser()` 이후 role과 permission row가 함께 생기는지 확인한다.
- 탈퇴 처리된 사용자는 `users.enabled = false`가 되고 기존 access token 요청이 401이 되는지 확인한다.

Lease risk legal-dong/MyBatis:

- `legal_dong_codes` table이 `flyway_schema_history` 기준으로 적용됐는지 확인한다.
- `legal_dong_aliases` table이 `V10__create_legal_dong_alias_schema.sql`로 적용됐는지 확인한다.
- `legal_dong_code_source_rows` table이 `V25__create_legal_dong_code_source_rows.sql`로 적용됐는지 확인한다.
- `LegalDongCodeMapper.findDongCodeMatchByRegionNames(...)`의 region name이 `LeaseRiskAddressNormalizer`의 표준화 결과와 같은지 확인한다.
- `서울시`는 `LeaseRiskAddressNormalizer`에서 `서울특별시`로 변환된 뒤 lookup된다.
- `legal_dong_code`는 10자리이고, `LegalDongCode.lawdCd()`가 앞 5자리 `LAWD_CD`를 반환하는지 확인한다.
- 행정동 입력이 들어왔는데 `LEGAL_DONG_CODE_NOT_FOUND`가 나오면 `legal_dong_aliases.alias_name`, `alias_type`, `active`, 연결된 `legal_dong_codes.active`를 함께 확인한다.
- 응답의 `inputDongName`은 사용자 입력 동명이고, `legalDongName`은 외부 API에 사용할 canonical 법정동명이다.
- 로컬 starter seed만 적용한 상태에서는 관악구/성동구 일부 밖 주소가 `LEGAL_DONG_CODE_NOT_FOUND`가 될 수 있다. 전국 또는 특정 시도 catalog가 필요하면 `backend-legal-dong-sync` profile이나 `LegalDongCodeSyncRunner`로 `legal_dong_code_source_rows`와 `legal_dong_codes`를 먼저 채운다.

Rent risk diagnosis history/MyBatis:

- `rent_risk_diagnosis_histories` table이 `flyway_schema_history` 기준으로 적용됐는지 확인한다.
- `POST /api/rent-risk-diagnoses` 응답에 `diagnosisId`가 있는지 확인한다.
- 익명 진단이면 `requester_user_id`가 `NULL`인지 확인한다.
- 로그인 사용자 진단이면 `requester_user_id`가 JWT principal의 `userId`와 연결되는지 확인한다.
- `/api/admin/rent-risk-diagnoses`는 token 없음 401, `ROLE_USER` 403, 진단 데이터 authority 200인지 확인한다.
- request/response snapshot은 외부 API 원본 전체 저장소가 아니라 운영 추적용 JSON snapshot이라는 점을 구분한다.

## Learning path

1. 먼저 읽기: root `docker-compose.yml`
2. 다음에 보기: root `.env.example`
3. 다음에 보기: `backend/src/main/resources/application.yml`
4. 다음에 보기: `backend/src/main/resources/db/migration`
5. 다음에 보기: `UserMapper`, `RefreshTokenMapper`, `RevokedAccessTokenMapper`, `RegionMapper`, `CommunityPostMapper`, `CommunityCommentMapper`, `AdminUserMapper`, `UserPermissionMapper`, `RentRiskDiagnosisHistoryMapper`
6. 전세 위험진단 DB 보기: `LegalDongCodeMapper`, `LegalDongCodeMatch`, `MyBatisLegalDongCodeCatalog`, `LeaseRiskAddressNormalizer`, `RentRiskDiagnosisHistoryService`
7. 다음에 실행: `docker compose -f docker-compose.yml up -d mysql`
8. 에러가 나면 확인: container health, `.env`, profile, JDBC URL, Flyway history, mapper SQL
