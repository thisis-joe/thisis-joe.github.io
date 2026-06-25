---
title: RISK_SCORING_POLICY
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-26T05:00:07+09:00
---

# ZIP:ON 위험 신호 룰 사전

> Status: Current Risk Policy

## 목적

이 문서는 ZIP:ON 전세·월세 위험진단 MVP에서 사용할 위험 신호를 제품 언어와 개발 언어 사이의 중간 형식으로 정리한다.

룰 사전의 목적은 곧바로 거대한 rule engine을 만들기 위한 것이 아니다. 먼저 어떤 조건을 위험 신호로 볼지, 사용자에게 어떤 문장으로 설명할지, 무엇을 자동 판단하지 말아야 할지 합의하기 위한 기준이다.

현재 구현된 risk scoring v3는 `RiskTemplateResolver`의 `LEASE_RENT_RISK` template 안에서 정확 주소 위험진단 12개 criterion을 산정한다. 이 중 8개는 총점 산정 항목이고, 4개는 계약 전 직접 확인 항목으로 화면에 남기되 총점과 불확실성 패널티에서 제외한다. 이 계층은 `RentRiskDiagnosisService`가 이미 만든 주소 정제, 건축물대장, 실거래가, 공시가격, R-ONE 시장 signal, checklist 근거를 `NormalizedRiskInput`으로 줄여 항목별 상태와 점수로 구조화한다. 개별 주소의 권리관계, 선순위 임차인, 보증보험, 실제 하자는 자동 확정하지 않고 `NEEDS_USER_DOCUMENT` 또는 직접 확인 checklist로 분리한다.

## 적용 범위

현재 MVP의 실행 범위는 `LEASE_JEONSE`, `LEASE_MONTHLY_RENT`다. 주거용 매매, 상가, 토지, 꼬마빌딩, 문서 OCR 분석 룰은 확장 가능성으로만 남기고 지금 빈 API나 빈 화면을 만들지 않는다.

이 룰 사전은 현재 코드의 아래 흐름에 점진적으로 연결될 수 있다.

```text
RentRiskDiagnosisController
-> RentRiskDiagnosisService
-> LeaseRiskDiagnosisPropertyIdentityService
-> DepositRiskCalculator
-> BuildingRiskAnalyzer
-> LeaseRiskDiagnosisRiskSummaryService
-> LeaseRiskDiagnosisNextActionService
-> LeaseRiskDiagnosisChecklistService
-> RentRiskDiagnosisResponse
-> LeaseRiskDiagnosisResult.vue
```

관심 부동산 리포트의 시장 맥락 연결 흐름은 아래처럼 별도 경계를 탄다.

```text
GET /api/favorites/{favoriteId}/analysis
-> FavoriteService.getFavoriteAnalysis(...)
-> FavoriteMarketContextService.buildMarketContext(...)
-> MarketIndicatorContextService.findSummaries(...)
-> market_indicator_trend_summaries
-> FavoriteAnalysisResponse.marketContext
-> PropertyDetailView.vue
```

`FavoriteMarketContextService`는 R-ONE 원천 row를 사용자/AI에 직접 넘기지 않는다. `market_indicator_trend_summaries`에서 이미 정규화된 summary만 읽고, 전세·월세·주거용 매매 목적별로 `marketContext.signals[]`와 한계 문장을 만든다.

## 정확 주소 risk criterion

`RiskTemplateResolver`의 현재 `LEASE_RENT_RISK` criterion은 아래 12개다.

| code | 의미 | 자동 확정하지 않는 것 |
| --- | --- | --- |
| `PROPERTY_IDENTITY_RISK` | 주소 정제와 공부상 물건 정체 판별 | 사용자 표현만으로 유형 확정 |
| `DEPOSIT_TO_VALUE_RISK` | 보증금 대비 매매·공시가격 보조 기준 | 감정평가액, 권리관계 안전성 |
| `MARKET_PRICE_COMPARISON_RISK` | 전월세 거래와 입력 금액 비교 | 현재 호가, 동일 조건 보장 |
| `SALE_TRANSACTION_SUPPORT_RISK` | 매매 실거래가 근거와 거래 부족 한계 | 전세가율 최종 확정 |
| `PUBLIC_PRICE_SUPPORT_RISK` | 공시가격·기준가 보조 근거 | 현재 시세 |
| `BUILDING_LEGAL_USE_RISK` | 건축물대장 주용도와 위반건축물 확인 | 위반건축물 여부 최종 확정 |
| `BUILDING_AGE_CONDITION_RISK` | 사용승인일 기반 노후도와 현장 확인 | 누수, 곰팡이, 수압 같은 실제 하자 |
| `MULTI_HOUSEHOLD_SENIOR_TENANT_RISK` | 다가구·단독 계열 선순위 임차인 확인, 총점 제외 | 선순위 임차인 보증금 자동 조회 |
| `REGISTRY_RIGHTS_RISK` | 등기부등본 권리관계 직접 확인, 총점 제외 | 근저당, 압류, 신탁, 소유자 일치 확정 |
| `GUARANTEE_INSURANCE_RISK` | 보증보험 가입 가능 여부 직접 확인, 총점 제외 | HUG/HF/SGI 최종 승인 가능성 |
| `MONTHLY_COST_BURDEN_RISK` | 월세와 관리비 월 고정 부담 | 관리비 포함 항목 자동 확정 |
| `CONTRACT_CHECKLIST_RISK` | 계약 전 확인 행동, 총점 제외 | 계약 가능/불가능 최종 판정 |

`PROPERTY_IDENTITY_RISK`만 핵심 데이터 부족 시 최종 등급 보류를 일으킨다. 주소가 정제되지 않으면 후행 API 조합이 모두 흔들리기 때문이다. 등기부등본, 선순위 임차인, 보증보험, 계약 전 checklist처럼 원래 공공 API로 확정할 수 없는 항목은 `NEEDS_USER_DOCUMENT`로 표시하되 총점과 불확실성 패널티에 반영하지 않는다. 직접 확인은 계약 전 행동으로는 중요하지만, 아직 확인하지 않았다는 사실만으로 자동 위험 점수를 올리면 모든 주소가 과도하게 위험해지는 문제가 생긴다.

정확 주소 진단의 시장 signal은 `LeaseRiskMarketSignalService`가 `market_indicator_trend_summaries`에서 법정동코드, 물건 유형, 계약 목적을 기준으로 조회한다. 전월세 실거래가가 부족하면 전세·월세 가격지수 signal을 `MARKET_PRICE_COMPARISON_RISK`의 부분 근거로 쓰고, 매매 실거래가나 공시가격이 부족하면 매매가격지수 signal을 `SALE_TRANSACTION_SUPPORT_RISK`, `PUBLIC_PRICE_SUPPORT_RISK`의 부분 근거로 쓴다. `DEPOSIT_TO_VALUE_RISK`는 먼저 `DepositRiskCalculator`가 만든 `DepositRiskAssessment`를 사용해 매매 실거래가 대표값 또는 공시가격 대표값 대비 보증금 비율을 점수화한다. 금액 필드가 비어 비율을 계산하지 못하면 단순히 데이터 상태가 `success`라는 이유로 고정 50점을 만들지 않고 `DATA_MISSING`으로 둔다. 지역 매매가격지수 signal은 정확 주소 가격 비율을 계산할 수 없을 때만 제한적인 `PARTIAL` 보조 근거로 사용한다. 이 보조 signal은 현재 매물가나 개별 주소 권리관계를 확정하지 않는다.

관심 부동산 리포트의 시장 맥락 보조 criterion(`REGIONAL_MARKET_TREND_RISK`, `PRICE_INDEX_VOLATILITY_RISK`, `RENT_INDEX_PRESSURE_RISK`, `MARKET_DATA_FRESHNESS_RISK`, `MARKET_DATA_COVERAGE_RISK`, `PURPOSE_MARKET_CONTEXT_RISK`)은 `FavoriteService.buildAiAssessment(...)`가 별도 응답으로 만든다. 이 시장 signal은 개별 주소의 권리관계나 계약 가능성을 확정하지 않는다.

## AI 처리 상태 표시 정책

`riskAssessment.scoringMode`는 내부 산정 모드이고, 사용자와 운영자가 바로 이해하기에는 부족하다. 화면은 `RiskAssessmentResponse.aiProcessing`을 사용해 아래 상태를 별도로 표시한다.

| status | 표시 | 의미 |
| --- | --- | --- |
| `OPENAI_SUCCESS` | AI 성공 | OpenAI structured output이 criterion 결과를 만들었고, 백엔드 검증을 통과했다. |
| `OPENAI_PARTIAL_FALLBACK` | AI 일부 성공 + fallback | 일부 criterion은 OpenAI 결과를 사용하고 일부는 fallback으로 계산했다. |
| `OPENAI_FAILED_FALLBACK` | AI 실패 fallback | OpenAI 호출/검증이 실패해 fallback으로 계산했다. 429 차단도 여기에 포함한다. |
| `OPENAI_DISABLED_FALLBACK` | AI 비활성 fallback | 설정상 OpenAI를 호출하지 않고 fallback으로 계산했다. |

이 표시는 사용자에게 "왜 결과가 이렇게 빠르게/다르게 나왔는지" 설명하기 위한 처리 경로다. `AI 성공`이어도 AI가 계약 가능 여부를 확정했다는 뜻이 아니며, 최종 점수와 등급은 항상 `RiskScoreAggregator`와 `RiskGradeCalculator`가 계산한다.

현재 구현은 `LEASE_RENT_RISK` 진단 1건당 OpenAI 1회 호출로 12개 criterion 배열을 받는다. HTTP 429 또는 JSON 검증 실패가 발생하면 12개 항목 모두 백엔드 `HYBRID_FALLBACK`으로 계산한다. 직접 확인 전용 criterion은 OpenAI가 숫자 `riskScore`를 반환하면 `RiskScoringResponseValidator`가 거부한다.

## 공통 표현 규칙

### 등급 표현

| 내부 표현 후보 | 사용자 표현 | 의미 |
| --- | --- | --- |
| `LOW` | 낮음 | 현재 입력과 조회 데이터만 보면 큰 이상 신호가 적음 |
| `NORMAL` | 보통 | 단일 지표상 과도한 신호는 적지만 직접 확인은 필요 |
| `CAUTION` | 주의 | 계약 전 반드시 추가 자료 확인이 필요 |
| `HIGH` | 높음 | 여러 위험 신호가 조합되어 강한 주의가 필요 |
| `UNKNOWN` | 판단 불가 | 핵심 데이터가 없어 자동 판단하면 안 됨 |

사용자 화면에서는 `안전`, `위험 확정`, `계약 금지`처럼 단정적인 표현을 피한다. 기본 표현은 `추가 확인 필요`, `직접 확인 필요`, `현재 데이터만으로 안전 판단 불가`다.

### 데이터 확실성 표현

| 표현 | 의미 |
| --- | --- |
| 확인됨 | 공공 API, DB, 사용자 인증 정보처럼 실제 조회된 값 |
| 사용자 입력 | 사용자가 진단 폼에서 입력한 값 |
| 추정 | 유사 거래, 공부상 후보, 대표값 계산처럼 해석이 들어간 값 |
| 판단 불가 | 등기부등본, 선순위 임차인, 근저당권처럼 현재 자동 확정할 수 없는 값 |

### RiskFinding 공통 필드 후보

향후 코드로 옮길 때 위험 신호 하나는 아래 필드를 가지는 것이 좋다.

| 필드 | 설명 |
| --- | --- |
| `code` | 룰을 추적할 수 있는 안정적인 영문 코드 |
| `severity` | `LOW`, `NORMAL`, `CAUTION`, `HIGH`, `UNKNOWN` 중 하나 |
| `title` | 카드 제목 |
| `summary` | 사용자가 이해할 수 있는 한두 문장 요약 |
| `evidence` | 어떤 입력과 데이터가 근거인지 |
| `limitation` | 무엇은 자동 판단할 수 없는지 |
| `actionItems` | 계약 전 사용자가 확인할 행동 |

## 룰 요약

| 우선순위 | 룰 | MVP 처리 방향 |
| --- | --- | --- |
| P0 | RULE-001 다가구 + 전세 + 선순위 정보 없음 | 지금 가장 먼저 구조화할 룰 |
| P0 | RULE-008 등기부등본 미업로드 | 항상 판단 한계로 노출 |
| P1 | RULE-007 유사 거래 부족 | 실거래가 비교 신뢰도 안내 |
| P1 | RULE-010 실거래가와 입력 가격 괴리 | 보증금 협상/추가 확인 근거 |
| P1 | RULE-004 위반건축물 여부 확인 | 자동 판정 전까지 직접 확인 |
| P2 | RULE-003 주거 목적 + 근린생활시설 가능성 | 건축물대장 데이터가 있을 때 강조 |
| P2 | RULE-005 노후 건물 + 높은 보증금 | 현장 확인 체크리스트 강화 |
| P2 | RULE-009 공시가격 대비 보증금 과다 | 공시가격 후보 신뢰도와 함께 사용 |
| P3 | RULE-002 전세가율 높음 + 매매 거래 부족 | 매매 대표값 안정화 후 적용 |
| P3 | RULE-006 전세가 상승 + 매매가 하락 | 가격 추이 데이터가 쌓인 뒤 적용 |

P0/P1은 전세·월세 MVP 사용자 가치와 직접 연결된다. P2/P3은 데이터 품질과 화면 표현이 준비된 뒤 적용한다.

## RULE-001 다가구 전세 선순위 임차인 미확인

| 항목 | 내용 |
| --- | --- |
| code | `MULTI_FAMILY_SENIOR_TENANT_MISSING` |
| MVP 우선순위 | P0 |
| 조건 | 계약 목적이 전세이고, 공부상 또는 사용자 입력상 다가구주택 가능성이 있으며, 선순위 임차인 보증금 정보가 없음 |
| 현재 연결 후보 | `LeaseRiskDiagnosisPropertyIdentityService`, `LeaseRiskDiagnosisNextActionService`, `LeaseRiskDiagnosisChecklistService` |
| 사용자 표현 | `주의` 또는 `추가 확인 필요` |

### 위험 해석

다가구주택은 호실별로 소유권이 분리되지 않을 수 있다. 사용자가 계약하려는 호실의 보증금만 보고 안전성을 판단하면 안 되고, 건물 전체 선순위 임차인 보증금과 근저당권을 함께 확인해야 한다.

### evidence 후보

- 계약 목적: 전세
- 사용자 표현: 원룸, 다가구, 단독주택 계열
- 공부상 유형: 다가구주택 또는 단독/다가구 가능성
- 선순위 임차인 정보: 판단 불가

### 사용자 문장

```text
이 물건은 다가구주택일 가능성이 있습니다.
다가구주택 전세는 내 호실 보증금만으로 판단하기 어렵고,
건물 전체 선순위 임차인 보증금과 근저당권을 함께 확인해야 합니다.
```

### limitation

선순위 임차인 보증금은 공공 API만으로 자동 확정하기 어렵다.

### actionItems

- 임대인 또는 중개사에게 선순위 임차인 보증금 내역 요청
- 등기부등본 을구 확인
- 전세보증보험 가입 가능 여부 확인

### 구현 전 확인

`LeaseRiskBuildingType`이 다가구/단독 계열을 어떻게 표현하는지 먼저 확인한다. 사용자 입력만으로 다가구를 확정하지 말고 `추정`으로 표현한다.

## RULE-002 전세가율 높음 + 매매 거래 부족

| 항목 | 내용 |
| --- | --- |
| code | `HIGH_JEONSE_RATIO_LOW_SALE_LIQUIDITY` |
| MVP 우선순위 | P3 |
| 조건 | 입력 보증금 / 매매 대표값 비율이 높고, 최근 유사 매매 거래 수가 부족함 |
| 현재 연결 후보 | `DepositRiskCalculator`, `RentRiskDiagnosisService`, `RiskScoringFallbackService`, `LeaseRiskExternalDataLookupService`, `LeaseRiskDiagnosisRiskSummaryService` |
| 사용자 표현 | `주의` 또는 `판단 신뢰도 낮음` |

### 위험 해석

전세가율이 높아도 매매 대표값의 근거가 약하면 정확한 판단이 어렵다. 특히 매매 거래가 적으면 대표값 자체의 신뢰도가 낮으므로, 전세가율을 확정 지표처럼 보여주면 안 된다.

### 사용자 문장

```text
입력 보증금은 추정 매매가 대비 높은 편일 수 있습니다.
다만 최근 유사 매매 거래가 충분하지 않아 전세가율 계산의 신뢰도가 낮습니다.
계약 전 보증보험 가능 여부와 권리관계를 함께 확인해야 합니다.
```

### limitation

매매 대표값은 실시간 감정평가액이 아니며, 거래량이 부족하면 가격 신뢰도가 낮다.

### actionItems

- 최근 매매 실거래가 원문 확인
- 중개사에게 유사 거래 비교 근거 요청
- 등기부등본 을구 확인

### 구현 전 확인

현재 구현은 `TransactionSimilarityFilter`가 고른 매매 비교 표본의 중앙값을 `DepositRiskCalculator.assessSalePriceRatio(...)`에 넣고, 그 결과의 `suggestedRiskScore`, `ratioPercent`, `basisType=SALE_TRANSACTION`, `referenceAmountManwon`, `comparisonCount`를 `NormalizedRiskInput.depositToValueAssessment`로 넘긴다. `RiskScoringFallbackService`는 이 값이 있으면 `DEPOSIT_TO_VALUE_RISK`를 `AVAILABLE`로 산정하고, 비율 점수를 `RiskScoreAggregator` 가중치 `0.17`에 반영한다. 금액 필드가 없어 계산 문장만 있고 점수가 없으면 `DATA_MISSING`으로 둔다.

## RULE-003 주거 목적 + 근린생활시설 가능성

| 항목 | 내용 |
| --- | --- |
| code | `RESIDENTIAL_PURPOSE_NON_RESIDENTIAL_USE` |
| MVP 우선순위 | P2 |
| 조건 | 사용자는 주거 목적을 입력했지만, 건축물대장 주용도 또는 층별 용도에서 근린생활시설 가능성이 있음 |
| 현재 연결 후보 | `BuildingRiskAnalyzer`, `LeaseRiskDiagnosisPropertyIdentityService` |
| 사용자 표현 | `직접 확인 필요` |

### 위험 해석

사용자 표현이 “원룸”이어도 공부상 용도가 근린생활시설이면 주거 사용 적합성, 위반건축물 여부, 보증보험 가능성에 영향을 줄 수 있다.

### 사용자 문장

```text
사용자는 주거 목적으로 입력했지만,
건축물대장상 주용도가 주거용으로 명확하지 않을 수 있습니다.
계약 전 해당 호실의 실제 용도와 위반건축물 여부를 확인해야 합니다.
```

### limitation

주용도만으로 해당 호실의 실제 사용 가능 여부를 확정할 수 없다.

### actionItems

- 건축물대장 원본에서 해당 층·호실 용도 확인
- 중개대상물 확인설명서의 위반건축물 여부 확인
- 전세보증보험 가입 가능 여부 확인

## RULE-004 위반건축물 여부 미확인

| 항목 | 내용 |
| --- | --- |
| code | `VIOLATION_BUILDING_STATUS_UNCONFIRMED` |
| MVP 우선순위 | P1 |
| 조건 | 건축물대장 또는 중개대상물 확인설명서에서 위반건축물 여부를 자동 확정하지 못함 |
| 현재 연결 후보 | `BuildingRiskAnalyzer`, `LeaseRiskDiagnosisChecklistService` |
| 사용자 표현 | `직접 확인 필요` |

### 위험 해석

위반건축물 여부는 전세보증보험, 대출, 추후 분쟁 가능성에 영향을 줄 수 있다. 현재 자동 판정이 어렵다면 “문제 없음”이 아니라 “직접 확인 필요”로 표현해야 한다.

### 사용자 문장

```text
현재 데이터만으로 위반건축물 여부를 확정할 수 없습니다.
계약 전 건축물대장 원본과 중개대상물 확인설명서에서 위반건축물 표시 여부를 확인하세요.
```

### limitation

자동 조회 실패 또는 원본 필드 미연결 상태는 안전을 의미하지 않는다.

### actionItems

- 건축물대장 원본 확인
- 중개대상물 확인설명서 위반건축물 항목 확인
- 위반 표시가 있으면 보증보험 가능 여부 재확인

## RULE-005 노후 건물 + 높은 보증금

| 항목 | 내용 |
| --- | --- |
| code | `OLD_BUILDING_HIGH_DEPOSIT` |
| MVP 우선순위 | P2 |
| 조건 | 사용승인 후 경과 연수가 크고, 입력 보증금이 주변 유사 거래 대비 낮지 않음 |
| 현재 연결 후보 | `BuildingRiskAnalyzer`, `DepositRiskCalculator`, `LeaseRiskDiagnosisChecklistService` |
| 사용자 표현 | `현장 확인 강화` |

### 위험 해석

노후 건물은 누수, 결로, 배관, 전기, 창호 같은 실제 하자 가능성이 커질 수 있다. 이 문제는 공공 API만으로 판단하기 어렵기 때문에 현장 확인 체크리스트로 연결해야 한다.

### 사용자 문장

```text
건물 노후도가 높은 편인데 입력 보증금은 주변 대비 낮지 않을 수 있습니다.
가격만 보고 판단하기보다, 현장 방문 때 누수, 결로, 배관, 전기, 창호 상태를 확인하세요.
```

### limitation

실제 하자는 API로 자동 확인할 수 없다.

### actionItems

- 현장 방문 시 누수·곰팡이·결로 확인
- 전기·배관·창호 상태 확인
- 수리 이력과 관리 책임 범위 확인

## RULE-006 전세가 상승 + 매매가 정체 또는 하락

| 항목 | 내용 |
| --- | --- |
| code | `RENT_RISING_SALE_STAGNANT` |
| MVP 우선순위 | P3 |
| 조건 | 최근 전월세 보증금 추이는 상승하고, 매매 거래가는 정체 또는 하락함 |
| 현재 연결 후보 | 향후 가격 추이 응답과 `LeaseRiskDiagnosisResult.vue` 그래프 |
| 사용자 표현 | `보증금 회수 위험 추가 확인` |

### 위험 해석

매매가는 정체되는데 전세보증금이 상승하면 보증금이 매매가에 가까워질 수 있다. 이 경우 전세가율과 보증보험 가능성을 함께 확인해야 한다.

### 사용자 문장

```text
최근 전세보증금은 상승하는 흐름인데 매매 실거래가는 정체 또는 하락할 수 있습니다.
이 경우 전세가율이 높아질 수 있으므로 보증보험 가능성과 권리관계를 추가 확인하세요.
```

### limitation

현재 MVP가 최근 3개월 snapshot 중심이면 장기 추세 판정에는 데이터가 부족할 수 있다.

### actionItems

- 최근 12~24개월 전월세·매매 실거래가 확인
- 보증보험 가입 가능 여부 확인
- 등기부등본 권리관계 확인

## RULE-007 유사 거래 부족

| 항목 | 내용 |
| --- | --- |
| code | `INSUFFICIENT_COMPARABLE_TRANSACTIONS` |
| MVP 우선순위 | P1 |
| 조건 | 같은 법정동, 같은 물건 유형, 비슷한 면적·층수·기간의 거래 수가 부족함 |
| 현재 연결 후보 | `LeaseRiskExternalDataLookupService`, `DepositRiskCalculator`, `LeaseRiskDiagnosisRiskSummaryService` |
| 사용자 표현 | `가격 판단 신뢰도 낮음` |

### 위험 해석

평균값보다 중요한 것은 비교 대상의 유사성이다. 유사 거래가 충분하지 않으면 평균 가격을 근거로 보증금이 적정하다고 단정하면 안 된다.

### 사용자 문장

```text
주변 거래와 비교했지만 최근 유사 거래가 충분하지 않습니다.
따라서 현재 보증금이 적정하다고 단정하기 어렵고,
동일 면적·동일 유형의 추가 거래 사례를 확인해야 합니다.
```

### limitation

거래 없음은 안전을 의미하지 않는다. 비교 근거가 약하다는 뜻이다.

### actionItems

- 동일 법정동·유사 면적 거래 추가 확인
- 중개사에게 비교 거래 근거 요청
- 유사 거래가 적은 이유 확인

## RULE-008 등기부등본 미업로드 또는 미확인

| 항목 | 내용 |
| --- | --- |
| code | `REGISTRY_DOCUMENT_MISSING` |
| MVP 우선순위 | P0 |
| 조건 | 등기부등본 데이터가 없어서 근저당권, 신탁, 압류, 소유자 정보를 확인할 수 없음 |
| 현재 연결 후보 | `LeaseRiskDiagnosisDataStatusService`, `LeaseRiskDiagnosisNextActionService`, `LeaseRiskDiagnosisChecklistService` |
| 사용자 표현 | `권리관계 판단 불가` |

### 위험 해석

등기부등본이 없으면 권리관계는 판단 불가다. 이 상태에서 “안전”이라고 말하면 안 된다.

### 사용자 문장

```text
등기부등본이 없어 근저당권, 신탁등기, 압류 여부를 확인할 수 없습니다.
현재 데이터만으로 권리관계를 안전하다고 판단할 수 없으므로,
계약 전 등기부등본 갑구·을구를 확인해야 합니다.
```

### limitation

공공 시세 데이터와 건축물대장만으로 권리관계를 확정할 수 없다.

### actionItems

- 등기부등본 갑구·을구 확인
- 계약금 입금 계좌가 소유자 명의인지 확인
- 근저당권 채권최고액과 말소 조건 확인
- 신탁등기라면 신탁원부와 수탁자 동의 여부 확인

## RULE-009 공시가격 대비 보증금 과다

| 항목 | 내용 |
| --- | --- |
| code | `DEPOSIT_HIGH_AGAINST_OFFICIAL_PRICE` |
| MVP 우선순위 | P2 |
| 조건 | 입력 보증금이 공시가격 대표값 대비 높음 |
| 현재 연결 후보 | `DepositRiskCalculator`, `VWorldPublicPriceApiClient`, `RentRiskDiagnosisService`, `RiskScoringFallbackService`, `LeaseRiskDiagnosisRiskSummaryService` |
| 사용자 표현 | `보수적 가치 대비 확인 필요` |

### 위험 해석

공시가격은 시세가 아니지만 보수적 참고값으로 사용할 수 있다. 보증금이 공시가격 대비 높으면 전세가율, 보증보험 가능성, 권리관계를 함께 확인해야 한다.

### 사용자 문장

```text
입력 보증금이 공시가격 참고값 대비 높을 수 있습니다.
공시가격은 실제 시세와 다를 수 있으므로 이것만으로 위험을 확정할 수는 없지만,
보증보험 가능성과 권리관계 확인이 필요합니다.
```

### limitation

공시가격 후보가 동·호 단위로 정확히 매칭되지 않으면 보조 지표로만 사용해야 한다.

현재 구현은 매매 실거래가 비율을 우선 사용하고, 그 비율을 계산할 수 없을 때 `DepositRiskCalculator.assessPublicPriceRatio(...)` 결과를 `DEPOSIT_TO_VALUE_RISK`의 `PARTIAL` 점수 근거로 사용한다. 공시가격은 시세가 아니므로 같은 80% 이상이라도 매매 실거래가보다 낮은 신뢰도로 다루며, `PUBLIC_PRICE_SUPPORT_RISK`는 별도 criterion으로 계속 남긴다.

### actionItems

- 공시가격 원문과 매칭 대상 확인
- 최근 매매 실거래가와 함께 비교
- 보증보험 가입 기준 확인

## RULE-010 실거래가와 입력 가격 괴리

| 항목 | 내용 |
| --- | --- |
| code | `INPUT_PRICE_OUTSIDE_COMPARABLE_RANGE` |
| MVP 우선순위 | P1 |
| 조건 | 입력 보증금 또는 월세가 유사 거래 범위보다 높거나 낮은 편임 |
| 현재 연결 후보 | `DepositRiskCalculator`, `LeaseRiskDiagnosisRiskSummaryService` |
| 사용자 표현 | `협상 또는 추가 확인 필요` |

### 위험 해석

입력 가격이 주변 유사 거래보다 높으면 보증금 과다 가능성을 확인해야 한다. 너무 낮아도 미끼 매물, 권리관계, 건물 상태 같은 다른 이유가 있는지 확인해야 한다.

### 사용자 문장

```text
입력한 금액이 최근 유사 거래 범위와 차이가 있을 수 있습니다.
가격 차이만으로 좋고 나쁨을 확정할 수는 없지만,
중개사에게 가격 차이의 근거를 확인하고 계약 조건을 다시 비교하세요.
```

### limitation

실거래가 비교는 면적, 층수, 건축연도, 옵션, 관리비, 권리관계를 모두 반영하지 못할 수 있다.

### actionItems

- 유사 거래 비교표 확인
- 보증금·월세·관리비를 합친 월 부담 비교
- 가격이 낮은 이유 또는 높은 이유를 중개사에게 확인

## 룰 조합 원칙

단일 신호보다 조합 신호가 중요하다.

```text
전세가율 68%
```

이 값만으로는 애매할 수 있다. 하지만 아래처럼 조합되면 해석이 달라진다.

```text
전세가율 68%
+ 다가구주택 가능성
+ 선순위 임차인 정보 없음
+ 등기부등본 미확인
+ 유사 매매 거래 부족
= 추가 확인 필요
```

따라서 룰 구현 시 최종 점수보다 `가장 큰 이유`와 `즉시 확인할 것`을 먼저 구성한다.

## 구현 시 주의할 점

- 사용자 입력의 `knownPropertyType`만으로 공부상 유형을 확정하지 않는다.
- 외부 API 조회 실패를 “문제 없음”으로 해석하지 않는다.
- 등기부등본 미확인은 항상 권리관계 판단 불가로 표현한다.
- AI 입력은 `RiskEvidencePacket`이 만든 curated evidence, missingData, limitation, requiredUserActions를 우선 사용한다. 원문 주소, 매물 설명, 전체 prompt 원문은 AI 감사 로그에 저장하지 않는다.
- AI는 narration으로 룰 결과를 자유 설명하지 않는다. 현재 구현에서 AI는 `RiskPromptBuilder`와 `RiskScoringResponseValidator`가 제한하는 JSON Schema 안에서 criterion별 점수와 근거만 반환할 수 있다. 백엔드는 schema 외 추가 필드와 판단 불가 상태의 숫자 점수를 다시 거부한다.
- 최종 총점, 등급, 화면 판정, 불확실성 패널티는 `RiskScoreAggregator`와 `RiskGradeCalculator`가 계산한다. AI 응답이 이 값을 만들거나 덮어쓰면 안 된다.
- criterion별 `evidence`와 `missingData`는 진단 이력 저장 뒤 `RiskEvidenceSnapshotService`가 `risk_evidence_snapshots`에 별도 저장한다. 이 table은 모델 원문 감사 로그가 아니라 `display_message`, `limitation`, `user_action_required`를 다시 읽기 위한 설명 가능성 snapshot이다.
- RULE-002, RULE-006처럼 추세 데이터가 필요한 룰은 데이터 기간과 표본 수가 준비되기 전까지 구현하지 않는다.
- 확장형 서비스 룰은 실제 MVP 이후 기능 slice가 시작되기 전까지 빈 코드로 만들지 않는다.

## 테스트 아이디어

향후 룰을 코드화할 때는 작은 단위 테스트부터 추가한다.

| 테스트 | 검증할 것 |
| --- | --- |
| 다가구 전세 + 선순위 정보 없음 | 최소 `CAUTION` 이상과 선순위 보증금 요청 action이 나온다 |
| 등기부등본 없음 | 권리관계가 `UNKNOWN` 또는 직접 확인 필요로 표시된다 |
| 유사 거래 부족 | 평균값 신뢰도 낮음 문장이 나온다 |
| 근린생활시설 가능성 | 주거 사용 적합성 확인 action이 나온다 |
| 외부 API unavailable | 안전 문장이 아니라 데이터 한계 문장이 나온다 |
| evidence snapshot 저장 | `REGISTRY_RIGHTS_NOT_CHECKED`, `SENIOR_TENANT_DEPOSIT_UNKNOWN`, `GUARANTEE_INSURANCE_UNCONFIRMED` 같은 근거 코드가 진단 이력 ID로 저장된다 |

통합 테스트는 `RentRiskDiagnosisIntegrationTest`에서 `RentRiskDiagnosisResponse`의 기존 `riskSummary`, `checklist`, `nextActions`와 `risk_evidence_snapshots` 저장 여부를 함께 검증하는 방식으로 확장한다.

## 관련 문서

- [통찰형 위험진단 리포트 전략](/docs/frontend/SCREEN_ANALYSIS_POLICY.md)
- [과거 지표 기반 부동산 분석 MVP 범위](/docs/product/MVP_SCOPE.md)
- [과거 지표 분석과 정확 주소 위험진단 MVP API 호출 전략](/docs/api/API_CALL_FLOW.md)
- [API 명세와 프론트엔드 연결 현황](/docs/api/API_FRONTEND_CONNECTION_SPEC.md)

## Learning path

1. First read: 이 문서의 RULE-001, RULE-008, RULE-007을 먼저 읽는다.
2. Then inspect: `LeaseRiskDiagnosisPropertyIdentityService`, `LeaseRiskDiagnosisRiskSummaryService`, `LeaseRiskDiagnosisNextActionService`를 읽는다.
3. Then inspect frontend: `LeaseRiskDiagnosisResult.vue`가 `riskSummary`, `checklist`, `nextActions`를 어떻게 보여주는지 본다.
4. Then run: 향후 코드 구현 시 `cd backend && ./mvnw -Dtest=RentRiskDiagnosisIntegrationTest test`로 응답 문장을 확인한다.
5. Then debug: 어떤 데이터가 확인됨, 추정, 판단 불가인지 먼저 나누고 룰 조건을 본다.
6. Key concept to understand: 룰 기반 위험진단은 “맞다/틀리다” 판정기가 아니라, 불확실한 계약 정보를 사용자의 확인 행동으로 바꾸는 설명 가능한 엔진이다.
