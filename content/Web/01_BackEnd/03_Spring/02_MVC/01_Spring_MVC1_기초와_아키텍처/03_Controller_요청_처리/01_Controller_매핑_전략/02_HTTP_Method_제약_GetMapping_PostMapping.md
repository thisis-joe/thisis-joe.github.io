---
title: 02_HTTP_Method_제약_GetMapping_PostMapping
created: 2026-05-14T00:02:29+09:00
updated: 2026-05-14T00:02:29+09:00
---

# HTTP Method 제약: @GetMapping, @PostMapping 활용 권장

## 상위 맥락

`01_Controller_매핑_전략 < 03_Controller_요청_처리 < 01_Spring_MVC1_기초와_아키텍처 < MVC < Spring < Web`

## 핵심 정리

스프링 MVC에서는 URL뿐 아니라 HTTP Method도 요청 매핑의 중요한 기준입니다.
같은 경로라도 GET 요청인지 POST 요청인지에 따라 의미가 다르기 때문입니다.
자료에서는 @RequestMapping의 method 속성보다 @GetMapping, @PostMapping 같은 축약형 사용을 권장하는 흐름을 정리합니다.

## 왜 Method 제약이 필요한가

GET은 주로 조회에 사용되고, POST는 데이터 생성이나 변경 요청에 사용됩니다.
만약 상태를 변경하는 메서드에 HTTP Method 제약 없이 @RequestMapping만 사용하면, 의도하지 않은 방식의 요청까지 컨트롤러에 들어올 수 있습니다.

예를 들어 단순 브라우저 접근인 GET 요청이 데이터 변경 로직으로 들어가면 심각한 문제가 됩니다.
따라서 요청의 행위를 명확하게 제한해야 합니다.

## @GetMapping과 @PostMapping

@GET 요청만 처리할 때는 @GetMapping을 사용합니다.
POST 요청만 처리할 때는 @PostMapping을 사용합니다.
이는 다음과 같은 장점이 있습니다.

- 코드만 봐도 요청 목적이 드러남.
- HandlerMapping 단계에서 잘못된 HTTP Method 요청을 차단할 수 있음.
- 컨트롤러 메서드가 더 명확한 단일 책임을 가짐.

## Request-Response Cycle에서의 의미

HTTP Method 제약은 컨트롤러 내부 로직이 실행되기 전에 적용됩니다.
즉, POST 전용 엔드포인트에 GET 요청이 들어오면 HandlerMapping 단계에서 적절한 핸들러가 없다고 판단되거나 Method Not Allowed 흐름으로 처리될 수 있습니다.
비즈니스 로직까지 잘못된 요청이 침투하지 않도록 앞단에서 걸러주는 구조입니다.

## 한 문장 요약

@GetMapping과 @PostMapping은 URL뿐 아니라 HTTP 요청의 행위까지 명확히 제한하여, 컨트롤러 진입점을 더 안전하고 예측 가능하게 만듭니다.

## 핵심 연결

[[01_HandlerMapping_URL_기반_핸들러_검색|HandlerMapping]]와 함께 읽으면 좋습니다.

## 관련 문서

- 이전 문서: [[01_RequestMapping_URL_경로와_메서드_연결|RequestMapping_URL_경로와_메서드_연결]]
- 같은 묶음: [[01_RequestMapping_URL_경로와_메서드_연결|RequestMapping_URL_경로와_메서드_연결]]
- 전체 흐름 이전: [[01_RequestMapping_URL_경로와_메서드_연결|RequestMapping_URL_경로와_메서드_연결]]
- 전체 흐름 다음: [[01_RequestParam_쿼리_파라미터_및_폼_데이터_매핑|RequestParam_쿼리_파라미터_및_폼_데이터_매핑]]
- 통합 목차: [[00_통합_목차|통합 목차]]
