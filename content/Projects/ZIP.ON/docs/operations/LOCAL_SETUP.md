---
title: LOCAL_SETUP
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-27T05:00:07+09:00
---

# 로컬 Docker 개발환경

> Status: Implemented

## 목적

이 문서는 ZIP:ON을 처음 실행하는 개발자가 MySQL, Redis, backend, frontend를 재현 가능하게 띄우는 방법을 설명한다.

현재 Docker Compose는 애플리케이션 전체를 상시 컨테이너로 실행하지 않는다. 상시 개발 infrastructure는 MySQL과 Redis이고, backend는 로컬 JVM, frontend는 로컬 Node/Vite로 실행한다. 다만 `seeding` profile에는 외부 데이터 수동 적재용 one-off backend runner service가 있다.

```text
Docker Compose
-> MySQL: Flyway/MyBatis가 사용하는 영속 저장소
-> Redis: 선택적 volatile state store. `ZIPON_REDIS_ENABLED=true`일 때 cache/lock/rate-limit helper가 사용
-> seeding profile: 실거래가, 법정동코드, R-ONE, VWorld 공시가격, 건축물대장 표제부 수동 적재 runner

Local runtime
-> backend: Java 21 + Maven
-> frontend: Node + Vite
```

## 현재 구성

| 항목 | 파일 | 현재 역할 |
| --- | --- | --- |
| Compose | `docker-compose.yml` | `mysql`, `redis` 상시 service와 `backend-seed`, `backend-legal-dong-sync`, `backend-kab-r-one-sync`, `backend-public-price-seed`, `backend-building-register-seed` 수동 runner 정의 |
| 환경변수 예시 | `.env.example` | MySQL, Redis, JWT, 외부 API, backend-only OpenAI 위험 산정, Vite 값 예시 |
| Backend datasource | `backend/src/main/resources/application.yml` | root `.env`를 읽고 Docker MySQL에 연결 |
| Backend volatile state | `backend/src/main/resources/application.yml`, `.env.example` | 기본은 in-memory fallback, `ZIPON_REDIS_ENABLED=true`면 Redis 사용 |
| Backend local profile | `backend/src/main/resources/application-local.yml` | 로컬 개발에서 JWT access/refresh token 만료 시간을 1년으로 override |
| Backend tests | `backend/src/test/resources/application-test.yml` | Testcontainers MySQL + Flyway test profile |
| Root onboarding | `README.md` | 신규 개발자 실행 순서 |

## Service 역할

### MySQL

MySQL은 ZIP:ON의 정본 저장소다.

- Flyway migration이 schema를 만든다.
- MyBatis Mapper가 데이터를 읽고 쓴다.
- 인증, 커뮤니티, 관리자 권한, 법정동코드, 위험진단 이력, 외부 API 호출 로그, 등기부등본 확인 상태, AI 위험 산정 audit log, 건축물대장 snapshot, 공시가격 snapshot/sync target이 MySQL에 저장된다.

### Seeding runners

`seeding` profile의 backend runner들은 일반 서버가 아니다. 명시적으로 실행할 때만 외부 API를 호출하고, 작업이 끝나면 Spring context를 닫는다.

- `backend-seed`: data.go.kr 실거래가 target 등록과 수집
- `backend-legal-dong-sync`: 행정표준코드 법정동코드 catalog sync
- `backend-kab-r-one-sync`: 한국부동산원 R-ONE 통계표/세부항목/통계자료 sync
- `backend-public-price-seed`: VWorld 공시가격 sync target materialize와 callable target 조회
- `backend-building-register-seed`: PNU 후보를 건축물대장 표제부 조회 파라미터로 복원해 `building_register_title_snapshots` 보강

자세한 실행 절차와 제한값은 [외부 데이터 수동 seed와 sync](/docs/operations/EXTERNAL_DATA_SEEDING.md)를 따른다.

### Backend-only OpenAI risk scoring

OpenAI/ChatGPT API는 로컬 개발에서 기본으로 꺼져 있다.

- `OPENAI_RISK_SCORING_ENABLED=false`이면 `RiskScoringFallbackService`가 12개 고정 항목을 rule-based fallback으로 채운다.
- `OPENAI_RISK_SCORING_ENABLED=true`와 `OPENAI_API_KEY`, `OPENAI_MODEL`을 설정하면 `HttpOpenAiRiskScoringClient`가 Responses API structured output을 호출한다.
- 무료 또는 낮은 usage tier에서 검증할 때는 OpenAI Platform `Limits` 화면에 표시되는 가장 작은 structured-output 가능 모델을 `OPENAI_MODEL`로 설정하고, `OPENAI_MAX_OUTPUT_TOKENS=2400`처럼 출력 상한을 둔다. API free credit이나 billing 한도가 0인 프로젝트는 성공 호출을 만들 수 없다.
- API key는 backend process에서만 읽고, `VITE_*` 변수나 브라우저 bundle로 전달하지 않는다.
- OpenAI가 실패하거나 schema 검증을 통과하지 못하면 진단 API는 실패하지 않고 fallback 결과와 불확실성 penalty를 내려준다. HTTP 429가 한 번 발생하면 같은 진단 안의 남은 OpenAI 호출은 중단하고 `AI 실패 fallback`으로 표시한다.
- 호출/audit 결과는 `ai_risk_scoring_logs`에 저장되며, 최종 점수와 등급은 `RiskScoreAggregator`와 `RiskGradeCalculator`가 계산한다.

### Redis

Redis는 현재 선택적 volatile state 저장소다. `ZIPON_REDIS_ENABLED=true`이면 `VolatileStateStore`의 Redis adapter가 access token denylist cache, 로그인 실패 rate limit, 커뮤니티 신고 rate limit, 외부 데이터 scheduler lock 같은 만료 가능한 상태에 사용된다. `application.yml` fallback과 test profile은 Redis가 없어도 in-memory adapter로 동작하게 둔다.

지금 Redis를 compose에 포함한 이유:

- access token denylist cache
- 로그인 실패와 커뮤니티 신고 rate limit counter
- 외부 데이터 scheduler lock
- 외부 API short TTL cache 후보
- 동일 진단 요청 중복 방지 lock 후보
- 향후 circuit state 후보
- 향후 OCR/문서 분석 상태 cache 후보

중요한 원칙:

- Redis는 원본 DB가 아니다.
- 최종 위험진단 결과는 `rent_risk_diagnosis_histories`에 저장한다.
- 외부 API 호출 이력은 `external_api_call_logs`에 저장한다.
- Redis가 내려가도 MVP 위험진단 기본 흐름은 동작해야 한다.
- 민감정보, 등기부등본 원문, 계약서 원문을 Redis에 장기 저장하지 않는다.

## 포트 기준

| 용도 | Host port | Container/Internal port | 이유 |
| --- | --- | --- | --- |
| MySQL | `3307` | `3306` | 로컬 설치 MySQL의 3306 충돌 회피 |
| Redis | `6380` | `6379` | 로컬 설치 Redis의 6379 충돌 회피 |
| Backend | `8082` | local JVM | Spring Boot local profile |
| Frontend | `5173` | Vite dev server | Vue 개발 서버 |

포트는 `.env`에서 바꿀 수 있다.

```properties
MYSQL_PORT=3307
REDIS_PORT=6380
OPENAI_RISK_SCORING_ENABLED=false
OPENAI_API_KEY=
OPENAI_MODEL=
OPENAI_MAX_OUTPUT_TOKENS=2400
```

## 실행 순서

### 1. `.env` 생성

Bash:

```bash
cd "$(git rev-parse --show-toplevel)"
[ -f .env ] || cp .env.example .env
${EDITOR:-vi} .env
```

PowerShell:

```powershell
Set-Location (git rev-parse --show-toplevel)
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

### 2. Docker infrastructure 실행

Docker Desktop을 쓰지 않는 macOS Homebrew 환경에서는 Colima와 Docker CLI를 먼저 준비한다.

```bash
brew install colima docker docker-compose
colima start --cpu 2 --memory 4 --disk 20
docker context use colima
docker info --format '{{.ServerVersion}} {{.OperatingSystem}}'
docker compose version
```

`docker compose version`이 Compose plugin을 찾지 못하면 `~/.docker/config.json`에 Homebrew plugin 경로를 병합한다.

```json
{
  "cliPluginsExtraDirs": [
    "/opt/homebrew/lib/docker/cli-plugins"
  ]
}
```

Testcontainers가 Colima socket을 자동으로 찾지 못하면 아래 로컬 설정을 추가한다. `docker.host`는 host macOS의 socket이고, `TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE`는 Ryuk 같은 Testcontainers 내부 컨테이너가 보는 Docker socket 경로다.

```bash
printf 'docker.host=unix://%s/.colima/default/docker.sock\n' "$HOME" > ~/.testcontainers.properties
grep -qxF 'export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE="/var/run/docker.sock"' ~/.zprofile || echo 'export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE="/var/run/docker.sock"' >> ~/.zprofile
grep -qxF 'export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE="/var/run/docker.sock"' ~/.zshrc || echo 'export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE="/var/run/docker.sock"' >> ~/.zshrc
```

```bash
cd "$(git rev-parse --show-toplevel)"
unset COMPOSE_FILE
docker compose -f docker-compose.yml config --services
docker compose -f docker-compose.yml up -d mysql redis
docker compose -f docker-compose.yml ps
```

정상이라면 다음 mapping이 보인다.

```text
0.0.0.0:3307->3306/tcp
0.0.0.0:6380->6379/tcp
```

### 3. MySQL 확인

```bash
docker compose -f docker-compose.yml exec mysql sh -lc 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SELECT DATABASE();"'
```

### 4. Redis 확인

```bash
docker compose -f docker-compose.yml exec redis redis-cli ping
```

정상 응답:

```text
PONG
```

### 5. Backend 실행

macOS Homebrew에서 Java 21이 없다면 먼저 설치하고 shell 설정에 추가한다.

```bash
brew install openjdk@21
grep -qxF 'export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"' ~/.zprofile || echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"' >> ~/.zprofile
grep -qxF 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' ~/.zprofile || echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zprofile
grep -qxF 'export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"' ~/.zshrc || echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"' >> ~/.zshrc
grep -qxF 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' ~/.zshrc || echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
java -version
```

Bash:

```bash
cd "$(git rev-parse --show-toplevel)/backend"
java -version
./mvnw spring-boot:run \
  -Dspring-boot.run.profiles=local \
  -Dspring-boot.run.arguments=--server.port=8082
```

PowerShell:

```powershell
Set-Location (git rev-parse --show-toplevel)
$env:JAVA_HOME = 'C:\Program Files\Zulu\zulu-21'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

Set-Location backend
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local -Dspring-boot.run.arguments=--server.port=8082
```

### 6. Frontend 실행

Bash:

```bash
cd "$(git rev-parse --show-toplevel)/frontend"
npm ci
npm run dev
```

PowerShell:

```powershell
Set-Location (git rev-parse --show-toplevel)
Set-Location frontend
npm ci
npm run dev
```

### 7. Health check

Bash:

```bash
curl http://localhost:8082/api/health
```

PowerShell:

```powershell
Invoke-RestMethod http://localhost:8082/api/health
```

## 로그 확인

```bash
docker compose -f docker-compose.yml ps
docker compose -f docker-compose.yml logs -f mysql
docker compose -f docker-compose.yml logs -f redis
```

## 종료와 초기화

컨테이너만 종료:

```bash
docker compose -f docker-compose.yml down
```

MySQL 데이터까지 삭제:

```bash
docker compose -f docker-compose.yml down -v
```

주의:

- `docker compose -f docker-compose.yml down -v`는 `zipon_mysql_data` volume을 삭제한다.
- Redis는 현재 volume이 없으므로 컨테이너가 재시작되면 volatile state 데이터도 사라지는 구조다.
- Redis 데이터가 사라지는 것은 의도된 동작이다. Redis를 정본 저장소로 쓰지 않기 때문이다.

## 자주 나는 오류

| 증상 | 가능 원인 | 해결 |
| --- | --- | --- |
| `no such service: redis` | shell `COMPOSE_FILE`이 다른 compose 파일을 가리키거나 repository root의 `docker-compose.yml`을 읽지 않음 | `unset COMPOSE_FILE` 후 `docker compose -f docker-compose.yml config --services`로 `mysql`, `redis` 확인 |
| `address already in use` on `3307` | 다른 MySQL container 또는 프로세스가 host 3307 사용 | `.env`의 `MYSQL_PORT` 변경 후 `docker compose -f docker-compose.yml up -d mysql` |
| `address already in use` on `6380` | 다른 Redis container 또는 프로세스가 host 6380 사용 | `.env`의 `REDIS_PORT` 변경 후 `docker compose -f docker-compose.yml up -d redis` |
| `Communications link failure` | MySQL 미실행, health 준비 전 backend 실행, port 불일치 | `docker compose -f docker-compose.yml ps`, `docker compose -f docker-compose.yml logs -f mysql`, `.env`의 `MYSQL_PORT` 확인 |
| `Access denied for user` | 기존 MySQL volume에 예전 계정이 남아 있음 | 로컬 데이터 삭제 가능하면 `docker compose -f docker-compose.yml down -v` 후 재생성 |
| `redis-cli ping` 실패 | Redis service 미실행 또는 health 준비 전 확인 | `docker compose -f docker-compose.yml up -d redis`, `docker compose -f docker-compose.yml logs -f redis` |
| backend Java version 실패 | PATH가 Java 8 또는 Java 25 같은 다른 JDK를 먼저 잡음 | `JAVA_HOME`과 `PATH`를 Java 21 경로로 설정 |
| Testcontainers가 `Could not find a valid Docker environment` 출력 | Colima socket을 Testcontainers가 자동 감지하지 못함 | `~/.testcontainers.properties`의 `docker.host`와 shell의 `TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE` 설정 확인 |
| Vite proxy 연결 실패 | backend가 8082에서 실행 중이 아님 | backend 실행 후 browser Network tab 확인 |

## Decision: Redis는 optional volatile state adapter로만 사용한다

### Context

`/docs/operations/review/TECH_APPLICABILITY_REVIEW.md`는 Redis를 외부 API cache, duplicate request lock, rate limit 후보로 분류했다. 현재 구현은 Redis를 source of truth로 쓰지 않고 `VolatileStateStore` interface 뒤에 둔다. local Docker `.env.example`은 `ZIPON_REDIS_ENABLED=true`로 Redis를 사용하고, `application.yml` fallback과 test profile은 `false`라 Redis 없이도 backend가 실행된다. Redis를 켜면 access token denylist cache, 로그인 실패 rate limit, scheduler lock 상태를 여러 backend 인스턴스가 공유할 수 있다.

### Options considered

1. Redis를 외부 API raw response cache까지 넓게 적용한다.
2. Redis를 `VolatileStateStore` adapter로 제한하고 기본값은 in-memory fallback으로 둔다.
3. Redis를 Docker Compose에만 남기고 backend code에서는 사용하지 않는다.

### Decision

2번을 선택한다. Redis는 local Docker infrastructure와 backend dependency에 포함하되, access token denylist cache, 로그인 실패 rate limit, scheduler lock처럼 TTL이 명확한 상태에만 제한 적용한다.

### Why

이 선택은 신규 개발자가 Redis를 곧바로 띄워 볼 수 있게 하면서도, `StringRedisTemplate` 호출이 service 곳곳에 흩어지는 위험을 피한다. Redis 장애가 나도 `RedisVolatileStateStore`는 cache miss 또는 fail-open으로 처리하고, DB source of truth 경로는 유지된다.

### Tradeoffs

Redis가 꺼진 기본 설정에서는 in-memory fallback이므로 여러 backend 인스턴스 사이에서 rate limit과 lock이 공유되지 않는다. 대신 로컬 개발과 테스트는 Redis 없이 단순하게 유지되고, 운영에서 Redis를 켜면 같은 interface로 공유 상태를 사용할 수 있다.

### Future revisit

건축물대장, 실거래가, 공시가격 adapter 앞에 외부 API raw response short TTL cache를 도입할 때 이 결정을 다시 본다. 그때는 provider별 TTL, cache key hash, 민감정보 제외, Redis 장애 fallback 테스트를 함께 추가해야 한다.

## Learning path

1. First read: 이 문서의 `Service 역할`과 `Decision`을 읽는다.
2. Then inspect: root `docker-compose.yml`과 `.env.example`을 비교한다.
3. Then inspect: `backend/src/main/resources/application.yml`에서 MySQL datasource, root `.env` import, `zipon.redis.*` 설정을 확인한다.
4. Then inspect: `backend/src/main/java/com/zipon/config/VolatileStateConfig.java`에서 Redis enabled 조건과 in-memory fallback bean을 확인한다.
5. Then run: `docker compose -f docker-compose.yml up -d mysql redis`, `docker compose -f docker-compose.yml ps`, `docker compose -f docker-compose.yml exec redis redis-cli ping`.
6. Then debug: port 충돌이 나면 `.env`의 `MYSQL_PORT`, `REDIS_PORT`를 바꾼 뒤 compose를 재실행한다.
7. Key concept to understand: MySQL은 정본 저장소이고 Redis는 짧은 수명의 보조 계층이다. 둘은 역할이 다르다.

## Related Docs

- [기술 적용 타당성 검증 보고서](/docs/operations/review/TECH_APPLICABILITY_REVIEW.md)
- [MySQL 개발환경과 Flyway migration](/docs/operations/DOCKER_MYSQL_REDIS.md)
- [ZIP:ON 저장소 전략](/docs/architecture/DATA_STORAGE_POLICY.md)
- [외부 API 설정과 data.go.kr 키 관리](/docs/api/EXTERNAL_API_CONFIGURATION.md)
- [과거 지표 분석과 정확 주소 위험진단 MVP API 호출 전략](/docs/api/API_CALL_FLOW.md)
