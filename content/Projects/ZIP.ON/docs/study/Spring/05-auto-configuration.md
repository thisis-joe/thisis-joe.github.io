---
title: 05-auto-configuration
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-30T05:00:06+09:00
---

# Auto-configuration

## 한 줄 정의

Auto-configuration은 현재 classpath, Bean 존재 여부, 설정값을 보고 Spring Boot가 필요한 설정을 자동으로 적용하는 기능이다.

## 왜 필요한가

Spring Boot 없이 웹 서버, JSON 변환, 데이터베이스 연결, MyBatis integration을 직접 설정하려면 많은 설정 코드가 필요하다.

Spring Boot는 starter 의존성과 현재 환경을 보고 기본 설정을 제공한다.

예:

```text
spring-boot-starter-web
-> 내장 웹 서버
-> Spring MVC
-> JSON 변환

mybatis-spring-boot-starter
-> SqlSessionFactory
-> Mapper scanning/integration
-> MyBatis configuration
```

## 자동 설정은 마법인가

마법처럼 보이지만 기준이 있다.

```text
특정 클래스가 classpath에 있는가?
이미 사용자가 만든 Bean이 있는가?
application.yml에 어떤 값이 있는가?
조건이 맞는가?
```

그래서 자동 설정을 이해하려면 "무엇이 들어오면 무엇이 켜지는가"를 보는 습관이 필요하다.

## ZIP:ON에서 연결되는 곳

```text
pom.xml:
starter 의존성을 선언한다.

application.yml:
자동 설정이 참고하는 설정값을 둔다.

ZipOnApplication:
@SpringBootApplication을 통해 자동 설정을 활성화한다.
```

## 자주 헷갈리는 표현

```text
Auto-configuration:
조건에 맞으면 Spring Boot가 설정을 제공한다.

Component Scan:
내 프로젝트의 Component, Service, Controller 등을 찾아 Bean으로 등록한다.

Configuration:
개발자가 직접 Bean이나 설정을 선언하는 Java class다.
```

## 실습 미션

```text
1. pom.xml에서 starter 이름을 모두 적어본다.
2. application.yml의 datasource 설정이 MyBatis Mapper 실행과 어떻게 연결될지 설명해본다.
3. MySQL Connector/J, Flyway, MyBatis starter가 classpath에 있을 때 어떤 Bean과 설정이 자동으로 연결되는지 추적해본다.
4. H2 dependency가 남아 있어도 현재 기본/local profile이 H2 datasource를 쓰지 않는 이유를 `application.yml`과 `application-local.yml`에서 확인한다.
```

## 공식 출처

- [Spring Boot - Auto-configuration](https://docs.spring.io/spring-boot/reference/using/auto-configuration.html)
- [Spring Boot - Build Systems](https://docs.spring.io/spring-boot/reference/using/build-systems.html)
