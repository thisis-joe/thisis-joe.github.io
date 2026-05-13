---
title: 02_Whitelabel_Error_Page_기본_뷰_매핑_및_에러_속성_제공
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# Whitelabel Error Page: 기본 뷰 매핑 및 에러 속성 제공

## 상위 맥락

`02_스프링_부트_기본_매커니즘 < 03_예외_처리_인프라 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

Whitelabel Error Page는 명시적인 에러 페이지가 없을 때 스프링 부트가 최종적으로 보여주는 기본 에러 화면입니다.
자료에서는 BasicErrorController가 상태 코드별 에러 페이지를 찾고, 해당 페이지가 없으면 Whitelabel Error Page로 폴백한다고 설명합니다.

## 에러 페이지 탐색 흐름

1. 예외가 처리되지 않고 `/error` 경로로 전달됩니다.
2. BasicErrorController가 상태 코드별 에러 뷰를 찾습니다.
3. 예를 들어 `/error/404.jsp` 같은 구체적 에러 페이지를 먼저 찾습니다.
4. 없으면 공통 `/error.jsp` 같은 페이지를 찾습니다.
5. 이마저 없으면 Whitelabel Error Page가 렌더링됩니다.

## 에러 속성 제공

Whitelabel Error Page가 상태 코드, 메시지, 경로 같은 정보를 표시할 수 있는 이유는 ErrorAttributes가 에러 데이터를 제공하기 때문입니다.
자료에서는 application.properties 설정을 통해 메시지, 바인딩 오류, 예외 정보 노출 범위를 제어할 수 있다고 설명합니다.

## 주의할 점

운영 환경에서 Whitelabel Error Page와 상세한 예외 정보가 그대로 노출되면 내부 구조가 드러날 수 있습니다.
따라서 예측 가능한 비즈니스 예외는 [[01_ControllerAdvice_컨트롤러_계층_공통_관심사_분리|@ControllerAdvice]]에서 처리하고, 사용자에게 보여줄 에러 화면은 상태 코드별 커스텀 페이지로 대체하는 흐름이 자료의 설명과 맞습니다.

## 한 문장 요약

Whitelabel Error Page는 별도 에러 페이지가 준비되지 않았을 때 스프링 부트가 BasicErrorController를 통해 제공하는 최후의 기본 에러 화면입니다.

## 핵심 연결

[[01_BasicErrorController_미처리_예외에_대한_최종_처리기|BasicErrorController]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[01_BasicErrorController_미처리_예외에_대한_최종_처리기|BasicErrorController_미처리_예외에_대한_최종_처리기]]
- 같은 묶음: [[01_BasicErrorController_미처리_예외에_대한_최종_처리기|BasicErrorController_미처리_예외에_대한_최종_처리기]]
- 전체 흐름 이전: [[01_BasicErrorController_미처리_예외에_대한_최종_처리기|BasicErrorController_미처리_예외에_대한_최종_처리기]]
- 전체 흐름 다음: [[01_우선순위_Advice_기반_처리와_부트_기본_처리|우선순위_Advice_기반_처리와_부트_기본_처리]]
- 통합 목차: [[00_통합_목차|통합 목차]]
