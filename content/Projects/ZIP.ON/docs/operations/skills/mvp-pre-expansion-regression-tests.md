---
title: mvp-pre-expansion-regression-tests
created: 2026-07-01T00:06:00+09:00
updated: 2026-07-01T00:06:00+09:00
purpose: operations-skill
status: active
code_sync_required: true
related_area: mvp-regression, test, product-scope
related_code: 
read_when: 
update_when: 
  - backend/src/test/java/com/zipon/MvpPreExpansionApiRegressionTest.java
  - backend/src/test/java/com/zipon/MvpPreExpansionFeatureRegressionTest.java
  - backend/src/test/java/com/zipon/OpenApiDocumentationIntegrationTest.java
  - docs/product/MVP_SCOPE.md
  - MVP 확장 전 회귀 테스트를 작성하거나 갱신할 때
  - MVP API 목록, OpenAPI path, 전세/월세 first product rule이 바뀔 때
---

# MVP Pre-Expansion Regression Test Runbook

테스트 코드는 `@DisplayName`과 Swagger-like 주석을 포함해 테스트 파일만 봐도 무엇을 검증하는지 보여야 한다.

> Status: Implemented

## Trigger Signals

Use this skill when the user asks any of these:

- "전체 재점검"
- "확장가능성 이전까지 잘 되었는지 테스트"
- "api단위/기능단위 테스트코드 작성"
- "테스트 코드만 보고 무슨 테스트인지 알 수 있게"
- "방금 한 테스트코드 업데이트 작업 다시 해줘"
- "MVP 회귀 테스트 보강"

Also use it when changing these files or concepts:

- `DiagnosisPurpose`
- `RentRiskDiagnosisController`
- `RentRiskDiagnosisResponse`
- `LeaseRiskDiagnosisPropertyIdentityService`
- `LeaseRiskDiagnosisNextActionService`
- `OpenApiDocumentationIntegrationTest`
- admin/community/auth MVP operation endpoints

## Required Scan

Run first:

```bash
git status --short --branch
rg --files backend/src/test backend/src/main/java | rg "DiagnosisPurpose|RentRiskDiagnosis|OpenApi|Community|Admin|Auth|Ai"
```

If PowerShell Korean text is broken, apply:

```powershell
$OutputEncoding = [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Get-Content -Encoding UTF8 <path>
```

## Same-Issue Criteria

Treat the task as this same runbook when at least two match:

- The user asks to recheck MVP promises before expansion.
- The requested output is backend test code, not feature implementation.
- The test must cover API-level and feature-level behavior.
- The test should be self-documenting via `@DisplayName`, comments, or Swagger-like wording.
- The scope includes "전세·월세 first", "no expansion shells", "AI is assistant only", or "admin/community are MVP".

## Branch Steps

Use a focused branch:

```bash
git switch dev
git switch -c codex/mvp-regression-tests
```

If `codex/mvp-regression-tests` already exists, choose a dated/focused suffix:

```bash
git switch -c codex/mvp-regression-tests-<short-topic>
```

Do not delete the branch after merging to local `dev`.

## Test Files To Add Or Update

Preferred files:

```text
backend/src/test/java/com/zipon/MvpPreExpansionApiRegressionTest.java
backend/src/test/java/com/zipon/MvpPreExpansionFeatureRegressionTest.java
backend/src/test/java/com/zipon/OpenApiDocumentationIntegrationTest.java
```

If the first two already exist, update them instead of creating a duplicate.

## API Regression Test Checklist

Create or update `MvpPreExpansionApiRegressionTest`.

Required shape:

```java
/**
 * MVP pre-expansion API regression spec.
 *
 * <p>Read this class like a compact Swagger/checklist for the APIs that must stay correct before
 * ZIP:ON expands beyond 전세·월세. Each test states the user-facing promise first, then verifies the
 * exact HTTP contract with MockMvc.</p>
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("MVP pre-expansion API regression")
class MvpPreExpansionApiRegressionTest {
}
```

Required tests:

- `GET /api/diagnosis-purposes`
  - `LEASE_JEONSE` and `LEASE_MONTHLY_RENT` have `mvpSupported=true`.
  - They expose `/api/rent-risk-diagnoses`.
  - expansion purposes have `mvpSupported=false`.
  - expansion purposes have `currentEndpoint=null`.
  - expansion purposes keep non-empty `directConfirmationRequiredItems`.

- `POST /api/rent-risk-diagnoses`
  - creates diagnosis for one-room jeonse payload.
  - returns normalized address and legal dong code.
  - returns property candidates such as `다가구주택`.
  - keeps `registry-document` unavailable/direct-confirmation.
  - includes checklist and next actions.
  - does not contain final approval phrases like `계약해도 됩니다`.

- Anonymous vs authenticated follow-up
  - anonymous diagnosis creation is public.
  - personal history requires login.
  - registry confirmation requires login.

- Admin operation surfaces
  - normal user receives 403 for `/api/admin/users`.
  - normal user receives 403 for `/api/admin/rent-risk-diagnoses`.
  - normal user receives 403 for `/api/admin/external-api-call-logs`.
  - admin receives 200 for the same domain APIs.
  - Do not create or test any arbitrary SQL endpoint.

Each test must start with a short comment block:

```java
// Swagger-like contract:
// - ...
// - ...
```

## Feature Regression Test Checklist

Create or update `MvpPreExpansionFeatureRegressionTest`.

Required shape:

```java
/**
 * MVP pre-expansion feature regression spec.
 *
 * <p>These tests do not hit HTTP. They lock the product rules that sit under the API:
 * 전세·월세 first, property identity before price confidence, direct-confirmation boundaries,
 */
@DisplayName("MVP pre-expansion feature regression")
class MvpPreExpansionFeatureRegressionTest {
}
```

Required tests:

- Purpose catalog feature rule
  - executable purposes are exactly `LEASE_JEONSE`, `LEASE_MONTHLY_RENT`.
  - roadmap-only purposes have no endpoint and no `leaseContractPurpose`.

- One-room jeonse identity rule
  - `LeaseRiskPropertyTypeInterpreter.interpret("원룸", ...)` does not become an official type.
  - `LeaseRiskDiagnosisPropertyIdentityService` returns candidate types.
  - next actions include senior tenant deposit confirmation.
  - direct-confirmation boundaries remain visible.

  - Include current MVP phrases and future expansion phrases:
    - `안전합니다`
    - `계약해도 됩니다`
    - `창업 가능합니다`
    - `개발 가능합니다`

Each test must start with:

```java
// Feature spec:
// - ...
// - ...
```

## OpenAPI Documentation Test Checklist

Update `OpenApiDocumentationIntegrationTest`.

Add `@DisplayName` and comments so the test is readable as API documentation regression.

Make sure `/v3/api-docs` contains at least:

```text
/api/diagnosis-purposes
/api/rent-risk-diagnoses
/api/rent-risk-diagnoses/{diagnosisId}
/api/rent-risk-diagnoses/{diagnosisId}/registry-document-confirmation
/api/admin/external-api-call-logs
```

Keep existing checks for auth, community, admin, environment, search, map, favorite APIs unless the actual controllers changed.

## Verification Commands

Use Java 21+ explicitly when local PATH points to Java 8:

```powershell
$env:JAVA_HOME='C:\Program Files\Zulu\zulu-21'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
```

Focused verification:

```bash
cd backend
./mvnw '-Dtest=MvpPreExpansionApiRegressionTest,MvpPreExpansionFeatureRegressionTest,OpenApiDocumentationIntegrationTest' test
```

Existing MVP slice regression:

```bash
cd backend
./mvnw '-Dtest=RentRiskDiagnosisIntegrationTest,DiagnosisPurposeCatalogIntegrationTest,RentRiskDiagnosisHistoryIntegrationTest' test
```

MVP supporting surfaces:

```bash
cd backend
./mvnw '-Dtest=AuthIntegrationTest,CommunityIntegrationTest,AdminUserIntegrationTest' test
```


```bash
cd backend
```

Frontend smoke when user scenario/flow was part of the request:

```bash
cd frontend
npm run build
```

Always run:

```bash
git diff --check
git status --short --branch
```

## Expected Commit

Use one test-focused commit:

```bash
git add backend/src/test/java/com/zipon/MvpPreExpansionApiRegressionTest.java \
        backend/src/test/java/com/zipon/MvpPreExpansionFeatureRegressionTest.java \
        backend/src/test/java/com/zipon/OpenApiDocumentationIntegrationTest.java
git commit -m "test: add MVP pre-expansion regression coverage"
```

Then merge locally:

```bash
git switch dev
git merge --no-ff codex/mvp-regression-tests -m "Merge branch 'codex/mvp-regression-tests' into dev"
```

Do not delete the feature branch.

## Do Not

- Do not implement expansion APIs, empty controllers, empty DTOs, or placeholder screens.
- Do not add JPA/Hibernate dependencies or entities.
- Do not test real external public APIs.
- Do not assert that a property is safe, contract-ready, insurance-approved, business-viable, or development-possible.
- Do not replace existing focused tests with one giant broad test.
- Do not hide test intent behind vague method names such as `test1` or `works`.
- Do not skip `@DisplayName` and contract/spec comments for this runbook.

## Related Docs

- [Repeated Work Skills](Blog/posts/Projects/ZIP.ON/docs/operations/skills/README.md)
- [MVP rental risk diagnosis](/docs/product/MVP_SCOPE.md)
- [Risk insight report strategy](/docs/frontend/SCREEN_ANALYSIS_POLICY.md)
- [Risk signal rule dictionary](/docs/architecture/RISK_SCORING_POLICY.md)
- [API frontend connection spec](/docs/api/API_FRONTEND_CONNECTION_SPEC.md)
