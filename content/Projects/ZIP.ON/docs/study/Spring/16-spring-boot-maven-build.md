---
title: 16-spring-boot-maven-build
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-26T05:00:07+09:00
purpose: learning
status: active
code_sync_required: false
related_area: spring, maven, build
read_when: 
do_not_use_as: 
  - Maven wrapper, test, package, spring-boot:run 명령의 의미를 학습할 때
  - 현재 전체 검증 명령의 유일한 source of truth
---

# Spring Boot와 Maven Build

## 한 줄 정의

Maven은 Java 프로젝트의 의존성, 빌드, 테스트, 패키징을 관리하는 도구이고, Spring Boot Maven Plugin은 Spring Boot 애플리케이션 실행과 패키징을 돕는다.

## pom.xml이 하는 일

```text
프로젝트 좌표 정의
Java version 정의
dependency 선언
plugin 선언
test 환경 구성
packaging 방식 결정
```

ZIP:ON의 backend는 Maven wrapper를 포함한다.

```text
backend/mvnw
backend/pom.xml
```

## Maven Wrapper를 쓰는 이유

팀원마다 Maven 설치 상태가 달라도 같은 wrapper로 빌드할 수 있다.

```bash
./mvnw test
./mvnw spring-boot:run
./mvnw clean package
```

## 자주 쓰는 명령

```text
./mvnw test:
테스트 실행

./mvnw clean test:
빌드 산출물을 지우고 테스트 실행

./mvnw spring-boot:run:
Spring Boot 애플리케이션 실행

./mvnw package:
실행 가능한 jar 패키징
```

## ZIP:ON 트러블 슈팅 연결

예전 프로젝트명 산출물이 `target` 아래에 남아 있을 수 있다. 이 경우 소스 문제가 아니라 빌드 산출물 문제일 수 있다.

해결:

```bash
./mvnw clean test
```

## 실습 미션

```text
1. backend/pom.xml에서 groupId, artifactId, name을 찾는다.
2. ./mvnw test와 ./mvnw clean test의 차이를 설명한다.
3. Spring Boot starter가 일반 dependency와 어떤 차이를 주는지 생각한다.
```

## 공식 출처

- [Spring Boot - Build Systems](https://docs.spring.io/spring-boot/reference/using/build-systems.html)
- [Spring Boot Maven Plugin](https://docs.spring.io/spring-boot/maven-plugin/index.html)
