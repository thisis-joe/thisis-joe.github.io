---
title: 03_transferTo_메모리_임시파일의_실제_물리_경로_저장
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# transferTo(): 메모리/임시파일의 실제 물리 경로 저장

## 상위 맥락

`01_서버측_처리_프로세스 < 04_파일_업로드와_자원_관리 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

transferTo()는 MultipartFile에 담긴 업로드 데이터를 서버의 실제 물리 경로에 저장하는 메서드입니다.
자료에서는 메모리나 임시 파일 형태로 존재하던 데이터를 개발자가 지정한 localFile 경로로 이동시키는 최종 저장 단계로 설명합니다.

## 저장 흐름

1. 클라이언트가 multipart/form-data로 파일을 전송합니다.
2. 스프링이 파일 데이터를 MultipartFile로 바인딩합니다.
3. application.properties의 임계값에 따라 데이터가 메모리 또는 임시 파일로 관리됩니다.
4. 개발자가 최종 저장 경로를 가진 File 객체를 만듭니다.
5. `file.transferTo(localFile)`을 호출해 실제 디스크에 저장합니다.

## 설계 의미

개발자는 직접 InputStream을 열고 버퍼를 복사하는 저수준 I/O 코드를 작성하지 않아도 됩니다. transferTo()가 현재 파일 데이터가 메모리에 있든 임시 파일에 있든 상관없이 최종 물리 경로로 저장하는 작업을 캡슐화합니다.

## 저장 후 접근 문제

서버 디스크에 저장된 파일은 브라우저가 자동으로 접근할 수 없습니다.
파일을 `/upload/파일명` 같은 URL로 제공하려면 [[01_WebMvcConfigurer_가상_경로와_물리_경로의_매핑_ResourceHandler|WebMvcConfigurer의 ResourceHandler 매핑]]이 필요합니다.

## 주의할 점

자료에서는 원본 파일명을 그대로 사용하면 파일명 중복으로 덮어쓰기 문제가 생길 수 있고, 경로 조작 위험도 있을 수 있다고 설명합니다.
따라서 원본 파일명과 서버 저장 파일명을 분리해 관리하는 설계가 필요합니다.

## 한 문장 요약

transferTo()는 MultipartFile에 임시로 보관된 업로드 데이터를 서버의 실제 물리 디스크 경로로 영속화하는 파일 저장 핵심 메서드입니다.

## 핵심 연결

[[01_MultipartFile_멀티파트_요청_캡슐화_인터페이스|MultipartFile]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[02_application.properties_임계값_및_임시_저장소_설정|application.properties_임계값_및_임시_저장소_설정]]
- 같은 묶음: [[01_MultipartFile_멀티파트_요청_캡슐화_인터페이스|MultipartFile_멀티파트_요청_캡슐화_인터페이스]], [[02_application.properties_임계값_및_임시_저장소_설정|application.properties_임계값_및_임시_저장소_설정]]
- 전체 흐름 이전: [[02_application.properties_임계값_및_임시_저장소_설정|application.properties_임계값_및_임시_저장소_설정]]
- 전체 흐름 다음: [[01_WebMvcConfigurer_가상_경로와_물리_경로의_매핑_ResourceHandler|WebMvcConfigurer_가상_경로와_물리_경로의_매핑_ResourceHandler]]
- 통합 목차: [[00_통합_목차|통합 목차]]
