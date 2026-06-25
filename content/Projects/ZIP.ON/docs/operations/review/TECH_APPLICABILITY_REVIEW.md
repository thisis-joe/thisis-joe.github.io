---
title: TECH_APPLICABILITY_REVIEW
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-26T05:00:07+09:00
---

# ZIP:ON 기술 적용 타당성 검증 보고서

> Status: Review, Partially Implemented
>
> 작성일: 2026-06-22
>
> 검증 대상 문서 경로가 요청문에 `[여기에 검증할 문서 파일 경로 또는 문서명 입력]` placeholder로 남아 있어, 별도 첨부 문서는 확인하지 못했다. 이 보고서는 현재 repository 코드, `README.md`, `docker-compose.yml`, `.env.example`, `backend/src/main/resources/application*.yml`, Flyway migration, `docs/product/*`, `docs/api/*`, `docs/architecture/*`, `docs/operations/*`, `docs/community/README.md`, 그리고 요청문에 열거된 기술 제안 항목을 기준으로 작성한다.

> Implementation follow-up: 2026-06-22에 이 보고서의 우선순위 1~2번 중 "Docker 개발환경 정비"와 "Redis를 Docker 개발환경에 포함" 범위를 진행했다. `docker-compose.yml`에 Redis service를 추가하고, `.env.example`, root `README.md`, [로컬 Docker 개발환경](/docs/operations/LOCAL_SETUP.md)을 갱신했다.
>
> Implementation follow-up: 2026-06-24에 backend Redis dependency와 `VolatileStateStore` adapter를 추가했다. 현재 Redis 적용 범위는 access token denylist cache, 로그인 실패 rate limit, community report rate limit, external data scheduler lock이며, 외부 API raw response cache는 아직 구현하지 않았다. local Docker `.env.example`은 `ZIPON_REDIS_ENABLED=true`로 Redis를 사용하고, `application.yml` fallback과 test profile은 `false`라 in-memory fallback을 사용할 수 있다.
>
> Implementation follow-up: 2026-06-24에 external data scheduler를 관심 target 재수집에서 최신 완료월 target materialization + bounded batch 수집 구조로 확장했다. `ExternalDataLatestTargetMaterializer`가 전국 catalog 또는 지정 `LAWD_CD` 범위의 최신월 `TRANSACTION_MONTH` target을 등록하고, `ExternalDataRefreshSchedulerService`가 due target을 batch size만큼 처리한다.

## 1. 현재 프로젝트 상태 요약

### 백엔드 상태

- JPA/Hibernate dependency, `@Entity`, `JpaRepository`, `ddl-auto` 설정은 현재 application persistence 경로에 없다. 새 persistence 제안도 MyBatis Mapper와 Flyway migration 기준으로 판단해야 한다.
- base package는 `com.zipon`이고, 주요 구조는 `controller`, `service`, `mapper`, `domain`, `dto.request`, `dto.response`, `config`, `security`, `external`, `ai`로 나뉜다.
- Controller는 `/api/...` HTTP 경계를 맡고, 실제 위험진단 orchestration은 `RentRiskDiagnosisService`와 하위 협력 service가 맡는다.
- 외부 API adapter는 `backend/src/main/java/com/zipon/external` 아래에 있으며 `RestClient`를 사용한다.

### 프론트엔드 상태

- frontend는 Vue 3 + Vite 프로젝트이고 `frontend/package.json` 기준 `npm run dev`, `npm run build`, `npm run preview`만 제공한다. lint/test runner는 아직 없다.
- MVP 위험진단 진입점은 `frontend/src/components/common/SearchBar.vue`이며 `frontend/src/App.vue`에 전역 연결되어 있다.
- 커뮤니티, 관리자, 마이페이지, 외부 API 호출 로그, 진단 이력 화면은 `frontend/src/api/*.js`와 `frontend/src/views/*.vue`에 연결되어 있다.

### DB/마이그레이션 상태

- schema source of truth는 `backend/src/main/resources/db/migration`의 Flyway migration이다.
- 현재 migration은 `backend/src/main/resources/db/migration`의 `V*.sql` 파일이 source of truth이며, 인증, 지역, 커뮤니티, 법정동, 관리자 권한, 관심 부동산 검토 대상, 위험진단 이력, 외부 API 호출 로그, 등기부등본 수동 확인 상태, 공공 데이터 fact/statistics/cache/audit 저장소, 사용자 프로필, 운영 정책 이벤트, R-ONE 통계 저장소, 데모 사용자 재시드를 포함한다.
- `rent_risk_diagnosis_histories`는 요청/응답 snapshot, 주소, 법정동코드, 금액, 진단 상태를 저장한다.
- `external_api_call_logs`는 provider, api name, endpoint path, request summary, result status, HTTP status, duration, error message를 저장한다. 원본 response body와 API key는 저장하지 않는다.
- `registry_document_confirmations`는 원본 PDF/OCR 결과가 아니라 `NOT_CHECKED`, `CHECKED`, `NEEDS_HELP` 상태와 memo만 저장한다.

### 외부 API 연동 상태

- data.go.kr 건축물대장, 전월세 실거래가, 매매 실거래가 adapter가 구현되어 있다.
- VWorld 공시가격 adapter가 구현되어 있다.
- 외부 API key가 없으면 실제 호출하지 않고 `UNAVAILABLE` 제한 진단 상태로 내려간다.
- 외부 API 호출 로그는 `ExternalApiCallLogger`와 `ExternalApiCallLogService`가 `external_api_call_logs`에 기록한다.
- 외부 API 재시도, circuit breaker, raw response short TTL cache는 아직 구현되어 있지 않다. 인증 로그인 실패 rate limit과 scheduler lock은 `VolatileStateStore`로 구현되어 있다.

### 인증/관리자 기능 상태

- Spring Security + JWT + MyBatis 인증이 구현되어 있다.
- refresh token은 원문이 아니라 hash/digest로 DB에 저장하고, access token denylist는 `revoked_access_tokens`에 저장한다.
- `/api/admin/**`는 `SecurityConfig`에서 `UserRole`의 업무별 authority set으로 나누어 보호한다.
- 관리자 화면은 사용자, role, 글/댓글 권한, page 권한, 커뮤니티 신고/숨김/복구, 위험진단 이력, 외부 API 호출 로그를 제한된 도메인 API로 관리한다.
- 관리자 페이지는 임의 SQL 실행기가 아니다.

### Docker 개발환경 상태

- root `docker-compose.yml`은 MySQL 8.4 service와 Redis 7.4 service를 정의한다.
- Redis service는 2026-06-22 follow-up에서 개발환경 준비 범위로 추가되었다.
- backend와 frontend는 container가 아니라 로컬 JVM/Node로 실행하는 구조다.
- `backend/src/main/resources/application.yml`은 root `.env`를 optional import하고 Docker MySQL에 연결한다.
- README는 MySQL/Redis 실행, 상태 확인, 로그/초기화/포트 충돌 안내를 제공한다.

### Redis 구성 여부

- 현재 `docker-compose.yml`에 Redis service가 있다.
- `backend/pom.xml`에 `spring-boot-starter-data-redis`가 있다.
- `.env.example`에 Redis host/port, `ZIPON_REDIS_ENABLED`, `ZIPON_REDIS_KEY_PREFIX`가 있다.
- `application.yml`에 `zipon.redis.*`, `zipon.security.login-rate-limit.*`, `zipon.external.data.scheduler.lock-ttl` 설정이 있다.
- 현재 Redis는 `VolatileStateStore` interface 뒤에서 access token denylist cache, 로그인 실패 rate limit, scheduler lock에만 제한 적용되어 있다.
- 외부 API raw response short TTL cache, 동일 진단 요청 lock, 장애 circuit 상태, SSE fan-out은 아직 구현하지 않았다.

### 문서상 MVP 방향

- MVP는 현재 매물 미제공, 과거 지표 분석, 정확 주소 위험진단이다.
- 사용자 진입점은 홈 화면 분석/진단 입력 폼형 UI다.
- 커뮤니티와 관리자 페이지는 MVP 밖이 아니라 운영 가능한 MVP의 지원 표면이다.
- 확장형 서비스 정의는 당장 구현할 껍데기가 아니라 코드 경계를 잡기 위한 장기 기준이다.

## 2. 검증 기준

| 기준 | 판단 방식 |
| --- | --- |
| MVP 적합성 | 전세·월세 위험진단, 커뮤니티, 관리자 운영 표면에 직접 기여하는가 |
| 개발환경 필요성 | 신규 개발자가 README만 보고 MySQL/Redis/backend/frontend를 재현할 수 있게 하는가 |
| 구현 난이도 | 현재 구현 수준에서 작은 slice로 테스트 가능하게 붙일 수 있는가 |
| 운영 복잡도 | 로컬/운영 설정, 장애 대응, 모니터링 비용이 이득보다 크지 않은가 |
| 사용자 가치 | 사용자가 더 빠르고 정확하게 계약 전 확인사항을 이해하는가 |
| 개발 생산성 가치 | 반복 세팅, 외부 API 대기, 포트 충돌, 장애 분석 비용을 줄이는가 |
| 확장성 | 향후 매매, 상가, 토지, 문서 분석으로 넓어질 때 경계가 유지되는가 |
| 현재 구현 우선순위 | 지금 구현, 최소 준비, MVP 이후 확장, 보류 중 어디가 맞는가 |

분류는 아래 다섯 가지를 사용한다.

| 분류 | 의미 |
| --- | --- |
| A | 지금 바로 적용 타당함 |
| B | MVP에는 필요하지만 단순화해서 적용해야 함 |
| C | MVP 핵심은 아니지만 개발환경/확장 준비를 위해 지금 관리해야 함 |
| D | MVP 이후 확장 단계에서 적용하는 것이 타당함 |
| E | 현재 프로젝트에는 적용 타당성이 낮음 |

## 3. 제안별 타당성 검토

### 1. Docker 기반 개발환경 관리

#### 문서상 제안

MySQL, Redis, backend 실행, frontend 실행, 환경변수, 포트 충돌, 로컬 실행 절차를 README만 보고 재현 가능하게 관리한다.

#### 현재 코드 상태

- `docker-compose.yml`은 MySQL과 Redis를 제공한다.
- `README.md`는 `.env` 생성, MySQL/Redis 실행, backend local profile, frontend dev server, health check, DB reset을 설명한다.
- `application.yml`은 root `.env`를 읽어 Docker MySQL에 연결한다.
- backend container와 frontend container는 없다.

#### 적용 타당성 분류

C. MVP 핵심은 아니지만 개발환경/확장 준비를 위해 지금 관리해야 함

#### 판단 근거


#### 지금 한다면 최소 구현 범위

- `docker-compose.yml`에 Redis service 추가
- `.env.example`에 `REDIS_PORT`, Redis host 후보 값 추가
- `README.md`에 MySQL/Redis 동시 실행, 상태 확인, 로그 확인, 포트 충돌 대응 절차 보강
- backend/frontend는 계속 로컬 JVM/Node 실행으로 유지

#### 나중에 한다면 확장 구현 범위

- backend container image와 frontend container image 추가
- docker compose profile로 `infra`와 `app` 구분
- 운영 배포용 compose가 아니라 로컬 개발용 compose임을 명확히 분리

#### 주의할 점

- 지금 backend/frontend까지 container화하면 Java/Node 학습과 빠른 디버깅이 느려질 수 있다.
- `docker-compose.yml`의 `MYSQL_PORT:-3306` fallback과 `.env.example`의 `MYSQL_PORT=3307` 차이를 README에서 더 명확히 해야 한다.
- Docker 정비는 기능 구현과 별도 branch/commit으로 진행하는 편이 좋다.

### 2. Redis 적용

#### 문서상 제안

외부 API 캐시, 주소 정제 결과 캐시, 법정동코드 변환 결과 캐시, 같은 분석 요청 중복 방지, 분석 상태 관리, 향후 rate limiting, OCR 상태 저장 후보로 Redis를 검토한다.

#### 현재 코드 상태

- Redis container 후보, `spring-boot-starter-data-redis`, `VolatileStateStore` adapter가 있다. local Docker `.env.example`은 Redis를 켜고, `application.yml` fallback과 test profile은 in-memory fallback을 유지한다.
- 외부 API 호출은 매 요청마다 adapter를 통해 진행하고, 결과는 `RentRiskDiagnosisResponse`와 `rent_risk_diagnosis_histories` snapshot에 저장된다.
- 외부 API 운영 로그는 RDB에 남긴다.
- access token denylist cache, 로그인 실패 rate limit, external data scheduler lock은 volatile state로 구현되어 있다.
- 외부 API raw response cache, 동일 진단 요청 lock, circuit state는 아직 없다.

#### 적용 타당성 분류

C. MVP 핵심은 아니지만 개발환경/확장 준비를 위해 지금 관리해야 함

Redis 최종 판단: B. source of truth가 아니라 짧은 TTL volatile state adapter로 제한 적용

#### 판단 근거

현재 MVP에서 Redis가 없어도 위험진단은 동작한다. 하지만 건축물대장, 전월세/매매 실거래가, 공시가격은 같은 법정동/월/물건 유형으로 반복 조회될 가능성이 높고, 외부 API rate limit과 응답 지연은 MVP 사용자 경험에 직접 영향을 준다. 따라서 Redis는 기술 과시가 아니라 외부 API 기반 서비스 안정화 후보로 보는 것이 타당하다.

#### 지금 한다면 최소 구현 범위

- Docker 개발환경의 Redis container 후보를 유지한다.
- backend code에는 `RedisTemplate`을 흩뿌리지 않고 `VolatileStateStore` interface 뒤에 둔다.
- access token denylist cache, 로그인 실패 rate limit, scheduler lock처럼 TTL이 명확한 상태부터 적용한다.

#### 나중에 한다면 확장 구현 범위

- 건축물대장/실거래가/공시가격 adapter 앞단에 cache adapter 추가
- 동일 진단 요청 lock 추가
- user/IP 기반 rate limit 확대
- OCR/문서분석 job status는 비동기 처리 도입 후 Redis 또는 DB+Redis 조합으로 검토

#### 주의할 점

- Redis를 원본 DB로 쓰면 안 된다.
- 최종 진단 결과는 `rent_risk_diagnosis_histories`에 저장해야 한다.
- 외부 API 호출 이력은 `external_api_call_logs`에 남겨야 한다.
- Redis 장애 시 cache miss처럼 처리하고 최소 기능은 동작해야 한다.
- 민감정보, 등기부등본 원문, 계약서 원문은 Redis에 장기 저장하면 안 된다.

### 3. Kafka 적용

#### 문서상 제안

외부 API 처리, 진단 job, 커뮤니티 실시간 이벤트, OCR 분석, 재분석 등 비동기 흐름에 Kafka를 사용할 수 있다.

#### 현재 코드 상태

- Kafka dependency, broker, topic, producer/consumer가 없다.
- 커뮤니티 SSE는 `CommunityEventPublisher`가 단일 서버 메모리 emitter 목록으로 처리한다.
- 진단은 `POST /api/rent-risk-diagnoses` 안에서 동기 orchestration으로 처리한다.
- OCR, 장기 job, 대량 재분석은 아직 없다.

#### 적용 타당성 분류

D. MVP 이후 확장 단계에서 적용하는 것이 타당함

#### 판단 근거

현재 MVP는 단일 backend instance, 동기 위험진단, RDB 로그 구조로 충분하다. Kafka는 여러 consumer, 재처리, 대량 이벤트, 장애 복구가 필요할 때 가치가 커진다. 지금 도입하면 학습/운영 복잡도만 커지고 실제 사용자 가치가 작다.

#### 지금 한다면 최소 구현 범위

지금은 구현하지 않는다. 단, `CommunityEventPublisher` 주석처럼 다중 서버 확장 시 외부 이벤트 계층이 필요하다는 문서만 유지한다.

#### 나중에 한다면 확장 구현 범위

- OCR 분석 요청/완료 event
- 과거 진단 재분석 event
- 외부 API 대량 수집/배치 event
- 커뮤니티/알림 event fan-out

#### 주의할 점

- Kafka를 Redis Pub/Sub 대체로 성급히 쓰면 운영 난도가 커진다.
- 정확히 한 번 처리 같은 표현을 쉽게 약속하면 안 된다. idempotency key와 재처리 정책이 먼저 필요하다.

### 4. Elasticsearch 적용

#### 문서상 제안

커뮤니티 검색, 매물/지역/진단 이력 검색, 실거래가 대량 검색에 Elasticsearch를 사용할 수 있다.

#### 현재 코드 상태

- Elasticsearch dependency, index, docker service가 없다.
- 커뮤니티 검색은 MyBatis SQL `LIKE` 중심이다.
- 관리자 화면의 이력/로그 조회도 RDB query와 index로 처리한다.
- ZIP:ON MVP는 매물 목록 탐색 서비스가 아니다.

#### 적용 타당성 분류

D. MVP 이후 확장 단계에서 적용하는 것이 타당함

#### 판단 근거

전문 검색 품질이 필요한 커뮤니티/문서 검색이나 대량 실거래가 검색 단계가 오면 Elasticsearch 후보가 될 수 있다. 그러나 현재 MVP의 핵심은 계약 전 위험진단이고, 검색 엔진은 지금 사용자 가치를 크게 높이지 않는다. MySQL index, 제한된 LIKE, 관리자 필터로 충분한 단계다.

#### 지금 한다면 최소 구현 범위

지금은 구현하지 않는다. 커뮤니티 검색이 느려지면 먼저 MySQL FULLTEXT 또는 검색 조건/인덱스 조정을 검토한다.

#### 나중에 한다면 확장 구현 범위

- 커뮤니티 전문 검색
- 문서 OCR 결과 검색
- 지역별 위험 통계/진단 이력 검색
- 동의어, 형태소 분석, 색인 재생성 절차

#### 주의할 점

- Elasticsearch를 넣어도 RDB 정본과 색인 동기화 문제가 생긴다.
- 관리자 페이지가 검색 엔진을 통해 임의 데이터 탐색 콘솔처럼 변하면 안 된다.

### 5. 동일 매물 진단 요청 중복 방지

#### 문서상 제안

같은 주소·보증금·월세·관리비·계약 목적 조합의 진단이 짧은 시간 반복 실행되지 않게 lock 또는 cache를 둔다.

#### 현재 코드 상태

- `RentRiskDiagnosisService.diagnose()`는 요청마다 주소 정제, 건축물대장, 실거래가, 공시가격 조회 orchestration을 실행한다.
- 진단 결과 snapshot은 `rent_risk_diagnosis_histories`에 저장하지만, 중복 실행을 막는 key는 없다.
- `ExternalDataWeeklyRefreshScheduler` lock은 `VolatileLockService`로 구현되어 있다. 동일 매물 진단 요청 중복 방지 lock은 아직 없다.

#### 적용 타당성 분류

C. MVP 핵심은 아니지만 개발환경/확장 준비를 위해 지금 관리해야 함

#### 판단 근거

같은 사용자가 버튼을 여러 번 누르거나 네트워크 retry가 생기면 외부 API 호출이 중복될 수 있다. 다만 현재 사용자 규모와 동기 API 구조에서는 DB unique constraint로 바로 막기보다 짧은 TTL lock이 적절하다. Redis가 들어오기 전에는 UI disabled state와 backend validation으로도 일부 완화할 수 있다.

#### 지금 한다면 최소 구현 범위

- Redis 도입 전에는 프론트 submit 중복 방지와 backend idempotency 후보 key만 설계한다.
- Redis가 Docker/설정까지 준비되면 `diagnosis:lock:{hash}` 형태의 짧은 TTL lock을 adapter로 추가한다.

#### 나중에 한다면 확장 구현 범위

- 동일 요청 결과 short TTL reuse
- 비동기 진단 job의 idempotency key
- rate limit과 lock 정책 통합

#### 주의할 점

- 주소 원문을 Redis key에 그대로 넣지 말고 정규화된 최소값을 hash 처리해야 한다.
- 보증금/월세 같은 사용자 입력값이 key에 포함되므로 로그 노출을 조심해야 한다.

### 6. 외부 API 캐시 및 호출 이력 관리

#### 문서상 제안

외부 API 응답을 캐시하고 호출 이력을 관리해 장애 분석, rate limit 대응, 반복 호출 감소를 달성한다.

#### 현재 코드 상태

- 호출 이력 관리는 `external_api_call_logs`와 `ExternalApiCallLogService`로 이미 구현되어 있다.
- 캐시는 아직 없다.
- 원본 response body는 저장하지 않는다.
- adapter는 key 누락/오류를 `UNAVAILABLE`/`ERROR`로 분리한다.

#### 적용 타당성 분류

B. MVP에는 필요하지만 단순화해서 적용해야 함

#### 판단 근거

외부 API는 현재 MVP 위험진단의 핵심 경로에 들어왔다. 호출 로그는 이미 MVP 운영 가치가 있고, 캐시는 반복 조회와 응답 지연을 줄이는 데 가치가 있다. 다만 모든 원본 응답을 DB에 저장하거나 영구 cache를 두는 것은 과하다.

#### 지금 한다면 최소 구현 범위

- 호출 로그는 현재 구조 유지
- Redis 도입 후 건축물대장/실거래가/공시가격 일부에 short TTL cache만 적용
- cache miss와 외부 API 실패를 분리해서 표시

#### 나중에 한다면 확장 구현 범위

- 외부 API 원본 응답을 S3/object storage에 제한 보존
- provider별 circuit breaker
- 관리자 화면에서 cache hit/miss, error rate 지표 표시

#### 주의할 점

- 외부 API 원본 응답을 무조건 DB에 넣으면 저장소 전략과 충돌한다.
- cache hit 결과도 “안전”으로 오해되지 않게 결과 시점과 데이터 한계를 표시해야 한다.

### 7. 진단 Job 상태 관리

#### 문서상 제안

진단을 비동기 job으로 만들고 진행 상태를 저장한다.

#### 현재 코드 상태

- 위험진단은 동기 API다.
- `rent_risk_diagnosis_histories`는 완료된 진단 snapshot을 저장한다.
- `PENDING`, `RUNNING`, `FAILED` 같은 job table/status는 없다.
- OCR/문서 분석 job도 없다.

#### 적용 타당성 분류

D. MVP 이후 확장 단계에서 적용하는 것이 타당함

#### 판단 근거

현재 진단은 외부 API 몇 개를 순차 호출하는 구조라 동기 응답으로 유지할 수 있다. Job 상태 관리는 OCR, 문서 분석, 장기 재분석, 대량 배치처럼 시간이 오래 걸리는 작업이 생길 때 필요하다.

#### 지금 한다면 최소 구현 범위

지금은 구현하지 않는다. 단, `rent_risk_diagnosis_histories.diagnosis_state`를 완료 결과 상태로 계속 사용한다.

#### 나중에 한다면 확장 구현 범위

- `diagnosis_jobs` table
- Redis 기반 짧은 진행 상태 cache
- WebSocket/SSE 또는 polling
- 실패 재시도와 취소 정책

#### 주의할 점

- 동기 API를 job으로 바꾸면 프론트 UX, API 계약, 테스트가 크게 바뀐다.
- Job 상태와 최종 진단 이력은 분리해야 한다.

### 8. 실거래가 데이터 사전 적재/배치

#### 문서상 제안

실거래가 데이터를 미리 수집해 DB에 저장하고 진단 시 빠르게 비교한다.

#### 현재 코드 상태

- 현재는 물건 유형 판별 후 최근 3개월 범위로 필요한 실거래가 API를 조회한다.
- 실거래가 원본 raw response 또는 Redis 월별 cache table은 없다.
- DB-first 실거래가 fact/statistics는 구현되어 있고, 사용자 fallback으로 생긴 `TRANSACTION_MONTH` 관심 target은 `ExternalDataWeeklyRefreshScheduler`가 due target 단위로 다시 수집할 수 있다.
- `ExternalDataSeedRunner`와 `ExternalDataSeedTargetService`가 추가되어 명시적인 수동 실행에서 `TRANSACTION_MONTH` target을 등록하고 `MANUAL_SEED` run으로 기존 수집 파이프라인을 호출할 수 있다.
- `LegalDongCodeSyncRunner`와 `LegalDongCodeSyncService`가 추가되어 명시적인 수동 실행에서 행정안전부 법정동코드 API로 `legal_dong_codes` catalog를 확장할 수 있다.
- scheduler, seed runner, legal-dong sync runner는 모두 기본 비활성/명시 실행 구조다. 전국 seed는 전국 `LAWD_CD` 목록 제공 또는 전국 catalog sync 이후 검증이 필요하다.

#### 적용 타당성 분류

D. MVP 이후 확장 단계에서 적용하는 것이 타당함

#### 판단 근거

사전 적재는 응답 속도와 안정성을 높일 수 있지만, 데이터 범위, 갱신 주기, 저장 비용, 중복 수집, 공공데이터 약관 확인, 관리자 운영 화면이 필요하다. MVP에서는 short TTL cache와 요청 단위 조회를 먼저 안정화하는 편이 작고 안전하다.

#### 지금 한다면 최소 구현 범위

무제한 전국 전체 과거 기간 사전 적재는 구현하지 않는다. 현재 구현된 최소 범위는 사용자 진단 fallback target, 운영자 수동 seed target, scheduler가 등록하는 최신 완료월 target을 `external_data_refresh_targets` queue로 모으고, batch worker가 제한된 크기로 수집하는 구조다.

#### 나중에 한다면 확장 구현 범위

- `transaction_month_cache` 또는 별도 월별 snapshot table
- scheduler 기반 수집 확대 또는 관리자 seed/backfill
- 수집 상태/실패 로그
- 관리자 재수집 trigger

#### 주의할 점

- 대량 적재를 시작하면 데이터 freshness와 삭제/정정 정책이 필요하다.
- Testcontainers가 필요하므로 CI와 로컬 Docker daemon 상태를 테스트 전 확인해야 한다.

### 9. 위험도 룰셋 버전 관리

#### 문서상 제안

위험도 계산 기준과 체크리스트 문구 버전을 관리한다.

#### 현재 코드 상태

- 위험 문장은 `DepositRiskCalculator`, `BuildingRiskAnalyzer`, `LeaseRiskDiagnosisRiskSummaryService`, `LeaseRiskDiagnosisChecklistService`, `DiagnosisPromptFactory` 등에 코드로 들어 있다.
- 별도 `risk_rule_versions` table은 없다.
- `rent_risk_diagnosis_histories`는 response snapshot을 저장하므로 과거 결과 재현의 최소 근거는 있다.

#### 적용 타당성 분류

B. MVP에는 필요하지만 단순화해서 적용해야 함

#### 판단 근거

MVP에서도 진단 기준이 바뀌면 과거 진단과 현재 진단의 문장이 달라질 수 있다. 다만 관리자용 룰셋 CRUD나 동적 rule engine은 이르다. 우선 코드 상수/버전 문자열을 response snapshot과 함께 남기는 단순 방식부터 충분하다.

#### 지금 한다면 최소 구현 범위

- 문서상 rule version naming 결정
- response snapshot에 rule version을 넣을지 설계
- 동적 DB 룰셋은 만들지 않음

#### 나중에 한다면 확장 구현 범위

- `risk_rule_sets` table
- 관리자 승인/활성화 workflow
- 과거 진단 재분석

#### 주의할 점

- 룰셋을 DB에서 바로 수정 가능하게 만들면 관리자 페이지가 위험한 운영 콘솔이 될 수 있다.
- 룰 변경은 테스트와 함께 움직여야 한다.

### 10. 등기부등본 업로드/OCR 분석

#### 문서상 제안

사용자가 등기부등본 PDF를 업로드하면 OCR/문서 분석으로 근저당, 신탁, 압류 등 위험 키워드를 찾아 체크리스트로 변환한다.

#### 현재 코드 상태

- 원본 PDF 업로드/OCR은 없다.
- 현재는 `registry_document_confirmations`에 수동 확인 상태만 저장한다.
- 커뮤니티 첨부파일은 local filesystem 저장이지만, 등기부등본 같은 민감 파일에는 이 방식이 부적합하다고 문서화되어 있다.

#### 적용 타당성 분류

D. MVP 이후 확장 단계에서 적용하는 것이 타당함

#### 판단 근거


#### 지금 한다면 최소 구현 범위

지금은 원본 업로드를 열지 않는다. 현재 `RegistryDocumentConfirmationService` 흐름을 유지한다.

#### 나중에 한다면 확장 구현 범위

- S3/object storage metadata table
- virus scan/파일 타입 검증
- OCR job
- 위험 키워드 추출 결과 table
- 사용자 삭제/보존 기간 정책

#### 주의할 점

- 등기부등본 권리관계는 자동 확정하면 안 된다.
- PDF 원문을 Redis나 RDB text/blob에 장기 저장하면 안 된다.

### 11. 체크리스트 상태 관리

#### 문서상 제안

사용자가 계약 전 체크리스트 항목별 확인 상태를 저장하고 이어서 볼 수 있게 한다.

#### 현재 코드 상태

- `RentRiskDiagnosisResponse.checklist`는 생성 결과로 내려간다.
- 사용자별 체크리스트 항목 상태 table은 없다.
- 등기부등본 확인 상태만 `registry_document_confirmations`로 별도 저장한다.

#### 적용 타당성 분류

B. MVP에는 필요하지만 단순화해서 적용해야 함

#### 판단 근거

ZIP:ON의 결과는 “다음 행동”이므로 체크리스트 상태 저장은 MVP 가치와 맞다. 다만 모든 checklist item을 즉시 DB table로 정규화하면 범위가 커진다. 등기부등본 확인처럼 가장 중요한 상태부터 이미 분리되어 있으므로, 다음 단계는 제한된 체크리스트 상태만 저장하는 단순 모델이 적절하다.

#### 지금 한다면 최소 구현 범위

- 지금 보고서 단계에서는 구현하지 않는다.
- 다음 구현 slice로는 진단 이력에 연결된 체크리스트 상태 table 후보를 설계한다.

#### 나중에 한다면 확장 구현 범위

- 사용자별 checklist item status
- reminder/notification
- 관리자 기준 데이터와 연결된 checklist template
- 과거 진단 재분석 시 checklist 갱신

#### 주의할 점

- 체크리스트 완료를 “안전 확정”으로 표현하면 안 된다.
- 동적 템플릿과 사용자 상태를 분리해야 한다.

### 12. 관리자 페이지 데이터 관리

#### 문서상 제안

사용자, 권한, 게시글, 댓글, 신고, 외부 API 호출 로그, 위험진단 이력, 운영 데이터를 웹에서 관리한다.

#### 현재 코드 상태

- `AdminUserController`, `CommunityAdminController`, `AdminRentRiskDiagnosisHistoryController`, `AdminExternalApiCallLogController`가 있다.
- `AdminDashboardView.vue`가 사용자/권한/커뮤니티 신고/진단 이력/외부 API 호출 로그를 연결한다.
- `/api/admin/**`는 사용자 관리, 커뮤니티 moderation, 진단 이력, 외부 API, 감사 로그 등 업무별 authority set으로 보호된다.
- 임의 SQL 실행기는 없다.

#### 적용 타당성 분류

A. 지금 바로 적용 타당함

#### 판단 근거

관리자 페이지는 MVP 운영 범위에 포함된다. 이미 상당 부분 구현되어 있고, 외부 API 호출 로그와 진단 이력은 이번 기술 검토의 Docker/Redis/외부 API 안정화 계획과도 연결된다.

#### 지금 한다면 최소 구현 범위

- 현재 제한된 도메인 API 구조 유지
- Docker/Redis 정비 후 관리자 화면에서 Redis 상태까지 바로 보여주기보다는 외부 API 실패율/로그 조회를 먼저 강화
- 위험 룰셋 관리는 read-only 또는 version 표시부터 시작

#### 나중에 한다면 확장 구현 범위

- 위험 룰 변경 승인 workflow
- 외부 API provider별 장애 통계
- cache hit/miss 지표
- 진단 재분석 trigger

#### 주의할 점

- 관리자 페이지를 DB 직접 편집 도구로 만들면 안 된다.
- `SecurityConfig`의 업무별 authority 검증과 domain service validation을 모두 유지해야 한다.

## 4. Docker 개발환경 정비 계획

### 현재 Docker 구성 요약

- 존재 파일: root `docker-compose.yml`
- 정의 service: `mysql`, `redis`
- MySQL image: `mysql:8.4`
- MySQL container name: `zipon-mysql`
- MySQL volume: `zipon_mysql_data`
- MySQL healthcheck: `mysqladmin ping`
- Redis image: `redis:7.4-alpine`
- Redis container name: `zipon-redis`
- Redis volume: 없음. 현재 Redis는 ephemeral volatile state/cache 후보 service다.
- Redis healthcheck: `redis-cli ping`

### MySQL 구성 상태

- `.env.example`은 `MYSQL_PORT=3307`을 제공한다.
- `application.yml`은 `jdbc:mysql://${MYSQL_HOST:127.0.0.1}:${MYSQL_PORT:3307}/${MYSQL_DATABASE:zipon}`으로 연결한다.
- `docker-compose.yml`은 host port를 `${MYSQL_PORT:-3306}`으로 노출한다.
- `.env.example`과 README는 `MYSQL_PORT=3307`을 권장한다.
- `.env`를 만들면 README 기준 3307이 맞지만, `.env` 없이 compose를 실행하면 3306 fallback이 된다.

### Redis 구성 상태

- Redis service 있음.
- `.env.example`은 `REDIS_HOST=127.0.0.1`, `REDIS_PORT=6380`을 제공한다.
- `.env.example`은 Spring Boot Redis 연결값인 `SPRING_DATA_REDIS_HOST`, `SPRING_DATA_REDIS_PORT`도 제공한다.
- Redis backend dependency/configuration 있음. local Docker `.env.example`은 `ZIPON_REDIS_ENABLED=true`이고, app/test fallback은 `false`라 in-memory fallback을 사용할 수 있다.
- 현재 Redis code 적용 범위는 `VolatileStateStore` 기반 access token denylist cache, 로그인 실패 rate limit, scheduler lock이다.

### 현재 Docker 개발환경의 문제점

- MySQL과 Redis가 compose에 있다.
- README는 MySQL/Redis 실행, 상태 확인, 로그 확인, 초기화, 포트 충돌을 설명한다.
- `docker-compose.yml`의 `MYSQL_PORT:-3306` fallback과 `.env.example`의 `MYSQL_PORT=3307` 권장값이 다르다.
- backend/frontend는 로컬 실행 구조이고, 이 선택은 README와 [로컬 Docker 개발환경](/docs/operations/LOCAL_SETUP.md)에 명시되어 있다.
- Redis 장애 시 backend가 실패하지 않아야 한다는 fallback 원칙이 README와 [로컬 Docker 개발환경](/docs/operations/LOCAL_SETUP.md)에 문서화되어 있다.

### 반드시 정비해야 할 항목

- 완료: `docker-compose.yml`에 Redis service를 추가했다.
- 완료: backend Redis dependency와 `VolatileStateStore` adapter를 추가했다.
- 완료: `.env.example`에 Redis host/port 후보를 추가한다.
- 완료: README에 MySQL/Redis 실행, 상태 확인, 로그 확인, 볼륨 삭제, 포트 충돌 대응을 같은 흐름으로 정리한다.
- 완료: Redis 미실행/장애 시 cache 기능만 비활성화되고 위험진단 기본 흐름은 동작해야 한다는 원칙을 문서화한다.
- 남은 일: 외부 API raw response cache, 동일 진단 요청 lock, circuit state를 구현할 때 provider별 TTL, key hash, 장애 fallback 테스트를 추가한다.

### docker-compose에 추가/수정해야 할 서비스

| service | 지금 상태 | 정비 방향 |
| --- | --- | --- |
| `mysql` | 있음 | host port fallback을 README와 맞추거나 `.env` 필수 생성 절차를 더 강하게 안내 |
| `redis` | 있음 | Redis image, host port, healthcheck, volume 없는 ephemeral volatile state service로 추가 완료 |
| `backend` | 없음 | 지금은 추가하지 않음. 로컬 JVM 실행 유지 |
| `frontend` | 없음 | 지금은 추가하지 않음. 로컬 Node/Vite 실행 유지 |

### 필요한 환경변수 목록

| 영역 | 변수 |
| --- | --- |
| MySQL | `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `MYSQL_PORT`, `MYSQL_HOST` |
| JWT | `ZIPON_JWT_SECRET` |
| data.go.kr | `DATA_GO_KR_SERVICE_KEY`, `DATA_GO_KR_BASE_URL`, `DATA_GO_KR_CONNECT_TIMEOUT`, `DATA_GO_KR_READ_TIMEOUT` |
| VWorld | `VWORLD_API_KEY`, `VWORLD_BASE_URL`, `VWORLD_DOMAIN`, `VWORLD_CONNECT_TIMEOUT`, `VWORLD_READ_TIMEOUT` |
| Frontend | `VITE_API_BASE_URL`, `VITE_KAKAO_MAP_APP_KEY` |
| Juso address popup | `JUSO_ADDRESS_CONFIRM_KEY` |
| Redis 후보 | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` 또는 Spring 표준 `SPRING_DATA_REDIS_HOST`, `SPRING_DATA_REDIS_PORT` |

### 포트 사용 현황

| 용도 | 기본 포트 | 현재 상태 |
| --- | --- | --- |
| Backend | 8082 | `server.port` 기본값 |
| Frontend Vite | 5173 | Vite 기본값 |
| MySQL container internal | 3306 | 고정 |
| MySQL host | 3307 권장, compose fallback 3306 | `.env.example` 기준 3307 |
| Redis host 후보 | 6380 | `.env.example` 기준 6380 |

### 포트 충돌 가능성

- macOS Homebrew MySQL 또는 Windows 로컬 MySQL이 3306을 사용할 수 있다.
- backend 8082는 기존 프로세스가 잡고 있을 수 있다.
- Vite 5173은 다른 frontend dev server와 충돌할 수 있다.
- Redis host port는 로컬 Redis 6379 충돌을 피하기 위해 `.env.example`에서 `REDIS_PORT=6380`으로 정했다.

### MySQL/Redis 실행 확인 명령어

PowerShell:

```powershell
Set-Location (git rev-parse --show-toplevel)
docker compose up -d mysql redis
docker compose ps
docker compose logs -f mysql
docker compose logs -f redis
```

macOS/Linux Bash 또는 Windows Git Bash:

```bash
cd "$(git rev-parse --show-toplevel)"
docker compose up -d mysql redis
docker compose ps
docker compose logs -f mysql
docker compose logs -f redis
```

MySQL 접속 확인 후보:

```bash
docker compose exec mysql sh -lc 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SELECT DATABASE();"'
```

Redis 접속 확인 후보:

```bash
docker compose exec redis redis-cli ping
```

### 백엔드 실행 전 체크리스트

- Java 21 이상인지 확인한다.
- root `.env`가 있고 `ZIPON_JWT_SECRET`이 32바이트 이상인지 확인한다.
- `docker compose ps`에서 MySQL이 healthy인지 확인한다.
- Redis는 초기에는 optional이어야 하며, Redis가 내려가 있어도 backend 기본 부팅이 가능해야 한다.
- `backend/src/main/resources/application.yml`이 root `.env`를 읽고 MySQL datasource를 구성하는지 확인한다.

### 프론트엔드 실행 전 체크리스트

- Node.js `22.18.0` 이상 또는 `24.11.0` 이상인지 확인한다.
- root `.env`의 `VITE_API_BASE_URL`이 backend port와 맞는지 확인한다.
- `npm ci`를 먼저 실행한다.
- Vite dev server port `5173` 충돌 시 Vite가 제안하는 대체 port를 쓰거나 기존 프로세스를 종료한다.
- 브라우저 Network tab에서 `/api/health` proxy가 backend로 연결되는지 확인한다.

### macOS 실행 시 주의점

- Docker Desktop, Colima, OrbStack 중 어떤 Docker runtime을 쓰는지 확인한다.
- `lsof -nP -iTCP:3306 -sTCP:LISTEN`로 로컬 MySQL 충돌을 확인한다.
- Bash/zsh에서는 root `.env`를 shell에 export해야 할 때 `set -a; source .env; set +a`를 쓴다.
- Apple Silicon에서도 MySQL 8.4 image가 정상 동작하는지 compose pull 단계에서 확인한다.

### Windows 실행 시 주의점

- PowerShell 5.1은 Bash의 `source`, `export`, `&&` 문법을 그대로 쓰지 않는다.
- 한글 출력이 깨지면 `/docs/operations/skills/windows-powershell-utf8-output.md`의 UTF-8 출력 설정을 먼저 적용한다.
- Java 21이 필요하므로 `JAVA_HOME`이 Java 8을 가리키지 않는지 확인한다.
- Docker Desktop이 WSL2 backend로 실행 중인지 확인한다.
- Node/Vite native binary가 잠기면 실행 중인 `node.exe`를 종료하고 `npm ci`를 다시 수행한다.

### README에 반드시 들어가야 할 실행 순서

1. 필수 프로그램 확인: Java 21, Node 22.18+/24.11+, npm 10+, Docker Desktop
2. `.env` 생성: root에서 `.env.example`을 `.env`로 복사
3. Docker Desktop 실행 확인: `docker version`, `docker compose version`
4. MySQL/Redis 컨테이너 실행: `docker compose up -d mysql redis`
5. 컨테이너 상태 확인: `docker compose ps`
6. DB 마이그레이션 확인: backend local profile 실행 시 Flyway 적용, 필요하면 `flyway_schema_history` 조회
7. 백엔드 local profile 실행: `cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=local`
8. 프론트엔드 실행: `cd frontend && npm ci && npm run dev`
9. API 헬스체크: `GET http://localhost:8082/api/health`
10. 문제 발생 시 로그 확인: `docker compose logs -f mysql`, `docker compose logs -f redis`, backend console log, browser Network tab

### 자주 발생할 수 있는 오류와 해결 방법

| 오류 | 가능 원인 | 해결 |
| --- | --- | --- |
| `address already in use` on MySQL port | 로컬 MySQL 또는 기존 container | `.env`의 `MYSQL_PORT` 변경 후 `docker compose up -d mysql` |
| `Communications link failure` | MySQL 미준비 또는 port/env 불일치 | `docker compose ps`, `docker compose logs -f mysql`, `MYSQL_HOST/PORT` 확인 |
| `Access denied for user` | `.env`와 volume의 초기 계정 불일치 | 필요 시 `docker compose down -v` 후 재생성 |
| backend Java version 실패 | `JAVA_HOME`이 Java 21 미만 | Java 21 경로로 `JAVA_HOME` 설정 |
| Swagger/OpenAPI 오류 | dependency 충돌 또는 context 실패 | `OpenApiDocumentationIntegrationTest`와 backend log 확인 |
| Redis connection refused | Redis container 미실행 또는 port 불일치 | Redis를 optional로 두고 cache disabled fallback 확인 |
| Vite proxy 404/ECONNREFUSED | backend 미실행 또는 `VITE_API_BASE_URL` 불일치 | backend 8082 실행, frontend `.env` 확인 |

## 5. Redis 최소 적용 계획

### 1. 지금 Docker 개발환경에 포함할 것

- 완료: `docker-compose.yml`에 Redis service 추가
- 완료: `.env.example`에 Redis host/port placeholder 추가
- 완료: README에 Redis 실행, 상태 확인, 로그 확인, port 충돌 해결 추가
- 완료: backend code는 Redis dependency를 가지며 local Docker `.env.example`은 Redis를 사용한다. `.env` 없는 fallback과 test profile은 `ZIPON_REDIS_ENABLED=false`로 in-memory fallback 실행 가능

### 2. 지금 코드에 최소 적용할 것

현재 구현은 `VolatileStateStore` interface와 Redis/in-memory 구현을 추가했고, access token denylist cache, 로그인 실패 rate limit, scheduler lock에만 제한 적용한다. 외부 API raw response cache는 아직 붙이지 않는다.

- `VolatileStateStore`처럼 interface를 먼저 만들고 fake/in-memory 구현으로 테스트한다.
- `RedisTemplate` 또는 cache library를 service 곳곳에 직접 주입하지 않는다.
- Redis 장애는 cache miss로 처리한다.

### 3. 외부 API 연동 안정화 이후 적용할 것

- 건축물대장 조회 결과 cache
- 실거래가 월별 조회 결과 cache
- 공시가격 조회 결과 cache
- 동일 분석 요청 중복 방지 lock
- 외부 API provider별 short circuit state

### 4. MVP 이후 적용할 것

- 사용자별 rate limiting
- 분석 job 상태 저장
- OCR 분석 상태 저장
- 다중 서버 SSE fan-out
- 인증/세션 보조 저장

### Redis 적용 후보별 판단

| 후보 | 지금 필요한가 | fallback 가능 | DB 원본/호출 이력 필요 | TTL 후보 | 민감정보 |
| --- | --- | --- | --- | --- | --- |
| 주소 정제 결과 캐시 | 낮음. 현재 parser/DB 조회 중심 | 가능 | 필요 없음. 이력 저장은 진단 snapshot | 1시간~1일 | 주소는 개인정보 가능성이 있어 key hash 필요 |
| 법정동코드 변환 결과 캐시 | 낮음. `legal_dong_codes` DB 조회가 정본 | 가능 | DB가 정본 | 1일~7일 | 낮음. 단 원문 주소는 hash |
| 건축물대장 조회 결과 캐시 | 중간. 반복 조회 가능성 큼 | 가능 | 호출 로그는 `external_api_call_logs`; 원본 보존은 S3 후보 | 1일~7일 | 주소/지번 포함 |
| 실거래가 조회 결과 캐시 | 중간~높음. 법정동/월/유형 단위 재사용 | 가능 | 호출 로그는 RDB | 1시간~1일 | 낮음. 개인 입력 없음 |
| 공시가격 조회 결과 캐시 | 중간 | 가능 | 호출 로그는 RDB | 1일~7일 | PNU/주소성 데이터 |
| 동일 분석 요청 중복 방지 | 중간 | 가능. 실패 시 중복 실행 허용 | 최종 결과는 RDB | 30초~3분 | 입력값 hash 필요 |
| 사용자별 Rate Limiting | MVP 이후. 트래픽 증가 시 필요 | 가능. 없으면 제한 없음 | 필요하면 RDB audit 별도 | window와 동일 | user id/IP |
| 분석 Job 상태 저장 | MVP 이후 | DB job table fallback 필요 | 최종 상태는 DB | 수분~수시간 | user id/diagnosis id |
| OCR 분석 상태 저장 | MVP 이후 | DB job table 필요 | 원본/결과 metadata는 DB/S3 | 수분~수시간 | 매우 민감 |
| 인증/세션/토큰 보조 저장 | 일부 적용됨. access token denylist cache만 volatile state 사용 | RDB가 현재 정본 | refresh/revoked token은 DB 정본 | access token 만료 이하 | 보안 민감 |

## 6. 우선순위 재정렬

| 우선순위 | 항목 | 분류 | 지금 할 일 | 나중에 할 일 | 이유 |
| --- | --- | --- | --- | --- | --- |
| 1 | Docker 개발환경 정비 | C | MySQL/Redis compose, README, 포트/로그/초기화 절차 정리 | app container profile | 재현성이 모든 작업의 기반 |
| 2 | MySQL/Redis compose 구성 및 README 정비 | C | Redis container와 optional volatile state adapter 구성 | Redis health/metrics | Redis 장애 시 fallback 원칙 유지 |
| 3 | 외부 API 호출 흐름 정리 | B | 현 adapter/로그 흐름 유지, cache key 설계 | retry/circuit/rate limit | MVP 진단 핵심 경로 |
| 4 | API 호출 로그 테이블 정비 | A | 현재 `external_api_call_logs` 운영 유지 | 통계/retention 추가 | 이미 구현된 운영 가치 |
| 5 | 주소 정제/법정동코드/건축물대장 조회 안정화 | B | 실패/ambiguous UX와 테스트 강화 | 주소 API 고도화 | 물건 정체 판별 선행 조건 |
| 6 | Redis 기반 일부 API 캐시 도입 | C | `VolatileStateStore`는 적용됨. 외부 API raw response cache는 보류 | 건축물대장/실거래가/공시가격 TTL cache | 외부 API 비용/지연 완화 |
| 7 | 동일 분석 요청 중복 방지 | C | key/TTL 설계 | Redis lock 구현 | 중복 외부 호출 방지 |
| 8 | 물건 유형 판별 로직 완성 | B | 건축물대장 후보 선택 UI/logic 보강 | 토지/상가 확장 | MVP 정확도 핵심 |
| 9 | 실거래가 비교 로직 완성 | B | 보증금-월세 환산, 분위 비교 단순화 | 사전 적재/통계 | 사용자 가치 직접 증가 |
| 10 | 위험도 룰셋 버전 관리 | B | 단순 version 문자열/문서화 | 관리자 룰셋 CRUD | 과거 진단 해석 필요 |
| 11 | 체크리스트 상태 관리 | B | 등기부 확인 상태 유지, 다음 slice 설계 | item별 상태/reminder | 행동 기반 MVP와 맞음 |
| 12 | 관리자 페이지 데이터 관리 | A | 제한 도메인 API 유지 | 룰/통계 관리 | MVP 운영 표면 |
| 13 | Scheduler 기반 사전 적재 | D | 보류 | 월별 실거래가 수집 | cache 이후 필요성 판단 |
| 14 | 등기부등본 업로드/OCR 분석 | D | 수동 확인 상태 유지 | S3/OCR/job/AI 보조 | 보안·저장소 선행 필요 |
| 15 | Kafka 적용 | D | 보류 | 대량 job/event 재처리 | 현재 과함 |
| 16 | Elasticsearch 적용 | D | 보류 | 전문 검색/문서 검색 | 현재 과함 |

## 7. 최종 결론

1. 지금 당장 구현 또는 정비해야 할 것은 Docker 개발환경 정비, MySQL/Redis compose 구성 검토, README 실행 절차 보강, 외부 API 호출 로그 운영 흐름 유지다.
2. MVP에서는 단순화해서 구현할 것은 외부 API 캐시, 위험도 룰셋 버전 표시, 체크리스트 상태 관리, 실거래가 비교 고도화다.
3. MVP 핵심은 아니지만 개발환경/확장 준비를 위해 관리해야 할 것은 Redis container 포함, cache/lock/rate limit adapter 경계 설계, 포트 충돌과 환경변수 문서화다.
4. MVP 이후 확장으로 미룰 것은 Kafka, Elasticsearch, 실거래가 대량 사전 적재, 비동기 진단 job, 등기부등본 업로드/OCR 분석이다.
5. 현재 프로젝트에는 적용 타당성이 낮은 것은 MVP 단계에서 Kafka/Elasticsearch를 포트폴리오용으로 먼저 도입하거나, Redis를 원본 DB처럼 쓰거나, 관리자 페이지를 임의 SQL 실행기로 만드는 방향이다.

## 구현 전 확인해야 할 질문

1. Redis host port는 2026-06-22 follow-up에서 로컬 충돌 회피용 `6380`으로 정했다. `ZIPON_REDIS_ENABLED=true`에서 `.env` override와 Redis 연결 smoke test를 확인할 것.
2. 외부 API cache code 적용 시 첫 대상은 건축물대장 cache인가, 실거래가 월별 cache인가, 동일 요청 lock인가?
3. 외부 API cache key에 포함할 주소/지번 값은 어떤 방식으로 정규화하고 hash할 것인가?
4. cache TTL은 provider별로 문서화할 것인가, 설정값으로 외부화할 것인가?
5. `external_api_call_logs` retention은 어느 정도로 둘 것인가?
6. 위험도 룰셋 version은 response snapshot에 어느 필드명으로 남길 것인가?
7. Docker 개발환경에서 Redis 장애를 의도적으로 재현하는 smoke test를 둘 것인가?

## Related documents

- Parent overview: [docs README](/README.md)
- CODEX overview: [CODEX README](../README.md)
- [ZIP:ON 제품 기준과 서비스 경계](/docs/product/PRODUCT_OVERVIEW.md)
- [과거 지표 기반 부동산 분석 MVP 범위](/docs/product/MVP_SCOPE.md)
- [공공데이터 API 연동 전략](/docs/api/PUBLIC_API_STRATEGY.md)
- [과거 지표 분석과 정확 주소 위험진단 MVP API 호출 전략](/docs/api/API_CALL_FLOW.md)
- [ZIP:ON 저장소 전략](/docs/architecture/DATA_STORAGE_POLICY.md)
- [MySQL 개발환경과 Flyway migration](/docs/operations/DOCKER_MYSQL_REDIS.md)
- [외부 API 설정과 data.go.kr 키 관리](/docs/api/EXTERNAL_API_CONFIGURATION.md)
- [Spring Security JWT 인증 흐름](/docs/architecture/security/SECURITY_AUTHENTICATION.md)
- [커뮤니티 게시판 백엔드 학습 문서](/docs/community/README.md)

## Learning path

1. First read: 이 보고서의 `6. 우선순위 재정렬`
2. Then inspect: root `docker-compose.yml`, `.env.example`, `README.md`
3. Then inspect: `backend/src/main/resources/application.yml`
4. Then inspect: `ExternalApiCallLogService`, `DataGoKrBuildingRegisterApiClient`, `DataGoKrRentTransactionApiClient`, `VWorldPublicPriceApiClient`
5. Then inspect: `RentRiskDiagnosisService`, `LeaseRiskExternalDataLookupService`, `LeaseRiskDiagnosisDataStatusService`
6. Then run: 문서 변경만 검증할 때는 `git diff --check`
7. Key concept to understand: Docker는 재현성 기반이고, Redis는 정본 저장소가 아니라 짧은 수명의 안정화 보조 계층이다.
