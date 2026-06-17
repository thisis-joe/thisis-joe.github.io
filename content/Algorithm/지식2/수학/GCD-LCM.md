---
title: GCD-LCM
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-18T05:00:07+09:00
---

# GCD / LCM

> [!summary]
> 최대공약수는 유클리드 호제법, 최소공배수는 `a / gcd * b`로 구한다.  
> `a * b / gcd`는 먼저 곱하다 overflow가 날 수 있다.

---

## 검증 템플릿

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        long a = Long.parseLong(st.nextToken());
        long b = Long.parseLong(st.nextToken());

        long g = gcd(a, b);
        long l = a / g * b;

        System.out.println(g);
        System.out.println(l);
    }

    static long gcd(long a, long b) {
        a = Math.abs(a);
        b = Math.abs(b);

        while (b != 0) {
            long r = a % b;
            a = b;
            b = r;
        }

        return a;
    }
}
```

---

## 핵심

```text
gcd(a, b) == gcd(b, a % b)
b가 0이 되면 a가 최대공약수
lcm = a / gcd(a, b) * b
```

---

## 주의점

```text
음수가 들어오면 Math.abs 처리
lcm은 overflow 가능하므로 long 사용
BigInteger에는 gcd 내장 메서드가 있음
```
