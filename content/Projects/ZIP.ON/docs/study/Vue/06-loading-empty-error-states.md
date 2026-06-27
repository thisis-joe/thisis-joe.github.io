---
title: 06-loading-empty-error-states
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
---

# Loading, Empty, Error State

## 한 줄 정의

Loading, Empty, Error State는 API 기반 화면이 사용자의 기다림, 빈 결과, 실패 상황을 자연스럽게 보여주기 위한 기본 상태다.

## 왜 필요한가

실제 서비스에서는 항상 데이터가 바로 오지 않는다.

```text
네트워크가 느릴 수 있다.
검색 결과가 없을 수 있다.
서버 오류가 날 수 있다.
권한이 없을 수 있다.
```

이 상태를 설계하지 않으면 화면이 멈춘 것처럼 보인다.

## 기본 상태 5가지

```text
idle:
아직 요청하지 않음

loading:
요청 중

empty:
성공했지만 결과가 없음

error:
실패

unavailable:
요청은 처리됐지만 현재 자동 조회가 지원되지 않음
```

`empty`와 `unavailable`은 다르다.

```text
empty:
조회 가능한 기준은 있었지만 데이터가 없거나 부족하다.
예: 주소와 유형은 정리됐지만 최근 전월세 실거래 snapshot이 없음.

unavailable:
현재 기능이나 외부 API adapter가 아직 연결되지 않았다.
예: 외부 API key가 없어 Juso/VWorld/R-ONE 호출을 시도하지 못함, 등기부등본 자동 권리분석은 제공하지 않음.
```

## ZIP:ON에서 필요한 곳

```text
SearchResultView:
지역·유형 과거 지표 분석 중, 데이터 부족, 오류

SearchBar.vue + LeaseRiskDiagnosisResult.vue:
진단 중, 주소 후보 선택 필요, 자동 조회 미지원, 추가 자료 필요

MapView:
지도 데이터 로딩, 마커 없음, 지도 API 실패

CommunityListView:
게시글 없음, 로딩 실패

FavoriteView:
관심 항목 없음
```

## 컴포넌트 설계

처음에는 각 View에서 직접 처리해도 된다. 반복이 많아지면 공통 컴포넌트 후보가 생긴다.

```text
LoadingState.vue
EmptyState.vue
ErrorState.vue
```

하지만 너무 빨리 공통화하지 않는다. ZIP:ON에서는 3번 이상 반복될 때 공통화를 검토한다.

## 실습 미션

```text
1. SearchResultView.vue에 필요한 상태 변수를 적는다.
2. 전세 위험진단에서 empty와 unavailable이 왜 다른 상태인지 설명한다.
3. MapView에서 지도 API 실패와 위험진단 API 실패는 같은 error인지 구분한다.
```

## 공식 출처

- [Vue - Reactivity Fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [Vue - Components Basics](https://vuejs.org/guide/essentials/component-basics.html)
