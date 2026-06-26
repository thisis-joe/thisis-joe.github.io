---
title: 06-configuration-properties-profiles
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-27T05:00:07+09:00
---

# Configuration과 Profiles

## 한 줄 정의

Configuration은 실행 환경에 따라 바뀌는 값을 코드 밖에서 관리하는 방법이고, Profile은 환경별 설정 묶음을 선택하는 방법이다.

## 왜 필요한가

개발 환경과 운영 환경은 값이 다르다.

```text
개발 DB 주소
운영 DB 주소
로컬 서버 포트
CORS 허용 origin
로그 레벨
외부 API key
```

이 값을 Java 코드에 직접 쓰면 배포할 때마다 코드를 수정해야 한다.

## application.yml의 역할

ZIP:ON에서는 `backend/src/main/resources/application.yml`이 설정 파일이다.

예시로 관리할 수 있는 값:

```text
server.port
spring.datasource.url
spring.flyway.locations
mybatis.configuration.map-underscore-to-camel-case
zipon.external.juso.address-search-key
zipon.security.jwt.secret
logging.level
```

## Profile이 필요한 시점

처음에는 하나의 `application.yml`로 충분할 수 있다. 하지만 환경이 나뉘면 profile을 쓴다.

```text
application-local.yml
application-dev.yml
application-prod.yml
```

학습 단계에서는 local과 prod의 차이부터 이해한다.

```text
local:
Docker MySQL 또는 로컬 MySQL
debug 로그 가능
개발용 CORS 허용

prod:
운영 DB
민감한 로그 제한
정확한 CORS origin
보안 설정 강화
```

## 실습 미션

```text
1. application.yml에서 ZIP:ON의 포트를 찾는다.
2. server.port를 8082로 바꾸면 어떤 주소로 health check를 해야 하는지 적는다.
3. `application-local.yml`의 datasource가 어떤 MySQL host/port/database를 보는지 적는다.
4. 운영 환경에서 `ZIPON_JWT_SECRET`, Juso/VWorld/data.go.kr key를 코드가 아니라 secret으로 주입해야 하는 이유를 설명한다.
```

## 공식 출처

- [Spring Boot - Externalized Configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html)
- [Spring Boot - Profiles](https://docs.spring.io/spring-boot/reference/features/profiles.html)
