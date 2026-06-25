---
title: 10-mybatis-mapper-and-sql
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-26T05:00:07+09:00
---

# MyBatis Mapper와 SQL

## 한 줄 정의

MyBatis Mapper는 Java method와 SQL을 연결해서 DB 접근을 담당하는 계층입니다.

## 왜 필요한가

Service가 SQL 세부사항을 직접 알면 다음 문제가 생깁니다.

```text
SQL과 업무 규칙이 섞인다.
조회 방식 변경이 Service 전체에 퍼진다.
테스트하기 어려워진다.
어떤 테이블과 컬럼을 읽는지 숨겨진다.
```

Mapper를 분리하면 Service는 "어떤 유스케이스를 처리할지"에 집중하고, Mapper는 "어떤 SQL로 조회하거나 저장할지"에 집중합니다.

## ZIP:ON 기준

ZIP:ON의 backend persistence는 MyBatis Mapper + Flyway migration 기준입니다.

```text
Service:
유스케이스, 트랜잭션, 비즈니스 규칙

Mapper:
테이블과 컬럼 기준의 SQL

Flyway migration:
schema source of truth

Domain object:
MyBatis 조회 결과를 담는 plain Java object
```

## Mapper method 이름

Mapper method는 SQL의 목적을 분명히 드러내야 합니다.

```java
User findByUsername(String username);
List<String> findRoleNamesByUserId(Long userId);
void insert(User user);
```

현재 ZIP:ON에는 인증뿐 아니라 지역, 커뮤니티, 관리자, 관심 검토 대상, 위험진단 이력, 외부 데이터 수집/seed 흐름에도 MyBatis Mapper가 있다.
처음 읽을 때는 아래 순서가 부담이 적다.

```text
UserMapper:
회원 인증과 역할 조회

RegionMapper:
regions 기준 데이터 조회

RentRiskDiagnosisHistoryMapper:
진단 결과 저장/조회

CommunityPostMapper:
게시글과 댓글/신고/운영 상태 조회
```

## Annotation SQL과 XML SQL

현재 ZIP:ON은 annotation-based mapper와 XML mapper를 함께 사용한다.

```text
간단한 단일 테이블 조회:
annotation SQL로 시작해도 읽기 쉽다.

복잡한 동적 조건, join, resultMap:
XML Mapper를 검토한다.
```

중요한 기준은 "SQL이 어디에 있는지 팀원이 바로 찾을 수 있는가"입니다.

## 전세·월세 위험진단에서 필요한 Mapper 후보

MVP의 핵심 흐름에는 이미 여러 mapper가 연결되어 있다.

```text
RegionMapper:
법정동코드, 지역명 조회

RentRiskDiagnosisHistoryMapper:
위험진단 결과 저장/조회

PropertyIdentityCandidateMapper:
주소 기반 물건 후보 저장/조회

RealEstateTransactionFactMapper:
공공 실거래 fact 저장/조회
```

새 mapper를 추가할 때도 원칙은 같다.
실제 DB 저장이 필요한 순간에 Flyway migration과 mapper/test/docs를 함께 추가한다.

## 실습 미션

```text
1. UserMapper.findByUsername(...)이 어떤 테이블과 컬럼을 읽는지 찾아본다.
2. 전세 위험진단 요청을 저장한다면 어떤 테이블이 필요한지 적는다.
3. Mapper method 이름이 Service 규칙을 숨기고 있지는 않은지 확인한다.
```

## Related documents

- [Database Study](../Database/README.md)
- [MyBatis와 Flyway 개요](../Database/01-mybatis-and-flyway-overview.md)
- [공공데이터 API 연동 전략](/docs/api/PUBLIC_API_STRATEGY.md)

## 공식 출처

- [MyBatis Spring Boot Starter](https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/)
- [MyBatis Mapper XML Files](https://mybatis.org/mybatis-3/sqlmap-xml.html)
