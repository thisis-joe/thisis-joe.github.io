---
title: 02_HandlerAdapter_핸들러_실행_표준_인터페이스
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# HandlerAdapter: 핸들러 실행을 위한 표준 인터페이스 제공

## 상위 맥락

`02_MVC_인프라_구성_요소 < 02_MVC_아키텍처와_요청_흐름 < 01_Spring_MVC1_기초와_아키텍처 < MVC < Spring < Web`

## 핵심 정리

HandlerAdapter는 HandlerMapping이 찾아낸 핸들러를 실제로 실행하는 MVC 인프라 구성 요소입니다.
DispatcherServlet은 다양한 핸들러를 직접 호출하지 않고, 그 핸들러를 실행할 수 있는 HandlerAdapter에게 위임합니다.

## 왜 HandlerAdapter가 필요한가

스프링 MVC에는 다양한 형태의 핸들러가 존재합니다.
@Controller 메서드, HttpRequestHandler, WebSocketHandler처럼 실행 방식과 규격이 다른 핸들러를 DispatcherServlet이 직접 모두 알아야 한다면 DispatcherServlet의 결합도가 너무 높아집니다.

HandlerAdapter는 이 문제를 어댑터 패턴으로 해결합니다.
DispatcherServlet은 표준화된 HandlerAdapter 인터페이스만 호출하고, 각 어댑터가 실제 핸들러의 규격에 맞게 실행합니다.

## 실행 흐름

1. DispatcherServlet이 HandlerMapping으로부터 핸들러를 받습니다.
2. DispatcherServlet이 해당 핸들러를 실행할 수 있는 HandlerAdapter를 찾습니다.
3. HandlerAdapter가 실제 컨트롤러 메서드를 호출합니다.
4. 컨트롤러의 결과를 DispatcherServlet으로 돌려줌.

## 설계적 의미

이 구조는 개방-폐쇄 원칙과 연결됩니다.
새로운 형태의 핸들러가 추가되더라도 DispatcherServlet 자체를 수정하지 않고, 그 핸들러를 실행할 수 있는 어댑터를 추가하면 됩니다.

## 컨트롤러 로직과의 연결

HandlerAdapter가 @Controller 메서드를 실행하면 컨트롤러는 요청 분석, Service 호출, Model 저장, View 이름 반환 흐름을 수행합니다.
이 구체적인 실행 단계는 [[02_핸들러_어댑터를_통한_컨트롤러_로직_실행|핸들러 어댑터를 통한 컨트롤러 로직 실행]]에서 정리합니다.

## 한 문장 요약

HandlerAdapter는 다양한 핸들러 실행 방식을 표준화하여 DispatcherServlet과 실제 핸들러 사이의 결합도를 낮춥니다.

## 핵심 연결

[[01_모든_HTTP_요청의_중앙_수신_및_분산_처리|DispatcherServlet]], [[01_HandlerMapping_URL_기반_핸들러_검색|HandlerMapping]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[01_HandlerMapping_URL_기반_핸들러_검색|HandlerMapping_URL_기반_핸들러_검색]]
- 다음 문서: [[03_ViewResolver_논리적_뷰_이름을_물리_경로로_변환|ViewResolver_논리적_뷰_이름을_물리_경로로_변환]]
- 같은 묶음: [[01_HandlerMapping_URL_기반_핸들러_검색|HandlerMapping_URL_기반_핸들러_검색]], [[03_ViewResolver_논리적_뷰_이름을_물리_경로로_변환|ViewResolver_논리적_뷰_이름을_물리_경로로_변환]]
- 전체 흐름 이전: [[01_HandlerMapping_URL_기반_핸들러_검색|HandlerMapping_URL_기반_핸들러_검색]]
- 전체 흐름 다음: [[03_ViewResolver_논리적_뷰_이름을_물리_경로로_변환|ViewResolver_논리적_뷰_이름을_물리_경로로_변환]]
- 통합 목차: [[00_통합_목차|통합 목차]]
