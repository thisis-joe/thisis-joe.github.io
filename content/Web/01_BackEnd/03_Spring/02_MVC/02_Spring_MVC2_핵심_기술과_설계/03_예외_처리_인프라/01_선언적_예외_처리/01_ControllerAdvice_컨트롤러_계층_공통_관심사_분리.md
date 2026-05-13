---
title: 01_ControllerAdvice_컨트롤러_계층_공통_관심사_분리
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# @ControllerAdvice: 컨트롤러 계층 공통 관심사 분리(AOP)

## 상위 맥락

`01_선언적_예외_처리 < 03_예외_처리_인프라 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

@ControllerAdvice는 컨트롤러 계층에서 발생하는 공통 예외 처리 로직을 별도 컴포넌트로 분리하기 위한 어노테이션입니다.
이를 AOP 관점에서 컨트롤러 계층의 공통 관심사를 분리하는 메커니즘으로 설명합니다.

기존 방식처럼 각 컨트롤러 메서드마다 try-catch를 작성하면 정상 비즈니스 흐름과 예외 처리 코드가 섞입니다.
@ControllerAdvice는 예외 처리 로직을 컨트롤러 밖으로 빼내어, 컨트롤러가 정상 요청 처리에 집중하게 합니다.

## @ExceptionHandler와의 관계

@ControllerAdvice 클래스 안에는 보통 [[02_ExceptionHandler_특정_예외_발생_시_핸들링_로직_정의|@ExceptionHandler]] 메서드를 둡니다.
특정 예외가 발생하면 DispatcherServlet이 해당 예외를 처리할 수 있는 @ExceptionHandler를 찾아 실행합니다.

## 적용 범위 제어

자료에서는 @ControllerAdvice가 전역으로 동작할 수도 있지만, 속성을 통해 적용 범위를 제한할 수 있다고 설명합니다.

- annotations: 특정 어노테이션이 붙은 컨트롤러에만 적용
- basePackages: 특정 패키지 하위 컨트롤러에만 적용
- assignableTypes: 특정 컨트롤러 타입에만 적용

## 우선순위

컨트롤러에서 예외가 발생하면 @ControllerAdvice가 1순위로 개입합니다.
여기서 처리되지 않은 예외는 [[01_BasicErrorController_미처리_예외에_대한_최종_처리기|BasicErrorController]]와 같은 스프링 부트 기본 처리로 넘어갑니다.

## 한 문장 요약

@ControllerAdvice는 컨트롤러의 정상 처리 코드와 예외 처리 공통 로직을 분리하여, 웹 계층 예외를 선언적으로 중앙 관리하게 해주는 AOP 성격의 컴포넌트입니다.

## 핵심 연결

[[01_횡단_관심사의_모듈화|AOP]], [[01_모든_HTTP_요청의_중앙_수신_및_분산_처리|DispatcherServlet]]와 함께 읽으면 좋습니다.

## 관련 문서

- 다음 문서: [[02_ExceptionHandler_특정_예외_발생_시_핸들링_로직_정의|ExceptionHandler_특정_예외_발생_시_핸들링_로직_정의]]
- 같은 묶음: [[02_ExceptionHandler_특정_예외_발생_시_핸들링_로직_정의|ExceptionHandler_특정_예외_발생_시_핸들링_로직_정의]]
- 전체 흐름 이전: [[03_addFlashAttribute_세션_기반_일회성_데이터_Flash_Scope|addFlashAttribute_세션_기반_일회성_데이터_Flash_Scope]]
- 전체 흐름 다음: [[02_ExceptionHandler_특정_예외_발생_시_핸들링_로직_정의|ExceptionHandler_특정_예외_발생_시_핸들링_로직_정의]]
- 통합 목차: [[00_통합_목차|통합 목차]]
