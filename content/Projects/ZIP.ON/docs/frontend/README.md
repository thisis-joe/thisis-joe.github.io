---
title: README
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-30T05:00:06+09:00
purpose: frontend-current-architecture-index
status: active
code_sync_required: true
related_code: 
read_when: 
update_when: 
  - frontend/src/api
  - frontend/src/components
  - frontend/src/views
  - frontend/src/router
  - 화면, 컴포넌트, frontend API module, router를 수정할 때
  - 사용자 진입점, 화면 책임, 컴포넌트 역할, API 연결 방식이 바뀔 때
---

# Frontend Docs

이 폴더는 ZIP:ON 프론트엔드가 사용자에게 과거 지표 분석과 정확 주소 위험진단 결과를 어떻게 보여줄지 관리한다.

이 폴더의 구현 문서는 현재 화면과 컴포넌트 책임에 맞아야 한다. 학습용 Vue 개념은 `docs/study/Vue/`에서 별도로 읽는다.

## 읽는 순서

1. [SCREEN_ANALYSIS_POLICY.md](SCREEN_ANALYSIS_POLICY.md)
2. [COMPONENT_ROLE_MAP.md](COMPONENT_ROLE_MAP.md)
3. [INTEREST_PROPERTY_DETAIL_DECISION.md](INTEREST_PROPERTY_DETAIL_DECISION.md)
4. [MAP_DIAGNOSIS_UX_PLAN.md](MAP_DIAGNOSIS_UX_PLAN.md)
5. [user-scenarios/README.md](user-scenarios/README.md)

## Core 화면 원칙

- MVP 분석/진단은 홈 화면 분석/진단 입력 폼에서 시작한다.
- 현재 매물 목록과 현재 매물 지도 탐색은 MVP core가 아니다.
- 지역·유형 입력 결과는 현재 매물 목록이 아니라 과거 지표 분석 리포트다.
- 정확 주소 입력 결과는 API 원문 나열이 아니라 계약 전 판단 리포트다.
- 지도 화면은 현재 매물 탐색 지도가 아니라 위치 검토, 진단 위치 선택, 주소 후보 확인, 관심 부동산 위치 저장을 돕는 보조 도구다.
- 관심 부동산 화면은 저장한 주소/스냅샷을 현재 매물처럼 홍보하지 않고, 계약 전 다시 볼 분석 기준과 직접 확인 항목으로 설명한다.
- 관심 부동산 상세는 같은 사용자·동일 주소의 진단 evidence를 후보 근거로만 참고하고, 사용자 명시 연결 전까지 진단 완료나 안전 확정처럼 표시하지 않는다.
- 관심 부동산 상세는 `FavoriteAnalysisResponse`의 table명, raw key, raw enum을 그대로 렌더링하지 않고 화면 표시용 view model에서 사용자 문구로 변환한다.
- 마이페이지는 관리자식 로그 조회 화면이 아니라 닉네임, 프로필 이미지 URL/파일 업로드, 계정, 관심 부동산, 최근 진단 리포트, 계약 전 후속 작업을 모으는 개인 작업대다.
- 기존 디자인을 갈아엎지 않고 결과 영역을 점진적으로 깊게 만든다.

## 화면별 시작점

| 화면/흐름 | 먼저 볼 파일 | 함께 볼 API/문서 |
| --- | --- | --- |
| 홈 분석/진단 입력 | `frontend/src/components/common/SearchBar.vue`, `frontend/src/components/home/MainHero.vue`, `frontend/src/views/SearchResultView.vue` | `frontend/src/api/rentRiskDiagnosisApi.js`, `frontend/src/api/regionalIndicatorAnalysisApi.js`, [MVP API 호출 흐름](/docs/api/API_CALL_FLOW.md) |
| 위험진단 결과 | `frontend/src/components/home/LeaseRiskDiagnosisResult.vue`, `frontend/src/components/home/RiskAssessmentEvidencePanel.vue` | [위험도 산정 정책](/docs/architecture/RISK_SCORING_POLICY.md), [AI 위험도 산정 엔진](/docs/CODEX/reference/AI_RISK_SCORING_ENGINE.md) |
| 진단 지도 | `frontend/src/views/MapView.vue`, `frontend/src/components/map/MapSidePanel.vue`, `frontend/src/components/map/MapFieldCheckPanel.vue` | `frontend/src/api/mapApi.js`, [지도 UX 계획](MAP_DIAGNOSIS_UX_PLAN.md) |
| 관심 부동산 상세 | `frontend/src/views/PropertyDetailView.vue`, `frontend/src/api/favoriteApi.js` | [관심 부동산 상세 결정](INTEREST_PROPERTY_DETAIL_DECISION.md) |
| 마이페이지 | `frontend/src/views/MyPageView.vue`, `frontend/src/components/common/AppHeader.vue` | `frontend/src/api/authApi.js`, `frontend/src/api/rentRiskDiagnosisApi.js`, `frontend/src/api/favoriteApi.js` |
| 관리자 운영 화면 | `frontend/src/views/AdminDashboardView.vue`, `frontend/src/api/adminApi.js` | [역할·부서 권한 정책](/docs/architecture/security/ROLE_DEPARTMENT_AUTHORIZATION.md) |

`MapFieldCheckPanel.vue`의 완료 상태와 memo는 `GET/PUT /api/map/field-checks`에 연결되어 있다. 이 기록은 사용자의 직접 확인 메모이며, 위험진단 결과를 자동으로 안전/위험 확정하는 근거가 아니다.
