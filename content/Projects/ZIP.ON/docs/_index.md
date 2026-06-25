---
title: _index
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-26T05:00:07+09:00
purpose: docs-manifest
status: active
code_sync_required: true
related_code: 
read_when: 
update_when: 
  - AGENTS.md
  - docs/AGENTS.md
  - docs/_doc-routing.md
  - 변경 영향에 맞는 문서를 고를 때
  - ZIP:ON 문서 구조와 source of truth 우선순위를 확인할 때
  - 새 장기 문서가 추가되거나 문서 책임이 바뀔 때
---

# ZIP:ON 문서 지도

이 문서는 ZIP:ON 문서를 찾기 위한 라우터다. 현재 구현과 반드시 맞아야 하는 문서, 제품 기준 문서, 운영 runbook, 학습용 문서를 구분해서 읽는다.

## 최상위 규칙

1. Agent 운영 규칙은 [AGENTS.md](/AGENTS.md)를 먼저 따른다.
2. `docs/`를 수정할 때는 [docs/AGENTS.md](/docs/AGENTS.md)를 따른다.
3. 문서 선택 방식은 [문서 라우팅 규칙](/docs/_doc-routing.md)을 따른다.
4. 제품 기준은 [PRODUCT_OVERVIEW.md](/docs/product/PRODUCT_OVERVIEW.md), [MVP_SCOPE.md](/docs/product/MVP_SCOPE.md), [PUBLIC_API_STRATEGY.md](/docs/api/PUBLIC_API_STRATEGY.md), [ROADMAP.md](/docs/product/ROADMAP.md)를 우선한다.
5. 코드와 구현 규칙 문서가 충돌하면 코드, 테스트, 설정을 먼저 확인한 뒤 문서의 outdated 여부를 판단한다.

## 폴더별 책임

| 경로 | 목적 | 코드 동기화 | 읽는 시점 |
| --- | --- | --- | --- |
| `docs/product/` | 제품 정체성, MVP 범위, 로드맵, 확장 경계 | 제품 방향 변경 시 필수 | 기능 우선순위나 UX 방향을 정할 때 |
| `docs/api/` | 내부 API, 프론트 연결, 외부 공공데이터 API 전략/명세 | API/DTO/external client 변경 시 필수 | controller, DTO, frontend API, external API를 수정할 때 |
| `docs/architecture/` | 현재 코드 구조, 저장소, 위험도, 보안 구조 | 관련 코드 변경 시 필수 | service, mapper, schema, security 구조를 수정할 때 |
| `docs/frontend/` | 화면 정책, 컴포넌트 역할, 지도/분석 UX | frontend 변경 시 필수 | `frontend/src/**`를 수정할 때 |
| `docs/community/` | 커뮤니티 기능과 동시성/운영 정책 | community 변경 시 필수 | 게시글, 댓글, 신고, 제재 흐름을 수정할 때 |
| `docs/operations/` | 로컬 실행, Docker, seed, scheduler, troubleshooting, 반복 skill | command/env/runtime 변경 시 필수 | 실행 절차, scheduler, infra, 장애 대응을 수정할 때 |
| `docs/CODEX/` | 구조화 AI 위험도 산정 reference | AI scoring 변경 시 필수 | `backend/src/main/java/com/zipon/risk/**`를 수정할 때 |
| `docs/study/` | Spring/Vue/Web/DB 학습 교재 | 원칙적으로 선택 | 개념 설명이나 학습 경로가 필요할 때 |
| `docs/archive/` | 과거 기록 | 현재화 대상 아님 | 역사 확인이 필요할 때만 |
| `docs/skills/` | 과거 MR message guide 등 legacy skill 위치 | 제한적 | MR/PR 메시지 규칙이 필요할 때 |

## 현재 구현 핵심 문서

| 영역 | 구현 기준 문서 | 주요 코드 |
| --- | --- | --- |
| 정확 주소 위험진단 | [API_CALL_FLOW.md](/docs/api/API_CALL_FLOW.md), [RISK_SCORING_POLICY.md](/docs/architecture/RISK_SCORING_POLICY.md), [RISK_ASSESSMENT_EVIDENCE_MODEL.md](/docs/architecture/RISK_ASSESSMENT_EVIDENCE_MODEL.md) | `RentRiskDiagnosisController`, `RentRiskDiagnosisService`, `RentRiskDiagnosisHistoryService` |
| 지역·유형 과거 지표 분석 | [PUBLIC_API_STRATEGY.md](/docs/api/PUBLIC_API_STRATEGY.md), [MARKET_INDICATOR_FOUNDATION.md](/docs/architecture/MARKET_INDICATOR_FOUNDATION.md) | `RegionalIndicatorAnalysisController`, `RegionalIndicatorAnalysisService` |
| 외부 API/공공데이터 | [external-api/README.md](/docs/api/external-api/README.md), [EXTERNAL_API_CONFIGURATION.md](/docs/api/EXTERNAL_API_CONFIGURATION.md) | `external`, `ExternalApiConfig`, public-data services |
| MyBatis/Flyway 저장소 | [DATA_STORAGE_POLICY.md](/docs/architecture/DATA_STORAGE_POLICY.md), [REGION_SCHEMA.md](/docs/architecture/REGION_SCHEMA.md) | `mapper`, `domain`, `backend/src/main/resources/db/migration` |
| 인증/권한 | [SECURITY_AUTHENTICATION.md](/docs/architecture/security/SECURITY_AUTHENTICATION.md), [AUTH_SCHEMA.md](/docs/architecture/security/AUTH_SCHEMA.md), [ROLE_DEPARTMENT_AUTHORIZATION.md](/docs/architecture/security/ROLE_DEPARTMENT_AUTHORIZATION.md) | `security`, `AuthController`, `AuthService`, admin controllers |
| 프론트 API 연결 | [API_FRONTEND_CONNECTION_SPEC.md](/docs/api/API_FRONTEND_CONNECTION_SPEC.md), [API_FUNCTION_MAP.md](/docs/api/API_FUNCTION_MAP.md) | `frontend/src/api/**`, related views/components |
| 화면/컴포넌트 | [COMPONENT_ROLE_MAP.md](/docs/frontend/COMPONENT_ROLE_MAP.md), [SCREEN_ANALYSIS_POLICY.md](/docs/frontend/SCREEN_ANALYSIS_POLICY.md) | `frontend/src/components/**`, `frontend/src/views/**` |
| 지도 진단 | [MAP_DIAGNOSIS_UX_PLAN.md](/docs/frontend/MAP_DIAGNOSIS_UX_PLAN.md) | `MapController`, `MapService`, `frontend/src/api/mapApi.js` |
| 운영 seed/scheduler | [EXTERNAL_DATA_SEEDING.md](/docs/operations/EXTERNAL_DATA_SEEDING.md), [EXTERNAL_DATA_SCHEDULER.md](/docs/operations/EXTERNAL_DATA_SCHEDULER.md) | seed runner/services, scheduler services, `.env.example` |

## 학습 문서 사용법

`docs/study/**`는 이해를 돕는 교재다. 현재 구현과 다른 예시가 있을 수 있으므로, 구현 변경 기준으로 쓰지 않는다. 구현 기준이 필요하면 이 문서의 "현재 구현 핵심 문서" 또는 각 하위 README의 `code_sync_required: true` 문서를 먼저 본다.

## 새 문서 추가 위치

| 새 문서 성격 | 위치 |
| --- | --- |
| 반드시 지켜야 하는 구현 규칙 | 관련 `docs/api/`, `docs/architecture/`, `docs/frontend/`, `docs/operations/` 하위 |
| 왜 이렇게 결정했는지 기록 | 현재는 관련 architecture 문서에 `Decision` 섹션, 향후 `docs/adr/`로 분리 가능 |
| 반복되는 장애/복구 절차 | `docs/operations/skills/` 또는 `docs/operations/troubleshooting/` |
| 개념 학습 자료 | `docs/study/<area>/` |
| 과거 구조 보존 | `docs/archive/` |

새 문서를 추가하면 반드시 [docs/README.md](/docs/README.md) 또는 해당 하위 `README.md`에 연결한다.
