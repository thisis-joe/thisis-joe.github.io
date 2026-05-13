---
title: 02_application_properties_prefix_suffix_설정
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# 경로 지정: application.properties 내 prefix, suffix 설정

## 상위 맥락

`02_JSP_연동_Legacy_설정 < 04_프로젝트_구조와_뷰_리소스 < 01_Spring_MVC1_기초와_아키텍처 < MVC < Spring < Web`

## 핵심 정리

JSP를 View로 사용할 때 컨트롤러는 `index` 같은 논리적 View 이름을 반환하고, ViewResolver는 application.properties에 설정된 prefix와 suffix를 붙여 실제 JSP 경로를 만듭니다.

## 기본 설정 예시

```properties
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp
```

이 설정이 있으면 컨트롤러의 다음 반환값은

```java
return "index";
```

다음 물리적 경로로 해석됩니다.

```text
/WEB-INF/views/index.jsp
```

## 왜 application.properties에 두는가

과거에는 InternalResourceViewResolver를 직접 @Bean으로 등록하고 setPrefix(), setSuffix()를 호출하는 방식으로 설정할 수 있었습니다.
스프링 부트에서는 application.properties에 값을 두면 자동 구성 흐름을 통해 ViewResolver 설정에 반영할 수 있습니다.

이 방식은 뷰 경로 설정을 자바 코드에서 분리합니다.
컨트롤러는 여전히 논리적 이름만 반환하고, 실제 파일 위치는 외부 설정으로 관리됩니다.

## WEB-INF 경로의 의미

JSP 파일을 `/WEB-INF/views/` 아래에 두면 브라우저가 직접 JSP 파일에 접근하지 못합니다.
화면 접근은 반드시 DispatcherServlet과 컨트롤러를 거치게 됩니다.
이는 MVC 흐름을 유지하는 데 중요한 구조입니다.

## 주의할 점

prefix와 suffix가 올바르게 설정되어 있어도 JSP 렌더링 엔진이 없으면 화면이 정상적으로 표시되지 않습니다.
따라서 JSP를 사용할 때는 [[01_tomcat_embed_jasper_라이브러리_수동_추가_필요|tomcat-embed-jasper 의존성]] 설정과 함께 확인해야 합니다.

또한 `redirect:`나 @ResponseBody 응답은 일반적인 prefix/suffix 조립 흐름을 타지 않습니다.
각각의 응답 메커니즘은 [[02_Redirect_redirect_접두어를_이용한_클라이언트_재요청]]와 [[03_ResponseBody_JSON_데이터_직접_전송_Jackson]]를 참고하면 됩니다.

## 한 문장 요약

application.properties의 prefix와 suffix 설정은 컨트롤러가 반환한 논리적 View 이름을 JSP의 실제 물리 경로로 변환하는 ViewResolver의 핵심 기준입니다.

## 핵심 연결

[[01_모든_HTTP_요청의_중앙_수신_및_분산_처리|DispatcherServlet]], [[03_ViewResolver_논리적_뷰_이름을_물리_경로로_변환|ViewResolver]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[01_tomcat_embed_jasper_라이브러리_수동_추가_필요|tomcat_embed_jasper_라이브러리_수동_추가_필요]]
- 같은 묶음: [[01_tomcat_embed_jasper_라이브러리_수동_추가_필요|tomcat_embed_jasper_라이브러리_수동_추가_필요]]
- 전체 흐름 이전: [[01_tomcat_embed_jasper_라이브러리_수동_추가_필요|tomcat_embed_jasper_라이브러리_수동_추가_필요]]
- 전체 흐름 다음: [[01_MockMvc_WAS_미가동_가상_Servlet_환경|MockMvc_WAS_미가동_가상_Servlet_환경]]
- 통합 목차: [[00_통합_목차|통합 목차]]
