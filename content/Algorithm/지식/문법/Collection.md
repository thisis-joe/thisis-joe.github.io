---
title: Collection
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-20T05:00:07+09:00
---

> [!summary]  언제 쓸까?
> 
> |상황|추천|
> |---|---|
> |순서대로 저장, 인덱스 접근|`ArrayList`|
> |중복 제거, 존재 여부 확인|`HashSet`|
> |삽입 순서 유지 Set|`LinkedHashSet`|
> |정렬된 Set|`TreeSet`|
> |BFS, 일반 큐|`Queue` + `ArrayDeque`|
> |스택|`Deque` + `ArrayDeque`|
> |양쪽 삽입/삭제|`Deque`|
> |최솟값/최댓값 계속 꺼내기|`PriorityQueue`|
> 
> ```java
> List<Integer> list = new ArrayList<>();
> Set<Integer> set = new HashSet<>();
> Queue<Integer> q = new ArrayDeque<>();
> Deque<Integer> stack = new ArrayDeque<>();
> PriorityQueue<Integer> pq = new PriorityQueue<>();
> ```

---

## 1. List

> [!info]  
> `List`는 순서가 있고, 인덱스로 접근할 수 있다.  
> 코테에서는 대부분 `ArrayList`를 사용한다.
> 
> ```java
> List<Integer> list = new ArrayList<>();
> List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3)); // 가변 리스트
> ```
> 
> 자주 쓰는 메서드:
> 
> ```java
> list.add(10);
> list.add(0, 10);          // 0번 위치에 삽입
> list.get(0);
> list.set(0, 99);
> list.remove(0);           // 0번 인덱스 삭제
> list.remove(Integer.valueOf(10)); // 값 10 삭제
> list.contains(10);
> list.size();
> list.isEmpty();
> Collections.sort(list);
> ```
> 
> `Arrays.asList()`는 크기 변경이 안 된다.
> 
> ```java
> List<Integer> list = Arrays.asList(1, 2, 3);
> 
> list.set(0, 10); // 가능
> // list.add(4);  // 불가능
> // list.remove(0); // 불가능
> ```
> 
> 중복 제거가 필요하면 `Set`을 거친다.
> 
> ```java
> List<Integer> result = new ArrayList<>(new LinkedHashSet<>(list));
> ```
> 
> `LinkedHashSet`을 쓰면 기존 순서를 유지하면서 중복 제거할 수 있다.

---

## 2. Set

> [!info]  
> `Set`은 중복을 허용하지 않는다.  
> 존재 여부 확인, 중복 제거에 자주 사용한다.
> 
> ```java
> Set<Integer> set = new HashSet<>();
> 
> set.add(1);
> set.remove(1);
> set.contains(1);
> set.size();
> set.isEmpty();
> ```
> 
> 종류:
> 
> ```java
> HashSet<Integer> set = new HashSet<>();              // 순서 보장 X
> LinkedHashSet<Integer> set = new LinkedHashSet<>();  // 삽입 순서 유지
> TreeSet<Integer> set = new TreeSet<>();              // 오름차순 정렬
> ```
> 
> 집합 연산:
> 
> ```java
> set1.addAll(set2);     // 합집합
> set1.removeAll(set2);  // 차집합
> set1.retainAll(set2);  // 교집합
> ```
> 
> 순회:
> 
> ```java
> for (int x : set) {
>     System.out.println(x);
> }
> ```

---

## 3. Queue / Stack / Deque

> [!info]  `Stack`보다 `Deque`를 쓰자.
> `ArrayDeque` 하나로 큐, 스택, 덱을 모두 처리할 수 있다.
> 
> 큐로 사용:
> 
> ```java
> Queue<Integer> q = new ArrayDeque<>();
> 
> q.offer(1);
> q.offer(2);
> 
> int cur = q.poll(); // 앞에서 꺼냄, 비어 있으면 null
> int front = q.peek();
> ```
> 
> BFS 기본 형태:
> 
> ```java
> Queue<Integer> q = new ArrayDeque<>();
> q.offer(start);
> 
> while (!q.isEmpty()) {
>     int cur = q.poll();
> }
> ```
> 
> 스택으로 사용:
> 
> ```java
> Deque<Integer> stack = new ArrayDeque<>();
> 
> stack.push(1);
> stack.push(2);
> 
> int top = stack.pop();
> int peek = stack.peek();
> ```
> 
> 양쪽 삽입/삭제:
> 
> ```java
> Deque<Integer> dq = new ArrayDeque<>();
> 
> dq.offerFirst(1);
> dq.offerLast(2);
> 
> dq.pollFirst();
> dq.pollLast();
> 
> dq.peekFirst();
> dq.peekLast();
> ```
> 
> 좌표나 거리까지 저장해야 하면 클래스를 만들어 넣는다.
> 
> ```java
> static class Node {
>     int y, x, dist;
> 
>     Node(int y, int x, int dist) {
>         this.y = y;
>         this.x = x;
>         this.dist = dist;
>     }
> }
> 
> Queue<Node> q = new ArrayDeque<>();
> q.offer(new Node(0, 0, 0));
> ```

---

## 4. PriorityQueue

> [!info]  우선순위가 높은 값부터 꺼내는 자료구조
> 기본은 최소힙이다.
> 
> ```java
> PriorityQueue<Integer> pq = new PriorityQueue<>(); // 최소힙
> 
> pq.offer(3);
> pq.offer(1);
> pq.offer(2);
> 
> pq.poll(); // 1
> ```
> 
> 최대힙:
> 
> ```java
> PriorityQueue<Integer> pq = new PriorityQueue<>(Collections.reverseOrder());
> ```
> 
> 객체를 넣을 때는 정렬 기준을 직접 준다.
> 
> ```java
> static class Node {
>     int y, x, cost;
> 
>     Node(int y, int x, int cost) {
>         this.y = y;
>         this.x = x;
>         this.cost = cost;
>     }
> }
> 
> PriorityQueue<Node> pq = new PriorityQueue<>(
>     (a, b) -> Integer.compare(a.cost, b.cost)
> );
> ```
> 
> 다익스트라, 프림, 최소 비용 문제에서 자주 사용한다.

---

## 5. 주의점

> [!warning]  자주 틀리는 부분
> 
> |실수|주의|
> |---|---|
> |`Arrays.asList()`|크기 변경 불가|
> |`list.remove(1)`|인덱스 1 삭제|
> |값 1 삭제|`list.remove(Integer.valueOf(1))`|
> |`Stack` 사용|가능하지만 `Deque` 권장|
> |큐 구현|`LinkedList`보다 `ArrayDeque` 권장|
> |`poll()`|비어 있으면 `null`|
> |`remove()`|비어 있으면 예외 가능|
> |`PriorityQueue`|기본은 최소힙|
> |객체 PQ|Comparator 기준 필요|