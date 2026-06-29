---
title: OPENAI_RISK_SCORING_PROMPT
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-30T05:00:06+09:00
---

# OpenAI 위험 산정 프롬프트

> Status: Implemented

## 버전

```text
RiskPromptVersion.LEASE_RISK_ADDRESS_SCORING_V3
```

프롬프트는 자유 문자열 상수가 아니라 `RiskPromptBuilder`가 `RiskPromptRequest`를 받아 생성한다. 동일 입력이면 동일 prompt가 만들어져야 하며, `RiskPromptBuilderTest.buildsDeterministicPromptForSameInput()`이 이를 검증한다.

## 역할

AI는 항목별 점수 산정 보조자다.

- 실제 HTTP 구현은 12개 criterion을 한 번의 batch 응답으로 받지만, 각 criterion은 독립된 항목별 판단으로만 사용한다.
- 최종 총점, 최종 등급, 화면 판정 문구를 만들지 않는다.
- 입력 데이터에 없는 사실을 만들지 않는다.
- 사용자에게 보일 설명은 짧고 직접적인 문장으로 작성한다.

## 금지 규칙

프롬프트에는 아래 금지 규칙이 들어간다.

```text
- 입력 데이터에 없는 사실을 추정하지 마세요.
- 등기부등본, 선순위 임차인, 실제 하자, 보증보험 가능 여부를 확정하지 마세요.
- API 데이터만으로 법적 안전성을 확정하지 마세요.
- 데이터가 부족하면 DATA_MISSING 또는 NEEDS_USER_DOCUMENT를 사용하세요.
- 출력은 JSON 하나만 반환하고 설명 텍스트를 앞뒤에 붙이지 마세요.
```

## 입력 데이터

AI에 전달되는 입력은 `NormalizedRiskInput`이다. 이 객체는 `RentRiskDiagnosisRequest`와 core `RentRiskDiagnosisResponse`에서 만들고, 내부에 `RiskEvidencePacket`을 포함한다. v3 정확 주소 진단은 주소 정제, 건축물대장, 전월세·매매 실거래가, 공시가격, checklist evidence를 우선 사용한다. `RiskEvidencePacket.marketSignals[]`는 지역·유형 과거 지표나 관심 부동산 상세의 시장 맥락 보조 판단을 위한 선택 입력이며, 정확 주소 진단에서 비어 있어도 그 자체로 최종 등급을 보류하지 않는다. AI는 먼저 `evidencePacket`의 curated evidence, missingData, marketSignals, requiredUserActions를 보고, packet에 없는 사실은 만들지 않는다.

포함:

- 계약 목적
- 보증금, 월세, 관리비
- 면적, 층수
- 주소 정제 상태와 법정동코드 존재 여부
- 물건 정체 후보
- 건축물대장, 전월세 실거래가, 매매 실거래가, 공시가격, 등기부등본 상태
- 기존 위험 요약 문장과 체크리스트 제목
- `RiskEvidencePacket`의 evidence code, source, field, value, unit, confidence, dataQuality
- `RiskEvidencePacket`의 missingData, limitation, requiredUserActions
- 선택 입력인 `RiskEvidencePacket.marketSignals[]`의 signalCode, title, purposeCode, tradeKind, regionName, latestPeriodLabel, latestValueText, direction, change12PeriodValue, volatility12Periods, freshnessStatus, confidenceLevel, dataQualityStatus, limitation

제외:

- API key
- 전체 prompt 원문 저장
- 전체 `RiskEvidencePacket` 전문의 감사 로그 저장
- 등기부등본/계약서 원문
- 사용자가 입력한 원문 주소와 매물 설명
- VWorld 좌표 저장값
- R-ONE 원천 필드명 `DTA_VAL`, `CLS_ID`, `GRP_ID`, `STATBL_ID`
- `market_indicator_observation` 같은 구현 테이블명

## v3 criterion scope

현재 정확 주소 위험진단 criterion은 아래 12개다.

```text
PROPERTY_IDENTITY_RISK
DEPOSIT_TO_VALUE_RISK
MARKET_PRICE_COMPARISON_RISK
SALE_TRANSACTION_SUPPORT_RISK
PUBLIC_PRICE_SUPPORT_RISK
BUILDING_LEGAL_USE_RISK
BUILDING_AGE_CONDITION_RISK
MULTI_HOUSEHOLD_SENIOR_TENANT_RISK
REGISTRY_RIGHTS_RISK
GUARANTEE_INSURANCE_RISK
MONTHLY_COST_BURDEN_RISK
CONTRACT_CHECKLIST_RISK
```

OpenAI와 fallback은 같은 정확 주소 evidence packet을 사용한다. `PROPERTY_IDENTITY_RISK`는 주소 정제와 공부상 물건 정체가 모두 흔들릴 때만 핵심 누락으로 최종 보류를 일으킬 수 있다. 등기부등본, 선순위 임차인, 보증보험처럼 공공 API로 확정할 수 없는 항목은 `NEEDS_USER_DOCUMENT`로 표시하지만, `RiskTemplateResolver`에서 weight가 `0.00`인 직접 확인 항목이므로 총점과 `RiskScoreAggregator.calculateUncertaintyPenalty(...)`에는 반영하지 않는다. 그 사실만으로 모든 주소를 `NEED_MORE_INFORMATION`으로 고정하지 않기 위해서다. 관심 부동산 리포트의 시장 맥락 보조 criterion은 별도 v2 응답으로 유지한다.

## 출력 JSON Schema

`RiskScoringJsonSchema.schemaJson()`가 OpenAI structured output schema와 validator 기준을 함께 제공한다.

필수 필드:

```text
templateCode
criterionCode
promptVersion
status
riskScore
confidence
evidence
missingData
reason
userVisibleExplanation
recommendedActions
```

`RiskScoringResponseValidator`는 아래를 거부한다.

- JSON object가 아닌 응답
- 앞뒤 설명 텍스트가 붙은 응답
- 알 수 없는 `status`
- `riskScore`가 0 미만 또는 100 초과
- `riskScore`가 문자열인 응답
- `AVAILABLE`, `PARTIAL`인데 `riskScore=null`
- `DATA_MISSING`, `NEEDS_USER_DOCUMENT`, `NOT_APPLICABLE`, `AI_UNAVAILABLE`, `CALCULATION_FAILED`인데 `riskScore`가 숫자인 응답
- 필수 필드 누락
- 허용되지 않은 추가 필드가 들어온 응답

## OpenAI API 설정

`HttpOpenAiRiskScoringClient`는 OpenAI Responses API에 아래 성격의 요청을 보낸다.

```text
store=false
temperature=0
text.format.type=json_schema
text.format.strict=true
```

`OPENAI_RISK_SCORING_ENABLED=false`이면 호출하지 않고 fallback만 사용한다.

Structured Outputs schema에도 `additionalProperties=false`를 넣지만, 백엔드 `RiskScoringResponseValidator`가 같은 제한을 다시 적용한다. 외부 모델 응답은 항상 신뢰 경계 밖에 있기 때문에, schema 통과 여부와 별개로 백엔드가 직접 필드와 상태별 점수 규칙을 검증해야 한다.

## Related

- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [OpenAI Responses API reference](https://platform.openai.com/docs/api-reference/responses)
