---
title: building-hub-openapi-implementation-spec
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-30T05:00:06+09:00
purpose: external-api-source-spec
status: active
code_sync_required: false
related_area: external-api, building-hub, building-register
read_when: 
do_not_use_as: 
update_when: 
  - 건축HUB API 묶음의 원문 서비스, operation, 요청/응답 필드를 확인할 때
  - 건축물대장/건축HUB adapter 구현 전 source spec을 확인할 때
  - 현재 ZIP:ON 구현 완료 명세
  - 등기부, 권리관계, 계약 안전성 확정 근거
  - 원문 건축HUB 활용가이드, endpoint, 요청/응답 필드가 바뀌었음을 확인했을 때
---

# 외부 API 명세 - 건축HUB 공공데이터 API 묶음

이 문서는 첨부된 건축HUB OpenAPI 활용가이드 PDF/DOCX를 Codex가 API Client, DTO, Service, 테스트 코드를 작성할 수 있는 구현용 Markdown 명세로 재구성한 것이다. 원문에 없는 내용은 `확인 필요`로 표시했다. ZIP:ON 적용 판단은 원문 API 필드와 ZIP:ON 서비스 목적을 기준으로 한 구현 관점의 해석이다.

## 전체 서비스 목록

| 번호 | 원본 파일 | 서비스명 국문 | 서비스명 영문 | Base URL | 오퍼레이션 수 |
| --- | --- | --- | --- | --- | --- |
| 1 | OpenAPI활용가이드-_건축HUB_건물에너지_1.0.pdf | 건축HUB 건물에너지정보 서비스 | BldEngyHubService | https://apis.data.go.kr/1613000/BldEngyHubService | 2 |
| 2 | OpenAPI활용가이드-_건축HUB_건축물대장_1.0.pdf | 건축HUB 건축물대장정보 서비스 | BldRgstHubService | https://apis.data.go.kr/1613000/BldRgstHubService | 10 |
| 3 | OpenAPI활용가이드-_건축HUB_건축물유지점검_1.0.docx | 건축HUB 건축물유지점검정보 서비스 | MtnChkHubService | http://apis.data.go.kr/1613000/MtnChkHubService | 2 |
| 4 | OpenAPI활용가이드-_건축HUB_건축인허가_1.0.pdf | 건축HUB 건축인허가정보 서비스 | ArchPmsHubService | http://apis.data.go.kr/1613000/ArchPmsHubService | 17 |
| 5 | OpenAPI활용가이드-_건축HUB_주택인허가_1.0.pdf | 건축HUB 주택인허가정보 서비스 | HsPmsService | http://apis.data.go.kr/1613000/HsPmsHubService | 16 |
| 6 | OpenAPI활용가이드-_건축HUB_폐쇄말소대장_1.0.pdf | 건축HUB 폐쇄말소대장정보 서비스 | ShtRgstHubService | http://apis.data.go.kr/1613000/ShtRgstHubService | 10 |

## 공통 구현 원칙

- 모든 API는 서버 백엔드에서 호출한다. 프론트엔드에서 공공데이터 serviceKey를 직접 노출하지 않는다.

- 주소 입력값은 먼저 주소 API/법정동코드 API로 정규화하고, 그 결과를 건축HUB 조회 조건으로 사용한다.

- 건축HUB 응답은 원천 데이터이며, ZIP:ON에서는 목적별 위험도 문장과 체크리스트로 변환한다.

- `resultCode != 00`, HTTP 오류, timeout, `totalCount=0`을 서로 다른 실패/빈 결과로 처리한다.

- 단일 API로 계약 안전성을 확정하지 않는다. 등기부등본, 선순위 임차인, 실거래가, 공시가격, 현장 확인과 조합한다.



# 외부 API 명세 - 건축HUB 건물에너지정보 서비스

## 1. 원본 파일 분석

| 항목 | 내용 |
| --- | --- |
| 원본 파일명 | OpenAPI활용가이드-_건축HUB_건물에너지_1.0.pdf |
| 파일 형식 | PDF |
| 문서명 | OpenAPI 활용가이드 |
| 문서 버전 | 1.0 |
| 작성/개정일 | 2024.10.01 또는 2024.10 (원문 표기 차이 존재) |
| 제공기관 | 국토교통부 |
| 서비스명 국문 | 건축HUB 건물에너지정보 서비스 |
| 서비스명 영문 | BldEngyHubService |
| 서비스 설명 | 건물에너지 정보 제공 |
| 데이터 갱신주기 | 확인 필요 |
| 원문 구조 | PDF / 페이지 수: 24 / 오퍼레이션 2개 |
| 비고 | 원문 표/샘플 URL/샘플 응답을 구현용 구조로 재배치. OCR·파싱상 줄바꿈으로 끊어진 필드명은 가능한 복원했으며 불확실한 항목은 원문 확인 필요. |

## 2. 원본 구조 요약

| 구분 | 원문 위치 | 내용 | 구현 관련성 |
| --- | --- | --- | --- |
| 서비스 개요 | 초반 서비스 명세 | 서비스명, 인증 방식, REST, XML/JSON 지원 여부, Base URL | 높음 |
| 서비스 Key 발급 및 활용 | 서비스 사용 장 | data.go.kr 활용신청 화면 및 serviceKey 사용 방식 | 보통 |
| 페이징 설명 | 서비스 사용 장 | numOfRows, pageNo, totalCount 기반 반복 호출 | 높음 |
| 오퍼레이션 목록 | 서비스 명세 장 | 2개 오퍼레이션 | 높음 |
| 오퍼레이션별 요청/응답 명세 | 각 오퍼레이션 명세 | 요청 파라미터, 응답 필드, 샘플 URL, XML 응답 예시 | 높음 |
| 에러 코드 | 문서 말미 또는 공공데이터 공통 | resultCode/resultMsg 및 에러코드 처리 | 높음 |

## 3. ZIP:ON 적용 판단

### 3.1 적용 가능 영역

| ZIP:ON 기능 영역 | 적용 가능 여부 | 활용 방식 | 중요도 |
| --- | --- | --- | --- |
| 주소 정제 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 법정동코드 변환 | 보조 | sigunguCd/bjdongCd/bun/ji/useYm로 지번별 에너지 사용량 조회 | 선택 |
| 물건 유형 판별 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 건축물 기본정보 확인 | 보조 | 대지위치·도로명대지위치와 에너지 사용량으로 건물 식별 보조 | 선택 |
| 토지·임야 기본정보 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 실거래가 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 공시가격·공시지가 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 전세 위험도 계산 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 월세 적정성 판단 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 매매 위험도 계산 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 용도지역·지구·구역 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 생활 인프라 분석 | 보조 | 전기·가스 사용량을 거주비/관리비 설명의 참고자료로 사용 가능 | 선택 |
| 상권 분석 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 환경·재난 리스크 분석 | 보조 | 건물 에너지 사용량 참고. 단, 위험도 직접 산정 자료는 아님 | 선택 |
| 계약 상대방·중개사 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 체크리스트 생성 | 보조 | 관리비·에너지비 확인 질문 생성 | 선택 |

### 3.2 적용 판단 요약

건물에너지 API는 전기·가스 사용량을 지번과 사용년월 기준으로 제공한다. ZIP:ON의 전세·월세 핵심 위험도인 보증금 회수 가능성이나 권리관계를 직접 판단하지는 못한다. 다만 관리비·에너지비 확인, 건물 사용량 참고, 생활비 리스크 설명에 보조적으로 사용할 수 있다. 주소별·월별 조회 성격이므로 반복 조회에 Redis 캐시가 적합하고, 장기 분석이 필요할 때만 월별 원천 데이터를 저장한다.

## 4. 서비스 기본 정보

| 항목 | 내용 |
| --- | --- |
| Base URL | https://apis.data.go.kr/1613000/BldEngyHubService |
| 운영환경 URL | https://apis.data.go.kr/1613000/BldEngyHubService |
| 개발환경 URL | https://apis.data.go.kr/1613000/BldEngyHubService |
| 프로토콜 | REST |
| HTTP Method | GET 샘플 기준. 일부 서비스 개요 표에는 REST (GET, POST, PUT, DELETE)로 표기된 문서가 있으나 상세 예시는 GET임. |
| 인증 방식 | serviceKey |
| 요청 데이터 형식 | query parameter |
| 응답 데이터 형식 | XML/JSON |
| 평균 응답시간 | 500 ms |
| TPS 제한 | 30 tps |
| 메시지 크기 제한 | bytes 값 원문 공란 - 확인 필요 |
| WADL/Swagger/OpenAPI 여부 | WADL N/A 또는 서비스 명세 URL 원문 표기. Swagger/OpenAPI 스키마 없음. |
| 비고 | 시군구코드와 법정동코드는 행정표준코드관리시스템의 법정동코드 기준. |

## 5. 인증 방식

### 5.1 인증 파라미터

| 파라미터 | 위치 | 필수 | 설명 |
| --- | --- | --- | --- |
| serviceKey | query | Y | 공공데이터포털에서 발급받은 인증키. URL Encode 필요. 실제 문서/코드에는 `{SERVICE_KEY}`로 치환. |

### 5.2 인증 예시

```http
GET https://apis.data.go.kr/1613000/BldEngyHubService/getBeElctyUsgInfo?serviceKey={SERVICE_KEY}
```

## 6. 공통 요청 규칙

| 파라미터 | 타입 | 필수 | 예시 | 설명 |
| --- | --- | --- | --- | --- |
| serviceKey | VARCHAR/String | Y | {SERVICE_KEY} | 인증키 |
| sigunguCd | VARCHAR(30) 또는 문서별 상이 | Y | 11680 | 시군구코드. 유지점검기관 조회 등 일부 오퍼레이션은 다른 필수 조건을 사용. |
| bjdongCd | VARCHAR(30) 또는 문서별 상이 | Y | 10300 | 법정동코드. 유지점검기관 조회 등 일부 오퍼레이션은 선택/미사용 가능. |
| platGbCd | VARCHAR(30) | N | 0 | 대지구분코드. 0: 대지, 1: 산, 2: 블록. |
| bun | VARCHAR(20) | N | 0012 | 본번. 앞자리 0 보존 필요. |
| ji | VARCHAR(20) | N | 0000 | 부번. 앞자리 0 보존 필요. |
| startDate | VARCHAR(30) | N | YYYYMMDD | 검색시작일. 지원 여부는 오퍼레이션별 원문 기준. |
| endDate | VARCHAR(30) | N | YYYYMMDD | 검색종료일. 지원 여부는 오퍼레이션별 원문 기준. |
| numOfRows | VARCHAR(3) 또는 숫자 | N | 10 | 페이지당 목록 수. 원문상 1회 최대 100건 제한. |
| pageNo | VARCHAR(3) 또는 숫자 | N | 1 | 페이지 번호. 1부터 시작. |
| _type | String | N | json | PDF 일부 예시에 등장. 요청 파라미터 표에는 없는 경우가 많으므로 서비스별 실제 지원 확인 필요. |

## 7. 페이징 규칙

원문 공통 설명 기준으로 1회 요청 가능한 목록 수(`numOfRows`)는 최대 100건이다. 전체 목록이 필요하면 최초 요청의 `totalCount`를 확인한 뒤 `pageNo`를 1부터 전체 페이지 수까지 반복 호출한다.

```text
totalPages = ceil(totalCount / numOfRows)
for pageNo in 1..totalPages:
    call API with same search condition and pageNo
```

구현 시 `totalCount == 0`, `items.item` 단건 객체/배열 차이, 공공데이터 장애 시 재시도 횟수를 반드시 처리한다.

## 8. 오퍼레이션 목록

| 번호 | 오퍼레이션명 | 국문명 | 설명 | ZIP:ON 활용 |
| --- | --- | --- | --- | --- |
| 1 | getBeElctyUsgInfo | 지번별 전기사용량 조회 | 시군구코드, 법정동코드, 번, 지, 사용년월, 리스트수, 페이지번호 등의 기준으로 건물에너지관리시스템을 통해 수집된 전기의 사용량 정보를 제공한다. 단, 단독주택과 200세대 미만 공동주택*은 대상에서 제외하 | 전기·가스 사용량 참고, 관리비/생활비 설명 보조 |
| 2 | getBeGasUsgInfo | 지번별 가스사용량 조회 | 시군구코드, 법정동코드, 번, 지, 사용년월, 리스트수, 페이지번호 등의 기준으로 건물에너지관리시스템을 통해 수집된 가스의 사용량 정보를 제공한다. 단, 단독주택과 200세대 미만 공동주택*은 대상에서 제외하며 , 에너지 사용용도가 산업, 수송, 발전, 열병합, 충전용 등은 사용량 합 산에서 제외한다. 2020.1~ 현재 200세대 미만 제외 | 전기·가스 사용량 참고, 관리비/생활비 설명 보조 |

## 9. 오퍼레이션 상세


---

## 9.1. 지번별 전기사용량 조회

### 9.1.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getBeElctyUsgInfo |
| Method | GET |
| Path | /getBeElctyUsgInfo |
| Full URL | https://apis.data.go.kr/1613000/BldEngyHubService/getBeElctyUsgInfo |
| 설명 | 시군구코드, 법정동코드, 번, 지, 사용년월, 리스트수, 페이지번호 등의 기준으로 건물에너지관리시스템을 통해 수집된 전기의 사용량 정보를 제공한다. 단, 단독주택과 200세대 미만 공동주택*은 대상에서 제외하 |
| 평균 응답시간 | 500 ms |
| TPS 제한 | 30 tps |
| ZIP:ON 활용 위치 | 전기·가스 사용량 참고, 관리비/생활비 설명 보조 |
| 원문 위치 | page 16, 17, 18 |

### 9.1.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(5) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(5) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(4) | Y | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(4) | Y | 0000 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| useYm | 사용년월 | VARCHAR(6) | Y | 202001 | YYYYMM | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.1.3 요청 예시

```http
GET https://apis.data.go.kr/1613000/BldEngyHubService/getBeElctyUsgInfo?bjdongCd=10300&bun=0012&ji=0000&numOfRows=10&pageNo=1&sigunguCd=11680&useYm=202001&_type=json&serviceKey={SERVICE_KEY}
```

### 9.1.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.useYm | useYm | 사용년월 | VARCHAR(6) | Y | 202001 | 사용년월 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12 | 대지위치 |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포로109길 9 (개 포동) | 도로명대지위 치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0000 | 지 |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 116804166040 | 새주소도로코 드 |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 0 | 새주소지상지 하코드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 5 | 새주소본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부번 |  |
| response.body.items.item.useQty | useQty | 사용량 | NUMBER(30,9) | Y | 1065317 | 사용량(KWh) |  |

### 9.1.5 응답 예시

```xml
<response>
<header>
<resultCode>00</resultCode>
<resultMsg>NORMAL SERVICE</resultMsg>
</header>
<body>
<items>
<item>

<rnum>1</rnum>

<useYm>202001</useYm>

<platPlc>서울특별시 강남구 개포동 12</platPlc>

<newPlatPlc>서울특별시 강남구 개포로109길 5 (개포동)</newPlatPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0000</ji>

<naRoadCd>116804166040</naRoadCd>

<naUgrndCd>0</naUgrndCd>

<naMainBun>5</naMainBun>

<naSubBun>0</naSubBun>

<useQty>1065317</useQty>
</item>
</items>
<pageNo>1</pageNo>
<totalCount>1</totalCount>
<numOfRows>10</numOfRows>
</body>
</response>
```


### 9.1.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getBeElctyUsgInfo |
| Request DTO 후보 | BeElctyUsgInfoRequest |
| Response DTO 후보 | BeElctyUsgInfoResponse |
| Item DTO 후보 | BeElctyUsgInfoItem |
| DB 저장 필요 여부 | 실시간 호출 + Redis 캐시 |
| Redis 캐시 필요 여부 | 주소·지번·월별 조건 기준 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.1.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `전기·가스 사용량 참고, 관리비/생활비 설명 보조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.2. 지번별 가스사용량 조회

### 9.2.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getBeGasUsgInfo |
| Method | GET |
| Path | /getBeGasUsgInfo |
| Full URL | https://apis.data.go.kr/1613000/BldEngyHubService/getBeGasUsgInfo |
| 설명 | 시군구코드, 법정동코드, 번, 지, 사용년월, 리스트수, 페이지번호 등의 기준으로 건물에너지관리시스템을 통해 수집된 가스의 사용량 정보를 제공한다. 단, 단독주택과 200세대 미만 공동주택*은 대상에서 제외하며 , 에너지 사용용도가 산업, 수송, 발전, 열병합, 충전용 등은 사용량 합 산에서 제외한다. 2020.1~ 현재 200세대 미만 제외 |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 전기·가스 사용량 참고, 관리비/생활비 설명 보조 |
| 원문 위치 | page 20, 21, 22 |

### 9.2.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(5) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(5) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(4) | Y | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(4) | Y | 0000 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| useYm | 사용년월 | VARCHAR(6) | Y | 202001 | YYYYMM | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.2.3 요청 예시

```http
GET https://apis.data.go.kr/1613000/BldEngyHubService/getBeGasUsgInfo?bjdongCd=10300&bun=0012&ji=0000&numOfRows=10&pageNo=1&sigunguCd=11680&useYm=202001&serviceKey={SERVICE_KEY}
```

### 9.2.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.useYm | useYm | 사용년월 | VARCHAR(6) | Y | 202001 | 사용년월 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12 | 대지위치 |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포로109길 9 (개 포동) | 도로명대지위 치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0000 | 지 |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 116804166040 | 새주소도로코 드 |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 0 | 새주소지상지 하코드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 9 | 새주소본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부번 |  |
| response.body.items.item.useQty | useQty | 사용량 | NUMBER(30,9) | Y | 314093 | 사용량(KWh) |  |

### 9.2.5 응답 예시

```xml
<response>
<header>
<resultCode>00</resultCode>
<resultMsg>NORMAL SERVICE</resultMsg>
</header>
<body>
<items>
<item>

<rnum>1</rnum>

<useYm>202001</useYm>

<platPlc>서울특별시 강남구 개포동 12</platPlc>

<newPlatPlc>서울특별시 강남구 개포로109길 9 (개포동)</newPlatPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0000</ji>

<naRoadCd>116804166040</naRoadCd>

<naUgrndCd>0</naUgrndCd>

<naMainBun>9</naMainBun>

<naSubBun>0</naSubBun>

<useQty>314093</useQty>
</item>
</items>
</body>
<pageNo>1</pageNo>
<totalCount>1</totalCount>
<numOfRows>10</numOfRows>
</response>
```


### 9.2.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getBeGasUsgInfo |
| Request DTO 후보 | BeGasUsgInfoRequest |
| Response DTO 후보 | BeGasUsgInfoResponse |
| Item DTO 후보 | BeGasUsgInfoItem |
| DB 저장 필요 여부 | 실시간 호출 + Redis 캐시 |
| Redis 캐시 필요 여부 | 주소·지번·월별 조건 기준 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.2.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `전기·가스 사용량 참고, 관리비/생활비 설명 보조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


## 10. 코드표 / Enum / 분류값

| 분류 | 코드 | 의미 | ZIP:ON 처리 |
| --- | --- | --- | --- |
| platGbCd | 0 | 대지 | 대지 기준 조회 |
| platGbCd | 1 | 산 | 산번지/임야 가능성 안내 |
| platGbCd | 2 | 블록 | 블록 지번. 주소 파싱 결과 검증 필요 |
| resultCode | 00 | NORMAL SERVICE | 성공 처리 |

## 11. 에러 코드

| 코드 | 메시지 | 의미 | 백엔드 처리 방안 | 사용자 노출 메시지 |
| --- | --- | --- | --- | --- |
| 00 | NORMAL SERVICE | 정상 | 성공 처리 |  |
| 01 | APPLICATION_ERROR | 어플리케이션 에러 | 일시 장애 또는 제공기관 오류로 기록하고 재시도 가능 여부 판단 | 잠시 후 다시 시도해주세요. |
| 02 | DB_ERROR | 데이터베이스 에러 | 제공기관 DB 오류. 재시도 후 지속 시 관리자 확인 | 공공데이터 제공기관 응답이 불안정합니다. |
| 04 | HTTP_ERROR | HTTP 에러 | HTTP 상태코드와 본문을 함께 로깅 | 공공데이터 호출 중 오류가 발생했습니다. |
| 05 | SERVICETIMEOUT_ERROR | 서비스 연결 실패 에러 | 타임아웃 처리, 회로차단/재시도 정책 적용 | 공공데이터 응답이 지연되고 있습니다. |
| 10 | INVALID_REQUEST_PARAMETER_ERROR | 잘못된 요청 파라미터 에러 | 사용자 입력 또는 주소 파싱 결과 검증 | 입력한 주소 정보를 다시 확인해주세요. |
| 11 | NO_MANDATORY_REQUEST_PARAMETERS_ERROR | 필수 요청 파라미터 없음 | 백엔드 요청 DTO 검증 실패로 처리 | 필수 조회 조건이 부족합니다. |
| 12 | NO_OPENAPI_SERVICE_ERROR | 해당 OpenAPI 서비스가 없거나 폐기됨 | 엔드포인트/서비스명 변경 여부 확인 | 현재 해당 공공데이터 서비스를 사용할 수 없습니다. |
| 20 | SERVICE_ACCESS_DENIED_ERROR | 서비스 접근거부 | 서비스키 권한/활용신청 상태 점검 | 공공데이터 인증 설정 확인이 필요합니다. |
| 21 | TEMPORARILY_DISABLE_THE_SERVICEKEY_ERROR | 일시적으로 사용할 수 없는 서비스키 | 키 상태 확인, 다른 키 전환 가능성 검토 | 공공데이터 인증키가 일시적으로 사용할 수 없습니다. |
| 22 | LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR | 서비스 요청 제한 횟수 초과 | 쿼터 초과. 캐시/백오프/운영 알림 | 공공데이터 일일 요청 한도를 초과했습니다. |
| 30 | SERVICE_KEY_IS_NOT_REGISTERED_ERROR | 등록되지 않은 서비스키 | 환경변수/URL 인코딩/활용신청 확인 | 공공데이터 인증키 설정 확인이 필요합니다. |
| 31 | DEADLINE_HAS_EXPIRED_ERROR | 기한 만료된 서비스키 | 서비스키 재발급 또는 활용기간 연장 | 공공데이터 인증키가 만료되었습니다. |
| 99 | UNKNOWN_ERROR | 기타 에러 | 원문 응답 전문 저장 후 관리자 확인 | 공공데이터 조회 중 알 수 없는 오류가 발생했습니다. |

## 12. 데이터 저장/캐시 전략

| 데이터 | 추천 처리 | 이유 |
| --- | --- | --- |
| 원천 응답 전문 | 선택 저장 | 재현성·디버깅·감사 목적이 있을 때만 저장. 저장 시 요청 파라미터와 resultCode 포함. |
| 주요 응답 필드 | DB 저장 또는 긴 TTL 캐시 | 건축물/인허가/폐쇄말소 정보는 자주 변하지 않으므로 반복 조회 비용을 줄일 수 있음. |
| 주소별 조회 결과 | Redis 단기 캐시 | 사용자가 같은 매물을 반복 진단할 가능성이 높음. |
| 코드표 | DB 또는 enum 상수 | platGbCd, resultCode, 점검기관구분 등은 코드 해석에 반복 사용. |
| 에러 응답 | 로그 저장 | 운영 추적, 키 만료, 파라미터 오류, 제공기관 장애 구분. |
| 조회 결과 없음 | 짧은 TTL 캐시 | 없는 주소/조건 반복 호출 방지. 단, 데이터 갱신 가능성을 고려해 짧게 유지. |

## 13. 구현 시 주의사항

- URL 파라미터에 한글이 포함될 수 있으면 UTF-8 URL 인코딩한다.

- `serviceKey`는 인코딩된 키/디코딩된 키 처리 방식이 공공데이터포털에서 혼동되기 쉬우므로 실제 호출 테스트를 분리한다.

- `bun`, `ji`, `sigunguCd`, `bjdongCd`, PK류는 숫자가 아니라 문자열로 처리한다.

- `items.item`은 XML/JSON 변환 시 단건 객체 또는 배열로 달라질 수 있으므로 커스텀 deserializer 또는 리스트 정규화 로직을 둔다.

- 원문 표의 `필/옵`, `1/0`, `1..n/0..n` 표기가 문서별로 다르므로 내부 DTO에서는 `required`를 명시적으로 통일한다.

- 일부 문서의 서비스 개요는 REST (GET, POST, PUT, DELETE)로 표기되지만 상세 요청 예시는 GET이다. 구현은 GET 기준으로 시작하고 필요 시 원문/포털 확인.

- `_type=json`은 일부 예시에 등장하지만 요청 필드 표에 없는 경우가 많다. JSON 사용 전 실제 응답 구조를 테스트해야 한다.

- 공공데이터 장애, 타임아웃, 일일 트래픽 제한, 키 만료를 구분해 사용자 메시지와 운영 알림을 분리한다.


## 14. API 조합 가능성

| 조합 대상 API | 조합 목적 | 기대 결과 | 주의사항 |
| --- | --- | --- | --- |
| 주소 API/법정동코드 API | 도로명·지번 정규화 후 sigunguCd/bjdongCd/bun/ji 생성 | 정확한 건축HUB 조회 조건 확보 | 주소 후보가 여러 개면 사용자 선택 필요 |
| GIS건물통합정보 | 좌표/건물 존재 확인과 건축물대장 속성 대조 | 건물 단위 식별 정확도 향상 | 건물군/동/호 매칭 모호성 처리 필요 |
| 실거래가 API 묶음 | 유형별 매매/전월세 실거래 비교 | 전세가율·월세 적정성·매매 가격 위험도 산정 | 유형 판별 후 API 선택 필요 |
| 공동주택가격/개별주택가격/공시지가 API | 공시가격 기반 보증금·가격 리스크 참고 | 보증보험/가격 위험도 설명 보조 | 공시가격은 현재 시세가 아님 |
| 등기부등본 업로드/OCR | 소유자·근저당·신탁·압류 등 권리관계 확인 | 계약 전 핵심 위험 보강 | 공공데이터 API만으로 확정 불가 |
| 중개업소/사업자/인허가 데이터 | 계약 상대방·중개사·영업 가능성 보조 확인 | 체크리스트 고도화 | 개별 계약의 법적 판단으로 단정 금지 |


# 외부 API 명세 - 건축HUB 건축물대장정보 서비스

## 1. 원본 파일 분석

| 항목 | 내용 |
| --- | --- |
| 원본 파일명 | OpenAPI활용가이드-_건축HUB_건축물대장_1.0.pdf |
| 파일 형식 | PDF |
| 문서명 | OpenAPI 활용가이드 |
| 문서 버전 | 1.0 |
| 작성/개정일 | 2024.10.01 또는 2024.10 (원문 표기 차이 존재) |
| 제공기관 | 국토교통부 |
| 서비스명 국문 | 건축HUB 건축물대장정보 서비스 |
| 서비스명 영문 | BldRgstHubService |
| 서비스 설명 | 건축물대장 정보 제공 |
| 데이터 갱신주기 | 확인 필요 |
| 원문 구조 | PDF / 페이지 수: 77 / 오퍼레이션 10개 |
| 비고 | 원문 표/샘플 URL/샘플 응답을 구현용 구조로 재배치. OCR·파싱상 줄바꿈으로 끊어진 필드명은 가능한 복원했으며 불확실한 항목은 원문 확인 필요. |

## 2. 원본 구조 요약

| 구분 | 원문 위치 | 내용 | 구현 관련성 |
| --- | --- | --- | --- |
| 서비스 개요 | 초반 서비스 명세 | 서비스명, 인증 방식, REST, XML/JSON 지원 여부, Base URL | 높음 |
| 서비스 Key 발급 및 활용 | 서비스 사용 장 | data.go.kr 활용신청 화면 및 serviceKey 사용 방식 | 보통 |
| 페이징 설명 | 서비스 사용 장 | numOfRows, pageNo, totalCount 기반 반복 호출 | 높음 |
| 오퍼레이션 목록 | 서비스 명세 장 | 10개 오퍼레이션 | 높음 |
| 오퍼레이션별 요청/응답 명세 | 각 오퍼레이션 명세 | 요청 파라미터, 응답 필드, 샘플 URL, XML 응답 예시 | 높음 |
| 에러 코드 | 문서 말미 또는 공공데이터 공통 | resultCode/resultMsg 및 에러코드 처리 | 높음 |

## 3. ZIP:ON 적용 판단

### 3.1 적용 가능 영역

| ZIP:ON 기능 영역 | 적용 가능 여부 | 활용 방식 | 중요도 |
| --- | --- | --- | --- |
| 주소 정제 | 보조 | 정제된 주소·지번을 검증하고 대지위치/도로명대지위치를 확인 | 중요 |
| 법정동코드 변환 | 보조 | sigunguCd, bjdongCd, bun, ji 기반으로 조회 검증 | 필수 |
| 물건 유형 판별 | 가능 | 대장구분/대장종류/주용도/전유부/호별·전유공용면적 정보로 아파트·다세대·다가구·오피스텔 등 분기 | 필수 |
| 건축물 기본정보 확인 | 가능 | 표제부/총괄표제부/층별개요/전유부/오수정화시설/지역지구구역 확인 | 필수 |
| 토지·임야 기본정보 확인 | 보조 | 건물의 대지면적·지목성 정보 일부 확인. 토지 전용 판단은 별도 토지 API 필요 | 선택 |
| 실거래가 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 공시가격·공시지가 확인 | 가능 | 주택가격 조회를 보증금 위험도 참고값으로 사용 | 중요 |
| 전세 위험도 계산 | 보조 | 유형·세대수·가구수·주택가격·전유부 여부를 위험도 입력값으로 사용 | 중요 |
| 월세 적정성 판단 | 보조 | 물건 유형/면적/용도 확인 후 전월세 실거래가 API와 조합 | 중요 |
| 매매 위험도 계산 | 보조 | 면적·용도·사용승인일·주차·지역지구구역을 매매 리스크 설명에 사용 | 중요 |
| 용도지역·지구·구역 확인 | 가능 | 지역지구구역 조회로 jiyuk/jigu/guyuk 또는 jijigu 정보 확인 | 중요 |
| 생활 인프라 분석 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 상권 분석 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 환경·재난 리스크 분석 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 계약 상대방·중개사 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 체크리스트 생성 | 가능 | 다가구/집합/용도/전유부/주택가격 결과에 따라 등기부·선순위·보증보험 확인 항목 생성 | 필수 |

### 3.2 적용 판단 요약

ZIP:ON에서 가장 직접적으로 쓰이는 코어 API다. 주소 정제 이후 sigunguCd, bjdongCd, platGbCd, bun, ji로 건축물대장을 조회하고, 대장구분·대장종류·주용도·전유부·층별·주택가격·지역지구구역 정보를 조합해 물건 정체를 판별한다. 원문 응답은 사용자에게 그대로 노출하기보다 “다가구 가능성”, “집합건물 여부”, “전유부 확인 필요” 같은 해석 문장으로 변환해야 한다. 실시간 단건 조회가 기본이지만 같은 주소 반복 조회가 많으므로 Redis 단기 캐시와 주요 필드 DB 저장을 병행할 수 있다. 전세/월세 위험도 계산의 직접 가격 근거는 실거래가·공시가격 API와 조합해야 하며, 등기부·선순위 임차인 정보는 이 API만으로 확정할 수 없다.

## 4. 서비스 기본 정보

| 항목 | 내용 |
| --- | --- |
| Base URL | https://apis.data.go.kr/1613000/BldRgstHubService |
| 운영환경 URL | https://apis.data.go.kr/1613000/BldRgstHubService |
| 개발환경 URL | https://apis.data.go.kr/1613000/BldRgstHubService |
| 프로토콜 | REST |
| HTTP Method | GET 샘플 기준. 일부 서비스 개요 표에는 REST (GET, POST, PUT, DELETE)로 표기된 문서가 있으나 상세 예시는 GET임. |
| 인증 방식 | serviceKey |
| 요청 데이터 형식 | query parameter |
| 응답 데이터 형식 | XML/JSON |
| 평균 응답시간 | 500 ms |
| TPS 제한 | 30 tps |
| 메시지 크기 제한 | bytes 값 원문 공란 - 확인 필요 |
| WADL/Swagger/OpenAPI 여부 | WADL N/A 또는 서비스 명세 URL 원문 표기. Swagger/OpenAPI 스키마 없음. |
| 비고 | 시군구코드와 법정동코드는 행정표준코드관리시스템의 법정동코드 기준. |

## 5. 인증 방식

### 5.1 인증 파라미터

| 파라미터 | 위치 | 필수 | 설명 |
| --- | --- | --- | --- |
| serviceKey | query | Y | 공공데이터포털에서 발급받은 인증키. URL Encode 필요. 실제 문서/코드에는 `{SERVICE_KEY}`로 치환. |

### 5.2 인증 예시

```http
GET https://apis.data.go.kr/1613000/BldRgstHubService/getBrBasisOulnInfo?serviceKey={SERVICE_KEY}
```

## 6. 공통 요청 규칙

| 파라미터 | 타입 | 필수 | 예시 | 설명 |
| --- | --- | --- | --- | --- |
| serviceKey | VARCHAR/String | Y | {SERVICE_KEY} | 인증키 |
| sigunguCd | VARCHAR(30) 또는 문서별 상이 | Y | 11680 | 시군구코드. 유지점검기관 조회 등 일부 오퍼레이션은 다른 필수 조건을 사용. |
| bjdongCd | VARCHAR(30) 또는 문서별 상이 | Y | 10300 | 법정동코드. 유지점검기관 조회 등 일부 오퍼레이션은 선택/미사용 가능. |
| platGbCd | VARCHAR(30) | N | 0 | 대지구분코드. 0: 대지, 1: 산, 2: 블록. |
| bun | VARCHAR(20) | N | 0012 | 본번. 앞자리 0 보존 필요. |
| ji | VARCHAR(20) | N | 0000 | 부번. 앞자리 0 보존 필요. |
| startDate | VARCHAR(30) | N | YYYYMMDD | 검색시작일. 지원 여부는 오퍼레이션별 원문 기준. |
| endDate | VARCHAR(30) | N | YYYYMMDD | 검색종료일. 지원 여부는 오퍼레이션별 원문 기준. |
| numOfRows | VARCHAR(3) 또는 숫자 | N | 10 | 페이지당 목록 수. 원문상 1회 최대 100건 제한. |
| pageNo | VARCHAR(3) 또는 숫자 | N | 1 | 페이지 번호. 1부터 시작. |
| _type | String | N | json | PDF 일부 예시에 등장. 요청 파라미터 표에는 없는 경우가 많으므로 서비스별 실제 지원 확인 필요. |

## 7. 페이징 규칙

원문 공통 설명 기준으로 1회 요청 가능한 목록 수(`numOfRows`)는 최대 100건이다. 전체 목록이 필요하면 최초 요청의 `totalCount`를 확인한 뒤 `pageNo`를 1부터 전체 페이지 수까지 반복 호출한다.

```text
totalPages = ceil(totalCount / numOfRows)
for pageNo in 1..totalPages:
    call API with same search condition and pageNo
```

구현 시 `totalCount == 0`, `items.item` 단건 객체/배열 차이, 공공데이터 장애 시 재시도 횟수를 반드시 처리한다.

## 8. 오퍼레이션 목록

| 번호 | 오퍼레이션명 | 국문명 | 설명 | ZIP:ON 활용 |
| --- | --- | --- | --- | --- |
| 1 | getBrBasisOulnInfo | 건축물대장 기본개요요 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장의 대장종류, 대장구분, 지번주소 및 새주소, 지역/지구/구역 등의 기 본정보를 제공한다. | 물건 식별, 건축물 기본정보, 유형 판별 |
| 2 | getBrRecapTitleInfo | 건축물대장 총괄표제 부 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장 총괄표제부의 지번주소 및 새주소, 대지면적, 건축면적, 연면적, 건 폐율, 용적율, 용도, 주차방식 및 주차대수, 부속건축물의 면적, 허가관 리기관, 에너지관련 등급 등의 정보를 제공한다. | 물건 식별, 건축물 기본정보, 유형 판별 |
| 3 | getBrTitleInfo | 건축물대장 표제부 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장 표제부의 지번주소 및 새주소, 주/부속구분, 대지면적, 건축면적, 건 폐율, 용적율, 구조, 용도, 지붕구조, 주차대수 등의 정보를 제공한다. | 물건 식별, 건축물 기본정보, 유형 판별 |
| 4 | getBrFlrOulnInfo | 건축물대장 층별개요 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장의 층구분, 층번호, 층의 구조, 용도, 면적 등의 층별 정보를 제공한 다. | 물건 식별, 건축물 기본정보, 유형 판별 |
| 5 | getBrAtchJibunInfo | 건축물대장 부속지번 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장과 관련된 부속지번의 지번주소 및 새주소, 부속대장구분 등의 정보 를 제공한다. | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 6 | getBrExposPubuseAreaInfo | 건축물대장 전유공용면적 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장과 관련된 전유/공용면적의 층구분, 층번호, 전유/공용구분, 구조, 용 도 등의 정보를 제공한다. | 전유부/전유공용면적 확인, 다세대·오피스텔 판단 보조 |
| 7 | getBrWclfInfo | 건축물대장 오수정화시설 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장과 관련된 오수정화시설의 오수정화형식, 용량, 용량단위 등의 정보 를 제공한다. | 설비/위생 관련 체크리스트 보조 |
| 8 | getBrHsprcInfo | 건축물대장 주택가격 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장 대상 주택의 가격정보를 제공한다. | 공시가격·보증금 위험도 참고 |
| 9 | getBrExposInfo | 건축물대장 전유부 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장 전유부의 지번주소 및 새주소, 동/호명칭 등의 정보를 제공한다. | 전유부/전유공용면적 확인, 다세대·오피스텔 판단 보조 |
| 10 | getBrJijiguInfo | 건축물대장 지역지구구역 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장과 관련된 지역/지구/구역의 구분 및 명칭, 대표여부 등의 정보를 제 공한다. | 용도지역·지구·구역 확인 및 목적별 체크리스트 |

## 9. 오퍼레이션 상세


---

## 9.1. 건축물대장 기본개요요 조회

### 9.1.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getBrBasisOulnInfo |
| Method | GET |
| Path | /getBrBasisOulnInfo |
| Full URL | https://apis.data.go.kr/1613000/BldRgstHubService/getBrBasisOulnInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장의 대장종류, 대장구분, 지번주소 및 새주소, 지역/지구/구역 등의 기 본정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 원문 위치 | page 16, 17, 18, 19 |

### 9.1.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0000 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.1.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/BldRgstHubService/getBrBasisOulnInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0000&serviceKey={SERVICE_KEY}
```

### 9.1.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 복 |  | 확인 필요 |  |  |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포로109길 5 (개포동) | 도로명대지 위치 |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 대치아파트303동 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.bylotCnt | bylotCnt | 외필지수 | NUMBER(10) | N | 0 | 외필지수 |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 116804166040 | 새주소도로 코드 |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동 코드 | VARCHAR(30) | N | 10301 | 새주소법정 동코드 |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 0 | 새주소지상 지하코드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 21 | 새주소본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부번 |  |
| response.body.items.item.jiyukCd | jiyukCd | 지역코드 | VARCHAR(30) | N | 지역코드 |  |  |
| response.body.items.item.jiguCd | jiguCd | 지구코드 | VARCHAR(30) | N | 지구코드 |  |  |
| response.body.items.item.guyukCd | guyukCd | 구역코드 | VARCHAR(30) | N | 구역코드 |  |  |
| response.body.items.item.jiyukCdNm | jiyukCdNm | 지역코드명 | VARCHAR(1000) | N | 지역코드명 |  |  |
| response.body.items.item.jiguCdNm | jiguCdNm | 지구코드명 | VARCHAR(1000) | N | 지구코드명 |  |  |
| response.body.items.item.guyukCdNm | guyukCdNm | 구역코드명 | VARCHAR(1000) | N | 구역코드명 |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0000 | 지 |  |
| response.body.items.item.mgmBldrgstPk | mgmBldrgstPk | 관리건축물대 장PK | VARCHAR(30) | Y | 1024185513 | 관리건축물 대장PK |  |
| response.body.items.item.mgmUpBldrgstPk | mgmUpBldrgstPk | 관리상위건축 물대장PK | VARCHAR(30) | Y | 10241935 | 관리상위건 축물대장PK |  |
| response.body.items.item.bldgId | bldgId | 건물_아이디 | NUMBER(50) | N | 2220041240026916 | 건물_아이디 |  |
| response.body.items.item.regstrGbCd | regstrGbCd | 대장구분코드 | VARCHAR(30) | N | 2 | 대장구분코 드 |  |
| response.body.items.item.regstrGbCdNm | regstrGbCdNm | 대장구분코드 명 | VARCHAR(1000) | N | 집합 | 대장구분코 드명 |  |
| response.body.items.item.regstrKindCd | regstrKindCd | 대장종류코드 | VARCHAR(30) | N | 4 | 대장종류코 드 |  |
| response.body.items.item.regstrKindCdNm | regstrKindCdNm | 대장종류코드 명 | VARCHAR(1000) | N | 전유부 | 대장종류코 드명 |  |

### 9.1.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0000</ji>

<mgmBldrgstPk>1024185513</mgmBldrgstPk>

<mgmUpBldrgstPk>10241935</mgmUpBldrgstPk>

<bldgId>2220041240026916</bldgId>

<regstrGbCd>2</regstrGbCd>

<regstrGbCdNm>집합</regstrGbCdNm>

<regstrKindCd>4</regstrKindCd>

<regstrKindCdNm>전유부</regstrKindCdNm>

<newPlatPlc>서울특별시 강남구 개포로109길 21 (개포동)</newPlatPlc>

<bldNm>대청아파트303동</bldNm>

<splotNm> </splotNm>

2024년 건축서비스산업 정보체계 유지관리 사업







<block> </block>

<lot> </lot>

<bylotCnt>0</bylotCnt>

<naRoadCd>116804166040</naRoadCd>

<naBjdongCd>10301</naBjdongCd>

<naUgrndCd>0</naUgrndCd>

<naMainBun>21</naMainBun>

<naSubBun>0</naSubBun>

<jiyukCd> </jiyukCd>

<jiguCd> </jiguCd>

<guyukCd> </guyukCd>

<jiyukCdNm> </jiyukCdNm>

<jiguCdNm> </jiguCdNm>

<guyukCdNm> </guyukCdNm>

<crtnDay>20220813</crtnDay>
    </items>
    <numOfRows>1</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>4336</totalCount>
  </body>
</response>
```


### 9.1.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getBrBasisOulnInfo |
| Request DTO 후보 | BrBasisOulnInfoRequest |
| Response DTO 후보 | BrBasisOulnInfoResponse |
| Item DTO 후보 | BrBasisOulnInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.1.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `물건 식별, 건축물 기본정보, 유형 판별`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.2. 건축물대장 총괄표제 부 조회

### 9.2.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getBrRecapTitleInfo |
| Method | GET |
| Path | /getBrRecapTitleInfo |
| Full URL | https://apis.data.go.kr/1613000/BldRgstHubService/getBrRecapTitleInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장 총괄표제부의 지번주소 및 새주소, 대지면적, 건축면적, 연면적, 건 폐율, 용적율, 용도, 주차방식 및 주차대수, 부속건축물의 면적, 허가관 리기관, 에너지관련 등급 등의 정보를 제공한다. |
| 평균 응답시간 | 500 ms |
| TPS 제한 | 30 tps |
| ZIP:ON 활용 위치 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 원문 위치 | page 21, 23, 24, 25, 26, 27 |

### 9.2.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0000 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.2.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/BldRgstHubService/getBrRecapTitleInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0000&serviceKey={SERVICE_KEY}
```

### 9.2.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.itgBldGrade | itgBldGrade | 지능형건축물 등급 | VARCHAR(100) | N | 지능형건축 물등급 |  |  |
| response.body.items.item.itgBldCert | itgBldCert | 지능형건축물 인증점수 | NUMBER(22,9) | N | 0 | 지능형건축 물인증점수 |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동 | VARCHAR(30) | N | 10301 | 새주소법정 |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 0 | 새주소지상 지하코드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 5 | 새주소본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부번 |  |
| response.body.items.item.platArea | platArea | 대지면적(㎡) | NUMBER(30,9) | N | 0 | 대지면적(㎡) |  |
| response.body.items.item.archArea | archArea | 건축면적(㎡) | NUMBER(30,9) | N | 15403.97 | 건축면적(㎡) |  |
| response.body.items.item.bcRat | bcRat | 건폐율(%) | NUMBER(22,9) | N | 0 | 건폐율(%) |  |
| response.body.items.item.totArea | totArea | 연면적(㎡) | NUMBER(30,9) | N | 224217.01 | 연면적(㎡) |  |
| response.body.items.item.vlRatEstmTotArea | vlRatEstmTotArea | 용적률산정연 면적(㎡) | NUMBER(30,9) | N | 21833.55 | 용적률산정 연면적(㎡) |  |
| response.body.items.item.vlRat | vlRat | 용적률(%) | NUMBER(22,9) | N | 0 | 용적률(%) |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드 | VARCHAR(5) | N | 02000 | 주용도코드 |  |
| response.body.items.item.mainPurpsCdNm | mainPurpsCdNm | 주용도코드명 | VARCHAR(1000) | N | 공동주택 | 주용도코드 명 |  |
| response.body.items.item.etcPurps | etcPurps | 기타용도 | VARCHAR(4000) | N | 주거시설 근린생 활시설 | 기타용도 |  |
| response.body.items.item.hhldCnt | hhldCnt | 세대수(세대) | NUMBER(10) | N | 4199 | 세대수(세대) |  |
| response.body.items.item.fmlyCnt | fmlyCnt | 가구수(가구) | NUMBER(10) | N | 0 | 가구수(가구) |  |
| response.body.items.item.mainBldCnt | mainBldCnt | 주건축물수 | NUMBER(10) | N | 27 | 주건축물수 |  |
| response.body.items.item.atchBldCnt | atchBldCnt | 부속건축물수 | NUMBER(10) | N | 3 | 부속건축물 수 |  |
| response.body.items.item.atchBldArea | atchBldArea | 부속건축물면 적(㎡) | NUMBER(30,9) | N | 64.26 | 부속건축물 면적(㎡) |  |
| response.body.items.item.totPkngCnt | totPkngCnt | 총주차수 | NUMBER(10) | N | 0 | 총주차수 |  |
| response.body.items.item.indrMechUtcnt | indrMechUtcnt | 옥내기계식대 수(대) | NUMBER(10) | N | 0 | 옥내기계식 대수(대) |  |
| response.body.items.item.indrMechArea | indrMechArea | 옥내기계식면 적(㎡) | 옵 | N | 옥내기계식 면적(㎡) |  |  |
| response.body.items.item.oudrMechUtcnt | oudrMechUtcnt | 옥외기계식대 수(대) | NUMBER(10) | N | 0 | 옥외기계식 대수(대) |  |
| response.body.items.item.oudrMechArea | oudrMechArea | 옥외기계식면 적(㎡) | NUMBER(30,9) | N | 0 | 옥외기계식 면적(㎡) |  |
| response.body.items.item.indrAutoUtcnt | indrAutoUtcnt | 옥내자주식대 수(대) | NUMBER(10) | N | 0 | 옥내자주식 대수(대) |  |
| response.body.items.item.indrAutoArea | indrAutoArea | 옥내자주식면 적(㎡) | NUMBER(30,9) | N | 0 | 옥내자주식 면적(㎡) |  |
| response.body.items.item.oudrAutoUtcnt | oudrAutoUtcnt | 옥외자주식대 수(대) | NUMBER(10) | N | 0 | 옥외자주식 대수(대) |  |
| response.body.items.item.oudrAutoArea | oudrAutoArea | 옥외자주식면 적(㎡) | NUMBER(30,9) | N | 0 | 옥외자주식 면적(㎡) |  |
| response.body.items.item.pmsDay | pmsDay | 허가일 | VARCHAR(8) | N | 허가일 |  |  |
| response.body.items.item.stcnsDay | stcnsDay | 착공일 | VARCHAR(8) | N | 착공일 |  |  |
| response.body.items.item.useAprDay | useAprDay | 사용승인일 | VARCHAR(8) | N | 사용승인일 |  |  |
| response.body.items.item.pmsnoYear | pmsnoYear | 허가번호년 | VARCHAR(4) | N | 허가번호년 |  |  |
| response.body.items.item.pmsnoKikCd | pmsnoKikCd | 허가번호기관 코드 | VARCHAR(30) | N | 허가번호기 관코드 |  |  |
| response.body.items.item.pmsnoKikCdNm | pmsnoKikCdNm | 허가번호기관 코드명 | VARCHAR(1000) | N | 허가번호기 관코드명 |  |  |
| response.body.items.item.pmsnoGbCd | pmsnoGbCd | 허가번호구분 코드 | VARCHAR(30) | N | 허가번호구 분코드 |  |  |
| response.body.items.item.pmsnoGbCdNm | pmsnoGbCdNm | 허가번호구분 코드명 | VARCHAR(1000) | N | 허가번호구 분코드명 |  |  |
| response.body.items.item.hoCnt | hoCnt | 호수(호) | NUMBER(10) | N | 0 | 호수(호) |  |
| response.body.items.item.engrGrade | engrGrade | 에너지효율등 급 | VARCHAR(100) | N | 에너지효율 등급 |  |  |
| response.body.items.item.engrRat | engrRat | 에너지절감율 | NUMBER(22,9) | N | 0 | 에너지절감 |  |
| response.body.items.item.engrEpi | engrEpi | EPI점수 | NUMBER(22,9) | N | 0 | EPI점수 |  |
| response.body.items.item.gnBldGrade | gnBldGrade | 친환경건축물 등급 | VARCHAR(100) | N | 친환경건축 물등급 |  |  |
| response.body.items.item.gnBldCert | gnBldCert | 친환경건축물 인증점수 | NUMBER(22,9) | N | 0 | 친환경건축 물인증점수 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남 구 개포동 12번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0000 | 지 |  |
| response.body.items.item.mgmBldrgstPk | mgmBldrgstPk | 관리건축물대 장PK | VARCHAR(30) | Y | 10241103 | 관리건축물 대장PK |  |
| response.body.items.item.regstrGbCd | regstrGbCd | 대장구분코드 | VARCHAR(30) | N | 2 | 대장구분코 드 |  |
| response.body.items.item.regstrGbCdNm | regstrGbCdNm | 대장구분코드 명 | VARCHAR(1000) | N | 집합 | 대장구분코 드명 |  |
| response.body.items.item.regstrKindCd | regstrKindCd | 대장종류코드 | VARCHAR(30) | N | 1 | 대장종류코 드 |  |
| response.body.items.item.regstrKindCdNm | regstrKindCdNm | 대장종류코드 명 | VARCHAR(1000) | N | 총괄표제부 | 대장종류코 드명 |  |
| response.body.items.item.newOldRegstrGbCd | newOldRegstrGbCd | 신구대장구분 코드 | VARCHAR(30) | N | 0 | 신구대장구 분코드 |  |
| response.body.items.item.newOldRegstr | newOldRegstr | 신구대장구분 | VARCHAR(1000) | N | 구대장 | 신구대장구 |  |
| response.body.items.item.GbCdNm | GbCdNm | 코드명 | 분코드명 | 확인 필요 |  |  |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 서울특별시 강남 구 개포로109길 ( 개포동) | 도로명대지 위치 |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 대치,대청 아파트 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.bylotCnt | bylotCnt | 외필지수 | NUMBER(10) | N | 0 | 외필지수 |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 116804166040 | 새주소도로 코드 |  |

### 9.2.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0000</ji>

<mgmBldrgstPk>10241103</mgmBldrgstPk>

<regstrGbCd>2</regstrGbCd>

<regstrGbCdNm>집합</regstrGbCdNm>

<regstrKindCd>1</regstrKindCd>

<regstrKindCdNm>총괄표제부</regstrKindCdNm>

<newOldRegstrGbCd>0</newOldRegstrGbCd>

<newOldRegstrGbCdNm>구대장</newOldRegstrGbCdNm>

<newPlatPlc>서울특별시 강남구 개포로109길 5 (개포동)</newPlatPlc>

<bldNm>대치,대청 아파트</bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<bylotCnt>0</bylotCnt>

<naRoadCd>116804166040</naRoadCd>

<naBjdongCd>10301</naBjdongCd>

<naUgrndCd>0</naUgrndCd>

<naMainBun>5</naMainBun>

<naSubBun>0</naSubBun>

<platArea>0</platArea>

<archArea>15403.97</archArea>

2024년 건축서비스산업 정보체계 유지관리 사업







<bcRat>0</bcRat>

<totArea>224217.01</totArea>

<vlRatEstmTotArea>21833.55</vlRatEstmTotArea>

<vlRat>0</vlRat>

<mainPurpsCd>02000</mainPurpsCd>

<mainPurpsCdNm>공동주택</mainPurpsCdNm>

<etcPurps>주거시설 근린생활시설</etcPurps>

<hhldCnt>4199</hhldCnt>

<fmlyCnt>0</fmlyCnt>

<mainBldCnt>27</mainBldCnt>

<atchBldCnt>3</atchBldCnt>f

<atchBldArea>64.26</atchBldArea>

<totPkngCnt>0</totPkngCnt>

<indrMechUtcnt>0</indrMechUtcnt>

<indrMechArea>0</indrMechArea>

<oudrMechUtcnt>0</oudrMechUtcnt>

<oudrMechArea>0</oudrMechArea>

<indrAutoUtcnt>0</indrAutoUtcnt>

<indrAutoArea>0</indrAutoArea>

<oudrAutoUtcnt>0</oudrAutoUtcnt>

<oudrAutoArea>0</oudrAutoArea>

<pmsDay> </pmsDay>

<stcnsDay> </stcnsDay>

<useAprDay> </useAprDay>

<pmsnoYear> </pmsnoYear>

<pmsnoKikCd> </pmsnoKikCd>

<pmsnoKikCdNm> </pmsnoKikCdNm>

<pmsnoGbCd> </pmsnoGbCd>

<pmsnoGbCdNm> </pmsnoGbCdNm>

<hoCnt>0</hoCnt>

<engrGrade> </engrGrade>

<engrRat>0</engrRat>

<engrEpi>0</engrEpi>

<gnBldGrade> </gnBldGrade>

<gnBldCert>0</gnBldCert>

2024년 건축서비스산업 정보체계 유지관리 사업







<itgBldGrade> </itgBldGrade>

<itgBldCert>0</itgBldCert>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>1</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>1</totalCount>
  </body>
</response>
```


### 9.2.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getBrRecapTitleInfo |
| Request DTO 후보 | BrRecapTitleInfoRequest |
| Response DTO 후보 | BrRecapTitleInfoResponse |
| Item DTO 후보 | BrRecapTitleInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.2.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `물건 식별, 건축물 기본정보, 유형 판별`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.3. 건축물대장 표제부 조회

### 9.3.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getBrTitleInfo |
| Method | GET |
| Path | /getBrTitleInfo |
| Full URL | https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장 표제부의 지번주소 및 새주소, 주/부속구분, 대지면적, 건축면적, 건 폐율, 용적율, 구조, 용도, 지붕구조, 주차대수 등의 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 원문 위치 | page 30, 31, 32, 33, 34, 35 |

### 9.3.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0000 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.3.3 요청 예시

```http
GET https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?&sigunguCd=11680&bjdongCd=10300&platGbCd=0&bun=0012&ji=0000&numOfRows=10&pageNo=1&_type=json&serviceKey={SERVICE_KEY}
```

### 9.3.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.mainPurpsCdNm | mainPurpsCdNm | 주용도코드명 | VARCHAR(1000) | N | 노유자시설 | 주용도코드명 |  |
| response.body.items.item.etcPurps | etcPurps | 기타용도 | VARCHAR(4000) | N | 경로당 | 용도정보(건 축물대장 주용도 정보) |  |
| response.body.items.item.roofCd | roofCd | 지붕코드 | VARCHAR(30) | N | 10 | 지붕코드 |  |
| response.body.items.item.roofCdNm | roofCdNm | 지붕코드명 | VARCHAR(1000) | N | (철근)콘크리트 | 지붕코드명 |  |
| response.body.items.item.etcRoof | etcRoof | 기타지붕 | VARCHAR(2000) | N | (철근)콘크리트 | 지붕정보(건 축물대장 |  |
| response.body.items.item.hhldCnt | hhldCnt | 세대수(세대) | NUMBER(10) | N | 0 | 세대수(세대) |  |
| response.body.items.item.fmlyCnt | fmlyCnt | 가구수(가구) | NUMBER(10) | N | 0 | 가구수(가구) |  |
| response.body.items.item.heit | heit | 높이(m) | NUMBER(22,9) | N | 0 | 높이(m) |  |
| response.body.items.item.grndFlrCnt | grndFlrCnt | 지상층수 | NUMBER(3) | N | 0 | 지상층수 |  |
| response.body.items.item.ugrndFlrCnt | ugrndFlrCnt | 지하층수 | NUMBER(3) | N | 0 | 지하층수 |  |
| response.body.items.item.rideUseElvtCnt | rideUseElvtCnt | 승용승강기수 | NUMBER(10) | N | 0 | 승용승강기수 |  |
| response.body.items.item.emgenUseElvtCnt | emgenUseElvtCnt | 비상용승강기 수 | NUMBER(10) | N | 0 | 비상용승강기 수 |  |
| response.body.items.item.atchBldCnt | atchBldCnt | 부속건축물수 | NUMBER(10) | N | 0 | 부속건축물수 |  |
| response.body.items.item.atchBldArea | atchBldArea | 부속건축물면 적(㎡) | NUMBER(30,9) | N | 0 | 부속건축물면 적(㎡) |  |
| response.body.items.item.totDongTotArea | totDongTotArea | 총동연면적(㎡ ) | NUMBER(30,9) | N | 278.01 | 총동연면적( ㎡) |  |
| response.body.items.item.indrMechUtcnt | indrMechUtcnt | 옥내기계식대 수(대) | NUMBER(10) | N | 0 | 옥내기계식대 수(대) |  |
| response.body.items.item.indrMechArea | indrMechArea | 옥내기계식면 적(㎡) | NUMBER(30,9) | N | 0 | 옥내기계식면 적(㎡) |  |
| response.body.items.item.oudrMechUtcnt | oudrMechUtcnt | 옥외기계식대 수(대) | NUMBER(10) | N | 0 | 옥외기계식대 수(대) |  |
| response.body.items.item.oudrMechArea | oudrMechArea | 옥외기계식면 적(㎡) | NUMBER(30,9) | N | 0 | 옥외기계식면 적(㎡) |  |
| response.body.items.item.indrAutoUtcnt | indrAutoUtcnt | 옥내자주식대 수(대) | NUMBER(10) | N | 0 | 옥내자주식대 수(대) |  |
| response.body.items.item.indrAutoArea | indrAutoArea | 옥내자주식면 적(㎡) | NUMBER(30,9) | N | 0 | 옥내자주식면 적(㎡) |  |
| response.body.items.item.oudrAutoUtcnt | oudrAutoUtcnt | 옥외자주식대 수(대) | NUMBER(10) | N | 0 | 옥외자주식대 수(대) |  |
| response.body.items.item.oudrAutoArea | oudrAutoArea | 옥외자주식면 적(㎡) | NUMBER(30,9) | N | 0 | 옥외자주식면 적(㎡) |  |
| response.body.items.item.pmsDay | pmsDay | 허가일 | VARCHAR(8) | N | 허가일 |  |  |
| response.body.items.item.stcnsDay | stcnsDay | 착공일 | VARCHAR(8) | N | 착공일 |  |  |
| response.body.items.item.useAprDay | useAprDay | 사용승인일 | VARCHAR(8) | N | 사용승인일 |  |  |
| response.body.items.item.pmsnoYear | pmsnoYear | 허가번호년 | VARCHAR(4) | N | 허가번호년 |  |  |
| response.body.items.item.pmsnoKikCd | pmsnoKikCd | 허가번호기관 코드 | VARCHAR(30) | N | 허가번호기관 코드 |  |  |
| response.body.items.item.pmsnoKikCdNm | pmsnoKikCdNm | 허가번호기관 코드명 | VARCHAR(1000) | N | 허가번호기관 코드명 |  |  |
| response.body.items.item.pmsnoGbCd | pmsnoGbCd | 허가번호구분 코드 | VARCHAR(30) | N | 허가번호구분 코드 |  |  |
| response.body.items.item.pmsnoGbCdNm | pmsnoGbCdNm | 허가번호구분 코드명 | VARCHAR(1000) | N | 허가번호구분 코드명 |  |  |
| response.body.items.item.hoCnt | hoCnt | 호수(호) | NUMBER(10) | N | 0 | 호수(호) |  |
| response.body.items.item.engrGrade | engrGrade | 에너지효율등 급 | VARCHAR(100) | N | 에너지효율등 급 |  |  |
| response.body.items.item.engrRat | engrRat | 에너지절감율 | NUMBER(22,9) | N | 0 | 에너지절감율 |  |
| response.body.items.item.engrEpi | engrEpi | EPI점수 | NUMBER(22,9) | N | 0 | EPI점수 |  |
| response.body.items.item.gnBldGrade | gnBldGrade | 친환경건축물 등급 | VARCHAR(100) | N | 친환경건축물 등급 |  |  |
| response.body.items.item.gnBldCert | gnBldCert | 친환경건축물 인증점수 | NUMBER(22,9) | N | 0 | 친환경건축물 인증점수 |  |
| response.body.items.item.itgBldGrade | itgBldGrade | 지능형건축물 등급 | VARCHAR(100) | N | 지능형건축물 등급 |  |  |
| response.body.items.item.itgBldCert | itgBldCert | 지능형건축물 인증점수 | NUMBER(22,9) | N | 0 | 지능형건축물 인증점수 |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0000 | 지 |  |
| response.body.items.item.mgmBldrgstPk | mgmBldrgstPk | 관리건축물대 장PK | VARCHAR(30) | Y | 10241100287543 | 관리건축물대 장PK |  |
| response.body.items.item.regstrGbCd | regstrGbCd | 대장구분코드 | VARCHAR(30) | N | 2 | 대장구분코드 |  |
| response.body.items.item.regstrGbCdNm | regstrGbCdNm | 대장구분코드 명 | VARCHAR(1000) | N | 집합 | 대장구분코드 명 |  |
| response.body.items.item.regstrKindCd | regstrKindCd | 대장종류코드 | VARCHAR(30) | N | 3 | 대장종류코드 |  |
| response.body.items.item.regstrKindCdNm | regstrKindCdNm | 대장종류코드 명 | VARCHAR(1000) | N | 표제부 | 대장종류코드 명 |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 도로명대지위 치 |  |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 경로당 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.bylotCnt | bylotCnt | 외필지수 | NUMBER(10) | N | 0 | 외필지수 |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 새주소도로코 드 |  |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동 코드 | VARCHAR(30) | N | 새주소법정동 코드 |  |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 0 | 새주소지상지 하코드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 0 | 새주소본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부번 |  |
| response.body.items.item.dongNm | dongNm | 동명칭 | VARCHAR(1000) | N | 경로당 | 동명칭 |  |
| response.body.items.item.mainAtchGbCd | mainAtchGbCd | 주부속구분코 드 | VARCHAR(30) | N | 1 | 주부속구분코 드 |  |
| response.body.items.item.mainAtchGbCdNm | mainAtchGbCdNm | 주부속구분코 드명 | VARCHAR(1000) | N | 부속건축물 | 주부속구분코 드명 |  |
| response.body.items.item.platArea | platArea | 대지면적(㎡) | NUMBER(30,9) | N | 0 | 대지면적(㎡) |  |
| response.body.items.item.archArea | archArea | 건축면적(㎡) | NUMBER(30,9) | N | 235.55 | 건축면적(㎡) |  |
| response.body.items.item.bcRat | bcRat | 건폐율(%) | NUMBER(22,9) | N | 0 | 건폐율(%) |  |
| response.body.items.item.totArea | totArea | 연면적(㎡) | NUMBER(30,9) | N | 278.01 | 연면적(㎡) |  |
| response.body.items.item.vlRatEstmTotArea | vlRatEstmTotArea | 용적률산정연 면적(㎡) | NUMBER(30,9) | N | 0 | 용적률산정연 면적(㎡) |  |
| response.body.items.item.vlRat | vlRat | 용적률(%) | NUMBER(22,9) | N | 0 | 용적률(%) |  |
| response.body.items.item.strctCd | strctCd | 구조코드 | VARCHAR(2) | N | 41 | 구조코드 |  |
| response.body.items.item.strctCdNm | strctCdNm | 구조코드명 | VARCHAR(1000) | N | 벽돌구조 | 구조코드명 |  |
| response.body.items.item.etcStrct | etcStrct | 기타구조 | VARCHAR(2000) | N | 철골콘크리트구조 | 구조정보(건 축물대장 주구조 정보) |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드 | VARCHAR(5) | N | 11000 | 주용도코드 |  |
| response.body.items.item.rserthqkDsgnApplyYn | rserthqkDsgnApplyYn | 내진설계적용 여부 | VARCHAR(1) | N | 0 | 내진 설계 적용 여부(0,1) |  |
| response.body.items.item.rserthqkAblty | rserthqkAblty | 내진능력 | VARCHAR(4000) | N | 내진 능력 |  |  |

### 9.3.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0000</ji>

<mgmBldrgstPk>1024185513</mgmBldrgstPk>

<mgmUpBldrgstPk>10241935</mgmUpBldrgstPk>

<bldgId>2220041240026916</bldgId>

<regstrGbCd>2</regstrGbCd>

<regstrGbCdNm>집합</regstrGbCdNm>

<regstrKindCd>4</regstrKindCd>

<regstrKindCdNm>전유부</regstrKindCdNm>

<newPlatPlc>서울특별시 강남구 개포로109길 21 (개포동)</newPlatPlc>

<bldNm>대청아파트303동</bldNm>

<splotNm> </splotNm>

2024년 건축서비스산업 정보체계 유지관리 사업







<block> </block>

<lot> </lot>

<bylotCnt>0</bylotCnt>

<naRoadCd>116804166040</naRoadCd>

<naBjdongCd>10301</naBjdongCd>

<naUgrndCd>0</naUgrndCd>

<naMainBun>21</naMainBun>

<naSubBun>0</naSubBun>

<jiyukCd> </jiyukCd>

<jiguCd> </jiguCd>

<guyukCd> </guyukCd>

<jiyukCdNm> </jiyukCdNm>

<jiguCdNm> </jiguCdNm>

<guyukCdNm> </guyukCdNm>

<crtnDay>20220813</crtnDay>
    </items>
    <numOfRows>1</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>4336</totalCount>
  </body>
</response>
```


### 9.3.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getBrTitleInfo |
| Request DTO 후보 | BrTitleInfoRequest |
| Response DTO 후보 | BrTitleInfoResponse |
| Item DTO 후보 | BrTitleInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.3.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `물건 식별, 건축물 기본정보, 유형 판별`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.4. 건축물대장 층별개요 조회

### 9.4.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getBrFlrOulnInfo |
| Method | GET |
| Path | /getBrFlrOulnInfo |
| Full URL | https://apis.data.go.kr/1613000/BldRgstHubService/getBrFlrOulnInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장의 층구분, 층번호, 층의 구조, 용도, 면적 등의 층별 정보를 제공한 다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 원문 위치 | page 39, 40, 41, 42 |

### 9.4.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0000 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.4.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/BldRgstHubService/getBrFlrOulnInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0000&serviceKey={SERVICE_KEY}
```

### 9.4.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준 코드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준 코드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0000 | 지 |  |
| response.body.items.item.mgmBldrgstPk | mgmBldrgstPk | 관리건축물대 장PK | VARCHAR(30) | Y | 102417005 | 관리건축 물대장PK |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포로109길 5 (개포동) | 도로명대 지위치 |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 건물명 |  |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 16804166040 | 새주소도 로코드 |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동 코드 | VARCHAR(30) | N | 10301 | 새주소법 정동코드 |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 0 | 새주소지 상지하코 드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 5 | 새주소본 번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부 번 |  |
| response.body.items.item.dongNm | dongNm | 동명칭 | VARCHAR(1000) | N | 동명칭 |  |  |
| response.body.items.item.flrGbCd | flrGbCd | 층구분코드 | VARCHAR(30) | N | 20 | 층구분코 드 |  |
| response.body.items.item.flrGbCdNm | flrGbCdNm | 층구분코드명 | VARCHAR(1000) | N | 지상 | 층구분코 드명 |  |
| response.body.items.item.flrNo | flrNo | 층번호 | NUMBER(5) | N | 3 | 층번호 |  |
| response.body.items.item.flrNoNm | flrNoNm | 층번호명 | VARCHAR(1000) | N | 3층 | 층번호명 |  |
| response.body.items.item.strctCd | strctCd | 구조코드 | VARCHAR(2) | N | 31 | 구조코드 |  |
| response.body.items.item.strctCdNm | strctCdNm | 구조코드명 | VARCHAR(1000) | N | 일반철골구조 | 구조코드 명 |  |
| response.body.items.item.etcStrct | etcStrct | 기타구조 | VARCHAR(2000) | N | 일반철골구조 | 구조정보( 건축물대 장 구조) |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드 | VARCHAR(5) | N | 11999 | 주용도코 드 |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드명 | VARCHAR(1000) | N | 기타노유자시설 | 주용도코 |  |
| response.body.items.item.Nm | Nm | 드명 |  | 확인 필요 |  |  |  |
| response.body.items.item.etcPurps | etcPurps | 기타용도 | VARCHAR(4000) | N | 노유자시설(승강기) | 용도정보( 건축물대 장 용도) |  |
| response.body.items.item.mainAtchGbCd | mainAtchGbCd | 주부속구분코 드 | VARCHAR(30) | N | 0 | 주부속구 분코드 |  |
| response.body.items.item.mainAtchGbCdNm | mainAtchGbCdNm | 주부속구분코 드명 | VARCHAR(1000) | N | 주건축물 | 주부속구 분코드명 |  |
| response.body.items.item.area | area | 면적(㎡) | NUMBER(30,9) | N | 6.89 | 면적(㎡) |  |
| response.body.items.item.areaExctYn | areaExctYn | 면적제외여부 | VARCHAR(1) | N | 0 | 0: N 1: Y |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |

### 9.4.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0000</ji>

<mgmBldrgstPk>102417005</mgmBldrgstPk>

<newPlatPlc>서울특별시 강남구 개포로109길 5 (개포동)</newPlatPlc>

<bldNm> </bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<naRoadCd>116804166040</naRoadCd>

<naBjdongCd>10301</naBjdongCd>

<naUgrndCd>0</naUgrndCd>

<naMainBun>5</naMainBun>

<naSubBun>0</naSubBun>

<dongNm> </dongNm>

<flrGbCd>20</flrGbCd>

<flrGbCdNm>지상</flrGbCdNm>

<flrNo>3</flrNo>

<flrNoNm>3층</flrNoNm>

<strctCd>31</strctCd>

<strctCdNm>일반철골구조</strctCdNm>

<etcStrct>일반철골구조</etcStrct>

<mainPurpsCd>11999</mainPurpsCd>

2024년 건축서비스산업 정보체계 유지관리 사업







<mainPurpsCdNm>기타노유자시설</mainPurpsCdNm>

<etcPurps>노유자시설(승강기)</etcPurps>

<mainAtchGbCd>0</mainAtchGbCd>

<mainAtchGbCdNm>주건축물</mainAtchGbCdNm>

<area>6.89</area>

<areaExctYn>0</areaExctYn>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>1</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>434otalCount>
  </body>
</response>
```


### 9.4.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getBrFlrOulnInfo |
| Request DTO 후보 | BrFlrOulnInfoRequest |
| Response DTO 후보 | BrFlrOulnInfoResponse |
| Item DTO 후보 | BrFlrOulnInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.4.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `물건 식별, 건축물 기본정보, 유형 판별`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.5. 건축물대장 부속지번 조회

### 9.5.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getBrAtchJibunInfo |
| Method | GET |
| Path | /getBrAtchJibunInfo |
| Full URL | https://apis.data.go.kr/1613000/BldRgstHubService/getBrAtchJibunInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장과 관련된 부속지번의 지번주소 및 새주소, 부속대장구분 등의 정보 를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 원문 위치 | page 44, 45, 46, 47 |

### 9.5.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0005 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.5.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/BldRgstHubService/getBrAtchJibunInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0005&serviceKey={SERVICE_KEY}
```

### 9.5.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0005 | 지 |  |
| response.body.items.item.mgmBldrgstPk | mgmBldrgstPk | 관리건축물대 장PK | VARCHAR(30) | Y | 1024119200 | 관리건축물 대장PK |  |
| response.body.items.item.regstrGbCd | regstrGbCd | 대장구분코드 | VARCHAR(30) | N | 1 | 대장구분코 드 |  |
| response.body.items.item.regstrGbCdN | regstrGbCdN | 대장구분코드 | VARCHAR(1000) | N | 일반 | 대장구분코 |  |
| response.body.items.item.m | m | 명 | 드명 | 확인 필요 |  |  |  |
| response.body.items.item.regstrKindCd | regstrKindCd | 대장종류코드 | VARCHAR(30) | N | 2 | 대장종류코 드 |  |
| response.body.items.item.regstrKindCdNm | regstrKindCdNm | 대장종류코드 명 | VARCHAR(1000) | N | 일반건축물 | 대장종류코 드명 |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포로 613 | 도로명대지 위치 |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 건물명 |  |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 116803122001 | 새주소도로 코드 |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동 코드 | VARCHAR(30) | N | 10301 | 새주소법정 동코드 |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 0 | 새주소지상 지하코드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 613 | 새주소본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부번 |  |
| response.body.items.item.atchRegstrGbCd | atchRegstrGbCd | 부속대장구분 코드 | VARCHAR(30) | N | 1 | 부속대장구 분코드 |  |
| response.body.items.item.atchRegstrGbCdNm | atchRegstrGbCdNm | 부속대장구분 코드명 | VARCHAR(1000) | N | 일반 | 부속대장구 분코드명 |  |
| response.body.items.item.atchSigunguCd | atchSigunguCd | 부속시군구코 드 | VARCHAR(30) | N | 11680 | 부속시군구 코드 |  |
| response.body.items.item.atchBjdongCd | atchBjdongCd | 부속법정동코 드 | VARCHAR(30) | N | 10300 | 부속법정동 코드 |  |
| response.body.items.item.atchPlatGbCd | atchPlatGbCd | 부속대지구분 코드 | VARCHAR(30) | N | 0 | 부속대지구 분코드 |  |
| response.body.items.item.atchBun | atchBun | 부속번 | VARCHAR(20) | N | 0012 | 부속번 |  |
| response.body.items.item.atchJi | atchJi | 부속지 | VARCHAR(20) | N | 0048 | 부속지 |  |
| response.body.items.item.atchSplotNm | atchSplotNm | 부속특수지명 | VARCHAR(1000) | N | 부속특수지 명 |  |  |
| response.body.items.item.atchBlock | atchBlock | 부속블록 | VARCHAR(500) | N | 부속블록 |  |  |
| response.body.items.item.atchLot | atchLot | 부속로트 | VARCHAR(500) | N | 부속로트 |  |  |
| response.body.items.item.atchEtcJibunNm | atchEtcJibunNm | 부속기타지번 명 | VARCHAR(1000) | N | 부속기타지 번명 |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12-5번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 드 |  |

### 9.5.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12-5번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0005</ji>

<mgmBldrgstPk>1024119200</mgmBldrgstPk>

<regstrGbCd>1</regstrGbCd>

<regstrGbCdNm>일반</regstrGbCdNm>

<regstrKindCd>2</regstrKindCd>

<regstrKindCdNm>일반건축물</regstrKindCdNm>

<newPlatPlc>서울특별시 강남구 개포로 613 (개포동)</newPlatPlc>

<bldNm> </bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<naRoadCd>116803122001</naRoadCd>

<naBjdongCd>10301</naBjdongCd>

<naUgrndCd>0</naUgrndCd>

<naMainBun>613</naMainBun>

<naSubBun>0</naSubBun>

<atchRegstrGbCd>1</atchRegstrGbCd>

<atchRegstrGbCdNm>일반</atchRegstrGbCdNm>

<atchSigunguCd>11680</atchSigunguCd>

<atchBjdongCd>10300</atchBjdongCd>

<atchPlatGbCd>0</atchPlatGbCd>

2024년 건축서비스산업 정보체계 유지관리 사업







<atchBun>0012</atchBun>

<atchJi>0048</atchJi>

<atchSplotNm> </atchSplotNm>

<atchBlock> </atchBlock>

<atchLot> </atchLot>

<atchEtcJibunNm> </atchEtcJibunNm>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>1</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>1</totalCount>
  </body>
</response>
```


### 9.5.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getBrAtchJibunInfo |
| Request DTO 후보 | BrAtchJibunInfoRequest |
| Response DTO 후보 | BrAtchJibunInfoResponse |
| Item DTO 후보 | BrAtchJibunInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.5.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `ZIP:ON 목적별 위험도 계산의 보조 입력값`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.6. 건축물대장 전유공용면적 조회

### 9.6.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getBrExposPubuseAreaInfo |
| Method | GET |
| Path | /getBrExposPubuseAreaInfo |
| Full URL | https://apis.data.go.kr/1613000/BldRgstHubService/getBrExposPubuseAreaInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장과 관련된 전유/공용면적의 층구분, 층번호, 전유/공용구분, 구조, 용 도 등의 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 전유부/전유공용면적 확인, 다세대·오피스텔 판단 보조 |
| 원문 위치 | page 49, 51, 52, 53, 54 |

### 9.6.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코 드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0000 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| dongNm | 동명칭 | VARCHAR(1000) | N | 동명칭 |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| hoNm | 호명칭 | VARCHAR(1000) | N | 호명칭 |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.6.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/BldRgstHubService/getBrExposPubuseAreaInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0000&serviceKey={SERVICE_KEY}
```

### 9.6.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.regstrGbCd | regstrGbCd | 대장구분코드 | VARCHAR(30) | N | 2 | 대장구분코 드 |  |
| response.body.items.item.regstrGbCdNm | regstrGbCdNm | 대장구분코드 명 | VARCHAR(1000) | N | 집합 | 대장구분코 드명 |  |
| response.body.items.item.regstrKindCd | regstrKindCd | 대장종류코드 | VARCHAR(30) | N | 4 | 대장종류코 드 |  |
| response.body.items.item.regstrKindCdNm | regstrKindCdNm | 대장종류코드 명 | VARCHAR(1000) | N | 전유부 | 대장종류코 드명 |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포로109길 21 (개포동) | 도로명대지 위치 |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 대치아파트302동 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 116804166040 | 새주소도로 코드 |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동 코드 | VARCHAR(30) | N | 10301 | 새주소법정 동코드 |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 0 | 새주소지상 지하코드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 21 | 새주소본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부번 |  |
| response.body.items.item.dongNm | dongNm | 동명칭 | VARCHAR(1000) | N | 302 | 동명칭 |  |
| response.body.items.item.hoNm | hoNm | 호명칭 | VARCHAR(1000) | N | 407호 | 호명칭 |  |
| response.body.items.item.flrGbCd | flrGbCd | 층구분코드 | VARCHAR(30) | N | 20 | 층구분코드 |  |
| response.body.items.item.flrGbCdNm | flrGbCdNm | 층구분코드명 | VARCHAR(1000) | N | 지상 | 층구분코드 명 |  |
| response.body.items.item.flrNo | flrNo | 층번호 | NUMBER(5) | N | 4 | 층번호 |  |
| response.body.items.item.flrNoNm | flrNoNm | 층번호명 | VARCHAR(1000) | N | 4층 | 층번호명 |  |
| response.body.items.item.exposPubuseGbCd | exposPubuseGbCd | 전유공용구분 코드 | VARCHAR(30) | N | 1 | 전유공용구 분코드 |  |
| response.body.items.item.exposPubuseGbCdNm | exposPubuseGbCdNm | 전유공용구분 코드명 | VARCHAR(1000) | N | 전유 | 전유공용구 분코드명 |  |
| response.body.items.item.mainAtchGbCd | mainAtchGbCd | 주부속구분코 드 | VARCHAR(30) | N | 0 | 주부속구분 코드 |  |
| response.body.items.item.mainAtchGbCdNm | mainAtchGbCdNm | 주부속구분코 드명 | VARCHAR(1000) | N | 주건축물 | 주부속구분 코드명 |  |
| response.body.items.item.strctCd | strctCd | 구조코드 | VARCHAR(2) | N | 21 | 구조코드 |  |
| response.body.items.item.strctCdNm | strctCdNm | 구조코드명 | VARCHAR(1000) | N | 철근콘크리트구조 | 구조코드명 |  |
| response.body.items.item.etcStrct | etcStrct | 기타구조 | VARCHAR(2000) | N | 철근콘크리트조 | 기타구조 |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드 | VARCHAR(5) | N | 02001 | 주용도코드 |  |
| response.body.items.item.mainPurpsCdNm | mainPurpsCdNm | 주용도코드명 | VARCHAR(1000) | N | 아파트 | 주용도코드 명 |  |
| response.body.items.item.etcPurps | etcPurps | 기타용도 | VARCHAR(4000) | N | 아파트(일부공유면 적포함) | 기타용도 |  |
| response.body.items.item.area | area | 면적(㎡) | NUMBER(30,9) | N | 39.53 | 면적(㎡) |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0000 | 지 |  |
| response.body.items.item.mgmBldrgstPk | mgmBldrgstPk | 관리건축물대 장PK | VARCHAR(30) | Y | 10241116049 | 관리건축물 대장PK |  |

### 9.6.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0000</ji>

<mgmBldrgstPk>10241195364</mgmBldrgstPk>

<regstrGbCd>2</regstrGbCd>

<regstrGbCdNm>집합</regstrGbCdNm>

2024년 건축서비스산업 정보체계 유지관리 사업







<regstrKindCd>4</regstrKindCd>

<regstrKindCdNm>전유부</regstrKindCdNm>

<newPlatPlc>서울특별시 강남구 개포로109길 21 (개포동)</newPlatPlc>

<bldNm>대청아파트302동</bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<naRoadCd>116804166040</naRoadCd>

<naBjdongCd>10301</naBjdongCd>

<naUgrndCd>0</naUgrndCd>

<naMainBun>21</naMainBun>

<naSubBun>0</naSubBun>

<dongNm>302</dongNm>

<hoNm>407호</hoNm>

<flrGbCd>20</flrGbCd>

<flrGbCdNm>지상</flrGbCdNm>

<flrNo>4</flrNo>

<flrNoNm>4층</flrNoNm>

<exposPubuseGbCd>1</exposPubuseGbCd>

<exposPubuseGbCdNm>전유</exposPubuseGbCdNm>

<mainAtchGbCd>0</mainAtchGbCd>

<mainAtchGbCdNm>주건축물</mainAtchGbCdNm>

<strctCd>21</strctCd>

<strctCdNm>철근콘크리트구조</strctCdNm>

<etcStrct>철근콘크리트조</etcStrct>

<mainPurpsCd>02001</mainPurpsCd>

<mainPurpsCdNm>아파트</mainPurpsCdNm>

<etcPurps>아파트(일부공유면적포함)</etcPurps>

<area>39.53</area>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>2</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>13446</totalCount>

2024년 건축서비스산업 정보체계 유지관리 사업






  </body>
</response>
```


### 9.6.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getBrExposPubuseAreaInfo |
| Request DTO 후보 | BrExposPubuseAreaInfoRequest |
| Response DTO 후보 | BrExposPubuseAreaInfoResponse |
| Item DTO 후보 | BrExposPubuseAreaInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.6.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `전유부/전유공용면적 확인, 다세대·오피스텔 판단 보조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.7. 건축물대장 오수정화시설 조회

### 9.7.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getBrWclfInfo |
| Method | GET |
| Path | /getBrWclfInfo |
| Full URL | https://apis.data.go.kr/1613000/BldRgstHubService/getBrWclfInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장과 관련된 오수정화시설의 오수정화형식, 용량, 용량단위 등의 정보 를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 설비/위생 관련 체크리스트 보조 |
| 원문 위치 | page 56, 57, 58, 59 |

### 9.7.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| numOfRows | 리스트수 | VARCHAR2(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR2(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0000 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.7.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/BldRgstHubService/getBrWclfInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0000&serviceKey={SERVICE_KEY}
```

### 9.7.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(500) | N | 0000 | 지 |  |
| response.body.items.item.mgmBldrgstPk | mgmBldrgstPk | 관리건축물대 장PK | VARCHAR(30) | Y | 10241103 | 관리건축물 대장PK |  |
| response.body.items.item.regstrGbCd | regstrGbCd | 대장구분코드 | VARCHAR(30) | N | 2 | 대장구분코 드 |  |
| response.body.items.item.regstrGbCdNm | regstrGbCdNm | 대장구분코드 명 | VARCHAR(1000) | N | 집합 | 대장구분코 드명 |  |
| response.body.items.item.regstrKindCd | regstrKindCd | 대장종류코드 | VARCHAR(30) | N | 1 | 대장종류코 드 |  |
| response.body.items.item.regstrKindCdNm | regstrKindCdNm | 대장종류코드 명 | VARCHAR(1000) | N | 총괄표제부 | 대장종류코 드명 |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포로109길 5 (개포동) | 도로명대지 위치 |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 대치,대청 아파트 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 116804166040 | 새주소도로 코드 |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동 코드 | VARCHAR(30) | N | 10301 | 새주소법정 동코드 |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 0 | 새주소지상 지하코드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 5 | 새주소본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부번 |  |
| response.body.items.item.modeCd | modeCd | 형식코드 | VARCHAR(30) | N | 299 | 형식코드 |  |
| response.body.items.item.modeCdNm | modeCdNm | 형식코드명 | VARCHAR(1000) | N | 기타단독정화조 | 형식코드명 |  |
| response.body.items.item.etcMode | etcMode | 기타형식 | VARCHAR(1000) | N | 기타형식 |  |  |
| response.body.items.item.unitGbCd | unitGbCd | 단위구분코드 | VARCHAR(30) | N | 단위구분코 드 |  |  |
| response.body.items.item.unitGbCdNm | unitGbCdNm | 단위구분코드 명 | VARCHAR(1000) | N | 단위구분코 드명 |  |  |
| response.body.items.item.capaPsper | capaPsper | 용량(인용) | NUMBER(22,9) | N | 300 | 용량(인용) |  |
| response.body.items.item.capaLube | capaLube | 용량(루베) | NUMBER(22,9) | N | 0 | 용량(루베) |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |

### 9.7.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0000</ji>

<mgmBldrgstPk>10241103</mgmBldrgstPk>

<regstrGbCd>2</regstrGbCd>

<regstrGbCdNm>집합</regstrGbCdNm>

<regstrKindCd>1</regstrKindCd>

<regstrKindCdNm>총괄표제부</regstrKindCdNm>

<newPlatPlc>서울특별시 강남구 개포로109길 5 (개포동)</newPlatPlc>

<bldNm>대치,대청 아파트</bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<naRoadCd>116804166040</naRoadCd>

<naBjdongCd>10301</naBjdongCd>

<naUgrndCd>0</naUgrndCd>

<naMainBun>5</naMainBun>

<naSubBun>0</naSubBun>

<modeCd>299</modeCd>

<modeCdNm>기타단독정화조</modeCdNm>

<etcMode> </etcMode>

<unitGbCd> </unitGbCd>

<unitGbCdNm> </unitGbCdNm>

2024년 건축서비스산업 정보체계 유지관리 사업







<capaPsper>300</capaPsper>

<capaLube>0</capaLube>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>1</totalCount>
  </body>
</response>
```


### 9.7.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getBrWclfInfo |
| Request DTO 후보 | BrWclfInfoRequest |
| Response DTO 후보 | BrWclfInfoResponse |
| Item DTO 후보 | BrWclfInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.7.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `설비/위생 관련 체크리스트 보조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.8. 건축물대장 주택가격 조회

### 9.8.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getBrHsprcInfo |
| Method | GET |
| Path | /getBrHsprcInfo |
| Full URL | https://apis.data.go.kr/1613000/BldRgstHubService/getBrHsprcInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장 대상 주택의 가격정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 공시가격·보증금 위험도 참고 |
| 원문 위치 | page 62, 63, 64 |

### 9.8.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0000 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 1 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.8.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/BldRgstHubService/getBrHsprcInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0000&serviceKey={SERVICE_KEY}
```

### 9.8.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.bylotCnt | bylotCnt | 외필지수 | NUMBER(10) | N | 0 | 외필지수 |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 116804166040 | 새주소도로 코드 |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동 코드 | VARCHAR(30) | N | 10301 | 새주소법정 동코드 |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 0 | 새주소지상 지하코드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 9 | 새주소본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부번 |  |
| response.body.items.item.hsprc | hsprc | 주택가격 | NUMBER(30,9) | N | 621000000 | 주택가격 |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0000 | 지 |  |
| response.body.items.item.mgmBldrgstPk | mgmBldrgstPk | 관리건축물대 장PK | VARCHAR(30) | Y | 1024136633 | 관리건축물 대장PK |  |
| response.body.items.item.regstrGbCd | regstrGbCd | 대장구분코드 | VARCHAR(30) | N | 2 | 대장구분코 드 |  |
| response.body.items.item.regstrGbCdNm | regstrGbCdNm | 대장구분코드 명 | VARCHAR(1000) | N | 집합 | 대장구분코 드명 |  |
| response.body.items.item.regstrKindCd | regstrKindCd | 대장종류코드 | VARCHAR(30) | N | 4 | 대장종류코 드 |  |
| response.body.items.item.regstrKindCdNm | regstrKindCdNm | 대장종류코드 명 | VARCHAR(1000) | N | 전유부 | 대장종류코 드명 |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포로109길 9(개포동) | 도로명대지 위치 |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 대치아파트 제214동 | 건물명 |  |
| response.body.items.item.stdDay | stdDay | 기준일자 | VARCHAR(8) | N | 20200101 | 기준일자 |  |

### 9.8.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0000</ji>

<mgmBldrgstPk>1024136633</mgmBldrgstPk>

<regstrGbCd>2</regstrGbCd>

<regstrGbCdNm>집합</regstrGbCdNm>

<regstrKindCd>4</regstrKindCd>

<regstrKindCdNm>전유부</regstrKindCdNm>

<newPlatPlc>서울특별시 강남구 개포로109길 9 (개포동)</newPlatPlc>

<bldNm>대치아파트 제214동</bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<bylotCnt>0</bylotCnt>

<naRoadCd>116804166040</naRoadCd>

<naBjdongCd>10301</naBjdongCd>

<naUgrndCd>0</naUgrndCd>

<naMainBun>9</naMainBun>

<naSubBun>0</naSubBun>

<hsprc>621000000</hsprc>

<crtnDay>20220813</crtnDay>

<stdDay>20200101</stdDay>
      </item>

2024년 건축서비스산업 정보체계 유지관리 사업






    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>71288</totalCount>
  </body>
</response>
```


### 9.8.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getBrHsprcInfo |
| Request DTO 후보 | BrHsprcInfoRequest |
| Response DTO 후보 | BrHsprcInfoResponse |
| Item DTO 후보 | BrHsprcInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.8.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `공시가격·보증금 위험도 참고`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.9. 건축물대장 전유부 조회

### 9.9.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getBrExposInfo |
| Method | GET |
| Path | /getBrExposInfo |
| Full URL | https://apis.data.go.kr/1613000/BldRgstHubService/getBrExposInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장 전유부의 지번주소 및 새주소, 동/호명칭 등의 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 전유부/전유공용면적 확인, 다세대·오피스텔 판단 보조 |
| 원문 위치 | page 68, 69, 70 |

### 9.9.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0000 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.9.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/BldRgstHubService/getBrExposInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0000&serviceKey={SERVICE_KEY}
```

### 9.9.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0000 | 지 |  |
| response.body.items.item.mgmBldrgstPk | mgmBldrgstPk | 관리건축물대 장PK | VARCHAR(30) | Y | 1024195889 | 관리건축물 대장PK |  |
| response.body.items.item.regstrGbCd | regstrGbCd | 대장구분코드 | VARCHAR(30) | N | 2 | 대장구분코 드 |  |
| response.body.items.item.regstrGbCdNm | regstrGbCdNm | 대장구분코드 명 | VARCHAR(1000) | N | 집합 | 대장구분코 드명 |  |
| response.body.items.item.regstrKindCd | regstrKindCd | 대장종류코드 | VARCHAR(30) | N | 4 | 대장종류코 드 |  |
| response.body.items.item.regstrKindCdNm | regstrKindCdNm | 대장종류코드 명 | VARCHAR(1000) | N | 전유부 | 대장종류코 드명 |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포로109길 9 (개포동) | 도로명대지 위치 |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 대치아파트 212동 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 116804166040 | 새주소도로 코드 |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동 코드 | VARCHAR(30) | N | 10301 | 새주소법정 동코드 |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 0 | 새주소지상 지하코드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 9 | 새주소본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부번 |  |
| response.body.items.item.dongNm | dongNm | 동명칭 | VARCHAR(1000) | N | 212 | 동명칭 |  |
| response.body.items.item.hoNm | hoNm | 호명칭 | VARCHAR(1000) | N | 505호 | 호명칭 |  |
| response.body.items.item.flrGbCd | flrGbCd | 층구분코드 | VARCHAR(30) | N | 20 | 층구분코드 |  |
| response.body.items.item.flrGbCdNm | flrGbCdNm | 층구분코드명 | VARCHAR(1000) | N | 지상 | 층구분코드 명 |  |
| response.body.items.item.flrNo | flrNo | 층번호 | NUMBER(5) | N | 8 | 층번호 |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |

### 9.9.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0000</ji>

<mgmBldrgstPk>1024195889</mgmBldrgstPk>

<regstrGbCd>2</regstrGbCd>

<regstrGbCdNm>집합</regstrGbCdNm>

<regstrKindCd>4</regstrKindCd>

<regstrKindCdNm>전유부</regstrKindCdNm>

<newPlatPlc>서울특별시 강남구 개포로109길 9 (개포동)</newPlatPlc>

<bldNm>대치아파트212동</bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<naRoadCd>116804166040</naRoadCd>

<naBjdongCd>10301</naBjdongCd>

2024년 건축서비스산업 정보체계 유지관리 사업







<naUgrndCd>0</naUgrndCd>

<naMainBun>9</naMainBun>

<naSubBun>0</naSubBun>

<dongNm>212</dongNm>

<hoNm>505호</hoNm>

<flrGbCd>20</flrGbCd>

<flrGbCdNm>지상</flrGbCdNm>

<flrNo>5</flrNo>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>1</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>4304</totalCount>
  </body>
</response>
```


### 9.9.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getBrExposInfo |
| Request DTO 후보 | BrExposInfoRequest |
| Response DTO 후보 | BrExposInfoResponse |
| Item DTO 후보 | BrExposInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.9.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `전유부/전유공용면적 확인, 다세대·오피스텔 판단 보조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.10. 건축물대장 지역지구구역 조회

### 9.10.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getBrJijiguInfo |
| Method | GET |
| Path | /getBrJijiguInfo |
| Full URL | https://apis.data.go.kr/1613000/BldRgstHubService/getBrJijiguInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축물대 장과 관련된 지역/지구/구역의 구분 및 명칭, 대표여부 등의 정보를 제 공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 용도지역·지구·구역 확인 및 목적별 체크리스트 |
| 원문 위치 | page 72, 74, 75 |

### 9.10.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0000 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.10.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/BldRgstHubService/getBrJijiguInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0000&serviceKey={SERVICE_KEY}
```

### 9.10.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0000 | 지 |  |
| response.body.items.item.mgmBldrgstPk | mgmBldrgstPk | 관리건축물대 장PK | VARCHAR(30) | Y | 10241915 | 관리건축물 대장PK |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포로109길 9 (개포동) | 도로명대지 위치 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.jijiguGbCd | jijiguGbCd | 지역지구구역 구분코드 | VARCHAR(30) | N | 1 | 지역지구구 역구분코드 |  |
| response.body.items.item.jijiguGbCdNm | jijiguGbCdNm | 지역지구구역 구분코드명 | VARCHAR(1000) | N | 용도지역코드 | 지역지구구 역구분코드 명 |  |
| response.body.items.item.jijiguCd | jijiguCd | 지역지구구역 코드 | VARCHAR(30) | N | 1020 | 지역지구구 역코드 |  |
| response.body.items.item.jijiguCdNm | jijiguCdNm | 지역지구구역 코드명 | VARCHAR(1000) | N | 일반주거지역 | 지역지구구 역코드명 |  |
| response.body.items.item.reprYn | reprYn | 대표여부 | VARCHAR(1) | N | 1 | 0: 일반 1: 대표 |  |
| response.body.items.item.etcJijigu | etcJijigu | 기타지역지구구역 | VARCHAR(1000) | N | 일반주거지역 | 기타지역지 구구역 |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |

### 9.10.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>

<item>


<rnum>1</rnum>


<platPlc>서울특별시 강남구 개포동 12번지</platPlc>


<sigunguCd>11680</sigunguCd>


<bjdongCd>10300</bjdongCd>


<platGbCd>0</platGbCd>


<bun>0012</bun>


<ji>0000</ji>


<mgmBldrgstPk>10241915</mgmBldrgstPk>


<newPlatPlc>서울특별시 강남구 개포로109길 9 (개포동)</newPlatPlc>


<splotNm> </splotNm>


<block> </block>


<lot> </lot>


<jijiguGbCd>1</jijiguGbCd>


<jijiguGbCdNm>용도지역코드</jijiguGbCdNm>


<jijiguCd>1020</jijiguCd>


<jijiguCdNm>일반주거지역</jijiguCdNm>


<reprYn>1</reprYn>

2024년 건축서비스산업 정보체계 유지관리 사업








<etcJijigu>일반주거지역</etcJijigu>


<crtnDay>20220813</crtnDay>


</item>


<item>


<rnum>2</rnum>


<platPlc>서울특별시 강남구 개포동 12번지</platPlc>


<sigunguCd>11680</sigunguCd>


<bjdongCd>10300</bjdongCd>


<platGbCd>0</platGbCd>


<bun>0012</bun>


<ji>0000</ji>


<mgmBldrgstPk>10241915</mgmBldrgstPk>


<newPlatPlc>서울특별시 강남구 개포로109길 9 (개포동)</newPlatPlc>


<splotNm> </splotNm>


<block> </block>


<lot> </lot>


<jijiguGbCd>3</jijiguGbCd>


<jijiguGbCdNm>용도구역코드</jijiguGbCdNm>


<jijiguCd>300</jijiguCd>


<jijiguCdNm>지구단위계획구역</jijiguCdNm>


<reprYn>1</reprYn>


<etcJijigu>지구단위계획구역</etcJijigu>


<crtnDay>20220813</crtnDay>

</item>
    </items>
    <numOfRows>1</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>57</totalCount>
  </body>
</response>
```


### 9.10.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getBrJijiguInfo |
| Request DTO 후보 | BrJijiguInfoRequest |
| Response DTO 후보 | BrJijiguInfoResponse |
| Item DTO 후보 | BrJijiguInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.10.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `용도지역·지구·구역 확인 및 목적별 체크리스트`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


## 10. 코드표 / Enum / 분류값

| 분류 | 코드 | 의미 | ZIP:ON 처리 |
| --- | --- | --- | --- |
| platGbCd | 0 | 대지 | 대지 기준 조회 |
| platGbCd | 1 | 산 | 산번지/임야 가능성 안내 |
| platGbCd | 2 | 블록 | 블록 지번. 주소 파싱 결과 검증 필요 |
| resultCode | 00 | NORMAL SERVICE | 성공 처리 |

## 11. 에러 코드

| 코드 | 메시지 | 의미 | 백엔드 처리 방안 | 사용자 노출 메시지 |
| --- | --- | --- | --- | --- |
| 00 | NORMAL SERVICE | 정상 | 성공 처리 |  |
| 01 | APPLICATION_ERROR | 어플리케이션 에러 | 일시 장애 또는 제공기관 오류로 기록하고 재시도 가능 여부 판단 | 잠시 후 다시 시도해주세요. |
| 02 | DB_ERROR | 데이터베이스 에러 | 제공기관 DB 오류. 재시도 후 지속 시 관리자 확인 | 공공데이터 제공기관 응답이 불안정합니다. |
| 04 | HTTP_ERROR | HTTP 에러 | HTTP 상태코드와 본문을 함께 로깅 | 공공데이터 호출 중 오류가 발생했습니다. |
| 05 | SERVICETIMEOUT_ERROR | 서비스 연결 실패 에러 | 타임아웃 처리, 회로차단/재시도 정책 적용 | 공공데이터 응답이 지연되고 있습니다. |
| 10 | INVALID_REQUEST_PARAMETER_ERROR | 잘못된 요청 파라미터 에러 | 사용자 입력 또는 주소 파싱 결과 검증 | 입력한 주소 정보를 다시 확인해주세요. |
| 11 | NO_MANDATORY_REQUEST_PARAMETERS_ERROR | 필수 요청 파라미터 없음 | 백엔드 요청 DTO 검증 실패로 처리 | 필수 조회 조건이 부족합니다. |
| 12 | NO_OPENAPI_SERVICE_ERROR | 해당 OpenAPI 서비스가 없거나 폐기됨 | 엔드포인트/서비스명 변경 여부 확인 | 현재 해당 공공데이터 서비스를 사용할 수 없습니다. |
| 20 | SERVICE_ACCESS_DENIED_ERROR | 서비스 접근거부 | 서비스키 권한/활용신청 상태 점검 | 공공데이터 인증 설정 확인이 필요합니다. |
| 21 | TEMPORARILY_DISABLE_THE_SERVICEKEY_ERROR | 일시적으로 사용할 수 없는 서비스키 | 키 상태 확인, 다른 키 전환 가능성 검토 | 공공데이터 인증키가 일시적으로 사용할 수 없습니다. |
| 22 | LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR | 서비스 요청 제한 횟수 초과 | 쿼터 초과. 캐시/백오프/운영 알림 | 공공데이터 일일 요청 한도를 초과했습니다. |
| 30 | SERVICE_KEY_IS_NOT_REGISTERED_ERROR | 등록되지 않은 서비스키 | 환경변수/URL 인코딩/활용신청 확인 | 공공데이터 인증키 설정 확인이 필요합니다. |
| 31 | DEADLINE_HAS_EXPIRED_ERROR | 기한 만료된 서비스키 | 서비스키 재발급 또는 활용기간 연장 | 공공데이터 인증키가 만료되었습니다. |
| 99 | UNKNOWN_ERROR | 기타 에러 | 원문 응답 전문 저장 후 관리자 확인 | 공공데이터 조회 중 알 수 없는 오류가 발생했습니다. |

## 12. 데이터 저장/캐시 전략

| 데이터 | 추천 처리 | 이유 |
| --- | --- | --- |
| 원천 응답 전문 | 선택 저장 | 재현성·디버깅·감사 목적이 있을 때만 저장. 저장 시 요청 파라미터와 resultCode 포함. |
| 주요 응답 필드 | DB 저장 또는 긴 TTL 캐시 | 건축물/인허가/폐쇄말소 정보는 자주 변하지 않으므로 반복 조회 비용을 줄일 수 있음. |
| 주소별 조회 결과 | Redis 단기 캐시 | 사용자가 같은 매물을 반복 진단할 가능성이 높음. |
| 코드표 | DB 또는 enum 상수 | platGbCd, resultCode, 점검기관구분 등은 코드 해석에 반복 사용. |
| 에러 응답 | 로그 저장 | 운영 추적, 키 만료, 파라미터 오류, 제공기관 장애 구분. |
| 조회 결과 없음 | 짧은 TTL 캐시 | 없는 주소/조건 반복 호출 방지. 단, 데이터 갱신 가능성을 고려해 짧게 유지. |

## 13. 구현 시 주의사항

- URL 파라미터에 한글이 포함될 수 있으면 UTF-8 URL 인코딩한다.

- `serviceKey`는 인코딩된 키/디코딩된 키 처리 방식이 공공데이터포털에서 혼동되기 쉬우므로 실제 호출 테스트를 분리한다.

- `bun`, `ji`, `sigunguCd`, `bjdongCd`, PK류는 숫자가 아니라 문자열로 처리한다.

- `items.item`은 XML/JSON 변환 시 단건 객체 또는 배열로 달라질 수 있으므로 커스텀 deserializer 또는 리스트 정규화 로직을 둔다.

- 원문 표의 `필/옵`, `1/0`, `1..n/0..n` 표기가 문서별로 다르므로 내부 DTO에서는 `required`를 명시적으로 통일한다.

- 일부 문서의 서비스 개요는 REST (GET, POST, PUT, DELETE)로 표기되지만 상세 요청 예시는 GET이다. 구현은 GET 기준으로 시작하고 필요 시 원문/포털 확인.

- `_type=json`은 일부 예시에 등장하지만 요청 필드 표에 없는 경우가 많다. JSON 사용 전 실제 응답 구조를 테스트해야 한다.

- 공공데이터 장애, 타임아웃, 일일 트래픽 제한, 키 만료를 구분해 사용자 메시지와 운영 알림을 분리한다.


## 14. API 조합 가능성

| 조합 대상 API | 조합 목적 | 기대 결과 | 주의사항 |
| --- | --- | --- | --- |
| 주소 API/법정동코드 API | 도로명·지번 정규화 후 sigunguCd/bjdongCd/bun/ji 생성 | 정확한 건축HUB 조회 조건 확보 | 주소 후보가 여러 개면 사용자 선택 필요 |
| GIS건물통합정보 | 좌표/건물 존재 확인과 건축물대장 속성 대조 | 건물 단위 식별 정확도 향상 | 건물군/동/호 매칭 모호성 처리 필요 |
| 실거래가 API 묶음 | 유형별 매매/전월세 실거래 비교 | 전세가율·월세 적정성·매매 가격 위험도 산정 | 유형 판별 후 API 선택 필요 |
| 공동주택가격/개별주택가격/공시지가 API | 공시가격 기반 보증금·가격 리스크 참고 | 보증보험/가격 위험도 설명 보조 | 공시가격은 현재 시세가 아님 |
| 등기부등본 업로드/OCR | 소유자·근저당·신탁·압류 등 권리관계 확인 | 계약 전 핵심 위험 보강 | 공공데이터 API만으로 확정 불가 |
| 중개업소/사업자/인허가 데이터 | 계약 상대방·중개사·영업 가능성 보조 확인 | 체크리스트 고도화 | 개별 계약의 법적 판단으로 단정 금지 |


# 외부 API 명세 - 건축HUB 건축물유지점검정보 서비스

## 1. 원본 파일 분석

| 항목 | 내용 |
| --- | --- |
| 원본 파일명 | OpenAPI활용가이드-_건축HUB_건축물유지점검_1.0.docx |
| 파일 형식 | DOCX |
| 문서명 | OpenAPI 활용가이드 |
| 문서 버전 | 1.0 |
| 작성/개정일 | 2024-10-01 |
| 제공기관 | 국토교통부 |
| 서비스명 국문 | 건축HUB 건축물유지점검정보 서비스 |
| 서비스명 영문 | MtnChkHubService |
| 서비스 설명 | 건축물 생애이력 관리시스템에서 수집하는 유지관리 점검기관과 정기점검이력 정보를 제공한다. |
| 데이터 갱신주기 | 월 1회 |
| 원문 구조 | DOCX / 페이지 수: 확인 필요 / 오퍼레이션 2개 |
| 비고 | 원문 표/샘플 URL/샘플 응답을 구현용 구조로 재배치. OCR·파싱상 줄바꿈으로 끊어진 필드명은 가능한 복원했으며 불확실한 항목은 원문 확인 필요. |

## 2. 원본 구조 요약

| 구분 | 원문 위치 | 내용 | 구현 관련성 |
| --- | --- | --- | --- |
| 서비스 개요 | 초반 서비스 명세 | 서비스명, 인증 방식, REST, XML/JSON 지원 여부, Base URL | 높음 |
| 서비스 Key 발급 및 활용 | 서비스 사용 장 | data.go.kr 활용신청 화면 및 serviceKey 사용 방식 | 보통 |
| 페이징 설명 | 서비스 사용 장 | numOfRows, pageNo, totalCount 기반 반복 호출 | 높음 |
| 오퍼레이션 목록 | 서비스 명세 장 | 2개 오퍼레이션 | 높음 |
| 오퍼레이션별 요청/응답 명세 | 각 오퍼레이션 명세 | 요청 파라미터, 응답 필드, 샘플 URL, XML 응답 예시 | 높음 |
| 에러 코드 | 문서 말미 또는 공공데이터 공통 | resultCode/resultMsg 및 에러코드 처리 | 높음 |

## 3. ZIP:ON 적용 판단

### 3.1 적용 가능 영역

| ZIP:ON 기능 영역 | 적용 가능 여부 | 활용 방식 | 중요도 |
| --- | --- | --- | --- |
| 주소 정제 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 법정동코드 변환 | 보조 | 시군구/법정동/번/지 또는 점검기관 등재 시도코드로 조회 | 선택 |
| 물건 유형 판별 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 건축물 기본정보 확인 | 보조 | 정기점검기관 및 정기점검이력으로 건물 유지관리 상태 확인 | 중요 |
| 토지·임야 기본정보 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 실거래가 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 공시가격·공시지가 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 전세 위험도 계산 | 보조 | 노후·관리 리스크 설명 보조. 보증금 회수 위험의 직접 근거는 아님 | 선택 |
| 월세 적정성 판단 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 매매 위험도 계산 | 보조 | 점검이력·점검기관 확인을 매매 전 실사 체크리스트에 반영 | 선택 |
| 용도지역·지구·구역 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 생활 인프라 분석 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 상권 분석 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 환경·재난 리스크 분석 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 계약 상대방·중개사 확인 | 불가능 | 점검기관 정보는 중개사/임대인 확인 API가 아님 | 선택 |
| 체크리스트 생성 | 가능 | 정기점검 여부와 건물관리 자료 요청 항목 생성 | 중요 |

### 3.2 적용 판단 요약

건축물유지점검 API는 정기점검기관과 정기점검이력을 제공한다. ZIP:ON에서는 건물 유지관리 상태와 노후·관리 리스크 설명에 보조적으로 쓰인다. 전세 보증금 위험도 자체를 산정하는 핵심 API는 아니지만, 계약 전 “관리 상태 자료 확인”, “정기점검 이력 확인” 같은 체크리스트를 만들 수 있다. 점검기관 데이터는 월 1회 갱신으로 원문에 표기되어 있어 DB 저장 또는 긴 TTL 캐시 후보다.

## 4. 서비스 기본 정보

| 항목 | 내용 |
| --- | --- |
| Base URL | http://apis.data.go.kr/1613000/MtnChkHubService |
| 운영환경 URL | http://apis.data.go.kr/1613000/MtnChkHubService |
| 개발환경 URL | http://apis.data.go.kr/1613000/MtnChkHubService |
| 프로토콜 | REST |
| HTTP Method | GET 샘플 기준. 일부 서비스 개요 표에는 REST (GET, POST, PUT, DELETE)로 표기된 문서가 있으나 상세 예시는 GET임. |
| 인증 방식 | serviceKey |
| 요청 데이터 형식 | query parameter |
| 응답 데이터 형식 | XML, JSON 여부 확인 필요 |
| 평균 응답시간 | 500 ms |
| TPS 제한 | 30 tps |
| 메시지 크기 제한 | bytes 값 원문 공란 - 확인 필요 |
| WADL/Swagger/OpenAPI 여부 | WADL N/A 또는 서비스 명세 URL 원문 표기. Swagger/OpenAPI 스키마 없음. |
| 비고 | 시군구코드와 법정동코드는 행정표준코드관리시스템의 법정동코드 기준. |

## 5. 인증 방식

### 5.1 인증 파라미터

| 파라미터 | 위치 | 필수 | 설명 |
| --- | --- | --- | --- |
| serviceKey | query | Y | 공공데이터포털에서 발급받은 인증키. URL Encode 필요. 실제 문서/코드에는 `{SERVICE_KEY}`로 치환. |

### 5.2 인증 예시

```http
GET http://apis.data.go.kr/1613000/MtnChkHubService/getInspectionAgency?serviceKey={SERVICE_KEY}
```

## 6. 공통 요청 규칙

| 파라미터 | 타입 | 필수 | 예시 | 설명 |
| --- | --- | --- | --- | --- |
| serviceKey | VARCHAR/String | Y | {SERVICE_KEY} | 인증키 |
| sigunguCd | VARCHAR(30) 또는 문서별 상이 | Y | 11680 | 시군구코드. 유지점검기관 조회 등 일부 오퍼레이션은 다른 필수 조건을 사용. |
| bjdongCd | VARCHAR(30) 또는 문서별 상이 | Y | 10300 | 법정동코드. 유지점검기관 조회 등 일부 오퍼레이션은 선택/미사용 가능. |
| platGbCd | VARCHAR(30) | N | 0 | 대지구분코드. 0: 대지, 1: 산, 2: 블록. |
| bun | VARCHAR(20) | N | 0012 | 본번. 앞자리 0 보존 필요. |
| ji | VARCHAR(20) | N | 0000 | 부번. 앞자리 0 보존 필요. |
| startDate | VARCHAR(30) | N | YYYYMMDD | 검색시작일. 지원 여부는 오퍼레이션별 원문 기준. |
| endDate | VARCHAR(30) | N | YYYYMMDD | 검색종료일. 지원 여부는 오퍼레이션별 원문 기준. |
| numOfRows | VARCHAR(3) 또는 숫자 | N | 10 | 페이지당 목록 수. 원문상 1회 최대 100건 제한. |
| pageNo | VARCHAR(3) 또는 숫자 | N | 1 | 페이지 번호. 1부터 시작. |
| _type | String | N | json | PDF 일부 예시에 등장. 요청 파라미터 표에는 없는 경우가 많으므로 서비스별 실제 지원 확인 필요. |

## 7. 페이징 규칙

원문 공통 설명 기준으로 1회 요청 가능한 목록 수(`numOfRows`)는 최대 100건이다. 전체 목록이 필요하면 최초 요청의 `totalCount`를 확인한 뒤 `pageNo`를 1부터 전체 페이지 수까지 반복 호출한다.

```text
totalPages = ceil(totalCount / numOfRows)
for pageNo in 1..totalPages:
    call API with same search condition and pageNo
```

구현 시 `totalCount == 0`, `items.item` 단건 객체/배열 차이, 공공데이터 장애 시 재시도 횟수를 반드시 처리한다.

## 8. 오퍼레이션 목록

| 번호 | 오퍼레이션명 | 국문명 | 설명 | ZIP:ON 활용 |
| --- | --- | --- | --- | --- |
| 1 | getInspectionAgency | 유지점검 정기점검 기관 조회 | 건축물 생애이력 관리시스템에서 수집하는 건축물 유지점검을 수행한 점검기관과 관련된 점검기관 등재 시도, 점검기관명, 주소, 영업상태, 신청규모 등의 정보를 제공한다. 건축물 생애이력 관리시스템에서 수집하는 건축물 유지점검을 수행한 점검기관과 관련된 점검기관 등재 시도, 점검기관명, 주소, 영업상태, 신청규모 등의 정보를 제공한다. 건축물 생애이력 관리시스템에서 수집하는 건축물 유지점검을 수행한 점검기관과 관련된 점검기관 등재 시도, 점검기관명, 주소, 영업상태, 신청규모 등의 정보를 제공한다. | 건물 유지점검 상태 확인 및 체크리스트 생성 |
| 2 | getMaintenanceHistory | 유지점검 정기점검이력 조회 | 건축물 생애이력 관리시스템에서 수집하는 건축물 유지점검을 수행한 점검이력과 관련된 시군구코드, 법정동코드, 번, 지, 건축물명, 동명, 점검기관명, 점검시작일, 승인일시 등의 정보를 제공한다. 건축물 생애이력 관리시스템에서 수집하는 건축물 유지점검을 수행한 점검이력과 관련된 시군구코드, 법정동코드, 번, 지, 건축물명, 동명, 점검기관명, 점검시작일, 승인일시 등의 정보를 제공한다. 건축물 생애이력 관리시스템에서 수집하는 건축물 유지점검을 수행한 점검이력과 관련된 시군구코드, 법정동코드, 번, 지, 건축물명, 동명, 점검기관명, 점검시작일, 승인일시 등의 정보를 제공한다. | 건물 유지점검 상태 확인 및 체크리스트 생성 |

## 9. 오퍼레이션 상세


---

## 9.1. 유지점검 정기점검 기관 조회

### 9.1.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getInspectionAgency |
| Method | GET |
| Path | /getInspectionAgency |
| Full URL | http://apis.data.go.kr/1613000/MtnChkHubService/getInspectionAgency |
| 설명 | 건축물 생애이력 관리시스템에서 수집하는 건축물 유지점검을 수행한 점검기관과 관련된 점검기관 등재 시도, 점검기관명, 주소, 영업상태, 신청규모 등의 정보를 제공한다. 건축물 생애이력 관리시스템에서 수집하는 건축물 유지점검을 수행한 점검기관과 관련된 점검기관 등재 시도, 점검기관명, 주소, 영업상태, 신청규모 등의 정보를 제공한다. 건축물 생애이력 관리시스템에서 수집하는 건축물 유지점검을 수행한 점검기관과 관련된 점검기관 등재 시도, 점검기관명, 주소, 영업상태, 신청규모 등의 정보를 제공한다. |
| 평균 응답시간 | [500] ms |
| TPS 제한 | [30] tps |
| ZIP:ON 활용 위치 | 건물 유지점검 상태 확인 및 체크리스트 생성 |
| 원문 위치 | 확인 필요 |

### 9.1.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| serviceKey | 인증키 | 100 | Y | 인증키 (URL Encode) | 공공데이터포털에서 발급받은 인증키 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 한 페이지 결과 수 | 0 | 10 | 한 페이지 결과 수 |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지 번호 | 0 | Y | 페이지 번호 |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| mgmRegSidoCd | 점검기관 등재 시도 코드 | 30 | Y | 11 | 검색을 원하는 점검기관이 등재 된 시도 코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| chkInsttNm | 점검기관명 | 1000 | N | 시담 | 검색을 원하는 점검기관명 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.1.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/MtnChkHubService/getInspectionAgency?numOfRows=10&pageNo=1&mgmRegSidoCd=11&chkInsttNm=시담&serviceKey={SERVICE_KEY}
```

### 9.1.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.resultCode | resultCode | 결과코드 | 2 | Y | 00 | 결과코드 |  |
| response.resultMsg | resultMsg | 결과메세지 | 50 | Y | NORMAL SERVICE | 결과메시지 |  |
| response.numOfRows | numOfRows | 한 페이지 결과 수 | 4 | Y | 10 | 한 페이지당 표출 데이터 수 |  |
| response.pageNo | pageNo | 페이지 수 | 4 | Y | 1 | 페이지 수 |  |
| response.totalCount | totalCount | 데이터 총 개수 | 4 | Y | 1 | 데이터 총 개수 |  |
| response.body.items.item.mgmRegSidoCd | mgmRegSidoCd | 점검기관등재시도코드 | 30 | N | 11 | 점검기관이 등재 된 시도 코드 |  |
| response.body.items.item.mgmRegSido | mgmRegSido | 점검기관등재시도 | 1000 | N | 서울특별시 | 점검기관이 등재 된 시도 명 |  |
| response.body.items.item.chkInsttNm | chkInsttNm | 점검기관명 | 1000 | N | (주)종합건축사사무소 시담 | 점검 기관 명 |  |
| response.body.items.item.mgmInsttNmstPk | mgmInsttNmstPk | 점검기관명부PK | 30 | N | 11140 | 점검 기관 명부 PK |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코드 | 30 | N | 115604154617 | 새주소 도로 코드 |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동코드 | 30 | N | 12900 | 새주소 법정동 코드 |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지하코드 | 30 | N | 0 | 새주소 지상 지하 코드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | 20 | N | 21 | 새주소 본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | 20 | N | 0 | 새주소 부번 |  |
| response.body.items.item.sigunguCd | sigunguCd | 소재지시군구코드 | 30 | N | 11560 | 소재지 시분구 코드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 소재지법정동코드 | 30 | N | 12900 | 소재지 법정동 코드 |  |
| response.body.items.item.bun | bun | 소재지번 | 20 | N | 0106 | 소재지 번 |  |
| response.body.items.item.ji | ji | 소재지지 | 20 | N | 0001 | 소재지 지 |  |
| response.body.items.item.bldNm | bldNm | 건물명 | 200 | N | 선유도 코오롱디지털타워 | 건물명 |  |
| response.body.items.item.operState | operState | 영업상태코드 | 30 | N | 01 | 영업상태 코드 |  |
| response.body.items.item.operStateNm | operStateNm | 영업상태명 | 1000 | N | 작성 | 영업상태 코드 명 |  |
| response.body.items.item.appliScaleCd | appliScaleCd | 신청규모코드 | 30 | N | 20 | 신청규모 코드 |  |
| response.body.items.item.appliScaleCdNm | appliScaleCdNm | 신청규모코드명 | 1000 | N | 3천㎡이상 1만㎡미만,1만㎡이상 | 신청규모 코드 명 |  |
| response.body.items.item.safeDinssYn | safeDinssYn | 안전진단여부 | 1 | N | N | 안전진단 여부 |  |
| response.body.items.item.chckDinssYn | chckDinssYn | 점검진단여부 | 1 | N | Y | 점검진단 여부 |  |
| response.body.items.item.chkInsttGbCd | chkInsttGbCd | 점검기관구분코드 | 30 | N | 01 | 점검기관 구분 코드 01:건축사사무소 02:건설기술용역업자 03:안전진단전문기관 04:국토안전관리원 05:기술사사무소 06:한국부동산원 07:한국토지주택공사 |  |
| response.body.items.item.regDtime | regDtime | 등록일시 | 30 | N | 20240517 | 최초 접수 일시 |  |
| response.body.items.item.lastTrsctDtime | lastTrsctDtime | 변경일시 | 30 | N | 20240812 | 최종 처리 일시 |  |

### 9.1.5 응답 예시

```xml
<response> <header> <resultCode>00</resultCode> <resultMsg>NORMAL SERVICE</resultMsg> </header> <body> <items> <item> <rnum>1</rnum> <mgmRegSidoCd>11</mgmRegSidoCd> <mgmRegSido>서울특별시</mgmRegSido> <chkInsttNm>(주)종합건축사사무소 시담</chkInsttNm> <mgmInsttNmstPk>11140</mgmInsttNmstPk> <naRoadCd>115604154617</naRoadCd> <naBjdongCd>12900</naBjdongCd> <naUgrndCd>0</naUgrndCd> <naMainBun>21</naMainBun> <naSubBun>0</naSubBun> <sigunguCd>11560</sigunguCd> <bjdongCd>12900</bjdongCd> <bun>0106</bun> <ji>0001</ji> <bldNm>선유도 코오롱디지털타워</bldNm> <operState>01</operState> <operStateNm>작성</operStateNm> <appliScaleCd>20</appliScaleCd> <appliScaleCdNm>3천㎡이상 1만㎡미만</appliScaleCdNm> <safeDinssYn>N</safeDinssYn> <chckDinssYn>Y</chckDinssYn> <chkInsttGbCd>01</chkInsttGbCd> <regDtime>20240517</regDtime> <lastTrsctDtime>20240812</lastTrsctDtime> </item> </items> <numOfRows>10</numOfRows> <pageNo>1</pageNo> <totalCount>1</totalCount> </body> </response>
```


### 9.1.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getInspectionAgency |
| Request DTO 후보 | InspectionAgencyRequest |
| Response DTO 후보 | InspectionAgencyResponse |
| Item DTO 후보 | InspectionAgencyItem |
| DB 저장 필요 여부 | DB 저장 또는 긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.1.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `건물 유지점검 상태 확인 및 체크리스트 생성`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.2. 유지점검 정기점검이력 조회

### 9.2.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getMaintenanceHistory |
| Method | GET |
| Path | /getMaintenanceHistory |
| Full URL | http://apis.data.go.kr/1613000/MtnChkHubService/getMaintenanceHistory |
| 설명 | 건축물 생애이력 관리시스템에서 수집하는 건축물 유지점검을 수행한 점검이력과 관련된 시군구코드, 법정동코드, 번, 지, 건축물명, 동명, 점검기관명, 점검시작일, 승인일시 등의 정보를 제공한다. 건축물 생애이력 관리시스템에서 수집하는 건축물 유지점검을 수행한 점검이력과 관련된 시군구코드, 법정동코드, 번, 지, 건축물명, 동명, 점검기관명, 점검시작일, 승인일시 등의 정보를 제공한다. 건축물 생애이력 관리시스템에서 수집하는 건축물 유지점검을 수행한 점검이력과 관련된 시군구코드, 법정동코드, 번, 지, 건축물명, 동명, 점검기관명, 점검시작일, 승인일시 등의 정보를 제공한다. |
| 평균 응답시간 | [500] ms |
| TPS 제한 | [30] tps |
| ZIP:ON 활용 위치 | 건물 유지점검 상태 확인 및 체크리스트 생성 |
| 원문 위치 | 확인 필요 |

### 9.2.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| serviceKey | 인증키 | 100 | Y | 인증키 (URL Encode) | 공공데이터포털에서 발급받은 인증키 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 한 페이지 결과 수 | 0 | 10 | 한 페이지 결과 수 |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지 번호 | 0 | Y | 페이지 번호 |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| sigunguCd | 시군구 코드 | 5 | Y | 11680 | 검색을 원하는 시군구 코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동 코드 | 5 | N | 10100 | 검색을 원하는 법정동 코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | 4 | N | 0603 | 검색을 원하는 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | 4 | N | 0007 | 검색을 원하는 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bldNm | 건축물 명 | 100 | N | 신논현 마에스트로 | 검색을 원하는 건축물 명 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| dongNm | 동 명 | 100 | N | 검색을 원하는 동 명 |  | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.2.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/MtnChkHubService/getMaintenanceHistory?numOfRows=10&pageNo=1&sigunguCd=11680&bjdongCd=10100&bun=0603&ji=0007&dongNm=한국시설안전평가원&serviceKey={SERVICE_KEY}
```

### 9.2.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.resultCode | resultCode | 결과코드 | 2 | Y | 00 | 결과코드 |  |
| response.resultMsg | resultMsg | 결과메세지 | 50 | Y | NORMAL SERVICE | 결과메시지 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | 30 | Y | 11680 | 시군구 코드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | 30 | N | 10100 | 법정동 코드 |  |
| response.body.items.item.bun | bun | 번 | 20 | N | 0603 | 번 |  |
| response.body.items.item.ji | ji | 지 | 20 | N | 0007 | 지 |  |
| response.body.items.item.bldNm | bldNm | 건축물명 | 200 | N | 신논현 마에스트로 | 건축물 명 |  |
| response.body.items.item.dongNm | dongNm | 동명 | 1000 | N | 신논현 마에스트로 | 동 명 |  |
| response.body.items.item.chkOprtnPk | chkOprtnPk | 점검실시PK | 30 | N | 26710 | 점검실시 PK |  |
| response.body.items.item.mgmBldrgstPk | mgmBldrgstPk | 건축물관리대장PK | 50 | N | 11680-100225049 | 건축물관리대장 PK |  |
| response.body.items.item.chkCoNm | chkCoNm | 점검기관명 | 1000 | N | (주)아키씨엠종합건축사사무소 | 점검 기관 명 |  |
| response.body.items.item.chkStrtDay | chkStrtDay | 점검시작일 | 8 | N | 20210301 | 점검 시작 일 |  |
| response.body.items.item.submitDe | submitDe | 승인일시 | 8 | N | 20210518 | 승인 일시 |  |

### 9.2.5 응답 예시

```xml
<response> <header> <resultCode>00</resultCode> <resultMsg>NORMAL SERVICE</resultMsg> </header> <body> <items> <item> <rnum>1</rnum> <sigunguCd>11680</sigunguCd> <bjdongCd>10100</bjdongCd> <bun>0603</bun> <ji>0007</ji> <bldNm>신논현 마에스트로</bldNm> <dongNm>신논현 마에스트로</dongNm> <chkOprtnPk>26710</chkOprtnPk> <mgmBldrgstPk>11680-100225049</mgmBldrgstPk> <chkCoNm>(주)아키씨엠종합건축사사무소</chkCoNm> <chkStrtDay>20210301</chkStrtDay> <submitDe>20210518</submitDe> </item> <item> <rnum>2</rnum> <sigunguCd>11680</sigunguCd> <bjdongCd>10100</bjdongCd> <bun>0603</bun> <ji>0007</ji> <bldNm>신논현 마에스트로</bldNm> <dongNm>신논현 마에스트로</dongNm> <chkOprtnPk>109906</chkOprtnPk> <mgmBldrgstPk>11680-100225049</mgmBldrgstPk> <chkCoNm>한국시설안전평가원</chkCoNm> <chkStrtDay>20240215</chkStrtDay> <submitDe>20240322</submitDe> </item> </items> <numOfRows>10</numOfRows> <pageNo>1</pageNo> <totalCount>2</totalCount> </body> </response>
```


### 9.2.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getMaintenanceHistory |
| Request DTO 후보 | MaintenanceHistoryRequest |
| Response DTO 후보 | MaintenanceHistoryResponse |
| Item DTO 후보 | MaintenanceHistoryItem |
| DB 저장 필요 여부 | DB 저장 또는 긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.2.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `건물 유지점검 상태 확인 및 체크리스트 생성`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


## 10. 코드표 / Enum / 분류값

| 분류 | 코드 | 의미 | ZIP:ON 처리 |
| --- | --- | --- | --- |
| platGbCd | 0 | 대지 | 대지 기준 조회 |
| platGbCd | 1 | 산 | 산번지/임야 가능성 안내 |
| platGbCd | 2 | 블록 | 블록 지번. 주소 파싱 결과 검증 필요 |
| resultCode | 00 | NORMAL SERVICE | 성공 처리 |
| chkInsttGbCd | 01 | 건축사사무소 | 점검기관 유형 표시 |
| chkInsttGbCd | 02 | 건설기술용역업자 | 점검기관 유형 표시 |
| chkInsttGbCd | 03 | 안전진단전문기관 | 점검기관 유형 표시 |
| chkInsttGbCd | 04 | 국토안전관리원 | 점검기관 유형 표시 |
| chkInsttGbCd | 05 | 기술사사무소 | 점검기관 유형 표시 |
| chkInsttGbCd | 06 | 한국부동산원 | 점검기관 유형 표시 |
| chkInsttGbCd | 07 | 한국토지주택공사 | 점검기관 유형 표시 |

## 11. 에러 코드

| 코드 | 메시지 | 의미 | 백엔드 처리 방안 | 사용자 노출 메시지 |
| --- | --- | --- | --- | --- |
| 00 | NORMAL SERVICE | 정상 | 성공 처리 |  |
| 01 | APPLICATION_ERROR | 어플리케이션 에러 | 일시 장애 또는 제공기관 오류로 기록하고 재시도 가능 여부 판단 | 잠시 후 다시 시도해주세요. |
| 02 | DB_ERROR | 데이터베이스 에러 | 제공기관 DB 오류. 재시도 후 지속 시 관리자 확인 | 공공데이터 제공기관 응답이 불안정합니다. |
| 04 | HTTP_ERROR | HTTP 에러 | HTTP 상태코드와 본문을 함께 로깅 | 공공데이터 호출 중 오류가 발생했습니다. |
| 05 | SERVICETIMEOUT_ERROR | 서비스 연결 실패 에러 | 타임아웃 처리, 회로차단/재시도 정책 적용 | 공공데이터 응답이 지연되고 있습니다. |
| 10 | INVALID_REQUEST_PARAMETER_ERROR | 잘못된 요청 파라미터 에러 | 사용자 입력 또는 주소 파싱 결과 검증 | 입력한 주소 정보를 다시 확인해주세요. |
| 11 | NO_MANDATORY_REQUEST_PARAMETERS_ERROR | 필수 요청 파라미터 없음 | 백엔드 요청 DTO 검증 실패로 처리 | 필수 조회 조건이 부족합니다. |
| 12 | NO_OPENAPI_SERVICE_ERROR | 해당 OpenAPI 서비스가 없거나 폐기됨 | 엔드포인트/서비스명 변경 여부 확인 | 현재 해당 공공데이터 서비스를 사용할 수 없습니다. |
| 20 | SERVICE_ACCESS_DENIED_ERROR | 서비스 접근거부 | 서비스키 권한/활용신청 상태 점검 | 공공데이터 인증 설정 확인이 필요합니다. |
| 21 | TEMPORARILY_DISABLE_THE_SERVICEKEY_ERROR | 일시적으로 사용할 수 없는 서비스키 | 키 상태 확인, 다른 키 전환 가능성 검토 | 공공데이터 인증키가 일시적으로 사용할 수 없습니다. |
| 22 | LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR | 서비스 요청 제한 횟수 초과 | 쿼터 초과. 캐시/백오프/운영 알림 | 공공데이터 일일 요청 한도를 초과했습니다. |
| 30 | SERVICE_KEY_IS_NOT_REGISTERED_ERROR | 등록되지 않은 서비스키 | 환경변수/URL 인코딩/활용신청 확인 | 공공데이터 인증키 설정 확인이 필요합니다. |
| 31 | DEADLINE_HAS_EXPIRED_ERROR | 기한 만료된 서비스키 | 서비스키 재발급 또는 활용기간 연장 | 공공데이터 인증키가 만료되었습니다. |
| 99 | UNKNOWN_ERROR | 기타 에러 | 원문 응답 전문 저장 후 관리자 확인 | 공공데이터 조회 중 알 수 없는 오류가 발생했습니다. |

## 12. 데이터 저장/캐시 전략

| 데이터 | 추천 처리 | 이유 |
| --- | --- | --- |
| 원천 응답 전문 | 선택 저장 | 재현성·디버깅·감사 목적이 있을 때만 저장. 저장 시 요청 파라미터와 resultCode 포함. |
| 주요 응답 필드 | DB 저장 또는 긴 TTL 캐시 | 건축물/인허가/폐쇄말소 정보는 자주 변하지 않으므로 반복 조회 비용을 줄일 수 있음. |
| 주소별 조회 결과 | Redis 단기 캐시 | 사용자가 같은 매물을 반복 진단할 가능성이 높음. |
| 코드표 | DB 또는 enum 상수 | platGbCd, resultCode, 점검기관구분 등은 코드 해석에 반복 사용. |
| 에러 응답 | 로그 저장 | 운영 추적, 키 만료, 파라미터 오류, 제공기관 장애 구분. |
| 조회 결과 없음 | 짧은 TTL 캐시 | 없는 주소/조건 반복 호출 방지. 단, 데이터 갱신 가능성을 고려해 짧게 유지. |

## 13. 구현 시 주의사항

- URL 파라미터에 한글이 포함될 수 있으면 UTF-8 URL 인코딩한다.

- `serviceKey`는 인코딩된 키/디코딩된 키 처리 방식이 공공데이터포털에서 혼동되기 쉬우므로 실제 호출 테스트를 분리한다.

- `bun`, `ji`, `sigunguCd`, `bjdongCd`, PK류는 숫자가 아니라 문자열로 처리한다.

- `items.item`은 XML/JSON 변환 시 단건 객체 또는 배열로 달라질 수 있으므로 커스텀 deserializer 또는 리스트 정규화 로직을 둔다.

- 원문 표의 `필/옵`, `1/0`, `1..n/0..n` 표기가 문서별로 다르므로 내부 DTO에서는 `required`를 명시적으로 통일한다.

- 일부 문서의 서비스 개요는 REST (GET, POST, PUT, DELETE)로 표기되지만 상세 요청 예시는 GET이다. 구현은 GET 기준으로 시작하고 필요 시 원문/포털 확인.

- `_type=json`은 일부 예시에 등장하지만 요청 필드 표에 없는 경우가 많다. JSON 사용 전 실제 응답 구조를 테스트해야 한다.

- 공공데이터 장애, 타임아웃, 일일 트래픽 제한, 키 만료를 구분해 사용자 메시지와 운영 알림을 분리한다.


## 14. API 조합 가능성

| 조합 대상 API | 조합 목적 | 기대 결과 | 주의사항 |
| --- | --- | --- | --- |
| 주소 API/법정동코드 API | 도로명·지번 정규화 후 sigunguCd/bjdongCd/bun/ji 생성 | 정확한 건축HUB 조회 조건 확보 | 주소 후보가 여러 개면 사용자 선택 필요 |
| GIS건물통합정보 | 좌표/건물 존재 확인과 건축물대장 속성 대조 | 건물 단위 식별 정확도 향상 | 건물군/동/호 매칭 모호성 처리 필요 |
| 실거래가 API 묶음 | 유형별 매매/전월세 실거래 비교 | 전세가율·월세 적정성·매매 가격 위험도 산정 | 유형 판별 후 API 선택 필요 |
| 공동주택가격/개별주택가격/공시지가 API | 공시가격 기반 보증금·가격 리스크 참고 | 보증보험/가격 위험도 설명 보조 | 공시가격은 현재 시세가 아님 |
| 등기부등본 업로드/OCR | 소유자·근저당·신탁·압류 등 권리관계 확인 | 계약 전 핵심 위험 보강 | 공공데이터 API만으로 확정 불가 |
| 중개업소/사업자/인허가 데이터 | 계약 상대방·중개사·영업 가능성 보조 확인 | 체크리스트 고도화 | 개별 계약의 법적 판단으로 단정 금지 |


# 외부 API 명세 - 건축HUB 건축인허가정보 서비스

## 1. 원본 파일 분석

| 항목 | 내용 |
| --- | --- |
| 원본 파일명 | OpenAPI활용가이드-_건축HUB_건축인허가_1.0.pdf |
| 파일 형식 | PDF |
| 문서명 | OpenAPI 활용가이드 |
| 문서 버전 | 1.0 |
| 작성/개정일 | 2024.10.01 또는 2024.10 (원문 표기 차이 존재) |
| 제공기관 | 국토교통부 |
| 서비스명 국문 | 건축HUB 건축인허가정보 서비스 |
| 서비스명 영문 | ArchPmsHubService |
| 서비스 설명 | 건축인허가 정보를 제공한다. |
| 데이터 갱신주기 | 확인 필요 |
| 원문 구조 | PDF / 페이지 수: 105 / 오퍼레이션 17개 |
| 비고 | 원문 표/샘플 URL/샘플 응답을 구현용 구조로 재배치. OCR·파싱상 줄바꿈으로 끊어진 필드명은 가능한 복원했으며 불확실한 항목은 원문 확인 필요. |

## 2. 원본 구조 요약

| 구분 | 원문 위치 | 내용 | 구현 관련성 |
| --- | --- | --- | --- |
| 서비스 개요 | 초반 서비스 명세 | 서비스명, 인증 방식, REST, XML/JSON 지원 여부, Base URL | 높음 |
| 서비스 Key 발급 및 활용 | 서비스 사용 장 | data.go.kr 활용신청 화면 및 serviceKey 사용 방식 | 보통 |
| 페이징 설명 | 서비스 사용 장 | numOfRows, pageNo, totalCount 기반 반복 호출 | 높음 |
| 오퍼레이션 목록 | 서비스 명세 장 | 17개 오퍼레이션 | 높음 |
| 오퍼레이션별 요청/응답 명세 | 각 오퍼레이션 명세 | 요청 파라미터, 응답 필드, 샘플 URL, XML 응답 예시 | 높음 |
| 에러 코드 | 문서 말미 또는 공공데이터 공통 | resultCode/resultMsg 및 에러코드 처리 | 높음 |

## 3. ZIP:ON 적용 판단

### 3.1 적용 가능 영역

| ZIP:ON 기능 영역 | 적용 가능 여부 | 활용 방식 | 중요도 |
| --- | --- | --- | --- |
| 주소 정제 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 법정동코드 변환 | 보조 | sigunguCd/bjdongCd/bun/ji로 인허가 조회 | 중요 |
| 물건 유형 판별 | 보조 | 허가 당시 용도·주택유형·호별/층별 정보로 건축물대장 결과를 보강 | 중요 |
| 건축물 기본정보 확인 | 가능 | 건축허가·동별·층별·호별·주차장·지역지구·대지위치 등 인허가 상태 확인 | 중요 |
| 토지·임야 기본정보 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 실거래가 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 공시가격·공시지가 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 전세 위험도 계산 | 보조 | 사용승인 전/허가 상태, 용도변경, 철거멸실 관련 힌트를 체크리스트로 연결 | 선택 |
| 월세 적정성 판단 | 보조 | 용도·호수·면적 확인 보조 | 선택 |
| 매매 위험도 계산 | 보조 | 허가일, 착공일, 사용승인일, 대수선/철거/가설건축물 이력 확인 | 중요 |
| 용도지역·지구·구역 확인 | 가능 | 지역지구구역 및 대지위치 오퍼레이션으로 보조 확인 | 중요 |
| 생활 인프라 분석 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 상권 분석 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 환경·재난 리스크 분석 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 계약 상대방·중개사 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 체크리스트 생성 | 가능 | 허가·대수선·주차장·가설건축물·지역지구 확인 항목 생성 | 중요 |

### 3.2 적용 판단 요약

건축인허가 이력과 인허가 기반 세부정보를 제공하는 보조 API다. 현재 건축물대장만으로 해석이 애매할 때 허가일, 착공일, 사용승인일, 대수선, 철거멸실, 가설건축물, 주차장, 지역지구, 주택유형 정보를 보강할 수 있다. 계약 전 위험도에서 직접적인 권리관계 판단 자료는 아니지만, 사용자의 목적과 공부상 용도·인허가 상태가 어긋나는지 확인하는 데 유용하다. 데이터는 자주 변하지 않는 편이므로 긴 TTL 캐시 또는 조회 결과 주요 필드 저장 후보다.

## 4. 서비스 기본 정보

| 항목 | 내용 |
| --- | --- |
| Base URL | http://apis.data.go.kr/1613000/ArchPmsHubService |
| 운영환경 URL | http://apis.data.go.kr/1613000/ArchPmsHubService |
| 개발환경 URL | http://apis.data.go.kr/1613000/ArchPmsHubService |
| 프로토콜 | REST |
| HTTP Method | GET 샘플 기준. 일부 서비스 개요 표에는 REST (GET, POST, PUT, DELETE)로 표기된 문서가 있으나 상세 예시는 GET임. |
| 인증 방식 | serviceKey |
| 요청 데이터 형식 | query parameter |
| 응답 데이터 형식 | XML/JSON |
| 평균 응답시간 | 500 ms |
| TPS 제한 | 30 tps |
| 메시지 크기 제한 | bytes 값 원문 공란 - 확인 필요 |
| WADL/Swagger/OpenAPI 여부 | WADL N/A 또는 서비스 명세 URL 원문 표기. Swagger/OpenAPI 스키마 없음. |
| 비고 | 시군구코드와 법정동코드는 행정표준코드관리시스템의 법정동코드 기준. |

## 5. 인증 방식

### 5.1 인증 파라미터

| 파라미터 | 위치 | 필수 | 설명 |
| --- | --- | --- | --- |
| serviceKey | query | Y | 공공데이터포털에서 발급받은 인증키. URL Encode 필요. 실제 문서/코드에는 `{SERVICE_KEY}`로 치환. |

### 5.2 인증 예시

```http
GET http://apis.data.go.kr/1613000/ArchPmsHubService/getApBasisOulnInfo?serviceKey={SERVICE_KEY}
```

## 6. 공통 요청 규칙

| 파라미터 | 타입 | 필수 | 예시 | 설명 |
| --- | --- | --- | --- | --- |
| serviceKey | VARCHAR/String | Y | {SERVICE_KEY} | 인증키 |
| sigunguCd | VARCHAR(30) 또는 문서별 상이 | Y | 11680 | 시군구코드. 유지점검기관 조회 등 일부 오퍼레이션은 다른 필수 조건을 사용. |
| bjdongCd | VARCHAR(30) 또는 문서별 상이 | Y | 10300 | 법정동코드. 유지점검기관 조회 등 일부 오퍼레이션은 선택/미사용 가능. |
| platGbCd | VARCHAR(30) | N | 0 | 대지구분코드. 0: 대지, 1: 산, 2: 블록. |
| bun | VARCHAR(20) | N | 0012 | 본번. 앞자리 0 보존 필요. |
| ji | VARCHAR(20) | N | 0000 | 부번. 앞자리 0 보존 필요. |
| startDate | VARCHAR(30) | N | YYYYMMDD | 검색시작일. 지원 여부는 오퍼레이션별 원문 기준. |
| endDate | VARCHAR(30) | N | YYYYMMDD | 검색종료일. 지원 여부는 오퍼레이션별 원문 기준. |
| numOfRows | VARCHAR(3) 또는 숫자 | N | 10 | 페이지당 목록 수. 원문상 1회 최대 100건 제한. |
| pageNo | VARCHAR(3) 또는 숫자 | N | 1 | 페이지 번호. 1부터 시작. |
| _type | String | N | json | PDF 일부 예시에 등장. 요청 파라미터 표에는 없는 경우가 많으므로 서비스별 실제 지원 확인 필요. |

## 7. 페이징 규칙

원문 공통 설명 기준으로 1회 요청 가능한 목록 수(`numOfRows`)는 최대 100건이다. 전체 목록이 필요하면 최초 요청의 `totalCount`를 확인한 뒤 `pageNo`를 1부터 전체 페이지 수까지 반복 호출한다.

```text
totalPages = ceil(totalCount / numOfRows)
for pageNo in 1..totalPages:
    call API with same search condition and pageNo
```

구현 시 `totalCount == 0`, `items.item` 단건 객체/배열 차이, 공공데이터 장애 시 재시도 횟수를 반드시 처리한다.

## 8. 오퍼레이션 목록

| 번호 | 오퍼레이션명 | 국문명 | 설명 | ZIP:ON 활용 |
| --- | --- | --- | --- | --- |
| 1 | getApBasisOulnInfo | 건축인허가 기본개요요 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 대지면적, 건축면적, 건폐율, 연면적, 용적율, 건축물 수 등의 기본정보를 제공한다. | 물건 식별, 건축물 기본정보, 유형 판별 |
| 2 | getApDongOulnInfo | 건축인허가 동별개요 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 건축물의 주용도, 호/가구/세대수, 구조, 지붕, 건축면적, 연면적, 용적율 등의 동별 기본정보를 제공한다. | 물건 식별, 건축물 기본정보, 유형 판별 |
| 3 | getApFlrOulnInfo | 건축인허가 층별개요 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축행정 정보 중 건축인허가와 관련된 건축물의 층구분, 층수, 층번호, 층구조 등의 층별 기본 정보를 제공한다. | 물건 식별, 건축물 기본정보, 유형 판별 |
| 4 | getApHoOulnInfo | 건축인허가 호별개요 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축행정 정보 중 건축인허가와 관련된 건축물의 호명칭, 평형구분 등의 호별 기 본정보를 제공한다. | 물건 식별, 건축물 기본정보, 유형 판별 |
| 5 | getApImprprInfo | 건축인허가 대수선 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 대수선의 대수선구분, 대수선변경구분 등의 정 보를 제공한다. | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 6 | getApHdcrMgmRgstInfo | 건축인허가 공작물관 리대장 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 공작물의 공작물종류, 구조, 길이, 높이, 면적 등의 정보를 제공한다. | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 7 | getApDemolExtngMgmRgstInfo | 건축인허가 철거멸실 관리대장 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축행정 정보 중 건축인허가와 관련된 철거/멸실대상 건축물의 석면함유여부, 철거멸실유형 등의 철거멸실정보를 제공한다. | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 8 | getApTmpBldInfo | 건축인허가 가설건축 물 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 가설건축물의 존지만료일, 구조, 주용도, 건축 면적 등의 정보를 제공한다. | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 9 | getApWclfInfo | 건축인허가 오수정화시설 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 오수정화시설의 정화방식, 용량 등에 관한 정 보를 제공한다. | 설비/위생 관련 체크리스트 보조 |
| 10 | getApPklotInfo | 건축인허가 주차장 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 주차장의 주차자유형별 주차가능대수, 인근주차장의 주차가능대수 등의 정보를 제공한다. | 주차대수·주차장 확인, 생활/매매 리스크 보조 |
| 11 | getApAtchPklotInfo | 건축인허가 부설주차장 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 부설주차창의 대지위치, 관련지번 등에 관한 정보를 제공한다. | 주차대수·주차장 확인, 생활/매매 리스크 보조 |
| 12 | getApExposPubuseAreaInfo | 건축인허가 전유공용면적 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 건축물의 전유/공용구분, 주부속구분, 주용도, 구조 등의 전유/공용면적에 대한 정보를 제공한다. | 전유부/전유공용면적 확인, 다세대·오피스텔 판단 보조 |
| 13 | getApHoExposPubuseAreaInfo | 건축인허가 호별전유 공용면적 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축행정 정보 중 건축, 대수선, 용도변경인허가와 관련된 건축물의 구조코드, 호 별면적, 용도 등 호별 전유/공유 면적 정보를 제공한다. | 호실 단위 정보 확인, 집합/전유부 판단 보조 |
| 14 | getApJijiguInfo | 건축인허가 지역지구구역 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축행정 정보 중 건축인허가와 관련된 건축물의 지역, 지구, 구역 정보를 제공 한다. | 용도지역·지구·구역 확인 및 목적별 체크리스트 |
| 15 | getApRoadRgstInfo | 건축인허가 도로명대 장 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 도로의 도로지정번호, 도로의 길이, 면적, 너비 등의 도로정보를 제공한다. | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 16 | getApPlatPlcInfo | 건축인허가 대지위치 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 대지의 지번주소, 대지구분, 대표여부 등의 대 지위치정보를 제공한다. | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 17 | getApHsTpInfo | 건축인허가 주택유형 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축행정 정보 중 건축인허가와 관련된 건축물의 주택유형, 실/호/세대수 및 면 적 등의 주택유형별 정보를 제공한다. | ZIP:ON 목적별 위험도 계산의 보조 입력값 |

## 9. 오퍼레이션 상세


---

## 9.1. 건축인허가 기본개요요 조회

### 9.1.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getApBasisOulnInfo |
| Method | GET |
| Path | /getApBasisOulnInfo |
| Full URL | http://apis.data.go.kr/1613000/ArchPmsHubService/getApBasisOulnInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 대지면적, 건축면적, 건폐율, 연면적, 용적율, 건축물 수 등의 기본정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 원문 위치 | page 16, 17, 18, 19, 20 |

### 9.1.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | 0 | 0004 | 지 |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 2 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.1.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ArchPmsHubService/getApBasisOulnInfo?sigunguCd=11680&platGbCd=0&bjdongCd=10300&bun=0012&ji=0004&pageNo=1&numOfRows=2&serviceKey={SERVICE_KEY}
```

### 9.1.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.guyukCdNm | guyukCdNm | 구역코드명 | VARCHAR(1000) | N | 지구단위계획구역 | 구역코드명 |  |
| response.body.items.item.jimokCd | jimokCd | 지목코드 | VARCHAR(30) | N | 08 | 지목코드 |  |
| response.body.items.item.jiyukCd | jiyukCd | 지역코드 | VARCHAR(30) | N | UOA120 | 지역코드 |  |
| response.body.items.item.jiguCd | jiguCd | 지구코드 | VARCHAR(30) | N | UNE200 | 지구코드 |  |
| response.body.items.item.guyukCd | guyukCd | 구역코드 | VARCHAR(30) | N | UQQ300 | 구역코드 |  |
| response.body.items.item.archGbCd | archGbCd | 건축구분코드 | VARCHAR(30) | N | 0700 | 건축구분코 드 |  |
| response.body.items.item.archGbCdNm | archGbCdNm | 건축구분코드 명 | VARCHAR(1000) | N | 용도변경 | 건축구분코 드명 |  |
| response.body.items.item.platArea | platArea | 대지면적(㎡) | NUMBER(30,9 | N | 2272 | 대지면적 ( ㎡) |  |
| response.body.items.item.archArea | archArea | 건축면적(㎡) | NUMBER(30,9 ) | N | 1152.45 | 건축면적 ( ㎡) |  |
| response.body.items.item.bcRat | bcRat | 건폐율(%) | NUMBER(22,9 ) | N | 50.724 | 건폐율(%) |  |
| response.body.items.item.totArea | totArea | 연면적(㎡) | NUMBER(30,9 ) | N | 16074.93 | 연면적(㎡) |  |
| response.body.items.item.vlRatEstmTotArea | vlRatEstmTotArea | 용적률산정연 면적(㎡) | NUMBER(30,9 ) | N | 9074.07 | 용적률산정 연면적(㎡) |  |
| response.body.items.item.vlRat | vlRat | 용적률(%) | NUMBER(22,9 ) | N | 399.3869 | 용적률(%) |  |
| response.body.items.item.mainBldCnt | mainBldCnt | 주건축물수 | NUMBER(10) | N | 1 | 주건축물수 |  |
| response.body.items.item.atchBldDongCnt | atchBldDongCnt | 부속건축물동 수 | NUMBER(10) | N | 0 | 부속건축물 동수 |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드 | VARCHAR(5) | N | 03000 | 주용도코드 |  |
| response.body.items.item.mainPurpsCdNm | mainPurpsCdNm | 주용도코드명 | VARCHAR(1000) | N | 제1종근린생활시설 | 주용도코드 명 |  |
| response.body.items.item.hhldCnt | hhldCnt | 세대수(세대) | NUMBER(10) | N | 0 | 세대수 ( 세 대) |  |
| response.body.items.item.hoCnt | hoCnt | 호수(호) | NUMBER(10) | N | 87 | 호수(호) |  |
| response.body.items.item.fmlyCnt | fmlyCnt | 가구수(가구) | NUMBER(10) | N | 0 | 가구수 ( 가 구) |  |
| response.body.items.item.totPkngCnt | totPkngCnt | 총주차수 | NUMBER(10) | N | 0 | 총주차수 |  |
| response.body.items.item.stcnsSchedDay | stcnsSchedDay | 착공예정일 | VARCHAR(8) | N | 착공예정일 |  |  |
| response.body.items.item.stcnsDelayDay | stcnsDelayDay | 착공연기일 | VARCHAR(8) | N | 착공연기일 |  |  |
| response.body.items.item.realStcnsDay | realStcnsDay | 실제착공일 | VARCHAR(8) | N | 실제착공일 |  |  |
| response.body.items.item.archPmsDay | archPmsDay | 건축허가일 | VARCHAR(8) | N | 20200603 | 건축허가일 |  |
| response.body.items.item.useAprDay | useAprDay | 사용승인일 | VARCHAR(8) | N | 사용승인일 |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포동 12-4번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0004 | 지 |  |
| response.body.items.item.mgmPmsrgstPk | mgmPmsrgstPk | 관리허가대장PK | VARCHAR(30) | Y | 1024100139809 | 관리허가대 장PK |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200 ) | N | 석탑프라자？ | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500 ) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500 ) | N | 로트 |  |  |
| response.body.items.item.jimokCdNm | jimokCdNm | 지목코드명 | VARCHAR(1000) | N | 대 | 지목코드명 |  |
| response.body.items.item.jiyukCdNm | jiyukCdNm | 지역코드명 | VARCHAR(1000) | N | 상대보호구역 | 지역코드명 |  |
| response.body.items.item.jiguCdNm | jiguCdNm | 지구코드명 | VARCHAR(1000) | N | 대공방어협조구역 | 지구코드명 |  |

### 9.1.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <rnum>1</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmPmsrgstPk>1024100139809</mgmPmsrgstPk>
        <bldNm>석탑프라자？</bldNm>

2024년 건축서비스산업 정보체계 유지관리 사업






        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <jimokCdNm>대</jimokCdNm>
        <jiyukCdNm>상대보호구역</jiyukCdNm>
        <jiguCdNm>대공방어협조구역</jiguCdNm>
        <guyukCd>UQQ300</guyukCd>
        <guyukCdNm>지구단위계획구역</guyukCdNm>
        <jimokCd>08</jimokCd>
        <jiyukCd>UOA120</jiyukCd>
        <jiguCd>UNE200</jiguCd>
        <archGbCd>0700</archGbCd>
        <archGbCdNm>용도변경</archGbCdNm>
        <platArea>2272</platArea>
        <archArea>1152.45</archArea>
        <bcRat>50.724</bcRat>
        <totArea>16074.93</totArea>
        <vlRatEstmTotArea>9074.07</vlRatEstmTotArea>
        <vlRat>399.3869</vlRat>
        <mainBldCnt>1</mainBldCnt>
        <atchBldDongCnt>0</atchBldDongCnt>
        <mainPurpsCd>03000</mainPurpsCd>
        <mainPurpsCdNm>제1종근린생활시설</mainPurpsCdNm>
        <hhldCnt>0</hhldCnt>
        <hoCnt>87</hoCnt>
        <fmlyCnt>0</fmlyCnt>
        <totPkngCnt>0</totPkngCnt>
        <stcnsSchedDay> </stcnsSchedDay>
        <stcnsDelayDay> </stcnsDelayDay>
        <realStcnsDay> </realStcnsDay>
        <archPmsDay>20200603</archPmsDay>
        <useAprDay> </useAprDay>
        <crtnDay>20220813</crtnDay>
      </item>
      <item>

2024년 건축서비스산업 정보체계 유지관리 사업






        <rnum>2</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmPmsrgstPk>1024100025261</mgmPmsrgstPk>
        <bldNm>개포동 12-4 제1종근린생활시설 (정용근)</bldNm>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <jimokCdNm>대</jimokCdNm>
        <jiyukCdNm>제3종일반주거지역</jiyukCdNm>
        <jiguCdNm> </jiguCdNm>
        <guyukCd> </guyukCd>
        <guyukCdNm> </guyukCdNm>
        <jimokCd>08</jimokCd>
        <jiyukCd>1023</jiyukCd>
        <jiguCd> </jiguCd>
        <archGbCd>0700</archGbCd>
        <archGbCdNm>용도변경</archGbCdNm>
        <platArea>2272</platArea>
        <archArea>1152.45</archArea>
        <bcRat>50.72</bcRat>
        <totArea>16074.93</totArea>
        <vlRatEstmTotArea>9074.07</vlRatEstmTotArea>
        <vlRat>399.38</vlRat>
        <mainBldCnt>1</mainBldCnt>
        <atchBldDongCnt>0</atchBldDongCnt>
        <mainPurpsCd>03000</mainPurpsCd>
        <mainPurpsCdNm>제1종근린생활시설</mainPurpsCdNm>
        <hhldCnt>0</hhldCnt>
        <hoCnt>0</hoCnt>
        <fmlyCnt>0</fmlyCnt>

2024년 건축서비스산업 정보체계 유지관리 사업






        <totPkngCnt>0</totPkngCnt>
        <stcnsSchedDay> </stcnsSchedDay>
        <stcnsDelayDay> </stcnsDelayDay>
        <realStcnsDay> </realStcnsDay>
        <archPmsDay>20100723</archPmsDay>
        <useAprDay> </useAprDay>
        <crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>2</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>20</totalCount>
  </body>
</response>
```


### 9.1.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getApBasisOulnInfo |
| Request DTO 후보 | ApBasisOulnInfoRequest |
| Response DTO 후보 | ApBasisOulnInfoResponse |
| Item DTO 후보 | ApBasisOulnInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.1.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `물건 식별, 건축물 기본정보, 유형 판별`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.2. 건축인허가 동별개요 조회

### 9.2.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getApDongOulnInfo |
| Method | GET |
| Path | /getApDongOulnInfo |
| Full URL | http://apis.data.go.kr/1613000/ArchPmsHubService/getApDongOulnInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 건축물의 주용도, 호/가구/세대수, 구조, 지붕, 건축면적, 연면적, 용적율 등의 동별 기본정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 원문 위치 | page 23, 24, 25, 26 |

### 9.2.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0004 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 2 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.2.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ArchPmsHubService/getApDongOulnInfo?sigunguCd=11680&platGbCd=0&bjdongCd=10300&bun=0012&ji=0004&pageNo=1&numOfRows=2&serviceKey={SERVICE_KEY}
```

### 9.2.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.mainAtchGbC | mainAtchGbC | 주부속구분코 | VARCHAR(30) | N | 0 | 주부속구분 |  |
| response.body.items.item.d | d | 드 | 코드 | 확인 필요 |  |  |  |
| response.body.items.item.mainAtchGbCdNm | mainAtchGbCdNm | 주부속구분코 드명 | VARCHAR(1000 ) | N | 주건축물 | 주부속구분 코드명 |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드 | VARCHAR(5) | N | 04000 | 주용도코드 |  |
| response.body.items.item.mainPurpsCdNm | mainPurpsCdNm | 주용도코드명 | VARCHAR(1000 ) | N | 제2종근린생활시설 | 주용도코드 명 |  |
| response.body.items.item.hoCnt | hoCnt | 호수(호) | NUMBER(10) | N | 87 | 호수(호) |  |
| response.body.items.item.fmlyCnt | fmlyCnt | 가구수(가구) | NUMBER(10) | N | 0 | 가구수 ( 가 구) |  |
| response.body.items.item.hhldCnt | hhldCnt | 세대수(세대) | NUMBER(10) | N | 0 | 세대수 ( 세 대) |  |
| response.body.items.item.strctCd | strctCd | 구조코드 | VARCHAR(2) | N | 21 | 구조코드 |  |
| response.body.items.item.strctCdNm | strctCdNm | 구조코드명 | VARCHAR(1000 ) | N | 철근콘크리트구조 | 구조코드명 |  |
| response.body.items.item.roofCd | roofCd | 지붕코드 | VARCHAR(30) | N | 10 | 지붕코드 |  |
| response.body.items.item.roofCdNm | roofCdNm | 지붕코드명 | VARCHAR(1000 ) | N | (철근)콘크리트 | 지붕코드명 |  |
| response.body.items.item.archArea | archArea | 건축면적(㎡) | NUMBER(30,9) | N | 1152.45 | 건축면적 ( ㎡) |  |
| response.body.items.item.totArea | totArea | 연면적(㎡) | NUMBER(30,9) | N | 16074.93 | 연면적(㎡) |  |
| response.body.items.item.vlRatEstmTotArea | vlRatEstmTotArea | 용적률산정연 면적(㎡) | NUMBER(30,9) | N | 9074.07 | 용적률산정 연면적(㎡) |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000 ) | N | 서울특별시 강남구 개포동 12-4번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0004 | 지 |  |
| response.body.items.item.mgmDongOulnPk | mgmDongOulnPk | 관리동별개요PK | VARCHAR(30) | Y | 1024100127949 | 관리동별개 요PK |  |
| response.body.items.item.mgmPmsrgstPk | mgmPmsrgstPk | 관리허가대장PK | VARCHAR(30) | N | 1024100106564 | 관리허가대 장PK |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 석탑프라자 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000 ) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.rideUseElvtCnt | rideUseElvtCnt | 승용승강기수 | NUMBER(10) | N | 2 | 승용승강기 수 |  |
| response.body.items.item.emgenUseElvtCnt | emgenUseElvtCnt | 비상용승강기 수 | NUMBER(10) | N | 1 | 비상용승강 기수 |  |

### 9.2.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <rnum>1</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmPmsrgstPk>1024100106564</mgmPmsrgstPk>
        <mgmDongOulnPk>1024100127949</mgmDongOulnPk>
        <bldNm>석탑프라자</bldNm>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <mainAtchGbCd>0</mainAtchGbCd>
        <mainAtchGbCdNm>주건축물</mainAtchGbCdNm>
        <mainPurpsCd>04000</mainPurpsCd>
        <mainPurpsCdNm>제2종근린생활시설</mainPurpsCdNm>
        <hoCnt>87</hoCnt>
        <fmlyCnt>0</fmlyCnt>
        <hhldCnt>0</hhldCnt>
        <strctCd>21</strctCd>
        <strctCdNm>철근콘크리트구조</strctCdNm>

2024년 건축서비스산업 정보체계 유지관리 사업






        <roofCd>10</roofCd>
        <roofCdNm>(철근)콘크리트</roofCdNm>
        <archArea>1152.45</archArea>
        <totArea>16074.93</totArea>
        <vlRatEstmTotArea>9074.07</vlRatEstmTotArea>
        <crtnDay>20220813</crtnDay>
        <rideUseElvtCnt>2</rideUseElvtCnt>
        <emgenUseElvtCnt>1</emgenUseElvtCnt>
      </item>
      <item>
        <rnum>2</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmPmsrgstPk>1024100027545</mgmPmsrgstPk>
        <mgmDongOulnPk>1024100029400</mgmDongOulnPk>
        <bldNm> </bldNm>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <mainAtchGbCd>0</mainAtchGbCd>
        <mainAtchGbCdNm>주건축물</mainAtchGbCdNm>
        <mainPurpsCd>04000</mainPurpsCd>
        <mainPurpsCdNm>제2종근린생활시설</mainPurpsCdNm>
        <hoCnt>0</hoCnt>
        <fmlyCnt>0</fmlyCnt>
        <hhldCnt>96</hhldCnt>
        <strctCd>21</strctCd>
        <strctCdNm>철근콘크리트구조</strctCdNm>
        <roofCd>10</roofCd>
        <roofCdNm>(철근)콘크리트</roofCdNm>
        <archArea>0</archArea>

2024년 건축서비스산업 정보체계 유지관리 사업






        <totArea>0</totArea>
        <vlRatEstmTotArea>0</vlRatEstmTotArea>
        <crtnDay>20220813</crtnDay>
        <rideUseElvtCnt>2</rideUseElvtCnt>
        <emgenUseElvtCnt>1</emgenUseElvtCnt>
      </item>
    </items>
    <numOfRows>2</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>19</totalCount>
  </body>
</response>
```


### 9.2.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getApDongOulnInfo |
| Request DTO 후보 | ApDongOulnInfoRequest |
| Response DTO 후보 | ApDongOulnInfoResponse |
| Item DTO 후보 | ApDongOulnInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.2.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `물건 식별, 건축물 기본정보, 유형 판별`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.3. 건축인허가 층별개요 조회

### 9.3.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getApFlrOulnInfo |
| Method | GET |
| Path | /getApFlrOulnInfo |
| Full URL | http://apis.data.go.kr/1613000/ArchPmsHubService/getApFlrOulnInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축행정 정보 중 건축인허가와 관련된 건축물의 층구분, 층수, 층번호, 층구조 등의 층별 기본 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 원문 위치 | page 29, 30, 31, 32 |

### 9.3.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0004 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 2 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.3.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ArchPmsHubService/getApFlrOulnInfo?sigunguCd=11680&platGbCd=0&bjdongCd=10300&bun=0012&ji=0004&pageNo=1&numOfRows=2&serviceKey={SERVICE_KEY}
```

### 9.3.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.archGbCd | archGbCd | 건축구분코드 명 | VARCHAR(30) | N | 0700 | 건축구분코 드명 |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(1000 | N | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000 ) | N | 서울특별시 강남구 개포동 12-4번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0004 | 지 |  |
| response.body.items.item.mgmFlrOulnPk | mgmFlrOulnPk | 관리층별개요PK | VARCHAR(30) | Y | 1024100053969 | 관리층별개 요PK |  |
| response.body.items.item.mgmDongOulnPk | mgmDongOulnPk | 관리동별개요PK | VARCHAR(30) | N | 1024100032651 | 관리동별개 요PK |  |
| response.body.items.item.mgmPmsrgstPk | mgmPmsrgstPk | 관리허가대장PK | VARCHAR(30) | N | 1024100030704 | 관리허가대 장PK |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 석탑프라자 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000 ) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.strctCd | strctCd | 구조코드 | VARCHAR(2) | N | 21 | 구조코드 |  |
| response.body.items.item.strctCdNm | strctCdNm | 구조코드명 | VARCHAR(1000 ) | N | 철근콘크리트구조 | 구조코드명 |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드 | VARCHAR(5) | N | 13006 | 주용도코드 |  |
| response.body.items.item.mainPurpsCdNm | mainPurpsCdNm | 주용도코드명 | ARCHAR(1000) | N | 체력단련장 | 주용도코드 명 |  |
| response.body.items.item.flrNo | flrNo | 층번호 | NUMBER(5) | N | 7 | 층번호 |  |
| response.body.items.item.flrArea | flrArea | 층면적(㎡) | NUMBER(30,9) | N | 1124.85 | 층면적(㎡) |  |
| response.body.items.item.flrGbCd | flrGbCd | 층구분코드 | VARCHAR(30) | N | 20 | 층구분코드 |  |
| response.body.items.item.flrGbCdNm | flrGbCdNm | 층구분코드명 | VARCHAR(1000 ) | N | 지상 | 층구분코드 명 |  |
| response.body.items.item.archGbCdNm | archGbCdNm | 건축구분코드 | VARCHAR(30) | N | 용도변경 | 건축구분코 드 |  |

### 9.3.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <rnum>1</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmFlrOulnPk>1024100053969</mgmFlrOulnPk>
        <mgmDongOulnPk>1024100032651</mgmDongOulnPk>
        <mgmPmsrgstPk>1024100030704</mgmPmsrgstPk>
        <bldNm>석탑프라자</bldNm>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <strctCd>21</strctCd>
        <strctCdNm>철근콘크리트구조</strctCdNm>
        <mainPurpsCd>13006</mainPurpsCd>
        <mainPurpsCdNm>체력단련장</mainPurpsCdNm>
        <flrNo>7</flrNo>
        <flrArea>1124.85</flrArea>
        <flrGbCd>20</flrGbCd>
        <flrGbCdNm>지상</flrGbCdNm>
        <archGbCd>0700</archGbCd>
        <archGbCdNm>용도변경</archGbCdNm>
        <crtnDay>20220813</crtnDay>
      </item>
      <item>

2024년 건축서비스산업 정보체계 유지관리 사업






        <rnum>2</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmFlrOulnPk>1024100082435</mgmFlrOulnPk>
        <mgmDongOulnPk>1024100048364</mgmDongOulnPk>
        <mgmPmsrgstPk>1024100044838</mgmPmsrgstPk>
        <bldNm>주건축물제1동</bldNm>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <strctCd>21</strctCd>
        <strctCdNm>철근콘크리트구조</strctCdNm>
        <mainPurpsCd>10003</mainPurpsCd>
        <mainPurpsCdNm>학원</mainPurpsCdNm>
        <flrNo>5</flrNo>
        <flrArea>94.77</flrArea>
        <flrGbCd>20</flrGbCd>
        <flrGbCdNm>지상</flrGbCdNm>
        <archGbCd>0700</archGbCd>
        <archGbCdNm>용도변경</archGbCdNm>
        <crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>2</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>35</totalCount>
  </body>
</response>
```


### 9.3.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getApFlrOulnInfo |
| Request DTO 후보 | ApFlrOulnInfoRequest |
| Response DTO 후보 | ApFlrOulnInfoResponse |
| Item DTO 후보 | ApFlrOulnInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.3.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `물건 식별, 건축물 기본정보, 유형 판별`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.4. 건축인허가 호별개요 조회

### 9.4.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getApHoOulnInfo |
| Method | GET |
| Path | /getApHoOulnInfo |
| Full URL | http://apis.data.go.kr/1613000/ArchPmsHubService/getApHoOulnInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축행정 정보 중 건축인허가와 관련된 건축물의 호명칭, 평형구분 등의 호별 기 본정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 원문 위치 | page 35, 36, 37 |

### 9.4.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0004 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR2(3) | N | 2 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR2(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.4.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ArchPmsHubService/getApHoOulnInfo?sigunguCd=11680&platGbCd=0&bjdongCd=10300&bun=0012&ji=0004&pageNo=1&numOfRows=2&serviceKey={SERVICE_KEY}
```

### 9.4.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000 ) | N | 서울특별시 강남구 개포동 12-4번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준 코드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준 코드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0004 | 지 |  |
| response.body.items.item.mgmHoDetlPk | mgmHoDetlPk | 관리호별명세PK | VARCHAR(30) | Y | 1024100009983 | 관리호별 명세PK |  |
| response.body.items.item.mgmDongOulnPk | mgmDongOulnPk | 관리동별개요PK | VARCHAR(30) | N | 1024100032651 | 관리동별 개요PK |  |
| response.body.items.item.mgmPmsrgstPk | mgmPmsrgstPk | 관리허가대장PK | VARCHAR(30) | N | 1024100030704 | 관리허가 대장PK |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000 ) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.hoNo | hoNo | 호번호 | VARCHAR(500) | N | 호번호 |  |  |
| response.body.items.item.hoNm | hoNm | 호명칭 | VARCHAR(1000 ) | N | 701호 | 호명칭 |  |
| response.body.items.item.pngtypGbNm | pngtypGbNm | 평형구분명 | VARCHAR(1000 ) | N | 701호 | 평형구분 명 |  |
| response.body.items.item.flrNo | flrNo | 층번호 | NUMBER(5) | N | 7 | 층번호 |  |
| response.body.items.item.flrGbCd | flrGbCd | 층구분코드 | VARCHAR(30) | N | 20 | 층구분코 드 |  |
| response.body.items.item.flrGbCdNm | flrGbCdNm | 층구분코드명 | VARCHAR(1000 ) | N | 지상 | 층구분코 드명 |  |
| response.body.items.item.changGbCd | changGbCd | 변경구분코드 | VARCHAR(30) | N | 변경구분 코드 |  |  |
| response.body.items.item.changGbCdNm | changGbCdNm | 변경구분코드 명 | VARCHAR(1000 ) | N | 변경구분 코드명 |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |

### 9.4.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <rnum>1</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmHoDetlPk>1024100009983</mgmHoDetlPk>
        <mgmDongOulnPk>1024100032651</mgmDongOulnPk>
        <mgmPmsrgstPk>1024100030704</mgmPmsrgstPk>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <hoNo> </hoNo>
        <hoNm>701호</hoNm>
        <pngtypGbNm>701호</pngtypGbNm>
        <flrNo>7</flrNo>
        <flrGbCd>20</flrGbCd>
        <flrGbCdNm>지상</flrGbCdNm>
        <changGbCd> </changGbCd>

2024년 건축서비스산업 정보체계 유지관리 사업






        <changGbCdNm> </changGbCdNm>
        <crtnDay>20220813</crtnDay>
      </item>
      <item>
        <rnum>2</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmHoDetlPk>1024100040071</mgmHoDetlPk>
        <mgmDongOulnPk>1024100099800</mgmDongOulnPk>
        <mgmPmsrgstPk>1024100083441</mgmPmsrgstPk>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <hoNo> </hoNo>
        <hoNm>402호</hoNm>
        <pngtypGbNm>429.24</pngtypGbNm>
        <flrNo>4</flrNo>
        <flrGbCd>20</flrGbCd>
        <flrGbCdNm>지상</flrGbCdNm>
        <changGbCd> </changGbCd>
        <changGbCdNm> </changGbCdNm>
        <crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>2</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>2</totalCount>
  </body>
</response>
```


### 9.4.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getApHoOulnInfo |
| Request DTO 후보 | ApHoOulnInfoRequest |
| Response DTO 후보 | ApHoOulnInfoResponse |
| Item DTO 후보 | ApHoOulnInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.4.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `물건 식별, 건축물 기본정보, 유형 판별`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.5. 건축인허가 대수선 조회

### 9.5.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getApImprprInfo |
| Method | GET |
| Path | /getApImprprInfo |
| Full URL | http://apis.data.go.kr/1613000/ArchPmsHubService/getApImprprInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 대수선의 대수선구분, 대수선변경구분 등의 정 보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 원문 위치 | page 40, 41, 42 |

### 9.5.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0013 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0003 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR2(3) | N | 2 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR2(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.5.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ArchPmsHubService/getApImprprInfo?sigunguCd=11680&platGbCd=0&bjdongCd=10300&bun=0013&ji=0003&pageNo=1&numOfRows=2&serviceKey={SERVICE_KEY}
```

### 9.5.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.imprprGbCdNm | imprprGbCdNm | 대수선구분코 드명 | VARCHAR(1000) | N | 대수선구분 코드명 |  |  |
| response.body.items.item.imprprChangGbCd | imprprChangGbCd | 대수선변경구 분코드 | VARCHAR(30) | N | 4 | 대수선변경 구분코드 |  |
| response.body.items.item.imprprChangGbCdNm | imprprChangGbCdNm | 대수선변경구 분코드명 | VARCHAR(1000) | N | 변경 | 대수선변경 구분코드명 |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포동 13-3번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0013 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0003 | 지 |  |
| response.body.items.item.mgmPmsrgstPk | mgmPmsrgstPk | 관리허가대장PK | VARCHAR(30) | N | 1024100134729 | 관리허가대 장PK |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 개포동 13-3 업무시 설 ((주)주부맘크라 우드) | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.imprprGbCd | imprprGbCd | 대수선구분코 드 | VARCHAR(30) | N | 대수선구분 코드 |  |  |

### 9.5.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <rnum>1</rnum>
        <platPlc>서울특별시 강남구 개포동 13-3번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0013</bun>
        <ji>0003</ji>
        <mgmPmsrgstPk>1024100134729</mgmPmsrgstPk>
        <bldNm>개포동 13-3 업무시설 ((주)주부맘크라우드)</bldNm>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <imprprGbCd> </imprprGbCd>
        <imprprGbCdNm> </imprprGbCdNm>
        <imprprChangGbCd>4</imprprChangGbCd>
        <imprprChangGbCdNm>변경</imprprChangGbCdNm>
        <crtnDay>20220813</crtnDay>
      </item>
      <item>
        <rnum>2</rnum>
        <platPlc>서울특별시 강남구 개포동 13-3번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0013</bun>
        <ji>0003</ji>
        <mgmPmsrgstPk>1024100030282</mgmPmsrgstPk>
        <bldNm>대청타워</bldNm>

2024년 건축서비스산업 정보체계 유지관리 사업






        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <imprprGbCd>06</imprprGbCd>
        <imprprGbCdNm>방화구획</imprprGbCdNm>
        <imprprChangGbCd>4</imprprChangGbCd>
        <imprprChangGbCdNm>변경</imprprChangGbCdNm>
        <crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>2</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>3</totalCount>
  </body>
</response>
```


### 9.5.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getApImprprInfo |
| Request DTO 후보 | ApImprprInfoRequest |
| Response DTO 후보 | ApImprprInfoResponse |
| Item DTO 후보 | ApImprprInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.5.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `ZIP:ON 목적별 위험도 계산의 보조 입력값`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.6. 건축인허가 공작물관 리대장 조회

### 9.6.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getApHdcrMgmRgstInfo |
| Method | GET |
| Path | /getApHdcrMgmRgstInfo |
| Full URL | http://apis.data.go.kr/1613000/ArchPmsHubService/getApHdcrMgmRgstInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 공작물의 공작물종류, 구조, 길이, 높이, 면적 등의 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 원문 위치 | page 44, 45, 46, 47 |

### 9.6.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10800 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0006 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0013 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR2(3) | N | 2 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR2(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.6.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ArchPmsHubService/getApHdcrMgmRgstInfo?sigunguCd=11680&platGbCd=0&bjdongCd=10800&bun=0006&ji=0013&pageNo=1&numOfRows=2&serviceKey={SERVICE_KEY}
```

### 9.6.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000 ) | N | 서울특별시 강남구 논현동 6-13번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준 코드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10800 | 행정표준 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0006 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0013 | 지 |  |
| response.body.items.item.mgmPmsrgstPk | mgmPmsrgstPk | 관리허가대장PK | VARCHAR(30) | N | 102413880 | 관리허가 대장PK |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 건물명 |  |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000 ) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.jimokCd | jimokCd | 지목코드 | VARCHAR(30) | N | 지목코드 |  |  |
| response.body.items.item.jimokCdNm | jimokCdNm | 지목코드명 | VARCHAR(1000 ) | N | 지목코드 명 |  |  |
| response.body.items.item.jiyukCd | jiyukCd | 지역코드 | VARCHAR(30) | N | 1023 | 지역코드 |  |
| response.body.items.item.jiyukCdNm | jiyukCdNm | 지역코드명 | VARCHAR(1000 ) | N | 제3종일반주거지역 | 지역코드 명 |  |
| response.body.items.item.jiguCd | jiguCd | 지구코드 | VARCHAR(30) | N | 101 | 지구코드 |  |
| response.body.items.item.jiguCdNm | jiguCdNm | 지구코드명 | VARCHAR(1000 ) | N | 중심지미관지구 | 지구코드 명 |  |
| response.body.items.item.guyukCd | guyukCd | 구역코드 | VARCHAR(30) | N | 구역코드 |  |  |
| response.body.items.item.guyukCdNm | guyukCdNm | 구역코드명 | VARCHAR(1000 | N | 구역코드 명 |  |  |
| response.body.items.item.hdcrKindCd | hdcrKindCd | 공작물종류코 드 | VARCHAR(30) | N | 05 | 공작물종 류코드 |  |
| response.body.items.item.hdcrKindCdNm | hdcrKindCdNm | 공작물종류코 드명 | VARCHAR(1000 ) | N | 기계식주차장 | 공작물종 류코드명 |  |
| response.body.items.item.strctCd | strctCd | 구조코드 | VARCHAR(2) | N | 39 | 구조코드 |  |
| response.body.items.item.strctCdNm | strctCdNm | 구조코드명 | VARCHAR(1000 ) | N | 기타강구조 | 구조코드 명 |  |
| response.body.items.item.len | len | 길이(m) | NUMBER(22,9) | N | 20.2 | 길이(m) |  |
| response.body.items.item.heit | heit | 높이(m) | NUMBER(22,9) | N | 7.93 | 높이(m) |  |
| response.body.items.item.area | area | 면적(㎡) | NUMBER(30,9) | N | 134.93 | 면적(㎡) |  |
| response.body.items.item.bcRat | bcRat | 건폐율(%) | NUMBER(22,9) | N | 0 | 건폐율(%) |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |

### 9.6.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <rnum>1</rnum>
        <platPlc>서울특별시 강남구 논현동 6-13번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10800</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0006</bun>
        <ji>0013</ji>
        <mgmPmsrgstPk>102413880</mgmPmsrgstPk>
        <bldNm> </bldNm>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <jimokCd> </jimokCd>
        <jimokCdNm> </jimokCdNm>
        <jiyukCd>1023</jiyukCd>
        <jiyukCdNm>제3종일반주거지역</jiyukCdNm>
        <jiguCd>101</jiguCd>
        <jiguCdNm>중심지미관지구</jiguCdNm>
        <guyukCd> </guyukCd>
        <guyukCdNm> </guyukCdNm>
        <hdcrKindCd>05</hdcrKindCd>
        <hdcrKindCdNm>기계식주차장</hdcrKindCdNm>
        <strctCd>39</strctCd>
        <strctCdNm>기타강구조</strctCdNm>
        <len>20.2</len>
        <heit>7.93</heit>
        <area>134.93</area>
        <bcRat>0</bcRat>

2024년 건축서비스산업 정보체계 유지관리 사업






        <crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>2</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>1</totalCount>
  </body>
</response>
```


### 9.6.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getApHdcrMgmRgstInfo |
| Request DTO 후보 | ApHdcrMgmRgstInfoRequest |
| Response DTO 후보 | ApHdcrMgmRgstInfoResponse |
| Item DTO 후보 | ApHdcrMgmRgstInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.6.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `ZIP:ON 목적별 위험도 계산의 보조 입력값`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.7. 건축인허가 철거멸실 관리대장 조회

### 9.7.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getApDemolExtngMgmRgstInfo |
| Method | GET |
| Path | /getApDemolExtngMgmRgstInfo |
| Full URL | http://apis.data.go.kr/1613000/ArchPmsHubService/getApDemolExtngMgmRgstInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축행정 정보 중 건축인허가와 관련된 철거/멸실대상 건축물의 석면함유여부, 철거멸실유형 등의 철거멸실정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 원문 위치 | page 49, 50, 51, 52 |

### 9.7.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0660 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0016 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR2(3) | N | 2 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR2(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.7.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ArchPmsHubService/getApDemolExtngMgmRgstInfo?sigunguCd=11680&platGbCd=0&bjdongCd=10300&bun=0660&ji=0016&pageNo=1&numOfRows=2&serviceKey={SERVICE_KEY}
```

### 9.7.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0660 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0016 | 지 |  |
| response.body.items.item.mgmPmsrgstPk | mgmPmsrgstPk | 관리허가대장PK | VARCHAR(30) | N | 11680-100021379 | 관리허가 대장PK |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 건물명 |  |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.demolExtngGbCd | demolExtngGbCd | 철거멸실구분 코드 | VARCHAR(30) | N | 3 | 철거멸실 구분코드 |  |
| response.body.items.item.demolExtngGbCdNm | demolExtngGbCdNm | 철거멸실구분 코드명 | VARCHAR(1000) | N | 멸실 | 철거멸실 구분코드 명 |  |
| response.body.items.item.demolStrtDay | demolStrtDay | 철거시작일 | VARCHAR(8) | N | 철거시작 일 |  |  |
| response.body.items.item.demolEndDay | demolEndDay | 철거종료일 | VARCHAR(8) | N | 철거종료 일 |  |  |
| response.body.items.item.demolExtngDay | demolExtngDay | 철거멸실일 | VARCHAR(8) | N | 20100319 | 철거멸실 일 |  |
| response.body.items.item.totArea | totArea | 연면적(㎡) | NUMBER(30,9) | N | 248.31 | 연면적(㎡) |  |
| response.body.items.item.bldCnt | bldCnt | 건축물수 | NUMBER(10) | N | 1 | 건축물수 |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드 | VARCHAR(5) | N | 01000 | 주용도코 드 |  |
| response.body.items.item.mainPurpsCdNm | mainPurpsCdNm | 주용도코드명 | VARCHAR(1000) | N | 단독주택 | 주용도코 드명 |  |
| response.body.items.item.strctCd | strctCd | 구조코드 | VARCHAR(2) | N | 11 | 구조코드 |  |
| response.body.items.item.strctCdNm | strctCdNm | 구조코드명 | 0 | 벽돌구조 | 구조코드 |  |  |
| response.body.items.item.hhldCnt | hhldCnt | 세대수(세대) | NUMBER(10) | N | 0 | 세대수(세 대) |  |
| response.body.items.item.hoCnt | hoCnt | 호수(호) | NUMBER(10) | N | 0 | 호수(호) |  |
| response.body.items.item.fmlyCnt | fmlyCnt | 가구수(가구) | NUMBER(10) | N | 0 | 가구수(가 구) |  |
| response.body.items.item.cemaIncYn | cemaIncYn | 천장재함유유 무 | VARCHAR(1) | N | 0 | 0: N1: Y |  |
| response.body.items.item.himaIncYn | himaIncYn | 단열재함유유 무 | VARCHAR(1) | N | 0 | 0: N1: Y |  |
| response.body.items.item.rfmaIncYn | rfmaIncYn | 지붕재함유유 무 | VARCHAR(1) | N | 0 | 0: N1: Y |  |
| response.body.items.item.lgmaIncYn | lgmaIncYn | 보온재함유유 무 | VARCHAR(1) | N | 0 | 0: N1: Y |  |
| response.body.items.item.etcIncYn | etcIncYn | 기타함유유무 | VARCHAR(1) | N | 0: N1: Y |  |  |
| response.body.items.item.nabYn | nabYn | 해당없음유무 | VARCHAR(1) | N | 1 | 0: N1: Y |  |
| response.body.items.item.etcYn | etcYn | 기타유무 | VARCHAR(1) | N | 0 | 0: N1: Y |  |
| response.body.items.item.btmaIncYn | btmaIncYn | 바닥재함유유 무 | VARCHAR(1) | N | 0: N1: Y |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20210209 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포동 660-16번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준 코드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준 코드 |  |

### 9.7.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <rnum>1</rnum>
        <platPlc>서울특별시 강남구 개포동 660-16번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0660</bun>
        <ji>0016</ji>
        <mgmPmsrgstPk>11680-100021379</mgmPmsrgstPk>
        <bldNm> </bldNm>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <demolExtngGbCd>3</demolExtngGbCd>
        <demolExtngGbCdNm>멸실</demolExtngGbCdNm>
        <demolStrtDay> </demolStrtDay>
        <demolEndDay> </demolEndDay>
        <demolExtngDay>20100319</demolExtngDay>
        <totArea>248.31</totArea>

2024년 건축서비스산업 정보체계 유지관리 사업






        <bldCnt>1</bldCnt>
        <mainPurpsCd>01000</mainPurpsCd>
        <mainPurpsCdNm>단독주택</mainPurpsCdNm>
        <strctCd>11</strctCd>
        <strctCdNm>벽돌구조</strctCdNm>
        <fmlyCnt>0</fmlyCnt>
        <hhldCnt>0</hhldCnt>
        <hoCnt>0</hoCnt>
        <cemaIncYn>0</cemaIncYn>
        <himaIncYn>0</himaIncYn>
        <rfmaIncYn>0</rfmaIncYn>
        <lgmaIncYn>0</lgmaIncYn>
        <etcIncYn>0</etcIncYn>
        <nabYn>1</nabYn>
        <etcYn>0</etcYn>
        <btmaIncYn>0</btmaIncYn>
        <crtnDay>20210209</crtnDay>
      </item>
    </items>
    <numOfRows>2</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>1</totalCount>
  </body>
</response>
```


### 9.7.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getApDemolExtngMgmRgstInfo |
| Request DTO 후보 | ApDemolExtngMgmRgstInfoRequest |
| Response DTO 후보 | ApDemolExtngMgmRgstInfoResponse |
| Item DTO 후보 | ApDemolExtngMgmRgstInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.7.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `ZIP:ON 목적별 위험도 계산의 보조 입력값`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.8. 건축인허가 가설건축 물 조회

### 9.8.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getApTmpBldInfo |
| Method | GET |
| Path | /getApTmpBldInfo |
| Full URL | http://apis.data.go.kr/1613000/ArchPmsHubService/getApTmpBldInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 가설건축물의 존지만료일, 구조, 주용도, 건축 면적 등의 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 원문 위치 | page 54, 55, 56, 57 |

### 9.8.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0000 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR2(3) | N | 2 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.8.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ArchPmsHubService/getApTmpBldInfo?sigunguCd=11680&platGbCd=0&bjdongCd=10300&bun=0012&ji=0000&pageNo=1&numOfRows=2&serviceKey={SERVICE_KEY}
```

### 9.8.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.mgmPmsrgstPk | mgmPmsrgstPk | 관리허가대장PK | VARCHAR(30) | N | 1024100024085 | 관리허가대 장PK |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 건물명 |  |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000 ) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.sumArchArea | sumArchArea | 전체건축면적( ㎡) | NUMBER(30,9) | N | 229.32 | 전체건축면 적(㎡) |  |
| response.body.items.item.sumTotArea | sumTotArea | 전체연면적(㎡ ) | NUMBER(30,9) | N | 0 | 전체연면적 (㎡) |  |
| response.body.items.item.platArea | platArea | 대지면적(㎡) | NUMBER(30,9) | N | 121,040 | 대지면적 ( ㎡) |  |
| response.body.items.item.tmpbldPrsvExpDay | tmpbldPrsvExpDay | 가설건축물존 치만료일 | VARCHAR(8) | N | 가설건축물 존치만료일 |  |  |
| response.body.items.item.strctCd | strctCd | 구조코드 | VARCHAR(2) | N | 39 | 구조코드 |  |
| response.body.items.item.strctCdNm | strctCdNm | 구조코드명 | VARCHAR(1000 ) | N | 기타강구조 | 구조코드명 |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드 | VARCHAR(5) | N | 28000 | 주용도코드 |  |
| response.body.items.item.mainPurpsCdNm | mainPurpsCdNm | 주용도코드명 | VARCHAR(1000 ) | N | 가설건축물 | 주용도코드 명 |  |
| response.body.items.item.archArea | archArea | 건축면적(㎡) | NUMBER(30,9) | N | 229.32 | 건축면적 ( ㎡) |  |
| response.body.items.item.totArea | totArea | 연면적(㎡) | NUMBER(30,9) | N | 0 | 연면적(㎡) |  |
| response.body.items.item.grndFlrCnt | grndFlrCnt | 지상층수 | NUMBER(3) | N | 1 | 지상층수 |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000 ) | N | 서울특별시 강남구 개포동 12번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0000 | 지 |  |

### 9.8.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <rnum>1</rnum>
        <platPlc>서울특별시 강남구 개포동 12번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0000</ji>
        <mgmPmsrgstPk>1024100024085</mgmPmsrgstPk>
        <bldNm> </bldNm>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <sumArchArea>229.32</sumArchArea>
        <sumTotArea>0</sumTotArea>
        <platArea>121040</platArea>
        <tmpbldPrsvExpDay> </tmpbldPrsvExpDay>
        <strctCd>39</strctCd>
        <strctCdNm>기타강구조</strctCdNm>
        <mainPurpsCd>28000</mainPurpsCd>
        <mainPurpsCdNm>가설건축물</mainPurpsCdNm>
        <archArea>229.32</archArea>
        <totArea>0</totArea>

2024년 건축서비스산업 정보체계 유지관리 사업






        <grndFlrCnt>1</grndFlrCnt>
        <crtnDay>20220813</crtnDay>
      </item>
      <item>
        <rnum>2</rnum>
        <platPlc>서울특별시 강남구 개포동 12번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0000</ji>
        <mgmPmsrgstPk>1000000000000000401154</mgmPmsrgstPk>
        <bldNm> </bldNm>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <sumArchArea>18</sumArchArea>
        <sumTotArea>18</sumTotArea>
        <platArea>18</platArea>
        <tmpbldPrsvExpDay> </tmpbldPrsvExpDay>
        <strctCd>32</strctCd>
        <strctCdNm>경량철골구조</strctCdNm>
        <mainPurpsCd>28000</mainPurpsCd>
        <mainPurpsCdNm>가설건축물</mainPurpsCdNm>
        <archArea>18</archArea>
        <totArea>18</totArea>
        <grndFlrCnt>1</grndFlrCnt>
        <crtnDay>20231102</crtnDay>
      </item>
    </items>
    <numOfRows>2</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>4</totalCount>
  </body>
</response>
```


### 9.8.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getApTmpBldInfo |
| Request DTO 후보 | ApTmpBldInfoRequest |
| Response DTO 후보 | ApTmpBldInfoResponse |
| Item DTO 후보 | ApTmpBldInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.8.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `ZIP:ON 목적별 위험도 계산의 보조 입력값`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.9. 건축인허가 오수정화시설 조회

### 9.9.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getApWclfInfo |
| Method | GET |
| Path | /getApWclfInfo |
| Full URL | http://apis.data.go.kr/1613000/ArchPmsHubService/getApWclfInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 오수정화시설의 정화방식, 용량 등에 관한 정 보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 설비/위생 관련 체크리스트 보조 |
| 원문 위치 | page 60, 61, 62 |

### 9.9.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | 0 | 0012 | 번 |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0004 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 2 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.9.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ArchPmsHubService/getApWclfInfo?sigunguCd=11680&platGbCd=0&bjdongCd=10300&bun=0012&ji=0004&pageNo=1&numOfRows=2&serviceKey={SERVICE_KEY}
```

### 9.9.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000 ) | N | 서울특별시 강남구 개포동 12-4번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0004 | 지 |  |
| response.body.items.item.mgmPmsrgstPk | mgmPmsrgstPk | 관리허가대장PK | VARCHAR(30) | N | 1024100030704 | 관리허가대 장PK |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000 ) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.reprYn | reprYn | 대표여부 | VARCHAR(1) | N | 1 | 0: 일반 1: 대표 |  |
| response.body.items.item.wclfModeCd | wclfModeCd | 오수정화시설 형식코드 | VARCHAR(30) | N | 300 | 오수정화시 설형식코드 |  |
| response.body.items.item.wclfModeCdNm | wclfModeCdNm | 오수정화시설 형식코드명 | VARCHAR(1000 ) | N | 하수종말처리장연결 | 오수정화시 설형식코드 명 |  |
| response.body.items.item.mainDongGbCd | mainDongGbCd | 주동구분코드 | VARCHAR(30) | N | 0 | 주동구분코 드 |  |
| response.body.items.item.mainDongGbCdNm | mainDongGbCdNm | 주동구분코드 명 | VARCHAR(1000 ) | N | 주건축물 | 주동구분코 드명 |  |
| response.body.items.item.capaPsper | capaPsper | 용량(인용) | NUMBER(22,9) | N | 0 | 용량(인용) |  |
| response.body.items.item.capaLube | capaLube | 용량(루베) | NUMBER(22,9) | N | 0 | 용량(루베) |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |

### 9.9.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <rnum>1</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmPmsrgstPk>1024100030704</mgmPmsrgstPk>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <reprYn>1</reprYn>
        <wclfModeCd>300</wclfModeCd>
        <wclfModeCdNm>하수종말처리장연결</wclfModeCdNm>
        <mainDongGbCd>0</mainDongGbCd>
        <mainDongGbCdNm>주건축물</mainDongGbCdNm>
        <capaPsper>0</capaPsper>
        <capaLube>0</capaLube>
        <crtnDay>20220813</crtnDay>
      </item>

2024년 건축서비스산업 정보체계 유지관리 사업






      <item>
        <rnum>2</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmPmsrgstPk>1024100124970</mgmPmsrgstPk>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <reprYn>1</reprYn>
        <wclfModeCd>300</wclfModeCd>
        <wclfModeCdNm>하수종말처리장연결</wclfModeCdNm>
        <mainDongGbCd>0</mainDongGbCd>
        <mainDongGbCdNm>주건축물</mainDongGbCdNm>
        <capaPsper>0</capaPsper>
        <capaLube>0</capaLube>
        <crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>2</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>4</totalCount>
  </body>
</response>
```


### 9.9.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getApWclfInfo |
| Request DTO 후보 | ApWclfInfoRequest |
| Response DTO 후보 | ApWclfInfoResponse |
| Item DTO 후보 | ApWclfInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.9.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `설비/위생 관련 체크리스트 보조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.10. 건축인허가 주차장 조회

### 9.10.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getApPklotInfo |
| Method | GET |
| Path | /getApPklotInfo |
| Full URL | http://apis.data.go.kr/1613000/ArchPmsHubService/getApPklotInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 주차장의 주차자유형별 주차가능대수, 인근주차장의 주차가능대수 등의 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 주차대수·주차장 확인, 생활/매매 리스크 보조 |
| 원문 위치 | page 65, 66, 67 |

### 9.10.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0004 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 2 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.10.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ArchPmsHubService/getApPklotInfo?sigunguCd=11680&platGbCd=0&bjdongCd=10300&bun=0012&ji=0004&pageNo=1&numOfRows=2&serviceKey={SERVICE_KEY}
```

### 9.10.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포동 12-4번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준 코드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준 코드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0004 | 지 |  |
| response.body.items.item.mgmPmsrgstPk | mgmPmsrgstPk | 관리허가대장PK | VARCHAR(30) | Y | 1024100083441 | 관리허가 대장PK |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.indrAutoUtcnt | indrAutoUtcnt | 옥내자주식대 수(대) | NUMBER(10) | N | 0 | 옥내자주 식대수(대) |  |
| response.body.items.item.indrAutoArea | indrAutoArea | 옥내자주식면 적(㎡) | NUMBER(30,9) | N | 0 | 옥내자주 식면적(㎡) |  |
| response.body.items.item.oudrAutoUtcnt | oudrAutoUtcnt | 옥외자주식대 수(대) | NUMBER(10) | N | 4276.96 | 옥외자주 식대수(대) |  |
| response.body.items.item.oudrAutoArea | oudrAutoArea | 옥외자주식면 적(㎡) | NUMBER(30,9) | N | 0 | 옥외자주 식면적(㎡) |  |
| response.body.items.item.indrMechUtcnt | indrMechUtcnt | 옥내기계식대 수(대) | NUMBER(10) | N | 0 | 옥내기계 식대수(대) |  |
| response.body.items.item.indrMechArea | indrMechArea | 옥내기계식면 적(㎡) | NUMBER(30,9) | N | 0 | 옥내기계 식면적(㎡) |  |
| response.body.items.item.oudrMechUtcnt | oudrMechUtcnt | 옥외기계식대 수(대) | NUMBER(10) | N | 0 | 옥외기계 식대수(대) |  |
| response.body.items.item.oudrMechArea | oudrMechArea | 옥외기계식면 적(㎡) | NUMBER(30,9) | N | 0 | 옥외기계 식면적(㎡) |  |
| response.body.items.item.neigAutoUtcnt | neigAutoUtcnt | 인근자주식대 수(대) | NUMBER(10) | N | 0 | 인근자주 식대수(대) |  |
| response.body.items.item.neigAutoArea | neigAutoArea | 인근자주식면 적(㎡) | NUMBER(30,9) | N | 0 | 인근자주 식면적(㎡) |  |
| response.body.items.item.neigMechUtcnt | neigMechUtcnt | 인근기계식대 수(대) | NUMBER(10) | N | 0 | 인근기계 식대수(대) |  |
| response.body.items.item.neigMechArea | neigMechArea | 인근기계식면 적(㎡) | NUMBER(30,9) | N | 0 | 인근기계 식면적(㎡) |  |
| response.body.items.item.exmptUtcnt | exmptUtcnt | 면제대수(대) | NUMBER(10) | N | 0 | 면제대수 ( 대) |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |

### 9.10.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <rnum>1</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmPmsrgstPk>1024100083441</mgmPmsrgstPk>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <indrAutoUtcnt>0</indrAutoUtcnt>
        <indrAutoArea>0</indrAutoArea>
        <oudrAutoUtcnt>105</oudrAutoUtcnt>
        <oudrAutoArea>4276.96</oudrAutoArea>
        <indrMechUtcnt>0</indrMechUtcnt>
        <indrMechArea>0</indrMechArea>
        <oudrMechUtcnt>0</oudrMechUtcnt>

2024년 건축서비스산업 정보체계 유지관리 사업






        <oudrMechArea>0</oudrMechArea>
        <neigAutoUtcnt>0</neigAutoUtcnt>
        <neigAutoArea>0</neigAutoArea>
        <neigMechUtcnt>0</neigMechUtcnt>
        <neigMechArea>0</neigMechArea>
        <exmptUtcnt>0</exmptUtcnt>
        <crtnDay>20220813</crtnDay>
      </item>
      <item>
        <rnum>2</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmPmsrgstPk>1024100026327</mgmPmsrgstPk>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <indrAutoUtcnt>105</indrAutoUtcnt>
        <indrAutoArea>4276.96</indrAutoArea>
        <oudrAutoUtcnt>0</oudrAutoUtcnt>
        <oudrAutoArea>0</oudrAutoArea>
        <indrMechUtcnt>0</indrMechUtcnt>
        <indrMechArea>0</indrMechArea>
        <oudrMechUtcnt>0</oudrMechUtcnt>
        <oudrMechArea>0</oudrMechArea>
        <neigAutoUtcnt>0</neigAutoUtcnt>
        <neigAutoArea>0</neigAutoArea>
        <neigMechUtcnt>0</neigMechUtcnt>
        <neigMechArea>0</neigMechArea>
        <exmptUtcnt>0</exmptUtcnt>
        <crtnDay>20220813</crtnDay>
      </item>
    </items>

2024년 건축서비스산업 정보체계 유지관리 사업






    <numOfRows>2</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>16</totalCount>
  </body>
</response>
```


### 9.10.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getApPklotInfo |
| Request DTO 후보 | ApPklotInfoRequest |
| Response DTO 후보 | ApPklotInfoResponse |
| Item DTO 후보 | ApPklotInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.10.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `주차대수·주차장 확인, 생활/매매 리스크 보조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.11. 건축인허가 부설주차장 조회

### 9.11.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getApAtchPklotInfo |
| Method | GET |
| Path | /getApAtchPklotInfo |
| Full URL | http://apis.data.go.kr/1613000/ArchPmsHubService/getApAtchPklotInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 부설주차창의 대지위치, 관련지번 등에 관한 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 주차대수·주차장 확인, 생활/매매 리스크 보조 |
| 원문 위치 | page 70, 71, 72 |

### 9.11.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 1233 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0022 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 2 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.11.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ArchPmsHubService/getApAtchPklotInfo?sigunguCd=11680&platGbCd=0&bjdongCd=10300&bun=1233&ji=0022&pageNo=1&numOfRows=2&serviceKey={SERVICE_KEY}
```

### 9.11.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | 0 | 서울특별시 강남구 | 대지위치 |  |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 1233 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0022 | 지 |  |
| response.body.items.item.mgmPmsrgstPk | mgmPmsrgstPk | 관리허가대장PK | VARCHAR(30) | N | 1024100064469 | 관리허가대 장PK |  |
| response.body.items.item.hjdongCd | hjdongCd | 행정동코드 | VARCHAR(30) | N | 69000 | 행정동코드 |  |
| response.body.items.item.jimokCd | jimokCd | 지목코드 | VARCHAR(30) | N | 08 | 지목코드 |  |
| response.body.items.item.jimokCdNm | jimokCdNm | 지목코드명 | VARCHAR(1000 ) | N | 대 | 지목코드명 |  |
| response.body.items.item.relJibunNm | relJibunNm | 관련지번명 | VARCHAR(1000 ) | N | 관련지번명 |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |

### 9.11.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <rnum>1</rnum>
        <platPlc>서울특별시 강남구 개포동 1233-22번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>1233</bun>
        <ji>0022</ji>
        <mgmPmsrgstPk>1024100064469</mgmPmsrgstPk>
        <hjdongCd>69000</hjdongCd>
        <jimokCd>08</jimokCd>
        <jimokCdNm>대</jimokCdNm>
        <relJibunNm> </relJibunNm>
        <crtnDay>20220813</crtnDay>
      </item>
      <item>
        <rnum>2</rnum>
        <platPlc>서울특별시 강남구 개포동 1233-22번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>1233</bun>
        <ji>0022</ji>
        <mgmPmsrgstPk>1024100064469</mgmPmsrgstPk>
        <hjdongCd>69000</hjdongCd>
        <jimokCd>08</jimokCd>
        <jimokCdNm>대</jimokCdNm>

2024년 건축서비스산업 정보체계 유지관리 사업






        <relJibunNm> </relJibunNm>
        <crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>2</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>2</totalCount>
  </body>
</response>
```


### 9.11.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getApAtchPklotInfo |
| Request DTO 후보 | ApAtchPklotInfoRequest |
| Response DTO 후보 | ApAtchPklotInfoResponse |
| Item DTO 후보 | ApAtchPklotInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.11.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `주차대수·주차장 확인, 생활/매매 리스크 보조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.12. 건축인허가 전유공용면적 조회

### 9.12.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getApExposPubuseAreaInfo |
| Method | GET |
| Path | /getApExposPubuseAreaInfo |
| Full URL | http://apis.data.go.kr/1613000/ArchPmsHubService/getApExposPubuseAreaInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 건축물의 전유/공용구분, 주부속구분, 주용도, 구조 등의 전유/공용면적에 대한 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 전유부/전유공용면적 확인, 다세대·오피스텔 판단 보조 |
| 원문 위치 | page 74, 75, 76, 77 |

### 9.12.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0004 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 2 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.12.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ArchPmsHubService/getApExposPubuseAreaInfo?sigunguCd=11680&platGbCd=0&bjdongCd=10300&bun=0012&ji=0004&pageNo=1&numOfRows=2&serviceKey={SERVICE_KEY}
```

### 9.12.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | 0 | 서울특별시 강남구 | 대지위치 |  |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0004 | 지 |  |
| response.body.items.item.mgmExposPubuseAreaPk | mgmExposPubuseAreaPk | 관리전유공용면적PK | VARCHAR(30) | Y | 1024100015983 | 관리전유공 용면적PK |  |
| response.body.items.item.mgmPmsrgstPk | mgmPmsrgstPk | 관리허가대장PK | VARCHAR(30) | N | 1024100030704 | 관리허가대 장PK |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.pngtypGbNm | pngtypGbNm | 평형구분명 | VARCHAR(1000) | N | 701호 | 평형구분명 |  |
| response.body.items.item.exposPubuseGbCd | exposPubuseGbCd | 전유공용구분 코드 | VARCHAR(30) | N | 1 | 전유공용구 분코드 |  |
| response.body.items.item.exposPubuseGbCdNm | exposPubuseGbCdNm | 전유공용구분 코드명 | VARCHAR(1000) | N | 전유 | 전유공용구 분코드명 |  |
| response.body.items.item.mainAtchGbCd | mainAtchGbCd | 주부속구분코 드 | VARCHAR(30) | N | 0 | 주부속구분 코드 |  |
| response.body.items.item.mainAtchGbCdNm | mainAtchGbCdNm | 주부속구분코 드명 | VARCHAR(1000) | N | 주건축물 | 주부속구분 코드명 |  |
| response.body.items.item.flrGbCd | flrGbCd | 층구분코드 | VARCHAR(30) | N | 20 | 층구분코드 |  |
| response.body.items.item.flrGbCdNm | flrGbCdNm | 층구분코드명 | VARCHAR(1000) | N | 지상 | 층구분코드 명 |  |
| response.body.items.item.flrNo | flrNo | 층번호 | NUMBER(5) | N | 7 | 층번호 |  |
| response.body.items.item.strctCd | strctCd | 구조코드 | VARCHAR(2) | N | 21 | 구조코드 |  |
| response.body.items.item.strctCdNm | strctCdNm | 구조코드명 | VARCHAR(1000) | N | 철근콘크리트구조 | 구조코드명 |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드 | VARCHAR(5) | N | 13006 | 주용도코드 |  |
| response.body.items.item.mainPurpsCdNm | mainPurpsCdNm | 주용도코드명 | VARCHAR(1000) | N | 체력단련장 | 주용도코드 명 |  |
| response.body.items.item.etcPurps | etcPurps | 기타용도 | VARCHAR(4000) | N | 기타용도 |  |  |
| response.body.items.item.area | area | 면적(㎡) | NUMBER(30,9) | N | 675.42 | 면적(㎡) |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |

### 9.12.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <rnum>1</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmExposPubuseAreaPk>1024100015983</mgmExposPubuseAreaPk>
        <mgmPmsrgstPk>1024100030704</mgmPmsrgstPk>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <pngtypGbNm>701호</pngtypGbNm>
        <exposPubuseGbCd>1</exposPubuseGbCd>
        <exposPubuseGbCdNm>전유</exposPubuseGbCdNm>
        <mainAtchGbCd>0</mainAtchGbCd>
        <mainAtchGbCdNm>주건축물</mainAtchGbCdNm>
        <flrGbCd>20</flrGbCd>
        <flrGbCdNm>지상</flrGbCdNm>
        <flrNo>7</flrNo>
        <strctCd>21</strctCd>
        <strctCdNm>철근콘크리트구조</strctCdNm>
        <mainPurpsCd>13006</mainPurpsCd>
        <mainPurpsCdNm>체력단련장</mainPurpsCdNm>
        <etcPurps> </etcPurps>
        <area>675.42</area>
        <crtnDay>20220813</crtnDay>

2024년 건축서비스산업 정보체계 유지관리 사업






      </item>
      <item>
        <rnum>2</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmExposPubuseAreaPk>1024100015984</mgmExposPubuseAreaPk>
        <mgmPmsrgstPk>1024100030704</mgmPmsrgstPk>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <pngtypGbNm>701호</pngtypGbNm>
        <exposPubuseGbCd>1</exposPubuseGbCd>
        <exposPubuseGbCdNm>전유</exposPubuseGbCdNm>
        <mainAtchGbCd>0</mainAtchGbCd>
        <mainAtchGbCdNm>주건축물</mainAtchGbCdNm>
        <flrGbCd>20</flrGbCd>
        <flrGbCdNm>지상</flrGbCdNm>
        <flrNo>7</flrNo>
        <strctCd>21</strctCd>
        <strctCdNm>철근콘크리트구조</strctCdNm>
        <mainPurpsCd>13011</mainPurpsCd>
        <mainPurpsCdNm>골프연습장</mainPurpsCdNm>
        <etcPurps> </etcPurps>
        <area>280.38</area>
        <crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>2</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>9</totalCount>
  </body>

2024년 건축서비스산업 정보체계 유지관리 사업






</response>
```


### 9.12.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getApExposPubuseAreaInfo |
| Request DTO 후보 | ApExposPubuseAreaInfoRequest |
| Response DTO 후보 | ApExposPubuseAreaInfoResponse |
| Item DTO 후보 | ApExposPubuseAreaInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.12.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `전유부/전유공용면적 확인, 다세대·오피스텔 판단 보조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.13. 건축인허가 호별전유 공용면적 조회

### 9.13.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getApHoExposPubuseAreaInfo |
| Method | GET |
| Path | /getApHoExposPubuseAreaInfo |
| Full URL | http://apis.data.go.kr/1613000/ArchPmsHubService/getApHoExposPubuseAreaInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축행정 정보 중 건축, 대수선, 용도변경인허가와 관련된 건축물의 구조코드, 호 별면적, 용도 등 호별 전유/공유 면적 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 호실 단위 정보 확인, 집합/전유부 판단 보조 |
| 원문 위치 | page 80, 81, 82, 83 |

### 9.13.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0004 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 2 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.13.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ArchPmsHubService/getApHoExposPubuseAreaInfo?sigunguCd=11680&platGbCd=0&bjdongCd=10300&bun=0012&ji=0004&pageNo=1&serviceKey={SERVICE_KEY}
```

### 9.13.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.mgmHoDetlPk | mgmHoDetlPk | 관리호별명세PK | VARCHAR(30) | N | 1024100009983 | 관리호별 명세PK |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | 0 | 특수지명 |  |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.pngtypGbNm | pngtypGbNm | 평형구분명 | VARCHAR(1000) | N | 701호 | 평형구분 명 |  |
| response.body.items.item.exposPubuseGbCd | exposPubuseGbCd | 전유공용구분 코드 | VARCHAR(30) | N | 1 | 전유공용 구분코드 |  |
| response.body.items.item.exposPubuseGbCdNm | exposPubuseGbCdNm | 전유공용구분 코드명 | VARCHAR(1000) | N | 전유 | 전유공용 구분코드 명 |  |
| response.body.items.item.mainAtchGbCd | mainAtchGbCd | 주부속구분코 드 | VARCHAR(30) | N | 0 | 주부속구 분코드 |  |
| response.body.items.item.mainAtchGbCdNm | mainAtchGbCdNm | 주부속구분코 드명 | VARCHAR(1000) | N | 주건축물 | 주부속구 분코드명 |  |
| response.body.items.item.flrGbCd | flrGbCd | 층구분코드 | VARCHAR(30) | N | 20 | 층구분코 드 |  |
| response.body.items.item.flrGbCdNm | flrGbCdNm | 층구분코드명 | VARCHAR(1000) | N | 지상 | 층구분코 드명 |  |
| response.body.items.item.flrNo | flrNo | 층번호 | NUMBER(5) | N | 7 | 층번호 |  |
| response.body.items.item.strctCd | strctCd | 구조코드 | VARCHAR(2) | N | 21 | 구조코드 |  |
| response.body.items.item.strctCdNm | strctCdNm | 구조코드명 | VARCHAR(1000) | N | 철근콘크리트구조 | 구조코드 명 |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드 | VARCHAR(5) | N | 13011 | 주용도코 드 |  |
| response.body.items.item.mainPurpsCdNm | mainPurpsCdNm | 주용도코드명 | VARCHAR(100 | N | 골프연습장 | 주용도코 드명 |  |
| response.body.items.item.etcPurps | etcPurps | 기타용도 | VARCHAR(4000) | N | 기타용도 |  |  |
| response.body.items.item.area | area | 면적(㎡) | NUMBER(30,9) | N | 280.38 | 면적(㎡) |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포동 12-4번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준 코드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준 코드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0004 | 지 |  |
| response.body.items.item.mgmHoExposPubuseAreaPk | mgmHoExposPubuseAreaPk | 관리호별전유 공용면적PK | VARCHAR(30) | Y | 1024100026003 | 관리호별 전유공용 면적PK |  |

### 9.13.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <rnum>1</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmHoExposPubuseAreaPk>1024100026003</mgmHoExposPubuseAreaPk>
        <mgmHoDetlPk>1024100009983</mgmHoDetlPk>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <pngtypGbNm>701호</pngtypGbNm>
        <exposPubuseGbCd>1</exposPubuseGbCd>
        <exposPubuseGbCdNm>전유</exposPubuseGbCdNm>
        <mainAtchGbCd>0</mainAtchGbCd>
        <mainAtchGbCdNm>주건축물</mainAtchGbCdNm>
        <flrGbCd>20</flrGbCd>
        <flrGbCdNm>지상</flrGbCdNm>
        <flrNo>7</flrNo>
        <strctCd>21</strctCd>
        <strctCdNm>철근콘크리트구조</strctCdNm>
        <mainPurpsCd>13011</mainPurpsCd>
        <mainPurpsCdNm>골프연습장</mainPurpsCdNm>
        <etcPurps> </etcPurps>
        <area>280.38</area>

2024년 건축서비스산업 정보체계 유지관리 사업






        <crtnDay>20220813</crtnDay>
      </item>
      <item>
        <rnum>2</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmHoExposPubuseAreaPk>1024100026004</mgmHoExposPubuseAreaPk>
        <mgmHoDetlPk>1024100009983</mgmHoDetlPk>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <pngtypGbNm>701호</pngtypGbNm>
        <exposPubuseGbCd>1</exposPubuseGbCd>
        <exposPubuseGbCdNm>전유</exposPubuseGbCdNm>
        <mainAtchGbCd>0</mainAtchGbCd>
        <mainAtchGbCdNm>주건축물</mainAtchGbCdNm>
        <flrGbCd>20</flrGbCd>
        <flrGbCdNm>지상</flrGbCdNm>
        <flrNo>7</flrNo>
        <strctCd>21</strctCd>
        <strctCdNm>철근콘크리트구조</strctCdNm>
        <mainPurpsCd>13006</mainPurpsCd>
        <mainPurpsCdNm>체력단련장</mainPurpsCdNm>
        <etcPurps> </etcPurps>
        <area>675.42</area>
        <crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>2</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>9</totalCount>

2024년 건축서비스산업 정보체계 유지관리 사업






  </body>
</response>
```


### 9.13.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getApHoExposPubuseAreaInfo |
| Request DTO 후보 | ApHoExposPubuseAreaInfoRequest |
| Response DTO 후보 | ApHoExposPubuseAreaInfoResponse |
| Item DTO 후보 | ApHoExposPubuseAreaInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.13.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `호실 단위 정보 확인, 집합/전유부 판단 보조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.14. 건축인허가 지역지구구역 조회

### 9.14.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getApJijiguInfo |
| Method | GET |
| Path | /getApJijiguInfo |
| Full URL | http://apis.data.go.kr/1613000/ArchPmsHubService/getApJijiguInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축행정 정보 중 건축인허가와 관련된 건축물의 지역, 지구, 구역 정보를 제공 한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 용도지역·지구·구역 확인 및 목적별 체크리스트 |
| 원문 위치 | page 86, 87, 88, 89 |

### 9.14.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0004 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 2 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.14.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ArchPmsHubService/getApJijiguInfo?sigunguCd=11680&platGbCd=0&bjdongCd=10300&bun=0012&ji=0004&pageNo=1&numOfRows=2&serviceKey={SERVICE_KEY}
```

### 9.14.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.jijiguNm | jijiguNm | 지역지구구역 명 | VARCHAR(1000) | N | 제3종일반주거지역 | 지역지구구 역명 |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포동 12-4번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0004 | 지 |  |
| response.body.items.item.mgmPmsrgstPk | mgmPmsrgstPk | 관리허가대장PK | VARCHAR(30) | N | 1024100008536 | 관리허가대 장PK |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.jijiguGbCd | jijiguGbCd | 지역지구구역 구분코드 | VARCHAR(30) | N | 1 | 지역지구구 역구분코드 |  |
| response.body.items.item.jijiguGbCdNm | jijiguGbCdNm | 지역지구구역 구분코드명 | VARCHAR(1000) | N | 용도지역코드 | 지역지구구 역구분코드 명 |  |
| response.body.items.item.jijiguCd | jijiguCd | 지역지구구역 코드 | VARCHAR(30) | N | 1023 | 지역지구구 역코드 |  |
| response.body.items.item.jijiguCdNm | jijiguCdNm | 지역지구구역 코드명 | VARCHAR(1000) | N | 제3종일반주거지역 | 지역지구구 역코드명 |  |
| response.body.items.item.reprYn | reprYn | 대표여부 | VARCHAR(1) | N | 1 | 0: 일반 |  |
| response.body.items.item.mainDongGbCd | mainDongGbCd | 주동구분코드 | VARCHAR(30) | N | 0 | 주동구분코 드 |  |
| response.body.items.item.mainDongGbCdNm | mainDongGbCdNm | 주동구분코드 명 | VARCHAR(1000) | N | 주동구분코 드명 |  |  |

### 9.14.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <rnum>1</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmPmsrgstPk>1024100008536</mgmPmsrgstPk>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>

2024년 건축서비스산업 정보체계 유지관리 사업






        <jijiguGbCd>1</jijiguGbCd>
        <jijiguGbCdNm>용도지역코드</jijiguGbCdNm>
        <jijiguCd>1023</jijiguCd>
        <jijiguCdNm>제3종일반주거지역</jijiguCdNm>
        <reprYn>1</reprYn>
        <mainDongGbCd>0</mainDongGbCd>
        <mainDongGbCdNm> </mainDongGbCdNm>
        <jijiguNm>제3종일반주거지역</jijiguNm>
        <crtnDay>20220813</crtnDay>
      </item>
      <item>
        <rnum>2</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmPmsrgstPk>10242644</mgmPmsrgstPk>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <jijiguGbCd>1</jijiguGbCd>
        <jijiguGbCdNm>용도지역코드</jijiguGbCdNm>
        <jijiguCd>1020</jijiguCd>
        <jijiguCdNm>일반주거지역</jijiguCdNm>
        <reprYn>1</reprYn>
        <mainDongGbCd>0</mainDongGbCd>
        <mainDongGbCdNm> </mainDongGbCdNm>
        <jijiguNm>일반주거지역</jijiguNm>
        <crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>2</numOfRows>
    <pageNo>1</pageNo>

2024년 건축서비스산업 정보체계 유지관리 사업






    <totalCount>47</totalCount>
  </body>
</response>
```


### 9.14.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getApJijiguInfo |
| Request DTO 후보 | ApJijiguInfoRequest |
| Response DTO 후보 | ApJijiguInfoResponse |
| Item DTO 후보 | ApJijiguInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.14.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `용도지역·지구·구역 확인 및 목적별 체크리스트`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.15. 건축인허가 도로명대 장 조회

### 9.15.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getApRoadRgstInfo |
| Method | GET |
| Path | /getApRoadRgstInfo |
| Full URL | http://apis.data.go.kr/1613000/ArchPmsHubService/getApRoadRgstInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 도로의 도로지정번호, 도로의 길이, 면적, 너비 등의 도로정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 원문 위치 | page 91, 92, 93, 94 |

### 9.15.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0160 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0005 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 2 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.15.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ArchPmsHubService/getApRoadRgstInfo?sigunguCd=11680&platGbCd=0&bjdongCd=10300&bun=0160&ji=0005&pageNo=1&numOfRows=2&serviceKey={SERVICE_KEY}
```

### 9.15.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(100 | N | 서울특별시 강남 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준코드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준코드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0160 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0005 | 지 |  |
| response.body.items.item.mgmPmsrgstPk | mgmPmsrgstPk | 관리허가대장PK | VARCHAR(30) | N | 1024100034324 | 관리허가대장 PK |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.ranoYear | ranoYear | 도로지정번호 년 | VARCHAR(4) | N | 2011 | 도로지정번호 년 |  |
| response.body.items.item.ranoSeqno | ranoSeqno | 도로지정번호 일련번호 | NUMBER(30) | N | 16 | 도로지정번호 일련번호 |  |
| response.body.items.item.rdasnGbCd | rdasnGbCd | 도로지정구분 코드 | VARCHAR(30) | N | 1 | 도로지정구분 코드 |  |
| response.body.items.item.rdasnGbCdNm | rdasnGbCdNm | 도로지정구분 코드명 | VARCHAR(1000) | N | 지정 | 도로지정구분 코드명 |  |
| response.body.items.item.rdasnDay | rdasnDay | 도로지정일 | VARCHAR(8) | N | 20110525 | 도로지정일 |  |
| response.body.items.item.roadChangDay | roadChangDay | 도로변경일 | VARCHAR(8) | N | 도로변경일 |  |  |
| response.body.items.item.roadChangOdr | roadChangOdr | 도로변경차수 | NUMBER(5) | N | 0 | 도로변경차수 |  |
| response.body.items.item.roadCloseDay | roadCloseDay | 도로폐지일 | VARCHAR(8) | N | 도로폐지일 |  |  |
| response.body.items.item.mgmSigunguCd | mgmSigunguCd | 관리시군구코 드 | VARCHAR(30) | N | 11680 | 관리시군구코 드 |  |
| response.body.items.item.rdasnChangDay | rdasnChangDay | 도시지정변경 일 | VARCHAR(8) | N | 도시지정변경 일 |  |  |
| response.body.items.item.roadLenTotal | roadLenTotal | 도로길이합계 | NUMBER(30,9) | N | 0 | 도로길이합계 |  |
| response.body.items.item.roadWidthTotal | roadWidthTotal | 도로너비합계 | NUMBER(30,9) | N | 0 | 도로너비합계 |  |
| response.body.items.item.roadAreaTotal | roadAreaTotal | 도로면적합계 | NUMBER(30,9) | N | 0 | 도로면적합계 |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |

### 9.15.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <rnum>1</rnum>
        <platPlc>서울특별시 강남구 개포동 160-5번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0160</bun>
        <ji>0005</ji>
        <mgmPmsrgstPk>1024100034324</mgmPmsrgstPk>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <ranoYear>2011</ranoYear>
        <ranoSeqno>16</ranoSeqno>
        <rdasnGbCd>1</rdasnGbCd>
        <rdasnGbCdNm>지정</rdasnGbCdNm>
        <rdasnDay>20110525</rdasnDay>
        <roadChangDay> </roadChangDay>
        <roadChangOdr>0</roadChangOdr>
        <roadCloseDay> </roadCloseDay>
        <mgmSigunguCd>11680</mgmSigunguCd>
        <rdasnChangDay> </rdasnChangDay>
        <roadLenTotal>0</roadLenTotal>
        <roadWidthTotal>0</roadWidthTotal>
        <roadAreaTotal>0</roadAreaTotal>
        <crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>2</numOfRows>

2024년 건축서비스산업 정보체계 유지관리 사업






    <pageNo>1</pageNo>
    <totalCount>1</totalCount>
  </body>
</response>
```


### 9.15.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getApRoadRgstInfo |
| Request DTO 후보 | ApRoadRgstInfoRequest |
| Response DTO 후보 | ApRoadRgstInfoResponse |
| Item DTO 후보 | ApRoadRgstInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.15.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `ZIP:ON 목적별 위험도 계산의 보조 입력값`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.16. 건축인허가 대지위치 조회

### 9.16.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getApPlatPlcInfo |
| Method | GET |
| Path | /getApPlatPlcInfo |
| Full URL | http://apis.data.go.kr/1613000/ArchPmsHubService/getApPlatPlcInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 건축인허가와 관련된 대지의 지번주소, 대지구분, 대표여부 등의 대 지위치정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 원문 위치 | page 96, 97, 98, 99 |

### 9.16.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0004 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 2 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.16.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ArchPmsHubService/getApPlatPlcInfo?sigunguCd=11680&platGbCd=0&bjdongCd=10300&bun=0012&ji=0004&pageNo=1&numOfRows=2&serviceKey={SERVICE_KEY}
```

### 9.16.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.mgmDongOulnPk | mgmDongOulnPk | 관리동별개요PK | NUMBER(30) | N | 관리동별 개요PK |  |  |
| response.body.items.item.reprYn | reprYn | 대표여부 | VARCHAR(1) | N | 1 | 0: 일반 |  |
| response.body.items.item.mainDongGbCd | mainDongGbCd | 주동구분코드 | VARCHAR(30) | N | 0 | 주동구분 코드 |  |
| response.body.items.item.mainDongGbCdNm | mainDongGbCdNm | 주동구분코드 명 | VARCHAR(1000) | N | 주건축물 | 주동구분 코드명 |  |
| response.body.items.item.hjdongCd | hjdongCd | 행정동코드 | VARCHAR(30) | N | 67000 | 행정동코 드 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.jimokCd | jimokCd | 지목코드 | VARCHAR(30) | N | 08 | 지목코드 |  |
| response.body.items.item.jimokCdNm | jimokCdNm | 지목코드명 | VARCHAR(1000) | N | 대 | 지목코드 명 |  |
| response.body.items.item.relJibunNm | relJibunNm | 관련지번명 | VARCHAR(1000) | N | 관련지번 명 |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포동 12-4번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준 코드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준 코드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0004 | 지 |  |
| response.body.items.item.mgmPlatPlcPk | mgmPlatPlcPk | 관리대지위치PK | VARCHAR(30) | Y | 10242646 | 관리대지 위치PK |  |
| response.body.items.item.mgmPmsrgstPk | mgmPmsrgstPk | 관리허가대장PK | VARCHAR(30) | N | 10242644 | 관리허가 대장PK |  |

### 9.16.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <rnum>1</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmPlatPlcPk>10242646</mgmPlatPlcPk>

2024년 건축서비스산업 정보체계 유지관리 사업






        <mgmPmsrgstPk>10242644</mgmPmsrgstPk>
        <mgmDongOulnPk> </mgmDongOulnPk>
        <reprYn>1</reprYn>
        <mainDongGbCd>0</mainDongGbCd>
        <mainDongGbCdNm>주건축물</mainDongGbCdNm>
        <hjdongCd>67000</hjdongCd>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <jimokCd>08</jimokCd>
        <jimokCdNm>대</jimokCdNm>
        <relJibunNm> </relJibunNm>
        <crtnDay>20220813</crtnDay>
      </item>
      <item>
        <rnum>2</rnum>
        <platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0012</bun>
        <ji>0004</ji>
        <mgmPlatPlcPk>10244404</mgmPlatPlcPk>
        <mgmPmsrgstPk>10244402</mgmPmsrgstPk>
        <mgmDongOulnPk> </mgmDongOulnPk>
        <reprYn>1</reprYn>
        <mainDongGbCd>0</mainDongGbCd>
        <mainDongGbCdNm>주건축물</mainDongGbCdNm>
        <hjdongCd>74000</hjdongCd>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <jimokCd>08</jimokCd>
        <jimokCdNm>대</jimokCdNm>
        <relJibunNm> </relJibunNm>
        <crtnDay>20220813</crtnDay>

2024년 건축서비스산업 정보체계 유지관리 사업






      </item>
    </items>
    <numOfRows>2</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>20</totalCount>
  </body>
</response>
```


### 9.16.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getApPlatPlcInfo |
| Request DTO 후보 | ApPlatPlcInfoRequest |
| Response DTO 후보 | ApPlatPlcInfoResponse |
| Item DTO 후보 | ApPlatPlcInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.16.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `ZIP:ON 목적별 위험도 계산의 보조 입력값`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.17. 건축인허가 주택유형 조회

### 9.17.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getApHsTpInfo |
| Method | GET |
| Path | /getApHsTpInfo |
| Full URL | http://apis.data.go.kr/1613000/ArchPmsHubService/getApHsTpInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 건축행정 정보 중 건축인허가와 관련된 건축물의 주택유형, 실/호/세대수 및 면 적 등의 주택유형별 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 원문 위치 | page 101, 102, 103 |

### 9.17.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0157 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0009 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 2 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.17.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ArchPmsHubService/getApHsTpInfo?sigunguCd=11680&platGbCd=0&bjdongCd=10300&bun=0157&ji=0009&pageNo=1&numOfRows=2&serviceKey={SERVICE_KEY}
```

### 9.17.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(100 | N | 서울특별시 강남구 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0157 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0009 | 지 |  |
| response.body.items.item.mgmPmsrgstPk | mgmPmsrgstPk | 관리허가대장PK | VARCHAR(30) | N | 1024100026639 | 관리허가대 장PK |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 개포동 157-9 공동 주택 (김해옥) | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.hstpGbCd | hstpGbCd | 주택유형구분 코드 | VARCHAR(30) | N | 2 | 주택유형구 분코드 |  |
| response.body.items.item.hstpGbCdNm | hstpGbCdNm | 주택유형구분 코드명 | VARCHAR(1000) | N | 준주택(오피스텔) | 주택유형구 분코드명 |  |
| response.body.items.item.silHoHhldCnt | silHoHhldCnt | 실호세대수(세 대) | NUMBER(10) | N | 4 | 실호세대수( 세대) |  |
| response.body.items.item.silHoHhldArea | silHoHhldArea | 실호세대수면 적(㎡) | NUMBER(30,9) | N | 45.22 | 실호세대수 면적(㎡) |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |

### 9.17.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <rnum>1</rnum>
        <platPlc>서울특별시 강남구 개포동 157-9번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0157</bun>
        <ji>0009</ji>
        <mgmPmsrgstPk>1024100026639</mgmPmsrgstPk>
        <bldNm>개포동 157-9 공동주택 (김해옥)</bldNm>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <hstpGbCd>2</hstpGbCd>
        <hstpGbCdNm>준주택(오피스텔)</hstpGbCdNm>
        <silHoHhldArea>45.22</silHoHhldArea>
        <silHoHhldCnt>4</silHoHhldCnt>
        <crtnDay>20220813</crtnDay>
      </item>

2024년 건축서비스산업 정보체계 유지관리 사업






      <item>
        <rnum>2</rnum>
        <platPlc>서울특별시 강남구 개포동 157-9번지</platPlc>
        <sigunguCd>11680</sigunguCd>
        <bjdongCd>10300</bjdongCd>
        <platGbCd>0</platGbCd>
        <bun>0157</bun>
        <ji>0009</ji>
        <mgmPmsrgstPk>1024100026639</mgmPmsrgstPk>
        <bldNm>개포동 157-9 공동주택 (김해옥)</bldNm>
        <splotNm> </splotNm>
        <block> </block>
        <lot> </lot>
        <hstpGbCd>2</hstpGbCd>
        <hstpGbCdNm>준주택(오피스텔)</hstpGbCdNm>
        <silHoHhldArea>57.13</silHoHhldArea>
        <silHoHhldCnt>4</silHoHhldCnt>
        <crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>2</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>2</totalCount>
  </body>
</response>
```


### 9.17.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getApHsTpInfo |
| Request DTO 후보 | ApHsTpInfoRequest |
| Response DTO 후보 | ApHsTpInfoResponse |
| Item DTO 후보 | ApHsTpInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.17.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `ZIP:ON 목적별 위험도 계산의 보조 입력값`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


## 10. 코드표 / Enum / 분류값

| 분류 | 코드 | 의미 | ZIP:ON 처리 |
| --- | --- | --- | --- |
| platGbCd | 0 | 대지 | 대지 기준 조회 |
| platGbCd | 1 | 산 | 산번지/임야 가능성 안내 |
| platGbCd | 2 | 블록 | 블록 지번. 주소 파싱 결과 검증 필요 |
| resultCode | 00 | NORMAL SERVICE | 성공 처리 |

## 11. 에러 코드

| 코드 | 메시지 | 의미 | 백엔드 처리 방안 | 사용자 노출 메시지 |
| --- | --- | --- | --- | --- |
| 00 | NORMAL SERVICE | 정상 | 성공 처리 |  |
| 01 | APPLICATION_ERROR | 어플리케이션 에러 | 일시 장애 또는 제공기관 오류로 기록하고 재시도 가능 여부 판단 | 잠시 후 다시 시도해주세요. |
| 02 | DB_ERROR | 데이터베이스 에러 | 제공기관 DB 오류. 재시도 후 지속 시 관리자 확인 | 공공데이터 제공기관 응답이 불안정합니다. |
| 04 | HTTP_ERROR | HTTP 에러 | HTTP 상태코드와 본문을 함께 로깅 | 공공데이터 호출 중 오류가 발생했습니다. |
| 05 | SERVICETIMEOUT_ERROR | 서비스 연결 실패 에러 | 타임아웃 처리, 회로차단/재시도 정책 적용 | 공공데이터 응답이 지연되고 있습니다. |
| 10 | INVALID_REQUEST_PARAMETER_ERROR | 잘못된 요청 파라미터 에러 | 사용자 입력 또는 주소 파싱 결과 검증 | 입력한 주소 정보를 다시 확인해주세요. |
| 11 | NO_MANDATORY_REQUEST_PARAMETERS_ERROR | 필수 요청 파라미터 없음 | 백엔드 요청 DTO 검증 실패로 처리 | 필수 조회 조건이 부족합니다. |
| 12 | NO_OPENAPI_SERVICE_ERROR | 해당 OpenAPI 서비스가 없거나 폐기됨 | 엔드포인트/서비스명 변경 여부 확인 | 현재 해당 공공데이터 서비스를 사용할 수 없습니다. |
| 20 | SERVICE_ACCESS_DENIED_ERROR | 서비스 접근거부 | 서비스키 권한/활용신청 상태 점검 | 공공데이터 인증 설정 확인이 필요합니다. |
| 21 | TEMPORARILY_DISABLE_THE_SERVICEKEY_ERROR | 일시적으로 사용할 수 없는 서비스키 | 키 상태 확인, 다른 키 전환 가능성 검토 | 공공데이터 인증키가 일시적으로 사용할 수 없습니다. |
| 22 | LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR | 서비스 요청 제한 횟수 초과 | 쿼터 초과. 캐시/백오프/운영 알림 | 공공데이터 일일 요청 한도를 초과했습니다. |
| 30 | SERVICE_KEY_IS_NOT_REGISTERED_ERROR | 등록되지 않은 서비스키 | 환경변수/URL 인코딩/활용신청 확인 | 공공데이터 인증키 설정 확인이 필요합니다. |
| 31 | DEADLINE_HAS_EXPIRED_ERROR | 기한 만료된 서비스키 | 서비스키 재발급 또는 활용기간 연장 | 공공데이터 인증키가 만료되었습니다. |
| 99 | UNKNOWN_ERROR | 기타 에러 | 원문 응답 전문 저장 후 관리자 확인 | 공공데이터 조회 중 알 수 없는 오류가 발생했습니다. |

## 12. 데이터 저장/캐시 전략

| 데이터 | 추천 처리 | 이유 |
| --- | --- | --- |
| 원천 응답 전문 | 선택 저장 | 재현성·디버깅·감사 목적이 있을 때만 저장. 저장 시 요청 파라미터와 resultCode 포함. |
| 주요 응답 필드 | DB 저장 또는 긴 TTL 캐시 | 건축물/인허가/폐쇄말소 정보는 자주 변하지 않으므로 반복 조회 비용을 줄일 수 있음. |
| 주소별 조회 결과 | Redis 단기 캐시 | 사용자가 같은 매물을 반복 진단할 가능성이 높음. |
| 코드표 | DB 또는 enum 상수 | platGbCd, resultCode, 점검기관구분 등은 코드 해석에 반복 사용. |
| 에러 응답 | 로그 저장 | 운영 추적, 키 만료, 파라미터 오류, 제공기관 장애 구분. |
| 조회 결과 없음 | 짧은 TTL 캐시 | 없는 주소/조건 반복 호출 방지. 단, 데이터 갱신 가능성을 고려해 짧게 유지. |

## 13. 구현 시 주의사항

- URL 파라미터에 한글이 포함될 수 있으면 UTF-8 URL 인코딩한다.

- `serviceKey`는 인코딩된 키/디코딩된 키 처리 방식이 공공데이터포털에서 혼동되기 쉬우므로 실제 호출 테스트를 분리한다.

- `bun`, `ji`, `sigunguCd`, `bjdongCd`, PK류는 숫자가 아니라 문자열로 처리한다.

- `items.item`은 XML/JSON 변환 시 단건 객체 또는 배열로 달라질 수 있으므로 커스텀 deserializer 또는 리스트 정규화 로직을 둔다.

- 원문 표의 `필/옵`, `1/0`, `1..n/0..n` 표기가 문서별로 다르므로 내부 DTO에서는 `required`를 명시적으로 통일한다.

- 일부 문서의 서비스 개요는 REST (GET, POST, PUT, DELETE)로 표기되지만 상세 요청 예시는 GET이다. 구현은 GET 기준으로 시작하고 필요 시 원문/포털 확인.

- `_type=json`은 일부 예시에 등장하지만 요청 필드 표에 없는 경우가 많다. JSON 사용 전 실제 응답 구조를 테스트해야 한다.

- 공공데이터 장애, 타임아웃, 일일 트래픽 제한, 키 만료를 구분해 사용자 메시지와 운영 알림을 분리한다.


## 14. API 조합 가능성

| 조합 대상 API | 조합 목적 | 기대 결과 | 주의사항 |
| --- | --- | --- | --- |
| 주소 API/법정동코드 API | 도로명·지번 정규화 후 sigunguCd/bjdongCd/bun/ji 생성 | 정확한 건축HUB 조회 조건 확보 | 주소 후보가 여러 개면 사용자 선택 필요 |
| GIS건물통합정보 | 좌표/건물 존재 확인과 건축물대장 속성 대조 | 건물 단위 식별 정확도 향상 | 건물군/동/호 매칭 모호성 처리 필요 |
| 실거래가 API 묶음 | 유형별 매매/전월세 실거래 비교 | 전세가율·월세 적정성·매매 가격 위험도 산정 | 유형 판별 후 API 선택 필요 |
| 공동주택가격/개별주택가격/공시지가 API | 공시가격 기반 보증금·가격 리스크 참고 | 보증보험/가격 위험도 설명 보조 | 공시가격은 현재 시세가 아님 |
| 등기부등본 업로드/OCR | 소유자·근저당·신탁·압류 등 권리관계 확인 | 계약 전 핵심 위험 보강 | 공공데이터 API만으로 확정 불가 |
| 중개업소/사업자/인허가 데이터 | 계약 상대방·중개사·영업 가능성 보조 확인 | 체크리스트 고도화 | 개별 계약의 법적 판단으로 단정 금지 |


# 외부 API 명세 - 건축HUB 주택인허가정보 서비스

## 1. 원본 파일 분석

| 항목 | 내용 |
| --- | --- |
| 원본 파일명 | OpenAPI활용가이드-_건축HUB_주택인허가_1.0.pdf |
| 파일 형식 | PDF |
| 문서명 | OpenAPI 활용가이드 |
| 문서 버전 | 1.0 |
| 작성/개정일 | 2024.10.01 또는 2024.10 (원문 표기 차이 존재) |
| 제공기관 | 국토교통부 |
| 서비스명 국문 | 건축HUB 주택인허가정보 서비스 |
| 서비스명 영문 | HsPmsService |
| 서비스 설명 | 주택인허가 정보를 제공한다. |
| 데이터 갱신주기 | 확인 필요 |
| 원문 구조 | PDF / 페이지 수: 96 / 오퍼레이션 16개 |
| 비고 | 원문 표/샘플 URL/샘플 응답을 구현용 구조로 재배치. OCR·파싱상 줄바꿈으로 끊어진 필드명은 가능한 복원했으며 불확실한 항목은 원문 확인 필요. |

## 2. 원본 구조 요약

| 구분 | 원문 위치 | 내용 | 구현 관련성 |
| --- | --- | --- | --- |
| 서비스 개요 | 초반 서비스 명세 | 서비스명, 인증 방식, REST, XML/JSON 지원 여부, Base URL | 높음 |
| 서비스 Key 발급 및 활용 | 서비스 사용 장 | data.go.kr 활용신청 화면 및 serviceKey 사용 방식 | 보통 |
| 페이징 설명 | 서비스 사용 장 | numOfRows, pageNo, totalCount 기반 반복 호출 | 높음 |
| 오퍼레이션 목록 | 서비스 명세 장 | 16개 오퍼레이션 | 높음 |
| 오퍼레이션별 요청/응답 명세 | 각 오퍼레이션 명세 | 요청 파라미터, 응답 필드, 샘플 URL, XML 응답 예시 | 높음 |
| 에러 코드 | 문서 말미 또는 공공데이터 공통 | resultCode/resultMsg 및 에러코드 처리 | 높음 |

## 3. ZIP:ON 적용 판단

### 3.1 적용 가능 영역

| ZIP:ON 기능 영역 | 적용 가능 여부 | 활용 방식 | 중요도 |
| --- | --- | --- | --- |
| 주소 정제 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 법정동코드 변환 | 보조 | sigunguCd/bjdongCd/bun/ji로 주택인허가 조회 | 중요 |
| 물건 유형 판별 | 보조 | 주택인허가의 기본/동별/층별/호별/전유공용면적 정보로 공동주택성 보강 | 중요 |
| 건축물 기본정보 확인 | 가능 | 주택 인허가 대상의 대지위치, 용도, 총세대수, 층별·호별·부대시설 확인 | 중요 |
| 토지·임야 기본정보 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 실거래가 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 공시가격·공시지가 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 전세 위험도 계산 | 보조 | 총세대수·호별·동별 구조, 사용검사/허가일을 위험 설명에 사용 | 중요 |
| 월세 적정성 판단 | 보조 | 주택 유형 및 면적 확인 후 전월세 실거래가와 조합 | 중요 |
| 매매 위험도 계산 | 보조 | 주택 인허가·부대복리시설·지역지구 정보로 매매 체크리스트 보강 | 선택 |
| 용도지역·지구·구역 확인 | 가능 | 지역지구구역 조회 오퍼레이션 활용 | 중요 |
| 생활 인프라 분석 | 보조 | 부대시설/복리시설 정보를 생활 편의 보조자료로 활용 | 선택 |
| 상권 분석 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 환경·재난 리스크 분석 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 계약 상대방·중개사 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 체크리스트 생성 | 가능 | 주택 인허가/호별/전유공용/복리시설 확인 항목 생성 | 중요 |

### 3.2 적용 판단 요약

주택인허가 전용 API로 공동주택·주택 관련 허가, 동별, 층별, 호별, 부대시설, 전유공용면적, 지역지구구역 정보를 제공한다. ZIP:ON에서는 주거용 전세·월세 진단에서 건축물대장 결과를 보강하고, 공동주택 여부·세대수·호별 정보·사용검사일 등을 체크리스트로 연결하는 데 쓴다. 단독으로 전세 위험도를 산정하기보다는 실거래가, 공시가격, 등기부 업로드 분석과 조합해야 한다.

## 4. 서비스 기본 정보

| 항목 | 내용 |
| --- | --- |
| Base URL | http://apis.data.go.kr/1613000/HsPmsHubService |
| 운영환경 URL | http://apis.data.go.kr/1613000/HsPmsHubService |
| 개발환경 URL | http://apis.data.go.kr/1613000/HsPmsHubService |
| 프로토콜 | REST |
| HTTP Method | GET 샘플 기준. 일부 서비스 개요 표에는 REST (GET, POST, PUT, DELETE)로 표기된 문서가 있으나 상세 예시는 GET임. |
| 인증 방식 | serviceKey |
| 요청 데이터 형식 | query parameter |
| 응답 데이터 형식 | XML/JSON |
| 평균 응답시간 | 500 ms |
| TPS 제한 | 30 tps |
| 메시지 크기 제한 | bytes 값 원문 공란 - 확인 필요 |
| WADL/Swagger/OpenAPI 여부 | WADL N/A 또는 서비스 명세 URL 원문 표기. Swagger/OpenAPI 스키마 없음. |
| 비고 | 시군구코드와 법정동코드는 행정표준코드관리시스템의 법정동코드 기준. |

## 5. 인증 방식

### 5.1 인증 파라미터

| 파라미터 | 위치 | 필수 | 설명 |
| --- | --- | --- | --- |
| serviceKey | query | Y | 공공데이터포털에서 발급받은 인증키. URL Encode 필요. 실제 문서/코드에는 `{SERVICE_KEY}`로 치환. |

### 5.2 인증 예시

```http
GET http://apis.data.go.kr/1613000/HsPmsHubService/getHpBasisOulnInfo?serviceKey={SERVICE_KEY}
```

## 6. 공통 요청 규칙

| 파라미터 | 타입 | 필수 | 예시 | 설명 |
| --- | --- | --- | --- | --- |
| serviceKey | VARCHAR/String | Y | {SERVICE_KEY} | 인증키 |
| sigunguCd | VARCHAR(30) 또는 문서별 상이 | Y | 11680 | 시군구코드. 유지점검기관 조회 등 일부 오퍼레이션은 다른 필수 조건을 사용. |
| bjdongCd | VARCHAR(30) 또는 문서별 상이 | Y | 10300 | 법정동코드. 유지점검기관 조회 등 일부 오퍼레이션은 선택/미사용 가능. |
| platGbCd | VARCHAR(30) | N | 0 | 대지구분코드. 0: 대지, 1: 산, 2: 블록. |
| bun | VARCHAR(20) | N | 0012 | 본번. 앞자리 0 보존 필요. |
| ji | VARCHAR(20) | N | 0000 | 부번. 앞자리 0 보존 필요. |
| startDate | VARCHAR(30) | N | YYYYMMDD | 검색시작일. 지원 여부는 오퍼레이션별 원문 기준. |
| endDate | VARCHAR(30) | N | YYYYMMDD | 검색종료일. 지원 여부는 오퍼레이션별 원문 기준. |
| numOfRows | VARCHAR(3) 또는 숫자 | N | 10 | 페이지당 목록 수. 원문상 1회 최대 100건 제한. |
| pageNo | VARCHAR(3) 또는 숫자 | N | 1 | 페이지 번호. 1부터 시작. |
| _type | String | N | json | PDF 일부 예시에 등장. 요청 파라미터 표에는 없는 경우가 많으므로 서비스별 실제 지원 확인 필요. |

## 7. 페이징 규칙

원문 공통 설명 기준으로 1회 요청 가능한 목록 수(`numOfRows`)는 최대 100건이다. 전체 목록이 필요하면 최초 요청의 `totalCount`를 확인한 뒤 `pageNo`를 1부터 전체 페이지 수까지 반복 호출한다.

```text
totalPages = ceil(totalCount / numOfRows)
for pageNo in 1..totalPages:
    call API with same search condition and pageNo
```

구현 시 `totalCount == 0`, `items.item` 단건 객체/배열 차이, 공공데이터 장애 시 재시도 횟수를 반드시 처리한다.

## 8. 오퍼레이션 목록

| 번호 | 오퍼레이션명 | 국문명 | 설명 | ZIP:ON 활용 |
| --- | --- | --- | --- | --- |
| 1 | getHpBasisOulnInfo | 주택인허가 기본개요요 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 주택인허 가 대상의 대지위치, 철거멸실구분, 면적, 용도, 총세대수, 건축물수 등 의 기본정보를 제공한다. | 물건 식별, 건축물 기본정보, 유형 판별 |
| 2 | getHpDongOulnInfo | 주택인허가 동별개요 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 건물의 용도, 임대세대수, 분양세대수, 구조, 지붕, 건축면적, 연면적, 용적율, 지상/지하층수, 계단 등의 동별 정보를 제공한다. | 물건 식별, 건축물 기본정보, 유형 판별 |
| 3 | getHpFlrOulnInfo | 주택인허가 층별개요 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 건물의 층번호, 층구분, 층면적, 용도 등의 층 별 정보를 제공한다. | 물건 식별, 건축물 기본정보, 유형 판별 |
| 4 | getHpHoOulnInfo | 주택인허가 호별개요 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 건물의 층구분, 호번호, 구종, 용도, 면적 등 의 호별 정보를 제공한다. | 물건 식별, 건축물 기본정보, 유형 판별 |
| 5 | getHpSbsdFcInfo | 주택인허가 부대시설 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 부대시설의 부대시설종류, 설치현황, 변경전 부대시설의 종류 등의 정보를 제공한다. | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 6 | getHpWclfInfo | 주택인허가 오수정화시설 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 오수정화시설의 오수정화시설형식, 용량 등의 정보를 제공한다. | 설비/위생 관련 체크리스트 보조 |
| 7 | getHpPklotInfo | 주택인허가 주차장 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 주차장의 옥내외/자주기계식 주차대수, 인근주 차장의 주차대수 등의 주차장 정보를 제공한다. | 주차대수·주차장 확인, 생활/매매 리스크 보조 |
| 8 | getHpAtchPklotInfo | 주택인허가 부설주차장 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 부설주차장의 대지위치, 지목구분등에 대한 정 보를 제공한다. | 주차대수·주차장 확인, 생활/매매 리스크 보조 |
| 9 | getHpExposPubuseAreaInfo | 주택인허가 전유공용면적 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 건물의 전유/공용구분, 면적, 구조, 층번호, 용 도 등의 전유/공용 면적에 대한 정보를 제공한다. | 전유부/전유공용면적 확인, 다세대·오피스텔 판단 보조 |
| 10 | getHpHoExposPubuseAreaInfo | 주택인허가 행위호전유공용면적 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 행위대상 호의 전유공용구분, 층번호, 면적, 용 도 등에 관한 정보를 제공한다. | 호실 단위 정보 확인, 집합/전유부 판단 보조 |
| 11 | getHpActOulnInfo | 주택인허가 행위개요 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 행위(신고, 허가)에 따른 상세행위구분, 행위전 후용도, 행위전후면적, 행위전후 등에 관한 정보를 제공한다. | 물건 식별, 건축물 기본정보, 유형 판별 |
| 12 | getHpMgmCoopTpOulnInfo | 주택인허가 관리공동형별개요 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 주택인허 가와 관련하여 승강기, 복도, 수도, 난방 등 공동 설비에 대한 정보를 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 13 | getHpMgmCoopSbsdWlfarFcInfo | 주택인허가 관리공동부대복리시설 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 주택인허 가와 관련된 공동부대복리시설(주차장, 관리사무소, 노인정, 조경지, 주 민운동시설 등)의 면적, 층수, 시설개수 등에 관한 정보를 제공한다. | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 14 | getHpJijiguInfo | 주택인허가 지역지구구역 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 주택인허 가와 관련된 지역/지구/구역의 구분 및 명칭, 대표여부 등의 정보를 제 공한다. | 용도지역·지구·구역 확인 및 목적별 체크리스트 |
| 15 | getHpWlfarLotouFcInfo | 주택인허가 복리분양시설 조회 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 복리분양시설의 용도, 면적, 시설수, 변경전용 도, 변경전시설종류 등의 정보를 제공한다. | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 16 | getHpPlatPlcInfo | 주택인허가 대지위치 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 주택인허 가와 관련된 대지의 대지위치, 대지폭, 지목 등에 대한 대지정보를 제 공한다. | ZIP:ON 목적별 위험도 계산의 보조 입력값 |

## 9. 오퍼레이션 상세


---

## 9.1. 주택인허가 기본개요요 조회

### 9.1.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getHpBasisOulnInfo |
| Method | GET |
| Path | /getHpBasisOulnInfo |
| Full URL | http://apis.data.go.kr/1613000/HsPmsHubService/getHpBasisOulnInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 주택인허 가 대상의 대지위치, 철거멸실구분, 면적, 용도, 총세대수, 건축물수 등 의 기본정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 원문 위치 | page 16, 17, 18, 19 |

### 9.1.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0002 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.1.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/HsPmsHubService/getHpBasisOulnInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0002&serviceKey={SERVICE_KEY}
```

### 9.1.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 엘지개포자이 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.purpsCd | purpsCd | 용도코드 | VARCHAR(5) | N | 02000 | 용도코드 |  |
| response.body.items.item.purpsCdNm | purpsCdNm | 용도코드명 | VARCHAR(1000) | N | 공동주택 | 용도코드명 |  |
| response.body.items.item.strctCd | strctCd | 구조코드 | VARCHAR(2) | N | 구조코드 |  |  |
| response.body.items.item.strctCdNm | strctCdNm | 구조코드명 | VARCHAR(1000) | N | 구조코드명 |  |  |
| response.body.items.item.mainBldCnt | mainBldCnt | 주건축물수 | NUMBER(10) | N | 5 | 주건축물수 |  |
| response.body.items.item.totArea | totArea | 연면적 | NUMBER(30,9) | N | 60358.78 | 연면적 |  |
| response.body.items.item.totHhldCnt | totHhldCnt | 총세대수(세대 | NUMBER(10) | N | 212 | 총세대수 ( |  |
| response.body.items.item.demolExtngGbCd | demolExtngGbCd | 철거멸실구분 코드 | VARCHAR(30) | N | 철거멸실구 분코드 |  |  |
| response.body.items.item.demolExtngGbCdNm | demolExtngGbCdNm | 철거멸실구분 코드명 | VARCHAR(1000) | N | 철거멸실구 분코드명 |  |  |
| response.body.items.item.demolStrtDay | demolStrtDay | 철거시작일 | VARCHAR(8) | N | 철거시작일 |  |  |
| response.body.items.item.demolEndDay | demolEndDay | 철거종료일 | VARCHAR(8) | N | 철거종료일 |  |  |
| response.body.items.item.demolExtngDay | demolExtngDay | 철거멸실일 | VARCHAR(8) | N | 철거멸실일 |  |  |
| response.body.items.item.apprvDay | apprvDay | 건축허가일 | VARCHAR(8) | N | 20040616 | 건축허가일 |  |
| response.body.items.item.stcnsSchedDay | stcnsSchedDay | 착공예정일 | VARCHAR(8) | N | 착공예정일 |  |  |
| response.body.items.item.stcnsDay | stcnsDay | 착공일 | VARCHAR(8) | N | 착공일 |  |  |
| response.body.items.item.useInsptDay | useInsptDay | 사용검사예정 일 | VARCHAR(8) | N | 사용검사예 정일 |  |  |
| response.body.items.item.useInsptSchedDay | useInsptSchedDay | 사용검사일 | VARCHAR(8) | N | 사용검사일 |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12-2번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0002 | 지 |  |
| response.body.items.item.mgmHsrgstPk | mgmHsrgstPk | 관리주택대장PK | VARCHAR(30) | Y | 102491 | 관리주택대 장PK |  |

### 9.1.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>10</rnum>

<platPlc>서울특별시 강남구 개포동 12-2번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0002</ji>

<mgmHsrgstPk>102491</mgmHsrgstPk>

<bldNm>엘지개포자이</bldNm>

<splotNm> </splotNm>

<block> </block>

2024년 건축서비스산업 정보체계 유지관리 사업







<lot> </lot>

<purpsCd>02000</purpsCd>

<purpsCdNm>공동주택</purpsCdNm>

<strctCd> </strctCd>

<strctCdNm> </strctCdNm>

<mainBldCnt>5</mainBldCnt>

<totArea>60358.78</totArea>

<totHhldCnt>212</totHhldCnt>

<demolExtngGbCd> </demolExtngGbCd>

<demolExtngGbCdNm> </demolExtngGbCdNm>

<demolStrtDay> </demolStrtDay>

<demolEndDay> </demolEndDay>

<demolExtngDay> </demolExtngDay>

<apprvDay>20040616</apprvDay>

<stcnsSchedDay> </stcnsSchedDay>

<stcnsDay> </stcnsDay>

<useInsptSchedDay> </useInsptSchedDay>

<useInsptDay> </useInsptDay>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>2</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>18</totalCount>
  </body>
</response>
```


### 9.1.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getHpBasisOulnInfo |
| Request DTO 후보 | HpBasisOulnInfoRequest |
| Response DTO 후보 | HpBasisOulnInfoResponse |
| Item DTO 후보 | HpBasisOulnInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.1.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `물건 식별, 건축물 기본정보, 유형 판별`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.2. 주택인허가 동별개요 조회

### 9.2.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getHpDongOulnInfo |
| Method | GET |
| Path | /getHpDongOulnInfo |
| Full URL | http://apis.data.go.kr/1613000/HsPmsHubService/getHpDongOulnInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 건물의 용도, 임대세대수, 분양세대수, 구조, 지붕, 건축면적, 연면적, 용적율, 지상/지하층수, 계단 등의 동별 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 원문 위치 | page 21, 22, 23, 24 |

### 9.2.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0002 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.2.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/HsPmsHubService/getHpDongOulnInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0002&serviceKey={SERVICE_KEY}
```

### 9.2.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.mainPurpsCdNm | mainPurpsCdNm | 주용도코드명 | VARCHAR(1000) | N | 공동주택 | 주용도코드 명 |  |
| response.body.items.item.hhldCntPeplRent | hhldCntPeplRent | 세대수국민임 대(세대) | NUMBER(10) | N | 0 | 세대수국민 임대(세대) |  |
| response.body.items.item.hhldCntPubRent_5 | hhldCntPubRent_5 | 세대수공공임 대5(세대) | NUMBER(10) | N | 0 | 세대수공공 임대5(세대) |  |
| response.body.items.item.hhldCntPubRent_10 | hhldCntPubRent_10 | 세대수공공임 대10(세대) | NUMBER(10) | N | 0 | 세대수공공 임대10(세대 ) |  |
| response.body.items.item.hhldCntPubRentEtc | hhldCntPubRentEtc | 세대수공공임 대기타(세대) | NUMBER(10) | N | 0 | 세대수공공 임대기타(세 대) |  |
| response.body.items.item.hhldCntPubRentTot | hhldCntPubRentTot | 세대수공공임 대계(세대) | NUMBER(10) | N | 0 | 세대수공공 임대계(세대 ) |  |
| response.body.items.item.hhldCntPubLotou | hhldCntPubLotou | 세대수공공분 양(세대) | NUMBER(10) | N | 0 | 세대수공공 분양(세대) |  |
| response.body.items.item.hhldCntEmplRent | hhldCntEmplRent | 세대수사원임 대(세대) | NUMBER(10) | N | 0 | 세대수사원 임대(세대) |  |
| response.body.items.item.hhldCntLaborWlfar | hhldCntLaborWlfar | 세대수근로복 지(세대) | NUMBER(10) | N | 0 | 세대수근로 복지(세대) |  |
| response.body.items.item.hhldCntCvlRent | hhldCntCvlRent | 세대수민간임 대(세대) | NUMBER(10) | N | 0 | 세대수민간 임대(세대) |  |
| response.body.items.item.hhldCntCvlLotou | hhldCntCvlLotou | 세대수민간분 양(세대) | NUMBER(10) | N | 63 | 세대수민간 분양(세대) |  |
| response.body.items.item.strctCd | strctCd | 구조코드 | VARCHAR(2) | N | 21 | 구조코드 |  |
| response.body.items.item.strctCdNm | strctCdNm | 구조코드명 | VARCHAR(1000) | N | 철근콘크리트구조 | 구조코드명 |  |
| response.body.items.item.roofCd | roofCd | 지붕코드 | VARCHAR(30) | N | 10 | 지붕코드 |  |
| response.body.items.item.roofCdNm | roofCdNm | 지붕코드명 | VARCHAR(1000) | N | (철근)콘크리트 | 지붕코드명 |  |
| response.body.items.item.archArea | archArea | 건축면적(㎡) | NUMBER(30,9) | N | 646.48 | 건축면적(㎡ ) |  |
| response.body.items.item.totArea | totArea | 연면적(㎡) | NUMBER(30,9) | N | 12382.47 | 연면적(㎡) |  |
| response.body.items.item.ugrndArea | ugrndArea | 지하면적(㎡) | NUMBER(30,9) | N | 123.18 | 지하면적(㎡ ) |  |
| response.body.items.item.vlRatEstmTotArea | vlRatEstmTotArea | 용적률산정연 면적(㎡) | NUMBER(30,9) | N | 12259.29 | 용적률산정 연면적(㎡) |  |
| response.body.items.item.ugrndFlrCnt | ugrndFlrCnt | 지하층수 | NUMBER(3) | N | 22 | 지하층수 |  |
| response.body.items.item.grndFlrCnt | grndFlrCnt | 지상층수 | NUMBER(3) | N | 2 | 지상층수 |  |
| response.body.items.item.heit | heit | 높이(m) | NUMBER(22,9) | N | 66.71 | 높이(m) |  |
| response.body.items.item.rideUseElvtCnt | rideUseElvtCnt | 승용승강기수 | NUMBER(10) | N | 1 | 승용승강기 수 |  |
| response.body.items.item.emgenUseElvtCnt | emgenUseElvtCnt | 비상용승강기 수 | NUMBER(10) | N | 1 | 비상용승강 기수 |  |
| response.body.items.item.flrhFrom | flrhFrom | 층고FROM | VARCHAR(100) | N | 2.76 | 층고FROM |  |
| response.body.items.item.ceilHeit | ceilHeit | 반자높이(m) | VARCHAR(100) | N | 2.4 | 반자높이(m ) |  |
| response.body.items.item.stairValidWidth | stairValidWidth | 계단유효폭 | NUMBER(22,9) | N | 1.2 | 계단유효폭 |  |
| response.body.items.item.hwayWidth | hwayWidth | 복도너비 | NUMBER(22,9) | N | 2.7 | 복도너비 |  |
| response.body.items.item.ouwlThick | ouwlThick | 외벽두께 | NUMBER(22,9) | N | 26 | 외벽두께 |  |
| response.body.items.item.adjHhldWa | adjHhldWa | 인접세대벽두 | NUMBER(22,9) | N | 18 | 인접세대벽 |  |
| response.body.items.item.llThick | llThick | 께 | 두께 | 확인 필요 |  |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12-2번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0002 | 지 |  |
| response.body.items.item.mgmDongOulnPk | mgmDongOulnPk | 관리동별개요PK | VARCHAR(30) | Y | 1024242 | 관리동별개 요PK |  |
| response.body.items.item.mgmHsrgstPk | mgmHsrgstPk | 관리주택대장PK | VARCHAR(30) | Y | 102491 | 관리주택대 장PK |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 엘지개포자이 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.mainAtchGbCd | mainAtchGbCd | 주부속구분코 드 | VARCHAR(30) | N | 0 | 주부속구분 코드 |  |
| response.body.items.item.mainAtchGbCdNm | mainAtchGbCdNm | 주부속구분코 드명 | VARCHAR(1000) | N | 주건축물 | 주부속구분 코드명 |  |
| response.body.items.item.dongNm | dongNm | 동명칭 | VARCHAR(1000) | N | 101동 | 동명칭 |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드 | VARCHAR(5) | N | 02000 | 주용도코드 |  |

### 9.2.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<platPlc>서울특별시 강남구 개포동 12-2번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0002</ji>

<mgmDongOulnPk>1024242</mgmDongOulnPk>

<mgmHsrgstPk>102491</mgmHsrgstPk>

<bldNm>엘지개포자이</bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<mainAtchGbCd>0</mainAtchGbCd>

<mainAtchGbCdNm>주건축물</mainAtchGbCdNm>

<dongNm>101동</dongNm>

<mainPurpsCd>02000</mainPurpsCd>

2024년 건축서비스산업 정보체계 유지관리 사업







<mainPurpsCdNm>공동주택</mainPurpsCdNm>

<hhldCntPeplRent>0</hhldCntPeplRent>

<hhldCntPubRent_5>0</hhldCntPubRent_5>

<hhldCntPubRent_10>0</hhldCntPubRent_10>

<hhldCntPubRentEtc>0</hhldCntPubRentEtc>

<hhldCntPubRentTot>0</hhldCntPubRentTot>

<hhldCntPubLotou>0</hhldCntPubLotou>

<hhldCntEmplRent>0</hhldCntEmplRent>

<hhldCntLaborWlfar>0</hhldCntLaborWlfar>

<hhldCntCvlRent>0</hhldCntCvlRent>

<hhldCntCvlLotou>63</hhldCntCvlLotou>

<strctCd>21</strctCd>hhldCntPubLotou

<strctCdNm>철근콘크리트구조</strctCdNm>

<roofCd>10</roofCd>

<roofCdNm>(철근)콘크리트</roofCdNm>

<archArea>646.48</archArea>

<totArea>12382.47</totArea>

<ugrndArea>123.18</ugrndArea>

<vlRatEstmTotArea>12259.29</vlRatEstmTotArea>

<ugrndFlrCnt>22</ugrndFlrCnt>

<grndFlrCnt>2</grndFlrCnt>

<heit>66.71</heit>

<rideUseElvtCnt>1</rideUseElvtCnt>

<emgenUseElvtCnt>1</emgenUseElvtCnt>

<flrhFrom>2.76</flrhFrom>

<ceilHeit>2.4</ceilHeit>

<stairValidWidth>1.2</stairValidWidth>

<hwayWidth>2.7</hwayWidth>

<ouwlThick>26</ouwlThick>

<adjHhldWallThick>18</adjHhldWallThick>

<crtnDay>20220813</crtnDay>

<rnum>1</rnum>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>16</totalCount>

2024년 건축서비스산업 정보체계 유지관리 사업






  </body>
</response>
```


### 9.2.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getHpDongOulnInfo |
| Request DTO 후보 | HpDongOulnInfoRequest |
| Response DTO 후보 | HpDongOulnInfoResponse |
| Item DTO 후보 | HpDongOulnInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.2.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `물건 식별, 건축물 기본정보, 유형 판별`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.3. 주택인허가 층별개요 조회

### 9.3.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getHpFlrOulnInfo |
| Method | GET |
| Path | /getHpFlrOulnInfo |
| Full URL | http://apis.data.go.kr/1613000/HsPmsHubService/getHpFlrOulnInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 건물의 층번호, 층구분, 층면적, 용도 등의 층 별 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 원문 위치 | page 27, 28, 29 |

### 9.3.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0002 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.3.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/HsPmsHubService/getHpFlrOulnInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0002&serviceKey={SERVICE_KEY}
```

### 9.3.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.mgmFlrOulnPk | mgmFlrOulnPk | 관리층별개요PK | VARCHAR((30) | Y | 10242156 | 관리층별개 요PK |  |
| response.body.items.item.mgmDongOulnPk | mgmDongOulnPk | 관리동별개요PK | VARCHAR((30) | Y | 1024242 | 관리동별개 요PK |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 엘지개포자이 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.dongNm | dongNm | 동명칭 | VARCHAR(1000) | N | 101동 | 동명칭 |  |
| response.body.items.item.flrNo | flrNo | 층번호 | NUMBER(5) | N | -2 | 층번호 |  |
| response.body.items.item.flrGbCd | flrGbCd | 층구분코드 | VARCHAR(30) | N | 10 | 층구분코드 |  |
| response.body.items.item.flrGbCdNm | flrGbCdNm | 층구분코드명 | VARCHAR(1000) | N | 지하 | 층구분코드 명 |  |
| response.body.items.item.flrArea | flrArea | 층면적(㎡) | NUMBER(30,9) | N | 61.68 | 층면적(㎡) |  |
| response.body.items.item.purpsCd | purpsCd | 용도코드 | VARCHAR(5) | N | 02001 | 용도코드 |  |
| response.body.items.item.purpsCdNm | purpsCdNm | 용도코드명 | VARCHAR(1000) | N | 아파트 | 용도코드명 |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | Y | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12-2번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0002 | 지 |  |

### 9.3.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
     <item>

<platPlc>서울특별시 강남구 개포동 12-2번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0002</ji>

<mgmFlrOulnPk>10242156</mgmFlrOulnPk>

<mgmDongOulnPk>1024242</mgmDongOulnPk>

<bldNm>엘지개포자이</bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<dongNm>101동</dongNm>

<flrNo>-2</flrNo>

<flrGbCd>10</flrGbCd>

<flrGbCdNm>지하</flrGbCdNm>

<flrArea>61.68</flrArea>

<purpsCd>02001</purpsCd>

<purpsCdNm>아파트</purpsCdNm>

<crtnDay>20220813</crtnDay>

2024년 건축서비스산업 정보체계 유지관리 사업






     </item>
     <item>

<rnum>2</rnum>

<platPlc>서울특별시 강남구 개포동 12-2번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0002</ji>

<mgmFlrOulnPk>10242157</mgmFlrOulnPk>

<mgmDongOulnPk>1024242</mgmDongOulnPk>

<bldNm>엘지개포자이</bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<dongNm>101동</dongNm>

<flrNo>-1</flrNo>

<flrGbCd>10</flrGbCd>

<flrGbCdNm>지하</flrGbCdNm>

<flrArea>61.5</flrArea>

<purpsCd>02001</purpsCd>

<purpsCdNm>아파트</purpsCdNm>

<crtnDay>20220813</crtnDay>
     </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>252</totalCount>
  </body>
</response>
```


### 9.3.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getHpFlrOulnInfo |
| Request DTO 후보 | HpFlrOulnInfoRequest |
| Response DTO 후보 | HpFlrOulnInfoResponse |
| Item DTO 후보 | HpFlrOulnInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.3.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `물건 식별, 건축물 기본정보, 유형 판별`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.4. 주택인허가 호별개요 조회

### 9.4.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getHpHoOulnInfo |
| Method | GET |
| Path | /getHpHoOulnInfo |
| Full URL | http://apis.data.go.kr/1613000/HsPmsHubService/getHpHoOulnInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 건물의 층구분, 호번호, 구종, 용도, 면적 등 의 호별 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 원문 위치 | page 32, 33, 34 |

### 9.4.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0002 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.4.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/HsPmsHubService/getHpHoOulnInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0002&serviceKey={SERVICE_KEY}
```

### 9.4.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | VARCHAR(1000) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(30) | Y | 서울특별시 강남구 개포동 12-2번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(20) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(30) | N | 0002 | 지 |  |
| response.body.items.item.mgmHoDetlPk | mgmHoDetlPk | 관리호별명세PK | VARCHAR(30) | Y | 10243875 | 관리호별명 세PK |  |
| response.body.items.item.mgmDongOulnPk | mgmDongOulnPk | 관리동별개요PK | VARCHAR(200) | Y | 1024244 | 관리동별개 요PK |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(100 ) | N | 엘지개포자이 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.dongNm | dongNm | 동명칭 | VARCHAR(1000) | N | 103동 | 동명칭 |  |
| response.body.items.item.flrNo | flrNo | 층번호 | NUMBER(5) | N | 5 | 층번호 |  |
| response.body.items.item.flrGbCd | flrGbCd | 층구분코드 | VARCHAR(30) | N | 20 | 층구분코드 |  |
| response.body.items.item.flrGbCdNm | flrGbCdNm | 층구분코드명 | VARCHAR(1000) | N | 지상 | 층구분코드 명 |  |
| response.body.items.item.hoNo | hoNo | 호번호 | VARCHAR(500) | N | 9 | 호번호 |  |
| response.body.items.item.hoNm | hoNm | 호명칭 | VARCHAR(1000) | N | 502 | 호명칭 |  |
| response.body.items.item.pngtypGbNm | pngtypGbNm | 평형구분명 | VARCHAR(1000) | N | 48p | 평형구분명 |  |
| response.body.items.item.changGbCd | changGbCd | 변경구분코드 | VARCHAR(30) | N | 변경구분코 드 |  |  |
| response.body.items.item.changGbCdNm | changGbCdNm | 변경구분코드 명 | VARCHAR(1000) | N | 변경구분코 드명 |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |

### 9.4.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
     <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12-2번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0002</ji>

<mgmHoDetlPk>10243875</mgmHoDetlPk>

<mgmDongOulnPk>1024244</mgmDongOulnPk>

<bldNm>엘지개포자이</bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<dongNm>103동</dongNm>

<flrNo>5</flrNo>

<flrGbCd>20</flrGbCd>

<flrGbCdNm>지상</flrGbCdNm>

<hoNo>9</hoNo>

<hoNm>502</hoNm>

<pngtypGbNm>48p</pngtypGbNm>

<changGbCd> </changGbCd>

<changGbCdNm> </changGbCdNm>

<crtnDay>20220813</crtnDay>
     </item>
     <item>

<rnum>2</rnum>

<platPlc>서울특별시 강남구 개포동 12-2번지</platPlc>

<sigunguCd>11680</sigunguCd>

2024년 건축서비스산업 정보체계 유지관리 사업







<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0002</ji>

<mgmHoDetlPk>10243876</mgmHoDetlPk>

<mgmDongOulnPk>1024244</mgmDongOulnPk>

<bldNm>엘지개포자이</bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<dongNm>103동</dongNm>

<flrNo>6</flrNo>

<flrGbCd>20</flrGbCd>

<flrGbCdNm>지상</flrGbCdNm>

<hoNo>10</hoNo>

<hoNm>601</hoNm>

<pngtypGbNm>48p</pngtypGbNm>

<changGbCd> </changGbCd>

<changGbCdNm> </changGbCdNm>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>216</totalCount>
  </body>
</response>
```


### 9.4.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getHpHoOulnInfo |
| Request DTO 후보 | HpHoOulnInfoRequest |
| Response DTO 후보 | HpHoOulnInfoResponse |
| Item DTO 후보 | HpHoOulnInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.4.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `물건 식별, 건축물 기본정보, 유형 판별`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.5. 주택인허가 부대시설 조회

### 9.5.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getHpSbsdFcInfo |
| Method | GET |
| Path | /getHpSbsdFcInfo |
| Full URL | http://apis.data.go.kr/1613000/HsPmsHubService/getHpSbsdFcInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 부대시설의 부대시설종류, 설치현황, 변경전 부대시설의 종류 등의 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 원문 위치 | page 37, 38, 39 |

### 9.5.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(30) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0002 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(20) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(20) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.5.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/HsPmsHubService/getHpSbsdFcInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0002&serviceKey={SERVICE_KEY}
```

### 9.5.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12-2번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0002 | 지 |  |
| response.body.items.item.mgmHsrgstPk | mgmHsrgstPk | 관리주택대장 PK | VARCHAR(30) | Y | 102487 | 관리주택대 장PK |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 엘지개포자이 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.sbsdfcKindCd | sbsdfcKindCd | 부대시설종류 코드 | VARCHAR(30) | N | 11 | 부대시설종 류코드 |  |
| response.body.items.item.sbsdfcKindCdNm | sbsdfcKindCdNm | 부대시설종류 코드명 | VARCHAR(1000) | N | 전기 | 부대시설종 류코드명 |  |
| response.body.items.item.etcFcKind | etcFcKind | 기타시설종류 | VARCHAR(4000) | N | 기타시설종 류 |  |  |
| response.body.items.item.instalCurst | instalCurst | 설치현황 | VARCHAR(4000) | N | 전용 60M2이하 3Kw , 60M2초과시 10M2 당 0.3Kw가산 | 설치현황 |  |
| response.body.items.item.cmplxinCurst | cmplxinCurst | 단지내현황 | VARCHAR(4000) | N | 48평형:8Kw, 55평형: 8Kw, 61A평형:9Kw, 61B평형:9Kw | 단지내현황 |  |
| response.body.items.item.cmplxbyndCurst | cmplxbyndCurst | 단지외현황 | VARCHAR(4000) | N | 단지외현황 |  |  |
| response.body.items.item.changbefInstalCurst | changbefInstalCurst | 변경전설치현 황 | VARCHAR(4000) | N | 변경전설치 현황 |  |  |
| response.body.items.item.changbefCmplxinCurst | changbefCmplxinCurst | 변경전단지내 현황 | VARCHAR(4000) | N | 변경전단지 내현황 |  |  |
| response.body.items.item.changbefCmplxbyndCurst | changbefCmplxbyndCurst | 변경전단지외 현황 | VARCHAR(4000) | N | 변경전단지 외현황 |  |  |
| response.body.items.item.befSbsdKindCd | befSbsdKindCd | 전부대종류코 드 | VARCHAR(30) | N | 전부대종류 코드 |  |  |
| response.body.items.item.befSbsdKindCdNm | befSbsdKindCdNm | 전부대종류코 드명 | VARCHAR(1000) | N | 전부대종류 코드명 |  |  |
| response.body.items.item.befEtcFcKind | befEtcFcKind | 전기타시설종 류 | VARCHAR(4000) | N | 전기타시설 종류 |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |

### 9.5.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12-2번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0002</ji>

<mgmHsrgstPk>102487</mgmHsrgstPk>

<bldNm>엘지개포자이</bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<sbsdfcKindCd>11</sbsdfcKindCd>

<sbsdfcKindCdNm>전기</sbsdfcKindCdNm>

<etcFcKind> </etcFcKind>

<instalCurst>전용 60M2이하 3Kw, 60M2초과시 10M2당 0.3Kw가산</instalCurst>

<cmplxinCurst>48평형:8Kw, 55평형:8Kw, 61A평형:9Kw, 61B평형:9Kw</cmplxinCurs
t>

<cmplxbyndCurst> </cmplxbyndCurst>

<changbefInstalCurst> </changbefInstalCurst>

<changbefCmplxinCurst> </changbefCmplxinCurst>

<changbefCmplxbyndCurst> </changbefCmplxbyndCurst>

<befSbsdKindCd> </befSbsdKindCd>

<befSbsdKindCdNm> </befSbsdKindCdNm>

<befEtcFcKind> </befEtcFcKind>

<crtnDay>20220813</crtnDay>

2024년 건축서비스산업 정보체계 유지관리 사업






      </item>
      <item>

<rnum>2</rnum>

<platPlc>서울특별시 강남구 개포동 12-2번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0002</ji>

<mgmHsrgstPk>102487</mgmHsrgstPk>

<bldNm>엘지개포자이</bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<sbsdfcKindCd>14</sbsdfcKindCd>

<sbsdfcKindCdNm>통신설비</sbsdfcKindCdNm>

<etcFcKind> </etcFcKind>

<instalCurst>공중전화</instalCurst>

<cmplxinCurst>2대</cmplxinCurst>

<cmplxbyndCurst> </cmplxbyndCurst>

<changbefInstalCurst> </changbefInstalCurst>

<changbefCmplxinCurst> </changbefCmplxinCurst>

<changbefCmplxbyndCurst> </changbefCmplxbyndCurst>

<befSbsdKindCd> </befSbsdKindCd>

<befSbsdKindCdNm> </befSbsdKindCdNm>

<befEtcFcKind> </befEtcFcKind>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>16</totalCount>
  </body>
</response>
```


### 9.5.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getHpSbsdFcInfo |
| Request DTO 후보 | HpSbsdFcInfoRequest |
| Response DTO 후보 | HpSbsdFcInfoResponse |
| Item DTO 후보 | HpSbsdFcInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.5.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `ZIP:ON 목적별 위험도 계산의 보조 입력값`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.6. 주택인허가 오수정화시설 조회

### 9.6.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getHpWclfInfo |
| Method | GET |
| Path | /getHpWclfInfo |
| Full URL | http://apis.data.go.kr/1613000/HsPmsHubService/getHpWclfInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 오수정화시설의 오수정화시설형식, 용량 등의 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 설비/위생 관련 체크리스트 보조 |
| 원문 위치 | page 42, 43, 44 |

### 9.6.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0002 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.6.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/HsPmsHubService/getHpWclfInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0002&serviceKey={SERVICE_KEY}
```

### 9.6.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.wclfModeCd | wclfModeCd | 오수정화시설 형식코드 | VARCHAR(30) | N | 300 | 오수정화시설 형식코드 |  |
| response.body.items.item.wclfModeCdNm | wclfModeCdNm | 오수정화시설 형식코드명 | VARCHAR(1000) | N | 하수종말처리장연 결 | 오수정화시설 형식코드명 |  |
| response.body.items.item.etcWclf | etcWclf | 기타오수정화시설 | VARCHAR(4000) | N | 기타오수정화 시설 |  |  |
| response.body.items.item.capaPsper | capaPsper | 용량(인용) | NUMBER(22,9) | N | 0 | 용량(인용) |  |
| response.body.items.item.capaLube | capaLube | 용량(루베) | NUMBER(22,9) | N | 0 | 용량(루베) |  |
| response.body.items.item.dongRelGb | dongRelGb | 동별관계구분 | VARCHAR(30) | N | 동별관계구분 |  |  |
| response.body.items.item.dongRelGbNm | dongRelGbNm | 동별관계구분 명 | VARCHAR(1000) | N | 동별관계구분 명 |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남 구 개포동 12-2번 지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0002 | 지 |  |
| response.body.items.item.mgmHsrgstPk | mgmHsrgstPk | 관리주택대장PK | VARCHAR(30) | Y | 102487 | 관리주택대장 PK |  |
| response.body.items.item.hjdongCd | hjdongCd | 행정동코드 | VARCHAR(30) | N | 66000 | 행정동코드 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.reprYn | reprYn | 대표여부 | VARCHAR(1) | N | 1 | 0: 일반 1: 대표 |  |

### 9.6.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
     <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12-2번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0002</ji>

<mgmHsrgstPk>102487</mgmHsrgstPk>

<hjdongCd>66000</hjdongCd>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<reprYn>1</reprYn>

<wclfModeCd>300</wclfModeCd>

<wclfModeCdNm>하수종말처리장연결</wclfModeCdNm>

<etcWclf> </etcWclf>

<capaPsper>0</capaPsper>

<capaLube>0</capaLube>

<dongRelGb> </dongRelGb>

<dongRelGbNm> </dongRelGbNm>

<crtnDay>20220813</crtnDay>
     </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>7</totalCount>
  </body>
</response>
```


### 9.6.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getHpWclfInfo |
| Request DTO 후보 | HpWclfInfoRequest |
| Response DTO 후보 | HpWclfInfoResponse |
| Item DTO 후보 | HpWclfInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.6.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `설비/위생 관련 체크리스트 보조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.7. 주택인허가 주차장 조회

### 9.7.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getHpPklotInfo |
| Method | GET |
| Path | /getHpPklotInfo |
| Full URL | http://apis.data.go.kr/1613000/HsPmsHubService/getHpPklotInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 주차장의 옥내외/자주기계식 주차대수, 인근주 차장의 주차대수 등의 주차장 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 주차대수·주차장 확인, 생활/매매 리스크 보조 |
| 원문 위치 | page 46, 47, 48 |

### 9.7.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0002 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.7.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/HsPmsHubService/getHpPklotInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0002&serviceKey={SERVICE_KEY}
```

### 9.7.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남 구 개포동 12-2번 지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0002 | 지 |  |
| response.body.items.item.mgmHsrgstPk | mgmHsrgstPk | 관리주택대장PK | VARCHAR(30) | Y | 102487 | 관리주택대장 PK |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.indrAutoUtcnt | indrAutoUtcnt | 옥내자주식대 수(대) | NUMBER(10) | N | 483 | 옥내자주식대 수(대) |  |
| response.body.items.item.indrAutoArea | indrAutoArea | 옥내자주식면 적(㎡) | NUMBER(30,9) | N | 20945.12 | 옥내자주식면 적(㎡) |  |
| response.body.items.item.oudrAutoUtcnt | oudrAutoUtcnt | 옥외자주식대 수(대) | NUMBER(10) | N | 19 | 옥외자주식대 수(대) |  |
| response.body.items.item.oudrAutoArea | oudrAutoArea | 옥외자주식면 적(㎡) | NUMBER(30,9) | N | 278.5 | 옥외자주식면 적(㎡) |  |
| response.body.items.item.indrMechUtcnt | indrMechUtcnt | 옥내기계식대 수(대) | NUMBER(10) | N | 0 | 옥내기계식대 수(대) |  |
| response.body.items.item.indrMechArea | indrMechArea | 옥내기계식면 적(㎡) | NUMBER(30,9) | N | 0 | 옥내기계식면 적(㎡) |  |
| response.body.items.item.oudrMechUtcnt | oudrMechUtcnt | 옥외기계식대 수(대) | NUMBER(10) | N | 0 | 옥외기계식대 수(대) |  |
| response.body.items.item.oudrMechArea | oudrMechArea | 옥외기계식면 적(㎡) | NUMBER(30,9) | N | 0 | 옥외기계식면 적(㎡) |  |
| response.body.items.item.neigAutoUtcnt | neigAutoUtcnt | 인근자주식대 수(대) | NUMBER(10) | N | 0 | 인근자주식대 수(대) |  |
| response.body.items.item.neigAutoArea | neigAutoArea | 인근자주식면 적(㎡) | NUMBER(30,9) | N | 0 | 인근자주식면 적(㎡) |  |
| response.body.items.item.neigMechUtcnt | neigMechUtcnt | 인근기계식대 수(대) | NUMBER(10) | N | 0 | 인근기계식대 수(대) |  |
| response.body.items.item.neigMechArea | neigMechArea | 인근기계식면 적(㎡) | NUMBER(30,9) | N | 0 | 인근기계식면 적(㎡) |  |
| response.body.items.item.exmptUtcnt | exmptUtcnt | 면제대수(대) | NUMBER(10) | N | 0 | 면제대수(대) |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |

### 9.7.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
     <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12-2번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0002</ji>

<mgmHsrgstPk>102487</mgmHsrgstPk>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<indrAutoUtcnt>483</indrAutoUtcnt>

<indrAutoArea>20945.12</indrAutoArea>

<oudrAutoUtcnt>19</oudrAutoUtcnt>

<oudrAutoArea>278.5</oudrAutoArea>

<indrMechUtcnt>0</indrMechUtcnt>

<indrMechArea>0</indrMechArea>

<oudrMechUtcnt>0</oudrMechUtcnt>

<oudrMechArea>0</oudrMechArea>

<neigAutoUtcnt>0</neigAutoUtcnt>

2024년 건축서비스산업 정보체계 유지관리 사업







<neigAutoArea>0</neigAutoArea>

<neigMechUtcnt>0</neigMechUtcnt>

<neigMechArea>0</neigMechArea>

<exmptUtcnt>0</exmptUtcnt>

<crtnDay>20220813</crtnDay>
     </item>
     <item>

<rnum>2</rnum>

<platPlc>서울특별시 강남구 개포동 12-2번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0002</ji>

<mgmHsrgstPk>102491</mgmHsrgstPk>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<indrAutoUtcnt>483</indrAutoUtcnt>

<indrAutoArea>20945.12</indrAutoArea>

<oudrAutoUtcnt>19</oudrAutoUtcnt>

<oudrAutoArea>278.5</oudrAutoArea>

<indrMechUtcnt>0</indrMechUtcnt>

<indrMechArea>0</indrMechArea>

<oudrMechUtcnt>0</oudrMechUtcnt>

<oudrMechArea>0</oudrMechArea>

<neigAutoUtcnt>0</neigAutoUtcnt>

<neigAutoArea>0</neigAutoArea>

<neigMechUtcnt>0</neigMechUtcnt>

<neigMechArea>0</neigMechArea>

<exmptUtcnt>0</exmptUtcnt>

<crtnDay>20220813</crtnDay>
     </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>

2024년 건축서비스산업 정보체계 유지관리 사업






    <totalCount>2</totalCount>
  </body>
</response>
```


### 9.7.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getHpPklotInfo |
| Request DTO 후보 | HpPklotInfoRequest |
| Response DTO 후보 | HpPklotInfoResponse |
| Item DTO 후보 | HpPklotInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.7.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `주차대수·주차장 확인, 생활/매매 리스크 보조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.8. 주택인허가 부설주차장 조회

### 9.8.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getHpAtchPklotInfo |
| Method | GET |
| Path | /getHpAtchPklotInfo |
| Full URL | http://apis.data.go.kr/1613000/HsPmsHubService/getHpAtchPklotInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 부설주차장의 대지위치, 지목구분등에 대한 정 보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 주차대수·주차장 확인, 생활/매매 리스크 보조 |
| 원문 위치 | page 51, 52, 53 |

### 9.8.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11500 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10400 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 1494 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0003 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.8.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/HsPmsHubService/getHpAtchPklotInfo?sigunguCd=11500&bjdongCd=10400&bun=1494&ji=0003&serviceKey={SERVICE_KEY}
```

### 9.8.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 1494 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0003 | 지 |  |
| response.body.items.item.mgmHsrgstPk | mgmHsrgstPk | 관리주택대장PK | VARCHAR(30) | Y | 1017100005805 | 관리주택대장 PK |  |
| response.body.items.item.hjdongCd | hjdongCd | 행정동코드 | VARCHAR(30) | N | 60500 | 행정동코드 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.jimokCd | jimokCd | 지목코드 | VARCHAR(30) | N | 11 | 지목코드 |  |
| response.body.items.item.jimokCdNm | jimokCdNm | 지목코드명 | VARCHAR(1000) | N | 주차장 | 지목코드명 |  |
| response.body.items.item.relJibunNm | relJibunNm | 관련지번명 | VARCHAR(1000) | N | 관련지번명 |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(8) | N | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강서 구 가양동 1494-3 번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11500 | 행정표준코드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10400 | 행정표준코드 |  |

### 9.8.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
     <item>

<rnum>1</rnum>

<platPlc>서울특별시 강서구 가양동 1494-3번지</platPlc>

<sigunguCd>11500</sigunguCd>

<bjdongCd>10400</bjdongCd>

<platGbCd>0</platGbCd>

<bun>1494</bun>

<ji>0003</ji>

<mgmHsrgstPk>1017100005805</mgmHsrgstPk>

<hjdongCd>60500</hjdongCd>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<jimokCd>11</jimokCd>

<jimokCdNm>주차장</jimokCdNm>

<relJibunNm> </relJibunNm>

<crtnDay>20220813</crtnDay>
     </item>
     <item>

<rnum>2</rnum>

<platPlc>서울특별시 강서구 가양동 1494-3번지</platPlc>

<sigunguCd>11500</sigunguCd>

<bjdongCd>10400</bjdongCd>

<platGbCd>0</platGbCd>

<bun>1494</bun>

<ji>0003</ji>

<mgmHsrgstPk>1001100005265</mgmHsrgstPk>

<hjdongCd>60500</hjdongCd>

<splotNm> </splotNm>

2024년 건축서비스산업 정보체계 유지관리 사업







<block> </block>

<lot> </lot>

<jimokCd>11</jimokCd>

<jimokCdNm>주차장</jimokCdNm>

<relJibunNm> </relJibunNm>

<crtnDay>20220813</crtnDay>
     </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>2</totalCount>
  </body>
</response>
```


### 9.8.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getHpAtchPklotInfo |
| Request DTO 후보 | HpAtchPklotInfoRequest |
| Response DTO 후보 | HpAtchPklotInfoResponse |
| Item DTO 후보 | HpAtchPklotInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.8.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `주차대수·주차장 확인, 생활/매매 리스크 보조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.9. 주택인허가 전유공용면적 조회

### 9.9.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getHpExposPubuseAreaInfo |
| Method | GET |
| Path | /getHpExposPubuseAreaInfo |
| Full URL | http://apis.data.go.kr/1613000/HsPmsHubService/getHpExposPubuseAreaInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 건물의 전유/공용구분, 면적, 구조, 층번호, 용 도 등의 전유/공용 면적에 대한 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 전유부/전유공용면적 확인, 다세대·오피스텔 판단 보조 |
| 원문 위치 | page 56, 57, 58 |

### 9.9.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10800 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0221 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0007 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.9.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/HsPmsHubService/getHpExposPubuseAreaInfo?sigunguCd=11680&bjdongCd=10800&bun=0221&ji=0007&serviceKey={SERVICE_KEY}
```

### 9.9.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남 구 논현동 221-7번 지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10800 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0221 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0007 | 지 |  |
| response.body.items.item.mgmExposPubusePk | mgmExposPubusePk | 관리전유공용PK | VARCHAR(30) | Y | 1024100001939 | 관리전유공 용PK |  |
| response.body.items.item.mgmTypeOulnPk | mgmTypeOulnPk | 관리형별개요PK | VARCHAR(30) | Y | 1024100001921 | 관리형별개 요PK |  |
| response.body.items.item.exposPubuseGbCd | exposPubuseGbCd | 전유공용구분 코드 | VARCHAR(30) | N | 2 | 전유공용구 분코드 |  |
| response.body.items.item.exposPubuseGbCdNm | exposPubuseGbCdNm | 전유공용구분 코드명 | VARCHAR(1000) | N | 공용 | 전유공용구 분코드명 |  |
| response.body.items.item.mainAtchGbCd | mainAtchGbCd | 주부속구분코 드 | VARCHAR(30) | N | 1 | 주부속구분 코드 |  |
| response.body.items.item.mainAtchGbCdNm | mainAtchGbCdNm | 주부속구분코 드명 | VARCHAR(1000) | N | 부속건축물 | 주부속구분 코드명 |  |
| response.body.items.item.flrGbCd | flrGbCd | 층구분코드 | VARCHAR(30) | N | 10 | 층구분코드 |  |
| response.body.items.item.flrGbCdNm | flrGbCdNm | 층구분코드명 | VARCHAR(1000) | N | 지하 | 층구분코드 명 |  |
| response.body.items.item.flrNo | flrNo | 층번호 | NUMBER(5) | N | 1 | 층번호 |  |
| response.body.items.item.flrNoNm | flrNoNm | 층번호명 | VARCHAR(1000) | N | 층번호명 |  |  |
| response.body.items.item.strctCd | strctCd | 구조코드 | VARCHAR(2) | N | 21 | 구조코드 |  |
| response.body.items.item.strctCdNm | strctCdNm | 구조코드명 | VARCHAR(1000) | N | 철근콘크리트구조 | 구조코드명 |  |
| response.body.items.item.etcStrct | etcStrct | 기타구조 | VARCHAR(2000) | N | 철근콘크리트구조 | 기타구조 |  |
| response.body.items.item.purpsCd | purpsCd | 용도코드 | VARCHAR(5) | N | 04001 | 용도코드 |  |
| response.body.items.item.purpsCdNm | purpsCdNm | 용도코드명 | VARCHAR(1000) | N | 일반음식점 | 용도코드명 |  |
| response.body.items.item.etcPurps | etcPurps | 기타용도 | VARCHAR(4000) | N | 주차장 | 기타용도 |  |
| response.body.items.item.area | area | 면적(㎡) | NUMBER(30,9) | N | 41.63 | 면적(㎡) |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |

### 9.9.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
     <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 논현동 221-7</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10800</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0221</bun>

<ji>0007</ji>

<mgmExposPubusePk>1024100001939</mgmExposPubusePk>

<mgmTypeOulnPk>1024100001921</mgmTypeOulnPk>

<exposPubuseGbCd>2</exposPubuseGbCd>

<exposPubuseGbCdNm>공용</exposPubuseGbCdNm>

<mainAtchGbCd>1</mainAtchGbCd>

<mainAtchGbCdNm>부속건축물</mainAtchGbCdNm>

<flrGbCd>10</flrGbCd>

<flrGbCdNm>지하</flrGbCdNm>

<flrNo>1</flrNo>

<flrNoNm> </flrNoNm>

<strctCd>21</strctCd>

<strctCdNm>철근콘크리트구조</strctCdNm>

2024년 건축서비스산업 정보체계 유지관리 사업







<etcStrct>철근콘크리트구조</etcStrct>

<purpsCd>04001</purpsCd>

<purpsCdNm>일반음식점</purpsCdNm>

<etcPurps>주차장</etcPurps>

<area>41.63</area>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>1</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>42</totalCount>
  </body>
</response>
```


### 9.9.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getHpExposPubuseAreaInfo |
| Request DTO 후보 | HpExposPubuseAreaInfoRequest |
| Response DTO 후보 | HpExposPubuseAreaInfoResponse |
| Item DTO 후보 | HpExposPubuseAreaInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.9.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `전유부/전유공용면적 확인, 다세대·오피스텔 판단 보조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.10. 주택인허가 행위호전유공용면적 조회

### 9.10.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getHpHoExposPubuseAreaInfo |
| Method | GET |
| Path | /getHpHoExposPubuseAreaInfo |
| Full URL | http://apis.data.go.kr/1613000/HsPmsHubService/getHpHoExposPubuseAreaInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 행위대상 호의 전유공용구분, 층번호, 면적, 용 도 등에 관한 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 호실 단위 정보 확인, 집합/전유부 판단 보조 |
| 원문 위치 | page 60, 61, 62, 63 |

### 9.10.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10600 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0985 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0000 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.10.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/HsPmsHubService/getHpHoExposPubuseAreaInfo?sigunguCd=11680&bjdongCd=10600&bun=0985&ji=0000&serviceKey={SERVICE_KEY}
```

### 9.10.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 대치동 985번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10600 | 행정표준코 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0985 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0000 | 지 |  |
| response.body.items.item.mgmActHoExposPubusePk | mgmActHoExposPubusePk | 관리행위호전 유공용PK | VARCHAR(30) | Y | 1024100007961 | 관리행위호 전유공용PK |  |
| response.body.items.item.mgmHoDetlPk | mgmHoDetlPk | 관리호별명세PK | VARCHAR(30) | Y | 1024100039272 | 관리호별명 세PK |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.pngtypGbNm | pngtypGbNm | 평형구분명 | VARCHAR(1000) | N | 평형구분명 |  |  |
| response.body.items.item.exposPubuseGbCd | exposPubuseGbCd | 전유공용구분 코드 | VARCHAR(30) | N | 1 | 전유공용구 분코드 |  |
| response.body.items.item.exposPubuseGbCdNm | exposPubuseGbCdNm | 전유공용구분 코드명 | VARCHAR(1000) | N | 전유 | 전유공용구 분코드명 |  |
| response.body.items.item.mainAtchGbCd | mainAtchGbCd | 주부속구분코 드 | VARCHAR(30) | N | 0 | 주부속구분 코드 |  |
| response.body.items.item.mainAtchGbCdNm | mainAtchGbCdNm | 주부속구분코 드명 | VARCHAR(1000) | N | 주건축물 | 주부속구분 코드명 |  |
| response.body.items.item.flrGbCd | flrGbCd | 층구분코드 | VARCHAR(30) | N | 20 | 층구분코드 |  |
| response.body.items.item.flrGbCdNm | flrGbCdNm | 층구분코드명 | VARCHAR(1000) | N | 지상 | 층구분코드 명 |  |
| response.body.items.item.flrNo | flrNo | 층번호 | NUMBER(5) | N | 3 | 층번호 |  |
| response.body.items.item.strctCd | strctCd | 구조코드 | VARCHAR(2) | N | 21 | 구조코드 |  |
| response.body.items.item.strctCdNm | strctCdNm | 구조코드명 | VARCHAR(1000) | N | 철근콘크리트구조 | 구조코드명 |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드 | VARCHAR(5) | N | 04010 | 주용도코드 |  |
| response.body.items.item.mainPurpsCdNm | mainPurpsCdNm | 주용도코드명 | VARCHAR(1000) | N | 학원 | 주용도코드 명 |  |
| response.body.items.item.etcPurps | etcPurps | 기타용도 | VARCHAR(4000) | N | 피아노학원 | 기타용도 |  |
| response.body.items.item.area | area | 면적(㎡) | NUMBER(30,9) | N | 91.08 | 면적(㎡) |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |

### 9.10.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
     <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 대치동 985번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10600</bjdongCd>

2024년 건축서비스산업 정보체계 유지관리 사업







<platGbCd>0</platGbCd>

<bun>0985</bun>

<ji>0000</ji>

<mgmActHoExposPubusePk>1024100007961</mgmActHoExposPubusePk>

<mgmHoDetlPk>1024100039272</mgmHoDetlPk>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<pngtypGbNm> </pngtypGbNm>

<exposPubuseGbCd>1</exposPubuseGbCd>

<exposPubuseGbCdNm>전유</exposPubuseGbCdNm>

<mainAtchGbCd>0</mainAtchGbCd>

<mainAtchGbCdNm>주건축물</mainAtchGbCdNm>

<flrGbCd>20</flrGbCd>

<flrGbCdNm>지상</flrGbCdNm>

<flrNo>3</flrNo>

<strctCd>21</strctCd>

<strctCdNm>철근콘크리트구조</strctCdNm>

<mainPurpsCd>04010</mainPurpsCd>

<mainPurpsCdNm>학원</mainPurpsCdNm>

<etcPurps>피아노학원</etcPurps>

<area>91.08</area>

<crtnDay>20220813</crtnDay>
     </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>20</totalCount>
  </body>
</response>
```


### 9.10.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getHpHoExposPubuseAreaInfo |
| Request DTO 후보 | HpHoExposPubuseAreaInfoRequest |
| Response DTO 후보 | HpHoExposPubuseAreaInfoResponse |
| Item DTO 후보 | HpHoExposPubuseAreaInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.10.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `호실 단위 정보 확인, 집합/전유부 판단 보조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.11. 주택인허가 행위개요 조회

### 9.11.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getHpActOulnInfo |
| Method | GET |
| Path | /getHpActOulnInfo |
| Full URL | http://apis.data.go.kr/1613000/HsPmsHubService/getHpActOulnInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 행위(신고, 허가)에 따른 상세행위구분, 행위전 후용도, 행위전후면적, 행위전후 등에 관한 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 원문 위치 | page 65, 66, 67, 68 |

### 9.11.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0002 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.11.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/HsPmsHubService/getHpActOulnInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0002&serviceKey={SERVICE_KEY}
```

### 9.11.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.actGb | actGb | 행위구분 | VARCHAR(30) | N | 1 | 행위구분 |  |
| response.body.items.item.actGbCd | actGbCd | 행위구분코드 | VARCHAR(30) | N | 10 | 행위구분코드 |  |
| response.body.items.item.actGbCdNm | actGbCdNm | 행위구분코드 명 | VARCHAR(1000) | N | 비내력벽 철거 | 행위구분코드 명 |  |
| response.body.items.item.cmplxNm | cmplxNm | 단지명 | VARCHAR(1000) | N | 엘지개포자이 | 단지명 |  |
| response.body.items.item.bldYn | bldYn | 건축물여부 | VARCHAR(1) | N | 1 | 0: N 1: Y |  |
| response.body.items.item.fcKind | fcKind | 시설종류 | VARCHAR(30) | N | 1 | 시설종류 |  |
| response.body.items.item.archArea | archArea | 건축면적(㎡) | NUMBER(30,9) | N | 2927.93 | 건축면적(㎡) |  |
| response.body.items.item.totArea | totArea | 연면적(㎡) | NUMBER(30,9) | N | 60400.03 | 연면적(㎡) |  |
| response.body.items.item.btmArea | btmArea | 바닥면적(㎡) | NUMBER(30,9) | N | 38816.92 | 바닥면적(㎡) |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드 | VARCHAR(5) | N | 02000 | 주용도코드 |  |
| response.body.items.item.mainPurpsCdNm | mainPurpsCdNm | 주용도코드명 | VARCHAR(1000) | N | 공동주택 | 주용도코드명 |  |
| response.body.items.item.etcPurps | etcPurps | 기타용도 | VARCHAR(4000) | N | 아파트 | 기타용도 |  |
| response.body.items.item.constArea | constArea | 공사면적(㎡) | NUMBER(30,9) | N | 15.53 | 공사면적(㎡) |  |
| response.body.items.item.ugrndFlrCnt | ugrndFlrCnt | 지하층수 | NUMBER(3) | N | 2 | 지하층수 |  |
| response.body.items.item.grndFlrCnt | grndFlrCnt | 지상층수 | NUMBER(3) | N | 22 | 지상층수 |  |
| response.body.items.item.totWkp | totWkp | 총사업비 | NUMBER(30,9) | N | 0 | 총사업비 |  |
| response.body.items.item.stcnsSchedDay | stcnsSchedDay | 착공예정일 | VARCHAR(8) | N | 20210823 | 착공예정일 |  |
| response.body.items.item.useInsptSchedDay | useInsptSchedDay | 사용검사예정 일 | VARCHAR(8) | N | 20211015 | 사용검사예정 일 |  |
| response.body.items.item.hhldCnt | hhldCnt | 세대수(세대) | NUMBER(10) | N | 212 | 세대수(세대) |  |
| response.body.items.item.cmplxFlrCntDongCnt | cmplxFlrCntDongCnt | 단지층수동수 | VARCHAR(2000) | N | 101동 1003호 | 단지층수동수 |  |
| response.body.items.item.regstrGbCd | regstrGbCd | 대장구분코드 | VARCHAR(30) | N | 2 | 대장구분코드 |  |
| response.body.items.item.regstrGbCdNm | regstrGbCdNm | 대장구분코드 명 | VARCHAR(1000) | N | 집합 | 대장구분코드 명 |  |
| response.body.items.item.actBefPurpsCd | actBefPurpsCd | 행위전용도코 드 | VARCHAR(5) | N | 행위전용도코 드 |  |  |
| response.body.items.item.actBefPurpsCdNm | actBefPurpsCdNm | 행위전용도코 드명 | VARCHAR(1000) | N | 행위전용도코 드명 |  |  |
| response.body.items.item.actBefArea | actBefArea | 행위전면적(㎡ ) | NUMBER(30,9) | N | 0 | 행위전면적 ( ㎡) |  |
| response.body.items.item.actAftPurpsCd | actAftPurpsCd | 행위후용도코 드 | VARCHAR(5) | N | 행위후용도코 드 |  |  |
| response.body.items.item.actAftPurpsCdNm | actAftPurpsCdNm | 행위후용도코 드명 | VARCHAR(1000) | N | 행위후용도코 드명 |  |  |
| response.body.items.item.actAftArea | actAftArea | 행위후면적(㎡ ) | NUMBER(30,9) | N | 0 | 행위후면적 ( ㎡) |  |
| response.body.items.item.fcNm | fcNm | 시설명 | VARCHAR(1000) | N | 시설명 |  |  |
| response.body.items.item.actBefEtcPurps | actBefEtcPurps | 행위이전기타 용도 | VARCHAR(4000) | N | 행위이전기타 용도 |  |  |
| response.body.items.item.actAftEtcP | actAftEtcP | 행위이후기타 | VARCHAR(4000) | N | 행위이후기타 |  |  |
| response.body.items.item.urps | urps | 용도 | 용도 | 확인 필요 |  |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남 구 개포동 12-2번 지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0002 | 지 |  |
| response.body.items.item.mgmHsrgstPk | mgmHsrgstPk | 관리주택대장PK | VARCHAR(30) | Y | 1024100059025 | 관리주택대장 PK |  |

### 9.11.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12-2번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0002</ji>

<mgmHsrgstPk>1024100059025</mgmHsrgstPk>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<actGb>1</actGb>

<actGbCd>10</actGbCd>

<actGbCdNm>비내력벽 철거</actGbCdNm>

<cmplxNm>엘지개포자이</cmplxNm>

<bldYn>1</bldYn>

<fcKind>1</fcKind>

<archArea>2927.93</archArea>

<totArea>60400.03</totArea>

<btmArea>38816.92</btmArea>

<mainPurpsCd>02000</mainPurpsCd>

<mainPurpsCdNm>공동주택</mainPurpsCdNm>

<etcPurps>아파트</etcPurps>

<constArea>15.53</constArea>

<ugrndFlrCnt>2</ugrndFlrCnt>

<grndFlrCnt>22</grndFlrCnt>

<totWkp>0</totWkp>

<stcnsSchedDay>20210823</stcnsSchedDay>

2024년 건축서비스산업 정보체계 유지관리 사업







<useInsptSchedDay>20211015</useInsptSchedDay>

<hhldCnt>212</hhldCnt>

<cmplxFlrCntDongCnt>102동 1003호 </cmplxFlrCntDongCnt>

<regstrGbCd>2</regstrGbCd>

<regstrGbCdNm>집합</regstrGbCdNm>

<actBefPurpsCd> </actBefPurpsCd>

<actBefPurpsCdNm> </actBefPurpsCdNm>

<actBefArea>0</actBefArea>

<actAftPurpsCd> </actAftPurpsCd>

<actAftPurpsCdNm> </actAftPurpsCdNm>

<actAftArea>0</actAftArea>

<fcNm> </fcNm>

<actBefEtcPurps> </actBefEtcPurps>

<actAftEtcPurps> </actAftEtcPurps>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>16</totalCount>
  </body>
</response>
```


### 9.11.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getHpActOulnInfo |
| Request DTO 후보 | HpActOulnInfoRequest |
| Response DTO 후보 | HpActOulnInfoResponse |
| Item DTO 후보 | HpActOulnInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.11.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `물건 식별, 건축물 기본정보, 유형 판별`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.12. 주택인허가 관리공동형별개요 조회

### 9.12.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getHpMgmCoopTpOulnInfo |
| Method | GET |
| Path | /getHpMgmCoopTpOulnInfo |
| Full URL | http://apis.data.go.kr/1613000/HsPmsHubService/getHpMgmCoopTpOulnInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 주택인허 가와 관련하여 승강기, 복도, 수도, 난방 등 공동 설비에 대한 정보를 |
| 평균 응답시간 | 500 ms |
| TPS 제한 | 30 tps |
| ZIP:ON 활용 위치 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 원문 위치 | page 70, 71, 72, 73, 74 |

### 9.12.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 지 |  | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.12.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/HsPmsHubService/getHpMgmCoopTpOulnInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&serviceKey={SERVICE_KEY}
```

### 9.12.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.mgmSigunguCd | mgmSigunguCd | 관리시군구코 드 | VARCHAR(30) | N | 11680 | 관리시군구 코드 |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0000 | 지 |  |
| response.body.items.item.mgmCoophsrgstPk | mgmCoophsrgstPk | 관리공동주택 대장PK | VARCHAR(30) | Y | 1024179 | 관리공동주 택대장PK |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.typeGb | typeGb | 형별구분 | VARCHAR(2000) | N | 13 | 형별구분 |  |
| response.body.items.item.etcType | etcType | 기타형별 | VARCHAR(2000) | N | 기타형별 |  |  |
| response.body.items.item.exuseArea | exuseArea | 전용면적(㎡) | NUMBER(30,9) | N | 0 | 전용면적(㎡ ) |  |
| response.body.items.item.cmplxNm | cmplxNm | 단지명 | VARCHAR(1000) | N | 대치2단지 | 단지명 |  |
| response.body.items.item.bizBodyNm | bizBodyNm | 사업주체명 | VARCHAR(1000) | N | 서울시도시개발공사 | 사업주체명 |  |
| response.body.items.item.bizApprvDay | bizApprvDay | 사업승인일 | VARCHAR(8) | N | 19911020 | 사업승인일 |  |
| response.body.items.item.useInsptDay | useInsptDay | 사용검사일 | VARCHAR(8) | N | 19921014 | 사용검사일 |  |
| response.body.items.item.mainBldCn | mainBldCn | 주건축물수 | NUMBER(10) | N | 0 | 주건축물수 |  |
| response.body.items.item.t | t |  |  | 확인 필요 |  |  |  |
| response.body.items.item.maxFlrCnt | maxFlrCnt | 최고층수 | NUMBER(3) | N | 15 | 최고층수 |  |
| response.body.items.item.hhldCnt | hhldCnt | 세대수(세대) | NUMBER(10) | N | 238 | 세대수(세대 ) |  |
| response.body.items.item.strctCd | strctCd | 구조코드 | VARCHAR(2) | N | 22 | 구조코드 |  |
| response.body.items.item.strctCdNm | strctCdNm | 구조코드명 | VARCHAR(1000) | N | 프리케스트콘크리트 구조 | 구조코드명 |  |
| response.body.items.item.elvtRideUse | elvtRideUse | 승강기승용 | NUMBER(10) | N | 0 | 승강기승용 |  |
| response.body.items.item.elvtEmgen | elvtEmgen | 승강기비상 | NUMBER(10) | N | 0 | 승강기비상 |  |
| response.body.items.item.platArea | platArea | 대지면적(㎡) | NUMBER(30,9) | N | 55976.6 | 대지면적(㎡ ) |  |
| response.body.items.item.totArea | totArea | 연면적(㎡) | NUMBER(30,9) | N | 0 | 연면적(㎡) |  |
| response.body.items.item.archArea | archArea | 건축면적(㎡) | NUMBER(30,9) | N | 0 | 건축면적(㎡ ) |  |
| response.body.items.item.hwayModeCd | hwayModeCd | 복도형식코드 | VARCHAR(30) | N | 복도형식코 드 |  |  |
| response.body.items.item.hwayModeCdNm | hwayModeCdNm | 복도형식코드 명 | VARCHAR(1000) | N | 복도형식코 드명 |  |  |
| response.body.items.item.wtspCd | wtspCd | 수도코드 | VARCHAR(30) | N | 2 | 수도코드 |  |
| response.body.items.item.wtspCdNm | wtspCdNm | 수도코드명 | VARCHAR(1000) | N | 상수도 | 수도코드명 |  |
| response.body.items.item.mgmMthdCd | mgmMthdCd | 관리방식코드 | VARCHAR(30) | N | 2 | 관리방식코 드 |  |
| response.body.items.item.mgmMthdCdNm | mgmMthdCdNm | 관리방식코드 명 | VARCHAR(1000) | N | 위탁관리 | 관리방식코 드명 |  |
| response.body.items.item.sfgvMgmStrtDay | sfgvMgmStrtDay | 자치관리개시 일 | VARCHAR(8) | N | 자치관리개 시일 |  |  |
| response.body.items.item.heatMthdCd | heatMthdCd | 난방방식코드 | VARCHAR(30) | N | 2 | 난방방식코 드 |  |
| response.body.items.item.heatMthd | heatMthd | 난방방식코드 | VARCHAR(1000) | N | 지역난방 | 난방방식코 |  |
| response.body.items.item.CdNm | CdNm | 명 | 드명 | 확인 필요 |  |  |  |
| response.body.items.item.useFuel | useFuel | 사용연료 | VARCHAR(1000) | N | 도시가스 | 사용연료 |  |
| response.body.items.item.hsStyleGbCd | hsStyleGbCd | 주택유형구분 코드 | VARCHAR(30) | N | 13 | 주택유형구 분코드 |  |
| response.body.items.item.hsStyleGbCdNm | hsStyleGbCdNm | 주택유형구분 코드명 | VARCHAR(1000) | N | 공공임대(10년) | 주택유형구 분코드명 |  |
| response.body.items.item.hsTypeGbCd | hsTypeGbCd | 주택형별구분 코드 | VARCHAR(30) | N | 3 | 주택형별구 분코드 |  |
| response.body.items.item.hsTypeGbCdNm | hsTypeGbCdNm | 주택형별구분 코드명 | VARCHAR(1000) | N | 아파트 | 주택형별구 분코드명 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 드 |  |

### 9.12.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0000</ji>

<mgmCoophsrgstPk>1024179</mgmCoophsrgstPk>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<typeGb>13</typeGb>

<etcType> </etcType>

<exuseArea>0</exuseArea>

<cmplxNm>대치2단지</cmplxNm>

<bizBodyNm>서울시도시개발공사</bizBodyNm>

<bizApprvDay>19911020</bizApprvDay>

<useInsptDay>19921014</useInsptDay>

<mainBldCnt>0</mainBldCnt>

<maxFlrCnt>15</maxFlrCnt>

<hhldCnt>238</hhldCnt>

<strctCd>22</strctCd>

<strctCdNm>프리케스트콘크리트구조</strctCdNm>

<elvtRideUse>0</elvtRideUse>

<elvtEmgen>0</elvtEmgen>

<platArea>55976.6</platArea>

<totArea>0</totArea>

<archArea>0</archArea>

2024년 건축서비스산업 정보체계 유지관리 사업







<hwayModeCd> </hwayModeCd>

<hwayModeCdNm> </hwayModeCdNm>

<wtspCd>2</wtspCd>

<wtspCdNm>상수도</wtspCdNm>

<mgmMthdCd>2</mgmMthdCd>

<mgmMthdCdNm>위탁관리</mgmMthdCdNm>

<sfgvMgmStrtDay> </sfgvMgmStrtDay>

<heatMthdCd>2</heatMthdCd>

<heatMthdCdNm>지역난방</heatMthdCdNm>

<useFuel>도시가스</useFuel>

<hsStyleGbCd>13</hsStyleGbCd>

<hsStyleGbCdNm>공공임대(10년)</hsStyleGbCdNm>

<hsTypeGbCd>3</hsTypeGbCd>

<hsTypeGbCdNm>아파트</hsTypeGbCdNm>

<mgmSigunguCd>11680</mgmSigunguCd>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>12</totalCount>
  </body>
</response>
```


### 9.12.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getHpMgmCoopTpOulnInfo |
| Request DTO 후보 | HpMgmCoopTpOulnInfoRequest |
| Response DTO 후보 | HpMgmCoopTpOulnInfoResponse |
| Item DTO 후보 | HpMgmCoopTpOulnInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.12.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `물건 식별, 건축물 기본정보, 유형 판별`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.13. 주택인허가 관리공동부대복리시설 조회

### 9.13.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getHpMgmCoopSbsdWlfarFcInfo |
| Method | GET |
| Path | /getHpMgmCoopSbsdWlfarFcInfo |
| Full URL | http://apis.data.go.kr/1613000/HsPmsHubService/getHpMgmCoopSbsdWlfarFcInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 주택인허 가와 관련된 공동부대복리시설(주차장, 관리사무소, 노인정, 조경지, 주 민운동시설 등)의 면적, 층수, 시설개수 등에 관한 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 원문 위치 | page 76, 77, 78, 79, 80 |

### 9.13.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11380 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10700 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0694 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0001 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.13.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/HsPmsHubService/getHpMgmCoopSbsdWlfarFcInfo?sigunguCd=11380&bjdongCd=10700&bun=0694&ji=0001&serviceKey={SERVICE_KEY}
```

### 9.13.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | Y | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | N | 서울특별시 은평구 응암동 694-1번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11380 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10700 | 행정표준코 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | Y | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | Y | 0694 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | Y | 0001 | 지 |  |
| response.body.items.item.mgmCoophsrgstPk | mgmCoophsrgstPk | 관리공동주택 대장PK | VARCHAR(30) | N | 10134 | 관리공동주 택대장PK |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | Y | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | Y | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | Y | 로트 |  |  |
| response.body.items.item.grndPklotUtcnt | grndPklotUtcnt | 지상주차장대 수(대) | NUMBER(10) | Y | 237 | 지상주차장 대수(대) |  |
| response.body.items.item.ugrndPklotUtcnt | ugrndPklotUtcnt | 지하주차장대 수(대) | NUMBER(10) | Y | 0 | 지하주차장 대수(대) |  |
| response.body.items.item.totPklotUtcnt | totPklotUtcnt | 총주차장대수( 대) | NUMBER(10) | Y | 237 | 총주차장대 수(대) |  |
| response.body.items.item.pkngCctvCnt | pkngCctvCnt | 주차CCTV수 | NUMBER(10) | Y | 0 | 주차CCTV수 |  |
| response.body.items.item.reprMtrmArea | reprMtrmArea | 대표회의실면 적(㎡) | NUMBER(30,9) | Y | 0 | 대표회의실 면적(㎡) |  |
| response.body.items.item.mgmOffcArea | mgmOffcArea | 관리소면적(㎡ ) | NUMBER(30,9) | Y | 106.2 | 관리소면적( ㎡) |  |
| response.body.items.item.plgndCctvCnt | plgndCctvCnt | 놀이터CCTV수 | NUMBER(10) | Y | 0 | 놀이터CCTV 수 |  |
| response.body.items.item.wttnkCapa | wttnkCapa | 저수조용량 | VARCHAR(100) | Y | 900 | 저수조용량 |  |
| response.body.items.item.lndscArea | lndscArea | 조경면적(㎡) | NUMBER(30,9) | Y | 836.3 | 조경면적(㎡) |  |
| response.body.items.item.guardrmCnt | guardrmCnt | 경비실개소 | NUMBER(10) | Y | 8 | 경비실개소 |  |
| response.body.items.item.hsoldArea | hsoldArea | 노인정면적(㎡ | NUMBER(30,9) | Y | 97.72 | 노인정면적( |  |
| response.body.items.item.lifeConvFcArea | lifeConvFcArea | 생활편익시설 면적(㎡) | NUMBER(30,9) | Y | 316.1 | 생활편익시 설면적(㎡) |  |
| response.body.items.item.nturFcArea | nturFcArea | 보육시설면적( ㎡) | NUMBER(30,9) | Y | 0 | 보육시설면 적(㎡) |  |
| response.body.items.item.jmExcsFcCnt | jmExcsFcCnt | 주민운동시설 개소 | NUMBER(10) | Y | 0 | 주민운동시 설개소 |  |
| response.body.items.item.kgtFlrCnt | kgtFlrCnt | 유치원층수 | NUMBER(3) | Y | 0 | 유치원층수 |  |
| response.body.items.item.kgtLotArea | kgtLotArea | 유치원부지면 적(㎡) | NUMBER(30,9) | Y | 0 | 유치원부지 면적(㎡) |  |
| response.body.items.item.kgtPurps | kgtPurps | 유치원용도 | VARCHAR(4000) | Y | 유치원용도 |  |  |
| response.body.items.item.mediFcArea | mediFcArea | 의료시설면적( ㎡) | NUMBER(30,9) | Y | 0 | 의료시설면 적(㎡) |  |
| response.body.items.item.plgndCnt | plgndCnt | 놀이터개소 | NUMBER(10) | Y | 2 | 놀이터개소 |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |

### 9.13.5 응답 예시

```xml
<response>
<header>
<resultCode>00</resultCode>
<resultMsg>NORMAL SERVICE</resultMsg>
</header>
<body>
<items>
  <item>

<rnum>1</rnum>

<platPlc>서울특별시 은평구 응암동 694-1번지</platPlc>

<sigunguCd>11380</sigunguCd>

<bjdongCd>10700</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0694</bun>

<ji>0001</ji>

<mgmCoophsrgstPk>10134</mgmCoophsrgstPk>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<grndPklotUtcnt>237</grndPklotUtcnt>

<ugrndPklotUtcnt>0</ugrndPklotUtcnt>

<totPklotUtcnt>237</totPklotUtcnt>

<pkngCctvCnt>0</pkngCctvCnt>

<reprMtrmArea>0</reprMtrmArea>

<mgmOffcArea>106.2</mgmOffcArea>

<plgndCctvCnt>0</plgndCctvCnt>

2024년 건축서비스산업 정보체계 유지관리 사업







<wttnkCapa>900</wttnkCapa>

<lndscArea>836.3</lndscArea>

<guardrmCnt>8</guardrmCnt>

<hsoldArea>97.72</hsoldArea>

<lifeConvFcArea>316.1</lifeConvFcArea>

<nturFcArea>0</nturFcArea>

<jmExcsFcCnt>0</jmExcsFcCnt>

<kgtFlrCnt>0</kgtFlrCnt>

<kgtLotArea>0</kgtLotArea>

<kgtPurps> </kgtPurps>

<mediFcArea>0</mediFcArea>

<plgndCnt>2</plgndCnt>

<crtnDay>20220813</crtnDay>
  </item>
</items>
<numOfRows>10</numOfRows>
<pageNo>1</pageNo>
<totalCount>1</totalCount>
</body>
</response>
```


### 9.13.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getHpMgmCoopSbsdWlfarFcInfo |
| Request DTO 후보 | HpMgmCoopSbsdWlfarFcInfoRequest |
| Response DTO 후보 | HpMgmCoopSbsdWlfarFcInfoResponse |
| Item DTO 후보 | HpMgmCoopSbsdWlfarFcInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.13.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `ZIP:ON 목적별 위험도 계산의 보조 입력값`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.14. 주택인허가 지역지구구역 조회

### 9.14.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getHpJijiguInfo |
| Method | GET |
| Path | /getHpJijiguInfo |
| Full URL | http://apis.data.go.kr/1613000/HsPmsHubService/getHpJijiguInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 주택인허 가와 관련된 지역/지구/구역의 구분 및 명칭, 대표여부 등의 정보를 제 공한다. |
| 평균 응답시간 | 500 ms |
| TPS 제한 | 30 tps |
| ZIP:ON 활용 위치 | 용도지역·지구·구역 확인 및 목적별 체크리스트 |
| 원문 위치 | page 82, 83, 84, 85 |

### 9.14.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0002 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.14.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/HsPmsHubService/getHpJijiguInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0002&serviceKey={SERVICE_KEY}
```

### 9.14.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | Y | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | Y | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | Y | 0002 | 지 |  |
| response.body.items.item.mgmHsrgstPk | mgmHsrgstPk | 관리주택대장PK | VARCHAR(30) | N | 102487 | 관리주택대 장PK |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | Y | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | Y | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | Y | 로트 |  |  |
| response.body.items.item.jijiguGbCd | jijiguGbCd | 지역지구구역 구분코드 | VARCHAR(30) | Y | 1 | 지역지구구 역구분코드 |  |
| response.body.items.item.jijiguGbCdNm | jijiguGbCdNm | 지역지구구역 구분코드명 | VARCHAR(1000) | Y | 용도지역코드 | 지역지구구 역구분코드 명 |  |
| response.body.items.item.jijiguCd | jijiguCd | 지역지구구역 코드 | VARCHAR(30) | Y | 1020 | 지역지구구 역코드 |  |
| response.body.items.item.jijiguCdNm | jijiguCdNm | 지역지구구역 코드명 | VARCHAR(1000) | Y | 일반주거지역 | 지역지구구 역코드명 |  |
| response.body.items.item.reprYn | reprYn | 대표여부 | VARCHAR(1) | Y | 1 | 0: 일반 1: 대표 |  |
| response.body.items.item.jijiguNm | jijiguNm | 지역지구구역 명 | VARCHAR(1000) | Y | 일반주거지역 | 지역지구구 역명 |  |
| response.body.items.item.dongRelGb | dongRelGb | 동별관계구분 | VARCHAR(30) | Y | 동별관계구 분 |  |  |
| response.body.items.item.dongRelGbNm | dongRelGbNm | 동별관계구분 명 | VARCHAR(1000) | Y | 동별관계구 분명 |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | Y | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포동 12-2번지 | 대지위치 |  |

### 9.14.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12-2번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0002</ji>

<mgmHsrgstPk>102487</mgmHsrgstPk>

<splotNm> </splotNm>

<block> </block>

2024년 건축서비스산업 정보체계 유지관리 사업







<lot> </lot>

<jijiguGbCd>1</jijiguGbCd>

<jijiguGbCdNm>용도지역코드</jijiguGbCdNm>

<jijiguCd>1020</jijiguCd>

<jijiguCdNm>일반주거지역</jijiguCdNm>

<reprYn>1</reprYn>

<jijiguNm>일반주거지역</jijiguNm>

<dongRelGb> </dongRelGb>

<dongRelGbNm> </dongRelGbNm>

<crtnDay>20220813</crtnDay>
      </item>
      <item>

<rnum>2</rnum>

<platPlc>서울특별시 강남구 개포동 12-2번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0002</ji>

<mgmHsrgstPk>102487</mgmHsrgstPk>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<jijiguGbCd>2</jijiguGbCd>

<jijiguGbCdNm>용도지구코드</jijiguGbCdNm>

<jijiguCd>160</jijiguCd>

<jijiguCdNm>택지개발지구</jijiguCdNm>

<reprYn>1</reprYn>

<jijiguNm>택지개발지구</jijiguNm>

<dongRelGb> </dongRelGb>

<dongRelGbNm> </dongRelGbNm>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>10</numOfRows>

2024년 건축서비스산업 정보체계 유지관리 사업






    <pageNo>1</pageNo>
    <totalCount>6</totalCount>
  </body>
</response>
```


### 9.14.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getHpJijiguInfo |
| Request DTO 후보 | HpJijiguInfoRequest |
| Response DTO 후보 | HpJijiguInfoResponse |
| Item DTO 후보 | HpJijiguInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.14.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `용도지역·지구·구역 확인 및 목적별 체크리스트`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.15. 주택인허가 복리분양시설 조회

### 9.15.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getHpWlfarLotouFcInfo |
| Method | GET |
| Path | /getHpWlfarLotouFcInfo |
| Full URL | http://apis.data.go.kr/1613000/HsPmsHubService/getHpWlfarLotouFcInfo |
| 설명 | 전국 자치단체의 건축행정시스템(세움터)를 통해 생성된 건축행정정보 중 주택인허가와 관련된 복리분양시설의 용도, 면적, 시설수, 변경전용 도, 변경전시설종류 등의 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 원문 위치 | page 87, 88, 89, 90 |

### 9.15.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0002 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.15.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/HsPmsHubService/getHpWlfarLotouFcInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0002&serviceKey={SERVICE_KEY}
```

### 9.15.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.changbefPurpsCd | changbefPurpsCd | 변경전용도코 드 | VARCHAR(5) | Y | 변경전용도 코드 |  |  |
| response.body.items.item.changbefPurpsCdNm | changbefPurpsCdNm | 변경전용도코 드명 | VARCHAR(1000) | Y | 변경전용도 코드명 |  |  |
| response.body.items.item.changbefEtcPurps | changbefEtcPurps | 변경전기타용 도 | VARCHAR(4000) | Y | 변경전기타 용도 |  |  |
| response.body.items.item.changbefArea | changbefArea | 변경전면적(㎡ ) | NUMBER(30,9) | Y | 0 | 변경전면적 ( ㎡) |  |
| response.body.items.item.changbefCnt | changbefCnt | 변경전개소 | NUMBER(10) | Y | 0 | 변경전개소 |  |
| response.body.items.item.changbefEtcCurst | changbefEtcCurst | 변경전기타현 황 | VARCHAR(4000) | Y | 변경전기타 현황 |  |  |
| response.body.items.item.befWlfarFcKindCd | befWlfarFcKindCd | 전복리시설종 류코드 | VARCHAR(30) | Y | 전복리시설 종류코드 |  |  |
| response.body.items.item.befWlfarFcKindCdNm | befWlfarFcKindCdNm | 전복리시설종 류코드명 | VARCHAR(1000) | Y | 전복리시설 종류코드명 |  |  |
| response.body.items.item.befEtcFc | befEtcFc | 전기타시설 | VARCHAR(1000) | Y | 전기타시설 |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | Y | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | N | 서울특별시 강남 구 개포동 12-2번 지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | Y | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | Y | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | Y | 0002 | 지 |  |
| response.body.items.item.mgmHsrgstPk | mgmHsrgstPk | 관리주택대장PK | VARCHAR(30) | N | 102487 | 관리주택대 장PK |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | Y | 엘지개포자이 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | Y | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | Y | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | Y | 로트 |  |  |
| response.body.items.item.wlfarLotouFcKindCd | wlfarLotouFcKindCd | 복리분양시설 종류코드 | VARCHAR(30) | Y | 01000 | 복리분양시 설종류코드 |  |
| response.body.items.item.wlfarLotouFcKindCdNm | wlfarLotouFcKindCdNm | 복리분양시설 종류코드명 | VARCHAR(1000) | Y | 어린이놀이터 | 복리분양시 설종류코드 명 |  |
| response.body.items.item.etcFc | etcFc | 기타시설 | VARCHAR(1000) | Y | 기타시설 |  |  |
| response.body.items.item.purpsCd | purpsCd | 용도코드 | VARCHAR(5) | Y | 01000 | 용도코드 |  |
| response.body.items.item.purpsCdNm | purpsCdNm | 용도코드명 | VARCHAR(1000) | Y | 단독주택 | 용도코드명 |  |
| response.body.items.item.etcPurps | etcPurps | 기타용도 | VARCHAR(4000) | Y | 기타용도 |  |  |
| response.body.items.item.area | area | 면적(㎡) | NUMBER(30,9) | Y | 473.23 | 면적(㎡) |  |
| response.body.items.item.openCnt | openCnt | 개소 | NUMBER(10) | Y | 1 | 개소 |  |

### 9.15.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12-2번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0002</ji>

<mgmHsrgstPk>102487</mgmHsrgstPk>

<bldNm>엘지개포자이</bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<wlfarLotouFcKindCd>01000</wlfarLotouFcKindCd>

<wlfarLotouFcKindCdNm>어린이놀이터</wlfarLotouFcKindCdNm>

<etcFc> </etcFc>

<purpsCd>01000</purpsCd>

<purpsCdNm>단독주택</purpsCdNm>

<etcPurps> </etcPurps>

<area>473.23</area>

<openCnt>1</openCnt>

<changbefPurpsCd> </changbefPurpsCd>

<changbefPurpsCdNm> </changbefPurpsCdNm>

<changbefEtcPurps> </changbefEtcPurps>

<changbefArea>0</changbefArea>

<changbefCnt>0</changbefCnt>

<changbefEtcCurst> </changbefEtcCurst>

<befWlfarFcKindCd> </befWlfarFcKindCd>

<befWlfarFcKindCdNm> </befWlfarFcKindCdNm>

2024년 건축서비스산업 정보체계 유지관리 사업







<befEtcFc> </befEtcFc>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>1</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>6</totalCount>
  </body>
</response>
```


### 9.15.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getHpWlfarLotouFcInfo |
| Request DTO 후보 | HpWlfarLotouFcInfoRequest |
| Response DTO 후보 | HpWlfarLotouFcInfoResponse |
| Item DTO 후보 | HpWlfarLotouFcInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.15.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `ZIP:ON 목적별 위험도 계산의 보조 입력값`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.16. 주택인허가 대지위치 조회

### 9.16.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getHpPlatPlcInfo |
| Method | GET |
| Path | /getHpPlatPlcInfo |
| Full URL | http://apis.data.go.kr/1613000/HsPmsHubService/getHpPlatPlcInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 주택인허 가와 관련된 대지의 대지위치, 대지폭, 지목 등에 대한 대지정보를 제 공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | ZIP:ON 목적별 위험도 계산의 보조 입력값 |
| 원문 위치 | page 92, 93, 94 |

### 9.16.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0002 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.16.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/HsPmsHubService/getHpPlatPlcInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0002&serviceKey={SERVICE_KEY}
```

### 9.16.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | Y | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포동 12-2번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | N | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | N | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | Y | 0 | 0:대지 1: 산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | Y | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | Y | 0002 | 지 |  |
| response.body.items.item.mgmHsrgstPk | mgmHsrgstPk | 관리주택대장PK | VARCHAR(30) | N | 1024100052225 | 관리주택대 장PK |  |
| response.body.items.item.reprYn | reprYn | 대표여부 | VARCHAR(1) | Y | 1 | 0: 일반 1: 대표 |  |
| response.body.items.item.hjdongCd | hjdongCd | 행정동코드 | VARCHAR(30) | Y | 66000 | 행정동코드 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | Y | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | Y | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | Y | 로트 |  |  |
| response.body.items.item.jimokCd | jimokCd | 지목코드 | VARCHAR(30) | Y | 지목코드 |  |  |
| response.body.items.item.jimokCdNm | jimokCdNm | 지목코드명 | VARCHAR(1000) | Y | 지목코드명 |  |  |
| response.body.items.item.relJibunNm | relJibunNm | 관련지번명 | VARCHAR(1000) | Y | 관련지번명 |  |  |
| response.body.items.item.platArea | platArea | 대지면적(㎡) | NUMBER(30,9) | Y | 0 | 대지면적 ( ㎡) |  |
| response.body.items.item.minPlatWidth | minPlatWidth | 최저대지폭 | NUMBER(22,9) | Y | 0 | 최저대지폭 |  |
| response.body.items.item.maxPlatWidth | maxPlatWidth | 최고대지폭 | NUMBER(22,9) | Y | 0 | 최고대지폭 |  |
| response.body.items.item.dongRelGb | dongRelGb | 동별관계구분 | VARCHAR(30) | Y | 동별관계구 분 |  |  |
| response.body.items.item.dongRelGbNm | dongRelGbNm | 동별관계구분 명 | VARCHAR(1000) | Y | 동별관계구 분명 |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | N | 20220813 | 생성일자 |  |

### 9.16.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12-2번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0002</ji>

<mgmHsrgstPk>1024100052225</mgmHsrgstPk>

<reprYn>1</reprYn>

<hjdongCd>66000</hjdongCd>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<jimokCd> </jimokCd>

<jimokCdNm> </jimokCdNm>

<relJibunNm> </relJibunNm>

<platArea>0</platArea>

<minPlatWidth>0</minPlatWidth>

2024년 건축서비스산업 정보체계 유지관리 사업







<maxPlatWidth>0</maxPlatWidth>

<dongRelGb> </dongRelGb>

<dongRelGbNm> </dongRelGbNm>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>14</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>14</totalCount>
  </body>
</response>
```


### 9.16.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getHpPlatPlcInfo |
| Request DTO 후보 | HpPlatPlcInfoRequest |
| Response DTO 후보 | HpPlatPlcInfoResponse |
| Item DTO 후보 | HpPlatPlcInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.16.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `ZIP:ON 목적별 위험도 계산의 보조 입력값`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


## 10. 코드표 / Enum / 분류값

| 분류 | 코드 | 의미 | ZIP:ON 처리 |
| --- | --- | --- | --- |
| platGbCd | 0 | 대지 | 대지 기준 조회 |
| platGbCd | 1 | 산 | 산번지/임야 가능성 안내 |
| platGbCd | 2 | 블록 | 블록 지번. 주소 파싱 결과 검증 필요 |
| resultCode | 00 | NORMAL SERVICE | 성공 처리 |

## 11. 에러 코드

| 코드 | 메시지 | 의미 | 백엔드 처리 방안 | 사용자 노출 메시지 |
| --- | --- | --- | --- | --- |
| 00 | NORMAL SERVICE | 정상 | 성공 처리 |  |
| 01 | APPLICATION_ERROR | 어플리케이션 에러 | 일시 장애 또는 제공기관 오류로 기록하고 재시도 가능 여부 판단 | 잠시 후 다시 시도해주세요. |
| 02 | DB_ERROR | 데이터베이스 에러 | 제공기관 DB 오류. 재시도 후 지속 시 관리자 확인 | 공공데이터 제공기관 응답이 불안정합니다. |
| 04 | HTTP_ERROR | HTTP 에러 | HTTP 상태코드와 본문을 함께 로깅 | 공공데이터 호출 중 오류가 발생했습니다. |
| 05 | SERVICETIMEOUT_ERROR | 서비스 연결 실패 에러 | 타임아웃 처리, 회로차단/재시도 정책 적용 | 공공데이터 응답이 지연되고 있습니다. |
| 10 | INVALID_REQUEST_PARAMETER_ERROR | 잘못된 요청 파라미터 에러 | 사용자 입력 또는 주소 파싱 결과 검증 | 입력한 주소 정보를 다시 확인해주세요. |
| 11 | NO_MANDATORY_REQUEST_PARAMETERS_ERROR | 필수 요청 파라미터 없음 | 백엔드 요청 DTO 검증 실패로 처리 | 필수 조회 조건이 부족합니다. |
| 12 | NO_OPENAPI_SERVICE_ERROR | 해당 OpenAPI 서비스가 없거나 폐기됨 | 엔드포인트/서비스명 변경 여부 확인 | 현재 해당 공공데이터 서비스를 사용할 수 없습니다. |
| 20 | SERVICE_ACCESS_DENIED_ERROR | 서비스 접근거부 | 서비스키 권한/활용신청 상태 점검 | 공공데이터 인증 설정 확인이 필요합니다. |
| 21 | TEMPORARILY_DISABLE_THE_SERVICEKEY_ERROR | 일시적으로 사용할 수 없는 서비스키 | 키 상태 확인, 다른 키 전환 가능성 검토 | 공공데이터 인증키가 일시적으로 사용할 수 없습니다. |
| 22 | LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR | 서비스 요청 제한 횟수 초과 | 쿼터 초과. 캐시/백오프/운영 알림 | 공공데이터 일일 요청 한도를 초과했습니다. |
| 30 | SERVICE_KEY_IS_NOT_REGISTERED_ERROR | 등록되지 않은 서비스키 | 환경변수/URL 인코딩/활용신청 확인 | 공공데이터 인증키 설정 확인이 필요합니다. |
| 31 | DEADLINE_HAS_EXPIRED_ERROR | 기한 만료된 서비스키 | 서비스키 재발급 또는 활용기간 연장 | 공공데이터 인증키가 만료되었습니다. |
| 99 | UNKNOWN_ERROR | 기타 에러 | 원문 응답 전문 저장 후 관리자 확인 | 공공데이터 조회 중 알 수 없는 오류가 발생했습니다. |

## 12. 데이터 저장/캐시 전략

| 데이터 | 추천 처리 | 이유 |
| --- | --- | --- |
| 원천 응답 전문 | 선택 저장 | 재현성·디버깅·감사 목적이 있을 때만 저장. 저장 시 요청 파라미터와 resultCode 포함. |
| 주요 응답 필드 | DB 저장 또는 긴 TTL 캐시 | 건축물/인허가/폐쇄말소 정보는 자주 변하지 않으므로 반복 조회 비용을 줄일 수 있음. |
| 주소별 조회 결과 | Redis 단기 캐시 | 사용자가 같은 매물을 반복 진단할 가능성이 높음. |
| 코드표 | DB 또는 enum 상수 | platGbCd, resultCode, 점검기관구분 등은 코드 해석에 반복 사용. |
| 에러 응답 | 로그 저장 | 운영 추적, 키 만료, 파라미터 오류, 제공기관 장애 구분. |
| 조회 결과 없음 | 짧은 TTL 캐시 | 없는 주소/조건 반복 호출 방지. 단, 데이터 갱신 가능성을 고려해 짧게 유지. |

## 13. 구현 시 주의사항

- URL 파라미터에 한글이 포함될 수 있으면 UTF-8 URL 인코딩한다.

- `serviceKey`는 인코딩된 키/디코딩된 키 처리 방식이 공공데이터포털에서 혼동되기 쉬우므로 실제 호출 테스트를 분리한다.

- `bun`, `ji`, `sigunguCd`, `bjdongCd`, PK류는 숫자가 아니라 문자열로 처리한다.

- `items.item`은 XML/JSON 변환 시 단건 객체 또는 배열로 달라질 수 있으므로 커스텀 deserializer 또는 리스트 정규화 로직을 둔다.

- 원문 표의 `필/옵`, `1/0`, `1..n/0..n` 표기가 문서별로 다르므로 내부 DTO에서는 `required`를 명시적으로 통일한다.

- 일부 문서의 서비스 개요는 REST (GET, POST, PUT, DELETE)로 표기되지만 상세 요청 예시는 GET이다. 구현은 GET 기준으로 시작하고 필요 시 원문/포털 확인.

- `_type=json`은 일부 예시에 등장하지만 요청 필드 표에 없는 경우가 많다. JSON 사용 전 실제 응답 구조를 테스트해야 한다.

- 공공데이터 장애, 타임아웃, 일일 트래픽 제한, 키 만료를 구분해 사용자 메시지와 운영 알림을 분리한다.


## 14. API 조합 가능성

| 조합 대상 API | 조합 목적 | 기대 결과 | 주의사항 |
| --- | --- | --- | --- |
| 주소 API/법정동코드 API | 도로명·지번 정규화 후 sigunguCd/bjdongCd/bun/ji 생성 | 정확한 건축HUB 조회 조건 확보 | 주소 후보가 여러 개면 사용자 선택 필요 |
| GIS건물통합정보 | 좌표/건물 존재 확인과 건축물대장 속성 대조 | 건물 단위 식별 정확도 향상 | 건물군/동/호 매칭 모호성 처리 필요 |
| 실거래가 API 묶음 | 유형별 매매/전월세 실거래 비교 | 전세가율·월세 적정성·매매 가격 위험도 산정 | 유형 판별 후 API 선택 필요 |
| 공동주택가격/개별주택가격/공시지가 API | 공시가격 기반 보증금·가격 리스크 참고 | 보증보험/가격 위험도 설명 보조 | 공시가격은 현재 시세가 아님 |
| 등기부등본 업로드/OCR | 소유자·근저당·신탁·압류 등 권리관계 확인 | 계약 전 핵심 위험 보강 | 공공데이터 API만으로 확정 불가 |
| 중개업소/사업자/인허가 데이터 | 계약 상대방·중개사·영업 가능성 보조 확인 | 체크리스트 고도화 | 개별 계약의 법적 판단으로 단정 금지 |


# 외부 API 명세 - 건축HUB 폐쇄말소대장정보 서비스

## 1. 원본 파일 분석

| 항목 | 내용 |
| --- | --- |
| 원본 파일명 | OpenAPI활용가이드-_건축HUB_폐쇄말소대장_1.0.pdf |
| 파일 형식 | PDF |
| 문서명 | OpenAPI 활용가이드 |
| 문서 버전 | 1.0 |
| 작성/개정일 | 2024.10.01 또는 2024.10 (원문 표기 차이 존재) |
| 제공기관 | 국토교통부 |
| 서비스명 국문 | 건축HUB 폐쇄말소대장정보 서비스 |
| 서비스명 영문 | ShtRgstHubService |
| 서비스 설명 | 폐쇄말소대장 정보를 제공한다. |
| 데이터 갱신주기 | 확인 필요 |
| 원문 구조 | PDF / 페이지 수: 75 / 오퍼레이션 10개 |
| 비고 | 원문 표/샘플 URL/샘플 응답을 구현용 구조로 재배치. OCR·파싱상 줄바꿈으로 끊어진 필드명은 가능한 복원했으며 불확실한 항목은 원문 확인 필요. |

## 2. 원본 구조 요약

| 구분 | 원문 위치 | 내용 | 구현 관련성 |
| --- | --- | --- | --- |
| 서비스 개요 | 초반 서비스 명세 | 서비스명, 인증 방식, REST, XML/JSON 지원 여부, Base URL | 높음 |
| 서비스 Key 발급 및 활용 | 서비스 사용 장 | data.go.kr 활용신청 화면 및 serviceKey 사용 방식 | 보통 |
| 페이징 설명 | 서비스 사용 장 | numOfRows, pageNo, totalCount 기반 반복 호출 | 높음 |
| 오퍼레이션 목록 | 서비스 명세 장 | 10개 오퍼레이션 | 높음 |
| 오퍼레이션별 요청/응답 명세 | 각 오퍼레이션 명세 | 요청 파라미터, 응답 필드, 샘플 URL, XML 응답 예시 | 높음 |
| 에러 코드 | 문서 말미 또는 공공데이터 공통 | resultCode/resultMsg 및 에러코드 처리 | 높음 |

## 3. ZIP:ON 적용 판단

### 3.1 적용 가능 영역

| ZIP:ON 기능 영역 | 적용 가능 여부 | 활용 방식 | 중요도 |
| --- | --- | --- | --- |
| 주소 정제 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 법정동코드 변환 | 보조 | sigunguCd/bjdongCd/bun/ji로 폐쇄말소대장 조회 | 중요 |
| 물건 유형 판별 | 보조 | 폐쇄/말소된 과거 대장과 현재 대장 불일치 여부를 확인 | 중요 |
| 건축물 기본정보 확인 | 보조 | 폐쇄말소 구분/일자/과거 표제부·전유부·층별 정보 확인 | 중요 |
| 토지·임야 기본정보 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 실거래가 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 공시가격·공시지가 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 전세 위험도 계산 | 보조 | 폐쇄·말소 이력이 있으면 현재 공부와 등기부 확인 항목을 강화 | 중요 |
| 월세 적정성 판단 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 매매 위험도 계산 | 보조 | 말소·폐쇄 이력, 과거 용도·면적·주택가격 확인 | 중요 |
| 용도지역·지구·구역 확인 | 보조 | 폐쇄말소대장의 지역지구구역 이력 확인 | 선택 |
| 생활 인프라 분석 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 상권 분석 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 환경·재난 리스크 분석 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 계약 상대방·중개사 확인 | 불가능 | 원문상 해당 기능에 직접 필요한 데이터 없음 | 선택 |
| 체크리스트 생성 | 가능 | 현재 대장/등기부와 폐쇄말소 이력 대조 확인 안내 | 중요 |

### 3.2 적용 판단 요약

폐쇄말소대장 API는 현재 계약 대상의 과거 폐쇄·말소 이력을 확인하는 보조 API다. 폐쇄말소 구분코드, 말소일, 과거 대장구분/대장종류/용도/면적/주택가격 정보를 통해 현재 건축물대장·등기부와 대조해야 할 항목을 생성할 수 있다. 위험도 점수의 직접 가격 자료라기보다 “현재 공부와 과거 이력 불일치 확인”을 위한 경고·체크리스트 데이터에 가깝다.

## 4. 서비스 기본 정보

| 항목 | 내용 |
| --- | --- |
| Base URL | http://apis.data.go.kr/1613000/ShtRgstHubService |
| 운영환경 URL | http://apis.data.go.kr/1613000/ShtRgstHubService |
| 개발환경 URL | http://apis.data.go.kr/1613000/ShtRgstHubService |
| 프로토콜 | REST |
| HTTP Method | GET 샘플 기준. 일부 서비스 개요 표에는 REST (GET, POST, PUT, DELETE)로 표기된 문서가 있으나 상세 예시는 GET임. |
| 인증 방식 | serviceKey |
| 요청 데이터 형식 | query parameter |
| 응답 데이터 형식 | XML/JSON |
| 평균 응답시간 | 500 ms |
| TPS 제한 | 30 tps |
| 메시지 크기 제한 | bytes 값 원문 공란 - 확인 필요 |
| WADL/Swagger/OpenAPI 여부 | WADL N/A 또는 서비스 명세 URL 원문 표기. Swagger/OpenAPI 스키마 없음. |
| 비고 | 시군구코드와 법정동코드는 행정표준코드관리시스템의 법정동코드 기준. |

## 5. 인증 방식

### 5.1 인증 파라미터

| 파라미터 | 위치 | 필수 | 설명 |
| --- | --- | --- | --- |
| serviceKey | query | Y | 공공데이터포털에서 발급받은 인증키. URL Encode 필요. 실제 문서/코드에는 `{SERVICE_KEY}`로 치환. |

### 5.2 인증 예시

```http
GET http://apis.data.go.kr/1613000/ShtRgstHubService/getSrBasisOulnInfo?serviceKey={SERVICE_KEY}
```

## 6. 공통 요청 규칙

| 파라미터 | 타입 | 필수 | 예시 | 설명 |
| --- | --- | --- | --- | --- |
| serviceKey | VARCHAR/String | Y | {SERVICE_KEY} | 인증키 |
| sigunguCd | VARCHAR(30) 또는 문서별 상이 | Y | 11680 | 시군구코드. 유지점검기관 조회 등 일부 오퍼레이션은 다른 필수 조건을 사용. |
| bjdongCd | VARCHAR(30) 또는 문서별 상이 | Y | 10300 | 법정동코드. 유지점검기관 조회 등 일부 오퍼레이션은 선택/미사용 가능. |
| platGbCd | VARCHAR(30) | N | 0 | 대지구분코드. 0: 대지, 1: 산, 2: 블록. |
| bun | VARCHAR(20) | N | 0012 | 본번. 앞자리 0 보존 필요. |
| ji | VARCHAR(20) | N | 0000 | 부번. 앞자리 0 보존 필요. |
| startDate | VARCHAR(30) | N | YYYYMMDD | 검색시작일. 지원 여부는 오퍼레이션별 원문 기준. |
| endDate | VARCHAR(30) | N | YYYYMMDD | 검색종료일. 지원 여부는 오퍼레이션별 원문 기준. |
| numOfRows | VARCHAR(3) 또는 숫자 | N | 10 | 페이지당 목록 수. 원문상 1회 최대 100건 제한. |
| pageNo | VARCHAR(3) 또는 숫자 | N | 1 | 페이지 번호. 1부터 시작. |
| _type | String | N | json | PDF 일부 예시에 등장. 요청 파라미터 표에는 없는 경우가 많으므로 서비스별 실제 지원 확인 필요. |

## 7. 페이징 규칙

원문 공통 설명 기준으로 1회 요청 가능한 목록 수(`numOfRows`)는 최대 100건이다. 전체 목록이 필요하면 최초 요청의 `totalCount`를 확인한 뒤 `pageNo`를 1부터 전체 페이지 수까지 반복 호출한다.

```text
totalPages = ceil(totalCount / numOfRows)
for pageNo in 1..totalPages:
    call API with same search condition and pageNo
```

구현 시 `totalCount == 0`, `items.item` 단건 객체/배열 차이, 공공데이터 장애 시 재시도 횟수를 반드시 처리한다.

## 8. 오퍼레이션 목록

| 번호 | 오퍼레이션명 | 국문명 | 설명 | ZIP:ON 활용 |
| --- | --- | --- | --- | --- |
| 1 | getSrBasisOulnInfo | 폐쇄말소대장 기본개요 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장의 대장종류, 대장구분, 지번주소 및 새주소, 지역/지구/구역 등의 기본정보를 제공한다. | 물건 식별, 건축물 기본정보, 유형 판별 |
| 2 | getSrRecapTitleInfo | 폐쇄말소대장 총괄표제부 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장 총괄표제부의 지번주소 및 새주소, 대지면적, 건축면적, 연면적, 건폐율, 용적율, 용도, 주차방식 및 주차대수, 부속건축물의 면적, 허가 관리기관, 에너지관련 등급 등의 정보를 제공한다. | 물건 식별, 건축물 기본정보, 유형 판별 |
| 3 | getSrTitleInfo | 폐쇄말소대장 표제부 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장 표제부의 지번주소 및 새주소, 주/부속구분, 대지면적, 건축면적, 건폐율, 용적율, 구조, 용도, 지붕구조, 주차대수 등의 정보를 제공한다. | 물건 식별, 건축물 기본정보, 유형 판별 |
| 4 | getSrFlrOulnInfo | 폐쇄말소대장 층별개요 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장의 층구분, 층번호, 층의 구조, 용도, 면적 등의 층별 정보를 제공 한다. | 물건 식별, 건축물 기본정보, 유형 판별 |
| 5 | getSrAtchJibunInfo | 폐쇄말소대장 부속지번 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장과 관련된 부속지번의 지번주소 및 새주소, 부속대장구분 등의 정 보를 제공한다. | 폐쇄·말소 이력 확인 및 현재 공부 대조 |
| 6 | getSrExposPubuseAreaInfo | 폐쇄말소대장 전유공용면적 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장과 관련된 전유/공용면적의 층구번, 층번호, 전유/공용구분, 구조, 용도 등의 정보를 제공한다. | 전유부/전유공용면적 확인, 다세대·오피스텔 판단 보조 |
| 7 | getSrWclfInfo | 폐쇄말소대장 오수정화시설 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장과 관련된 오수정화시설의 오수정화형식, 용량, 용량단위 등의 정 보를 제공한다. | 설비/위생 관련 체크리스트 보조 |
| 8 | getSrExposInfo | 폐쇄말소대장 전유부 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장 전유부의 지번주소 및 새주소, 동/호명칭, 구조, 용도, 면적 등의 정보를 제공한다. | 전유부/전유공용면적 확인, 다세대·오피스텔 판단 보조 |
| 9 | getSrHsprcInfo | 폐쇄말소대장 주택가격 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장 대상 주택의 가격정보를 제공한다. | 공시가격·보증금 위험도 참고 |
| 10 | getSrJijiguInfo | 폐쇄말소대장 지역지구구역 조회 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장과 관련된 지역/지구/구역의 구분 및 명칭, 대표여부 등의 정보를 제공한다. | 용도지역·지구·구역 확인 및 목적별 체크리스트 |

## 9. 오퍼레이션 상세


---

## 9.1. 폐쇄말소대장 기본개요

### 9.1.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getSrBasisOulnInfo |
| Method | GET |
| Path | /getSrBasisOulnInfo |
| Full URL | http://apis.data.go.kr/1613000/ShtRgstHubService/getSrBasisOulnInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장의 대장종류, 대장구분, 지번주소 및 새주소, 지역/지구/구역 등의 기본정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 원문 위치 | page 16, 17, 18, 19 |

### 9.1.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0004 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.1.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ShtRgstHubService/getSrBasisOulnInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0004&serviceKey={SERVICE_KEY}
```

### 9.1.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12-4번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0004 | 지 |  |
| response.body.items.item.mgmShtregPk | mgmShtregPk | 관리폐쇄말소 대장PK | VARCHAR(30) | Y | 1024018212 | 관리폐쇄말 소대장PK |  |
| response.body.items.item.shterGbCd | shterGbCd | 폐쇄말소 구분코드 | VARCHAR(30) | N | 7 | 폐쇄말소구 분코드 |  |
| response.body.items.item.shterGbCdNm | shterGbCdNm | 폐쇄말소구분 코드명 | VARCHAR(1000) | N | 일부폐쇄 | 폐쇄말소구 분코드명 |  |
| response.body.items.item.regstrGbCd | regstrGbCd | 대장구분코드 | VARCHAR(30) | N | 2 | 대장구분코 드 |  |
| response.body.items.item.regstrGbCdNm | regstrGbCdNm | 대장구분코드 명 | VARCHAR(1000) | N | 집합 | 대장구분코 드명 |  |
| response.body.items.item.regstrKindCd | regstrKindCd | 대장종류코드 | VARCHAR(30) | N | 4 | 대장종류코 드 |  |
| response.body.items.item.regstrKindCdNm | regstrKindCdNm | 대장종류코드 명 | VARCHAR(1000) | N | 전유부 | 대장종류코 드명 |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 도로명대지 위치 |  |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 석탑프라자 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.bylotCnt | bylotCnt | 외필지수 | NUMBER(10) | N | 0 | 외필지수 |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 새주소도로 코드 |  |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동 코드 | 0 | 새주소법정 동코드 |  |  |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 0 | 새주소지상 지하코드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 0 | 새주소본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부번 |  |
| response.body.items.item.jiyukCd | jiyukCd | 지역코드 | VARCHAR(30) | N | 지역코드 |  |  |
| response.body.items.item.jiguCd | jiguCd | 지구코드 | VARCHAR(30) | N | 지구코드 |  |  |
| response.body.items.item.guyukCd | guyukCd | 구역코드 | VARCHAR(30) | N | 구역코드 |  |  |
| response.body.items.item.jiyukCdNm | jiyukCdNm | 지역코드명 | VARCHAR(1000) | N | 지역코드명 |  |  |
| response.body.items.item.jiguCdNm | jiguCdNm | 지구코드명 | VARCHAR(1000) | N | 지구코드명 |  |  |
| response.body.items.item.guyukCdNm | guyukCdNm | 구역코드명 | VARCHAR(1000) | N | 구역코드명 |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |

### 9.1.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE.</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0004</ji>

<mgmShtregPk>1024018212</mgmShtregPk>

<shterGbCd>7</shterGbCd>

<shterGbCdNm>일부폐쇄</shterGbCdNm>

<regstrGbCd>2</regstrGbCd>

<regstrGbCdNm>집합</regstrGbCdNm>

<regstrKindCd>4</regstrKindCd>

<regstrKindCdNm>전유부</regstrKindCdNm>

<newPlatPlc> </newPlatPlc>

<bldNm>석탑프라자</bldNm>f

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<bylotCnt>0</bylotCnt>

<naRoadCd> </naRoadCd>

<naBjdongCd> </naBjdongCd>

<naUgrndCd>0</naUgrndCd>

<naMainBun>0</naMainBun>

<naSubBun>0</naSubBun>

<jiyukCd> </jiyukCd>

<jiguCd> </jiguCd>

<guyukCd> </guyukCd>

2024년 건축서비스산업 정보체계 유지관리 사업







<jiyukCdNm> </jiyukCdNm>

<jiguCdNm> </jiguCdNm>

<guyukCdNm> </guyukCdNm>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>4</totalCount>
  </body>
</response>
```


### 9.1.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getSrBasisOulnInfo |
| Request DTO 후보 | SrBasisOulnInfoRequest |
| Response DTO 후보 | SrBasisOulnInfoResponse |
| Item DTO 후보 | SrBasisOulnInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.1.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `물건 식별, 건축물 기본정보, 유형 판별`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.2. 폐쇄말소대장 총괄표제부 조회

### 9.2.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getSrRecapTitleInfo |
| Method | GET |
| Path | /getSrRecapTitleInfo |
| Full URL | http://apis.data.go.kr/1613000/ShtRgstHubService/getSrRecapTitleInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장 총괄표제부의 지번주소 및 새주소, 대지면적, 건축면적, 연면적, 건폐율, 용적율, 용도, 주차방식 및 주차대수, 부속건축물의 면적, 허가 관리기관, 에너지관련 등급 등의 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 원문 위치 | page 21, 22, 23, 24, 25, 26 |

### 9.2.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0173 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0000 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.2.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ShtRgstHubService/getSrRecapTitleInfo?sigunguCd=11680&bjdongCd=10300&bun=0173&ji=0000&serviceKey={SERVICE_KEY}
```

### 9.2.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 173번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0173 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0000 | 지 |  |
| response.body.items.item.mgmShtregPk | mgmShtregPk | 관리폐쇄말소 대장PK | VARCHAR(30) | Y | 10240100067055 | 관리폐쇄말 소대장PK |  |
| response.body.items.item.shterGbCd | shterGbCd | 폐쇄말소구분 코드 | VARCHAR(30) | N | 6 | 폐쇄말소구 분코드 |  |
| response.body.items.item.shterGbCdNm | shterGbCdNm | 폐쇄말소구분 코드명 | VARCHAR(1000) | N | 일부말소 | 폐쇄말소구 분코드명 |  |
| response.body.items.item.shterDay | shterDay | 폐쇄말소일 | VARCHAR(8) | N | 20100622 | 폐쇄말소일 |  |
| response.body.items.item.regstrGbCd | regstrGbCd | 대장구분코드 | VARCHAR(30) | N | 1 | 대장구분코 드 |  |
| response.body.items.item.regstrGbCdNm | regstrGbCdNm | 대장구분코드 명 | VARCHAR(1000) | N | 일반 | 대장구분코 드명 |  |
| response.body.items.item.regstrKindCd | regstrKindCd | 대장종류코드 | VARCHAR(30) | N | 1 | 대장종류코 드 |  |
| response.body.items.item.regstrKindCdNm | regstrKindCdNm | 대장종류코드 명 | VARCHAR(1000) | N | 총괄표제부 | 대장종류코 드명 |  |
| response.body.items.item.newOldRegstrGbCd | newOldRegstrGbCd | 신구대장구분 코드 | VARCHAR(30) | N | 1 | 신구대장구 분코드 |  |
| response.body.items.item.newOldRegstrGbCdNm | newOldRegstrGbCdNm | 신구대장구분 코드명 | VARCHAR(1000) | N | 신대장 | 신구대장구 분코드명 |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 도로명대지 위치 |  |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200 ) | N | 개포고등학교 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | 0 | 블록 |  |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500 ) | N | 로트 |  |  |
| response.body.items.item.bylotCnt | bylotCnt | 외필지수 | NUMBER(10) | N | 0 | 외필지수 |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 새주소도로 코드 |  |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동 코드 | VARCHAR(30) | N | 새주소법정 동코드 |  |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 새주소지상 지하코드 |  |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 0 | 새주소본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부번 |  |
| response.body.items.item.platArea | platArea | 대지면적(㎡) | NUMBER(30,9 ) | N | 20145.8 | 대지면적(㎡) |  |
| response.body.items.item.archArea | archArea | 건축면적(㎡) | NUMBER(30,9 ) | N | 4044.61 | 건축면적(㎡) |  |
| response.body.items.item.bcRat | bcRat | 건폐율(%) | NUMBER(22,9 ) | N | 20.08 | 건폐율(%) |  |
| response.body.items.item.totArea | totArea | 연면적(㎡) | NUMBER(30,9 ) | N | 11096.11 | 연면적(㎡) |  |
| response.body.items.item.vlRatEstmTotArea | vlRatEstmTotArea | 용적률산정연 면적(㎡) | NUMBER(30,9 ) | N | 10571.01 | 용적률산정 연면적(㎡) |  |
| response.body.items.item.vlRat | vlRat | 용적률(%) | NUMBER(22,9 ) | N | 52.47 | 용적률(%) |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드 | VARCHAR(5) | N | Z8000 | 주용도코드 |  |
| response.body.items.item.mainPurpsCdNm | mainPurpsCdNm | 주용도코드명 | ARCHAR(1000 ) | N | 교육연구및복지시 설 | 주용도코드 명 |  |
| response.body.items.item.etcPurps | etcPurps | 기타용도 | ARCHAR(4000 ) | N | 교육연구및복지시 설 | 기타용도 |  |
| response.body.items.item.hhldCnt | hhldCnt | 세대수(세대) | 0 | N | 세대수(세대) |  |  |
| response.body.items.item.fmlyCnt | fmlyCnt | 가구수(가구) | NUMBER(10) | N | 0 | 가구수(가구) |  |
| response.body.items.item.mainBldCnt | mainBldCnt | 주건축물수 | NUMBER(10) | N | 4 | 주건축물수 |  |
| response.body.items.item.atchBldCnt | atchBldCnt | 부속건축물수 | NUMBER(10) | N | 4 | 부속건축물 수 |  |
| response.body.items.item.atchBldArea | atchBldArea | 부속건축물면 적(㎡) | NUMBER(30,9 ) | N | 282.7 | 부속건축물 면적(㎡) |  |
| response.body.items.item.totPkngCnt | totPkngCnt | 총주차수 | NUMBER(10) | N | 56 | 총주차수 |  |
| response.body.items.item.indrMechUtcnt | indrMechUtcnt | 옥내기계식대 수(대) | NUMBER(10) | N | 0 | 옥내기계식 대수(대) |  |
| response.body.items.item.indrMechArea | indrMechArea | 옥내기계식면 적(㎡) | NUMBER(30,9 ) | N | 0 | 옥내기계식 면적(㎡) |  |
| response.body.items.item.oudrMechUtcnt | oudrMechUtcnt | 옥외기계식대 수(대) | NUMBER(10) | N | 0 | 옥외기계식 대수(대) |  |
| response.body.items.item.oudrMechArea | oudrMechArea | 옥외기계식면 적(㎡) | NUMBER(30,9 ) | N | 0 | 옥외기계식 면적(㎡) |  |
| response.body.items.item.indrAutoUtcnt | indrAutoUtcnt | 옥내자주식대 수(대) | NUMBER(10) | N | 0 | 옥내자주식 대수(대) |  |
| response.body.items.item.indrAutoArea | indrAutoArea | 옥내자주식면 적(㎡) | NUMBER(30,9 ) | N | 0 | 옥내자주식 면적(㎡) |  |
| response.body.items.item.oudrAutoUtcnt | oudrAutoUtcnt | 옥외자주식대 수(대) | NUMBER(10) | N | 56 | 옥외자주식 대수(대) |  |
| response.body.items.item.oudrAutoArea | oudrAutoArea | 옥외자주식면 적(㎡) | NUMBER(30,9 ) | N | 609.5 | 옥외자주식 면적(㎡) |  |
| response.body.items.item.pmsDay | pmsDay | 허가일 | VARCHAR(8) | N | 허가일 |  |  |
| response.body.items.item.stcnsDay | stcnsDay | 착공일 | VARCHAR(8) | N | 착공일 |  |  |
| response.body.items.item.useAprDay | useAprDay | 사용승인일 | VARCHAR(8) | N | 사용승인일 |  |  |
| response.body.items.item.pmsnoYea | pmsnoYea | 허가번호년 | VARCHAR(4) | N | 허가번호년 |  |  |
| response.body.items.item.r | r |  |  | 확인 필요 |  |  |  |
| response.body.items.item.pmsnoKikCd | pmsnoKikCd | 허가번호기관 코드 | VARCHAR(30) | N | 허가번호기 관코드 |  |  |
| response.body.items.item.pmsnoKikCdNm | pmsnoKikCdNm | 허가번호기관 코드명 | VARCHAR(1000) | N | 허가번호기 관코드명 |  |  |
| response.body.items.item.pmsnoGbCd | pmsnoGbCd | 허가번호구분 코드 | VARCHAR(30) | N | 허가번호구 분코드 |  |  |
| response.body.items.item.pmsnoGbCdNm | pmsnoGbCdNm | 허가번호구분 코드명 | VARCHAR(1000) | N | 허가번호구 분코드명 |  |  |
| response.body.items.item.hoCnt | hoCnt | 호수(호) | NUMBER(10) | N | 0 | 호수(호) |  |
| response.body.items.item.engrGrade | engrGrade | 에너지효율등 급 | VARCHAR(100 ) | N | 에너지효율 등급 |  |  |
| response.body.items.item.engrRat | engrRat | 에너지절감율 | NUMBER(22,9 ) | N | 0 | 에너지절감 율 |  |
| response.body.items.item.engrEpi | engrEpi | EPI점수 | NUMBER(22,9 ) | N | 0 | EPI점수 |  |
| response.body.items.item.gnBldGrade | gnBldGrade | 친환경건축물 등급 | VARCHAR(100 ) | N | 친환경건축 물등급 |  |  |
| response.body.items.item.gnBldCert | gnBldCert | 친환경건축물 인증점수 | NUMBER(22,9 ) | N | 0 | 친환경건축 물인증점수 |  |
| response.body.items.item.itgBldGrade | itgBldGrade | 지능형건축물 등급 | VARCHAR(100 ) | N | 지능형건축 물등급 |  |  |
| response.body.items.item.itgBldCert | itgBldCert | 지능형건축물 인증점수 | NUMBER(22,9 ) | N | 0 | 지능형건축 물인증점수 |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |

### 9.2.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 173번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0173</bun>

<ji>0000</ji>

<mgmShtregPk>10240100067055</mgmShtregPk>

<shterGbCd>6</shterGbCd>

<shterGbCdNm>일부말소</shterGbCdNm>

<shterDay>20100622</shterDay>

<regstrGbCd>1</regstrGbCd>

<regstrGbCdNm>일반</regstrGbCdNm>

<regstrKindCd>1</regstrKindCd>

<regstrKindCdNm>총괄표제부</regstrKindCdNm>

<newOldRegstrGbCd>1</newOldRegstrGbCd>

<newOldRegstrGbCdNm>신대장</newOldRegstrGbCdNm>

<newPlatPlc> </newPlatPlc>

<bldNm>개포고등학교</bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

2024년 건축서비스산업 정보체계 유지관리 사업







<bylotCnt>0</bylotCnt>

<naRoadCd> </naRoadCd>

<naBjdongCd> </naBjdongCd>

<naUgrndCd> </naUgrndCd>

<naMainBun>0</naMainBun>

<naSubBun>0</naSubBun>

<platArea>20145.8</platArea>

<archArea>4044.61</archArea>

<bcRat>20.08</bcRat>

<totArea>11096.11</totArea>

<vlRatEstmTotArea>10571.01</vlRatEstmTotArea>

<vlRat>52.47</vlRat>

<mainPurpsCd>Z8000</mainPurpsCd>

<mainPurpsCdNm>교육연구및복지시설</mainPurpsCdNm>

<etcPurps>교육연구및복지시설</etcPurps>

<hhldCnt>0</hhldCnt>

<fmlyCnt>0</fmlyCnt>

<mainBldCnt>4</mainBldCnt>

<atchBldCnt>4</atchBldCnt>

<atchBldArea>282.7</atchBldArea>

<totPkngCnt>56</totPkngCnt>

<indrMechUtcnt>0</indrMechUtcnt>

<indrMechArea>0</indrMechArea>

<oudrMechUtcnt>0</oudrMechUtcnt>

<oudrMechArea>0</oudrMechArea>

<indrAutoUtcnt>0</indrAutoUtcnt>

<indrAutoArea>0</indrAutoArea>

<oudrAutoUtcnt>56</oudrAutoUtcnt>oudrAutoUtcnt

<oudrAutoArea>609.5</oudrAutoArea>

<pmsDay> </pmsDay>

<stcnsDay> </stcnsDay>

<useAprDay> </useAprDay>

<pmsnoYear> </pmsnoYear>

<pmsnoKikCd> </pmsnoKikCd>

<pmsnoKikCdNm> </pmsnoKikCdNm>

<pmsnoGbCd> </pmsnoGbCd>

2024년 건축서비스산업 정보체계 유지관리 사업







<pmsnoGbCdNm> </pmsnoGbCdNm>

<hoCnt>0</hoCnt>

<engrGrade> </engrGrade>

<engrRat>0</engrRat>

<engrEpi>0</engrEpi>

<gnBldGrade> </gnBldGrade>

<gnBldCert>0</gnBldCert>

<itgBldGrade> </itgBldGrade>

<itgBldCert>0</itgBldCert>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>1</totalCount>
  </body>
</response>
```


### 9.2.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getSrRecapTitleInfo |
| Request DTO 후보 | SrRecapTitleInfoRequest |
| Response DTO 후보 | SrRecapTitleInfoResponse |
| Item DTO 후보 | SrRecapTitleInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.2.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `물건 식별, 건축물 기본정보, 유형 판별`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.3. 폐쇄말소대장 표제부 조회

### 9.3.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getSrTitleInfo |
| Method | GET |
| Path | /getSrTitleInfo |
| Full URL | http://apis.data.go.kr/1613000/ShtRgstHubService/getSrTitleInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장 표제부의 지번주소 및 새주소, 주/부속구분, 대지면적, 건축면적, 건폐율, 용적율, 구조, 용도, 지붕구조, 주차대수 등의 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 원문 위치 | page 30, 31, 32, 33, 34, 35 |

### 9.3.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0004 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.3.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ShtRgstHubService/getSrTitleInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0004&serviceKey={SERVICE_KEY}
```

### 9.3.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12-4번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0004 | 지 |  |
| response.body.items.item.mgmShtregPk | mgmShtregPk | 관리폐쇄말소 대장PK | VARCHAR(30) | Y | 102403216 | 관리폐쇄말 소대장PK |  |
| response.body.items.item.shterGbCd | shterGbCd | 폐쇄말소구분 코드 | VARCHAR(30) | N | 2 | 폐쇄말소구 분코드 |  |
| response.body.items.item.shterGbCdNm | shterGbCdNm | 폐쇄말소구분 코드명 | VARCHAR(1000) | N | 말소 | 폐쇄말소구 분코드명 |  |
| response.body.items.item.shterDay | shterDay | 폐쇄말소일 | VARCHAR(8) | N | 폐쇄말소일 |  |  |
| response.body.items.item.regstrGbCd | regstrGbCd | 대장구분코드 | VARCHAR(30) | N | 2 | 대장구분코 드 |  |
| response.body.items.item.regstrGbC | regstrGbC | 대장구분코드 | VARCHAR(1000) | N | 집합 | 대장구분코 |  |
| response.body.items.item.dNm | dNm | 명 | 드명 | 확인 필요 |  |  |  |
| response.body.items.item.regstrKindCd | regstrKindCd | 대장종류코드 | VARCHAR(30) | N | 3 | 대장종류코 드 |  |
| response.body.items.item.regstrKindCdNm | regstrKindCdNm | 대장종류코드 명 | VARCHAR(1000) | N | 표제부 | 대장종류코 드명 |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 도로명대지 위치 |  |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 석탑프라자 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.bylotCnt | bylotCnt | 외필지수 | NUMBER(10) | N | 0 | 외필지수 |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 새주소도로 코드 |  |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동 코드 | VARCHAR(30) | N | 새주소법정 동코드 |  |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 0 | 새주소지상 지하코드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 0 | 새주소본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부번 |  |
| response.body.items.item.dongNm | dongNm | 동명칭 | VARCHAR(1000) | N | 동명칭 |  |  |
| response.body.items.item.mainAtchGbCd | mainAtchGbCd | 주부속구분코 드 | VARCHAR(30) | N | 0 | 주부속구분 코드 |  |
| response.body.items.item.mainAtchGbCdNm | mainAtchGbCdNm | 주부속구분코 드명 | VARCHAR(1000) | N | 주건축물 | 주부속구분 코드명 |  |
| response.body.items.item.platArea | platArea | 대지면적(㎡) | NUMBER(30,9) | N | 0 | 대지면적(㎡ ) |  |
| response.body.items.item.archArea | archArea | 건축면적(㎡) | NUMBER(30,9) | N | 0 | 건축면적(㎡ |  |
| response.body.items.item.bcRat | bcRat | 건폐율(%) | NUMBER(22,9) | N | 0 | 건폐율(%) |  |
| response.body.items.item.totArea | totArea | 연면적(㎡) | NUMBER(30,9) | N | 0 | 연면적(㎡) |  |
| response.body.items.item.vlRatEstmTotArea | vlRatEstmTotArea | 용적률산정연 면적(㎡) | NUMBER(30,9) | N | 0 | 용적률산정 연면적(㎡) |  |
| response.body.items.item.vlRat | vlRat | 용적률(%) | NUMBER(22,9) | N | 0 | 용적률(%) |  |
| response.body.items.item.strctCd | strctCd | 구조코드 | VARCHAR(2) | N | 구조코드 |  |  |
| response.body.items.item.strctCdNm | strctCdNm | 구조코드명 | VARCHAR(1000) | N | 구조코드명 |  |  |
| response.body.items.item.etcStrct | etcStrct | 기타구조 | VARCHAR(2000) | N | 기타구조 |  |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드 | VARCHAR(5) | N | 주용도코드 |  |  |
| response.body.items.item.mainPurpsCdNm | mainPurpsCdNm | 주용도코드명 | VARCHAR(1000) | N | 주용도코드 명 |  |  |
| response.body.items.item.etcPurps | etcPurps | 기타용도 | VARCHAR(4000) | N | 기타용도 |  |  |
| response.body.items.item.roofCd | roofCd | 지붕코드 | VARCHAR(30) | N | 지붕코드 |  |  |
| response.body.items.item.roofCdNm | roofCdNm | 지붕코드명 | VARCHAR(1000) | N | 지붕코드명 |  |  |
| response.body.items.item.etcRoof | etcRoof | 기타지붕 | VARCHAR(2000) | N | 기타지붕 |  |  |
| response.body.items.item.hhldCnt | hhldCnt | 세대수(세대) | NUMBER(10) | N | 0 | 세대수(세대 ) |  |
| response.body.items.item.fmlyCnt | fmlyCnt | 가구수(가구) | NUMBER(10) | N | 0 | 가구수(가구 ) |  |
| response.body.items.item.heit | heit | 높이(m) | NUMBER(22,9) | N | 0 | 높이(m) |  |
| response.body.items.item.grndFlrCnt | grndFlrCnt | 지상층수 | NUMBER(3) | N | 0 | 지상층수 |  |
| response.body.items.item.ugrndFlrCnt | ugrndFlrCnt | 지하층수 | NUMBER(3) | N | 0 | 지하층수 |  |
| response.body.items.item.rideUseElvtCnt | rideUseElvtCnt | 승용승강기수 | NUMBER(10) | N | 0 | 승용승강기 수 |  |
| response.body.items.item.emgenUseElvtCnt | emgenUseElvtCnt | 비상용승강기 수 | NUMBER(10) | N | 0 | 비상용승강 기수 |  |
| response.body.items.item.atchBldCnt | atchBldCnt | 부속건축물수 | NUMBER(10) | N | 0 | 부속건축물 수 |  |
| response.body.items.item.atchBldArea | atchBldArea | 부속건축물면 적(㎡) | NUMBER(30,9) | N | 0 | 부속건축물 면적(㎡) |  |
| response.body.items.item.totDongTotArea | totDongTotArea | 총동연면적(㎡ ) | NUMBER(30,9) | N | 0 | 총동연면적( ㎡) |  |
| response.body.items.item.indrMechUtcnt | indrMechUtcnt | 옥내기계식대 수(대) | NUMBER(10) | N | 0 | 옥내기계식 대수(대) |  |
| response.body.items.item.indrMechArea | indrMechArea | 옥내기계식면 적(㎡) | NUMBER(30,9) | N | 0 | 옥내기계식 면적(㎡) |  |
| response.body.items.item.oudrMechUtcnt | oudrMechUtcnt | 옥외기계식대 수(대) | NUMBER(10) | N | 0 | 옥외기계식 대수(대) |  |
| response.body.items.item.oudrMechArea | oudrMechArea | 옥외기계식면 적(㎡) | NUMBER(30,9) | N | 0 | 옥외기계식 면적(㎡) |  |
| response.body.items.item.indrAutoUtcnt | indrAutoUtcnt | 옥내자주식대 수(대) | NUMBER(10) | N | 0 | 옥내자주식 대수(대) |  |
| response.body.items.item.indrAutoArea | indrAutoArea | 옥내자주식면 적(㎡) | NUMBER(30,9) | N | 0 | 옥내자주식 면적(㎡) |  |
| response.body.items.item.oudrAutoUtcnt | oudrAutoUtcnt | 옥외자주식대 수(대) | NUMBER(10) | N | 0 | 옥외자주식 대수(대) |  |
| response.body.items.item.oudrAutoArea | oudrAutoArea | 옥외자주식면 적(㎡) | NUMBER(30,9) | N | 0 | 옥외자주식 면적(㎡) |  |
| response.body.items.item.pmsDay | pmsDay | 허가일 | VARCHAR(8) | N | 허가일 |  |  |
| response.body.items.item.stcnsDay | stcnsDay | 착공일 | VARCHAR(8) | N | 착공일 |  |  |
| response.body.items.item.useAprDay | useAprDay | 사용승인일 | VARCHAR(8) | N | 사용승인일 |  |  |
| response.body.items.item.pmsnoYear | pmsnoYear | 허가번호년 | VARCHAR(4) | N | 허가번호년 |  |  |
| response.body.items.item.pmsnoKikCd | pmsnoKikCd | 허가번호기관 코드 | VARCHAR(30) | N | 허가번호기 관코드 |  |  |
| response.body.items.item.pmsnoKikCdNm | pmsnoKikCdNm | 허가번호기관 코드명 | VARCHAR(1000) | N | 허가번호기 관코드명 |  |  |
| response.body.items.item.pmsnoGbCd | pmsnoGbCd | 허가번호구분 코드 | VARCHAR(30) | N | 허가번호구 분코드 |  |  |
| response.body.items.item.pmsnoGbCdNm | pmsnoGbCdNm | 허가번호구분 코드명 | VARCHAR(1000) | N | 허가번호구 분코드명 |  |  |
| response.body.items.item.hoCnt | hoCnt | 호수(호) | NUMBER(10) | N | 0 | 호수(호) |  |
| response.body.items.item.engrGrade | engrGrade | 에너지효율등 급 | VARCHAR(100) | N | 에너지효율 등급 |  |  |
| response.body.items.item.engrRat | engrRat | 에너지절감율 | NUMBER(22,9) | N | 0 | 에너지절감 율 |  |
| response.body.items.item.engrEpi | engrEpi | EPI점수 | NUMBER(22,9) | N | 0 | EPI점수 |  |
| response.body.items.item.gnBldGrade | gnBldGrade | 친환경건축물 등급 | VARCHAR(100) | N | 친환경건축 물등급 |  |  |
| response.body.items.item.gnBldCert | gnBldCert | 친환경건축물 인증점수 | NUMBER(22,9) | N | 0 | 친환경건축 물인증점수 |  |
| response.body.items.item.itgBldGrade | itgBldGrade | 지능형건축물 등급 | VARCHAR(100) | N | 지능형건축 물등급 |  |  |
| response.body.items.item.itgBldCert | itgBldCert | 지능형건축물 인증점수 | NUMBER(22,9) | N | 0 | 지능형건축 물인증점수 |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |

### 9.3.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0004</ji>

<mgmShtregPk>102403216</mgmShtregPk>

<shterGbCd>2</shterGbCd>

<shterGbCdNm>말소</shterGbCdNm>

<regstrGbCd>2</regstrGbCd>

<regstrGbCdNm>집합</regstrGbCdNm>

<regstrKindCd>3</regstrKindCd>

<regstrKindCdNm>표제부</regstrKindCdNm>

<newPlatPlc> </newPlatPlc>

<bldNm>석탑프라자</bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<bylotCnt>0</bylotCnt>

<naRoadCd> </naRoadCd>

<naBjdongCd> </naBjdongCd>

<naUgrndCd>0</naUgrndCd>

<naMainBun>0</naMainBun>

<naSubBun>0</naSubBun>

<dongNm> </dongNm>

<mainAtchGbCd>0</mainAtchGbCd>

2024년 건축서비스산업 정보체계 유지관리 사업







<mainAtchGbCdNm>주건축물</mainAtchGbCdNm>

<platArea>0</platArea>

<archArea>0</archArea>

<bcRat>0</bcRat>

<totArea>0</totArea>

<vlRatEstmTotArea>0</vlRatEstmTotArea>

<vlRat>0</vlRat>

<strctCd> </strctCd>

<strctCdNm> </strctCdNm>

<etcStrct> </etcStrct>

<mainPurpsCd> </mainPurpsCd>

<mainPurpsCdNm> </mainPurpsCdNm>

<etcPurps> </etcPurps>

<roofCd> </roofCd>

<roofCdNm> </roofCdNm>

<etcRoof> </etcRoof>

<hhldCnt>0</hhldCnt>

<fmlyCnt>0</fmlyCnt>

<heit>0</heit>

<grndFlrCnt>0</grndFlrCnt>

<ugrndFlrCnt>0</ugrndFlrCnt>

<rideUseElvtCnt>0</rideUseElvtCnt>

<emgenUseElvtCnt>0</emgenUseElvtCnt>

<atchBldCnt>0</atchBldCnt>

<atchBldArea>0</atchBldArea>

<totDongTotArea>0</totDongTotArea>

<indrMechUtcnt>0</indrMechUtcnt>

<indrMechArea>0</indrMechArea>

<oudrMechUtcnt>0</oudrMechUtcnt>

<oudrMechArea>0</oudrMechArea>

<indrAutoUtcnt>0</indrAutoUtcnt>

<indrAutoArea>0</indrAutoArea>

<oudrAutoUtcnt>0</oudrAutoUtcnt>

<oudrAutoArea>0</oudrAutoArea>

<pmsDay> </pmsDay>

<stcnsDay> </stcnsDay>

2024년 건축서비스산업 정보체계 유지관리 사업







<useAprDay> </useAprDay>

<pmsnoYear> </pmsnoYear>

<pmsnoKikCd> </pmsnoKikCd>

<pmsnoKikCdNm> </pmsnoKikCdNm>

<pmsnoGbCd> </pmsnoGbCd>

<pmsnoGbCdNm> </pmsnoGbCdNm>

<hoCnt>0</hoCnt>

<engrGrade> </engrGrade>

<engrRat>0</engrRat>

<engrEpi>0</engrEpi>

<gnBldGrade> </gnBldGrade>

<gnBldCert>0</gnBldCert>

<itgBldGrade> </itgBldGrade>

<itgBldCert>0</itgBldCert>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>1</totalCount>
  </body>
</response>
```


### 9.3.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getSrTitleInfo |
| Request DTO 후보 | SrTitleInfoRequest |
| Response DTO 후보 | SrTitleInfoResponse |
| Item DTO 후보 | SrTitleInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.3.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `물건 식별, 건축물 기본정보, 유형 판별`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.4. 폐쇄말소대장 층별개요 조회

### 9.4.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getSrFlrOulnInfo |
| Method | GET |
| Path | /getSrFlrOulnInfo |
| Full URL | http://apis.data.go.kr/1613000/ShtRgstHubService/getSrFlrOulnInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장의 층구분, 층번호, 층의 구조, 용도, 면적 등의 층별 정보를 제공 한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 물건 식별, 건축물 기본정보, 유형 판별 |
| 원문 위치 | page 39, 40, 41, 42 |

### 9.4.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 1254 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0006 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.4.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ShtRgstHubService/getSrFlrOulnInfo?sigunguCd=11680&bjdongCd=10300&bun=1254&ji=0006&serviceKey={SERVICE_KEY}
```

### 9.4.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 1254-6번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 1254 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0006 | 지 |  |
| response.body.items.item.mgmShtregPk | mgmShtregPk | 관리폐쇄말소 대장PK | NUMBER(30) | Y | 10240100384479 | 관리폐쇄말 소대장PK |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 개포로25길 21 | 도로명대지 위치 |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 건물명 |  |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 116804166057 | 새주소도로 코드 |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동 코드 | VARCHAR(30) | N | 10301 | 새주소법정 동코드 |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 0 | 새주소지상 지하코드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 21 | 새주소본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부번 |  |
| response.body.items.item.dongNm | dongNm | 동명칭 | VARCHAR(1000) | N | 동명칭 |  |  |
| response.body.items.item.flrGbCd | flrGbCd | 층구분코드 | VARCHAR(30) | N | 10 | 층구분코드 |  |
| response.body.items.item.flrGbCdNm | flrGbCdNm | 층구분코드명 | VARCHAR(1000) | N | 지하 | 층구분코드 명 |  |
| response.body.items.item.flrNo | flrNo | 층번호 | NUMBER(5) | N | 1 | 층번호 |  |
| response.body.items.item.flrNoNm | flrNoNm | 층번호명 | VARCHAR(1000) | N | 지하1층 | 층번호명 |  |
| response.body.items.item.strctCd | strctCd | 구조코드 | VARCHAR(2) | N | 11 | 구조코드 |  |
| response.body.items.item.strctCdNm | strctCdNm | 구조코드명 | VARCHAR(1000) | N | 벽돌구조 | 구조코드명 |  |
| response.body.items.item.etcStrct | etcStrct | 기타구조 | VARCHAR(2000) | N | 연와조 | 기타구조 |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드 | VARCHAR(5) | N | 01001 | 주용도코드 |  |
| response.body.items.item.mainPurpsCdNm | mainPurpsCdNm | 주용도코드명 | VARCHAR(1000) | N | 단독주택 | 주용도코드 명 |  |
| response.body.items.item.etcPurps | etcPurps | 기타용도 | VARCHAR(4000) | N | 주택 | 기타용도 |  |
| response.body.items.item.mainAtchGbCd | mainAtchGbCd | 주부속구분코 드 | VARCHAR(30) | N | 0 | 주부속구분 코드 |  |
| response.body.items.item.mainAtchGbCdNm | mainAtchGbCdNm | 주부속구분코 드명 | VARCHAR(1000) | N | 주건축물 | 주부속구분 코드명 |  |
| response.body.items.item.area | area | 면적(㎡) | NUMBER(30,9) | N | 34.56 | 면적(㎡) |  |
| response.body.items.item.areaExctYn | areaExctYn | 면적제외여부 | VARCHAR(1) | N | 0: N1: Y |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |

### 9.4.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 1254-6번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>1254</bun>

<ji>0006</ji>

<mgmShtregPk>10240100384479</mgmShtregPk>

<newPlatPlc>서울특별시 강남구 개포로25길 21 (개포동)</newPlatPlc>

<bldNm> </bldNm>

<splotNm> </splotNm>

2024년 건축서비스산업 정보체계 유지관리 사업







<block> </block>

<lot> </lot>

<naRoadCd>116804166057</naRoadCd>

<naBjdongCd>10301</naBjdongCd>

<naUgrndCd>0</naUgrndCd>

<naMainBun>21</naMainBun>

<naSubBun>0</naSubBun>

<dongNm> </dongNm>

<flrGbCd>10</flrGbCd>

<flrGbCdNm>지하</flrGbCdNm>

<flrNo>1</flrNo>

<flrNoNm>지하1층</flrNoNm>

<strctCd>11</strctCd>

<strctCdNm>벽돌구조</strctCdNm>

<etcStrct>연와조</etcStrct>

<mainPurpsCd>01001</mainPurpsCd>

<mainPurpsCdNm>단독주택</mainPurpsCdNm>

<etcPurps>주택</etcPurps>

<mainAtchGbCd>0</mainAtchGbCd>

<mainAtchGbCdNm>주건축물</mainAtchGbCdNm>

<area>34.56</area>

<areaExctYn> </areaExctYn>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>5</totalCount>
  </body>
</response>
```


### 9.4.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getSrFlrOulnInfo |
| Request DTO 후보 | SrFlrOulnInfoRequest |
| Response DTO 후보 | SrFlrOulnInfoResponse |
| Item DTO 후보 | SrFlrOulnInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.4.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `물건 식별, 건축물 기본정보, 유형 판별`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.5. 폐쇄말소대장 부속지번 조회

### 9.5.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getSrAtchJibunInfo |
| Method | GET |
| Path | /getSrAtchJibunInfo |
| Full URL | http://apis.data.go.kr/1613000/ShtRgstHubService/getSrAtchJibunInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장과 관련된 부속지번의 지번주소 및 새주소, 부속대장구분 등의 정 보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 폐쇄·말소 이력 확인 및 현재 공부 대조 |
| 원문 위치 | page 45, 46, 47, 48 |

### 9.5.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0170 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0000 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.5.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ShtRgstHubService/getSrAtchJibunInfo?sigunguCd=11680&bjdongCd=10300&bun=0170&ji=0000&serviceKey={SERVICE_KEY}
```

### 9.5.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 170번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0170 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0000 | 지 |  |
| response.body.items.item.mgmShtregPk | mgmShtregPk | 관리폐쇄말소 대장PK | VARCHAR(30) | Y | 102403221 | 관리폐쇄말 소대장PK |  |
| response.body.items.item.regstrGbCd | regstrGbCd | 대장구분코드 | VARCHAR(30) | N | 2 | 대장구분코 드 |  |
| response.body.items.item.regstrGbCdNm | regstrGbCdNm | 대장구분코드 명 | VARCHAR(1000) | N | 집합 | 대장구분코 드명 |  |
| response.body.items.item.regstrKindCd | regstrKindCd | 대장종류코드 | VARCHAR(30) | N | 3 | 대장종류코 드 |  |
| response.body.items.item.regstrKind | regstrKind | 대장종류코드 | VARCHAR(1000) | N | 표제부 | 대장종류코 |  |
| response.body.items.item.CdNm | CdNm | 명 | 드명 | 확인 필요 |  |  |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 도로명대지 위치 |  |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 건물명 |  |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 새주소도로 코드 |  |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동 코드 | VARCHAR(30) | N | 새주소법정 동코드 |  |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 새주소지상 지하코드 |  |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 새주소본번 |  |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 새주소부번 |  |  |
| response.body.items.item.atchRegstrGbCd | atchRegstrGbCd | 부속대장구분 코드 | VARCHAR(30) | N | 2 | 부속대장구 분코드 |  |
| response.body.items.item.atchRegstrGbCdNm | atchRegstrGbCdNm | 부속대장구분 코드명 | VARCHAR(1000) | N | 집합 | 부속대장구 분코드명 |  |
| response.body.items.item.atchSigunguCd | atchSigunguCd | 부속시군구코 드 | VARCHAR(30) | N | 11680 | 부속시군구 코드 |  |
| response.body.items.item.atchBjdongCd | atchBjdongCd | 부속법정동코 드 | VARCHAR(30) | N | 10300 | 부속법정동 코드 |  |
| response.body.items.item.atchPlatGbCd | atchPlatGbCd | 부속대지구분 코드 | VARCHAR(30) | N | 0 | 부속대지구 분코드 |  |
| response.body.items.item.atchBun | atchBun | 부속번 | VARCHAR(20) | N | 0170 | 부속번 |  |
| response.body.items.item.atchJi | atchJi | 부속지 | VARCHAR(20) | N | 0001 | 부속지 |  |
| response.body.items.item.atchSplot | atchSplot | 부속특수지명 | VARCHAR(1000) | N | 부속특수지 |  |  |
| response.body.items.item.Nm | Nm | 명 |  | 확인 필요 |  |  |  |
| response.body.items.item.atchBlock | atchBlock | 부속블록 | VARCHAR(500) | N | 부속블록 |  |  |
| response.body.items.item.atchLot | atchLot | 부속로트 | VARCHAR(500) | N | 부속로트 |  |  |
| response.body.items.item.atchEtcJibunNm | atchEtcJibunNm | 부속기타지번 명 | VARCHAR(1000) | N | 부속기타지 번명 |  |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |

### 9.5.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 170번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0170</bun>

<ji>0000</ji>

2024년 건축서비스산업 정보체계 유지관리 사업







<mgmShtregPk>102403221</mgmShtregPk>

<regstrGbCd>2</regstrGbCd>

<regstrGbCdNm>집합</regstrGbCdNm>

<regstrKindCd>3</regstrKindCd>

<regstrKindCdNm>표제부</regstrKindCdNm>

<newPlatPlc> </newPlatPlc>

<bldNm> </bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<naRoadCd> </naRoadCd>

<naBjdongCd> </naBjdongCd>

<naUgrndCd> </naUgrndCd>

<naMainBun>0</naMainBun>

<naSubBun>0</naSubBun>

<atchRegstrGbCd>2</atchRegstrGbCd>

<atchRegstrGbCdNm>집합</atchRegstrGbCdNm>

<atchSigunguCd>11680</atchSigunguCd>

<atchBjdongCd>10300</atchBjdongCd>

<atchPlatGbCd>0</atchPlatGbCd>

<atchBun>0170</atchBun>

<atchJi>0001</atchJi>

<atchSplotNm> </atchSplotNm>

<atchBlock> </atchBlock>

<atchLot> </atchLot>

<atchEtcJibunNm> </atchEtcJibunNm>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>3</totalCount>
  </body>
</response>
```


### 9.5.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getSrAtchJibunInfo |
| Request DTO 후보 | SrAtchJibunInfoRequest |
| Response DTO 후보 | SrAtchJibunInfoResponse |
| Item DTO 후보 | SrAtchJibunInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.5.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `폐쇄·말소 이력 확인 및 현재 공부 대조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.6. 폐쇄말소대장 전유공용면적 조회

### 9.6.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getSrExposPubuseAreaInfo |
| Method | GET |
| Path | /getSrExposPubuseAreaInfo |
| Full URL | http://apis.data.go.kr/1613000/ShtRgstHubService/getSrExposPubuseAreaInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장과 관련된 전유/공용면적의 층구번, 층번호, 전유/공용구분, 구조, 용도 등의 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 전유부/전유공용면적 확인, 다세대·오피스텔 판단 보조 |
| 원문 위치 | page 50, 51, 52, 53 |

### 9.6.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0004 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.6.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ShtRgstHubService/getSrExposPubuseAreaInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0004&serviceKey={SERVICE_KEY}
```

### 9.6.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12-4번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0004 | 지 |  |
| response.body.items.item.mgmShtregPk | mgmShtregPk | 관리폐쇄말소 대장PK | VARCHAR(30) | Y | 1024018212 | 관리폐쇄말 소대장PK |  |
| response.body.items.item.regstrGbCd | regstrGbCd | 대장구분코드 | VARCHAR(30) | N | 2 | 대장구분코 드 |  |
| response.body.items.item.regstrGbCdNm | regstrGbCdNm | 대장구분코드 명 | VARCHAR(1000) | N | 집합 | 대장구분코 드명 |  |
| response.body.items.item.regstrKindCd | regstrKindCd | 대장종류코드 | VARCHAR(30) | N | 4 | 대장종류코 |  |
| response.body.items.item.regstrKindCdNm | regstrKindCdNm | 대장종류코드 명 | VARCHAR(1000) | N | 전유부 | 대장종류코 드명 |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 도로명대지 위치 |  |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 석탑프라자 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 새주소도로 코드 |  |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동 코드 | VARCHAR(30) | N | 새주소법정 동코드 |  |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 0 | 새주소지상 지하코드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 0 | 새주소본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부번 |  |
| response.body.items.item.dongNm | dongNm | 동명칭 | VARCHAR(1000) | N | 동명칭 |  |  |
| response.body.items.item.hoNm | hoNm | 호명칭 | VARCHAR(1000) | N | 204 | 호명칭 |  |
| response.body.items.item.flrGbCd | flrGbCd | 층구분코드 | VARCHAR(30) | N | 20 | 층구분코드 |  |
| response.body.items.item.flrGbCdNm | flrGbCdNm | 층구분코드명 | VARCHAR(1000) | N | 지상 | 층구분코드 명 |  |
| response.body.items.item.flrNo | flrNo | 층번호 | NUMBER(5) | N | 2 | 층번호 |  |
| response.body.items.item.flrNoNm | flrNoNm | 층번호명 | VARCHAR(1000) | N | 2층 | 층번호명 |  |
| response.body.items.item.exposPubuseGbCd | exposPubuseGbCd | 전유공용구분 코드 | VARCHAR(30) | N | 1 | 전유공용구 분코드 |  |
| response.body.items.item.exposPub | exposPub | 전유공용구분 | VARCHAR(1000) | N | 전유 | 전유공용구 |  |
| response.body.items.item.useGbCdNm | useGbCdNm | 코드명 | 분코드명 | 확인 필요 |  |  |  |
| response.body.items.item.mainAtchGbCd | mainAtchGbCd | 주부속구분코 드 | VARCHAR(30) | N | 0 | 주부속구분 코드 |  |
| response.body.items.item.mainAtchGbCdNm | mainAtchGbCdNm | 주부속구분코 드명 | VARCHAR(1000) | N | 주건축물 | 주부속구분 코드명 |  |
| response.body.items.item.strctCd | strctCd | 구조코드 | VARCHAR(2) | N | 21 | 구조코드 |  |
| response.body.items.item.strctCdNm | strctCdNm | 구조코드명 | VARCHAR(1000) | N | 철근콘크리트구조 | 구조코드명 |  |
| response.body.items.item.etcStrct | etcStrct | 기타구조 | VARCHAR(2000) | N | 철근콘크리트라멘조 | 기타구조 |  |
| response.body.items.item.mainPurpsCd | mainPurpsCd | 주용도코드 | VARCHAR(5) | N | 04001 | 주용도코드 |  |
| response.body.items.item.mainPurpsCdNm | mainPurpsCdNm | 주용도코드명 | VARCHAR(1000) | N | 일반음식점 | 주용도코드 명 |  |
| response.body.items.item.etcPurps | etcPurps | 기타용도 | VARCHAR(4000) | N | 일반음식점 | 기타용도 |  |
| response.body.items.item.area | area | 면적(㎡) | NUMBER(30,9) | N | 62.78 | 면적(㎡) |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |

### 9.6.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0004</ji>

<mgmShtregPk>1024018212</mgmShtregPk>

<regstrGbCd>2</regstrGbCd>

<regstrGbCdNm>집합</regstrGbCdNm>

<regstrKindCd>4</regstrKindCd>

<regstrKindCdNm>전유부</regstrKindCdNm>

<newPlatPlc> </newPlatPlc>

<bldNm>석탑프라자</bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<naRoadCd> </naRoadCd>

<naBjdongCd> </naBjdongCd>

<naUgrndCd>0</naUgrndCd>

<naMainBun>0</naMainBun>

<naSubBun>0</naSubBun>

<dongNm> </dongNm>

<hoNm>204호</hoNm>

<flrGbCd>20</flrGbCd>

<flrGbCdNm>지상</flrGbCdNm>

<flrNo>2</flrNo>

2024년 건축서비스산업 정보체계 유지관리 사업







<flrNoNm>2층</flrNoNm>

<exposPubuseGbCd>1</exposPubuseGbCd>

<exposPubuseGbCdNm>전유</exposPubuseGbCdNm>

<mainAtchGbCd>0</mainAtchGbCd>

<mainAtchGbCdNm>주건축물</mainAtchGbCdNm>

<strctCd>21</strctCd>

<strctCdNm>철근콘크리트구조</strctCdNm>

<etcStrct>철근콘크리트라멘조</etcStrct>

<mainPurpsCd>04001</mainPurpsCd>

<mainPurpsCdNm>일반음식점</mainPurpsCdNm>

<etcPurps>일반음식점</etcPurps>

<area>62.78</area>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>52</totalCount>
  </body>
</response>
```


### 9.6.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getSrExposPubuseAreaInfo |
| Request DTO 후보 | SrExposPubuseAreaInfoRequest |
| Response DTO 후보 | SrExposPubuseAreaInfoResponse |
| Item DTO 후보 | SrExposPubuseAreaInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.6.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `전유부/전유공용면적 확인, 다세대·오피스텔 판단 보조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.7. 폐쇄말소대장 오수정화시설 조회

### 9.7.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getSrWclfInfo |
| Method | GET |
| Path | /getSrWclfInfo |
| Full URL | http://apis.data.go.kr/1613000/ShtRgstHubService/getSrWclfInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장과 관련된 오수정화시설의 오수정화형식, 용량, 용량단위 등의 정 보를 제공한다. |
| 평균 응답시간 | 500 ms |
| TPS 제한 | 30 tps |
| ZIP:ON 활용 위치 | 설비/위생 관련 체크리스트 보조 |
| 원문 위치 | page 55, 57, 58, 59 |

### 9.7.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 1218 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0019 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.7.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ShtRgstHubService/getSrWclfInfo?sigunguCd=11680&bjdongCd=10300&bun=1218&ji=0019&serviceKey={SERVICE_KEY}
```

### 9.7.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 1218-19번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 1218 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0019 | 지 |  |
| response.body.items.item.mgmShtregPk | mgmShtregPk | 관리폐쇄말소 대장PK | VARCHAR(30) | Y | 10240100181702 | 관리폐쇄말 소대장PK |  |
| response.body.items.item.regstrGbCd | regstrGbCd | 대장구분코드 | VARCHAR(30) | N | 1 | 대장구분코 드 |  |
| response.body.items.item.regstrGbCdNm | regstrGbCdNm | 대장구분코드 명 | VARCHAR(1000) | N | 일반 | 대장구분코 드명 |  |
| response.body.items.item.regstrKindCd | regstrKindCd | 대장종류코드 | VARCHAR(30) | N | 2 | 대장종류코 드 |  |
| response.body.items.item.regstrKindCdNm | regstrKindCdNm | 대장종류코드 명 | VARCHAR(1000) | N | 일반건축물 | 대장종류코 드명 |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 서울특별시강남구개 포로22길29 | 도로명대지 위치 |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 건물명 |  |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 116804166055 | 새주소도로 코드 |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동 코드 | VARCHAR(30) | N | 10301 | 새주소법정 동코드 |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 0 | 새주소지상 지하코드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 29 | 새주소본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부번 |  |
| response.body.items.item.modeCd | modeCd | 형식코드 | VARCHAR(30) | N | 202 | 형식코드 |  |
| response.body.items.item.modeCdNm | modeCdNm | 형식코드명 | VARCHAR(1000) | N | 임호프방식 | 형식코드명 |  |
| response.body.items.item.etcMode | etcMode | 기타형식 | VARCHAR(1000) | N | 임호프식 | 기타형식 |  |
| response.body.items.item.unitGbCd | unitGbCd | 단위구분코드 | VARCHAR(30) | N | 2 | 단위구분코 드 |  |
| response.body.items.item.unitGbCdNm | unitGbCdNm | 단위구분코드 명 | VARCHAR(1000) | N | 루베 | 단위구분코 드명 |  |
| response.body.items.item.capaPsper | capaPsper | 용량(인용) | NUMBER(22,9) | N | 25 | 용량(인용) |  |
| response.body.items.item.capaLube | capaLube | 용량(루베) | NUMBER(22,9) | N | 0 | 용량(루베) |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |

### 9.7.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 1218-19번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>1218</bun>

<ji>0019</ji>

<mgmShtregPk>10240100181702</mgmShtregPk>

<regstrGbCd>1</regstrGbCd>

<regstrGbCdNm>일반</regstrGbCdNm>

<regstrKindCd>2</regstrKindCd>

<regstrKindCdNm>일반건축물</regstrKindCdNm>

<newPlatPlc>서울특별시 강남구 개포로22길 29 (개포동)</newPlatPlc>

<bldNm> </bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

2024년 건축서비스산업 정보체계 유지관리 사업







<naRoadCd>116804166055</naRoadCd>

<naBjdongCd>10301</naBjdongCd>

<naUgrndCd>0</naUgrndCd>

<naMainBun>29</naMainBun>

<naSubBun>0</naSubBun>

<modeCd>202</modeCd>

<modeCdNm>임호프방식</modeCdNm>

<etcMode>임호프식</etcMode>

<unitGbCd>2</unitGbCd>

<unitGbCdNm>루베</unitGbCdNm>

<capaPsper>25</capaPsper>

<capaLube>0</capaLube>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>1</totalCount>
  </body>
</response>
```


### 9.7.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getSrWclfInfo |
| Request DTO 후보 | SrWclfInfoRequest |
| Response DTO 후보 | SrWclfInfoResponse |
| Item DTO 후보 | SrWclfInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.7.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `설비/위생 관련 체크리스트 보조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.8. 폐쇄말소대장 전유부 조회

### 9.8.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getSrExposInfo |
| Method | GET |
| Path | /getSrExposInfo |
| Full URL | http://apis.data.go.kr/1613000/ShtRgstHubService/getSrExposInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장 전유부의 지번주소 및 새주소, 동/호명칭, 구조, 용도, 면적 등의 정보를 제공한다. |
| 평균 응답시간 | 500 ms |
| TPS 제한 | 30 tps |
| ZIP:ON 활용 위치 | 전유부/전유공용면적 확인, 다세대·오피스텔 판단 보조 |
| 원문 위치 | page 61, 63, 64, 65 |

### 9.8.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0004 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.8.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ShtRgstHubService/getSrExposInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0004&serviceKey={SERVICE_KEY}
```

### 9.8.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12-4번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0004 | 지 |  |
| response.body.items.item.mgmShtregPk | mgmShtregPk | 관리폐쇄말소 대장PK | VARCHAR(30) | Y | 1024018211 | 관리폐쇄말 소대장PK |  |
| response.body.items.item.regstrGbCd | regstrGbCd | 대장구분코드 | VARCHAR(30) | N | 2 | 대장구분코 드 |  |
| response.body.items.item.regstrGbCdNm | regstrGbCdNm | 대장구분코드 명 | VARCHAR(1000) | N | 집합 | 대장구분코 드명 |  |
| response.body.items.item.regstrKindCd | regstrKindCd | 대장종류코드 | VARCHAR(30) | N | 4 | 대장종류코 드 |  |
| response.body.items.item.regstrKindCdNm | regstrKindCdNm | 대장종류코드 명 | VARCHAR(1000) | N | 전유부 | 대장종류코 드명 |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 도로명대지 위치 |  |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 석탑프라자 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 새주소도로 코드 |  |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동 코드 | VARCHAR(30) | N | 새주소법정 동코드 |  |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 0 | 새주소지상 지하코드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 0 | 새주소본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부번 |  |
| response.body.items.item.dongNm | dongNm | 동명칭 | VARCHAR(1000) | N | 동명칭 |  |  |
| response.body.items.item.hoNm | hoNm | 호명칭 | VARCHAR(1000) | N | 601 | 호명칭 |  |
| response.body.items.item.flrGbCd | flrGbCd | 층구분코드 | VARCHAR(30) | N | 20 | 층구분코드 |  |
| response.body.items.item.flrGbCdNm | flrGbCdNm | 층구분코드명 | VARCHAR(1000) | N | 지상 | 층구분코드 명 |  |
| response.body.items.item.flrNo | flrNo | 층번호 | NUMBER(5) | N | 6 | 층번호 |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |

### 9.8.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

2024년 건축서비스산업 정보체계 유지관리 사업







<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0004</ji>

<mgmShtregPk>1024018211</mgmShtregPk>

<regstrGbCd>2</regstrGbCd>

<regstrGbCdNm>집합</regstrGbCdNm>

<regstrKindCd>4</regstrKindCd>

<regstrKindCdNm>전유부</regstrKindCdNm>

<newPlatPlc> </newPlatPlc>

<bldNm>석탑프라자</bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<naRoadCd> </naRoadCd>

<naBjdongCd> </naBjdongCd>

<naUgrndCd>0</naUgrndCd>

<naMainBun>0</naMainBun>

<naSubBun>0</naSubBun>

<dongNm> </dongNm>

<hoNm>601</hoNm>

<flrGbCd>20</flrGbCd>

<flrGbCdNm>지상</flrGbCdNm>

<flrNo>6</flrNo>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>3</totalCount>
  </body>
</response>
```


### 9.8.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getSrExposInfo |
| Request DTO 후보 | SrExposInfoRequest |
| Response DTO 후보 | SrExposInfoResponse |
| Item DTO 후보 | SrExposInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.8.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `전유부/전유공용면적 확인, 다세대·오피스텔 판단 보조`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.9. 폐쇄말소대장 주택가격 조회

### 9.9.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getSrHsprcInfo |
| Method | GET |
| Path | /getSrHsprcInfo |
| Full URL | http://apis.data.go.kr/1613000/ShtRgstHubService/getSrHsprcInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장 대상 주택의 가격정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 공시가격·보증금 위험도 참고 |
| 원문 위치 | page 67, 68, 69 |

### 9.9.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 11800 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0540 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0000 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.9.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ShtRgstHubService/getSrHsprcInfo?sigunguCd=11680&bjdongCd=11800&bun=0540&ji=0000&serviceKey={SERVICE_KEY}
```

### 9.9.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 도곡동 540번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 11800 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0540 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0000 | 지 |  |
| response.body.items.item.mgmShtregPk | mgmShtregPk | 관리폐쇄말소 대장PK | VARCHAR(30) | Y | 10241138790 | 관리폐쇄말 소대장PK |  |
| response.body.items.item.regstrGbCd | regstrGbCd | 대장구분코드 | VARCHAR(30) | N | 2 | 대장구분코 드 |  |
| response.body.items.item.regstrGbCdNm | regstrGbCdNm | 대장구분코드 명 | VARCHAR(1000) | N | 집합 | 대장구분코 드명 |  |
| response.body.items.item.regstrKindCd | regstrKindCd | 대장종류코드 | VARCHAR(30) | N | 4 | 대장종류코 드 |  |
| response.body.items.item.regstrKind | regstrKind | 대장종류코드 | VARCHAR(1000) | N | 전유부 | 대장종류코 |  |
| response.body.items.item.CdNm | CdNm | 명 | 드명 | 확인 필요 |  |  |  |
| response.body.items.item.newPlatPlc | newPlatPlc | 도로명대지위치 | VARCHAR(1000) | N | 서울특별시 강남구 도곡로 242 (도곡동 ) | 도로명대지 위치 |  |
| response.body.items.item.bldNm | bldNm | 건물명 | VARCHAR(200) | N | 삼호아파트 제2동 | 건물명 |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.bylotCnt | bylotCnt | 외필지수 | NUMBER(10) | N | 1 | 외필지수 |  |
| response.body.items.item.naRoadCd | naRoadCd | 새주소도로코 드 | VARCHAR(30) | N | 116803122012 | 새주소도로 코드 |  |
| response.body.items.item.naBjdongCd | naBjdongCd | 새주소법정동 코드 | VARCHAR(30) | N | 11803 | 새주소법정 동코드 |  |
| response.body.items.item.naUgrndCd | naUgrndCd | 새주소지상지 하코드 | VARCHAR(30) | N | 0 | 새주소지상 지하코드 |  |
| response.body.items.item.naMainBun | naMainBun | 새주소본번 | VARCHAR(20) | N | 242 | 새주소본번 |  |
| response.body.items.item.naSubBun | naSubBun | 새주소부번 | VARCHAR(20) | N | 0 | 새주소부번 |  |
| response.body.items.item.hsprc | hsprc | 주택가격 | NUMBER(30,9) | N | 620000000 | 주택가격 |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |

### 9.9.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 도곡동 540번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>11800</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0540</bun>

<ji>0000</ji>

<mgmShtregPk>10241138790</mgmShtregPk>

<regstrGbCd>2</regstrGbCd>

<regstrGbCdNm>집합</regstrGbCdNm>

<regstrKindCd>4</regstrKindCd>

<regstrKindCdNm>전유부</regstrKindCdNm>

<newPlatPlc>서울특별시 강남구 도곡로 242 (도곡동)</newPlatPlc>

<bldNm>삼호아파트 제2동</bldNm>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<bylotCnt>1</bylotCnt>

<naRoadCd>116803122012</naRoadCd>

<naBjdongCd>11803</naBjdongCd>

<naUgrndCd>0</naUgrndCd>

<naMainBun>242</naMainBun>

2024년 건축서비스산업 정보체계 유지관리 사업







<naSubBun>0</naSubBun>

<hsprc>620000000</hsprc>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>2304</totalCount>
  </body>
</response>
```


### 9.9.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getSrHsprcInfo |
| Request DTO 후보 | SrHsprcInfoRequest |
| Response DTO 후보 | SrHsprcInfoResponse |
| Item DTO 후보 | SrHsprcInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.9.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `공시가격·보증금 위험도 참고`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


---

## 9.10. 폐쇄말소대장 지역지구구역 조회

### 9.10.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| Operation | getSrJijiguInfo |
| Method | GET |
| Path | /getSrJijiguInfo |
| Full URL | http://apis.data.go.kr/1613000/ShtRgstHubService/getSrJijiguInfo |
| 설명 | 전국 자치단체의 건축행정정보시스템(세움터)를 통해 생성된 폐쇄말소 대장과 관련된 지역/지구/구역의 구분 및 명칭, 대표여부 등의 정보를 제공한다. |
| 평균 응답시간 | [ 500 ms] |
| TPS 제한 | [ 30 tps] |
| ZIP:ON 활용 위치 | 용도지역·지구·구역 확인 및 목적별 체크리스트 |
| 원문 위치 | page 71, 72, 73 |

### 9.10.2 요청 파라미터

| 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | ZIP:ON 매핑 |
| --- | --- | --- | --- | --- | --- | --- |
| sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코드 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| bun | 번 | VARCHAR(20) | N | 0012 | 번 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| ji | 지 | VARCHAR(20) | N | 0004 | 지 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| startDate | 검색시작일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| endDate | 검색종료일 | VARCHAR(30) | N | YYYYMMDD |  | 주소 파싱 결과/사용자 입력/공통 페이징 |
| numOfRows | 리스트수 | VARCHAR(3) | N | 10 | 페이지당 목록 수 | 주소 파싱 결과/사용자 입력/공통 페이징 |
| pageNo | 페이지번호 | VARCHAR(3) | N | 1 | 페이지번호 | 주소 파싱 결과/사용자 입력/공통 페이징 |

### 9.10.3 요청 예시

```http
GET http://apis.data.go.kr/1613000/ShtRgstHubService/getSrJijiguInfo?sigunguCd=11680&bjdongCd=10300&bun=0012&ji=0004&serviceKey={SERVICE_KEY}
```

### 9.10.4 응답 필드

| 경로 | 필드명 | 국문명 | 타입/크기 | 필수 | 샘플 | 설명 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| response.Items | Items | 1..n |  | 확인 필요 |  |  |  |
| response.body.items.item.rnum | rnum | 순번 | NUMBER(8) | N | 1 | 순번 |  |
| response.body.items.item.platPlc | platPlc | 대지위치 | VARCHAR(1000) | Y | 서울특별시 강남구 개포동 12-4번지 | 대지위치 |  |
| response.body.items.item.sigunguCd | sigunguCd | 시군구코드 | VARCHAR(30) | Y | 11680 | 행정표준코 드 |  |
| response.body.items.item.bjdongCd | bjdongCd | 법정동코드 | VARCHAR(30) | Y | 10300 | 행정표준코 드 |  |
| response.body.items.item.platGbCd | platGbCd | 대지구분코드 | VARCHAR(30) | N | 0 | 0:대지 1:산 2:블록 |  |
| response.body.items.item.bun | bun | 번 | VARCHAR(20) | N | 0012 | 번 |  |
| response.body.items.item.ji | ji | 지 | VARCHAR(20) | N | 0004 | 지 |  |
| response.body.items.item.mgmShtregPk | mgmShtregPk | 관리폐쇄말소 대장PK | VARCHAR(30) | Y | 102403216 | 관리폐쇄말 소대장PK |  |
| response.body.items.item.splotNm | splotNm | 특수지명 | VARCHAR(1000) | N | 특수지명 |  |  |
| response.body.items.item.block | block | 블록 | VARCHAR(500) | N | 블록 |  |  |
| response.body.items.item.lot | lot | 로트 | VARCHAR(500) | N | 로트 |  |  |
| response.body.items.item.jijiguGbCd | jijiguGbCd | 지역지구구역 구분코드 | VARCHAR(30) | N | 3 | 지역지구구 역구분코드 |  |
| response.body.items.item.jijiguGbCdNm | jijiguGbCdNm | 지역지구구역 구분코드명 | VARCHAR(1000) | N | 용도구역코드 | 지역지구구 역구분코드 명 |  |
| response.body.items.item.jijiguCd | jijiguCd | 지역지구구역 코드 | VARCHAR(30) | N | 300 | 지역지구구 역코드 |  |
| response.body.items.item.jijiguCdNm | jijiguCdNm | 지역지구구역 코드명 | VARCHAR(1000) | N | 지구단위계획구역 | 지역지구구 역코드명 |  |
| response.body.items.item.reprYn | reprYn | 대표여부 | VARCHAR(1) | N | 1 | 0: 일반 1: 대표 |  |
| response.body.items.item.etcJijigu | etcJijigu | 기타지역지구구역 | VARCHAR(1000) | N | 지구단위계획구역 | 기타지역지 구구역 |  |
| response.body.items.item.crtnDay | crtnDay | 생성일자 | VARCHAR(30) | Y | 20220813 | 생성일자 |  |

### 9.10.5 응답 예시

```xml
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>NORMAL SERVICE</resultMsg>
  </header>
  <body>
    <items>
      <item>

<rnum>1</rnum>

<platPlc>서울특별시 강남구 개포동 12-4번지</platPlc>

<sigunguCd>11680</sigunguCd>

<bjdongCd>10300</bjdongCd>

<platGbCd>0</platGbCd>

<bun>0012</bun>

<ji>0004</ji>

<mgmShtregPk>102403216</mgmShtregPk>

<splotNm> </splotNm>

<block> </block>

<lot> </lot>

<jijiguGbCd>3</jijiguGbCd>

<jijiguGbCdNm>용도구역코드</jijiguGbCdNm>

<jijiguCd>300</jijiguCd>

<jijiguCdNm>지구단위계획구역</jijiguCdNm>

<reprYn>1</reprYn>

<etcJijigu>지구단위계획구역</etcJijigu>

<crtnDay>20220813</crtnDay>
      </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>3</totalCount>

2024년 건축서비스산업 정보체계 유지관리 사업






  </body>
</response>
```


### 9.10.6 구현 메모

| 항목 | 제안 |
| --- | --- |
| Client 메서드명 | getSrJijiguInfo |
| Request DTO 후보 | SrJijiguInfoRequest |
| Response DTO 후보 | SrJijiguInfoResponse |
| Item DTO 후보 | SrJijiguInfoItem |
| DB 저장 필요 여부 | 저장/긴 TTL 캐시 |
| Redis 캐시 필요 여부 | 동일 주소 반복 조회 단기 캐시 |
| 실패 시 처리 | HTTP 오류/타임아웃/resultCode != 00 구분. resultCode와 resultMsg, 요청 URL, 파라미터를 로그 저장. |
| 테스트 케이스 | 필수 파라미터 누락, 정상 응답, totalCount=0, item 단건/배열, resultCode 오류, serviceKey 인코딩, bun/ji 앞자리 0 보존 |

### 9.10.7 ZIP:ON 해석 로직 후보

- 원천 필드를 그대로 노출하지 말고 사용자 목적에 맞는 위험/확인 문장으로 변환한다.

- 이 오퍼레이션은 `용도지역·지구·구역 확인 및 목적별 체크리스트`에 우선 매핑한다.

- `sigunguCd`, `bjdongCd`, `bun`, `ji`는 주소 파싱 결과와 일치하는지 검증한다.

- 숫자처럼 보여도 코드/번지/PK는 문자열로 처리한다. 특히 `bun`, `ji`, `sigunguCd`, `bjdongCd`는 앞자리 0 보존이 필요하다.

- 위험도 계산에 직접 쓰는 값과 체크리스트 생성에만 쓰는 값을 분리한다.


## 10. 코드표 / Enum / 분류값

| 분류 | 코드 | 의미 | ZIP:ON 처리 |
| --- | --- | --- | --- |
| platGbCd | 0 | 대지 | 대지 기준 조회 |
| platGbCd | 1 | 산 | 산번지/임야 가능성 안내 |
| platGbCd | 2 | 블록 | 블록 지번. 주소 파싱 결과 검증 필요 |
| resultCode | 00 | NORMAL SERVICE | 성공 처리 |

## 11. 에러 코드

| 코드 | 메시지 | 의미 | 백엔드 처리 방안 | 사용자 노출 메시지 |
| --- | --- | --- | --- | --- |
| 00 | NORMAL SERVICE | 정상 | 성공 처리 |  |
| 01 | APPLICATION_ERROR | 어플리케이션 에러 | 일시 장애 또는 제공기관 오류로 기록하고 재시도 가능 여부 판단 | 잠시 후 다시 시도해주세요. |
| 02 | DB_ERROR | 데이터베이스 에러 | 제공기관 DB 오류. 재시도 후 지속 시 관리자 확인 | 공공데이터 제공기관 응답이 불안정합니다. |
| 04 | HTTP_ERROR | HTTP 에러 | HTTP 상태코드와 본문을 함께 로깅 | 공공데이터 호출 중 오류가 발생했습니다. |
| 05 | SERVICETIMEOUT_ERROR | 서비스 연결 실패 에러 | 타임아웃 처리, 회로차단/재시도 정책 적용 | 공공데이터 응답이 지연되고 있습니다. |
| 10 | INVALID_REQUEST_PARAMETER_ERROR | 잘못된 요청 파라미터 에러 | 사용자 입력 또는 주소 파싱 결과 검증 | 입력한 주소 정보를 다시 확인해주세요. |
| 11 | NO_MANDATORY_REQUEST_PARAMETERS_ERROR | 필수 요청 파라미터 없음 | 백엔드 요청 DTO 검증 실패로 처리 | 필수 조회 조건이 부족합니다. |
| 12 | NO_OPENAPI_SERVICE_ERROR | 해당 OpenAPI 서비스가 없거나 폐기됨 | 엔드포인트/서비스명 변경 여부 확인 | 현재 해당 공공데이터 서비스를 사용할 수 없습니다. |
| 20 | SERVICE_ACCESS_DENIED_ERROR | 서비스 접근거부 | 서비스키 권한/활용신청 상태 점검 | 공공데이터 인증 설정 확인이 필요합니다. |
| 21 | TEMPORARILY_DISABLE_THE_SERVICEKEY_ERROR | 일시적으로 사용할 수 없는 서비스키 | 키 상태 확인, 다른 키 전환 가능성 검토 | 공공데이터 인증키가 일시적으로 사용할 수 없습니다. |
| 22 | LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR | 서비스 요청 제한 횟수 초과 | 쿼터 초과. 캐시/백오프/운영 알림 | 공공데이터 일일 요청 한도를 초과했습니다. |
| 30 | SERVICE_KEY_IS_NOT_REGISTERED_ERROR | 등록되지 않은 서비스키 | 환경변수/URL 인코딩/활용신청 확인 | 공공데이터 인증키 설정 확인이 필요합니다. |
| 31 | DEADLINE_HAS_EXPIRED_ERROR | 기한 만료된 서비스키 | 서비스키 재발급 또는 활용기간 연장 | 공공데이터 인증키가 만료되었습니다. |
| 99 | UNKNOWN_ERROR | 기타 에러 | 원문 응답 전문 저장 후 관리자 확인 | 공공데이터 조회 중 알 수 없는 오류가 발생했습니다. |

## 12. 데이터 저장/캐시 전략

| 데이터 | 추천 처리 | 이유 |
| --- | --- | --- |
| 원천 응답 전문 | 선택 저장 | 재현성·디버깅·감사 목적이 있을 때만 저장. 저장 시 요청 파라미터와 resultCode 포함. |
| 주요 응답 필드 | DB 저장 또는 긴 TTL 캐시 | 건축물/인허가/폐쇄말소 정보는 자주 변하지 않으므로 반복 조회 비용을 줄일 수 있음. |
| 주소별 조회 결과 | Redis 단기 캐시 | 사용자가 같은 매물을 반복 진단할 가능성이 높음. |
| 코드표 | DB 또는 enum 상수 | platGbCd, resultCode, 점검기관구분 등은 코드 해석에 반복 사용. |
| 에러 응답 | 로그 저장 | 운영 추적, 키 만료, 파라미터 오류, 제공기관 장애 구분. |
| 조회 결과 없음 | 짧은 TTL 캐시 | 없는 주소/조건 반복 호출 방지. 단, 데이터 갱신 가능성을 고려해 짧게 유지. |

## 13. 구현 시 주의사항

- URL 파라미터에 한글이 포함될 수 있으면 UTF-8 URL 인코딩한다.

- `serviceKey`는 인코딩된 키/디코딩된 키 처리 방식이 공공데이터포털에서 혼동되기 쉬우므로 실제 호출 테스트를 분리한다.

- `bun`, `ji`, `sigunguCd`, `bjdongCd`, PK류는 숫자가 아니라 문자열로 처리한다.

- `items.item`은 XML/JSON 변환 시 단건 객체 또는 배열로 달라질 수 있으므로 커스텀 deserializer 또는 리스트 정규화 로직을 둔다.

- 원문 표의 `필/옵`, `1/0`, `1..n/0..n` 표기가 문서별로 다르므로 내부 DTO에서는 `required`를 명시적으로 통일한다.

- 일부 문서의 서비스 개요는 REST (GET, POST, PUT, DELETE)로 표기되지만 상세 요청 예시는 GET이다. 구현은 GET 기준으로 시작하고 필요 시 원문/포털 확인.

- `_type=json`은 일부 예시에 등장하지만 요청 필드 표에 없는 경우가 많다. JSON 사용 전 실제 응답 구조를 테스트해야 한다.

- 공공데이터 장애, 타임아웃, 일일 트래픽 제한, 키 만료를 구분해 사용자 메시지와 운영 알림을 분리한다.


## 14. API 조합 가능성

| 조합 대상 API | 조합 목적 | 기대 결과 | 주의사항 |
| --- | --- | --- | --- |
| 주소 API/법정동코드 API | 도로명·지번 정규화 후 sigunguCd/bjdongCd/bun/ji 생성 | 정확한 건축HUB 조회 조건 확보 | 주소 후보가 여러 개면 사용자 선택 필요 |
| GIS건물통합정보 | 좌표/건물 존재 확인과 건축물대장 속성 대조 | 건물 단위 식별 정확도 향상 | 건물군/동/호 매칭 모호성 처리 필요 |
| 실거래가 API 묶음 | 유형별 매매/전월세 실거래 비교 | 전세가율·월세 적정성·매매 가격 위험도 산정 | 유형 판별 후 API 선택 필요 |
| 공동주택가격/개별주택가격/공시지가 API | 공시가격 기반 보증금·가격 리스크 참고 | 보증보험/가격 위험도 설명 보조 | 공시가격은 현재 시세가 아님 |
| 등기부등본 업로드/OCR | 소유자·근저당·신탁·압류 등 권리관계 확인 | 계약 전 핵심 위험 보강 | 공공데이터 API만으로 확정 불가 |
| 중개업소/사업자/인허가 데이터 | 계약 상대방·중개사·영업 가능성 보조 확인 | 체크리스트 고도화 | 개별 계약의 법적 판단으로 단정 금지 |
