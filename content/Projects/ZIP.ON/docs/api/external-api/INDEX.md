---
title: INDEX
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-26T05:00:07+09:00
purpose: external-api-spec-index
status: active
code_sync_required: true
related_code: 
read_when: 
update_when: 
  - backend/src/main/java/com/zipon/external
  - backend/src/main/java/com/zipon/config/ExternalApiConfig.java
  - backend/src/main/java/com/zipon/config/JusoAddressSearchProperties.java
  - backend/src/main/java/com/zipon/config/VWorldProperties.java
  - backend/src/main/java/com/zipon/config/KabROneProperties.java
  - 외부 API 원문 명세, 요청 파라미터, 응답 필드, 구현 상태를 확인할 때
  - 새 외부 API 명세가 추가되거나 기존 API adapter/parser 구현 범위가 바뀔 때
---

# 외부 API 명세 인덱스

> Status: Current reference

이 문서는 `docs/api/external-api/specs/`에 보존한 외부 API 상세 명세의 색인이다. API 이름만 보지 말고, 어떤 ZIP:ON 기능에 쓰이는지와 어떤 요청 키가 필요한지 함께 확인한다.

이 인덱스는 원문 명세 보존 위치와 구현 후보를 함께 보여준다. 실제 구현 여부는 `backend/src/main/java/com/zipon/external`, 관련 `service`, `mapper`, migration을 확인한다.

## API 목록

| 번호 | API/서비스명 | 제공기관 | 원본/변환 문서 | 주요 기능 | 주요 요청키 | 주요 응답값 | 관련 ZIP:ON 기능 | 상세문서 |
| -: | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 행정표준코드 법정동코드 `getStanReginCdList` | 행정안전부 | `행정안전부_행정표준코드_법정동코드_API_구현명세.md` -> `legal-dong-code-api.md` | 법정동코드, 시도/시군구/읍면동/리 코드 조회 | `ServiceKey`, `type`, `pageNo`, `numOfRows`, `flag`, `locatadd_nm` | `region_cd`, `sido_cd`, `sgg_cd`, `umd_cd`, `ri_cd`, `locatadd_nm`, `locatjijuk_cd` | 주소 정제 후 법정동코드 변환, 실거래가 `LAWD_CD`, 건축HUB `sigunguCd`/`bjdongCd` 생성 | [spec](/docs/api/external-api/specs/legal-dong-code-api.md) |
| 2 | 건축HUB 건축물대장정보 `BldRgstHubService` | 국토교통부 | `CODEX_BUILDING_HUB_OPENAPI_IMPLEMENTATION_SPEC.md` -> `building-hub-openapi-implementation-spec.md` | 건축물 기본개요, 총괄표제부, 표제부, 층별개요, 전유부, 주택가격, 지역지구구역 등 조회 | `serviceKey`, `sigunguCd`, `bjdongCd`, `platGbCd`, `bun`, `ji`, `pageNo`, `numOfRows`, `_type` 후보 | 주용도, 대장구분, 대장종류, 세대수, 가구수, 사용승인일, 전유부/층별 정보, 지역지구구역 | 물건 유형 판별, 건축물 위험, 공시가격 보조, 체크리스트 생성 | [spec](/docs/api/external-api/specs/building-hub-openapi-implementation-spec.md) |
| 3 | 건축HUB 건물에너지정보 `BldEngyHubService` | 국토교통부 | 같은 건축HUB 묶음 문서 | 전기/가스 사용량 조회 | `serviceKey`, `sigunguCd`, `bjdongCd`, `bun`, `ji`, `useYm`, `pageNo`, `numOfRows` | 사용년월, 전기/가스 사용량, 주소/도로명 번호 후보 | 관리비/생활비 설명 보조, 장기 거주 비용 참고 | [spec](/docs/api/external-api/specs/building-hub-openapi-implementation-spec.md) |
| 4 | 건축HUB 건축물유지점검정보 `MtnChkHubService` | 국토교통부 | 같은 건축HUB 묶음 문서 | 유지점검 기관/이력 조회 | `serviceKey`, 상세 operation별 필수 키 확인 필요 | 점검기관, 점검이력 후보 | 노후도·관리상태 보조, 건물 매매/꼬마빌딩 확장 | [spec](/docs/api/external-api/specs/building-hub-openapi-implementation-spec.md) |
| 5 | 건축HUB 건축인허가정보 `ArchPmsHubService` | 국토교통부 | 같은 건축HUB 묶음 문서 | 건축허가, 착공, 사용승인 등 인허가 정보 조회 | `serviceKey`, `sigunguCd`, `bjdongCd`, `bun`, `ji`, operation별 추가 키 | 허가/착공/사용승인 관련 상태와 일자 | 건축물 상태, 상가/토지/건물 투자 확장 | [spec](/docs/api/external-api/specs/building-hub-openapi-implementation-spec.md) |
| 6 | 건축HUB 주택인허가정보 `HsPmsHubService` | 국토교통부 | 같은 건축HUB 묶음 문서 | 주택 인허가 정보 조회 | `serviceKey`, `sigunguCd`, `bjdongCd`, `bun`, `ji`, operation별 추가 키 | 주택 인허가 상태, 세대/주택 관련 값 | 주거용 매매, 신축/사용승인 위험 확인 | [spec](/docs/api/external-api/specs/building-hub-openapi-implementation-spec.md) |
| 7 | 건축HUB 폐쇄말소대장정보 `ShtRgstHubService` | 국토교통부 | 같은 건축HUB 묶음 문서 | 폐쇄/말소 건축물대장 조회 | `serviceKey`, `sigunguCd`, `bjdongCd`, `platGbCd`, `bun`, `ji` 등 | 폐쇄/말소 대장 유형, 주소, 대장 정보 | 철거/말소 이력 확인, 물건 정체 불일치 방지 | [spec](/docs/api/external-api/specs/building-hub-openapi-implementation-spec.md) |
| 8 | 아파트 매매 실거래가 `getRTMSDataSvcAptTradeDev` | 국토교통부/한국부동산원 | `zipon_external_api_spec_for_codex.md` -> `real-estate-transaction-api-spec.md` | 아파트 매매 신고 상세자료 조회 | `serviceKey`, `LAWD_CD`, `DEAL_YMD`, `pageNo`, `numOfRows` | `dealAmount`, `excluUseAr`, `floor`, `buildYear`, `aptNm`, `jibun`, `bonbun`, `bubun`, `rgstDate` | 전세가율 기준, 매매 위험도, 유사 거래 비교 | [spec](/docs/api/external-api/specs/real-estate-transaction-api-spec.md) |
| 9 | 아파트 전월세 실거래가 `getRTMSDataSvcAptRent` | 국토교통부/한국부동산원 | 같은 실거래가 묶음 문서 | 아파트 전월세 실거래가 조회 | `serviceKey`, `LAWD_CD`, `DEAL_YMD`, `pageNo`, `numOfRows` 지원 확인 필요 | `deposit`, `monthlyRent`, `excluUseAr`, `floor`, `buildYear`, `contractTerm`, `renewalUse` | 보증금/월세 비교, 월 고정 주거비 설명 | [spec](/docs/api/external-api/specs/real-estate-transaction-api-spec.md) |
| 10 | 연립다세대 매매 실거래가 `getRTMSDataSvcRHTrade` | 국토교통부/한국부동산원 | 같은 실거래가 묶음 문서 | 연립/다세대 매매 실거래가 조회 | `serviceKey`, `LAWD_CD`, `DEAL_YMD`, `pageNo`, `numOfRows` | 거래금액, `mhouseNm`, `houseType`, `landAr`, `jibun`, `excluUseAr`, `floor` | 빌라/다세대 매매 기준가격, 전세가율 기준 | [spec](/docs/api/external-api/specs/real-estate-transaction-api-spec.md) |
| 11 | 연립다세대 전월세 실거래가 `getRTMSDataSvcRHRent` | 국토교통부/한국부동산원 | 같은 실거래가 묶음 문서 | 연립/다세대 전월세 실거래가 조회 | `serviceKey`, `LAWD_CD`, `DEAL_YMD`, `pageNo`, `numOfRows` | 보증금, 월세, `mhouseNm`, `houseType`, `jibun`, `excluUseAr`, `floor`, 계약기간 | 다세대/연립 보증금·월세 비교 | [spec](/docs/api/external-api/specs/real-estate-transaction-api-spec.md) |
| 12 | 공동주택 단지 식별정보 `AptIdInfoSvc.getAptInfo` | 한국부동산원 | `AptIdInfoSvc_공동주택_단지_식별정보_API_구현명세.md` -> `apartment-complex-identification-api.md` | 주소/단지고유번호 기준 공동주택 단지 기본정보 조회 | `serviceKey`, `page`, `perPage`, `cond[COMPLEX_PK::EQ]`, `cond[ADRES::LIKE]` | `COMPLEX_PK`, `COMPLEX_GB_CD`, `ADRES`, `PNU`, `DONG_CNT`, `UNIT_CNT`, `USEAPR_DT`, 단지명 | 공동주택 후보 식별, 아파트/연립/다세대 보조 판별 | [spec](/docs/api/external-api/specs/apartment-complex-identification-api.md) |
| 13 | 공동주택 단지 동정보 `AptIdInfoSvc.getDongInfo` | 한국부동산원 | 같은 공동주택 단지 식별 문서 | 단지고유번호 기준 동정보 조회 | `serviceKey`, `page`, `perPage`, `cond[COMPLEX_PK::EQ]` | 동명, 동 식별값 후보 | 사용자가 입력한 동/호와 단지 동명 비교 보조 | [spec](/docs/api/external-api/specs/apartment-complex-identification-api.md) |
| 14 | 공동주택 단지명 이력 `AptIdInfoSvc.getHistInfo` | 한국부동산원 | 같은 공동주택 단지 식별 문서 | 단지고유번호 기준 단지명 이력 조회 | `serviceKey`, `page`, `perPage`, `cond[COMPLEX_PK::EQ]` | 과거 단지명, 변경 이력 후보 | 단지명 불일치 보정, 실거래가/공시가격 검색 보조 | [spec](/docs/api/external-api/specs/apartment-complex-identification-api.md) |
| 15 | VWorld Geocoder API 2.0 `getCoord` | VWorld | 공식 문서 + 사용자 제공 URL -> `vworld-public-price-and-gis-api.md` | 도로명/지번 주소를 좌표로 변환 | `service=address`, `request=getCoord`, `key`, `type=ROAD/PARCEL`, `address`, `crs`, `format` | `status`, `refined.text`, `result.crs`, `result.point.x`, `result.point.y` | 좌표 기반 생활안전/환경·재난/GIS건물 후보 조회 전 실시간 좌표 변환 | [spec](/docs/api/external-api/specs/vworld-public-price-and-gis-api.md) |
| 16 | VWorld 개별주택가격 속성조회 `getIndvdHousingPriceAttr` | VWorld | VWorld 공식 Java 예제 + 사용자 제공 response -> `vworld-public-price-and-gis-api.md` | PNU/기준연도 기반 개별주택가격 속성 조회 | `key`, `domain`, `pnu`, `stdrYear`, `format`, `numOfRows`, `pageNo` | `pnu`, `ldCode`, `stdrYear`, `stdrMt`, `housePc`, 면적, 최종수정일 | 단독/다가구 공시가격 참고, 보증금 대비 비율 계산 | [spec](/docs/api/external-api/specs/vworld-public-price-and-gis-api.md) |
| 17 | VWorld 2D Data API 읍면동 `LT_C_ADEMD_INFO` | VWorld/행정안전부 | VWorld 공식 2D데이터 API 레퍼런스 -> `vworld-public-price-and-gis-api.md` | 읍면동 단위 경계 polygon 조회 | `service=data`, `request=GetFeature`, `data=LT_C_ADEMD_INFO`, `key`, `attrFilter=emdCd:IN:{code}`, `crs=EPSG:4326` | `status`, `properties.emd_cd`, `properties.full_nm`, GeoJSON `geometry.coordinates` | 지도 위치확인 화면의 가능 지역 경계 polygon 표시 | [spec](/docs/api/external-api/specs/vworld-public-price-and-gis-api.md) |
| 18 | VWorld GIS건물통합정보 후보 | VWorld | 사용자 제공 정보 -> `vworld-public-price-and-gis-api.md` | 건물 존재/공간정보 조회 가능 후보 | endpoint/요청키 확인 필요 | 건물 위치, 건물관리번호, 용도/면적 후보 확인 필요 | 건축HUB 결과 교차 검증, 물건 정체 판별 보조 | [spec](/docs/api/external-api/specs/vworld-public-price-and-gis-api.md) |
| 19 | Juso 주소검색 팝업/직접검색 API | 행정안전부 도로명주소 주소기반산업지원서비스 | 사용자 제공 명세 -> `juso-address-search-api.md` | 주소 후보 검색, 도로명/지번/행정구역코드 후보 반환 | `confmKey`, `returnUrl`, `currentPage`, `countPerPage`, `keyword`, `resultType` | `roadAddr`, `jibunAddr`, `admCd`, `bdMgtSn`, `mtYn`, `lnbrMnnm`, `lnbrSlno` | 홈 위험진단 주소 입력 보조, `RentRiskDiagnosisRequest.jusoAddress` 후보 생성 | [spec](/docs/api/external-api/specs/juso-address-search-api.md) |
| 20 | 한국부동산원 R-ONE 부동산통계 OpenAPI | 한국부동산원 | 사용자 제공 XLS 4개 + 공식 개발가이드 확인 -> `kab-r-one-statistics-api.md` | `SttsApiTbl.do`, `SttsApiTblItm.do`, `SttsApiTblData.do`로 통계표 목록, 세부항목, 통계자료 조회 | `KEY`, `Type`, `pIndex`, `pSize`, `STATBL_ID`, `DTACYCLE_CD`, `GRP_ID`, `CLS_ID`, `ITM_ID`, `START_WRTTIME`, `END_WRTTIME` | `STATBL_ID`, `STATBL_NM`, `DTACYCLE_CD`, `GRP_NM`, `CLS_NM`, `ITM_NM`, `DTA_VAL`, `UI_NM`, `WRTTIME_DESC` | 현재 매물 제공이 아닌 지역·유형별 과거 가격지수, 전세·월세 지표, 오피스텔 수익률, 상가 공실률 분석 | [spec](/docs/api/external-api/specs/kab-r-one-statistics-api.md) |

## 확인 필요

- 건축HUB 일부 서비스는 문서상 `http`와 `https`, `GET`과 REST 전체 메서드 표기가 섞인다. 구현 전 포털 실제 호출로 확인한다.
- 실거래가 API 일부 문서에는 `pageNo`, `numOfRows`가 요청 표에 없지만 응답/샘플에는 있다. 구현 전 지원 여부를 확인한다.
- `AptIdInfoSvc`의 `totalCount`와 `matchCount` 의미는 조건 검색 반복 기준으로 쓰기 전에 실제 응답으로 확인한다.
- 법정동코드 API의 `locatjumin_cd`, `locatjijuk_cd`는 하위 API별 사용 기준을 별도 확인한다.
- `ServiceKey`와 `serviceKey`는 API별 원문 대소문자를 유지한다.
- VWorld GIS건물통합정보의 구체 endpoint와 응답 필드는 공식 문서 확인이 필요하다. 읍면동 경계 `LT_C_ADEMD_INFO`는 가능 지역 지도 표시용으로만 쓰고, 건물 존재 확인으로 사용하지 않는다.
- 한국부동산원 R-ONE 통계 API는 현재 매물 목록을 제공하지 않는다. 지역/유형/역세권 입력은 과거 지표 분석으로 처리한다.

## 현재 코드 구현 상태 요약

| API 묶음 | 현재 코드 상태 |
| --- | --- |
| Juso 주소검색 | backend proxy와 popup 보조 경로가 구현되어 있다. |
| 행정표준코드 법정동코드 | DB catalog lookup과 data.go.kr sync client/service가 구현되어 있다. |
| 건축HUB 건축물대장 | 표제부 중심 adapter, parser, snapshot store가 구현되어 있다. 전유부/층별개요 전체 분석은 확장 영역이다. |
| 실거래가 | 아파트/오피스텔/연립다세대/단독다가구 매매·전월세 계열 adapter와 DB fact/statistics 저장 경로가 구현되어 있다. |
| VWorld 공시가격 | 공시가격 adapter, snapshot store, sync/admin seed target 경로가 구현되어 있다. |
| VWorld Geocoder/읍면동 경계 | 좌표 변환과 법정동 경계 조회 adapter가 구현되어 지도 진단 보조에 사용된다. |
| 한국부동산원 R-ONE | 통계표/세부항목/통계자료 sync와 market indicator read model 연결이 구현되어 있다. |
| AptIdInfoSvc, 토지/상권/환경·재난 | 원문 후보 또는 future 영역이다. 새 구현 전 명세와 저장 정책을 먼저 갱신한다. |

## 구현 계획 문서

| 문서 | 역할 |
| --- | --- |
| [DATA_USAGE_AND_INSIGHT_PLAN.md](/docs/api/external-api/DATA_USAGE_AND_INSIGHT_PLAN.md) | 외부 API를 어떤 순서로 붙이고, 어떤 데이터를 저장/캐시/저장 금지하며, 어떤 위험 문장과 운영 통찰로 바꿀지 정리 |
| [IMPLEMENTATION_BACKLOG.md](/docs/api/external-api/IMPLEMENTATION_BACKLOG.md) | 의존관계 기준 실제 구현 순서 |

## Related documents

- [외부 API 구현 기준 문서](/docs/api/external-api/README.md)
- [주소와 코드 변환 흐름](/docs/api/external-api/ADDRESS_CODE_FLOW.md)
- [외부 API 호출 전략](/docs/api/external-api/API_CALL_STRATEGY.md)
- [외부 API 데이터 활용과 통찰 산출 계획](/docs/api/external-api/DATA_USAGE_AND_INSIGHT_PLAN.md)
