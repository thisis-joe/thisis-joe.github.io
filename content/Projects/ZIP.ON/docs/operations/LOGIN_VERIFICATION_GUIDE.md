---
title: LOGIN_VERIFICATION_GUIDE
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
---

# 로그인 검증 방법

> Status: Implemented

## 목적

이 문서는 ZIP:ON 로그인 기능이 정상 동작하는지 확인할 때 어떤 순서로 무엇을 봐야 하는지 설명한다.

검증 대상은 단순히 `POST /api/auth/login` 성공 여부가 아니다. ZIP:ON 로그인 검증은 아래를 함께 확인해야 한다.

```text
1. Flyway가 인증 schema를 만든다.
2. 회원가입이 users와 user_roles에 저장된다.
3. Flyway가 로컬/학습용 seed 계정 `admin`과 `demo_user_001`..`demo_user_3600`을 만든다.
4. 로그인은 Spring Security AuthenticationManager를 통해 검증된다.
5. 비밀번호 원문이 아니라 BCrypt hash가 사용된다.
6. access token에는 userId, roles, jti, exp가 들어간다.
7. refresh token 원문은 DB에 저장되지 않고 token_hash만 저장된다.
8. refresh token rotation이 이전 token 재사용을 막는다.
9. logout이 refresh token과 현재 access token을 모두 폐기한다.
10. 보호 API는 access token 없이는 401, 권한 부족이면 403을 반환한다.
```

관련 문서:

- [회원 관리 ERD](/docs/architecture/security/AUTH_MEMBER_ERD.md)
- [인증 DB 스키마](/docs/architecture/security/AUTH_SCHEMA.md)
- [Spring Security JWT 인증 흐름](/docs/architecture/security/SECURITY_AUTHENTICATION.md)
- [MySQL 개발환경과 Flyway migration](/docs/operations/DOCKER_MYSQL_REDIS.md)

## 가장 먼저 볼 파일

로그인 검증은 아래 순서로 읽으면 흐름이 끊기지 않는다.

```text
1. backend/src/main/resources/db/migration/V1__create_auth_schema.sql
2. backend/src/main/resources/db/migration/V3__seed_admin_and_demo_users.sql
3. backend/src/main/resources/db/migration/V43__reseed_demo_users_by_user_table_cases.sql
4. backend/src/main/java/com/zipon/config/SecurityConfig.java
5. backend/src/main/java/com/zipon/controller/AuthController.java
6. backend/src/main/java/com/zipon/service/AuthService.java
7. backend/src/main/java/com/zipon/security/CustomUserDetailsService.java
8. backend/src/main/java/com/zipon/mapper/UserMapper.java
9. backend/src/main/java/com/zipon/security/JwtTokenService.java
10. backend/src/main/java/com/zipon/security/JwtAuthenticationFilter.java
11. backend/src/main/java/com/zipon/service/RefreshTokenService.java
12. backend/src/main/java/com/zipon/service/AccessTokenRevocationService.java
13. backend/src/test/java/com/zipon/AuthIntegrationTest.java
14. backend/src/test/java/com/zipon/SeedUserIntegrationTest.java
```

## 자동 검증

가장 신뢰할 수 있는 첫 검증은 `AuthIntegrationTest`다.

실행:

```bash
cd backend
./mvnw -Dtest=AuthIntegrationTest test
```

전체 backend 확인:

```bash
cd backend
./mvnw clean verify
```

`AuthIntegrationTest`가 검증하는 것:

| Test method | 검증 의미 |
| --- | --- |
| `signUpSucceeds()` | 회원가입 성공, 기본 `ROLE_USER` 응답 |
| `signUpFailsWhenUsernameAlreadyExists()` | username 중복 409 |
| `signUpFailsWhenPasswordIsInvalid()` | password validation 400 |
| `loginSucceedsAndWrongPasswordFails()` | 로그인 성공과 잘못된 password 401 |
| `protectedApiReturns401WhenTokenIsMissingInvalidOrExpired()` | missing/invalid/expired access token 401 |
| `protectedApiAcceptsRealAccessToken()` | 실제 access token으로 `/api/users/me` 성공 |
| `userRoleCannotAccessAdminApi()` | `ROLE_USER`가 admin API 접근 시 403 |
| `refreshTokenRotationRejectsPreviousRefreshToken()` | refresh rotation 후 이전 refresh token 재사용 401 |
| `logoutRevokesRefreshTokenAndCurrentAccessToken()` | logout 후 refresh token과 access token 모두 401 |

`SeedUserIntegrationTest`가 검증하는 것:

| Test method | 검증 의미 |
| --- | --- |
| `seededAdminCanLoginWithAdminPasswordAndReceivesAdminRole()` | `admin/admin` 로그인 성공, BCrypt hash 검증, JWT `roles` claim의 `ROLE_ADMIN` 확인 |
| `seededDemoUsersAreCreatedWithUserTableCaseCoverageAndUserRole()` | `demo_user_001`..`demo_user_3600` 생성, `department_code`/`enabled`/`profile_image_url` 36개 조합별 100명, `ROLE_USER`, `user_permissions`, `user_profiles`, 원문 비밀번호 미저장 확인 |

이 테스트는 `@WithMockUser`를 쓰지 않는다. 실제 HTTP 요청, Spring Security filter chain, JWT 발급/검증, MyBatis mapper, Flyway schema를 함께 통과한다.

## 수동 검증 준비

로컬 MySQL 기준으로 확인하려면 먼저 DB를 띄운다.

```bash
cp .env.example .env
docker compose up -d mysql
docker compose ps
```

`backend/src/main/resources/application.yml`은 root `.env`를 자동으로 import한다. 일반적인 로컬 실행에서는 `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`를 따로 export하지 않아도 된다.

backend를 local profile로 실행한다.

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

기본 서버 포트는 `backend/src/main/resources/application.yml` 기준 `8082`이다.

## 수동 검증 순서

아래 예시는 `localhost:8082` 기준이다.

### 0. Seed 관리자 로그인

`V3__seed_admin_and_demo_users.sql`이 적용된 DB에서는 관리자 계정이 미리 존재한다.

```bash
curl -i -X POST http://localhost:8082/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "admin",
    "password": "admin"
  }'
```

기대:

```text
HTTP 200
data.accessToken 값 존재
Set-Cookie: zipon_refresh_token=...; HttpOnly; SameSite=Strict
JWT roles claim contains ROLE_ADMIN
```

DB에서 볼 것:

```sql
SELECT id, username, password_hash, enabled
FROM users
WHERE username = 'admin';

SELECT user_id, role_name
FROM user_roles
WHERE user_id = <admin users.id>;
```

확인 포인트:

- `users.password_hash`는 원문 `admin`이 아니어야 한다.
- `user_roles.role_name`에는 `ROLE_ADMIN`이 있어야 한다.
- `admin/admin`은 로컬 학습용 계정이다. 운영 DB에는 이 seed를 그대로 적용하지 않는다.

### 1. 회원가입

```bash
curl -i -X POST http://localhost:8082/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "login_tester",
    "password": "password123",
    "email": "login_tester@example.com",
    "nickname": "로그인검증"
  }'
```

기대:

```text
HTTP 201
data.username = login_tester
data.roleName = ROLE_USER
```

DB에서 볼 것:

```sql
SELECT id, username, email, nickname, password_hash, enabled, created_at, password_changed_at, token_version
FROM users
WHERE username = 'login_tester';

SELECT user_id, role_name, created_at
FROM user_roles
WHERE user_id = <users.id>;
```

확인 포인트:

- `password_hash`가 원문 `password123`이 아니어야 한다.
- `password_hash`는 BCrypt hash 형태여야 한다.
- `user_roles.role_name`은 `ROLE_USER`여야 한다.

### 2. 로그인

```bash
curl -i -X POST http://localhost:8082/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "login_tester",
    "password": "password123"
  }'
```

기대:

```text
HTTP 200
data.tokenType = Bearer
data.accessToken 값 존재
data.accessTokenExpiresAt 값 존재
data.refreshTokenExpiresAt 값 존재
Set-Cookie: zipon_refresh_token=...; HttpOnly; SameSite=Strict; Path=/api/auth
```

응답에서 access token을 shell 변수로 저장하고, refresh token cookie는 cookie jar에 저장하면 이후 검증이 편하다.

```bash
ACCESS_TOKEN='<login response의 accessToken>'
```

curl로 검증할 때는 `-c cookies.txt`를 사용한다.

```bash
curl -i -c cookies.txt -X POST http://localhost:8082/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "login_tester",
    "password": "password123"
  }'
```

DB에서 볼 것:

```sql
SELECT id, user_id, token_hash, expires_at, revoked_at, replaced_by, created_at
FROM refresh_tokens
WHERE user_id = <users.id>
ORDER BY id DESC;
```

확인 포인트:

- `refresh_tokens.token_hash`는 원문 refresh token과 달라야 한다.
- 원문 refresh token은 JSON 응답에 없어야 한다.
- `revoked_at`은 아직 `NULL`이어야 한다.
- `expires_at`은 현재 시각보다 미래여야 한다.

### 3. 현재 사용자 확인

```bash
curl -i http://localhost:8082/api/users/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

기대:

```text
HTTP 200
data.username = login_tester
data.authorities contains ROLE_USER
```

코드에서 볼 것:

```text
JwtAuthenticationFilter
-> JwtTokenService.decode(...)
-> AccessTokenRevocationService.isRevoked(jti)
-> JwtTokenService.toAuthentication(...)
-> UserController.getMyPage(...)
```

### 4. 잘못된 password 확인

```bash
curl -i -X POST http://localhost:8082/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "login_tester",
    "password": "wrong-password"
  }'
```

기대:

```text
HTTP 401
```

코드에서 볼 것:

```text
AuthService.login(...)
-> AuthenticationManager.authenticate(...)
-> DaoAuthenticationProvider
-> PasswordEncoder.matches(rawPassword, password_hash)
```

### 5. access token 없이 보호 API 호출

```bash
curl -i http://localhost:8082/api/users/me
```

기대:

```text
HTTP 401
```

이 검증은 `SecurityConfig`에서 `/api/users/me`가 authenticated 경로인지 확인하는 테스트다.

### 6. refresh token rotation

```bash
curl -i -X POST http://localhost:8082/api/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

기대:

```text
HTTP 200
새 accessToken
새 zipon_refresh_token Set-Cookie
```

DB에서 볼 것:

```sql
SELECT id, user_id, token_hash, revoked_at, replaced_by
FROM refresh_tokens
WHERE user_id = <users.id>
ORDER BY id;
```

확인 포인트:

- 기존 refresh token row에는 `revoked_at`이 채워져야 한다.
- 기존 refresh token row의 `replaced_by`는 새 refresh token row의 `id`를 가리켜야 한다.
- 새 refresh token row는 `revoked_at`이 `NULL`이어야 한다.

이전 refresh token 재사용 확인:

```bash
curl -i -X POST http://localhost:8082/api/auth/refresh \
  -b old-cookies.txt
```

기대:

```text
HTTP 401
```

### 7. logout

refresh 후 받은 최신 access token과 최신 cookie jar를 사용해야 한다.

```bash
ACCESS_TOKEN='<refresh response의 새 accessToken>'
```

logout:

```bash
curl -i -X POST http://localhost:8082/api/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -b cookies.txt \
  -c cookies.txt
```

기대:

```text
HTTP 200
Set-Cookie: zipon_refresh_token=; Max-Age=0
```

DB에서 볼 것:

```sql
SELECT id, user_id, revoked_at
FROM refresh_tokens
WHERE user_id = <users.id>
ORDER BY id DESC;

SELECT jti, user_id, expires_at, revoked_at, reason
FROM revoked_access_tokens
WHERE user_id = <users.id>
ORDER BY revoked_at DESC;
```

확인 포인트:

- 최신 refresh token row의 `revoked_at`이 채워져야 한다.
- `revoked_access_tokens.reason`은 `LOGOUT`이어야 한다.

logout 후 같은 access token 재사용:

```bash
curl -i http://localhost:8082/api/users/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

기대:

```text
HTTP 401
```

## 코드 추적 순서

로그인이 성공하는지 코드로 추적할 때는 아래 순서가 좋다.

```text
1. AuthController.login(...)
2. AuthService.login(...)
3. AuthenticationManager.authenticate(...)
4. SecurityConfig.authenticationProvider(...)
5. CustomUserDetailsService.loadUserByUsername(...)
6. UserMapper.findByUsername(...)
7. PasswordEncoder.matches(...)
8. JwtTokenService.issueAccessToken(...)
9. RefreshTokenService.issueRefreshToken(...)
10. RefreshTokenMapper.insert(...)
```

로그인 이후 보호 API 인증은 별도 흐름이다.

```text
1. JwtAuthenticationFilter.doFilterInternal(...)
2. JwtTokenService.decode(...)
3. AccessTokenRevocationService.isRevoked(...)
4. JwtTokenService.toAuthentication(...)
5. SecurityContextHolder.getContext().setAuthentication(...)
6. @AuthenticationPrincipal CustomUserPrincipal
7. UserController.getMyPage(...)
```

## DB 확인 순서

DB 상태를 직접 확인할 때는 아래 순서가 좋다.

```text
1. flyway_schema_history
2. users
3. user_roles
4. refresh_tokens
5. revoked_access_tokens
```

예시:

```sql
SELECT installed_rank, version, description, success
FROM flyway_schema_history
ORDER BY installed_rank;

SELECT id, username, enabled, password_changed_at, token_version
FROM users
ORDER BY id DESC;

SELECT user_id, role_name
FROM user_roles
ORDER BY user_id, role_name;

SELECT id, user_id, expires_at, revoked_at, replaced_by
FROM refresh_tokens
ORDER BY id DESC;

SELECT jti, user_id, expires_at, revoked_at, reason
FROM revoked_access_tokens
ORDER BY revoked_at DESC;
```

## 실패 상황별 확인

### 400 Bad Request

주로 request DTO validation 실패다.

확인할 파일:

```text
SignUpRequest
LoginRequest
GlobalExceptionHandler.handleMethodArgumentNotValidException(...)
```

예시:

- password가 8자 미만
- password에 숫자 또는 문자가 빠짐
- username이 pattern과 맞지 않음
- login username/password blank

### 401 Unauthorized

인증 실패다.

확인할 파일:

```text
JwtAuthenticationEntryPoint
AuthService.login(...)
RefreshTokenService.requireActiveToken(...)
JwtAuthenticationFilter.doFilterInternal(...)
```

주요 원인:

- 잘못된 password
- access token 누락
- access token 형식 오류
- access token 만료
- logout으로 denylist에 들어간 access token
- 이미 rotation된 refresh token 재사용

### 403 Forbidden

인증은 되었지만 권한이 부족한 상태다.

확인할 파일:

```text
SecurityConfig.securityFilterChain(...)
JwtAccessDeniedHandler
JwtTokenService.toAuthentication(...)
```

예시:

- `ROLE_USER` access token으로 `/api/admin/dashboard` 호출

### 409 Conflict

현재 서버 상태와 충돌한 요청이다.

확인할 파일:

```text
AuthService.signUp(...)
UserMapper.countByUsername(...)
ConflictException
GlobalExceptionHandler.handleConflictException(...)
```

예시:

- 이미 존재하는 username으로 회원가입

## 검증 완료 기준

로그인 기능 검증은 아래가 모두 확인되면 완료로 본다.

```text
1. AuthIntegrationTest 통과
2. 회원가입 후 users row 생성
3. 회원가입 후 user_roles ROLE_USER row 생성
4. password_hash가 원문이 아님
5. 로그인 후 access token과 refresh token 발급
6. refresh_tokens에는 raw token이 아니라 hash 저장
7. /api/users/me가 access token으로 성공
8. 잘못된 password는 401
9. token 없이 보호 API 호출은 401
10. ROLE_USER로 admin API 호출은 403
11. refresh 후 이전 refresh token 재사용은 401
12. logout 후 refresh token 재사용은 401
13. logout 후 같은 access token 재사용은 401
```

## Learning path

1. First read: [회원 관리 ERD](/docs/architecture/security/AUTH_MEMBER_ERD.md)
2. Then inspect: `V1__create_auth_schema.sql`
3. Then inspect: `AuthController.login(...)` and `AuthService.login(...)`
4. Then inspect: `CustomUserDetailsService` and `UserMapper`
5. Then inspect: `JwtTokenService` and `JwtAuthenticationFilter`
6. Then run: `cd backend && ./mvnw -Dtest=AuthIntegrationTest test`
7. Then debug: `users`, `user_roles`, `refresh_tokens`, `revoked_access_tokens`
8. Key concept to understand: 로그인은 password 확인으로 끝나지 않고, 이후 요청 인증을 위한 token 발급과 서버 측 token 상태 관리까지 포함한다.
