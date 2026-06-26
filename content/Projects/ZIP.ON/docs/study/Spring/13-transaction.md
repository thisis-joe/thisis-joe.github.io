---
title: 13-transaction
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-27T05:00:07+09:00
---

# Transaction

## 한 줄 정의

Transaction은 여러 DB 작업을 하나의 작업 단위로 묶어 모두 성공하거나 모두 실패하게 만드는 개념이다.

## 왜 필요한가

예를 들어 관심 검토 항목을 저장한다고 하자.

```text
1. 사용자를 조회한다.
2. 저장하려는 분석/진단 기준을 해석한다.
3. 이미 관심 등록했는지 확인한다.
4. Favorite을 저장한다.
5. 관련 스냅샷과 표시용 summary를 함께 저장한다.
```

중간에 실패했는데 일부만 저장되면 데이터가 이상해진다. 이런 경우 Transaction이 필요하다.

## @Transactional을 어디에 붙이는가

보통 Service 계층에 붙인다.

이유:

```text
Service가 업무 작업 단위다.
하나의 Service method가 여러 Mapper 호출을 묶을 수 있다.
Controller는 HTTP 처리 계층이므로 트랜잭션 경계로 적합하지 않다.
Mapper는 너무 작은 단위일 수 있다.
```

## readOnly

조회 전용 method에는 readOnly 옵션을 고려할 수 있다.

```java
@Transactional(readOnly = true)
public RentRiskDiagnosisResponse getMyDiagnosis(CustomUserPrincipal principal, Long historyId) {
    ...
}
```

학습 단계에서는 왜 조회와 저장의 트랜잭션 성격이 다른지부터 이해한다.

## rollback

Transaction은 실패 시 되돌리는 기준이 중요하다. 어떤 예외에서 rollback할지, checked exception과 runtime exception의 차이도 나중에 학습해야 한다.

## ZIP:ON에서 Transaction 후보

```text
FavoriteService.createFavorite()
FavoriteService.deleteFavorite()
RentRiskDiagnosisHistoryService.recordDiagnosis(...)
CommunityService.createPost()
CommunityService.updatePost()
CommunityService.deletePost()
UserService.updateMyProfile()
UserService.uploadMyProfileImage()
```

조회 API는 readOnly transaction 후보가 될 수 있다. 다만 `UserService.getMyPage(...)`처럼 조회 중 누락된 profile을 생성하는 흐름은 쓰기 가능 transaction이 필요하다.

## 실습 미션

```text
1. FavoriteService.createFavorite()를 하나의 작업 단위로 설명한다.
2. 커뮤니티 글 작성 중 첨부파일 저장이 실패하면 게시글도 롤백해야 하는지 생각한다.
3. RentRiskDiagnosisHistoryService.getMyDiagnosis(...)처럼 조회 method에 readOnly를 붙이는 이유를 찾아본다.
```

## 공식 출처

- [Spring Framework - Using @Transactional](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)
- [Spring Framework - Declarative Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html)
