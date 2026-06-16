---
title: Arrays (배열)
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-16T19:36:48+09:00
---

> [!summary]  
> 코딩테스트 배열 문제에서 자주 쓰는 건 이 정도다.
> 
> ```java
> Arrays.sort(arr);                         // 오름차순 정렬
> Arrays.equals(arr1, arr2);                // 배열 내용 비교
> Arrays.fill(arr, 0);                      // 전체 채우기
> Arrays.copyOfRange(arr, s, e);            // s부터 e 전까지 복사
> Arrays.binarySearch(arr, target);         // 정렬된 배열에서 이분탐색
> 
> return new int[]{-1};                     // int[] 반환
> ```
> 
> |상황|사용|
> |---|---|
> |배열 정렬|`Arrays.sort()`|
> |배열 내용 비교|`Arrays.equals()`|
> |배열 초기화|`Arrays.fill()`|
> |배열 일부 복사|`Arrays.copyOfRange()`|
> |정렬된 배열 탐색|`Arrays.binarySearch()`|
> |2차원 배열 정렬|`Arrays.sort(arr, comparator)`|
> |기본형 배열 내림차순|오름차순 정렬 후 reverse|

---

## 주의점

> [!warning]  
> 자주 틀리는 것만 기억하면 된다.
> 
> |실수|주의|
> |---|---|
> |`arr1 == arr2`|내용 비교 아님. `Arrays.equals()` 사용|
> |`copyOfRange(s, e)`|`e` 미포함|
> |`fill(arr, s, e, v)`|`e` 미포함|
> |`binarySearch()`|반드시 정렬 후 사용|
> |`Arrays.sort(intArr, comparator)`|불가능. primitive 배열은 Comparator 정렬 안 됨|
> |`Collections.reverseOrder()`|`Integer[]`, `String[]` 같은 객체 배열에서만 사용|
> |`o1[0] - o2[0]`|오버플로우 가능. `Integer.compare()` 권장|
> |`Arrays.asList(intArr)`|`List<Integer>`가 아님|

---

## 비교 / 채우기 / 복사

> [!info]  
> 배열의 기본 처리는 `Arrays` 메서드를 사용한다.
> 
> ```java
> Arrays.equals(arr1, arr2);              // 내용 비교
> 
> Arrays.fill(arr, 0);                    // 전체를 0으로 채움
> Arrays.fill(arr, 1, 4, 7);              // index 1, 2, 3을 7로 채움
> 
> int[] copy = Arrays.copyOfRange(arr, 2, 5); // index 2, 3, 4 복사
> ```
> 
> `fill()`과 `copyOfRange()`의 끝 인덱스는 항상 미포함이다.

---

## 정렬

> [!info]  
> 기본형 배열은 오름차순 정렬만 바로 가능하다.
> 
> ```java
> int[] arr = {3, 1, 2};
> 
> Arrays.sort(arr); // [1, 2, 3]
> ```
> 
> 기본형 배열을 내림차순으로 만들려면 오름차순 정렬 후 뒤집는다.
> 
> ```java
> Arrays.sort(arr);
> 
> for (int i = 0; i < arr.length / 2; i++) {
>     int tmp = arr[i];
>     arr[i] = arr[arr.length - 1 - i];
>     arr[arr.length - 1 - i] = tmp;
> }
> ```
> 
> 객체 배열은 Comparator 사용이 가능하다.
> 
> ```java
> Integer[] arr = {3, 1, 2};
> 
> Arrays.sort(arr, Collections.reverseOrder()); // 내림차순
> ```

---

## 2차원 배열 정렬

> [!info]  
> 2차원 배열 정렬은 특정 열 기준으로 정렬하는 문제가 많다.
> 
> ```java
> int[][] arr = {{5, 40}, {3, 50}, {3, 20}};
> 
> Arrays.sort(arr, (a, b) -> Integer.compare(a[0], b[0])); // 0번 기준 오름차순
> ```
> 
> 1차 기준이 같을 때 2차 기준 정렬:
> 
> ```java
> Arrays.sort(arr, (a, b) -> {
>     if (a[0] == b[0]) {
>         return Integer.compare(a[1], b[1]); // 1번 기준 오름차순
>     }
>     return Integer.compare(a[0], b[0]);     // 0번 기준 오름차순
> });
> ```
> 
> 1차 오름차순, 2차 내림차순:
> 
> ```java
> Arrays.sort(arr, (a, b) -> {
>     if (a[0] == b[0]) {
>         return Integer.compare(b[1], a[1]);
>     }
>     return Integer.compare(a[0], b[0]);
> });
> ```

---

## 이분탐색

> [!info]  
> `Arrays.binarySearch()`는 정렬된 배열에서만 사용한다.
> 
> ```java
> Arrays.sort(arr);
> 
> int idx = Arrays.binarySearch(arr, target);
> 
> if (idx >= 0) {
>     // target 존재
> } else {
>     // target 없음
> }
> ```
> 
> 값이 없으면 음수가 반환된다.  
> 단순 존재 여부만 필요하면 `idx >= 0`으로 판단하면 된다.

---

## 최소 자료형 변환

> [!tip]  
> 배열 정렬에서 Comparator가 필요할 때만 `int[]`를 `Integer[]`로 바꿔서 사용한다.
> 
> ```java
> int[] arr = {3, 1, 2};
> 
> Integer[] boxed = Arrays.stream(arr)
>                         .boxed()
>                         .toArray(Integer[]::new);
> 
> Arrays.sort(boxed, Collections.reverseOrder());
> ```
> 
> 단순 내림차순이면 boxing보다 `Arrays.sort(arr)` 후 직접 reverse가 보통 더 낫다.