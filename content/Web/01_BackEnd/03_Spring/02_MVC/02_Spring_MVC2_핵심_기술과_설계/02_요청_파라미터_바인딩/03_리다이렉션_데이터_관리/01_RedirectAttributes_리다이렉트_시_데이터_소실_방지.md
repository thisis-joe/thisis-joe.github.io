---
title: 01_RedirectAttributes_리다이렉트_시_데이터_소실_방지
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# RedirectAttributes: 리다이렉트 시 데이터 소실 방지

## 상위 맥락

`03_리다이렉션_데이터_관리 < 02_요청_파라미터_바인딩 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

RedirectAttributes는 리다이렉트 상황에서 데이터를 다음 요청으로 전달하기 위한 전용 객체입니다.
리다이렉트는 서버 내부 이동이 아니라 클라이언트에게 새 URL로 다시 요청하라고 지시하는 방식이므로, 기존 Request와 Model 데이터가 그대로 유지되지 않습니다.

자료에서는 이 데이터 소실 문제를 해결하기 위해 RedirectAttributes가 두 가지 전달 방식을 제공한다고 설명합니다.

## 두 가지 전달 방식

- [[02_addAttribute_URL_쿼리_스트링을_통한_데이터_노출|addAttribute]]: 데이터를 URL 쿼리 스트링으로 붙여 전달합니다.
- [[03_addFlashAttribute_세션_기반_일회성_데이터_Flash_Scope|addFlashAttribute]]: 데이터를 세션에 임시 저장했다가 다음 요청에서 한 번만 꺼내 쓰는 Flash Scope 방식으로 전달합니다.

## 왜 필요한가

일반적인 Model은 forward 흐름에서 View로 데이터를 넘기기 위한 객체입니다.
그러나 redirect는 기존 요청이 끝나고 새로운 요청이 시작되기 때문에 Model 데이터가 사라집니다.
RedirectAttributes는 이 단절을 보완하기 위한 리다이렉트 전용 데이터 전달 컨테이너입니다.

## 선택 기준

새로고침 후에도 유지되어야 하는 검색 조건, 페이지 번호, 식별자 같은 값은 URL에 남는 addAttribute가 적합합니다.
반대로 “저장되었습니다” 같은 일회성 메시지나 노출되면 안 되는 임시 객체는 addFlashAttribute가 적합합니다.

## 한 문장 요약

RedirectAttributes는 리다이렉트로 인해 기존 요청 데이터가 사라지는 문제를 URL 파라미터 또는 Flash Scope 방식으로 보완하는 리다이렉션 전용 데이터 관리 객체입니다.

## 관련 문서

- 다음 문서: [[02_addAttribute_URL_쿼리_스트링을_통한_데이터_노출|addAttribute_URL_쿼리_스트링을_통한_데이터_노출]]
- 같은 묶음: [[02_addAttribute_URL_쿼리_스트링을_통한_데이터_노출|addAttribute_URL_쿼리_스트링을_통한_데이터_노출]], [[03_addFlashAttribute_세션_기반_일회성_데이터_Flash_Scope|addFlashAttribute_세션_기반_일회성_데이터_Flash_Scope]]
- 전체 흐름 이전: [[03_CookieValue_HTTP_쿠키_정보_자동_추출_및_형변환|CookieValue_HTTP_쿠키_정보_자동_추출_및_형변환]]
- 전체 흐름 다음: [[02_addAttribute_URL_쿼리_스트링을_통한_데이터_노출|addAttribute_URL_쿼리_스트링을_통한_데이터_노출]]
- 통합 목차: [[00_통합_목차|통합 목차]]
