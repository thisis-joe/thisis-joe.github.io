---
title: 01_ResultMatcher_상태_코드_뷰_모델_데이터_검증
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# ResultMatcher: 상태 코드, 뷰, 모델 데이터 검증

## 상위 맥락

`03_검증과_응답_분석 < 01_Controller_단위_테스트 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

ResultMatcher는 MockMvc 테스트에서 응답 결과를 실제로 단언하는 검증 도구입니다. perform()이 요청을 실행하고 ResultActions가 결과를 감싸면, ResultMatcher는 그 결과의 특정 부분이 기대와 일치하는지 확인합니다.

자료에서는 MockMvcResultMatchers의 정적 메서드들을 통해 다양한 ResultMatcher를 얻고, 이를 andExpect에 전달한다고 설명합니다.

## 검증 대상

- 상태 코드: `status().is(200)`, `status().isOk()` 등으로 HTTP 상태를 검증합니다.
- 뷰 이름: `view().name(...)`으로 컨트롤러가 반환한 논리적 뷰 이름을 확인합니다.
- 모델 데이터: `model().attribute(...)`로 View에 전달될 데이터가 Model에 담겼는지 검증합니다.
- 포워드와 리다이렉트: `forwardedUrl(...)`, `redirectedUrl(...)`로 응답 흐름을 확인합니다.
- JSON 응답: [[02_jsonPath_JSON_응답_구조_및_리프_노드_값_추출|jsonPath]]로 응답 본문의 특정 값을 검증합니다.
- Content-Type: [[03_Content_Type_및_인코딩_상태_확인|Content-Type]] 검증으로 응답 형식을 확인합니다.

## 응답 형태별 검증 분리

뷰를 반환하는 컨트롤러는 status, view, model 중심으로 검증합니다.
반대로 @ResponseBody 기반 JSON API는 contentType과 jsonPath 중심으로 검증합니다.
자료에서는 응답 형식과 검증 방식이 맞지 않으면 충돌이 발생할 수 있으므로, SSR 화면 응답과 REST 응답의 검증 파이프라인을 분리해야 한다고 설명합니다.

## 한 문장 요약

ResultMatcher는 MockMvc 실행 결과의 상태 코드, 뷰, 모델, 리다이렉트 경로, JSON 본문 등을 구체적으로 검증하는 응답 분석 도구입니다.

## 핵심 연결

[[03_ResponseBody_JSON_데이터_직접_전송_Jackson|@ResponseBody]], [[01_MockMvc_WAS_미가동_가상_Servlet_환경|MockMvc]]와 함께 읽으면 좋습니다.

## 관련 문서

- 다음 문서: [[02_jsonPath_JSON_응답_구조_및_리프_노드_값_추출|jsonPath_JSON_응답_구조_및_리프_노드_값_추출]]
- 같은 묶음: [[02_jsonPath_JSON_응답_구조_및_리프_노드_값_추출|jsonPath_JSON_응답_구조_및_리프_노드_값_추출]], [[03_Content_Type_및_인코딩_상태_확인|Content_Type_및_인코딩_상태_확인]]
- 전체 흐름 이전: [[03_ResultActions_실행_결과에_대한_체이닝_접근|ResultActions_실행_결과에_대한_체이닝_접근]]
- 전체 흐름 다음: [[02_jsonPath_JSON_응답_구조_및_리프_노드_값_추출|jsonPath_JSON_응답_구조_및_리프_노드_값_추출]]
- 통합 목차: [[00_통합_목차|통합 목차]]
