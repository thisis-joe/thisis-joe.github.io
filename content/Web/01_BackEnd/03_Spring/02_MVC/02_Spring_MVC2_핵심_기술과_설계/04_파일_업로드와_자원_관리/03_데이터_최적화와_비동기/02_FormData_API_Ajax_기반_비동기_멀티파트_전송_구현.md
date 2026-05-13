---
title: 02_FormData_API_Ajax_기반_비동기_멀티파트_전송_구현
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# FormData API: Ajax 기반 비동기 멀티파트 전송 구현

## 상위 맥락

`03_데이터_최적화와_비동기 < 04_파일_업로드와_자원_관리 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

FormData API는 자바스크립트에서 파일과 텍스트 데이터를 하나의 multipart/form-data 요청으로 구성해 비동기로 전송하기 위한 브라우저 API입니다.
자료에서는 기존 HTML form 제출이 전체 페이지를 새로고침하는 한계를 보완하기 위해 Ajax와 FormData를 사용한다고 설명합니다.

## 동작 흐름

1. 클라이언트에서 `new FormData()`로 가상의 폼 객체를 만듭니다.
2. `formData.append("file", file)`로 파일을 추가합니다.
3. 필요한 설명이나 텍스트 값도 append로 함께 넣습니다.
4. fetch API의 body에 FormData를 넣어 비동기 POST 요청을 보냅니다.
5. 서버는 기존과 동일하게 `@RequestParam MultipartFile`로 파일을 받습니다.
6. 서버가 JSON 응답을 반환하면 클라이언트는 `response.json()`으로 결과를 처리합니다.

## 중요한 주의점

자료에서는 FormData를 fetch로 보낼 때 Content-Type을 직접 `multipart/form-data`로 지정하면 boundary 정보가 누락되어 서버가 파싱하지 못할 수 있다고 설명합니다.
FormData를 body에 넣으면 브라우저가 boundary를 포함한 Content-Type을 자동으로 구성하므로, 헤더를 수동으로 강제하지 않는 것이 핵심입니다.

## 응답 형식

비동기 요청은 보통 JSON 응답을 기대합니다.
따라서 서버 컨트롤러는 뷰 이름이나 redirect를 반환하기보다 @ResponseBody 또는 @RestController 기반으로 JSON 데이터를 반환해야 합니다.

## 한 문장 요약

FormData API는 파일과 일반 데이터를 multipart/form-data로 묶어 화면 새로고침 없이 Ajax로 전송하고, 서버의 MultipartFile 바인딩과 자연스럽게 연결되는 비동기 업로드 방식입니다.

## 핵심 연결

[[01_RequestParam_쿼리_파라미터_및_폼_데이터_매핑|@RequestParam]], [[03_ResponseBody_JSON_데이터_직접_전송_Jackson|@ResponseBody]], [[01_MultipartFile_멀티파트_요청_캡슐화_인터페이스|MultipartFile]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[01_Base64_Encoding_바이너리의_텍스트화_및_인라인_삽입|Base64_Encoding_바이너리의_텍스트화_및_인라인_삽입]]
- 다음 문서: [[03_트레이드오프_HTTP_요청_수_감소와_데이터_크기_증가|트레이드오프_HTTP_요청_수_감소와_데이터_크기_증가]]
- 같은 묶음: [[01_Base64_Encoding_바이너리의_텍스트화_및_인라인_삽입|Base64_Encoding_바이너리의_텍스트화_및_인라인_삽입]], [[03_트레이드오프_HTTP_요청_수_감소와_데이터_크기_증가|트레이드오프_HTTP_요청_수_감소와_데이터_크기_증가]]
- 전체 흐름 이전: [[01_Base64_Encoding_바이너리의_텍스트화_및_인라인_삽입|Base64_Encoding_바이너리의_텍스트화_및_인라인_삽입]]
- 전체 흐름 다음: [[03_트레이드오프_HTTP_요청_수_감소와_데이터_크기_증가|트레이드오프_HTTP_요청_수_감소와_데이터_크기_증가]]
- 통합 목차: [[00_통합_목차|통합 목차]]
