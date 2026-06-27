---
title: 15-actuator-observability
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
purpose: learning
status: active
code_sync_required: false
related_area: spring, actuator, observability
read_when: 
do_not_use_as: 
  - Actuator, health, metrics, observability 개념을 학습할 때
  - 현재 actuator endpoint 노출 정책
  - 운영 모니터링 구현 명세
---

# Actuator와 Observability

## 한 줄 정의

Actuator는 운영 중인 Spring Boot 애플리케이션을 모니터링하고 관리하기 위한 기능이고, Observability는 로그, 메트릭, 트레이싱으로 시스템 상태를 이해하는 능력이다.

## 왜 필요한가

서비스가 커지면 "실행된다"만으로는 부족하다.

알아야 할 것:

```text
서버가 살아 있는가?
DB 연결이 정상인가?
요청이 얼마나 들어오는가?
응답 시간이 느려졌는가?
에러가 늘어났는가?
어떤 API가 병목인가?
```

## Actuator에서 자주 보는 것

```text
health:
애플리케이션 상태 확인

metrics:
수치 기반 관찰

loggers:
로그 레벨 확인과 조정

mappings:
등록된 request mapping 확인

env:
환경 설정 확인
```

## ZIP:ON에 나중에 필요한 이유

부동산 서비스는 외부 API, DB, 지도 API, 사용자 요청이 모두 얽힌다. 장애가 생겼을 때 어디가 문제인지 찾으려면 관찰 가능성이 필요하다.

예:

```text
공공데이터 API가 느린가?
DB query가 느린가?
지도 API 호출이 실패하는가?
검색 API에 요청이 몰리는가?
```

## 학습 순서

```text
1. actuator dependency 추가
2. health endpoint 확인
3. endpoint 노출 범위 설정
4. 운영에서 노출하면 위험한 endpoint 구분
5. metrics 확인
6. 로그와 tracing으로 확장
```

## 실습 미션

```text
1. 현재 /api/health와 Actuator health의 차이를 설명해본다.
2. 운영에서 env endpoint를 공개하면 왜 위험한지 적는다.
3. ZIP:ON에서 가장 먼저 관찰해야 할 API를 고른다.
```

## 공식 출처

- [Spring Boot - Production-ready Features](https://docs.spring.io/spring-boot/reference/actuator/index.html)
- [Spring Boot - Endpoints](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html)
- [Spring Boot - Observability](https://docs.spring.io/spring-boot/reference/actuator/observability.html)
