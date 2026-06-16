---
title: list comp, itertools
created: 2026-03-18T16:20:55+09:00
updated: 2026-06-16T19:36:48+09:00
---

리스트 컴프리헨션
- 간결하게 반복문 표현
```python
squares = [x**2 for x in range(10)]
print(f"0부터 9까지 제곱: {squares}")
# 0부터 9까지 제곱: [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

even_numbers = [x for x in range(20) if x % 2 == 0]
print(f"0부터 19까지 짝수: {even_numbers}")
# 0부터 19까지 짝수: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]
```


itertools
- 반복 관련 라이브러리
- 조합/순열/누적합 등
```python
from itertools import product, permutations, combinations, accumulate

# product: 모든 조합 (중첩 반복)
for p in product([1, 2], ['A', 'B']): 
    print(p)

# permutations: 순열
for p in permutations([1, 2, 3], 2):
    print(p)

# combinations: 조합
for c in combinations([1, 2, 3], 2):
    print(c)

# accumulate: 누적합
import operator
nums = [1, 2, 3, 4]
print("누적합:", list(accumulate(nums)))
print("누적곱:", list(accumulate(nums, func=operator.mul)))


"""
--- product --- 
(1, 'A') 
(1, 'B') 
(2, 'A') 
(2, 'B') 

--- permutations --- 
(1, 2) 
(1, 3) 
(2, 1) 
(2, 3) 
(3, 1) 
(3, 2) 

--- combinations --- 
(1, 2) 
(1, 3) 
(2, 3)

--- accumulate --- 
누적합: [1, 3, 6, 10] 
누적곱: [1, 2, 6, 24]
"""

```