---
title: 02_ArgumentResolver_파라미터_타입별_자동_매핑_메커니즘
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# ArgumentResolver: 파라미터 타입별 자동 매핑 메커니즘

## 상위 맥락

`01_자동_주입_아키텍처 < 02_요청_파라미터_바인딩 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

Spring MVC 컨트롤러 메서드는 정해진 인터페이스를 구현하지 않아도 다양한 파라미터를 자유롭게 선언할 수 있습니다.
자료에서는 이런 유연성이 파라미터 타입과 어노테이션을 분석해 필요한 값을 자동으로 채워 넣는 구조에서 나온다고 설명합니다.
이 영역을 담당하는 내부 메커니즘이 ArgumentResolver입니다.

## 자동 주입 대상

- Servlet API 객체: HttpServletRequest, HttpServletResponse, HttpSession 등
- Spring MVC 지원 객체: Model, RedirectAttributes 등
- 요청 파라미터: @RequestParam 기반 단일 값 또는 컬렉션
- 복합 객체: @ModelAttribute 기반 DTO 바인딩
- 쿠키 값: @CookieValue 기반 쿠키 추출
- 파일 데이터: MultipartFile 기반 파일 업로드 바인딩

## 작동 원리

ArgumentResolver는 컨트롤러 메서드의 각 파라미터를 보고 다음을 판단합니다.

1. 이 파라미터를 처리할 수 있는 Resolver가 있는가.
2. 요청에서 어떤 값을 꺼내야 하는가.
3. 문자열 데이터를 어떤 타입으로 변환해야 하는가.
4. 객체 생성이나 setter 호출이 필요한가.
5. 최종적으로 메서드 인자로 무엇을 전달할 것인가.

이 과정 덕분에 개발자는 HttpServletRequest를 직접 파싱하지 않고도 필요한 데이터를 메서드 파라미터로 바로 받을 수 있습니다.

## MockMvc와의 연결

[[01_RequestBuilder_가상_요청_구성|RequestBuilder]]로 만든 가상 요청도 실제 요청과 같은 바인딩 파이프라인을 통과합니다.
따라서 테스트에서는 `.param()`, `.cookie()`, `.flashAttr()`로 원시 데이터를 넣고, 컨트롤러에서는 자동 변환된 타입이나 DTO를 받는 흐름을 검증할 수 있습니다.

## 한 문장 요약

ArgumentResolver는 컨트롤러 파라미터의 타입과 어노테이션을 분석하여 요청 데이터를 자동으로 꺼내고 변환해 주는 Spring MVC 파라미터 바인딩의 핵심 메커니즘입니다.

## 핵심 연결

[[01_RequestParam_쿼리_파라미터_및_폼_데이터_매핑|@RequestParam]], [[01_MockMvc_WAS_미가동_가상_Servlet_환경|MockMvc]], [[01_MultipartFile_멀티파트_요청_캡슐화_인터페이스|MultipartFile]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[01_Servlet_API_HttpServletRequest_Response_직접_제어|Servlet_API_HttpServletRequest_Response_직접_제어]]
- 같은 묶음: [[01_Servlet_API_HttpServletRequest_Response_직접_제어|Servlet_API_HttpServletRequest_Response_직접_제어]]
- 전체 흐름 이전: [[01_Servlet_API_HttpServletRequest_Response_직접_제어|Servlet_API_HttpServletRequest_Response_직접_제어]]
- 전체 흐름 다음: [[01_RequestParam_쿼리_파라미터_및_기본_타입_매핑|RequestParam_쿼리_파라미터_및_기본_타입_매핑]]
- 통합 목차: [[00_통합_목차|통합 목차]]
