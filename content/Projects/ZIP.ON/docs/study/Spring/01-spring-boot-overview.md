---
title: 01-spring-boot-overview
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-29T05:00:06+09:00
purpose: learning
status: active
code_sync_required: false
related_area: spring, spring-boot
read_when: 
do_not_use_as: 
  - Spring Boot의 역할과 ZIP:ON backend 시작점을 처음 학습할 때
  - 현재 dependency version 명세
  - 운영 설정 기준
---

# Spring Boot 개요

## 한 줄 정의

Spring Boot는 Spring 기반 애플리케이션을 빠르게 만들고 실행할 수 있도록 설정, 의존성, 내장 서버, 운영 기능을 제공하는 Spring 프로젝트다.

## 왜 필요한가

Spring Framework만으로도 웹 애플리케이션을 만들 수 있다. 하지만 실제 프로젝트에는 다음 설정이 필요하다.

```text
웹 서버 설정
JSON 변환 설정
DB 연결 설정
트랜잭션 설정
로깅 설정
테스트 설정
운영 모니터링 설정
```

Spring Boot는 이런 반복 설정을 자동화하고, 표준적인 시작점을 제공한다.

## Spring과 Spring Boot의 관계

```text
Spring Framework:
IoC, DI, MVC, Transaction, Data Access 같은 핵심 기능을 제공한다.

Spring Boot:
Spring Framework를 더 쉽게 시작하고 운영할 수 있게 도와준다.
```

따라서 Spring Boot를 잘하려면 Boot 기능만 외우면 안 된다. 결국 Spring Framework의 IoC, MVC, Transaction을 이해해야 한다.

## ZIP:ON에서 보이는 Spring Boot

```text
backend/src/main/java/com/zipon/ZipOnApplication.java
backend/pom.xml
backend/src/main/resources/application.yml
```

`ZipOnApplication`은 애플리케이션의 시작점이다. 이 클래스가 있는 package를 기준으로 Controller, Service, Mapper, Config, Exception handler 같은 Spring component가 탐색된다.

## 자주 헷갈리는 표현

```text
Spring:
큰 생태계 전체를 말할 때도 있고, Spring Framework를 뜻할 때도 있다.

Spring Boot:
설정보다 실행 가능한 애플리케이션 구성을 빠르게 만드는 도구다.

Starter:
관련 의존성을 한 번에 가져오기 위한 묶음이다.

Auto-configuration:
클래스패스, Bean 존재 여부, 설정값에 따라 Spring Boot가 자동으로 설정을 적용하는 기능이다.
```

## 실습 미션

```text
1. backend/pom.xml에서 spring-boot-starter-web 의존성을 찾는다.
2. application.yml에서 server.port 값을 확인한다.
3. ZipOnApplication.java가 com.zipon root package에 있는 이유를 설명해본다.
```

## 공식 출처

- [Spring Boot Reference Documentation](https://docs.spring.io/spring-boot/reference/index.html)
- [Spring Boot - Build Systems](https://docs.spring.io/spring-boot/reference/using/build-systems.html)
