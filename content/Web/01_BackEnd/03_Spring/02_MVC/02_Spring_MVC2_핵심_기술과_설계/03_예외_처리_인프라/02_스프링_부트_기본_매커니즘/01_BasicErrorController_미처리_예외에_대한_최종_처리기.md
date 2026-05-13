---
title: 01_BasicErrorController_미처리_예외에_대한_최종_처리기
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# BasicErrorController: 미처리 예외에 대한 최종 처리기

## 상위 맥락

`02_스프링_부트_기본_매커니즘 < 03_예외_처리_인프라 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

BasicErrorController는 스프링 부트에서 처리되지 않은 예외나 상태 코드를 최종적으로 처리하는 기본 에러 컨트롤러입니다.
자료에서는 전통적인 web.xml 기반 error-page 설정을 스프링 부트가 자동화한 구조로 설명합니다.

컨트롤러나 @ControllerAdvice에서 처리되지 않은 예외, 또는 컨트롤러에 도달하기 전 발생한 404 같은 오류는 최종적으로 `/error` 경로로 전달되고, 이 요청을 BasicErrorController가 처리합니다.

## 우선순위 구조

1. [[01_ControllerAdvice_컨트롤러_계층_공통_관심사_분리|@ControllerAdvice]]와 [[02_ExceptionHandler_특정_예외_발생_시_핸들링_로직_정의|@ExceptionHandler]]가 먼저 예외를 처리합니다.
2. 처리되지 않은 예외는 BasicErrorController로 위임됩니다.
3. BasicErrorController는 에러 페이지나 JSON 형태로 최종 응답을 만듭니다.

## HTML과 JSON 응답

BasicErrorController는 클라이언트의 요청 형식에 따라 응답을 나눌 수 있습니다.
브라우저가 HTML을 요구하면 ModelAndView를 반환해 에러 화면을 렌더링합니다.
AJAX나 REST 요청처럼 JSON을 요구하는 경우에는 ResponseEntity와 Map 형태로 에러 데이터를 반환할 수 있습니다.

## ErrorAttributes와의 관계

BasicErrorController는 에러 데이터 자체를 직접 수집하기보다 [[03_ErrorAttributes_에러_응답_필드_커스터마이징|ErrorAttributes]]로부터 상태 코드, 메시지, 경로 같은 에러 속성을 받아 응답에 사용합니다.

## 한 문장 요약

BasicErrorController는 개발자가 직접 처리하지 못한 예외와 상태 코드를 받아 HTML 또는 JSON 형태로 최종 응답을 만드는 스프링 부트의 기본 에러 처리 안전망입니다.

## 관련 문서

- 다음 문서: [[02_Whitelabel_Error_Page_기본_뷰_매핑_및_에러_속성_제공|Whitelabel_Error_Page_기본_뷰_매핑_및_에러_속성_제공]]
- 같은 묶음: [[02_Whitelabel_Error_Page_기본_뷰_매핑_및_에러_속성_제공|Whitelabel_Error_Page_기본_뷰_매핑_및_에러_속성_제공]]
- 전체 흐름 이전: [[02_ExceptionHandler_특정_예외_발생_시_핸들링_로직_정의|ExceptionHandler_특정_예외_발생_시_핸들링_로직_정의]]
- 전체 흐름 다음: [[02_Whitelabel_Error_Page_기본_뷰_매핑_및_에러_속성_제공|Whitelabel_Error_Page_기본_뷰_매핑_및_에러_속성_제공]]
- 통합 목차: [[00_통합_목차|통합 목차]]
