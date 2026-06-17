---
title: Map, Set
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-18T05:00:07+09:00
---

# Map / Set

> [!summary]  
> 해시 문제는 보통 `존재 확인`, `중복 제거`, `빈도수`, `그룹핑`, `누적합`, `슬라이딩 윈도우`다.
> 
> ```java
> Set<Integer> set = new HashSet<>();
> Map<Integer, Integer> map = new HashMap<>();
> 
> set.add(x);                              // 추가
> set.contains(x);                         // 존재 확인
> if (!set.add(x)) { }                     // 중복 발견
> 
> map.put(x, map.getOrDefault(x, 0) + 1);  // 빈도수 증가
> 
> map.put(x, map.get(x) - 1);              // 빈도수 감소
> if (map.get(x) == 0) map.remove(x);      // 0이면 제거
> 
> map.computeIfAbsent(key, k -> new ArrayList<>()).add(value); // 그룹핑
> 
> for (Map.Entry<Integer, Integer> e : map.entrySet()) {
>     int key = e.getKey();
>     int value = e.getValue();
> }
> ```

---

## 선택 기준

> [!info]  
> 문제에서 무엇을 빠르게 찾고 싶은지 기준으로 고르면 된다.
> 
> |상황|사용|
> |---|---|
> |존재 확인|`HashSet`|
> |중복 제거|`HashSet`|
> |입력 순서 유지 + 중복 제거|`LinkedHashSet`|
> |정렬된 Set|`TreeSet`|
> |빈도수 세기|`HashMap<T, Integer>`|
> |key별 여러 값 묶기|`HashMap<K, List<V>>`|
> |key 정렬 필요|`TreeMap`|
> |입력 순서 유지 Map|`LinkedHashMap`|

---

## 자주 쓰는 패턴

> [!info]  
> 빈도수 세기:
> 
> ```java
> Map<Integer, Integer> map = new HashMap<>();
> 
> for (int x : arr) {
>     map.put(x, map.getOrDefault(x, 0) + 1);
> }
> ```
> 
> 빈도수 감소:
> 
> ```java
> map.put(x, map.get(x) - 1);
> 
> if (map.get(x) == 0) {
>     map.remove(x);
> }
> ```
> 
> key별 리스트 그룹핑:
> 
> ```java
> Map<String, List<Integer>> map = new HashMap<>();
> 
> map.computeIfAbsent(key, k -> new ArrayList<>()).add(value);
> ```
> 
> value 기준 최댓값 찾기:
> 
> ```java
> int maxKey = -1;
> int maxValue = Integer.MIN_VALUE;
> 
> for (Map.Entry<Integer, Integer> e : map.entrySet()) {
>     int key = e.getKey();
>     int value = e.getValue();
> 
>     if (value > maxValue) {
>         maxValue = value;
>         maxKey = key;
>     }
> }
> ```

---

## 누적합 / 슬라이딩 윈도우

> [!example]  
> 합이 `k`인 부분 배열 개수는 `누적합 + HashMap`으로 푼다.
> 
> ```java
> Map<Integer, Integer> count = new HashMap<>();
> 
> int sum = 0;
> int answer = 0;
> 
> count.put(0, 1);
> 
> for (int x : arr) {
>     sum += x;
> 
>     answer += count.getOrDefault(sum - k, 0);
> 
>     count.put(sum, count.getOrDefault(sum, 0) + 1);
> }
> ```
> 
> 핵심:
> 
> ```text
> 현재 누적합 - 이전 누적합 = k
> 이전 누적합 = 현재 누적합 - k
> ```
> 
> 슬라이딩 윈도우에서 빈도수 관리:
> 
> ```java
> Map<Character, Integer> map = new HashMap<>();
> int left = 0;
> 
> for (int right = 0; right < s.length(); right++) {
>     char r = s.charAt(right);
>     map.put(r, map.getOrDefault(r, 0) + 1);
> 
>     while (/* 조건 위반 */) {
>         char l = s.charAt(left);
>         map.put(l, map.get(l) - 1);
> 
>         if (map.get(l) == 0) {
>             map.remove(l);
>         }
> 
>         left++;
>     }
> }
> ```

---

## 주의점

> [!warning]  
> 이것만 조심하면 된다.
> 
> |실수|주의|
> |---|---|
> |`HashMap`, `HashSet` 순서 믿기|순서 보장 안 됨|
> |`containsValue()` 남발|보통 `O(N)`|
> |`map.get(x) - 1`|key 없으면 NPE 가능|
> |빈도수 0인 key 유지|`map.size()` 판단 시 오류 가능|
> |순회 중 `map.remove()`|`Iterator.remove()` 사용|
> |배열을 key로 사용|내용 기준 비교 안 됨|
> |좌표 key를 그냥 붙이기|`1,23`과 `12,3` 충돌 주의|
> 
> 좌표나 상태는 문자열 key로 만드는 게 가장 간단하다.
> 
> ```java
> String key = r + "," + c;
> set.add(key);
> map.put(key, value);
> ```
> 
> 정렬이나 순서가 필요할 때만 아래를 쓴다.
> 
> ```java
> TreeSet<Integer> set = new TreeSet<>();              // 값 정렬
> TreeMap<Integer, Integer> map = new TreeMap<>();     // key 정렬
> 
> LinkedHashSet<Integer> set = new LinkedHashSet<>();  // 입력 순서 유지
> LinkedHashMap<Integer, Integer> map = new LinkedHashMap<>();
> ```

---

## 추가 주의점

> [!warning]
> 누적합 key와 경우의 수는 `int`를 넘을 수 있다.  
> 부분합 문제는 `Map<Long, Long>`을 먼저 의심한다.
