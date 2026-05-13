---
title: 02_jsonPath_JSON_응답_구조_및_리프_노드_값_추출
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# jsonPath: JSON 응답 구조 및 리프 노드 값 추출

## 상위 맥락

`03_검증과_응답_분석 < 01_Controller_단위_테스트 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

jsonPath는 @ResponseBody 기반 REST 응답처럼 application/json 형태로 내려온 응답 본문을 세밀하게 검증하기 위한 매처입니다.
자료에서는 JSON의 루트 엘리먼트, 속성, 배열 인덱스, 중첩 객체의 리프 노드까지 접근할 수 있는 도구로 설명합니다.

## 표현식 읽는 법

- `$`: JSON 응답의 루트 엘리먼트입니다.
- `$.name`: 루트 하위의 name 속성 값을 추출합니다.
- `$.hobby[0]`: hobby 배열의 첫 번째 요소를 추출합니다.
- `$.hobby[0].name`: 배열 내부 객체의 name 속성까지 접근합니다.
- `$.hobby.length()`: 배열의 길이를 검증합니다.

## 검증 흐름

일반적으로 JSON 응답 검증은 다음 순서로 이해하면 됩니다.

1. status로 HTTP 응답 상태를 확인합니다.
2. contentType으로 JSON 응답인지 확인합니다.
3. jsonPath로 본문의 특정 필드와 값을 확인합니다.

자료에서는 `jsonPath("$.name", equalTo("hong gil dong"))`처럼 특정 리프 노드 값을 기대값과 비교하는 방식이 소개됩니다.

## 의미

jsonPath를 사용하면 응답 문자열을 직접 파싱하지 않고도, 클라이언트와 약속한 JSON 구조가 맞는지 검증할 수 있습니다.
이는 REST API 테스트에서 응답 계약을 확인하는 가장 직접적인 방법입니다.

## 한 문장 요약

jsonPath는 JSON 응답을 루트부터 리프 노드까지 경로 표현식으로 탐색하여, 응답 구조와 값을 정밀하게 검증하게 해주는 도구입니다.

## 핵심 연결

[[03_ResponseBody_JSON_데이터_직접_전송_Jackson|@ResponseBody]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[01_ResultMatcher_상태_코드_뷰_모델_데이터_검증|ResultMatcher_상태_코드_뷰_모델_데이터_검증]]
- 다음 문서: [[03_Content_Type_및_인코딩_상태_확인|Content_Type_및_인코딩_상태_확인]]
- 같은 묶음: [[01_ResultMatcher_상태_코드_뷰_모델_데이터_검증|ResultMatcher_상태_코드_뷰_모델_데이터_검증]], [[03_Content_Type_및_인코딩_상태_확인|Content_Type_및_인코딩_상태_확인]]
- 전체 흐름 이전: [[01_ResultMatcher_상태_코드_뷰_모델_데이터_검증|ResultMatcher_상태_코드_뷰_모델_데이터_검증]]
- 전체 흐름 다음: [[03_Content_Type_및_인코딩_상태_확인|Content_Type_및_인코딩_상태_확인]]
- 통합 목차: [[00_통합_목차|통합 목차]]
