---
title: Collection
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-30T05:00:06+09:00
---

# Collection

> [!summary]
> 코딩테스트에서 자주 쓰는 Collection 선택표다.  
> Queue/Stack/Deque 상세 메서드는 `문법/A_필수/ArrayDeque.md`가 대표 문서다.

---

## 선택 기준

|상황|추천|
|---|---|
|순서대로 저장, 인덱스 접근|`ArrayList`|
|중복 제거, 존재 여부 확인|`HashSet`|
|중복 제거 + 삽입 순서 유지|`LinkedHashSet`|
|정렬된 Set, lower/higher 필요|`TreeSet`|
|BFS, 일반 큐|`Queue<T> q = new ArrayDeque<>();`|
|스택|`Deque<T> st = new ArrayDeque<>();`|
|양쪽 삽입/삭제|`Deque<T> dq = new ArrayDeque<>();`|
|최솟값/최댓값 계속 꺼내기|`PriorityQueue`|

```java
List<Integer> list = new ArrayList<>();
Set<Integer> set = new HashSet<>();
Queue<Integer> q = new ArrayDeque<>();
Deque<Integer> st = new ArrayDeque<>();
Deque<Integer> dq = new ArrayDeque<>();
PriorityQueue<Integer> pq = new PriorityQueue<>();
```

---

## List

```java
List<Integer> list = new ArrayList<>();
List<Integer> list2 = new ArrayList<>(Arrays.asList(1, 2, 3));

list.add(10);
list.add(0, 20);
list.get(0);
list.set(0, 99);
list.remove(0);                    // 인덱스 삭제
list.remove(Integer.valueOf(10));   // 값 삭제
list.contains(99);
list.size();
list.isEmpty();
Collections.sort(list);
```

|실수|주의|
|---|---|
|`Arrays.asList()`|크기 변경 불가. `new ArrayList<>(...)`로 감싸면 가변|
|`list.remove(1)`|값 1 삭제가 아니라 index 1 삭제|
|반복 중 삭제|Iterator 또는 뒤에서부터 순회|

---

## Set

```java
Set<Integer> hash = new HashSet<>();              // 순서 보장 X
Set<Integer> linked = new LinkedHashSet<>();      // 삽입 순서 유지
TreeSet<Integer> tree = new TreeSet<>();          // 정렬 유지

hash.add(1);
hash.remove(1);
hash.contains(1);
hash.size();
hash.isEmpty();
```

집합 연산:

```java
set1.addAll(set2);     // 합집합
set1.removeAll(set2);  // 차집합
set1.retainAll(set2);  // 교집합
```

순서 유지 중복 제거:

```java
List<Integer> result = new ArrayList<>(new LinkedHashSet<>(list));
```

---

## Queue / Stack / Deque

> [!important]
> 상세 표와 방향 실수 사례는 `문법/A_필수/ArrayDeque.md`를 본다.

|용도|선언|메서드|
|---|---|---|
|큐|`Queue<Integer> q = new ArrayDeque<>();`|`offer/poll/peek`|
|스택|`Deque<Integer> st = new ArrayDeque<>();`|`push/pop/peek`|
|덱|`Deque<Integer> dq = new ArrayDeque<>();`|`offerFirst/offerLast/pollFirst/pollLast`|

```java
Queue<Integer> q = new ArrayDeque<>();
q.offer(1);
int cur = q.poll();

Deque<Integer> st = new ArrayDeque<>();
st.push(1);
int top = st.pop();
```

---

## PriorityQueue

```java
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[1], b[1]));
```

|실수|주의|
|---|---|
|기본이 최대힙이라고 착각|Java `PriorityQueue` 기본은 최소힙|
|Comparator에서 `a - b`|overflow 가능. `Integer.compare()` 사용|
|값 수정 후 자동 재정렬 기대|안 됨. 다시 넣어야 함|

---

## 자주 하는 실수

|실수|대응|
|---|---|
|`Stack` 클래스 사용|`Deque<T> st = new ArrayDeque<>();` 권장|
|`LinkedList` 큐 사용|특별한 이유 없으면 `ArrayDeque` 권장|
|큐처럼 쓰면서 `push()` 사용|`push()`는 앞에 넣음. `offer()` 사용|
|`poll()` 결과를 바로 int 언박싱|비면 null → NPE. `isEmpty()` 확인|
|`ArrayDeque`에 null 삽입|불가능|
