---
title: String, StringBuilder
created: 2026-06-16T19:33:35+09:00
updated: 2026-06-21T05:00:05+09:00
---

## String

```java
Arrays.toString(문자열)         //  한글자씩 분해, String[]
Arrays.toString(char[])       //    문자 한개씩, String[]
.startsWith(문자열)             //  접두사
.endsWith(문자열)               // 접미사
.trim()                       //  문자열 앞 뒤 공백 제거
.length()  
.isEmpty()
.charAt()
.compareTo()                  //  사전 순 비교 →  
.join(””,String[])             //  String[] 원소를 “” 문자로 연결
.join("구분자",리스트);           //  join에 리스트 가능함 
.toCharArray(문자열)
.indexOf(문자) 
.indexOf(문자열)
.replaceAll("[^0-9]", " ")   //  0-9가 아닌 아닌 것들을 공백으로 치환
.replaceFirst("정규식", " ")   // 정규식 해당하는 첫번째 문자열만 대치
.lastIndexOf(문자)            // 해당문자의 마지막 인덱스
.lastIndexOf(문자열)
.contains(문자열)              // contains에는 정규표현식 불가능 -> matches활용!
.equals(문자열)
.substring(n,m)              // n~m-1 까지
.substring(n)                // n~끝까지
.toUpperCase(문자열)
.toLowerCase(문자열)
.valueOf()
.isEmpty()
.matches("[05]+")            // 문자열이 0과 5로만 이루어져 있는지 확인

.repeat()                    // 반복하기
							 // ex) 4글자 미만일 때, 4글자가 될 때까지 뒤에 문자 `‘k’`를 붙이기
							   str += str.length()< 4 ? "k".repeat(4-str.length()) : "";
							   str = str.length() < 4 ? String.format("%-4s",str).replace(' ', 'k') : str ;
							
.split("\\\\s")                // 모든 공백 문자 (탭, 줄 바꿈,.. )를 기준으로 split
.split("\\\\.")                // ‘.’ 이스케이프
.split("\\\\s+")               // 연속된 공백은 하나로 처리
.split("xx",-1)             // 모든 분할된 문자열을 포함함.  즉, 마지막에 “xx”이 있는 경우도 결과에 포함 됨.



// ex) x를 기준으로 o의 개수를 셀때, 
"oxooxoxxox".split(”x”,-1);                                 ->    [”1”, “2”, “1”, “0”, “1”, “0”] 

//  ex) 공백을 기준으로 단어를 구분할 때,
"try hello world".split(" ", -1);                           ->   ["try","hello","world"]  
" try hello world ".split(" ", -1);                         ->   ["","try","hello","world",""]
"   try hello   world ".split(" ", -1);                     -> ["","","try","hello","","world",""] 
"    try   hello       world      ".split(" ", -1); -> ["","","","try","","","hello","","","","","world","","","","",""]

String.format (“%-4”, 문자열) : 왼쪽 정렬 4  = 4글자 맞추기

String.format("%d_", 23)   //23_
String.format("%5d_", 23)  //   23_
String.format("%-5d_", 23) //23   _
String.format("%05d_", 23) //00023_

String.format("%,d_", 123456789)     //123,456,789_
String.format("%,15d_", 123456789)   //    123,456,789_
String.format("%,-15d_", 123456789)  //123,456,789    _
String.format("%,015d_", 123456789)  //0000123,456,789_

String.format("%0"+n+"d", 5); //불가능

String str = "tete";

System.out.println(String.format("%s_", str));      //tete_
System.out.println(String.format("%12s_", str));    //        tete_
System.out.println(String.format("%-12s_", str));   //tete        _
System.out.println(String.format("%.2s_", str));    //te_
System.out.println(String.format("%-12.2s_", str)); //te          _
System.out.println(String.format("%12.2s_", str));  //          te_

%s는 문자열을 그대로 출력하고,
%s 앞에 숫자(N)를 설정할 경우, str.length()가 N보다 작을 경우 공백을 추가함.
.숫자(N)를 설정할 경우, 최대 N길이 만큼만 출력
- 붙이면 왼쪽 정렬, 없으면 오른쪽 정렬

String.format에서 %d는 중간에 변수 불가능하지만 %s는 중간에 변수 가능하다. n = 10일때
String.format("%"+n+"s","abcde");  //가능, 결과//   "     abcde" 
String.format("%"+n+"s",Integer.toString(arr1[i],2)).replace(" ","0");  //가능 
```

## StringBuilder

```java
.append()
.charAt()
.insert(1, "a")         // 1 위치에 삽입
.delete(1, 3)           // 1-2 위치의 문자열 삭제 
.deleteCharAt(1)        // 1 위치의 문자열 삭제
.indexOf("!")           // 해당 문자 첫 번째 인덱스 찾기 (int)
.setCharAt(Idx, '*')  // 위치의 문자를 *로 변경 
.replace(startIdx, endIdx, newStr) //지정된 범위의 문자열을 새로운 문자열로 대체 -> O(n + m) 삭제+삽입 되므로 시간 좀 걸림
.reverse();             // 문자열 거꾸로 뒤집기 
.setLength(2);          // 문자열 길이를 2로 줄임  *.setLength(0) → sb 비우기

String str = new StringBuilder(words).reverse().toString();*
```


##### 특정 인덱스의 문자를 변경
    
```java
String strValue = "Hello_ Java.";     // Hello_ Java.
StringBuilder sb = new StringBuilder(strValue);

int findIndex = sb.indexOf("_");

if(findIndex > 0) {                  //index가 존재하면 진행
   sb.setCharAt(findIndex, '!');
   strValue = sb.toString();         // Hello! Java.
}
```