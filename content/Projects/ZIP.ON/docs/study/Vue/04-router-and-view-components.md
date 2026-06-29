---
title: 04-router-and-view-components
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-30T05:00:06+09:00
---

# Vue Router와 View Component

## 한 줄 정의

Vue Router는 URL에 따라 어떤 View를 보여줄지 관리하는 공식 라우팅 라이브러리다.

## 왜 필요한가

ZIP:ON은 단일 화면 서비스가 아니다.

```text
/
/search
/regions/:regionId
/properties/:propertyId
/map
/community
/mypage
```

URL이 곧 사용자 위치를 나타내야 한다. 그래야 새로고침, 공유, 뒤로가기, 직접 접근이 자연스럽다. 단, ZIP:ON MVP의 기본 진입점은 현재 매물 목록이 아니라 홈 화면 분석/진단 입력 폼이다. `/search`는 지역·유형 과거 지표 분석 화면이고, `/properties/:propertyId`는 현재 매물 feed가 아니라 저장/검토 경계와 연결되는 보조 상세 route로 읽는다.

## View와 Component 차이

View:

```text
라우터에 직접 연결된다.
페이지 단위다.
API 호출과 큰 상태를 가질 수 있다.
```

Component:

```text
View 안에서 사용된다.
재사용 가능한 UI 조각이다.
props와 event로 데이터를 주고받는다.
```

## ZIP:ON 예시

```text
/map
-> App.vue 공통 shell
-> MapView.vue
-> MapPlaceholder.vue
-> MapFilterBar.vue
-> MapSidePanel.vue
```

현재 `frontend/src/layouts/DefaultLayout.vue`와 `frontend/src/layouts/MapLayout.vue` 파일은 남아 있지만 `App.vue`에서 import하지 않는다. 실제 공통 shell은 `App.vue`가 `AppHeader`, `router-view`, `AppFooter`로 만들고, `/map` route의 `meta.layout === 'map'`일 때 Footer만 숨긴다.

## route params

`/search?analysisKeyword=강남%20원룸`의 `analysisKeyword`는 지역·유형 과거 지표 분석 입력을 복원하는 데 필요하다. `/properties/:propertyId`의 `propertyId`는 이미 저장된 검토 대상 상세 조회에 필요하다.

현재 코드 읽을 포인트:

```text
지역·유형 분석 keyword는 왜 path parameter보다 query parameter에 가까운가?
propertyId처럼 특정 저장 대상을 가리키는 값은 왜 path parameter에 가까운가?
```

## 실습 미션

```text
1. router/index.js에서 동적 라우트가 있는 경로를 찾는다.
2. SearchResultView.vue에서 query parameter를 읽어 지역·유형 분석 API를 호출하는 위치를 찾는다.
3. 검색 조건은 path parameter인지 query parameter인지 구분한다.
```

## 공식 출처

- [Vue - Routing](https://vuejs.org/guide/scaling-up/routing.html)
- [Vue Router - Getting Started](https://router.vuejs.org/guide/)
