---
title: real-estate-transaction-api-spec
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-26T05:00:07+09:00
purpose: external-api-source-spec
status: active
code_sync_required: false
related_area: external-api, real-estate-transaction, rent-sale
read_when: 
do_not_use_as: 
update_when: 
  - data.go.kr 실거래가 API 원문 요청/응답 필드와 endpoint를 확인할 때
  - 전월세/매매 transaction adapter, DTO, parser, field mapping을 구현하기 전 source spec을 확인할 때
  - 현재 ZIP:ON 구현 완료 명세
  - 현재 매물 목록 제공 근거
  - 등기 권리관계 또는 선순위 임차인 확정 근거
  - 실거래가 공식 API 명세, endpoint, 응답 필드가 바뀌었음을 확인했을 때
---

# 외부 API 명세 - 국토교통부 실거래가 API 4종 및 건축데이터 PK 전환 참고자료

> Codex 입력용 Markdown 문서입니다.
> 원문 기반 구현 명세이며, 원문에서 확정할 수 없는 값은 `확인 필요`로 표시합니다.

## 1. 원본 파일 분석

| 항목 | 내용 |
|---|---|
| 변환 기준 파일 | `붙여넣은 마크다운(1).md`의 변환 지시 기준에 따라 구현용 Markdown으로 재구성 |
| 대상 API 파일 | 아파트 매매, 아파트 전월세, 연립다세대 매매, 연립다세대 전월세 실거래가 PDF 4종 |
| 보조 파일 | 건축데이터 PK전환 규칙 안내 PDF, 시군구코드에 따른 통합분류코드 목록 PDF |
| ZIP:ON 적용 맥락 | ZIP:ON은 현재 매물 탐색이 아니라 과거 지표 분석과 계약 전 위험진단 서비스이며, MVP는 현재 매물 미제공, 지역·유형 과거 지표 분석, 정확 주소 위험진단이다. 실거래가 API는 과거 지표 분석과 정확 주소의 “시세·실거래가 확인” 단계에서 사용된다. |

| 원본 파일명 | 파일 형식 | 문서명 | 문서 버전 | 작성/개정일 | 제공기관 | 서비스명 국문 | 서비스명 영문 | 데이터 갱신주기 | 원문 구조 | 비고 |
|---|---|---|---|---|---|---|---|---|---|---|
| 아파트 매매 실거래가 상세자료기술문서.pdf | PDF | 국토교통부 실거래가 정보 오픈API 활용 가이드 - 아파트 매매 실거래가 상세 자료 | 1.0 | 서비스 시작일/배포일 2024.07.17 | 한국부동산원 / 국토교통부 실거래가 정보 | 아파트 매매 실거래가 상세 자료 | Detailed data on actual apartment sales prices | 일 1회 | 10p. 서비스 개요, 상세기능, 요청/응답, 에러코드, 코드 신구대조표 | XML, REST GET, Service Key |
| 아파트 전월세 실거래가 자료 기술문서.pdf | PDF | 국토교통부 실거래가 정보 오픈API 활용 가이드 - 아파트 전월세 실거래가 자료 | 1.0 | 서비스 시작일/배포일 2024.07.17 | 한국부동산원 / 국토교통부 실거래가 정보 | 아파트 전월세 실거래가 상세 자료 | Apartment jeonse and monthly rent acutal transaction price data | 일 1회 | 7p. 서비스 개요, 상세기능, 요청/응답, 에러코드 | XML, REST GET, Service Key. 영문 `acutal`은 원문 오탈자 가능성이 있으나 원문 유지 |
| 연립다세대 매매 실거래가 자료 기술문서.pdf | PDF | 국토교통부 실거래가 정보 오픈 활용 API 가이드 - 연립다세대 매매 실거래가 자료 | 1.0 | 서비스 시작일/배포일 2024.07.17 | 한국부동산원 / 국토교통부 실거래가 정보 | 연립다세대 매매 실거래가 자료 | Actual transaction price data for townhouse multi-family housing | 일 1회 | 8p. 서비스 개요, 상세기능, 요청/응답, 에러코드, 코드 신구대조표 | 상세기능 목록의 영문명이 `getRTMSDataSvcAptRent`로 보이나 Call Back URL은 `getRTMSDataSvcRHTrade`; 원문 불일치 확인 필요 |
| 연립다세대 전월세 실거래가 자료 기술문서.pdf | PDF | 국토교통부 실거래가 정보 오픈 활용 API 가이드 - 연립다세대 전월세 실거래가 자료 | 1.0 | 서비스 시작일/배포일 2016.02.01 | 한국부동산원 / 국토교통부 실거래가 정보 | 연립다세대 전월세 실거래가 자료 | Multi-household lease actual transaction price data | 일 1회 | 8p. 서비스 개요, 상세기능, 요청/응답, 에러코드, 코드 신구대조표 | XML, REST GET, Service Key |
| 첨부1. 기존 건축데이터 PK전환 규칙 안내.pdf | PDF | 기존 건축데이터 PK전환 규칙 안내 | 확인 필요 | 확인 필요 | 건축HUB 시스템 / 건축데이터 민간개방 시스템 전환 안내 | 건축데이터 PK전환 규칙 | 확인 필요 | 확인 필요 | 5p. 기존 PK 유형, 신규 PK 변환 규칙, 비자치구 예시 | 건축HUB 연동 시 기존 PK와 신규 22자리 PK 매칭에 필요 |
| 첨부2. 시군구코드에 따른 통합분류코드 목록.pdf | PDF | 시군구코드에 따른 통합분류코드 목록 | 확인 필요 | 확인 필요 | 확인 필요 | 통합분류코드 목록 | 확인 필요 | 확인 필요 | 9p. 통합분류코드, 시군구코드, 시군구명, 비자치구 여부 | PK전환 규칙의 통합분류코드 매핑 테이블로 사용 |

## 2. 원본 구조 요약

| 구분 | 원문 위치 | 내용 | 구현 관련성 |
|---|---|---|---|
| 아파트 매매 API 서비스 개요 | 아파트 매매 PDF p.3 | API명, 인증, REST GET, XML, 서비스 URL, WADL URL, 버전, 응답시간, TPS, 갱신주기 | 높음 |
| 아파트 매매 상세기능/요청 | 아파트 매매 PDF p.4 | `getRTMSDataSvcAptTradeDev`, `serviceKey`, `pageNo`, `numOfRows`, `LAWD_CD`, `DEAL_YMD` | 높음 |
| 아파트 매매 응답 | 아파트 매매 PDF p.5~6 | 아파트 매매 item 필드. 주소 코드, 단지명, 전용면적, 거래금액, 계약일, 등기일자, 거래주체 등 | 높음 |
| 아파트 매매 예시/에러/신구대조 | 아파트 매매 PDF p.7~10 | XML 요청/응답 예시, OpenAPI 에러코드, 구 API → 신규 API 필드명 | 높음 |
| 아파트 전월세 API 서비스 개요 | 아파트 전월세 PDF p.3 | API명, 인증, REST GET, XML, 서비스 URL, WADL URL, 버전, 갱신주기 | 높음 |
| 아파트 전월세 상세기능/요청 | 아파트 전월세 PDF p.4 | `getRTMSDataSvcAptRent`, `serviceKey`, `LAWD_CD`, `DEAL_YMD` | 높음 |
| 아파트 전월세 응답 | 아파트 전월세 PDF p.5~6 | 보증금, 월세, 계약기간, 계약구분, 갱신요구권, 종전계약금액, 도로명 코드, 단지 일련번호 | 높음 |
| 연립다세대 매매 API 서비스 개요 | 연립다세대 매매 PDF p.3 | API명, 인증, REST GET, XML, 서비스 URL, WADL URL, 버전, 갱신주기 | 높음 |
| 연립다세대 매매 상세기능/요청 | 연립다세대 매매 PDF p.4 | `serviceKey`, `LAWD_CD`, `DEAL_YMD`, `pageNo`, `numOfRows` | 높음 |
| 연립다세대 매매 응답 | 연립다세대 매매 PDF p.5~6 | `mhouseNm`, `landAr`, `houseType`, 매매금액, 거래주체, 중개사소재지 | 높음 |
| 연립다세대 전월세 API 서비스 개요 | 연립다세대 전월세 PDF p.3 | API명, 인증, REST GET, XML, 서비스 URL, WADL URL, 버전, 갱신주기 | 높음 |
| 연립다세대 전월세 상세기능/요청 | 연립다세대 전월세 PDF p.4 | `LAWD_CD`, `DEAL_YMD`, `serviceKey`, `pageNo`, `numOfRows` | 높음 |
| 연립다세대 전월세 응답 | 연립다세대 전월세 PDF p.5~6 | `houseType`, `mhouseNm`, 보증금, 월세, 계약기간, 갱신요구권, 종전계약금액 | 높음 |
| 공통 에러코드 | 각 API PDF 후반부 | 01, 02, 03, 04, 05, 10, 11, 12, 20, 22, 30, 31, 32 | 높음 |
| 건축데이터 PK전환 | PK전환 PDF p.1~5 | 기존 `시도·시군구코드-일련번호` → 신규 22자리 PK 또는 통합분류코드 기반 조합 | 보통 |
| 통합분류코드 목록 | 통합분류코드 PDF p.1~9 | `통합분류코드`, `시군구코드`, `시군구명`, `비자치구 여부` | 보통 |

## 3. ZIP:ON 적용 판단

### 3.1 적용 가능 영역

| ZIP:ON 기능 영역 | 적용 가능 여부 | 활용 방식 | 중요도 |
|---|---:|---|---|
| 주소 정제 | 불가능 | 이 API들은 주소를 정제하지 않는다. 정제된 주소에서 추출한 `LAWD_CD`가 필요하다. | 필수 선행 |
| 법정동코드 변환 | 보조 | API 요청에 법정동코드 앞 5자리인 `LAWD_CD`가 필요하다. 변환 자체는 별도 주소/법정동코드 API 필요. | 필수 선행 |
| 물건 유형 판별 | 보조 | 이미 판별된 유형에 따라 아파트/연립다세대 API를 선택한다. `houseType`은 연립/다세대 구분 보조값으로 사용 가능. | 필수 |
| 건축물 기본정보 확인 | 보조 | `buildYear`, `floor`, `excluUseAr`, `aptSeq`, `mhouseNm` 정도만 제공한다. 건축물대장 대체 불가. | 중요 |
| 토지·임야 기본정보 확인 | 불가능/보조 | 연립다세대 매매의 `landAr`는 대지권면적 참고값이나 토지·임야정보를 대체하지 않는다. | 선택 |
| 실거래가 확인 | 가능 | 매매/전월세 실거래 금액, 면적, 층, 계약일을 조회한다. | 필수 |
| 공시가격·공시지가 확인 | 불가능 | 별도 공동주택가격, 개별주택가격, 개별공시지가 API 필요. | 필수 조합 |
| 전세 위험도 계산 | 가능 | 전월세 보증금과 매매 실거래가 또는 공시가격을 조합해 전세가율·보증금 위험도를 계산한다. | 필수 |
| 월세 적정성 판단 | 가능 | `deposit`, `monthlyRent`, `excluUseAr`, `floor`, `buildYear`를 주변 유사 거래와 비교한다. | 중요 |
| 매매 위험도 계산 | 가능 | 매매가, 면적, 층, 건축년도, 거래유형을 주변 유사 거래와 비교한다. | 중요 |
| 용도지역·지구·구역 확인 | 불가능 | 별도 용도지역지구도 API 필요. | 선택 |
| 생활 인프라 분석 | 불가능 | 별도 학교, 치안, 교통사고, 생활안전지도 API 필요. | 선택 |
| 상권 분석 | 불가능 | 별도 소상공인 상가정보, 인허가 API 필요. | 선택 |
| 환경·재난 리스크 분석 | 불가능 | 별도 침수, 산사태, 환경공간정보 API 필요. | 선택 |
| 계약 상대방·중개사 확인 | 보조 | 매매 API의 `estateAgentSggNm`, `dealingGbn`은 거래유형·중개사 소재지 참고값이다. 등록 여부 확인은 별도 API 필요. | 선택 |
| 체크리스트 생성 | 가능/보조 | 가격·거래정보 기반으로 “추가 확인 필요” 항목을 생성한다. 등기·선순위 임차인은 별도 자료 요청으로 분리. | 필수 |

### 3.2 적용 판단 요약

이 4개 API는 ZIP:ON MVP의 “시세·실거래가 확인”과 “전세·월세 위험도 계산”에 직접 쓰인다. 단, 주소를 입력하자마자 바로 호출하면 안 되고, 먼저 주소 정제, 법정동코드 추출, 물건 유형 판별이 끝난 뒤 유형별로 호출해야 한다. ZIP:ON의 핵심은 단순 원천 데이터 표시가 아니라 사용자의 목적에 맞게 “보증금이 주변 거래 대비 과도한지”, “전세가율 계산에 필요한 매매 기준이 있는지”, “최근 거래가 충분한지”를 해석하는 것이다. 전월세 API는 보증금·월세 적정성 판단에 직접 쓰이고, 매매 API는 전세보증금 대비 기준가격 추정에 쓰인다. 다만 등기부 권리관계, 근저당, 선순위 임차인 보증금은 이 API만으로 확인할 수 없으므로 체크리스트와 문서 업로드 요청으로 분리해야 한다. ZIP:ON 서비스는 “판단 중심”이며, 최종 결과는 정보 나열이 아니라 다음 행동 안내여야 한다.

## 4. 서비스 기본 정보

### 4.1 공통 기본 정보

| 항목 | 내용 |
|---|---|
| 공통 도메인 | `apis.data.go.kr` |
| 프로토콜 | REST |
| HTTP Method | GET |
| 인증 방식 | Service Key |
| 요청 데이터 형식 | query parameter |
| 응답 데이터 형식 | XML |
| JSON 지원 여부 | 원문상 JSON 체크 없음. 확인 필요 |
| 평균 응답시간 | 500ms |
| TPS 제한 | 30tps |
| 메시지 크기 제한 | 1000 bytes |
| WADL/Swagger/OpenAPI 여부 | WADL URL 제공 |
| 전송 레벨 암호화 | 원문 표에는 SSL 없음으로 표시. 단, 일부 요청 예시는 `https://` 사용. 실제 운영 호출 프로토콜 확인 필요 |
| 비고 | 서비스키는 URL Encode 필요 |

### 4.2 API별 URL

| API | Base URL | Operation Path | Full URL |
|---|---|---|---|
| 아파트 매매 실거래가 상세 자료 | `http://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev` | `/getRTMSDataSvcAptTradeDev` | `http://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev` |
| 아파트 전월세 실거래가 자료 | `http://apis.data.go.kr/1613000/RTMSDataSvcAptRent` | `/getRTMSDataSvcAptRent` | `http://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent` |
| 연립다세대 매매 실거래가 자료 | `http://apis.data.go.kr/1613000/RTMSDataSvcRHTrade` | `/getRTMSDataSvcRHTrade` | `http://apis.data.go.kr/1613000/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade` |
| 연립다세대 전월세 실거래가 자료 | `http://apis.data.go.kr/1613000/RTMSDataSvcRHRent` | `/getRTMSDataSvcRHRent` | `http://apis.data.go.kr/1613000/RTMSDataSvcRHRent/getRTMSDataSvcRHRent` |

## 5. 인증 방식

### 5.1 인증 파라미터

| 파라미터 | 위치 | 필수 | 설명 |
|---|---|---:|---|
| `serviceKey` | query | Y | 공공데이터포털에서 발급받은 인증키. 원문상 URL Encode 필요 |

### 5.2 인증 예시

```http
GET {baseUrl}/{operation}?serviceKey={SERVICE_KEY}
```

실제 인증키는 문서나 코드에 직접 쓰지 말고 환경변수 또는 외부 설정으로 주입한다.

## 6. 공통 요청 규칙

| 파라미터 | 타입/크기 | 필수 | 예시 | 설명 |
|---|---|---:|---|---|
| `serviceKey` | 원문 타입 미기재 / size=100 | Y | `{SERVICE_KEY}` | 공공데이터포털 인증키. URL Encode 필요 |
| `LAWD_CD` | 원문 타입 미기재 / size=5 | Y | `11110` | 법정동코드 10자리 중 앞 5자리. 시군구 단위 지역코드 |
| `DEAL_YMD` | 원문 타입 미기재 / size=6 | Y | `202407` | 계약년월. `yyyyMM` |
| `pageNo` | 원문 타입 미기재 / size=4 | N | `1` | 페이지 번호. 아파트 전월세 문서에서는 요청 표에 미기재되어 있어 지원 여부 확인 필요 |
| `numOfRows` | 원문 타입 미기재 / size=4 | N | `10` | 한 페이지 결과 수. 아파트 전월세 문서에서는 요청 표에 미기재되어 있어 지원 여부 확인 필요 |
| `_type` | 원문 없음 | 확인 필요 | 확인 필요 | 공공데이터포털 일부 API에서 JSON 변환에 쓰이나, 본 문서들에는 `_type`이 명시되어 있지 않음 |

## 7. 페이징 규칙

| 항목 | 정리 |
|---|---|
| 페이징 파라미터 | `pageNo`, `numOfRows` |
| 응답 페이징 필드 | `response.body.numOfRows`, `response.body.pageNo`, `response.body.totalCount` |
| 1회 요청 최대 건수 | 원문 확인 필요. `numOfRows` 크기는 4로 제시됨 |
| `pageNo` 의미 | 페이지 번호 |
| `numOfRows` 의미 | 한 페이지 결과 수 |
| `totalCount` 의미 | 전체 결과 수 |
| 반복 호출 방식 | `totalCount`를 기준으로 전체 페이지 수를 계산하고 `pageNo`를 증가시키며 호출 |
| 주의사항 | 아파트 전월세 API는 요청 메시지 명세에 `pageNo`, `numOfRows`가 보이지 않지만 응답과 샘플에는 페이징 필드가 있다. 실제 요청 지원 여부 확인 필요 |

```text
totalPages = ceil(totalCount / numOfRows)
pageNo = 1부터 totalPages까지 반복 호출
```

## 8. 오퍼레이션 목록

| 번호 | 오퍼레이션명 | 국문명 | 설명 | ZIP:ON 활용 |
|---:|---|---|---|---|
| 1 | `getRTMSDataSvcAptTradeDev` | 아파트 매매 실거래가 상세 자료 | 지역코드와 계약월 기준 아파트 매매 신고 상세자료 조회 | 아파트 매매 기준가격, 전세가율 기준, 매매 위험도 |
| 2 | `getRTMSDataSvcAptRent` | 아파트 전월세 실거래가 자료 | 지역코드와 계약월 기준 아파트 전월세 실거래가 조회 | 아파트 전세·월세 적정성, 보증금 비교 |
| 3 | `getRTMSDataSvcRHTrade` | 연립다세대 매매 실거래가 자료 | 지역코드와 계약월 기준 연립다세대 매매 실거래가 조회 | 빌라·다세대 매매 기준가격, 전세가율 기준 |
| 4 | `getRTMSDataSvcRHRent` | 연립다세대 전월세 실거래가 자료 | 지역코드와 계약월 기준 연립다세대 전월세 실거래가 조회 | 빌라·다세대 전세·월세 적정성, 보증금 비교 |

## 9. 오퍼레이션 상세

---

## 9.1 아파트 매매 실거래가 상세 자료

### 9.1.1 기본 정보

| 항목 | 내용 |
|---|---|
| Operation | `getRTMSDataSvcAptTradeDev` |
| Method | GET |
| Path | `/getRTMSDataSvcAptTradeDev` |
| Full URL | `http://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev` |
| 설명 | 법정동코드 앞 5자리와 계약년월로 해당 지역·기간의 아파트 매매신고 상세자료 조회 |
| 평균 응답시간 | 500ms |
| TPS 제한 | 30tps |
| ZIP:ON 활용 위치 | 아파트 매매가 기준 산정, 전세가율 계산, 주변 유사 매매 거래 비교 |

### 9.1.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
|---|---|---|---:|---|---|---|
| `serviceKey` | 인증키 | 원문 타입 미기재 / size=100 | Y | `{SERVICE_KEY}` | 공공데이터포털에서 발급받은 인증키. URL Encode 필요 | 외부 API 인증 설정 |
| `pageNo` | 페이지번호 | 원문 타입 미기재 / size=4 | N | `1` | 페이지번호 | 페이징 요청 |
| `numOfRows` | 한 페이지 결과 수 | 원문 타입 미기재 / size=4 | N | `10` | 한 페이지 결과 수 | 페이징 크기 |
| `LAWD_CD` | 지역코드 | 원문 타입 미기재 / size=5 | Y | `11110` | 법정동코드 10자리 중 앞 5자리 | 주소 정제 후 추출한 시군구코드 |
| `DEAL_YMD` | 계약월 | 원문 타입 미기재 / size=6 | Y | `202407` | 실거래 자료의 계약년월 6자리 | 조회 대상 계약월 |

### 9.1.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev?serviceKey={SERVICE_KEY}&LAWD_CD=11110&DEAL_YMD=202407&pageNo=1&numOfRows=1
```

### 9.1.4 응답 필드

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
|---|---|---|---:|---|---|---|
| `resultCode` | 결과코드 | 원문 타입 미기재 / size=3 | Y | `000` | 결과코드 | `response.header.resultCode` |
| `resultMsg` | 결과메세지 | 원문 타입 미기재 / size=100 | Y | `OK` | 결과메세지 | `response.header.resultMsg` |
| `numOfRows` | 한 페이지 결과 수 | 원문 타입 미기재 / size=4 | Y | `10` | 한 페이지 결과 수 | `response.body.numOfRows` |
| `pageNo` | 페이지 번호 | 원문 타입 미기재 / size=4 | Y | `1` | 페이지 번호 | `response.body.pageNo` |
| `totalCount` | 전체 결과 수 | 원문 타입 미기재 / size=4 | Y | `40` | 전체 결과 수 | `response.body.totalCount` |
| `sggCd` | 법정동시군구코드 | 원문 타입 미기재 / size=5 | Y | `11110` | 법정동시군구코드 | 코드값. 문자열 유지 |
| `umdCd` | 법정동읍면동코드 | 원문 타입 미기재 / size=5 | Y | `17500` | 법정동읍면동코드 | 원문 표 샘플은 `숭인동`으로 보이나 XML 예시는 `17500`. 표 샘플 오류 가능 |
| `landCd` | 법정동지번코드 | 원문 타입 미기재 / size=1 | N | `1` | 법정동지번코드 | 코드값. 의미 확인 필요 |
| `bonbun` | 법정동본번코드 | 원문 타입 미기재 / size=4 | N | `0202` | 법정동본번코드 | 앞자리 0 보존 |
| `bubun` | 법정동부번코드 | 원문 타입 미기재 / size=4 | N | `0003` | 법정동부번코드 | 앞자리 0 보존 |
| `roadNm` | 도로명 | 원문 타입 미기재 / size=100 | N | `종로66길` | 도로명 |  |
| `roadNmSggCd` | 도로명시군구코드 | 원문 타입 미기재 / size=5 | N | `11110` | 도로명시군구코드 | 코드값 |
| `roadNmCd` | 도로명코드 | 원문 타입 미기재 / size=7 | N | `4100372` | 도로명코드 | 코드값 |
| `roadNmSeq` | 도로명일련번호코드 | 원문 타입 미기재 / size=2 | N | `01` | 도로명일련번호코드 | 앞자리 0 보존 |
| `roadNmbCd` | 도로명지상지하코드 | 원문 타입 미기재 / size=1 | N | `0` | 도로명지상지하코드 | 의미 확인 필요 |
| `roadNmBonbun` | 도로명건물본번호코드 | 원문 타입 미기재 / size=5 | N | `00028` | 도로명건물본번호코드 | 앞자리 0 보존 |
| `roadNmBubun` | 도로명건물부번호코드 | 원문 타입 미기재 / size=5 | N | `00000` | 도로명건물부번호코드 | 앞자리 0 보존 |
| `umdNm` | 법정동 | 원문 타입 미기재 / size=60 | Y | `숭인동` | 법정동 | 원문 표 샘플은 `17500`으로 보이나 XML 예시는 `숭인동`. 표 샘플 오류 가능 |
| `aptNm` | 단지명 | 원문 타입 미기재 / size=100 | Y | `종로중흥S클래스` | 단지명 |  |
| `jibun` | 지번 | 원문 타입 미기재 / size=20 | N | `202-3` | 지번 |  |
| `excluUseAr` | 전용면적 | 원문 타입 미기재 / size=22 | N | `17.811` | 전용면적 | 숫자 변환 가능하나 원천 DTO는 문자열 권장 |
| `dealYear` | 계약년도 | 원문 타입 미기재 / size=4 | Y | `2024` | 계약년도 |  |
| `dealMonth` | 계약월 | 원문 타입 미기재 / size=2 | Y | `7` | 계약월 |  |
| `dealDay` | 계약일 | 원문 타입 미기재 / size=2 | Y | `23` | 계약일 |  |
| `dealAmount` | 거래금액 | 원문 타입 미기재 / size=40 | Y | `12,000` | 거래금액(만원) | 콤마 제거 후 금액 변환 |
| `floor` | 층 | 원문 타입 미기재 / size=10 | N | `10` | 층 | 지하층 가능성 고려 |
| `buildYear` | 건축년도 | 원문 타입 미기재 / size=4 | N | `2013` | 건축년도 | 노후도 계산 보조 |
| `aptSeq` | 단지 일련번호 | 원문 타입 미기재 / size=20 | Y | `11110-2339` | 단지 일련번호 | 단지 식별 후보 |
| `cdealType` | 해제여부 | 원문 타입 미기재 / size=1 | N | 공백 | 해제여부 | 값 체계 확인 필요 |
| `cdealDay` | 해제사유발생일 | 원문 타입 미기재 / size=8 | N | 공백 | 해제사유발생일 | 날짜 포맷 확인 필요 |
| `dealingGbn` | 거래유형 | 원문 타입 미기재 / size=10 | N | `중개거래` | 거래유형(중개 및 직거래 여부) | 거래 신뢰도 참고 |
| `estateAgentSggNm` | 중개사소재지 | 원문 타입 미기재 / size=3000 | N | `서울 종로구` | 중개사소재지(시군구단위) | 사용자에게 참고만 제공 |
| `rgstDate` | 등기일자 | 원문 타입 미기재 / size=8 | N | 공백 | 등기일자 | 소유권·권리분석 대체 불가 |
| `aptDong` | 아파트 동명 | 원문 타입 미기재 / size=400 | N | 공백 | 아파트 동명 |  |
| `slerGbn` | 매도자 | 원문 타입 미기재 / size=100 | N | `개인` | 거래주체정보(개인/법인/공공기관/기타) | 매도자 유형 |
| `buyerGbn` | 매수자 | 원문 타입 미기재 / size=100 | N | `개인` | 거래주체정보(개인/법인/공공기관/기타) | 매수자 유형 |
| `landLeaseholdGbn` | 토지임대부 아파트 여부 | 원문 타입 미기재 / size=1 | N | `N` | 토지임대부 아파트 여부 | 전체 값 체계 확인 필요 |

### 9.1.5 응답 예시

```xml
<response>
  <header>
    <resultCode>000</resultCode>
    <resultMsg>OK</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <aptDong> </aptDong>
        <aptNm>종로중흥S클래스</aptNm>
        <aptSeq>11110-2339</aptSeq>
        <bonbun>0202</bonbun>
        <bubun>0003</bubun>
        <buildYear>2013</buildYear>
        <buyerGbn>개인</buyerGbn>
        <cdealDay> </cdealDay>
        <cdealType> </cdealType>
        <dealAmount>12,000</dealAmount>
        <dealDay>23</dealDay>
        <dealMonth>7</dealMonth>
        <dealYear>2024</dealYear>
        <dealingGbn>중개거래</dealingGbn>
        <estateAgentSggNm>서울 종로구</estateAgentSggNm>
        <excluUseAr>17.811</excluUseAr>
        <floor>10</floor>
        <jibun>202-3</jibun>
        <landCd>1</landCd>
        <landLeaseholdGbn>N</landLeaseholdGbn>
        <rgstDate> </rgstDate>
        <roadNm>종로66길</roadNm>
        <roadNmBonbun>00028</roadNmBonbun>
        <roadNmBubun>00000</roadNmBubun>
        <roadNmCd>4100372</roadNmCd>
        <roadNmSeq>01</roadNmSeq>
        <roadNmSggCd>11110</roadNmSggCd>
        <roadNmbCd>0</roadNmbCd>
        <sggCd>11110</sggCd>
        <slerGbn>개인</slerGbn>
        <umdCd>17500</umdCd>
        <umdNm>숭인동</umdNm>
      </item>
    </items>
    <numOfRows>1</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>40</totalCount>
  </body>
</response>
```

JSON 구조는 원문 확인 필요.

### 9.1.6 구현 메모

| 항목 | 제안 |
|---|---|
| Client 메서드명 | `getApartmentTradeDev` |
| Request DTO 후보 | `AptTradeDevRequest` |
| Response DTO 후보 | `AptTradeDevResponse`, `AptTradeDevItem` |
| DB 저장 필요 여부 | 저장 또는 긴 TTL 캐시. 지역·계약월 단위 반복 조회 가능성이 높고 일 1회 갱신 |
| Redis 캐시 필요 여부 | `LAWD_CD + DEAL_YMD + pageNo + numOfRows` 기준 단기 캐시 권장 |
| 실패 시 처리 | 공공데이터 에러코드 매핑 후 도메인 예외 변환 |
| 테스트 케이스 | 정상 XML 파싱, 빈 items, `dealAmount` 콤마 제거, `bonbun/bubun` 앞자리 0 보존, 페이징 반복 |

### 9.1.7 ZIP:ON 해석 로직 후보

| 입력/응답값 | 해석 방식 |
|---|---|
| `dealAmount`, `excluUseAr` | ㎡당 매매가, 유사 면적대 매매 기준가격 계산 |
| `dealYear`, `dealMonth`, `dealDay` | 최근 거래 여부 판단 |
| `floor`, `buildYear` | 유사 거래 필터링과 노후도 보조 |
| `aptNm`, `aptSeq` | 동일 단지 후보 매칭 |
| `dealingGbn`, `estateAgentSggNm` | 거래유형 참고. 중개사 등록 여부는 별도 데이터 필요 |
| `rgstDate` | 등기일자 참고. 등기부 권리관계 확정 판단에는 사용하지 않음 |

---

## 9.2 아파트 전월세 실거래가 자료

### 9.2.1 기본 정보

| 항목 | 내용 |
|---|---|
| Operation | `getRTMSDataSvcAptRent` |
| Method | GET |
| Path | `/getRTMSDataSvcAptRent` |
| Full URL | `http://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent` |
| 설명 | 법정동코드 앞 5자리와 계약년월로 해당 지역·기간의 아파트 전월세 실거래가 상세자료 조회 |
| 평균 응답시간 | 500ms |
| TPS 제한 | 30tps |
| ZIP:ON 활용 위치 | 아파트 전세·월세 보증금 적정성, 월세 적정성, 전월세 유사 거래 비교 |

### 9.2.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
|---|---|---|---:|---|---|---|
| `serviceKey` | 인증키 | 원문 타입 미기재 / size=100 | Y | `{SERVICE_KEY}` | 공공데이터포털에서 발급받은 인증키. URL Encode 필요 | 외부 API 인증 설정 |
| `LAWD_CD` | 지역코드 | 원문 타입 미기재 / size=5 | Y | `11110` | 법정동코드 10자리 중 앞 5자리 | 주소 정제 후 추출한 시군구코드 |
| `DEAL_YMD` | 계약월 | 원문 타입 미기재 / size=6 | Y | `202407` | 실거래 자료의 계약년월 6자리 | 조회 대상 계약월 |
| `pageNo` | 페이지번호 | 원문 요청 표 미기재 | 확인 필요 | `1` | 응답 예시에 존재하나 요청 명세에는 없음 | 실제 호출 테스트 필요 |
| `numOfRows` | 한 페이지 결과 수 | 원문 요청 표 미기재 | 확인 필요 | `10` | 응답 예시에 존재하나 요청 명세에는 없음 | 실제 호출 테스트 필요 |

### 9.2.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent?serviceKey={SERVICE_KEY}&LAWD_CD=11110&DEAL_YMD=202407
```

페이징 파라미터 지원 여부 확인 후 아래 형태도 테스트한다.

```http
GET http://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent?serviceKey={SERVICE_KEY}&LAWD_CD=11110&DEAL_YMD=202407&pageNo=1&numOfRows=10
```

### 9.2.4 응답 필드

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
|---|---|---|---:|---|---|---|
| `resultCode` | 결과코드 | 원문 타입 미기재 / size=3 | Y | `000` | 결과코드 | `response.header.resultCode` |
| `resultMsg` | 결과메세지 | 원문 타입 미기재 / size=100 | Y | `OK` | 결과메세지 | `response.header.resultMsg` |
| `numOfRows` | 한 페이지 결과 수 | 원문 타입 미기재 / size=4 | Y | `10` | 한 페이지 결과 수 | `response.body.numOfRows` |
| `pageNo` | 페이지 번호 | 원문 타입 미기재 / size=4 | Y | `1` | 페이지 번호 | `response.body.pageNo` |
| `totalCount` | 전체 결과 수 | 원문 타입 미기재 / size=4 | Y | `96` | 전체 결과 수 | `response.body.totalCount` |
| `sggCd` | 지역코드 | 원문 타입 미기재 / size=5 | Y | `11110` | 지역코드 | 코드값 |
| `umdNm` | 법정동 | 원문 타입 미기재 / size=30 | Y | `평창동` | 법정동 |  |
| `aptNm` | 아파트명 | 원문 타입 미기재 / size=100 | Y | `삼성` | 아파트명 |  |
| `jibun` | 지번 | 원문 타입 미기재 / size=20 | N | `596` | 지번 |  |
| `excluUseAr` | 전용면적 | 원문 타입 미기재 / size=22 | N | `59.97` | 전용면적 |  |
| `dealYear` | 계약년도 | 원문 타입 미기재 / size=4 | Y | `2024` | 계약년도 |  |
| `dealMonth` | 계약월 | 원문 타입 미기재 / size=2 | Y | `7` | 계약월 |  |
| `dealDay` | 계약일 | 원문 타입 미기재 / size=2 | Y | `25` | 계약일 |  |
| `deposit` | 보증금액 | 원문 타입 미기재 / size=40 | Y | `29,768` | 보증금액(만원) | 콤마 제거 후 금액 변환 |
| `monthlyRent` | 월세금액 | 원문 타입 미기재 / size=40 | Y | `0` | 월세금액(만원) | 0이면 전세 또는 월세 없음으로 해석 가능하나 계약구분 확인 필요 |
| `floor` | 층 | 원문 타입 미기재 / size=10 | N | `9` | 층 |  |
| `buildYear` | 건축년도 | 원문 타입 미기재 / size=4 | N | `1998` | 건축년도 |  |
| `contractTerm` | 계약기간 | 원문 타입 미기재 / size=12 | N | 공백 | 계약기간 | 신규 추가 항목 |
| `contractType` | 계약구분 | 원문 타입 미기재 / size=4 | N | 공백 | 계약구분 | 신규 추가 항목. 값 체계 확인 필요 |
| `useRRRight` | 갱신요구권사용 | 원문 타입 미기재 / size=4 | N | 공백 | 갱신요구권사용 | 신규 추가 항목. 값 체계 확인 필요 |
| `preDeposit` | 종전계약보증금 | 원문 타입 미기재 / size=40 | N | 공백 | 종전계약보증금 | 신규 추가 항목 |
| `preMonthlyRent` | 종전계약월세 | 원문 타입 미기재 / size=40 | N | `0` | 종전계약월세 | 신규 추가 항목 |
| `roadnm` | 도로명 | 원문 타입 미기재 / size=100 | N | `지봉로5길 7` | 도로명 | 원문 필드명이 소문자 `roadnm` |
| `roadnmsggcd` | 도로명시군구코드 | 원문 타입 미기재 / size=5 | N | `11110` | 도로명시군구코드 | 원문 필드명이 소문자 |
| `roadnmcd` | 도로명코드 | 원문 타입 미기재 / size=7 | N | `4100390` | 도로명코드 | 원문 필드명이 소문자 |
| `roadnmseq` | 도로명일련번호코드 | 원문 타입 미기재 / size=2 | N | `1` | 도로명일련번호코드 | 원문 필드명이 소문자 |
| `roadnmbcd` | 도로명지상지하코드 | 원문 타입 미기재 / size=1 | N | `0` | 도로명지상지하코드 | 원문 필드명이 소문자 |
| `roadnmbonbun` | 도로명건물본번호코드 | 원문 타입 미기재 / size=5 | N | `00007` | 도로명건물본번호코드 | 앞자리 0 보존 |
| `roadnmbubun` | 도로명건물부번호코드 | 원문 타입 미기재 / size=5 | N | `00000` | 도로명건물부번호코드 | 앞자리 0 보존 |
| `aptSeq` | 단지 일련번호 | 원문 타입 미기재 / size=20 | N | `11110-34` | 단지 일련번호 | 동일 단지 매칭 후보 |

### 9.2.5 응답 예시

```xml
<response>
  <header>
    <resultCode>000</resultCode>
    <resultMsg>OK</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <aptNm>두산</aptNm>
        <aptSeq>11110-34</aptSeq>
        <buildYear>1999</buildYear>
        <contractTerm> </contractTerm>
        <contractType> </contractType>
        <dealDay>20</dealDay>
        <dealMonth>7</dealMonth>
        <dealYear>2024</dealYear>
        <deposit>50,000</deposit>
        <excluUseAr>59.95</excluUseAr>
        <floor>3</floor>
        <jibun>232</jibun>
        <monthlyRent>0</monthlyRent>
        <preDeposit> </preDeposit>
        <preMonthlyRent> </preMonthlyRent>
        <roadnm>지봉로5길 7</roadnm>
        <roadnmbcd>0</roadnmbcd>
        <roadnmbonbun>00007</roadnmbonbun>
        <roadnmbubun>00000</roadnmbubun>
        <roadnmcd>4100390</roadnmcd>
        <roadnmseq>1</roadnmseq>
        <roadnmsggcd>11110</roadnmsggcd>
        <sggCd>11110</sggCd>
        <umdNm>창신동</umdNm>
        <useRRRight> </useRRRight>
      </item>
    </items>
    <numOfRows>1</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>159</totalCount>
  </body>
</response>
```

JSON 구조는 원문 확인 필요.

### 9.2.6 구현 메모

| 항목 | 제안 |
|---|---|
| Client 메서드명 | `getApartmentRent` |
| Request DTO 후보 | `AptRentRequest` |
| Response DTO 후보 | `AptRentResponse`, `AptRentItem` |
| DB 저장 필요 여부 | 저장 또는 긴 TTL 캐시. 전세·월세 비교의 핵심 원천 |
| Redis 캐시 필요 여부 | `LAWD_CD + DEAL_YMD` 기준 단기 캐시. 페이징 확인 후 page key 포함 |
| 실패 시 처리 | 공공데이터 에러코드 매핑 후 도메인 예외 변환 |
| 테스트 케이스 | 보증금 콤마 제거, 월세 0 처리, 계약기간 공백 처리, 소문자 도로명 필드 매핑, 페이징 파라미터 지원 여부 테스트 |

### 9.2.7 ZIP:ON 해석 로직 후보

| 입력/응답값 | 해석 방식 |
|---|---|
| `deposit`, `monthlyRent` | 사용자가 입력한 보증금·월세와 주변 유사 거래 비교 |
| `preDeposit`, `preMonthlyRent` | 갱신계약 여부와 종전 금액 비교 보조 |
| `contractType`, `useRRRight` | 신규/갱신 여부 해석 후보. 값 체계 확인 필요 |
| `excluUseAr`, `floor`, `buildYear` | 유사 거래 필터링 |
| `aptSeq`, `aptNm` | 동일 단지 비교 후보 |
| `dealYear`, `dealMonth`, `dealDay` | 최근성 가중치 부여 |

---

## 9.3 연립다세대 매매 실거래가 자료

### 9.3.1 기본 정보

| 항목 | 내용 |
|---|---|
| Operation | `getRTMSDataSvcRHTrade` |
| Method | GET |
| Path | `/getRTMSDataSvcRHTrade` |
| Full URL | `http://apis.data.go.kr/1613000/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade` |
| 설명 | 법정동코드 앞 5자리와 계약년월로 해당 지역·기간의 연립다세대 매매 실거래가 상세자료 조회 |
| 평균 응답시간 | 500ms |
| TPS 제한 | 30tps |
| ZIP:ON 활용 위치 | 다세대·연립 매매 기준가격, 빌라 전세가율 계산, 유사 거래 비교 |
| 원문 주의 | 상세기능 목록의 영문명은 `getRTMSDataSvcAptRent`로 보이나, 서비스 URL과 Call Back URL은 `getRTMSDataSvcRHTrade`이다. 구현은 URL 기준으로 하되 원문 불일치 확인 필요 |

### 9.3.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
|---|---|---|---:|---|---|---|
| `serviceKey` | 인증키 | 원문 타입 미기재 / size=100 | Y | `{SERVICE_KEY}` | 공공데이터포털에서 발급받은 인증키. URL Encode 필요 | 외부 API 인증 설정 |
| `LAWD_CD` | 지역코드 | 원문 타입 미기재 / size=5 | Y | `11110` | 법정동코드 10자리 중 앞 5자리 | 주소 정제 후 추출한 시군구코드 |
| `DEAL_YMD` | 계약월 | 원문 타입 미기재 / size=6 | Y | `202407` | 실거래 자료의 계약년월 6자리 | 조회 대상 계약월 |
| `pageNo` | 페이지번호 | 원문 타입 미기재 / size=4 | N | `1` | 페이지번호 | 페이징 요청 |
| `numOfRows` | 한 페이지 결과 수 | 원문 타입 미기재 / size=4 | N | `10` | 한 페이지 결과 수 | 페이징 크기 |

### 9.3.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade?serviceKey={SERVICE_KEY}&LAWD_CD=11110&DEAL_YMD=202407&pageNo=1&numOfRows=1
```

### 9.3.4 응답 필드

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
|---|---|---|---:|---|---|---|
| `resultCode` | 결과코드 | 원문 타입 미기재 / size=3 | Y | `000` | 결과코드 | `response.header.resultCode` |
| `resultMsg` | 결과메세지 | 원문 타입 미기재 / size=100 | Y | `OK` | 결과메세지 | `response.header.resultMsg` |
| `numOfRows` | 한 페이지 결과 수 | 원문 타입 미기재 / size=4 | Y | `10` | 한 페이지 결과 수 | `response.body.numOfRows` |
| `pageNo` | 페이지 번호 | 원문 타입 미기재 / size=4 | Y | `1` | 페이지 번호 | `response.body.pageNo` |
| `totalCount` | 전체 결과 수 | 원문 타입 미기재 / size=4 | Y | `19` | 전체 결과 수 | `response.body.totalCount` |
| `sggCd` | 지역코드 | 원문 타입 미기재 / size=5 | Y | `11110` | 지역코드 | 코드값 |
| `umdNm` | 법정동 | 원문 타입 미기재 / size=60 | Y | `숭인동` | 법정동 |  |
| `mhouseNm` | 단지명 | 원문 타입 미기재 / size=100 | Y | `현진빌라 동B` | 단지명 | 원문 예시 XML은 파싱상 값이 분리되어 보임. 표 기준으로 복원 |
| `jibun` | 지번 | 원문 타입 미기재 / size=20 | N | `178-84` | 지번 |  |
| `buildYear` | 건축년도 | 원문 타입 미기재 / size=4 | N | `2003` | 건축년도 |  |
| `excluUseAr` | 전용면적 | 원문 타입 미기재 / size=22 | N | `57.21` | 전용면적 |  |
| `landAr` | 대지권면적 | 원문 타입 미기재 / size=22 | N | `29.17` | 대지권면적 | 토지 기본정보 대체 불가 |
| `dealYear` | 계약년도 | 원문 타입 미기재 / size=4 | Y | `2024` | 계약년도 |  |
| `dealMonth` | 계약월 | 원문 타입 미기재 / size=2 | Y | `7` | 계약월 |  |
| `dealDay` | 계약일 | 원문 타입 미기재 / size=2 | Y | `23` | 계약일 |  |
| `dealAmount` | 거래금액 | 원문 타입 미기재 / size=40 | Y | `36,900` | 거래금액(만원) | 콤마 제거 후 금액 변환 |
| `floor` | 층 | 원문 타입 미기재 / size=10 | N | `2` | 층 |  |
| `cdealType` | 해제여부 | 원문 타입 미기재 / size=1 | N | 공백 | 해제여부 | 값 체계 확인 필요 |
| `cdealDay` | 해제사유발생일 | 원문 타입 미기재 / size=8 | N | 공백 | 해제사유발생일 | 날짜 포맷 확인 필요 |
| `dealingGbn` | 거래유형 | 원문 타입 미기재 / size=10 | N | `중개거래` | 거래유형(중개 및 직거래 여부) |  |
| `estateAgentSggNm` | 중개사소재지 | 원문 타입 미기재 / size=3000 | N | `서울 종로구` | 중개사소재지(시군구단위) |  |
| `rgstDate` | 등기일자 | 원문 타입 미기재 / size=8 | N | 공백 | 등기일자 | 등기부 권리관계 대체 불가 |
| `slerGbn` | 매도자 | 원문 타입 미기재 / size=100 | N | `개인` | 거래주체정보(개인/법인/공공기관/기타) |  |
| `buyerGbn` | 매수자 | 원문 타입 미기재 / size=100 | N | `개인` | 거래주체정보(개인/법인/공공기관/기타) |  |
| `houseType` | 주택유형구분 | 원문 타입 미기재 / size=10 | N | `다세대` | 주택유형구분(연립/다세대) | 물건 유형 판별 보조 |

### 9.3.5 응답 예시

원문 파싱 결과에서 일부 태그 값이 태그 밖으로 분리되어 보인다. 아래 예시는 표와 화면상 의미를 기준으로 구현자가 읽기 쉬운 형태로 복원한 것이다.

```xml
<response>
  <header>
    <resultCode>000</resultCode>
    <resultMsg>OK</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <buildYear>2003</buildYear>
        <buyerGbn>개인</buyerGbn>
        <cdealDay> </cdealDay>
        <cdealType> </cdealType>
        <dealAmount>36,900</dealAmount>
        <dealDay>23</dealDay>
        <dealMonth>7</dealMonth>
        <dealYear>2024</dealYear>
        <dealingGbn>중개거래</dealingGbn>
        <estateAgentSggNm>서울 종로구</estateAgentSggNm>
        <excluUseAr>57.21</excluUseAr>
        <floor>2</floor>
        <houseType>다세대</houseType>
        <jibun>178-84</jibun>
        <landAr>29.17</landAr>
        <mhouseNm>현진빌라 동B</mhouseNm>
        <rgstDate> </rgstDate>
        <sggCd>11110</sggCd>
        <slerGbn>개인</slerGbn>
        <umdNm>숭인동</umdNm>
      </item>
    </items>
    <numOfRows>1</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>19</totalCount>
  </body>
</response>
```

JSON 구조는 원문 확인 필요.

### 9.3.6 구현 메모

| 항목 | 제안 |
|---|---|
| Client 메서드명 | `getRowHouseTrade` |
| Request DTO 후보 | `RowHouseTradeRequest` |
| Response DTO 후보 | `RowHouseTradeResponse`, `RowHouseTradeItem` |
| DB 저장 필요 여부 | 저장 또는 긴 TTL 캐시. 다세대·연립 전세 위험도 계산의 매매 기준 데이터 |
| Redis 캐시 필요 여부 | `LAWD_CD + DEAL_YMD + pageNo + numOfRows` 기준 단기 캐시 |
| 실패 시 처리 | 공공데이터 에러코드 매핑 후 도메인 예외 변환 |
| 테스트 케이스 | 원문 오퍼레이션명 불일치 방어, `mhouseNm` XML 파싱, `houseType` 매핑, `landAr` decimal 변환, 거래금액 콤마 제거 |

### 9.3.7 ZIP:ON 해석 로직 후보

| 입력/응답값 | 해석 방식 |
|---|---|
| `dealAmount`, `excluUseAr` | 다세대·연립 유사 매매 기준가격 계산 |
| `houseType` | 연립/다세대 구분 보조. 최종 물건 유형은 건축물대장과 함께 판단 |
| `landAr` | 대지권면적 참고값. 토지권리·대지권 확정 판단 금지 |
| `mhouseNm`, `jibun`, `umdNm` | 주변 유사 거래 필터링 |
| `buildYear`, `floor` | 유사 거래 보정 요소 |
| `rgstDate` | 등기일자 참고. 권리분석 대체 불가 |

---

## 9.4 연립다세대 전월세 실거래가 자료

### 9.4.1 기본 정보

| 항목 | 내용 |
|---|---|
| Operation | `getRTMSDataSvcRHRent` |
| Method | GET |
| Path | `/getRTMSDataSvcRHRent` |
| Full URL | `http://apis.data.go.kr/1613000/RTMSDataSvcRHRent/getRTMSDataSvcRHRent` |
| 설명 | 법정동코드 앞 5자리와 계약년월로 해당 지역·기간의 연립다세대 전월세 실거래가 자료 조회 |
| 평균 응답시간 | 500ms |
| TPS 제한 | 30tps |
| ZIP:ON 활용 위치 | 다세대·연립 전세·월세 보증금 비교, 주변 유사 임대차 거래 비교 |

### 9.4.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
|---|---|---|---:|---|---|---|
| `LAWD_CD` | 지역코드 | 원문 타입 미기재 / size=5 | Y | `11110` | 법정동코드 10자리 중 앞 5자리 | 주소 정제 후 추출한 시군구코드 |
| `DEAL_YMD` | 계약월 | 원문 타입 미기재 / size=6 | Y | `202407` | 실거래 자료의 계약년월 6자리 | 조회 대상 계약월 |
| `serviceKey` | 인증키 | 원문 타입 미기재 / size=100 | Y | `{SERVICE_KEY}` | 공공데이터포털에서 발급받은 인증키. URL Encode 필요 | 외부 API 인증 설정 |
| `pageNo` | 페이지번호 | 원문 타입 미기재 / size=4 | N | `1` | 페이지번호 | 페이징 요청 |
| `numOfRows` | 한 페이지 결과 수 | 원문 타입 미기재 / size=4 | N | `10` | 한 페이지 결과 수 | 페이징 크기 |

### 9.4.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/RTMSDataSvcRHRent/getRTMSDataSvcRHRent?serviceKey={SERVICE_KEY}&LAWD_CD=11110&DEAL_YMD=202407&pageNo=1&numOfRows=1
```

### 9.4.4 응답 필드

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
|---|---|---|---:|---|---|---|
| `resultCode` | 결과코드 | 원문 타입 미기재 / size=3 | Y | `000` | 결과코드 | `response.header.resultCode` |
| `resultMsg` | 결과메세지 | 원문 타입 미기재 / size=100 | Y | `OK` | 결과메세지 | `response.header.resultMsg` |
| `numOfRows` | 한 페이지 결과 수 | 원문 타입 미기재 / size=4 | Y | `10` | 한 페이지 결과 수 | `response.body.numOfRows` |
| `pageNo` | 페이지 번호 | 원문 타입 미기재 / size=4 | Y | `1` | 페이지 번호 | `response.body.pageNo` |
| `totalCount` | 전체 결과 수 | 원문 타입 미기재 / size=4 | Y | `117` | 전체 결과 수 | `response.body.totalCount` |
| `sggCd` | 지역코드 | 원문 타입 미기재 / size=5 | Y | `11110` | 지역코드 | 코드값 |
| `umdNm` | 법정동 | 원문 타입 미기재 / size=30 | Y | `신영동` | 법정동 |  |
| `houseType` | 주택유형 | 원문 타입 미기재 / size=6 | N | `연립` | 주택유형(연립/다세대) | 물건 유형 판별 보조 |
| `mhouseNm` | 연립다세대명 | 원문 타입 미기재 / size=100 | N | `북악더테라스 2단지` | 연립다세대명 | 원문 예시 XML은 파싱상 값이 분리되어 보임 |
| `jibun` | 지번 | 원문 타입 미기재 / size=20 | N | `211-11` | 지번 |  |
| `buildYear` | 건축년도 | 원문 타입 미기재 / size=4 | N | `2019` | 건축년도 |  |
| `excluUseAr` | 전용면적 | 원문 타입 미기재 / size=22 | N | `84.99` | 전용면적 |  |
| `dealYear` | 계약년도 | 원문 타입 미기재 / size=4 | Y | `2024` | 계약년도 |  |
| `dealMonth` | 계약월 | 원문 타입 미기재 / size=2 | Y | `7` | 계약월 |  |
| `dealDay` | 계약일 | 원문 타입 미기재 / size=2 | Y | `10` | 계약일 |  |
| `deposit` | 보증금액 | 원문 타입 미기재 / size=40 | Y | `70,000` | 보증금액(만원) | 콤마 제거 후 금액 변환 |
| `monthlyRent` | 월세금액 | 원문 타입 미기재 / size=40 | Y | `0` | 월세금액(만원) |  |
| `floor` | 층 | 원문 타입 미기재 / size=10 | N | `-1` | 층 | 지하층 가능성 처리 |
| `contractTerm` | 계약기간 | 원문 타입 미기재 / size=12 | N | 공백 | 계약기간 |  |
| `contractType` | 계약구분 | 원문 타입 미기재 / size=4 | N | 공백 | 계약구분 | 값 체계 확인 필요 |
| `useRRRight` | 갱신요구권사용 | 원문 타입 미기재 / size=4 | N | 공백 | 갱신요구권사용 | 값 체계 확인 필요 |
| `preDeposit` | 종전계약보증금 | 원문 타입 미기재 / size=40 | N | 공백 | 종전계약보증금 |  |
| `preMonthlyRent` | 종전계약월세 | 원문 타입 미기재 / size=40 | N | 공백 | 종전계약월세 |  |

### 9.4.5 응답 예시

원문 파싱 결과에서 일부 태그 값이 태그 밖으로 분리되어 보인다. 아래 예시는 표와 화면상 의미를 기준으로 구현자가 읽기 쉬운 형태로 복원한 것이다.

```xml
<response>
  <header>
    <resultCode>000</resultCode>
    <resultMsg>OK</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <buildYear>2019</buildYear>
        <contractTerm/>
        <contractType> </contractType>
        <dealDay>10</dealDay>
        <dealMonth>7</dealMonth>
        <dealYear>2024</dealYear>
        <deposit>70,000</deposit>
        <excluUseAr>84.99</excluUseAr>
        <floor>-1</floor>
        <houseType>연립</houseType>
        <jibun>211-11</jibun>
        <mhouseNm>북악더테라스 2단지</mhouseNm>
        <monthlyRent>0</monthlyRent>
        <preDeposit/>
        <preMonthlyRent/>
        <sggCd>11110</sggCd>
        <umdNm>신영동</umdNm>
        <useRRRight> </useRRRight>
      </item>
    </items>
    <numOfRows>1</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>117</totalCount>
  </body>
</response>
```

JSON 구조는 원문 확인 필요.

### 9.4.6 구현 메모

| 항목 | 제안 |
|---|---|
| Client 메서드명 | `getRowHouseRent` |
| Request DTO 후보 | `RowHouseRentRequest` |
| Response DTO 후보 | `RowHouseRentResponse`, `RowHouseRentItem` |
| DB 저장 필요 여부 | 저장 또는 긴 TTL 캐시. 다세대·연립 전월세 비교의 핵심 원천 |
| Redis 캐시 필요 여부 | `LAWD_CD + DEAL_YMD + pageNo + numOfRows` 기준 단기 캐시 |
| 실패 시 처리 | 공공데이터 에러코드 매핑 후 도메인 예외 변환 |
| 테스트 케이스 | 지하층 `floor=-1`, self-closing tag 파싱, `deposit` 콤마 제거, `houseType` 매핑, 빈 `contractTerm` 처리 |

### 9.4.7 ZIP:ON 해석 로직 후보

| 입력/응답값 | 해석 방식 |
|---|---|
| `deposit`, `monthlyRent` | 사용자가 입력한 빌라 전세·월세 조건과 주변 유사 거래 비교 |
| `houseType` | 연립/다세대 구분 보조. 최종 구분은 건축물대장과 함께 판단 |
| `mhouseNm`, `jibun`, `umdNm` | 주변 유사 거래 필터링 |
| `floor=-1` | 지하층 가능성 안내. 현장 확인 체크리스트에 반영 |
| `contractType`, `useRRRight` | 갱신계약 여부 보조. 값 체계 확인 필요 |
| `preDeposit`, `preMonthlyRent` | 종전계약 대비 증감률 계산 후보 |

## 10. 코드표 / Enum / 분류값

### 10.1 공통 필수 여부 표기

| 원문 값 | 의미 | 구현 처리 |
|---|---|---|
| `1` | 필수 | Request validation 또는 Response required field |
| `0` | 선택 | nullable 허용 |
| `1..n` | 1건 이상 복수 | list min size 1 |
| `0..n` | 0건 이상 복수 | empty list 허용 |

### 10.2 응답 코드

| 코드 | 값 | 의미 | ZIP:ON 처리 |
|---|---|---|---|
| `000` | `OK` | 정상 응답 | 성공 처리 |
| `01` | `Application Error` | 제공기관 서비스 상태 원활하지 않음 | 일시 장애 또는 관리자 확인 |
| `02` | `DB Error` | 제공기관 DB 오류 | 일시 장애 또는 관리자 확인 |
| `03` | `No Data` | 데이터 없음 | 조회 결과 없음 처리. 짧은 TTL 캐시 가능 |
| `04` | `HTTP Error` | 제공기관 HTTP 오류 | 재시도 가능 장애 |
| `05` | `service time out` | 서비스 타임아웃 | 재시도 가능 장애 |
| `10` | 잘못된 요청 파라미터 에러 | `ServiceKey` 누락 | 설정 오류 또는 요청 생성 오류 |
| `11` | 필수 요청 파라미터가 없음 | 필수 파라미터 누락 | 사용자 입력/내부 매핑 오류 |
| `12` | 해당 오픈 API 서비스가 없거나 폐기됨 | URL 오류 또는 폐기 | 관리자 확인 필요 |
| `20` | 서비스 접근 거부 | 활용승인 안 된 API 호출 | 인증/승인 상태 확인 |
| `22` | 서비스 요청 제한 횟수 초과 에러 | 일일 활용건수 초과 | 호출량 제어, 캐시 강화, 운영계정 증설 |
| `30` | 등록되지 않은 서비스키 | 잘못된 서비스키 또는 URL 인코딩 누락 | 인증키 확인 |
| `31` | 기간 만료된 서비스키 | 활용기간 만료 | 서비스키 연장 필요 |
| `32` | 등록되지 않은 도메인명 또는 IP 주소 | 신청 IP와 실제 호출 IP 불일치 | 운영환경 IP/도메인 등록 확인 |

### 10.3 거래 관련 값

| 필드 | 원문상 확인된 값 | 의미 | ZIP:ON 처리 |
|---|---|---|---|
| `dealingGbn` | `중개거래` | 중개 및 직거래 여부 | 표시 가능. 중개업소 등록 여부는 별도 API 필요 |
| `slerGbn` | `개인` | 매도자 거래주체정보 | 개인/법인/공공기관/기타 중 하나로 추정되나 전체 값은 원문 확인 필요 |
| `buyerGbn` | `개인` | 매수자 거래주체정보 | 개인/법인/공공기관/기타 중 하나로 추정되나 전체 값은 원문 확인 필요 |
| `houseType` | `연립`, `다세대` | 주택유형구분 | 연립/다세대 구분 보조 |
| `landLeaseholdGbn` | `N` | 토지임대부 아파트 여부 | `N` 외 값 체계 확인 필요 |
| `contractType` | 공백 | 계약구분 | 값 체계 확인 필요 |
| `useRRRight` | 공백 | 갱신요구권사용 | 값 체계 확인 필요 |
| `cdealType` | 공백 | 해제여부 | 값 체계 확인 필요 |

### 10.4 구 API → 신규 API 필드명 대조

#### 아파트 매매

| 구 API 필드 | 신규 API 필드 | 의미 |
|---|---|---|
| `sggcd` | `sggCd` | 법정동시군구코드 |
| `umdcd` | `umdCd` | 법정동읍면동코드 |
| `landcd` | `landCd` | 법정동지번코드 |
| `bonbun` | `bonbun` | 법정동본번코드 |
| `bubun` | `bubun` | 법정동부번코드 |
| `roadnm` | `roadNm` | 도로명 |
| `roadnmsggcd` | `roadNmSggCd` | 도로명시군구코드 |
| `roadnmcd` | `roadNmCd` | 도로명코드 |
| `roadnmseq` | `roadNmSeq` | 도로명일련번호코드 |
| `roadnmbcd` | `roadNmbCd` | 도로명지상지하코드 |
| `roadnmbonbun` | `roadNmBonbun` | 도로명건물본번호코드 |
| `roadnmbubun` | `roadNmBubun` | 도로명건물부번호코드 |
| `umdnm` | `umdNm` | 법정동 |
| `aptname` | `aptNm` | 단지명 |
| `jibun` | `jibun` | 지번 |
| `excluusear` | `excluUseAr` | 전용면적 |
| `dealyear` | `dealYear` | 계약년도 |
| `dealmonth` | `dealMonth` | 계약월 |
| `dealday` | `dealDay` | 계약일 |
| `dealamount` | `dealAmount` | 거래금액(만원) |
| `floor` | `floor` | 층 |
| `buildyear` | `buildYear` | 건축년도 |
| `aptSeq` | `aptSeq` | 단지 일련번호 |
| `cdealtype` | `cdealType` | 해제여부 |
| `cdealday` | `cdealDay` | 해제사유발생일 |
| `reqgbn` | `dealingGbn` | 거래유형 |
| `rdealerlawdnm` | `estateAgentSggNm` | 중개사소재지 |
| `rgstdate` | `rgstDate` | 등기일자 |
| `aptdong` | `aptDong` | 아파트 동명 |
| `slergbn` | `slerGbn` | 거래주체정보_매도자 |
| `buyergbn` | `buyerGbn` | 거래주체정보_매수자 |
| `hllandgbn` | `landLeaseholdGbn` | 토지임대부 아파트 여부 |

#### 연립다세대 매매

| 구 API 필드 | 신규 API 필드 | 의미 |
|---|---|---|
| `sggcd` | `sggCd` | 지역코드 |
| `umdnm` | `umdNm` | 법정동 |
| `mhname` | `mhouseNm` | 단지명 |
| `jibun` | `jibun` | 지번 |
| `buildyear` | `buildYear` | 건축년도 |
| `excluusear` | `excluUseAr` | 전용면적 |
| `landar` | `landAr` | 대지권면적 |
| `dealyear` | `dealYear` | 계약년도 |
| `dealmonth` | `dealMonth` | 계약월 |
| `dealday` | `dealDay` | 계약일 |
| `dealamount` | `dealAmount` | 거래금액(만원) |
| `floor` | `floor` | 층 |
| `cdealtype` | `cdealType` | 해제여부 |
| `cdealday` | `cdealDay` | 해제사유발생일 |
| `reqgbn` | `dealingGbn` | 거래유형 |
| `rdealerlawdnm` | `estateAgentSggNm` | 중개사소재지 |
| `rgstdate` | `rgstDate` | 등기일자 |
| `slergbn` | `slerGbn` | 거래주체정보_매도자 |
| `buyergbn` | `buyerGbn` | 거래주체정보_매수자 |

#### 연립다세대 전월세

| 구 API 필드 | 신규 API 필드 | 의미 |
|---|---|---|
| `sggcd` | `sggCd` | 지역코드 |
| `umdnm` | `umdNm` | 법정동 |
| `mhname` | `mhouseNm` | 연립다세대명 |
| `jibun` | `jibun` | 지번 |
| `buildyear` | `buildYear` | 건축년도 |
| `excluusear` | `excluUseAr` | 전용면적 |
| `dealyear` | `dealYear` | 계약년도 |
| `dealmonth` | `dealMonth` | 계약월 |
| `dealday` | `dealDay` | 계약일 |
| `deposit` | `deposit` | 보증금액(만원) |
| `monthlyrent` | `monthlyRent` | 월세금액(만원) |
| `floor` | `floor` | 층 |
| `contractterm` | `contractTerm` | 계약기간 |
| `contracttype` | `contractType` | 계약구분 |
| `urrcontractright` | `useRRRight` | 갱신요구권사용 |
| `predeposit` | `preDeposit` | 종전계약보증금 |
| `premonthlyrent` | `preMonthlyRent` | 종전계약월세 |

### 10.5 건축데이터 PK 전환 규칙

| 구분 | 기존 PK 형태 | 신규 PK 또는 변환 형태 | 구현 처리 |
|---|---|---|---|
| 유형 1 | `시도·시군구코드-일련번호`, 일련번호가 22자리 | `일련번호(22자리)` | 기존 PK에서 `시도·시군구코드-` 제거 |
| 유형 2-Ⅰ 건축물대장 | `시도·시군구코드-일련번호`, 일련번호가 22자리 미만 | `통합분류코드(4자리) + 대장구분(1자리) + 일련번호` | 건축물대장 매칭에 사용 |
| 유형 2-Ⅱ 그 외 | `시도·시군구코드-일련번호`, 일련번호가 22자리 미만 | `통합분류코드(4자리) + 일련번호` | 인허가 등 그 외 건축데이터 매칭 후보 |
| 대장구분 | 해당 없음 | `0`: 폐말소대장, `1`: 실대장 | 건축물대장 PK 구성 시 사용 |
| 비자치구 처리 | 시군구코드 기준 | 일반 비자치구는 상위 자치구 통합분류코드 사용. 단, 천안시 동남구·서북구는 비자치구코드 사용 | 통합분류코드 목록 DB화 필요 |

### 10.6 통합분류코드 목록 처리

| 컬럼 | 의미 | 구현 처리 |
|---|---|---|
| `통합분류코드` | 건축HUB 신규 PK 변환에 쓰는 4자리 코드 | DB 코드 테이블 저장 |
| `시군구코드` | 기존 시도·시군구 코드 | 문자열 저장. `EA000` 등 영문 포함 가능 |
| `시군구명` | 행정구역명 | 표시 및 검증 |
| `비자치구 여부` | 해당/미해당 | PK 변환 규칙 분기 |

| 예시 통합분류코드 | 시군구코드 | 시군구명 | 비자치구 여부 | 비고 |
|---|---|---|---|---|
| `1002` | `11110` | 서울특별시 종로구 | 미해당 | 실거래가 예시 `LAWD_CD=11110`과 같은 지역코드 |
| `1014` | `11410` | 서울특별시 서대문구 | 미해당 | PK전환 예시의 서대문구 통합분류코드 |
| `1094` | `41170` | 경기도 안양시 | 해당 | 안양시 만안구/동안구 상위 자치구 통합분류코드 |
| `1168` | `44130` | 충청남도 천안시 | 해당 | 문서상 천안시 동남구/서북구는 예외 처리 필요 |
| `1169` | `44131` | 천안시 천안시 동남구 | 해당 | 천안시 동남구 비자치구코드 |
| `1170` | `44133` | 천안시 천안시 서북구 | 해당 | 천안시 서북구 비자치구코드 |
| `1278` | `EA000` | 인천경제자유구역 | 미해당 | 시군구코드가 숫자가 아니므로 문자열 필수 |

## 11. 에러 코드

| 코드 | 메시지 | 의미 | 백엔드 처리 방안 | 사용자 노출 메시지 |
|---|---|---|---|---|
| `000` | `OK` | 정상 | 성공 처리 | 표시 없음 |
| `01` | `Application Error` | 제공기관 서비스 상태 원활하지 않음 | 외부 API 장애로 매핑. 재시도 가능. 반복 시 관리자 확인 | 공공데이터 서비스가 일시적으로 원활하지 않습니다. 잠시 후 다시 시도해주세요. |
| `02` | `DB Error` | 제공기관 DB 오류 | 외부 API 장애로 매핑. 재시도 가능. 반복 시 관리자 확인 | 공공데이터 조회 중 일시적인 문제가 발생했습니다. |
| `03` | `No Data` | 데이터 없음 | 정상적인 결과 없음으로 처리. 짧은 TTL 캐시 가능 | 해당 조건의 실거래 자료가 없습니다. |
| `04` | `HTTP Error` | HTTP 오류 | 네트워크/제공기관 장애. 재시도 가능 | 공공데이터 연결이 원활하지 않습니다. |
| `05` | `service time out` | 타임아웃 | timeout exception으로 매핑. 재시도 가능 | 조회 시간이 초과되었습니다. 잠시 후 다시 시도해주세요. |
| `10` | 잘못된 요청 파라미터 에러 | ServiceKey 파라미터 누락 | 서버 설정 오류 또는 client 생성 오류. 관리자 확인 | 서비스 설정 오류가 발생했습니다. |
| `11` | 필수 요청 파라미터가 없음 | 필수 파라미터 누락 | 사용자 입력 정제 실패 또는 내부 매핑 오류. 400 또는 내부 검증 오류 | 주소 또는 조회 기준 정보가 부족합니다. |
| `12` | 해당 오픈 API 서비스가 없거나 폐기됨 | URL 오류 또는 폐기 | API endpoint 설정 확인. 관리자 확인 | 현재 외부 데이터 서비스를 사용할 수 없습니다. |
| `20` | 서비스 접근 거부 | 활용승인 안 된 API 호출 | API 활용승인 상태 확인. 관리자 확인 | 현재 외부 데이터 조회 권한이 없습니다. |
| `22` | 서비스 요청 제한 횟수 초과 에러 | 일일 활용건수 초과 | Rate limit 예외. 캐시 사용, 호출 중단, 운영 알림 | 오늘 외부 데이터 조회량이 초과되었습니다. |
| `30` | 등록되지 않은 서비스키 | 잘못된 서비스키 또는 URL 인코딩 누락 | serviceKey 설정/인코딩 확인 | 서비스 인증 정보 오류가 발생했습니다. |
| `31` | 기간 만료된 서비스키 | 활용기간 만료 | 서비스키 연장 필요. 관리자 알림 | 서비스 인증 기간이 만료되었습니다. |
| `32` | 등록되지 않은 도메인명 또는 IP 주소 | 신청 IP와 실제 호출 서버 불일치 | 운영 서버 IP/도메인 등록 확인 | 서비스 호출 환경 설정이 필요합니다. |

## 12. 데이터 저장/캐시 전략

| 데이터 | 추천 처리 | 이유 |
|---|---|---|
| 원천 응답 전문 | 선택 저장 | 장애 재현, 파싱 오류 분석, 원문 감사 목적이 있으면 저장. 저장 시 응답 크기와 중복 관리 필요 |
| 정상화된 실거래 item | DB 저장 | 일 1회 갱신 데이터이며 같은 지역·월 조회가 반복될 수 있음 |
| 지역·월 조회 결과 | Redis 캐시 | 사용자 입력마다 같은 `LAWD_CD + DEAL_YMD` 조회가 반복될 가능성 높음 |
| 코드표/Enum | DB 저장 | 에러코드, 통합분류코드, 필드 매핑은 자주 바뀌지 않음 |
| 에러 응답 | 로그 저장 | 운영 추적, 인증키 만료, 호출량 초과 감지 |
| 조회 결과 없음 | 짧은 TTL 캐시 | 동일 조건 반복 호출 방지. 단, 신규 데이터 반영 가능성을 고려해 TTL 짧게 설정 |
| 금액 문자열 | 원문 문자열 + 정규화 숫자 병행 | 원문은 `12,000`처럼 콤마 포함. 표시용 원문과 계산용 숫자 분리 |
| 코드성 숫자 | 문자열 저장 | `bonbun`, `bubun`, `roadNmBonbun`, `roadnmbonbun` 등 앞자리 0 보존 필요 |
| 월 단위 전체 데이터 | 배치 저장 후보 | MVP에서 특정 지역·월 반복 조회가 많으면 사전 적재 가능 |
| 개인정보/민감정보 | 저장 주의 | 본 API에는 개인 식별정보는 없으나 거래주체 유형, 중개사 소재지 등은 표시 범위 제한 필요 |

## 13. 구현 시 주의사항

| 주의사항 | 설명 |
|---|---|
| 호출 순서 | 주소 정제 → 법정동코드 추출 → 물건 유형 판별 → 유형별 실거래가 API 호출 |
| URL 인코딩 | `serviceKey`는 URL Encode 필요 |
| 프로토콜 불일치 | 서비스 URL은 `http://`로 기재되어 있으나 요청 예시는 `https://`가 섞여 있음. 설정값으로 분리하고 실제 호출 검증 필요 |
| XML 전용 | 원문상 XML만 체크되어 있음. JSON 지원 여부는 확인 필요 |
| `_type` 사용 금지 | 원문에 `_type`이 없으므로 임의로 하드코딩하지 않음 |
| 금액 단위 | `dealAmount`, `deposit`, `monthlyRent`는 만원 단위 |
| 금액 포맷 | `12,000`, `70,000`처럼 콤마 포함 가능 |
| 날짜 포맷 | 요청 `DEAL_YMD`는 `yyyyMM`. 응답은 `dealYear`, `dealMonth`, `dealDay` 분리 |
| 법정동코드 | `LAWD_CD`는 법정동코드 10자리 중 앞 5자리 |
| 본번/부번 | 앞자리 0이 중요하므로 문자열 처리 |
| 층 | `floor=-1`처럼 지하층 가능성 고려 |
| 단건/배열 | XML에서 `items.item`이 단건 또는 배열로 올 가능성에 대비 |
| 빈 태그 | 공백 문자열, self-closing tag, 누락 필드를 모두 처리 |
| 필드명 케이스 차이 | 아파트 매매는 `roadNm`, 아파트 전월세는 `roadnm`처럼 케이스가 다름. 공통 DTO 무리하게 통합 금지 |
| 원문 표 오류 가능성 | 아파트 매매 `umdCd`/`umdNm` 샘플이 표와 XML에서 어긋남 |
| 연립다세대 매매 오퍼레이션명 불일치 | 상세기능 목록 영문명과 Call Back URL이 다름. 구현은 `getRTMSDataSvcRHTrade` 기준, 확인 필요 목록에 포함 |
| 권리관계 확정 금지 | 등기부등본, 근저당, 압류, 신탁등기, 선순위 임차인 보증금은 본 API로 확인 불가 |
| 가격 확정 판정 금지 | 실거래가는 과거 거래 데이터이므로 현재 호가·급매·하자·권리관계와 분리 |
| 통합분류코드 | `EA000` 같은 영문 코드가 있으므로 숫자 타입 금지 |
| PK전환 | 건축HUB 연계 시 기존 PK 유형별 변환 규칙 적용. 단, 본 실거래가 API와 직접 연결되는 필드는 아님 |

## 14. API 조합 가능성

| 조합 대상 API | 조합 목적 | 기대 결과 | 주의사항 |
|---|---|---|---|
| 주소 API | 사용자 입력 주소 정제 | 도로명주소/지번주소 정규화 | 실거래가 API는 주소 문자열을 직접 받지 않음 |
| 법정동코드 API | `LAWD_CD` 확보 | 시군구 단위 실거래가 조회 가능 | 법정동코드 10자리 중 앞 5자리 사용 |
| GIS건물통합정보 | 건물 존재와 공간정보 확인 | 입력 주소가 실제 건물인지 확인 | 실거래가 API보다 먼저 호출 |
| 건축HUB 건축물대장 API | 주용도, 대장구분, 전유부 여부 확인 | 아파트/다세대/다가구/오피스텔 등 물건 유형 판별 | 실거래가 API 선택 기준 |
| 아파트 매매 + 아파트 전월세 | 전세보증금 대비 매매 기준 비교 | 아파트 전세가율, 월세 적정성 | 동일 단지·면적·층 보정 필요 |
| 연립다세대 매매 + 연립다세대 전월세 | 빌라 전세보증금 대비 매매 기준 비교 | 다세대/연립 전세 위험도 | 다가구와 혼동 금지 |
| 공동주택가격 API | 공시가격 기준 비교 | 전세보증보험 가능성·보증금 위험 보조 | 공시가격은 시세와 다름 |
| 개별주택가격 API | 단독/다가구 기준가격 보조 | 다가구 전세 위험도 보조 | 본 API 4종에는 단독/다가구 없음 |
| 등기부등본 업로드/OCR | 권리관계 확인 | 근저당, 압류, 신탁등기, 소유자 확인 | 자동 확정 판정 금지 |
| 선순위 임차인 자료 업로드 | 다가구 선순위 보증금 확인 | 다가구 전세 위험도 정밀화 | API 자동 조회 어려움 |
| 지자체 중개업소 데이터 | 중개업소 등록 여부 확인 | 중개사무소 체크리스트 | 본 API의 `estateAgentSggNm`은 소재지 수준 |

## 15. Codex 작업 지시용 요약

```md
# Codex 구현 목표

이 문서를 바탕으로 ZIP:ON의 국토교통부 실거래가 API 4종 연동 코드를 구현한다.

## 구현 대상 API

1. 아파트 매매 실거래가 상세 자료
   - Operation: getRTMSDataSvcAptTradeDev
   - URL: http://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev

2. 아파트 전월세 실거래가 자료
   - Operation: getRTMSDataSvcAptRent
   - URL: http://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent

3. 연립다세대 매매 실거래가 자료
   - Operation: getRTMSDataSvcRHTrade
   - URL: http://apis.data.go.kr/1613000/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade
   - 주의: 원문 상세기능 목록에는 getRTMSDataSvcAptRent로 보이는 불일치가 있으나 Call Back URL 기준으로 구현한다.

4. 연립다세대 전월세 실거래가 자료
   - Operation: getRTMSDataSvcRHRent
   - URL: http://apis.data.go.kr/1613000/RTMSDataSvcRHRent/getRTMSDataSvcRHRent

## 구현 대상 계층

- API Client
- Request DTO
- Response DTO
- XML Parser
- Service Layer
- Error Mapping
- Pagination 처리
- Redis Cache
- DB 저장 또는 조회 결과 정규화
- 테스트 코드

## DTO 후보

- PublicDataXmlResponse<T>
- PublicDataHeader
- PublicDataBody<T>
- PublicDataPageMeta
- AptTradeDevRequest
- AptTradeDevResponse
- AptTradeDevItem
- AptRentRequest
- AptRentResponse
- AptRentItem
- RowHouseTradeRequest
- RowHouseTradeResponse
- RowHouseTradeItem
- RowHouseRentRequest
- RowHouseRentResponse
- RowHouseRentItem

## 구현 방향

- serviceKey는 환경변수 또는 application-local.yml로 주입한다.
- serviceKey를 코드나 테스트 fixture에 직접 쓰지 않는다.
- 원문에 없는 `_type=json` 같은 파라미터를 하드코딩하지 않는다.
- 응답은 XML 기준으로 파싱한다.
- JSON 지원 여부는 실제 API 문서 또는 호출 테스트 후 결정한다.
- 금액 필드는 원문 문자열과 계산용 숫자를 분리한다.
- `dealAmount`, `deposit`, `monthlyRent`는 만원 단위이다.
- `bonbun`, `bubun`, `roadNmBonbun`, `roadnmbonbun` 등 앞자리 0이 중요한 필드는 문자열로 처리한다.
- `items.item`은 단건과 배열 양쪽 모두 처리한다.
- 빈 태그, 공백 문자열, self-closing tag를 모두 null-safe하게 처리한다.
- 아파트 매매의 `roadNm` 계열과 아파트 전월세의 `roadnm` 계열은 필드명이 다르므로 DTO 매핑을 분리한다.
- 아파트 전월세 API의 `pageNo`, `numOfRows`는 원문 요청 표에 없지만 응답에는 있으므로 실제 호출 테스트 후 지원 여부를 확정한다.
- 공공데이터 에러코드는 도메인 예외로 변환한다.
- `000/OK`는 성공으로 처리한다.
- `03/No Data`는 예외가 아니라 조회 결과 없음으로 처리한다.
- `22`는 요청 제한 초과로 처리하고 캐시 또는 호출량 제어를 적용한다.
- ZIP:ON 도메인 서비스에서는 원천 데이터를 그대로 보여주지 말고 사용자 목적에 맞게 해석한다.
- 전세 목적이면 전월세 실거래가 + 매매 실거래가 + 공시가격 + 건축물대장을 조합한다.
- 등기부 권리관계, 근저당, 신탁등기, 선순위 임차인은 이 API로 확정하지 않는다.
- 해당 정보는 등기부등본 업로드, 임대인/중개사 확인 요청, 체크리스트로 분리한다.

## 테스트 케이스

- 정상 XML 파싱
- resultCode=000 성공 처리
- resultCode=03 조회 결과 없음 처리
- resultCode=30 인증키 오류 처리
- resultCode=22 호출량 초과 처리
- `items.item` 단건 파싱
- `items.item` 배열 파싱
- 빈 `items` 처리
- `dealAmount=12,000` → 12000 변환
- `deposit=70,000` → 70000 변환
- `monthlyRent=0` 처리
- `floor=-1` 처리
- `bonbun=0202`, `bubun=0003` 앞자리 0 보존
- 아파트 매매 `roadNm` 필드 파싱
- 아파트 전월세 `roadnm` 필드 파싱
- 연립다세대 `houseType=연립/다세대` 파싱
- 아파트 매매 `umdCd`/`umdNm` 표 샘플 불일치에 흔들리지 않고 XML 기준 파싱

## ZIP:ON 서비스 흐름 적용

1. 사용자 주소 입력
2. 주소 정제
3. 법정동코드 추출
4. 건축물대장/GIS로 물건 유형 판별
5. 아파트면 아파트 실거래가 API 호출
6. 연립/다세대면 연립다세대 실거래가 API 호출
7. 전세/월세 목적이면 전월세 실거래가와 매매 실거래가를 함께 조회
8. 유사 면적, 층, 건축년도, 최근 거래를 기준으로 비교
9. 전세보증금 또는 월세 조건의 상대적 위험도를 계산
10. 등기부등본, 선순위 임차인, 보증보험 가능 여부는 추가 확인사항으로 분리
```

## 16. 확인 필요 목록

| 항목 | 확인이 필요한 이유 |
|---|---|
| JSON 지원 여부 | 원문에는 XML만 체크되어 있음 |
| `_type` 파라미터 지원 여부 | 원문에 `_type` 명시 없음 |
| 실제 호출 프로토콜 `http`/`https` | 서비스 URL은 `http`, 예시는 일부 `https` |
| 아파트 전월세 API의 `pageNo`, `numOfRows` 요청 지원 여부 | 요청 표에는 없으나 응답에는 페이징 필드가 있음 |
| 연립다세대 매매 상세기능 목록의 영문명 불일치 | 목록에는 `getRTMSDataSvcAptRent`로 보이나 URL은 `getRTMSDataSvcRHTrade` |
| 아파트 매매 `umdCd`/`umdNm` 표 샘플 불일치 | 표 샘플과 XML 예시가 서로 뒤바뀐 것으로 보임 |
| `landCd` 의미 | 법정동지번코드 값 체계가 원문에 상세히 없음 |
| `roadNmbCd` / `roadnmbcd` 값 체계 | 지상/지하 코드 의미 확인 필요 |
| `cdealType` 값 체계 | 해제여부 코드값 확인 필요 |
| `contractType` 값 체계 | 계약구분 코드값 확인 필요 |
| `useRRRight` 값 체계 | 갱신요구권 사용 여부 값 체계 확인 필요 |
| `landLeaseholdGbn` 값 체계 | 샘플 `N` 외 가능한 값 확인 필요 |
| `numOfRows` 최대값 | 원문에는 크기 4만 있고 최대 요청 건수 설명 없음 |
| WADL 실제 접근 가능 여부 | WADL URL은 원문에 있으나 실제 호출 검증 필요 |
| 건축데이터 PK전환과 실거래가 API 직접 연결 여부 | PK전환 문서는 건축HUB 연계 보조자료이며 실거래가 API 응답에는 건축HUB 신규 PK가 없음 |
| 통합분류코드 전체 DB 적재 방식 | PDF 표 기반이므로 원천 XLSX/CSV가 있으면 그 파일을 우선 사용해야 함 |
