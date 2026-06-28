---
title: "서로소집합"
created: 2026-03-10T15:06:25+09:00
updated: 2026-06-29T05:00:06+09:00
---

> [!summary]  
> Union-Find는 **서로소 집합**을 관리하는 자료구조다.  
> 주로 `같은 그룹인지 확인`, `그룹 합치기`, `사이클 판별`, `Kruskal MST`에서 사용한다.
> 
> |상황|사용|
> |---|---|
> |두 원소가 같은 그룹인지 확인|`find(a) == find(b)`|
> |두 그룹 합치기|`union(a, b)`|
> |무방향 그래프 사이클 판별|이미 같은 부모면 사이클|
> |MST Kruskal|간선을 비용순 정렬 후 Union-Find로 사이클 방지|
> 
> ```text
> Make-Set : 각 원소를 자기 자신이 대표자인 집합으로 초기화
> Find     : 해당 원소가 속한 집합의 대표자 찾기
> Union    : 두 집합을 하나로 합치기
> ```

---

## 기본 템플릿

> [!info]  거의 이 형태로 사용한다.  
> `find()`에서 경로 압축을 해줘야 빠르다.
> 
> ```java
> static int[] parent;
> 
> static void makeSet(int n) {
>     parent = new int[n + 1];
> 
>     for (int i = 1; i <= n; i++) {
>         parent[i] = i;
>     }
> }
> 
> static int find(int x) {
>     if (parent[x] == x) return x;
>     return parent[x] = find(parent[x]); // 경로 압축
> }
> 
> static void union(int a, int b) {
>     a = find(a);
>     b = find(b);
> 
>     if (a != b) {
>         parent[b] = a;
>     }
> }
> ```
> 
> 사용:
> 
> ```java
> makeSet(N);
> 
> union(a, b);
> 
> if (find(x) == find(y)) {
>     // 같은 그룹
> } else {
>     // 다른 그룹
> }
> ```

---

## 대표 유형

> [!info]  
> Union-Find 문제는 보통 아래 3개 유형이다.
> 
> ```text
> 1. 그룹 합치기
> 2. 두 원소가 같은 그룹인지 확인
> 3. 무방향 그래프에서 사이클 판별
> ```
> 
> 같은 그룹 확인:
> 
> ```java
> if (find(a) == find(b)) {
>     System.out.println("YES");
> } else {
>     System.out.println("NO");
> }
> ```
> 
> 사이클 판별:
> 
> ```java
> boolean cycle = false;
> 
> for (int[] edge : edges) {
>     int a = edge[0];
>     int b = edge[1];
> 
>     if (find(a) == find(b)) {
>         cycle = true;
>         break;
>     }
> 
>     union(a, b);
> }
> ```
> 
> 이미 같은 집합에 속한 두 정점을 다시 연결하려 하면 사이클이 생긴다.

---

## Kruskal에서 사용

> [!info]  
> Kruskal은 Union-Find의 대표 사용처다.  
> 간선을 비용 오름차순으로 정렬한 뒤, 사이클이 생기지 않는 간선만 선택한다.
> 
> ```java
> Arrays.sort(edges, (a, b) -> Integer.compare(a.cost, b.cost));
> 
> int answer = 0;
> int count = 0;
> 
> for (Edge e : edges) {
>     if (find(e.a) != find(e.b)) {
>         union(e.a, e.b);
>         answer += e.cost;
>         count++;
> 
>         if (count == V - 1) break;
>     }
> }
> ```
> 
> MST는 정점 `V`개를 모두 연결해야 하므로 선택되는 간선 수는 `V - 1`개다.

---

## 주의점

> [!warning]  이것만 조심
> 
> |실수|주의|
> |---|---|
> |`union(a, b)`에서 바로 parent 변경|반드시 `find(a)`, `find(b)` 후 합치기|
> |경로 압축 없음|시간 초과 가능|
> |방향 그래프 사이클 판별에 사용|Union-Find는 보통 무방향 그래프 사이클 판별용|
> |그룹 개수 계산|대표자 기준으로 세야 함|
> |MST에서 간선 개수 체크 안 함|`V - 1`개 선택하면 종료|
> 
> 그룹 개수 세기:
> 
> ```java
> Set<Integer> groups = new HashSet<>();
> 
> for (int i = 1; i <= N; i++) {
>     groups.add(find(i));
> }
> 
> int count = groups.size();
> ```
> 
> 코테에서는 연결리스트 방식은 거의 안 쓰고, 보통 `parent[]` 배열 기반 트리 구조만 사용한다.


[[Algorithm-Patterns]]

