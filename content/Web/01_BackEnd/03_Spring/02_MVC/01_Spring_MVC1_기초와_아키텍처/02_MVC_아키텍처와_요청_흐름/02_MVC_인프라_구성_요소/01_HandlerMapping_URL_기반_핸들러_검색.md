---
title: 01_HandlerMapping_URL_기반_핸들러_검색
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# HandlerMapping: URL 기반 적합한 핸들러(컨트롤러) 검색

## 상위 맥락

`02_MVC_인프라_구성_요소 < 02_MVC_아키텍처와_요청_흐름 < 01_Spring_MVC1_기초와_아키텍처 < MVC < Spring < Web`

## 핵심 정리

HandlerMapping은 DispatcherServlet이 받은 요청을 실제로 처리할 핸들러를 찾아주는 MVC 인프라 구성 요소입니다.
요청 URL, HTTP 메서드, @RequestMapping 계열 어노테이션 정보를 바탕으로 적절한 컨트롤러 메서드를 결정합니다.

## HandlerMapping의 역할

클라이언트 요청이 DispatcherServlet에 도착하면 DispatcherServlet은 직접 컨트롤러를 고르지 않습니다.
대신 HandlerMapping에게 “이 요청을 처리할 핸들러가 누구인가”를 묻습니다.

HandlerMapping은 애플리케이션 구동 시 스프링 컨테이너의 @Controller 빈을 스캔하고, 클래스 레벨과 메서드 레벨의 매핑 정보를 분석해 둡니다.
이후 실제 요청이 들어오면 이 매핑 정보를 기반으로 해당 요청에 맞는 핸들러를 반환합니다.

## 왜 ControllerMapping이 아니라 HandlerMapping인가

스프링 MVC에서 요청 처리 객체는 @Controller만 있는 것이 아닙니다.
HttpRequestHandler, WebSocketHandler, 정적 리소스를 처리하는 핸들러 등 다양한 형태가 존재할 수 있습니다.
그래서 스프링은 더 넓은 개념인 Handler라는 용어를 사용합니다.

HandlerMapping은 특정 컨트롤러 타입에 종속되지 않고, 요청을 처리할 수 있는 모든 핸들러를 찾는 역할을 담당합니다.

## HandlerAdapter와의 분리

HandlerMapping은 핸들러를 찾기만 합니다.
실행은 HandlerAdapter의 책임입니다.
이 검색과 실행의 분리는 스프링 MVC가 다양한 핸들러 타입을 지원할 수 있게 하는 핵심 구조입니다.

## 연결되는 개념

찾은 핸들러를 실제로 실행하는 과정은 [[02_HandlerAdapter_핸들러_실행_표준_인터페이스|HandlerAdapter]]에서 이어집니다.
HandlerMapping이 사용하는 매핑 규칙은 [[01_RequestMapping_URL_경로와_메서드_연결|@RequestMapping]]과 [[02_HTTP_Method_제약_GetMapping_PostMapping|HTTP Method 제약]]에서 정리합니다.

## 한 문장 요약

HandlerMapping은 요청 URL과 매핑 정보를 바탕으로 DispatcherServlet에게 “이 요청을 처리할 핸들러”를 찾아 반환합니다.

## 핵심 연결

[[01_모든_HTTP_요청의_중앙_수신_및_분산_처리|DispatcherServlet]]와 함께 읽으면 좋습니다.

## 관련 문서

- 다음 문서: [[02_HandlerAdapter_핸들러_실행_표준_인터페이스|HandlerAdapter_핸들러_실행_표준_인터페이스]]
- 같은 묶음: [[02_HandlerAdapter_핸들러_실행_표준_인터페이스|HandlerAdapter_핸들러_실행_표준_인터페이스]], [[03_ViewResolver_논리적_뷰_이름을_물리_경로로_변환|ViewResolver_논리적_뷰_이름을_물리_경로로_변환]]
- 전체 흐름 이전: [[02_공통_작업_통합_관리_및_컨트롤러_구현_단순화|공통_작업_통합_관리_및_컨트롤러_구현_단순화]]
- 전체 흐름 다음: [[02_HandlerAdapter_핸들러_실행_표준_인터페이스|HandlerAdapter_핸들러_실행_표준_인터페이스]]
- 통합 목차: [[00_통합_목차|통합 목차]]
