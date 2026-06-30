---
title: _doc-routing
created: 2026-07-01T00:06:00+09:00
updated: 2026-07-01T00:06:00+09:00
purpose: documentation-routing-rule
status: active
code_sync_required: true
related_code: 
read_when: 
update_when: 
  - AGENTS.md
  - docs/AGENTS.md
  - docs/_index.md
  - 코드 변경 후 어떤 문서를 읽거나 수정할지 판단할 때
  - 문서가 현재 구현 명세인지 학습 자료인지 구분할 때
  - 문서 폴더 구조, 문서 등급, 필수 라우팅 규칙이 바뀔 때
---

# 문서 라우팅 규칙

이 문서는 ZIP:ON 문서를 전부 같은 강도로 코드와 동기화하지 않기 위한 라우팅 규칙이다. 앞으로 문서 업데이트는 `docs/` 전체 순차 읽기가 아니라 변경 영향 기반으로 수행한다.

## 기본 흐름

```text
코드 변경
-> 변경된 파일 경로 확인
-> 관련 기능 영역 분류
-> docs/_index.md에서 관련 문서 후보 선택
-> code_sync_required 여부 확인
-> 해당 문서와 코드 비교
-> 필요한 문서만 업데이트
-> 작업 보고에 문서 영향 범위 포함
```

## 먼저 보는 명령

```bash
git diff --name-only
git status --short
```

아직 코드를 바꾸기 전이라면 변경하려는 파일 경로를 기준으로 같은 분류를 적용한다.

## 문서 등급

| 등급 | 의미 | 코드 동기화 수준 | 예시 |
| --- | --- | --- | --- |
| `implementation-rule` | 구현자가 반드시 따라야 하는 프로젝트 규칙 | 항상 현재 코드와 맞아야 한다 | `docs/api/API_CALL_FLOW.md`, `docs/architecture/DATA_STORAGE_POLICY.md` |
| `current-architecture` | 현재 코드 구조 설명 | 관련 코드 변경 시 함께 갱신한다 | `docs/architecture/BACKEND_STRUCTURE.md`, `docs/frontend/COMPONENT_ROLE_MAP.md` |
| `api-contract` | endpoint, DTO, response, external API contract | controller, DTO, frontend API module, external client 변경 시 갱신한다 | `docs/api/`, `docs/api/external-api/` |
| `operation-runbook` | 실행, seed, scheduler, troubleshooting 절차 | command, env, scheduler, infra 변경 시 갱신한다 | `docs/operations/` |
| `product-rule` | 제품 정체성, MVP 범위, 금지 기능 | 제품 방향 변경 시에만 갱신한다 | `docs/product/` |
| `decision-record` | 왜 그렇게 결정했는지 기록 | 결정이 바뀌거나 폐기될 때 갱신한다 | `docs/architecture/*DECISION*`, future `docs/adr/` |
| `learning` | 개념 설명과 학습 교재 | 현재 구현과 100% 일치하지 않아도 된다 | `docs/study/`, `docs/LEARNING_PATH.md` |
| `archive` | 과거 기록 | 원칙적으로 현재화하지 않는다 | `docs/archive/` |

## Front Matter 규칙

새 문서에는 가능하면 아래 front matter를 둔다. 기존 문서는 전체를 한 번에 바꾸지 말고, 손댄 문서부터 점진적으로 붙인다.

```yaml
---
purpose: implementation-rule
status: active
code_sync_required: true
related_code:
  - backend/src/main/java/com/zipon/controller/RentRiskDiagnosisController.java
read_when:
  - 전세·월세 위험진단 API를 수정할 때
update_when:
  - 관련 endpoint, DTO, DB schema, 화면 표시 로직이 바뀔 때
---
```

학습 문서는 현재 구현 명세로 오해되지 않게 표시한다.

```yaml
---
purpose: learning
status: active
code_sync_required: false
related_area: security, jwt, spring
read_when:
  - 인증 개념 설명이 필요할 때
  - Spring Security 설계 의도를 확인할 때
do_not_use_as:
  - 현재 구현 명세
  - 테스트 기준
---
```

## 변경 영역별 라우팅

| 변경 경로 | 먼저 읽는 문서 | 보통 갱신하는 문서 |
| --- | --- | --- |
| `backend/src/main/java/com/zipon/controller/**`, `dto/**` | `docs/_index.md`, `docs/api/README.md` | API contract, frontend connection spec, OpenAPI guide |
| `backend/src/main/java/com/zipon/service/**` | `docs/_index.md`, 관련 architecture/API 문서 | request flow, business rule, operation docs |
| `backend/src/main/java/com/zipon/mapper/**`, `db/migration/**` | `docs/architecture/DATA_STORAGE_POLICY.md`, 관련 schema docs | DB schema, MyBatis/Flyway docs, persistence impact |
| `backend/src/main/java/com/zipon/security/**` | `docs/architecture/security/SECURITY_AUTHENTICATION.md` | auth schema, role/department authorization docs |
| `backend/src/main/java/com/zipon/external/**` | `docs/api/external-api/README.md` | external API call strategy, field dictionary, error policy |
| `frontend/src/api/**` | `docs/api/API_FRONTEND_CONNECTION_SPEC.md` | API function map, component role map |
| `frontend/src/components/**`, `frontend/src/views/**` | `docs/frontend/README.md` | screen policy, component role map, scenario docs |
| `docker-compose.yml`, `.env.example`, `application*.yml` | `docs/operations/README.md` | local setup, Docker, external API configuration |
| `docs/study/**` | `docs/study/README.md` | 학습 경로와 개념 문서만 갱신 |

## 하지 말 것

- 코드 변경 한 건마다 `docs/` 전체를 순차적으로 읽지 않는다.
- `docs/study/**`를 현재 구현 명세나 테스트 기준으로 사용하지 않는다.
- `docs/archive/**`를 현재 코드에 맞춰 고치지 않는다.
- 구현 규칙 문서와 코드가 충돌할 때 문서만 믿고 코드를 바꾸지 않는다.
- 새 문서를 만들고 `docs/README.md` 또는 하위 README에 링크하지 않은 채 두지 않는다.

## 보고 형식

문서가 관련된 작업의 최종 보고에는 아래 항목을 포함한다.

```text
Docs impact
- Routing basis:
- Existing docs modified:
- New docs added:
- Docs intentionally not changed because:
- Index/README links updated:
- Code/tests/config referenced:
```
