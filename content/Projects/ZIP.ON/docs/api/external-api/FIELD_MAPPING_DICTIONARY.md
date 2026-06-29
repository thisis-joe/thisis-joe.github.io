---
title: FIELD_MAPPING_DICTIONARY
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-30T05:00:06+09:00
---

# 외부 API 필드 매핑 사전

> Status: Current reference

이 문서는 외부 API 원문 필드와 ZIP:ON 내부 도메인 필드 후보를 연결한다. 원문 필드명, URL, endpoint, enum 값은 원문 표기를 유지한다.

## 매핑 표

| 외부 API | 원문 필드명 | 원문 의미 | 타입/포맷 | ZIP:ON 내부 필드 후보 | 변환 규칙 | 주의사항 |
| --- | --- | --- | --- | --- | --- | --- |
| 행정표준코드 | `region_cd` | 지역코드 | 10자리 문자열 | `legal_dong_code_source_rows.region_cd`, leaf row는 `legal_dong_codes.legal_dong_code` | 그대로 저장 | 숫자 변환 금지 |
| 행정표준코드 | `sido_cd` | 시도코드 | 2자리 문자열 | `legal_dong_code_source_rows.sido_cd` | 그대로 저장 | 앞자리 보존 |
| 행정표준코드 | `sgg_cd` | 시군구코드 | 3자리 문자열 | `legal_dong_code_source_rows.sgg_cd` | `sido_cd + sgg_cd`로 5자리 후보 | API별 사용 기준 확인 |
| 행정표준코드 | `umd_cd`, `ri_cd` | 읍면동/리 코드 | 문자열 | `legal_dong_code_source_rows.umd_cd`, `legal_dong_code_source_rows.ri_cd` | 그대로 저장 | 법정동코드 뒤 5자리와 비교 |
| 행정표준코드 | `locatadd_nm` | 지역주소명 | 문자열 | `legal_dong_code_source_rows.locat_add_nm`, leaf row 이름 분해 후보 | trim | 주소 검색어와 매칭 |
| 행정표준코드 | `locatjumin_cd`, `locatjijuk_cd` | 주민/지적 지역코드 | 10자리 문자열 | `legal_dong_code_source_rows.locat_jumin_cd`, `legal_dong_code_source_rows.locat_jijuk_cd` | 그대로 저장 | 어떤 API가 쓰는지 확인 필요 |
| 행정표준코드 | `locat_order`, `locat_rm`, `locathigh_cd`, `locallow_nm`, `adpt_de` | 정렬, 비고, 상위지역코드, 최하위지역명, 생성일 | 문자열 | `legal_dong_code_source_rows` 원천 필드 | 그대로 저장 | 계층/이력 분석 후보이며 사용자 판정 근거로 직접 노출하지 않음 |
| Juso 선택 결과 | `admCd` | 행정구역코드 후보 | 문자열 | `JusoAddressSelection.admCd` | `legal_dong_codes` lookup에 사용 | 법정동코드와 동일하다고 단정 금지 |
| Juso 선택/검색 결과 | `roadAddr`, `roadAddrPart1`, `roadAddrPart2` | 도로명주소 | 문자열 | `JusoAddressResponse.roadAddr*`, future address candidate | trim 후 화면 후보로 사용 | 도로명주소만으로 물건 유형 확정 금지 |
| Juso 선택/검색 결과 | `jibunAddr` | 지번주소 | 문자열 | `JusoAddressResponse.jibunAddr`, `RentRiskDiagnosisRequest.address` 후보 | 사용자가 선택하면 진단 주소 후보로 제출 | 지번 문자열 파싱보다 구조화 필드 우선 |
| Juso 선택 결과 | `mtYn` | 산 여부 | `0`/`1` 후보 | `JibunAddress.mountain` | `1`이면 true | 원문 값 체계 확인 |
| Juso 선택 결과 | `lnbrMnnm`, `lnbrSlno` | 지번 본번/부번 | 문자열 | `JibunAddress.mainNumber`, `subNumber` | 정수 파싱 후 건축HUB query에서 4자리 padding | 원문 값은 snapshot 보존 가능 |
| Juso 검색 결과 | `hstryYn`, `relJibun`, `hemdNm` | 변동이력 여부, 관련 지번, 행정동명 | 문자열 | `JusoAddressResponse` 표시/후보 필드 | 원문 문자열 유지 | 법정동 확정에는 `admCd`, 법정동명 계열을 우선 사용 |
| 건축HUB | `sigunguCd` | 시군구코드 | 5자리 문자열 | `BuildingRegisterApiQuery.sigunguCode` | 법정동코드 앞 5자리 | `LAWD_CD`와 같은 값 후보지만 이름 유지 |
| 건축HUB | `bjdongCd` | 법정동코드 | 5자리 문자열 | `BuildingRegisterApiQuery.bjdongCode` | 법정동코드 뒤 5자리 | 숫자 변환 금지 |
| 건축HUB | `platGbCd` | 대지구분코드 | `0`/`1` 후보 | `BuildingRegisterApiQuery.platGbCode` | 일반 대지 `0`, 산 `1` 후보 | 원문 확인 유지 |
| 건축HUB | `bun`, `ji` | 번/지 | 4자리 문자열 | `BuildingRegisterApiQuery.bun`, `ji` | zero-padding | 부번 없음은 `0000` 후보 |
| 건축HUB | `mainPurpsCdNm` | 주용도명 | 문자열 | `BuildingRegisterSnapshot.mainUseName`, `BuildingRegisterTitleSnapshot.mainUseName` | trim | 용도코드와 코드명 분리 여부 확인 |
| 건축HUB | `etcPurps` | 기타용도 | 문자열 | `BuildingRegisterSnapshot.detailUseName`, `BuildingRegisterTitleSnapshot.detailUseName` | trim | 주용도가 `업무시설`처럼 넓을 때 `오피스텔`, `다세대주택` 등 세부 용도 판별 보조. 단독 확정 사실로 노출하지 않음 |
| 건축HUB | `regstrGbCdNm` | 대장구분명 | 문자열 | `BuildingRegisterSnapshot.registerDivisionName`, `BuildingRegisterTitleSnapshot.registerDivisionName` | trim | 일반/집합 판별 |
| 건축HUB | `regstrKindCdNm` | 대장종류명 | 문자열 | `BuildingRegisterSnapshot.registerTypeName`, `BuildingRegisterTitleSnapshot.registerTypeName` | trim | 표제부/전유부 판별 |
| 건축HUB | `hhldCnt` | 세대수 | 숫자 문자열 | `BuildingRegisterSnapshot.householdCount`, `BuildingRegisterTitleSnapshot.householdCount` | 정수 변환 | 빈 값 허용 |
| 건축HUB | `fmlyCnt` | 가구수 | 숫자 문자열 | `BuildingRegisterSnapshot.familyCount`, `BuildingRegisterTitleSnapshot.familyCount` | 정수 변환 | 다가구 판단 보조 |
| 건축HUB | `useAprDay` | 사용승인일 | `yyyyMMdd` 후보 | `BuildingRegisterSnapshot.useApprovalDate`, `BuildingRegisterTitleSnapshot.useApprovalDate` | 날짜 변환 | 원문 공백/불완전 날짜 처리 |
| 건축HUB 전유부 | 전유부 관련 면적/호실 필드 | 전유부/호실 정보 | 원문별 확인 | future `ExclusiveUnitSnapshot` 후보 | 원문 기준 매핑 | 현재 adapter 미구현 |
| 실거래가 공통 | `LAWD_CD` | 지역코드 | 5자리 문자열 | `RentTransactionApiQuery.lawdCode`, `SaleTransactionApiQuery.lawdCode` | 법정동코드 앞 5자리 | 시군구 단위 조회 |
| 실거래가 공통 | `DEAL_YMD` | 계약년월 | `yyyyMM` | query deal year-month | `YearMonth`로 변환 가능 | 최근 완료월 계산 필요 |
| 실거래가 응답 | `dealAmount` | 거래금액 | 만원 문자열, comma 가능 | `SaleTransactionSnapshot.dealAmountManwon` | comma 제거 후 `long` | 단위는 만원 |
| 실거래가 응답 | `deposit` 또는 보증금 계열 필드 | 보증금 | 만원 문자열, comma 가능 | `RentTransactionSnapshot.depositAmountManwon` | comma 제거 후 `long` | API별 필드명 확인 |
| 실거래가 응답 | `monthlyRent` 또는 월세 계열 필드 | 월세 | 만원 문자열 | `RentTransactionSnapshot.monthlyRentAmountManwon` | comma 제거 후 `long` | 0원 가능 |
| 실거래가 응답 | `excluUseAr` | 전용면적 | ㎡ 문자열 | `exclusiveAreaSquareMeter` | `BigDecimal` 후보 | 면적 유사도 계산 |
| 실거래가 응답 | `floor` | 층 | 문자열 | `floorNumber` | 정수 변환 후보 | 지하층/공백 고려 |
| 실거래가 응답 | `buildYear` | 건축년도 | `yyyy` 문자열 | `buildYear` | 정수/Year 변환 | 건축물대장 사용승인일보다 보조값 |
| 실거래가 응답 | `jibun`, `bonbun`, `bubun` | 지번/본번/부번 | 문자열 | 매칭 후보 | 원문 보존 | 앞자리 0 보존 |
| 실거래가 응답 | `aptNm`, `mhouseNm` | 단지/건물명 | 문자열 | 거래명 후보 | trim | 단지명 이력 보정 가능 |
| 한국부동산원 R-ONE 통계목록 | `STATBL_ID` | 통계표 코드 | 문자열 | `kab_r_one_statistical_tables.table_id` | 그대로 저장 | 숫자 변환 금지 |
| 한국부동산원 R-ONE 통계목록 | `STATBL_NM` | 통계표명 | 문자열 | `kab_r_one_statistical_tables.table_name` | trim | 사용자 화면에는 원문명보다 해석 문장 우선 |
| 한국부동산원 R-ONE 통계목록 | `DTACYCLE_CD`, `DTACYCLE_NM` | 자료주기 코드/명 | 문자열 | `kab_r_one_statistical_tables.data_cycle_code`, `data_cycle_name` | 그대로 저장 | 통계표별 의미 확인 |
| 한국부동산원 R-ONE 통계목록 | `DATA_START_YY`, `DATA_END_YY` | 자료 시작/종료 연도 | 연도 문자열 | `kab_r_one_statistical_tables.data_start_year`, `data_end_year` | 정수 변환 가능할 때만 저장 | 종료 연도 공백 가능성 확인 |
| 한국부동산원 R-ONE 세부항목 | `ITM_TAG` | 항목 태그 | 문자열 | `kab_r_one_statistical_items.item_tag` | 그대로 저장 | `GRP_ID`, `CLS_ID`, `ITM_ID` 의미는 통계표별 확인 |
| 한국부동산원 R-ONE 세부항목 | `ITM_ID`, `PAR_ITM_ID` | 항목 ID/상위 항목 ID | 문자열 | `kab_r_one_statistical_items.item_id`, `parent_item_id` | 그대로 저장 | 숫자 변환 금지 |
| 한국부동산원 R-ONE 세부항목 | `ITM_NM`, `ITM_FULLNM` | 항목명/전체명 | 문자열 | `kab_r_one_statistical_items.item_name`, `item_full_name` | trim | 지역/유형 표시 후보 |
| 한국부동산원 R-ONE 통계자료 | `GRP_ID`, `GRP_NM`, `GRP_FULLNM` | 그룹 ID/명 | 문자열 | `kab_r_one_statistical_data_points.group_id`, `group_name`, `group_full_name` | 그대로 저장 | 지역인지 유형인지는 통계표별 확인 |
| 한국부동산원 R-ONE 통계자료 | `CLS_ID`, `CLS_NM`, `CLS_FULLNM` | 분류 ID/명 | 문자열 | `kab_r_one_statistical_data_points.class_id`, `class_name`, `class_full_name` | 그대로 저장 | 지역인지 유형인지는 통계표별 확인 |
| 한국부동산원 R-ONE 통계자료 | `DTA_VAL` | 통계값 | 문자열 숫자 후보 | `kab_r_one_statistical_data_points.data_value_raw`, `data_value_decimal` | 원문은 보존하고 숫자 변환 가능할 때만 `BigDecimal` 저장 | 단위 확정 전 계산 금지 |
| 한국부동산원 R-ONE 통계자료 | `UI_NM` | 단위명 | 문자열 | `kab_r_one_statistical_data_points.unit_name` | trim | 사용자 설명에 반드시 반영 |
| 한국부동산원 R-ONE 통계자료 | `WRTTIME_DESC`, `WRTTIME_IDTFR_ID` | 작성시점 설명/식별자 | 문자열 | `kab_r_one_statistical_data_points.written_time_description`, `written_time_identifier_id` | 기준월/분기/연도 변환 후보 | 시계열 정렬 기준 확인 |
| 공시가격 | 공시가격 금액 필드 | 공시가격 | 원 단위 또는 만원 단위 API별 확인 | `PublicPriceSnapshot.publicPriceAmountManwon`, `StoredPublicPriceSnapshot.publicPriceAmountManwon` | 현재 VWorld parser는 만원 단위 snapshot으로 변환하고 `public_price_snapshots.public_price_amount_manwon`에 저장 | 원문 API별 단위 확인 |
| VWorld 2D Data 읍면동 | `properties.emd_cd`, `properties.emdCd` | 읍면동코드 | 8자리 문자열 | `LegalDongBoundaryApiResponseParser` lookup key | `legal_dong_codes.legal_dong_code` 앞 8자리와 매칭 | 법정동코드 10자리 전체와 같다고 단정 금지 |
| VWorld 2D Data 읍면동 | `properties.full_nm` | 행정구역 전체명 | 문자열 | 표시/검증 후보 | trim | 현재 응답 DTO에는 직접 노출하지 않음 |
| VWorld 2D Data 읍면동 | `properties.emd_kor_nm` | 읍면동명 | 문자열 | 표시/검증 후보 | trim | 내부 `legalDongName`과 교차 확인 후보 |
| VWorld 2D Data 읍면동 | `geometry.type` | GeoJSON geometry 유형 | `Polygon`, `MultiPolygon` | polygon parser 분기 | `Polygon`은 첫 outer ring, `MultiPolygon`은 각 polygon outer ring으로 정규화 | hole/interior ring 정밀 표시가 필요하면 후속 확장 |
| VWorld 2D Data 읍면동 | `geometry.coordinates` | GeoJSON 좌표 | `[longitude, latitude]` 배열 | `MapAnalyzableLocationResponse.boundaryPolygons[].latitude/longitude` | 첫 값은 경도, 둘째 값은 위도로 변환 | 좌표 순서 반전 주의. 임의 원형 fallback 금지 |
| VWorld Geocoder | `status` | 처리 상태 | `OK`, `NOT_FOUND`, `ERROR` | geocoding lookup status 후보 | enum 변환 | 빈 결과와 오류 구분 |
| VWorld Geocoder | `input.type` | 입력 주소 유형 | `ROAD`, `PARCEL` | request echo | 문자열 유지 | 로그에 원문 주소 전체 저장 주의 |
| VWorld Geocoder | `refined.text` | 정제 주소 텍스트 | 문자열 | 주소 검증 후보 | trim | `refine=false` 또는 `simple=true`면 생략 가능 |
| VWorld Geocoder | `result.crs` | 응답 좌표계 | 문자열 | `coordinateCrs` 후보 | 문자열 유지 | `EPSG:4326` 우선 |
| VWorld Geocoder | `result.point.x` | x 좌표 | 숫자 | longitude 후보 | 좌표계 확인 후 decimal 변환 | 저장 금지. 실시간 사용 |
| VWorld Geocoder | `result.point.y` | y 좌표 | 숫자 | latitude 후보 | 좌표계 확인 후 decimal 변환 | 저장 금지. 실시간 사용 |
| VWorld 개별주택가격 | `pnu` | PNU | 문자열 | `PublicPriceSnapshot.pnu`, `StoredPublicPriceSnapshot.pnu` 후보 | 그대로 저장. 응답 PNU가 없거나 19자리가 아니면 query PNU를 DB snapshot 기준값으로 사용 | 숫자 변환 금지 |
| VWorld 개별주택가격 | `ldCode`, `ldCodeNm` | 법정동코드/명 | 10자리 문자열, 문자열 | `StoredPublicPriceSnapshot.legalDongCode`, `StoredPublicPriceSnapshot.legalDongName` 후보 | `legalDongCode`는 PNU 앞 10자리도 fallback 가능 | 사용자 주소와 교차 확인 |
| VWorld 개별주택가격 | `bildRegstrEsntlNo` | 건축물대장 고유번호 후보 | 문자열 | 건축물대장 매칭 후보 | 그대로 저장 | 건축HUB PK 관계 확인 필요 |
| VWorld 개별주택가격 | `stdrYear`, `stdrMt` | 기준연도/월 | `yyyy`, `MM` 후보 | `PublicPriceSnapshot.standardYear`, `StoredPublicPriceSnapshot.standardYear` 후보 | 연도/월 변환 | 기준시점 표시 |
| VWorld 개별주택가격 | `housePc` | 개별주택가격 | 원 단위 후보 | `PublicPriceSnapshot.publicPriceAmountManwon`, `StoredPublicPriceSnapshot.publicPriceAmountManwon` | 원 단위라면 만원 단위로 변환 | 단위 공식 확인 필요 |
| VWorld 개별주택가격 | `ladRegstrAr`, `calcPlotAr`, `buldAllTotAr`, `buldCalcTotAr` | 토지/건물 면적 | decimal 문자열 | 면적 검증 후보 | decimal 변환 | 단위 확인 필요 |
| VWorld 개별주택가격 | `lastUpdtDt` | 최종수정일 | `yyyy-MM-dd` | `PublicPriceSnapshot.lastUpdatedDate`, `StoredPublicPriceSnapshot.lastUpdatedDate` 후보 | `LocalDate` 변환 | 공시 기준일과 구분 |
| 공시지가 | 공시지가 필드 | ㎡당 지가 후보 | 원/㎡ 후보 | future land price snapshot | 단위 명시 후 변환 | 토지 면적과 조합 필요 |
| AptIdInfoSvc | `COMPLEX_PK` | 단지고유번호 | 문자열 | future `ApartmentComplexSnapshot.complexPk` | 그대로 저장 | 숫자 변환 금지 |
| AptIdInfoSvc | `COMPLEX_GB_CD` | 단지종류 코드 | `1`, `2`, `3` | 공동주택 유형 후보 | `1=아파트`, `2=연립`, `3=다세대` | 원문 코드표 기준 |
| AptIdInfoSvc | `PNU` | PNU | 문자열 | PNU 후보 | 그대로 저장 | 생성 규칙 확인 필요 |
| AptIdInfoSvc | `DONG_CNT`, `UNIT_CNT` | 동수/세대수 | 숫자 후보 | 단지 규모 후보 | 정수 변환 | 원문 공백 처리 |
| AptIdInfoSvc | `USEAPR_DT` | 사용승인일 | 날짜 후보 | 사용승인일 후보 | 날짜 변환 | 건축HUB 값과 교차 확인 |
| 공통 에러 | `resultCode`, `resultMsg` | 결과코드/메시지 | 문자열 | external API result status | API별 code map | 사용자에게 원문 그대로 노출 금지 |

## 타입 규칙

- 코드값은 `String`으로 둔다: `region_cd`, `LAWD_CD`, `sigunguCd`, `bjdongCd`, `bun`, `ji`, `COMPLEX_PK`, `PNU`.
- 금액은 원문 DTO에서는 문자열로 받고, domain snapshot에서 단위를 붙여 변환한다.
- 면적은 `BigDecimal` 또는 `double` 후보지만 비교 정밀도를 위해 `BigDecimal`을 우선 검토한다.
- 날짜는 원문 포맷을 parser에서 검증한 뒤 domain에서는 `LocalDate`, `YearMonth`, `Year`로 변환한다.
- 단건/배열 응답 구조는 parser에서 list로 정규화한다.

## 확인 필요

- 실거래가 전월세 API의 보증금/월세 원문 필드명은 API별로 정확히 고정해 parser test에 반영해야 한다.
- 건축HUB 전유부, 층별개요, 지역지구구역 필드는 현재 adapter에 없으므로 구현 시 이 문서를 확장해야 한다.
- 공시가격 원문 API별 금액 단위와 VWorld parser의 만원 단위 변환 기준을 교차 검증해야 한다.
- PNU와 건축물대장 PK 전환 규칙은 별도 decision note가 필요할 수 있다.
- VWorld Geocoder 결과는 공식 문서상 저장 금지이므로 내부 영속 도메인 필드로 승격하지 않는다.
- 한국부동산원 R-ONE `DTA_VAL`은 통계값이지 현재 매물 가격이 아니다. `UI_NM`과 통계표명을 함께 해석한다.

## Kakao Maps favorite snapshot fields

| 외부 API | 원문 필드명 | 원문 의미 | 저장 포맷 | ZIP:ON 내부 필드 후보 | 변환 규칙 | 주의사항 |
| --- | --- | --- | --- | --- | --- | --- |
| Kakao Maps JavaScript SDK `coord2Address` | `road_address.address_name` | 도로명주소 | 문자열 | `PropertySnapshotRequest.address` | road address 우선 사용 | 사용자가 선택한 지도 좌표의 favorite snapshot에만 저장 |
| Kakao Maps JavaScript SDK `coord2Address` | `address.address_name` | 지번주소 | 문자열 | `PropertySnapshotRequest.address` fallback | road address가 없을 때 사용 | VWorld Geocoder 캐시 정책과 혼동 금지 |
| Kakao Maps JavaScript SDK `coord2RegionCode` | `region_2depth_name` | 시군구명 | 문자열 | `PropertySnapshotRequest.regionName` | 법정동(`region_type=B`) 결과 우선 | 화면 표시와 간단 검색용 이름 |
| Kakao Maps JavaScript SDK marker/place | `x` | 경도 | 숫자 문자열 또는 숫자 | `PropertySnapshotRequest.longitude`, `property.longitude` | decimal number 변환 | Kakao 지도에서 사용자가 선택한 좌표만 저장 |
| Kakao Maps JavaScript SDK marker/place | `y` | 위도 | 숫자 문자열 또는 숫자 | `PropertySnapshotRequest.latitude`, `property.latitude` | decimal number 변환 | Kakao 지도에서 사용자가 선택한 좌표만 저장 |
| Kakao Maps JavaScript SDK marker/place | `id` | 장소 ID | 문자열 | `property.external_id` 후보 | `kakao-place:{id}` 형태 권장 | 같은 장소 중복 저장을 막기 위한 upsert key |

## Related documents

- [주소와 코드 변환 흐름](/docs/api/external-api/ADDRESS_CODE_FLOW.md)
- [API 조합 매트릭스](/docs/api/external-api/API_COMBINATION_MATRIX.md)
- [외부 API 명세 인덱스](/docs/api/external-api/INDEX.md)
