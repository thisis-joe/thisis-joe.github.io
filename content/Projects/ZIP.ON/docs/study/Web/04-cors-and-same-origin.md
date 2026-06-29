---
title: 04-cors-and-same-origin
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-30T05:00:06+09:00
---

# CORS와 Same-Origin Policy

## 핵심 정의

Same-Origin Policy는 브라우저가 적용하는 보안 정책이고, CORS는 서버가 다른 origin의 브라우저 요청을 허용한다고 응답 header로 알려주는 방식이다.

origin은 세 가지 값의 조합이다.

```text
scheme + host + port
```

예를 들어 아래 주소들은 서로 다른 origin이다.

```text
http://localhost:5173
http://localhost:8082
http://127.0.0.1:5173
```

## ZIP:ON 로컬 개발 구조

ZIP:ON 로컬 개발은 두 가지 방식으로 API를 호출할 수 있다.

```text
권장: Vite proxy 모드
Browser -> http://localhost:5173/api/... -> Vite proxy -> http://localhost:8082/api/...

선택: direct API 모드
Browser -> http://localhost:8082/api/...
```

권장 방식은 Vite proxy 모드다. 브라우저 입장에서는 `http://localhost:5173`으로만 요청하는 것처럼 보이므로 앱 API 호출에서 CORS 문제가 줄어든다. repository root `.env`의 `VITE_API_BASE_URL`을 비워 두면 `frontend/src/api/axiosInstance.js`가 기본값 `/api`를 사용하고, `frontend/vite.config.js`의 proxy가 백엔드로 전달한다.

direct API 모드는 `VITE_API_BASE_URL=http://localhost:8082/api`처럼 명시했을 때 사용된다. 이때 브라우저 Origin은 `http://localhost:5173`이고 요청 대상은 `http://localhost:8082`이므로 백엔드 CORS 응답이 필요하다.

## 이번 CORS 장애 원인

증상:

```text
Access-Control-Allow-Origin: http://localhost:8082
Origin: http://localhost:5173
```

브라우저는 `Access-Control-Allow-Origin`이 요청 Origin과 정확히 같거나 허용 가능한 wildcard여야 응답을 JavaScript에 넘긴다. 그런데 응답 header가 `http://localhost:8082`이면, 이것은 "백엔드 주소"이지 "프론트 Origin"이 아니다. 그래서 로그인, `/api/auth/refresh`, `/api/diagnosis-purposes`, Juso 직접 주소검색 proxy, Juso 주소 팝업 같은 브라우저 API 호출이 차단된다.

전에는 문제가 없었던 이유는 로컬 실행이 Vite proxy 모드였거나, 실행 중인 백엔드가 `http://localhost:5173` Origin을 제대로 echo하는 CORS 설정을 쓰고 있었기 때문이다. `.env`에 `VITE_API_BASE_URL=http://localhost:8082/api`가 들어가면 proxy를 우회해서 direct API 모드가 되고, 잘못된 CORS 응답이 바로 드러난다.

CSS 오류는 별도 원인이다. `frontend/index.html`의 CDN stylesheet에 `crossorigin`이 붙어 있으면 브라우저가 stylesheet도 CORS 모드로 가져온다. 폰트/스타일 CDN 응답 header가 현재 Origin과 맞지 않으면 앱 API와 무관하게 stylesheet가 차단될 수 있다. ZIP:ON은 stylesheet에 credentials가 필요 없으므로 `crossorigin`을 쓰지 않는다.

## 현재 구현

백엔드 CORS 설정 위치:

```text
backend/src/main/java/com/zipon/config/WebConfig.java
```

`WebConfig.corsConfigurationSource()`는 `/api/**`에 대해 로컬 개발 Origin을 허용한다.

```text
http://localhost:*
http://127.0.0.1:*
```

`SecurityConfig.securityFilterChain(...)`의 `.cors(Customizer.withDefaults())`는 이 `CorsConfigurationSource` bean을 사용한다. 그래서 preflight 요청은 인증 필터보다 먼저 CORS 규칙으로 처리된다.

검증 테스트:

```text
backend/src/test/java/com/zipon/CorsIntegrationTest.java
```

이 테스트는 `http://localhost:5173`에서 `/api/auth/login`으로 보내는 preflight, `http://127.0.0.1:5173`에서 `/api/address-search/juso`로 보내는 직접검색 preflight, `/api/address-search/juso-popup`으로 보내는 보조 팝업 preflight가 올바른 `Access-Control-Allow-Origin`을 돌려주는지 확인한다.

## 디버깅 체크리스트

1. 브라우저 Network 탭에서 `Request Headers > Origin`을 확인한다.
2. 같은 요청의 `Response Headers > Access-Control-Allow-Origin`이 Origin과 같은지 확인한다.
3. root `.env`의 `VITE_API_BASE_URL`이 비어 있는지 확인한다. 로컬 기본값은 proxy 모드다.
4. direct API 모드를 의도했다면 `backend/src/main/java/com/zipon/config/WebConfig.java`가 실행 중인 백엔드에 반영되었는지 확인한다.
5. 백엔드 서버를 재시작한다. 오래 떠 있던 프로세스는 이전 CORS 설정을 계속 반환할 수 있다.
6. `frontend/index.html`의 외부 stylesheet에 불필요한 `crossorigin`이 붙어 있지 않은지 확인한다.

## 학습 포인트

CORS는 프론트엔드 코드가 임의로 푸는 문제가 아니다. 브라우저가 보안 정책을 적용하고, 서버가 "이 Origin은 허용한다"는 header를 정확히 돌려줘야 한다. 특히 `Access-Control-Allow-Origin`에는 요청 대상 URL이 아니라 브라우저가 보낸 `Origin`이 들어가야 한다.

## 공식 출처

- [MDN - Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- [Spring Framework - CORS](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html)
