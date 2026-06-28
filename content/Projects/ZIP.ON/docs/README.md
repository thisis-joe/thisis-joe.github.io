---
title: README
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-29T05:00:06+09:00
---

# ZIP:ON Docs

이 폴더는 ZIP:ON의 제품 기준, API 흐름, 아키텍처, 프론트엔드 분석 정책, 운영 절차, 학습 자료를 관리하는 문서 공간입니다.

ZIP:ON의 현재 핵심은 현재 매물 탐색이 아니라 **과거 지표 기반 부동산 분석과 정확 주소 위험진단**입니다. 문서를 읽을 때도 "어떤 매물이 많은가"가 아니라 "이 지역·유형·주소의 과거 지표가 무엇을 말하고, 계약 전 무엇을 확인해야 하는가"를 기준으로 판단합니다.

문서 업데이트는 전체 순차 읽기가 아니라 변경 영향 기반으로 수행합니다. 먼저 [문서 지도](/docs/_index.md)와 [문서 라우팅 규칙](/docs/_doc-routing.md)을 보고, 변경된 코드와 연결된 문서만 골라 읽고 갱신합니다.

## 문서 구조

```text
docs/
├── README.md
├── AGENTS.md
├── _index.md       문서 지도 / 라우터
├── _doc-routing.md 문서 동기화 등급과 변경 영향 기반 업데이트 규칙
├── product/       제품 정체성, MVP 범위, 페르소나, 확장 로드맵
├── api/           공공데이터 API 전략, 외부 API 명세, 호출 순서, 프론트 연결 명세
├── architecture/  백엔드 구조, 저장소 정책, 위험도 룰, 보안/인증
├── CODEX/         구조화 AI 위험도 산정 reference
├── frontend/      분석 화면 정책, 사용자 시나리오, UX 검증 결과
├── operations/    로컬 실행, Docker/MySQL/Redis, 검토 보고서, 상세 트러블슈팅, 반복 작업 skill
├── community/     커뮤니티 기능과 DB 동시성 제어
├── study/         Spring/Vue/Web/DB 학습 문서
├── screenshots/   화면 검증 이미지
└── archive/       과거 CODEX 구조에서 이관한 역사 기록
```

## 처음 읽는 순서

1. [문서 지도](/docs/_index.md)
2. [문서 라우팅 규칙](/docs/_doc-routing.md)
3. [제품 개요](/docs/product/PRODUCT_OVERVIEW.md)
4. [MVP 범위](/docs/product/MVP_SCOPE.md)
5. [공공데이터 API 전략](/docs/api/PUBLIC_API_STRATEGY.md)
6. [MVP API 호출 흐름](/docs/api/API_CALL_FLOW.md)
7. [외부 API 구현 기준](/docs/api/external-api/README.md)
8. [프론트엔드 연결 명세](/docs/api/API_FRONTEND_CONNECTION_SPEC.md)
9. [백엔드 구조](/docs/architecture/BACKEND_STRUCTURE.md)
10. [위험도 산정 정책](/docs/architecture/RISK_SCORING_POLICY.md)
11. [위험도 산정 근거 모델](/docs/architecture/RISK_ASSESSMENT_EVIDENCE_MODEL.md)
12. [AI 위험도 산정 엔진](/docs/CODEX/reference/AI_RISK_SCORING_ENGINE.md)
13. [로컬 실행과 Docker 환경](/docs/operations/LOCAL_SETUP.md)

학습 관점에서 전체 순서를 잡고 싶으면 [학습 경로](/docs/LEARNING_PATH.md)를 먼저 읽습니다.

## 현재 구현 빠른 지도

| 영역 | 현재 구현 | 먼저 볼 문서 |
| --- | --- | --- |
| 정확 주소 위험진단 | `POST /api/rent-risk-diagnoses`, 주소 정제, 건축물대장, 실거래가, 공시가격, 구조화 위험 산정, 진단 이력 저장 | [MVP API 호출 흐름](/docs/api/API_CALL_FLOW.md), [위험도 산정 정책](/docs/architecture/RISK_SCORING_POLICY.md) |
| 지역·유형 과거 지표 | `POST /api/regional-indicator-analyses`, R-ONE domain indicator와 실거래 fact/statistics 기반 해석 | [공공데이터 API 전략](/docs/api/PUBLIC_API_STRATEGY.md), [Market Indicator Foundation](/docs/architecture/MARKET_INDICATOR_FOUNDATION.md), [외부 실거래가 최신월 scheduler](/docs/operations/EXTERNAL_DATA_SCHEDULER.md) |
| 진단 지도 | `GET /api/map/diagnosis-context`, `GET/PUT /api/map/field-checks`, 생활권/데이터 확보 상태/현장 확인 기록 | [지도 UX 계획](/docs/frontend/MAP_DIAGNOSIS_UX_PLAN.md), [프론트엔드 컴포넌트 역할 지도](/docs/frontend/COMPONENT_ROLE_MAP.md) |
| 커뮤니티와 운영 | 게시글/댓글/신고/제재, 관리자 사용자·권한·신고·외부 API 로그·진단 이력·감사 로그 조회 | [커뮤니티 문서](/docs/community/README.md), [역할·부서 권한 정책](/docs/architecture/security/ROLE_DEPARTMENT_AUTHORIZATION.md) |
| 저장소와 배치 | Flyway/MyBatis DB-first snapshot, Redis volatile state, 외부 데이터 seed/scheduler, raw archive metadata | [저장소 정책](/docs/architecture/DATA_STORAGE_POLICY.md), [외부 데이터 수동 seed와 sync](/docs/operations/EXTERNAL_DATA_SEEDING.md) |

## MVP Core 문서

MVP core는 현재 매물 미제공 원칙, 지역·유형 과거 지표 분석, 정확 주소 위험진단에 직접 필요한 문서입니다.

| 주제 | 문서 | 역할 |
| --- | --- | --- |
| 서비스 정체성 | [PRODUCT_OVERVIEW.md](/docs/product/PRODUCT_OVERVIEW.md) | ZIP:ON이 현재 매물 탐색 서비스가 아니라 과거 지표 해석과 계약 전 사전진단 서비스라는 기준입니다. |
| MVP 범위 | [MVP_SCOPE.md](/docs/product/MVP_SCOPE.md) | 현재 매물 미제공, 과거 지표 분석, 정확 주소 위험진단, 커뮤니티, 관리자의 MVP 경계를 설명합니다. |
| 대표 사용자 흐름 | [PERSONA_AND_SCENARIO.md](/docs/product/PERSONA_AND_SCENARIO.md) | 홈 화면 분석/진단 입력 폼에서 시작하는 대표 시나리오를 정리합니다. |
| 공공데이터 전략 | [PUBLIC_API_STRATEGY.md](/docs/api/PUBLIC_API_STRATEGY.md) | R-ONE 통계, 실거래가, 공시가격, 건축물대장을 어떻게 조합할지 정리합니다. |
| API 호출 순서 | [API_CALL_FLOW.md](/docs/api/API_CALL_FLOW.md) | 물건 유형 판별 전에는 실거래가를 무작정 조회하지 않는 core 흐름입니다. |
| 외부 API 구현 기준 | [external-api/README.md](/docs/api/external-api/README.md) | 원문 API 명세, 주소/코드 흐름, 호출 전략, 저장/캐시, 필드 매핑, 에러 처리 기준입니다. |
| 프론트 연결 | [/docs/api/API_FRONTEND_CONNECTION_SPEC.md](/docs/api/API_FRONTEND_CONNECTION_SPEC.md) | backend endpoint, DTO, frontend API module, 화면 연결 기준입니다. |
| 저장소 정책 | [DATA_STORAGE_POLICY.md](/docs/architecture/DATA_STORAGE_POLICY.md) | DB, Redis, S3/file storage에 둘 데이터의 성격을 나눕니다. |
| 위험도 룰 | [RISK_SCORING_POLICY.md](/docs/architecture/RISK_SCORING_POLICY.md) | 위험 신호를 근거, 한계, 다음 행동으로 바꾸는 규칙입니다. |
| 위험도 근거 모델 | [RISK_ASSESSMENT_EVIDENCE_MODEL.md](/docs/architecture/RISK_ASSESSMENT_EVIDENCE_MODEL.md) | 위험도 산정 근거 칼럼, 점수 계산 로직, 직접확인 score 제외, DB snapshot 구조를 설명합니다. |
| 구조화 AI 산정 | [AI_RISK_SCORING_ENGINE.md](/docs/CODEX/reference/AI_RISK_SCORING_ENGINE.md) | AI를 최종 판정자가 아닌 항목별 점수 보조자로 제한하는 구현 기준입니다. |
| 분석 화면 | [SCREEN_ANALYSIS_POLICY.md](/docs/frontend/SCREEN_ANALYSIS_POLICY.md) | 단순 데이터 대시보드가 아니라 계약 전 판단 리포트로 보여주는 기준입니다. |
| 관심 부동산 상세 | [INTEREST_PROPERTY_DETAIL_DECISION.md](/docs/frontend/INTEREST_PROPERTY_DETAIL_DECISION.md) | 저장 snapshot, 정확 주소 위험진단 이력 연결, 사용자별 검토 맥락 보존 기준입니다. |
| 지도 UX | [MAP_DIAGNOSIS_UX_PLAN.md](/docs/frontend/MAP_DIAGNOSIS_UX_PLAN.md) | 지도 화면을 현재 매물 탐색이 아니라 진단 위치 선택과 주소 후보 확인 도구로 쓰는 기준입니다. |

## Extension 문서

확장 문서는 지금 껍데기 API나 placeholder UI를 만들기 위한 근거가 아닙니다. 현재 MVP 코드를 목적 기반 진단으로 확장 가능하게 유지하기 위한 장기 기준입니다.

| 주제 | 문서 | 현재 상태 |
| --- | --- | --- |
| 확장형 서비스 정의 | [EXTENSION_SERVICE_DEFINITION.md](/docs/product/EXTENSION_SERVICE_DEFINITION.md) | 매매, 상가, 토지, 꼬마빌딩, 문서 분석은 future 영역입니다. |
| 성장 로드맵 | [ROADMAP.md](/docs/product/ROADMAP.md) | MVP 이후 확장 순서를 기록합니다. |

## 운영과 개발 문서

| 목적 | 문서 |
| --- | --- |
| 로컬 실행 | [LOCAL_SETUP.md](/docs/operations/LOCAL_SETUP.md) |
| Docker/MySQL/Redis | [DOCKER_MYSQL_REDIS.md](/docs/operations/DOCKER_MYSQL_REDIS.md) |
| 외부 데이터 수동 seed와 sync | [EXTERNAL_DATA_SEEDING.md](/docs/operations/EXTERNAL_DATA_SEEDING.md) |
| 외부 API 환경변수 | [/docs/api/EXTERNAL_API_CONFIGURATION.md](/docs/api/EXTERNAL_API_CONFIGURATION.md) |
| 외부 API 상세 명세 | [/docs/api/external-api/INDEX.md](/docs/api/external-api/INDEX.md) |
| 기술 적용 타당성 검토 | [/docs/operations/review/TECH_APPLICABILITY_REVIEW.md](/docs/operations/review/TECH_APPLICABILITY_REVIEW.md) |
| 트러블슈팅 | [operations/troubleshooting/README.md](/docs/operations/troubleshooting/README.md) |
| Juso CORS와 주소 팝업 callback | [juso-cors-popup-callback.md](/docs/operations/troubleshooting/juso-cors-popup-callback.md) |
| 반복 작업 skill | [operations/skills/README.md](/docs/operations/skills/README.md) |
| PowerShell 한글 깨짐 | [windows-powershell-utf8-output.md](/docs/operations/skills/windows-powershell-utf8-output.md) |
| 사용자 시나리오 테스트 | [frontend/user-scenarios/README.md](/docs/frontend/user-scenarios/README.md) |
| 커뮤니티 동시성 제어 | [CONCURRENCY_CONTROL.md](/docs/community/CONCURRENCY_CONTROL.md) |

## 학습 문서

- [Study index](/docs/study/README.md)
- [Spring Study](/docs/study/Spring/README.md)
- [Database Study](/docs/study/Database/README.md)
- [Architecture Study](/docs/study/Architecture/README.md)
- [Web Study](/docs/study/Web/README.md)
- [Vue Study](/docs/study/Vue/README.md)
- [Build Tools Study](/docs/study/BuildTools/README.md)

## 유지보수 규칙

- 코드 변경 후 문서를 고칠 때는 `git diff --name-only` 또는 변경 예정 파일 경로를 먼저 보고 영향 영역을 분류합니다.
- [문서 지도](/docs/_index.md)와 [문서 라우팅 규칙](/docs/_doc-routing.md)을 통해 필요한 문서만 읽고 갱신합니다.
- `code_sync_required: false`인 학습 문서는 현재 구현 명세나 테스트 기준으로 사용하지 않습니다.
- 제품 기준은 [PRODUCT_OVERVIEW.md](/docs/product/PRODUCT_OVERVIEW.md)와 [MVP_SCOPE.md](/docs/product/MVP_SCOPE.md)를 우선합니다.
- MVP 분석/진단 UX는 홈 화면 분석/진단 입력 폼을 기준으로 읽습니다.
- 현재 매물 목록, 현재 매물 지도 탐색, 실시간 매물 크롤링은 MVP 범위가 아닙니다.
- `강남 원룸`, `서울대입구역 근처`, `상가 월세` 같은 입력은 현재 매물 검색이 아니라 과거 지표 분석으로 읽습니다.
- 커뮤니티와 관리자는 MVP 밖이 아니라 위험진단 운영을 보조하는 MVP surface입니다.
- 확장 기능은 삭제하지 말고 [EXTENSION_SERVICE_DEFINITION.md](/docs/product/EXTENSION_SERVICE_DEFINITION.md) 또는 [ROADMAP.md](/docs/product/ROADMAP.md)에 분리합니다.
- 문서가 "안전합니다", "계약하지 마세요"처럼 확정 판정으로 읽히면 "추가 확인 필요", "계약 전 확인 필요"로 바꿉니다.
- 새 문서를 만들면 반드시 이 문서 또는 하위 README에서 링크합니다.
