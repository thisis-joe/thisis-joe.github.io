---
title: 02-zipon-domain-learning-map
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
---

# ZIP:ON Domain Learning Map

## 한 줄 정의

Domain Learning Map은 ZIP:ON의 기능이 어떤 핵심 개념으로 나뉘고 서로 어떻게 연결되는지 학습하기 위한 지도다.

## 주요 도메인

```text
Search:
지역·유형 입력 해석, 정확 주소 후보 분기, 분석 keyword 복원

User Purpose:
전세, 월세, 매매, 창업, 개발 목적

Region:
법정동코드, 지역 기준 데이터, 지역·유형 분석의 입력 힌트

Property Identification:
주소 정제, 물건 정체 판별, 다가구/다세대/오피스텔 구분

Transaction:
공공 실거래 fact, 거래량, 가격 흐름, 유사 거래 근거

Risk Diagnosis:
보증금 위험도, 가격 비교, 건축물 위험 문장

Checklist:
등기부등본, 선순위 임차인, 현장 방문 확인사항

Environment:
학교, 교통, 편의시설, 공원. 현재 MVP에서는 후순위 빈 응답/정적 안내 경계에 가깝다.

Favorite:
관심 지역, 관심 검토 대상, 저장한 분석/진단 맥락

Community:
후기, 게시글, 신고

User:
회원, 마이페이지, 개인화

Admin:
신고 처리, 숨김, 관리
```

## 도메인을 나누는 기준

```text
사용자 행동이 다른가?
저장되는 데이터가 다른가?
API 변화 주기가 다른가?
담당 팀원이 나뉠 수 있는가?
나중에 독립적으로 커질 가능성이 있는가?
```

## 도메인이 섞이는 예

전세·월세 위험진단 결과 화면은 여러 도메인을 함께 보여준다.

```text
User Purpose:
전세 거주 목적

Property Identification:
다가구/다세대/오피스텔 판별

Transaction:
전월세·매매 실거래 비교

Environment:
생활 인프라 참고

Checklist:
등기부등본과 선순위 임차인 확인 필요성
```

화면은 합쳐서 보여줄 수 있지만, 백엔드 책임까지 무조건 한 곳에 몰아넣을 필요는 없다.

현재 코드 기준으로는 `Region`처럼 Flyway table과 MyBatis mapper에 연결된 domain object도 있고, `EnvironmentInfo`처럼 아직 전용 table/mapper가 없는 후보 object도 있다.
domain 이름이 있다고 해서 곧바로 저장 모델이 완성됐다고 보면 안 된다.
항상 `db/migration`, `mapper`, `service`, `dto`를 함께 확인한다.

## 실습 미션

```text
1. 전세 위험진단 결과 화면에 필요한 도메인을 모두 적는다.
2. Property Identification과 Risk Diagnosis를 같은 Service에 둘지 분리할지 고민한다.
3. 등기부등본 업로드 분석은 Risk Diagnosis인지 Document Upload Analysis인지 논의한다.
```

## 공식 출처

- [Spring Boot - Structuring Your Code](https://docs.spring.io/spring-boot/reference/using/structuring-your-code.html)
