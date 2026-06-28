---
title: ROLE_DEPARTMENT_AUTHORIZATION
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-29T05:00:06+09:00
purpose: security-authorization-current-architecture
status: active
code_sync_required: true
related_code: 
read_when: 
update_when: 
  - backend/src/main/java/com/zipon/config/SecurityConfig.java
  - backend/src/main/java/com/zipon/domain/UserRole.java
  - backend/src/main/java/com/zipon/domain/AuthorityCode.java
  - backend/src/main/java/com/zipon/domain/DepartmentCode.java
  - backend/src/main/java/com/zipon/controller/AdminUserController.java
  - backend/src/main/java/com/zipon/controller/AdminVolatileStateAlertController.java
  - frontend/src/auth/authorizationPolicy.js
  - frontend/src/router/index.js
  - 관리자 role, authority, department, admin API 접근 규칙을 수정할 때
  - 프론트 관리자 화면 접근 조건이나 운영자 메뉴 노출 조건을 수정할 때
  - UserRole, AuthorityCode, SecurityConfig의 /api/admin/** matcher, AdminDashboard 권한 UI가 바뀔 때
---

# 역할, 권한, 부서 기반 관리자 접근 정책

> Status: Updated on 2026-06-24

이 문서는 ZIP:ON 관리자 권한이 `ROLE_ADMIN` 하나에서 역할, 업무 권한, 부서 코드로 분리된 내용을 정리한다. `UserRole`은 계정의 대표 역할이고, `AuthorityCode`는 실제로 수행할 수 있는 업무 권한이며, `DepartmentCode`는 조직/화면 분류를 위한 코드다.

## 대표 코드

```text
backend/src/main/java/com/zipon/domain/UserRole.java
backend/src/main/java/com/zipon/domain/AuthorityCode.java
backend/src/main/java/com/zipon/domain/DepartmentCode.java
backend/src/main/java/com/zipon/config/SecurityConfig.java
backend/src/main/java/com/zipon/audit/AdminAudit.java
backend/src/main/java/com/zipon/audit/AdminAuditAspect.java
backend/src/main/java/com/zipon/audit/AuditIntegritySigner.java
backend/src/main/java/com/zipon/audit/AuditPayloadSanitizer.java
backend/src/main/java/com/zipon/security/JwtTokenService.java
backend/src/main/java/com/zipon/security/CustomUserPrincipal.java
backend/src/main/java/com/zipon/service/AdminUserService.java
backend/src/main/java/com/zipon/service/AdminActionAuditLogService.java
backend/src/main/java/com/zipon/mapper/AdminActionAuditLogMapper.java
backend/src/main/resources/db/migration/V15__extend_user_department_and_operator_roles.sql
backend/src/main/resources/db/migration/V29__create_admin_action_audit_logs.sql
backend/src/main/resources/db/migration/V31__upgrade_admin_action_audit_logs_for_aop.sql
frontend/src/auth/authorizationPolicy.js
frontend/src/router/index.js
frontend/src/components/common/AppHeader.vue
frontend/src/views/AdminDashboardView.vue
```

## Role enum

현재 지원하는 role code:

```text
ROLE_USER
ROLE_ADMIN
ROLE_DEVELOPER_ADMIN
ROLE_SYSTEM_ADMIN
ROLE_HR_MANAGER
ROLE_OPERATION_MANAGER
ROLE_DATA_MANAGER
ROLE_EXTERNAL_API_MANAGER
ROLE_CS_MANAGER
ROLE_AUDIT_MANAGER
```

`ROLE_ADMIN`은 기존 seed admin과 호환하기 위한 legacy super admin 역할로 유지한다.

## AuthorityCode enum

현재 지원하는 authority code:

```text
USER_MANAGE
COMMUNITY_MODERATE
DIAGNOSIS_DATA_READ
EXTERNAL_API_READ
AUDIT_LOG_READ
ADMIN_SYSTEM_ACCESS
```

중요한 구분:

```text
UserRole.isOperatorRole()
-> 관리자 화면에 들어갈 수 있는 운영 계정인지 나타내는 큰 분류

UserRole.hasAuthority(AuthorityCode)
-> 사용자 관리, 커뮤니티 운영, 외부 API 로그 조회 같은 실제 업무 가능 여부
```

따라서 `ROLE_HR_MANAGER`처럼 운영 계정으로 분류되더라도 현재 연결된 업무 권한이 없으면 `/api/admin/users/**`나 커뮤니티 타인 글 삭제를 할 수 없다. 반대로 `ROLE_OPERATION_MANAGER`와 `ROLE_CS_MANAGER`는 `COMMUNITY_MODERATE`를 가지므로 커뮤니티 신고 검토와 타인 게시글/댓글 삭제 override가 가능하다.

## Department enum

현재 지원하는 department code:

```text
GENERAL_USER
DEV
SYSTEM
HR
OPERATION
DATA
EXTERNAL_API
CS
AUDIT
```

관리자 생성/역할 변경 요청에서 `departmentCode`를 생략하면 `UserRole.defaultDepartmentCode()`가 적용된다.

## SecurityFilterChain 접근 규칙

`SecurityConfig.securityFilterChain(...)`에서 관리자 경로별 authority를 명시한다.

| URL pattern | AuthorityCode | Role names derived from `UserRole` |
| --- | --- | --- |
| `/api/admin/users/**` | `USER_MANAGE` | `ROLE_ADMIN`, `ROLE_DEVELOPER_ADMIN`, `ROLE_SYSTEM_ADMIN` |
| `/api/admin/community/**` | `COMMUNITY_MODERATE` | `ROLE_ADMIN`, `ROLE_SYSTEM_ADMIN`, `ROLE_OPERATION_MANAGER`, `ROLE_CS_MANAGER` |
| `/api/admin/rent-risk-diagnoses/**` | `DIAGNOSIS_DATA_READ` | `ROLE_ADMIN`, `ROLE_DEVELOPER_ADMIN`, `ROLE_SYSTEM_ADMIN`, `ROLE_DATA_MANAGER` |
| `/api/admin/external-api-call-logs/**` | `EXTERNAL_API_READ` | `ROLE_ADMIN`, `ROLE_DEVELOPER_ADMIN`, `ROLE_SYSTEM_ADMIN`, `ROLE_EXTERNAL_API_MANAGER` |
| `/api/admin/external-api-health/**` | `EXTERNAL_API_READ` | `ROLE_ADMIN`, `ROLE_DEVELOPER_ADMIN`, `ROLE_SYSTEM_ADMIN`, `ROLE_EXTERNAL_API_MANAGER` |
| `/api/admin/external-data-status/**` | `EXTERNAL_API_READ` | `ROLE_ADMIN`, `ROLE_DEVELOPER_ADMIN`, `ROLE_SYSTEM_ADMIN`, `ROLE_EXTERNAL_API_MANAGER` |
| `/api/admin/volatile-state-alerts/**` | operator role 전체 | `ROLE_ADMIN`, `ROLE_DEVELOPER_ADMIN`, `ROLE_SYSTEM_ADMIN`, `ROLE_HR_MANAGER`, `ROLE_OPERATION_MANAGER`, `ROLE_DATA_MANAGER`, `ROLE_EXTERNAL_API_MANAGER`, `ROLE_CS_MANAGER`, `ROLE_AUDIT_MANAGER` |
| `/api/admin/audit-logs/**` | `AUDIT_LOG_READ` | `ROLE_ADMIN`, `ROLE_DEVELOPER_ADMIN`, `ROLE_SYSTEM_ADMIN`, `ROLE_AUDIT_MANAGER` |
| fallback `/api/admin/**` | `ADMIN_SYSTEM_ACCESS` | `ROLE_ADMIN`, `ROLE_DEVELOPER_ADMIN`, `ROLE_SYSTEM_ADMIN` |

`/api/admin/volatile-state-alerts/**`는 특정 업무 권한이 아니라 운영자 shell 전체에 필요한 scheduler lock/volatile state 알림을 보여주는 보조 API다. 따라서 `UserRole.OPERATOR_AUTHORITIES`를 사용한다. 이 API는 Redis key 전체를 노출하지 않고 `VolatileStateAlertService`가 허용한 known alert만 문장으로 변환한다.

## Frontend 관리자 접근 정렬

프론트엔드는 더 이상 `ROLE_ADMIN` 하나만 관리자 화면 접근 기준으로 보지 않는다. `frontend/src/auth/authorizationPolicy.js`가 backend `UserRole` enum과 같은 관리자 role 목록과 `AUTHORITY_CODES`, `ROLE_AUTHORITY_MAP`을 가진다.

```text
ADMIN_AUTHORITIES
ROLE_ADMIN
ROLE_DEVELOPER_ADMIN
ROLE_SYSTEM_ADMIN
ROLE_HR_MANAGER
ROLE_OPERATION_MANAGER
ROLE_DATA_MANAGER
ROLE_EXTERNAL_API_MANAGER
ROLE_CS_MANAGER
ROLE_AUDIT_MANAGER
```

```text
AUTHORITY_CODES
ROLE_AUTHORITY_MAP
roleHasAuthority(...)
userHasRoleAuthority(...)
```

`frontend/src/router/index.js`의 `/admin` navigation guard와 `frontend/src/components/common/AppHeader.vue`의 관리자 링크 노출 조건은 `isAdminOperator(...)`를 사용한다. 그래서 `ROLE_EXTERNAL_API_MANAGER`, `ROLE_DATA_MANAGER`, `ROLE_OPERATION_MANAGER` 같은 부서 관리자 계정도 관리자 화면에 들어갈 수 있고, 실제 API 접근 가능 범위는 backend `SecurityConfig`가 다시 제한한다.

중요한 구분:

```text
Frontend /admin 접근 허용
-> 운영자용 화면 shell을 볼 수 있는지 1차 판단

Backend /api/admin/... 접근 허용
-> 각 도메인 API를 실제로 호출할 수 있는지 최종 판단
```

프론트 판단은 UX 보조일 뿐 보안의 최종 방어선이 아니다. 예를 들어 `ROLE_EXTERNAL_API_MANAGER`는 관리자 화면에 들어갈 수 있지만 `/api/admin/users/**` 호출은 backend에서 403이 된다.

## 관리자 사용자 관리 UI

`frontend/src/views/AdminDashboardView.vue`는 사용자 생성과 role 변경 시 전체 `ROLE_OPTIONS`와 `DEPARTMENT_OPTIONS`를 보여준다. role을 선택하면 해당 role의 기본 department가 자동 선택되고, 운영자가 필요하면 department를 직접 조정할 수 있다.

기존 사용자 권한 표는 글/댓글/관리 권한 boolean을 각각 열로 펼쳐서 화면이 지나치게 길었다. 현재는 다음처럼 입력 방식과 책임을 나눈다.

```text
커뮤니티 권한
- 표 형태 체크박스
- 행: 글, 댓글
- 열: 작성, 수정, 삭제

운영 권한
- preset 드롭다운
- 운영권한 없음
- 전체 페이지 접근
- 커뮤니티 운영
- 회원 운영
- 전체 운영
```

사용자 목록은 `GET /api/admin/users?sort=...`로 정렬한다. 지원 값은 `CREATED_DESC`, `CREATED_ASC`, `USERNAME_ASC`, `ROLE_ASC`, `DEPARTMENT_ASC`, `STATUS_ASC`이며, `AdminUserMapper.findUsers(...)`는 MyBatis `<choose>`로 안전한 `ORDER BY`만 선택한다. `${...}` 문자열 삽입을 쓰지 않기 때문에 정렬 파라미터가 SQL fragment가 되지 않는다.

## 관리자 저장 재인증과 AOP 감사 로그

`PUT /api/admin/users/{userId}/role`와 `PUT /api/admin/users/{userId}/permissions`는 이제 request body에 `confirmationPassword`를 요구한다. 프론트의 `AdminDashboardView.vue`는 role 저장 또는 권한 저장 버튼을 누를 때 비밀번호 확인 dialog를 열고, 확인된 요청만 API로 보낸다. 체크박스나 드롭다운을 누르는 순간에는 DB를 바꾸지 않는다.

저장 요청의 서버 흐름:

```text
AdminUserController
-> AdminUserService.updateRole(...) 또는 updatePermissions(...)
-> 대상 사용자 조회
-> built-in admin 계정 변경 차단
-> CustomUserPrincipal authority가 AuthorityCode.USER_MANAGE를 가진 role인지 확인
-> UserMapper.findById(actorUserId)
-> PasswordEncoder.matches(confirmationPassword, users.password_hash)
-> role/department 또는 user_permissions 저장
-> @AdminAudit method annotation
-> AdminAuditAspect
-> AdminActionAuditLogService.recordInCurrentTransaction(...)
-> admin_action_audit_logs insert
```

감사 로그는 서비스 메서드가 직접 문자열을 조립해서 저장하지 않는다. `AdminUserService`, `CommunityAdminService`, `CommunityPolicyOperationsService`의 중요한 운영 변경 메서드에 `@AdminAudit`을 붙이고, `AdminAuditAspect`가 성공/실패 결과, 대상 ID, actor, requestId, duration, 실패 코드, sanitized request summary를 수집한다. 성공 감사 로그는 같은 transaction 안에 저장되므로 감사 저장이 실패하면 운영 변경도 rollback된다. 비즈니스 예외나 재인증 실패가 발생하면 원래 작업은 실패시키되 `recordFailureInNewTransaction(...)`으로 실패 증적을 별도 transaction에 남긴다.

커뮤니티 정책 제재 수동 해제와 기간 연장은 `CommunityPolicyOperationsService.releaseSanction(...)`, `extendSanction(...)`에서 현재 관리자 비밀번호를 재확인한다. 수동 조치의 운영 감사는 `admin_action_audit_logs`에 남고, 정책 근거 이벤트는 `community_policy_events`에 `MANUAL_SANCTION_OVERRIDE`로 남는다. 스케줄러의 기간 만료 복구는 사람이 클릭한 운영 행위가 아니므로 `community_policy_events`의 `EXPIRED_SANCTION_RESTORE` 이벤트와 `community_policy_sanctions.status = EXPIRED`로 추적한다.

`admin_action_audit_logs`는 `V29__create_admin_action_audit_logs.sql`에서 처음 생성되고, `V31__upgrade_admin_action_audit_logs_for_aop.sql`에서 AOP 운영 감사 스키마로 확장된다. 핵심 컬럼은 `request_id`, `actor_user_id`, `actor_username`, `actor_roles`, `action_type`, `target_type`, `target_id`, `result_status`, `failure_code`, `request_summary_json`, `changed_fields_json`, `client_ip_hash`, `user_agent_summary`, `duration_millis`, `integrity_signature`, `created_at`이다. 기존 V29 형식 행은 `legacy-*` requestId와 `legacy-unverified` signature로 이관되어 조회는 가능하지만 무결성 검증은 실패로 표시될 수 있다.

민감정보 처리:

```text
AuditPayloadSanitizer
-> confirmationPassword, password, token, Authorization 계열 값을 저장하지 않는다.
-> client IP는 AuditIntegritySigner.hashClientValue(...)로 HMAC hash만 저장한다.
-> integrity_signature는 AuditIntegritySigner가 HMAC-SHA256으로 만든다.
-> GET /api/admin/audit-logs 응답은 signature 원문 대신 integritySignatureValid만 보여준다.
```

재인증 실패는 `BadCredentialsException`으로 처리되어 401 응답이 된다. 로그인은 되어 있지만 현재 비밀번호 확인에 실패한 것이므로, 권한 부족 403과 구분한다. 저장 권한 자체가 없으면 `ForbiddenException`으로 403 응답이 된다.

## JWT claim

`JwtTokenService.issueAccessToken(...)`은 access token에 `departmentCode`를 추가한다.

```text
sub             username
userId          users.id
roles           Spring Security authority list
departmentCode  users.department_code
iat             issued at
exp             expires at
jti             access token id
```

중요한 점은 JWT claim만 믿지 않는다는 것이다. `JwtAuthenticationFilter`는 요청마다 `UserMapper.findById(...)`로 현재 DB 사용자 상태와 대표 role을 다시 읽는다. 그래서 관리자가 사용자를 비활성화하거나 role을 바꾸면 기존 access token을 들고 있어도 다음 요청부터 변경된 권한이 적용된다.

## 테스트

```text
backend/src/test/java/com/zipon/AdminUserIntegrationTest.java
backend/src/test/java/com/zipon/AdminActionAuditLogIntegrationTest.java
backend/src/test/java/com/zipon/AuthIntegrationTest.java
backend/src/test/java/com/zipon/SeedUserIntegrationTest.java
backend/src/test/java/com/zipon/domain/UserRoleTest.java
backend/src/test/java/com/zipon/CommunityIntegrationTest.java
```

검증 내용:

```text
외부 API 운영 role은 /api/admin/external-api-call-logs에 접근할 수 있다.
외부 API 운영 role은 /api/admin/users에 접근할 수 없다.
외부 API 운영 role은 커뮤니티 타인 게시글 삭제 override를 할 수 없다.
커뮤니티 운영 role은 커뮤니티 타인 게시글 삭제 override를 할 수 있다.
role 변경은 기존 access token의 다음 요청에도 적용된다.
JWT와 /api/users/me 응답에는 departmentCode가 포함된다.
seed admin은 SYSTEM departmentCode를 가진다.
role/permission 저장은 `confirmationPassword`가 맞아야 성공하고, 성공 시 `admin_action_audit_logs`에 row가 남는다.
role/permission 저장 재인증 실패도 `admin_action_audit_logs.result_status=FAILURE`로 남고, 실패 코드는 `AUTH_401_INVALID_CREDENTIALS`로 조회된다.
`ROLE_AUDIT_MANAGER`는 `/api/admin/audit-logs`를 조회할 수 있지만 `/api/admin/users`는 403으로 차단된다.
감사 로그 응답에는 비밀번호 원문, 잘못 입력한 confirmation password, Authorization header가 포함되지 않는다.
새 감사 로그의 `integritySignatureValid`는 true로 검증된다.
프론트 빌드는 ROLE_OPTIONS, DEPARTMENT_OPTIONS, 체크박스 표, 운영권한 드롭다운, 비밀번호 확인 dialog 변경 후 성공한다.
```

## 학습 포인트

```text
role_name        -> 계정의 대표 역할과 기본 권한 묶음
AuthorityCode    -> 실제 업무 능력을 나타내는 capability
department_code  -> 계정 분류와 화면 표시를 위한 조직 코드
```

Spring Security에서 URL 접근 정책은 `SecurityFilterChain`에 보이게 두는 것이 좋다. 서비스 내부 조건문에 권한 규칙이 흩어지면 어떤 화면이 어떤 role에 열리는지 리뷰하기 어려워진다.

AOP는 비밀번호 해싱이나 핵심 권한 판단을 숨기는 곳이 아니다. ZIP:ON에서는 Spring Security와 서비스 코드가 1차 방어선을 맡고, AOP는 운영자가 어떤 변경을 시도했고 성공/실패했는지 증거를 일관되게 남기는 보조 계층으로 쓴다.
