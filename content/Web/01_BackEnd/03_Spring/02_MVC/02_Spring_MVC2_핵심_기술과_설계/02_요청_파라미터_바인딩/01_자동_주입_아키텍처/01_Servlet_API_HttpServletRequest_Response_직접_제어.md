---
title: 01_Servlet_API_HttpServletRequest_Response_직접_제어
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# Servlet API: HttpServletRequest/Response 직접 제어

## 상위 맥락

`01_자동_주입_아키텍처 < 02_요청_파라미터_바인딩 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

Spring MVC는 @RequestParam, @ModelAttribute, @CookieValue 같은 고수준 바인딩 기능을 제공하지만, 필요하면 HttpServletRequest, HttpServletResponse, HttpSession 같은 Servlet API 객체를 컨트롤러 파라미터로 직접 주입받을 수 있습니다.

자료에서는 파라미터의 선언 순서와 상관없이 타입을 기준으로 필요한 객체를 자동 주입한다고 설명합니다.
이는 Spring MVC의 자동 주입 아키텍처가 단순 요청 파라미터뿐 아니라 웹 컨텍스트 객체까지 처리한다는 의미입니다.

## 직접 제어가 필요한 상황

- 여러 쿠키를 동적으로 순회해야 하는 경우
- 세션을 직접 무효화하거나 세션 속성을 동적으로 다뤄야 하는 경우
- HttpServletResponse의 상태 코드나 헤더를 세밀하게 조작해야 하는 경우
- 프레임워크의 어노테이션 기반 추상화만으로 표현하기 어려운 저수준 HTTP 제어가 필요한 경우

## 추상화와 직접 제어의 균형

Servlet API를 직접 사용하면 HTTP 요청과 응답을 세밀하게 제어할 수 있습니다.
하지만 컨트롤러가 Servlet 기술에 강하게 의존하게 되므로, 일반적인 입력 처리에는 [[01_RequestParam_쿼리_파라미터_및_기본_타입_매핑|@RequestParam]], [[02_ModelAttribute_DTO_생성_및_Setter_기반_프로퍼티_주입|@ModelAttribute]], [[03_CookieValue_HTTP_쿠키_정보_자동_추출_및_형변환|@CookieValue]] 같은 바인딩 전략을 우선 사용하는 것이 자료의 흐름상 자연스럽습니다.

테스트에서는 [[01_MockMvc_WAS_미가동_가상_Servlet_환경|MockMvc]]가 MockHttpServletRequest와 MockHttpServletResponse 역할을 제공하므로, 실제 WAS 없이도 이런 Servlet API 직접 제어 흐름을 검증할 수 있습니다.

## 한 문장 요약

Servlet API 직접 주입은 Spring MVC의 자동 바인딩을 기본으로 사용하되, 필요한 경우 저수준 HTTP 요청과 응답을 직접 제어하기 위한 보완 수단입니다.

## 핵심 연결

[[01_RequestParam_쿼리_파라미터_및_폼_데이터_매핑|@RequestParam]]와 함께 읽으면 좋습니다.

## 관련 문서

- 다음 문서: [[02_ArgumentResolver_파라미터_타입별_자동_매핑_메커니즘|ArgumentResolver_파라미터_타입별_자동_매핑_메커니즘]]
- 같은 묶음: [[02_ArgumentResolver_파라미터_타입별_자동_매핑_메커니즘|ArgumentResolver_파라미터_타입별_자동_매핑_메커니즘]]
- 전체 흐름 이전: [[03_Content_Type_및_인코딩_상태_확인|Content_Type_및_인코딩_상태_확인]]
- 전체 흐름 다음: [[02_ArgumentResolver_파라미터_타입별_자동_매핑_메커니즘|ArgumentResolver_파라미터_타입별_자동_매핑_메커니즘]]
- 통합 목차: [[00_통합_목차|통합 목차]]
