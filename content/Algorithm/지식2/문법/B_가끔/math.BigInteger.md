---
title: math.BigInteger
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-16T19:33:35+09:00
---

# BigInteger

> [!summary]
> `long` 범위를 넘는 정수에서만 사용한다.  
> 연산자는 `+`, `-`, `*`, `/`가 아니라 메서드다.

---

## 검증 코드

```java
import java.math.BigInteger;

public class Main {
    public static void main(String[] args) {
        BigInteger a = new BigInteger("1234567890123456789234567890");
        BigInteger b = new BigInteger("3");
        BigInteger c = new BigInteger("FF", 16);
        BigInteger d = BigInteger.valueOf(123L);

        System.out.println(c);
        System.out.println(d);
        System.out.println(a.add(b));
        System.out.println(a.remainder(b));
    }
}
```

---

## 기본 사용

```java
BigInteger a = new BigInteger("1234567890123456789234567890");
BigInteger b = new BigInteger("3");
BigInteger c = new BigInteger("FF", 16); // 255
BigInteger d = BigInteger.valueOf(123L); // 123
```

---

## 연산

```java
a.add(b);
a.subtract(b);
a.multiply(b);
a.divide(b);
a.remainder(b);
a.compareTo(b);
a.equals(b);
a.pow(10);
a.abs();
a.negate();
a.gcd(b);
a.mod(b);
a.modPow(b, new BigInteger("1000000007"));
```

---

## 변환

```java
int i = a.intValue();
long l = a.longValue();
String s = a.toString();
```

---

## 주의점

```text
intValue(), longValue()는 범위 초과 시 값이 손실될 수 있다.
mod()는 modulus가 양수여야 한다.
compareTo 결과는 음수/0/양수로 판단한다.
```
