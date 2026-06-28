---
title: 08-controller-annotations
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-29T05:00:06+09:00
---

# Controller Annotation

## 한 줄 정의

Controller annotation은 HTTP 요청 정보를 Java method parameter와 method mapping으로 연결하는 표식이다.

## 자주 쓰는 annotation

```text
@RestController
JSON API Controller를 만들 때 사용한다.

@RequestMapping
Controller 또는 method의 공통 URL path를 지정한다.

@GetMapping
GET 요청을 처리한다.

@PostMapping
POST 요청을 처리한다.

@PutMapping
PUT 요청을 처리한다.

@DeleteMapping
DELETE 요청을 처리한다.

@PathVariable
URL path에 들어간 값을 method parameter로 받는다.

@RequestParam
query parameter 값을 받는다.

@RequestBody
HTTP request body의 JSON을 DTO로 받는다.
```

## ZIP:ON에서 보는 예시

```text
GET /api/regions/{regionId}
-> regionId는 @PathVariable 후보

GET /api/search?keyword=강남
-> keyword는 @RequestParam 후보

POST /api/favorites
-> body는 FavoriteCreateRequest 후보
```

## PathVariable과 RequestParam 차이

```text
PathVariable:
리소스 식별자에 가깝다.
예: /api/community/posts/1

RequestParam:
조회 조건, 필터, 정렬에 가깝다.
예: /api/search?keyword=강남
```

## RequestBody를 쓰는 경우

```text
생성
수정
복잡한 검색 조건
여러 필드를 가진 요청
```

## 실습 미션

```text
1. CommunityController에서 PathVariable이 들어가는 method를 찾는다.
2. RegionalIndicatorAnalysisRequest는 RequestParam 방식이 좋을지, RequestBody 방식이 좋을지 생각한다.
3. CommunityPostCreateRequest에 어떤 검증 annotation이 들어갈지 주석으로 적는다.
```

## 공식 출처

- [Spring Framework - Annotated Controllers](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html)
- [Spring Framework - @RequestBody](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html)
- [Spring Framework - @RequestParam](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestparam.html)
