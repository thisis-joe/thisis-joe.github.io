---
title: API_COMBINATION_MATRIX
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
purpose: external-api-combination-matrix
status: active
code_sync_required: true
related_code: 
read_when: 
update_when: 
  - backend/src/main/java/com/zipon/service/LeaseRiskAddressNormalizer.java
  - backend/src/main/java/com/zipon/service/BuildingTypeResolver.java
  - backend/src/main/java/com/zipon/service/LeaseRiskTransactionEvidenceService.java
  - backend/src/main/java/com/zipon/service/LeaseRiskExternalDataLookupService.java
  - backend/src/main/java/com/zipon/service/RegionalIndicatorAnalysisService.java
  - backend/src/main/java/com/zipon/service/MapService.java
  - 여러 외부 API 결과를 어떤 키로 맞출지 설계할 때
  - 위험진단, 지역분석, 지도 진단의 근거 조합을 바꿀 때
  - 조인 키, matching level, fallback, 사용자 결과 변환 원칙이 바뀔 때
---

# API 조합 매트릭스

> Status: Current reference

ZIP:ON에서 중요한 것은 API 개수가 아니라 API 결과를 어떤 키로 맞추고 어떤 판단 근거로 바꾸는가이다. 이 문서는 외부 API 조합의 기준을 정리한다.

## 조합 기준

| 분석 목적 | 필요한 API 조합 | 조인/매칭 키 | 계산/판단 로직 후보 | 사용자에게 보여줄 결과 | 확인 필요 |
| --- | --- | --- | --- | --- | --- |
| 주소 정제와 법정동 확정 | Juso 팝업 또는 backend Juso 주소검색 proxy + 법정동코드 DB/API | `admCd`, `siNm`, `sggNm`, `emdNm`, `liNm`, `locatadd_nm`, `region_cd` | Juso 구조화 필드 우선, DB catalog lookup, 없으면 제한 진단 | 정제 주소, 법정동코드, 다시 확인할 주소 항목 | 법정동 catalog freshness와 alias 품질 확인 |
| 주소 정제 결과 + 건축물대장 | 법정동코드 + 건축HUB 표제부 | `sigunguCd`, `bjdongCd`, `platGbCd`, `bun`, `ji` | 지번 조회 후 `BuildingTypeResolver`로 유형 판별 | 공부상 물건 유형, 주용도, 사용승인일, 조회 상태 | 다중 후보 선택 UI |
| 건축물대장 + GIS건물통합정보 | 건축HUB + VWorld Geocoder + VWorld GIS건물통합정보 후보 | PNU, 법정동코드, 지번, 건물관리번호 후보, 실시간 변환 좌표 | 건축물 위치/용도 교차 검증 | 물건 후보 신뢰도, 주소/건물 불일치 경고 | GIS건물통합정보 endpoint와 필드 확인 필요 |
| 건축물대장 + 실거래가 | 건축HUB + 유형별 전월세/매매 API | 물건 유형, `LAWD_CD`, 지번, 단지명, 면적, 층 | 유형별 API 선택 후 유사 면적/층 거래 필터 | 주변 유사 거래와 비교한 보증금/월세/매매가 | 오피스텔/단독다가구 최신 명세 보존 |
| 실거래가 + 공시가격 | 실거래가 + VWorld 공시가격 API | PNU, 단지명, 동/호, 전용면적, 기준연도 | 보증금/매매가/공시가격 비율 계산. 개별주택가격은 `housePc`를 기준값 후보로 사용 | 보증금이 기준가격 대비 높은지 보조 문장 | 동·호 정밀 매칭, `housePc` 단위 |
| 건축물대장 + 전월세 + 매매 | 건축HUB + 전월세 API + 매매 API | 물건 유형, `LAWD_CD`, `DEAL_YMD`, 면적, 층, 지번 | 전세가율 추정, 거래 부족 여부, 노후도 병합 | "추가 확인 필요" 중심 위험 요약 | 매매 거래 부족 fallback |
| 지역·유형 과거 지표 분석 | 한국부동산원 R-ONE 통계 + 실거래가 월별 집계 후보 | `STATBL_ID`, `DTACYCLE_CD`, `GRP_ID`, `CLS_ID`, `ITM_ID`, `WRTTIME_DESC`, 지역명/유형명 | 가격지수 추세, 전세·월세 흐름, 오피스텔 수익률, 상가 공실률, 변동성, 데이터 부족 여부 | 현재 매물 목록이 아닌 과거 지표 리포트와 직접 확인 체크리스트 | R-ONE 세부항목의 지역/유형 코드 의미 확인 |
| 지도 가능 지역 경계 | 내부 `legal_dong_codes` + VWorld 2D Data API `LT_C_ADEMD_INFO` | 법정동코드 10자리, VWorld 읍면동코드 8자리 `emdCd`/`emd_cd` | DB 커버리지 row와 GeoJSON polygon을 결합 | 투명한 파란 가능 지역 경계. 현재 매물·정확 주소 아님 | VWorld key/권한 없거나 경계 없음이면 표시하지 않고 원형 fallback 금지 |
| 공동주택 단지 식별 + 실거래가 | AptIdInfoSvc + 아파트/연립다세대 API | `COMPLEX_PK`, `PNU`, 단지명, 주소, `aptSeq` 후보 | 단지명 이력으로 검색명 보정, 단지종류 확인 | 아파트/연립/다세대 단지 후보와 거래 비교 | `COMPLEX_PK`와 거래 API `aptSeq` 직접 연결 여부 |
| 토지임야정보 + 지적도 + 용도지역지구도 | 토지/지적/용도지역 API 후보 | PNU, 법정동코드, 지번, 좌표 | 지목, 면적, 필지 경계, 용도지역 조합 | 개발/매수 전 확인해야 할 규제와 문의처 | 상세 명세 추가 필요 |
| 상가정보 + 건축물 용도 + 인허가 데이터 | 건축HUB + 소상공인 상가정보 + 지자체 인허가 후보 | 주소, 좌표, 업종, 용도, 행정구역 | 용도 적합성, 주변 업종 밀집도, 인허가 확인 항목 | 창업 전 확인 체크리스트 | 장사 성공 확정 금지 |
| 생활안전지도 + 좌표/주소 | 좌표 변환 + 생활안전지도 후보 | 좌표, 반경, 행정구역 | 치안시설/사고다발/대피소 거리 계산 후보 | 생활 안전 확인 항목 | 좌표 API와 생활안전 API 명세 필요 |
| 환경재난지도 + 토지/건물 위치 | 좌표/PNU + 침수/산사태/환경 API 후보 | 좌표, PNU, 법정동 | 침수·산사태·환경 리스크 후보 표시 | 현장/지자체 확인 항목 | 지도 API 응답 단위 확인 |
| 중개업소 데이터 + 사용자 입력 중개사 정보 | 중개업소 현황 + 사업자등록 상태조회 후보 | 중개사무소명, 주소, 등록번호, 사업자번호 | 등록 여부/상태 확인, 행정처분 후보 | 중개사무소 확인 안내 | 신뢰도/사기 확정 금지 |

## 매칭 실패 처리

| 실패 유형 | 처리 기준 |
| --- | --- |
| 주소는 정제됐지만 건축물대장이 없음 | "건축물대장 자동 조회 결과 없음"으로 표시하고 원본 건축물대장 확인 안내 |
| 건축물대장 후보가 여러 개 | 임의 선택 금지. 후보 선택 UI 또는 제한 진단 |
| 실거래가가 없음 | "최근 유사 거래 부족"으로 표시. 안전함으로 표시 금지 |
| 공시가격 후보가 여러 개 | 대표값 자동 확정 금지. 동·호/면적 매칭 신뢰도 표시 |
| 단지명 불일치 | AptIdInfoSvc `getHistInfo`로 이력 보정 후보. 그래도 불명확하면 사용자 확인 |
| 좌표 기반 API와 주소 기반 API 결과 불일치 | 확정 판정 금지. 주소/좌표 재확인 안내 |

## 조합 키 사전

```text
시군구코드: LAWD_CD, sigunguCd, sido_cd + sgg_cd
법정동코드: region_cd 10자리, bjdongCd 5자리
본번/부번: bun/ji, bonbun/bubun, jibun
도로명주소: roadNm, roadNmBonbun, roadNmBubun
관리건축물대장PK: 건축HUB 응답 후보. 상세 원문 확인 필요
건물관리번호: Juso/GIS 후보. 명세 추가 필요
대지위치: 건축HUB 주소 계열 필드
좌표: VWorld Geocoder 실시간 응답 `result.point.x`, `result.point.y`
가능 지역 경계: VWorld `LT_C_ADEMD_INFO` `emd_cd`, `geometry.coordinates`
계약년월: DEAL_YMD, dealYear + dealMonth
사용년월: useYm
전유부/호실 정보: 건축HUB 전유부, AptIdInfoSvc 동정보, 공시가격 동/호 후보
한국부동산원 통계표: STATBL_ID, DTACYCLE_CD, GRP_ID, CLS_ID, ITM_ID, WRTTIME_IDTFR_ID
```

## 사용자 결과 변환 원칙

- 조합 성공: "확인된 정보"와 "계산에 사용한 기준"을 분리한다.
- 조합 실패: "데이터 부족" 또는 "추가 확인 필요"로 표현한다.
- 원문 필드명은 내부 로그/개발 문서에 남기되, 사용자 결과에는 위험 문장과 행동 항목으로 변환한다.
- backend-only AI 구조화 위험 산정이 붙더라도 공공데이터 조합 결과를 덮어쓰지 않고, 부족한 데이터는 `missingData`와 직접 확인 행동으로 남긴다.
- 한국부동산원 R-ONE 통계는 현재 매물 목록으로 변환하지 않고, 과거 지표의 추세·변동성·한계를 설명한다.

## Related documents

- [기능 영역 매핑](/docs/api/external-api/API_DOMAIN_MAP.md)
- [필드 매핑 사전](/docs/api/external-api/FIELD_MAPPING_DICTIONARY.md)
- [위험도 산정 정책](/docs/architecture/RISK_SCORING_POLICY.md)
