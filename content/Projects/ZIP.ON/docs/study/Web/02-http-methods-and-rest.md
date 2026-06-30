---
title: 02-http-methods-and-rest
created: 2026-07-01T00:06:00+09:00
updated: 2026-07-01T00:06:00+09:00
---

# HTTP Method와 REST API

## 한 줄 정의

HTTP method는 리소스에 대해 어떤 행동을 할지 표현하고, REST API는 리소스 중심으로 API를 설계하는 방식이다.

## 주요 HTTP method

```text
GET:
조회

POST:
생성 또는 처리 요청

PUT:
전체 수정에 가까운 요청

PATCH:
부분 수정에 가까운 요청

DELETE:
삭제
```

## ZIP:ON API 예시

```text
GET /api/regions
지역 목록 조회

POST /api/auth/signup
회원가입

POST /api/favorites
관심 항목 생성

DELETE /api/favorites/{favoriteId}
관심 항목 삭제

PUT /api/community/posts/{postId}
게시글 수정
```

## URL 이름 짓기

좋은 방향:

```text
/api/rent-risk-diagnoses
/api/regional-indicator-analyses
/api/regions
/api/community/posts
```

피할 방향:

```text
/api/getPropertyList
/api/createFavorite
/api/deletePost
```

URL은 리소스를 표현하고, 행동은 HTTP method로 표현하는 쪽이 읽기 쉽다.

## 실습 미션

```text
1. /api/users/me는 왜 GET인지 설명한다.
2. 게시글 작성 API가 /api/community/posts/create가 아닌 POST /api/community/posts인 이유를 적는다.
3. 정확 주소 전세·월세 위험진단이 `POST /api/rent-risk-diagnoses`를 쓰고, 지역·유형 과거 지표 분석이 `POST /api/regional-indicator-analyses`를 쓰는 이유를 비교한다.
```

## 공식 출처

- [MDN - HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods)
- [Spring Framework - Annotated Controllers](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html)
