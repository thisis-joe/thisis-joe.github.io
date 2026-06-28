---
title: 02-project-structure-and-package
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-29T05:00:06+09:00
---

# 프로젝트 구조와 Package

## 한 줄 정의

Spring Boot 프로젝트 구조는 Spring이 어떤 클래스를 찾아 Bean으로 등록할지 결정하는 기준과 직접 연결된다.

## 왜 main class 위치가 중요한가

Spring Boot는 `@SpringBootApplication`이 붙은 main class를 기준으로 하위 package를 탐색한다. 그래서 main class는 보통 가장 위쪽 root package에 둔다.

ZIP:ON에서는 아래 구조가 자연스럽다.

```text
com.zipon
├── ZipOnApplication
├── audit
├── common
├── config
├── controller
├── domain
├── dto
├── exception
├── external
├── mapper
├── risk
├── security
├── service
└── web
```

핵심 학습 순서는 여전히 단순하다.

```text
controller -> service -> mapper/external -> domain/dto
config/security/web/audit는 공통 인프라 경계로 나중에 읽는다.
```

현재 `external`은 API별 하위 패키지로 나뉜다.

```text
external/
├── boundary
├── buildingregister
├── geocoder
├── juso
├── kabrone
├── legaldong
├── publicprice
└── transaction
```

## default package를 피하는 이유

package 선언이 없는 default package는 Spring Boot에서 권장되지 않는다. 컴포넌트 스캔 범위가 과하게 넓어질 수 있고, 애플리케이션 구조를 읽기 어렵게 만든다.

## 계층형 구조와 도메인형 구조

ZIP:ON은 학습과 유지보수를 위해 계층형 구조를 사용한다.

```text
controller/
service/
mapper/
domain/
dto/
external/
config/
security/
```

서비스가 훨씬 커지면 도메인 중심 구조도 고려할 수 있다.

```text
property/
├── PropertyController
├── PropertyService
├── PropertyMapper
└── Property
```

초기에는 계층형 구조가 MVC를 배우기에 더 쉽다. 나중에 도메인별 응집도가 중요해지면 구조를 전환할 수 있다.

## ZIP:ON 학습 포인트

```text
controller:
HTTP 요청의 입구

service:
업무 규칙과 처리 순서

mapper:
MyBatis SQL 기반 DB 접근

domain:
DB 조회 결과와 도메인 값을 담는 plain Java object

dto:
API 요청/응답 전용 객체

external:
data.go.kr, VWorld, Juso, R-ONE 같은 외부 API client와 parser

security:
JWT, 인증 filter, principal, 401/403 처리

audit/web:
운영 감사와 request correlation 같은 횡단 관심사
```

## 실습 미션

```text
1. HealthController가 왜 com.zipon.controller 아래에 있어야 하는지 설명한다.
2. UserMapper가 service가 아니라 mapper에 있는 이유를 설명한다.
3. DTO를 domain에 넣지 않는 이유를 설명한다.
```

## 공식 출처

- [Spring Boot - Structuring Your Code](https://docs.spring.io/spring-boot/reference/using/structuring-your-code.html)
