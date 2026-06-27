---
title: Flyway는 언제, 왜 필요한가?
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
---

Spring Boot 프로젝트를 하다 보면 처음에는 Java 코드만 잘 작성하면 될 것처럼 느껴진다.  
하지만 실제 서비스는 코드만으로 동작하지 않는다. 코드는 항상 데이터베이스와 함께 움직인다.

예를 들어 `User` 클래스에 `lastLoginAt` 필드를 추가했다고 해보자.

```
private LocalDateTime lastLoginAt;
```

그런데 DB의 `users` 테이블에는 `last_login_at` 컬럼이 없다면 어떻게 될까?

코드는 값을 저장하려고 하지만, DB는 그런 컬럼을 모른다. 결국 SQL 오류가 발생한다.  
이때 필요한 것이 바로 **Flyway migration**이다.

## Flyway란?

Flyway는 데이터베이스 변경 이력을 관리하는 도구다.

쉽게 말하면, Git이 코드 변경 이력을 관리하듯이 Flyway는 DB 변경 이력을 관리한다.

```
Git:
Java, Vue, 설정 파일 등의 변경 이력 관리

Flyway:
테이블, 컬럼, 인덱스, 제약조건, 초기 데이터, 데이터 보정 등
DB 구조와 상태 변경 이력 관리
```

Spring Boot 애플리케이션이 실행될 때 Flyway는 migration 파일을 확인한다.  
아직 DB에 적용되지 않은 SQL 파일이 있으면 버전 순서대로 실행한다.

## Flyway, MyBatis Mapper, Service의 역할

우리 프로젝트에서는 DB 관련 책임을 크게 세 부분으로 나눈다.

```
Flyway:
테이블/컬럼/인덱스/제약조건/초기데이터/데이터 보정 등 DB 구조와 상태 변경

MyBatis Mapper:
애플리케이션이 실행 중에 DB를 조회/저장/수정하는 SQL

Service:
그 DB 작업을 어떤 업무 흐름으로 실행할지 결정
```

예를 들어 회원의 마지막 로그인 시간을 저장한다고 해보자.

### 1. Flyway

먼저 DB에 컬럼이 있어야 한다.

```
-- V45__add_users_last_login_at.sql

ALTER TABLE users
    ADD COLUMN last_login_at DATETIME(6);

CREATE INDEX idx_users_last_login_at
    ON users (last_login_at);
```

Flyway는 이 SQL을 통해 `users` 테이블에 `last_login_at` 컬럼과 인덱스를 추가한다.

### 2. MyBatis Mapper

그 다음 애플리케이션이 이 컬럼을 수정할 수 있어야 한다.

```
@Update("""
        UPDATE users
        SET last_login_at = #{lastLoginAt}
        WHERE id = #{userId}
        """)
int updateLastLoginAt(
        @Param("userId") Long userId,
        @Param("lastLoginAt") LocalDateTime lastLoginAt
);
```

Mapper는 애플리케이션 실행 중 실제 DB에 날아가는 SQL을 담당한다.

### 3. Service

마지막으로 “언제 마지막 로그인 시간을 갱신할지”를 결정해야 한다.

```
public void recordSuccessfulLogin(Long userId) {
    userMapper.updateLastLoginAt(userId, LocalDateTime.now());
}
```

Service는 단순히 SQL을 실행하는 곳이 아니라, 로그인 성공 후 어떤 작업을 어떤 순서로 처리할지 결정하는 업무 흐름의 중심이다.

## Flyway는 CREATE TABLE만 관리할까?

아니다.

Flyway는 `CREATE TABLE`만 저장하는 도구가 아니다.  
DB 상태를 바꾸는 거의 모든 변경 SQL을 관리할 수 있다.

예를 들면 다음과 같다.

```
CREATE TABLE users (...);

ALTER TABLE users ADD COLUMN last_login_at DATETIME(6);

CREATE INDEX idx_users_last_login_at
    ON users (last_login_at);

INSERT INTO user_roles (user_id, role_name)
VALUES (1, 'ADMIN');

UPDATE users
SET enabled = TRUE
WHERE enabled IS NULL;
```

즉 Flyway migration은 “DB를 한 버전에서 다음 버전으로 올리는 기록”이다.

## 언제 필요한가?

Flyway는 DB 구조나 기준 데이터가 바뀔 때 필요하다.

대표적인 경우는 다음과 같다.

```
1. 새 테이블을 만들 때
2. 기존 테이블에 컬럼을 추가할 때
3. 컬럼 타입이나 기본값을 바꿀 때
4. unique, foreign key, check 같은 제약조건을 추가할 때
5. 조회 성능을 위해 index를 추가할 때
6. 관리자 계정, 권한, 코드값 같은 초기 데이터를 넣을 때
7. 기존 데이터를 새 구조에 맞게 보정할 때
```

예를 들어 ZIP:ON에서 전월세 위험진단 이력에 “계약 목적”을 저장하고 싶다면 DB 컬럼이 필요하다.

```
-- V45__add_contract_purpose_to_diagnosis_history.sql

ALTER TABLE rent_risk_diagnosis_histories
    ADD COLUMN contract_purpose VARCHAR(50);

CREATE INDEX idx_rent_risk_diagnosis_contract_purpose
    ON rent_risk_diagnosis_histories (contract_purpose);
```

그 다음에야 MyBatis Mapper에서 `contract_purpose`를 `INSERT`, `SELECT`에 포함할 수 있다.

## 왜 필요한가?

가장 큰 이유는 **모든 환경의 DB 구조를 똑같이 맞추기 위해서**다.

Flyway가 없다면 이런 상황이 생긴다.

```
내 로컬 DB에는 last_login_at 컬럼이 있음
다른 개발자 DB에는 없음
테스트 DB에는 있음
운영 DB에는 없음
```

그러면 같은 코드를 실행해도 환경마다 결과가 달라진다.  
어떤 곳에서는 정상 동작하고, 어떤 곳에서는 컬럼이 없다는 오류가 난다.

Flyway를 쓰면 흐름이 이렇게 바뀐다.

```
애플리케이션 실행
-> Flyway가 flyway_schema_history 확인
-> 아직 적용되지 않은 migration 탐색
-> V1, V2, V3 ... 순서대로 실행
-> DB 구조가 코드가 기대하는 상태로 맞춰짐
```

## 우리 프로젝트에서의 역할

ZIP:ON에서는 DB 접근을 MyBatis로 하고, DB 스키마 관리는 Flyway로 한다.

```
Flyway:
테이블, 컬럼, 제약조건, 인덱스, 초기 데이터 정의

MyBatis Mapper:
애플리케이션 실행 중 DB를 조회/저장/수정하는 SQL

Service:
업무 흐름과 트랜잭션 처리
```

예를 들어 Flyway가 `users` 테이블을 만들고, MyBatis의 `UserMapper`가 그 테이블을 조회한다.

```
Flyway migration:
users 테이블 생성

UserMapper:
SELECT id, username, password_hash FROM users WHERE username = ...
```

둘 다 SQL이 나오지만 역할은 다르다.  
Flyway SQL은 “DB 구조를 준비하는 SQL”이고, Mapper SQL은 “애플리케이션이 실제 기능을 수행할 때 실행하는 SQL”이다.

## 기억할 규칙

한 번 적용된 migration 파일은 보통 수정하지 않는다.  
이미 다른 DB에 적용됐을 수 있기 때문이다.

나쁜 방식:

```
V1__create_auth_schema.sql 수정
```

좋은 방식:

```
V45__add_users_last_login_at.sql 추가
```

Flyway는 적용된 파일의 checksum을 기억한다.  
이미 적용된 파일을 수정하면 “예전에 적용한 파일과 지금 파일이 다르다”고 판단해 오류를 낸다.

## 정리

Flyway는 단순히 테이블을 만드는 도구가 아니다.  
DB 변경 이력을 안전하게 관리하고, 여러 환경의 DB 상태를 동일하게 맞추는 도구다.

그리고 ZIP:ON처럼 MyBatis를 사용하는 프로젝트에서는 책임을 이렇게 기억하면 좋다.

```
Flyway:
DB를 어떤 구조와 상태로 만들 것인가?

MyBatis Mapper:
그 DB를 어떤 SQL로 읽고 쓸 것인가?

Service:
그 DB 작업을 어떤 업무 흐름 안에서 실행할 것인가?
```

Spring Boot 프로젝트에서 코드가 성장하면 DB도 함께 성장한다.  
그 성장을 기록하고, 순서대로 적용하고, 실수 없이 공유하게 해주는 것이 Flyway의 핵심 역할이다.

한 줄로 정리하면 다음과 같다.

```
Flyway는 코드가 기대하는 DB 모양을 모든 환경에 똑같이 만들어주는 DB 버전 관리 도구다.
```