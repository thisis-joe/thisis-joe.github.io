---
title: 03_Content_Type_및_인코딩_상태_확인
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# Content-Type 및 인코딩 상태 확인

## 상위 맥락

`03_검증과_응답_분석 < 01_Controller_단위_테스트 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

Content-Type 검증은 컨트롤러가 클라이언트와 약속한 응답 형식을 정확히 반환했는지 확인하는 과정입니다.
특히 @ResponseBody로 JSON 데이터를 반환하는 경우, 응답이 실제로 application/json인지 확인하는 것은 본문 값 검증보다 먼저 수행되어야 합니다.

자료에서는 `content().contentType(MediaType.APPLICATION_JSON)`과 같은 방식으로 응답의 미디어 타입을 검증한다고 설명합니다.
이는 단순 문자열 비교가 아니라, Spring의 MediaType을 기준으로 응답 규약을 확인하는 방식입니다.

## 요청과 응답의 대칭성

테스트의 요청 구성 단계에서도 `contentType(MediaType.APPLICATION_JSON)`을 지정할 수 있습니다.
이 경우 테스트는 다음 흐름을 확인할 수 있습니다.

1. 클라이언트가 특정 Content-Type으로 요청합니다.
2. Spring MVC가 요청 데이터를 올바르게 해석합니다.
3. 컨트롤러가 처리 결과를 만듭니다.
4. 응답이 기대한 Content-Type으로 다시 반환됩니다.

## JSON 응답과의 연결

Content-Type이 JSON으로 확인된 뒤에는 [[02_jsonPath_JSON_응답_구조_및_리프_노드_값_추출|jsonPath]]로 응답 본문 내부를 검증합니다.
즉, Content-Type은 응답의 외형 규약을 확인하고, jsonPath는 실제 데이터 구조와 값을 확인합니다.

## 인코딩과 Base64 연결

자료에서는 파일이나 이미지 데이터를 Base64로 인코딩해 HTML 또는 JSON 내부에 삽입하는 흐름도 함께 다룹니다.
이때도 응답 데이터가 어떤 형식으로 인코딩되어 전달되는지 확인하는 관점에서 Content-Type과 인코딩 상태의 이해가 필요합니다.

## 한 문장 요약

Content-Type 검증은 컨트롤러 응답이 HTML인지 JSON인지, 그리고 클라이언트가 기대하는 데이터 형식으로 정확히 반환되는지를 확인하는 응답 계약 검증입니다.

## 핵심 연결

[[03_ResponseBody_JSON_데이터_직접_전송_Jackson|@ResponseBody]], [[01_Base64_Encoding_바이너리의_텍스트화_및_인라인_삽입|Base64]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[02_jsonPath_JSON_응답_구조_및_리프_노드_값_추출|jsonPath_JSON_응답_구조_및_리프_노드_값_추출]]
- 같은 묶음: [[01_ResultMatcher_상태_코드_뷰_모델_데이터_검증|ResultMatcher_상태_코드_뷰_모델_데이터_검증]], [[02_jsonPath_JSON_응답_구조_및_리프_노드_값_추출|jsonPath_JSON_응답_구조_및_리프_노드_값_추출]]
- 전체 흐름 이전: [[02_jsonPath_JSON_응답_구조_및_리프_노드_값_추출|jsonPath_JSON_응답_구조_및_리프_노드_값_추출]]
- 전체 흐름 다음: [[01_Servlet_API_HttpServletRequest_Response_직접_제어|Servlet_API_HttpServletRequest_Response_직접_제어]]
- 통합 목차: [[00_통합_목차|통합 목차]]
