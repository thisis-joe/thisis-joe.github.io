---
title: 09-service-layer
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-26T05:00:07+09:00
purpose: learning
status: active
code_sync_required: false
related_area: spring, service-layer, transaction
read_when: 
do_not_use_as: 
  - Service 계층의 책임과 Controller/Mapper와의 경계를 학습할 때
  - 현재 서비스 구현 완료 목록
  - 테스트 기준
---

# Service Layer

## 한 줄 정의

Service Layer는 Controller와 MyBatis Mapper 사이에서 비즈니스 규칙과 처리 순서를 담당하는 계층이다.

## 왜 필요한가

Controller는 HTTP 요청을 이해한다. Mapper는 SQL과 DB를 이해한다. 둘 사이에는 서비스 규칙이 필요하다.

예를 들어 전세·월세 위험진단은 단순히 DB에서 하나 찾는 것으로 끝나지 않는다.

```text
주소와 보증금 입력값 검증
법정동코드 조회
물건 유형 판별
실거래가/공시가격 비교
등기부등본 확인 필요성 분리
위험 문장과 체크리스트 응답 DTO 조립
```

이 흐름을 Controller에 넣으면 Controller가 너무 뚱뚱해진다.

## 좋은 Service method의 흐름

```text
1. 입력값을 확인한다.
2. 필요한 데이터를 Mapper 또는 외부 API adapter에서 조회한다.
3. 비즈니스 규칙을 적용한다.
4. 필요한 경우 저장하거나 수정한다.
5. domain object를 Response DTO로 변환한다.
6. 결과를 반환한다.
```

## ZIP:ON 예시

```text
AuthService.login()
RegionService.getRegionList()
FavoriteService.createFavorite()
CommunityService.createPost()
```

각 method 이름은 구현 세부보다 use case 책임을 드러내야 한다. 그래야 기능이 커져도 Controller, Service, Mapper 중 어디를 봐야 하는지 빠르게 판단할 수 있다.

## Service에 넣을 것과 넣지 않을 것

넣을 것:

```text
업무 규칙
조회 순서
예외 기준
트랜잭션 경계
DTO 변환 흐름
외부 API 호출 조합
```

넣지 않을 것:

```text
HTTP annotation
HTML/CSS/Vue 상태
SQL 문자열 남발
화면 전용 문구 조합
```

## 실습 미션

```text
1. PropertyService.getPropertyDetail()에 들어갈 처리 순서를 주석으로 5줄 적는다.
2. 전세 위험진단 Service가 자동 확정하면 안 되는 영역을 주석으로 분리한다.
3. FavoriteService.createFavorite()에서 중복 저장을 막아야 하는지 생각한다.
```

## 공식 출처

- [Spring Framework - The IoC Container](https://docs.spring.io/spring-framework/reference/core/beans.html)
- [Spring Framework - Using @Transactional](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)
