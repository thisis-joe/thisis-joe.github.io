---
title: 01_RequestParam_쿼리_파라미터_및_폼_데이터_매핑
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# @RequestParam: 쿼리 파라미터 및 폼 데이터를 변수에 매핑

## 상위 맥락

`02_요청_데이터_처리_Binding < 03_Controller_요청_처리 < 01_Spring_MVC1_기초와_아키텍처 < MVC < Spring < Web`

## 핵심 정리

@RequestParam은 클라이언트가 보낸 쿼리 파라미터나 폼 데이터를 컨트롤러 메서드의 파라미터 변수에 매핑하는 어노테이션입니다.
과거처럼 HttpServletRequest에서 직접 `getParameter()`를 호출하지 않아도 됩니다.

## 동작 원리

클라이언트가 다음과 같이 요청한다고 하자.

```text
/detail-page?code=movie-1
```

컨트롤러 메서드에서는 다음처럼 받을 수 있습니다.

```java
@GetMapping("/detail-page")
public String goDetailPage(@RequestParam String code, Model model) Ellipsis
```

요청 파라미터 이름과 메서드 변수 이름이 같으면 @RequestParam의 name 속성을 생략할 수 있습니다.
이름이 다르면 명시적으로 지정해야 합니다.

## HandlerAdapter와의 연결

HandlerAdapter는 컨트롤러 메서드를 호출하기 전에 메서드 시그니처를 분석합니다.
@RequestParam이 있으면 HTTP 요청에서 해당 이름의 파라미터를 찾아 꺼내고, 필요한 타입으로 변환한 뒤 메서드 인자로 넣어줍니다.

## required와 defaultValue

@RequestParam은 기본적으로 required가 true입니다.
필수 파라미터가 누락되면 바인딩 단계에서 오류가 발생할 수 있습니다.
선택 파라미터라면 다음처럼 명시할 수 있습니다.

```java
@RequestParam(required = false)
```

값이 없을 때 기본값이 필요하다면 defaultValue를 사용합니다.

```java
@RequestParam(defaultValue = "0") int page
```

## 한 문장 요약

@RequestParam은 HTTP 요청 파라미터를 컨트롤러 메서드의 자바 변수로 직접 매핑하여 서블릿 API 의존과 반복 파싱 코드를 줄입니다.

## 핵심 연결

[[02_HandlerAdapter_핸들러_실행_표준_인터페이스|HandlerAdapter]]와 함께 읽으면 좋습니다.

## 관련 문서

- 다음 문서: [[02_Primitive_Wrapper_타입_자동_변환|Primitive_Wrapper_타입_자동_변환]]
- 같은 묶음: [[02_Primitive_Wrapper_타입_자동_변환|Primitive_Wrapper_타입_자동_변환]], [[03_Model_객체를_활용한_Request_Scope_데이터_공유|Model_객체를_활용한_Request_Scope_데이터_공유]]
- 전체 흐름 이전: [[02_HTTP_Method_제약_GetMapping_PostMapping|HTTP_Method_제약_GetMapping_PostMapping]]
- 전체 흐름 다음: [[02_Primitive_Wrapper_타입_자동_변환|Primitive_Wrapper_타입_자동_변환]]
- 통합 목차: [[00_통합_목차|통합 목차]]
