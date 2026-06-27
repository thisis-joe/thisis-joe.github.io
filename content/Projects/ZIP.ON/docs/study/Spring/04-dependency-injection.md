---
title: 04-dependency-injection
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
---

# Dependency Injection

## 한 줄 정의

Dependency Injection은 객체가 필요한 의존성을 직접 만들지 않고 외부에서 주입받는 방식이다.

## 왜 필요한가

Controller는 HTTP 요청을 받는 일에 집중해야 한다. Service를 직접 만들기 시작하면 Controller가 객체 생성 방식까지 알게 된다.

```text
나쁜 방향:
Controller가 Service를 new 한다.
Service가 Mapper 구현체를 new 한다.

좋은 방향:
Controller는 Service가 필요하다고 선언한다.
Service는 Mapper나 다른 Service가 필요하다고 선언한다.
Spring이 연결한다.
```

## 생성자 주입을 선호하는 이유

ZIP:ON은 생성자 주입을 기본으로 사용한다.

장점:

```text
필수 의존성이 명확하다.
final 필드를 사용할 수 있다.
테스트에서 직접 주입하기 쉽다.
객체 생성 시점에 의존성이 빠졌는지 확인할 수 있다.
```

## ZIP:ON 예시

```java
public UserController(UserService userService) {
    this.userService = userService;
}
```

읽는 법:

```text
UserController는 UserService 없이는 제대로 동작할 수 없다.
하지만 UserService를 직접 만들지는 않는다.
Spring에게 "이 객체가 필요하다"고 선언한다.
```

## Field Injection과 비교

Field Injection은 처음 보기에는 짧다.

```java
@Autowired
private PropertyService propertyService;
```

하지만 테스트와 불변성 면에서 생성자 주입보다 불리하다. 학습 단계에서는 생성자 주입을 기준으로 익힌다.

## 실습 미션

```text
1. SearchController의 생성자를 읽고 어떤 의존성이 필요한지 적는다.
2. AuthService가 UserMapper와 PasswordEncoder를 주입받는 이유를 설명한다.
3. 순환 참조가 생긴다면 어떤 구조 냄새인지 생각해본다.
```

## 공식 출처

- [Spring Framework - Dependency Injection](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html)
- [Spring Boot - Spring Beans and Dependency Injection](https://docs.spring.io/spring-boot/reference/using/spring-beans-and-dependency-injection.html)
