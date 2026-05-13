---
title: 03_ErrorAttributes_에러_응답_필드_커스터마이징
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# ErrorAttributes: 에러 응답 필드 커스터마이징

## 상위 맥락

`03_충돌_해결과_설계_원리 < 03_예외_처리_인프라 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

ErrorAttributes는 스프링 부트 에러 응답에 들어갈 데이터 필드를 제공하는 인터페이스입니다.
자료에서는 BasicErrorController가 직접 에러 정보를 모두 만들기보다 ErrorAttributes로부터 상태 코드, 메시지, 경로 같은 에러 속성을 받아 응답에 사용한다고 설명합니다.

## BasicErrorController와의 관계

[[01_BasicErrorController_미처리_예외에_대한_최종_처리기|BasicErrorController]]는 에러 응답의 흐름을 담당합니다.
HTML 요청이면 에러 뷰를 반환하고, JSON/AJAX 요청이면 ResponseEntity 형태로 에러 데이터를 반환합니다.
이때 실제 응답 본문에 들어가는 Map 형태의 데이터는 ErrorAttributes가 제공합니다.

## 커스터마이징이 필요한 이유

기본 에러 응답 필드는 모든 프로젝트의 API 규격과 일치하지 않을 수 있습니다.
기업이나 프로젝트마다 에러 코드, 메시지 구조, 추적 ID, 상세 필드 등이 다를 수 있습니다.
자료에서는 ErrorAttributes를 재정의하여 에러 응답 필드 구조를 조정할 수 있다고 설명합니다.

## application.properties와의 연결

간단한 노출 범위 제어는 application.properties 설정으로 가능합니다.
예를 들어 에러 메시지, 예외 정보, 바인딩 오류를 포함할지 여부를 설정할 수 있습니다.
그러나 응답 필드 구조 자체를 바꾸려면 ErrorAttributes 재정의가 필요합니다.

## 설계 위치

- @ControllerAdvice: 예측 가능한 예외를 직접 처리합니다.
- BasicErrorController: 미처리 예외의 최종 응답 흐름을 담당합니다.
- ErrorAttributes: 그 응답에 담길 데이터 필드를 구성합니다.

## 한 문장 요약

ErrorAttributes는 BasicErrorController가 HTML 또는 JSON 에러 응답을 만들 때 사용할 에러 데이터 필드를 제공하고, 필요하면 프로젝트 규격에 맞게 재정의할 수 있는 커스터마이징 지점입니다.

## 핵심 연결

[[01_ControllerAdvice_컨트롤러_계층_공통_관심사_분리|@ControllerAdvice]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[02_응답_분기_HTML_요청과_JSON_AJAX_요청의_분리_처리|응답_분기_HTML_요청과_JSON_AJAX_요청의_분리_처리]]
- 같은 묶음: [[01_우선순위_Advice_기반_처리와_부트_기본_처리|우선순위_Advice_기반_처리와_부트_기본_처리]], [[02_응답_분기_HTML_요청과_JSON_AJAX_요청의_분리_처리|응답_분기_HTML_요청과_JSON_AJAX_요청의_분리_처리]]
- 전체 흐름 이전: [[02_응답_분기_HTML_요청과_JSON_AJAX_요청의_분리_처리|응답_분기_HTML_요청과_JSON_AJAX_요청의_분리_처리]]
- 전체 흐름 다음: [[01_MultipartFile_멀티파트_요청_캡슐화_인터페이스|MultipartFile_멀티파트_요청_캡슐화_인터페이스]]
- 통합 목차: [[00_통합_목차|통합 목차]]
