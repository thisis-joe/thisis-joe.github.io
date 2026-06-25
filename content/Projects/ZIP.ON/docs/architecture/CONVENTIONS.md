---
title: CONVENTIONS
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-26T05:00:07+09:00
---

# ZIP:ON 관례와 표현

이 문서는 팀원이 같은 방식으로 이름을 짓고, 같은 방식으로 코드를 읽고, 같은 기준으로 개선하기 위한 규칙입니다.

## 1. 백엔드 이름 관례

클래스 이름은 역할이 드러나게 씁니다.

```text
좋음:
RentRiskDiagnosisController
RegionalIndicatorAnalysisService
RegionalIndicatorAnalysisMapper
RegionalIndicatorAnalysisRequest
RentRiskDiagnosisResponse
RegionSummaryResponse

피하기:
PropCtrl
PropSvc
DataDto
TempController
TestService
```

메서드 이름은 동사로 시작하고, 반환 대상을 분명히 씁니다.

```text
좋음:
createAnalysis()
diagnose()
getMyDiagnosis()
createFavorite()
deleteFavorite()
getRegionTrend()

피하기:
list()
detail()
saveData()
doSomething()
process()
```

변수 이름은 줄이지 않습니다.

```text
좋음:
propertyId
regionName
tradeType
searchKeyword
createdAt

피하기:
pid
rn
tt
kwd
dt
```

## 2. Controller 표현 관례

Controller는 요청을 받는 곳입니다. 판단을 많이 하지 않습니다.

```java
@PostMapping
public ApiResponse<RegionalIndicatorAnalysisResponse> createAnalysis(
        @Valid @RequestBody RegionalIndicatorAnalysisRequest request
) {
    return ApiResponse.success(regionalIndicatorAnalysisService.analyze(request));
}
```

좋은 Controller의 특징:

```text
주소가 읽기 쉽다.
메서드명이 API 목적과 맞다.
요청 DTO를 받는다.
Service로 위임한다.
응답 DTO를 공통 응답으로 감싼다.
비즈니스 로직을 직접 쓰지 않는다.
```

개선 신호:

```text
Controller에서 if문이 많아진다.
Controller에서 Mapper를 직접 호출한다.
Controller에서 domain object를 직접 조립한다.
Controller 메서드가 30줄을 넘어간다.
```

## 3. Service 표현 관례

Service는 도메인 규칙을 쓰는 곳입니다.

좋은 Service 메서드는 아래 순서로 읽힙니다.

```text
1. 입력값 검증
2. 필요한 데이터 조회
3. 도메인 규칙 적용
4. domain object 저장 또는 수정
5. Response DTO 변환
```

예시로 생각하면:

```text
diagnose(request)
-> 주소와 계약 조건을 검증
-> 주소/법정동/PNU 후보 정리
-> 공부상 물건 정체와 외부 데이터 근거 조회
-> 데이터 부족과 직접 확인 항목 분리
-> 반환
```

개선 신호:

```text
한 Service가 너무 많은 도메인을 안다.
Mapper 호출 결과를 그대로 Controller에 넘긴다.
domain object와 Response DTO 변환 코드가 여기저기 흩어진다.
예외 메시지와 상태 코드 기준이 파일마다 다르다.
```

## 4. MyBatis Mapper 표현 관례

Mapper는 DB 접근만 담당합니다.

메서드 이름은 SQL이 무엇을 조회하거나 변경하는지 분명히 드러냅니다.

```java
List<Region> findBySearchCondition(String regionName, String legalCode, int limit);
List<RegionalROneIndicatorRow> findRecentROneIndicators(String locationKeyword, String typeKeyword, int limit);
```

조건이 많아질수록 Service가 SQL 세부 구현을 알지 않게 Mapper 메서드 책임을 좁게 둡니다.

```text
selectBySearchCondition(...)
```

이런 시점에는 MyBatis XML 또는 annotation SQL에서 동적 조건을 명확하게 표현합니다.

## 5. Domain object와 DTO 표현 관례

Domain object는 DB와 가까운 객체입니다. API 응답에 그대로 내보내지 않습니다.

```text
Domain object:
- DB 저장 기준
- MyBatis 조회 결과 매핑 기준
- 테이블 컬럼과 도메인 값 포함

DTO:
- API 요청/응답 기준
- 화면에 필요한 값만 포함
- 검증 어노테이션 후보 위치
```

좋은 분리:

```text
RentRiskDiagnosisRequest
-> 정확 주소 위험진단 요청 조건

RegionalIndicatorAnalysisRequest
-> 지역·유형 과거 지표 분석 요청 조건

RentRiskDiagnosisResponse
-> 화면에 보여줄 위험진단 결과
```

## 6. 프론트엔드 이름 관례

컴포넌트 이름은 구체적으로 씁니다.

```text
좋음:
AppHeader.vue
SearchBar.vue
LeaseRiskDiagnosisResult.vue
SearchResultView.vue
CommunityPostItem.vue
MapPlaceholder.vue

피하기:
Header.vue
Chat.vue
Card.vue
Item.vue
List.vue
Box.vue
```

View는 라우트 단위 화면입니다.

```text
HomeView.vue
MapView.vue
ApartmentListView.vue
CommunityListView.vue
```

Component는 재사용 가능한 조각입니다.

```text
LeaseRiskDiagnosisResult.vue
SearchBar.vue
CommunityPostList.vue
```

## 7. 프론트 API 표현 관례

API 함수 이름은 백엔드 Service 메서드와 비슷하게 맞춥니다.

```js
createRegionalIndicatorAnalysis()
createRentRiskDiagnosis()
searchRentRiskDiagnosisCandidates()
createFavorite()
deleteFavorite()
```

좋은 API 모듈의 특징:

```text
주소가 한 곳에 모여 있다.
params와 payload 이름이 백엔드 DTO와 맞다.
컴포넌트가 URL 문자열을 직접 알지 않아도 된다.
공통 baseURL은 axiosInstance에 있다.
```

## 8. 주석 표현 관례

좋은 주석은 코드를 번역하지 않습니다. 이유와 방향을 알려줍니다.

```text
좋음:
- 이 계층이 왜 필요한지 설명
- 지금 비워둔 이유 설명
- 나중에 어떤 로직이 들어갈지 설명
- 현재 구현이 어떤 제품 경계를 지키는지 설명
- 후속 구현이 시작되기 전에 확인해야 할 조건을 명시

피하기:
- "id를 저장한다"처럼 코드와 같은 말 반복
- 오래된 구현 설명
- 실제 코드와 맞지 않는 주석
- "여기 뭐가 들어갈까요?"처럼 읽는 사람이 현재 상태를 추측해야 하는 질문형 주석
```

ZIP:ON에서는 학습용 질문을 코드에 오래 남기기보다, 현재 구현 기준을 직접 적습니다.

```text
현재 단계:
-> 지금 구현된 범위와 의도적으로 비워둔 범위

구현 메모:
-> 왜 이 방식으로 나눴는지, 다음 slice에서 무엇을 확인해야 하는지

확장 판단 기준:
-> 아직 구현하지 않을 기능의 조건, 위험, 분리 기준
```

## 9. 리뷰할 때 보는 기준

기능을 구현한 뒤 스스로 이렇게 점검합니다.

```text
이름만 보고 역할을 알 수 있는가?
Controller에 로직이 너무 많지 않은가?
Service가 Mapper를 통해 데이터를 가져오는가?
domain object를 그대로 응답하지 않는가?
예외 상황을 생각했는가?
프론트에서 로딩/에러/빈 상태를 처리했는가?
테스트 또는 수동 확인 방법이 있는가?
```
