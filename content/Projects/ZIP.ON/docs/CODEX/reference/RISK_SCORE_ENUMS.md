---
title: RISK_SCORE_ENUMS
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-30T05:00:06+09:00
purpose: risk-scoring-current-reference
status: active
code_sync_required: true
related_area: risk-scoring, enum
related_code: 
read_when: 
update_when: 
  - backend/src/main/java/com/zipon/risk/ai/RiskCriterionStatus.java
  - backend/src/main/java/com/zipon/risk/ai/RiskGrade.java
  - backend/src/main/java/com/zipon/risk/ai/RiskDisplayVerdict.java
  - backend/src/main/java/com/zipon/risk/ai/RiskScoringMode.java
  - backend/src/main/java/com/zipon/risk/ai/RiskGradeCalculator.java
  - 위험도 산정 enum 또는 grade/verdict 기준을 수정할 때
  - 관련 enum 값, grade threshold, display verdict mapping이 바뀔 때
---

# 위험 점수 enum

> Status: Implemented

## RiskCriterionStatus

| enum | 의미 | riskScore |
| --- | --- | --- |
| `AVAILABLE` | 필요한 근거가 있어 점수 산정 가능 | 정수 필요 |
| `PARTIAL` | 일부 근거만 있어 제한적으로 산정 | 정수 필요 |
| `DATA_MISSING` | 공공데이터 또는 비교 근거 부족 | `null` 가능 |
| `NOT_APPLICABLE` | 현재 계약 목적에는 직접 적용되지 않음 | `null` 가능 |
| `NEEDS_USER_DOCUMENT` | 등기부등본, 선순위 임차인 등 사용자 문서/직접 확인 필요 | `null` 가능 |
| `AI_UNAVAILABLE` | AI 응답을 사용할 수 없음 | `null` 가능 |
| `CALCULATION_FAILED` | 산정 중 검증 또는 계산 실패 | `null` 가능 |

## RiskGrade

| enum | 기준 |
| --- | --- |
| `LOW` | `0 ~ 24` |
| `MODERATE` | `25 ~ 49` |
| `HIGH` | `50 ~ 74` |
| `CRITICAL` | `75 ~ 100` |
| `NEED_MORE_INFORMATION` | 핵심 데이터 부족 우선 표시 |

`NEED_MORE_INFORMATION`은 숫자 점수보다 우선할 수 있다. 예를 들어 등기부등본 미확인, 선순위 임차인 정보 미확인, 건축물대장 핵심 근거 부족은 "낮은 점수"보다 "추가 정보 필요"가 사용자에게 더 안전하다.

## RiskDisplayVerdict

| enum | 사용자 의미 |
| --- | --- |
| `REVIEW_POSSIBLE` | 검토 가능 |
| `CHECK_REQUIRED_BEFORE_CONTRACT` | 계약 전 확인 필요 |
| `HIGH_RISK_REVIEW_REQUIRED` | 고위험 검토 필요 |
| `DO_NOT_PROCEED_WITHOUT_EXPERT_REVIEW` | 전문가 검토 전 진행 보류 |
| `INSUFFICIENT_DATA` | 데이터 부족 |

## RiskScoringMode

| enum | 의미 |
| --- | --- |
| `OPENAI_STRUCTURED_OUTPUT` | OpenAI structured output이 validator를 통과 |
| `RULE_BASED_FALLBACK` | OpenAI가 꺼져 있고 백엔드 fallback만 사용 |
| `HYBRID_FALLBACK` | OpenAI가 켜져 있었지만 일부 또는 전체 항목이 fallback |

## 점수 해석

```text
0   = 위험 거의 없음
25  = 낮은 위험
50  = 주의 필요
75  = 높은 위험
100 = 매우 높은 위험
```

점수는 위험 점수다. 높은 점수는 좋은 점수가 아니라 더 큰 주의가 필요하다는 뜻이다.
