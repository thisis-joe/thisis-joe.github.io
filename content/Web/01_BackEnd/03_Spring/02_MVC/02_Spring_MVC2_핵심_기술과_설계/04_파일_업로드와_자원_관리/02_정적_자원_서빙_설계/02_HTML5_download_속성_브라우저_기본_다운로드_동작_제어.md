---
title: 02_HTML5_download_속성_브라우저_기본_다운로드_동작_제어
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# HTML5 download 속성: 브라우저 기본 다운로드 동작 제어

## 상위 맥락

`02_정적_자원_서빙_설계 < 04_파일_업로드와_자원_관리 < 02_Spring_MVC2_핵심_기술과_설계 < MVC < Spring < Web`

## 핵심 정리

HTML5 download 속성은 `<a>` 태그로 파일 링크를 제공할 때, 브라우저가 해당 파일을 화면에 열지 않고 다운로드하도록 유도하는 클라이언트 측 속성입니다.
자료에서는 정적 자원 서빙과 결합하여 서버의 별도 다운로드 컨트롤러 없이 파일 다운로드 동작을 제어하는 방식으로 설명합니다.

## 기본 동작과 차이

일반적으로 브라우저는 이미지나 PDF 같은 파일 링크를 클릭하면 다운로드하지 않고 현재 탭에서 열 수 있습니다.
하지만 `<a href="..." download="파일명">` 형태로 download 속성을 주면 브라우저는 해당 리소스를 로컬 파일로 저장하는 방향으로 동작합니다.

## 정적 자원 서빙과의 연결

[[01_WebMvcConfigurer_가상_경로와_물리_경로의_매핑_ResourceHandler|WebMvcConfigurer]]로 `/upload/**` 경로를 실제 파일 저장 위치에 연결해 두면, 화면에서는 다음과 같이 다운로드 링크를 구성할 수 있습니다.

```html
<a href="/upload/file.png" download="file.png">다운로드</a>
```

이 경우 서버는 파일 스트림을 직접 조립하는 컨트롤러 로직을 만들지 않아도 되고, 정적 자원 핸들러가 파일을 제공합니다.

## 주의할 점

자료에서는 보안이 필요한 파일을 단순 정적 경로로 열어두면 URL만 아는 사용자가 접근할 수 있는 문제가 생길 수 있다고 설명합니다.
공개 파일은 정적 자원 핸들러와 download 속성으로 처리할 수 있지만, 권한 검사가 필요한 파일은 컨트롤러를 거쳐 인증과 인가를 확인한 뒤 내려주는 흐름이 필요합니다.

## 한 문장 요약

HTML5 download 속성은 정적 자원으로 제공되는 파일 링크를 브라우저가 열람 대신 다운로드하도록 제어하는 클라이언트 측 다운로드 제어 방식입니다.

## 관련 문서

- 이전 문서: [[01_WebMvcConfigurer_가상_경로와_물리_경로의_매핑_ResourceHandler|WebMvcConfigurer_가상_경로와_물리_경로의_매핑_ResourceHandler]]
- 같은 묶음: [[01_WebMvcConfigurer_가상_경로와_물리_경로의_매핑_ResourceHandler|WebMvcConfigurer_가상_경로와_물리_경로의_매핑_ResourceHandler]]
- 전체 흐름 이전: [[01_WebMvcConfigurer_가상_경로와_물리_경로의_매핑_ResourceHandler|WebMvcConfigurer_가상_경로와_물리_경로의_매핑_ResourceHandler]]
- 전체 흐름 다음: [[01_Base64_Encoding_바이너리의_텍스트화_및_인라인_삽입|Base64_Encoding_바이너리의_텍스트화_및_인라인_삽입]]
- 통합 목차: [[00_통합_목차|통합 목차]]
