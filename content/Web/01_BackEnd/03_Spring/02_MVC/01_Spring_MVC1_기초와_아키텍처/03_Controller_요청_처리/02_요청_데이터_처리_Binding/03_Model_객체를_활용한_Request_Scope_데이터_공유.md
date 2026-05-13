---
title: 03_Model_객체를_활용한_Request_Scope_데이터_공유
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# 데이터 저장: Model 객체를 활용한 Request Scope 데이터 공유

## 상위 맥락

`02_요청_데이터_처리_Binding < 03_Controller_요청_처리 < 01_Spring_MVC1_기초와_아키텍처 < MVC < Spring < Web`

## 핵심 정리

Model은 컨트롤러가 처리한 결과 데이터를 View에 전달하기 위해 사용하는 저장 공간입니다.
컨트롤러는 Model에 데이터를 담고, View는 그 데이터를 읽어 동적인 화면을 만듭니다.

## 동작 흐름

컨트롤러에서 다음과 같이 데이터를 저장할 수 있습니다.

```java
model.addAttribute("movie", movie);
```

스프링은 이 데이터를 내부적으로 Request Scope에 연결합니다.
이후 JSP 같은 View에서는 request scope에 저장된 데이터를 참조해 화면을 구성합니다.

## 왜 Model을 사용하는가

과거 서블릿 방식에서는 `request.setAttribute()`를 직접 호출했습니다.
하지만 이렇게 하면 컨트롤러가 HttpServletRequest에 의존하게 됩니다.
스프링 MVC는 Model 객체를 제공하여 컨트롤러가 서블릿 API를 직접 다루지 않도록 합니다.

이 구조는 다음 장점이 있습니다.

- 컨트롤러 코드가 더 단순해짐.
- HTTP 인프라에 대한 직접 의존이 줄어듦.
- View에 전달할 데이터의 의도가 명확해짐.

## 화면 응답과 데이터 응답의 구분

Model은 주로 화면 렌더링을 위한 데이터 전달에 사용됩니다.
컨트롤러가 View 이름을 반환하고 ViewResolver가 화면을 렌더링하는 흐름에서 의미가 큽니다.

반대로 JSON 데이터를 직접 응답하는 API라면 Model에 담을 필요 없이 @ResponseBody를 사용해 객체를 반환하는 흐름이 더 적합합니다.

## 한 문장 요약

Model은 컨트롤러 처리 결과를 Request Scope에 저장해 View와 공유하게 해주는, 서블릿 API 의존을 줄이는 데이터 전달 도구입니다.

## 핵심 연결

[[03_ViewResolver_논리적_뷰_이름을_물리_경로로_변환|ViewResolver]], [[03_ResponseBody_JSON_데이터_직접_전송_Jackson|@ResponseBody]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[02_Primitive_Wrapper_타입_자동_변환|Primitive_Wrapper_타입_자동_변환]]
- 같은 묶음: [[01_RequestParam_쿼리_파라미터_및_폼_데이터_매핑|RequestParam_쿼리_파라미터_및_폼_데이터_매핑]], [[02_Primitive_Wrapper_타입_자동_변환|Primitive_Wrapper_타입_자동_변환]]
- 전체 흐름 이전: [[02_Primitive_Wrapper_타입_자동_변환|Primitive_Wrapper_타입_자동_변환]]
- 전체 흐름 다음: [[01_Forward_논리적_뷰_경로_문자열_리턴|Forward_논리적_뷰_경로_문자열_리턴]]
- 통합 목차: [[00_통합_목차|통합 목차]]
