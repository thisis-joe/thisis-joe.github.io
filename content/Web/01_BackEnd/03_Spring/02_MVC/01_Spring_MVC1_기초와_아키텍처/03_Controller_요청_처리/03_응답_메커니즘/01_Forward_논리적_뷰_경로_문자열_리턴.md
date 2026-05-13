---
title: 01_Forward_논리적_뷰_경로_문자열_리턴
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# View 반환: 논리적 뷰 경로 문자열 리턴 (Forward)

## 상위 맥락

`03_응답_메커니즘 < 03_Controller_요청_처리 < 01_Spring_MVC1_기초와_아키텍처 < MVC < Spring < Web`

## 핵심 정리

컨트롤러가 `return "index";`처럼 문자열을 반환하면, 기본적으로 논리적 View 이름을 반환한 것으로 해석됩니다.
DispatcherServlet은 이 문자열을 ViewResolver에 전달하고, 서버 내부에서 해당 View로 forward하여 화면을 렌더링합니다.

## Forward의 동작

Forward는 클라이언트에게 새 요청을 보내라고 하지 않습니다.
서버 내부에서 요청 흐름이 View로 이동하고, 같은 Request Scope 안에서 화면이 렌더링됩니다.

이 때문에 컨트롤러가 Model에 저장한 데이터가 View까지 유지됩니다.

```java
model.addAttribute("msg", echoData);
return "index";
```

이 경우 `index`는 ViewResolver를 통해 실제 경로로 변환되고, View는 Model 데이터를 이용해 화면을 만듭니다.

## 논리적 이름을 사용하는 이유

컨트롤러가 `/WEB-INF/views/index.jsp` 같은 물리적 경로를 직접 반환하면 뷰 기술과 폴더 구조에 강하게 결합됩니다.
반면 `index` 같은 논리적 이름만 반환하면 실제 경로 조립은 ViewResolver가 담당합니다.

## Redirect와의 차이

Forward는 서버 내부 이동이고, Redirect는 클라이언트에게 새 요청을 보내게 하는 방식입니다.
Forward에서는 Request Scope가 유지되지만, Redirect에서는 기존 요청이 끝나므로 Request Scope 데이터가 그대로 유지되지 않습니다.

Redirect는 [[02_Redirect_redirect_접두어를_이용한_클라이언트_재요청]]에서 별도로 정리합니다.

## 주의할 점

POST로 데이터를 저장한 뒤 단순 Forward를 반환하면 새로고침 시 같은 POST가 다시 전송될 수 있습니다.
상태 변경 작업 이후에는 Redirect를 사용하는 흐름이 안전합니다.

## 한 문장 요약

논리적 View 이름 반환은 서버 내부 Forward를 통해 화면을 렌더링하는 기본 응답 방식이며, Model 데이터가 같은 요청 범위 안에서 View로 전달됩니다.

## 핵심 연결

[[01_모든_HTTP_요청의_중앙_수신_및_분산_처리|DispatcherServlet]], [[03_ViewResolver_논리적_뷰_이름을_물리_경로로_변환|ViewResolver]]와 함께 읽으면 좋습니다.

## 관련 문서

- 다음 문서: [[02_Redirect_redirect_접두어를_이용한_클라이언트_재요청|Redirect_redirect_접두어를_이용한_클라이언트_재요청]]
- 같은 묶음: [[02_Redirect_redirect_접두어를_이용한_클라이언트_재요청|Redirect_redirect_접두어를_이용한_클라이언트_재요청]], [[03_ResponseBody_JSON_데이터_직접_전송_Jackson|ResponseBody_JSON_데이터_직접_전송_Jackson]]
- 전체 흐름 이전: [[03_Model_객체를_활용한_Request_Scope_데이터_공유|Model_객체를_활용한_Request_Scope_데이터_공유]]
- 전체 흐름 다음: [[02_Redirect_redirect_접두어를_이용한_클라이언트_재요청|Redirect_redirect_접두어를_이용한_클라이언트_재요청]]
- 통합 목차: [[00_통합_목차|통합 목차]]
