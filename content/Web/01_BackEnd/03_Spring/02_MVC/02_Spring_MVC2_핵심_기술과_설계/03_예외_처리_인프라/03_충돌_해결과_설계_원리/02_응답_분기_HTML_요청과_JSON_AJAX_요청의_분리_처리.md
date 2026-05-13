---
title: 02_응답_분기_HTML_요청과_JSON_AJAX_요청의_분리_처리
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# 응답 분기: HTML 요청과 JSON/AJAX 요청의 분리 처리

## 상위 맥락

`03_충돌_해결과_설계_원리 < 03_예외_처리_인프라 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

응답 분기는 같은 오류 상황이라도 클라이언트가 HTML 화면을 기대하는지, JSON 데이터를 기대하는지에 따라 다른 응답을 반환하는 설계입니다.
자료에서는 이 문제가 예외 처리 인프라에서 특히 중요하다고 설명합니다.

브라우저의 일반 페이지 요청은 에러 화면을 기대합니다.
반면 AJAX나 REST 클라이언트는 JSON 객체를 기대합니다.
JSON을 기대하는 클라이언트에게 HTML 에러 페이지가 반환되면, 클라이언트의 `response.json()` 파싱 과정에서 오류가 발생할 수 있습니다.

## BasicErrorController의 분기 구조

자료에서는 BasicErrorController 확장 예시를 통해 다음 구조를 설명합니다.

- HTML 요청: `produces = MediaType.TEXT_HTML_VALUE` 조건을 가진 메서드가 ModelAndView를 반환합니다.
- JSON/AJAX 요청: ResponseEntity<Map<String, Object>> 형태로 에러 데이터를 반환합니다.

이 분기는 클라이언트의 Accept 헤더 또는 요청 컨텍스트에 따라 응답 형식을 나누는 방식입니다.

## 설계 의미

응답 분기는 단순히 에러 페이지를 다르게 보여주는 문제가 아닙니다.
서버와 클라이언트 사이의 데이터 계약을 지키는 문제입니다.
AJAX 요청은 JSON을 받아야 하고, 브라우저 요청은 HTML을 받아야 합니다.
이 경계가 무너지면 프론트엔드 파싱 오류나 사용자 경험 저하가 발생합니다.

## 연결되는 개념

응답 데이터의 필드는 [[03_ErrorAttributes_에러_응답_필드_커스터마이징|ErrorAttributes]]로 커스터마이징할 수 있고, 예측 가능한 비즈니스 예외는 [[01_ControllerAdvice_컨트롤러_계층_공통_관심사_분리|@ControllerAdvice]]에서 먼저 처리할 수 있습니다.

## 한 문장 요약

응답 분기는 같은 예외 상황에서도 HTML 클라이언트에는 에러 화면을, JSON/AJAX 클라이언트에는 JSON 에러 데이터를 반환하도록 처리 흐름을 나누는 설계 원리입니다.

## 핵심 연결

[[01_BasicErrorController_미처리_예외에_대한_최종_처리기|BasicErrorController]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[01_우선순위_Advice_기반_처리와_부트_기본_처리|우선순위_Advice_기반_처리와_부트_기본_처리]]
- 다음 문서: [[03_ErrorAttributes_에러_응답_필드_커스터마이징|ErrorAttributes_에러_응답_필드_커스터마이징]]
- 같은 묶음: [[01_우선순위_Advice_기반_처리와_부트_기본_처리|우선순위_Advice_기반_처리와_부트_기본_처리]], [[03_ErrorAttributes_에러_응답_필드_커스터마이징|ErrorAttributes_에러_응답_필드_커스터마이징]]
- 전체 흐름 이전: [[01_우선순위_Advice_기반_처리와_부트_기본_처리|우선순위_Advice_기반_처리와_부트_기본_처리]]
- 전체 흐름 다음: [[03_ErrorAttributes_에러_응답_필드_커스터마이징|ErrorAttributes_에러_응답_필드_커스터마이징]]
- 통합 목차: [[00_통합_목차|통합 목차]]
