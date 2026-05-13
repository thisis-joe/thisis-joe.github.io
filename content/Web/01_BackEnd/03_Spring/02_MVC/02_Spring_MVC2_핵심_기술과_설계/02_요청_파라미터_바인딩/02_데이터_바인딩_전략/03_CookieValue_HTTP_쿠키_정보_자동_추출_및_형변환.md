---
title: 03_CookieValue_HTTP_쿠키_정보_자동_추출_및_형변환
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# @CookieValue: HTTP 쿠키 정보 자동 추출 및 형변환

## 상위 맥락

`02_데이터_바인딩_전략 < 02_요청_파라미터_바인딩 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

@CookieValue는 HTTP 요청 헤더에 포함된 쿠키 중 특정 이름의 값을 찾아 컨트롤러 메서드 파라미터로 주입하는 어노테이션입니다.
자료에서는 @RequestParam과 비슷하게 자동 형변환을 지원하는 쿠키 전용 바인딩 전략으로 설명합니다.

기존 Servlet 방식에서는 `request.getCookies()`로 쿠키 배열을 꺼내고, 반복문이나 Stream API로 원하는 이름의 쿠키를 찾아야 했습니다.
@CookieValue를 사용하면 이런 절차적 코드를 줄이고 필요한 쿠키 값만 직접 받을 수 있습니다.

## 동작 방식

- 지정된 이름의 쿠키를 요청에서 찾습니다.
- 쿠키의 문자열 값을 컨트롤러 파라미터 타입으로 변환합니다.
- int 같은 기본 타입이나 Wrapper 타입으로도 받을 수 있습니다.

예를 들어 나이 정보를 담은 쿠키가 문자열로 전달되어도, 컨트롤러에서는 정수형 파라미터로 받을 수 있습니다.

## 주의할 점

요청에 해당 쿠키가 없으면 바인딩 예외가 발생할 수 있습니다.
쿠키는 만료되거나 브라우저 상태에 따라 전송되지 않을 수 있으므로, 필요한 경우 `required=false` 또는 `defaultValue`를 함께 사용해야 합니다.

또한 쿠키 이름이 동적이거나 여러 쿠키를 순회해야 하는 경우에는 @CookieValue보다 [[01_Servlet_API_HttpServletRequest_Response_직접_제어|HttpServletRequest 직접 제어]]가 더 적합합니다.

## 위치 정리

- @RequestParam: 쿼리 파라미터와 Form 데이터
- @ModelAttribute: 여러 파라미터를 묶은 DTO
- @CookieValue: HTTP 쿠키 값

## 한 문장 요약

@CookieValue는 HTTP 쿠키 값을 선언적으로 추출하고 필요한 타입으로 자동 변환해 주는 쿠키 전용 데이터 바인딩 전략입니다.

## 핵심 연결

[[01_RequestParam_쿼리_파라미터_및_폼_데이터_매핑|@RequestParam]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[02_ModelAttribute_DTO_생성_및_Setter_기반_프로퍼티_주입|ModelAttribute_DTO_생성_및_Setter_기반_프로퍼티_주입]]
- 같은 묶음: [[01_RequestParam_쿼리_파라미터_및_기본_타입_매핑|RequestParam_쿼리_파라미터_및_기본_타입_매핑]], [[02_ModelAttribute_DTO_생성_및_Setter_기반_프로퍼티_주입|ModelAttribute_DTO_생성_및_Setter_기반_프로퍼티_주입]]
- 전체 흐름 이전: [[02_ModelAttribute_DTO_생성_및_Setter_기반_프로퍼티_주입|ModelAttribute_DTO_생성_및_Setter_기반_프로퍼티_주입]]
- 전체 흐름 다음: [[01_RedirectAttributes_리다이렉트_시_데이터_소실_방지|RedirectAttributes_리다이렉트_시_데이터_소실_방지]]
- 통합 목차: [[00_통합_목차|통합 목차]]
