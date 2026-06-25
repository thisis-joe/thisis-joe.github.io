---
title: 03-ioc-container-and-beans
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-26T05:00:07+09:00
---

# IoC Container와 Bean

## 한 줄 정의

IoC Container는 객체 생성과 연결을 개발자 대신 관리하는 Spring의 핵심 컨테이너이고, Bean은 그 컨테이너가 관리하는 객체다.

## IoC란 무엇인가

IoC는 Inversion of Control, 즉 제어의 역전이다.

일반 Java 코드에서는 개발자가 직접 객체를 만든다.

```java
UserController userController = new UserController(userService);
```

Spring에서는 컨테이너가 객체를 만들고 필요한 곳에 넣어준다.

```java
private final UserService userService;

public UserController(UserService userService) {
    this.userService = userService;
}
```

여기서 Controller는 Service를 직접 만들지 않는다. 필요한 의존성을 선언하고, Spring이 넣어준다.

## Bean이 되는 대표 방법

```text
@Component
@Controller
@RestController
@Service
@Configuration
@Bean method
@Mapper
```

`@Service`, `@Controller`는 역할이 드러나는 stereotype annotation이고, MyBatis Mapper interface는 `@Mapper`로 등록된다.

## ZIP:ON에서 Bean 찾기

예시:

```text
UserController
UserService
UserMapper
WebConfig
GlobalExceptionHandler
```

이 객체들은 직접 `new` 하지 않아도 Spring이 관리한다.

## 왜 필요한가

```text
객체 생성 책임이 흩어지지 않는다.
테스트 시 가짜 객체로 바꾸기 쉬워진다.
공통 설정을 적용하기 쉽다.
트랜잭션, AOP, 예외 처리 같은 Spring 기능과 연결된다.
```

## 자주 하는 실수

```text
Service 안에서 new Mapper 구현체를 직접 만들려고 한다.
Bean이 아닌 일반 객체에 @Autowired를 기대한다.
main class 바깥 package에 클래스를 두고 component scan이 안 된다고 당황한다.
```

## 실습 미션

```text
1. AuthService 생성자에 UserMapper가 들어오는 이유를 설명한다.
2. UserMapper는 interface인데 어떻게 주입될 수 있는지 질문을 적어본다.
3. @Service를 지우면 어떤 오류가 날지 예상해본다.
```

## 공식 출처

- [Spring Framework - The IoC Container](https://docs.spring.io/spring-framework/reference/core/beans.html)
- [Spring Boot - Spring Beans and Dependency Injection](https://docs.spring.io/spring-boot/reference/using/spring-beans-and-dependency-injection.html)
