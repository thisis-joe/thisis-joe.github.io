---
title: COMPONENT_ROLE_MAP
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-27T05:00:07+09:00
---

# ZIP:ON 프론트엔드 컴포넌트 역할 지도

> Status: Implemented + Guidance

## 목적

이 문서는 현재 Vue/Vite 프론트엔드의 주요 파일을 사용자 흐름 기준으로 설명한다. 새 개발자가 화면을 수정할 때 "어느 파일이 어떤 책임을 갖는지" 먼저 찾게 하는 것이 목적이다.

## MVP core 흐름

| 사용자 행동 | 주요 파일 | 역할 |
| --- | --- | --- |
| 사이트 진입 | `frontend/src/views/HomeView.vue` | 홈 화면을 `MainHero.vue` 중심의 분석/진단 진입점으로 배치하고, 첫 화면 아래에 과거 지표 분석 예시를 연결. 커뮤니티 프리뷰는 홈에서 import하지 않음 |
| 홈 히어로 | `frontend/src/components/home/MainHero.vue` | 대한민국 주거지 배경 이미지 위에서 ZIP:ON이 현재 매물 서비스가 아니라 과거 지표 기반 위험진단 서비스임을 설명하고 `SearchBar.vue`를 첫 화면에 노출. 진단 후보 카드가 길어져도 배경 이미지가 상하로 늘어나지 않도록 배경은 고정 높이 시각 레이어로 제한 |
| 분석/진단 시작 | `frontend/src/components/common/SearchBar.vue` | 홈 화면 주소·지역 우선 입력 폼, 정확 주소와 지역·유형 입력 수준 판별 |
| 지역·유형 과거 지표 분석 | `frontend/src/views/SearchResultView.vue` | `강남 원룸` 같은 입력을 현재 매물 목록이 아니라 위치·유형·지표 후보와 저장 지표 상태로 분해 |
| 정확 주소 위험진단 API 호출 | `frontend/src/api/rentRiskDiagnosisApi.js` | `/api/rent-risk-diagnoses` 호출 |
| 결과 표시 | `frontend/src/components/home/LeaseRiskDiagnosisResult.vue` | 결론, 핵심 위험 신호, 입력/주소, 물건 정체, 가격·보증금, 데이터 상태, 자동 판단 불가, 체크리스트, 다음 행동 섹션 배치. 사용자가 결과를 보다가 다시 검토하고 싶어질 수 있으므로 `frontend/src/utils/favoritePayload.js`와 Kakao geocoding을 통해 진단 기준을 관심 부동산 snapshot으로 저장하는 floating action을 제공 |
| 구조화 위험 근거 표시 | `frontend/src/components/home/RiskAssessmentEvidencePanel.vue` | `riskAssessment.criteria`를 상세 산정 근거로 표시 |
| 인증 modal | `frontend/src/components/auth/AuthModal.vue` | 로그인/회원가입 UI |
| API 공통 처리 | `frontend/src/api/axiosInstance.js` | base URL, 공통 HTTP client |
| 전역 팝업 알림 | `frontend/src/components/common/GlobalToast.vue`, `frontend/src/notifications/toastStore.js`, `frontend/src/notifications/sessionAlertNotifications.js`, `frontend/src/App.vue` | 로그인 실패 제한, 신고 rate limit, 폐기/만료 access token, DB 알림, 관리자 volatile state alert를 화면 우상단 토스트로 표시 |

## Supporting MVP 화면

| 영역 | 주요 파일 | MVP 역할 |
| --- | --- | --- |
| 커뮤니티 목록 | `frontend/src/views/CommunityListView.vue` | 진단 이후 질문/사례 공유, 다중 게시판 필터, 정렬, compact 목록, 우측 슬라이드 상세 패널 |
| 커뮤니티 상세 | `frontend/src/views/CommunityPostDetailView.vue` | 직접 URL 진입용 상세 화면, compact 첨부파일, 댓글, 신고, 작성자 권한 흐름 |
| 관리자 | `frontend/src/views/AdminDashboardView.vue` | 사용자 role/department, 커뮤니티 권한 체크박스 표, 운영권한 드롭다운, 저장 전 비밀번호 확인, 신고/위험진단 이력/공공데이터 수집 상태/외부 API 로그 관리 surface |
| 마이페이지 | `frontend/src/views/MyPageView.vue` | 닉네임 편집, 프로필 이미지 URL 입력과 파일 업로드, 계정 요약, 관심 부동산 요약, 최근 진단 리포트 카드, 지도 검토·커뮤니티 질문 후속 행동. 관리자식 raw log/table/filter 화면으로 만들지 않음 |
| 관심 부동산 | `frontend/src/views/FavoriteView.vue`, `frontend/src/views/PropertyDetailView.vue` | 저장한 주소/스냅샷을 이미지 없는 검토 큐로 모아 보고, 상세 화면에서 A~F 검토 등급, 가격 흐름, 자료 연결 상태, 구조화 위험 기준별 전체 근거, R-ONE 시장 맥락, 직접 확인 체크리스트를 대시보드로 표시. 같은 판단을 타이밍 카드와 상태 카드로 반복하지 않음 |
| 전역 헤더 | `frontend/src/components/common/AppHeader.vue` | 인증 상태, 권한 안내, 네비게이션, 로그인 사용자 전용 마이페이지 버튼, 사용자 닉네임/프로필 avatar, 수동 토큰 갱신 버튼을 관리. 토큰 갱신 성공/실패 안내는 헤더 하단 배너가 아니라 버튼 내부 상태와 남은 시간 표시로 처리 |
| 위치 검토와 현장 확인 | `frontend/src/views/MapView.vue`, `frontend/src/components/map/*`, `frontend/src/api/mapApi.js` | 현재 매물 지도 탐색이 아니라 진단 위치 선택, 청록색 정확 주소 후보 marker, 투명한 파란 가능 지역 경계 polygon, Kakao 장소 중심 이동, Juso 후보 확인, 관심 부동산 위치 보조 레이어, 생활권/데이터 확보 상태, `GET/PUT /api/map/field-checks` 기반 현장 확인 memo를 공공데이터 확인 순서로 안내하는 보조 화면. 지도 배경 클릭 좌표나 장소 검색 중심점, 가능 지역 경계 중심점은 진단 주소로 승격하지 않으며, `MapSidePanel.vue`에서 구조화 주소나 근거가 있는 선택 카드만 관심 부동산 snapshot 저장으로 보낼 수 있음 |

전역 팝업 알림은 각 화면의 inline error를 대체하지 않는다. `AuthModal.vue`와 커뮤니티 신고 modal은 사용자가 입력을 수정할 수 있도록 inline 오류를 유지하고, `GlobalToast.vue`는 Redis/volatile state 또는 DB 알림처럼 사용자가 즉시 알아야 하는 상태 변화를 짧게 띄운다. `sessionAlertNotifications.js`는 로그인 후 `frontend/src/api/notificationApi.js`로 사용자 DB 알림을 조회하고, 운영자 role이면 `frontend/src/api/adminApi.js`의 `getAdminVolatileStateAlerts()`로 scheduler lock 알림을 주기적으로 확인한다.

## Lightweight Component Candidates

| 파일 | 현재 해석 |
| --- | --- |
| `frontend/src/components/common/BaseButton.vue` | `variant`만 직접 prop으로 받는 최소 공통 버튼이다. `disabled`, `aria-*`, click listener는 root button fallthrough attribute로 전달된다. loading/size/icon prop은 여러 화면에서 반복될 때 추가한다. |
| `frontend/src/components/common/SideMenu.vue` | 현재 `App.vue` shell에는 직접 연결되어 있지 않고, `MapLayout.vue`의 layout 분리 후보 경로에서 사용할 수 있다. 닫기 버튼은 부모에게 `close` event만 보낸다. |
| `frontend/src/components/community/CommunityPostList.vue`, `frontend/src/components/community/CommunityPostItem.vue` | 현재 메인 커뮤니티 목록은 `CommunityListView.vue`가 API 호출, 필터, compact list, 우측 상세 패널을 직접 소유한다. 이 두 컴포넌트는 props 기반 단순 목록 재사용 후보이며 API를 직접 호출하지 않는다. |
| `frontend/src/components/property/PropertyList.vue`, `frontend/src/components/property/PropertyCard.vue`, `frontend/src/components/property/PropertyFilter.vue` | 현재 매물 목록/매물 필터가 아니라 지역·주소 분석 기준과 저장 검토 후보를 표시하는 보조 컴포넌트다. 실제 관심 부동산 저장과 분석 상세는 `FavoriteView.vue`, `PropertyDetailView.vue`, `favoriteApi.js` 흐름을 우선 읽는다. |

## Authorization UI

| 파일 | 역할 |
| --- | --- |
| `frontend/src/auth/authorizationPolicy.js` | backend `UserRole`, `DepartmentCode`와 맞춘 관리자 authority, role option, department option의 프론트 단일 참조점 |
| `frontend/src/router/index.js` | `/admin` 접근 시 `ROLE_ADMIN` 하나가 아니라 운영자 authority 전체를 확인 |
| `frontend/src/components/common/AppHeader.vue` | 운영자 authority가 있는 사용자에게 관리자 링크와 접근 안내 표시 |
| `frontend/src/views/AdminDashboardView.vue` | 사용자 생성/role 변경 시 role과 department를 함께 전송하고, 사용자 목록 정렬 드롭다운과 권한 저장 비밀번호 확인 dialog를 제공한다. 커뮤니티 권한은 체크박스 표로, 운영권한은 preset 드롭다운으로 편집한다. |

프론트의 관리자 접근 판단은 UX 보조이다. 실제 API 권한은 backend `SecurityConfig`의 `/api/admin/...` matcher와 `UserRole` authority set이 최종 판단한다.

## Extension 또는 보조 화면

| 파일 | 현재 해석 |
| --- | --- |
| `frontend/src/views/ApartmentListView.vue` | 직접 URL 진입 시에도 현재 매물 목록이 아니라 아파트 과거 지표 분석 진입점과 경계 문구를 표시 |
| `frontend/src/views/HouseListView.vue` | 직접 URL 진입 시에도 빌라/원룸 listing이 아니라 다가구·다세대·연립 위험 기준과 정확 주소 진단 흐름을 안내 |
| `frontend/src/views/CommercialView.vue` | 상가 현재 매물 검색 화면이 아니라 MVP 밖 확장 후보임을 설명하고 지역·유형 분석 입력으로 연결 |
| `frontend/src/views/RegionDetailView.vue` | 직접 URL 진입 시에도 현재 매물 목록이 아니라 지역·유형 과거 지표 기준과 정확 주소 진단 연결을 안내 |
| `frontend/src/views/EnvironmentView.vue` | 생활·환경 정보를 현재 매물 추천 기준이 아니라 정확 주소 위험진단의 보조 근거와 현장 확인 항목으로 설명 |
| `frontend/src/components/home/HistoricalIndicatorExampleList.vue` | 홈 히어로 아래에서 현재 매물/인기매물 카드가 아니라 과거 지표 분석 예시를 보여줌 |

## Related documents

- [분석 화면 정책](SCREEN_ANALYSIS_POLICY.md)
- [프론트 사용자 시나리오](/docs/frontend/user-scenarios/README.md)
- [API 프론트 연결 명세](/docs/api/API_FRONTEND_CONNECTION_SPEC.md)
