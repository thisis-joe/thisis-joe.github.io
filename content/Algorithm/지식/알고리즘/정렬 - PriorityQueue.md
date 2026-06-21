---
title: 정렬 - PriorityQueue
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-22T05:00:02+09:00
---

> [!info]  계속 최솟값이나 최댓값을 꺼내야 하면 `PriorityQueue`를 사용한다.
> 
> ```java
> PriorityQueue<Integer> pq = new PriorityQueue<>(); // 최소힙
> ```
> 
> ```java
> PriorityQueue<Integer> pq = new PriorityQueue<>(
>     Collections.reverseOrder()
> ); // 최대힙
> ```
> 
> 객체나 배열을 넣을 때:
> 
> ```java
> PriorityQueue<int[]> pq = new PriorityQueue<>(
>     (a, b) -> Integer.compare(a[1], b[1])
> );
> ```
> 
> 주로 다익스트라, 강의실 배정, 최소 비용 문제에서 사용한다.
