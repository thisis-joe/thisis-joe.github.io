---
title: AGENTS
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-27T05:00:07+09:00
---

# docs/AGENTS.md

## Rule No. 1

Think and design the documentation in English first, then write the final document in fluent Korean unless the existing document intentionally uses English.

## Purpose

The `docs/` directory exists for both maintainability and learning.

The repository owner is learning Spring Boot and wants to understand the architecture deeply, not merely copy working code. Every meaningful document should help the owner answer:

- What problem does this solve?
- Where is it implemented?
- Why was this design chosen?
- What alternatives were considered?
- How can I debug it when it fails?
- Which code, tests, database objects, and configuration files should I read next?

## Product Source Of Truth

Before adding, deleting, or substantially editing docs, align the change with these product-standard files:

1. `/docs/product/PRODUCT_OVERVIEW.md`
2. `/docs/product/MVP_SCOPE.md`
3. `/docs/api/PUBLIC_API_STRATEGY.md`
4. `/docs/product/ROADMAP.md`

Then read `/docs/product/EXTENSION_SERVICE_DEFINITION.md` only as a future-direction constraint. It keeps the current MVP extensible, but it does not authorize empty placeholder APIs, screens, or packages for 매매, 상가, 토지, 임야, 꼬마빌딩 before a real implementation slice exists.

Docs must treat ZIP:ON as a historical-indicator analysis and purpose-based pre-contract real-estate risk diagnosis service, not as a generic property listing clone or current-listing platform. The MVP does not show current listings. When examples are needed, prefer the MVP scenario:

```text
현재 매물 미제공
-> 홈 화면 분석/진단 입력 폼
-> 지역/유형/정확 주소 의도 분류
-> 과거 지표 분석: R-ONE 통계, 실거래가, 공시가격, 건축물대장
-> 정확 주소라면 주소 정제와 물건 정체 판별
-> 추세, 변동성, 데이터 한계, 위험 신호 해석
-> 직접 확인 체크리스트와 계약 전 행동 안내
```

MVP documentation must explicitly state that `강남 원룸`, `서울대입구역 근처`, `상가 월세` 같은 입력은 현재 매물 검색이 아니라 지역/유형 과거 지표 분석으로 처리한다. `신림동 1422` 같은 정확 주소형 입력은 주소 후보 선택과 정확 주소 위험진단으로 처리한다.

MVP documentation must also remember that community and admin pages are included in the MVP as supporting product/operation surfaces. Community supports post-analysis questions, experiences, reports, and moderation. Admin supports user/permission/community/report/external API log/risk-diagnosis history operations through restricted `ROLE_ADMIN` domain APIs.

Current MVP documentation must not describe chatbot UI, conversation/session storage, free-form user-facing prompt generation, or Spring AI explanation assistance as implemented scope. Backend-only OpenAI/ChatGPT API use may be documented only as structured criterion scoring for the fixed risk-assessment template: AI scores individual criteria from normalized public-data input, while backend code validates JSON, calculates the final score/grade/verdict, applies uncertainty penalties, and handles fallback. Document privacy, evaluation, fallback, and rollback boundaries whenever this AI scoring layer changes.

Expansion documentation must distinguish "not planned for immediate implementation" from "must remain architecturally possible." Future residential purchase, commercial startup, land development, building investment, and user document analysis flows should preserve this product order: analysis intent -> historical/public indicator interpretation -> property identification when exact address exists -> direct confirmation boundary -> checklist/report. Expansion docs are design constraints, not authorization to create shells, placeholder APIs, or unused stubs for future property types before a real MVP slice needs them.

Do not make "매물 목록 많이 보여주기", "현재 매물 지도 검색", "지도 검색 먼저 강화", "community as an unrelated post-MVP add-on", "admin as an arbitrary SQL console", or "Spring Data JPA로 시작하기" the default docs path.

## Before Editing Docs

Before adding or editing documentation:

1. Start from `git diff --name-only` or the intended changed file paths.
2. Classify the affected area: product, API, external API, architecture, frontend, operations, community, security, persistence, or learning.
3. Read `/docs/_index.md` and `/docs/_doc-routing.md`.
4. Read only the relevant existing documents selected by the routing rules.
5. Prefer updating or merging into an existing document when that keeps the docs coherent.
6. Create a new document only when the topic deserves its own page.
7. Never create orphan documents.
8. If a new document is created, update the relevant `README.md`, `index.md`, table of contents, or cross-links.
9. Remove or update stale sections when code behavior changes.
10. Do not treat learning documents with `code_sync_required: false` as current implementation specs or test criteria.

## Documentation Skills

When writing documentation-change summaries, final handoffs, push reports, MR messages, PR messages, or review request messages, follow:

```text
docs/skills/MR_MESSAGE_GUIDE.md
```

Even when the change is documentation-only, the MR message must clearly state the reason for the change, documentation location, reviewer focus points, test or verification status, and why build tests were not run if they were skipped.

This is an intentional exception to the general rule that new repeated-work skills belong under `/docs/operations/skills/`.

## Repeated Work Skill Docs

`/docs/operations/skills/` is the canonical location for repeated task skills. Use it when the same repository operation, troubleshooting sequence, environment workaround, or recovery procedure has been done two or more times.

Before investigating a symptom that may be a repeat problem, run a focused scan first:

```bash
rg -n "<symptom>|<error>|<command>|<class-or-file>" /docs/operations/skills AGENTS.md docs/AGENTS.md
git status --short
git diff --name-only
```

The scan must compare the current symptom, error text, command, affected files, branch context, and recent diff against existing skill docs. If the same issue is likely, apply the existing skill first; spend new investigation tokens only on missing or stale parts. If the issue repeats again or the skill was incomplete, update the skill after the fix.

Skill doc format is an explicit exception to the default Korean-doc style:

- Put 1-5 Korean sentences at the very top that fully identify the purpose, symptoms, and scope.
- Write the body in English or compact LLM-readable checklist form.
- Split docs by task or workflow; do not create one giant troubleshooting file.
- Include trigger signals, required scan commands, same-issue decision criteria, fix steps, verification, and "do not do" warnings.
- Link every new skill from `/docs/operations/skills/README.md` and relevant parent indexes.
- Do not add new reusable skills under legacy `docs/skills/`; keep that path only as historical material unless it is intentionally migrated.

## Source Of Truth

Docs must describe the actual repository, not generic Spring Boot examples.

Use real names from the codebase:

- package names
- class names
- method names
- endpoint paths
- request/response DTO names
- mapper names
- table names
- config keys
- test class names
- migration file names

Avoid vague wording such as:

- "update the service"
- "add a mapper"
- "configure security"
- "handle errors properly"

Prefer concrete wording such as:

- `AuthService.login()` calls `AuthenticationManager.authenticate(...)`
- `CustomUserDetailsService` loads users through `UserMapper.selectByUsername(...)`
- `SecurityConfig` maps `/api/admin/users/**` to roles with `USER_MANAGE` authority
- `JwtAuthenticationEntryPoint` returns 401 responses
- `JwtAccessDeniedHandler` returns 403 responses

## Documentation Style

Write in clear Korean unless an existing document uses English consistently.

Use English for code identifiers, table names, endpoint paths, config keys, and file names.

Prefer this structure for technical docs:

1. Goal
2. Current implementation
3. Request or execution flow
4. Important classes/files
5. Database/configuration impact
6. Tests
7. Debugging checklist
8. Design tradeoffs
9. Related documents
10. Learning path

Use Mermaid diagrams when they make flow easier to understand, especially for:

- request flow
- authentication flow
- transaction flow
- database relationship
- async/event flow
- deployment flow

Do not create huge theory-only documents. Tie every explanation back to this repository.

## Required Docs Impact Check

Every documentation-related task must end with:

```text
## Docs impact
- Existing docs modified:
- New docs added:
- Docs merged instead of added:
- Stale docs removed or updated:
- Index/README/cross-links updated:
- Code/tests/config referenced by this doc:
```

## Learning-First Requirements

When documenting a feature, include a learner reading path:

```text
## Learning path
1. First read:
2. Then inspect:
3. Then run:
4. Then debug:
5. Key concept to understand:
```

For Spring Boot features, explain both:

- how this project implements it,
- what a junior Spring Boot developer should know about the concept.

Do not hide design reasoning. If the implementation is "good code", explain why it is good. If it avoids a common legacy problem, describe the legacy smell and how this project avoids it.

## Architecture Decision Notes

When a task involves a meaningful design decision, document the decision using this lightweight format:

```md
## Decision: <title>

### Context
What problem are we solving?

### Options considered
1. Option A
2. Option B
3. Option C

### Decision
What did we choose?

### Why
Why is this appropriate for this project?

### Tradeoffs
What did we give up?

### Future revisit
When should this be reconsidered?
```

Use this for decisions involving:

- authentication/session/JWT
- database schema
- transaction boundaries
- package structure
- error response format
- API versioning
- caching
- async processing
- file upload/storage
- external API integration
- deployment/runtime configuration

## Security Documentation Requirements

For security/auth changes, docs must cover the actual flow, not only configuration snippets.

Include:

- Spring Security filter chain flow
- login flow
- `AuthenticationManager` / `AuthenticationProvider` flow
- `UserDetailsService` and MyBatis lookup flow
- `PasswordEncoder` usage
- why password hashing is not implemented with AOP
- JWT access token creation and validation
- refresh token storage, rotation, and revocation
- logout behavior
- access token denylist or token version strategy
- 401 vs 403 behavior
- CSRF decision
- CORS decision if relevant
- `@WithMockUser` tests vs real JWT tests
- debugging checklist

Security docs must distinguish:

- authentication failure -> 401
- authorization failure -> 403
- validation failure -> 400
- business rule conflict -> 409, if used by the project

## Database Documentation Requirements

For DB changes, document:

- table purpose
- column purpose
- primary keys
- foreign keys
- unique constraints
- indexes
- nullable vs non-nullable decisions
- lifecycle of important rows
- migration file location
- mapper files that read/write the table
- services that own writes
- tests that verify behavior

Use `snake_case` for DB identifiers unless the existing project clearly uses another convention.

## Persistence Documentation Rule

This project documents persistence as MyBatis-only.

When documenting DB features:

- Do not describe JPA/Hibernate as an accepted implementation path.
- Treat Flyway migration files as the schema source of truth.
- Treat MyBatis mapper SQL as the data access source of truth.
- If old JPA/Hibernate remnants exist, mark them as migration debt or cleanup targets.
- Explain table design, mapper SQL, service transaction boundaries, and tests together.
- Do not write docs that imply `ddl-auto=update` is acceptable for this project.

## API Documentation Requirements

For API changes, document:

- endpoint path
- HTTP method
- authentication requirement
- required authority/role
- request body
- response body
- error responses
- validation rules
- example request
- example response
- related controller/service/test files

## External API Documentation Requirements

External API source specs are preserved under `/docs/api/external-api/specs/`. Do not create a new external API document without linking it from `/docs/api/external-api/README.md` or `/docs/api/external-api/INDEX.md`.

For external API docs:

- Keep upper-level docs focused on index, mapping, call order, storage/cache policy, field mapping, error handling, and implementation backlog.
- Preserve detailed source specs instead of pasting every operation into overview docs.
- When an external API doc changes, update `INDEX.md`, `API_DOMAIN_MAP.md`, and `FIELD_MAPPING_DICTIONARY.md` if the API adds or changes domain-relevant fields.
- If the API affects address, legal-dong code, `LAWD_CD`, `sigunguCd`, `bjdongCd`, `bun`, `ji`, PNU, or coordinates, update `ADDRESS_CODE_FLOW.md`.
- If the API changes call order or cross-API matching, update `API_CALL_STRATEGY.md` and `API_COMBINATION_MATRIX.md`.
- If the API changes DB/cache/raw-response/error-log decisions, update `DATA_STORAGE_AND_CACHE_POLICY.md`.
- Keep source field names, URLs, endpoints, enum values, and parameter casing exactly as written in the source.
- Code-like values that look numeric must still be reviewed as strings before documentation recommends numeric conversion.
- Separate source-confirmed facts from ZIP:ON implementation proposals. Mark uncertain details as `확인 필요`.
- Never write real external API keys in docs, examples, screenshots, or committed env files.

## Testing Documentation Requirements

When documenting tests, separate:

- unit tests
- slice tests
- integration tests
- security authorization tests
- real authentication/JWT tests
- database mapper tests
- end-to-end or smoke tests, if present

Do not describe a test as verifying JWT behavior if it only uses `@WithMockUser`.

## Naming Rules In Docs

Use boring, obvious, conventional names.

Prefer:

- `AuthController`
- `AuthService`
- `UserService`
- `UserMapper`
- `RefreshTokenService`
- `SecurityConfig`
- `GlobalExceptionHandler`
- `ApiErrorResponse`

Avoid unclear names unless the existing project already uses them consistently:

- `Manager`
- `Processor`
- `Handler`
- `Helper`
- `Common`
- `Util`
- `Data`
- `Info`

If a vague name exists in the codebase and is touched by the task, document whether it should be renamed now or later.

## Cross-Linking Rules

Every new document must link to:

- the parent overview/index document,
- related feature docs,
- related DB docs if schema is involved,
- related test docs if testing strategy is involved.

Every parent overview/index document must link back to the new document.

## Staleness Control

When code changes behavior, update only the docs selected by `/docs/_index.md` and `/docs/_doc-routing.md` in the same task.

When docs and code disagree, treat code/tests/config as the immediate source of truth, then update docs to match.

If a document describes a future plan rather than current behavior, mark it clearly:

```md
> Status: Proposed
```

or

```md
> Status: Implemented
```

or

```md
> Status: Deprecated
```

For newly added durable docs, prefer front matter that declares the synchronization level:

```yaml
---
purpose: implementation-rule
status: active
code_sync_required: true
related_code:
  - backend/src/main/java/com/zipon/controller/RentRiskDiagnosisController.java
read_when:
  - 해당 영역 코드를 수정할 때
update_when:
  - 관련 DTO, API 응답, DB 스키마, 화면 표시 로직이 바뀔 때
---
```

Learning docs should make their lower sync requirement explicit:

```yaml
---
purpose: learning
status: active
code_sync_required: false
related_area: spring, mvc
do_not_use_as:
  - 현재 구현 명세
  - 테스트 기준
---
```

## Do Not

- Do not add unlinked markdown files.
- Do not dump generic blog-style Spring theory.
- Do not duplicate the same explanation across many files.
- Do not document behavior that is not implemented unless marked as proposed.
- Do not invent package names, commands, tables, or endpoints.
- Do not leave TODOs without an owner, reason, and next step.
