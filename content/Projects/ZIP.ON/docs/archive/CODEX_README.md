---
title: CODEX_README
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-29T05:00:06+09:00
purpose: archive-index
status: archived
code_sync_required: false
related_area: codex-history, archive
read_when: 
do_not_use_as: 
  - 과거 docs/CODEX 구조와 이관 전 reference 목록을 확인할 때
  - 현재 docs 라우터
  - 현재 구현 명세
  - 현재 reference 링크 정본
---

# CODEX 기록

이 폴더는 CODEX가 ZIP:ON을 만들고 정리하면서 배운 내용, 설계 판단, 트러블 슈팅을 날짜별로 남기는 공간입니다.

## 자동 기록 원칙

CODEX가 작업 중 직접 고민하거나 해결한 내용은 가능한 한 작은 단위로 기록합니다.

```text
파일 구조를 왜 바꿨는지
함수 이름을 왜 그렇게 맞췄는지
빌드 오류 또는 경고를 어떻게 해석했는지
포트 충돌을 어떻게 피했는지
문서와 코드의 불일치를 어떻게 발견했는지
사용자 요구와 기존 구조가 충돌할 때 어떻게 정리했는지
```

## 폴더 구조

```text
CODEX/
├── 2026-05-29.md
├── review/
├── skills/
├── user-scenarios/
└── reference/
    ├── /docs/product/PRODUCT_OVERVIEW.md
    ├── /docs/product/EXTENSION_SERVICE_DEFINITION.md
    ├── /docs/product/MVP_SCOPE.md
    ├── /docs/api/PUBLIC_API_STRATEGY.md
    ├── /docs/product/ROADMAP.md
    ├── /docs/architecture/security/AUTH_MEMBER_ERD.md
    ├── /docs/architecture/security/AUTH_SCHEMA.md
    ├── /docs/architecture/BACKEND_STRUCTURE.md
    ├── /docs/api/API_FUNCTION_MAP.md
    ├── /docs/architecture/CONVENTIONS.md
    ├── /docs/operations/DOCKER_MYSQL_REDIS.md
    ├── /docs/api/EXTERNAL_API_CONFIGURATION.md
    ├── /docs/operations/IMPROVEMENT_CHECKLIST.md
    ├── /docs/api/API_CALL_FLOW.md
    ├── /docs/LEARNING_PATH.md
    ├── /docs/operations/LOCAL_SETUP.md
    ├── /docs/operations/LOGIN_VERIFICATION_GUIDE.md
    ├── /docs/operations/MR_CONFLICT_TROUBLESHOOTING.md
    ├── /docs/frontend/SCREEN_ANALYSIS_POLICY.md
    ├── /docs/architecture/RISK_SCORING_POLICY.md
    ├── /docs/architecture/SPRING_AI_DIAGNOSIS_STRATEGY.md
    ├── /docs/architecture/DATA_STORAGE_POLICY.md
    └── /docs/architecture/security/SECURITY_AUTHENTICATION.md
```

`reference` 폴더는 팀 전체가 참고할 수 있는 구조, 관례, 확장 방향 문서입니다.
`review` 폴더는 현재 코드와 문서를 기준으로 기술 제안과 개발환경 선택지를 검증한 보고서입니다.
`skills` 폴더는 같은 문제를 다시 만났을 때 먼저 스캔하고 재사용할 짧은 작업 절차 문서입니다.
`user-scenarios` 폴더는 프론트엔드를 실제 사용자 관점으로 눌러 보고, 성공/실패/권한/모바일 흐름을 플로우차트와 결과 보고서로 남기는 공간입니다.

초보자가 모든 reference 문서를 한 번에 읽으면 흐름을 잃기 쉽습니다. 먼저 [학습 경로](/docs/LEARNING_PATH.md)를 읽고, 현재 목표에 맞는 문서만 골라 들어갑니다.

커뮤니티 게시판처럼 기능 하나를 깊게 설명하는 학습 문서는 주제별 폴더에도 둘 수 있습니다.

- [커뮤니티 게시판 백엔드 학습 문서](../community/README.md)
- [반복 작업 스킬 인덱스](/docs/operations/skills/README.md)
- [기술 적용 타당성 검증 보고서](/docs/operations/review/TECH_APPLICABILITY_REVIEW.md)
- [사용자 시나리오 테스트](/docs/frontend/user-scenarios/README.md)

상위 docs 입구는 [docs README](../README.md)입니다.

## 제품 기준 문서

- [ZIP:ON 제품 기준과 서비스 경계](/docs/product/PRODUCT_OVERVIEW.md)
- [ZIP:ON 확장형 서비스 정의](/docs/product/EXTENSION_SERVICE_DEFINITION.md)
- [전세·월세 위험진단 MVP 범위](/docs/product/MVP_SCOPE.md)
- [공공데이터 API 연동 전략](/docs/api/PUBLIC_API_STRATEGY.md)
- [ZIP:ON 성장 로드맵](/docs/product/ROADMAP.md)

MVP 기준을 해석할 때는 전세·월세 위험진단을 핵심 가치로 둔다. 현재 기준에서는 우측하단 플로팅 챗봇, 대화 저장, Spring AI 설명 보조를 MVP 구현 범위에서 제거했고, backend-only OpenAI/ChatGPT API는 `LEASE_RENT_RISK` 고정 항목별 구조화 점수 산정 보조로만 사용한다. 커뮤니티와 관리자 페이지는 MVP 운영 보조 범위에 남는다. 확장형 서비스 정의는 당장 구현 범위가 아니라, 전세·월세 MVP 코드가 이후 주거용 매매, 상가, 토지, 꼬마빌딩 진단으로 확장될 수 있도록 책임 경계를 잡는 장기 기준이다.

## 주요 reference 문서

- [학습 경로](/docs/LEARNING_PATH.md)
- [Spring Security JWT 인증 흐름](/docs/architecture/security/SECURITY_AUTHENTICATION.md)
- [인증 DB 스키마](/docs/architecture/security/AUTH_SCHEMA.md)
- [회원 관리 ERD](/docs/architecture/security/AUTH_MEMBER_ERD.md)
- [로그인 검증 방법](/docs/operations/LOGIN_VERIFICATION_GUIDE.md)
- [지역 DB 스키마](/docs/architecture/REGION_SCHEMA.md)
- [MySQL 개발환경과 Flyway migration](/docs/operations/DOCKER_MYSQL_REDIS.md)
- [로컬 Docker 개발환경](/docs/operations/LOCAL_SETUP.md)
- [ZIP:ON 저장소 전략](/docs/architecture/DATA_STORAGE_POLICY.md)
- [MR 충돌 트러블슈팅 가이드](/docs/operations/MR_CONFLICT_TROUBLESHOOTING.md)
- [커뮤니티 게시판 백엔드 학습 문서](../community/README.md)
- [외부 API 설정과 data.go.kr 키 관리](/docs/api/EXTERNAL_API_CONFIGURATION.md)
- [전세·월세 위험진단 MVP API 호출 전략](/docs/api/API_CALL_FLOW.md)
- [AI 위험도 산정 엔진](/docs/CODEX/reference/AI_RISK_SCORING_ENGINE.md)
- [통찰형 위험진단 리포트 전략](/docs/frontend/SCREEN_ANALYSIS_POLICY.md)
- [위험 신호 룰 사전](/docs/architecture/RISK_SCORING_POLICY.md)
- [구조 학습 가이드](/docs/architecture/BACKEND_STRUCTURE.md)
- [관례와 표현](/docs/architecture/CONVENTIONS.md)
- [API와 함수 학습 지도](/docs/api/API_FUNCTION_MAP.md)
- [API 명세와 프론트엔드 연결 현황](/docs/api/API_FRONTEND_CONNECTION_SPEC.md)
- [개선 체크리스트](/docs/operations/IMPROVEMENT_CHECKLIST.md)

## 검증 보고서

- [기술 적용 타당성 검증 보고서](/docs/operations/review/TECH_APPLICABILITY_REVIEW.md)
