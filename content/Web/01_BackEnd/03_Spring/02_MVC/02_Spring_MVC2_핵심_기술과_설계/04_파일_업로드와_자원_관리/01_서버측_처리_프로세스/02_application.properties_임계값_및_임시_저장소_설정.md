---
title: 02_application.properties_임계값_및_임시_저장소_설정
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# application.properties: 임계값 및 임시 저장소 설정

## 상위 맥락

`01_서버측_처리_프로세스 < 04_파일_업로드와_자원_관리 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

파일 업로드는 서버 메모리와 디스크를 많이 사용하는 작업입니다.
자료에서는 application.properties를 통해 업로드 파일의 크기 제한, 요청 전체 크기 제한, 임시 저장소 위치, 메모리 임계값을 설정한다고 설명합니다.

## 주요 설정의 의미

- `spring.servlet.multipart.location`: 업로드 파일이 임시로 저장되거나 기준이 되는 디렉터리 위치입니다.
- `spring.servlet.multipart.max-file-size`: 단일 파일의 최대 크기입니다.
- `spring.servlet.multipart.max-request-size`: 한 요청에 포함될 수 있는 전체 데이터 크기입니다.
- `spring.servlet.multipart.file-size-threshold`: 파일을 메모리에 둘지, 디스크 임시 파일로 둘지 나누는 임계값입니다.

## 임계값의 역할

file-size-threshold보다 작은 파일은 빠른 처리를 위해 메모리에 유지될 수 있습니다.
반대로 임계값을 넘는 파일은 서버 메모리 고갈을 막기 위해 임시 디스크 경로에 기록됩니다.
자료에서는 이 설정을 메모리와 디스크 I/O 사이의 균형을 잡는 핵심 요소로 설명합니다.

## 크기 제한과 예외 처리

max-file-size나 max-request-size를 초과한 요청은 컨트롤러에 도달하기 전에 예외가 발생할 수 있습니다.
이 경우 [[01_ControllerAdvice_컨트롤러_계층_공통_관심사_분리|@ControllerAdvice]]와 @ExceptionHandler를 이용해 사용자에게 명확한 오류 메시지를 반환하는 흐름이 필요합니다.

## 한 문장 요약

application.properties의 멀티파트 설정은 파일 업로드 요청이 서버 메모리와 디스크를 과도하게 점유하지 않도록 크기, 임시 저장소, 메모리 임계값을 제어하는 1차 방어선입니다.

## 관련 문서

- 이전 문서: [[01_MultipartFile_멀티파트_요청_캡슐화_인터페이스|MultipartFile_멀티파트_요청_캡슐화_인터페이스]]
- 다음 문서: [[03_transferTo_메모리_임시파일의_실제_물리_경로_저장|transferTo_메모리_임시파일의_실제_물리_경로_저장]]
- 같은 묶음: [[01_MultipartFile_멀티파트_요청_캡슐화_인터페이스|MultipartFile_멀티파트_요청_캡슐화_인터페이스]], [[03_transferTo_메모리_임시파일의_실제_물리_경로_저장|transferTo_메모리_임시파일의_실제_물리_경로_저장]]
- 전체 흐름 이전: [[01_MultipartFile_멀티파트_요청_캡슐화_인터페이스|MultipartFile_멀티파트_요청_캡슐화_인터페이스]]
- 전체 흐름 다음: [[03_transferTo_메모리_임시파일의_실제_물리_경로_저장|transferTo_메모리_임시파일의_실제_물리_경로_저장]]
- 통합 목차: [[00_통합_목차|통합 목차]]
