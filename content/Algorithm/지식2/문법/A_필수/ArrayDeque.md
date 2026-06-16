---
title: ArrayDeque
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-16T19:33:35+09:00
---

# ArrayDeque

> [!summary]
> 이 문서 집합에서는 `Stack`, `Queue`, `Deque`를 Java의 `ArrayDeque` 중심으로 통일한다.  
> 가장 중요한 규칙은 하나다. **큐처럼 쓸 때 `push()`를 쓰지 않는다.**

---

## 언제 쓰는가

|상황|선언|대표 메서드|
|---|---|---|
|BFS, 일반 FIFO 큐|`Queue<Integer> q = new ArrayDeque<>();`|`offer`, `poll`, `peek`|
|스택 문제|`Deque<Integer> st = new ArrayDeque<>();`|`push`, `pop`, `peek`|
|양쪽 삽입/삭제|`Deque<Integer> dq = new ArrayDeque<>();`|`offerFirst`, `offerLast`, `pollFirst`, `pollLast`|
|0-1 BFS, 슬라이딩 윈도우|`Deque<Integer> dq = new ArrayDeque<>();`|방향을 명시한 메서드|

---

## 기본 원칙

```text
Stack 클래스보다 Deque<Integer> st = new ArrayDeque<>(); 사용 권장
LinkedList 큐보다 ArrayDeque 큐 사용 권장
ArrayDeque는 null을 넣을 수 없음
poll/peek 계열은 비었을 때 null 반환
remove/get 계열은 비었을 때 예외 발생
```

---

## 큐 / 스택 / 덱 메서드 표

|구분|선언|넣기|꺼내기|확인|배열 변환|주의|
|---|---|---|---|---|---|---|
|큐처럼 사용|`Deque<Integer> q = new ArrayDeque<>();`|`offer(x)` / `offerLast(x)`|`poll()` / `pollFirst()`|`peek()` / `peekFirst()`|`stream().mapToInt(i -> i).toArray()`|앞에서 꺼내고 뒤에 넣는다|
|스택처럼 사용|`Deque<Integer> st = new ArrayDeque<>();`|`push(x)` / `addFirst(x)`|`pop()` / `removeFirst()`|`peek()` / `getFirst()`|현재 앞 → 뒤 순서|`push`는 앞에 넣는다|
|덱 직접 조작|`Deque<Integer> dq = new ArrayDeque<>();`|`offerFirst(x)` / `offerLast(x)`|`pollFirst()` / `pollLast()`|`peekFirst()` / `peekLast()`|현재 앞 → 뒤 순서|방향을 명시하라|
|비었을 때|-|-|`poll`은 `null`, `remove`는 예외|`peek`은 `null`, `get`은 예외|-|코테에서는 보통 `isEmpty()` 확인 후 사용|

> [!warning]
> `push()`는 앞에 넣는다.  
> `offer()`와 `offerLast()`는 뒤에 넣는다.  
> `poll()`과 `pollFirst()`는 앞에서 꺼낸다.

---

## 큐처럼 쓸 때

```java
Queue<Integer> q = new ArrayDeque<>();

q.offer(1);       // 뒤에 넣기
q.offer(2);

int first = q.poll();   // 앞에서 꺼냄: 1
int front = q.peek();   // 다음 앞: 2
```

BFS에서는 이 형태로 통일한다.

```java
Queue<Integer> q = new ArrayDeque<>();
q.offer(start);

while (!q.isEmpty()) {
    int cur = q.poll();
    // next를 찾으면 q.offer(next)
}
```

---

## 스택처럼 쓸 때

```java
Deque<Integer> st = new ArrayDeque<>();

st.push(1);       // 앞에 넣기
st.push(2);       // 2가 맨 앞

int top = st.peek(); // 2
int out = st.pop();  // 2
```

스택 문제에서는 이 조합으로 통일한다.

```text
Deque<Integer> st = new ArrayDeque<>();
push / pop / peek
```

---

## 덱을 직접 조작할 때

```java
Deque<Integer> dq = new ArrayDeque<>();

dq.offerFirst(1);   // 앞에 넣기
dq.offerLast(2);    // 뒤에 넣기

int a = dq.pollFirst(); // 앞에서 꺼냄
int b = dq.pollLast();  // 뒤에서 꺼냄
```

0-1 BFS에서는 보통 다음처럼 쓴다.

```java
if (cost == 0) dq.offerFirst(next);
else dq.offerLast(next);
```

---

## 배열 변환 순서

```java
int[] result = dq.stream().mapToInt(i -> i).toArray();
```

이 코드는 **현재 Deque의 앞 → 뒤 순서**로 배열을 만든다.

```text
큐처럼 offer로 넣음: 삽입 순서와 같음
스택처럼 push로 넣음: 마지막에 넣은 값이 앞에 있으므로 삽입 역순이 될 수 있음
```

---

## 자주 하는 실수: 큐라고 생각하고 push 사용

잘못된 코드:

```java
Deque<Integer> q = new ArrayDeque<>();

q.push(arr[0]);
for (int i = 1; i < arr.length; i++) {
    if (q.peek() == arr[i]) continue;
    q.push(arr[i]);
}

return q.stream().mapToInt(i -> i).toArray();
```

문제점:

```text
q라는 이름 때문에 큐처럼 보이지만 push()는 앞에 넣는다.
따라서 마지막에 넣은 값이 Deque의 앞에 오고,
stream().mapToInt(i -> i).toArray()는 앞 → 뒤로 배열화하므로 결과가 의도와 반대로 나올 수 있다.
```

수정 코드:

```java
Deque<Integer> q = new ArrayDeque<>();

q.offer(arr[0]);
for (int i = 1; i < arr.length; i++) {
    if (q.peekLast() == arr[i]) continue;
    q.offer(arr[i]);
}

return q.stream().mapToInt(i -> i).toArray();
```

더 단순한 풀이:

```java
List<Integer> result = new ArrayList<>();
int last = -1; // 문제 조건에 없는 값으로 초기화

for (int x : arr) {
    if (result.isEmpty() || last != x) {
        result.add(x);
        last = x;
    }
}

return result.stream().mapToInt(i -> i).toArray();
```

`arr`에 모든 int가 가능하면 sentinel 대신 `result.isEmpty()`만 믿고 처리한다.

---

## 메서드 혼용으로 방향이 꼬이는 패턴

|나쁜 패턴|왜 위험한가|권장|
|---|---|---|
|큐 이름 `q`에 `push()` 사용|앞에 넣어서 FIFO가 깨짐|`offer()` 사용|
|스택에 `offer()` 후 `pop()`|뒤에 넣고 앞에서 꺼내 방향 불일치|`push()` + `pop()`|
|덱 문제에서 `push()`와 `offerLast()` 혼용|앞/뒤 삽입이 섞여 추적 어려움|`offerFirst/offerLast` 명시|
|빈 큐에서 `int x = q.poll()`|`null` 언박싱으로 NPE 가능|`isEmpty()` 확인|
|`remove()`를 안전 꺼내기로 착각|비어 있으면 예외|코테에서는 `poll()` 선호|

---

## 백지 복원 질문

```text
1. push(x)는 앞에 넣는가, 뒤에 넣는가?
2. offer(x)는 offerFirst에 가까운가, offerLast에 가까운가?
3. poll()은 어느 쪽에서 꺼내는가?
4. stream().mapToInt(i -> i).toArray()는 어떤 순서로 배열을 만드는가?
5. ArrayDeque에 null을 넣으면 어떻게 되는가?
6. poll/peek과 remove/get의 빈 덱 동작 차이는?
7. BFS에서 push를 쓰면 왜 안 되는가?
```
