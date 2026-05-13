---
title: 01_static_정적_웹_리소스_CSS_JS_Image
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# static: 정적 웹 리소스 (CSS, JS, Image)

## 상위 맥락

`01_리소스_관리 < 04_프로젝트_구조와_뷰_리소스 < 01_Spring_MVC1_기초와_아키텍처 < MVC < Spring < Web`

## 핵심 정리

`static` 디렉토리는 CSS, JavaScript, 이미지, 정적 HTML처럼 서버에서 별도 렌더링이나 데이터 바인딩 없이 그대로 클라이언트에게 제공되는 리소스를 두는 위치입니다.
스프링 부트에서는 보통 `src/main/resources/static` 아래에 정적 자원을 둡니다.

## 정적 리소스의 특징

정적 리소스는 컨트롤러의 비즈니스 로직이나 ViewResolver 렌더링을 거치지 않아도 됩니다.
브라우저가 CSS나 이미지 파일을 요청하면, 스프링은 정적 리소스 핸들러를 통해 해당 파일을 찾아 그대로 응답합니다.

예시는 다음과 같습니다.

- CSS 파일
- JS 파일
- 이미지 파일
- 별도 서버 처리 없이 제공되는 정적 HTML

## MVC 처리 흐름과의 관계

일반적인 동적 요청은 DispatcherServlet, HandlerMapping, HandlerAdapter, Controller, ViewResolver 흐름을 탑니다.
정적 리소스 요청은 비즈니스 로직이 필요하지 않으므로 이 무거운 흐름을 모두 거칠 필요가 없습니다.

자료에서는 정적 리소스와 동적 리소스를 분리하여 관리해야 한다는 흐름을 강조합니다.

## 경로 충돌 주의

정적 리소스 URL과 컨트롤러 매핑 URL이 겹치면 혼선이 생길 수 있습니다.
예를 들어 `/css/common.css` 같은 경로를 컨트롤러가 가로채면 원래 의도한 CSS 파일이 제대로 제공되지 않을 수 있습니다.
따라서 정적 리소스 경로와 API 또는 웹 컨트롤러 경로의 네임스페이스를 분리하는 것이 좋습니다.

## 한 문장 요약

static 디렉토리는 서버 렌더링 없이 그대로 제공되는 CSS, JS, 이미지 같은 정적 리소스를 두는 공간이며, 동적 View 리소스와 분리해서 관리해야 합니다.

## 핵심 연결

[[01_모든_HTTP_요청의_중앙_수신_및_분산_처리|DispatcherServlet]], [[01_HandlerMapping_URL_기반_핸들러_검색|HandlerMapping]], [[02_HandlerAdapter_핸들러_실행_표준_인터페이스|HandlerAdapter]], [[03_ViewResolver_논리적_뷰_이름을_물리_경로로_변환|ViewResolver]]와 함께 읽으면 좋습니다.

## 관련 문서

- 다음 문서: [[02_templates_템플릿_엔진_파일_Thymeleaf_Mustache|templates_템플릿_엔진_파일_Thymeleaf_Mustache]]
- 같은 묶음: [[02_templates_템플릿_엔진_파일_Thymeleaf_Mustache|templates_템플릿_엔진_파일_Thymeleaf_Mustache]]
- 전체 흐름 이전: [[03_ResponseBody_JSON_데이터_직접_전송_Jackson|ResponseBody_JSON_데이터_직접_전송_Jackson]]
- 전체 흐름 다음: [[02_templates_템플릿_엔진_파일_Thymeleaf_Mustache|templates_템플릿_엔진_파일_Thymeleaf_Mustache]]
- 통합 목차: [[00_통합_목차|통합 목차]]
