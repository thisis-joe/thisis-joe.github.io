---
title: 02_Redirect_redirect_접두어를_이용한_클라이언트_재요청
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# Redirect: 'redirect:' 접두어를 이용한 클라이언트 재요청 유도

## 상위 맥락

`03_응답_메커니즘 < 03_Controller_요청_처리 < 01_Spring_MVC1_기초와_아키텍처 < MVC < Spring < Web`

## 핵심 정리

컨트롤러가 반환하는 문자열 앞에 `redirect:`를 붙이면, 스프링 MVC는 ViewResolver를 통한 내부 렌더링이 아니라 클라이언트 재요청 흐름으로 전환합니다.
즉, 브라우저에게 지정된 URL로 다시 요청하라고 응답합니다.

## 동작 원리

```java
return "redirect:/target";
```

이렇게 반환하면 서버는 `/target` 화면을 직접 렌더링하지 않습니다.
대신 클라이언트에게 새 URL로 요청을 보내도록 응답하고, 브라우저는 해당 경로로 다시 요청합니다.

## Forward와의 차이

Forward는 서버 내부 이동입니다.
클라이언트는 이동 사실을 알지 못하고 URL도 바뀌지 않습니다.
Request Scope도 유지됩니다.

Redirect는 클라이언트 재요청입니다.
브라우저 주소창이 바뀌고, 기존 Request Scope는 끝납니다.
새로운 요청이 시작되므로 Model에 담긴 요청 범위 데이터는 그대로 유지되지 않습니다.

## 왜 사용하는가

상태를 변경하는 POST 요청 이후에는 Redirect가 중요합니다.
데이터를 저장한 뒤 Forward로 결과 화면을 보여주면 사용자가 새로고침할 때 이전 POST 요청이 다시 전송될 수 있습니다.
Redirect를 사용하면 처리 후 GET 요청 흐름으로 바뀌므로 중복 제출 위험을 줄일 수 있습니다.

## ViewResolver와의 관계

`redirect:` 접두어가 있으면 일반적인 prefix/suffix 조립 대상으로 보지 않습니다.
스프링은 이를 특수한 응답 흐름으로 해석하고 Redirect 응답을 만듭니다.

## 한 문장 요약

`redirect:`는 서버 내부 렌더링이 아니라 브라우저에게 새로운 URL로 다시 요청하게 만드는 응답 흐름 전환 장치입니다.

## 핵심 연결

[[03_ViewResolver_논리적_뷰_이름을_물리_경로로_변환|ViewResolver]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[01_Forward_논리적_뷰_경로_문자열_리턴|Forward_논리적_뷰_경로_문자열_리턴]]
- 다음 문서: [[03_ResponseBody_JSON_데이터_직접_전송_Jackson|ResponseBody_JSON_데이터_직접_전송_Jackson]]
- 같은 묶음: [[01_Forward_논리적_뷰_경로_문자열_리턴|Forward_논리적_뷰_경로_문자열_리턴]], [[03_ResponseBody_JSON_데이터_직접_전송_Jackson|ResponseBody_JSON_데이터_직접_전송_Jackson]]
- 전체 흐름 이전: [[01_Forward_논리적_뷰_경로_문자열_리턴|Forward_논리적_뷰_경로_문자열_리턴]]
- 전체 흐름 다음: [[03_ResponseBody_JSON_데이터_직접_전송_Jackson|ResponseBody_JSON_데이터_직접_전송_Jackson]]
- 통합 목차: [[00_통합_목차|통합 목차]]
