---
title: README
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-30T05:00:06+09:00
purpose: risk-scoring-reference-index
status: active
code_sync_required: true
related_area: risk-scoring, openai, fallback
related_code: 
read_when: 
update_when: 
  - backend/src/main/java/com/zipon/risk/ai
  - 구조화 위험도 산정 reference 문서를 찾을 때
  - 위험 산정 template, prompt, enum, scoring engine 문서가 추가되거나 제거될 때
---

# CODEX Risk Scoring References

> Status: Implemented

이 폴더는 `LEASE_RENT_RISK` 구조화 위험도 산정 엔진의 구현 기준을 모은다. 자유 대화형 챗봇 기준이 아니라, 백엔드가 정규화한 공공데이터와 `RiskEvidencePacket`의 curated evidence를 고정 평가 항목에 넣고 항목별 점수만 AI 또는 fallback으로 산정한 뒤 최종 등급은 백엔드가 계산하는 구조다.

## Documents

| 문서 | 역할 |
| --- | --- |
| [AI_RISK_SCORING_ENGINE.md](/docs/CODEX/reference/AI_RISK_SCORING_ENGINE.md) | 전체 흐름, 클래스, 저장, fallback, 테스트 전략 |
| [RISK_TEMPLATE_SPEC.md](/docs/CODEX/reference/RISK_TEMPLATE_SPEC.md) | `LEASE_RENT_RISK` 고정 criterion 12개 |
| [OPENAI_RISK_SCORING_PROMPT.md](/docs/CODEX/reference/OPENAI_RISK_SCORING_PROMPT.md) | 프롬프트 버전, 금지 규칙, JSON Schema |
| [RISK_SCORE_ENUMS.md](/docs/CODEX/reference/RISK_SCORE_ENUMS.md) | status, grade, verdict, scoring mode enum |
