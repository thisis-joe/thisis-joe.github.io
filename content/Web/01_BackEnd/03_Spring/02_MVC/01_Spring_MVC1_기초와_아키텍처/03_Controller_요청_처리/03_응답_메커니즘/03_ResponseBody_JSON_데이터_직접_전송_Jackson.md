---
title: 03_ResponseBody_JSON_데이터_직접_전송_Jackson
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# Data 반환: @ResponseBody를 통한 JSON 데이터 직접 전송 (Jackson)

## 상위 맥락

`03_응답_메커니즘 < 03_Controller_요청_처리 < 01_Spring_MVC1_기초와_아키텍처 < MVC < Spring < Web`

## 핵심 정리

@ResponseBody는 컨트롤러의 반환값을 View 이름으로 해석하지 않고 HTTP 응답 본문에 직접 쓰게 하는 어노테이션입니다.
화면 렌더링이 아니라 JSON 데이터 응답을 만들 때 사용합니다.

## 기본 View 흐름과의 차이

일반 컨트롤러에서 문자열을 반환하면 스프링은 그것을 논리적 View 이름으로 봅니다.
ViewResolver가 개입해 실제 JSP나 템플릿을 찾습니다.

하지만 @ResponseBody가 붙으면 이 흐름을 우회합니다.
DispatcherServlet은 반환 객체를 ViewResolver로 넘기지 않고, HTTP Response Body에 직접 기록해야 할 데이터로 처리합니다.

## Jackson의 역할

자바 객체나 Map은 네트워크로 그대로 보낼 수 없습니다.
JSON 문자열로 바꾸는 직렬화 과정이 필요합니다.
스프링은 Jackson-data-bind 같은 라이브러리를 이용해 객체를 JSON으로 자동 변환합니다.

예를 들어 컨트롤러가 Map이나 DTO를 반환하면, 스프링은 이를 JSON 형식으로 변환해 응답 본문에 기록합니다.

## 누락 시 발생하는 문제

JSON을 반환하려는 메서드에서 @ResponseBody를 누락하면, 스프링은 반환값을 데이터가 아니라 View 이름으로 오해할 수 있습니다.
그러면 ViewResolver가 존재하지 않는 JSP나 템플릿을 찾으려 하면서 오류가 발생할 수 있습니다.

API 응답을 담당하는 컨트롤러라면 메서드마다 @ResponseBody를 붙이는 대신, 클래스 레벨에서 @RestController를 사용하는 방식도 같은 흐름의 확장으로 이해할 수 있습니다.

## 다양한 응답 메커니즘 속 위치

Spring MVC의 응답은 크게 세 가지로 구분됩니다.

- Forward: 논리적 View 이름 반환.
- Redirect: `redirect:` 접두어로 클라이언트 재요청 유도.
- Data 반환: @ResponseBody로 JSON 데이터 직접 응답.

## 한 문장 요약

@ResponseBody는 ViewResolver를 우회하고 Jackson을 통해 자바 객체를 JSON으로 변환하여 HTTP 응답 본문에 직접 전송하게 합니다.

## 핵심 연결

[[01_모든_HTTP_요청의_중앙_수신_및_분산_처리|DispatcherServlet]], [[03_ViewResolver_논리적_뷰_이름을_물리_경로로_변환|ViewResolver]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[02_Redirect_redirect_접두어를_이용한_클라이언트_재요청|Redirect_redirect_접두어를_이용한_클라이언트_재요청]]
- 같은 묶음: [[01_Forward_논리적_뷰_경로_문자열_리턴|Forward_논리적_뷰_경로_문자열_리턴]], [[02_Redirect_redirect_접두어를_이용한_클라이언트_재요청|Redirect_redirect_접두어를_이용한_클라이언트_재요청]]
- 전체 흐름 이전: [[02_Redirect_redirect_접두어를_이용한_클라이언트_재요청|Redirect_redirect_접두어를_이용한_클라이언트_재요청]]
- 전체 흐름 다음: [[01_static_정적_웹_리소스_CSS_JS_Image|static_정적_웹_리소스_CSS_JS_Image]]
- 통합 목차: [[00_통합_목차|통합 목차]]
