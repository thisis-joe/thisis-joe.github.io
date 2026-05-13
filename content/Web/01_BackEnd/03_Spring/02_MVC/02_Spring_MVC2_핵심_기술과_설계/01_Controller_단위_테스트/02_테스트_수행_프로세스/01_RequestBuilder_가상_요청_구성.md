---
title: 01_RequestBuilder_가상_요청_구성
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# RequestBuilder: 가상 요청(메서드, 파라미터, 헤더) 구성

## 상위 맥락

`02_테스트_수행_프로세스 < 01_Controller_단위_테스트 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

MockMvc 테스트는 `요청 만들기 > perform 실행 > expect 검증`의 흐름으로 진행됩니다.
RequestBuilder는 이 중 첫 번째 단계인 가상 HTTP 요청 구성을 담당합니다.

자료에서는 MockMvcRequestBuilders의 정적 메서드인 `get`, `post`, `put`, `delete`, `fileUpload` 등을 통해 요청 메서드와 URI를 지정한다고 설명합니다.
여기에 파라미터, 헤더, 쿠키, 세션 속성, 플래시 속성, Content-Type, 파일 데이터를 체이닝 방식으로 추가할 수 있습니다.

## 구성 가능한 요청 정보

- HTTP 메서드와 URI: get, post, put, delete 등
- 요청 파라미터: param, params
- 헤더와 Content-Type: header, contentType
- 쿠키와 세션: cookie, sessionAttr
- 요청 속성 및 플래시 속성: requestAttr, flashAttr
- 파일 업로드: fileUpload 또는 멀티파트 요청 구성

## 설계적 의미

RequestBuilder는 실제 브라우저 없이도 특정 요청 상황을 코드로 재현하게 합니다.
특정 파라미터가 누락된 경우, 쿠키가 있는 경우, 세션 값이 있는 경우, JSON Content-Type이 지정된 경우 등을 모두 테스트 코드 안에서 결정론적으로 구성할 수 있습니다.

구성된 요청은 [[02_perform_DispatcherServlet을_통한_요청_실행|perform()]]으로 전달되어 DispatcherServlet을 거친 것처럼 실행됩니다.

## 한 문장 요약

RequestBuilder는 실제 클라이언트 요청을 대신해 HTTP 메서드, URI, 파라미터, 헤더, 쿠키, 세션 등을 가진 가상 요청을 만드는 테스트 파이프라인의 출발점입니다.

## 핵심 연결

[[01_모든_HTTP_요청의_중앙_수신_및_분산_처리|DispatcherServlet]], [[01_MockMvc_WAS_미가동_가상_Servlet_환경|MockMvc]]와 함께 읽으면 좋습니다.

## 관련 문서

- 다음 문서: [[02_perform_DispatcherServlet을_통한_요청_실행|perform_DispatcherServlet을_통한_요청_실행]]
- 같은 묶음: [[02_perform_DispatcherServlet을_통한_요청_실행|perform_DispatcherServlet을_통한_요청_실행]], [[03_ResultActions_실행_결과에_대한_체이닝_접근|ResultActions_실행_결과에_대한_체이닝_접근]]
- 전체 흐름 이전: [[03_MockBean_컨텍스트_내_실제_빈을_가짜_객체로_대체|MockBean_컨텍스트_내_실제_빈을_가짜_객체로_대체]]
- 전체 흐름 다음: [[02_perform_DispatcherServlet을_통한_요청_실행|perform_DispatcherServlet을_통한_요청_실행]]
- 통합 목차: [[00_통합_목차|통합 목차]]
