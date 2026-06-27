---
title: 03-how-to-add-feature
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
purpose: learning
status: active
code_sync_required: false
related_area: architecture, spring-mvc, vue, api-design
read_when: 
do_not_use_as: 
  - 새 기능을 어떤 순서로 생각할지 학습할 때
  - Controller, Service, DTO, Mapper, 화면 연결 흐름을 처음 연습할 때
  - 현재 위험진단 구현 명세
  - 새 DB schema 기준
  - 테스트 통과 기준
---

# 새 기능 추가 방법

## 목적

새 API와 화면이 많아져도 ZIP:ON 구조가 흐트러지지 않도록 기능 추가 사고 순서를 학습한다.

이 문서는 학습용이다. 현재 구현과 반드시 100% 일치해야 하는 구현 명세는 [문서 지도](/docs/_index.md)에서 `code_sync_required: true` 문서를 골라 확인한다.

현재 위험진단 핵심 구현을 볼 때는 먼저 `RentRiskDiagnosisController`, `RentRiskDiagnosisService`, `RentRiskDiagnosisHistoryService`, `RentRiskDiagnosisHistoryMapper`, `RegionalIndicatorAnalysisController`, `RegionalIndicatorAnalysisService`를 읽는다.

## 기능 추가 순서

```text
1. 사용자 행동을 한 문장으로 쓴다.
2. ZIP:ON 제품 경계와 충돌하지 않는지 확인한다.
3. 정확 주소 위험진단, 지역·유형 과거 지표 분석, 커뮤니티, 관리자, 운영 중 어느 영역인지 분류한다.
4. docs/_index.md와 docs/_doc-routing.md에서 관련 구현 문서를 고른다.
5. 화면 위치와 사용자 진입점을 정한다.
6. URL과 View가 필요한지 판단한다.
7. 프론트 API 함수 이름을 정한다.
8. 백엔드 API 주소와 HTTP method를 정한다.
9. Request DTO와 Response DTO를 정한다.
10. Controller method를 만든다.
11. Service method에서 use case 순서를 드러낸다.
12. MyBatis Mapper, external client, cache, scheduler 중 필요한 data access 경계를 정한다.
13. Flyway migration과 domain object 변경이 필요한지 판단한다.
14. 빈 상태, 로딩, 에러 UI를 정한다.
15. 관련 구현 문서만 업데이트한다.
16. 테스트 방법을 정한다.
```

## 예시: 정확 주소 전세·월세 위험진단 확장

```text
사용자 행동:
사용자가 보고 있는 원룸 전세가 계약 전 확인할 위험 신호를 진단한다.

화면:
홈 분석/진단 입력 폼에서 주소/보증금/월세/관리비/계약 목적을 입력하고,
진단 결과 화면에서 위험 요약, 근거, 데이터 한계, 체크리스트, 다음 행동을 보여준다.

프론트 API:
createRentRiskDiagnosis()

백엔드 API:
POST /api/rent-risk-diagnoses

Request DTO:
RentRiskDiagnosisRequest

Controller:
RentRiskDiagnosisController.createDiagnosis()

Service:
RentRiskDiagnosisService.diagnose()

Mapper:
현재 진단 이력은 RentRiskDiagnosisHistoryService가 RentRiskDiagnosisHistoryMapper로 저장한다.
실거래가, 공시가격, 건축물대장, R-ONE 같은 공공데이터는 기능 목적에 맞는 기존 mapper/service/external client를 먼저 찾는다.

Domain object:
응답은 RentRiskDiagnosisResponse로 반환한다.
저장 이력은 RentRiskDiagnosisHistory domain object와 rent_risk_diagnosis_histories table snapshot을 사용한다.
새 domain object는 계산 과정의 책임이 분명할 때만 추가한다.

예외:
주소 정제 실패
물건 유형 판별 실패
보증금 입력 오류
로그인 필요
자동 확정할 수 없는 권리관계
```

## 예시: 지역·유형 과거 지표 분석 확장

```text
사용자 행동:
사용자가 "강남 원룸", "서울대입구역 근처 오피스텔" 같은 지역·유형 입력으로 현재 매물이 아니라 과거 지표를 보고 싶어 한다.

백엔드 API:
POST /api/regional-indicator-analyses

Controller:
RegionalIndicatorAnalysisController.createAnalysis()

Service:
RegionalIndicatorAnalysisService.analyze()

Mapper:
RegionalIndicatorAnalysisMapper와 MarketIndicatorContextService를 먼저 확인한다.

주의:
현재 매물 feed, 현재 호가, broker inventory로 확장하지 않는다.
정확 주소가 필요한 공시가격·권리관계 판단은 정확 주소 위험진단으로 연결한다.
```

## 기능 추가 체크리스트

```text
이름이 축약되지 않았는가?
제품 경계상 현재 매물 기능으로 흐르지 않는가?
docs/_index.md에서 관련 구현 문서를 찾았는가?
Controller가 얇은가?
Service에 처리 순서가 보이는가?
domain object를 그대로 반환하지 않는가?
DTO 이름이 요청/응답 목적을 드러내는가?
프론트 API 함수와 백엔드 method 이름이 비슷한가?
에러 상황을 적었는가?
관련 code_sync_required 문서를 업데이트했는가?
```

## 실습 미션

```text
1. "전세 위험진단 결과 저장"이 이미 어떤 class와 table로 구현되어 있는지 찾아 설명한다.
2. "등기부등본 수동 확인 상태 저장" 기능이 파일 업로드/OCR과 어떻게 분리되어 있는지 설명한다.
3. "상가 월세" 입력을 현재 매물 검색이 아니라 지역·유형 과거 지표 분석으로 라우팅하는 흐름을 설계한다.
4. "커뮤니티 신고" 기능은 Community use case와 Admin moderation 중 어디까지 나뉘어야 하는지 논의한다.
```

## 공식 출처

- [Spring Boot - Structuring Your Code](https://docs.spring.io/spring-boot/reference/using/structuring-your-code.html)
- [Vue - Components Basics](https://vuejs.org/guide/essentials/component-basics.html)
- [MDN - HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods)
