---
title: API_CALL_STRATEGY
created: 2026-07-01T00:06:00+09:00
updated: 2026-07-01T00:06:00+09:00
purpose: external-api-call-strategy
status: active
code_sync_required: true
related_code: 
read_when: 
update_when: 
  - backend/src/main/java/com/zipon/service/RentRiskDiagnosisService.java
  - backend/src/main/java/com/zipon/service/LeaseRiskAddressNormalizer.java
  - backend/src/main/java/com/zipon/service/LeaseRiskBuildingRegisterLookupService.java
  - backend/src/main/java/com/zipon/service/LeaseRiskTransactionEvidenceService.java
  - backend/src/main/java/com/zipon/service/LeaseRiskExternalDataLookupService.java
  - backend/src/main/java/com/zipon/service/RegionalIndicatorAnalysisService.java
  - 외부 API 호출 순서나 fallback 흐름을 바꿀 때
  - 정확 주소 위험진단 또는 지역·유형 과거 지표 분석의 데이터 gate를 수정할 때
  - 주소 정제, 물건 유형 판별, 실거래가 선택, 공시가격/R-ONE 조합 순서가 바뀔 때
---

# 외부 API 호출 전략

> Status: Current reference

ZIP:ON은 주소 입력 직후 모든 API를 호출하지 않는다. 먼저 사용자 목적과 물건 정체를 확인하고, 그 결과에 따라 필요한 API만 호출한다.

## 기본 gate

```text
1. 사용자 입력 정제
2. 주소·코드 변환
3. 건물/토지 존재 확인
4. 물건 유형 판별
5. 사용자 목적 확인
6. 유형별 실거래가 API 선택
7. 공시가격/공시지가 API 선택
8. 위험도 계산용 데이터 조합
9. 직접 확인 필요 영역 분리
10. 체크리스트 생성
```

## 상황별 호출 기준

| 상황 | 먼저 호출할 API | 다음 호출 API | 호출하지 말아야 할 API | 이유 |
| --- | --- | --- | --- | --- |
| 원룸 전세 | Juso/법정동코드 -> 건축HUB 표제부 | 단독다가구 또는 연립다세대 전월세/매매 후보, 공시가격 | 주소 입력 직후 모든 실거래가 API | 원룸은 다가구/다세대/오피스텔/근린생활시설 가능성이 있어 유형 판별이 먼저다. |
| 오피스텔 월세 | Juso/법정동코드 -> 건축HUB 표제부/전유부 | 오피스텔 전월세/매매 API 후보, 공시가격 후보 | 연립다세대 API 선호출 | 오피스텔 여부는 사용자 표현만으로 확정하지 않는다. |
| 아파트 매매 | Juso/법정동코드 -> 건축HUB 또는 AptIdInfoSvc | 아파트 매매 실거래가, 공동주택가격 | 토지/임야 API, 상권 API | 매매 목적은 가격 비교와 노후도/공시가격이 우선이다. |
| 다가구 전세 | Juso/법정동코드 -> 건축HUB 표제부 | 단독/다가구 전월세·매매 API 후보, 개별주택가격 후보 | 다세대 API로 안전 판정 | 다가구는 선순위 임차인 보증금 확인이 핵심이며 API로 확정할 수 없다. |
| 다세대 전세 | Juso/법정동코드 -> 건축HUB 표제부/전유부 | 연립다세대 전월세/매매 API, 공동주택가격 후보 | 단독다가구 API 선호출 | 호실/전유부 존재 여부가 가격 비교와 권리 확인 방향을 바꾼다. |
| 상가 창업 | 주소/법정동코드 -> 건축HUB 용도 확인 | 용도지역지구, 상가정보, 인허가 데이터 후보 | 전세가율 계산만으로 결과 생성 | 핵심 질문은 "내 업종 가능성"이며 장사 성공 확정은 금지다. |
| 지역/유형 과거 지표 분석 | 지역/유형 의도 분류 -> 한국부동산원 R-ONE 통계표/세부항목 확인 | R-ONE 통계자료 조회, 실거래가 월별 집계 후보 | 현재 매물 목록 API처럼 호출 | `강남 원룸`, `상가 월세`, `오피스텔 수익률`은 현재 매물 나열이 아니라 과거 지표 리포트로 처리한다. |
| 토지 매매 | 주소/PNU/좌표 -> 토지임야정보/지적도 | 용도지역지구도, 개별공시지가, 토지 실거래가 후보 | 건축물대장 중심 판정 | 토지는 건물보다 지목, 도로, 규제, 개발 가능성 확인이 먼저다. |
| 임야 개발 가능성 확인 | 주소/PNU/좌표 -> 토지임야정보 | 용도지역, 산사태, 침수, 산림/농지 규제 후보 | 개발 가능 확정 문장 | 개발행위허가는 지자체 문의 영역이다. |
| 꼬마빌딩 매매 | 주소/법정동코드 -> 건축HUB + 토지/공시지가 | 상업업무용/단독다가구/토지 실거래가, 임대차 자료 입력 | 임대수익률 자동 확정 | 건물 상태, 토지 가치, 임대차 현황을 함께 봐야 한다. |

## MVP 현재 구현과 future API

| Gate | 현재 구현 | future 후보 |
| --- | --- | --- |
| 주소 입력 | backend Juso 주소검색 proxy 선택 결과, 문자열 주소, 보조 Juso 팝업 선택 결과, VWorld Geocoder adapter와 health check | 좌표 변환을 진단 본 흐름과 후속 GIS API 호출에 연결 |
| 법정동코드 | `legal_dong_codes`, `legal_dong_aliases` DB catalog lookup과 행정표준코드 법정동코드 API sync client/service | 법정동 alias 품질 개선, 지역명 후보 scoring 고도화 |
| 건축물대장 | 건축HUB 표제부 adapter | 전유부, 층별개요, 지역지구구역, 폐쇄말소대장 |
| 실거래가 | 아파트/연립다세대/단독다가구/오피스텔 계열 일부 adapter | 상업업무용, 토지, 더 긴 기간/페이징 수집 |
| 과거 지표 분석 | R-ONE 통계표 목록/세부항목/통계자료 adapter와 수동 DB sync, `POST /api/regional-indicator-analyses`, R-ONE 저장 row, `market_indicator_*`, `market_statistics_monthly`, `SearchResultView.vue` 연결 | 법정동/행정구역 후보 매핑 고도화, 차트-ready 응답, evidence snapshot 연결, 관리자 데이터 품질 화면 |
| 공시가격 | VWorld 공시가격 adapter, `public_price_snapshots`, VWorld sync/admin seed target 경로 | 건축HUB 주택가격, 공동주택가격/개별주택가격 원문 API 정밀 분리 |
| 직접 확인 | 등기부등본 수동 확인 상태 | 등기부등본 PDF/OCR, 중개대상물 확인설명서 분석 |

## 장애와 대체 흐름

| 실패 지점 | 처리 | 사용자 메시지 방향 | 운영 로그 |
| --- | --- | --- | --- |
| Juso 직접검색 key 없음 | 백엔드 `GET /api/address-search/juso`가 외부 호출 없이 `UNAVAILABLE` 상태 반환, 화면은 직접 주소 입력 유지 | 주소검색 승인키 설정 필요 | backend `JUSO_ADDRESS_SEARCH_KEY` 확인, `external_api_call_logs`에는 key 없이 기록 |
| Juso popup key 없음 | 보조 popup endpoint가 Juso launch 전 400 HTML 오류 반환 | 팝업 승인키 설정 필요 | backend `JUSO_ADDRESS_CONFIRM_KEY` 확인, 문서화 |
| 법정동코드 미매칭 | 제한 진단 | 주소 또는 법정동을 다시 확인해야 함 | 필요 |
| 건축HUB key 없음 | 외부 호출 생략, `UNAVAILABLE` | 건축물대장 자동 조회가 설정되지 않음 | 필요 |
| 건축물대장 빈 결과 | `EMPTY` 또는 `NOT_FOUND` | 원본 건축물대장/주소 확인 필요 | 필요 |
| 실거래가 빈 결과 | 장애가 아니라 데이터 부족 | 최근 거래가 부족해 보수적으로 판단 | 필요 |
| 공시가격 빈 결과 | 데이터 부족 | 공시가격 원본 또는 보증기관 확인 필요 | 필요 |
| R-ONE key 없음 | 외부 호출 생략, `UNAVAILABLE` | 지역·유형 과거 지표 자동 분석이 설정되지 않음 | backend `KAB_R_ONE_API_KEY` 확인 |
| R-ONE 빈 결과 | `EMPTY` | 해당 통계표/지역/기간의 공개 통계가 부족해 제한 분석 | 필요 |
| R-ONE traffic 초과 | `UNAVAILABLE` 또는 `ERROR` | 통계 조회량 초과로 잠시 후 재시도 또는 직접 확인 안내 | 필수 |
| timeout/parser 오류 | `ERROR` | 외부 데이터 조회가 실패했으므로 직접 확인 필요 | 필요 |

## 구현 원칙

- API adapter는 HTTP 호출, timeout, key 누락, 원문 parsing을 책임진다.
- service/analyzer는 API 결과를 위험 문장과 체크리스트로 해석한다.
- 테스트에서는 실제 외부 API를 호출하지 않고 fake client 또는 `MockRestServiceServer`를 사용한다.
- `resultCode`, `totalCount`, 단건/배열 구조 차이를 parser 테스트로 고정한다.
- 외부 API 장애가 진단 전체 실패로 이어지지 않도록 `UNAVAILABLE`, `EMPTY`, `ERROR`를 구분한다.
- 현재 매물 제공은 하지 않는다. 지역/유형 입력은 R-ONE 과거 지표 분석 또는 정확 주소 진단으로 분기한다.

## 확인 필요

- Juso 주소검색 direct API는 `GET /api/address-search/juso`와 `JUSO_ADDRESS_SEARCH_KEY`로 구현되어 있고, 홈 위험진단 화면의 "주소 찾기"는 이 backend proxy를 사용한다. 팝업 endpoint는 보조/호환 경로로 남긴다.
- 상업업무용, 토지, 단독다가구, 오피스텔 실거래가 최신 원문 명세를 이 폴더에 추가해야 한다.
- 공시가격/공시지가 원문 명세를 VWorld 구현과 별도로 보존할 필요가 있다.
- Redis short TTL cache 도입 시 cache key에서 원문 주소와 개인정보를 어떻게 hash할지 결정해야 한다.

## Related documents

- [외부 API 구현 기준 문서](/docs/api/external-api/README.md)
- [API 조합 매트릭스](/docs/api/external-api/API_COMBINATION_MATRIX.md)
- [외부 API 설정과 data.go.kr 키 관리](/docs/api/EXTERNAL_API_CONFIGURATION.md)
- [과거 지표 분석과 정확 주소 위험진단 MVP API 호출 전략](/docs/api/API_CALL_FLOW.md)
