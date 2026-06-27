---
title: README
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
purpose: operation-runbook-index
status: active
code_sync_required: true
related_code: 
read_when: 
update_when: 
  - docker-compose.yml
  - .env.example
  - backend/src/main/resources/application.yml
  - backend/src/main/java/com/zipon/service
  - 로컬 실행, Docker, Redis/MySQL, seed, scheduler, troubleshooting 절차를 수정할 때
  - 실행 명령, 환경변수, scheduler/seed 절차, 반복 장애 대응법이 바뀔 때
---

# Operations Docs

이 폴더는 로컬 실행, Docker/MySQL/Redis, 환경변수, 기술 검토, 상세 트러블슈팅, 반복 작업 skill을 관리한다.

이 폴더의 runbook은 현재 실행 명령과 환경변수에 맞아야 한다. 오래된 장애 기록은 `troubleshooting/` 또는 `skills/`에서 상태를 명시한다.

## 읽는 순서

1. [LOCAL_SETUP.md](LOCAL_SETUP.md)
2. [DOCKER_MYSQL_REDIS.md](DOCKER_MYSQL_REDIS.md)
3. [EXTERNAL_DATA_SEEDING.md](EXTERNAL_DATA_SEEDING.md)
4. [EXTERNAL_DATA_SCHEDULER.md](EXTERNAL_DATA_SCHEDULER.md)
5. [review/TECH_APPLICABILITY_REVIEW.md](review/TECH_APPLICABILITY_REVIEW.md)
6. [troubleshooting/README.md](troubleshooting/README.md)
7. [skills/README.md](skills/README.md)

## 트러블슈팅

- [Juso CORS와 주소 팝업 callback 문제](troubleshooting/juso-cors-popup-callback.md): Juso 팝업 선택 후 CORS처럼 보이는 오류, Tomcat `0x16 0x03` request parsing 오류, `returnUrl`/`targetOrigin`/HTTPS callback 설정을 상세히 설명한다.

## 외부 데이터 seed와 sync

- [외부 데이터 수동 seed와 sync](EXTERNAL_DATA_SEEDING.md): Docker MySQL에 실제 data.go.kr 실거래가 응답을 제한적으로 적재하고, 전국 법정동코드 catalog, 한국부동산원 R-ONE 통계, VWorld 공시가격 sync target/coverage metric, 건축물대장 표제부 snapshot seed까지 검증하는 수동 절차.
- [외부 실거래가 최신월 scheduler](EXTERNAL_DATA_SCHEDULER.md): 최신 완료월 전국 또는 지정 지역 실거래가 target을 `external_data_refresh_targets`에 등록하고, bounded batch worker로 DB fact/statistics를 갱신하는 운영 절차.

## 반복 작업 스킬

- [Git conflict clean worktree push](skills/git-conflict-clean-worktree-push.md): 다른 브랜치 변경과 충돌이 섞인 상태에서 기능 단위 변경만 깨끗한 worktree로 분리해 검증하고 푸시하는 절차.
- [Juso popup return URL protocol](skills/juso-popup-return-url-protocol.md): 주소 팝업 선택 후 Tomcat `0x16 0x03` request parsing 오류가 날 때 HTTPS callback과 HTTP-only backend 포트 불일치를 판별하는 절차.
- [MVP pre-expansion regression test runbook](skills/mvp-pre-expansion-regression-tests.md): 확장 기능을 붙이기 전 현재 매물 미제공, 정확 주소 위험진단, 커뮤니티/관리자 MVP 경계를 회귀 확인하는 절차.
- [OpenAI risk one-run verification](skills/openai-risk-one-run-verification.md): OpenAI 구조화 위험산정 1회 검증을 `.env` 기반으로만 실행하고 즉시 비활성화하는 절차.
- [Testcontainers Colima socket](skills/testcontainers-colima-socket.md): macOS Colima 환경에서 Testcontainers가 Docker socket을 찾지 못하는 문제를 해결하는 절차.
- [Windows Maven incremental test compile](skills/windows-maven-incremental-test-compile.md): Windows Maven에서 `testCompile`이 존재하는 class를 못 찾을 때 incremental compiler cache 문제를 분리하는 절차.
- [Windows PowerShell UTF-8 output scan](skills/windows-powershell-utf8-output.md): Windows PowerShell 출력에서 한글이 깨질 때 Bash 기준으로 재검증하는 절차.

## 운영 원칙

- Docker Compose는 MySQL과 Redis 개발환경을 재현 가능하게 관리한다.
- 백엔드와 프론트엔드는 현재 로컬 JVM/Node로 실행한다.
- Redis는 원본 저장소가 아니라 외부 API 캐시, 중복 요청 방지, rate limit 후보로 다룬다.
- `.env`와 API key는 커밋하지 않는다.
- 현재 worktree에 unrelated 변경이 있으면 새 브랜치 작업은 별도 worktree로 분리하고, 사용자 변경 파일을 checkout/reset하지 않는다.
