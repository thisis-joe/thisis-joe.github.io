---
title: 01-npm-vite-maven-roles
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-27T05:00:07+09:00
---

# npm, Vite, Maven의 역할

## 한 줄 정의

Maven은 백엔드 Java 빌드를 담당하고, npm과 Vite는 프론트엔드 의존성 설치와 개발/빌드를 담당한다.

## ZIP:ON 실행 구조

```text
backend/
-> Maven
-> Spring Boot
-> localhost:8082

frontend/
-> npm
-> Vite
-> 127.0.0.1:5173
```

## Maven

하는 일:

```text
Java dependency 관리
컴파일
테스트
패키징
Spring Boot 실행
```

명령:

```bash
./mvnw test
./mvnw spring-boot:run
```

## npm

하는 일:

```text
frontend dependency 설치
script 실행
package-lock 관리
```

명령:

```bash
npm ci
npm run dev
npm run build
```

ZIP:ON처럼 `package-lock.json`이 있는 프로젝트를 처음 실행하거나 CI에서 검증할 때는 `npm ci`를 기본으로 사용합니다. 새 의존성을 추가하거나 버전을 바꾸는 작업을 할 때만 의도를 가지고 `npm install <package>`를 사용합니다.

## Vite

하는 일:

```text
개발 서버
Vue SFC 처리
빠른 hot update
production build
```

## 실습 미션

```text
1. backend와 frontend에서 각각 어떤 명령으로 빌드하는지 적는다.
2. Maven dependency와 npm dependency가 섞이면 안 되는 이유를 설명한다.
3. frontend/dist와 backend/target은 어떤 성격의 폴더인지 비교한다.
```

## 공식 출처

- [Spring Boot - Build Systems](https://docs.spring.io/spring-boot/reference/using/build-systems.html)
- [Vite - Getting Started](https://vite.dev/guide/)
