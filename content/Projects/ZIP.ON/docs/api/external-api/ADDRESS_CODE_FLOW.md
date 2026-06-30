---
title: ADDRESS_CODE_FLOW
created: 2026-07-01T00:06:00+09:00
updated: 2026-07-01T00:06:00+09:00
---

# 주소와 코드 변환 흐름

> Status: Current reference

이 문서는 ZIP:ON 외부 API 호출의 출발점이다. 주소, 법정동코드, 시군구코드, 본번, 부번, 산 여부, 좌표를 정확히 다루지 못하면 건축물대장, 실거래가, 공시가격, 토지 API가 모두 엉뚱한 물건을 조회할 수 있다.

## 핵심 흐름

```text
사용자 입력 주소
-> 주소 정제
-> 도로명주소/지번주소 후보 확인
-> 법정동코드 추출
-> 시군구코드 추출
-> 본번/부번 분리
-> 필요 시 좌표 변환
-> 물건 유형 판별 API 호출
-> 이후 목적별 API 호출
```

현재 홈 위험진단 화면은 backend Juso 주소검색 proxy가 반환한 구조화 주소 후보를 `RentRiskDiagnosisRequest.jusoAddress`로 받고, `LeaseRiskAddressNormalizer`가 `legal_dong_codes`와 `legal_dong_aliases` table을 조회해 법정동코드를 확정한다. 사용자가 직접 입력한 문자열만으로 바로 진단 요청할 수 있는 형식은 `서울시 관악구 신림동 1422-5`처럼 시도·시군구·법정동·지번이 모두 있는 지번주소다. `신림동 1422-5`처럼 동+지번만 있는 입력이나 도로명주소는 화면에서 Juso 후보를 먼저 선택하게 해서 `admCd`, `siNm`, `sggNm`, `emdNm`, `mtYn`, `lnbrMnnm`, `lnbrSlno`를 함께 보낸다. 로컬 starter seed는 관악구/성동구 일부 범위이므로, 전국 주소를 안정적으로 다루려면 `LegalDongCodeSyncRunner` 또는 `backend-legal-dong-sync`로 행정표준코드 법정동코드 catalog를 먼저 채운다. catalog 밖 주소는 제한 진단으로 처리될 수 있다.

## 단계별 처리

| 단계 | 입력 | 처리 | 출력 | 관련 API | 저장/캐시 여부 |
| -: | --- | --- | --- | --- | --- |
| 1 | 사용자 자연어 주소, Juso 선택 결과 | 공백/표기 정리, 도로명/지번 후보 분리 | 정제 후보 주소 | Juso 팝업, backend Juso 주소검색 proxy | 원문 주소는 진단 이력 snapshot. 주소검색 결과는 현재 DB 저장 없음, future short TTL 캐시 후보 |
| 2 | `siNm`, `sggNm`, `emdNm`, `liNm`, `admCd` | `legal_dong_codes`, `legal_dong_aliases` lookup | 법정동명, 법정동코드 10자리 | 행정표준코드 법정동코드 `getStanReginCdList`, `LegalDongCodeSyncRunner` | `legal_dong_code_source_rows`에 원천 row, `legal_dong_codes`에 실거래가/주소 lookup용 leaf catalog 저장 |
| 3 | 법정동코드 10자리 | API별 코드 길이로 분리 | `LAWD_CD`, `sigunguCd`, `bjdongCd` | 실거래가, 건축HUB | 계산 결과는 request snapshot에 저장 가능 |
| 4 | 지번 문자열, Juso `lnbrMnnm`, `lnbrSlno`, `mtYn` | `AddressResolution`이 본번/부번 정수 파싱 후 API별 zero-padding을 한 곳에서 계산 | `bun`, `ji`, `bonbun`, `bubun`, `platGbCd`, PNU, 산 여부 | 건축HUB, 실거래가 응답 매칭, VWorld 공시가격 | `property_identity_candidates`에 주소 식별 후보 저장 |
| 5 | 도로명주소와 지번주소 | 필요 시 도로명 본번/부번, 건물번호 보조 매칭 | 도로명 본번/부번 후보 | Juso, 실거래가 응답의 `roadNmBonbun` 계열 | 확인 필요 |
| 6 | 도로명주소 또는 지번주소 | VWorld Geocoder API 2.0으로 좌표 변환 | `x`, `y`, `crs` | VWorld `https://api.vworld.kr/req/address` | 공식 문서상 별도 저장장치/DB 저장 금지. 후행 API 호출 직전 실시간 사용 |
| 7 | 정제 주소, 법정동코드, 지번, 좌표 후보 | 건축물/단지 후보 조회 | 건축물대장 후보, 공동주택 후보, GIS건물 후보 | 건축HUB, AptIdInfoSvc, VWorld GIS건물통합정보 후보 | 건축물 주요 snapshot DB/장기 캐시 후보. Geocoder 좌표 자체는 저장 금지 |
| 8 | 물건 유형, 사용자 목적 | 목적별 후행 API 선택 | 실거래가, 공시가격, 토지/환경/상권 API 호출 조건 | 실거래가, VWorld, future 토지/환경 API | API별 정책 따름 |

## 코드 길이와 파라미터 차이

| 사용처 | 입력 코드 | 길이/형식 | 생성 규칙 | 주의사항 |
| --- | --- | --- | --- | --- |
| 행정표준코드 법정동코드 | `region_cd` | 10자리 문자열 | API 응답 그대로 저장 | 숫자로 처리하면 앞자리 0 보존이 깨질 수 있다. |
| 실거래가 API | `LAWD_CD` | 5자리 문자열 | 법정동코드 10자리 중 앞 5자리 | 시군구 단위 조회다. 주소나 물건 유형을 판별하지 않는다. |
| 건축HUB | `sigunguCd` | 5자리 문자열 | 법정동코드 앞 5자리 | `LAWD_CD`와 같은 값 후보지만 API별 명칭을 유지한다. |
| 건축HUB | `bjdongCd` | 5자리 문자열 | 법정동코드 뒤 5자리 | 읍면동+리 코드 계열. 원문 필드명 그대로 둔다. |
| 건축HUB | `platGbCd` | `0` 또는 `1` 문자열 후보 | 일반 대지 `0`, 산 `1` | `mtYn=1`이면 산으로 변환. 원문 값 체계 확인 유지. |
| 건축HUB | `bun` | 4자리 문자열 | 본번 zero-padding | 예: `12` -> `0012` |
| 건축HUB | `ji` | 4자리 문자열 | 부번 zero-padding. 부번 없음은 `0000` 후보 | 예: `0` -> `0000` |
| 실거래가 응답 매칭 | `bonbun`, `bubun` | 4자리 문자열 | 응답 원문 그대로 보존 | 거래 API 요청값은 아니지만 물건 매칭에 중요하다. |
| 실거래가 응답 매칭 | `roadNmBonbun`, `roadNmBubun` | 5자리 문자열 | 응답 원문 그대로 보존 | 도로명주소 매칭 후보. |
| VWorld 공시가격/토지 API 후보 | `PNU` | 19자리 문자열 | `legalDongCode + 산/대지구분(2/1) + bun + ji` | 현재 `AddressResolution`과 `PublicPriceApiQuery`가 같은 계산을 쓴다. 공동주택 단지 대표 PNU와 복수 필지 관계는 추가 확인 필요. |
| AptIdInfoSvc | `PNU` | 보통 19자리 후보 | 응답 원문 그대로 보존 | 단지 대표 PNU일 수 있으므로 주소에서 계산한 PNU와 항상 같은 물건으로 단정하지 않는다. |

## 본번/부번 규칙

```text
건축HUB:
  bun = 본번 4자리 zero-padding
  ji = 부번 4자리 zero-padding
  platGbCd = 일반 대지 0, 산 1 후보

실거래가:
  요청은 LAWD_CD + DEAL_YMD 중심
  응답의 bonbun/bubun/jibun/roadNmBonbun/roadNmBubun을 물건 후보 매칭에 사용

AptIdInfoSvc:
  요청은 cond[ADRES::LIKE] 또는 cond[COMPLEX_PK::EQ]
  응답의 PNU, COMPLEX_PK, ADRES를 다른 API 조합 키 후보로 사용
```

코드값, 본번, 부번, PNU, 단지고유번호는 숫자처럼 보여도 문자열로 처리한다. 금액, 면적, 날짜로 계산할 때만 명시적으로 파싱한다.

## 현재 코드 연결

| 책임 | 현재 파일 |
| --- | --- |
| Juso 직접검색 화면 연결 | `frontend/src/api/addressSearchApi.js`의 `searchJusoAddresses()`와 `frontend/src/components/common/SearchBar.vue`가 백엔드 `/api/address-search/juso`만 호출한다 |
| Juso 팝업 보조 경로 | `frontend/src/utils/jusoAddressSearch.js`가 백엔드 `/api/address-search/juso-popup`만 열 수 있지만, 현재 홈 위험진단 기본 UX에서는 사용하지 않는다 |
| Juso 팝업 controller | `backend/src/main/java/com/zipon/controller/JusoAddressPopupController.java` |
| Juso 직접검색 controller | `backend/src/main/java/com/zipon/controller/JusoAddressSearchController.java` |
| Juso 직접검색 service | `backend/src/main/java/com/zipon/service/JusoAddressSearchService.java` |
| Juso 직접검색 client/parser | `backend/src/main/java/com/zipon/external/juso/JusoAddressSearchApiClient.java`, `JusoAddressSearchApiResponseParser.java` |
| Juso 승인키 설정 | `backend/src/main/java/com/zipon/config/JusoAddressProperties.java` |
| Juso callback HTML 생성 | Juso가 `/api/address-search/juso-popup/callback`으로 돌려준 선택 결과를 `backend/src/main/java/com/zipon/service/JusoAddressPopupPageRenderer.java`가 `postMessage` HTML로 변환한다 |
| 위험진단 요청 구조화 주소 DTO | `backend/src/main/java/com/zipon/dto/request/RentRiskDiagnosisRequest.java` |
| 주소 정제 | `backend/src/main/java/com/zipon/service/LeaseRiskAddressNormalizer.java` |
| 주소 코드 묶음 계산 | `backend/src/main/java/com/zipon/domain/AddressResolution.java` |
| 물건 식별 후보 저장 | `backend/src/main/java/com/zipon/service/PropertyIdentityCandidateService.java`, `backend/src/main/java/com/zipon/mapper/PropertyIdentityCandidateMapper.java`, `backend/src/main/resources/db/migration/V21__create_property_identity_candidates.sql` |
| 법정동코드 DB 조회 | `backend/src/main/java/com/zipon/service/MyBatisLegalDongCodeCatalog.java` |
| 건축HUB query 생성 | `backend/src/main/java/com/zipon/external/buildingregister/BuildingRegisterApiQuery.java` |
| 실거래가 query 생성 | `RentTransactionApiQuery`, `SaleTransactionApiQuery` |

## 확인 필요

- Juso 주소검색 API는 `GET /api/address-search/juso` backend proxy가 `JUSO_ADDRESS_SEARCH_KEY` -> `zipon.external.juso.address-search-key` -> `JusoAddressProperties` 흐름으로 바인딩된 검색키를 사용한다. 홈 위험진단 화면은 이 직접검색 proxy를 기본으로 사용한다. 팝업 승인키는 보조/호환 경로인 `JUSO_ADDRESS_CONFIRM_KEY` -> `zipon.external.juso.popup-confirm-key` -> `JusoAddressProperties` 흐름으로 백엔드에서만 읽는다.
- 주소를 좌표로 변환할 때는 VWorld Geocoder API 2.0을 사용한다. 단, 공식 문서의 저장 금지 조건 때문에 좌표 변환 결과를 DB/Redis에 저장하지 않는다.
- 주소 기반 PNU 생성 규칙은 `AddressResolution`으로 고정했다. 다만 공동주택 단지 식별정보의 대표 PNU, 복수 필지, 동·호 후보 매칭은 별도 goal에서 검증해야 한다.
- `locatjumin_cd`와 `locatjijuk_cd` 중 어떤 API가 어느 코드를 요구하는지 하위 API별로 확인해야 한다.

## Related documents

- [외부 API 구현 기준 문서](/docs/api/external-api/README.md)
- [외부 API 명세 인덱스](/docs/api/external-api/INDEX.md)
- [필드 매핑 사전](/docs/api/external-api/FIELD_MAPPING_DICTIONARY.md)
- [과거 지표 분석과 정확 주소 위험진단 MVP API 호출 전략](/docs/api/API_CALL_FLOW.md)
