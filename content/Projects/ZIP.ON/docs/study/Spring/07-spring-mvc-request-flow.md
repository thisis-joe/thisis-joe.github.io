---
title: 07-spring-mvc-request-flow
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-26T05:00:07+09:00
---

# Spring MVC Request Flow

## 한 줄 정의

Spring MVC는 HTTP 요청을 Controller method로 연결하고, 반환값을 HTTP 응답으로 바꾸는 웹 MVC 프레임워크다.

## 요청 흐름

```text
Client
-> HTTP Request
-> Servlet Container
-> DispatcherServlet
-> Handler Mapping
-> Controller Method
-> Service
-> Return Value Handling
-> HTTP Response
```

핵심은 `DispatcherServlet`이다. Spring MVC에서 모든 요청의 중앙 입구 역할을 한다.

## Controller는 무엇을 하나

Controller는 HTTP 세계와 Java 세계의 경계다.

```text
HTTP method를 받는다.
URL path를 해석한다.
query parameter를 받는다.
request body를 DTO로 받는다.
Service를 호출한다.
응답 DTO를 반환한다.
```

Controller가 비즈니스 로직을 많이 갖기 시작하면 MVC의 장점이 줄어든다.

## ZIP:ON 예시

```text
POST /api/regional-indicator-analyses
-> RegionalIndicatorAnalysisController.createAnalysis()
-> RegionalIndicatorAnalysisService.analyze()
-> ApiResponse<RegionalIndicatorAnalysisResponse>
```

## @RestController의 의미

`@RestController`는 웹 API를 만들 때 자주 쓰인다. 일반적으로 JSON 같은 응답 body를 반환하는 Controller에 붙인다.

## 실습 미션

```text
1. HealthController의 URL과 method를 찾는다.
2. /api/community/posts/{postId}가 어떤 Controller method와 연결되는지 찾는다.
3. Controller에서 Service를 호출하지 않고 바로 List.of()를 반환하면 어떤 학습 흐름이 깨지는지 설명한다.
```

## 공식 출처

- [Spring Framework - Spring Web MVC](https://docs.spring.io/spring-framework/reference/web/webmvc.html)
- [Spring Boot - Servlet Web Applications](https://docs.spring.io/spring-boot/reference/web/servlet.html)
