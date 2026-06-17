---
title: Java 빠른 입출력
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-18T05:00:07+09:00
---

# Java 빠른 입출력

> [!summary]
> 백준/SWEA/삼성에서는 `Scanner`보다 `BufferedReader + StringTokenizer`가 안전하다.  
> 출력은 `StringBuilder`에 모았다가 한 번에 출력한다.

---

## 검증 템플릿

```java
import java.io.*;
import java.util.*;

public class Main {
    static class FastScanner {
        private final BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        private StringTokenizer st;

        String next() throws IOException {
            while (st == null || !st.hasMoreTokens()) {
                String line = br.readLine();
                if (line == null) return null;
                st = new StringTokenizer(line);
            }
            return st.nextToken();
        }

        int nextInt() throws IOException {
            return Integer.parseInt(next());
        }

        long nextLong() throws IOException {
            return Long.parseLong(next());
        }
    }

    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner();
        String first = fs.next();
        if (first == null) return;

        int n = Integer.parseInt(first);
        long sum = 0;

        for (int i = 0; i < n; i++) {
            sum += fs.nextLong();
        }

        StringBuilder sb = new StringBuilder();
        sb.append(sum).append('\n');
        System.out.print(sb);
    }
}
```

---

## 선택 기준

|상황|추천|
|---|---|
|입력이 작고 간단|Scanner도 가능|
|입력이 많음|BufferedReader|
|공백 기준 파싱|StringTokenizer|
|출력이 많음|StringBuilder|
|한 줄 전체 필요|br.readLine()|

---

## 주의점

```text
Scanner는 편하지만 느리다.
StringTokenizer는 다음 줄을 자동으로 읽지 않는다.
next()가 null일 수 있는 EOF 입력을 조심한다.
출력마다 System.out.println을 많이 호출하면 느릴 수 있다.
```

---

## 백지 복원

```text
1. BufferedReader 선언을 써라.
2. StringTokenizer로 int 2개를 읽는 코드를 써라.
3. StringBuilder 출력 누적 코드를 써라.
```
