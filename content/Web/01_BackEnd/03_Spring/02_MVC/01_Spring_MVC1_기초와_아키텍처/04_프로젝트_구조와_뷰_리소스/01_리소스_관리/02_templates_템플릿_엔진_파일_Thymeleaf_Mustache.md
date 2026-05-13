---
title: 02_templates_템플릿_엔진_파일_Thymeleaf_Mustache
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# templates: 템플릿 엔진 파일 (Thymeleaf, Mustache)

## 상위 맥락

`01_리소스_관리 < 04_프로젝트_구조와_뷰_리소스 < 01_Spring_MVC1_기초와_아키텍처 < MVC < Spring < Web`

## 핵심 정리

`templates` 디렉토리는 Thymeleaf, Mustache 같은 템플릿 엔진 파일을 두는 위치입니다.
이 파일들은 정적 리소스처럼 그대로 전송되는 것이 아니라, 컨트롤러가 Model에 담은 데이터와 결합되어 동적인 HTML로 렌더링됩니다.

## static과의 차이

`static`은 CSS, JS, 이미지처럼 가공 없이 제공되는 리소스입니다.
반면 `templates`는 서버 측 렌더링이 필요한 파일을 둡니다.

- static: 있는 그대로 클라이언트에게 제공됩니다.
- templates: ViewResolver와 템플릿 엔진을 거쳐 Model 데이터가 반영된 HTML로 렌더링됩니다.

## ViewResolver와의 연결

컨트롤러가 `return "index";`처럼 논리적 View 이름을 반환하면, 스프링은 등록된 템플릿 엔진용 ViewResolver를 통해 `templates` 아래의 파일을 찾고 렌더링합니다.
이 구조 덕분에 컨트롤러는 실제 파일 위치나 템플릿 기술에 직접 의존하지 않습니다.

## JSP와의 구조적 차이

JSP는 전통적으로 `src/main/webapp/WEB-INF/views` 같은 웹 애플리케이션 전용 구조를 사용합니다.
반면 Thymeleaf나 Mustache는 스프링 부트의 클래스패스 기반 리소스 구조인 `src/main/resources/templates`와 잘 맞습니다.

자료에서는 JSP를 레거시 지원 관점으로 다루고, 현대적인 템플릿 엔진은 templates 구조와 연결해 설명합니다.

## 잘못된 위치에 둘 때 문제

동적 템플릿 파일을 static 아래에 두면 템플릿 엔진이 개입하지 못할 수 있습니다.
그러면 Model 데이터 표현식이 값으로 치환되지 않고 그대로 노출될 수 있습니다.
동적 화면 파일은 templates에, 정적 파일은 static에 두는 구분이 중요합니다.

## 한 문장 요약

templates 디렉토리는 Model 데이터와 결합되어 서버에서 동적으로 렌더링되는 Thymeleaf, Mustache 같은 템플릿 엔진 파일을 관리하는 공간입니다.

## 핵심 연결

[[03_ViewResolver_논리적_뷰_이름을_물리_경로로_변환|ViewResolver]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[01_static_정적_웹_리소스_CSS_JS_Image|static_정적_웹_리소스_CSS_JS_Image]]
- 같은 묶음: [[01_static_정적_웹_리소스_CSS_JS_Image|static_정적_웹_리소스_CSS_JS_Image]]
- 전체 흐름 이전: [[01_static_정적_웹_리소스_CSS_JS_Image|static_정적_웹_리소스_CSS_JS_Image]]
- 전체 흐름 다음: [[01_tomcat_embed_jasper_라이브러리_수동_추가_필요|tomcat_embed_jasper_라이브러리_수동_추가_필요]]
- 통합 목차: [[00_통합_목차|통합 목차]]
