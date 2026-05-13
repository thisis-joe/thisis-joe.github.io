---
title: 01_MultipartFile_멀티파트_요청_캡슐화_인터페이스
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# MultipartFile: 멀티파트 요청 캡슐화 인터페이스

## 상위 맥락

`01_서버측_처리_프로세스 < 04_파일_업로드와_자원_관리 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

MultipartFile은 클라이언트가 multipart/form-data 형식으로 전송한 파일 데이터를 스프링에서 다루기 쉽게 추상화한 인터페이스입니다.
자료에서는 원시적인 바이너리 스트림을 직접 파싱하지 않고, 컨트롤러에서 `@RequestParam MultipartFile file` 형태로 받을 수 있다고 설명합니다.

## 클라이언트 전송 조건

파일 업로드 요청은 일반 텍스트 파라미터와 달리 multipart/form-data 규격을 사용합니다.
전통적인 HTML form에서는 `enctype="multipart/form-data"`가 필요하고, 비동기 방식에서는 [[02_FormData_API_Ajax_기반_비동기_멀티파트_전송_구현|FormData API]]를 사용해 파일과 텍스트 데이터를 함께 전송할 수 있습니다.

## 제공 기능

MultipartFile은 파일 처리에 필요한 메서드를 제공합니다.

- 원본 파일명 확인: getOriginalFilename()
- Content-Type 확인: getContentType()
- 바이트 배열 확인: getBytes()
- 실제 파일 저장: transferTo()
- 파일이 비었는지 확인: isEmpty()

## 설계 의미

MultipartFile은 파일이 메모리에 있는지, 임시 파일로 존재하는지 개발자가 직접 알 필요 없게 만듭니다.
컨트롤러와 서비스는 추상화된 MultipartFile 객체를 통해 메타데이터를 확인하고 저장 로직을 수행하면 됩니다.

## 연결되는 개념

파일 크기와 임시 저장 정책은 [[02_application.properties_임계값_및_임시_저장소_설정|application.properties 설정]]에서 제어하고, 실제 물리 저장은 [[03_transferTo_메모리_임시파일의_실제_물리_경로_저장|transferTo()]]가 담당합니다.

## 한 문장 요약

MultipartFile은 멀티파트 파일 업로드 요청의 바이너리 데이터를 스프링 컨트롤러에서 객체처럼 다룰 수 있게 캡슐화한 파일 업로드 인터페이스입니다.

## 핵심 연결

[[01_RequestParam_쿼리_파라미터_및_폼_데이터_매핑|@RequestParam]]와 함께 읽으면 좋습니다.

## 관련 문서

- 다음 문서: [[02_application.properties_임계값_및_임시_저장소_설정|application.properties_임계값_및_임시_저장소_설정]]
- 같은 묶음: [[02_application.properties_임계값_및_임시_저장소_설정|application.properties_임계값_및_임시_저장소_설정]], [[03_transferTo_메모리_임시파일의_실제_물리_경로_저장|transferTo_메모리_임시파일의_실제_물리_경로_저장]]
- 전체 흐름 이전: [[03_ErrorAttributes_에러_응답_필드_커스터마이징|ErrorAttributes_에러_응답_필드_커스터마이징]]
- 전체 흐름 다음: [[02_application.properties_임계값_및_임시_저장소_설정|application.properties_임계값_및_임시_저장소_설정]]
- 통합 목차: [[00_통합_목차|통합 목차]]
