---
title: RISK_TEMPLATE_SPEC
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-30T05:00:06+09:00
purpose: risk-template-current-reference
status: active
code_sync_required: true
related_area: risk-scoring, template, rent-risk-diagnosis
related_code: 
read_when: 
update_when: 
  - backend/src/main/java/com/zipon/risk/ai/RiskTemplateResolver.java
  - backend/src/main/java/com/zipon/risk/ai/RiskAssessmentTemplate.java
  - backend/src/main/java/com/zipon/risk/ai/RiskCriterionDefinition.java
  - backend/src/test/java/com/zipon/risk/ai/RiskTemplateResolverTest.java
  - LEASE_RENT_RISK criterion, weight, prompt/schema version을 수정할 때
  - RiskTemplateResolver의 criterion 순서, weight, core missing-data rule, schemaVersion이 바뀔 때
---

# 위험 산정 템플릿 명세

> Status: Implemented

## 템플릿

현재 구현된 정확 주소 위험진단 템플릿은 `LEASE_RENT_RISK` 하나다. 이름은 기존 전세·월세 위험진단 흐름과 호환을 유지하지만, criterion set은 `zipon-risk-criterion-result-v3`부터 정확 주소 진단에서 실제로 조회한 주소, 건축물대장, 실거래가, 공시가격, 직접 확인 항목을 중심으로 12개 항목을 산정한다. 관심 부동산 상세의 시장 맥락 보조 판단은 `FavoriteService.buildAiAssessment(...)`가 별도 응답으로 만든다.

```text
templateCode: LEASE_RENT_RISK
templateName: 정확 주소 기반 계약 전 위험진단
promptVersion: LEASE_RISK_ADDRESS_SCORING_V3
schemaVersion: zipon-risk-criterion-result-v3
```

## 고정 criterion

| 순서 | code | weight | 핵심 의미 | 핵심 데이터 부족 시 등급 보류 |
| --- | --- | ---: | --- | --- |
| 1 | `PROPERTY_IDENTITY_RISK` | 0.16 | 주소 정제와 공부상 물건 정체 판별 | 예 |
| 2 | `DEPOSIT_TO_VALUE_RISK` | 0.17 | 보증금 대비 매매·공시가격 보조 기준 | 아니오 |
| 3 | `MARKET_PRICE_COMPARISON_RISK` | 0.14 | 주변 전월세 거래와 입력 금액 비교 | 아니오 |
| 4 | `SALE_TRANSACTION_SUPPORT_RISK` | 0.11 | 매매 실거래가 근거와 거래 부족 한계 | 아니오 |
| 5 | `PUBLIC_PRICE_SUPPORT_RISK` | 0.10 | 공시가격 보조 근거와 시세 오해 방지 | 아니오 |
| 6 | `BUILDING_LEGAL_USE_RISK` | 0.14 | 건축물대장 주용도와 위반건축물 확인 필요성 | 아니오 |
| 7 | `BUILDING_AGE_CONDITION_RISK` | 0.10 | 사용승인일 기반 노후도와 현장 하자 확인 | 아니오 |
| 8 | `MULTI_HOUSEHOLD_SENIOR_TENANT_RISK` | 0.00 | 다가구·단독 계열 선순위 임차인 보증금 확인 | 아니오 |
| 9 | `REGISTRY_RIGHTS_RISK` | 0.00 | 등기부등본 권리관계 직접 확인 | 아니오 |
| 10 | `GUARANTEE_INSURANCE_RISK` | 0.00 | 보증보험 가입 가능 여부 직접 확인 | 아니오 |
| 11 | `MONTHLY_COST_BURDEN_RISK` | 0.04 | 월세와 관리비 월 고정 주거비 부담 | 아니오 |
| 12 | `CONTRACT_CHECKLIST_RISK` | 0.00 | 계약 전 확인 부담과 다음 행동 범위 | 아니오 |

weight 합계는 `1.00`이다. `RiskTemplateResolverTest.criterionWeightsAddUpToOne()`이 이 조건을 검증한다. `MULTI_HOUSEHOLD_SENIOR_TENANT_RISK`, `REGISTRY_RIGHTS_RISK`, `GUARANTEE_INSURANCE_RISK`, `CONTRACT_CHECKLIST_RISK`는 계약 전 직접 확인 행동으로 분리하므로 현재 weight가 `0.00`이며, `RiskTemplateResolverTest.directConfirmationCriteriaAreExcludedFromScoreWeights()`가 이 조건을 검증한다.

## 항목 응답 필드

각 criterion은 `RentRiskDiagnosisResponse.riskAssessment.criteria[]`에 아래 필드로 내려간다.

```json
{
  "criterionCode": "PROPERTY_IDENTITY_RISK",
  "criterionName": "물건 정체 판별 위험",
  "status": "PARTIAL",
  "riskScore": 55,
  "confidence": 0.45,
  "weight": 0.12,
  "weightedScore": 6.60,
  "riskLevel": "높음",
  "evidence": [],
  "missingData": [],
  "reason": "",
  "userVisibleExplanation": "",
  "recommendedActions": [],
  "scoringMode": "RULE_BASED_FALLBACK"
}
```

## 최종 집계

```text
baseScore = sum(riskScore * weight)
uncertaintyPenalty = DATA_MISSING / NEEDS_USER_DOCUMENT / AI_UNAVAILABLE / CALCULATION_FAILED penalty
totalRiskScore = min(100, baseScore + uncertaintyPenalty)
```

핵심 criterion이 `DATA_MISSING`, `NEEDS_USER_DOCUMENT`, `AI_UNAVAILABLE`, `CALCULATION_FAILED`이면 숫자 점수와 무관하게 `NEED_MORE_INFORMATION`을 우선 표시할 수 있다. v3에서 핵심 criterion은 `PROPERTY_IDENTITY_RISK`다. 주소가 공공데이터 조회 기준으로 정제되지 않거나 물건 정체 판별이 핵심 단계에서 막히면 정확 주소 진단 자체가 흔들리므로 최종 등급을 보류한다. 반대로 등기부등본, 선순위 임차인, 보증보험처럼 원래 사용자 문서 확인이 필요한 비핵심 항목은 `NEEDS_USER_DOCUMENT`로 표시하되 그 사실만으로 최종 등급을 무조건 `NEED_MORE_INFORMATION`으로 고정하지 않는다.

AI structured output은 이 규칙을 더 엄격하게 따른다. `RiskScoringResponseValidator`는 `AVAILABLE` 또는 `PARTIAL`일 때만 `riskScore` 숫자를 허용하고, `DATA_MISSING`, `NEEDS_USER_DOCUMENT`, `NOT_APPLICABLE`, `AI_UNAVAILABLE`, `CALCULATION_FAILED` 상태에서는 `riskScore=null`만 허용한다. 부족한 자료를 숫자 점수로 채우지 않기 위한 기준이다.

등기부등본, 선순위 임차인, 보증보험, 실제 하자 같은 법적·물리적 확인 항목은 `riskAssessment.criteria[]`, core 위험진단 response, checklist에서 직접 확인 대상으로 다룬다. 데이터 부족은 안전 신호가 아니지만, 공공데이터 일부가 없는 상황을 모두 D등급으로 뭉개지 않고 항목별 `DATA_MISSING`, `NEEDS_USER_DOCUMENT`, `PARTIAL` 상태로 분리한다.

## Evidence packet v2

`RiskEvidencePacket.packetVersion`은 `zipon-ai-evidence-packet-v2`다. v2는 기존 curated evidence, missingData, limitations, requiredUserActions에 더해 `marketSignals[]`를 포함한다.

정확 주소 위험진단의 v3 템플릿은 주소·건축물·거래·공시가격 evidence를 우선 사용한다. `marketSignals[]`는 지역·유형 과거 지표나 관심 부동산 상세의 시장 맥락 보조 판단을 위해 유지되는 선택 입력이며, 정확 주소 진단에서 signal이 없다는 이유만으로 최종 등급을 보류하지 않는다. `marketSignals[]`를 사용할 때도 원천 R-ONE row가 아니라 아래처럼 정제된 필드만 사용한다.

```json
{
  "signalCode": "ROW_HOUSE_JEONSE_PRICE_INDEX",
  "title": "연립/다세대 전세가격지수",
  "purposeCode": "JEONSE",
  "tradeKind": "RENT",
  "regionName": "관악구",
  "latestPeriodLabel": "2026.05",
  "latestValueText": "102.4지수",
  "direction": "UP",
  "change12PeriodValue": 4.2,
  "volatility12Periods": 1.8,
  "freshnessStatus": "FRESH",
  "confidenceLevel": "MEDIUM",
  "dataQualityStatus": "NORMAL",
  "limitation": "시장지표는 개별 주소 권리관계를 확정하지 않습니다."
}
```

원천 필드명 `DTA_VAL`, `CLS_ID`, `GRP_ID`, `STATBL_ID`나 구현 테이블명 `market_indicator_observation`은 prompt 입력 또는 사용자 응답에 직접 노출하지 않는다.
