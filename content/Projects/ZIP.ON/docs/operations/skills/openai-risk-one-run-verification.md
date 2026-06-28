---
title: openai-risk-one-run-verification
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-29T05:00:06+09:00
purpose: operations-skill
status: active
code_sync_required: true
related_area: openai, risk-scoring, verification, secret-handling
related_code: 
read_when: 
update_when: 
  - backend/src/main/java/com/zipon/service/RiskAssessmentService.java
  - backend/src/main/java/com/zipon/external/openai/OpenAiRiskScoringClient.java
  - backend/src/test/java/com/zipon/external/openai/HttpOpenAiRiskScoringClientTest.java
  - docs/CODEX/reference/AI_RISK_SCORING_ENGINE.md
  - OpenAI 구조화 위험산정 실제 1회 검증을 재개할 때
  - OpenAI 설정 키, scoring mode, audit log 구조, 위험산정 API 흐름이 바뀔 때
---

# OpenAI Risk One-Run Verification

OpenAI 구조화 위험산정 1회 검증을 안전하게 재개하기 위한 반복 작업 스킬이다.
채팅에 API key가 노출됐거나 `.env`에 키가 없어서 실제 검증이 막힐 때 사용한다.
목표는 정확 주소 위험진단 1건만 실행하고, `RiskAssessmentService -> OpenAiRiskScoringClient.scoreTemplate(...)` 배치 흐름으로 OpenAI HTTP 요청이 1회만 나가도록 확인한 뒤 즉시 비활성화하는 것이다.

> Status: Implemented

## Trigger Signals

- User says to run "actual AI once", "OpenAI 1회 검증", or "키 줄테니 사용".
- A key was pasted in chat, terminal, commit diff, or any non-`.env` surface.
- `.env` check shows `ENV_OPENAI_KEY_ABSENT` or `ENV_OPENAI_ENABLED_NOT_TRUE`.
- Goal requires:
  - actual diagnosis/report validation once,
  - no committed key,
  - `OPENAI_RISK_SCORING_ENABLED=false` after execution.

## Required Scan

```bash
git status --short
git branch --show-current
if [ -f .env ]; then
  if grep -q '^OPENAI_API_KEY=sk-' .env; then echo ENV_OPENAI_KEY_PRESENT; else echo ENV_OPENAI_KEY_ABSENT; fi
  if grep -q '^OPENAI_RISK_SCORING_ENABLED=true' .env; then echo ENV_OPENAI_ENABLED_TRUE; else echo ENV_OPENAI_ENABLED_NOT_TRUE; fi
else
  echo ENV_FILE_ABSENT
fi
rg -n 'sk-proj|OPENAI_API_KEY=.*sk' backend frontend docs .env.example 2>/dev/null || true
```

## Same-Issue Criteria

Treat as the same workflow when two or more match:

- task is ZIP:ON AI risk scoring validation,
- a key was given outside `.env`,
- actual OpenAI call is still unverified,
- batch 1 HTTP call structure has already been implemented,
- the current branch or recent diff contains the risk scoring batch flow.

## Fix Steps

1. Never copy a chat-pasted key into a command, code file, doc, commit message, or final answer.
2. Ask the user to place a newly rotated key in local `.env` only:

```properties
OPENAI_API_KEY=<new rotated key>
OPENAI_MODEL=gpt-4.1
OPENAI_MAX_OUTPUT_TOKENS=2400
OPENAI_RISK_SCORING_ENABLED=true
```

For a free or low usage tier, replace `gpt-4.1` with the smallest structured-output capable model shown in the project's OpenAI Platform `Limits` page. Do not assume ChatGPT Free/Plus subscription includes API billing or API free credit.

3. Confirm without printing the key:

```bash
if [ -f .env ]; then
  if grep -q '^OPENAI_API_KEY=sk-' .env; then echo ENV_OPENAI_KEY_PRESENT; else echo ENV_OPENAI_KEY_ABSENT; fi
  if grep -q '^OPENAI_RISK_SCORING_ENABLED=true' .env; then echo ENV_OPENAI_ENABLED_TRUE; else echo ENV_OPENAI_ENABLED_NOT_TRUE; fi
else
  echo ENV_FILE_ABSENT
fi
```

4. Start local infrastructure if needed:

```bash
docker compose up -d mysql
```

5. Start backend with the local profile in a dedicated terminal:

```bash
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

6. Execute exactly one public diagnosis request from another terminal:

```bash
curl -sS -X POST 'http://localhost:8082/api/rent-risk-diagnoses' \
  -H 'Content-Type: application/json' \
  -d '{
    "address": "서울시 관악구 신림동 1422-5",
    "contractPurpose": "JEONSE",
    "depositAmountManwon": 12000,
    "monthlyRentAmountManwon": 0,
    "maintenanceFeeAmountManwon": 8,
    "exclusiveAreaSquareMeter": 29.35,
    "floorNumber": 3,
    "knownPropertyType": "원룸",
    "listingDescription": "3층 원룸"
  }'
```

7. Immediately disable OpenAI in `.env` after the single request:

```properties
OPENAI_RISK_SCORING_ENABLED=false
```

8. Stop the backend process after verification.

## Verification

Expected API response signals:

- `data.diagnosisId` exists.
- `data.riskAssessment.criteria` has 12 items.
- `data.riskAssessment.scoringMode` is `OPENAI_STRUCTURED_OUTPUT` when the OpenAI call succeeds.
- If OpenAI rejects/validates poorly, `scoringMode` can be `HYBRID_FALLBACK`; record the error and do not retry unless the user explicitly approves another paid call.

Database check for the returned diagnosis ID:

```bash
docker compose exec mysql mysql -uzipon_user -pzipon_password zipon -e "
SELECT diagnosis_history_id, COUNT(*) AS audit_count,
       MIN(scoring_mode) AS min_mode,
       MAX(scoring_mode) AS max_mode
FROM ai_risk_scoring_logs
WHERE diagnosis_history_id = <diagnosisId>
GROUP BY diagnosis_history_id;
"
```

Expected DB signals:

- `audit_count = 12` because each criterion gets one audit row.
- All rows should share one `raw_response_json` body when batch scoring succeeds.
- The code-level 1 HTTP request invariant is covered by `HttpOpenAiRiskScoringClientTest`.

Final safety checks:

```bash
if grep -q '^OPENAI_RISK_SCORING_ENABLED=true' .env; then echo MUST_DISABLE_OPENAI; else echo OPENAI_DISABLED_OR_NOT_TRUE; fi
rg -n 'sk-proj|OPENAI_API_KEY=.*sk' backend frontend docs .env.example 2>/dev/null || true
git status --short
```

## Do Not

- Do not use a key pasted in chat as if it were still private.
- Do not put the key in shell commands such as `OPENAI_API_KEY=... ./mvnw ...`; shell history can keep it.
- Do not print `.env` or run `cat .env`.
- Do not commit `.env`, screenshots containing keys, terminal logs containing keys, or API raw responses containing sensitive metadata.
- Do not retry the paid OpenAI request after a validation failure without explicit user approval.
- Do not call `GET /api/favorites/{favoriteId}/analysis` expecting a new OpenAI call; favorite reports reuse saved `riskAssessment`.

## Related Docs

- [AI 위험도 산정 엔진](/docs/CODEX/reference/AI_RISK_SCORING_ENGINE.md)
- [API 호출 전략](/docs/api/API_CALL_FLOW.md)
- [Frontend connection spec](/docs/api/API_FRONTEND_CONNECTION_SPEC.md)
- [Operations index](/docs/operations/README.md)
