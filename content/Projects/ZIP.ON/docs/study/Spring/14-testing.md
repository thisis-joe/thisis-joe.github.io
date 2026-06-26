---
title: 14-testing
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-27T05:00:07+09:00
---

# Spring Boot Testing

## 한 줄 정의

Testing은 코드가 의도대로 동작하는지 자동으로 확인하고, 기능이 커져도 기존 동작이 깨지지 않도록 막는 장치다.

## 테스트가 필요한 이유

ZIP:ON은 API가 많아질 예정이다. 수동으로 모든 화면과 API를 확인하면 금방 한계가 온다.

테스트가 있으면 다음을 빠르게 확인할 수 있다.

```text
Controller가 올바른 응답을 주는가?
Service가 예외 상황을 처리하는가?
Mapper SQL이 의도대로 동작하는가?
Validation이 잘 막는가?
```

## 테스트 종류

```text
Unit Test:
작은 단위의 로직을 빠르게 확인한다.

Slice Test:
Controller, Mapper처럼 특정 계층만 잘라서 확인한다.

Integration Test:
Spring context를 띄우고 여러 계층을 함께 확인한다.

End-to-End Test:
실제 서버와 화면 흐름까지 확인한다.
```

## 현재 ZIP:ON 테스트

```text
ZipOnApplicationTests
AuthIntegrationTest
RegionIntegrationTest
CommunityIntegrationTest
CommunityConcurrencyIntegrationTest
RegionalIndicatorAnalysisIntegrationTest
RentRiskDiagnosisIntegrationTest
FavoriteAnalysisIntegrationTest
OpenApiDocumentationIntegrationTest
SecurityConfigTest
LeaseRiskDiagnosis*ServiceTest
risk/ai/*Test
external/*ApiClientTest
```

현재 테스트는 context load 하나만 있는 상태가 아니다. 인증, 커뮤니티, 지역 지표, 정확 주소 위험진단, 관심 부동산 분석, OpenAPI 문서, 외부 API client/parser, 위험 점수 계산 로직까지 여러 층위로 나뉜다. DB가 필요한 통합 테스트는 H2 대체가 아니라 MySQL 계열 동작을 기준으로 보며, repository의 현재 기준은 Testcontainers MySQL과 local MySQL이다.

## 다음에 추가할 테스트 후보

```text
Profile image upload edge cases
Community post/comment write rate limit
External API circuit breaker behavior
Favorite analysis empty-data UX contract
Frontend component-level regression tests
```

## 실습 미션

```text
1. HealthController를 테스트하려면 어떤 응답을 기대해야 하는지 적는다.
2. Controller 테스트와 Service 테스트에서 확인할 내용이 어떻게 다른지 구분한다.
3. Mapper나 Flyway migration 테스트에서 H2 MySQL mode 대신 MySQL Testcontainers가 더 안전한 이유를 적는다.
4. `AuthIntegrationTest`와 `JwtAuthenticationFilterTest`가 각각 어떤 Spring Security 경계를 검증하는지 구분한다.
```

## 공식 출처

- [Spring Boot - Testing](https://docs.spring.io/spring-boot/reference/testing/index.html)
- [Spring Framework - Testing](https://docs.spring.io/spring-framework/reference/testing.html)
- [Spring Framework - MockMvc](https://docs.spring.io/spring-framework/reference/testing/mockmvc.html)
