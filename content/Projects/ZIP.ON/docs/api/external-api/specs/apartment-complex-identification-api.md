---
title: apartment-complex-identification-api
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
purpose: external-api-source-spec
status: active
code_sync_required: false
related_area: external-api, apartment-complex-identification, public-data
read_when: 
do_not_use_as: 
update_when: 
  - 공동주택 단지 식별정보 조회 서비스의 원문 API 필드와 endpoint를 확인할 때
  - 관련 API client, DTO, field mapping을 구현하기 전 source spec을 확인할 때
  - 현재 ZIP:ON 구현 완료 명세
  - 단독 위험진단 판단 기준
  - 원문 API 명세, 공식 endpoint, 요청/응답 필드가 바뀌었음을 확인했을 때
---

# 외부 API 명세 - 공동주택 단지 식별정보 조회 서비스

## 1. 원본 파일 분석

| 항목 | 내용 |
| --- | --- |
| 원본 파일명 | `기술문서_공동주택 단지 식별정보 조회 서비스_250729.docx` |
| 보조 원본 파일명 | `국가중점데이터_컬럼정의서(24.09.06)_배포용.xlsx` |
| 변환 지시 원문 | `붙여넣은 마크다운(1).md` 기준으로 구현용 API 명세 구조화 |
| 파일 형식 | DOCX + XLSX |
| 문서명 | 공동주택 단지 식별정보 조회 서비스 Open API 활용가이드 |
| 문서 버전 | 1.0 |
| 작성/개정일 | 본문 명시 없음. 파일명 `250729`의 의미는 확인 필요 |
| 제공기관 | 한국부동산원 |
| 서비스명 국문 | 공동주택 단지 식별정보 조회 서비스 |
| 서비스명 영문 | AptIdInfoSvc |
| 서비스 설명 | 공동주택 단지 식별정보를 조회하는 서비스. 기본정보, 동정보, 단지명 이력정보로 구성 |
| 데이터 갱신주기 | 매년 |
| 원문 구조 | DOCX: 표지, 목차, 서비스 개요, 코드명세, 상세기능 목록, 상세기능내역 3개, 에러 코드. XLSX: `테이블정의서(전체)`, `테이블정의서(변동)`, `참조코드`, `용도지역지구정보_파일명` |
| 비고 | API Client 구현 대상은 DOCX의 `AptIdInfoSvc` 3개 오퍼레이션이다. XLSX는 직접 호출 가능한 API 명세라기보다 국가중점데이터 컬럼정의서/코드표로 보이며, ZIP:ON의 향후 공간정보·토지·공시가격·중개업 데이터 모델 설계 부록으로 사용한다. ZIP:ON 적용 판단은 MVP 문맥과 API 호출 순서 문맥을 함께 반영한다. |

---

## 2. 원본 구조 요약

### 2.1 DOCX 구조

| 구분 | 원문 위치 | 내용 | 구현 관련성 |
| --- | --- | --- | --- |
| 표지 | 1쪽 | 공동주택 단지 식별정보 조회 서비스 Open API 활용가이드 | 낮음 |
| 목차 | 2쪽 | 서비스 명세, API 개요, 코드명세, 상세기능 목록, 상세기능내역, 에러 코드 | 보통 |
| API 서비스 개요 | 3~4쪽 | API명, 인증, REST GET, XML/JSON, 서비스 URL, 버전, 제공자, 갱신주기 | 높음 |
| 코드명세 | 4쪽 | 단지종류 코드: 아파트 1, 연립 2, 다세대 3 | 높음 |
| 상세기능 목록 | 5쪽 | `getAptInfo`, `getDongInfo`, `getHistInfo` | 높음 |
| getAptInfo | 6~9쪽 | 기본정보 조회 요청/응답 필드, 요청/응답 예시 | 높음 |
| getDongInfo | 10~13쪽 | 동정보 조회 요청/응답 필드, 요청/응답 예시 | 높음 |
| getHistInfo | 14~16쪽 | 단지명 이력정보 조회 요청/응답 필드, 요청/응답 예시 | 높음 |
| 에러 코드 | 17쪽 | 200, 401, 500 | 높음 |

### 2.2 XLSX 구조

| 시트명 또는 파일명 | 추정 용도 | 주요 컬럼 | 구현 관련성 | 비고 |
| --- | --- | --- | --- | --- |
| 테이블정의서(전체) | 국가중점데이터 전체 컬럼정의서 | 데이터셋 구분, 공간정보 데이터셋명, SHP 파일명, SHP 항목명, 속성정보 CSV 데이터셋명, CSV 파일명, 항목명, 샘플데이터, 비고 | 보통 | 897개 데이터 행. API 호출 명세가 아니라 파일/공간정보 스키마에 가까움 |
| 테이블정의서(변동) | 변경분 데이터 컬럼정의서 | 전체 시트와 유사. 변경순번, 입력구분 등 변동 관리 컬럼 포함 | 보통 | 334개 데이터 행 |
| 참조코드 | 코드표 | 코드그룹명, 세부코드 | 높음 | 건축물/토지/용도/중개업 관련 enum 후보 |
| 용도지역지구정보_파일명 | 용도지역지구 데이터셋 파일명 매핑 | 번호, 데이터셋명, 파일명 | 보통 | 160개 데이터 행 |
| 숨김 시트 | 확인 결과 없음 | - | 낮음 | workbook.xml 기준 모든 시트 visible |
| 셀 메모 | 확인 결과 없음 | - | 낮음 | comments 파일 없음 |
| 데이터 유효성 규칙 | 확인 결과 없음 | - | 낮음 | dataValidations 없음 |
| 병합 셀 | 헤더 영역 병합 | A5:A6, B5:B6, P5:P6, Q5:Q6 등 | 보통 | 다중 헤더 복원 필요 |
| 수식/계산값 | 일부 셀에 수식 요소 존재 | 비고 셀 일부가 코드그룹명을 참조하는 형태 | 보통 | 일부 도구에서 `#NAME?`처럼 보일 수 있어 원문 확인 필요 |

### 2.3 XLSX에서 ZIP:ON 관련성이 높은 데이터셋

| 데이터셋 구분 | 파일/데이터셋 | 주요 필드 예시 | ZIP:ON 활용 |
| --- | --- | --- | --- |
| GIS건물통합정보 | `AL_D010`, `CH_D010` | GIS건물통합식별번호, 고유번호, 법정동코드, 법정동명, 지번, 건축물용도코드/명, 구조, 면적, 사용승인일자, 위반건축물여부, 건물명, 동명, 지상층수, 지하층수 | 물건 정체 판별, 건축물 위험 보조 |
| 공동주택가격정보 | `AL_D166`, `AL_D167` | 고유번호, 법정동코드, 지번, 기준연도, 기준월, 공동주택구분, 공동주택명, 동명, 층명, 호명, 전용면적, 공시가격 | 공시가격 기반 보증금 위험도 보조 |
| 개별주택가격정보 | `AL_D168`, `AL_D169` | 고유번호, 법정동코드, 지번, 건축물대장고유번호, 기준연도, 기준월 | 단독/다가구 가격 보조 |
| 개별공시지가정보 | `AL_D150`, `AL_D151` | 고유번호, 법정동코드, 지번, 기준연도, 기준월, 공시지가, 공시일자 | 토지·임야 가격 기준 보조 |
| 토지임야정보 | `AL_D003`, `CH_D003` | 고유번호, 법정동코드, 지번, 대장구분, 지목, 면적, 소유구분, 축척, 데이터기준일자 | 토지·임야 기본정보 확인 |
| 용도지역지구정보 | 원문 파일명 확인 필요 | 원천도형ID, 도면번호, 주제도명, 데이터기준일자, 용도지역지구코드/명, 고시일자, 객체내용 | 용도지역·지구·구역 확인 |
| 부동산중개업정보 | `AL_D170`, `AL_D171`, `AL_D172` | 법정동코드, 등록번호, 사업자상호, 중개업자명, 상태구분, 등록일자, 보증설정기간, 중개업자종별 | 계약 상대방·중개사 확인 보조 |
| 건축물연령정보 | `AL_D196`, `AL_D197` | GIS건물통합식별번호, 고유번호, 법정동코드, 건물식별번호, 집합건물구분, 대장종류, 건물명 | 노후도/물건 유형 보조 |
| 용도별건물정보 | `AL_D198`, `AL_D199` | GIS건물통합식별번호, 법정동코드, 건물식별번호, 집합건물구분, 용도 관련 필드 | 목적별 용도 적합성 보조 |

---

## 3. ZIP:ON 적용 판단

### 3.1 적용 가능 영역

| ZIP:ON 기능 영역 | 적용 가능 여부 | 활용 방식 | 중요도 |
| --- | ---: | --- | --- |
| 주소 정제 | 보조 | `adres` LIKE 조건으로 주소 기반 단지 검색은 가능하나 주소 정규화 기능은 아님 | 선택 |
| 법정동코드 변환 | 보조 | 응답의 `PNU`를 다른 API 연결키로 활용 가능. 법정동코드 변환 API는 아님 | 선택 |
| 물건 유형 판별 | 보조 | `COMPLEX_GB_CD`로 아파트/연립/다세대 구분 보조 | 중요 |
| 건축물 기본정보 확인 | 보조 | 동수, 세대수, 사용승인일, 단지명, 동명 확인 | 중요 |
| 토지·임야 기본정보 확인 | 불가능 | `PNU` 외 토지·임야 속성은 제공하지 않음 | 선택 |
| 실거래가 확인 | 불가능 | 가격/거래 데이터 없음 | 필수 아님 |
| 공시가격·공시지가 확인 | 보조 | `COMPLEX_NM1`이 공시가격 기준 단지명으로 제공되나 가격값은 없음 | 선택 |
| 전세 위험도 계산 | 보조 | 공동주택 유형, 사용승인일, 세대수, 단지명 확인용. 위험도 직접 계산 불가 | 중요 |
| 월세 적정성 판단 | 보조 | 단지 식별과 유형 보조. 월세 시세 없음 | 선택 |
| 매매 위험도 계산 | 보조 | 단지 식별과 사용승인일 보조. 매매가 없음 | 선택 |
| 용도지역·지구·구역 확인 | 불가능 | 해당 정보 없음 | 선택 |
| 생활 인프라 분석 | 불가능 | 주변 인프라 데이터 없음 | 선택 |
| 상권 분석 | 불가능 | 상가/상권 데이터 없음 | 선택 |
| 환경·재난 리스크 분석 | 불가능 | 환경·재난 데이터 없음 | 선택 |
| 계약 상대방·중개사 확인 | 불가능 | 중개업소/임대인 정보 없음 | 선택 |
| 체크리스트 생성 | 보조 | 공동주택 여부, 다세대 여부, 사용승인일, 세대수 기반 안내 문장 생성 가능 | 중요 |

### 3.2 적용 판단 요약

이 API는 ZIP:ON의 핵심 위험도 계산 API라기보다, 공동주택 단지 식별과 물건 유형 보조에 쓰는 API다. ZIP:ON은 주소 입력 후 바로 실거래가를 조회하는 서비스가 아니라, 먼저 물건의 정체를 판별하고 그 결과에 따라 실거래가·공시가격·건축물대장 API를 선택해야 한다.

`getAptInfo`는 사용자가 입력한 주소가 아파트, 연립, 다세대 단지인지 확인하는 데 유용하다. 특히 `COMPLEX_GB_CD`, `DONG_CNT`, `UNIT_CNT`, `USEAPR_DT`, `PNU`는 위험도 계산 전 단계의 식별·분류·조합키로 쓸 수 있다.

다만 이 API만으로 다가구, 오피스텔, 근린생활시설 여부를 확정할 수 없고, 가격·권리관계·선순위 임차인·보증보험 가능성도 판단할 수 없다. 따라서 건축물대장, GIS건물통합정보, 실거래가, 공시가격 API와 조합해야 의미가 생긴다.

호출 순서는 주소 정제 → 법정동/PNU 후보 생성 → 건축물·GIS 기반 물건 유형 판별 → 공동주택 후보인 경우 `AptIdInfoSvc` 호출이 적합하다. 데이터 갱신주기가 매년이므로 결과는 DB 저장 또는 장기 캐시 후보지만, 실제 TTL은 운영 정책 확인이 필요하다.

---

## 4. 서비스 기본 정보

| 항목 | 내용 |
| --- | --- |
| Base URL | `https://api.odcloud.kr/api/AptIdInfoSvc/v1` |
| 운영환경 URL | `https://api.odcloud.kr/api/AptIdInfoSvc/v1/{operation}?page=1&perPage=10&serviceKey={SERVICE_KEY}` |
| 개발환경 URL | 확인 필요 |
| 프로토콜 | REST |
| HTTP Method | GET |
| 인증 방식 | ServiceKey |
| 요청 데이터 형식 | query parameter |
| 응답 데이터 형식 | XML, JSON 지원으로 표기. 원문 예시는 JSON |
| 평균 응답시간 | 확인 필요 |
| TPS 제한 | 확인 필요 |
| 메시지 크기 제한 | 확인 필요 |
| WADL/Swagger/OpenAPI 여부 | 서비스 명세 URL 제공: `https://infuser.odcloud.kr/api/stages/41233/api-docs?1665046045357`. 실제 OpenAPI 스펙 여부 확인 필요 |
| 서비스 버전 | 1.0 |
| 서비스 시작일 | 2022-09 |
| 서비스 배포일 | 2022-09 |
| 서비스 이력 | 2022-09 서비스 오픈 |
| 메시지 교환유형 | Request-Response |
| 서비스 제공자 | 박지영 / 한국부동산원 ICT센터 ICT전략부 / 053-663-8466 |
| 데이터 갱신주기 | 매년 |
| 비고 | 원문 표에는 전송 레벨 암호화가 `[O] 없음`으로 표시되어 있으나, 서비스 URL은 `https://`다. 구현은 원문 서비스 URL의 HTTPS를 사용하고, 표기 불일치는 확인 필요로 남긴다. |

---

## 5. 인증 방식

### 5.1 인증 파라미터

| 파라미터 | 위치 | 필수 | 설명 |
| --- | --- | ---: | --- |
| serviceKey | query | Y | 공공데이터/ODcloud 서비스 인증키. 실제 키는 코드·문서에 하드코딩하지 않고 환경변수로 주입 |

### 5.2 인증 예시

```http id="v1whkc"
GET https://api.odcloud.kr/api/AptIdInfoSvc/v1/getAptInfo?page=1&perPage=10&serviceKey={SERVICE_KEY}
```

---

## 6. 공통 요청 규칙

| 파라미터 | 타입 | 필수 | 예시 | 설명 |
| --- | --- | ---: | --- | --- |
| page | number | Y | `1` | 페이지 번호. 원문 예시는 1부터 시작 |
| perPage | number | Y | `10` | 1회 요청 행 수 |
| serviceKey | string | Y | `{SERVICE_KEY}` | 인증키 |
| cond[COMPLEX_PK::EQ] | string | N | `11110100000033` | 단지고유번호 정확 일치 조건. 원문 요청표 필드명은 `complex_pk`, 예시 URL 조건명은 `COMPLEX_PK` |
| cond[ADRES::LIKE] | string | N | `서울` | 주소 LIKE 검색 조건. `getAptInfo`에서만 원문 예시 제공 |
| _type | string | 확인 필요 | 확인 필요 | 원문에는 XML/JSON 지원이 표시되어 있으나 `_type` 또는 응답 포맷 선택 파라미터는 명시되지 않음 |
| numOfRows | - | 해당 없음 | - | 이 API 원문은 `numOfRows`가 아니라 `perPage` 사용 |
| pageNo | - | 해당 없음 | - | 이 API 원문은 `pageNo`가 아니라 `page` 사용 |

### 6.1 조건 파라미터 인코딩 규칙

원문 예시는 ODcloud 조건 파라미터를 URL 인코딩한 형태로 제공한다.

| 논리 파라미터 | URL 인코딩 전 | 원문 예시의 URL 인코딩 형태 |
| --- | --- | --- |
| 단지고유번호 EQ | `cond[COMPLEX_PK::EQ]=11110100000033` | `cond%5BCOMPLEX_PK%3A%3AEQ%5D=11110100000033` |
| 주소 LIKE | `cond[ADRES::LIKE]=서울` | `cond%5BADRES%3A%3ALIKE%5D=%EC%84%9C%EC%9A%B8` |

구현 시에는 HTTP client가 query parameter를 안전하게 인코딩하도록 하고, 이미 인코딩된 문자열을 다시 인코딩하지 않도록 주의한다.

---

## 7. 페이징 규칙

원문 요청 예시는 모든 오퍼레이션에서 `page=1&perPage=10`을 사용한다. 응답에는 `currentCount`, `matchCount`, `page`, `perPage`, `totalCount`가 포함된다.

| 필드 | 의미 | 구현 메모 |
| --- | --- | --- |
| currentCount | 현재 응답의 데이터 개수로 보임 | 예: `getAptInfo` 응답에서 1 |
| matchCount | 조건에 매칭된 개수로 보임 | 원문 설명 없음. 조건 검색 반복 기준으로 사용할 수 있는지 확인 필요 |
| page | 현재 페이지 번호 | 요청 `page`와 동일 |
| perPage | 1회 요청 행 수 | 요청 `perPage`와 동일 |
| totalCount | 전체 건수로 보임 | 조건 적용 전 전체 건수인지, 전체 페이지 계산 기준인지 확인 필요 |

```text id="3wyxeh"
totalPages = ceil(totalCount / perPage)
page = 1부터 totalPages까지 반복 호출
```

조건 검색에서는 `matchCount`와 `totalCount`의 의미가 다를 수 있다. 예시상 `getAptInfo`는 `currentCount=1`, `matchCount=1`, `totalCount=44064`로 응답한다. 따라서 Codex 구현 시 기본 페이지 wrapper에는 두 값을 모두 보존하고, 반복 호출 기준은 실제 API 응답 검증 후 확정해야 한다.

---

## 8. 오퍼레이션 목록

| 번호 | 오퍼레이션명 | 국문명 | 설명 | ZIP:ON 활용 |
| ---: | --- | --- | --- | --- |
| 1 | getAptInfo | 공동주택 단지 식별정보 기본정보 조회 | 단지고유번호, 주소 값을 이용하여 공동주택 단지 기본정보 제공 | 주소 기반 공동주택 후보 식별, 단지종류·세대수·사용승인일 확인 |
| 2 | getDongInfo | 공동주택 단지 식별정보 동정보 조회 | 단지고유번호 값을 이용하여 공동주택 단지 동정보 제공 | 사용자가 입력한 동/호 정보와 단지 동명 비교 보조 |
| 3 | getHistInfo | 공동주택 단지 식별정보 단지명 이력정보 조회 | 단지고유번호 값을 이용하여 단지명 이력정보 제공 | 과거 단지명/현재 단지명 매칭, 다른 API 검색 보정 |

---

## 9. 오퍼레이션 상세

---

## 9.1 공동주택 단지 식별정보 기본정보 조회

### 9.1.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getAptInfo |
| Method | GET |
| Path | `/getAptInfo` |
| Full URL | `https://api.odcloud.kr/api/AptIdInfoSvc/v1/getAptInfo` |
| 설명 | 단지고유번호, 주소 값을 이용하여 공동주택 단지 식별정보 기본정보를 제공 |
| 평균 응답시간 | 확인 필요 |
| TPS 제한 | 확인 필요 |
| ZIP:ON 활용 위치 | 주소 정제 이후, 건축물/GIS 기반으로 공동주택 후보라고 판단된 물건의 단지 식별 보조 |

### 9.1.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | ---: | --- | --- | --- |
| page | 페이지 | number | Y | `1` | 페이지 번호 | 공통 페이징 |
| perPage | 페이지당 건수 | number | Y | `10` | 1회 조회 건수 | 공통 페이징 |
| serviceKey | 서비스키 | string | Y | `{SERVICE_KEY}` | 인증키 | 환경변수 |
| complex_pk | 단지고유번호 | string(14) | N | `11110100000033` | 원문 요청표 기준. URL 조건명은 `COMPLEX_PK::EQ` | `complexPk` |
| adres | 주소 | string(200) | N | `서울` | 원문 요청표 기준. URL 조건명은 `ADRES::LIKE` | `addressKeyword` |

필수 여부 변환 기준: 원문의 `0`은 선택이다. 다만 이 오퍼레이션은 `complex_pk` 또는 `adres` 중 하나 없이 호출했을 때 전체 목록이 반환되는지 확인 필요하다.

### 9.1.3 요청 예시

```http id="b6knbj"
GET https://api.odcloud.kr/api/AptIdInfoSvc/v1/getAptInfo?page=1&perPage=10&cond%5BCOMPLEX_PK%3A%3AEQ%5D=11110100000033&cond%5BADRES%3A%3ALIKE%5D=%EC%84%9C%EC%9A%B8&serviceKey={SERVICE_KEY}
```

인코딩 전 의미:

```http id="slqma2"
GET https://api.odcloud.kr/api/AptIdInfoSvc/v1/getAptInfo?page=1&perPage=10&cond[COMPLEX_PK::EQ]=11110100000033&cond[ADRES::LIKE]=서울&serviceKey={SERVICE_KEY}
```

### 9.1.4 응답 필드

공통 wrapper:

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | ---: | --- | --- | --- |
| response.currentCount | 현재 응답 건수 | number | 확인 필요 | `1` | 현재 페이지의 데이터 수로 보임 | 원문 설명 없음 |
| response.data | 데이터 목록 | array | 확인 필요 | `[...]` | 조회 결과 배열 | 빈 배열 가능성 고려 |
| response.matchCount | 매칭 건수 | number | 확인 필요 | `1` | 조건 매칭 수로 보임 | 원문 설명 없음 |
| response.page | 페이지 | number | 확인 필요 | `1` | 현재 페이지 | - |
| response.perPage | 페이지당 건수 | number | 확인 필요 | `10` | 요청 perPage | - |
| response.totalCount | 전체 건수 | number | 확인 필요 | `44064` | 전체 건수로 보임 | 조건 적용 전/후 의미 확인 필요 |

`data[]` item:

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | ---: | --- | --- | --- |
| response.data[].COMPLEX_PK | 단지고유번호 | string(14) | N | `11110100000033` | 단지고유번호 | 숫자처럼 보여도 문자열 처리 |
| response.data[].PNU | 필지고유번호 | string(19) | N | `1111017400104360064` | 필지고유번호 | 법정동/지번 연계키 후보 |
| response.data[].ADRES | 주소 | string(200) | N | `서울특별시 종로구 창신동 436-64` | 주소 | 사용자 입력 주소와 비교 |
| response.data[].COMPLEX_NM1 | 단지명_공시가격 | string(100) | N | `동대문상가` | 공시가격 기준 단지명 | 공시가격 API 조합 후보 |
| response.data[].COMPLEX_NM2 | 단지명_건축물대장 | string(100) | N | `가동` | 건축물대장 기준 단지명 | 건축물대장 조합 후보 |
| response.data[].COMPLEX_NM3 | 단지명_도로명주소 | string(100) | N | `가동` | 도로명주소 기준 단지명 | 주소 매칭 보조 |
| response.data[].COMPLEX_GB_CD | 단지종류 | string(1) | N | `1` | 단지종류 코드 | 1 아파트, 2 연립, 3 다세대 |
| response.data[].DONG_CNT | 동수 | number | N | `4` | 동수 | 단지 규모 보조 |
| response.data[].UNIT_CNT | 세대수 | number | N | `142` | 세대수 | 단지 규모 보조 |
| response.data[].USEAPR_DT | 사용승인일 | string(8) | N | `19680913` | 사용승인일 | `yyyyMMdd` 문자열 처리 |

### 9.1.5 응답 예시

```json id="oaod6q"
{
  "currentCount": 1,
  "data": [
    {
      "ADRES": "서울특별시 종로구 창신동 436-64",
      "COMPLEX_GB_CD": "1",
      "COMPLEX_NM1": "동대문상가",
      "COMPLEX_NM2": "가동",
      "COMPLEX_NM3": "가동",
      "COMPLEX_PK": "11110100000033",
      "DONG_CNT": 4,
      "PNU": "1111017400104360064",
      "UNIT_CNT": 142,
      "USEAPR_DT": "19680913"
    }
  ],
  "matchCount": 1,
  "page": 1,
  "perPage": 10,
  "totalCount": 44064
}
```

XML 예시는 원문에 없다. XML 구조는 원문 확인 필요.

### 9.1.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | `getAptInfo(AptInfoSearchRequest request)` |
| Request DTO 후보 | `AptInfoSearchRequest`, `OdcloudPageRequest` |
| Response DTO 후보 | `OdcloudPageResponse<AptInfoItem>`, `AptInfoItem` |
| DB 저장 필요 여부 | 저장 또는 캐시 후보. 매년 갱신 데이터이므로 단지 식별 마스터로 저장 가능하나, 저장 정책 확인 필요 |
| Redis 캐시 필요 여부 | 주소/단지고유번호 단건 조회 결과는 캐시 후보. TTL은 운영 정책 확인 필요 |
| 실패 시 처리 | 401은 인증키 오류, 500은 외부 API 장애로 도메인 예외 변환 |
| 테스트 케이스 | 서비스키 주입, 한글 주소 LIKE 인코딩, `COMPLEX_PK::EQ` 조건 생성, JSON wrapper 파싱, `COMPLEX_GB_CD` enum 매핑, 빈 `data` 처리, 401/500 매핑 |

### 9.1.7 ZIP:ON 해석 로직 후보

- `COMPLEX_GB_CD=1`이면 아파트, `2`이면 연립, `3`이면 다세대 후보로 표시한다.
- 사용자가 “원룸”이라고 입력했는데 `COMPLEX_GB_CD=3`이면 “공부상 다세대 공동주택 가능성”으로 안내한다.
- `USEAPR_DT`로 노후도 문장을 생성할 수 있으나, 위반건축물 여부와 대장상 용도는 이 API만으로 확정하지 않는다.
- `PNU`는 토지·공시지가·건축물대장·공간정보 API 조합키 후보로 저장한다.
- `COMPLEX_NM1`, `COMPLEX_NM2`, `COMPLEX_NM3`가 다르면 공시가격, 건축물대장, 도로명주소 기준 명칭이 다를 수 있으므로 검색 보정에 사용한다.
- 최종 위험도 계산에는 실거래가, 공시가격, 건축물대장, 등기부등본 확인이 추가로 필요하다.

---

## 9.2 공동주택 단지 식별정보 동정보 조회

### 9.2.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getDongInfo |
| Method | GET |
| Path | `/getDongInfo` |
| Full URL | `https://api.odcloud.kr/api/AptIdInfoSvc/v1/getDongInfo` |
| 설명 | 단지고유번호 값을 이용하여 공동주택 단지 식별정보 동정보를 제공 |
| 평균 응답시간 | 확인 필요 |
| TPS 제한 | 확인 필요 |
| ZIP:ON 활용 위치 | 사용자가 입력한 동/호 정보와 단지 동명 후보 비교, 상세주소 보정 |

### 9.2.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | ---: | --- | --- | --- |
| page | 페이지 | number | Y | `1` | 페이지 번호 | 공통 페이징 |
| perPage | 페이지당 건수 | number | Y | `10` | 1회 조회 건수 | 공통 페이징 |
| serviceKey | 서비스키 | string | Y | `{SERVICE_KEY}` | 인증키 | 환경변수 |
| complex_pk | 단지고유번호 | string(14) | N | `11110100000033` | 원문 요청표 기준. URL 조건명은 `COMPLEX_PK::EQ` | `complexPk` |

원문상 항목구분은 `0`이지만, 상세기능 설명은 “단지고유번호 값을 이용”한다고 되어 있다. 실사용에서는 `complex_pk` 없이 호출할 필요가 낮으므로 필수처럼 취급할지 확인 필요하다.

### 9.2.3 요청 예시

```http id="mt0006"
GET https://api.odcloud.kr/api/AptIdInfoSvc/v1/getDongInfo?page=1&perPage=10&cond%5BCOMPLEX_PK%3A%3AEQ%5D=11110100000033&serviceKey={SERVICE_KEY}
```

인코딩 전 의미:

```http id="u23491"
GET https://api.odcloud.kr/api/AptIdInfoSvc/v1/getDongInfo?page=1&perPage=10&cond[COMPLEX_PK::EQ]=11110100000033&serviceKey={SERVICE_KEY}
```

### 9.2.4 응답 필드

공통 wrapper는 `getAptInfo`와 동일하다.

`data[]` item:

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | ---: | --- | --- | --- |
| response.data[].COMPLEX_PK | 단지고유번호 | string(14) | N | `11110100000033` | 단지고유번호 | 문자열 처리 |
| response.data[].DONG_NM1 | 동명_공시가격 | string(100) | N | `라` | 공시가격 기준 동명 | 검색 보정 |
| response.data[].DONG_NM2 | 동명_건축물대장 | string(100) | N | `라동` | 건축물대장 기준 동명 | 건축물대장 조합 후보 |
| response.data[].DONG_NM3 | 동명_도로명주소 | string(100) | N | `라동` | 도로명주소 기준 동명 | 주소 보정 |
| response.data[].GRND_FLR_CNT | 지상층수 | number | N | `5` | 지상층수 | 건축물 기본 위험 보조 |

### 9.2.5 응답 예시

```json id="pyurd5"
{
  "currentCount": 4,
  "data": [
    {
      "COMPLEX_PK": "11110100000033",
      "DONG_NM1": "라",
      "DONG_NM2": "라동",
      "DONG_NM3": "라동",
      "GRND_FLR_CNT": 5
    },
    {
      "COMPLEX_PK": "11110100000033",
      "DONG_NM1": "나",
      "DONG_NM2": "나동",
      "DONG_NM3": "나동",
      "GRND_FLR_CNT": 5
    },
    {
      "COMPLEX_PK": "11110100000033",
      "DONG_NM1": "가",
      "DONG_NM2": "가동",
      "DONG_NM3": "가동",
      "GRND_FLR_CNT": 5
    },
    {
      "COMPLEX_PK": "11110100000033",
      "DONG_NM1": "다",
      "DONG_NM2": "다동",
      "DONG_NM3": "다동",
      "GRND_FLR_CNT": 5
    }
  ],
  "matchCount": 4,
  "page": 1,
  "perPage": 10,
  "totalCount": 157021
}
```

XML 예시는 원문에 없다. XML 구조는 원문 확인 필요.

### 9.2.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | `getDongInfo(DongInfoSearchRequest request)` |
| Request DTO 후보 | `DongInfoSearchRequest`, `OdcloudPageRequest` |
| Response DTO 후보 | `OdcloudPageResponse<DongInfoItem>`, `DongInfoItem` |
| DB 저장 필요 여부 | 단지고유번호 기준 동 목록은 저장/캐시 후보 |
| Redis 캐시 필요 여부 | `complexPk` 단위 캐시 후보 |
| 실패 시 처리 | `complexPk` 조회 결과 없음은 도메인에서 “동정보 없음”으로 처리. 외부 API 401/500은 예외 매핑 |
| 테스트 케이스 | `complexPk` 조건 URL 생성, 여러 `data` item 파싱, 동명 3종 필드 매핑, 지상층수 숫자 파싱, 빈 목록 처리 |

### 9.2.7 ZIP:ON 해석 로직 후보

- 사용자가 상세주소에 “라동”을 입력했다면 `DONG_NM1`, `DONG_NM2`, `DONG_NM3`와 비교한다.
- 동명이 여러 기준에서 다르게 표시될 수 있으므로, 정확히 일치하지 않아도 후보로 보여줄 수 있다.
- `GRND_FLR_CNT`는 건축물 노후도·고층/저층 안내의 보조값으로만 사용한다.
- 이 API는 호실, 전유면적, 소유권, 권리관계를 제공하지 않는다. 호실 단위 위험 분석에는 건축물대장 전유부, 등기부등본, 실거래가 API가 추가로 필요하다.

---

## 9.3 공동주택 단지 식별정보 단지명 이력정보 조회

### 9.3.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getHistInfo |
| Method | GET |
| Path | `/getHistInfo` |
| Full URL | `https://api.odcloud.kr/api/AptIdInfoSvc/v1/getHistInfo` |
| 설명 | 단지고유번호 값을 이용하여 공동주택 단지 식별정보 단지명 이력정보를 제공 |
| 평균 응답시간 | 확인 필요 |
| TPS 제한 | 확인 필요 |
| ZIP:ON 활용 위치 | 과거 단지명과 현재 단지명 매핑, 다른 API 검색어 보정 |

### 9.3.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | ---: | --- | --- | --- |
| page | 페이지 | number | Y | `1` | 페이지 번호 | 공통 페이징 |
| perPage | 페이지당 건수 | number | Y | `10` | 1회 조회 건수 | 공통 페이징 |
| serviceKey | 서비스키 | string | Y | `{SERVICE_KEY}` | 인증키 | 환경변수 |
| complex_pk | 단지고유번호 | string(14) | N | `11110100000033` | 원문 요청표 기준. URL 조건명은 `COMPLEX_PK::EQ` | `complexPk` |

원문상 항목구분은 `0`이지만, 상세기능 설명은 “단지고유번호 값을 이용”한다고 되어 있다. 실사용 필수 처리 여부는 확인 필요하다.

### 9.3.3 요청 예시

```http id="wafb53"
GET https://api.odcloud.kr/api/AptIdInfoSvc/v1/getHistInfo?page=1&perPage=10&cond%5BCOMPLEX_PK%3A%3AEQ%5D=11110100000033&serviceKey={SERVICE_KEY}
```

인코딩 전 의미:

```http id="qk0ch7"
GET https://api.odcloud.kr/api/AptIdInfoSvc/v1/getHistInfo?page=1&perPage=10&cond[COMPLEX_PK::EQ]=11110100000033&serviceKey={SERVICE_KEY}
```

### 9.3.4 응답 필드

공통 wrapper는 `getAptInfo`와 동일하다.

`data[]` item:

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | ---: | --- | --- | --- |
| response.data[].COMPLEX_PK | 단지고유번호 | string(14) | N | `11110100000033` | 단지고유번호 | 문자열 처리 |
| response.data[].NM_CHAN_YEAR | 변경년도 | string(4) | N | `2020` | 단지명 변경년도 | 연도 문자열 |
| response.data[].COMPLEX_EX_NM | 변경전 단지명 | string(100) | N | `동대문상가(라동)` | 변경 전 단지명 | 검색 보정 |
| response.data[].COMPLEX_PR_NM | 변경후 단지명 | string(100) | N | `동대문상가` | 변경 후 단지명 | 현재명 후보 |

### 9.3.5 응답 예시

```json id="xfyxz4"
{
  "currentCount": 1,
  "data": [
    {
      "COMPLEX_EX_NM": "동대문상가(라동)",
      "COMPLEX_PK": "11110100000033",
      "COMPLEX_PR_NM": "동대문상가",
      "NM_CHAN_YEAR": "2020"
    }
  ],
  "matchCount": 1,
  "page": 1,
  "perPage": 10,
  "totalCount": 4764
}
```

XML 예시는 원문에 없다. XML 구조는 원문 확인 필요.

### 9.3.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | `getHistInfo(HistInfoSearchRequest request)` |
| Request DTO 후보 | `HistInfoSearchRequest`, `OdcloudPageRequest` |
| Response DTO 후보 | `OdcloudPageResponse<HistInfoItem>`, `HistInfoItem` |
| DB 저장 필요 여부 | 단지명 이력은 변경 빈도가 낮으므로 저장 후보 |
| Redis 캐시 필요 여부 | `complexPk` 단위 캐시 후보 |
| 실패 시 처리 | 이력 없음은 정상 케이스로 처리. 외부 API 401/500은 예외 매핑 |
| 테스트 케이스 | 변경전/변경후 단지명 파싱, 연도 문자열 처리, 빈 이력 처리, 검색어 보정 로직 테스트 |

### 9.3.7 ZIP:ON 해석 로직 후보

- 사용자가 입력한 단지명이 현재명과 다를 때 이력정보를 이용해 후보 단지를 보정한다.
- 실거래가, 공시가격, K-APT, 건축물대장 데이터의 단지명이 서로 다를 때 매칭 보조 테이블로 쓴다.
- 단지명 변경은 위험 신호로 단정하면 안 된다. “데이터 검색을 위해 과거 명칭도 함께 확인했습니다” 정도로 사용자에게 설명한다.

---

## 10. 코드표 / Enum / 분류값

### 10.1 AptIdInfoSvc 단지종류 코드

| 코드 | 값 | 의미 | ZIP:ON 처리 |
| --- | --- | --- | --- |
| 1 | 아파트 | 공동주택 중 아파트 | 아파트 실거래가/공동주택가격/K-APT 조합 후보 |
| 2 | 연립 | 공동주택 중 연립 | 연립다세대 실거래가 조합 후보 |
| 3 | 다세대 | 공동주택 중 다세대 | 연립다세대 실거래가 조합 후보. 다가구와 혼동하지 않도록 안내 |

### 10.2 XLSX 참조코드 중 ZIP:ON 관련 주요 코드

| 코드그룹 | 코드/값 | 의미 | ZIP:ON 처리 |
| --- | --- | --- | --- |
| 집합건물구분코드 | 1: 일반건축물, 2: 집합건축물 | 일반/집합건물 구분 | 다가구/다세대/오피스텔 판별 보조 |
| 대장종류코드 | 2: 일반건축물대장, 3: 표제부 | 건축물대장 종류 | 건축물대장 API DTO enum 후보 |
| 주요용도코드 | 1000: 단독주택, 1003: 다가구주택, 2000: 공동주택, 3000: 제1종근린생활시설, 4000: 제2종근린생활시설, 14000: 업무시설 등 | 건축물 주요 용도 | 사용자 표현과 공부상 용도 비교 |
| 세부용도코드 | 2001: 아파트, 2002: 연립주택, 2003: 다세대주택, 14202: 오피스텔 등 | 세부 용도 | 물건 유형 판별 핵심 enum 후보 |
| 건물용도분류코드 | 1: 주거용, 2: 상업용, 3: 농수산용, 4: 공업용, 5: 공공용, 6: 문교사회용, 7: 기타 | 건물 용도 대분류 | 목적별 분석 분기 |
| 특수지구분코드 | 1: 일반, 2: 산 | 일반/산번지 구분 | 토지·임야 API 파라미터 보정 |
| 지목코드 | 1: 전, 2: 답, 5: 임야, 8: 대, 14: 도로 등 | 토지 지목 | 토지/임야 위험 문장 생성 |
| 용도지역코드1/2 | 11~17 주거지역, 21~24 상업지역, 31~33 공업지역, 41~44 녹지/개발제한, 61~64 관리지역, 71 농림지역, 81 자연환경보전지역 등 | 용도지역 | 토지·상가·개발 가능성 보조 |
| 도로측면코드 | 12: 맹지 등 | 도로 접면 | 임야·토지 개발 리스크 안내 |
| 공동주택구분코드 | 1: 아파트, 3: 빌라, 5: 다세대 | 공동주택 구분 | AptIdInfoSvc 단지종류와 조합 |
| 상태구분코드 | 1: 영업중, 2: 휴업, 3: 휴업연장, 8: 업무정지 | 중개업소 상태 | 중개사 확인 체크리스트 보조 |
| 중개업자종별코드 | 1: 중개인, 2: 공인중개사, 3: 법인, 4: 중개보조원 | 중개업자 유형 | 중개업소 검증 보조 |

---

## 11. 에러 코드

| 코드 | 메시지 | 의미 | 백엔드 처리 방안 | 사용자 노출 메시지 |
| --- | --- | --- | --- | --- |
| 200 | 성공적으로 수행됨 | 정상 | 성공 처리 | 표시 불필요 |
| 401 | 인증 정보가 정확하지 않음 | 인증키 오류, 서비스키 누락/오류 가능성 | 인증키 오류로 도메인 예외 변환. 사용자 입력 오류로 처리하지 않음. 관리자 확인 필요 | “공공데이터 인증 문제로 조회하지 못했습니다. 잠시 후 다시 시도하거나 관리자에게 문의해주세요.” |
| 500 | API서버에 문제가 발생하였음 | 외부 API 서버 장애 | 재시도 가능 장애로 분류. timeout/retry/circuit breaker 정책 적용 후보. 로그 저장 | “공공데이터 서버 문제로 일시적으로 조회하지 못했습니다. 잠시 후 다시 시도해주세요.” |

원문에는 HTTP status code인지 응답 body의 error code인지 구분이 없다. 실제 실패 응답 구조는 확인 필요하다.

---

## 12. 데이터 저장/캐시 전략

| 데이터 | 추천 처리 | 이유 |
| --- | --- | --- |
| `getAptInfo` 원천 응답 전문 | 선택 저장 | 주소/단지 식별 재현성, 운영 디버깅 목적. 개인정보는 없지만 저장 정책 확인 필요 |
| `getAptInfo` 주요 응답 필드 | DB 저장 또는 Redis 캐시 | 매년 갱신 데이터. `complexPk`, `pnu`, 단지명, 단지종류, 동수, 세대수, 사용승인일은 반복 사용 가능 |
| `getDongInfo` 동 목록 | DB 저장 또는 Redis 캐시 | 단지고유번호 기준으로 변동 빈도가 낮음 |
| `getHistInfo` 단지명 이력 | DB 저장 후보 | 다른 API와 단지명 매칭 시 반복 사용 가능 |
| 단지종류 코드 | DB 저장 또는 enum 상수 | 1, 2, 3 코드표가 명확함 |
| XLSX 참조코드 | DB 저장 후보 | 건축물/토지/용도/중개업 enum 설계에 반복 사용 |
| XLSX 전체 컬럼정의 | 문서/메타 테이블 저장 후보 | 공간정보/CSV 배치 적재 시 스키마 검증에 필요 |
| 에러 응답 | 로그 저장 | 인증키 오류, 외부 API 장애 추적 |
| 조회 결과 없음 | 짧은 TTL 캐시 | 같은 잘못된 주소/단지고유번호 반복 호출 방지 |
| serviceKey | 저장 금지 | 환경변수 또는 Secret Manager로 관리 |
| 사용자 입력 주소 | 선택 저장 | 진단 이력 기능이 있으면 저장. 민감도와 삭제 정책 확인 필요 |

---

## 13. 구현 시 주의사항

| 항목 | 주의사항 |
| --- | --- |
| URL 인코딩 | `cond[COMPLEX_PK::EQ]`, `cond[ADRES::LIKE]`는 URL 인코딩 필요. HTTP client의 query builder 사용 권장 |
| 한글 파라미터 | `ADRES::LIKE=서울` 같은 한글 검색어는 UTF-8 인코딩 필요 |
| 필드명 대소문자 | 원문 요청표는 `complex_pk`, `adres` 소문자. 예시 URL과 응답 JSON은 `COMPLEX_PK`, `ADRES` 대문자. DTO 매핑 시 명시 필요 |
| 숫자형 문자열 | `COMPLEX_PK`, `PNU`, 법정동코드류는 숫자처럼 보여도 문자열 처리 |
| 날짜 포맷 | `USEAPR_DT`는 `yyyyMMdd` 문자열. XLSX 일부 날짜는 `yyyy-MM-dd`, `yyyy/MM/dd`, Excel serial처럼 보이는 값이 혼재하므로 원천별 파서 분리 |
| 응답 배열 | `data`는 배열. 결과 0건일 때 빈 배열 가능성 처리 |
| 페이지 필드 | `matchCount`와 `totalCount` 의미가 원문에 설명되지 않음. 실제 API 검증 필요 |
| XML/JSON 차이 | XML 지원 표기는 있으나 XML 예시는 없음. JSON 우선 구현 후 XML 필요성 확인 |
| 인증 실패 | 401은 사용자 입력 오류가 아니라 운영/인증 설정 문제로 처리 |
| 외부 API 장애 | 500, timeout, network error는 재시도/서킷브레이커 후보 |
| 전송 암호화 표기 | 원문 표는 SSL 없음, URL은 HTTPS. 실제 호출은 HTTPS 사용 |
| no filter 호출 | 조건 없이 호출할 때 전체 목록 반환 여부, 비용, 제한 확인 필요 |
| `perPage` 최대값 | 원문에 1회 요청 최대 건수 없음. 확인 필요 |
| 원천 데이터 갱신 | 데이터 갱신주기 매년. DB 저장 시 갱신 배치 정책 필요 |
| 공공데이터 포털 신청 | 활용신청/서비스키 발급 방식은 원문에 상세 없음. 확인 필요 |
| XLSX 시트 간 참조 | `테이블정의서(전체/변동)`의 비고 셀 일부가 `참조코드`의 코드그룹명을 참조하는 형태로 보임. 자동 파싱 시 원문 확인 필요 |
| XLSX 다중 헤더 | 5~6행의 병합 헤더를 실제 컬럼명으로 복원해야 함 |
| XLSX SHP/CSV 혼동 | SHP 공간정보 컬럼과 CSV 속성정보 컬럼이 한 행에 병렬 배치되어 있음. 별도 스키마로 분리 필요 |
| 개인정보/마스킹 | XLSX 부동산중개업/개발업 샘플에는 마스킹된 대표자/전화번호가 보임. 실제 데이터 저장 시 개인정보 여부 확인 필요 |
| 법적 판정 금지 | 이 API는 계약 안전성을 확정하지 않는다. ZIP:ON에서는 “추가 확인 필요” 문장으로 연결 |

---

## 14. API 조합 가능성

| 조합 대상 API | 조합 목적 | 기대 결과 | 주의사항 |
| --- | --- | --- | --- |
| 주소 API | 사용자 입력 주소 정제 후 본 API의 `ADRES::LIKE` 또는 다른 API 호출키 생성 | 정확한 단지 후보 검색 | 이 API 자체는 주소 정제 기능이 아님 |
| 법정동코드 API | 주소에서 법정동코드, 시군구코드, 지번 분리 | 실거래가/건축물대장/토지 API 호출 기반 | `PNU`에서 일부 정보를 추출할 수 있어도 전용 변환 API 필요 |
| GIS건물통합정보 | 건물 존재, 용도, 위반건축물여부, 사용승인일, 층수 등과 결합 | 물건 정체 판별 정확도 향상 | XLSX 컬럼정의서 기준으로 별도 API/파일 확보 필요 |
| 건축물대장 API | 주용도, 대장구분, 전유부, 위반건축물 여부 확인 | 다가구/다세대/오피스텔 분기 | AptIdInfoSvc는 공동주택 단지 식별 보조일 뿐 대장 원문 아님 |
| 실거래가 API | 유형별 전월세/매매 거래가와 결합 | 전세가율, 월세 적정성, 매매가 비교 | 단지명 불일치 시 `getHistInfo`로 검색어 보정 |
| 공시가격 API | 공동주택가격/개별주택가격과 결합 | 보증금 대비 기준가격 비교 | `COMPLEX_NM1`, `PNU`, 법정동/지번 조합 필요 |
| K-APT 공동주택 정보/관리비 | 단지 정보와 관리비 데이터 결합 | 관리비/단지 규모/공동주택 생활 분석 | K-APT 단지코드와 `complexPk` 직접 매핑 여부 확인 필요 |
| 토지임야정보 | `PNU` 기반 토지 속성 확인 | 지목, 면적, 대장구분 확인 | 공동주택 단지와 필지 관계가 1:1이 아닐 수 있음 |
| 용도지역지구도 API | 용도지역·지구·구역과 결합 | 상가/토지/개발 가능성 보조 | MVP 전월세에서는 우선순위 낮음 |
| 부동산중개업정보 | 중개사무소 등록/상태와 결합 | 계약 상대방·중개사 확인 체크리스트 | 전국 통합 형태와 최신성 확인 필요 |

---

## 15. Codex 작업 지시용 요약

```md id="opbutw"
# Codex 구현 목표

이 문서를 바탕으로 `공동주택 단지 식별정보 조회 서비스(AptIdInfoSvc)` 외부 API 연동 코드를 구현한다.

## 구현 대상

- API Client
- Request DTO
- Response DTO
- Service Layer
- Error Mapping
- Pagination 처리
- JSON 응답 파싱
- XML 응답 지원 여부 확인
- 테스트 코드
- 필요 시 DB 저장 또는 Redis 캐시

## 구현 대상 오퍼레이션

1. `getAptInfo`
   - Path: `/getAptInfo`
   - 주요 조건: `cond[COMPLEX_PK::EQ]`, `cond[ADRES::LIKE]`
   - 주요 응답: `COMPLEX_PK`, `PNU`, `ADRES`, `COMPLEX_NM1`, `COMPLEX_NM2`, `COMPLEX_NM3`, `COMPLEX_GB_CD`, `DONG_CNT`, `UNIT_CNT`, `USEAPR_DT`

2. `getDongInfo`
   - Path: `/getDongInfo`
   - 주요 조건: `cond[COMPLEX_PK::EQ]`
   - 주요 응답: `COMPLEX_PK`, `DONG_NM1`, `DONG_NM2`, `DONG_NM3`, `GRND_FLR_CNT`

3. `getHistInfo`
   - Path: `/getHistInfo`
   - 주요 조건: `cond[COMPLEX_PK::EQ]`
   - 주요 응답: `COMPLEX_PK`, `NM_CHAN_YEAR`, `COMPLEX_EX_NM`, `COMPLEX_PR_NM`

## 공통 구현 방향

- Base URL은 `https://api.odcloud.kr/api/AptIdInfoSvc/v1`로 둔다.
- `serviceKey`는 환경변수 또는 Secret으로 주입한다.
- 실제 인증키를 코드, 테스트, 문서에 하드코딩하지 않는다.
- query parameter는 HTTP client의 query builder로 인코딩한다.
- `cond[COMPLEX_PK::EQ]`와 `cond[ADRES::LIKE]`를 직접 문자열 결합하지 않는다.
- 원문 요청표는 소문자 필드명을 쓰지만, 실제 URL 조건명과 응답 JSON은 대문자다.
- 응답 DTO는 `@JsonProperty` 등으로 대문자 JSON 필드를 명시 매핑한다.
- `COMPLEX_PK`, `PNU`, 법정동코드 계열 값은 숫자처럼 보여도 문자열로 처리한다.
- `USEAPR_DT`는 `yyyyMMdd` 문자열로 받고 도메인 계층에서 날짜 변환한다.
- 공통 응답 wrapper는 `currentCount`, `data`, `matchCount`, `page`, `perPage`, `totalCount`를 모두 보존한다.
- 페이징 반복 기준은 실제 API 검증 전까지 `matchCount`와 `totalCount`를 모두 고려할 수 있게 구현한다.
- 공공데이터 API 실패 응답을 도메인 예외로 변환한다.
- 401은 인증키/설정 오류로 처리한다.
- 500과 timeout은 외부 API 일시 장애로 처리한다.
- 데이터 없음은 예외가 아니라 빈 결과로 처리한다.
- ZIP:ON 도메인 서비스에서는 이 API 결과를 확정 판정이 아니라 물건 식별 보조 정보로 사용한다.
- `COMPLEX_GB_CD`는 enum으로 매핑한다.
  - `1`: APARTMENT
  - `2`: ROW_HOUSE
  - `3`: MULTI_HOUSE
- 이 API만으로 전세 위험도를 계산하지 않는다.
- 건축물대장, GIS건물통합정보, 실거래가, 공시가격 API와 조합하는 서비스 계층을 별도로 둔다.
- XLSX 원문에서 온 코드표/컬럼정의는 별도 reference 문서 또는 DB seed 후보로 분리한다.
```

---

## 16. 확인 필요 목록

| 항목 | 확인이 필요한 이유 |
| --- | --- |
| `250729`의 의미 | 파일명에는 포함되어 있으나 본문 작성/개정일로 명시되어 있지 않음 |
| 서비스 명세 URL 접근 가능 여부 | `api-docs` URL이 실제 OpenAPI/Swagger인지 확인 필요 |
| 개발환경 URL | 원문에는 운영 URL만 있음 |
| 응답 포맷 선택 파라미터 | XML/JSON 지원 표기는 있으나 `_type`, `returnType` 등 파라미터 없음 |
| XML 응답 구조 | XML 예시가 원문에 없음 |
| `page`, `perPage` 최대값 | 원문에 1회 요청 최대 건수 없음 |
| `matchCount`와 `totalCount` 의미 | 조건 검색 시 어떤 값을 페이지 반복 기준으로 삼을지 검증 필요 |
| 조건 없는 호출 동작 | 전체 목록 반환 여부, 비용, 제한 확인 필요 |
| `complex_pk` 실사용 필수 여부 | 원문 항목구분은 선택이나 상세기능 설명상 단지고유번호 기반 조회 |
| 주소 LIKE 검색 정확도 | `ADRES::LIKE=서울`처럼 넓은 검색 시 후보가 많을 수 있음 |
| 조건 연산자 종류 | 원문에는 `EQ`, `LIKE`만 예시로 나옴. 다른 연산자 지원 여부 확인 필요 |
| HTTP status와 body error 구조 | 에러 코드 200/401/500만 있고 실패 응답 body 예시 없음 |
| 서비스키 인코딩 방식 | 공공데이터 서비스키는 인코딩키/디코딩키 이슈가 있을 수 있어 실제 호출 검증 필요 |
| HTTPS/SSL 표기 불일치 | 원문 표에는 전송 레벨 암호화 없음, URL은 HTTPS |
| `COMPLEX_GB_CD`와 XLSX 공동주택구분코드 관계 | AptIdInfoSvc 단지종류 코드와 XLSX 공동주택구분코드가 완전히 동일한 체계인지 확인 필요 |
| `PNU`와 단지고유번호 관계 | `PNU`가 단지 내 대표 필지인지, 복수 필지 처리가 필요한지 확인 필요 |
| K-APT 단지코드 매핑 | `complexPk`와 K-APT 단지코드 직접 매핑 가능 여부 확인 필요 |
| XLSX 파일의 원천 제공 방식 | API인지 파일 다운로드인지, 갱신 위치와 배포 URL 확인 필요 |
| XLSX 일부 수식/비고 셀 | 일부 셀의 계산값/참조가 도구에서 불안정하게 보일 수 있어 원문 엑셀 확인 필요 |
| 개인정보 저장 여부 | 중개업/개발업 데이터 실제 원천에 개인정보 또는 마스킹 정보가 포함될 수 있음 |
| ZIP:ON 최종 위험도 반영 비중 | 이 API는 식별 보조 데이터이므로 위험도 점수에 직접 반영할지 정책 결정 필요 |
