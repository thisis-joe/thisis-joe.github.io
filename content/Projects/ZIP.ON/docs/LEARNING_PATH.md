---
title: LEARNING_PATH
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
---

# ZIP:ON 학습 경로

> Status: Current learning map

이 문서는 ZIP:ON 문서의 **읽는 순서**를 정하는 중앙 지도입니다.

문서가 많아질수록 초보자가 가장 먼저 막히는 지점은 "어떤 문서를 먼저 봐야 하지?"입니다. 이 문서는 모든 내용을 다시 설명하지 않습니다. 대신 지금 내 상황에 맞는 문서와 코드를 순서대로 안내합니다.

## 1. 문서 역할 구분

ZIP:ON 문서는 크게 네 종류입니다.

| 종류 | 위치 | 언제 읽는가 | 읽는 방식 |
| --- | --- | --- | --- |
| 제품 기준 | `/docs/product/PRODUCT_OVERVIEW.md`, `/docs/product/MVP_SCOPE.md`, `/docs/api/PUBLIC_API_STRATEGY.md`, `/docs/product/ROADMAP.md` | 새 기능의 방향을 정하기 전 | 처음에는 훑고, 기능 설계 때 다시 정독 |
| 확장 기준 | `/docs/product/EXTENSION_SERVICE_DEFINITION.md` | MVP 이후 목적 확장을 고려할 때 | 빈 API나 화면을 만들지 않고 장기 경계만 확인 |
| 구현 reference | `/docs/architecture/BACKEND_STRUCTURE.md`, `/docs/api/API_FUNCTION_MAP.md`, `/docs/operations/DOCKER_MYSQL_REDIS.md`, `/docs/architecture/security/SECURITY_AUTHENTICATION.md` 등 | 실제 코드가 어디 있는지 찾을 때 | 필요한 기능 단락만 찾아 읽기 |
| 개념 학습 | `docs/study/**` | Spring, Web, Vue, DB, AI 개념이 흔들릴 때 | 작은 단위로 읽고 코드에서 확인 |
| 기능별 심화 | `docs/community/README.md`처럼 특정 기능 전체를 설명하는 문서 | 해당 기능을 수정하거나 디버깅할 때 | "코드 읽는 순서"부터 따라가기 |

중요한 원칙:

```text
처음부터 reference 문서를 모두 외우지 않는다.
먼저 요청이 들어와 응답이 나가는 흐름을 이해한다.
그 다음 인증, DB, 프론트 상태, 외부 API처럼 필요한 곳으로 넓힌다.
```

## 2. 처음 30분 읽기

프로젝트를 처음 열었거나 오랜만에 돌아왔다면 아래만 읽습니다.

```text
1. docs/README.md
2. /docs/product/PRODUCT_OVERVIEW.md
3. /docs/product/EXTENSION_SERVICE_DEFINITION.md
4. /docs/product/MVP_SCOPE.md
5. 이 문서의 "현재 구현 기능별 읽는 순서"
6. README.md의 Run 섹션
```

목표는 "ZIP:ON이 어떤 앱인지"와 "지금 어디까지 구현됐는지"만 잡는 것입니다. 공공데이터 API 전체 목록이나 커뮤니티 ERD 전체를 처음부터 읽지 않아도 됩니다.

## 3. 하루 학습 루트

### Day 1. 웹 요청이 흐르는 길

```text
1. docs/study/Web/01-http-basics.md
2. docs/study/Web/02-http-methods-and-rest.md
3. docs/study/Spring/07-spring-mvc-request-flow.md
4. backend/src/main/java/com/zipon/controller/HealthController.java
5. backend/src/main/java/com/zipon/common/ApiResponse.java
```

배울 것:

```text
브라우저 또는 curl
-> HTTP request
-> Controller
-> ApiResponse
-> HTTP response
```

### Day 2. Spring 계층 구조

```text
1. docs/study/Spring/02-project-structure-and-package.md
2. docs/study/Architecture/01-layered-architecture-and-mvc.md
3. /docs/architecture/BACKEND_STRUCTURE.md의 "한 요청이 지나가는 길"
4. /docs/api/API_FUNCTION_MAP.md의 Health, Region, Rent Risk Diagnosis 중 하나
```

배울 것:

```text
Controller는 입구
Service는 use case
Mapper는 DB 접근
DTO는 API 계약
Domain object는 DB/도메인 값
```

### Day 3. MyBatis와 Flyway

```text
1. docs/study/Database/01-mybatis-and-flyway-overview.md
2. docs/study/Spring/10-mybatis-mapper-and-sql.md
3. docs/study/Spring/11-domain-object-and-flyway-schema.md
4. /docs/operations/DOCKER_MYSQL_REDIS.md의 "Flyway migration flow"
5. backend/src/main/resources/db/migration/V5__create_legal_dong_codes.sql
6. backend/src/main/java/com/zipon/mapper/LegalDongCodeMapper.java
```

배울 것:

```text
Flyway migration이 table을 만든다.
MyBatis Mapper가 SQL을 실행한다.
JPA/Hibernate와 ddl-auto는 이 프로젝트의 구현 경로가 아니다.
```

### Day 4. 프론트와 API 연결

```text
1. docs/study/Vue/01-vue-overview.md
2. docs/study/Vue/04-router-and-view-components.md
3. docs/study/Vue/05-api-layer-and-axios.md
4. /docs/api/API_FRONTEND_CONNECTION_SPEC.md의 "Frontend API infrastructure"
5. /docs/api/API_FRONTEND_CONNECTION_SPEC.md의 "Rent risk diagnosis API"
6. docs/study/Vue/06-loading-empty-error-states.md
7. frontend/src/api/axiosInstance.js
8. frontend/src/components/home/MainHero.vue
9. frontend/src/components/common/SearchBar.vue
10. frontend/src/components/home/LeaseRiskDiagnosisResult.vue
```

배울 것:

```text
홈 화면의 CTA가 전역 분석/진단 입력 폼을 열고, MVP 목표 UX는 홈 화면 분석/진단 입력 폼에서 지역·유형 과거 지표 분석 또는 정확 주소 위험진단 입력을 단계적으로 받는다.
api module이 backend endpoint를 호출한다.
loading, success, empty, error, unavailable 상태를 화면에 분리한다.
```

### Day 5. 인증과 보안

```text
1. /docs/architecture/security/SECURITY_AUTHENTICATION.md의 "Current implementation"
2. /docs/architecture/security/AUTH_SCHEMA.md
3. /docs/operations/LOGIN_VERIFICATION_GUIDE.md의 "검증 흐름"
4. backend/src/main/java/com/zipon/config/SecurityConfig.java
5. backend/src/main/java/com/zipon/service/AuthService.java
6. frontend/src/auth/authSession.js
7. frontend/src/api/axiosInstance.js
8. AuthIntegrationTest
```

배울 것:

```text
access token은 메모리에만 둔다.
refresh token은 HttpOnly cookie로 보낸다.
401과 403을 구분한다.
Spring Security filter chain이 Controller 앞에서 동작한다.
```

### Day 6. 구조화 AI 위험 산정

```text
1. /docs/CODEX/reference/AI_RISK_SCORING_ENGINE.md
2. /docs/CODEX/reference/RISK_TEMPLATE_SPEC.md
3. /docs/CODEX/reference/OPENAI_RISK_SCORING_PROMPT.md
4. /docs/CODEX/reference/RISK_SCORE_ENUMS.md
5. backend/src/main/java/com/zipon/risk/ai/RiskAssessmentService.java
6. backend/src/main/java/com/zipon/risk/ai/RiskTemplateResolver.java
7. backend/src/main/java/com/zipon/risk/ai/RiskScoringResponseValidator.java
8. backend/src/main/java/com/zipon/risk/ai/RiskScoreAggregator.java
9. backend/src/test/java/com/zipon/risk/ai/RiskAssessmentServiceTest.java
```

배울 것:

```text
AI는 자유 대화형 챗봇이 아니라 고정 위험 항목별 구조화 점수 산정 보조 계층이다.
AI key는 backend-only `RiskAssessmentService` 경로를 켜지만, 공공데이터 조회나 권리관계 확정을 대신하지 않는다.
AI는 criterion별 score/evidence/missingData 후보를 낼 수 있지만 최종 총점, 등급, 화면 판정은 백엔드 계산 결과여야 한다.
파인튜닝과 Python 도입은 실패 사례, 평가 데이터, 개인정보 기준을 문서화한 뒤 검토한다.
```

## 4. 현재 구현 기능별 읽는 순서

### 정확 주소 전세·월세 위험진단 slice

먼저 읽을 문서:

```text
1. /docs/product/MVP_SCOPE.md
2. /docs/api/API_CALL_FLOW.md의 "현재 구현된 backend slice"
3. /docs/frontend/SCREEN_ANALYSIS_POLICY.md에서 `근거 -> 한계 -> 다음 행동` 리포트 구조 확인
4. /docs/architecture/RISK_SCORING_POLICY.md에서 RULE-001, RULE-008, RULE-007 우선순위 확인
5. /docs/api/API_FUNCTION_MAP.md의 "Rent Risk Diagnosis"
6. /docs/api/API_FRONTEND_CONNECTION_SPEC.md의 "Rent risk diagnosis API"
```

그 다음 코드:

```text
frontend/src/components/home/MainHero.vue
frontend/src/components/common/SearchBar.vue
frontend/src/api/rentRiskDiagnosisApi.js
frontend/src/components/home/LeaseRiskDiagnosisResult.vue
backend/src/main/java/com/zipon/dto/request/RentRiskDiagnosisRequest.java
backend/src/main/java/com/zipon/dto/response/RentRiskDiagnosisResponse.java
backend/src/main/java/com/zipon/controller/RentRiskDiagnosisController.java
backend/src/main/java/com/zipon/service/RentRiskDiagnosisService.java
backend/src/main/java/com/zipon/service/LeaseRiskAddressNormalizer.java
backend/src/main/java/com/zipon/service/TransactionApiSelector.java
backend/src/test/java/com/zipon/RentRiskDiagnosisIntegrationTest.java
```

이 기능에서 가장 중요한 학습 포인트:

```text
주소를 넣자마자 실거래가부터 조회하지 않는다.
먼저 주소와 법정동코드를 정리한다.
공부상 물건 유형이 확정되지 않은 값은 unavailable 또는 empty로 분리한다.
"안전합니다" 같은 확정 표현을 쓰지 않는다.
```

### 지역·유형 과거 지표 분석 slice

먼저 읽을 문서:

```text
1. /docs/product/MVP_SCOPE.md의 "지역·유형 기반 과거 지표 분석"
2. /docs/api/API_CALL_FLOW.md의 지역·유형 분석 경로
3. /docs/api/API_FRONTEND_CONNECTION_SPEC.md의 "Regional indicator analysis API"
4. /docs/architecture/MARKET_INDICATOR_FOUNDATION.md
5. /docs/api/external-api/DATA_USAGE_AND_INSIGHT_PLAN.md
```

그 다음 코드:

```text
frontend/src/views/SearchResultView.vue
frontend/src/api/regionalIndicatorAnalysisApi.js
backend/src/main/java/com/zipon/dto/request/RegionalIndicatorAnalysisRequest.java
backend/src/main/java/com/zipon/dto/response/RegionalIndicatorAnalysisResponse.java
backend/src/main/java/com/zipon/controller/RegionalIndicatorAnalysisController.java
backend/src/main/java/com/zipon/service/RegionalIndicatorAnalysisService.java
backend/src/main/java/com/zipon/service/MarketIndicatorContextService.java
backend/src/main/java/com/zipon/mapper/RegionalIndicatorAnalysisMapper.java
backend/src/test/java/com/zipon/RegionalIndicatorAnalysisIntegrationTest.java
```

이 기능에서 가장 중요한 학습 포인트:

```text
`강남 원룸`, `서울대입구역 근처`, `상가 월세`는 현재 매물 검색이 아니다.
사용자 입력을 지역·유형 분석 의도로 해석하고, 현재 매물을 제공하지 않는다는 경계를 설명한다.
R-ONE, 시장 지표, 표본 부족, 데이터 한계를 raw dump가 아니라 판단 보조 문장으로 바꾼다.
정확 주소 위험진단과 다른 use case이므로 `RegionalIndicatorAnalysisController`와 `RentRiskDiagnosisController`를 분리해서 읽는다.
```

### 인증

먼저 읽을 문서:

```text
1. /docs/architecture/security/SECURITY_AUTHENTICATION.md
2. /docs/architecture/security/AUTH_SCHEMA.md
3. /docs/architecture/security/AUTH_MEMBER_ERD.md의 현재 구현 ERD
4. /docs/operations/LOGIN_VERIFICATION_GUIDE.md
```

그 다음 코드:

```text
SecurityConfig
JwtAuthenticationFilter
AuthController
AuthService
UserMapper
AuthIntegrationTest
frontend/src/auth/authSession.js
frontend/src/components/auth/AuthModal.vue
```

이 기능에서 가장 중요한 학습 포인트:

```text
인증은 Controller에서 직접 비밀번호를 비교하는 기능이 아니다.
Spring Security, AuthenticationManager, PasswordEncoder, UserDetailsService 흐름을 탄다.
refresh token 원문은 DB에도 JS에도 저장하지 않는다.
```

### 커뮤니티와 관리자 권한

먼저 읽을 문서:

```text
1. docs/community/README.md의 "목적", "핵심 설계 요약"
2. docs/community/README.md의 "API 계약"
3. /docs/api/API_FRONTEND_CONNECTION_SPEC.md의 "Community APIs", "Admin APIs"
4. docs/community/README.md의 "코드 읽는 순서"
5. /docs/operations/DOCKER_MYSQL_REDIS.md의 "Community schema", "Admin user permission schema"
```

그 다음 코드:

```text
CommunityController
CommunityService
CommunityPostMapper
CommunityCommentMapper
CommunityReactionMapper
CommunityReportMapper
CommunityAdminController
AdminUserController
UserPermissionService
CommunityIntegrationTest
AdminUserIntegrationTest
frontend/src/views/CommunityListView.vue
frontend/src/views/CommunityPostDetailView.vue
frontend/src/views/AdminDashboardView.vue
```

이 기능에서 가장 중요한 학습 포인트:

```text
게시글/댓글 권한은 화면만 막아서는 부족하다.
Service 계층에서 현재 사용자 권한을 다시 확인해야 한다.
관리자 화면은 제품 MVP 첫 화면이 아니라 운영 도구다.
```

### 지역과 법정동코드

먼저 읽을 문서:

```text
1. /docs/architecture/REGION_SCHEMA.md
2. /docs/operations/DOCKER_MYSQL_REDIS.md의 "Region schema", "Lease risk legal dong code schema"
3. /docs/api/PUBLIC_API_STRATEGY.md의 "사용자 입력 정제"
```

그 다음 코드:

```text
RegionController
RegionService
RegionMapper
LegalDongCodeMapper
MyBatisLegalDongCodeCatalog
RegionIntegrationTest
MyBatisLegalDongCodeCatalogIntegrationTest
```

이 기능에서 가장 중요한 학습 포인트:

```text
실거래가 API의 LAWD_CD는 주소 문자열에서 바로 나오지 않는다.
주소 정제와 법정동코드 변환이 먼저다.
```

## 5. 기능 하나를 추가할 때 읽는 순서

새 기능을 만들 때는 아래 순서로만 움직입니다.

```text
1. 제품 기준 확인
   /docs/product/PRODUCT_OVERVIEW.md
   /docs/product/EXTENSION_SERVICE_DEFINITION.md
   /docs/product/MVP_SCOPE.md

2. API 위치 확인
   /docs/api/API_FUNCTION_MAP.md

3. 계층 구조 확인
   /docs/architecture/BACKEND_STRUCTURE.md
   /docs/architecture/CONVENTIONS.md

4. DB 변경 여부 확인
   /docs/operations/DOCKER_MYSQL_REDIS.md
   기존 migration SQL

5. 프론트 연결 방식 확인
   docs/study/Vue/05-api-layer-and-axios.md
   docs/study/Vue/06-loading-empty-error-states.md

6. 검증 방식 확인
   docs/study/Spring/14-testing.md
   기존 IntegrationTest
```

구현 순서:

```text
Request DTO
-> Controller
-> Service
-> Mapper 또는 외부 API adapter
-> Response DTO
-> Integration test
-> Frontend api module
-> View/Component state
-> Docs update
```

## 6. 어려운 개념이 나왔을 때

| 막히는 표현 | 먼저 읽을 문서 | 코드에서 볼 파일 |
| --- | --- | --- |
| Bean, DI, IoC | `docs/study/Spring/03-ioc-container-and-beans.md`, `04-dependency-injection.md` | Service/Controller 생성자 |
| Auto-configuration | `docs/study/Spring/05-auto-configuration.md` | `pom.xml`, `application.yml` |
| Profile, config | `docs/study/Spring/06-configuration-properties-profiles.md` | `application.yml`, `application-test.yml` |
| Controller annotation | `docs/study/Spring/08-controller-annotations.md` | `RentRiskDiagnosisController`, `CommunityController` |
| DTO validation | `docs/study/Spring/12-dto-validation-error-response.md` | request DTO, `GlobalExceptionHandler` |
| Transaction | `docs/study/Spring/13-transaction.md` | write-heavy Service methods |
| CORS/proxy | `docs/study/Web/04-cors-and-same-origin.md`, `docs/study/Vue/07-vite-and-development-server.md` | `WebConfig`, `vite.config.js` |
| MyBatis SQL | `docs/study/Spring/10-mybatis-mapper-and-sql.md` | mapper interfaces |
| Flyway migration | `docs/study/Database/01-mybatis-and-flyway-overview.md` | `db/migration/*.sql` |
| Loading/empty/error UI | `docs/study/Vue/06-loading-empty-error-states.md` | `LeaseRiskDiagnosisResult.vue` |

## 7. 중복을 줄이는 규칙

문서가 커질 때는 같은 설명을 여러 곳에 길게 복사하지 않습니다.

```text
제품 방향:
/docs/product/PRODUCT_OVERVIEW.md, /docs/product/MVP_SCOPE.md를 원본으로 둔다.

API 목록:
/docs/api/API_FUNCTION_MAP.md를 원본으로 둔다.

DB schema:
Flyway migration SQL과 /docs/operations/DOCKER_MYSQL_REDIS.md를 원본으로 둔다.

인증:
/docs/architecture/security/SECURITY_AUTHENTICATION.md를 원본으로 둔다.

학습 순서:
이 문서를 원본으로 둔다.

개념 설명:
docs/study/**를 원본으로 둔다.
```

다른 문서에서는 원본 문서를 링크하고, 해당 기능에서 꼭 필요한 차이만 설명합니다.

## 8. 지금 부족한 문서와 다음 보강 순서

아래 항목은 코드 또는 요구사항이 커졌지만 아직 학습 문서가 충분히 풀어쓰지 못한 부분입니다.

| 우선순위 | 부족한 내용 | 이유 | 다음 문서 작업 위치 |
| --- | --- | --- | --- |
| 1 | 전세·월세 위험진단 end-to-end 흐름 | 프론트 입력, 백엔드 진단, unavailable 상태가 새로 연결됨 | `/docs/api/API_CALL_FLOW.md` 보강 |
| 2 | 지역·유형 과거 지표 분석 end-to-end 흐름 | 첫 slice가 연결됐지만 지표 ingestion, empty/unavailable UX, 품질 기준 학습 문서가 아직 얇다 | `/docs/api/API_CALL_FLOW.md`, `/docs/frontend/SCREEN_ANALYSIS_POLICY.md` 보강 |
| 3 | 관리자 사용자 권한 흐름 | role, user permission, page permission이 함께 동작함 | `/docs/operations/DOCKER_MYSQL_REDIS.md`, 별도 admin section 후보 |
| 4 | 프론트 인증 세션 흐름 | access token 메모리 저장, refresh cookie 복구가 초보자에게 어렵다 | `/docs/architecture/security/SECURITY_AUTHENTICATION.md`, Vue study 보강 |
| 5 | 외부 API adapter 실제 구현 방법 | data.go.kr 설정 문서와 MVP 호출 전략 사이에 구현 tutorial이 필요함 | `/docs/api/EXTERNAL_API_CONFIGURATION.md`와 위험진단 문서 연결 |
| 6 | 프론트 테스트 전략 | 현재 frontend test runner가 없어 build/smoke 중심이다 | `docs/study/Vue` 또는 future testing doc |

이 목록은 TODO를 남기기 위한 것이 아니라, 다음 문서 작업의 우선순위를 보이게 하기 위한 대기열입니다. 새 기능이 구현되면 이 표에서 해당 항목을 지우거나 구현 문서로 옮깁니다.

## 9. 좋은 학습 루프

기능 하나를 읽거나 만들 때마다 아래 질문을 반복합니다.

```text
이 기능은 ZIP:ON의 어떤 사용자 목적에서 출발하는가?
이 코드는 어느 계층의 책임인가?
이 이름은 역할을 충분히 설명하는가?
이 값은 domain object에 있어야 하는가, DTO에만 있어야 하는가?
실패하면 어떤 HTTP status와 response body가 나가야 하는가?
프론트에서는 loading, success, empty, error, unavailable을 어떻게 보여주는가?
DB schema 변경이 필요한가, 아니면 기존 table/read model로 충분한가?
테스트가 실제 HTTP 흐름을 검증하는가, 아니면 mock user만 쓰는가?
문서와 코드가 같은 이름을 쓰고 있는가?
```

## 10. 오늘 코드에서 바로 해볼 연습

초급:

```text
1. `RentRiskDiagnosisIntegrationTest`를 읽고 성공/empty/validation 케이스를 구분한다.
2. `MainHero.vue`의 `#diagnosis-form` 스크롤 CTA와 `SearchBar.vue`의 입력값이 `RentRiskDiagnosisRequest` 또는 `RegionalIndicatorAnalysisRequest`로 분기되는 과정을 따라간다.
3. `ApiResponse`와 `ErrorResponse`의 모양을 비교한다.
```

중급:

```text
1. `SearchBar.vue`가 짧은 지번·도로명주소 입력을 왜 Juso 주소 후보 선택으로 보내는지 설명한다.
2. `TransactionApiSelector`가 물건 유형별 API를 어떻게 고르는지 표로 정리한다.
3. `RegionalIndicatorAnalysisService`가 현재 매물 검색 대신 과거 지표 분석 응답을 만드는 위치를 찾는다.
4. `UserPermissionService`가 커뮤니티 작성/수정/삭제 권한을 어디서 막는지 찾는다.
```

고급:

```text
1. 건축물대장, 실거래가, 공시가격 adapter의 timeout과 unavailable 상태가 어떤 service에서 사용자 문장으로 바뀌는지 추적한다.
2. 관리자 권한 변경 후 기존 access token을 어떻게 다룰지 보안 흐름으로 설명한다.
3. frontend test runner를 추가한다면 어떤 컴포넌트부터 테스트할지 정한다.
```

## Related documents

- [Docs index](/README.md)
- [CODEX reference index](../README.md)
- [Study index](/docs/study/README.md)
- [제품 기준과 서비스 경계](/docs/product/PRODUCT_OVERVIEW.md)
- [확장형 서비스 정의](/docs/product/EXTENSION_SERVICE_DEFINITION.md)
- [과거 지표 기반 부동산 분석 MVP 범위](/docs/product/MVP_SCOPE.md)
- [AI 위험도 산정 엔진](/docs/CODEX/reference/AI_RISK_SCORING_ENGINE.md)
- [API와 함수 학습 지도](/docs/api/API_FUNCTION_MAP.md)
- [구조 학습 가이드](/docs/architecture/BACKEND_STRUCTURE.md)
