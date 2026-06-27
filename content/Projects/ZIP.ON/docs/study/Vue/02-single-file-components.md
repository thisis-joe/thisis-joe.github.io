---
title: 02-single-file-components
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
---

# Single-File Component

## 한 줄 정의

Vue Single-File Component는 `.vue` 파일 안에 template, script, style을 함께 두어 하나의 컴포넌트를 표현하는 형식이다.

## 왜 필요한가

전통적인 방식은 HTML, CSS, JavaScript 파일을 종류별로 나눈다. Vue SFC는 기능 단위로 관련 코드를 모은다.

```text
LeaseRiskDiagnosisResult.vue
-> 진단 결과 카드의 구조
-> 진단 결과 카드의 동작
-> 진단 결과 카드의 스타일
```

이렇게 두면 컴포넌트가 어떤 화면 조각인지 한 파일에서 이해하기 쉽다.

## SFC 기본 구조

```vue
<script setup>
// 상태, props, event, 함수
</script>

<template>
  <!-- 화면 구조 -->
</template>

<style scoped>
/* 컴포넌트 스타일 */
</style>
```

## scoped style

`scoped`는 스타일이 해당 컴포넌트에만 적용되도록 돕는다. 모든 스타일을 전역으로 만들면 큰 프로젝트에서 충돌이 많아진다.

## ZIP:ON에서 분리 기준

View에 둘 것:

```text
페이지 전체 흐름
API 호출 위치 후보
섹션 배치
라우트 파라미터 사용
```

Component에 둘 것:

```text
반복되는 카드
검색창
필터
목록 아이템
지도 패널
공통 버튼
```

## 실습 미션

```text
1. LeaseRiskDiagnosisResult.vue가 View가 아니라 Component인 이유를 설명한다.
2. 현재 CommunityListView.vue가 커뮤니티 API 호출과 목록 UI를 직접 소유하는 이유를 설명한다.
3. CommunityPostItem.vue와 CommunityPostList.vue를 재사용 후보로 둘 때 어떤 props가 필요한지 적는다.
4. AppHeader.vue를 여러 View에서 직접 import하지 않고 App.vue shell에 두는 이유를 생각한다.
```

## 공식 출처

- [Vue - Single-File Components](https://vuejs.org/guide/scaling-up/sfc.html)
- [Vue - Components Basics](https://vuejs.org/guide/essentials/component-basics.html)
