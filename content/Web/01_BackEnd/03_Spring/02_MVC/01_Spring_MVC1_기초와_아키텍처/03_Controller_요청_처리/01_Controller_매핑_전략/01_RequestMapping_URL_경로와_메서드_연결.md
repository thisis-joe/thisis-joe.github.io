---
title: 01_RequestMapping_URL_경로와_메서드_연결
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# @RequestMapping: URL 경로와 메서드 연결 (Type/Method 레벨)

## 상위 맥락

`01_Controller_매핑_전략 < 03_Controller_요청_처리 < 01_Spring_MVC1_기초와_아키텍처 < MVC < Spring < Web`

## 핵심 정리

@RequestMapping은 클라이언트의 HTTP 요청을 컨트롤러의 특정 메서드와 연결하는 매핑 어노테이션입니다.
클래스 레벨과 메서드 레벨에 모두 사용할 수 있으며, 두 레벨의 경로가 결합되어 최종 URL이 만들어집니다.

## Type 레벨 매핑

클래스 레벨의 @RequestMapping은 해당 컨트롤러가 담당하는 공통 경로를 지정합니다.
예를 들어 클래스에 `/simple`이 지정되어 있으면, 그 컨트롤러 안의 메서드들은 기본적으로 `/simple` 하위 요청을 담당합니다.

이 방식은 컨트롤러의 책임 범위를 도메인별로 묶는 데 도움이 됩니다.

## Method 레벨 매핑

메서드 레벨의 @RequestMapping은 실제 요청 처리 메서드의 세부 경로를 지정합니다.
클래스 레벨이 `/simple`, 메서드 레벨이 `/hello`라면 최종 요청 경로는 `/simple/hello`가 됩니다.

## HandlerMapping과의 연결

애플리케이션이 실행될 때 HandlerMapping은 @Controller 빈을 스캔하고 @RequestMapping 정보를 분석합니다.
이후 요청이 들어오면 URL과 HTTP 메서드를 기준으로 어떤 컨트롤러 메서드를 실행할지 결정합니다.

## 주의할 점

서로 다른 컨트롤러나 메서드가 동일한 URL과 HTTP 메서드를 가지면 매핑이 모호해집니다.
따라서 클래스 레벨에서 도메인별 공통 경로를 명확히 지정하고, 메서드 레벨에서는 역할이 분명한 경로를 지정하는 것이 좋습니다.

또한 매핑 메서드끼리 내부 호출을 통해 로직을 재사용하려고 하면 AOP 프록시 우회 문제가 생길 수 있습니다.
공통 로직은 컨트롤러 내부 메서드가 아니라 Service로 분리하는 흐름이 적절합니다.

## 한 문장 요약

@RequestMapping은 클래스 레벨의 공통 경로와 메서드 레벨의 세부 경로를 결합하여 HTTP 요청을 특정 컨트롤러 메서드에 연결합니다.

## 핵심 연결

[[01_횡단_관심사의_모듈화|AOP]], [[01_프록시_메커니즘_외부_호출_기준|프록시]], [[02_내부_호출_문제_Self_invocation|내부 호출]], [[01_HandlerMapping_URL_기반_핸들러_검색|HandlerMapping]]와 함께 읽으면 좋습니다.

## 관련 문서

- 다음 문서: [[02_HTTP_Method_제약_GetMapping_PostMapping|HTTP_Method_제약_GetMapping_PostMapping]]
- 같은 묶음: [[02_HTTP_Method_제약_GetMapping_PostMapping|HTTP_Method_제약_GetMapping_PostMapping]]
- 전체 흐름 이전: [[04_뷰_리졸버를_통한_화면_렌더링_및_응답|뷰_리졸버를_통한_화면_렌더링_및_응답]]
- 전체 흐름 다음: [[02_HTTP_Method_제약_GetMapping_PostMapping|HTTP_Method_제약_GetMapping_PostMapping]]
- 통합 목차: [[00_통합_목차|통합 목차]]
