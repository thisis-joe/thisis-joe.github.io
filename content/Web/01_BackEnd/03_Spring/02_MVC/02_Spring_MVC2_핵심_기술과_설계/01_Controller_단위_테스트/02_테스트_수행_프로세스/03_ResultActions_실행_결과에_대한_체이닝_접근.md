---
title: 03_ResultActions_실행_결과에_대한_체이닝_접근
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# ResultActions: 실행 결과에 대한 체이닝 접근

## 상위 맥락

`02_테스트_수행_프로세스 < 01_Controller_단위_테스트 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

ResultActions는 MockMvc의 perform() 실행 결과를 담는 객체입니다.
자료에서는 ResultActions가 `andExpect()` 메서드를 통해 실행 결과에 체이닝 방식으로 접근하게 해준다고 설명합니다.

perform()이 요청 실행을 담당한다면, ResultActions는 그 결과를 검증 단계로 넘기는 연결 지점입니다.
상태 코드, 뷰 이름, 모델 데이터, 포워드 경로, 리다이렉트 경로, JSON 응답 값 등을 연속적으로 검증할 수 있습니다.

## 체이닝 구조

ResultActions는 다음과 같은 흐름으로 사용됩니다.

```java
mockMvc.perform(request)
       .andExpect(status().isOk())
       .andExpect(view().name("...") )
       .andExpect(model().attributeExists("..."));
```

자료에서는 이 구조를 Fluent API 기반 체이닝으로 설명합니다. andExpect는 검증 후 다시 ResultActions를 반환하기 때문에 여러 검증을 자연스럽게 연결할 수 있습니다.

## 책임 분리

ResultActions 자체가 검증 로직을 모두 알고 있는 것은 아닙니다.
실제 검증은 [[01_ResultMatcher_상태_코드_뷰_모델_데이터_검증|ResultMatcher]]가 담당합니다.
ResultActions는 실행 결과를 보관하고, ResultMatcher를 받아 검증을 수행하도록 연결하는 역할을 합니다.

## 주의점

체이닝이 가능하다고 해서 하나의 테스트에 너무 많은 검증을 몰아넣으면 실패 지점이 흐려질 수 있습니다.
자료에서는 하나의 논리적 행위에 필요한 검증만 묶고, 라우팅 검증과 데이터 검증은 필요에 따라 분리하는 방향을 설명합니다.

## 한 문장 요약

ResultActions는 perform()의 실행 결과를 받아 andExpect 체이닝으로 상태, 뷰, 모델, JSON 응답을 단계적으로 검증하게 해주는 결과 접근 객체입니다.

## 핵심 연결

[[01_MockMvc_WAS_미가동_가상_Servlet_환경|MockMvc]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[02_perform_DispatcherServlet을_통한_요청_실행|perform_DispatcherServlet을_통한_요청_실행]]
- 같은 묶음: [[01_RequestBuilder_가상_요청_구성|RequestBuilder_가상_요청_구성]], [[02_perform_DispatcherServlet을_통한_요청_실행|perform_DispatcherServlet을_통한_요청_실행]]
- 전체 흐름 이전: [[02_perform_DispatcherServlet을_통한_요청_실행|perform_DispatcherServlet을_통한_요청_실행]]
- 전체 흐름 다음: [[01_ResultMatcher_상태_코드_뷰_모델_데이터_검증|ResultMatcher_상태_코드_뷰_모델_데이터_검증]]
- 통합 목차: [[00_통합_목차|통합 목차]]
