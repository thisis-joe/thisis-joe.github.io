---
title: 02-mybatis-query-and-pagination
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-26T05:00:07+09:00
---

# MyBatis Query와 Pagination

## 한 줄 정의

MyBatis query는 Mapper method가 실행하는 SQL이고, pagination은 많은 데이터를 페이지 단위로 나누어 조회하는 방식입니다.

## Query를 설계하는 기준

Mapper method 이름은 조회 목적을 드러내고, SQL은 테이블과 조건을 명확히 보여줘야 합니다.

```java
// 현재 RegionMapper 예시
List<Region> findBySearchCondition(String regionName, String legalCode, int limit);

// 현재 UserMapper 예시
User findByUsername(String username);
```

조건이 많아지면 `selectBySearchCondition(...)`처럼 request object나 condition object를 넘기는 방식을 검토할 수 있습니다.

## 언제 동적 SQL이 필요한가

```text
조건이 선택적으로 들어온다.
정렬 기준이 여러 개다.
필터가 3개 이상으로 늘어난다.
join이나 집계가 필요하다.
```

전세·월세 위험진단에서는 주소, 법정동코드, 건물 유형, 계약 목적에 따라 조회해야 할 데이터가 달라지므로 동적 조건이 늘어날 수 있습니다.

## Pagination이 필요한 이유

실거래, 지역 검색 결과, 커뮤니티 게시글은 데이터가 많을 수 있습니다. 한 번에 모두 내려주면 서버와 브라우저 부담이 커집니다.

```text
page
size
sort
```

같은 pagination 기준을 프론트와 백엔드가 공유해야 합니다.

## ZIP:ON에서 먼저 생각할 pagination 후보

```text
CommunityController.getPostList()
SearchController.search()
RegionController.getRegionList()
전세·월세 위험진단 이력 조회
```

MVP 위험진단의 단일 결과 화면은 pagination보다 "정확한 체크리스트"가 먼저입니다. 하지만 이력 조회나 검색 결과가 생기면 pagination이 필요합니다.

## 실습 미션

```text
1. RegionMapper.findBySearchCondition(...)이 regionName 부분 검색과 legalCode 정확 일치를 어떻게 나누는지 설명한다.
2. CommunityPost 목록 조회에 page와 size를 붙이면 Response DTO가 어떻게 달라질지 적는다.
3. 전세 위험진단 이력 화면이 생기면 기본 size를 몇 개로 할지 정한다.
```

## Related documents

- [MyBatis와 Flyway 개요](01-mybatis-and-flyway-overview.md)
- [API와 함수 학습 지도](/docs/api/API_FUNCTION_MAP.md)
- [개선 체크리스트](/docs/operations/IMPROVEMENT_CHECKLIST.md)

## 공식 출처

- [MyBatis Mapper XML Files](https://mybatis.org/mybatis-3/sqlmap-xml.html)
- [MyBatis Dynamic SQL Select Statements](https://mybatis.org/mybatis-dynamic-sql/docs/select.html)
