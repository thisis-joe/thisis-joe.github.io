---
title: README
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-26T05:00:07+09:00
purpose: learning
status: active
code_sync_required: false
related_area: spring, web, vue, database, architecture
read_when: 
do_not_use_as: 
  - ZIP:ON 코드 이해에 필요한 개념 학습 순서를 잡을 때
  - 구현 문서를 읽기 전에 배경 개념을 보강할 때
  - 현재 구현 명세
  - 테스트 기준
  - API contract
---

# ZIP:ON Study

이 폴더는 ZIP:ON을 개발하면서 Spring Boot, Web, Vue, 데이터베이스, 아키텍처를 체계적으로 공부하기 위한 별도 학습 공간입니다.

`docs`가 제품 기준, 구현 reference, 날짜별 기록을 남기는 곳이라면, `study`는 개념별로 오래 참고할 수 있는 교재 역할을 합니다.

이 폴더의 문서는 현재 코드와 연결해 이해하도록 돕지만, 현재 구현 명세는 아닙니다. 구현 기준이 필요하면 [문서 지도](/docs/_index.md)에서 `code_sync_required: true` 문서를 먼저 찾습니다.

현재 ZIP:ON 학습 기준은 "현재 매물 미제공, 과거 지표 기반 부동산 분석, 정확 주소 위험진단" 제품 방향과 MyBatis-only persistence 정책입니다.

프로젝트 전체를 어떤 순서로 읽을지는 [ZIP:ON 학습 경로](/docs/LEARNING_PATH.md)를 기준으로 봅니다. 이 폴더는 그 경로 중에서 개념이 막힐 때 들어오는 교재입니다.

## 학습 원칙

```text
1. 공식 문서 또는 공식 문서급 출처를 우선한다.
2. 개념을 외우기보다 ZIP:ON 코드와 연결해서 이해한다.
3. 모든 개념은 "왜 필요한가"와 "어디에 쓰이는가"를 함께 기록한다.
4. 작은 실습 미션을 통해 직접 손으로 확인한다.
5. 이해가 흔들리는 부분은 docs/개인폴더 날짜 기록에 남긴다.
```

## 폴더 구조

```text
study/
├── Spring/
├── Web/
├── Vue/
├── Database/
├── Architecture/
├── BuildTools/
└── SOURCES.md
```

## 추천 학습 순서

처음 시작하는 전체 순서는 [학습 경로](/docs/LEARNING_PATH.md)를 따릅니다. 아래 순서는 개념 교재만 놓고 볼 때의 기본 순서입니다.

```text
1. /docs/product/PRODUCT_OVERVIEW.md
2. /docs/product/MVP_SCOPE.md
3. Web/01-http-basics.md
4. Spring/00-spring-boot-master-roadmap.md
5. Spring/01-spring-boot-overview.md
6. Spring/02-project-structure-and-package.md
7. Spring/03-ioc-container-and-beans.md
8. Spring/04-dependency-injection.md
9. Spring/07-spring-mvc-request-flow.md
10. Spring/08-controller-annotations.md
11. Spring/10-mybatis-mapper-and-sql.md
12. Spring/11-domain-object-and-flyway-schema.md
13. Database/01-mybatis-and-flyway-overview.md
14. Vue/01-vue-overview.md
15. Vue/04-router-and-view-components.md
16. Architecture/03-how-to-add-feature.md
```

## 현재 구현을 따라가는 심화 순서

기본 요청/응답 흐름을 이해했다면 아래 문서로 실제 ZIP:ON 구현을 따라갑니다.

```text
1. /docs/api/API_CALL_FLOW.md
2. /docs/architecture/BACKEND_STRUCTURE.md
3. /docs/architecture/DATA_STORAGE_POLICY.md
4. /docs/frontend/COMPONENT_ROLE_MAP.md
5. /docs/frontend/MAP_DIAGNOSIS_UX_PLAN.md
6. /docs/CODEX/reference/AI_RISK_SCORING_ENGINE.md
7. /docs/architecture/security/ROLE_DEPARTMENT_AUTHORIZATION.md
8. /docs/operations/EXTERNAL_DATA_SCHEDULER.md
```

이 순서는 "Spring 개념"을 외우는 순서가 아니라, ZIP:ON의 실제 구현인 정확 주소 위험진단, DB-first public data snapshot, 지도 현장 확인, 관리자 운영 감사, 외부 데이터 scheduler가 어떻게 연결되는지 따라가는 순서입니다.

## 읽는 방법

각 파일은 아래 흐름으로 읽습니다.

```text
개념 한 줄 정의
왜 필요한가
ZIP:ON에서는 어디에 연결되는가
자주 헷갈리는 표현
직접 해볼 실습
공식 출처
```

Spring Boot 마스터를 목표로 하되, 처음부터 모든 하위 기술을 한꺼번에 외우지 않습니다. 먼저 요청이 들어와 응답이 나가는 흐름을 완전히 이해하고, 그 다음 데이터, 트랜잭션, 테스트, 운영 기능으로 넓혀갑니다.

## Related documents

- [Docs index](../README.md)
- [ZIP:ON 학습 경로](/docs/LEARNING_PATH.md)
- [제품 기준과 서비스 경계](/docs/product/PRODUCT_OVERVIEW.md)
- [과거 지표 기반 부동산 분석 MVP 범위](/docs/product/MVP_SCOPE.md)
- [공식 출처 목록](SOURCES.md)
- [Build Tools Study](BuildTools/README.md)
