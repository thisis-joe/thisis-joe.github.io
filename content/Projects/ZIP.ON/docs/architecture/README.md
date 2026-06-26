---
title: README
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-27T05:00:07+09:00
purpose: current-architecture-index
status: active
code_sync_required: true
related_code: 
read_when: 
update_when: 
  - backend/src/main/java/com/zipon
  - backend/src/main/resources/db/migration
  - backend package structure, service boundary, persistence, security, risk scoring을 수정할 때
  - package responsibility, schema strategy, security flow, risk scoring architecture가 바뀔 때
---

# Architecture Docs

이 폴더는 백엔드 구조, 저장소 정책, 위험도 산정 정책, 인증/보안을 관리한다.

이 폴더의 현재 구조 문서는 코드와 맞아야 한다. 단, 미래 확장 구상은 현재 구현으로 오해되지 않도록 별도 상태를 표시한다.

## 읽는 순서

1. [BACKEND_STRUCTURE.md](BACKEND_STRUCTURE.md)
2. [DATA_STORAGE_POLICY.md](DATA_STORAGE_POLICY.md)
3. [MARKET_INDICATOR_FOUNDATION.md](MARKET_INDICATOR_FOUNDATION.md)
4. [RISK_SCORING_POLICY.md](RISK_SCORING_POLICY.md)
5. [RISK_ASSESSMENT_EVIDENCE_MODEL.md](RISK_ASSESSMENT_EVIDENCE_MODEL.md)
6. [CODEX AI 위험도 산정 엔진](/docs/CODEX/reference/AI_RISK_SCORING_ENGINE.md)
7. [security/SECURITY_AUTHENTICATION.md](security/SECURITY_AUTHENTICATION.md)

## 책임 구조

ZIP:ON은 현재 단순 계층 구조를 유지한다.

```text
audit
common
config
controller
domain
dto
exception
external
mapper
risk
security
service
web
```

| 패키지 | 책임 |
| --- | --- |
| `controller`, `dto` | Spring MVC HTTP 요청/응답 경계와 DTO |
| `service` | use case, transaction, 외부 API/mapper orchestration |
| `mapper` | MyBatis 기반 persistence access |
| `domain` | DB row, 진단 계산 값, 내부 판단 model |
| `external` | data.go.kr, VWorld, Juso, 행정표준코드, R-ONE client/parser |
| `risk` | backend-only 구조화 위험 항목 산정과 OpenAI adapter/fallback |
| `audit` | 관리자·운영 행동 감사 AOP, request context, payload sanitizing |
| `security` | Spring Security, JWT, principal, 401/403 handler |
| `config`, `web`, `common`, `exception` | configuration, request correlation, 공통 응답, 공통 예외 |
