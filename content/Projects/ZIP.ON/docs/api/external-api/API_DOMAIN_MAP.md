---
title: API_DOMAIN_MAP
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
purpose: external-api-domain-map
status: active
code_sync_required: true
related_code: 
read_when: 
update_when: 
  - backend/src/main/java/com/zipon/external
  - backend/src/main/java/com/zipon/service
  - backend/src/main/java/com/zipon/mapper
  - 기능 영역별로 어떤 외부 API와 저장 경로를 써야 하는지 판단할 때
  - 새 외부 API를 정확 주소 위험진단, 지역 분석, 지도, 운영 화면에 연결할 때
  - 외부 API가 새 기능 영역에 연결되거나 기존 기능의 데이터 조합이 바뀔 때
---

# 외부 API 기능 영역 매핑

> Status: Current reference

이 문서는 외부 API를 ZIP:ON의 기능 영역별로 매핑한다. 하나의 API가 여러 기능에 쓰이면 중복해서 적고, 하나의 기능에 여러 API가 필요하면 조합 순서를 명시한다.

## 기능 영역별 API

| 기능 영역 | 사용하는 API | 필요한 입력값 | 핵심 응답값 | 후속 처리 | 비고 |
| --- | --- | --- | --- | --- | --- |
| 주소 정제 | Juso 팝업, backend Juso 주소검색 proxy | 사용자 검색어, Juso 승인키 | 도로명주소, 지번주소, `admCd`, `siNm`, `sggNm`, `emdNm`, `liNm`, `mtYn`, `lnbrMnnm`, `lnbrSlno` | `LeaseRiskAddressNormalizer`가 법정동 lookup에 사용 | 팝업은 화면 선택 flow, 직접검색은 `GET /api/address-search/juso` JSON 후보 API |
| 법정동코드 변환 | 행정표준코드 법정동코드 `getStanReginCdList`, 내부 `legal_dong_codes` | 지역주소명, page | `region_cd`, `sido_cd`, `sgg_cd`, `umd_cd`, `ri_cd`, `locatadd_nm` | DB catalog lookup, data.go.kr sync, `LAWD_CD` 생성 | 운영은 DB catalog 우선, sync는 freshness 보강 경로 |
| 가능 지역 경계 표시 | VWorld 2D Data API `LT_C_ADEMD_INFO` | `legal_dong_codes.legal_dong_code` 앞 8자리 읍면동코드, `VWORLD_API_KEY` | GeoJSON `geometry.coordinates`, `properties.emd_cd`, `full_nm`, `emd_kor_nm` | `MapAnalyzableLocationResponse.boundaryPolygons`로 변환해 Kakao `Polygon` 표시 | DB 저장 없이 지도 응답 보조 조회. 경계가 없으면 원형 fallback 금지 |
| 좌표 변환 | VWorld Geocoder API 2.0 | 도로명/지번 주소, `type=ROAD` 또는 `PARCEL`, `crs=EPSG:4326` 후보 | `result.point.x`, `result.point.y`, `status` | 생활안전지도, 환경·재난, 지도 layer 호출 직전 실시간 사용 | 공식 문서상 별도 저장장치/DB 저장 금지 |
| 물건 유형 판별 | 건축HUB 건축물대장정보, AptIdInfoSvc, VWorld GIS건물통합정보 후보 | 법정동코드 분리값, 본번/부번, 주소/단지고유번호, 좌표 후보 | 주용도, 기타용도, 대장구분, 대장종류, 세대수, 가구수, `COMPLEX_GB_CD`, `PNU`, 건물 공간정보 후보 | `BuildingTypeResolver`, `LeaseRiskDiagnosisPropertyIdentityService`, `BuildingRegisterTitleSnapshotStore` | 사용자 표현만으로 유형 확정 금지. `mainPurpsCdNm=업무시설`처럼 넓은 값은 `etcPurps`와 세대/가구수를 함께 보고 오피스텔 후보를 판별 |
| 건축물 기본정보 확인 | 건축HUB 건축물대장정보 | `sigunguCd`, `bjdongCd`, `platGbCd`, `bun`, `ji` | 주용도, 기타용도, 사용승인일, 층수, 면적, 세대/가구수, 전유부 | 노후도, 주거 목적 불일치, 체크리스트, `building_register_title_snapshots` | 현재 adapter는 표제부 최소 필드만 수집. 전유부/층별개요는 미수집 |
| 토지·임야 기본정보 확인 | 토지임야정보 후보, 지적도 후보 | PNU, 법정동코드, 지번, 좌표 | 지목, 면적, 대장구분, 필지 경계 | 토지/임야 개발 가능성 1차 진단 | 추가 명세 필요 |
| 지적/필지 확인 | 지적도 후보, VWorld GIS건물통합정보 후보 | PNU, 좌표 | 필지 경계, 건물 위치 | 주소 후보 검증, 토지/건물 매칭 | GIS건물통합정보 endpoint 확인 필요 |
| 용도지역·지구·구역 확인 | 건축HUB 지역지구구역, 용도지역지구도 후보 | 법정동코드, 지번, PNU, 좌표 | 용도지역, 용도지구, 용도구역 | 상가/토지/건물 투자 체크리스트 | API별 법정동코드 요구 형식 확인 |
| 실거래가 확인 | 아파트/연립다세대 매매·전월세 API, 단독다가구/오피스텔 API 후보 | `LAWD_CD`, `DEAL_YMD`, page | 거래금액, 보증금, 월세, 전용면적, 층, 건축년도, 단지명, 지번 | 유사 거래 필터링, 보증금/월세/매매 비교 | 유형 판별 뒤 호출 |
| 공시가격·공시지가 확인 | VWorld 공시가격 현재 구현, VWorld `getIndvdHousingPriceAttr`, 건축HUB 주택가격, 공동주택가격/개별주택가격/개별공시지가 후보 | PNU, 기준연도, 동/호 후보 | `housePc`, 공시가격, 공시지가, 전용면적, 기준연도 | `PublicPriceSnapshotStore`가 `public_price_snapshots` 30일 DB-first snapshot으로 재사용하고, 보증금 대비 비율과 매매 보조 기준으로 변환 | 동·호 정밀 매칭 미구현. 공시가격은 현재 시세 확정값이 아님 |
| 전세 위험도 계산 | 건축HUB + 전월세 실거래가 + 매매 실거래가 + 공시가격 + R-ONE 시장지표 summary | 물건 유형, 보증금, `LAWD_CD`, `DEAL_YMD`, PNU, 법정동코드 | 주용도, 기타용도, 전세 보증금, 매매가, 공시가격, 전세·매매 가격지수 방향성/변동성 | `DepositRiskCalculator`, `LeaseRiskDiagnosisRiskSummaryService`, `LeaseRiskMarketSignalService`, `RiskScoringFallbackService` | 등기/선순위 임차인은 직접 확인. 정확 주소 가격 근거가 부족할 때 시장 signal은 보조 근거로만 사용 |
| 월세 적정성 판단 | 전월세 실거래가 + 건축물대장 + 관리비 후보 | 월세, 관리비, 전용면적, 층 | 월세, 보증금, 면적, 층, 사용승인일 | 월세 대표값 비교, 월 고정 주거비 안내 | 보증금-월세 환산 미구현 |
| 지역·유형 과거 지표 분석 | 한국부동산원 R-ONE 부동산통계 OpenAPI + 실거래가 월별 집계 후보 | 지역/유형 키워드, 통계표 코드 `STATBL_ID`, 자료주기 `DTACYCLE_CD`, `GRP_ID`, `CLS_ID`, `ITM_ID`, 기간 | 가격지수, 전세가격지수, 월세가격지수, 오피스텔 수익률, 상가 공실률, `DTA_VAL`, `UI_NM`, `WRTTIME_DESC` | 현재 매물 목록 대신 과거 지표 분석 리포트, 변동성, 추세, 데이터 한계 설명 | R-ONE은 현재 매물 feed가 아님 |
| 매매 위험도 계산 | 매매 실거래가 + 공시가격 + 건축물대장 | 매매가, 물건 유형, `LAWD_CD`, PNU | 거래금액, 공시가격, 노후도 | 가격 비교, 수리/노후 체크리스트 | 후속 확장 |
| 상권 분석 | 소상공인 상가정보, 인허가 데이터 후보 | 좌표, 법정동, 업종 | 업소 수, 폐업/영업 상태, 인허가 상태 | 창업 가능성 체크리스트 | 추가 명세 필요. 성공 가능성 확정 금지 |
| 생활 인프라 분석 | K-apt, NEIS, 생활안전지도, 교통사고 API 후보 | 좌표, 행정구역, 단지 식별값 | 학교, 관리비, 치안시설, 사고다발지역 | 생활 리스크 카드, 현장 확인 항목 | MVP 후속 보조 |
| 환경·재난 리스크 분석 | 침수, 하천범람, 산사태, 환경공간정보 후보 | 좌표, PNU, 법정동 | 침수심, 산사태위험, 토지피복 | 환경·재난 체크리스트 | 추가 명세 필요 |
| 계약 상대방·중개사 확인 | 부동산중개업정보 후보, 사업자등록 상태조회 후보 | 중개업소명, 주소, 사업자번호 | 등록상태, 행정처분, 사업자 상태 | 계약 전 확인 안내 | 중개사 신뢰도 확정 금지 |
| 계약 전 체크리스트 생성 | 모든 선행 API + 사용자 입력 | 목적, 물건 유형, 조회 상태 | 확인된 정보, 미확인 정보, 오류/빈 결과 | `LeaseRiskDiagnosisChecklistService`, `LeaseRiskDiagnosisNextActionService` | 데이터 없음은 안전함이 아님 |

## 단독으로 의미가 약한 API

| API | 단독 한계 | 함께 봐야 하는 API |
| --- | --- | --- |
| 실거래가 API | 주소 정제와 물건 정체를 판별하지 못한다. | 법정동코드, 건축HUB, 공시가격 |
| AptIdInfoSvc | 가격, 권리관계, 다가구/오피스텔 판단을 대체하지 못한다. | 건축HUB, 실거래가, 공시가격 |
| 법정동코드 API | 가격이나 건축물 정보를 제공하지 않는다. | 모든 후행 API |
| 한국부동산원 R-ONE 통계 API | 현재 매물 목록, 개별 주소 안전성, 권리관계를 제공하지 않는다. | 정확 주소 진단, 건축물대장, 실거래가, 공시가격 |
| 건축HUB 표제부 | 등기 권리관계, 선순위 임차인, 보증보험 가능성을 확인하지 못한다. | 실거래가, 공시가격, 사용자 등기부등본 확인 |
| 에너지 사용량 API | 관리비 청구 내역을 직접 증명하지 않는다. | 관리비 고지서, K-apt, 현장 확인 |

## Related documents

- [주소와 코드 변환 흐름](/docs/api/external-api/ADDRESS_CODE_FLOW.md)
- [외부 API 호출 전략](/docs/api/external-api/API_CALL_STRATEGY.md)
- [API 조합 매트릭스](/docs/api/external-api/API_COMBINATION_MATRIX.md)
- [공공데이터 API 연동 전략](/docs/api/PUBLIC_API_STRATEGY.md)
