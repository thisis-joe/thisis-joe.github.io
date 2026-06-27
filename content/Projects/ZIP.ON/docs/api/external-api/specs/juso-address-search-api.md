---
title: juso-address-search-api
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
purpose: external-api-source-spec
status: active
code_sync_required: false
related_area: external-api, juso, address-search
read_when: 
do_not_use_as: 
update_when: 
  - Juso 주소검색 팝업/검색 API 원문 요청/응답 필드를 확인할 때
  - 주소 정제 adapter 또는 popup/direct search 흐름을 구현하기 전 source spec을 확인할 때
  - 현재 ZIP:ON Juso 구현 완료 명세
  - 브라우저 직접 호출 허가 근거
  - Juso 공식 API 명세, 요청/응답 필드, callback 정책이 바뀌었음을 확인했을 때
---

# Juso 주소검색 팝업/검색 API 명세

> Status: Source spec preserved

이 문서는 행정안전부 도로명주소 주소기반산업지원서비스 Juso 팝업 API와 직접 주소검색 API를 ZIP:ON 구현 기준으로 보존한 명세입니다. 실제 승인키는 이 문서에 남기지 않고 `JUSO_ADDRESS_CONFIRM_KEY`, `JUSO_ADDRESS_SEARCH_KEY` 같은 환경변수로만 관리합니다.

## 1. 팝업 API

| 호출방식 | 구분 | 요청 URL | 출력결과 |
| --- | --- | --- | --- |
| POST / GET | 웹 | `https://business.juso.go.kr/addrlink/addrLinkUrl.do` | 파라미터 |

### 요청 변수

| 요청변수명 | 타입 | 필수여부 | 설명 |
| --- | --- | ---: | --- |
| `confmKey` | String | Y | 신청 시 발급받은 승인키 |
| `returnUrl` | String | Y | 주소 검색 결과를 리턴받을 URL |
| `resultType` | String | N | 도로명주소 검색결과 화면 출력유형. `1`: 도로명, `2`: 도로명 + 지번, `3`: 도로명 + 상세 건물명, `4`: 도로명 + 지번 + 상세 건물명 |
| `useDetailAddr` | String | N | 상세주소 동/층/호 정보 제공 여부. `Y`: 제공, `N`: 미제공/직접 입력 |

### 출력 변수

| 출력변수명 | 타입 | 필수여부 | 설명 |
| --- | --- | ---: | --- |
| `roadFullAddr` | String | Y | 전체 도로명 |
| `roadAddrPart1` | String | Y | 도로명주소, 참고항목 제외 |
| `roadAddrPart2` | String | N | 도로명주소 참고 항목 |
| `jibunAddr` | String | Y | 지번주소 |
| `engAddr` | String | Y | 도로명 영문 |
| `zipNo` | String | Y | 우편번호 |
| `addrDetail` | String | N | 고객 입력 상세 주소 |
| `admCd` | String | Y | 행정구역코드 |
| `rnMgtSn` | String | Y | 도로명코드 |
| `bdMgtSn` | String | Y | 건물관리번호 |
| `detBdNmList` | String | N | 상세건물명 |
| `bdNm` | String | N | 건물명 |
| `bdKdcd` | String | Y | 공동주택 여부. `1`: 공동주택, `0`: 비공동주택 |
| `siNm` | String | Y | 시도명 |
| `sggNm` | String | Y | 시군구명 |
| `emdNm` | String | Y | 읍면동명 |
| `liNm` | String | N | 법정리명 |
| `rn` | String | Y | 도로명 |
| `udrtYn` | String | Y | 지하여부. `0`: 지상, `1`: 지하 |
| `buldMnnm` | Number | Y | 건물본번 |
| `buldSlno` | Number | Y | 건물부번 |
| `mtYn` | String | Y | 산여부. `0`: 대지, `1`: 산 |
| `lnbrMnnm` | Number | Y | 지번본번, 번지 |
| `lnbrSlno` | Number | Y | 지번부번, 호 |
| `emdNo` | String | Y | 읍면동일련번호 |

## 2. 직접 주소검색 API

| 구분 | 요청 URL | 출력결과 |
| --- | --- | --- |
| JSONP/XML/JSON | `https://business.juso.go.kr/addrlink/addrLinkApiJsonp.do` | 주소 후보 |
| XML/JSON | `https://business.juso.go.kr/addrlink/addrLinkApi.do` | 주소 후보 |

ZIP:ON 구현은 백엔드 `JusoAddressSearchApiClient`에서 `addrLinkApi.do`를 `resultType=json`으로 호출한다. 프론트엔드는 Juso URL을 직접 호출하지 않고 `GET /api/address-search/juso`를 호출한다.

### 요청 변수

| 요청변수명 | 타입 | 필수여부 | 기본값 | 설명 |
| --- | --- | ---: | --- | --- |
| `confmKey` | String | Y | 없음 | 신청 시 발급받은 주소검색용 승인키 |
| `currentPage` | String | Y | `1` | 현재 페이지 번호 |
| `countPerPage` | String | Y | `10` | 페이지당 출력 개수 |
| `keyword` | String | Y | 없음 | 주소 검색어 |
| `resultType` | String | N | `xml` | ZIP:ON은 `json`으로 고정 |
| `hstryYn` | String | N | `N` | 변동이력 주소 포함 여부 |
| `firstSort` | String | N | `none` | 정렬. `none`, `road`, `location` |
| `addInfoYn` | String | N | `N` | 추가정보 제공 여부 |

### 응답 변수

| 영역 | 출력변수명 | 설명 |
| --- | --- | --- |
| `common` | `totalCount` | 총 검색 결과 수 |
| `common` | `currentPage` | 현재 페이지 번호 |
| `common` | `countPerPage` | 페이지당 출력 개수 |
| `common` | `errorCode` | 결과 코드 |
| `common` | `errorMessage` | 결과 메시지 |
| `juso` | `roadAddr` | 전체 도로명주소 |
| `juso` | `roadAddrPart1` | 도로명주소, 참고항목 제외 |
| `juso` | `roadAddrPart2` | 도로명주소 참고 항목 |
| `juso` | `jibunAddr` | 지번주소 |
| `juso` | `engAddr` | 영문주소 |
| `juso` | `zipNo` | 우편번호 |
| `juso` | `admCd` | 행정구역코드 |
| `juso` | `rnMgtSn` | 도로명코드 |
| `juso` | `bdMgtSn` | 건물관리번호 |
| `juso` | `detBdNmList` | 상세건물명 |
| `juso` | `bdNm` | 건물명 |
| `juso` | `bdKdcd` | 공동주택 여부 |
| `juso` | `siNm`, `sggNm`, `emdNm`, `liNm` | 시도/시군구/읍면동/법정리명 |
| `juso` | `rn` | 도로명 |
| `juso` | `udrtYn` | 지하여부 |
| `juso` | `buldMnnm`, `buldSlno` | 건물본번/부번 |
| `juso` | `mtYn` | 산여부 |
| `juso` | `lnbrMnnm`, `lnbrSlno` | 지번본번/부번 |
| `juso` | `hstryYn` | 변동이력 여부 |
| `juso` | `relJibun` | 관련 지번 |
| `juso` | `hemdNm` | 행정동명 |

### 오류 코드

| 코드 | 메시지/상황 | ZIP:ON 처리 |
| --- | --- | --- |
| `0` | 정상 | `SUCCESS` 또는 결과 0건이면 `EMPTY` |
| `-999` | 시스템에러 | `ERROR` |
| `E0001` | 승인되지 않은 KEY | `UNAVAILABLE` |
| `E0005` | 검색어 없음 | `INVALID_REQUEST` |
| `E0006` | 주소가 상세하지 않음 | `INVALID_REQUEST` |
| `E0008` | 검색어 두 글자 미만 | `INVALID_REQUEST` |
| `E0009` | 문자와 숫자가 같이 입력되어야 함 | `INVALID_REQUEST` |
| `E0010` | 검색어가 너무 김 | `INVALID_REQUEST` |
| `E0011` | 너무 긴 숫자 포함 | `INVALID_REQUEST` |
| `E0012` | 특수문자 + 숫자만으로 검색 | `INVALID_REQUEST` |
| `E0013` | SQL 예약어 또는 금지 특수문자 포함 | `INVALID_REQUEST` |
| `E0014` | 개발승인키 기간 만료 | `UNAVAILABLE` |
| `E0015` | 검색 범위 초과 | `INVALID_REQUEST` |

## ZIP:ON 구현 메모

- 팝업용 키와 검색용 키는 서로 다르므로 `JUSO_ADDRESS_CONFIRM_KEY`, `JUSO_ADDRESS_SEARCH_KEY`를 분리한다.
- `JusoAddressSearchApiClient`의 운영 로그 `requestSummary`에는 `confmKey`와 원문 검색어를 저장하지 않고 `keywordHash`만 남긴다.
- 주소검색 결과는 현재 DB에 저장하지 않는다. 위험진단 이력에는 사용자가 선택해 제출한 주소 snapshot만 저장한다.
- `countPerPage`는 Juso 원문 명세에 최대값이 명시되어 있지 않지만, ZIP:ON 백엔드는 과도한 요청을 막기 위해 1~100으로 제한한다.

## Related documents

- [주소와 코드 변환 흐름](/docs/api/external-api/ADDRESS_CODE_FLOW.md)
- [외부 API 설정과 data.go.kr 키 관리](/docs/api/EXTERNAL_API_CONFIGURATION.md)
- [외부 API 에러 처리 정책](/docs/api/external-api/ERROR_HANDLING_POLICY.md)
