---
title: 02_Primitive_Wrapper_타입_자동_변환
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# 자동 타입 변환: Primitive 및 Wrapper 타입 지원

## 상위 맥락

`02_요청_데이터_처리_Binding < 03_Controller_요청_처리 < 01_Spring_MVC1_기초와_아키텍처 < MVC < Spring < Web`

## 핵심 정리

HTTP 요청 파라미터는 기본적으로 문자열입니다.
하지만 스프링 MVC는 컨트롤러 메서드 파라미터의 타입을 보고 문자열 값을 int, Integer, boolean, Boolean 같은 자바 타입으로 자동 변환해 줍니다.

## 자동 변환의 의미

과거 방식에서는 `request.getParameter()`로 문자열을 꺼낸 뒤 `Integer.parseInt()` 같은 변환 코드를 직접 작성해야 했습니다.
스프링 MVC에서는 HandlerAdapter가 컨트롤러 메서드를 호출하기 전에 타입 변환을 수행합니다.

예를 들어 요청 파라미터가 `age=10`이면 컨트롤러에서 다음처럼 받을 수 있습니다.

```java
public String handler(@RequestParam int age) Ellipsis
```

스프링은 문자열 "10"을 int 값 10으로 변환해 주입합니다.

## Primitive와 Wrapper의 차이

Primitive 타입은 null을 가질 수 없습니다.
따라서 파라미터가 누락될 가능성이 있으면 int 같은 기본형보다 Integer 같은 Wrapper 타입이 안전합니다.

- int: 값이 반드시 있어야 하는 경우에 적합합니다.
- Integer: 값이 없을 수 있는 경우에 적합합니다.

선택 파라미터를 기본형으로 받으려면 defaultValue를 지정하는 것이 안전합니다.

```java
@RequestParam(defaultValue = "0") int page
```

## 타입 불일치 주의

컨트롤러가 int를 요구하는데 클라이언트가 `abc` 같은 값을 보내면 타입 변환에 실패합니다.
이런 경우 바인딩 오류가 발생하므로, 요청 데이터의 불확실성을 고려한 검증과 예외 처리가 필요합니다.

## 한 문장 요약

스프링 MVC는 문자열 기반 HTTP 파라미터를 자바의 Primitive와 Wrapper 타입으로 자동 변환하지만, null 가능성이 있는 값은 Wrapper나 defaultValue로 안전하게 처리해야 합니다.

## 핵심 연결

[[02_HandlerAdapter_핸들러_실행_표준_인터페이스|HandlerAdapter]], [[01_RequestParam_쿼리_파라미터_및_폼_데이터_매핑|@RequestParam]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[01_RequestParam_쿼리_파라미터_및_폼_데이터_매핑|RequestParam_쿼리_파라미터_및_폼_데이터_매핑]]
- 다음 문서: [[03_Model_객체를_활용한_Request_Scope_데이터_공유|Model_객체를_활용한_Request_Scope_데이터_공유]]
- 같은 묶음: [[01_RequestParam_쿼리_파라미터_및_폼_데이터_매핑|RequestParam_쿼리_파라미터_및_폼_데이터_매핑]], [[03_Model_객체를_활용한_Request_Scope_데이터_공유|Model_객체를_활용한_Request_Scope_데이터_공유]]
- 전체 흐름 이전: [[01_RequestParam_쿼리_파라미터_및_폼_데이터_매핑|RequestParam_쿼리_파라미터_및_폼_데이터_매핑]]
- 전체 흐름 다음: [[03_Model_객체를_활용한_Request_Scope_데이터_공유|Model_객체를_활용한_Request_Scope_데이터_공유]]
- 통합 목차: [[00_통합_목차|통합 목차]]
