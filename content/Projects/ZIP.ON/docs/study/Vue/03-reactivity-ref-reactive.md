---
title: 03-reactivity-ref-reactive
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-27T05:00:07+09:00
---

# Reactivity, ref, reactive

## 한 줄 정의

Vue의 reactivity는 상태가 바뀌면 그 상태를 사용하는 화면을 자동으로 갱신하는 시스템이다.

## 왜 필요한가

사용자가 검색어를 입력하거나 필터를 바꾸면 화면도 바뀌어야 한다.

```text
searchKeyword 변경
-> 검색 버튼 클릭
-> API 호출
-> analysisResult 또는 candidateList 변경
-> 분석/후보 화면 갱신
```

직접 DOM을 찾아서 바꾸는 대신, 상태를 바꾸면 Vue가 화면 갱신을 처리한다.

## ref

`ref`는 단일 값이나 객체를 반응형으로 만들 때 자주 쓴다.

```js
const searchKeyword = ref('')
const isLoading = ref(false)
const candidateList = ref([])
```

JavaScript 코드에서는 `.value`로 접근한다.

```js
searchKeyword.value = '강남'
```

template에서는 자동으로 unwrap되어 `.value` 없이 쓴다.

## reactive

`reactive`는 객체 자체를 반응형으로 만든다.

```js
const searchCondition = reactive({
  keyword: '',
  tradeType: '',
  propertyType: ''
})
```

## ZIP:ON에서 상태 후보

```text
검색어
필터 조건
목록 데이터
로딩 여부
에러 메시지
선택된 지도 마커
선택된 커뮤니티 카테고리
```

## 실습 미션

```text
1. SearchBar.vue에 searchKeyword ref를 둔다면 어디에서 값을 읽을지 생각한다.
2. PropertyFilter.vue가 내부 selectedFilter ref와 filter-selected emit을 함께 쓰는 이유를 설명한다.
3. API 호출 중 isLoading 상태가 필요한 이유를 적는다.
```

## 공식 출처

- [Vue - Reactivity Fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
