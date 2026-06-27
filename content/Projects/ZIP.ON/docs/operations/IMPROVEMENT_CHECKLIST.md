---
title: IMPROVEMENT_CHECKLIST
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
purpose: engineering-checklist
status: active
code_sync_required: false
related_area: process, backend, frontend, review
read_when: 
do_not_use_as: 
  - 기능 구현 전후의 기본 점검 순서가 필요할 때
  - 초보자 학습용으로 Controller, Service, Mapper, DTO 책임을 빠르게 복습할 때
  - 현재 구현 명세
  - 테스트 통과 기준
---

# ZIP:ON 개선 체크리스트

기능을 하나 구현할 때마다 이 문서를 따라가면 됩니다.

## 1. 시작 전

```text
이 기능의 사용자 행동은 무엇인가?
어떤 화면에서 시작하는가?
어떤 API가 필요한가?
요청 값은 무엇인가?
응답 값은 무엇인가?
실패할 수 있는 경우는 무엇인가?
```

## 2. 백엔드 체크

Controller:

```text
API 주소가 REST스럽게 읽히는가?
메서드명이 목적을 잘 드러내는가?
요청 DTO를 쓰는가?
Service로 위임하는가?
domain object를 직접 반환하지 않는가?
```

Service:

```text
입력값 검증이 있는가?
없는 데이터를 조회했을 때 예외 처리가 있는가?
비즈니스 규칙이 Controller가 아니라 Service에 있는가?
domain object를 Response DTO로 변환하는가?
메서드가 너무 길어지지 않았는가?
```

MyBatis Mapper:

```text
필요한 조회 메서드만 추가했는가?
메서드 이름이 지나치게 길지 않은가?
조건이 복잡하면 MyBatis 동적 SQL 또는 명시적인 쿼리 분리를 검토했는가?
```

Domain object/DTO:

```text
domain object와 DTO 역할이 섞이지 않았는가?
요청 DTO에 검증 규칙이 필요한가?
응답 DTO가 화면에 필요한 값만 담는가?
Enum은 문자열로 저장되는가?
날짜/금액 단위가 명확한가?
```

## 3. 프론트엔드 체크

View:

```text
화면 단위 책임만 가지고 있는가?
API 호출 위치가 적절한가?
라우트 파라미터와 query를 잘 읽는가?
```

Component:

```text
props 이름이 명확한가?
부모에게 알려야 하는 값은 emit으로 올리는가?
재사용 가능한 단위로 나뉘었는가?
컴포넌트가 API 주소를 직접 알지 않는가?
```

API module:

```text
함수명이 백엔드 기능명과 맞는가?
params/payload 이름이 DTO와 맞는가?
공통 baseURL을 사용하고 있는가?
에러 처리 기준이 있는가?
```

UI 상태:

```text
로딩 상태가 있는가?
빈 목록 상태가 있는가?
에러 상태가 있는가?
버튼 중복 클릭을 막는가?
모바일에서 글자가 깨지지 않는가?
```

## 4. 개선 신호

아래 신호가 보이면 리팩터링 후보입니다.

```text
같은 코드가 3번 이상 반복된다.
메서드 이름이 역할보다 구현 방식을 말한다.
Controller가 Mapper를 직접 호출한다.
DTO 없이 Map<String, Object>가 계속 늘어난다.
컴포넌트 하나가 너무 많은 UI를 가진다.
API 에러 처리가 컴포넌트마다 반복된다.
조건문이 깊게 중첩된다.
주석과 실제 코드가 다르다.
```

## 5. 개선 순서

```text
1. 이름부터 고친다.
2. 긴 메서드를 작은 단계로 나눈다.
3. 중복 DTO나 중복 UI를 찾는다.
4. 공통 응답/공통 에러 처리를 정리한다.
5. 테스트 또는 수동 확인 절차를 추가한다.
6. 마지막에 스타일과 주석을 정리한다.
```

## 6. PR 또는 팀 공유 전

```text
빌드가 통과하는가?
백엔드 테스트가 통과하는가?
주요 API를 curl로 확인했는가?
브라우저에서 주요 화면을 확인했는가?
README 또는 주석이 실제 코드와 맞는가?
다음 사람이 어디를 채우면 되는지 보이는가?
```
