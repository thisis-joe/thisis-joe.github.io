---
title: math.BigInteger
created: 2026-06-04T10:49:48+09:00
updated: 2026-06-22T05:00:02+09:00
---

```java
import java.math.BigInteger;

//문자열 -> BigInteger
BigInteger a = new BigInteger("1234567890123456789234567890");
BigInteger b = new BigInteger("3"); 
BigInteger c = new BigInteger("FF", 16) //255

//기본형 -> BigInteger
BigInteger d = BigInteger.valueOf(123L) //123

//연산
a.add(b);       // 덧셈 → 10000000000000000003
a.subtract(b);  // 뺄셈 → 9999999999999999997
a.multiply(b);  // 곱셈 → 30000000000000000000
a.divide(b);    // 나눗셈 → 3333333333333333333
a.remainder(b); // %나머지 → 1
a.compareTo(b);  // ==0 : 동일, ==1 : a>b, ==-1 : a<b
a.equals(b);
a.pow(10);
a.abs();
a.negate();     //부호반전
a.gcd(b);       //최대공약수
a.mod(b);       //나머지 연산. 무조건 양수 나옴.
a.modPow(b, m); //mod거듭제곱(모듈러 연산), aᵇ **mod** m 을 빠르게 계산 

int i = a.intValue();      // int로 변환 (범위 초과 시 손실)
long l = a.longValue();    // long으로 변환 (범위 초과 시 손실)
String s = a.toString();   // 문자열로 변환

BigInteger x = BigInteger.ZERO; //상수활용
BigInteger y = BigInteger.ONE;
BigInteger z = BigInteger.TEN;
```