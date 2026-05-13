---
title: 02_perform_DispatcherServlet을_통한_요청_실행
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# perform(): DispatcherServlet을 통한 요청 실행

## 상위 맥락

`02_테스트_수행_프로세스 < 01_Controller_단위_테스트 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

perform()은 RequestBuilder로 만든 가상 요청을 MockMvc 환경 안으로 밀어 넣어 실제 Spring MVC 요청 처리 흐름을 실행하는 메서드입니다.
자료에서는 perform()을 `요청 생성`과 `결과 검증`을 이어주는 핵심 실행 트리거로 설명합니다.

단순히 컨트롤러 메서드를 직접 호출하는 것이 아니라, 가상의 DispatcherServlet을 통해 요청을 처리합니다.
따라서 HandlerMapping, HandlerAdapter, 파라미터 바인딩, 메시지 변환, 예외 처리 흐름까지 Spring MVC의 핵심 경로가 함께 검증됩니다.

## 실행 흐름

1. [[01_RequestBuilder_가상_요청_구성|RequestBuilder]]가 가상의 HTTP 요청을 만듭니다.
2. MockMvc의 perform()이 요청을 실행합니다.
3. DispatcherServlet이 요청에 맞는 컨트롤러 메서드를 찾습니다.
4. HandlerAdapter가 컨트롤러 메서드를 호출합니다.
5. 처리 결과가 [[03_ResultActions_실행_결과에_대한_체이닝_접근|ResultActions]]로 반환됩니다.
6. andExpect 체이닝을 통해 결과를 검증합니다.

## 예외 처리와의 연결

perform() 중 예외가 발생하면 DispatcherServlet은 바로 테스트 실패로 끝내는 것이 아니라 Spring MVC의 예외 처리 인프라를 따릅니다.
즉, [[01_ControllerAdvice_컨트롤러_계층_공통_관심사_분리|@ControllerAdvice]]나 [[02_ExceptionHandler_특정_예외_발생_시_핸들링_로직_정의|@ExceptionHandler]]가 먼저 개입할 수 있고, 처리되지 않은 예외는 [[01_BasicErrorController_미처리_예외에_대한_최종_처리기|BasicErrorController]] 쪽으로 위임될 수 있습니다.

## 한 문장 요약

perform()은 가상 요청을 DispatcherServlet 기반의 Spring MVC 처리 흐름에 태워 실행하고, 그 결과를 검증 가능한 객체로 돌려주는 MockMvc 테스트의 실행 엔진입니다.

## 핵심 연결

[[01_모든_HTTP_요청의_중앙_수신_및_분산_처리|DispatcherServlet]], [[01_HandlerMapping_URL_기반_핸들러_검색|HandlerMapping]], [[02_HandlerAdapter_핸들러_실행_표준_인터페이스|HandlerAdapter]], [[01_MockMvc_WAS_미가동_가상_Servlet_환경|MockMvc]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[01_RequestBuilder_가상_요청_구성|RequestBuilder_가상_요청_구성]]
- 다음 문서: [[03_ResultActions_실행_결과에_대한_체이닝_접근|ResultActions_실행_결과에_대한_체이닝_접근]]
- 같은 묶음: [[01_RequestBuilder_가상_요청_구성|RequestBuilder_가상_요청_구성]], [[03_ResultActions_실행_결과에_대한_체이닝_접근|ResultActions_실행_결과에_대한_체이닝_접근]]
- 전체 흐름 이전: [[01_RequestBuilder_가상_요청_구성|RequestBuilder_가상_요청_구성]]
- 전체 흐름 다음: [[03_ResultActions_실행_결과에_대한_체이닝_접근|ResultActions_실행_결과에_대한_체이닝_접근]]
- 통합 목차: [[00_통합_목차|통합 목차]]
