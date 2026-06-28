---
title: Java 실수 모음
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-29T05:00:06+09:00
---

# Java 실수 모음

> [!summary]
> 실전에서 자주 틀리는 Java 함정만 모았다.  
> 제출 전에는 자료형, Comparator, ArrayDeque 방향을 먼저 확인한다.

---

## 입출력

```text
Scanner는 편하지만 느릴 수 있다.
대량 입력은 BufferedReader + StringTokenizer.
대량 출력은 StringBuilder.
readLine() 뒤 trim()은 필요한 경우만. 공백도 데이터면 쓰지 않는다.
```

---

## 자료형

|상황|주의|
|---|---|
|거리/비용 합|`long` 의심|
|경우의 수|mod 또는 `long` 범위 확인|
|곱셈 후 long 대입|`(long) a * b`처럼 먼저 캐스팅|
|`p * p <= n`|overflow 가능. `p <= n / p` 권장|

```java
long cost = (long) a * b;
```

---

## Comparator

```java
Arrays.sort(arr, (a, b) -> Integer.compare(a[0], b[0]));
PriorityQueue<long[]> pq = new PriorityQueue<>((a, b) -> Long.compare(a[1], b[1]));
```

> [!warning]
> `a - b`는 overflow가 날 수 있다.

---

## Integer / String 비교

```java
Integer a = 1000;
Integer b = 1000;

// a == b 금지
if (a.equals(b)) {
    // 내용 비교
}

String s1 = "abc";
String s2 = new String("abc");

// s1 == s2 금지
if (s1.equals(s2)) {
    // 내용 비교
}
```

---

## ArrayDeque 방향 실수

|용도|선언|넣기|꺼내기|
|---|---|---|---|
|큐|`Queue<Integer> q = new ArrayDeque<>();`|`offer`|`poll`|
|스택|`Deque<Integer> st = new ArrayDeque<>();`|`push`|`pop`|
|덱|`Deque<Integer> dq = new ArrayDeque<>();`|`offerFirst/offerLast`|`pollFirst/pollLast`|

```text
push()는 앞에 넣는다.
큐처럼 쓰려면 push()가 아니라 offer()를 쓴다.
stream().mapToInt(i -> i).toArray()는 현재 앞 → 뒤 순서다.
ArrayDeque는 null을 넣을 수 없다.
poll/peek은 비었을 때 null, remove/get은 예외다.
```

자세한 예시는 `문법/A_필수/ArrayDeque.md`를 본다.

---

## 배열 / 리스트

|실수|주의|
|---|---|
|`arr1 == arr2`|참조 비교. `Arrays.equals()` 사용|
|2차원 배열 `clone()`|얕은 복사. 행별로 복사|
|`Arrays.asList(int[])`|`List<int[]>` 1개 원소가 됨|
|`List.remove(1)`|index 1 삭제. 값 1 삭제는 `Integer.valueOf(1)`|

```java
int[][] copy = new int[n][m];
for (int i = 0; i < n; i++) {
    copy[i] = arr[i].clone();
}
```

---

## 재귀

```text
Java 재귀는 깊이가 크면 StackOverflowError가 난다.
N이 100,000 이상이면 반복 DFS/BFS를 먼저 고려한다.
```

---

## 백지 복원

```text
1. int 곱셈을 long으로 안전하게 바꾸는 코드는?
2. Comparator에서 a - b를 쓰면 왜 위험한가?
3. 큐처럼 쓰는 ArrayDeque에 push를 쓰면 어떤 일이 생기는가?
4. 2차원 배열 deep copy는 어떻게 하는가?
```
