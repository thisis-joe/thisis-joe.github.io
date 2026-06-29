---
title: 최소공배수(LCM)와 최대공약수(GCD)
created: 2026-06-04T10:49:48+09:00
updated: 2026-06-30T05:00:06+09:00
---

최소공배수(lcm)
```java
a * b / gcd
```

BigInteger 내장함수 - 최대공약수(gcd) 
```java
int gcd = BigInteger.valueOf(a) .gcd(BigInteger.valueOf(b)) .intValue();
```

유클리드 호제법 - 최대공약수(gcd)
```java
private int gcd(int a, int b) { 
    return b == 0 ? a : gcd(b, a%b);
}
```

유클리드 호제법
	- a를 b로 나눈 나머지 r 에 대해, a와 b의 최대 공약수는 b와 r의 최대공약수와 같다.
	- a % b = r 일때, gcd(a, b) == gcd(b, r) 이다. 
	- 즉, b가 0이될때까지 반복했을때, a가 최대공약수이다.
```text
gcd(12,8)
	== gcd(8, 4) 
	== gcd(4, 0) 
	== 4

gcd(12, 8) 
	== gcd(8, 12%8) 
	== gcd(4, 8%4) 
	== 4
```

```text
gcd(15, 8) 
	== gcd(8, 15%8) 
	== gcd(8, 7) 
	== gcd(7, 8%7) 
	== gcd(7, 1) 
	== gcd(1, 7%1) 
	== gcd(1, 0) 
	== 1
```