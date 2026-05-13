---
title: 02_addAttribute_URL_쿼리_스트링을_통한_데이터_노출
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# addAttribute: URL 쿼리 스트링을 통한 데이터 노출

## 상위 맥락

`03_리다이렉션_데이터_관리 < 02_요청_파라미터_바인딩 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

RedirectAttributes의 addAttribute는 리다이렉트 대상 URL에 데이터를 쿼리 스트링 형태로 붙여 전달하는 방식입니다.
예를 들어 key와 value를 추가하면 리다이렉트 URL 뒤에 `?key=value` 형태로 노출됩니다.

리다이렉트는 새로운 요청을 만들기 때문에 기존 Request Scope 데이터가 사라집니다. addAttribute는 데이터를 URL에 포함시켜 다음 요청에서 다시 @RequestParam 등으로 받을 수 있게 합니다.

## 특징

- 데이터가 브라우저 주소창에 노출됩니다.
- 문자열 중심의 단순 데이터 전달에 적합합니다.
- 새로고침 후에도 URL에 남아 반복 전달됩니다.
- 검색 조건, 페이지 번호, 식별자처럼 유지되어야 하는 값에 적합합니다.

## 한계

자료에서는 URL이 지저분해지고, 객체 타입을 그대로 전달하기 어렵다는 한계를 설명합니다.
또한 “저장 완료” 같은 일회성 메시지를 addAttribute로 넘기면 새로고침 때마다 같은 메시지가 계속 유지될 수 있습니다.

## addFlashAttribute와의 구분

- addAttribute: URL에 남겨야 하는 명시적 상태 전달
- [[03_addFlashAttribute_세션_기반_일회성_데이터_Flash_Scope|addFlashAttribute]]: URL에 노출하지 않고 한 번만 사용할 임시 데이터 전달

## 한 문장 요약

addAttribute는 리다이렉트 시 데이터를 URL 쿼리 스트링으로 노출해 다음 요청까지 유지시키는 단순하고 명시적인 데이터 전달 방식입니다.

## 핵심 연결

[[01_RequestParam_쿼리_파라미터_및_폼_데이터_매핑|@RequestParam]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[01_RedirectAttributes_리다이렉트_시_데이터_소실_방지|RedirectAttributes_리다이렉트_시_데이터_소실_방지]]
- 다음 문서: [[03_addFlashAttribute_세션_기반_일회성_데이터_Flash_Scope|addFlashAttribute_세션_기반_일회성_데이터_Flash_Scope]]
- 같은 묶음: [[01_RedirectAttributes_리다이렉트_시_데이터_소실_방지|RedirectAttributes_리다이렉트_시_데이터_소실_방지]], [[03_addFlashAttribute_세션_기반_일회성_데이터_Flash_Scope|addFlashAttribute_세션_기반_일회성_데이터_Flash_Scope]]
- 전체 흐름 이전: [[01_RedirectAttributes_리다이렉트_시_데이터_소실_방지|RedirectAttributes_리다이렉트_시_데이터_소실_방지]]
- 전체 흐름 다음: [[03_addFlashAttribute_세션_기반_일회성_데이터_Flash_Scope|addFlashAttribute_세션_기반_일회성_데이터_Flash_Scope]]
- 통합 목차: [[00_통합_목차|통합 목차]]
