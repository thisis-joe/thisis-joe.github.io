---
title: Math 클래스
created: 2026-06-04T10:49:48+09:00
updated: 2026-06-16T19:36:48+09:00
---

# Math 클래스

**두 점사이의 거리** 
- 두 좌표 정보 (a,b),(c,d)를 알때
```java
Math.hypot(dx, dy); 
```

**0.0 ~ 1.0 사이 난수**
```java
double randomValue = Math.random()  
```

**올림, 내림, 반올림, 특정 소수점 위치로 반올림** 
```java
Math.ceil()
Math.floor()
Math.round()
String.format("%.nf")
```


---
**참고**
Math.hypot의 내부구현 :  피타고라스 √((a-c)²+(b-d)²))
