---
title: API_CALL_FLOW
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
---

# 과거 지표 분석과 정확 주소 위험진단 MVP API 호출 전략

> Status: Partially Implemented

## 목적

이 문서는 ZIP:ON의 MVP를 "현재 매물 미제공 + 과거 지표 기반 부동산 분석 + 정확 주소 위험진단"으로 재정의하고, 외부 API를 어떤 순서와 조건에서 호출할지 정한다.

이번 MVP의 사용자는 현재 매물을 ZIP:ON 안에서 찾는 것이 아니라, 지역·유형·정확 주소의 과거 지표와 위험 신호를 이해하기 위해 아래 질문을 한다.

```text
홈 화면 분석/진단 입력 폼 클릭
-> 분석 의도 분류

강남 원룸 전월세 흐름은 어떤가요?
서울대입구역 근처 지표는 어떤가요?
상가 월세 공실률은 어떤가요?

또는 정확 주소형:
이 원룸 전세 안전한가요?
주소: 서울시 관악구 ○○동 ○○번지
보증금: 1억 2천만 원
관리비: 8만 원
목적: 전세 거주
```

ZIP:ON은 현재 매물을 찾아주는 서비스가 아니라, 지역·유형 입력은 과거 지표 분석으로, 정확 주소 입력은 법적 정체·가격 적정성·보증금 위험·건축물 상태·추가 확인사항 진단으로 처리하는 서비스다. 서비스는 판정자가 아니라 지표 해석자이자 사전 진단자다.

프론트엔드 UX 기준으로는 홈 화면 분석/진단 입력 폼이 MVP의 기본 진입점이다. 현재 구현은 `MainHero.vue`가 `SearchBar.vue`를 `diagnosis` mode로 렌더링하고, 주소, 계약 목적, 보증금, 월세, 관리비, 매물 유형, 선택 입력인 전용면적·층수, 매물 설명을 입력 폼으로 수집한다. 정확 주소와 계약 조건이 충분하면 `createRentRiskDiagnosis(payload)`로 `POST /api/rent-risk-diagnoses`를 호출하고, `강남 원룸`, `서울대입구역 근처 오피스텔` 같은 지역·유형 입력은 `createRegionalIndicatorAnalysis(payload)`로 `POST /api/regional-indicator-analyses`를 호출한다. 두 흐름 모두 현재 매물 목록으로 새지 않도록 호출 기준을 고정한다.

## 검토한 문서와 출처

로컬 첨부 문서:

- `아파트 전월세 실거래가 자료 기술문서.pdf`
- `아파트 매매 실거래가 상세자료기술문서.pdf`
- `연립다세대 전월세 실거래가 자료 기술문서.pdf`
- `연립다세대 매매 실거래가 자료 기술문서.pdf`
- `첨부1. 기존 건축데이터 PK전환 규칙 안내.pdf`
- `OpenAPI활용가이드-_건축HUB_건축물대장_1.0.pdf`

공식 페이지 확인:

- [도로명주소 주소기반산업지원서비스](https://business.juso.go.kr/)
- [행정표준코드관리시스템 법정동코드](https://www.code.go.kr/stdcode/regCodeL.do)
- [행정안전부_행정표준코드_법정동코드](https://www.data.go.kr/data/15077871/openapi.do)
- [국토교통부_건축HUB_건축물대장정보 서비스](https://www.data.go.kr/data/15134735/openapi.do)
- [건축HUB 건축물대장 기본개요 메타정보](https://www.hub.go.kr/portal/opn/tyb/idx-bdrg.do)
- [국토교통부_GIS건물통합정보(WMS/WFS)](https://www.data.go.kr/data/15123970/openapi.do)
- [국토교통부_아파트 전월세 실거래가 자료](https://www.data.go.kr/data/15126474/openapi.do)
- [국토교통부_아파트 매매 실거래가 자료](https://www.data.go.kr/data/15126469/openapi.do)
- [국토교통부_오피스텔 전월세 실거래가 자료](https://www.data.go.kr/data/15126475/openapi.do)
- [국토교통부_오피스텔 매매 실거래가 자료](https://www.data.go.kr/data/15126464/openapi.do)
- [국토교통부_연립다세대 전월세 실거래가 자료](https://www.data.go.kr/data/15126473/openapi.do)
- [국토교통부_연립다세대 매매 실거래가 자료](https://www.data.go.kr/data/15126467/openapi.do)
- [국토교통부_단독/다가구 전월세 실거래가 자료](https://www.data.go.kr/data/15126472/openapi.do)
- [국토교통부_단독/다가구 매매 실거래가 자료](https://www.data.go.kr/data/15126465/openapi.do)
- [국토교통부_공동주택가격정보(WMS/WFS/속성정보)](https://www.data.go.kr/data/15124003/openapi.do)
- [국토교통부_주택 공시가격 정보](https://www.data.go.kr/data/3073746/fileData.do)
- [국토교통부_개별주택가격정보](https://www.data.go.kr/data/15052272/fileData.do)
- [국토교통부_공동주택 기본 정보제공 서비스](https://www.data.go.kr/data/15058453/openapi.do)
- 사용자 제공 한국부동산원 R-ONE 통계 OpenAPI XLS 4종: [kab-r-one-statistics-api.md](/docs/api/external-api/specs/kab-r-one-statistics-api.md)

첨부된 연립다세대 실거래가 기술문서 기준으로 전월세와 매매 API는 모두 `LAWD_CD`, `DEAL_YMD`, `serviceKey`, `pageNo`, `numOfRows`를 중심으로 조회한다. `LAWD_CD`는 법정동코드 10자리 중 앞 5자리이며, `DEAL_YMD`는 계약년월 6자리다. 따라서 실거래가 API는 주소만으로 바로 호출할 API가 아니라, 법정동코드와 물건 유형이 확정된 뒤 호출할 API다.

건축HUB 기본개요 메타정보 기준으로 대지구분코드는 `0: 대지`, `1: 산`, 대장구분코드는 `1: 일반`, `2: 집합`, 대장종류코드는 `1: 총괄표제부`, `2: 일반건축물`, `3: 표제부`, `4: 전유부`다. 현재 adapter primitive는 이 중 지번 조회에 필요한 대지구분코드와 물건 유형 판별에 필요한 대장구분/종류명을 우선 다룬다.

## 현재 구현된 backend slice

현재 구현은 MVP 게이트 중 "진단 목적 카탈로그", "주소 정제와 법정동코드 변환", "`AddressResolution` 기반 본번/부번/PNU 계산", "사용자 입력 물건 표현 해석", "건축물대장 표제부 DB-first snapshot 조회", "건축물대장 주용도·기타용도 기반 물건 유형 판별", "`property_identity_candidates` 식별 후보 upsert", "건축물대장 확정 유형 또는 사용자 힌트/지번 일치 실거래 기반 분석 기준 후보 선택", "정확 주소 과거 전월세 후보 카드 조회", "유형별 실거래가 API 선택", "전월세/매매 실거래가 DB-first 조회", "DB fact 부족 시 API fallback", "fallback 결과의 정규화 fact upsert", "월별 통계 갱신", "선택 입력 면적·층수 기반 유사 거래 1차 필터", "VWorld 공시가격 DB-first snapshot 조회", "R-ONE 지역·유형 시장 signal 조회", "전월세 보증금 대표값 대비 입력 보증금 비율 문장 생성", "월세 계약의 월세 대표값 대비 입력 월세 비율 문장 생성", "입력 월세와 관리비 기반 월 고정 주거비 안내", "매매가 대표값 대비 입력 보증금 비율 문장 생성", "공시가격 대표값 대비 입력 보증금 비율 문장 생성", "건축물대장 주용도 불일치와 노후도 안내", "`LEASE_RENT_RISK` 12개 고정 항목의 배치형 구조화 위험 산정", "위험진단 요청/응답 이력 저장", "항목별 판단 근거와 부족 데이터 snapshot 저장", "관리자 전용 이력 조회"의 순서를 코드로 고정했다. 건축물대장, 전월세 실거래가, 매매 실거래가는 data.go.kr HTTP adapter 경계를 가지고 있고, 공시가격은 VWorld HTTP adapter 경계를 가진다. 건축물대장 표제부 snapshot 저장은 `BuildingRegisterTitleSnapshotStore`, 물건 식별 후보 저장은 `PropertyIdentityCandidateService`, 분석 기준 실거래 근거 선택은 `LeaseRiskTransactionEvidenceService`, 과거 전월세 후보 카드 조립은 `RentRiskDiagnosisCandidateService`, 실거래가 저장과 통계는 `RealEstateTransactionFactStore`, `ExternalDataCollectionService`, `MarketStatisticsMonthlyService`, 시장 signal 연결은 `LeaseRiskMarketSignalService`, 공시가격 snapshot 저장은 `PublicPriceSnapshotStore`, 진단 근거 snapshot 저장은 `RiskEvidenceSnapshotService`가 담당한다. 주소 좌표 변환도 VWorld HTTP adapter 경계를 가지지만, VWorld Geocoder adapter는 현재 `/api/admin/external-api-health` 점검과 후속 공간 API 호출 준비용으로만 구현되어 있고, `RentRiskDiagnosisService`의 위험진단 본 흐름에는 아직 연결하지 않았다. 위험진단 service가 보증금-월세 환산/총 주거비 정교화, 관리비 원본 데이터 자동 분석, 공시가격 동·호 정밀 매칭, 좌표 기반 GIS건물통합정보 후보 조회, 위반건축물 여부 원본 필드 자동 판정까지 포함한 정량 위험도 계산에 연결하는 단계는 아직 분리되어 있다. service key가 없고 DB fact/snapshot도 부족하면 실제 HTTP 호출을 하지 않고 `UNAVAILABLE` 제한 진단으로 내려준다. OpenAI/ChatGPT API는 켜져 있을 때만 백엔드 내부에서 고정 항목별 score/evidence 후보를 1회 HTTP 요청의 structured JSON으로 반환하고, 최종 총점·등급·화면 판정은 백엔드 `RiskScoreAggregator`와 `RiskGradeCalculator`가 계산한다. 테스트에서는 실제 외부 API와 실제 OpenAI를 호출하지 않고 fake client, `MockRestServiceServer`, fallback을 사용한다.

`DiagnosisPurpose`는 확장형 ZIP:ON의 목적 코드를 코드로 고정한다. 현재 실행 가능한 목적은 `LEASE_JEONSE`, `LEASE_MONTHLY_RENT`뿐이며 둘 다 `currentEndpoint=/api/rent-risk-diagnoses`를 가진다. 주거용 매매, 상가 창업, 임야·토지 개발, 꼬마빌딩, 사용자 문서 권리관계 보조 분석은 로드맵과 직접 확인 영역을 카탈로그로 노출하지만 `mvpSupported=false`, `currentEndpoint=null`로 내려가므로 프론트와 AI 계층이 이를 자동 판정 가능 기능으로 오해하면 안 된다. 전세·월세 진단 결과의 `nextActions`에는 `DiagnosisPurpose.directConfirmationRequiredItems`가 `직접 확인 필요: ...` 형식으로 합쳐져, API나 AI가 확정하면 안 되는 영역을 사용자 행동으로 분리한다.

`LeaseRiskDiagnosisRequestValidator`는 `LeaseContractPurposeProfile`을 기준으로 전세·월세 목적별 필수 금액 입력을 검증한다. 전세는 양수 보증금이 필요하고, 월세는 보증금 0원을 허용하지만 양수 월세 입력은 필요하다. 프론트엔드는 사용자가 정확 주소만 알고 필수 금액을 모를 때 이 validator 오류를 먼저 보여주지 않고 `POST /api/rent-risk-diagnoses/address-candidates`로 과거 전월세 실거래 후보를 조회한다. 사용자가 후보 카드를 선택하면 후보의 금액, 면적, 층수를 채우고, 후보 id·출처·계약일·물건유형·`matchLevel`·한계 문구를 `RentRiskDiagnosisRequest.selectedRentCandidate`로 함께 보내 기존 `POST /api/rent-risk-diagnoses` 흐름으로 들어간다. 이 값은 현재 매물 확정값이 아니라 "사용자가 어떤 과거 거래 후보를 비교 기준으로 선택했는지"를 리포트까지 전달하기 위한 맥락이다. 이 검증은 Bean Validation의 단일 필드 제약만으로 표현하기 어려운 목적별 규칙이므로 application service 진입 초기에 실행한다.

`LeaseRiskDiagnosisInputSummaryService`는 `RentRiskDiagnosisRequest`와 `LeaseContractPurposeProfile`을 받아 사용자가 입력한 주소, 계약 목적 표시명, 금액, 전용면적, 층수, 매물 유형, 매물 설명을 `inputSummary` 응답으로 조립한다. 사용자-facing 응답에서 공백 제거와 빈 설명의 `null` 변환을 한 곳에서 담당한다.

법정동코드는 이제 Spring bean 기준으로 `MyBatisLegalDongCodeCatalog`가 `legal_dong_codes` seed table과 `legal_dong_aliases` alias table을 조회한다. 사용자가 행정동명으로 주소를 입력해도 `LegalDongCodeMatch`가 canonical 법정동명, 법정동코드, 실거래가용 `LAWD_CD`, 선택적으로 행정동코드를 함께 반환한다. `AddressResolution`은 정규화된 주소에서 `sigunguCd`, `bjdongCd`, `platGbCd`, `bun`, `ji`, `bonbun`, `bubun`, PNU를 계산하고, `BuildingRegisterApiQuery`와 `PublicPriceApiQuery`가 이 값을 재사용한다. `InMemoryLegalDongCodeCatalog`는 빠른 단위 테스트용 fake로만 남겨 두었다. 주소 후보 검색 UI는 기본적으로 backend Juso 직접검색 proxy인 `GET /api/address-search/juso`가 담당하고, Juso 팝업 API는 보조/호환 경로로 남아 있다. 백엔드 주소 정규화는 현재 DB seed 범위 안에서만 법정동코드를 확정한다.

`LeaseRiskDiagnosisAddressSectionService`는 `AddressNormalizationResult`를 프론트엔드가 읽는 `address` 응답으로 변환한다. 정제 성공이면 정규화 주소, 법정동코드, `LAWD_CD`, 법정동/행정동 매칭 정보, 지번 본번/부번, 조회 가능 여부를 채우고, 실패이면 `empty` 상태와 사용자가 다시 확인해야 할 주소 유형 메시지를 내려준다.

`LeaseRiskPropertyTypeInterpreter`는 사용자의 `knownPropertyType`과 `listingDescription`을 합쳐 `LeaseRiskPropertyTypeInterpretation`을 만든다. 이 값은 사용자가 "원룸", "빌라", "오피스텔", "상가"처럼 생활 언어로 말한 표현을 내부 `LeaseRiskBuildingType`, 후보 유형 목록, 분석 방향, 원룸처럼 공부상 유형이 특히 애매한 표현 여부로 나눈다. 이 해석은 건축물대장 확정 유형을 대체하지 않는다. 다만 `LeaseRiskTransactionEvidenceService`는 건축물대장이 미확정일 때 사용자 힌트와 해당 지번 전월세 실거래 조회 가능성을 보수적으로 조합해 "공부상 확정 유형"이 아닌 "분석 기준 후보"를 잡을 수 있다.

`PropertyIdentityCandidateService`는 정규화된 주소, 사용자 표현 해석, 건축물대장 진단 결과를 `property_identity_candidates`에 idempotent upsert한다. 이 row는 사용자에게 "확정된 물건"을 보여주기 위한 것이 아니라, 이후 building register snapshot, public price snapshot, evidence packet이 같은 주소/PNU/match vocabulary로 연결될 수 있게 하는 내부 후보 저장소다. `LeaseRiskDiagnosisPropertyIdentityService`는 `LeaseRiskPropertyTypeInterpretation`과 `BuildingRegisterDiagnosis`를 받아 `RentRiskDiagnosisResponse.propertyIdentity`를 만든다. 사용자 표현이 "원룸", "오피스텔", "상가"처럼 생활 언어일 때도 확정 사실로 쓰지 않고 후보 유형, 공부상 판별 상태, 주의 문장으로 나눈다. 건축물대장 유형이 확인되면 사용자 입력과 공부상 유형 불일치, 다가구 선순위 임차인, 근린생활시설 주거 사용 가능성 같은 확인 지점을 강조한다.

건축HUB 건축물대장정보는 표제부 조회 HTTP adapter 경계와 DB-first snapshot 저장 경계를 붙였다. `LeaseRiskBuildingRegisterLookupService`는 먼저 `AddressResolution`의 `sigunguCd`, `bjdongCd`, `platGbCd`, `bun`, `ji` 조합으로 `BuildingRegisterTitleSnapshotStore.findFreshSnapshots(...)`를 조회한다. 30일 이내 active snapshot이 있으면 외부 API를 부르지 않고 `BuildingRegisterLookupResult`를 재구성한다. fresh snapshot이 없을 때만 `BuildingRegisterApiClient.lookupTitle(...)`을 호출하고, `BuildingRegisterTitleSnapshotStore.recordLookupResult(...)`가 `building_register_title_snapshots`에 `FOUND`/`AMBIGUOUS` snapshot을 저장하거나 `NOT_FOUND`일 때 기존 active snapshot을 비활성화한다. `BuildingRegisterApiQuery`, `BuildingRegisterApiItem`, `BuildingRegisterSnapshotConverter`, `BuildingRegisterApiResponseParser`, `DataGoKrBuildingRegisterApiClient`, `BuildingRegisterLookupResult`가 data.go.kr 응답을 내부 `BuildingRegisterSnapshot`으로 바꾼다. 조회 결과가 `FOUND`이고 `BuildingTypeResolver`가 MVP 물건 유형으로 분류할 수 있으면 `TransactionApiSelector`가 그 확정 유형을 기준으로 전월세/매매 실거래가 API 후보를 고른다. 조회 결과가 없거나 MVP 유형으로 분류되지 않더라도, `LeaseRiskTransactionEvidenceService`는 사용자 힌트와 정확 지번 전월세 실거래 존재 여부를 확인해 제한적인 분석 기준 후보를 만들 수 있다. 이 후보는 화면에서 `partial` 상태로 표시하고, 공부상 유형 확정으로 표현하지 않는다.

관심 부동산 리포트인 `GET /api/favorites/{favoriteId}/analysis`도 같은 주소 정제와 건축물대장 조회 경계를 재사용한다. 이전 구현처럼 `lawd_code`가 같은 최신 건축물대장 1건을 가져와 정확 매칭처럼 보여주지 않는다. `FavoriteService.getFavoriteAnalysis(...)`는 관심 부동산 주소가 지번까지 정제되면 `AddressResolution` 기준으로 건축물대장을 조회하고, 정제되지 않으면 `정확 주소 보완 필요` 상태를 내려보낸다. 이 상태는 건축물대장 결과가 없다는 뜻이 아니라, 자동 조회에 필요한 법정동·본번·부번 식별값이 부족하다는 뜻이다.

관심 리포트의 건축물대장 상태 표현은 아래 기준을 따른다.

| 백엔드 상태 | 화면 표현 | 의미 |
|---|---|---|
| `FOUND` | `정확 주소 확인` | 지번 기준 건축물대장 기본 정보가 연결됨 |
| `AMBIGUOUS` | `후보 여러 개` | 같은 지번에서 후보가 여러 건이라 임의 선택 금지 |
| `NOT_FOUND` | `조회 결과 없음` | 자동 조회 결과가 비었지만 건물 없음 또는 낮은 위험으로 해석 금지 |
| 주소 정제 실패 | `정확 주소 보완 필요` | 주소 검색에서 지번 주소를 선택해야 함 |
| `UNAVAILABLE`/`ERROR` | `자동 조회 제한` 또는 `조회 실패` | 외부 API 설정, 사용량, 응답 문제로 제한 진단 |

전월세 실거래가 자료는 `RentTransactionApiQuery`, `DataGoKrRentTransactionApiClient`, `RentTransactionApiResponseParser`, `RentTransactionLookupResult`가 담당한다. `LeaseRiskExternalDataLookupService`는 선택된 전월세 API의 `lawd_code + property_type + trade_kind` 기준으로 최근 3개월 `real_estate_transaction_facts`를 먼저 조회한다. fact가 3건 이상이면 data.go.kr client를 호출하지 않고 DB fact를 `RentTransactionSnapshot`으로 변환해 기존 진단 흐름에 반환한다. fact가 1~2건이면 최근 완료월부터 최대 3개월까지 API fallback을 순차 호출해 보강을 시도하고, 성공 snapshot을 `RealEstateTransactionFactCandidate`로 변환해 `RealEstateTransactionFactStore`가 idempotent upsert한다. fallback이 `FOUND`가 아니더라도 기존 DB fact가 있으면 그 sparse fact를 제한 근거로 반환하고, DB fact가 0건일 때만 API 결과의 `empty`, `unavailable`, `error` 상태를 그대로 내려준다. fallback 실행과 attempt는 `external_data_collection_runs`, `external_data_collection_attempts`에 남기고, 저장 후 `MarketStatisticsMonthlyService`가 affected monthly statistics를 갱신한다. `LeaseRiskTransactionEvidenceService`는 조회된 전월세 snapshot 중 정규화 주소의 지번과 일치하는 거래를 우선 사용하고, 없으면 확보 가능한 가장 가까운 법정동·유형 거래를 제한 기준으로 사용한다. `RentRiskDiagnosisCandidateService`는 필수 계약 금액이 비어 있을 때 먼저 같은 지번의 과거 전월세 snapshot을 후보 카드로 내려주고, 정확 지번 일치 후보가 없을 때만 같은 법정동 후보를 낮은 신뢰도의 참고 카드로 내려준다. `LeaseRiskDiagnosisDataStatusService`는 이 결과를 기존 프론트엔드가 읽는 `dataStatuses`의 `rent-transaction` 항목에 `success`, `empty`, `unavailable`, `error`로 표시한다. 사용자가 `exclusiveAreaSquareMeter` 또는 `floorNumber`를 입력하면 `TransactionSimilarityFilter`가 면적 ±10%(최소 5㎡), 층수 ±2층 기준의 유사 거래를 우선 비교 표본으로 고르고, 유사 거래가 없으면 전체 거래 중앙값으로 fallback한다. `DepositRiskCalculator`는 비교 표본의 전월세 보증금 중앙값 대비 입력 보증금 비율을 계산하고, `MONTHLY_RENT` 요청이면 월세 중앙값 대비 입력 월세 비율도 계산한다. 입력 금액이 비현실적으로 낮거나 높아도 "데이터 부족"으로만 뭉개지 않고, 입력값과 가장 가까운 공개 거래 금액을 함께 설명해 단위 입력, 전세/월세 칸, 실제 계약 조건을 재확인하도록 안내한다. `LeaseRiskDiagnosisRiskSummaryService`는 이 계산 결과를 `riskSummary.reasons` 문장으로 조립한다. 이 계산은 아직 보증금-월세 환산과 분위 비교를 포함하지 않는 1차 비교다.

매매 실거래가 자료는 `SaleTransactionApiQuery`, `DataGoKrSaleTransactionApiClient`, `SaleTransactionApiResponseParser`, `SaleTransactionLookupResult`가 담당한다. `LeaseRiskExternalDataLookupService`는 전월세와 같은 DB-first 기준을 매매에도 적용한다. 최근 3개월 같은 지역·유형·거래종류 fact가 3건 이상이면 API client를 호출하지 않고 DB fact를 `SaleTransactionSnapshot`으로 변환한다. fact가 1~2건이면 선택된 첫 매매 API를 fallback으로 호출하고, 성공 snapshot을 sale fact로 upsert한 뒤 `market_statistics_monthly`를 갱신한다. fallback이 `FOUND`가 아니더라도 기존 DB fact가 있으면 sparse fact를 제한 근거로 반환하고, DB fact가 0건일 때만 API 결과 상태를 그대로 내려준다. `LeaseRiskDiagnosisDataStatusService`는 이 결과를 기존 프론트엔드가 읽는 `dataStatuses`의 `sale-transaction` 항목에 `success`, `empty`, `unavailable`, `error`로 표시한다. 사용자가 `exclusiveAreaSquareMeter` 또는 `floorNumber`를 입력하면 `TransactionSimilarityFilter`가 매매 snapshot에도 같은 유사 조건을 적용한다. `DepositRiskCalculator`는 비교 표본의 매매 거래금액 중앙값 대비 입력 보증금 비율을 계산하고, `LeaseRiskDiagnosisRiskSummaryService`가 이를 `riskSummary.reasons` 문장으로 추가한다. 같은 `DepositRiskAssessment`는 `RentRiskDiagnosisService`를 통해 `RiskAssessmentService`에도 전달되어 `DEPOSIT_TO_VALUE_RISK`의 실제 점수 근거로 사용된다. 이 계산은 아직 공시가격 동·호 정밀 매칭과 후보 신뢰도 산정을 포함하지 않는 1차 추정이다.

공시가격 자료는 `PublicPriceApiQuery`, `VWorldPublicPriceApiClient`, `PublicPriceApiResponseParser`, `PublicPriceLookupResult`, `PublicPriceSnapshotStore`가 담당한다. `TransactionApiSelector`가 물건 유형에 따라 공동주택가격 또는 개별주택가격을 고르고, `LeaseRiskExternalDataLookupService`는 먼저 `PublicPriceSnapshotStore.findFreshLatestAvailable(...)`로 `public_price_snapshots`의 30일 이내 active snapshot을 조회한다. 현재 기준연도 query에 fresh snapshot이 없으면 기준연도를 생략한 latest-available query snapshot도 재사용한다. fresh snapshot이 없을 때만 `PublicPriceApiClient.lookupLatestAvailablePublicPrice(...)`가 VWorld를 호출한다. 현재 기준연도 결과가 `NOT_FOUND`이면 같은 PNU를 기준연도 없이 한 번 더 조회하고, 응답 중 가장 최신 `stdrYear`/`stdrMt` 가격 후보만 사용한다. `PublicPriceSnapshotStore.recordLookupResult(...)`는 `FOUND` 결과를 `public_price_snapshots`에 upsert하고, `NOT_FOUND`이면 같은 query key의 active snapshot을 비활성화한다. `LeaseRiskDiagnosisDataStatusService`는 이 결과를 `dataStatuses`의 `public-price` 항목에 `success`, `empty`, `unavailable`, `error`로 표시하고, 조회된 가격의 `가격 기준시점`을 상세 줄로 내려 보낸다. `DepositRiskCalculator`는 조회된 공시가격 대표값 대비 입력 보증금 비율을 계산하고, `LeaseRiskDiagnosisRiskSummaryService`가 이를 `riskSummary.reasons`에 보조 판단 문장으로 추가한다. 매매 실거래가 비율을 계산할 수 없을 때 이 공시가격 비율은 `DEPOSIT_TO_VALUE_RISK`의 `PARTIAL` 점수 근거가 된다. 공시가격은 시세나 권리관계를 대체하지 않으며, 현재 구현은 PNU 지번 단위 후보 저장과 동·호 정밀 매칭 전 단계다.

좌표 변환 자료는 `GeocodingApiQuery`, `VWorldGeocodingApiClient`, `GeocodingApiResponseParser`, `GeocodingLookupResult`가 담당한다. `VWorldGeocodingApiClient`는 `VWORLD_API_KEY`가 없으면 실제 HTTP 호출을 하지 않고 `GeocodingLookupStatus.UNAVAILABLE`을 반환한다. 성공 응답에서는 `result.point.x`, `result.point.y`, `result.crs`, `refined.text`를 읽어 `GeocodingCoordinate`로 변환한다. VWorld Geocoder 공식 문서는 별도 저장장치나 DB 저장을 금지하므로 ZIP:ON은 좌표를 진단 이력이나 별도 테이블에 저장하지 않고, 후행 GIS/생활/환경 API 호출 직전의 실시간 입력값으로만 사용해야 한다. 운영 로그도 원문 주소 대신 `addressHash`를 남긴다.

지도 위치확인 화면의 가능 지역 경계는 `GET /api/map/analyzable-locations`가 담당한다. 이 API는 현재 매물 지도 검색이 아니라, `legal_dong_codes`를 기준으로 `real_estate_transaction_facts`, `building_register_title_snapshots`, `public_price_snapshots`, `market_statistics_monthly` 중 기본 2개 이상 근거가 조합되는 법정동을 반환한다. 2개 출처 기준은 전국 실거래가와 월별 통계처럼 지역 단위로 넓게 쌓이는 과거 지표를 지도에 노출하기 위한 기본값이며, 정확 주소 공부·권리관계가 충분하다는 뜻은 아니다. `MapAnalyzableLocationRequest.minSourceCount`는 표시할 최소 출처 수를 정하고, `MapAnalyzableLocationResponse.metrics`는 출처별 저장 건수와 최신 기준시점을 내려준다. `MapService.getMapAnalyzableLocationList(...)`는 DB 커버리지 row를 조회한 뒤 `LegalDongBoundaryApiClient`로 VWorld `LT_C_ADEMD_INFO` 읍면동 경계 polygon을 실시간 조회해 `MapAnalyzableLocationResponse.boundaryPolygons`, `boundaryLookupStatus`, `boundaryLookupMessage`로 내려준다. `LegalDongBoundaryApiResponseParser`는 VWorld가 HTTP 200 안에 `status=ERROR`를 담아 보낸 경우를 빈 polygon으로 처리하지 않고 `ERROR` 상태로 분리한다. 프론트엔드 `MapPlaceholder.vue`는 `boundaryPolygons`가 있는 지역만 Kakao `Polygon`으로 표시하고, 색상은 가능/불가능만 전달하기 위해 투명한 파란색 하나로 통일한다. 경계가 비어 있으면 Kakao geocoder 대표 좌표나 `Circle`로 임의 가능 영역을 만들지 않는다. 대신 `MapSummaryBadge.vue`는 `boundaryLookupStatus`가 `ERROR` 또는 `UNAVAILABLE`이면 VWorld API 키·도메인 설정 문제로 polygon이 표시되지 않았음을 설명한다. 이 경계는 현재 매물이나 정확 건물 위치가 아니며, `MapService`의 응답 문구도 `분석 근거 충분` 같은 표현을 쓰지 않고 `지역 근거 n개 연결`과 "정확 주소 공부·권리관계가 충분하다는 뜻은 아님"을 함께 내려준다. 프론트엔드는 가능 지역 경계의 중심 좌표로 Juso 후보를 만들지 않는다.

지도 위치확인 화면의 정확 주소 후보 marker는 `GET /api/map/diagnosis-address-markers`가 담당한다. 이 API도 현재 매물 지도 검색이 아니라, 홈 정확 주소 위험진단 폼으로 보낼 수 있는 지번 단위 주소 후보를 찾기 위한 보조 API다. `MapDiagnosisAddressMarkerMapper`는 전국 주소 목록을 새로 만들지 않고 `property_identity_candidates`, `building_register_title_snapshots`, `public_price_snapshots`, `real_estate_transaction_facts`에 이미 저장된 근거를 PNU·법정동코드·본번·부번 기준으로 모아 `MapDiagnosisAddressMarkerResponse`를 만든다. 백엔드 request DTO는 `minSourceCount`가 없으면 1개 이상으로 정규화하지만, 현재 `MapPlaceholder.vue`는 주소 단위 근거 2개 이상을 명시해 "DB에 하나라도 있음" 수준의 후보가 곧 진단 성공을 보장하는 것처럼 보이지 않게 한다. 그래서 marker가 일부 서울 지역에만 몰리면 프론트 렌더링보다 `legal_dong_codes` catalog 범위, `LEGAL_DONG_CODE_SYNC_ENABLED`, 외부 데이터 수집 target, snapshot/fact 적재 범위를 먼저 확인해야 한다. 응답은 `markerType=DIAGNOSIS_ADDRESS`, `jusoAddress`, `evidenceSummary`, `primaryNotice`, `actionHint`를 포함하고, 프론트엔드는 청록색 house-pin marker로 가능 지역 경계와 모양·색을 분리한다. 현재 테이블에는 주소 후보별 좌표가 없으므로 백엔드는 `latitude`, `longitude`를 `null`로 둘 수 있고, `MapPlaceholder.vue`가 후보 주소를 Kakao geocoder로 화면 표시용 좌표로 보완한다. 이 geocoding 좌표는 저장하지 않으며, marker 클릭만 "선택한 진단 주소"로 승격한다. 지도 배경 클릭, 장소 검색 중심점, 가능 지역 경계는 정확 주소 후보를 만들지 않는다. 정확 주소 위험진단은 청록색 정확 주소 후보 marker 또는 홈/Juso 주소 검색에서 사용자가 선택한 후보로만 `POST /api/rent-risk-diagnoses`로 이어진다.

건축물 위험 안내는 `BuildingRiskAnalyzer`가 담당한다. 현재는 `BuildingRegisterSnapshot.mainUseName()`과 `useApprovalDate()`를 사용해 근린생활시설 등 주거 목적 불일치 가능성과 사용승인 후 경과 연수 기반 노후도 안내를 만든다. 이 결과는 `riskSummary.reasons`, `checklist`, `nextActions`로 내려가며, 위반건축물 여부는 아직 자동 판정하지 않고 원본 건축물대장과 중개대상물 확인설명서에서 직접 확인하도록 유지한다.

`LeaseRiskDiagnosisDataStatusService`는 진단 결과의 `dataStatuses`를 만든다. 주소 정제, 건축물대장, 전월세 실거래가, 매매 실거래가, 공시가격, 등기부등본 직접 확인 한계를 각각 `success`, `empty`, `unavailable`, `ambiguous`, `error` 같은 화면 상태와 상세 문장으로 변환한다. 이 service는 원본 API 응답을 노출하지 않고 사용자가 다음 판단을 위해 볼 수 있는 상태 카드만 만든다.

`LeaseRiskDiagnosisRiskSummaryService`는 진단 결과의 `riskSummary`를 만든다. 주소 정제 성공/실패, 건축물대장 확정 여부, 사용자 입력상 단독·다가구 가능성, `BuildingRiskAssessment.riskReasons()`, 실거래가/공시가격 조회 상태, 월세와 관리비 기반 월 고정 주거비, `DepositRiskCalculator`의 가격 비교 결과, `selectedRentCandidate` 선택 맥락을 하나의 사전진단 문장 목록으로 조립한다. 이 service는 "안전/위험 확정"을 하지 않고, 데이터 부족과 직접 확인 필요 영역을 문장으로 분리한다. 주소가 정제되고 건축물대장, 정확 지번 전월세 실거래, 정확 지번 기준 매매 실거래, 공시가격 중 하나라도 주소 단위 근거가 확보되면 상단 `riskLevel`은 `조건부 검토 가능`으로 내려가며, 등기부등본 권리관계·선순위 임차인·동호수 단위 원본 확인은 별도 확인 항목으로 남긴다. 주소는 정제됐지만 거래 근거가 정확 지번이 아니라 같은 법정동·유형 수준이면 `지역 근거 참고`로 표시하고, 핵심 근거가 전혀 없으면 `추가 확인 필요`, 주소 정제 자체가 실패하면 `데이터 부족`으로 표시한다.

`LeaseRiskDiagnosisNextActionService`는 진단 결과의 `nextActions`를 만든다. 주소 재확인, 건축물대장 원본 대조, 등기부등본 열람, 보증보험 확인 같은 기본 행동에 더해, 공부상 또는 사용자 입력상 단독·다가구 가능성이 있으면 선순위 임차인 보증금 내역 요청을 추가한다. 또한 `DiagnosisPurpose.directConfirmationRequiredItems`와 `BuildingRiskAssessment.nextActions()`를 합쳐 AI나 API가 확정하면 안 되는 영역을 사용자 행동으로 분리한다.

`LeaseRiskDiagnosisChecklistService`는 진단 결과의 `checklist`를 만든다. 주소와 법정동코드 확인, 건축물대장 원본 확인, 등기부등본 갑구·을구 확인, 선순위 임차인 보증금 내역 요청, 전세보증보험 가능 여부, 관리비 세부 항목, 계약금 입금 계좌, 현장 하자 확인을 기본 항목으로 둔다. 건축물대장 유형이 확인되면 표제부 유형 확인 항목을 추가하고, 근린생활시설 의심 유형이면 주거 사용 가능성 확인 항목을 추가한다.

`RiskAssessmentService`는 기존 진단 응답, `LeaseRiskMarketSignalService`가 만든 R-ONE 시장 signal, 그리고 보증금 대비 기준가 계산 결과인 `DepositRiskAssessment`를 `NormalizedRiskInput`으로 줄이고, `RiskTemplateResolver`가 제공하는 `LEASE_RENT_RISK` 12개 고정 항목을 배치로 산정한다. `OPENAI_RISK_SCORING_ENABLED=false`이면 `RiskScoringFallbackService`가 rule-based fallback 결과를 만든다. OpenAI가 켜져 있어도 `RiskPromptBuilder`는 정규화된 공공데이터와 사용자 입력 요약만 넘기고, `RiskScoringResponseValidator.validateBatch(...)`가 12개 항목이 모두 들어온 JSON Schema 응답, 허용 필드, enum, 점수 범위, 상태별 점수 가능 여부를 통과한 결과만 받아들인다. batch 호출이나 검증이 실패하면 12개 항목 모두 `HYBRID_FALLBACK`으로 계산하며, `RiskAssessmentResponse.aiProcessing`은 사용자/관리자 화면이 `AI 성공`, `AI 실패 fallback`, `AI 비활성 fallback`을 구분해 표시할 수 있도록 시도 수, 성공 수, fallback 수, 429 등 short-circuit 여부를 내려준다. `DEPOSIT_TO_VALUE_RISK`는 매매 실거래가 또는 공시가격 금액 비율이 계산된 경우 그 점수를 사용하고, 단순히 데이터 상태만 성공이라는 이유로 고정 점수를 만들지 않는다. 전월세/매매/공시가격 정확 주소 근거가 부족해도 목적에 맞는 지역 시장 signal이 있으면 해당 항목은 `DATA_MISSING` 대신 `PARTIAL` 보조 근거로 표시할 수 있다. 등기부등본 권리관계, 선순위 임차인 보증금, 보증보험 가능성, 현장 하자, 계약 전 checklist는 `NEEDS_USER_DOCUMENT` 또는 `MISSING_DATA`로 남겨 사용자 직접 확인 행동으로 연결한다. 이 직접 확인 항목에는 숫자 `riskScore`를 붙이지 않고 총점·불확실성 패널티에서도 제외한다. `RiskEvidenceSnapshotService`는 저장된 진단 이력 ID를 기준으로 각 criterion의 `evidence`와 `missingData`를 `risk_evidence_snapshots`에 남긴다. 이 table은 OpenAI 원문 감사 로그가 아니라 사용자에게 설명 가능한 근거, 한계, required action을 재분석하기 위한 snapshot이다.

구현된 class:

```text
backend/src/main/java/com/zipon/domain/AddressNormalizationResult.java
backend/src/main/java/com/zipon/domain/AddressNormalizationStatus.java
backend/src/main/java/com/zipon/domain/BuildingRegisterLookupResult.java
backend/src/main/java/com/zipon/domain/BuildingRegisterLookupStatus.java
backend/src/main/java/com/zipon/domain/BuildingRegisterSnapshot.java
backend/src/main/java/com/zipon/domain/BuildingRegisterTitleSnapshot.java
backend/src/main/java/com/zipon/domain/BuildingRegisterDiagnosis.java
backend/src/main/java/com/zipon/domain/BuildingRiskAssessment.java
backend/src/main/java/com/zipon/domain/DiagnosisPurpose.java
backend/src/main/java/com/zipon/domain/DepositRiskAssessment.java
backend/src/main/java/com/zipon/domain/JibunAddress.java
backend/src/main/java/com/zipon/domain/LegalDongCode.java
backend/src/main/java/com/zipon/domain/LegalDongCodeMatch.java
backend/src/main/java/com/zipon/domain/LeaseRiskBuildingType.java
backend/src/main/java/com/zipon/domain/LeaseRiskPropertyTypeInterpretation.java
backend/src/main/java/com/zipon/domain/NormalizedLeaseRiskAddress.java
backend/src/main/java/com/zipon/domain/PublicPriceDataType.java
backend/src/main/java/com/zipon/domain/PublicPriceLookupResult.java
backend/src/main/java/com/zipon/domain/PublicPriceLookupStatus.java
backend/src/main/java/com/zipon/domain/PublicPriceQueryCriteria.java
backend/src/main/java/com/zipon/domain/PublicPriceSnapshot.java
backend/src/main/java/com/zipon/domain/StoredPublicPriceSnapshot.java
backend/src/main/java/com/zipon/domain/RiskEvidenceSnapshot.java
backend/src/main/java/com/zipon/domain/RiskEvidenceType.java
backend/src/main/java/com/zipon/domain/GeocodingAddressType.java
backend/src/main/java/com/zipon/domain/GeocodingCoordinate.java
backend/src/main/java/com/zipon/domain/GeocodingLookupResult.java
backend/src/main/java/com/zipon/domain/GeocodingLookupStatus.java
backend/src/main/java/com/zipon/domain/RentTransactionLookupResult.java
backend/src/main/java/com/zipon/domain/RentTransactionLookupStatus.java
backend/src/main/java/com/zipon/domain/RentTransactionQueryCriteria.java
backend/src/main/java/com/zipon/domain/RentTransactionSnapshot.java
backend/src/main/java/com/zipon/domain/SaleTransactionLookupResult.java
backend/src/main/java/com/zipon/domain/SaleTransactionLookupStatus.java
backend/src/main/java/com/zipon/domain/SaleTransactionQueryCriteria.java
backend/src/main/java/com/zipon/domain/SaleTransactionSnapshot.java
backend/src/main/java/com/zipon/domain/TransactionApiSelection.java
backend/src/main/java/com/zipon/domain/TransactionApiType.java
backend/src/main/java/com/zipon/external/buildingregister/BuildingRegisterApiItem.java
backend/src/main/java/com/zipon/external/buildingregister/BuildingRegisterApiClient.java
backend/src/main/java/com/zipon/external/buildingregister/BuildingRegisterApiQuery.java
backend/src/main/java/com/zipon/external/buildingregister/BuildingRegisterApiResponseParser.java
backend/src/main/java/com/zipon/external/buildingregister/BuildingRegisterSnapshotConverter.java
backend/src/main/java/com/zipon/external/buildingregister/DataGoKrBuildingRegisterApiClient.java
backend/src/main/java/com/zipon/external/transaction/DataGoKrRentTransactionApiClient.java
backend/src/main/java/com/zipon/external/transaction/DataGoKrSaleTransactionApiClient.java
backend/src/main/java/com/zipon/external/transaction/RentTransactionApiClient.java
backend/src/main/java/com/zipon/external/transaction/RentTransactionApiQuery.java
backend/src/main/java/com/zipon/external/transaction/RentTransactionApiResponseParser.java
backend/src/main/java/com/zipon/external/transaction/SaleTransactionApiClient.java
backend/src/main/java/com/zipon/external/transaction/SaleTransactionApiQuery.java
backend/src/main/java/com/zipon/external/transaction/SaleTransactionApiResponseParser.java
backend/src/main/java/com/zipon/external/publicprice/PublicPriceApiClient.java
backend/src/main/java/com/zipon/external/publicprice/PublicPriceApiQuery.java
backend/src/main/java/com/zipon/external/publicprice/PublicPriceApiResponseParser.java
backend/src/main/java/com/zipon/external/publicprice/VWorldPublicPriceApiClient.java
backend/src/main/java/com/zipon/external/geocoder/GeocodingApiClient.java
backend/src/main/java/com/zipon/external/geocoder/GeocodingApiQuery.java
backend/src/main/java/com/zipon/external/geocoder/GeocodingApiResponseParser.java
backend/src/main/java/com/zipon/external/geocoder/VWorldGeocodingApiClient.java
backend/src/main/java/com/zipon/mapper/LegalDongCodeMapper.java
backend/src/main/java/com/zipon/mapper/LegalDongCodeLookupRow.java
backend/src/main/java/com/zipon/mapper/ExternalDataSourceMapper.java
backend/src/main/java/com/zipon/mapper/ExternalDataCollectionRunMapper.java
backend/src/main/java/com/zipon/mapper/ExternalDataCollectionAttemptMapper.java
backend/src/main/java/com/zipon/mapper/BuildingRegisterTitleSnapshotMapper.java
backend/src/main/java/com/zipon/mapper/RealEstateTransactionFactMapper.java
backend/src/main/java/com/zipon/mapper/MarketStatisticsMonthlyMapper.java
backend/src/main/java/com/zipon/mapper/PublicPriceSnapshotMapper.java
backend/src/main/java/com/zipon/mapper/RiskEvidenceSnapshotMapper.java
backend/src/main/java/com/zipon/service/BuildingRiskAnalyzer.java
backend/src/main/java/com/zipon/service/BuildingRegisterTitleSnapshotStore.java
backend/src/main/java/com/zipon/service/BuildingTypeResolver.java
backend/src/main/java/com/zipon/service/DiagnosisPurposeCatalogService.java
backend/src/main/java/com/zipon/service/DepositRiskCalculator.java
backend/src/main/java/com/zipon/service/ExternalDataCollectionService.java
backend/src/main/java/com/zipon/service/InMemoryLegalDongCodeCatalog.java
backend/src/main/java/com/zipon/service/LeaseRiskAddressNormalizer.java
backend/src/main/java/com/zipon/service/LeaseRiskBuildingRegisterLookupService.java
backend/src/main/java/com/zipon/service/LeaseRiskDiagnosisAddressSectionService.java
backend/src/main/java/com/zipon/service/LeaseRiskDiagnosisChecklistService.java
backend/src/main/java/com/zipon/service/LeaseRiskDiagnosisDataStatusService.java
backend/src/main/java/com/zipon/service/LeaseRiskDiagnosisInputSummaryService.java
backend/src/main/java/com/zipon/service/LeaseRiskDiagnosisNextActionService.java
backend/src/main/java/com/zipon/service/LeaseRiskDiagnosisPropertyIdentityService.java
backend/src/main/java/com/zipon/service/LeaseRiskDiagnosisRiskSummaryService.java
backend/src/main/java/com/zipon/service/LeaseRiskDiagnosisRequestValidator.java
backend/src/main/java/com/zipon/service/LeaseRiskExternalDataLookupService.java
backend/src/main/java/com/zipon/service/LeaseRiskPropertyTypeInterpreter.java
backend/src/main/java/com/zipon/service/LegalDongCodeCatalog.java
backend/src/main/java/com/zipon/domain/AddressResolution.java
backend/src/main/java/com/zipon/domain/MarketStatisticsMonthlyInsight.java
backend/src/main/java/com/zipon/service/MarketStatisticsMonthlyService.java
backend/src/main/java/com/zipon/service/MyBatisLegalDongCodeCatalog.java
backend/src/main/java/com/zipon/service/PropertyIdentityCandidateService.java
backend/src/main/java/com/zipon/service/PublicPriceSnapshotStore.java
backend/src/main/java/com/zipon/service/RealEstateTransactionFactCandidateFactory.java
backend/src/main/java/com/zipon/service/RealEstateTransactionFactStore.java
backend/src/main/java/com/zipon/service/RentRiskDiagnosisService.java
backend/src/main/java/com/zipon/service/RiskEvidenceSnapshotService.java
backend/src/main/java/com/zipon/service/TransactionFactFingerprintService.java
backend/src/main/java/com/zipon/service/TransactionApiSelector.java
backend/src/main/java/com/zipon/service/TransactionSimilarityFilter.java
backend/src/main/resources/db/migration/V5__create_legal_dong_codes.sql
backend/src/main/resources/db/migration/V10__create_legal_dong_alias_schema.sql
backend/src/main/resources/db/migration/V20__create_external_data_fact_statistics_schema.sql
backend/src/main/resources/db/migration/V21__create_property_identity_candidates.sql
backend/src/main/resources/db/migration/V22__create_building_register_title_snapshots.sql
backend/src/main/resources/db/migration/V23__create_public_price_snapshots.sql
backend/src/main/resources/db/migration/V24__create_risk_evidence_snapshots.sql
```

검증 test:

```text
backend/src/test/java/com/zipon/domain/LegalDongCodeTest.java
backend/src/test/java/com/zipon/domain/BuildingRegisterLookupResultTest.java
backend/src/test/java/com/zipon/domain/DiagnosisPurposeTest.java
backend/src/test/java/com/zipon/external/buildingregister/BuildingRegisterApiResponseParserTest.java
backend/src/test/java/com/zipon/external/buildingregister/BuildingRegisterApiQueryTest.java
backend/src/test/java/com/zipon/external/buildingregister/DataGoKrBuildingRegisterApiClientTest.java
backend/src/test/java/com/zipon/external/buildingregister/BuildingRegisterSnapshotConverterTest.java
backend/src/test/java/com/zipon/service/BuildingRegisterTitleSnapshotStoreTest.java
backend/src/test/java/com/zipon/external/transaction/DataGoKrRentTransactionApiClientTest.java
backend/src/test/java/com/zipon/external/transaction/DataGoKrSaleTransactionApiClientTest.java
backend/src/test/java/com/zipon/external/transaction/RentTransactionApiQueryTest.java
backend/src/test/java/com/zipon/RentRiskDiagnosisBuildingRiskIntegrationTest.java
backend/src/test/java/com/zipon/external/transaction/RentTransactionApiResponseParserTest.java
backend/src/test/java/com/zipon/external/transaction/SaleTransactionApiQueryTest.java
backend/src/test/java/com/zipon/external/transaction/SaleTransactionApiResponseParserTest.java
backend/src/test/java/com/zipon/external/geocoder/GeocodingApiQueryTest.java
backend/src/test/java/com/zipon/external/geocoder/GeocodingApiResponseParserTest.java
backend/src/test/java/com/zipon/external/geocoder/VWorldGeocodingApiClientTest.java
backend/src/test/java/com/zipon/external/publicprice/PublicPriceApiQueryTest.java
backend/src/test/java/com/zipon/external/publicprice/PublicPriceApiResponseParserTest.java
backend/src/test/java/com/zipon/external/publicprice/VWorldPublicPriceApiClientTest.java
backend/src/test/java/com/zipon/service/LeaseRiskAddressNormalizerTest.java
backend/src/test/java/com/zipon/service/LeaseRiskBuildingRegisterLookupServiceTest.java
backend/src/test/java/com/zipon/service/LeaseRiskDiagnosisChecklistServiceTest.java
backend/src/test/java/com/zipon/service/LeaseRiskDiagnosisDataStatusServiceTest.java
backend/src/test/java/com/zipon/service/LeaseRiskDiagnosisNextActionServiceTest.java
backend/src/test/java/com/zipon/service/LeaseRiskDiagnosisRiskSummaryServiceTest.java
backend/src/test/java/com/zipon/service/LeaseRiskExternalDataLookupServiceTest.java
backend/src/test/java/com/zipon/service/RealEstateTransactionFactStoreTest.java
backend/src/test/java/com/zipon/service/MarketStatisticsMonthlyServiceTest.java
backend/src/test/java/com/zipon/service/PropertyIdentityCandidateServiceTest.java
backend/src/test/java/com/zipon/service/PublicPriceSnapshotStoreTest.java
backend/src/test/java/com/zipon/service/RiskEvidenceSnapshotServiceTest.java
backend/src/test/java/com/zipon/service/LeaseRiskPropertyTypeInterpreterTest.java
backend/src/test/java/com/zipon/service/DepositRiskCalculatorTest.java
backend/src/test/java/com/zipon/service/MyBatisLegalDongCodeCatalogIntegrationTest.java
backend/src/test/java/com/zipon/service/BuildingTypeResolverTest.java
backend/src/test/java/com/zipon/service/TransactionApiSelectorTest.java
backend/src/test/java/com/zipon/service/TransactionSimilarityFilterTest.java
backend/src/test/java/com/zipon/DiagnosisPurposeCatalogIntegrationTest.java
backend/src/test/java/com/zipon/RentRiskDiagnosisBuildingRegisterIntegrationTest.java
backend/src/test/java/com/zipon/RentRiskDiagnosisRentTransactionIntegrationTest.java
backend/src/test/java/com/zipon/RentRiskDiagnosisSaleTransactionIntegrationTest.java
backend/src/test/java/com/zipon/RentRiskDiagnosisPublicPriceIntegrationTest.java
backend/src/test/java/com/zipon/RentRiskDiagnosisIntegrationTest.java
```

`LeaseRiskAddressNormalizer`는 지번 주소 중심의 로컬 파서를 먼저 실행한다. 예를 들어 `서울시 관악구 신림동 1422-5`를 `서울특별시 관악구 신림동 1422-5`로 정규화하고, `LegalDongCode("1162010200")`에서 실거래가 API용 `LAWD_CD`인 `11620`을 계산한다. `서울 성동구 성수동1가 685-143`처럼 `1가`, `2가` 형태의 법정동명도 지번 주소로 인식한다. 행정동 alias가 들어오면 `LegalDongCodeMatch`가 사용자가 입력한 동명과 canonical 법정동명을 함께 들고, 외부 API 입력에는 법정동 기준 주소를 사용한다.

로컬 `legal_dong_codes`와 `legal_dong_aliases` seed table은 전체 법정동/행정동 DB가 아니다. 현재는 MVP 대표 시나리오와 테스트를 위한 starter catalog이므로, seed에 없는 주소는 기존처럼 주소 정제 실패 상태로 내려간다. Juso 팝업 API는 사용자가 정확한 주소를 고르는 입력 보조 UI이고, 법정동코드 확정 범위를 DB seed 밖으로 자동 확장하지 않는다.

`BuildingRegisterApiQuery`는 `NormalizedLeaseRiskAddress.addressResolution()`이 계산한 `sigunguCd`, `bjdongCd`, `platGbCd`, `bun`, `ji`를 건축물대장 조회 입력으로 사용한다. 법정동코드 10자리 중 앞 5자리는 `sigunguCd`, 뒤 5자리는 `bjdongCd`이며, `JibunAddress.mountain()`은 `AddressResolution` 안에서 일반 대지 `platGbCd=0`, 산 `platGbCd=1`로 변환된다. 번과 지는 `bun`, `ji` 4자리 문자열로 padding한다.

`BuildingRegisterSnapshotConverter`는 건축HUB 응답 item의 `mainPurpsCdNm`, `regstrGbCdNm`, `regstrKindCdNm`, `hhldCnt`, `fmlyCnt`, `useAprDay`만 내부 snapshot으로 변환한다. 외부 API 필드 전체를 service layer로 넘기지 않는 이유는 MVP 판단에 필요한 최소 필드와 외부 원본 스키마를 분리하기 위해서다.

`DataGoKrBuildingRegisterApiClient`는 data.go.kr 건축HUB 표제부 조회 endpoint인 `/1613000/BldRgstHubService/getBrTitleInfo`를 호출한다. 요청 parameter는 `serviceKey`, `sigunguCd`, `bjdongCd`, `platGbCd`, `bun`, `ji`, `pageNo`, `numOfRows`, `_type=json`이다. service key가 없으면 실제 HTTP 호출을 하지 않고 `UNAVAILABLE`을 반환한다. HTTP 오류나 JSON parsing 오류는 `ERROR`로 반환한다.

`LeaseRiskBuildingRegisterLookupService`는 주소 정제가 끝난 뒤 건축물대장 표제부 DB-first 조회, 외부 API fallback, 내부 유형 판별을 묶는 협력 객체다. 주소 정제가 실패하면 외부 API를 호출하지 않고 `BuildingRegisterDiagnosis.notAttempted()`를 반환한다. 정제 주소가 있으면 `BuildingRegisterTitleSnapshotStore`에서 30일 이내 active snapshot을 먼저 찾고, 없을 때만 `BuildingRegisterApiClient`를 호출한다. 조회 결과가 있으면 `BuildingTypeResolver`로 아파트, 오피스텔, 연립·다세대, 단독·다가구, 근린생활시설 의심, UNKNOWN 중 하나로 분류해 이후 실거래가 API 선택 기준을 제공한다.

`DataGoKrRentTransactionApiClient`는 `TransactionApiType`에 따라 `/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent`, `/1613000/RTMSDataSvcOffiRent/getRTMSDataSvcOffiRent`, `/1613000/RTMSDataSvcRHRent/getRTMSDataSvcRHRent`, `/1613000/RTMSDataSvcSHRent/getRTMSDataSvcSHRent` 중 하나를 호출한다. 요청 parameter는 `serviceKey`, `LAWD_CD`, `DEAL_YMD`, `pageNo`, `numOfRows`다. 첨부 실거래가 기술문서 기준으로 성공 코드는 `000` 예시가 있고 일부 공공 API는 `00`을 쓰므로 parser는 둘 다 성공으로 취급한다. XML 응답은 `aptNm`, `mhouseNm`, `deposit`, `monthlyRent`, `excluUseAr`, `dealYear`, `dealMonth`, `dealDay` 같은 영문 태그를 우선 읽는다.

`DataGoKrSaleTransactionApiClient`는 매매 API endpoint인 `/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev`, `/1613000/RTMSDataSvcOffiTrade/getRTMSDataSvcOffiTrade`, `/1613000/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade`, `/1613000/RTMSDataSvcSHTrade/getRTMSDataSvcSHTrade`를 유형별로 호출한다. 아파트 매매는 첨부된 `아파트 매매 실거래가 상세자료기술문서.pdf` 기준의 상세 자료 endpoint를 쓴다. 매매 parser는 `dealAmount`를 `saleAmountManwon`으로 분리해 전월세의 `deposit`과 섞이지 않게 한다. `LeaseRiskExternalDataLookupService`는 조회 결과를 최근 3개월 snapshot으로 모으고, `LeaseRiskDiagnosisDataStatusService`는 이를 `sale-transaction` 상태와 상세 문장으로 내려준다.

`LeaseRiskExternalDataLookupService`는 전월세 실거래가, 매매 실거래가, 공시가격 조회 orchestration을 담당한다. 실거래가는 최근 3개월 DB fact를 먼저 조회하고, 충분하면 외부 API를 호출하지 않는다. 부족하면 기존 API client를 fallback으로 호출하고, fallback 결과를 `RealEstateTransactionFactStore`에 저장한 뒤 `MarketStatisticsMonthlyService`로 월별 통계를 갱신한다. 공시가격은 `PublicPriceSnapshotStore`가 PNU, data type, 기준연도 query key로 30일 이내 DB snapshot을 먼저 조회한다. fresh snapshot이 없을 때만 VWorld public price client를 호출하고, 성공 결과를 `public_price_snapshots`에 저장한다. 외부 API가 `UNAVAILABLE` 또는 `ERROR`를 반환하면 이미 확보한 거래가 있을 때는 확보된 거래를 우선 사용하고 아직 거래가 없으면 해당 실패 상태를 그대로 반환한다. `RentRiskDiagnosisService`는 이 service를 호출해 진단 흐름을 조율하고, 데이터 상태 카드 조립은 `LeaseRiskDiagnosisDataStatusService`, 위험 요약 문장 조립은 `LeaseRiskDiagnosisRiskSummaryService`에 맡긴다.

`TransactionSimilarityFilter`는 사용자가 입력한 전용면적과 층수가 있으면 전월세·매매 snapshot에서 면적 ±10%(최소 5㎡), 층수 ±2층 조건에 맞는 거래를 우선 비교 표본으로 만든다. 유사 거래가 없으면 "데이터 없음"으로 안전하게 보지 않고 전체 거래 중앙값으로 fallback하며, 이 경우 비교 신뢰도가 낮다는 문장을 함께 내려준다. `DepositRiskCalculator`는 비교 표본의 보증금, 월세, 매매가 중 유효한 값으로 대표값을 계산하고, 사용자 입력값이 그 대표값 대비 몇 퍼센트인지 계산 결과 문장으로 만든다. `LeaseRiskDiagnosisRiskSummaryService`는 이 계산 결과를 주소/건축물/권리관계 직접 확인 안내와 함께 `riskSummary.reasons`에 합친다. 120% 이상 전월세 보증금이나 월세, 80% 이상 매매가 대비 보증금은 더 강한 확인 필요 문장을 만든다. 이 비교는 보증금 차이와 관리비를 환산하지 않는 1차 비교이며, 공시가격과 권리관계를 대체하지 않는다.

`LeaseRiskDiagnosisRiskSummaryService`는 사용자가 입력한 `monthlyRentAmountManwon`과 `maintenanceFeeAmountManwon`으로 월세 계약의 월 고정 주거비를 문장으로 안내한다. 이 값은 사용자가 입력한 금액의 합계일 뿐 관리비 고지서나 K-APT 원본 데이터로 검증된 값이 아니며, 관리비 포함 항목과 별도 부과 항목은 계약서와 중개대상물 확인설명서에서 다시 확인해야 한다. 관리비/생활 인프라 API 자동 분석은 아직 붙이지 않는다.

`LeaseRiskDiagnosisNextActionService.createNextActions(...)`는 목적별 직접 확인 영역을 `DiagnosisPurpose.directConfirmationRequiredItems`에서 읽어 `직접 확인 필요: ...` 문장으로 추가한다. 이 방식은 전세·월세뿐 아니라 향후 매매, 상가, 토지, 꼬마빌딩 목적에서도 "서비스가 확정하지 않는 영역"을 같은 응답 필드로 내려주기 위한 확장 지점이다.

`BuildingRegisterApiResponseParser`는 data.go.kr JSON 응답에서 `response.header.resultCode`가 `00`인 경우에만 `items.item`을 읽는다. `items.item`은 단일 객체일 수도 있고 배열일 수도 있으므로 둘 다 테스트한다. 응답이 비어 있으면 `NOT_FOUND`이고, 결과 코드가 실패이거나 JSON이 깨졌으면 `ERROR`다.

`BuildingRegisterLookupResult`는 건축물대장 후보 수와 외부 API 상태를 `FOUND`, `AMBIGUOUS`, `NOT_FOUND`, `UNAVAILABLE`, `ERROR`로 나눈다. 후보가 여러 개면 다음 게이트로 바로 넘어가지 않고 사용자 동/호수 보완 또는 후보 선택이 필요하다. `NOT_FOUND`나 `UNAVAILABLE`은 안전하다는 뜻이 아니라 제한 진단 상태다. `BuildingRegisterDiagnosis`는 이 조회 상태와 내부 물건 유형을 함께 들고, `propertyIdentity`는 `LeaseRiskDiagnosisPropertyIdentityService`, `dataStatuses`는 `LeaseRiskDiagnosisDataStatusService`, `riskSummary`는 `LeaseRiskDiagnosisRiskSummaryService`, `checklist`와 `nextActions`는 각 응답 assembler service가 맡는다.

사용자에게 노출되는 정확 주소 위험진단 endpoint는 `POST /api/rent-risk-diagnoses`와 `POST /api/rent-risk-diagnoses/address-candidates`다. 전자는 계약 금액이 있는 진단 생성 endpoint이고, 후자는 정확 주소는 있지만 계약 금액을 모를 때 해당 지번의 과거 전월세 실거래 후보를 먼저 고르는 입력 보조 endpoint다. 둘 다 전체 MVP 완성이 아니라 현재 구현된 내부 gate를 프론트엔드와 연결하는 slice다. 별도로 `GET /api/diagnosis-purposes`는 `DiagnosisPurposeCatalogController`가 공개 GET으로 제공하며, 전세·월세 목적만 실행 가능하고 나머지 확장 목적은 로드맵/직접 확인 영역으로만 노출한다.

진단 결과는 `RentRiskDiagnosisHistoryService`가 `rent_risk_diagnosis_histories`에 저장한다. 저장 대상은 외부 API 원본 전체가 아니라 사용자의 입력 조건, 정제된 주소/코드, 위험 수준, 최종 request/response snapshot이다. 이후 `RiskEvidenceSnapshotService`가 `riskAssessment.criteria[*].evidence`와 `missingData`를 `risk_evidence_snapshots`에 저장한다. 이 row는 `REGISTRY_RIGHTS_NOT_CHECKED`, `SENIOR_TENANT_DEPOSIT_UNKNOWN`, `GUARANTEE_INSURANCE_UNCONFIRMED`, `PUBLIC_PRICE_UNAVAILABLE`처럼 화면과 운영자가 추적해야 할 근거/한계/행동 단위다. 관리자는 `AdminRentRiskDiagnosisHistoryController`의 `/api/admin/rent-risk-diagnoses`와 `/api/admin/rent-risk-diagnoses/{diagnosisId}`로 이력을 조회한다. 이 관리자 API는 `/api/admin/**` 보안 규칙을 따르며 임의 SQL 실행 기능이 아니다.

등기부등본은 공공 API로 자동 확정하지 않는다. 현재 구현은 로그인 사용자가 본인 진단 이력에 대해 `GET/PUT /api/rent-risk-diagnoses/{diagnosisId}/registry-document-confirmation`으로 `NOT_CHECKED`, `CHECKED`, `NEEDS_HELP` 상태와 memo를 남기는 수동 확인 확장점이다. 이 상태는 `registry_document_confirmations`에 저장하고, 원본 PDF나 OCR 대상 파일은 아직 받지 않는다. 민감 파일 업로드는 S3/object storage, 암호화, 보존 기간, 삭제 정책이 정해진 뒤 별도 API로 분리한다.

구현된 class:

```text
backend/src/main/java/com/zipon/controller/AdminRentRiskDiagnosisHistoryController.java
backend/src/main/java/com/zipon/controller/DiagnosisPurposeCatalogController.java
backend/src/main/java/com/zipon/controller/RentRiskDiagnosisController.java
backend/src/main/java/com/zipon/domain/DiagnosisPurpose.java
backend/src/main/java/com/zipon/domain/RentRiskDiagnosisHistory.java
backend/src/main/java/com/zipon/domain/LeaseContractPurpose.java
backend/src/main/java/com/zipon/dto/response/DiagnosisPurposeCatalogResponse.java
backend/src/main/java/com/zipon/dto/request/RentRiskDiagnosisRequest.java
backend/src/main/java/com/zipon/dto/response/RentRiskDiagnosisHistoryDetailResponse.java
backend/src/main/java/com/zipon/dto/response/RentRiskDiagnosisHistorySummaryResponse.java
backend/src/main/java/com/zipon/dto/response/RentRiskDiagnosisResponse.java
backend/src/main/java/com/zipon/mapper/RentRiskDiagnosisHistoryMapper.java
backend/src/main/java/com/zipon/service/DiagnosisPurposeCatalogService.java
backend/src/main/java/com/zipon/service/RentRiskDiagnosisHistoryService.java
backend/src/main/java/com/zipon/service/RentRiskDiagnosisService.java
backend/src/main/java/com/zipon/service/LeaseRiskDiagnosisRequestValidator.java
backend/src/main/java/com/zipon/service/LeaseRiskDiagnosisInputSummaryService.java
backend/src/main/java/com/zipon/service/LeaseRiskDiagnosisAddressSectionService.java
backend/src/main/java/com/zipon/service/LeaseRiskDiagnosisPropertyIdentityService.java
backend/src/main/java/com/zipon/service/LeaseRiskDiagnosisDataStatusService.java
backend/src/main/java/com/zipon/service/LeaseRiskDiagnosisRiskSummaryService.java
backend/src/main/resources/db/migration/V11__create_rent_risk_diagnosis_history.sql
frontend/src/api/rentRiskDiagnosisApi.js
frontend/src/components/home/MainHero.vue
frontend/src/components/common/SearchBar.vue
frontend/src/components/home/LeaseRiskDiagnosisResult.vue
frontend/src/utils/communityDraft.js
frontend/src/views/CommunityListView.vue
frontend/src/views/MyPageView.vue
```

검증 test:

```text
backend/src/test/java/com/zipon/RentRiskDiagnosisIntegrationTest.java
backend/src/test/java/com/zipon/RentRiskDiagnosisHistoryIntegrationTest.java
backend/src/test/java/com/zipon/service/LeaseRiskDiagnosisRequestValidatorTest.java
backend/src/test/java/com/zipon/service/LeaseRiskDiagnosisInputSummaryServiceTest.java
backend/src/test/java/com/zipon/service/LeaseRiskDiagnosisAddressSectionServiceTest.java
backend/src/test/java/com/zipon/service/LeaseRiskDiagnosisPropertyIdentityServiceTest.java
backend/src/test/java/com/zipon/service/LeaseRiskDiagnosisDataStatusServiceTest.java
backend/src/test/java/com/zipon/service/LeaseRiskDiagnosisRiskSummaryServiceTest.java
```

현재 endpoint가 하는 일:

```text
1. `RentRiskDiagnosisRequest`로 주소, 계약 목적, 보증금, 월세, 관리비, 선택 입력인 전용면적·층수, 사용자가 알고 있는 매물 유형, 사용자가 본 매물 설명을 받는다.
2. `LeaseRiskDiagnosisRequestValidator`가 `LeaseContractPurposeProfile` 기준으로 전세·월세 목적별 필수 금액 입력을 검증한다. 화면에서 필수 금액이 비어 있으면 이 endpoint로 보내기 전에 `POST /api/rent-risk-diagnoses/address-candidates`로 정확 지번의 과거 전월세 후보를 먼저 조회한다.
3. `LeaseRiskDiagnosisInputSummaryService`가 사용자 입력을 `inputSummary`로 조립한다.
4. `LeaseRiskAddressNormalizer`로 지번 주소를 정제하고 `legal_dong_codes`/`legal_dong_aliases`에서 법정동코드와 `LAWD_CD`를 찾는다.
5. `LeaseRiskDiagnosisAddressSectionService`가 주소 정제 결과를 `address`로 조립한다.
6. `LeaseRiskPropertyTypeInterpreter`가 사용자 표현과 매물 설명을 `LeaseRiskPropertyTypeInterpretation`으로 바꿔 후보 유형과 분석 방향을 만든다.
7. `LeaseRiskBuildingRegisterLookupService`가 건축물대장 표제부를 조회하고 `BuildingTypeResolver`로 공부상 물건 유형을 판별한다.
8. `LeaseRiskDiagnosisPropertyIdentityService`가 사용자 표현, 건축물대장 판별 상태, 분석 기준 후보를 `propertyIdentity`로 조립한다. 건축물대장이 확정되지 않았지만 실거래가 근거가 있으면 `partial` 상태로 표시한다.
9. `LeaseRiskTransactionEvidenceService`가 건축물대장 확정 유형, 사용자 유형 힌트, 원룸 fallback 후보, 해당 지번 전월세 실거래 존재 여부를 기준으로 분석에 사용할 `TransactionApiSelection`과 `LeaseRiskBuildingType` 후보를 고른다.
10. 선택된 전월세 API가 있으면 최근 3개월 `real_estate_transaction_facts`를 먼저 조회한다. fact가 충분하면 API를 생략하고, 부족하면 `RentTransactionApiClient.lookupRent(...)`를 최근 완료월부터 순차 호출해 snapshot을 fact로 upsert한다. 정확 지번과 일치하는 snapshot을 우선 비교 표본으로 사용한다.
11. 선택된 매매 API가 있으면 최근 3개월 `real_estate_transaction_facts`를 먼저 조회한다. fact가 충분하면 API를 생략하고, 부족하면 `SaleTransactionApiClient.lookupSale(...)`를 최근 완료월부터 순차 호출해 snapshot을 fact로 upsert한다.
12. 선택된 공시가격 API가 있으면 `PublicPriceSnapshotStore`가 `public_price_snapshots`의 30일 이내 active snapshot을 먼저 조회한다. snapshot이 없으면 `PublicPriceApiClient.lookupLatestAvailablePublicPrice(...)`로 VWorld를 호출하고 결과를 snapshot으로 저장한다.
13. 전용면적 또는 층수 입력이 있으면 `TransactionSimilarityFilter`로 전월세·매매 snapshot의 유사 거래를 우선 비교 표본으로 만든다. 유사 거래가 없으면 전체 거래 기준으로 fallback한다.
14. `LeaseRiskDiagnosisDataStatusService`가 주소, 건축물대장, 전월세/매매 snapshot, 공시가격 snapshot 또는 fallback 결과, 등기부등본 직접 확인 한계를 `dataStatuses` 상태 카드로 조립한다.
15. 전월세 실거래가 보증금이 있으면 `DepositRiskCalculator.assessRentDepositComparison(...)`로 입력 보증금의 주변 보증금 대비 비율을 계산한다.
16. `MONTHLY_RENT` 요청이고 전월세 실거래가 월세가 있으면 `DepositRiskCalculator.assessMonthlyRentComparison(...)`로 입력 월세의 주변 월세 대비 비율을 계산한다.
17. `MONTHLY_RENT` 요청이면 입력 월세와 관리비를 합산해 월 고정 주거비 확인 문장을 만든다.
18. 매매 실거래가 거래금액이 있으면 `DepositRiskCalculator.assessSalePriceRatio(...)`로 입력 보증금의 매매가 대비 비율을 계산하고, 공시가격 금액이 있으면 `DepositRiskCalculator.assessPublicPriceRatio(...)`로 공시가격 대비 비율을 계산한다.
19. 매매 비율 점수가 있으면 `RiskAssessmentService.assessLeaseRentRisk(...)`의 `DepositRiskAssessment` 입력으로 우선 넘겨 `DEPOSIT_TO_VALUE_RISK` 점수에 반영한다. 매매 비율이 없고 공시가격 비율만 있으면 공시가격 기반 `PARTIAL` 점수로 반영한다.
20. `LeaseRiskDiagnosisRiskSummaryService`가 15-19번의 결과와 주소/건축물/공시가격/직접 확인 안내를 `riskSummary.reasons`로 조립한다.
21. 건축물대장 조회가 `UNAVAILABLE`, `NOT_FOUND`, `AMBIGUOUS`, `ERROR`이어도 사용자 입력 유형이나 지번 일치 실거래가로 분석 기준 후보를 잡을 수 있으면 제한 진단을 계속한다. 다만 이 후보는 공부상 확정 유형이 아니므로 `propertyIdentity.state=partial`과 주의 문장으로 분리한다.
22. 응답은 "안전" 단정이 아니라 확보 근거 수준에 따라 `조건부 검토 가능`, `추가 확인 필요`, `데이터 부족`을 구분하고 계약 전 체크리스트를 제공한다.
23. `RentRiskDiagnosisHistoryService`가 요청과 응답 snapshot을 `rent_risk_diagnosis_histories`에 저장한다.
24. `RiskEvidenceSnapshotService`가 저장된 진단 이력 ID를 기준으로 항목별 evidence와 missingData를 `risk_evidence_snapshots`에 저장한다.
25. `RentRiskDiagnosisResponse.diagnosisId`로 저장된 이력 id를 반환한다.
26. 로그인 사용자는 `GET /api/rent-risk-diagnoses`와 `GET /api/rent-risk-diagnoses/{diagnosisId}`로 본인 `requester_user_id`에 묶인 이력 목록과 진단 결과 상세만 다시 조회한다.
```

의도적으로 아직 구현하지 않은 것:

- 전국 법정동코드 catalog는 `LegalDongCodeSyncRunner`와 `backend-legal-dong-sync`로 동기화할 수 있지만, 로컬 starter seed만으로는 관악구/성동구 일부 범위에 제한된다.
- 도로명주소와 동+지번 단축 입력의 전국 단위 PNU 정밀 정규화
- 건축HUB retry, rate limit, circuit breaker, 원본 응답 보존
- 건축HUB 후보가 여러 개인 경우 사용자가 후보를 고르는 화면/도메인 API
- 보증금-월세 환산, 관리비 원본 데이터 자동 검증, 분위 비교
- 공시가격 보완을 포함한 전세가율 고도화
- 공시가격 동·호 정밀 매칭과 후보 신뢰도 산정
- 공시가격과 전월세 분위까지 포함한 보증금 위험도 고도화
- 도로명주소를 법정동/지번으로 변환하는 외부 주소 API adapter
- 등기부등본 원본 PDF 업로드/OCR 분석

## 1. MVP 기준 재정의

### MVP에서 하는 일

| 범위 | 내용 |
| --- | --- |
| 사용자 입력 | 지역/장소/역세권, 유형, 정확 주소, 목적, 보증금, 월세 또는 관리비, 사용자가 본 매물 유형과 매물 설명, 선택적으로 전용면적/층/동호수 |
| 현재 매물 미제공 | 현재 매물 목록, 지도 기반 현재 매물 탐색, 실시간 매물 크롤링을 제공하지 않는다. |
| 의도 분류 | `강남 원룸`, `서울대입구역 근처`, `상가 월세`는 지역·유형 과거 지표 분석으로, `신림동 1422` 같은 입력은 정확 주소 후보 선택과 위험진단으로 보낸다. |
| R-ONE 과거 지표 분석 | 한국부동산원 R-ONE 통계로 가격지수, 전세가격지수, 월세가격지수, 오피스텔 수익률, 상가 공실률을 분석한다. |
| 지표 한계 설명 | 과거 지표는 현재 매물 가격이나 계약 안전성을 확정하지 않으며, 통계 단위와 데이터 부족을 함께 안내한다. |
| 주소 정제 | 도로명/지번 주소를 정제하고 법정동코드, 시군구코드, 번, 지를 확정한다. |
| 건물 존재 확인 | GIS건물통합정보 또는 건축HUB 건축물대장정보로 실제 건물 후보를 찾는다. |
| 건축물대장 확인 | 주용도, 대장구분, 대장종류, 세대수, 가구수, 사용승인일을 확인한다. 위반건축물 여부는 아직 자동 판정하지 않고 원본 확인 항목으로 둔다. |
| 물건 유형 판별 | 아파트, 오피스텔, 연립/다세대, 단독/다가구, 근린생활시설 의심, 유형 판별 실패로 분류한다. |
| 유형별 실거래가 조회 | 판별된 유형에 맞는 전월세/매매 실거래가 API만 호출한다. |
| 가격 위험도 계산 | 주변 전월세 대비 보증금 수준, 주변 매매가 대비 전세가율, 공시가격 대비 보증금 비율을 계산한다. |
| 건축물 위험 확인 | 주거 목적과 주용도 불일치, 사용승인일 기준 노후도를 확인한다. 위반건축물 여부는 아직 자동 판정하지 않고 원본 확인 항목으로 둔다. |
| 법적 한계 분리 | 등기부등본, 근저당, 압류, 선순위 임차인 등 API로 확정할 수 없는 항목을 분리한다. |
| 결과 생성 | "안전/위험" 단정 대신 확보된 근거, 부족한 데이터, 직접 확인 항목을 나눈 진단 문장과 계약 전 체크리스트를 만든다. |

### MVP에서 하지 않는 일

| 제외 항목 | 제외 이유 |
| --- | --- |
| 현재 매물 목록 제공 | MVP는 현재 매물 플랫폼이 아니라 과거 지표 분석 서비스다. |
| 지도 기반 현재 매물 탐색 | `서울대입구역 근처` 같은 입력도 현재 매물 지도 검색이 아니라 역세권/지역 과거 지표 분석으로 처리한다. |
| 실시간 매물 크롤링 | 매물 수집은 데이터 확보·정합성·법적 리스크가 크고 MVP 목적 밖이다. |
| 공인중개사 매칭 | 위험진단 결과 이후의 상업적 연결 기능이다. |
| 계약 체결 대행 | 법률/거래 대행 영역이며 MVP의 사전 진단 범위를 넘는다. |
| 법적 권리관계 확정 판정 | 등기부등본, 임대차 현황, 실제 권리 변동은 API만으로 확정하면 안 된다. |
| 선순위 임차인 자동 조회 | 공공 API로 자동 확정하기 어렵고 임대인/중개사 확인이 필요하다. |
| 매수/매도 투자수익률 정밀 예측 | 과거 지표 분석은 가능하지만 미래 수익률 확정 예측은 하지 않는다. |
| 상가 창업 성공 가능성 판단 | R-ONE 상가 공실률·임대료 지표는 참고 자료이며 창업 성공을 확정하지 않는다. |
| 임야·토지 개발 가능성 분석 | 토지 개발성 판단은 별도 도메인이다. |
| 꼬마빌딩 수익성 분석 | 수익형 부동산 투자 분석은 MVP 밖이다. |

## 2. MVP 필수 API 목록

| API/데이터 | 사용 목적 | 필요한 입력값 | 출력값 | 호출 시점 | MVP 필수 여부 |
| ------- | ----- | ------- | --- | ----- | --------- |
| 주소 API | 사용자 주소 정제, 도로명/지번 주소 후보 확인 | 사용자 입력 주소 | 정제 주소, 법정동 후보, 도로명 코드, 건물번호 후보 | Gate 2 | 필수 |
| 법정동코드 API 또는 코드 DB | `LAWD_CD` 생성, 지역 매핑 | 정제 주소의 시도/시군구/동 | 법정동코드 10자리, 실거래가용 앞 5자리 | Gate 2 | 필수. 운영은 내부 코드 DB 우선 |
| GIS건물통합정보 | 건물 존재와 공간 기반 후보 확인 | 좌표, 주소, 법정동, 지번 | 건물 형상/건물 후보, 건축물대장 속성 일부 | Gate 3 | 필수에 가깝지만 장기 캐시 우선 |
| 건축HUB 건축물대장정보 | 건축물대장 기반 유형 판별과 건축물 위험 요소 확인 | 법정동, 지번, 대장 관련 식별자 | 주용도, 대장구분/종류, 세대수, 가구수, 사용승인일, 건축물대장 PK | Gate 4, Gate 7 | 필수 |
| 아파트 전월세 실거래가 API | 아파트 주변 전월세 수준 비교 | `LAWD_CD`, `DEAL_YMD`, serviceKey | 보증금, 월세, 면적, 층, 계약 정보 | Gate 5 | 아파트일 때 필수 |
| 아파트 매매 실거래가 API | 아파트 전세가율 계산 | `LAWD_CD`, `DEAL_YMD`, serviceKey | 거래금액, 면적, 층, 건축년도 | Gate 5 | 아파트일 때 필수 |
| 오피스텔 전월세 실거래가 API | 오피스텔 주변 전월세 수준 비교 | `LAWD_CD`, `DEAL_YMD`, serviceKey | 보증금, 월세, 면적, 층, 계약 정보 | Gate 5 | 오피스텔일 때 필수 |
| 오피스텔 매매 실거래가 API | 오피스텔 전세가율 또는 매매가 대비 보증금 추정 | `LAWD_CD`, `DEAL_YMD`, serviceKey | 거래금액, 면적, 층, 건축년도 | Gate 5 | 오피스텔일 때 필수 |
| 연립다세대 전월세 실거래가 API | 연립/다세대 주변 전월세 수준 비교 | `LAWD_CD`, `DEAL_YMD`, serviceKey | `deposit`, `monthlyRent`, `houseType`, `mhouseNm`, `jibun`, `buildYear`, `floor` | Gate 5 | 연립/다세대일 때 필수 |
| 연립다세대 매매 실거래가 API | 연립/다세대 전세가율 계산 | `LAWD_CD`, `DEAL_YMD`, serviceKey | `dealAmount`, `houseType`, `mhouseNm`, `jibun`, `buildYear`, `excluUseAr`, `landAr`, `floor` | Gate 5 | 연립/다세대일 때 필수 |
| 단독다가구 전월세 실거래가 API | 단독/다가구 주변 전월세 수준 비교 | `LAWD_CD`, `DEAL_YMD`, serviceKey | 보증금, 월세, 계약 정보. 지번은 일부 마스킹 가능 | Gate 5 | 단독/다가구일 때 필수 |
| 단독다가구 매매 실거래가 API | 단독/다가구 매매가 대비 보증금 추정 | `LAWD_CD`, `DEAL_YMD`, serviceKey | 거래금액, 면적, 건축년도. 지번은 일부 마스킹 가능 | Gate 5 | 단독/다가구일 때 필수이나 정확도 낮음 |
| 공동주택가격 정보 | 아파트/연립/다세대 공시가격 대비 보증금 비율 | 건축물 식별자, 주소, 동/호 가능 정보 | 공동주택 호별 공시가격 또는 위치 기반 공시가격 | Gate 6 | 공동주택일 때 권장 필수 |
| 개별주택가격 정보 | 단독/다가구 공시가격 대비 보증금 비율 | 지번, 법정동, 건물 후보 | 개별주택 공시가격 | Gate 6 | 단독/다가구일 때 권장 필수 |
| 관리비 또는 생활 인프라 보조 데이터 | 보증금 위험이 아니라 계약 조건 보조 확인 | 주소, 단지 식별자 | 관리비, 단지 기본 정보, 생활 인프라 | Gate 9 이후 | MVP 필수 아님 |
| 등기부등본 수동 확인 상태 | API로 확정 불가한 권리관계를 사용자 행동으로 연결 | 진단 이력 ID, 확인 상태, memo | `NOT_CHECKED`, `CHECKED`, `NEEDS_HELP` | Gate 8 | MVP 현재 구현 |
| 등기부등본 PDF 업로드/OCR 분석 | API로 확정 불가한 권리관계 확인 보조 | 사용자가 업로드한 PDF | 소유자/권리 항목 후보. 법적 확정 아님 | Gate 8 | 파일 저장 전략 확정 후 구현 |

## 3. API 호출 게이트 설계

주소 입력 후 모든 API를 동시에 호출하지 않는다. 실거래가 API는 법정동코드와 물건 유형이 결정된 뒤에만 호출한다.

| 게이트 | 목적 | 호출 API | 다음 단계로 넘어가는 조건 | 실패 시 처리 |
| --- | -- | ------ | -------------- | ------- |
| Gate 1. 사용자 목적 확인 | 전세/월세/거주 목적을 확인하고 MVP 대상인지 판단 | 없음 | 목적이 전세 또는 월세 거주이고 보증금이 입력됨 | 목적이 매매투자/상가/토지이면 MVP 밖 안내 |
| Gate 2. 주소 정제 및 법정동코드 확정 | 주소를 표준화하고 `LAWD_CD`를 만들 준비 | 주소 API, 법정동코드 내부 DB | 정제 주소, 법정동코드 10자리, 시군구 5자리 확정 | 주소 후보를 사용자에게 재선택 요청 |
| Gate 3. 건물 존재 여부 확인 | 입력 주소의 건물 후보가 실제로 존재하는지 확인 | GIS건물통합정보, 건축HUB 기본 조회 | 건물 후보 1개 이상 또는 사용자가 후보 선택 | 건물 미확인 결과를 표시하고 수동 주소/동호수 보완 요청 |
| Gate 4. 건축물대장 기반 물건 유형 판별 | 주용도, 세대수, 가구수, 대장종류로 유형 결정 | 건축HUB 건축물대장정보 | 아파트/오피스텔/연립다세대/단독다가구/근린생활시설 의심 중 하나로 분류 | 유형 판별 실패로 제한 진단 진행 |
| Gate 5. 물건 유형별 실거래가 API 선택 | 유형에 맞는 전월세/매매 API만 호출 | 유형별 실거래가 API | 최근 12~24개월, 면적 근사, 같은 법정동 또는 인접 반경 거래 확보 | No Data면 기간/반경 확대, 그래도 없으면 가격 신뢰도 낮음 표시 |
| Gate 6. 매매가/공시가격 기반 전세가율 계산 | 보증금이 가격 대비 과도한지 계산 | 유형별 매매 API, 공동주택가격, 개별주택가격 | 매매 비교값 또는 공시가격 비교값 하나 이상 확보 | 전세가율을 "계산 불가"로 두고 체크리스트 강화 |
| Gate 7. 건축물 위험 요소 확인 | 용도 불일치, 노후도 확인. 위반 여부는 직접 확인 항목으로 유지 | 건축HUB 건축물대장정보 | `BuildingRiskAnalyzer`가 사용승인일과 주용도를 해석 | 위반건축물 자동 판정은 원본 필드 확인 후 별도 구현 |
| Gate 8. API로 확정 불가능한 항목 분리 | 법적 권리관계 단정 방지 | 등기부등본 수동 확인 상태. 공공 API 확정 호출 없음 | 등기부등본 확인 상태 또는 도움 필요 상태 기록 | 확인 전에는 핵심 위험으로 유지 |
| Gate 9. 위험 문장 및 체크리스트 생성 | API 결과를 사용자 행동으로 바꾼다 | 외부 API 추가 호출 없음 | 확인된 정보와 미확인 정보를 분리해 결과 생성 | 일부 데이터 실패 시 낮은 신뢰도와 추가 확인 행동을 함께 표시 |

## 4. 사전 저장/캐시/실시간 호출 분류

| 데이터/API | 분류 | 이유 | 저장 위치 | 캐시 TTL | 실패 시 대안 |
| ------- | -- | -- | ----- | ------ | ------- |
| 법정동코드/행정동 alias | 사전 저장 | 변경 빈도가 낮고 모든 실거래가 API의 핵심 입력이다. 행정동 입력은 법정동 기준 API 호출로 변환해야 한다. | `legal_dong_codes`, `legal_dong_aliases`, `legal_dong_code_source_rows`, `LegalDongCodeMapper`, `MyBatisLegalDongCodeCatalog`. 현재 로컬 starter seed는 관악구/성동구 일부 범위이며, 전국 catalog는 `LegalDongCodeSyncRunner` 수동 sync로 채운다. | 월 1회 또는 수동 갱신 | `backend-legal-dong-sync`로 행정표준코드 법정동코드 API를 다시 동기화하거나 주소 API 결과로 제한 진단 |
| 행정표준코드 | 사전 저장 | 법정동, 건축물 용도 등 코드 해석에 필요하다. | `standard_codes` 후보 테이블 | 월 1회 갱신 | 원문 코드명 노출 |
| 건축물 주용도 코드 | 사전 저장 | 물건 유형 판별 룰에 필요하다. | `building_use_codes` 후보 테이블 | 분기 1회 갱신 | 건축HUB의 코드명 문자열로 임시 판별 |
| 대장구분/대장종류 코드 | 사전 저장 | 일반건축물/집합건축물/폐말소 여부 판별에 필요하다. | 현재는 `building_register_title_snapshots`의 대장구분명/대장종류명 문자열 사용 | 분기 1회 갱신 후보 | 코드표 별도 테이블은 아직 만들지 않는다. |
| 물건 유형 판별 룰 | 사전 저장 | API 호출을 결정하는 핵심 내부 룰이다. | Java enum/rule class와 docs | 배포 단위 | 유형 판별 실패 처리 |
| 실거래가 API 선택 매핑 | 사전 저장 | 유형별 호출 API를 코드로 고정해야 한다. | Java enum/rule class와 docs | 배포 단위 | 유형 판별 실패 처리 |
| 전세 위험도 계산 룰 | 사전 저장 | API 결과를 점수/문장으로 바꾸는 내부 정책이다. | Java rule class와 docs | 배포 단위 | 계산 불가 문장 출력 |
| 체크리스트 문구 템플릿 | 사전 저장 | 결과 일관성과 법적 단정 방지를 위해 필요하다. | message/resource 파일 또는 DB | 배포 단위 | 기본 체크리스트 출력 |
| API 에러 코드 매핑 | 사전 저장 | data.go.kr 공통 에러를 사용자 메시지로 바꿔야 한다. | Java enum 또는 config | 배포 단위 | "외부 API 일시 실패" 기본 메시지 |
| 주소 API | 요청 단위 실시간 호출 | 사용자가 입력한 주소에 따라 결과가 달라진다. | 서버 DB에는 저장하지 않음. 지도에서 선택한 주소는 `saveDiagnosisAddressDraft(...)`가 브라우저 `sessionStorage`에 1회성 draft로 보관하고 홈 진단 폼이 즉시 소비 | 요청 단위 | 수동 주소 입력/후보 선택 |
| GIS건물통합정보 | 장기 캐시 | 공간 데이터는 크고 요청 때마다 전량 호출하기 어렵다. | GIS snapshot 또는 건물 후보 캐시 | 1~3개월 | 건축HUB 주소 기반 조회 |
| 건축HUB 건축물대장정보 | DB snapshot + 요청 단위 실시간 fallback | 건물 속성은 중요하지만 매 요청마다 같은 건물은 반복된다. | `building_register_title_snapshots` | 30일 | 건축물대장 직접 확인 안내 |
| 유형별 전월세 실거래가 API | DB fact 우선 + API fallback | 법정동/월/유형 단위로 재사용 가능하고, 판단 가능한 거래 fact와 통계가 누적되어야 한다. | `real_estate_transaction_facts`, `market_statistics_monthly`, `external_data_collection_runs`, `external_data_collection_attempts` | DB fact는 `last_seen_at` 갱신, 부족할 때만 fallback 호출 | 기간 확대, 신뢰도 낮음 표시 |
| 유형별 매매 실거래가 API | DB fact 우선 + API fallback | 전세가율 계산에 필요하고 월 단위 재사용 가능하므로 전월세와 같은 fact/statistics 경계를 쓴다. | `real_estate_transaction_facts`, `market_statistics_monthly`, `external_data_collection_runs`, `external_data_collection_attempts` | DB fact는 `last_seen_at` 갱신, 부족할 때만 fallback 호출 | 공시가격 기반 보조 계산 |
| 공동주택가격 정보 | DB snapshot + 요청 단위 실시간 fallback | 연 단위 공시 성격이지만 사용자 주소/PNU별 반복 조회가 있으므로 먼저 30일 DB-first snapshot으로 안정화한다. | `public_price_snapshots`, `PublicPriceSnapshotStore`, `PublicPriceSnapshotMapper` | 30일 DB-first. 원문 bulk 적재는 후속 결정 | 매매 실거래가 기반 추정 보조. 동·호 정밀 매칭 전에는 중간 이하 신뢰도 |
| 개별주택가격 정보 | DB snapshot + 요청 단위 실시간 fallback | 단독/다가구 보조 가치 기준이며 PNU와 기준연도 query로 재사용할 수 있다. | `public_price_snapshots`, `PublicPriceSnapshotStore`, `PublicPriceSnapshotMapper` | 30일 DB-first. 기준연도 결과가 없으면 최신 기준시점 snapshot 후보 재사용 | 매매 실거래가 기반 추정 보조. 선순위 임차인과 권리관계는 별도 확인 |
| 진단 판단 근거 snapshot | DB diagnosis-linked snapshot | 응답 JSON 안에만 근거를 묻어두면 항목별 재분석, 관리자 품질 점검, AI evidence packet 확장이 어렵다. | `risk_evidence_snapshots`, `RiskEvidenceSnapshotService`, `RiskEvidenceSnapshotMapper` | 진단 이력 보존 정책과 동일 | 원천 사실 확정 table이 아니라 해당 진단 시점의 설명 가능한 근거와 한계다. 개별 source row id 연결은 후속 확장 |
| 관리비/생활 인프라 API | MVP에서는 호출하지 않음 | 보증금 위험도 직접 계산에는 필수값이 아니다. | 없음 | 없음 | 체크리스트에서 관리비 고지서 확인 안내 |
| 등기부등본 수동 확인 상태 | DB 저장 | 구조화된 상태와 memo이며 본인 진단 이력에 연결된다. | `registry_document_confirmations` | 사용자/진단 이력 보존 정책과 동일 | 상태가 없으면 `NOT_CHECKED`로 응답 |
| 등기부등본 PDF 업로드/OCR | 요청 단위 실시간 처리 | 사용자별 민감정보가 포함된다. 저장 최소화가 원칙이다. | 원칙적으로 임시 저장. 저장 시 암호화/만료 필요 | 즉시 삭제 또는 짧은 TTL | 인터넷등기소 열람 및 수동 확인 안내 |

## 5. 물건 유형별 API 선택 매트릭스

| 판별된 물건 유형 | 전월세 API | 매매 API | 공시가격 API | 추가 확인사항 | 위험도 계산 방식 |
| --------- | ------- | ------ | -------- | ------- | --------- |
| 아파트 | 아파트 전월세 실거래가 | 아파트 매매 실거래가 | 공동주택가격 정보 | 동/호, 전용면적, 층, 같은 단지 비교 가능 여부 | 입력 보증금 ÷ 주변 매매가, 입력 보증금 ÷ 공시가격, 주변 전세 보증금 분위 비교 |
| 오피스텔 | 오피스텔 전월세 실거래가 | 오피스텔 매매 실거래가 | MVP에서는 보조 또는 미사용 | 주거용 사용 가능 여부, 업무시설/주거용 오피스텔 구분 | 입력 보증금 ÷ 주변 오피스텔 매매가, 주변 오피스텔 전월세 분위 비교 |
| 연립/다세대 | 연립다세대 전월세 실거래가 | 연립다세대 매매 실거래가 | 공동주택가격 정보 | 대장종류가 집합건축물인지, 호별 구분 가능 여부 | 입력 보증금 ÷ 주변 연립다세대 매매가, 입력 보증금 ÷ 공시가격, 면적 유사 거래 비교 |
| 단독/다가구 | 단독/다가구 전월세 실거래가 | 단독/다가구 매매 실거래가 | 개별주택가격 정보 | 선순위 임차인, 전체 보증금 합계, 가구수, 임대인 자료 확인 | 입력 보증금 ÷ 건물 추정가. 단, 전체 선순위 보증금 미확인 위험을 별도 강한 경고로 유지 |
| 근린생활시설 의심 | MVP 전월세 API 호출하지 않음 | MVP 매매 API 호출하지 않음 | 사용하지 않음 | 주거 목적과 주용도 불일치, 전입신고/보증보험/불법 용도변경 확인 | 정량 위험도보다 "주거 목적 부적합 가능성" 체크리스트 중심 |
| 유형 판별 실패 | 호출하지 않음 | 호출하지 않음 | 호출하지 않음 | 주소, 동호수, 건축물대장, 중개대상물 확인설명서 보완 | 가격 계산 보류. API 호출 실패를 숨기지 않고 제한 진단으로 표시 |

## 6. API로 확정하면 안 되는 영역

| 항목 | API로 확정하면 안 되는 이유 | MVP에서의 처리 방식 | 사용자에게 안내할 문장 |
| -- | ----------------- | ------------ | ------------ |
| 소유자 실시간 확인 | 공공 실거래/건축물 API는 현재 소유자를 보장하지 않는다. | 등기부등본 업로드 요청 | "현재 소유자는 등기부등본으로 직접 확인해야 합니다. 계약 상대가 등기상 소유자와 같은지 확인하세요." |
| 근저당권 | 담보권 설정/말소는 등기부 권리 변동 사항이다. | 등기부등본 업로드 요청 | "근저당권은 공공 실거래가 API로 확정할 수 없습니다. 등기부등본 갑구/을구를 확인하세요." |
| 가압류 | 실시간 권리 제한은 등기부 확인 대상이다. | 등기부등본 업로드 요청 | "가압류가 있으면 보증금 회수 위험이 커질 수 있으므로 등기부등본에서 반드시 확인하세요." |
| 압류 | 세금/채권 관련 압류는 실거래가/건축물대장으로 확인되지 않는다. | 인터넷등기소 열람 안내 | "압류 여부는 인터넷등기소에서 최신 등기부등본을 열람해 확인해야 합니다." |
| 신탁등기 | 신탁 부동산은 임대 권한 확인이 별도로 필요하다. | 등기부등본 업로드 요청 | "신탁등기가 있으면 임대인이 단독으로 계약할 권한이 없을 수 있습니다. 신탁원부와 임대 권한을 확인하세요." |
| 전세권 | 전세권 설정은 등기부 권리관계다. | 등기부등본 업로드 요청 | "기존 전세권 설정 여부는 등기부등본으로 확인해야 합니다." |
| 경매개시결정 | 경매 진행은 권리관계와 사건 진행 상태 확인이 필요하다. | 인터넷등기소 열람 안내 | "경매개시결정이 있으면 계약을 멈추고 전문가 확인을 받으세요." |
| 선순위 임차인 보증금 | 특히 다가구는 다른 세입자의 보증금 총액을 API로 알 수 없다. | 임대인/중개사에게 자료 요청 안내 | "다가구라면 내 보증금보다 먼저 보호받는 임차인의 보증금 총액을 임대인과 중개사에게 확인해야 합니다." |
| 실제 하자 | 누수, 곰팡이, 소음, 설비 문제는 현장 확인 영역이다. | 현장 방문 체크리스트 제공 | "건축물대장에 문제가 없어도 실제 하자는 현장에서 확인해야 합니다." |
| 보증보험 가입 가능 확정 | 보증보험은 기관별 심사와 권리관계 확인이 필요하다. | 보증보험 기관 확인 안내 | "보증보험 가입 가능 여부는 HUG/HF/SGI 등 보증기관에서 최종 확인해야 합니다." |

## 7. 위험도 계산에 필요한 데이터 정의

| 계산 항목 | 필요한 데이터 | 출처 API | 계산 방식 | 신뢰도 | 결과 문장 예시 |
| ----- | ------- | ------ | ----- | --- | -------- |
| 주변 전월세 대비 보증금 수준 | 같은 법정동, 같은 유형, 전용면적 유사 범위, 최근 12~24개월 보증금/월세 | 유형별 전월세 실거래가 API | 입력 보증금을 유사 거래의 중앙값, 75분위, 90분위와 비교 | 중간 | "입력 보증금은 최근 유사 전월세 거래의 상위권에 가까워 추가 확인이 필요합니다." |
| 주변 매매가 대비 전세가율 | 같은 법정동, 같은 유형, 전용면적 유사 매매 거래금액 | 유형별 매매 실거래가 API | `입력 보증금 / 유사 매매가 추정값` | 중간 | "주변 매매가 대비 보증금 비율이 높게 추정됩니다. 매매가 산정 근거와 보증보험 가능 여부를 확인하세요." |
| 공시가격 대비 보증금 비율 | 호별 공동주택가격 또는 개별주택가격 | 공동주택가격 정보, 개별주택가격 정보 | `입력 보증금 / 공시가격` | 정확 매칭 시 높음, 추정 매칭 시 낮음 | "공시가격 대비 보증금 비율이 높아 보수적으로 확인해야 합니다." |
| 다가구 여부 | 주용도, 가구수, 대장구분, 대장종류 | 건축HUB 건축물대장정보 | 주용도와 가구수를 기준으로 단독/다가구 분류 | 중간~높음 | "다가구로 보이면 선순위 임차인 보증금 총액 확인이 핵심입니다." |
| 다세대/오피스텔 여부 | 주용도, 대장종류, 호별 구분 여부 | 건축HUB 건축물대장정보 | 집합건축물/주용도/호별 정보로 분류 | 중간~높음 | "호별 구분이 가능한 유형으로 보이며, 동일 유형 실거래가를 기준으로 비교했습니다." |
| 사용승인일 기준 노후도 | 사용승인일, 건축년도 | 건축HUB 건축물대장정보, 실거래가 API 보조 필드 | `BuildingRiskAnalyzer`가 현재일 기준 경과 연수를 계산 | 높음 | "사용승인 후 오래된 건물이라 누수, 배관, 전기 설비를 현장에서 확인하세요." |
| 위반건축물 여부 | 위반 관련 대장 항목 또는 표시 | 건축HUB 건축물대장정보, 중개대상물 확인설명서 | 현재 자동 판정 없음. 원본 확인 checklist로 유지 | 낮음. 자동 확정 전 | "건축물대장상 위반 여부 확인이 필요합니다. 위반건축물은 보증보험과 대출에 영향을 줄 수 있습니다." |
| 주용도와 주거 목적 불일치 여부 | 주용도코드/명, `LeaseRiskBuildingType`, 사용자 목적 | 건축HUB 건축물대장정보 | `BuildingRiskAnalyzer`가 근린생활시설 등 주거 계열이 아닌 주용도 가능성을 경고 | 중간~높음 | "주거 목적과 건축물 주용도가 맞지 않을 수 있어 전입신고와 보증보험 가능 여부를 확인하세요." |
| 선순위 임차인 미확인 여부 | 다가구 여부, 임대인 제공 자료 여부 | API 없음 | 다가구이거나 자료 미제출이면 미확인 위험 유지 | 낮음. API 확정 불가 | "선순위 임차인 보증금 총액을 확인하기 전에는 보증금 회수 위험을 확정적으로 낮게 볼 수 없습니다." |
| 등기부등본 미확인 여부 | 등기부등본 수동 확인 상태 | 사용자 확인 기록 | `NOT_CHECKED` 또는 상태 없음이면 권리관계 미확인 위험 유지 | 낮음. API 확정 불가 | "등기부등본을 확인하지 않아 근저당, 압류, 신탁 여부는 아직 확인되지 않았습니다." |

## 8. 결과 문장 생성 기준

결과 문장은 "안전" 또는 "위험"을 단정하지 않는다. 확인된 정보와 확인 불가능한 정보를 분리하고, 사용자가 계약 전에 해야 할 행동으로 마무리한다.

반드시 아래 구조를 따른다.

```text
진단 결과:
핵심 요약:
확인된 정보:
주의해야 할 정보:
API로 확인할 수 없는 정보:
계약 전 해야 할 행동:
```

예시:

```text
진단 결과:
현재 입력된 주소와 보증금 기준으로는 추가 확인이 필요한 항목이 있습니다.

핵심 요약:
건축물대장 기준 물건 유형은 다가구주택으로 추정됩니다. 입력 보증금은 주변 전월세 사례와 비교해 낮다고 단정하기 어렵고, 다가구 특성상 선순위 임차인 보증금 확인이 핵심입니다.

확인된 정보:
- 주소는 서울특별시 관악구 ○○동 ○○번지로 정제되었습니다.
- 법정동코드 앞 5자리는 실거래가 조회에 사용할 수 있습니다.
- 건축물대장 기준 주용도는 주거 계열로 보입니다.
- 사용승인일 기준 노후도 확인이 필요합니다.

주의해야 할 정보:
- 다가구주택은 다른 세입자의 보증금 총액이 내 보증금 회수 가능성에 영향을 줍니다.
- 주변 매매 실거래가가 부족하면 전세가율 계산 신뢰도가 낮아집니다.
- 원본 건축물대장이나 중개대상물 확인설명서에 주용도 또는 위반건축물 표시가 있으면 보증보험과 대출에 영향을 줄 수 있습니다.

API로 확인할 수 없는 정보:
- 현재 소유자, 근저당권, 압류, 신탁등기, 경매개시결정은 등기부등본으로 확인해야 합니다.
- 선순위 임차인 보증금 총액은 공공 API로 자동 확정할 수 없습니다.
- 보증보험 가입 가능 여부는 보증기관 심사가 필요합니다.

계약 전 해야 할 행동:
1. 최신 등기부등본을 발급받아 갑구와 을구를 확인합니다.
2. 임대인 또는 중개사에게 선순위 임차인 보증금 총액 자료를 요청합니다.
3. 중개대상물 확인설명서의 위반건축물, 권리관계, 관리비 항목을 확인합니다.
4. HUG/HF/SGI 등 보증기관에서 보증보험 가입 가능 여부를 확인합니다.
5. 현장 방문 시 누수, 곰팡이, 수도, 전기, 방범, 소음 상태를 직접 확인합니다.
```

## 9. 구현 우선순위

| 우선순위 | 작업 | 목적 | 산출물 | 완료 기준 |
| ---- | -- | -- | --- | ----- |
| 0 | 홈 화면 분석/진단 입력 폼 진입점 | 사용자가 홈 화면에서 MVP 분석/진단을 시작한다. | `MainHero.vue`, `SearchBar.vue`, `LeaseRiskDiagnosisResult.vue`, `SearchResultView.vue` 결과 화면 연결 | 현재 구현은 정확 주소/금액/목적 입력을 `createRentRiskDiagnosis(payload)`와 `POST /api/rent-risk-diagnoses`로 연결하고, 지역·유형 입력을 `createRegionalIndicatorAnalysis(payload)`와 `POST /api/regional-indicator-analyses`로 연결한다. |
| 1 | 주소 정제/법정동코드/PNU 변환 | 모든 외부 API 호출의 입력 기준을 만든다. | `LeaseRiskAddressNormalizer`, `AddressResolution`, `LegalDongCode`, `LegalDongCodeMatch`, `NormalizedLeaseRiskAddress`, `legal_dong_codes`, `legal_dong_aliases`, `LegalDongCodeMapper`, `MyBatisLegalDongCodeCatalog` | 법정동/행정동 입력을 canonical 법정동 기준으로 정규화하고 `LAWD_CD`, `sigunguCd`, `bjdongCd`, `bun`, `ji`, PNU를 만들 수 있다. |
| 2 | 사용자 표현 기반 후보 유형 해석과 식별 후보 저장 | "원룸", "빌라" 같은 생활 언어를 공부상 후보와 주의 방향으로 바꾸고 내부 후보 row를 남긴다. | `LeaseRiskPropertyTypeInterpreter`, `LeaseRiskPropertyTypeInterpretation`, `PropertyIdentityCandidateService`, `LeaseRiskDiagnosisPropertyIdentityService`, `property_identity_candidates` | 사용자 표현은 설명과 체크리스트 보조에만 쓰이고, 실거래가 API 선택 근거로 단독 사용하지 않는다. 저장 row도 확정 물건이 아니라 match/confidence/data_quality가 붙은 후보이다. |
| 3 | 건축물대장 기반 물건 유형 판별과 표제부 snapshot 저장 | 실거래가 API 선택 전에 유형을 확정하고 같은 건물 반복 조회를 줄인다. | `LeaseRiskBuildingRegisterLookupService`, `BuildingRegisterTitleSnapshotStore`, `BuildingRegisterTitleSnapshotMapper`, `BuildingRegisterDiagnosis`, `BuildingRegisterApiQuery`, `BuildingRegisterApiItem`, `BuildingRegisterApiResponseParser`, `DataGoKrBuildingRegisterApiClient`, `BuildingRegisterSnapshotConverter`, `BuildingRegisterLookupResult`, `LeaseRiskBuildingType`, `BuildingTypeResolver`, `building_register_title_snapshots` | fresh active snapshot이 있으면 외부 API를 생략한다. 없으면 건축HUB 표제부를 호출하고 `FOUND`/`AMBIGUOUS` 결과를 snapshot으로 저장한다. 아파트/오피스텔/연립다세대/단독다가구/근생의심/실패로 분류된다. |
| 4 | 유형별 실거래가 API 선택 | 필요한 API만 호출한다. | `TransactionApiType`, `TransactionApiSelector`, `TransactionApiSelection` | 유형별 전월세/매매 API가 하나씩 선택되고 실패 유형은 호출하지 않는다. |
| 5 | 최근 3개월 전월세 실거래가 DB-first 집계 | 현재 프론트 응답에 확보된 전월세 거래를 표시하고 1차 비교 표본을 만든다. | `LeaseRiskExternalDataLookupService`, `RealEstateTransactionFactStore`, `ExternalDataCollectionService`, `ExternalDataRefreshTargetMapper`, `MarketStatisticsMonthlyService`, `RentTransactionApiClient`, `DataGoKrRentTransactionApiClient`, `RentTransactionApiResponseParser`, `TransactionSimilarityFilter` | 최근 완료월 3개월의 DB fact가 3건 이상이면 API를 생략한다. 1~2건이면 fallback API로 보강을 시도하고, API가 찾지 못해도 기존 sparse fact를 제한 근거로 사용한다. 면적·층 입력이 있으면 유사 거래를 우선 비교하고 없으면 전체 거래로 fallback한다. |
| 6 | 최근 3개월 매매가 DB-first/공시가격 DB-first 조회 | 전세가율과 보증금 비율 계산의 기준값을 확보한다. | `LeaseRiskExternalDataLookupService`, `RealEstateTransactionFactStore`, `ExternalDataCollectionService`, `ExternalDataRefreshTargetMapper`, `MarketStatisticsMonthlyService`, `SaleTransactionApiClient`, `DataGoKrSaleTransactionApiClient`, `PublicPriceSnapshotStore`, `PublicPriceSnapshotMapper`, VWorld public price adapter | 최근 3개월 매매 DB fact가 충분하면 API를 생략한다. 1~2건이면 fallback API로 보강을 시도하고, API가 찾지 못해도 기존 sparse fact를 제한 근거로 사용한다. 공시가격은 30일 이내 `public_price_snapshots`를 먼저 쓰고, 없을 때만 VWorld fallback을 호출해 기준값 후보를 만든다. |
| 6-1 | 최신월 실거래가 scheduled refresh | 전국 catalog 또는 운영자가 지정한 지역 범위의 최신 완료월 공공데이터 target을 등록하고 bounded batch로 갱신한다. | `ExternalDataWeeklyRefreshScheduler`, `ExternalDataLatestTargetMaterializer`, `ExternalDataTransactionMonthTargetRegistrationService`, `ExternalDataRefreshSchedulerService`, `ExternalDataSchedulerProperties`, `external_data_refresh_targets`, `external_data_collection_runs`, `external_data_collection_attempts` | 기본값은 비활성화다. 활성화되면 `EXTERNAL_DATA_WEEKLY_REFRESH_CRON` 기준으로 최신 완료월 `TRANSACTION_MONTH` target을 먼저 등록하고, due target을 `EXTERNAL_DATA_SCHEDULER_BATCH_SIZE`만큼 처리한다. Redis lock은 다중 인스턴스 중복 실행 방지용이다. |
| 7 | 전세가율 및 보증금 위험도 계산 | API 응답을 위험도 판단 데이터로 변환한다. | `DepositRiskCalculator`, `LeaseRiskDiagnosisRiskSummaryService`, risk score/value object | 주변 전월세, 매매가, 공시가격 기반 결과가 신뢰도와 함께 `riskSummary.reasons`로 나온다. |
| 8 | 용도·노후도 확인 | 가격 외 건축물 위험 요소를 분리한다. | `BuildingRiskAnalyzer`, `BuildingRiskAssessment` | 주용도 불일치와 노후도가 별도 경고로 나오고, 위반 여부는 원본 확인 checklist로 유지한다. |
| 9 | 항목별 근거 snapshot 저장 | 점수 산정 근거와 부족 데이터를 진단 이력 옆에 구조화한다. | `RiskEvidenceSnapshotService`, `RiskEvidenceSnapshotMapper`, `risk_evidence_snapshots` | `riskAssessment.criteria`의 evidence/missingData가 `diagnosis_history_id`별 row로 저장된다. 등기/선순위/보증보험처럼 자동 확정 금지 영역은 stable evidence code로 추적한다. |
| 10 | 등기부등본 확인 상태 기록 | API로 확정 불가한 권리관계를 사용자 행동으로 연결한다. | `RegistryDocumentConfirmationService`, `registry_document_confirmations`, `LeaseRiskDiagnosisResult.vue` | 로그인 사용자가 본인 진단 이력에 확인 전/확인함/도움 필요 상태와 memo를 남긴다. |
| 11 | 선순위 임차인 확인 필요 여부 안내 | 다가구 핵심 위험을 놓치지 않는다. | `LeaseRiskDiagnosisChecklistService`, `LeaseRiskDiagnosisNextActionService` | 단독/다가구 또는 미확인 상태에서 선순위 확인 안내가 항상 나온다. |
| 12 | 체크리스트 생성 | 결과를 계약 전 행동으로 바꾼다. | `LeaseRiskDiagnosisChecklistService` | 유형별 체크리스트가 중복 없이 생성된다. |
| 13 | 진단 결과와 이력에서 커뮤니티 질문 초안 연결 | 자동 확정할 수 없는 내용을 사용자 질문/사례 공유로 이어간다. | `LeaseRiskDiagnosisResult.vue`, `MyPageView.vue`, `communityDraft.js`, `CommunityListView.vue` | 결과 화면 또는 마이페이지 이력에서 `/community?compose=diagnosis`로 이동하고 글쓰기 modal이 진단 기반 초안을 소비한다. |
| 14 | 관리비/생활 인프라 보조 분석 | 보증금 위험 외 계약 품질 보조 정보로 확장한다. | K-APT/life infra adapter 후보 | MVP 핵심 흐름 완성 후 선택적으로 붙인다. |

## 10. 최종 결론

### 1. 미리 저장해야 할 것

- 법정동코드와 행정표준코드
- 건축물 주용도 코드, 대장구분/대장종류 코드
- 물건 유형 판별 룰
- 실거래가 API 선택 매핑
- 전세 위험도 계산 룰
- 체크리스트 문구 템플릿
- data.go.kr 공통 에러 코드 매핑
- 가능하면 GIS건물통합정보와 공시가격 데이터 인덱스

### 2. 사용자가 입력한 뒤 호출해야 할 것

- 주소 API
- 건물 존재 확인용 GIS건물통합정보 또는 건축HUB 조회
- 건축물대장 기반 건물 상세 정보
- 물건 유형이 확정된 뒤의 유형별 전월세 실거래가 API
- 물건 유형이 확정된 뒤의 유형별 매매 실거래가 API
- 매매가 보완을 위한 공동주택가격 또는 개별주택가격 조회
- 등기부등본 업로드 또는 확인 요청 플로우

### 3. MVP에서는 호출하지 말아야 할 것

- 상가/업무용 매매 실거래가 API. 근린생활시설은 투자 분석이 아니라 주거 목적 불일치 경고까지만 한다.
- 임야, 토지, 개발 가능성 관련 API
- 꼬마빌딩 수익성 분석용 API
- 공인중개사 매칭/매물 크롤링 API
- 관리비/생활 인프라 API의 자동 분석. MVP 완료 후 보조 분석으로만 검토한다.
- 실거래가 API의 주소 입력 직후 선호출. 반드시 건축물대장으로 물건 유형을 판별한 뒤 호출한다.

## Decision: MVP API 호출은 건축물대장 유형 판별 후에만 확장한다

### Context

전세·월세 위험진단은 "많은 API 호출"이 아니라 "필요한 시점에 필요한 API만 호출"해야 신뢰도가 생긴다. 아파트, 오피스텔, 연립/다세대, 단독/다가구는 실거래가 API가 다르고, 다가구처럼 선순위 임차인 확인이 핵심인 유형은 실거래가만으로 위험을 낮게 판정하면 안 된다.

### Options considered

1. 주소 입력 직후 모든 실거래가 API를 병렬 호출한다.
2. 사용자가 직접 물건 유형을 선택하게 하고 해당 API만 호출한다.
3. 주소와 건축물대장으로 유형을 판별한 뒤 해당 API만 호출한다.

### Decision

3번을 선택한다. 주소 정제, 법정동코드 확정, 건물 존재 확인, 건축물대장 조회, 물건 유형 판별 이후에 유형별 실거래가 API를 호출한다.

### Why

첨부된 실거래가 기술문서는 `LAWD_CD`와 `DEAL_YMD` 기반 조회 구조를 가진다. 이 API는 특정 주소의 법적 정체를 판별하지 않는다. 따라서 실거래가 API는 위험진단의 시작점이 아니라, 건축물대장으로 유형을 판별한 뒤 가격 비교를 보조하는 단계여야 한다.

### Tradeoffs

초기 응답 속도는 느려질 수 있다. 대신 잘못된 유형의 API를 호출해 엉뚱한 비교값을 만드는 위험을 줄인다. 캐시와 단계별 로딩 UI로 체감 속도를 보완한다.

### Future revisit

현재 첫 진단 API의 최상위 orchestration boundary는 `RentRiskDiagnosisService`다. 건축물대장 DB-first snapshot 조회와 내부 유형 판별은 `LeaseRiskBuildingRegisterLookupService`와 `BuildingRegisterTitleSnapshotStore`로, 물건 식별 후보 저장은 `PropertyIdentityCandidateService`로, 물건 정체성 응답 생성은 `LeaseRiskDiagnosisPropertyIdentityService`로, 가격 데이터 조회 orchestration은 `LeaseRiskExternalDataLookupService`로, 데이터 상태 카드 생성은 `LeaseRiskDiagnosisDataStatusService`로, 위험 요약 문장 생성은 `LeaseRiskDiagnosisRiskSummaryService`로, 체크리스트 생성은 `LeaseRiskDiagnosisChecklistService`로, 다음 행동 목록 생성은 `LeaseRiskDiagnosisNextActionService`로, 구조화 위험 항목 산정은 `RiskAssessmentService`로, 진단 근거 snapshot 저장은 `RiskEvidenceSnapshotService`로 분리했다. `RentRiskDiagnosisService`는 주소 정제, 물건 정체 판별, 내부 후보 저장, 외부 데이터 조회, 응답 조립, 산정 audit/evidence 연결 순서를 조율하는 application service 역할에 집중한다.

## Related documents

- [외부 API 설정과 data.go.kr 키 관리](/docs/api/EXTERNAL_API_CONFIGURATION.md)
- [ZIP:ON 저장소 전략](/docs/architecture/DATA_STORAGE_POLICY.md)
- [API와 함수 학습 지도](/docs/api/API_FUNCTION_MAP.md)
- [구조 학습 가이드](/docs/architecture/BACKEND_STRUCTURE.md)
- [MySQL 개발환경과 Flyway migration](/docs/operations/DOCKER_MYSQL_REDIS.md)
- [AI 위험도 산정 엔진](/docs/CODEX/reference/AI_RISK_SCORING_ENGINE.md)

## Learning path

1. First read: this document
2. Then inspect: `/docs/api/EXTERNAL_API_CONFIGURATION.md`
3. Then inspect: `/docs/api/API_FUNCTION_MAP.md`
4. Then inspect: `LeaseRiskAddressNormalizer`
5. Then inspect: `LegalDongCode`
6. Then inspect: `BuildingRegisterApiQuery`
7. Then inspect: `DataGoKrBuildingRegisterApiClient`
8. Then inspect: `BuildingRegisterApiResponseParser`
9. Then inspect: `BuildingRegisterSnapshotConverter`
10. Then inspect: `BuildingTypeResolver`
11. Then inspect: `LeaseRiskPropertyTypeInterpretation`
12. Then inspect: `LeaseRiskPropertyTypeInterpreter`
13. Then inspect: `LeaseRiskDiagnosisRequestValidator`
14. Then inspect: `LeaseRiskDiagnosisInputSummaryService`
15. Then inspect: `LeaseRiskDiagnosisAddressSectionService`
16. Then inspect: `AddressResolution`
17. Then inspect: `PropertyIdentityCandidateService`
18. Then inspect: `LeaseRiskDiagnosisPropertyIdentityService`
19. Then inspect: `BuildingRegisterDiagnosis`
20. Then inspect: `LeaseRiskBuildingRegisterLookupService`
21. Then inspect: `TransactionApiSelector`
22. Then inspect: `LeaseRiskExternalDataLookupService`
23. Then inspect: `RealEstateTransactionFactStore`
24. Then inspect: `MarketStatisticsMonthlyService`
25. Then inspect: `ExternalDataCollectionService`
26. Then inspect: `TransactionFactFingerprintService`
27. Then inspect: `LeaseRiskDiagnosisDataStatusService`
28. Then inspect: `LeaseRiskDiagnosisRiskSummaryService`
29. Then inspect: `LeaseRiskDiagnosisChecklistService`
30. Then inspect: `LeaseRiskDiagnosisNextActionService`
31. Then inspect: `TransactionSimilarityFilter`
32. Then inspect: `DataGoKrRentTransactionApiClient`
33. Then inspect: `RentTransactionApiResponseParser`
34. Then inspect: `RentRiskDiagnosisController`
35. Then inspect: `RentRiskDiagnosisService`
36. Then inspect: `frontend/src/components/home/MainHero.vue` and `frontend/src/components/common/SearchBar.vue`
37. Then inspect: `frontend/src/components/home/LeaseRiskDiagnosisResult.vue`, `frontend/src/views/MyPageView.vue`, `frontend/src/utils/communityDraft.js`, `frontend/src/views/CommunityListView.vue`
38. Then run: `cd backend && ./mvnw -Dtest=LeaseRiskDiagnosisRequestValidatorTest,LeaseRiskDiagnosisInputSummaryServiceTest,LeaseRiskDiagnosisAddressSectionServiceTest,LeaseRiskPropertyTypeInterpreterTest,LeaseRiskDiagnosisPropertyIdentityServiceTest,PropertyIdentityCandidateServiceTest,LeaseRiskBuildingRegisterLookupServiceTest,LeaseRiskDiagnosisDataStatusServiceTest,LeaseRiskDiagnosisRiskSummaryServiceTest,LeaseRiskDiagnosisChecklistServiceTest,LeaseRiskDiagnosisNextActionServiceTest,LeaseRiskExternalDataLookupServiceTest,RealEstateTransactionFactStoreTest,MarketStatisticsMonthlyServiceTest,RentRiskDiagnosisIntegrationTest,RentRiskDiagnosisBuildingRegisterIntegrationTest,RentRiskDiagnosisRentTransactionIntegrationTest,TransactionSimilarityFilterTest test`
39. Then run if needed: `cd backend && ./mvnw -Dtest=LegalDongCodeTest,LeaseRiskAddressNormalizerTest,PropertyIdentityCandidateServiceTest,MyBatisLegalDongCodeCatalogIntegrationTest,BuildingRegisterApiQueryTest,BuildingRegisterApiResponseParserTest,DataGoKrBuildingRegisterApiClientTest,BuildingRegisterSnapshotConverterTest,BuildingRegisterLookupResultTest,BuildingTypeResolverTest,LeaseRiskDiagnosisRequestValidatorTest,LeaseRiskDiagnosisInputSummaryServiceTest,LeaseRiskDiagnosisAddressSectionServiceTest,LeaseRiskPropertyTypeInterpreterTest,LeaseRiskDiagnosisPropertyIdentityServiceTest,LeaseRiskBuildingRegisterLookupServiceTest,LeaseRiskDiagnosisDataStatusServiceTest,LeaseRiskDiagnosisRiskSummaryServiceTest,LeaseRiskDiagnosisChecklistServiceTest,LeaseRiskDiagnosisNextActionServiceTest,TransactionApiSelectorTest,TransactionSimilarityFilterTest,RentTransactionApiQueryTest,RentTransactionApiResponseParserTest,DataGoKrRentTransactionApiClientTest,RealEstateTransactionFactStoreTest,MarketStatisticsMonthlyServiceTest test`
40. Then debug: failed gate, external API error code, missing legal dong code, missing building type, insufficient DB fact count, missing transaction data
41. Key concept to understand: orchestration service, request validator, response assembler service, external API adapter, identity candidate boundary, DB fact/statistics boundary, legal judgment boundary
