---
title: Stream
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-24T05:00:07+09:00
---

> [!summary]  
> Stream은 **배열/리스트를 짧게 변환, 필터링, 집계할 때** 사용한다.  
> 인덱스, 이전/다음 값 비교, 복잡한 조건 분기가 있으면 `for문`이 더 안전하다.
> 
> |상황|추천|
> |---|---|
> |합, 평균, 최댓값|Stream 가능|
> |문자열 배열 -> 숫자 배열|Stream 유용|
> |조건에 맞는 값만 배열로 반환|Stream 유용|
> |중복 제거 후 정렬|Stream 유용|
> |2차원 배열 평탄화|Stream 유용|
> |인덱스가 중요함|`for문` 또는 `IntStream.range()`|
> |복잡한 로직|`for문` 추천|

---

## 기본 사용

> [!info]  
> 자주 쓰는 Stream 생성과 기본 연산만 기억한다.
> 
> ```java
> Arrays.stream(arr);      // 배열 -> Stream
> list.stream();           // List -> Stream
> 
> int sum = Arrays.stream(arr).sum();
> int max = Arrays.stream(arr).max().orElse(-1);
> double avg = Arrays.stream(arr).average().orElse(0);
> ```
> 
> `max()`, `min()`, `average()`는 빈 배열 가능성 때문에 `Optional` 계열을 반환한다.  
> 그래서 보통 `orElse()`를 붙인다.

---

## 자주 쓰는 변환

> [!info]  
> 코테에서 가장 자주 쓰는 Stream 패턴이다.
> 
> ```java
> // String[] -> int[]
> int[] nums = Arrays.stream(strArr)
>                    .mapToInt(Integer::parseInt)
>                    .toArray();
> 
> // int[] -> List<Integer>
> List<Integer> list = Arrays.stream(arr)
>                            .boxed()
>                            .collect(Collectors.toList());
> 
> // int[] -> Integer[]
> Integer[] boxed = Arrays.stream(arr)
>                         .boxed()
>                         .toArray(Integer[]::new);
> ```
> 
> `mapToInt()`는 `int[]`로 만들 때 사용한다.  
> `boxed()`는 `int`를 `Integer`로 바꿀 때 사용한다.

---

## 배열 가공

> [!info]  
> 원본 배열을 가공해서 새 배열을 만들 때 Stream이 깔끔하다.
> 
> ```java
> // 각 원소 2배
> int[] result = Arrays.stream(arr)
>                      .map(x -> x * 2)
>                      .toArray();
> 
> // 홀수만 반환
> int[] result = Arrays.stream(arr)
>                      .filter(x -> x % 2 == 1)
>                      .toArray();
> 
> // 중복 제거 후 정렬
> int[] result = Arrays.stream(arr)
>                      .distinct()
>                      .sorted()
>                      .toArray();
> ```

---

## 인덱스 / 범위 처리

> [!info]  
> Stream에서 인덱스가 필요하면 `IntStream.range()`를 사용한다.
> 
> ```java
> IntStream.range(0, n);        // 0부터 n - 1까지
> IntStream.rangeClosed(0, n);  // 0부터 n까지
> ```
> 
> ```java
> // 최댓값에 해당하는 인덱스만 반환
> int max = Arrays.stream(arr).max().orElse(-1);
> 
> int[] indexes = IntStream.range(0, arr.length)
>                          .filter(i -> arr[i] == max)
>                          .toArray();
> ```

---

## 2차원 배열 / 문자열 처리

> [!info]  
> 2차원 배열은 `flatMapToInt()`로 1차원처럼 펼칠 수 있다.
> 
> ```java
> // int[][] -> int[]
> int[] result = Arrays.stream(arr)
>                      .flatMapToInt(Arrays::stream)
>                      .toArray();
> 
> // int[][] 최댓값
> int max = Arrays.stream(arr)
>                 .flatMapToInt(Arrays::stream)
>                 .max()
>                 .orElse(-1);
> ```
> 
> 문자열을 나누고 정렬해서 배열로 만들 때:
> 
> ```java
> String[] result = Arrays.stream(str.split("x"))
>                         .filter(s -> !s.isEmpty())
>                         .sorted()
>                         .toArray(String[]::new);
> ```

---

## collect / joining / match

> [!info]  
> 결과를 List나 문자열로 모을 때 사용한다.
> 
> ```java
> List<Integer> list = Arrays.stream(arr)
>                            .boxed()
>                            .collect(Collectors.toList());
> 
> String result = Arrays.stream(strArr)
>                       .collect(Collectors.joining(""));
> ```
> 
> 조건 검사:
> 
> ```java
> boolean all = list.stream().allMatch(x -> x > 0);
> boolean any = list.stream().anyMatch(x -> x > 0);
> boolean none = list.stream().noneMatch(x -> x > 0);
> ```

---

## 주의점

> [!warning]  
> 이것만 조심하면 된다.
> 
> |실수|주의|
> |---|---|
> |Stream 남발|복잡하면 `for문`이 낫다|
> |`max()`, `average()`|`orElse()` 필요|
> |`map()`|객체 Stream 유지|
> |`mapToInt()`|`int[]` 만들 때 사용|
> |`boxed()`|`int` -> `Integer`|
> |`toArray()`|객체 배열은 `String[]::new`, `Integer[]::new` 필요|
> |`range(0, n)`|`n` 미포함|
> |`rangeClosed(0, n)`|`n` 포함|