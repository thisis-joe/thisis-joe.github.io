---
title: 01_MockMvc_WAS_미가동_가상_Servlet_환경
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# MockMvc: WAS 미가동 가상 Servlet 환경

## 상위 맥락

`01_Mock_환경과_인프라 < 01_Controller_단위_테스트 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

MockMvc는 실제 WAS를 구동하지 않고도 Spring MVC와 소통하는 웹 환경을 가상으로 제공하는 테스트 객체입니다.
컨트롤러 테스트를 위해 실제 브라우저, 네트워크, 서버를 모두 거치지 않아도 가상의 HTTP 요청과 응답을 만들 수 있습니다.

자료에서는 MockMvc의 핵심 목적을 `@Controller 단위 테스트`로 설명합니다.
컨트롤러가 요청을 받고, 파라미터를 바인딩하고, 응답 상태나 뷰 이름 또는 JSON 데이터를 반환하는 흐름을 서버 구동 없이 빠르게 검증하는 데 사용됩니다.

## Mock 환경에서의 역할

MockMvc는 앞단의 WAS와 Servlet 환경을 가짜로 제공합니다.
테스트 코드는 [[01_RequestBuilder_가상_요청_구성|RequestBuilder]]로 가상 요청을 만들고, [[02_perform_DispatcherServlet을_통한_요청_실행|perform()]]으로 요청을 실행하며, [[03_ResultActions_실행_결과에_대한_체이닝_접근|ResultActions]]와 ResultMatcher로 결과를 검증합니다.

이 구조 덕분에 컨트롤러는 실제 서버 환경 없이도 DispatcherServlet을 거친 것처럼 동작합니다.
따라서 단순히 컨트롤러 메서드를 직접 호출하는 테스트보다 Spring MVC의 매핑, 바인딩, 응답 처리 과정을 더 실제 흐름에 가깝게 검증할 수 있습니다.

## 함께 쓰이는 구성 요소

- [[02_WebMvcTest_MVC_관련_설정만_로드하는_슬라이스_테스트|@WebMvcTest]]: 웹 계층에 필요한 설정만 로드합니다.
- [[03_MockBean_컨텍스트_내_실제_빈을_가짜_객체로_대체|@MockBean]]: 컨트롤러가 의존하는 Service를 가짜 객체로 대체합니다.
- [[01_ResultMatcher_상태_코드_뷰_모델_데이터_검증|ResultMatcher]]: HTTP 상태, 뷰, 모델, JSON 응답을 검증합니다.

## 한 문장 요약

MockMvc는 실제 WAS를 띄우지 않고도 Spring MVC의 요청-응답 흐름을 가상 Servlet 환경에서 검증하게 해주는 컨트롤러 테스트 핵심 도구입니다.

## 핵심 연결

[[01_모든_HTTP_요청의_중앙_수신_및_분산_처리|DispatcherServlet]]와 함께 읽으면 좋습니다.

## 관련 문서

- 다음 문서: [[02_WebMvcTest_MVC_관련_설정만_로드하는_슬라이스_테스트|WebMvcTest_MVC_관련_설정만_로드하는_슬라이스_테스트]]
- 같은 묶음: [[02_WebMvcTest_MVC_관련_설정만_로드하는_슬라이스_테스트|WebMvcTest_MVC_관련_설정만_로드하는_슬라이스_테스트]], [[03_MockBean_컨텍스트_내_실제_빈을_가짜_객체로_대체|MockBean_컨텍스트_내_실제_빈을_가짜_객체로_대체]]
- 전체 흐름 이전: [[02_application_properties_prefix_suffix_설정|application_properties_prefix_suffix_설정]]
- 전체 흐름 다음: [[02_WebMvcTest_MVC_관련_설정만_로드하는_슬라이스_테스트|WebMvcTest_MVC_관련_설정만_로드하는_슬라이스_테스트]]
- 통합 목차: [[00_통합_목차|통합 목차]]
