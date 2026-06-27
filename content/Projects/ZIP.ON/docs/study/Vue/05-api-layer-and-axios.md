---
title: 05-api-layer-and-axios
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
---

# API Layer와 Axios

## 핵심 정의

API Layer는 Vue component가 백엔드 URL, header, error handling을 직접 알지 않아도 되도록 API 호출 함수를 모아 둔 계층이다.

## 왜 필요한가

component마다 URL 문자열을 직접 쓰면 다음 문제가 생긴다.

```text
API 주소가 바뀌면 여러 파일을 수정해야 한다.
인증 header 추가가 반복된다.
error handling 방식이 화면마다 달라진다.
params 이름이 백엔드 DTO와 어긋나기 쉽다.
```

그래서 ZIP:ON은 `frontend/src/api` 폴더를 둔다.

## ZIP:ON API module

```text
axiosInstance.js
authApi.js
searchApi.js
regionApi.js
propertyApi.js
mapApi.js
environmentApi.js
favoriteApi.js
communityApi.js
adminApi.js
rentRiskDiagnosisApi.js
```

## axiosInstance의 역할

```text
baseURL 설정
access token을 Authorization header에 붙이기
refresh token cookie 전송을 위한 withCredentials 설정
401 응답이면 /auth/refresh를 한 번 시도하기
refresh 실패 시 메모리 인증 상태 비우기
```

현재 기본 `baseURL`은 `import.meta.env.VITE_API_BASE_URL || '/api'`다. local 개발에서는 repository root `.env`의 `VITE_API_BASE_URL`을 비워 두고 `/api` 기본값을 사용한다. 그러면 `frontend/vite.config.js`의 proxy가 `/api` 요청을 `http://localhost:8082` 백엔드로 넘긴다.

`VITE_API_BASE_URL=http://localhost:8082/api`를 직접 넣으면 proxy를 우회하는 direct API 모드가 된다. 이 모드에서는 브라우저 Origin이 `http://localhost:5173`이고 요청 대상이 `http://localhost:8082`이므로 백엔드 CORS 응답이 정확해야 한다.

## API 함수 이름

백엔드 Service method와 비슷하게 맞추면 읽기 좋다.

```text
createRegionalIndicatorAnalysis()
createRentRiskDiagnosis()
getFavoriteAnalysis()
createFavorite()
deleteFavorite()
getCommunityPostList()
```

`propertyApi.js`의 `getPropertyList()`와 `getPropertyDetail()`은 현재 매물 feed가 아니라 호환/저장 검토 대상 fallback API로 읽는다.
MVP 핵심 진입은 `regionalIndicatorAnalysisApi.js`, `rentRiskDiagnosisApi.js`, `favoriteApi.js`를 먼저 따라간다.

## 실습 미션

```text
1. rentRiskDiagnosisApi.js가 어떤 endpoint를 호출하는지 찾는다.
2. SearchBar.vue가 API 실패를 alert가 아니라 화면 상태로 보여주는 이유를 설명한다.
3. axiosInstance.js에서 access token과 refresh token 책임이 어떻게 다른지 표시한다.
4. root .env에서 VITE_API_BASE_URL을 비웠을 때 Network 요청 URL이 /api로 시작하는지 확인한다.
```

## 공식 출처

- [Axios - First Steps](https://axios-http.com/docs/intro)
- [Vue - Scaling Up](https://vuejs.org/guide/scaling-up/sfc.html)
