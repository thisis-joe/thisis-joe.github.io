---
title: 00-spring-boot-master-roadmap
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-30T05:00:06+09:00
---

# Spring Boot 마스터 로드맵

## 목표

Spring Boot를 단순히 실행하는 수준이 아니라, 왜 이 구조가 필요한지 설명하고 ZIP:ON 같은 큰 서비스를 안정적으로 확장할 수 있는 수준까지 간다.

## 1단계. 웹 요청 흐름 이해

먼저 사용자의 요청이 어디로 들어와서 어디서 처리되고 어떻게 응답되는지 이해한다.

```text
Browser
-> HTTP Request
-> DispatcherServlet
-> Controller
-> Service
-> MyBatis Mapper
-> Database
-> DTO
-> HTTP Response
```

여기서 막히면 Controller, Service, Mapper를 외워도 코드가 흩어진다.

## 2단계. Spring의 핵심 원리 이해

반드시 잡아야 할 개념:

```text
IoC Container
Bean
Dependency Injection
Component Scan
Configuration Class
Auto-configuration
Profile
Externalized Configuration
```

읽을 포인트:

```text
내가 직접 new 하지 않아도 객체가 주입되는 이유는 무엇인가?
@Service와 @Mapper는 단순 이름표인가, Spring이 관리하는 대상인가?
왜 main class를 root package에 두는가?
```

## 3단계. MVC와 REST API

ZIP:ON의 API는 대부분 REST API다.

알아야 할 것:

```text
@RestController
@RequestMapping
@GetMapping
@PostMapping
@PathVariable
@RequestParam
@RequestBody
ResponseEntity
ExceptionHandler
ControllerAdvice
```

## 4단계. 데이터 접근

ZIP:ON은 MyBatis Mapper와 Flyway migration으로 시작한다.

순서:

```text
Flyway migration
Domain object
MyBatis Mapper
명시적인 SQL
Pagination
Transaction
DTO 변환
```

## 5단계. 품질과 운영

실제 서비스가 되려면 실행만 되면 끝이 아니다.

배워야 할 것:

```text
Validation
Global Exception Handling
Testing
Logging
Actuator
Metrics
Profiles
Database Migration
Security
```

## ZIP:ON 적용 순서

```text
1. HealthController를 통해 요청 흐름 확인
2. AuthController -> AuthService -> UserMapper 흐름 읽기
3. RegionController -> RegionService -> RegionMapper -> regions table 흐름 읽기
4. RentRiskDiagnosisController -> RentRiskDiagnosisService 흐름에서 DTO와 domain 값을 구분하기
5. Flyway migration과 MyBatis mapper가 schema/source of truth를 어떻게 나누는지 확인하기
6. Service에서 domain object를 DTO로 바꾸는 지점을 찾기
7. Controller 또는 integration test로 API 계약 확인하기
8. GlobalExceptionHandler와 Security 401/403 handler의 역할 구분하기
```

## 공식 출처

- [Spring Boot Reference Documentation](https://docs.spring.io/spring-boot/reference/index.html)
- [Spring Framework Reference Documentation](https://docs.spring.io/spring-framework/reference/index.html)
- [MyBatis Spring Boot Starter](https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/)
