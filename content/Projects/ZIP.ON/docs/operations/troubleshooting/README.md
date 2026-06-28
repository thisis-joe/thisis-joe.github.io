---
title: README
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-29T05:00:06+09:00
purpose: troubleshooting-index
status: active
code_sync_required: false
related_area: operations, troubleshooting
read_when: 
update_when: 
  - 상세 트러블슈팅 문서를 찾을 때
  - docs/operations/troubleshooting 아래 문서가 추가되거나 제거될 때
---

# Troubleshooting Docs

이 폴더는 실제 장애나 혼란스러운 개발 환경 문제를 원인, 재현, 해결, 검증, 학습 포인트까지 상세히 기록한다.
`docs/operations/skills/`가 다음 작업자가 빠르게 따라 하는 짧은 반복 절차라면, 이 폴더는 사람이 읽고 문제를 이해하기 위한 상세 트러블슈팅 문서다.

## 읽는 순서

1. [Juso CORS와 주소 팝업 callback 문제](juso-cors-popup-callback.md)

## 문서 작성 기준

- 증상을 CORS, HTTPS, proxy, callback, postMessage처럼 겉보기 단어로만 끝내지 않는다.
- 브라우저, Vite, Spring MVC, Tomcat, 외부 API 사이에서 실제 요청이 어디로 가는지 분리한다.
- 해결 코드를 파일명, class, method, endpoint, 환경변수 이름으로 정확히 연결한다.
- 재현 명령, 확인 명령, 테스트 명령, rollback 기준을 함께 남긴다.
- 운영자가 다음에 같은 증상을 봤을 때 먼저 확인할 로그와 URL을 적는다.
