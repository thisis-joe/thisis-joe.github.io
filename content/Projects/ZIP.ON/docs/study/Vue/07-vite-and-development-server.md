---
title: 07-vite-and-development-server
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
purpose: learning
status: active
code_sync_required: false
related_area: vue, vite, frontend-dev-server
read_when: 
do_not_use_as: 
  - Vite 개발 서버, build, proxy와 backend CORS 관계를 학습할 때
  - 현재 frontend 배포 명세
---

# Vite와 개발 서버

## 핵심 정의

Vite는 빠른 개발 서버와 빌드 도구를 제공하는 프론트엔드 도구다.

## 왜 필요한가

Vue SFC는 브라우저가 그대로 실행하는 파일 형식이 아니다. Vite는 개발 중에 `.vue` 파일과 JavaScript module을 처리하고, 변경 사항을 빠르게 반영한다.

## ZIP:ON에서 쓰는 명령

```bash
npm run dev
npm run build
```

`npm run dev`는 개발 서버를 실행한다.

```text
http://localhost:5173
```

`npm run build`는 배포 가능한 정적 파일을 만든다.

```text
frontend/dist
```

## 개발 서버와 백엔드 서버

ZIP:ON은 개발 중 프론트엔드와 백엔드가 다른 서버에서 실행된다.

```text
Frontend Vite:
http://localhost:5173

Backend Spring Boot:
http://localhost:8082
```

이 차이 때문에 CORS와 `baseURL` 설정을 이해해야 한다.

## 권장 방식: Vite proxy

현재 ZIP:ON frontend는 `frontend/vite.config.js`에서 `/api` proxy를 둔다.

```text
Browser
-> http://localhost:5173/api/rent-risk-diagnoses
-> Vite proxy
-> http://localhost:8082/api/rent-risk-diagnoses
-> Spring Boot
```

이렇게 하면 프론트 코드는 기본적으로 `/api`만 알면 된다. 실제 백엔드 주소는 개발 서버 proxy가 처리한다. root `.env`의 `VITE_API_BASE_URL`을 비워 두면 `frontend/src/api/axiosInstance.js`가 `/api` 기본값을 사용한다.

## 선택 방식: direct API

root `.env`에 아래 값을 넣으면 proxy 대신 백엔드 API 주소를 직접 사용한다.

```text
VITE_API_BASE_URL=http://localhost:8082/api
```

이때는 브라우저가 `http://localhost:5173`에서 `http://localhost:8082`로 cross-origin 요청을 보내므로 백엔드 CORS 설정이 필요하다. 로그인, refresh cookie, Juso 주소 팝업처럼 browser API 호출이 필요한 기능은 CORS header가 틀리면 실패한다.

## 실습 미션

```text
1. frontend/package.json에서 dev와 build script를 찾는다.
2. Vite dev server와 Spring Boot server가 다른 역할을 하는 이유를 설명한다.
3. vite.config.js의 /api proxy가 어떤 요청을 백엔드로 넘기는지 설명한다.
4. root .env에서 VITE_API_BASE_URL을 비우고 Network 탭의 요청 URL을 확인한다.
```

## 공식 출처

- [Vite - Getting Started](https://vite.dev/guide/)
- [Vue - Single-File Components](https://vuejs.org/guide/scaling-up/sfc.html)
