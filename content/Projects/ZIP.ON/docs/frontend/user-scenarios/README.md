---
title: README
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
purpose: frontend-scenario-index
status: active
code_sync_required: false
related_area: frontend, scenario-test, ux
read_when: 
update_when: 
do_not_use_as: 
  - 프론트엔드 사용자 시나리오 계획과 결과 문서를 찾을 때
  - docs/frontend/user-scenarios 아래 계획서나 결과 보고서가 추가되거나 제거될 때
  - 현재 컴포넌트 구현 명세
---

# 사용자 시나리오 테스트

이 폴더는 ZIP:ON 프론트엔드를 순수 클라이언트 관점에서 검증한 계획과 결과를 보관한다. 사용자가 실제로 누르고, 입력하고, 실패하고, 되돌아가는 흐름을 기준으로 MVP 과거 지표 분석, 정확 주소 위험진단, 커뮤니티, 관리자, 인증, 마이페이지의 자연스러움을 점검한다.

## 문서 목록

- [프론트엔드 클라이언트 시나리오 테스트 계획](FRONTEND_CLIENT_SCENARIO_TEST_PLAN.md)
- [프론트엔드 클라이언트 시나리오 테스트 결과](FRONTEND_CLIENT_SCENARIO_TEST_REPORT.md)

## 읽는 순서

1. [제품 기준과 서비스 경계](/docs/product/PRODUCT_OVERVIEW.md)에서 ZIP:ON이 현재 매물 탐색 서비스가 아니라 과거 지표 분석과 계약 전 위험진단 서비스라는 기준을 먼저 확인한다.
2. [과거 지표 기반 부동산 분석 MVP 범위](/docs/product/MVP_SCOPE.md)에서 홈 화면 분석/진단 입력 폼 중심 UX를 확인한다.
3. [프론트엔드 클라이언트 시나리오 테스트 계획](FRONTEND_CLIENT_SCENARIO_TEST_PLAN.md)을 읽고 실제 사용자 행동 검증 범위를 확인한다.
4. [프론트엔드 클라이언트 시나리오 테스트 결과](FRONTEND_CLIENT_SCENARIO_TEST_REPORT.md)를 읽어 관찰된 문제, 개선 내용, 남은 리스크를 확인한다.

## 유지 규칙

- 새 시나리오 결과 문서를 추가하면 이 README와 상위 `docs/README.md`, `docs/frontend/README.md`에 링크한다.
- 플로우차트는 Mermaid로 작성하고, 사용자가 갈 수 있는 정상 흐름과 실패/권한 흐름을 분리한다.
- MVP 밖 확장 기능은 껍데기 테스트 대상으로 만들지 않는다. 현재 프론트에 이미 노출된 행동과 MVP에 필요한 흐름만 검증한다.
