---
title: 01-vue-overview
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-27T05:00:07+09:00
---

# Vue 개요

## 한 줄 정의

Vue는 사용자 인터페이스를 만들기 위한 JavaScript 프레임워크이며, 컴포넌트 단위로 화면과 상태를 구성한다.

## 왜 ZIP:ON에 필요한가

ZIP:ON은 화면이 많다.

```text
홈
검색 결과
지역 상세
매물 상세
지도 탐색
관심 목록
커뮤니티
마이페이지
```

Vue를 사용하면 이 화면들을 View와 Component로 나누어 관리할 수 있다.

## Vue에서 중요한 생각

```text
화면은 상태의 결과다.
상태가 바뀌면 화면이 다시 그려진다.
반복되는 UI는 Component로 분리한다.
URL에 따라 보이는 화면은 Router가 관리한다.
백엔드 API 호출은 api module로 분리한다.
```

## ZIP:ON 프론트 구조

```text
src/views:
라우트와 연결되는 페이지 단위 화면

src/components:
재사용 가능한 UI 조각

src/router:
URL과 View 연결

src/api:
백엔드 호출 함수

src/layouts:
현재는 layout 분리 후보/보조 파일. 실제 공통 shell은 App.vue가 담당
```

## 실습 미션

```text
1. HomeView.vue와 MainHero.vue의 역할 차이를 설명한다.
2. App.vue가 /map route에서 Footer를 숨기는 조건을 찾는다.
3. SearchBar.vue가 여러 화면에서 재사용될 수 있는지 생각한다.
```

## 공식 출처

- [Vue - Introduction](https://vuejs.org/guide/introduction.html)
