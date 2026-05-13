---
title: 02_ExceptionHandler_특정_예외_발생_시_핸들링_로직_정의
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# @ExceptionHandler: 특정 예외 발생 시 핸들링 로직 정의

## 상위 맥락

`01_선언적_예외_처리 < 03_예외_처리_인프라 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

@ExceptionHandler는 특정 예외 타입이 발생했을 때 실행할 처리 메서드를 선언하는 어노테이션입니다.
자료에서는 기존 try-catch 방식 대신 예외 타입과 처리 메서드를 매핑하는 선언적 예외 처리 방식으로 설명합니다.

컨트롤러 로직 중 예외가 발생하면 DispatcherServlet은 예외를 바로 WAS에 넘기지 않고, 해당 예외를 처리할 수 있는 @ExceptionHandler가 있는지 먼저 찾습니다.

## 사용 위치

- 특정 컨트롤러 내부: 해당 컨트롤러에서 발생한 예외만 처리합니다.
- @ControllerAdvice 내부: 여러 컨트롤러에서 발생한 예외를 전역 또는 범위 제한 방식으로 처리합니다.

## 처리 결과

@ExceptionHandler 메서드는 예외 객체를 받아 로그를 남기거나, 에러 메시지를 모델에 담거나, 특정 에러 뷰를 반환할 수 있습니다.
JSON 응답이 필요한 경우에는 @ResponseBody 또는 ResponseEntity를 사용해 데이터 형태로 응답할 수도 있습니다.

## 응답 형식 주의

자료에서는 HTML 요청과 AJAX/JSON 요청을 같은 방식으로 처리하면 충돌이 생길 수 있다고 설명합니다.
AJAX 요청이 JSON을 기대하는데 HTML 에러 페이지가 반환되면 클라이언트 파싱 오류가 발생할 수 있습니다.
따라서 예외 처리 응답도 클라이언트 요청 형식에 맞게 분리해야 합니다.

## 한 문장 요약

@ExceptionHandler는 특정 예외 타입과 처리 로직을 연결하여, 예외 발생 시 컨트롤러 밖에서 일관된 응답을 만들게 해주는 선언적 예외 처리 도구입니다.

## 핵심 연결

[[01_모든_HTTP_요청의_중앙_수신_및_분산_처리|DispatcherServlet]], [[03_ResponseBody_JSON_데이터_직접_전송_Jackson|@ResponseBody]], [[01_ControllerAdvice_컨트롤러_계층_공통_관심사_분리|@ControllerAdvice]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[01_ControllerAdvice_컨트롤러_계층_공통_관심사_분리|ControllerAdvice_컨트롤러_계층_공통_관심사_분리]]
- 같은 묶음: [[01_ControllerAdvice_컨트롤러_계층_공통_관심사_분리|ControllerAdvice_컨트롤러_계층_공통_관심사_분리]]
- 전체 흐름 이전: [[01_ControllerAdvice_컨트롤러_계층_공통_관심사_분리|ControllerAdvice_컨트롤러_계층_공통_관심사_분리]]
- 전체 흐름 다음: [[01_BasicErrorController_미처리_예외에_대한_최종_처리기|BasicErrorController_미처리_예외에_대한_최종_처리기]]
- 통합 목차: [[00_통합_목차|통합 목차]]
