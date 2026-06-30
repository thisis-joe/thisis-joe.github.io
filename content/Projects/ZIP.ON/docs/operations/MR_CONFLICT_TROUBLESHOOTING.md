---
title: MR_CONFLICT_TROUBLESHOOTING
created: 2026-07-01T00:06:00+09:00
updated: 2026-07-01T00:06:00+09:00
purpose: troubleshooting-history
status: active
code_sync_required: false
related_area: git, merge-request, flyway, conflict-resolution
read_when: 
do_not_use_as: 
  - MR 충돌, Flyway migration 번호 충돌, stacked branch 충돌을 분석할 때
  - 과거 2026-06-17 충돌 사례에서 해결 순서를 참고할 때
  - 현재 migration 목록의 source of truth
  - 현재 브랜치 상태의 증거
---

# MR 충돌 트러블슈팅 가이드

> Status: Implemented

## Goal

이 문서는 2026-06-17에 발생한 여러 MR 충돌을 기준으로, 다음에 비슷한 문제가 생겼을 때 병목을 직접 찾고 해결하기 위한 짧은 절차서이다.

핵심은 아래 세 가지다.

```text
1. target branch가 언제 움직였는지 먼저 확인한다.
2. 충돌 원인이 코드인지, 문서인지, Flyway migration 번호인지 분리한다.
3. 해결 후에는 반드시 실제 target 기준으로 test와 push까지 끝낸다.
```

현재 ZIP:ON repository 작업은 AGENTS.md의 shell policy에 따라 Bash 명령을 우선한다. 이 문서의 incident branch 이름과 migration 번호는 과거 사례 설명이므로, 실제 해결 전에는 `git fetch`, `git status`, `ls backend/src/main/resources/db/migration`으로 현재 target 기준을 다시 확인한다.

## Incident Context

이번 문제는 커뮤니티 게시판 백엔드 MR과 전세·월세 위험진단 관련 MR들이 동시에 열려 있는 상황에서 발생했다.

관련 branch:

```text
codex/community-board-backend
codex/lease-risk-legal-dong-seed
codex/lease-risk-building-register-adapter
codex/lease-risk-api-rules
codex/lease-risk-address-code
```

발생 흐름:

```text
1. 여러 feature branch가 각각 Flyway migration과 docs를 수정했다.
2. origin/master가 region schema, seed user, community board merge로 계속 전진했다.
3. 뒤늦게 MR branch를 target branch와 합치자 같은 문서와 migration 번호가 충돌했다.
4. 한 번 해결한 뒤에도 community MR이 master에 merge되면서 downstream branch에서 충돌이 다시 발생했다.
```

핵심 충돌 파일:

```text
/docs/operations/DOCKER_MYSQL_REDIS.md
```

핵심 migration 충돌:

```text
V2__create_community_board_schema.sql
V2__create_region_schema.sql

V3__create_legal_dong_codes.sql
V3__seed_admin_and_demo_users.sql

V4__create_community_board_schema.sql
V4__create_legal_dong_codes.sql
```

최종 정리된 migration 순서:

```text
V1__create_auth_schema.sql
V2__create_region_schema.sql
V3__seed_admin_and_demo_users.sql
V4__create_community_board_schema.sql
V5__create_legal_dong_codes.sql
```

## Bottleneck-Finding Order

문제가 생기면 추측하지 말고 아래 순서로 병목을 찾는다.

### 1. 원격 최신 상태 확인

```bash
git fetch origin --prune
git status --short --branch
git log --oneline --decorate --graph --max-count=20 origin/master
```

확인할 것:

- `origin/master`가 MR 작성 이후 전진했는가?
- 현재 local branch가 원격 branch와 같은 commit인가?
- worktree에 아직 commit하지 않은 변경이 남아 있는가?

### 2. 실제 merge 전에 충돌 예측

```bash
git merge-tree --write-tree origin/master origin/codex/branch-name
```

결과 해석:

- exit code `0`: Git 수준에서는 clean merge 가능성이 높다.
- exit code `1`: 충돌 파일이 출력된다.
- `/docs/operations/DOCKER_MYSQL_REDIS.md`처럼 같은 문서가 반복되면 코드보다 문서 병합 정책이 병목이다.

### 3. 충돌 표식과 unmerged index 확인

```bash
rg -n '<<<<<<<|=======|>>>>>>>' .
git ls-files -u
```

확인할 것:

- conflict marker가 실제 파일에 남아 있는가?
- marker는 없지만 Git index가 아직 unmerged 상태인가?
- 해결 후 `git add -A`를 했는가?

### 4. Flyway migration 번호 확인

```bash
ls backend/src/main/resources/db/migration
```

확인할 것:

- 같은 `V숫자__...sql`이 두 개 있는가?
- target branch에 이미 들어간 migration 번호를 feature branch가 다시 쓰고 있는가?
- migration 파일명을 바꿨다면 문서도 같은 번호를 가리키는가?

Flyway 번호가 겹치면 앱은 보통 시작 전에 실패한다. 대표 root cause는 아래처럼 보인다.

```text
Found more than one migration with version 4
Offenders:
-> V4__create_community_board_schema.sql
-> V4__create_legal_dong_codes.sql
```

### 5. 테스트 실패 root cause 좁히기

Spring context load가 실패해도 표면 메시지만 보면 MyBatis bean 문제처럼 보일 수 있다.

```bash
rg -n 'Caused by:|FlywayException|Found more than one migration|Offenders' backend/target/surefire-reports
```

이번 문제에서 겉으로 보인 증상:

```text
Cannot resolve reference to bean 'sqlSessionTemplate'
```

실제 원인:

```text
Flyway migration version duplicate
```

## Resolution Procedure

### 1. target branch를 먼저 합친다

```bash
git switch codex/feature-branch
git merge origin/master -m "Merge origin/master into feature branch"
```

stacked branch라면 target이 `master`가 아닐 수 있다.

예:

```text
building-register-adapter
-> legal-dong-seed 위에 쌓인 branch
-> 먼저 legal-dong-seed를 최신 master와 해결
-> 그 다음 building-register-adapter에 legal-dong-seed를 merge
```

명령 예:

```bash
git switch codex/lease-risk-building-register-adapter
git merge origin/codex/lease-risk-legal-dong-seed -m "Merge legal dong seed updates into building register adapter"
```

### 2. 양쪽 내용을 모두 살릴지 결정한다

이번 `/docs/operations/DOCKER_MYSQL_REDIS.md`는 둘 중 하나를 버리면 안 되는 충돌이었다.

살려야 했던 내용:

- master 쪽: `V4__create_community_board_schema.sql`, community schema 설명
- feature 쪽: `V5__create_legal_dong_codes.sql`, legal-dong schema 설명

좋은 해결:

```text
Auth schema
Region schema
Community schema
Lease risk legal dong code schema
```

나쁜 해결:

```text
HEAD만 선택
origin/master만 선택
```

### 3. migration 번호를 target 기준으로 다시 정한다

target에 이미 들어간 번호를 기준으로 다음 번호를 고른다.

```text
master has V4 community
feature needs legal_dong
=> legal_dong uses V5
```

관련 문서도 같은 번호로 맞춘다.

```bash
rg -n 'V3__create_legal_dong|V4__create_legal_dong|V5__create_legal_dong' docs backend
```

### 4. migration 이름을 바꾼 뒤에는 clean test를 쓴다

branch를 오가며 migration 파일명을 바꾸면 `backend/target/classes/db/migration`에 이전 파일이 남아 테스트를 헷갈리게 할 수 있다.

그래서 migration 번호나 파일명을 바꾼 뒤에는 아래 명령을 우선한다.

```bash
cd backend
./mvnw clean test
```

단순 코드 수정이면 아래 명령으로 충분할 수 있다.

```bash
cd backend
./mvnw test
```

### 5. 해결 완료 기준

아래가 모두 통과해야 한다.

```bash
rg -n '<<<<<<<|=======|>>>>>>>' .
git ls-files -u
git diff --check --cached
cd backend && ./mvnw clean test
```

그 다음 commit/push한다.

```bash
git add -A
git commit -m "Merge origin/master into feature branch"
git push origin codex/feature-branch
```

## Prevention Rules

### 1. DB migration이 있는 MR은 오래 열어두지 않는다

Flyway는 version number가 schema history의 핵심이다. 여러 MR이 동시에 `V2`, `V3`, `V4`를 만들면 나중에 반드시 충돌한다.

예방:

- MR을 작게 만들고 빠르게 merge한다.
- 새 migration을 만들기 전에 항상 `origin/master`의 migration 목록을 확인한다.
- target에 들어간 마지막 번호 다음 번호를 사용한다.

### 2. stacked branch는 순서를 문서화한다

이번에는 아래 순서가 있었다.

```text
lease-risk-api-rules
-> lease-risk-address-code
-> lease-risk-legal-dong-seed
-> lease-risk-building-register-adapter
```

stacked branch에서는 downstream branch를 `master`와 직접 맞추기보다 upstream feature branch를 먼저 해결하고 downstream에 병합하는 편이 안전하다.

### 3. 공통 문서는 한 번에 여러 MR에서 크게 고치지 않는다

`/docs/operations/DOCKER_MYSQL_REDIS.md`처럼 공통 schema 문서는 여러 기능이 동시에 손대기 쉽다.

예방:

- 기능별 schema 문서를 먼저 만든다.
- 공통 문서는 링크와 요약만 추가한다.
- 같은 section을 여러 MR에서 길게 수정하지 않는다.

### 4. no-op branch는 MR로 계속 유지하지 않는다

`codex/lease-risk-api-rules`, `codex/lease-risk-address-code`는 나중에 `master`와 같은 commit이 되었다.

이런 branch는 MR을 닫거나, 다음 feature의 base로만 사용한다. 내용이 없는 MR을 계속 열어두면 충돌 확인 비용만 늘어난다.

## Prompt Template

다음에 같은 문제가 생기면 아래처럼 요청한다.

```text
현재 origin/master 기준으로 MR 충돌을 해결해줘.

대상 브랜치:
1. codex/lease-risk-legal-dong-seed
2. codex/lease-risk-building-register-adapter

작업 방식:
- 먼저 git fetch origin --prune 실행
- 각 브랜치마다 merge-tree로 충돌 파일 예측
- stacked branch 관계를 고려해서 legal-dong을 먼저 해결하고 building-register에 병합
- Flyway migration 번호 중복을 최우선 확인
- conflict marker, git ls-files -u, git diff --check 확인
- migration 파일명 또는 번호 변경이 있으면 ./mvnw clean test 실행
- 성공하면 commit, push

최종 답변:
- 브랜치별 commit hash
- 해결한 충돌 파일
- 최종 migration 순서
- 실행한 테스트와 결과
- MR에 붙여넣을 메시지
```

더 짧게 요청하려면 이렇게 쓴다.

```text
2번 MR부터 최신 origin/master 기준으로 충돌 해결, 테스트, push까지 해줘.
특히 Flyway migration 번호와 /docs/operations/DOCKER_MYSQL_REDIS.md 충돌을 먼저 봐줘.
```

하지 말아야 할 애매한 프롬프트:

```text
충돌난다. 알아서 해줘.
```

이렇게만 쓰면 agent가 어떤 branch부터 처리할지, stacked branch 관계가 있는지, push까지 해야 하는지 다시 추론해야 한다.

## Learning Path

1. First read: 이 문서의 `Incident Context`
2. Then inspect: `backend/src/main/resources/db/migration`
3. Then run: `git merge-tree --write-tree origin/master origin/codex/branch-name`
4. Then debug: `rg -n 'Caused by:|FlywayException|Offenders' backend/target/surefire-reports`
5. Key concept to understand: MR 충돌은 코드 충돌만이 아니라 target branch 이동, migration 번호, 공통 문서 수정이 함께 만든다.

## Related Documents

- [MySQL 개발환경과 Flyway migration](/docs/operations/DOCKER_MYSQL_REDIS.md)
- [커뮤니티 게시판 백엔드 학습 문서](/docs/community/README.md)
- [과거 지표 분석과 정확 주소 위험진단 MVP API 호출 전략](/docs/api/API_CALL_FLOW.md)
