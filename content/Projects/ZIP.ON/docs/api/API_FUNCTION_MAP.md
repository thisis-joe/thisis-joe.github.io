---
title: API_FUNCTION_MAP
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
---

# ZIP:ON API와 함수 학습 지도

> Status: Current implementation + Proposed extensions

이 문서는 ZIP:ON의 API와 함수가 왜 필요한지 설명합니다.

중요한 기준은 하나입니다.

```text
함수는 기술에서 출발하지 않고 사용자 행동에서 출발한다.
```

현재 ZIP:ON에는 검색, 지역, 매물, 지도, 생활환경, 관심, 커뮤니티, 인증, 관리자, 위험진단 API가 섞여 있습니다. 그러나 제품 우선순위는 [과거 지표 기반 부동산 분석 MVP 범위](/docs/product/MVP_SCOPE.md)를 따릅니다. 현재 매물 목록과 직접 관련된 API는 MVP core가 아니라 향후 분석/진단을 보조하는 경계로 읽습니다.

MVP 분석/진단의 사용자 행동은 "현재 매물을 검색한다"가 아니라 "홈 화면 분석/진단 입력 폼에서 지역·유형 과거 지표 분석 또는 정확 주소 위험진단을 시작한다"입니다. 현재 구현된 기본 진입점은 `MainHero.vue`가 렌더링하는 `SearchBar.vue`의 `diagnosis` mode입니다. `App.vue`에는 전역 플로팅 챗봇이나 채팅 세션 상태를 연결하지 않습니다.

실제 endpoint가 어느 프론트 API 함수와 View/Component에 연결되어 있는지는 [API 명세와 프론트엔드 연결 현황](/docs/api/API_FRONTEND_CONNECTION_SPEC.md)을 기준으로 확인합니다.

## 1. 함수 이름의 기본 패턴

ZIP:ON은 아래 패턴을 기본으로 사용합니다.

```text
search*
검색한다.

get*List
여러 개를 조회한다.

get*Detail
하나의 상세 정보를 조회한다.

get*Summary
요약 정보를 조회한다.

get*Trend
시간 흐름 데이터를 조회한다.

create*
새 데이터를 만든다.

update*
기존 데이터를 수정한다.

delete*
기존 데이터를 삭제한다.
```

왜 이렇게 쓰는가:

```text
읽는 사람이 반환 형태를 짐작할 수 있다.
프론트 API 함수와 백엔드 Service 메서드를 맞추기 쉽다.
테스트 이름을 만들기 쉽다.
새 기능이 들어와도 이름 규칙이 흔들리지 않는다.
```

## 2. 현재 API와 함수 대응표

### Health

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트 API |
|---|---|---|---|---|
| 서버가 살아있는지 확인 | `GET /api/health` | `HealthController.health()` | 없음 | 필요 시 별도 생성 |

왜 필요한가:

개발 초기에 프론트와 백엔드가 연결되는지 확인하는 가장 작은 기준입니다. 나중에 배포 환경에서도 서버 상태 확인에 사용할 수 있습니다.

### Auth

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트 API |
|---|---|---|---|---|
| 회원가입 | `POST /api/auth/signup` | `signUp()` | `signUp()` | `signUp()` |
| 로그인 | `POST /api/auth/login` | `login()` | `login()` | `login()` |
| access token 재발급 | `POST /api/auth/refresh` | `refresh()` | `refresh()` | `refreshAccessToken()` |
| 로그아웃 | `POST /api/auth/logout` | `logout()` | `logout()` | `logout()` |
| 현재 사용자 확인 | `GET /api/users/me` | `getMyPage()` | `getMyPage()` | `getCurrentUser()` |

프론트 인증 상태는 `frontend/src/auth/authSession.js`가 메모리에 보관하고, `frontend/src/api/axiosInstance.js`가 요청마다 `Authorization: Bearer <accessToken>` header를 붙입니다. 로그인/회원가입 UI는 `frontend/src/components/auth/AuthModal.vue`와 `frontend/src/components/common/AppHeader.vue`에 연결되어 있습니다.

`GET /api/users/me`는 현재 사용자의 `authorities`뿐 아니라 `permissions`와 `pagePermissions`도 내려준다. Vue router는 이 값을 보고 `/admin`, `/favorites`, `/community` 같은 route의 page 접근을 1차로 제어한다.

주의:

```text
access token은 localStorage/sessionStorage에 저장하지 않는다.
refresh token 원문은 JSON 응답에 담지 않고 HttpOnly, SameSite=Strict cookie로만 전달한다.
logout은 refresh cookie 폐기를 우선하고, access token denylist 기록은 토큰이 해석 가능한 경우에 수행한다.
```

### Address Search

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트 API |
|---|---|---|---|---|
| 홈 위험진단 입력 폼에서 정확 주소 후보 검색 | `GET /api/address-search/juso` | `JusoAddressSearchController.search()` | `JusoAddressSearchService.search()` | `searchJusoAddresses()`, `SearchBar.vue`, `MapSidePanel.vue` |
| Juso 주소 팝업 열기 | `GET /api/address-search/juso-popup` | `JusoAddressPopupController.openPopup()` | `JusoAddressPopupPageRenderer.renderLaunchPage()` | `openJusoAddressPopup()` |
| Juso 주소 팝업 callback 처리 | `GET/POST /api/address-search/juso-popup/callback` | `JusoAddressPopupController.receiveSelectedAddress()`, `receiveSelectedAddressByGet()` | `JusoAddressPopupPageRenderer.renderCallbackPage()` | `openJusoAddressPopup()` |

현재 구현 상태:

```text
홈 위험진단 화면의 기본 주소 검색은 Juso 직접검색 backend proxy다.
SearchBar.vue와 MapSidePanel.vue는 searchJusoAddresses()로 GET /api/address-search/juso를 호출한다.
Juso 팝업 endpoint는 보조/호환 경로로 남아 있지만 현재 기본 홈 UX는 새 창 팝업이 아니라 인라인 후보 목록이다.
브라우저는 business.juso.go.kr을 직접 axios/fetch로 호출하지 않고, 승인키는 백엔드 설정과 secret에만 둔다.
```

### Search

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트 API |
|---|---|---|---|---|
| 지역명, 장소명, 유형 키워드를 분석 후보로 검색 | `GET /api/search` | `SearchController.search()` | `SearchService.search()` | `searchKeyword()` |

현재 상태:

```text
GET /api/search는 일반 검색/자동완성 확장 전까지 빈 목록을 반환하는 호환 endpoint다.
SearchBar.vue의 홈 분석/진단 기본 흐름은 이 API를 호출하지 않는다.
정확 주소 후보는 GET /api/address-search/juso 또는 POST /api/rent-risk-diagnoses/address-candidates로,
지역·유형 입력은 POST /api/regional-indicator-analyses로 보낸다.
```

나중에 들어갈 책임:

```text
검색어 정리
주소, 지역, 단지, 과거 지표 분석 후보 통합
전세 위험진단을 위한 주소 후보 선택
자동완성 후보 조회
최근 분석어 또는 주소 후보 재사용
```

현재 확인 포인트:

```text
SearchController.search(...)는 현재 매물 검색이 아니라 일반 검색/자동완성 호환 API다.
SearchService.search(...)는 null/blank keyword를 빈 keyword로 정규화하고, 현재는 빈 결과를 반환한다.
새 검색 결과를 붙일 때는 지역·유형 과거 지표 분석과 정확 주소 위험진단 분기를 먼저 해치지 않는지 확인한다.
```

### Regional Indicator Analysis

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트 API |
|---|---|---|---|---|
| 지역·유형 입력을 현재 매물 검색이 아닌 과거 지표 분석으로 해석 | `POST /api/regional-indicator-analyses` | `RegionalIndicatorAnalysisController.createAnalysis()` | `RegionalIndicatorAnalysisService.analyze()` | `createRegionalIndicatorAnalysis()`, `SearchResultView.vue` |

왜 필요한가:

`강남 원룸`, `서울대입구역 근처 오피스텔`, `관악구 오피스텔 월세` 같은 입력은 정확 주소 위험진단도 아니고 현재 매물 목록 검색도 아닙니다. 이 API는 저장된 `kab_r_one_statistical_data_points`와 `market_statistics_monthly`를 읽어 R-ONE 통계, 전월세 실거래가 월별 통계, 매매 실거래가 월별 통계, 공시가격 한계를 사용자 문장으로 바꿉니다.

주의:

```text
이 API는 외부 API를 요청 시점에 직접 호출하지 않는다.
현재 매물 feed, broker inventory, 현재 호가를 반환하지 않는다.
공시가격은 정확 주소/PNU가 필요한 지표이므로 지역 입력에서는 unavailable 상태로 둔다.
```

현재 확인 포인트:

```text
Controller는 request/response mapping만 맡고, DB 조회와 문장 조립은 RegionalIndicatorAnalysisService와 mapper/service 조합이 맡는다.
이 endpoint는 public이므로 axios에서 만료된 Authorization header를 억지로 붙여 401을 만들지 않아야 한다.
응답은 현재 매물 목록이 아니라 inputInterpretation, indicatorStatuses, insightSentences, nextActions 중심으로 읽는다.
```

### Region

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트 API |
|---|---|---|---|---|
| 지역 목록 조회 | `GET /api/regions` | `getRegionList()` | `getRegionList()` | `getRegionList()` |
| 지역 상세 조회 | `GET /api/regions/{regionId}` | `getRegionDetail()` | `getRegionDetail()` | `getRegionDetail()` |
| 지역 요약 조회 | `GET /api/regions/{regionId}/summary` | `getRegionSummary()` | `getRegionSummary()` | `getRegionSummary()` |
| 지역 가격 추이 조회 | `GET /api/regions/{regionId}/trend` | `getRegionTrend()` | `getRegionTrend()` | `getRegionTrend()` |

현재 구현 상태:

```text
getRegionList()와 getRegionDetail()은 RegionMapper를 통해 regions 테이블을 조회한다.
getRegionSummary()는 `real_estate_transaction_facts`나 `market_statistics_monthly` 연결 전까지 기본 지역 정보를 반환한다.
getRegionTrend()는 아직 차트 응답 모양이 확정되지 않아 빈 Map을 반환한다.
지역·유형 과거 지표 분석은 이 legacy Region API가 아니라 RegionalIndicatorAnalysisService가 담당한다.
```

왜 여러 함수로 나누는가:

상세 화면 하나에서도 필요한 데이터의 성격이 다릅니다. 지역 기본 정보, 요약 카드, 가격 추이 차트는 변경 주기도 다르고 조회 비용도 다릅니다. 나누어 두면 나중에 캐싱, 로딩 상태, 차트 데이터 갱신을 분리할 수 있습니다.

### Property

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트 API |
|---|---|---|---|---|
| DB 기반 검토 대상 목록 조회 | `GET /api/properties` | `getPropertyList()` | `getPropertyList()` | `getPropertyList()` |
| DB 기반 검토 대상 상세 조회 | `GET /api/properties/{propertyId}` | `getPropertyDetail()` | `getPropertyDetail()` | `getPropertyDetail()` |
| 레거시 seed 샘플 목록 조회 | `GET /api/properties/popular` | `getLegacyPropertySampleList()` | `getLegacyPropertySampleList()` | `getLegacyPropertySampleList()` |

왜 필요한가:

현재 property API 자리는 있지만, 제품 방향상 현재 매물 목록 제공을 강화하지 않습니다. 이 영역은 사용자가 이미 보고 있는 물건의 정체 판별, 관심 snapshot, 위험진단 연결 같은 보조 경계로만 읽고, `강남 원룸` 같은 입력은 현재 매물 목록이 아니라 과거 지표 분석으로 보냅니다. `/api/properties/popular`는 이름 때문에 listing feed로 오해하기 쉬우므로 deprecated 호환 endpoint로만 유지합니다.

확장 판단 기준:

```text
현재 목록/상세은 호환 경계라 PropertyResponse를 재사용한다.
위험진단 결과는 이미 RentRiskDiagnosisResponse를 사용하므로 PropertyResponse로 합치지 않는다.
새 저장 검토 화면이 목록/상세에서 서로 다른 필드를 요구하면 PropertySummaryResponse와 PropertyDetailResponse 분리를 검토한다.
```

### Map

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트 API |
|---|---|---|---|---|
| 지도 영역 안의 저장 검토 위치 조회 | `GET /api/map/properties` | `getMapPropertyList()` | `getMapPropertyList()` | `getMapPropertyList()` |
| 지도 분석 가능 지역 경계 조회 | `GET /api/map/analyzable-locations` | `getMapAnalyzableLocationList()` | `getMapAnalyzableLocationList()` | `getMapAnalyzableLocations()` |
| 정확 주소 위험진단 후보 마커 조회 | `GET /api/map/diagnosis-address-markers` | `getMapDiagnosisAddressMarkerList()` | `getMapDiagnosisAddressMarkerList()` | `getMapDiagnosisAddressMarkers()` |
| 진단 지도 단일 대상 맥락 조회 | `GET /api/map/diagnosis-context` | `getMapDiagnosisContext()` | `getMapDiagnosisContext()` | `getMapDiagnosisContext()` |
| 현장 확인 기록 조회 | `GET /api/map/field-checks` | `getMapFieldChecks()` | `MapFieldCheckService.getFieldChecks()` | `getMapFieldChecks()` |
| 현장 확인 기록 저장 | `PUT /api/map/field-checks` | `saveMapFieldChecks()` | `MapFieldCheckService.saveFieldChecks()` | `saveMapFieldChecks()` |
| 지도 생활환경 레이어 조회 | `GET /api/map/environment-layers` | `getMapEnvironmentLayerList()` | `getMapEnvironmentLayerList()` | `getMapEnvironmentLayerList()` |

제품 주의:

```text
현재 매물 목록/지도 탐색은 강화 대상이 아니다.
지도는 진단 위치 선택, 주소·좌표 확인, 관심 snapshot, 위험진단 보조로만 제한한다.
저장 검토 위치는 사용자가 켠 보조 레이어에서만 조회한다.
GET /api/map/environment-layers는 아직 EnvironmentMapper/table 없이 빈 목록을 반환하는 후순위 호환 endpoint다.
```

왜 Property API와 Map API를 나누는가:

목록 화면의 매물 조회와 지도 화면의 저장 검토 위치 조회는 조건이 다릅니다. 저장 검토 위치 레이어는 좌표 범위, 줌 레벨, 클러스터링, 레이어 표시 같은 정보가 중요합니다. 다만 MVP에서는 지도 탐색보다 주소 기반 위험진단이 먼저입니다.

현재 `/map` 구현은 기본 상태에서 전체 `property` row를 가져오지 않는다. 사용자가 `저장 위치 켜기`를 누르면 `MapPlaceholder.vue`가 Kakao Map bounds를 읽어 패딩을 더한 `swLat`, `swLng`, `neLat`, `neLng`, `zoomLevel`을 `getMapPropertyList()`에 전달하고, 백엔드는 `MapPropertySearchRequest -> MapService -> PropertyMapper.selectFavoritePropertiesByMapBounds(...) -> favorites -> property(latitude, longitude)` 순서로 현재 지도 영역의 저장 검토 위치만 조회한다. 개발 seed catalog row는 지도 관심 위치 레이어에서 제외한다. 화면 클러스터링은 저장 검토 위치 레이어가 켜졌을 때만 프론트엔드 Kakao `MarkerClusterer`가 담당한다.

지도에는 저장 위치와 별개로 두 종류의 진단 보조 layer가 있다. `MapPlaceholder.vue`는 `getMapAnalyzableLocations()`로 과거 공공데이터 근거가 조합되는 법정동/지역 경계를 투명한 polygon으로 표시하고, `getMapDiagnosisAddressMarkers()`로 홈 정확 주소 위험진단 폼에 넘길 수 있는 지번 단위 후보만 별도 marker로 표시한다. 현재 정확 주소 후보 marker의 프론트 기본 조회는 주소 단위 근거 2개 이상을 요구한다. 이 둘은 현재 매물 위치가 아니며, 가능 지역 경계나 지도 바탕 클릭 좌표를 자동으로 진단 주소로 승격하지 않는다.

`MapView.vue`는 `favoriteId`, `diagnosisHistoryId`, 또는 `address` query가 있을 때 `getMapDiagnosisContext()`를 호출해 단일 검토 대상, 생활권 범위, 데이터 확보 상태, 현장 확인 포인트를 만든다. `MapSidePanel.vue`는 로그인 사용자의 현장 확인 완료/메모 상태를 `getMapFieldChecks()`와 `saveMapFieldChecks()`로 읽고 저장한다. 이 메모는 사용자의 직접 확인 기록이지 권리관계나 물리적 하자를 ZIP:ON이 확정했다는 뜻이 아니다.

`MapPlaceSearchPanel.vue`는 Kakao `services.Places.keywordSearch(...)`로 역/장소/동네 중심점을 찾고, `강남 원룸` 같은 입력은 위치 검색어와 유형 힌트로 분리한다. 장소 검색 결과를 선택하면 `MapView.vue`가 `placeFocus`를 갱신하고 `MapPlaceholder.vue`는 지도 중심만 이동한다. `MapFilterBar.vue`는 현재 매물 분류 필터를 두지 않고 `저장 위치 켜기/끄기`만 제공한다. 사용자가 저장한 관심 위치는 파란 marker로 표시하고, 정확 주소 후보는 청록색 marker로 분리한다.

### Environment

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트 API |
|---|---|---|---|---|
| 생활환경 전체 조회 | `GET /api/environment` | `getEnvironmentList()` | `getEnvironmentList()` | `getEnvironmentList()` |
| 학교 정보 조회 | `GET /api/environment/schools` | `getSchoolList()` | `getSchoolList()` | `getSchoolList()` |
| 교통 정보 조회 | `GET /api/environment/transport` | `getTransportList()` | `getTransportList()` | `getTransportList()` |
| 편의시설 정보 조회 | `GET /api/environment/facilities` | `getFacilityList()` | `getFacilityList()` | `getFacilityList()` |

왜 필요한가:

좋은 부동산 판단은 가격만으로 끝나지 않습니다. 학군, 교통, 상권, 공원, 편의시설은 지역과 단지를 평가하는 핵심 데이터입니다.

현재 구현 상태:

```text
EnvironmentController와 frontend/src/api/environmentApi.js의 함수 경계는 준비되어 있다.
EnvironmentService는 아직 외부 API, DB table, EnvironmentMapper 없이 의도적으로 빈 목록을 반환한다.
EnvironmentView.vue는 아직 이 API 함수들을 호출하지 않는다.
지도 생활환경 레이어도 MVP 핵심 위험진단 이후에 설계할 후순위 영역이다.
```

확장 판단 기준:

```text
현재 EnvironmentService와 지도 생활환경 레이어는 의도적인 빈 응답 계약이다.
생활환경을 구현할 때는 FACILITY 단일 타입으로 뭉치지 말고 외부 source category와 화면 category를 분리할지 먼저 정한다.
지도 반경, bounds, category 조건이 들어가면 query parameter를 record request DTO로 받아 Controller boundary에서 검증한다.
```

### Favorite

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트 API |
|---|---|---|---|---|
| 관심 목록 조회 | `GET /api/favorites` | `getFavoriteList()` | `getFavoriteList()` | `getFavoriteList()` |
| 관심 부동산 분석 리포트 조회 | `GET /api/favorites/{favoriteId}/analysis` | `getFavoriteAnalysis()` | `getFavoriteAnalysis()` | `getFavoriteAnalysis()` |
| 관심 항목 저장 | `POST /api/favorites` | `createFavorite()` | `createFavorite()` | `createFavorite()` |
| 관심 항목 삭제 | `DELETE /api/favorites/{favoriteId}` | `deleteFavorite()` | `deleteFavorite()` | `deleteFavorite()` |

왜 필요한가:

관심 기능은 개인화의 시작입니다. 관심 부동산 분석 리포트는 단순 저장 row가 아니라 사용자가 다시 볼 계약 전 판단 보조 화면입니다. `GET /api/favorites/{favoriteId}/analysis`는 저장 조건, 건축물 정보 후보, 주변 시세, 실거래 기준 `priceTrend`, AI 구조화 분석 보조 카드를 함께 내려 화면이 raw table/key를 직접 보여주지 않게 합니다. 나중에 알림, 비교 분석, 마이페이지와 연결될 수 있으므로 초기에 독립 도메인으로 둡니다.

### Community

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트 API |
|---|---|---|---|---|
| 게시판 목록 조회 | `GET /api/community/boards` | `getBoardList()` | `getBoardList()` | `getCommunityBoardList()` |
| 게시글 목록 조회 | `GET /api/community/posts` | `getPostList()` | `getPostList()` | `getCommunityPostList()` |
| 게시글 상세 조회 | `GET /api/community/posts/{postId}` | `getPostDetail()` | `getPostDetail()` | `getCommunityPostDetail()` |
| 게시글 작성 | `POST /api/community/posts` | `createPost()` | `createPost()` | `createCommunityPost()`, `CommunityListView.vue` |
| 위험진단 결과 기반 질문 초안 작성 | `POST /api/community/posts` | `createPost()` | `createPost()` | `LeaseRiskDiagnosisResult.vue`, `saveCommunityDraft()`, `CommunityListView.vue`, `createCommunityPost()` |
| 게시글 수정 | `PUT /api/community/posts/{postId}` | `updatePost()` | `updatePost()` | `updateCommunityPost()` |
| 게시글 삭제 | `DELETE /api/community/posts/{postId}` | `deletePost()` | `deletePost()` | `deleteCommunityPost()` |
| 게시글 좋아요 | `POST /api/community/posts/{postId}/like` | `likePost()` | `likePost()` | `likeCommunityPost()`, `CommunityPostDetailView.vue` |
| 게시글 좋아요 취소 | `DELETE /api/community/posts/{postId}/like` | `unlikePost()` | `unlikePost()` | `unlikeCommunityPost()`, `CommunityPostDetailView.vue` |
| 게시글 신고 | `POST /api/community/posts/{postId}/reports` | `reportPost()` | `reportPost()` | `reportCommunityPost()`, `CommunityPostDetailView.vue` |
| 게시글 첨부 업로드 | `POST /api/community/posts/{postId}/attachments` | `uploadPostAttachment()` | `uploadPostAttachment()` | `uploadCommunityPostAttachment()`, `CommunityPostDetailView.vue` 작성자 전용 upload form |
| 첨부 다운로드 | `GET /api/community/attachments/{attachmentId}/download` | `downloadAttachment()` | `downloadAttachment()` | `CommunityPostDetailView.vue` 첨부 목록의 `downloadUrl` 링크 |
| 댓글 목록 조회 | `GET /api/community/posts/{postId}/comments` | `getCommentList()` | `getCommentList()` | `getCommunityCommentList()` |
| 댓글 작성 | `POST /api/community/posts/{postId}/comments` | `createComment()` | `createComment()` | `createCommunityComment()` |
| 대댓글 작성 | `POST /api/community/posts/{postId}/comments/{commentId}/replies` | `createReply()` | `createReply()` | `createCommunityReply()` |
| 댓글 수정 | `PUT /api/community/comments/{commentId}` | `updateComment()` | `updateComment()` | `updateCommunityComment()` |
| 댓글 삭제 | `DELETE /api/community/comments/{commentId}` | `deleteComment()` | `deleteComment()` | `deleteCommunityComment()` |
| 댓글 좋아요 | `POST /api/community/comments/{commentId}/like` | `likeComment()` | `likeComment()` | `likeCommunityComment()`, `CommunityPostDetailView.vue` |
| 댓글 좋아요 취소 | `DELETE /api/community/comments/{commentId}/like` | `unlikeComment()` | `unlikeComment()` | `unlikeCommunityComment()`, `CommunityPostDetailView.vue` |
| 댓글 신고 | `POST /api/community/comments/{commentId}/reports` | `reportComment()` | `reportComment()` | `reportCommunityComment()`, `CommunityPostDetailView.vue` |
| 커뮤니티 실시간 이벤트 | `GET /api/community/events` | `subscribeCommunityEvents()` | `CommunityEventPublisher.subscribe()` | `subscribeCommunityEvents()` |
| 관리자 신고 목록 | `GET /api/admin/community/reports` | `getReports()` | `getReports()` | `getAdminCommunityReports()`, `AdminDashboardView.vue` |
| 관리자 신고 검토 | `PUT /api/admin/community/reports/{reportId}/review` | `reviewReport()` | `reviewReport()` | `reviewAdminCommunityReport()`, `AdminDashboardView.vue` |
| 관리자 게시글 숨김 | `PUT /api/admin/community/posts/{postId}/hide` | `hidePost()` | `hidePost()` | `hideAdminCommunityPost()`, `AdminDashboardView.vue` |
| 관리자 게시글 복구 | `PUT /api/admin/community/posts/{postId}/restore` | `restorePost()` | `restorePost()` | `restoreAdminCommunityPost()`, `AdminDashboardView.vue` |
| 관리자 댓글 숨김 | `PUT /api/admin/community/comments/{commentId}/hide` | `hideComment()` | `hideComment()` | `hideAdminCommunityComment()`, `AdminDashboardView.vue` |
| 관리자 댓글 복구 | `PUT /api/admin/community/comments/{commentId}/restore` | `restoreComment()` | `restoreComment()` | `restoreAdminCommunityComment()`, `AdminDashboardView.vue` |
| 관리자 정책 이벤트 조회 | `GET /api/admin/community/policy-events` | `getPolicyEvents()` | `CommunityPolicyOperationsService.getPolicyEvents()` | 아직 `adminApi.js` 함수 없음 |
| 관리자 정책 제재 이력 조회 | `GET /api/admin/community/policy-sanctions` | `getPolicySanctions()` | `CommunityPolicyOperationsService.getPolicySanctions()` | 아직 `adminApi.js` 함수 없음 |
| 관리자 정책 제재 수동 해제 | `PUT /api/admin/community/policy-sanctions/{sanctionId}/release` | `releasePolicySanction()` | `CommunityPolicyOperationsService.releaseSanction()` | 아직 `adminApi.js` 함수 없음 |
| 관리자 정책 제재 기간 연장 | `PUT /api/admin/community/policy-sanctions/{sanctionId}/extend` | `extendPolicySanction()` | `CommunityPolicyOperationsService.extendSanction()` | 아직 `adminApi.js` 함수 없음 |
| 만료 정책 제재 수동 복구 | `POST /api/admin/community/policy-sanctions/restore-expired` | `restoreExpiredPolicySanctions()` | `CommunityPolicyOperationsService.restoreExpiredSanctionsManually()` | 아직 `adminApi.js` 함수 없음 |
| 신고 통계 조회 | `GET /api/admin/community/report-statistics` | `getReportStatistics()` | `CommunityPolicyOperationsService.getReportStatistics()` | 아직 `adminApi.js` 함수 없음 |
| 반복 반려 신고자 조회 | `GET /api/admin/community/false-reporters` | `getRepeatedFalseReporters()` | `CommunityPolicyOperationsService.getRepeatedFalseReporters()` | 아직 `adminApi.js` 함수 없음 |
| 관리자 운영 알림 조회 | `GET /api/admin/community/notifications` | `getAdminNotifications()` | `CommunityPolicyOperationsService.getAdminNotifications()` | 아직 `adminApi.js` 함수 없음 |

왜 필요한가:

부동산 데이터는 숫자로만 판단하기 어렵습니다. 지역 후기, 실제 거주 경험, 생활 팁 같은 정성 데이터가 함께 있어야 플랫폼 가치가 커집니다.

자세한 DB ERD, 권한 흐름, 댓글 트리, SSE 설계는 [커뮤니티 게시판 백엔드 학습 문서](/docs/community/README.md)를 기준으로 읽습니다.

위험진단 결과에서 커뮤니티로 이어지는 프론트 흐름은 새 API가 아니라 기존 게시글 작성 API를 재사용한다. `LeaseRiskDiagnosisResult.vue`가 `communityDraft.js`를 통해 `sessionStorage`에 1회성 초안을 저장하고 `/community?compose=diagnosis`로 이동하면, `CommunityListView.vue`가 초안을 소비해 글쓰기 modal을 연다. 인증이 필요하면 기존 `AuthModal.vue` 흐름을 거친 뒤 같은 초안을 유지한다.

확장 판단 기준:

```text
게시판 code와 정책은 현재 DB table과 CommunityService/AdminService 경계로 구현되어 있다.
신고, 숨김, 검수는 사용자 커뮤니티 행위와 운영자 관리 행위가 만나는 지점이므로 Community 도메인 데이터와 Admin 운영 surface를 함께 읽는다.
새 운영 기능은 CommunityAdminController, AdminDashboardView, 감사 로그 요구사항을 함께 확인한 뒤 추가한다.
```

### User

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트 화면 |
|---|---|---|---|---|
| 내 정보 조회 | `GET /api/users/me` | `getMyPage()` | `getMyPage()` | `MyPageView.vue` |
| 내 프로필 수정 | `PUT /api/users/me/profile` | `updateMyProfile()` | `UserService.updateMyProfile()` | `updateMyProfile()`, `MyPageView.vue` |
| 내 프로필 이미지 업로드 | `POST /api/users/me/profile-image` | `uploadMyProfileImage()` | `UserService.uploadMyProfileImage()` | `uploadMyProfileImage()`, `MyPageView.vue` |
| 프로필 이미지 조회 | `GET /api/users/profile-images/{userId}/{storedFileName}` | `downloadProfileImage()` | `UserService.downloadProfileImage()` | `profileImageUrl` 표시 경로, `AppHeader.vue` avatar 등 |

왜 필요한가:

사용자 도메인은 관심 지역, 작성 글, 알림, 추천 결과, 진단 이력이 사용자와 연결되기 때문에 필요합니다. 공개 작성자 표시는 장기 기준인 `user_profiles`를 사용하되, 기존 커뮤니티 SQL 호환을 위해 `users.nickname/profile_image_url`도 `UserProfileService`가 동기화합니다.

### Admin User Management

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트 API/화면 |
|---|---|---|---|---|
| 회원 목록 조회 | `GET /api/admin/users` | `AdminUserController.getUsers()` | `AdminUserService.getUsers()` | `getAdminUsers()`, `AdminDashboardView.vue` |
| 관리자 회원 추가 | `POST /api/admin/users` | `createUser()` | `createUser()` | `createAdminUser()` |
| 사용자 역할 변경 | `PUT /api/admin/users/{userId}/role` | `updateRole()` | `updateRole()` | `updateAdminUserRole()` |
| 글/댓글/page 권한 변경 | `PUT /api/admin/users/{userId}/permissions` | `updatePermissions()` | `updatePermissions()` | `updateAdminUserPermissions()` |
| 회원 탈퇴 처리 | `DELETE /api/admin/users/{userId}` | `withdrawUser()` | `withdrawUser()` | `withdrawAdminUser()` |
| 탈퇴 회원 복구 | `PUT /api/admin/users/{userId}/enable` | `enableUser()` | `enableUser()` | `enableAdminUser()` |

왜 필요한가:

```text
커뮤니티가 실제 사용자 작성 기능을 갖게 되면 운영자는 사용자별 작성/수정/삭제 가능 여부를 조정할 수 있어야 한다.
관리자 page는 제품 MVP의 첫 화면이 아니라 별도 운영 도구이므로 /admin route로 분리한다.
```

### Admin Audit Logs

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트 API/화면 |
|---|---|---|---|---|
| 관리자 운영 변경 감사 로그 조회 | `GET /api/admin/audit-logs` | `AdminActionAuditLogController.getLogs()` | `AdminActionAuditLogService.getLogs()` | 추후 관리자 감사 화면 |

감사 로그는 운영자가 사용자 role/permission, 회원 상태, 커뮤니티 신고/숨김/복구 같은 중요한 변경을 시도했을 때 남는 증거다. `@AdminAudit`이 붙은 서비스 메서드를 `AdminAuditAspect`가 감싸고, `admin_action_audit_logs`에는 성공/실패 상태, 대상, actor, requestId, 실패 코드, 민감정보가 제거된 요청 요약, HMAC 기반 무결성 서명이 저장된다.

조회 조건:

```text
actionType    USER_CREATE, USER_ROLE_UPDATE, USER_PERMISSION_UPDATE, COMMUNITY_POST_HIDE ...
targetType    USER, COMMUNITY_REPORT, COMMUNITY_POST, COMMUNITY_COMMENT
resultStatus  SUCCESS, FAILURE
keyword       actor username, action type, target id, failure code, sanitized request summary 검색
page/size     PageResponse<AdminActionAuditLogResponse>
```

권한:

```text
ROLE_ADMIN, ROLE_DEVELOPER_ADMIN, ROLE_SYSTEM_ADMIN
-> 모든 관리자 운영 범위

ROLE_AUDIT_MANAGER
-> GET /api/admin/audit-logs 조회 가능
-> /api/admin/users 같은 사용자 변경 API는 403
```

주의할 점:

```text
감사 로그 조회 응답은 integritySignature 원문을 노출하지 않고 integritySignatureValid만 노출한다.
password, confirmationPassword, Authorization, refresh token 원문은 저장하지 않는다.
client IP는 원문 대신 HMAC hash로 저장한다.
기존 V29 수동 감사 행은 V31에서 legacy-unverified signature로 이관되어 조회는 가능하지만 무결성 검증은 false일 수 있다.
```

### Admin External API Logs

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트 API/화면 |
|---|---|---|---|---|
| 외부 API 호출 로그 조회 | `GET /api/admin/external-api-call-logs` | `AdminExternalApiCallLogController.getLogs()` | `ExternalApiCallLogService.getLogs()` | `getAdminExternalApiCallLogs()`, `AdminDashboardView.vue` |
| 외부 데이터 수집 상태 조회 | `GET /api/admin/external-data-status` | `AdminExternalDataStatusController.getStatus()` | `AdminExternalDataStatusService.getStatus()` | `getAdminExternalDataStatus()`, `AdminDashboardView.vue` |
| volatile state 운영 알림 조회 | `GET /api/admin/volatile-state-alerts` | `AdminVolatileStateAlertController.getAdminVolatileStateAlerts()` | `VolatileStateAlertService.getAdminAlerts()` | `getAdminVolatileStateAlerts()`, `sessionAlertNotifications.js` |

### Notifications

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트 API/화면 |
|---|---|---|---|---|
| 내 DB 알림 조회 | `GET /api/notifications` | `NotificationController.getMyNotifications()` | `NotificationService.getUserNotifications()` | `getMyNotifications()`, `sessionAlertNotifications.js`, `GlobalToast.vue` |

외부 API 로그는 data.go.kr 건축물대장, 전월세 실거래가, 매매 실거래가와 VWorld 공시가격 adapter가 `ExternalApiCallLogger.recordExternalApiCall(...)`로 남긴다. 로그에는 provider, API 이름, endpoint path, service key 없는 요청 요약, 결과 상태, HTTP status, duration, error message만 저장한다. 원본 응답 body와 API key는 저장하지 않는다.

권한 적용 위치:

```text
UserRole + AuthorityCode mapping
-> /api/admin/users/**, /api/admin/community/**, /api/admin/rent-risk-diagnoses/**, /api/admin/audit-logs/**, /api/admin/external-api-* 경로별 진입 권한
-> `UserRole`은 계정 역할이고, `AuthorityCode`는 실제 업무 능력이다.

user_permissions
-> CommunityService의 게시글/댓글 작성, 수정, 삭제 가능 여부

user_page_permissions
-> Vue router의 pageKey 기반 화면 접근 제어
```

### Admin External API Health

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트 API/화면 |
|---|---|---|---|---|
| 외부 API 세부 헬스체크 | `GET /api/admin/external-api-health` | `AdminExternalApiHealthController.checkExternalApis()` | `ExternalApiHealthCheckService.checkExternalApis()` | 운영 명령 또는 추후 관리자 화면 |

외부 API 헬스체크는 sample query로 data.go.kr 건축물대장, data.go.kr 연립/다세대 전월세 실거래가, data.go.kr 연립/다세대 매매 실거래가, VWorld 공동주택 공시가격 호출 가능성을 나눠 확인한다. `DATA_GO_KR_SERVICE_KEY` 또는 `VWORLD_API_KEY`가 없으면 `configured=false`, `httpCallAttempted=false`로 끝나고, key가 있으면 기존 외부 API adapter를 그대로 호출한다. `resultStatus=EMPTY`는 sample query 결과가 없다는 뜻이지 장애가 아니며, `ERROR`는 HTTP 오류, timeout, parsing 오류를 의심해야 한다.

### Rent Risk Diagnosis

#### Current implemented risk diagnosis map

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트엔드 API/컴포넌트 |
|---|---|---|---|---|
| 홈 화면 분석/진단 입력 폼에서 정확 주소 위험진단 요청 | `POST /api/rent-risk-diagnoses` | `RentRiskDiagnosisController.createDiagnosis()` | `RentRiskDiagnosisService.diagnose()` | `createRentRiskDiagnosis()`, `MainHero.vue`, `SearchBar.vue`, `LeaseRiskDiagnosisResult.vue` |
| 정확 주소는 있지만 계약 금액을 모를 때 과거 전월세 후보 선택 | `POST /api/rent-risk-diagnoses/address-candidates` | `RentRiskDiagnosisController.searchAddressCandidates()` | `RentRiskDiagnosisCandidateService.searchCandidates()` | `searchRentRiskDiagnosisCandidates()`, `SearchBar.vue` 후보 카드/정렬/페이지네이션 |
| 내 진단 이력 조회 | `GET /api/rent-risk-diagnoses` | `RentRiskDiagnosisController.getMyHistories()` | `RentRiskDiagnosisHistoryService.getMyHistories()` | `getMyRentRiskDiagnoses()`, `MyPageView.vue`, `saveCommunityDraft()` |
| 내 진단 이력 상세 조회 | `GET /api/rent-risk-diagnoses/{diagnosisId}` | `RentRiskDiagnosisController.getMyDiagnosis()` | `RentRiskDiagnosisHistoryService.getMyDiagnosis()` | `getMyRentRiskDiagnosis()`, `MyPageView.vue`, `LeaseRiskDiagnosisResult.vue` |
| 내 위험진단 등기부등본 확인 상태 조회 | `GET /api/rent-risk-diagnoses/{diagnosisId}/registry-document-confirmation` | `RentRiskDiagnosisController.getRegistryDocumentConfirmation()` | `RegistryDocumentConfirmationService.getConfirmation()` | `getRegistryDocumentConfirmation()`, `LeaseRiskDiagnosisResult.vue` |
| 내 위험진단 등기부등본 확인 상태 저장 | `PUT /api/rent-risk-diagnoses/{diagnosisId}/registry-document-confirmation` | `RentRiskDiagnosisController.saveRegistryDocumentConfirmation()` | `RegistryDocumentConfirmationService.saveConfirmation()` | `saveRegistryDocumentConfirmation()`, `LeaseRiskDiagnosisResult.vue` |
| 관리자 진단 이력 목록 조회 | `GET /api/admin/rent-risk-diagnoses` | `AdminRentRiskDiagnosisHistoryController.getHistories()` | `RentRiskDiagnosisHistoryService.getHistories()` | `getAdminRentRiskDiagnoses()`, `AdminDashboardView.vue` |
| 관리자 진단 이력 상세 조회 | `GET /api/admin/rent-risk-diagnoses/{diagnosisId}` | `AdminRentRiskDiagnosisHistoryController.getHistory()` | `RentRiskDiagnosisHistoryService.getHistory()` | `getAdminRentRiskDiagnosis()`, `AdminDashboardView.vue` |

`GET /api/rent-risk-diagnoses`와 `GET /api/rent-risk-diagnoses/{diagnosisId}`는 관리자용 전체 조회가 아니라 로그인한 사용자의 `requester_user_id`로 제한된 마이페이지용 조회다. 일반 사용자가 다른 사용자의 진단 이력을 볼 수 없도록 `SecurityConfig`에서 인증을 요구하고, 목록은 `RentRiskDiagnosisHistoryMapper.findSummariesByRequester(...)`, 상세는 `RentRiskDiagnosisHistoryMapper.findByIdAndRequester(...)`가 사용자 ID 조건을 가진다.

`MyPageView.vue`의 이력 행은 "상세" 버튼으로 저장된 `RentRiskDiagnosisResponse`를 다시 열고, "질문" 버튼으로 원본 snapshot 없이 요약값만 사용해 커뮤니티 질문 초안을 만들 수 있다. 이 초안은 `communityDraft.js`를 거쳐 `/community?compose=diagnosis`로 전달되며, 실제 게시글 저장은 사용자가 확인 후 `POST /api/community/posts`를 제출할 때만 일어난다.


아래 API는 현재 구현된 정확 주소 기반 전세·월세 위험진단 slice다. `SearchBar.vue`가 홈 화면 분석/진단 입력 폼에서 주소, 계약 목적, 보증금, 월세, 관리비, 사용자가 보는 매물 유형, 선택 입력인 전용면적·층수, 매물 설명을 수집한 뒤 호출한다. 정확 주소는 확정됐지만 전세 보증금 또는 월세 금액을 모르면 `POST /api/rent-risk-diagnoses/address-candidates`가 해당 지번의 과거 전월세 실거래 후보를 카드로 내려주고, 사용자가 후보를 선택하면 그 금액과 면적·층수로 기존 위험진단을 이어간다. 이 후보는 현재 매물 목록이 아니라 과거 실거래가 기반 입력 보조 자료다. 홈 화면의 `MainHero.vue` CTA는 `#diagnosis-form` 위치로 스크롤한다. 건축물대장 표제부 조회와 내부 물건 유형 판별은 `LeaseRiskBuildingRegisterLookupService`가 담당하고, 건축물대장 미확정 시 분석 기준 후보 선택은 `LeaseRiskTransactionEvidenceService`가 담당한다. 유형별 전월세 실거래가 adapter, 유형별 매매 실거래가 adapter, VWorld 공시가격 adapter는 `LeaseRiskExternalDataLookupService`가 호출한다. service key가 없거나 결과가 없으면 `LeaseRiskDiagnosisDataStatusService`가 `unavailable`, `empty`, `ambiguous`, `error` 제한 진단 상태를 명확히 분리한다. `TransactionSimilarityFilter`는 사용자가 `exclusiveAreaSquareMeter` 또는 `floorNumber`를 입력했을 때 최근 3개월 전월세·매매 snapshot 중 유사 면적·층 거래를 우선 비교 표본으로 고르고, 유사 거래가 없으면 전체 거래 중앙값으로 fallback한다. `DepositRiskCalculator`는 이 비교 표본의 전월세 보증금 대표값 대비 입력 보증금 비율, 월세 계약의 전월세 월세 대표값 대비 입력 월세 비율, 매매 실거래가 대표값 대비 입력 보증금 비율, 공시가격 대표값 대비 입력 보증금 비율을 계산한다. 입력 금액이 극단적으로 낮거나 높아도 확보한 거래 중 가장 가까운 금액을 함께 설명해 단위 입력과 계약 조건을 재확인하게 한다. `LeaseRiskDiagnosisRiskSummaryService`는 그 계산 결과와 건축물대장/실거래가/공시가격 상태, 월 고정 주거비, 직접 확인 한계를 `riskSummary.reasons` 문장으로 조립한다. MVP 전체 방향은 정확 주소 위험진단과 지역·유형 과거 지표 분석을 함께 갖는 것이며, 현재 매물 목록 API를 강화하는 것이 아니다. R-ONE 과거 지표 분석은 `POST /api/regional-indicator-analyses` 첫 slice로 연결되었고, 아직 보증금-월세 환산, 관리비 원본 데이터 자동 검증, 분위 비교, 공시가격의 동·호 정밀 매칭은 연결되지 않았습니다.

| 사용자 목적 | 백엔드 API | Controller | Service | 프론트 API/컴포넌트 |
|---|---|---|---|---|
| 진단 목적 카탈로그 조회 | `GET /api/diagnosis-purposes` | `DiagnosisPurposeCatalogController.getPurposes()` | `DiagnosisPurposeCatalogService.getCatalog()` | `getDiagnosisPurposes()`, `SearchBar.vue` |
| 지역·유형 과거 지표 분석 요청 | `POST /api/regional-indicator-analyses` | `RegionalIndicatorAnalysisController.createAnalysis()` | `RegionalIndicatorAnalysisService.analyze()` | `createRegionalIndicatorAnalysis()`, `SearchResultView.vue` |
| 홈 화면 분석/진단 입력 폼에서 정확 주소 위험진단 요청 | `POST /api/rent-risk-diagnoses` | `RentRiskDiagnosisController.createDiagnosis()` | `RentRiskDiagnosisService.diagnose()` | `createRentRiskDiagnosis()`, `MainHero.vue`, `SearchBar.vue`, `LeaseRiskDiagnosisResult.vue` |
| 정확 주소 과거 전월세 후보 조회 | `POST /api/rent-risk-diagnoses/address-candidates` | `RentRiskDiagnosisController.searchAddressCandidates()` | `RentRiskDiagnosisCandidateService.searchCandidates()` | `searchRentRiskDiagnosisCandidates()`, `SearchBar.vue` |
| 내 진단 이력 상세 조회 | `GET /api/rent-risk-diagnoses/{diagnosisId}` | `RentRiskDiagnosisController.getMyDiagnosis()` | `RentRiskDiagnosisHistoryService.getMyDiagnosis()` | `getMyRentRiskDiagnosis()`, `MyPageView.vue`, `LeaseRiskDiagnosisResult.vue` |
| 내 위험진단 등기부등본 확인 상태 조회 | `GET /api/rent-risk-diagnoses/{diagnosisId}/registry-document-confirmation` | `RentRiskDiagnosisController.getRegistryDocumentConfirmation()` | `RegistryDocumentConfirmationService.getConfirmation()` | `getRegistryDocumentConfirmation()`, `LeaseRiskDiagnosisResult.vue` |
| 내 위험진단 등기부등본 확인 상태 저장 | `PUT /api/rent-risk-diagnoses/{diagnosisId}/registry-document-confirmation` | `RentRiskDiagnosisController.saveRegistryDocumentConfirmation()` | `RegistryDocumentConfirmationService.saveConfirmation()` | `saveRegistryDocumentConfirmation()`, `LeaseRiskDiagnosisResult.vue` |
| 관리자 진단 이력 목록 조회 | `GET /api/admin/rent-risk-diagnoses` | `AdminRentRiskDiagnosisHistoryController.getHistories()` | `RentRiskDiagnosisHistoryService.getHistories()` | `getAdminRentRiskDiagnoses()`, `AdminDashboardView.vue` |
| 관리자 진단 이력 상세 조회 | `GET /api/admin/rent-risk-diagnoses/{diagnosisId}` | `AdminRentRiskDiagnosisHistoryController.getHistory()` | `RentRiskDiagnosisHistoryService.getHistory()` | `getAdminRentRiskDiagnosis()`, `AdminDashboardView.vue` |
| 내 진단 이력 조회 | `GET /api/rent-risk-diagnoses` | `RentRiskDiagnosisController.getMyHistories()` | `RentRiskDiagnosisHistoryService.getMyHistories()` | `getMyRentRiskDiagnoses()`, `MyPageView.vue`, `saveCommunityDraft()` |

왜 필요한가:

ZIP:ON의 MVP는 현재 매물을 보여주지 않고, 지역·유형 입력은 과거 지표 분석으로, 정확 주소 입력은 물건 정체, 보증금 위험, 추가 확인사항, 계약 전 체크리스트로 연결하는 것입니다.

요청 body:

```json
{
  "address": "서울시 관악구 신림동 1422-5",
  "contractPurpose": "JEONSE",
  "depositAmountManwon": 12000,
  "monthlyRentAmountManwon": 0,
  "maintenanceFeeAmountManwon": 8,
  "exclusiveAreaSquareMeter": 29.35,
  "floorNumber": 3,
  "knownPropertyType": "원룸",
  "listingDescription": "3층 원룸, 보증보험 가능하다고 안내받음"
}
```

응답 body의 핵심 구조:

```text
RentRiskDiagnosisResponse
-> diagnosisId: 저장된 진단 이력 id
-> diagnosisState: success | empty
-> inputSummary: 사용자가 입력한 주소, 계약 목적, 금액, 매물 유형, 매물 설명
-> address: 정제 주소, 법정동코드, 시군구코드, 본번/부번, 조회 가능 여부
-> propertyIdentity: 사용자 표현, 공부상 확인 방향, 후보 유형, 주의 문장
-> dataStatuses: 주소/건축물대장/실거래가/공시가격/등기부등본 상태
-> riskSummary: 추가 확인 필요 또는 데이터 부족 중심의 사전 진단 문장
-> checklist: 계약 전 체크리스트
-> nextActions: 사용자가 다음에 해야 할 행동
```

현재 구현 범위:

```text
구현됨:
- `LeaseRiskDiagnosisRequestValidator`가 전세·월세 목적별 보증금/월세 필수 입력 규칙을 검증
- `LeaseRiskDiagnosisInputSummaryService`가 사용자 입력을 `inputSummary` 응답으로 조립
- `LeaseRiskDiagnosisAddressSectionService`가 주소 정제 성공/실패 결과를 `address` 응답으로 조립
- 지번 주소 정제와 법정동코드 조회
- `LeaseRiskPropertyTypeInterpreter`로 사용자의 매물 유형 표현과 매물 설명을 후보 공부상 유형과 분석 방향으로 해석
- `LeaseRiskDiagnosisPropertyIdentityService`가 사용자 표현, 건축물대장 판별 상태, 후보 공부상 유형, 주의 문장을 `propertyIdentity` 응답으로 조립
- 건축물대장 표제부 조회 결과 기반 물건 유형 판별
- 건축물대장 유형이 확정된 경우에만 유형별 실거래가 API 후보 선택
- 건축물대장 유형이 확정된 경우 `LeaseRiskExternalDataLookupService`가 선택된 전월세 실거래가 API를 최근 완료월부터 최대 3개월까지 조회하고, 거래가 있는 달의 snapshot을 모아 `rent-transaction` 상태로 표시
- 건축물대장 유형이 확정된 경우 `LeaseRiskExternalDataLookupService`가 선택된 매매 실거래가 API를 최근 완료월부터 최대 3개월까지 조회하고, 거래가 있는 달의 snapshot을 모아 `sale-transaction` 상태로 표시
- `LeaseRiskDiagnosisDataStatusService`가 주소, 건축물대장, 전월세 실거래가, 매매 실거래가, 공시가격, 등기부등본 확인 한계를 `dataStatuses` 응답으로 조립
- 사용자가 전용면적 또는 층수를 입력하면 `TransactionSimilarityFilter`로 전월세·매매 snapshot 중 유사 면적·층 거래를 우선 비교하고, 유사 거래가 없으면 전체 거래 기준으로 제한 진단
- 전월세 실거래가가 있으면 `DepositRiskCalculator`로 입력 보증금의 주변 보증금 대표값 대비 비율을 계산
- 월세 계약이고 전월세 실거래가 월세가 있으면 `DepositRiskCalculator`로 입력 월세의 주변 월세 대표값 대비 비율을 계산
- 월세 계약이면 입력 월세와 관리비를 합산한 월 고정 주거비 확인 문장을 `riskSummary.reasons`에 표시
- 매매 실거래가가 있으면 `DepositRiskCalculator`로 입력 보증금의 매매가 대비 비율을 계산
- 공시가격 후보가 있으면 `DepositRiskCalculator`로 입력 보증금의 공시가격 대비 비율을 계산
- `LeaseRiskDiagnosisRiskSummaryService`가 주소 정제 여부, 건축물대장 확정 여부, 건축물 위험 문장, 실거래가/공시가격 상태, `DepositRiskCalculator` 결과를 `riskSummary` 응답으로 조립
- 건축물대장 주용도와 사용승인일이 있으면 `BuildingRiskAnalyzer`로 주거 목적 불일치 가능성과 노후도 확인 문장을 `riskSummary`, `checklist`, `nextActions`에 표시
- `LeaseRiskDiagnosisChecklistService`가 주소, 건축물대장, 등기부등본, 선순위 임차인, 보증보험, 관리비, 계약금 계좌, 현장 확인 항목을 계약 전 체크리스트로 표시
- 사용자 입력 유형만으로 실거래가 API를 고르지 않는 제한 진단 상태 표시
- 계약 전 체크리스트 생성
- 관리비 총액, 포함 항목, 별도 부과 항목 확인 체크리스트 생성
- 진단 요청과 최종 응답 snapshot을 `rent_risk_diagnosis_histories`에 저장하고 `diagnosisId`를 응답에 포함
- 로그인 사용자는 본인 진단 이력에 대해 `/api/rent-risk-diagnoses/{diagnosisId}/registry-document-confirmation`으로 등기부등본 수동 확인 상태를 저장/조회
- 관리자 전용 `/api/admin/rent-risk-diagnoses`와 `/api/admin/rent-risk-diagnoses/{diagnosisId}`로 진단 이력 조회
- `LeaseRiskDiagnosisRequestValidatorTest`로 전세 보증금 필수, 월세 보증금 0 허용, 월세 금액 필수 규칙 확인
- `LeaseRiskDiagnosisInputSummaryServiceTest`로 사용자 입력 trim과 빈 매물 설명 null 변환 확인
- `LeaseRiskDiagnosisAddressSectionServiceTest`로 주소 정제 성공/실패 응답 필드 확인
- `RentRiskDiagnosisIntegrationTest`로 정상/주소 실패/월세 검증/사용자 입력만 있는 제한 진단 확인
- `RentRiskDiagnosisIntegrationTest`로 월세 계약의 월세+관리비 월 고정 주거비 문장과 관리비 체크리스트 확인
- `LeaseRiskDiagnosisPropertyIdentityServiceTest`로 사용자 표현과 공부상 유형 불일치, 원룸 후보군 유지, 근린생활시설 주의 문장 확인
- `LeaseRiskDiagnosisDataStatusServiceTest`로 주소/건축물대장 상태, 전월세·매매·공시가격 성공 상세, 등기부등본 직접 확인 상태 확인
- `LeaseRiskDiagnosisRiskSummaryServiceTest`로 주소 실패, 월 고정 주거비, 단독·다가구 확인 문장, 전월세 거래 비교 문장 확인
- `RentRiskDiagnosisHistoryIntegrationTest`로 익명/로그인 사용자 진단 이력 저장, 관리자 조회, 일반 사용자 차단 확인
- `RentRiskDiagnosisHistoryIntegrationTest.authenticatedUserCanListOnlyOwnRiskDiagnosisHistories()`로 마이페이지용 `/api/rent-risk-diagnoses`가 본인 이력만 반환하고 비로그인 요청은 401이 되는지 확인
- `RentRiskDiagnosisHistoryIntegrationTest.authenticatedUserCanReadOnlyOwnRiskDiagnosisHistoryDetail()`로 `/api/rent-risk-diagnoses/{diagnosisId}`가 본인 이력의 `RentRiskDiagnosisResponse`만 반환하고 타인 이력은 404, 비로그인 요청은 401이 되는지 확인
- `RentRiskDiagnosisHistoryIntegrationTest.authenticatedUserCanSaveAndReadRegistryDocumentConfirmationForOwnDiagnosis()`로 본인 진단 이력의 등기부등본 확인 상태 저장/조회 확인
- `RentRiskDiagnosisHistoryIntegrationTest.registryDocumentConfirmationRequiresAuthenticatedOwner()`로 타인 진단 이력은 404, 비로그인 요청은 401이 되는지 확인
- `RentRiskDiagnosisHistoryIntegrationTest.registryDocumentConfirmationRejectsMissingStatus()`로 필수 확인 상태 validation 400 확인
- `RentRiskDiagnosisBuildingRegisterIntegrationTest`로 fake 건축물대장 결과 기반 거래 API 후보 선택 확인
- `RentRiskDiagnosisBuildingRiskIntegrationTest`로 fake 건축물대장 주용도/사용승인일 기반 주거 목적 불일치와 노후도 안내 확인
- `LeaseRiskExternalDataLookupServiceTest`로 최근 조회 범위와 API fallback이 비어도 `RealEstateTransactionFactStore.findLatestActiveFacts(...)`의 DB 보유 최신 과거 fact를 진단 근거로 사용하는지 확인
- `LeaseRiskDiagnosisEvidenceReportServiceTest`로 건축물대장, 전월세, 매매, 공시가격 lookup result가 현재 매물 목록이 아닌 DB·공공데이터 근거 리포트로 변환되는지 확인
- `RentRiskDiagnosisRentTransactionIntegrationTest`로 조회·보유 자료 범위의 전월세 snapshot 비교 문장과 `evidenceReport`의 전월세 근거 리포트가 기존 프론트 응답 구조에 포함되는지 확인
- `RentRiskDiagnosisSaleTransactionIntegrationTest`로 조회·보유 자료 범위의 매매 snapshot을 모아 보증금 비율 문장이 기존 프론트 응답 구조에 포함되는지 확인
- `TransactionSimilarityFilterTest`로 입력 전용면적·층수 기준 유사 거래 필터링과 유사 거래 없음 fallback 확인
- `DepositRiskCalculatorTest`로 매매가 대비 80% 이상/60% 미만 경계, 전월세 보증금 대비 120% 이상/80% 이하 경계, 월세 대비 120% 이상/월세 필드 없음 경계, 데이터 없음 경계 확인

아직 미구현:
- 전국 legal-dong catalog sync 경로는 있지만, 도로명주소 입력을 전국 단위 PNU로 정밀 확정하는 흐름은 아직 제한적
- 보증금-월세 환산, 관리비 원본 데이터 자동 검증, 분위 비교
- 공시가격까지 포함한 전세가율 고도화
- 공시가격 동·호 정밀 매칭과 유사 후보 신뢰도 산정
- 건축물대장 위반건축물 여부 원본 필드 자동 판정
- 등기부등본 원본 PDF 업로드/OCR 분석
```

확장 판단 기준:

```text
현재 정확 주소 위험진단은 저장 이력과 공개/비로그인 응답 경계를 모두 고려해 구현되어 있다.
등기부등본 원본 PDF 업로드/OCR 분석은 현재 MVP scope 밖이며, 구현 시 별도 문서/보안/보관 정책을 먼저 정한다.
자동 확정할 수 없는 권리관계는 확정 사실로 쓰지 않고 uncertainty, direct confirmation checklist, evidence status로 표현한다.
외부 API adapter 실패는 success, empty, error, unavailable, ambiguous 같은 상태를 구분해 화면에 데이터 한계로 보여준다.
```

## 3. 앞으로 커질 API 후보

아래는 현재 구현 대상이 아니라 장기 확장 후보입니다.

```text
GET  /api/transactions
GET  /api/transactions/{transactionId}
GET  /api/properties/{propertyId}/transactions
GET  /api/regions/{regionId}/transactions

GET  /api/market/regions/{regionId}/summary
GET  /api/market/regions/{regionId}/price-index
GET  /api/market/regions/{regionId}/volume
GET  /api/market/compare

GET  /api/diagnosis-followups
POST /api/diagnosis-followups/preferences
GET  /api/regional-indicator-analyses/{analysisId}/report

GET  /api/alerts
POST /api/alerts
DELETE /api/alerts/{alertId}

GET  /api/reports/regions/{regionId}
GET  /api/reports/properties/{propertyId}

POST /api/document-analyses/registry
GET  /api/document-analyses/{analysisId}
```

이 후보들은 지금 만들지 않아도 됩니다. 이미 구현된 관리자 API는 위의 Admin 섹션과 `CommunityAdminController`, `AdminUserController`를 기준으로 읽습니다. 미래 후보를 상상할 때도 현재 매물 추천, broker inventory, 실시간 매물 feed처럼 보이는 이름은 피하고, 사용자 목적 기반 진단 후속 행동과 과거 지표 리포트 확장으로 이름을 잡습니다.


## 4. API를 추가할 때 체크할 것

새 API를 만들기 전에 아래를 확인합니다.

```text
이 API는 어떤 사용자 행동에서 출발했나요?
기존 Controller에 들어가야 하나요, 새 Controller가 필요한가요?
Service 메서드 이름은 프론트 API 함수명과 비슷하게 읽히나요?
Request DTO와 Response DTO가 필요한가요?
domain object를 그대로 반환하고 있지는 않나요?
실패 상황은 어떤 ErrorResponse로 표현할 수 있나요?
프론트에서는 로딩, 빈 결과, 에러 상태를 보여줄 수 있나요?
```
