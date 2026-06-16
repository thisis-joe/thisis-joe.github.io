---
title: Character (문자)
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-17T05:00:06+09:00
---

# Character / ASCII

> [!summary]
> 문자 판별, 숫자 문자 변환, ASCII 값을 빠르게 확인하는 문서다.  
> 기존 `수학/아스키.md` 내용은 여기로 병합했다.

---

## 언제 쓰는가

|상황|사용|
|---|---|
|알파벳/숫자 판별|`Character.isLetter`, `Character.isDigit`|
|대소문자 변환|`Character.toUpperCase`, `Character.toLowerCase`|
|숫자 문자 → int|`c - '0'`|
|int → 숫자 문자|`(char) ('0' + x)`|
|ASCII 코드 확인|`(int) c`|

---

## 검증 코드

```java
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        char c = br.readLine().charAt(0);

        System.out.println(Character.isDigit(c));
        System.out.println(Character.isLetter(c));
        System.out.println(Character.toUpperCase(c));
        System.out.println((int) c);
    }
}
```

---

## 자주 쓰는 메서드

```java
Character.isDigit(c);
Character.isLetter(c);
Character.isAlphabetic(c);
Character.isUpperCase(c);
Character.isLowerCase(c);
Character.toUpperCase(c);
Character.toLowerCase(c);
```

---

## 숫자 문자 변환

```java
char c = '7';
int x = c - '0';        // 7

int n = 5;
char d = (char) ('0' + n); // '5'
```

---

## ASCII 빠른 표

|문자|값|
|---|---:|
|`'0'`|48|
|`'9'`|57|
|`'A'`|65|
|`'Z'`|90|
|`'a'`|97|
|`'z'`|122|

```java
int code = (int) 'A';   // 65
char c = (char) 65;     // 'A'
```

---

## 주의점

|실수|주의|
|---|---|
|`Integer.parseInt(c)`|char에는 직접 사용 불가|
|`String.valueOf(c)` 남발|숫자 문자는 `c - '0'`이 빠름|
|영문자만 가정|문제 조건이 영어 소문자/대문자인지 확인|
|ASCII 범위 직접 비교|가능하지만 `Character` 메서드가 더 읽기 쉬울 때가 많음|

---

## 백지 복원

```text
1. 문자 '7'을 int 7로 바꾸는 식은?
2. int 3을 문자 '3'으로 바꾸는 식은?
3. 'A', 'a', '0'의 ASCII 값은?
4. 대문자로 바꾸는 Character 메서드는?
```
