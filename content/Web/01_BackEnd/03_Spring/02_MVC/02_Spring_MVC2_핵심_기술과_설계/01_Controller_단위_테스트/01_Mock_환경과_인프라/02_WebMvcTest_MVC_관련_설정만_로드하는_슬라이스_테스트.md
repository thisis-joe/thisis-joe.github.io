---
title: 02_WebMvcTest_MVC_관련_설정만_로드하는_슬라이스_테스트
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# @WebMvcTest: MVC 관련 설정만 로드하는 슬라이스 테스트

## 상위 맥락

`01_Mock_환경과_인프라 < 01_Controller_단위_테스트 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

@WebMvcTest는 애플리케이션 전체 컨텍스트를 로드하지 않고, MVC 요청 처리에 필요한 웹 계층 구성 요소만 제한적으로 로드하는 슬라이스 테스트용 어노테이션입니다.
자료에서는 특정 컨트롤러를 대상으로 `@WebMvcTest(value = SimpleController.class)`와 같은 방식으로 테스트 대상을 좁히는 흐름을 설명합니다.

이 방식은 컨트롤러의 매핑, 파라미터 바인딩, 모델 저장, 뷰 또는 JSON 응답 같은 웹 계층 동작만 빠르게 검증하기 위한 것입니다.

## MockMvc와의 관계

@WebMvcTest는 웹 슬라이스 환경을 만들고, MockMvc는 그 환경 안에서 가상 요청을 실행합니다.
즉, @WebMvcTest가 테스트 무대를 구성한다면 MockMvc는 그 무대에서 HTTP 요청을 만들어 컨트롤러로 보내는 실행 도구입니다.

전체 빈이 필요한 테스트라면 @SpringBootTest와 @AutoConfigureMockMvc를 함께 사용할 수 있습니다.
반면 컨트롤러 단위의 빠른 검증이 목적이라면 @WebMvcTest와 MockMvc 조합이 적합합니다.

## 하위 계층 격리

슬라이스 테스트에서는 Service, Repository 같은 하위 계층이 실제로 로드되지 않을 수 있습니다.
따라서 컨트롤러가 의존하는 Service는 [[03_MockBean_컨텍스트_내_실제_빈을_가짜_객체로_대체|@MockBean]] 또는 자료에서 언급된 @MockitoBean을 이용해 가짜 객체로 대체합니다.
이렇게 해야 컨트롤러가 정상적으로 주입을 받고, 테스트는 웹 계층 동작에만 집중할 수 있습니다.

## 한 문장 요약

@WebMvcTest는 전체 애플리케이션이 아니라 MVC 웹 계층만 잘라내어 MockMvc와 함께 컨트롤러를 빠르고 독립적으로 검증하게 해주는 테스트 설정입니다.

## 핵심 연결

[[01_MockMvc_WAS_미가동_가상_Servlet_환경|MockMvc]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[01_MockMvc_WAS_미가동_가상_Servlet_환경|MockMvc_WAS_미가동_가상_Servlet_환경]]
- 다음 문서: [[03_MockBean_컨텍스트_내_실제_빈을_가짜_객체로_대체|MockBean_컨텍스트_내_실제_빈을_가짜_객체로_대체]]
- 같은 묶음: [[01_MockMvc_WAS_미가동_가상_Servlet_환경|MockMvc_WAS_미가동_가상_Servlet_환경]], [[03_MockBean_컨텍스트_내_실제_빈을_가짜_객체로_대체|MockBean_컨텍스트_내_실제_빈을_가짜_객체로_대체]]
- 전체 흐름 이전: [[01_MockMvc_WAS_미가동_가상_Servlet_환경|MockMvc_WAS_미가동_가상_Servlet_환경]]
- 전체 흐름 다음: [[03_MockBean_컨텍스트_내_실제_빈을_가짜_객체로_대체|MockBean_컨텍스트_내_실제_빈을_가짜_객체로_대체]]
- 통합 목차: [[00_통합_목차|통합 목차]]
