---
title: String, StringBuilder
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-16T19:36:48+09:00
---

# String / StringBuilder

> [!summary]
> `String`은 불변이라 반복 연결하면 느리다.  
> 반복 생성/수정은 `StringBuilder`를 쓴다.

---

## 검증 코드

```java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        String str = "abc";
        int n = 5;
        String paddedNumber = String.format("%0" + n + "d", 23);
        String paddedString = String.format("%" + n + "s", str);
        char[] arr = str.toCharArray();

        System.out.println(paddedNumber);
        System.out.println(paddedString);
        System.out.println(Arrays.toString(arr));
        System.out.println(String.join("", new String[]{"a", "b"}));
    }
}
```

---

## String 자주 쓰는 메서드

```java
String s = "abcde";

s.startsWith("ab");
s.endsWith("de");
s.trim();
s.length();
s.isEmpty();
s.charAt(0);
s.compareTo("abd");
s.indexOf('c');
s.lastIndexOf('e');
s.contains("bc");
s.equals("abcde");
s.substring(1, 3); // index 1~2
s.substring(2);    // index 2~끝
s.toUpperCase();
s.toLowerCase();
s.matches("[a-z]+");
s.repeat(3);
```

---

## 배열 / join / split

```java
char[] chars = s.toCharArray();
System.out.println(Arrays.toString(chars));

String joined = String.join("", new String[]{"a", "b", "c"});

String[] words = "try hello world".split(" ", -1);
String[] dot = "a.b.c".split("\\.");
String[] spaces = "a   b".split("\\s+");
```

---

## String.format

> [!warning]
> `String.format("%0" + n + "d", 5)`는 가능하다.  
> `n = 4`이면 포맷 문자열이 `"%04d"`가 된다.

```java
int n = 4;
String num = String.format("%0" + n + "d", 5); // "0005"
String str = String.format("%" + n + "s", "ab"); // "  ab"
```

빠른 참조 (정렬 / 자리수 / 정밀도):

```text
%d_     "%5d_"  ->  "   23_"   (오른쪽 정렬, 폭 5)
        "%-5d_" ->  "23   _"   (왼쪽 정렬)
        "%05d_" ->  "00023_"   (0 채움)
%,d     "%,d"   ->  "123,456,789"  (천 단위 콤마)
%s      "%12s"  ->  "        tete" (오른쪽 정렬)
        "%-12s" ->  "tete        " (왼쪽 정렬)
        "%.2s"  ->  "te"          (앞 2글자만)
```

`%d`는 폭에 변수 사용이 안 되지만(`"%" + n + "d"`는 가능),  
`%s`는 `"%" + n + "s"`처럼 폭에 변수를 직접 넣을 수 있다.

---

## StringBuilder

```java
StringBuilder sb = new StringBuilder();

sb.append("abc");
sb.charAt(0);
sb.insert(1, "X");
sb.delete(1, 3);
sb.deleteCharAt(0);
sb.indexOf("c");
sb.setCharAt(0, 'A');
sb.replace(0, 1, "Z");
sb.reverse();
sb.setLength(0); // 비우기

String result = sb.toString();
```

---

## 주의점

|실수|주의|
|---|---|
|반복문에서 `str += x`|O(N^2) 가능. StringBuilder 사용|
|`split(".")`|`.`은 정규식 전체 문자. `split("\\.")` 사용|
|`contains()`|정규식 불가. 정규식은 `matches()`|
|스마트 따옴표|코드에는 `"`만 사용|
