---
title: 01_tomcat_embed_jasper_라이브러리_수동_추가_필요
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# 의존성: tomcat-embed-jasper 라이브러리 수동 추가 필요

## 상위 맥락

`02_JSP_연동_Legacy_설정 < 04_프로젝트_구조와_뷰_리소스 < 01_Spring_MVC1_기초와_아키텍처 < MVC < Spring < Web`

## 핵심 정리

스프링 부트에서 JSP를 사용하려면 JSP를 컴파일하고 렌더링할 엔진이 필요합니다.
내장 톰캣 기본 구성만으로는 JSP 처리가 부족할 수 있으므로 `tomcat-embed-jasper` 의존성을 수동으로 추가해야 합니다.

## 왜 필요한가

컨트롤러가 논리적 View 이름을 반환하고 ViewResolver가 `.jsp` 파일 경로를 찾더라도, 실제 JSP 파일을 해석하고 HTML로 변환할 엔진이 없으면 렌더링이 실패합니다.
`tomcat-embed-jasper`는 이 JSP 렌더링 역할을 담당하는 라이브러리입니다.

JSP에서 JSTL을 사용한다면 관련 JSTL 의존성도 함께 필요할 수 있습니다.

## 레거시 지원 관점

스프링 부트는 독립 실행 가능한 구조와 현대적인 템플릿 엔진 사용 흐름에 더 잘 맞습니다.
JSP는 전통적인 서블릿/WAR 구조와 강하게 연결된 레거시 뷰 기술입니다.
따라서 JSP 연동은 기본 흐름이라기보다 기존 시스템이나 개인 학습 환경을 지원하기 위한 설정으로 이해하는 것이 좋습니다.

## 설정 누락 시 문제

ViewResolver의 prefix와 suffix를 올바르게 설정했더라도 JSP 엔진 의존성이 없으면 실제 렌더링 단계에서 문제가 발생합니다.
즉, 경로 설정과 엔진 의존성은 함께 맞아야 합니다.

## 연결되는 개념

JSP 경로를 어떻게 지정하는지는 [[02_application_properties_prefix_suffix_설정|application.properties prefix suffix 설정]]에서 이어서 정리합니다.
정적 리소스와 템플릿 리소스의 구분은 [[01_static_정적_웹_리소스_CSS_JS_Image]]과 [[02_templates_템플릿_엔진_파일_Thymeleaf_Mustache]]를 참고하면 됩니다.

## 한 문장 요약

스프링 부트에서 JSP를 렌더링하려면 ViewResolver 경로 설정만으로는 부족하며, JSP 엔진 역할을 하는 tomcat-embed-jasper 의존성을 추가해야 합니다.

## 핵심 연결

[[03_ViewResolver_논리적_뷰_이름을_물리_경로로_변환|ViewResolver]]와 함께 읽으면 좋습니다.

## 관련 문서

- 다음 문서: [[02_application_properties_prefix_suffix_설정|application_properties_prefix_suffix_설정]]
- 같은 묶음: [[02_application_properties_prefix_suffix_설정|application_properties_prefix_suffix_설정]]
- 전체 흐름 이전: [[02_templates_템플릿_엔진_파일_Thymeleaf_Mustache|templates_템플릿_엔진_파일_Thymeleaf_Mustache]]
- 전체 흐름 다음: [[02_application_properties_prefix_suffix_설정|application_properties_prefix_suffix_설정]]
- 통합 목차: [[00_통합_목차|통합 목차]]
