---
title: SOURCES
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-26T05:00:07+09:00
purpose: learning-source-list
status: active
code_sync_required: false
related_area: study, sources
read_when: 
update_when: 
do_not_use_as: 
  - 학습 문서 작성 시 우선 참고할 공식 출처를 확인할 때
  - study 문서의 공식 출처 기준이 바뀔 때
  - 현재 구현 명세
---

# 공식 출처 목록

이 파일은 `study` 폴더 학습 자료를 작성할 때 기준으로 삼은 공식 문서 또는 공식 문서급 출처 목록입니다.

확인일: 2026-06-16

## Spring

- [Spring Boot Reference Documentation](https://docs.spring.io/spring-boot/reference/index.html)
- [Spring Boot - Structuring Your Code](https://docs.spring.io/spring-boot/reference/using/structuring-your-code.html)
- [Spring Boot - Spring Beans and Dependency Injection](https://docs.spring.io/spring-boot/reference/using/spring-beans-and-dependency-injection.html)
- [Spring Boot - Auto-configuration](https://docs.spring.io/spring-boot/reference/using/auto-configuration.html)
- [Spring Boot - Externalized Configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html)
- [Spring Boot - Servlet Web Applications](https://docs.spring.io/spring-boot/reference/web/servlet.html)
- [Spring Boot - Testing](https://docs.spring.io/spring-boot/reference/testing/index.html)
- [Spring Boot - Production-ready Features](https://docs.spring.io/spring-boot/reference/actuator/index.html)
- [Spring Framework Reference Documentation](https://docs.spring.io/spring-framework/reference/index.html)
- [Spring Framework - The IoC Container](https://docs.spring.io/spring-framework/reference/core/beans.html)
- [Spring Framework - Spring Web MVC](https://docs.spring.io/spring-framework/reference/web/webmvc.html)
- [Spring Framework - Using @Transactional](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)
- [Spring Framework - Java Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)

## Persistence

- [MyBatis Spring Boot Starter](https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/)
- [MyBatis Mapper XML Files](https://mybatis.org/mybatis-3/sqlmap-xml.html)
- [MyBatis Dynamic SQL Select Statements](https://mybatis.org/mybatis-dynamic-sql/docs/select.html)
- [Flyway Versioned Migrations](https://documentation.red-gate.com/fd/versioned-migrations-273973333.html)

## Web

- [MDN - Overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)
- [MDN - HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods)
- [MDN - HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
- [MDN - Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)

## Vue

- [Vue - Introduction](https://vuejs.org/guide/introduction.html)
- [Vue - Reactivity Fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [Vue - Components Basics](https://vuejs.org/guide/essentials/component-basics.html)
- [Vue - Single-File Components](https://vuejs.org/guide/scaling-up/sfc.html)
- [Vue - Routing](https://vuejs.org/guide/scaling-up/routing.html)
- [Vue Router - Getting Started](https://router.vuejs.org/guide/)
- [Vite - Getting Started](https://vite.dev/guide/)
- [Axios - First Steps](https://axios-http.com/docs/intro)

## 사용 기준

```text
1순위: Spring, Vue, Vite, MDN 같은 공식 문서
2순위: 표준 또는 프로젝트가 직접 운영하는 문서
3순위: 블로그나 개인 글은 원칙적으로 사용하지 않음
```

블로그가 읽기 쉬워도 학습 파일의 근거로는 삼지 않습니다. 이해를 돕는 보조 자료로 볼 수는 있지만, 팀 기준 문서는 공식 출처를 기준으로 유지합니다.

## Deprecated source category

Spring Data JPA 문서는 과거 학습 자료 작성 시 참고했지만, 현재 ZIP:ON의 application persistence 기준은 MyBatis + Flyway입니다. 새 학습 문서에서는 JPA/Hibernate를 기본 구현 경로로 소개하지 않습니다.
