---
title: 01-layered-architecture-and-mvc
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-29T05:00:06+09:00
purpose: learning
status: active
code_sync_required: false
related_area: architecture, mvc, layered-architecture
read_when: 
do_not_use_as: 
  - Controller, Service, Mapper, Domain, DTO 책임을 처음 학습할 때
  - 현재 구현 명세
  - 테스트 기준
---

# Layered Architecture와 MVC

## 한 줄 정의

Layered Architecture는 책임별로 코드를 계층으로 나누는 방식이고, MVC는 화면 또는 요청 처리를 Model, View, Controller 역할로 나누어 이해하는 패턴이다.

## ZIP:ON의 백엔드 계층

```text
Controller:
HTTP 요청과 응답

Service:
비즈니스 규칙과 처리 순서

Mapper:
MyBatis SQL 기반 DB 접근

Domain:
DB 조회 결과와 도메인 값을 담는 plain Java object

DTO:
API 경계 데이터
```

## 왜 나누는가

```text
역할이 분명해진다.
팀원이 동시에 작업하기 쉽다.
테스트 단위가 작아진다.
변경 영향 범위가 줄어든다.
새 API를 어디에 추가할지 판단하기 쉽다.
```

## 나쁜 신호

```text
Controller에서 Mapper를 직접 호출한다.
Controller method가 길어진다.
Service가 HTTP annotation을 안다.
Mapper가 Response DTO를 만든다.
domain object를 그대로 API로 반환한다.
```

## ZIP:ON 적용 예시

```text
POST /api/auth/signup
-> AuthController
-> AuthService
-> UserMapper
-> User domain object
-> AuthTokenResponse
```

## 실습 미션

```text
1. 현재 ZIP:ON의 각 Controller가 어떤 Service를 주입받는지 표로 만든다.
2. domain object와 DTO가 섞이면 어떤 문제가 생길지 예시를 든다.
3. 전세 위험진단 로직은 Controller에 둘지 Service에 둘지 설명한다.
```

## 공식 출처

- [Spring Boot - Structuring Your Code](https://docs.spring.io/spring-boot/reference/using/structuring-your-code.html)
- [Spring Framework - Spring Web MVC](https://docs.spring.io/spring-framework/reference/web/webmvc.html)
