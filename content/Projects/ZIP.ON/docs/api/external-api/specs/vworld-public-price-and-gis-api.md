---
title: vworld-public-price-and-gis-api
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-29T05:00:06+09:00
---

# 외부 API 명세 - VWorld 공시가격, 읍면동 경계, GIS건물통합정보 후보

> Status: Partial source reference
>
> 이 문서는 사용자 제공 정보, VWorld 공식 제공 Java 예제, 현재 ZIP:ON 구현을 기준으로 정리한 VWorld API 참고 문서다. 실제 운영 구현 전에는 VWorld 공식 문서에서 요청 파라미터, 응답 필드, 오류 코드, 사용량 제한을 다시 확인한다.

## 1. ZIP:ON 적용 판단

| 기능 영역 | 적용 가능 여부 | 활용 방식 | 중요도 |
| --- | ---: | --- | --- |
| GIS건물통합정보 | 가능 | VWorld에서 조회 가능하다고 확인됨. 구체 endpoint와 응답 필드는 확인 필요 | 중요 |
| 공시가격 확인 | 가능 | 개별주택가격 속성조회와 공동주택가격 속성조회로 보증금 대비 기준가격 후보를 만든다. | 필수 |
| 읍면동 경계 표시 | 가능 | 지도 위치확인 화면의 가능 지역을 원형이 아니라 VWorld `LT_C_ADEMD_INFO` GeoJSON polygon으로 표시한다. | 중요 |
| 물건 유형 판별 | 보조 | GIS건물통합정보가 붙으면 건축HUB 주소 기반 조회 전후의 건물 후보 검증에 쓸 수 있다. | 중요 |
| 전세 위험도 계산 | 보조 | `housePc` 등 공시가격을 보증금과 비교한다. | 중요 |
| 토지/임야 분석 | 보조 | PNU와 지적/토지 API 조합에 필요할 수 있다. | 후속 |

## 2. 인증

| 항목 | 내용 |
| --- | --- |
| 환경변수 | `VWORLD_API_KEY` |
| 저장 위치 | 로컬 `.env` 또는 배포 secret |
| 문서/코드에 실제 key 기록 | 금지 |
| 현재 설정 문서 | [외부 API 설정과 data.go.kr 키 관리](/docs/api/EXTERNAL_API_CONFIGURATION.md) |

## 3. 개별주택가격 속성조회

| 항목 | 내용 |
| --- | --- |
| API | 개별주택가격 속성조회 |
| 응답 형식 | XML, JSON |
| URI | `https://api.vworld.kr/ned/data/getIndvdHousingPriceAttr` |
| 현재 ZIP:ON 관련 구현 | `VWorldPublicPriceApiClient`, `PublicPriceApiResponseParser` |
| ZIP:ON 활용 | 단독/다가구 등 개별주택 계열 공시가격 참고 |

### 3.1 공식 Java 예제 기준 요청 구조

VWorld 공식 제공 Java 예제는 base URL과 query parameter를 아래처럼 조립한다.

```text
http://api.vworld.kr/ned/data/getIndvdHousingPriceAttr
?key={인증키}
&domain={도메인}
&pnu=1111016700100200000
&stdrYear=2012
&format=xml
&numOfRows=10
&pageNo=1
```

ZIP:ON 구현은 같은 endpoint 구조를 쓰되, `VWORLD_BASE_URL=https://api.vworld.kr`와 endpoint path `/ned/data/getIndvdHousingPriceAttr`를 분리한다. `VWORLD_DOMAIN`은 endpoint URL이 아니라 공식 예제의 `domain` query parameter이며, VWorld key 발급 시 등록한 도메인 값과 맞아야 한다.

현재 `VWorldPublicPriceApiClient`는 `format=json`, `pageNo=1`, `numOfRows=10`으로 요청한다. `PublicPriceApiResponseParser`는 JSON 응답만 파싱하므로, XML 응답 예시는 원문 구조 확인 자료로만 사용한다.

| 파라미터 | 필수 | 공식 예제 값 | ZIP:ON 기준 |
| --- | ---: | --- | --- |
| `key` | 필수 | `인증키` | `VWORLD_API_KEY` |
| `domain` | 조건부/확인 필요 | `도메인` | `VWORLD_DOMAIN`이 비어 있지 않을 때만 query에 추가. VWorld key 발급 시 등록한 도메인 값을 넣고, endpoint URL을 넣지 않음 |
| `pnu` | 필수 | `1111016700100200000` | `PublicPriceApiQuery.pnu()` |
| `stdrYear` | 선택/조회 조건 | `2012` | 기준연도 조회 때 사용. 최신 가용 가격 fallback에서는 생략 가능 |
| `format` | 선택 | `xml` | ZIP:ON은 `json` |
| `numOfRows` | 선택 | `10` | `10` |
| `pageNo` | 선택 | `1` | `1` |

## 4. Geocoder API 2.0 주소 좌표 변환

공식 문서: [VWorld Geocoder API 2.0 레퍼런스](https://www.vworld.kr/dev/v4dv_geocoderguide2_s001.do)

공식 문서 기준으로 주소를 좌표로 변환하는 요청 URL은 아래 형식이다.

```text
https://api.vworld.kr/req/address?service=address&request=getCoord&key={VWORLD_API_KEY}&[요청파라미터]
```

공식 문서는 일일 지오코딩 요청건수를 최대 40,000건으로 설명하고, API 요청은 실시간으로 사용해야 하며 별도 저장장치나 DB에 저장할 수 없다고 안내한다. 따라서 ZIP:ON에서는 Geocoder 결과를 DB/Redis에 저장하는 정책을 기본값으로 두지 않는다. 좌표가 필요한 생활안전, 환경·재난, 지도 layer 호출에서 실시간 변환하거나, 저장이 허용되는 별도 데이터/라이선스가 확인될 때만 재검토한다.

### 4.1 요청 파라미터

| 파라미터 | 필수 | 설명 | ZIP:ON 기준 |
| --- | ---: | --- | --- |
| `service` | 선택 | 요청 서비스명. 기본값 `address` | `address` |
| `version` | 선택 | 요청 서비스 버전. 기본값 `2.0` | `2.0` |
| `request` | 필수 | 요청 오퍼레이션 | `getCoord` |
| `key` | 필수 | 발급받은 API key | `VWORLD_API_KEY` |
| `format` | 선택 | `json`, `xml` | backend parser는 `json` 우선 후보 |
| `errorFormat` | 선택 | 에러 응답 포맷 | `json` 후보 |
| `type` | 필수 | `PARCEL` 지번주소, `ROAD` 도로명주소 | Juso 선택 결과에 따라 분기 |
| `address` | 필수 | 검색 주소 | 도로명주소 또는 지번주소 |
| `refine` | 선택 | 주소 정제 여부 | 기본값 확인 후 결정 |
| `simple` | 선택 | 간략 출력 여부 | 좌표만 필요하면 `true` 후보이나 refined 정보 필요 여부 검토 |
| `crs` | 선택 | 응답 좌표계 | `EPSG:4326` 기본 후보 |
| `callback` | 선택 | JSONP callback | backend 호출에서는 사용하지 않음 |

### 4.2 응답 필드

| 필드 | 의미 | ZIP:ON 내부 필드 후보 | 주의사항 |
| --- | --- | --- | --- |
| `status` | `OK`, `NOT_FOUND`, `ERROR` | lookup status 후보 | 빈 결과와 오류 구분 |
| `input.type` | 입력 주소 유형 | request echo | `ROAD`, `PARCEL` |
| `input.address` | 입력 주소 | request echo | 개인정보 가능성. 로그 최소화 |
| `refined.text` | 정제 주소 텍스트 | 주소 검증 후보 | `refine=false` 또는 `simple=true`이면 생략 가능 |
| `refined.structure.level1` | 시도 | 주소 구조 후보 | 필요 시 Juso/법정동코드와 비교 |
| `refined.structure.level2` | 시군구 | 주소 구조 후보 | 필요 시 Juso/법정동코드와 비교 |
| `result.crs` | 응답 좌표계 | `coordinateCrs` 후보 | `EPSG:4326` 우선 |
| `result.point.x` | x 좌표 | longitude 후보 | 좌표계에 따라 의미 달라짐 |
| `result.point.y` | y 좌표 | latitude 후보 | 좌표계에 따라 의미 달라짐 |

### 4.3 오류 코드 후보

| 코드 | 의미 | 처리 |
| --- | --- | --- |
| `PARAM_REQUIRED` | 필수 파라미터 누락 | 개발/요청 조립 오류 |
| `INVALID_TYPE` | 파라미터 타입 오류 | 요청값 검증 |
| `INVALID_RANGE` | 파라미터 범위 오류 | 요청값 검증 |
| `INVALID_KEY` | 등록되지 않은 인증키 | 관리자 설정 확인 |
| `INCORRECT_KEY` | 인증키 정보 오류 | 도메인/key 설정 확인 |
| `UNAVAILABLE_KEY` | 임시로 인증키 사용 불가 | 운영 확인 |
| `OVER_REQUEST_LIMIT` | 일일 제한 초과 | rate limit/circuit 후보 |
| `SYSTEM_ERROR`, `UNKNOWN_ERROR` | 시스템 오류 | 외부 장애로 제한 진단 |

### 4.4 구현 메모

- `VWORLD_API_KEY`는 backend 환경변수로만 사용한다.
- 주소 좌표 변환 결과는 공식 문서의 저장 금지 조건 때문에 DB/Redis 저장 후보에서 제외한다.
- 좌표가 필요한 후행 API 호출 직전에 실시간 변환한다.
- 오류 로그에는 API key와 원문 주소 전체를 남기지 않거나 마스킹한다.
- 동일 요청 중복 방지는 저장 금지 조건과 충돌하지 않는 in-flight lock 또는 매우 짧은 process memory lock 정도부터 검토한다.

## 5. 개별주택가격 응답 예시

```xml
<response>
  <numOfRows>10</numOfRows>
  <pageNo>1</pageNo>
  <totalCount>1</totalCount>
  <fields>
    <field>
      <pnu>1111016700100200000</pnu>
      <ldCode>1111016700</ldCode>
      <ldCodeNm>서울특별시 종로구 충신동</ldCodeNm>
      <regstrSeCode>1</regstrSeCode>
      <regstrSeCodeNm>일반</regstrSeCodeNm>
      <mnnmSlno>20</mnnmSlno>
      <bildRegstrEsntlNo>1111016700100200000</bildRegstrEsntlNo>
      <stdrYear>2012</stdrYear>
      <stdrMt>01</stdrMt>
      <dongCode>10</dongCode>
      <ladRegstrAr>56.2</ladRegstrAr>
      <calcPlotAr>56.2</calcPlotAr>
      <buldAllTotAr>26.45</buldAllTotAr>
      <buldCalcTotAr>26.45</buldCalcTotAr>
      <housePc>104000000</housePc>
      <stdLandAt>N</stdLandAt>
      <lastUpdtDt>2023-08-10</lastUpdtDt>
    </field>
  </fields>
</response>
```

## 6. 개별주택가격 응답 필드 매핑

| 원문 필드 | 의미 | ZIP:ON 내부 필드 후보 | 변환 규칙 | 주의사항 |
| --- | --- | --- | --- | --- |
| `pnu` | PNU | `PublicPriceSnapshot.pnu` 후보 | 문자열 유지 | 숫자 변환 금지 |
| `ldCode` | 법정동코드 | `legalDongCode` 후보 | 문자열 유지 | 10자리 코드 |
| `ldCodeNm` | 법정동명 | 표시/검증 후보 | trim | 사용자 주소와 비교 |
| `regstrSeCode`, `regstrSeCodeNm` | 대장구분 | 건축물/토지 매칭 후보 | 문자열 유지 | 코드표 확인 필요 |
| `mnnmSlno` | 본번/부번 결합 후보 | 지번 매칭 후보 | 원문 보존 | 분리 규칙 확인 필요 |
| `bildRegstrEsntlNo` | 건축물대장 고유번호 후보 | 건축물대장 매칭 후보 | 문자열 유지 | 건축HUB PK와 관계 확인 필요 |
| `stdrYear`, `stdrMt` | 기준연도/월 | `standardYear`, `standardMonth` | `Year`, 월 문자열 후보 | 기준시점 표시 |
| `dongCode` | 동 코드 후보 | 동/호 매칭 후보 | 문자열 유지 | 값 체계 확인 필요 |
| `ladRegstrAr`, `calcPlotAr` | 대장/산정 토지면적 | 토지면적 후보 | decimal 변환 | 단위 확인 필요 |
| `buldAllTotAr`, `buldCalcTotAr` | 건물 전체/산정 연면적 | 건물면적 후보 | decimal 변환 | 단위 확인 필요 |
| `housePc` | 개별주택가격 | `PublicPriceSnapshot.publicPriceAmountManwon`, `StoredPublicPriceSnapshot.publicPriceAmountManwon` 후보 | 원 단위라면 만원 단위 변환 | 단위 공식 확인 필요 |
| `stdLandAt` | 표준지 여부 후보 | 공시지가 관련 후보 | 문자열 유지 | 의미 확인 필요 |
| `lastUpdtDt` | 최종수정일 | `lastUpdatedDate` 후보 | `LocalDate` 변환 | `yyyy-MM-dd` |

## 7. ZIP:ON 최신 가용 가격 처리

현재 기준연도에 공시가격 결과가 없으면 ZIP:ON은 같은 PNU로 `stdrYear`를 생략해 한 번 더 조회한다. 이 fallback 응답에서 `housePc`, `pblntfPc`, `pblntfPclnd`, `indvdHousingPc` 중 가격 필드가 있고 `stdrYear`/`stdrMt`가 가장 최신인 후보만 `PublicPriceLookupResult`에 남긴다. 화면에는 `LeaseRiskDiagnosisDataStatusService`가 만든 `가격 기준시점 yyyy년 MM월` 상세 줄을 표시한다.

이 처리는 "최신 공시가격을 찾았다"는 뜻이지 "현재 시세를 확인했다"는 뜻이 아니다. 공시가격은 여전히 보증금 위험도 보조 기준이며, 동·호 정밀 매칭과 권리관계 확인을 대체하지 않는다.

## 8. VWorld 2D Data API 읍면동 경계

공식 문서: [VWorld 2D데이터 API 읍면동 `LT_C_ADEMD_INFO`](https://www.vworld.kr/dev/v4dv_2ddataguide2_s002.do?svcIde=ademd)

VWorld 공식 문서는 읍면동 데이터를 `LT_C_ADEMD_INFO`로 제공하고, `GetFeature` 오퍼레이션이 읍면동의 도형과 속성 정보를 조회한다고 설명한다. JSON 응답은 GeoJSON 형태로 표현되며, 기본 좌표계는 `EPSG:4326`이다.

ZIP:ON에서는 이 API를 지도 위치확인 화면의 가능 지역 경계 표시용으로 사용한다. 현재 가능 지역 기준은 내부 `legal_dong_codes.legal_dong_code`와 공공데이터 coverage가 연결된 법정동 row이며, VWorld 요청에는 법정동코드 10자리의 앞 8자리를 읍면동코드로 사용한다.

### 8.1 요청 구조

```text
https://api.vworld.kr/req/data
?service=data
&version=2.0
&request=GetFeature
&key={VWORLD_API_KEY}
&format=json
&errorFormat=json
&data=LT_C_ADEMD_INFO
&attrFilter=emdCd:IN:{8자리읍면동코드목록}
&geometry=true
&attribute=true
&crs=EPSG:4326
&page=1
&size=1000
```

| 파라미터 | 필수 | 설명 | ZIP:ON 기준 |
| --- | ---: | --- | --- |
| `service` | 선택 | 요청 서비스명 | `data` |
| `version` | 선택 | 요청 서비스 버전 | `2.0` |
| `request` | 필수 | 오퍼레이션 | `GetFeature` |
| `key` | 필수 | 발급받은 API key | `VWORLD_API_KEY` |
| `format` | 선택 | 응답 포맷 | `json` |
| `errorFormat` | 선택 | 에러 응답 포맷 | `json` |
| `data` | 필수 | 조회할 데이터명 | `LT_C_ADEMD_INFO` |
| `attrFilter` | 선택/조건 | 속성 조건검색 | `emdCd:IN:{code1,code2}`. 응답 속성은 `emd_cd`로 온다. |
| `geometry` | 선택 | 지오메트리 반환 여부 | `true` |
| `attribute` | 선택 | 속성 반환 여부 | `true` |
| `crs` | 선택 | 응답 좌표계 | `EPSG:4326` |
| `domain` | 선택 | VWorld key 발급 도메인 | `VWORLD_DOMAIN`이 있을 때만 추가 |

### 8.2 응답 필드 매핑

| 원문 필드 | 의미 | ZIP:ON 내부 필드 후보 | 변환 규칙 | 주의사항 |
| --- | --- | --- | --- | --- |
| `status` | 처리 상태 | 외부 API call status | `OK`, `NOT_FOUND`, `ERROR` 구분 | `NOT_FOUND`는 오류가 아니라 경계 없음 |
| `properties.emd_cd` | 읍면동코드 | boundary lookup key | 8자리 문자열 유지 | 내부 법정동코드 10자리 앞 8자리와 매칭 |
| `properties.full_nm` | 전체 행정구역명 | 표시/검증 후보 | trim | 현재 사용자 응답에는 직접 노출하지 않음 |
| `properties.emd_kor_nm` | 읍면동명 | 표시/검증 후보 | trim | 내부 `legalDongName`과 교차 확인 후보 |
| `geometry.type` | 지오메트리 유형 | parser 분기 | `Polygon`, `MultiPolygon` 지원 | 다른 geometry는 무시 |
| `geometry.coordinates` | GeoJSON 좌표 | `MapAnalyzableLocationResponse.boundaryPolygons` | `[longitude, latitude]`를 `BoundaryPointResponse(latitude, longitude)`로 변환 | 좌표 순서 반전 주의 |

### 8.3 구현 메모

- `VWorldLegalDongBoundaryApiClient`는 `VWORLD_API_KEY`가 없으면 실제 HTTP 호출을 하지 않고 빈 map을 반환한다.
- `LegalDongBoundaryApiResponseParser`는 `Polygon`과 `MultiPolygon`의 outer ring만 `boundaryPolygons`로 정규화한다.
- 가능 지역 경계는 DB에 저장하지 않는다. 후속 성능 문제가 확인되면 8자리 읍면동코드 기준 short TTL cache를 검토한다.
- 경계 조회가 실패하거나 비어 있으면 프론트는 해당 가능 지역을 지도에 그리지 않는다. 좌표 기준 `Circle` fallback은 실제 경계 의미를 왜곡하므로 금지한다.
- 이 API는 지도 표현을 위한 경계 데이터이며, 건물 존재 확인이나 정확 주소 판정 근거가 아니다.

## 9. GIS건물통합정보 후보

사용자 제공 정보 기준으로 GIS건물통합정보 관련 조회는 VWorld에서 가능하다. 다만 이번 입력에는 구체 endpoint, 요청 파라미터, 응답 필드 예시가 없으므로 구현 전 공식 문서를 추가로 확인한다.

ZIP:ON 활용 후보:

```text
주소/좌표 기반 건물 존재 확인
건축HUB 주소 조회 결과와 공간 건물 후보 교차 검증
건물관리번호 또는 PNU 기반 다른 API 조합
물건 정체 판별 신뢰도 보조
지도 layer 또는 후보 선택 UI
```

## 10. 확인 필요

- GIS건물통합정보 VWorld endpoint, 요청 파라미터, 응답 필드, 좌표계, 사용량 제한
- `getIndvdHousingPriceAttr` 요청 파라미터 전체 목록
- `housePc`의 원문 단위와 ZIP:ON 만원 단위 변환 기준
- 공동주택가격 속성조회 endpoint와 개별주택가격 속성조회 endpoint의 공통 parser 범위
- VWorld 오류 코드와 인증 실패 응답 구조

## Related documents

- [외부 API 명세 인덱스](/docs/api/external-api/INDEX.md)
- [필드 매핑 사전](/docs/api/external-api/FIELD_MAPPING_DICTIONARY.md)
- [외부 API 설정과 data.go.kr 키 관리](/docs/api/EXTERNAL_API_CONFIGURATION.md)
