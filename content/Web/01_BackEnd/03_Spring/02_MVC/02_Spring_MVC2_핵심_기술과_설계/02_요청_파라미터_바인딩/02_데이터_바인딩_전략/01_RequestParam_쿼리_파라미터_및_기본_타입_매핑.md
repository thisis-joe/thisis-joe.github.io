---
title: 01_RequestParam_쿼리_파라미터_및_기본_타입_매핑
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# @RequestParam: 쿼리 파라미터 및 기본 타입 매핑

## 상위 맥락

`02_데이터_바인딩_전략 < 02_요청_파라미터_바인딩 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

@RequestParam은 HTTP 요청의 쿼리 파라미터나 Form 데이터를 컨트롤러 메서드의 개별 변수에 매핑하는 어노테이션입니다.
자료에서는 @RequestParam을 단일 파라미터나 기본 타입 중심의 낱개 데이터를 처리하는 전략으로 설명합니다.

기존 Servlet 방식에서는 `request.getParameter()`로 값을 꺼내고 직접 형변환해야 했습니다.
Spring MVC에서는 @RequestParam을 통해 문자열 요청 값을 int, boolean, Integer 같은 기본 타입이나 Wrapper 타입으로 자동 변환해 받을 수 있습니다.

## 매핑 방식

- 요청 파라미터 이름과 변수명이 같으면 name 속성을 생략할 수 있습니다.
- 명시적으로 이름을 지정하려면 `@RequestParam("name")` 또는 name 속성을 사용합니다.
- 동일한 이름으로 여러 값이 전달되면 배열, List, Set 같은 컬렉션으로 받을 수 있습니다.

## 주의할 점

@RequestParam은 기본적으로 required=true입니다.
따라서 파라미터가 누락되면 400 Bad Request가 발생할 수 있습니다.
선택 파라미터라면 `required=false`를 사용하거나 `defaultValue`를 지정해야 합니다.

특히 int 같은 Primitive 타입은 null을 가질 수 없습니다.
선택 값인데 Primitive로 받으면 파라미터 누락 시 오류가 발생할 수 있습니다.
이런 경우에는 Wrapper 타입인 Integer를 사용하거나 defaultValue로 기본값을 지정합니다.

## 다른 바인딩 전략과의 관계

파라미터가 몇 개 되지 않으면 @RequestParam이 간단합니다.
그러나 입력값이 많아지면 컨트롤러 메서드 시그니처가 비대해지므로 [[02_ModelAttribute_DTO_생성_및_Setter_기반_프로퍼티_주입|@ModelAttribute]]를 사용해 DTO로 묶는 방식이 더 적합합니다.

## 한 문장 요약

@RequestParam은 쿼리 파라미터와 Form 데이터를 개별 변수에 매핑하고, 문자열 값을 기본 타입이나 Wrapper 타입으로 자동 변환해 주는 단일 데이터 바인딩 전략입니다.

## 핵심 연결

[[01_RequestParam_쿼리_파라미터_및_폼_데이터_매핑|@RequestParam]]와 함께 읽으면 좋습니다.

## 관련 문서

- 다음 문서: [[02_ModelAttribute_DTO_생성_및_Setter_기반_프로퍼티_주입|ModelAttribute_DTO_생성_및_Setter_기반_프로퍼티_주입]]
- 같은 묶음: [[02_ModelAttribute_DTO_생성_및_Setter_기반_프로퍼티_주입|ModelAttribute_DTO_생성_및_Setter_기반_프로퍼티_주입]], [[03_CookieValue_HTTP_쿠키_정보_자동_추출_및_형변환|CookieValue_HTTP_쿠키_정보_자동_추출_및_형변환]]
- 전체 흐름 이전: [[02_ArgumentResolver_파라미터_타입별_자동_매핑_메커니즘|ArgumentResolver_파라미터_타입별_자동_매핑_메커니즘]]
- 전체 흐름 다음: [[02_ModelAttribute_DTO_생성_및_Setter_기반_프로퍼티_주입|ModelAttribute_DTO_생성_및_Setter_기반_프로퍼티_주입]]
- 통합 목차: [[00_통합_목차|통합 목차]]
