---
title: 탐색 - BFS, DFS
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-29T05:00:06+09:00
---

## 선택 기준

> [!summary]  
> 그래프·격자 문제는 보통 BFS/DFS로 시작한다.
> 
> |상황|추천|
> |---|---|
> |최단 거리 / 최소 이동 횟수|BFS|
> |연결 요소 개수|BFS 또는 DFS|
> |미로 탐색|BFS|
> |백트래킹 / 모든 경우 탐색|DFS|
> |재귀 깊이가 깊음|BFS 또는 반복문 DFS 고려|
> 
> 최단거리는 보통 BFS가 안전하다.  
> DFS는 연결 요소, 조합 탐색, 백트래킹에 자주 쓴다.

## 방향 배열

> [!info]  
> 격자 탐색은 방향 배열을 거의 고정 템플릿처럼 쓴다.
> 
> ```java
> int[] dx = {-1, 1, 0, 0};
> int[] dy = {0, 0, -1, 1};
> 
> for (int dir = 0; dir < 4; dir++) {
>     int nx = x + dx[dir];
>     int ny = y + dy[dir];
> 
>     if (nx < 0 || ny < 0 || nx >= N || ny >= M) continue;
>     if (visited[nx][ny]) continue;
> 
>     // 이동 처리
> }
> ```

## BFS 기본형

> [!info]  
> BFS는 `Queue`를 사용한다.  
> Java에서는 `ArrayDeque`를 우선 사용한다.
> 
> ```java
> Queue<int[]> q = new ArrayDeque<>();
> q.offer(new int[]{sx, sy});
> visited[sx][sy] = true;
> 
> while (!q.isEmpty()) {
>     int[] cur = q.poll();
>     int x = cur[0], y = cur[1];
> 
>     for (int dir = 0; dir < 4; dir++) {
>         int nx = x + dx[dir];
>         int ny = y + dy[dir];
> 
>         if (nx < 0 || ny < 0 || nx >= N || ny >= M) continue;
>         if (visited[nx][ny]) continue;
> 
>         visited[nx][ny] = true;
>         q.offer(new int[]{nx, ny});
>     }
> }
> ```

## BFS 거리 계산

> [!info]  
> `dist`를 `-1`로 초기화하면 방문 여부와 거리를 동시에 관리할 수 있다.
> 
> ```java
> int[][] dist = new int[N][M];
> for (int[] row : dist) Arrays.fill(row, -1);
> 
> Queue<int[]> q = new ArrayDeque<>();
> q.offer(new int[]{sx, sy});
> dist[sx][sy] = 0;
> 
> while (!q.isEmpty()) {
>     int[] cur = q.poll();
>     int x = cur[0], y = cur[1];
> 
>     for (int dir = 0; dir < 4; dir++) {
>         int nx = x + dx[dir];
>         int ny = y + dy[dir];
> 
>         if (nx < 0 || ny < 0 || nx >= N || ny >= M) continue;
>         if (dist[nx][ny] != -1) continue;
> 
>         dist[nx][ny] = dist[x][y] + 1;
>         q.offer(new int[]{nx, ny});
>     }
> }
> ```

## DFS 기본형

> [!info]  
> DFS는 연결 요소, 백트래킹, Flood Fill에서 자주 사용한다.
> 
> ```java
> void dfs(int x, int y) {
>     visited[x][y] = true;
> 
>     for (int dir = 0; dir < 4; dir++) {
>         int nx = x + dx[dir];
>         int ny = y + dy[dir];
> 
>         if (nx < 0 || ny < 0 || nx >= N || ny >= M) continue;
>         if (visited[nx][ny]) continue;
> 
>         dfs(nx, ny);
>     }
> }
> ```
> 
> 연결 요소 개수:
> 
> ```java
> int count = 0;
> 
> for (int i = 1; i <= N; i++) {
>     if (!visited[i]) {
>         dfs(i);
>         count++;
>     }
> }
> ```