---
title: 03_ViewResolver_논리적_뷰_이름을_물리_경로로_변환
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# ViewResolver: 논리적 뷰 이름을 물리적 리소스 경로로 변환

## 상위 맥락

`02_MVC_인프라_구성_요소 < 02_MVC_아키텍처와_요청_흐름 < 01_Spring_MVC1_기초와_아키텍처 < MVC < Spring < Web`

## 핵심 정리

ViewResolver는 컨트롤러가 반환한 논리적 뷰 이름을 실제 렌더링 가능한 물리적 리소스 경로로 바꾸는 MVC 인프라 구성 요소입니다.
컨트롤러는 `index` 같은 추상적인 이름만 반환하고, 실제 파일 위치는 ViewResolver가 결정합니다.

## 동작 원리

컨트롤러가 `return "index";`를 수행하면 DispatcherServlet은 이 문자열만으로 실제 화면 파일을 알 수 없습니다.
그래서 ViewResolver에게 View를 찾아달라고 요청합니다.

대표적으로 JSP를 사용할 때는 prefix와 suffix를 이용해 경로를 조립합니다.

```properties
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp
```

이 설정이 있다면 논리적 뷰 이름 `index`는 `/WEB-INF/views/index.jsp`로 해석됩니다.

## 설계적 의미

ViewResolver 덕분에 컨트롤러는 JSP, Thymeleaf, Mustache 같은 구체적인 뷰 기술이나 파일 위치를 알 필요가 없습니다.
컨트롤러는 논리적 이름만 반환하고, 화면 리소스의 실제 위치와 렌더링 방식은 인프라 설정으로 분리됩니다.

이 구조는 뷰 기술 변경이나 폴더 구조 변경이 있어도 컨트롤러 코드를 최소한으로 유지하게 합니다.

## 예외적인 응답 흐름

모든 응답이 ViewResolver를 통과하는 것은 아닙니다.
`redirect:` 접두어가 붙으면 클라이언트 재요청 흐름으로 전환됩니다.
@ResponseBody가 붙으면 ViewResolver를 우회하고 JSON 데이터 응답으로 처리됩니다.

관련 내용은 [[02_Redirect_redirect_접두어를_이용한_클라이언트_재요청|Redirect]]와 [[03_ResponseBody_JSON_데이터_직접_전송_Jackson|@ResponseBody JSON 응답]]에서 정리합니다.

## 한 문장 요약

ViewResolver는 컨트롤러가 반환한 논리적 뷰 이름을 실제 화면 리소스 경로로 변환하여, 컨트롤러와 뷰 기술의 결합을 낮춥니다.

## 핵심 연결

[[01_모든_HTTP_요청의_중앙_수신_및_분산_처리|DispatcherServlet]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[02_HandlerAdapter_핸들러_실행_표준_인터페이스|HandlerAdapter_핸들러_실행_표준_인터페이스]]
- 같은 묶음: [[01_HandlerMapping_URL_기반_핸들러_검색|HandlerMapping_URL_기반_핸들러_검색]], [[02_HandlerAdapter_핸들러_실행_표준_인터페이스|HandlerAdapter_핸들러_실행_표준_인터페이스]]
- 전체 흐름 이전: [[02_HandlerAdapter_핸들러_실행_표준_인터페이스|HandlerAdapter_핸들러_실행_표준_인터페이스]]
- 전체 흐름 다음: [[01_클라이언트_요청_수신_및_핸들러_결정|클라이언트_요청_수신_및_핸들러_결정]]
- 통합 목차: [[00_통합_목차|통합 목차]]
