---
title: 01_우선순위_Advice_기반_처리와_부트_기본_처리
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# 우선순위: Advice 기반 처리 > 부트 기본 처리

## 상위 맥락

`03_충돌_해결과_설계_원리 < 03_예외_처리_인프라 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

스프링 MVC와 스프링 부트의 예외 처리 구조는 우선순위 기반으로 동작합니다.
자료에서는 `@ControllerAdvice 기반 처리`가 먼저 개입하고, 처리되지 않은 예외가 `스프링 부트 기본 처리`로 넘어가는 구조를 설명합니다.

## 처리 우선순위

1. @ControllerAdvice와 @ExceptionHandler
   - 컨트롤러 계층에서 발생한 예외를 개발자가 직접 처리합니다.
   - 로그 기록, 사용자 정의 에러 메시지, 커스텀 에러 페이지 또는 JSON 응답을 구성할 수 있습니다.

2. BasicErrorController
   - 위 단계에서 처리되지 않은 예외나 404 같은 상태 코드를 기본 방식으로 처리합니다.
   - 상태 코드별 에러 페이지, 공통 에러 페이지, Whitelabel Error Page, JSON 에러 응답을 제공합니다.

## 왜 이렇게 나누는가

모든 예외를 BasicErrorController에 맡기면 비즈니스 상황에 맞는 로깅이나 메시지 가공이 어렵습니다.
반대로 모든 예외를 @ControllerAdvice에서 무분별하게 잡으면 프레임워크가 제공하는 기본 상태 코드 처리와 폴백 구조가 무력화될 수 있습니다.

따라서 자료의 흐름은 다음처럼 읽으면 됩니다.

- 예측 가능한 비즈니스 예외는 Advice에서 직접 처리합니다.
- 나머지 시스템 수준 예외와 미처리 예외는 부트 기본 처리로 위임합니다.

## 한 문장 요약

스프링 부트 예외 처리는 개발자가 정의한 Advice 기반 처리를 1순위로 두고, 처리되지 않은 오류를 BasicErrorController가 최종 처리하는 계층형 안전망 구조입니다.

## 핵심 연결

[[01_ControllerAdvice_컨트롤러_계층_공통_관심사_분리|@ControllerAdvice]], [[01_BasicErrorController_미처리_예외에_대한_최종_처리기|BasicErrorController]]와 함께 읽으면 좋습니다.

## 관련 문서

- 다음 문서: [[02_응답_분기_HTML_요청과_JSON_AJAX_요청의_분리_처리|응답_분기_HTML_요청과_JSON_AJAX_요청의_분리_처리]]
- 같은 묶음: [[02_응답_분기_HTML_요청과_JSON_AJAX_요청의_분리_처리|응답_분기_HTML_요청과_JSON_AJAX_요청의_분리_처리]], [[03_ErrorAttributes_에러_응답_필드_커스터마이징|ErrorAttributes_에러_응답_필드_커스터마이징]]
- 전체 흐름 이전: [[02_Whitelabel_Error_Page_기본_뷰_매핑_및_에러_속성_제공|Whitelabel_Error_Page_기본_뷰_매핑_및_에러_속성_제공]]
- 전체 흐름 다음: [[02_응답_분기_HTML_요청과_JSON_AJAX_요청의_분리_처리|응답_분기_HTML_요청과_JSON_AJAX_요청의_분리_처리]]
- 통합 목차: [[00_통합_목차|통합 목차]]
