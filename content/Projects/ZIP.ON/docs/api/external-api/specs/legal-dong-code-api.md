---
title: legal-dong-code-api
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-26T05:00:07+09:00
purpose: external-api-source-spec
status: active
code_sync_required: false
related_area: external-api, legal-dong-code, address-code
read_when: 
do_not_use_as: 
update_when: 
  - 법정동코드 API 원문 요청/응답 필드와 코드 구조를 확인할 때
  - 주소, LAWD_CD, sigunguCd, bjdongCd, PNU 매핑을 구현하기 전 source spec을 확인할 때
  - 현재 ZIP:ON legal_dong_codes schema 구현 완료 명세
  - 법정동코드 공식 API 명세나 코드 체계가 바뀌었음을 확인했을 때
---

# 외부 API 명세 - 행정안전부_행정표준코드_법정동코드

## 1. 원본 파일 분석

| 항목 | 내용 |
| --- | --- |
| 원본 파일명 | 기술문서_행정안전부_행정표준코드_법정동코드.docx |
| 파일 형식 | DOCX |
| 문서명 | 행정안전부 행정·안전 공공데이터 Open API 활용가이드 |
| 문서 버전 | 확인 필요 |
| 서비스 버전 | 1.0 |
| 작성/개정일 | 확인 필요 |
| 서비스 시작일 | 2021-04-01 |
| 서비스 배포일 | 2021-04-01 |
| 제공기관 | 행정안전부 |
| 서비스 제공자 | 장태호 / 정보통계담당관 / 044-205-1644 / thjang2414@korea.kr |
| 서비스명 국문 | 행정안전부_행정표준코드_법정동코드 |
| 서비스명 영문 | StanReginCd |
| 서비스 설명 | 행정표준코드관리시스템에서 제공중인 법정동코드 정보 |
| 데이터 갱신주기 | 수시 |
| 원문 구조 | DOCX 제목 구조: 1. 서비스 명세 → 1.1 공공데이터 API 서비스 → API 서비스 개요 → 상세기능 목록 → 상세기능 내역 → 2. Open API 에러 코드정리 |
| 비고 | 원문은 API 개요, 요청/응답 필드표, XML 요청/응답 예시, 에러코드표 중심으로 구성됨 |

## 2. 원본 구조 요약

| 구분 | 원문 위치 | 내용 | 구현 관련성 |
| --- | --- | --- | --- |
| 표지/목차 | 표지, 목차 | 문서명, 목차 | 낮음 |
| API 서비스 개요 | 1.1 공공데이터 API 서비스 / API 서비스 개요 | API명, 설명, 인증, 프로토콜, 데이터 형식, URL, 버전, 시작일, 제공자, 갱신주기 | 높음 |
| 상세기능 목록 | 상세기능 목록 | `getStanReginCdList` 1개 오퍼레이션 명시 | 높음 |
| 상세기능정보 | 상세기능 내역 / a) 상세기능정보 | 상세기능 유형, 설명, Callback URL, 메시지 크기, 평균 응답시간, TPS | 높음 |
| 요청 메시지 명세 | 상세기능 내역 / b) 요청 메시지 명세 | `ServiceKey`, `type`, `pageNo`, `numOfRows`, `flag`, `locatadd_nm` | 높음 |
| 응답 메시지 명세 | 상세기능 내역 / c) 응답 메시지 명세 | `totalCount`, `resultCode`, `region_cd`, `sido_cd`, `sgg_cd`, `umd_cd`, `ri_cd`, `locatadd_nm` 등 | 높음 |
| 요청/응답 예제 | 상세기능 내역 / d) 요청/응답 메시지 예제 | XML 요청 URL, XML 응답 예시 | 높음 |
| Open API 에러 코드정리 | 2. Open API 에러 코드정리 | 인증키 오류, 서비스 없음, 페이징 오류, 최대 요청 건수 초과, 트래픽 제한, 서버/DB/SQL 오류, 정상, 데이터 없음 | 높음 |

## 3. ZIP:ON 적용 판단

### 3.1 적용 가능 영역

| ZIP:ON 기능 | 적용 가능 여부 | 활용 방식 | 우선순위 |
| --- | ---: | --- | --- |
| 주소 정제 | 보조 | 사용자가 입력한 주소를 별도 주소 API로 정제한 뒤, 법정동명 또는 지역주소명 기준으로 법정동코드 후보를 조회하는 데 사용 | 중요 |
| 법정동코드 변환 | 가능 | `locatadd_nm`으로 지역주소명을 조회하고 `region_cd`, `sido_cd`, `sgg_cd`, `umd_cd`, `ri_cd`를 확보 | 필수 |
| 물건 유형 판별 | 보조 | 건축물대장, GIS건물통합정보, 실거래가 API 호출 전에 지역 코드 기반 조회 조건을 만드는 데 사용. 이 API 단독으로 물건 유형을 판별하지는 않음 | 필수 |
| 건축물/토지 기본정보 확인 | 보조 | 건축물·토지 API 호출 전 지역 식별자 또는 시군구코드 분리 용도로 사용 | 중요 |
| 실거래가/공시가격 비교 | 보조 | 실거래가 API의 지역 조회 조건 생성에 사용. 실제 가격 데이터는 제공하지 않음 | 중요 |
| 전세 위험도 계산 | 보조 | 전세가율 계산에 필요한 실거래가·공시가격 조회 전 선행 코드 변환 단계로 사용 | 중요 |
| 월세 적정성 판단 | 보조 | 전월세 실거래가 API 호출 전 지역 코드 확보에 사용 | 중요 |
| 체크리스트 생성 | 보조 | 법정동코드 변환 실패, 주소 불명확, 시군구코드 부족 등의 경우 “주소/법정동 재확인 필요” 체크리스트를 생성할 수 있음 | 선택 |

### 3.2 MVP 포함 여부

`MVP 필수`

이 API는 ZIP:ON의 “주소 입력 → 법정동코드 변환 → 물건 유형 판별 → 실거래가/건축물대장 조회” 흐름에서 초반부를 담당한다.
법정동코드 자체가 위험도를 계산하지는 않지만, 건축물대장·실거래가·공시가격 API를 호출하기 위한 지역 식별자 역할을 한다.
사용자가 입력한 주소가 바로 실거래가 API 요청값으로 변환되지는 않으므로, 주소 정제 이후 법정동코드 확보 단계가 필요하다.
다만 이 API는 도로명주소 정제 API가 아니며, 임의의 상세주소를 완전 정규화하는 기능은 원문상 확인되지 않는다.
따라서 MVP에서는 “주소 정제 API 이후의 법정동코드 조회/검증 API”로 포함하는 것이 적절하다.

## 4. 서비스 기본 정보

| 항목 | 내용 |
| --- | --- |
| Base URL | `http://apis.data.go.kr/1741000/StanReginCd` |
| 운영환경 URL | `http://apis.data.go.kr/1741000/StanReginCd` |
| 개발환경 URL | 확인 필요 |
| 오퍼레이션 URL | `http://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList` |
| WADL URL | `http://apis.data.go.kr/1741000/StanReginCd?_wadl&type=xml` |
| 프로토콜 | REST |
| HTTP Method | GET |
| 인증 방식 | ServiceKey |
| 요청 데이터 형식 | query |
| 응답 데이터 형식 | XML, JSON |
| 인터페이스 표준 | REST(GET) |
| 메시지교환유형 | Request-Response |
| 메시지 레벨 암호화 | 없음 |
| 전송 레벨 암호화 | 없음 |
| 평균 응답시간 | 500 ms |
| TPS 제한 | 30 tps |
| 메시지 크기 제한 | 300 bytes |
| WADL/Swagger/OpenAPI 여부 | WADL 제공 |
| 비고 | 원문상 SSL 미적용으로 표시됨. HTTPS 지원 여부는 확인 필요 |

## 5. 인증 방식

### 5.1 인증 파라미터

| 파라미터 | 위치 | 필수 | 설명 |
| --- | --- | ---: | --- |
| ServiceKey | query | Y | 공공데이터포털에서 발급받은 인증키. 원문 샘플에는 `인증키(URL Encode)`로 표시됨 |

### 5.2 인증 예시

```http
GET http://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList?ServiceKey={SERVICE_KEY}&type=xml&pageNo=1&numOfRows=10&flag=Y
```

실제 인증키는 문서나 코드에 직접 쓰지 말고 `{SERVICE_KEY}` 또는 환경변수로 주입한다.

## 6. 공통 요청 규칙

| 파라미터 | 타입 | 필수 | 예시 | 설명 |
| --- | --- | ---: | --- | --- |
| ServiceKey | 원문 타입 미기재 / 크기 100 | Y | `{SERVICE_KEY}` | 공공데이터포털에서 발급받은 인증키 |
| type | 원문 타입 미기재 / 크기 4 | Y | `xml` | 호출문서 형식. `xml`, `json`. default: `xml` |
| pageNo | 원문 타입 미기재 / 크기 4 | Y | `1` | 페이지번호. default: `1` |
| numOfRows | 원문 타입 미기재 / 크기 4 | Y | `3` | 한 페이지 결과 수. default: `10` |
| flag | 원문 타입 미기재 / 크기 2 | Y | `Y` | 신규API 여부. 원문 샘플은 `Y` |
| locatadd_nm | 원문 타입 미기재 / 크기 50 | N | `서울특별시` | 지역주소명 |

필수 여부 변환 기준은 다음과 같다.

| 원문 항목구분 | 구현 문서 표기 | 의미 |
| --- | --- | --- |
| `1` | Y | 필수 |
| `0` | N | 선택 |
| `1..n` | Y, 복수 | 1건 이상 복수 |
| `0..n` | N, 복수 | 0건 이상 복수 |

## 7. 페이징 규칙

원문상 페이징 관련 필드는 `pageNo`, `numOfRows`, `totalCount`이다.

| 항목 | 내용 |
| --- | --- |
| 1회 요청 최대 건수 | 1,000건 |
| 최대 건수 근거 | 에러코드 `336`: “데이터 요청은 한번에 최대 1,000건을 넘을 수 없습니다.” |
| `numOfRows` 의미 | 한 페이지 결과 수 |
| `numOfRows` 기본값 | 10 |
| `pageNo` 의미 | 페이지 번호 |
| `pageNo` 기본값 | 1 |
| `totalCount` 의미 | 전체 결과 수 |
| 페이지 시작 번호 | 1로 처리 |
| 전체 페이지 수 계산 | `ceil(totalCount / numOfRows)` |
| 반복 호출 방식 | 첫 페이지 응답의 `totalCount`를 읽고, `pageNo=1`부터 `totalPages`까지 반복 호출 |
| 구현 시 주의사항 | `numOfRows > 1000` 요청은 사전 차단한다. `pageNo`는 정수형 문자열로 검증한다. |

```text
totalPages = ceil(totalCount / numOfRows)
pageNo = 1부터 totalPages까지 반복 호출
numOfRows는 최대 1000 이하로 제한
```

## 8. 오퍼레이션 목록

| 번호 | 오퍼레이션명 | 국문명 | 설명 | ZIP:ON 활용 |
| ---: | --- | --- | --- | --- |
| 1 | `getStanReginCdList` | 법정동코드 조회 | 법정동코드 정보의 지역코드, 시도코드, 읍면동코드, 리코드, 지역주소명 등을 조회한다. | 주소 정제 이후 법정동코드·시군구코드 확보 |

## 9. 오퍼레이션 상세

---

## 9.1 법정동코드 조회

### 9.1.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | `getStanReginCdList` |
| Method | GET |
| Path | `/getStanReginCdList` |
| Full URL | `http://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList` |
| 설명 | 법정동코드 정보의 지역코드, 시도코드, 읍면동코드, 리코드, 지역주소명 등을 조회한다. |
| 상세기능 유형 | 조회(목록) |
| 평균 응답시간 | 500 ms |
| TPS 제한 | 30 tps |
| 최대 메시지 사이즈 | 300 bytes |
| ZIP:ON 활용 위치 | 사용자 입력 주소 정제 후 법정동코드 변환, 실거래가/건축물/토지 API 호출 전 지역 코드 확보 |

### 9.1.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | ---: | --- | --- | --- |
| ServiceKey | 인증키 | 원문 타입 미기재 / 100 | Y | `{SERVICE_KEY}` | 공공데이터포털에서 발급받은 인증키. URL Encode 필요 | 서버 환경변수에서 주입 |
| type | 호출문서(xml, json) | 원문 타입 미기재 / 4 | Y | `xml` | 호출문서 형식. `xml`, `json`. default: `xml` | MVP 초기 구현은 XML 우선. JSON 구조는 원문 확인 필요 |
| pageNo | 페이지 위치 | 원문 타입 미기재 / 4 | Y | `1` | 페이지번호. default: `1` | 페이징 조회 시 1부터 증가 |
| numOfRows | 페이지 당 요청 숫자 | 원문 타입 미기재 / 4 | Y | `3` | 한 페이지 결과 수. default: `10` | 전체 동기화 시 최대 1000 이하로 설정 |
| flag | 신규API | 원문 타입 미기재 / 2 | Y | `Y` | 신규API | 항상 `Y`로 호출. 다른 값은 확인 필요 |
| locatadd_nm | 지역주소명 | 원문 타입 미기재 / 50 | N | `서울특별시` | 지역주소명 | 정제된 법정동명/지역주소명 검색어 |

### 9.1.3 요청 예시

```http
GET http://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList?ServiceKey={SERVICE_KEY}&type=xml&pageNo=1&numOfRows=3&flag=Y&locatadd_nm=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C
```

원문 요청 예시는 다음과 같다.

```http
GET http://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList?ServiceKey={SERVICE_KEY}&type=xml&pageNo=1&numOfRows=3&flag=Y&locatadd_nm=서울특별시
```

원문 비고: 익스플로러에서 확인 시 파라미터 입력이 한글인 경우 UTF-8 인코딩 필요.

### 9.1.4 응답 필드

| 필드명 | 경로 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | ---: | --- | --- | --- |
| totalCount | `StanReginCd.head.totalCount` | 전체 결과 수 | 원문 타입 미기재 / 4 | Y | `1` | 전체 결과 수 | 페이징 계산에 사용 |
| numOfRows | `StanReginCd.head.numOfRows` | 한 페이지결과 수 | 원문 타입 미기재 / 4 | Y | `3` | 한 페이지 결과 수 | 요청값과 비교 |
| pageNo | `StanReginCd.head.pageNo` | 페이지 번호 | 원문 타입 미기재 / 4 | Y | `1` | 페이지 번호 | 요청값과 비교 |
| type | `StanReginCd.head.type` | 수신 문서형식 | 원문 타입 미기재 / 4 | Y | `XML` | 수신 문서형식 | 요청은 `xml`, 응답 샘플은 `XML` |
| resultCode | `StanReginCd.head.RESULT.resultCode` | 결과코드 | 원문 타입 미기재 / 10 | Y | `INFO-0` | 결과코드 | 에러코드표의 정상코드 `0`과 표기 차이 있음. 확인 필요 |
| resultMsg | `StanReginCd.head.RESULT.resultMsg` | 결과메세지 | 원문 타입 미기재 / 50 | Y | `NOMAL SERVICE` | 결과메세지 | 원문 오탈자 `NOMAL` 유지 |
| region_cd | `StanReginCd.row[].region_cd` | 지역코드 | 원문 타입 미기재 / 10 | Y | `1100000000` | 지역코드 | 10자리 문자열로 보관 |
| sido_cd | `StanReginCd.row[].sido_cd` | 시도코드 | 원문 타입 미기재 / 2 | N | `11` | 시도코드 | 문자열 보관 |
| sgg_cd | `StanReginCd.row[].sgg_cd` | 시군구코드 | 원문 타입 미기재 / 3 | N | `000` | 시군구코드 | 문자열 보관. `sido_cd + sgg_cd` 조합으로 5자리 시군구코드 후보 생성 가능 |
| umd_cd | `StanReginCd.row[].umd_cd` | 읍면동코드 | 원문 타입 미기재 / 3 | N | `000` | 읍면동코드 | 문자열 보관 |
| ri_cd | `StanReginCd.row[].ri_cd` | 리코드 | 원문 타입 미기재 / 2 | N | `00` | 리코드 | 문자열 보관 |
| locatjumin_cd | `StanReginCd.row[].locatjumin_cd` | 지역코드_주민 | 원문 타입 미기재 / 10 | N | `1100000000` | 지역코드_주민 | 하위 API별 사용 여부 확인 필요 |
| locatjijuk_cd | `StanReginCd.row[].locatjijuk_cd` | 지역코드_지적 | 원문 타입 미기재 / 10 | N | `1100000000` | 지역코드_지적 | 토지/지적 API 연계 시 확인 필요 |
| locatadd_nm | `StanReginCd.row[].locatadd_nm` | 지역주소명 | 원문 타입 미기재 / 50 | N | `서울특별시` | 지역주소명 | 사용자 입력 주소와 매칭 검증 |
| locat_order | `StanReginCd.row[].locat_order` | 서열 | 원문 타입 미기재 / 3 | N | `11` | 서열 | 정렬 보조 |
| locat_rm | `StanReginCd.row[].locat_rm` | 비고 | 원문 타입 미기재 / 200 | N | 빈 값 | 비고 | 값 존재 시 별도 표시 |
| locathigh_cd | `StanReginCd.row[].locathigh_cd` | 상위지역코드 | 원문 타입 미기재 / 10 | N | `0000000000` | 상위지역코드 | 법정동 계층 구성에 사용 가능 |
| locallow_nm | `StanReginCd.row[].locallow_nm` | 최하위지역명 | 원문 타입 미기재 / 20 | N | `서울특별시` | 최하위지역명 | 검색 결과 표시명 |
| adpt_de | `StanReginCd.row[].adpt_de` | 생성일 | 원문 타입 미기재 / 8 | N | `20000101` | 생성일 | `yyyyMMdd` 문자열로 수신 후 날짜 변환 가능 |

### 9.1.5 응답 예시

원문에는 XML 응답 예시만 제공된다. JSON 응답 구조는 원문 확인 필요.

```xml
<StanReginCd>
  <head>
    <totalCount>1</totalCount>
    <numOfRows>3</numOfRows>
    <pageNo>1</pageNo>
    <type>XML</type>
    <RESULT>
      <resultCode>INFO-0</resultCode>
      <resultMsg>NOMAL SERVICE</resultMsg>
    </RESULT>
  </head>
  <row>
    <region_cd>1100000000</region_cd>
    <sido_cd>11</sido_cd>
    <sgg_cd>000</sgg_cd>
    <umd_cd>000</umd_cd>
    <ri_cd>00</ri_cd>
    <locatjumin_cd>1100000000</locatjumin_cd>
    <locatjijuk_cd>1100000000</locatjijuk_cd>
    <locatadd_nm>서울특별시</locatadd_nm>
    <locat_order>11</locat_order>
    <locat_rm/>
    <locathigh_cd>0000000000</locathigh_cd>
    <locallow_nm>서울특별시</locallow_nm>
    <adpt_de>20000101</adpt_de>
  </row>
</StanReginCd>
```

### 9.1.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | `getStanReginCdList`, `fetchLegalDongCodes`, `searchLegalDongCodeByAddressName` |
| Request DTO 후보 | `StanReginCdListRequest` |
| Response DTO 후보 | `StanReginCdListResponse`, `StanReginCdHead`, `StanReginCdResult`, `StanReginCdRow` |
| DB 저장 필요 여부 | 저장 권장 |
| DB 테이블 후보 | `legal_dong_code`, `stan_regin_code`, `external_legal_region_code` |
| Redis 캐시 필요 여부 | 사용자 검색성 단건 조회는 캐시 권장. 코드 마스터는 DB 저장 우선 |
| 실패 시 처리 | 공공데이터 에러코드를 도메인 예외로 변환. 인증/쿼터/서버오류/데이터없음 구분 |
| 테스트 케이스 | 성공 XML 파싱, 에러코드 매핑, `numOfRows > 1000` 차단, `pageNo` 정수 검증, 한글 `locatadd_nm` UTF-8 인코딩, `row` 단건/복수 처리, `totalCount` 기반 페이지 반복 |
| ZIP:ON Service 후보 | `LegalDongCodeService`, `PublicLegalRegionCodeService` |
| 스케줄러 후보 | 전체 코드 동기화 배치. 갱신주기 원문이 “수시”이므로 주기 확정은 확인 필요 |
| 원천 응답 저장 | 운영 추적 목적의 요청/응답 로그는 선택. 전체 원문 장기 저장은 필수 아님 |
| 응답 파싱 | XML 우선 구현. JSON은 실제 응답 구조 확인 후 추가 |

### 9.1.7 ZIP:ON 해석 로직 후보

- 이 API는 사용자에게 그대로 보여줄 “분석 결과”가 아니라, 다른 부동산 공공데이터 API를 호출하기 위한 지역 코드 변환용 API로 사용한다.
- 사용자가 입력한 주소를 먼저 주소 API로 정제한 뒤, 정제된 법정동명 또는 지역주소명으로 `locatadd_nm` 조회를 수행한다.
- `region_cd`는 10자리 문자열로 저장한다. 숫자로 저장하면 앞자리 0이 있는 코드가 손상될 수 있으므로 금지한다.
- `sido_cd`, `sgg_cd`, `umd_cd`, `ri_cd`도 모두 문자열로 저장한다.
- 국토교통부 실거래가 계열 API에서 시군구코드가 필요한 경우 `sido_cd + sgg_cd` 조합을 내부 매핑 후보로 사용할 수 있다. 단, 대상 API가 요구하는 파라미터명이 `LAWD_CD`인지, 별도 법정동코드인지 반드시 API별 문서에서 확인한다.
- `locatadd_nm`이 “서울특별시”처럼 광역 단위만 매칭되면 실거래가·건축물대장 조회에 충분하지 않을 수 있다. ZIP:ON은 최소 시군구 또는 법정동 수준까지 주소 정제를 요구해야 한다.
- `locathigh_cd`는 법정동 계층 구조를 만들 때 사용할 수 있다.
- `adpt_de`는 코드 생성일로 보이며, 코드 변경 추적 또는 코드 마스터 동기화 시 참고값으로 저장할 수 있다.
- 법정동코드를 찾지 못하면 “주소가 불명확하여 법정동코드 확인이 필요합니다”라는 체크리스트 항목을 생성한다.
- 이 API 결과만으로는 건물 존재 여부, 주택 유형, 위반건축물 여부, 실거래가, 공시가격, 권리관계를 판단할 수 없다.

## 10. 코드표 / Enum / 분류값

| 코드/값 | 필드 | 의미 | ZIP:ON 처리 |
| --- | --- | --- | --- |
| `xml` | `type` | XML 형식 응답 요청 | MVP 초기 구현 기본값 후보 |
| `json` | `type` | JSON 형식 응답 요청 | 원문에 JSON 예시는 없음. 실제 응답 구조 확인 후 사용 |
| `Y` | `flag` | 신규API | 원문 샘플 기준 필수값. 다른 값은 확인 필요 |
| `INFO-0` | `resultCode` | 정상 응답 예시의 결과코드 | 에러코드표의 정상코드 `0`과 표기 차이 있음. 실제 응답 기준 매핑 필요 |
| `XML` | 응답 `type` | 수신 문서형식 | 요청값 `xml`과 대소문자가 다를 수 있으므로 case-insensitive 처리 |
| `1` | 원문 항목구분 | 필수 | 구현 문서에서는 Y |
| `0` | 원문 항목구분 | 선택 | 구현 문서에서는 N |
| `1..n` | 원문 항목구분 | 1건 이상 복수 | 배열/리스트 필수 |
| `0..n` | 원문 항목구분 | 0건 또는 복수건 | 배열/리스트 선택 |

## 11. 에러 코드

| 코드 | 메시지 | 의미 | 백엔드 처리 방안 | 사용자 노출 메시지 |
| --- | --- | --- | --- | --- |
| `290` | ERROR | 인증키가 유효하지 않습니다. 인증키가 없는 경우 홈페이지에서 인증키를 신청하십시오. | 인증키 오류. `ServiceKey` 설정 확인. 재시도보다 관리자 확인 필요 | 공공데이터 인증 설정에 문제가 있어 조회할 수 없습니다. |
| `310` | ERROR | 해당하는 서비스를 찾을 수 없습니다. 요청인자 중 SERVICE를 확인하십시오. | Base URL 또는 Operation Path 설정 오류. 관리자 확인 필요 | 공공데이터 서비스 연결 설정을 확인해야 합니다. |
| `333` | ERROR | 요청위치 값의 타입이 유효하지 않습니다. 요청위치 값은 정수를 입력하세요. | `pageNo` 정수 검증 실패로 처리. 사용자 입력보다는 내부 요청 생성 오류 가능성 높음 | 조회 조건이 올바르지 않습니다. |
| `336` | ERROR | 데이터 요청은 한번에 최대 1,000건을 넘을 수 없습니다. | `numOfRows`를 1000 이하로 사전 제한. 재시도 시 값 축소 | 한 번에 조회 가능한 건수를 초과했습니다. |
| `337` | ERROR | 일별 트래픽 제한을 넘은 호출입니다. 오늘은 더이상 호출할 수 없습니다. | 일일 쿼터 초과. 즉시 재시도 불필요. 캐시/DB 마스터 사용. 관리자 알림 | 공공데이터 일일 조회 한도를 초과했습니다. 잠시 후 다시 시도해주세요. |
| `500` | ERROR | 서버 오류입니다. 지속적으로 발생시 홈페이지로 문의(Q&A) 바랍니다. | 일시 장애 가능. 제한적 재시도 후 실패 로그 저장 | 공공데이터 서버 오류로 조회하지 못했습니다. |
| `600` | ERROR | 데이터베이스 연결 오류입니다. 지속적으로 발생시 홈페이지로 문의(Q&A) 바랍니다. | 제공기관 DB 장애. 제한적 재시도 후 장애 로그 저장 | 공공데이터 제공기관의 데이터베이스 오류로 조회하지 못했습니다. |
| `601` | ERROR | SQL 문장 오류입니다. 지속적으로 발생시 홈페이지로 문의(Q&A) 바랍니다. | 제공기관 SQL 오류. 재시도 효과 낮음. 관리자 확인 필요 | 공공데이터 처리 오류로 조회하지 못했습니다. |
| `0` | INFO | 정상 처리되었습니다. | 성공 처리 | 표시하지 않음 |
| `300` | INFO | 관리자에 의해 인증키 사용이 제한되었습니다. | 인증키 권한 제한. 관리자 확인 필요 | 공공데이터 인증키 사용이 제한되어 조회할 수 없습니다. |
| `200` | INFO | 해당하는 데이터가 없습니다. | 빈 결과 처리. 짧은 TTL 캐시 가능 | 해당 주소 또는 지역명에 대한 법정동코드를 찾지 못했습니다. |

주의사항:

- 원문 응답 예시의 정상 `resultCode`는 `INFO-0`이다.
- 에러코드표의 정상 코드는 `0`으로 표기되어 있다.
- 실제 API 응답에서 `INFO-0`, `0` 중 어떤 형식으로 내려오는지 확인한 뒤 둘 다 성공으로 허용할지 결정한다.

## 12. 데이터 저장/캐시 전략

| 데이터 | 추천 처리 | 이유 |
| --- | --- | --- |
| 법정동코드 마스터 | DB 저장 | 행정구역 코드는 여러 API 호출의 선행 키이며, 매 요청마다 외부 API를 호출할 필요가 낮음 |
| `region_cd` | DB 저장 | 10자리 법정동/지역코드 핵심 키 |
| `sido_cd`, `sgg_cd`, `umd_cd`, `ri_cd` | DB 저장 | 시군구코드 분리, 실거래가 API 호출 조건 생성, 주소 계층 구성에 필요 |
| `locatadd_nm` | DB 저장 + 검색 인덱스 후보 | 사용자가 입력한 지역명과 매칭할 표시명 |
| `locathigh_cd` | DB 저장 | 상위 법정동 계층 구성에 사용 가능 |
| `locallow_nm` | DB 저장 | 최하위 지역명 표시와 검색 보조 |
| `adpt_de` | DB 저장 | 코드 생성일/변경 추적 참고 |
| 원천 응답 전문 | 선택 저장 | 장애 분석 목적이면 저장. 일반 기능 구현에는 필수 아님 |
| 사용자별 조회 결과 | Redis 단기 캐시 | 같은 주소/지역명 반복 조회가 많을 수 있음 |
| 전체 코드 동기화 결과 | DB 저장 우선, Redis 선택 | 전체 마스터는 DB 기준으로 관리하는 편이 안정적 |
| 에러 응답 | 로그 저장 | 인증키 오류, 쿼터 초과, 제공기관 장애 추적 필요 |
| 조회 결과 없음 | 짧은 TTL 캐시 | 잘못된 주소 반복 호출 방지. 단, 주소 정제 개선 가능성을 고려해 TTL은 짧게 설정 |
| WADL | 미저장 | 구현 중 참조용. 런타임 저장 필요 낮음 |

추천 테이블 후보:

| 컬럼 후보 | 원문 필드 | 설명 |
| --- | --- | --- |
| `region_cd` | `region_cd` | 지역코드. PK 후보 |
| `sido_cd` | `sido_cd` | 시도코드 |
| `sgg_cd` | `sgg_cd` | 시군구코드 |
| `umd_cd` | `umd_cd` | 읍면동코드 |
| `ri_cd` | `ri_cd` | 리코드 |
| `locat_jumin_cd` | `locatjumin_cd` | 지역코드_주민 |
| `locat_jijuk_cd` | `locatjijuk_cd` | 지역코드_지적 |
| `locat_add_nm` | `locatadd_nm` | 지역주소명 |
| `locat_order` | `locat_order` | 서열 |
| `locat_rm` | `locat_rm` | 비고 |
| `locat_high_cd` | `locathigh_cd` | 상위지역코드 |
| `locallow_nm` | `locallow_nm` | 최하위지역명 |
| `adpt_de` | `adpt_de` | 생성일 |

## 13. 구현 시 주의사항

| 주의사항 | 내용 |
| --- | --- |
| URL 인코딩 | `ServiceKey`와 한글 파라미터 `locatadd_nm`은 URL Encode 필요 |
| 한글 파라미터 | 원문은 익스플로러에서 한글 입력 시 UTF-8 인코딩 필요라고 명시 |
| 파라미터 대소문자 | 인증키 파라미터는 원문 기준 `ServiceKey`이다. `serviceKey`로 바꾸지 않는다 |
| `type` 파라미터 | 이 API는 원문 기준 `_type`이 아니라 `type`을 사용한다 |
| `flag` 파라미터 | 원문상 필수이며 샘플값은 `Y`이다. 다른 허용값은 확인 필요 |
| HTTP/SSL | 원문은 전송 레벨 암호화 없음, 서비스 URL은 `http://`로 제시된다. HTTPS 지원 여부는 확인 필요 |
| 법정동코드 보관 | `region_cd`, `sido_cd`, `sgg_cd`, `umd_cd`, `ri_cd`는 숫자가 아니라 문자열로 보관한다 |
| 시군구코드 생성 | 내부적으로 `sido_cd + sgg_cd` 조합을 사용할 수 있으나, 실제 하위 API가 요구하는 코드 체계는 API별로 확인한다 |
| 광역 단위 결과 | `서울특별시`처럼 상위 지역만 조회되면 `sgg_cd=000`, `umd_cd=000`일 수 있다. 실거래가/건축물 조회에는 더 구체적인 주소가 필요할 수 있다 |
| 날짜 포맷 | `adpt_de`는 `yyyyMMdd` 형태 문자열로 보이며, 날짜 변환 시 포맷 검증 필요 |
| 좌표계 여부 | 이 API는 좌표를 제공하지 않는다 |
| 단건/배열 응답 | 원문 XML 예시는 단건 `row`이지만 상세기능 유형은 조회(목록)이므로 복수 `row` 가능성을 고려한다 |
| XML/JSON 차이 | XML 예시만 원문에 있다. JSON 구조는 원문 확인 필요 |
| 결과 메시지 오탈자 | 원문 정상 메시지는 `NOMAL SERVICE`로 표기되어 있다. 문자열 메시지보다 `resultCode` 중심으로 판단한다 |
| 정상코드 불일치 | 응답 예시는 `INFO-0`, 에러코드표는 `0`을 정상으로 표시한다. 둘 다 처리할지 확인 필요 |
| `numOfRows` 제한 | 최대 1,000건을 넘기면 에러코드 `336` 발생 |
| `pageNo` 검증 | 정수형 문자열이 아니면 에러코드 `333` 가능 |
| 공공데이터 장애 | `500`, `600`, `601`은 제공기관 장애 또는 처리 오류로 보고 재시도/장애 로그/관리자 알림을 분리한다 |
| 서비스키 만료/제한 | `290`, `300`, `337`은 사용자가 해결할 수 없는 운영 설정/쿼터 문제로 분류한다 |
| 주소 정제와 혼동 금지 | 이 API는 법정동코드 조회 API이지 도로명주소 정제 API가 아니다 |
| 법정동/행정동 혼동 금지 | 서비스명과 필드 기준 법정동코드로 사용한다. 행정동코드로 간주하지 않는다 |
| 폐지/변경 코드 여부 | 원문에는 폐지 여부, 사용 여부, 말소일 필드가 없다. 코드 유효성 상태는 확인 필요 |
| 데이터 갱신 | 원문 갱신주기는 “수시”이다. DB 동기화 주기는 운영 정책으로 결정해야 한다 |

## 14. Codex 작업 지시용 요약

```md
# Codex 구현 목표

이 문서를 바탕으로 `행정안전부_행정표준코드_법정동코드` 외부 API 연동 코드를 구현한다.

## 구현 대상

- API Client
  - `GET http://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList`
  - query parameter: `ServiceKey`, `type`, `pageNo`, `numOfRows`, `flag`, `locatadd_nm`
- Request DTO
  - `StanReginCdListRequest`
- Response DTO
  - `StanReginCdListResponse`
  - `StanReginCdHead`
  - `StanReginCdResult`
  - `StanReginCdRow`
- Service Layer
  - `LegalDongCodeService`
  - 주소 정제 결과를 받아 `locatadd_nm`으로 법정동코드를 조회한다.
  - `region_cd`, `sido_cd`, `sgg_cd`, `umd_cd`, `ri_cd`를 ZIP:ON 내부 지역 코드 모델로 변환한다.
- Error Mapping
  - `290`, `300`: 인증키 오류 또는 제한
  - `337`: 일일 트래픽 제한
  - `333`, `336`: 요청 파라미터 오류
  - `500`, `600`, `601`: 제공기관 장애
  - `200`: 데이터 없음
  - `0`, `INFO-0`: 정상 후보. 실제 응답 확인 후 성공 코드 처리
- Pagination 처리
  - `numOfRows`는 최대 1000 이하로 제한한다.
  - `pageNo`는 1부터 시작한다.
  - `totalCount` 기반으로 전체 페이지 수를 계산한다.
- XML/JSON 응답 파싱
  - 원문 예시는 XML만 있으므로 XML 파싱을 우선 구현한다.
  - JSON은 실제 응답 구조를 확인한 뒤 추가한다.
- 테스트 코드
  - 성공 XML 응답 파싱
  - 에러코드별 예외 매핑
  - `numOfRows > 1000` 요청 차단
  - `pageNo` 정수 검증
  - 한글 `locatadd_nm` UTF-8 인코딩
  - `row` 단건/복수 응답 처리
  - `totalCount` 기반 페이지 반복 호출
- 필요 시 DB 저장 또는 Redis 캐시
  - 법정동코드 마스터는 DB 저장 후보
  - 사용자 검색성 단건 조회는 Redis 단기 캐시 후보
  - 에러 응답은 운영 로그로 저장

## 주의사항

- 원문에 없는 값은 하드코딩하지 않는다.
- `ServiceKey`는 환경변수로 주입한다.
- 인증키를 문서, 테스트 로그, Git에 남기지 않는다.
- 파라미터명은 원문 기준 `ServiceKey`, `type`을 사용한다.
- `serviceKey`, `_type`으로 임의 변경하지 않는다.
- `flag=Y`는 원문 샘플 기준 필수 파라미터로 포함한다.
- `region_cd`, `sido_cd`, `sgg_cd`, `umd_cd`, `ri_cd`는 문자열로 처리한다.
- 공공데이터 API 실패 응답을 도메인 예외로 변환한다.
- 응답 DTO는 XML/JSON 구조 차이를 고려한다.
- JSON 응답 구조는 원문에 없으므로 실제 호출 또는 WADL 확인 후 보완한다.
- ZIP:ON MVP에서는 이 API를 주소 정제 이후 법정동코드 변환 필수 API로 사용한다.
- 이 API만으로 물건 유형, 건축물 상태, 실거래가, 권리관계 위험을 판단하지 않는다.
```

## 15. 확인 필요 목록

| 항목 | 확인이 필요한 이유 |
| --- | --- |
| 문서 버전 | 원문에는 서비스 버전 1.0은 있으나 문서 자체 버전은 별도 확인되지 않음 |
| 작성/개정일 | 원문에는 서비스 시작일/배포일 2021-04-01은 있으나 문서 작성/개정일은 명확하지 않음 |
| 개발환경 URL | 원문에는 운영 URL로 보이는 `http://apis.data.go.kr/1741000/StanReginCd`만 있음 |
| HTTPS 지원 여부 | 원문은 전송 레벨 암호화 없음, URL은 HTTP로 표시됨 |
| JSON 응답 구조 | 원문은 XML 응답 예시만 제공함 |
| 정상 resultCode 형식 | 응답 예시는 `INFO-0`, 에러코드표는 `0`을 정상으로 표시함 |
| `flag` 허용값 | 원문에는 `Y` 샘플만 있고 다른 값의 의미가 없음 |
| `locatadd_nm` 검색 방식 | 완전일치, 부분일치, 전방일치 여부가 원문에 없음 |
| `locatadd_nm` 없이 호출 시 반환 범위 | 전체 목록 반환 여부와 정렬 기준은 원문 확인 필요 |
| 코드 폐지/변경 여부 | 원문 응답 필드에는 폐지일, 사용여부, 변경사유 필드가 없음 |
| `locatjumin_cd`, `locatjijuk_cd` 사용 기준 | 하위 공공데이터 API별로 어느 코드를 써야 하는지 별도 확인 필요 |
| `최대 메시지 사이즈 300 bytes` 의미 | 요청 메시지 크기인지 응답 메시지 크기인지 원문상 불명확 |
| WADL 상세 구조 | WADL URL은 제공되지만 원문에 WADL 내용은 포함되어 있지 않음 |
| 실제 에러 응답 포맷 | 에러코드 표는 있으나 XML/JSON 에러 응답 예시는 원문에 없음 |
| 일일 트래픽 제한 수치 | 에러코드 `337`은 있으나 일일 제한량 자체는 원문에 없음 |
| 갱신주기 “수시”의 운영 의미 | DB 동기화 주기를 정하려면 실제 갱신 빈도 확인 필요 |
