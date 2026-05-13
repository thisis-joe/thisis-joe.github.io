---
title: 01_모든_HTTP_요청의_중앙_수신_및_분산_처리
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# 역할: 모든 HTTP 요청의 중앙 집단 수신 및 분산 처리

## 상위 맥락

`01_DispatcherServlet과_Front_Controller < 02_MVC_아키텍처와_요청_흐름 < 01_Spring_MVC1_기초와_아키텍처 < MVC < Spring < Web`

## 핵심 정리

Spring MVC는 Front Controller 패턴을 사용하고, 그 중심에 DispatcherServlet이 있습니다.
DispatcherServlet은 클라이언트의 모든 HTTP 요청을 가장 먼저 받아들이는 중앙 진입점입니다.

## 중앙 수신의 의미

과거 방식에서는 요청마다 서블릿이나 컨트롤러가 개별적으로 존재하거나, 하나의 서블릿 안에서 action 파라미터와 switch 문으로 분기하는 구조가 사용될 수 있었습니다.
Spring MVC는 이 흐름을 DispatcherServlet 하나로 중앙화합니다.

모든 요청이 DispatcherServlet으로 들어오면, 공통 흐름을 한곳에서 통제할 수 있습니다.
하지만 DispatcherServlet이 모든 일을 직접 처리하는 것은 아닙니다.
DispatcherServlet은 전체 흐름을 지휘하고, 실제 세부 작업은 MVC 인프라 구성 요소에 위임합니다.

## 분산 처리 구조

DispatcherServlet은 요청을 받은 뒤 다음 인프라 객체들과 협력합니다.

- HandlerMapping: 요청 URL과 HTTP 메서드에 맞는 핸들러를 찾습니다.
- HandlerAdapter: 찾아낸 핸들러를 실제로 실행합니다.
- ViewResolver: 컨트롤러가 반환한 논리적 뷰 이름을 물리적 뷰 경로로 변환합니다.

이 구조 덕분에 DispatcherServlet은 중앙에서 요청을 수신하되, 각 책임은 분리된 객체에게 분산됩니다.

## AOP와 연결되는 의미

DispatcherServlet에서 HandlerAdapter, @Controller, Service로 이어지는 흐름은 스프링 빈 사이의 외부 호출 구조를 만듭니다.
이 구조는 AOP 프록시가 개입하기 좋은 형태입니다.
즉, MVC의 계층적 호출 흐름은 프록시 기반 AOP가 정상적으로 동작하는 기반이 됩니다.

## 한 문장 요약

DispatcherServlet은 모든 HTTP 요청을 중앙에서 받아들이고, HandlerMapping, HandlerAdapter, ViewResolver 같은 인프라 객체에게 작업을 위임하여 요청을 분산 처리합니다.

## 핵심 연결

[[01_횡단_관심사의_모듈화|AOP]], [[01_프록시_메커니즘_외부_호출_기준|프록시]], [[01_HandlerMapping_URL_기반_핸들러_검색|HandlerMapping]], [[02_HandlerAdapter_핸들러_실행_표준_인터페이스|HandlerAdapter]], [[03_ViewResolver_논리적_뷰_이름을_물리_경로로_변환|ViewResolver]]와 함께 읽으면 좋습니다.

## 관련 문서

- 다음 문서: [[02_공통_작업_통합_관리_및_컨트롤러_구현_단순화|공통_작업_통합_관리_및_컨트롤러_구현_단순화]]
- 같은 묶음: [[02_공통_작업_통합_관리_및_컨트롤러_구현_단순화|공통_작업_통합_관리_및_컨트롤러_구현_단순화]]
- 전체 흐름 이전: [[03_구조_설계_변경을_통한_프록시_외부_노출|구조_설계_변경을_통한_프록시_외부_노출]]
- 전체 흐름 다음: [[02_공통_작업_통합_관리_및_컨트롤러_구현_단순화|공통_작업_통합_관리_및_컨트롤러_구현_단순화]]
- 통합 목차: [[00_통합_목차|통합 목차]]
