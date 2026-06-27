---
title: README
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
purpose: api-contract-index
status: active
code_sync_required: true
related_code: 
read_when: 
update_when: 
  - backend/src/main/java/com/zipon/controller
  - backend/src/main/java/com/zipon/dto
  - frontend/src/api
  - controller, DTO, frontend API module을 수정할 때
  - 외부 공공데이터 API adapter나 parser를 수정할 때
  - endpoint, request/response DTO, frontend API 함수, 외부 API 호출 전략이 바뀔 때
---

# API Docs

이 폴더는 ZIP:ON의 공공데이터 API 전략, MVP 호출 순서, 프론트엔드 연결 명세를 관리한다.

이 폴더의 구현 문서는 현재 API surface와 맞아야 한다. 개념 설명이 필요하면 먼저 [문서 지도](/docs/_index.md)에서 학습 문서를 별도로 찾는다.

## 읽는 순서

1. [PUBLIC_API_STRATEGY.md](PUBLIC_API_STRATEGY.md)
2. [API_CALL_FLOW.md](API_CALL_FLOW.md)
3. [external-api/README.md](external-api/README.md)
4. [API_FRONTEND_CONNECTION_SPEC.md](API_FRONTEND_CONNECTION_SPEC.md)
5. [API_FUNCTION_MAP.md](API_FUNCTION_MAP.md)
6. [EXTERNAL_API_CONFIGURATION.md](EXTERNAL_API_CONFIGURATION.md)
7. [OPENAPI_SWAGGER_GUIDE.md](OPENAPI_SWAGGER_GUIDE.md)
8. [BACKEND_RESPONSE_CONTRACT_2026_06_23.md](BACKEND_RESPONSE_CONTRACT_2026_06_23.md)

## 외부 API 구현 전 읽는 순서

외부 API adapter, parser, cache, DB 저장, 위험도 계산을 건드릴 때는 개별 명세만 보지 말고 아래 순서로 읽는다.

1. [external-api/ADDRESS_CODE_FLOW.md](external-api/ADDRESS_CODE_FLOW.md)
2. [external-api/API_DOMAIN_MAP.md](external-api/API_DOMAIN_MAP.md)
3. [external-api/API_CALL_STRATEGY.md](external-api/API_CALL_STRATEGY.md)
4. [external-api/DATA_STORAGE_AND_CACHE_POLICY.md](external-api/DATA_STORAGE_AND_CACHE_POLICY.md)
5. [external-api/API_COMBINATION_MATRIX.md](external-api/API_COMBINATION_MATRIX.md)
6. [external-api/FIELD_MAPPING_DICTIONARY.md](external-api/FIELD_MAPPING_DICTIONARY.md)
7. [external-api/ERROR_HANDLING_POLICY.md](external-api/ERROR_HANDLING_POLICY.md)
8. [external-api/INDEX.md](external-api/INDEX.md)
9. [external-api/specs/](external-api/specs/)

## Core API 원칙

```text
주소 정제
-> 법정동코드 식별
-> 물건 정체 판별
-> 건축물 기본정보 조회
-> 물건 유형에 맞는 실거래가 API 선택
-> 공시가격 참고
-> 전세·월세 위험도 계산
-> 직접 확인 필요 항목 분리
-> 체크리스트 생성
```

물건 유형 판별 전에는 실거래가 API를 무작정 호출하지 않는다.

상세 외부 API 원문 명세는 [external-api/specs/](external-api/specs/)에 보존한다.

## 현재 주요 API surface

| 목적 | Endpoint | Controller | 문서 |
| --- | --- | --- | --- |
| 정확 주소 전세·월세 위험진단 | `POST /api/rent-risk-diagnoses` | `RentRiskDiagnosisController` | [API_CALL_FLOW.md](API_CALL_FLOW.md) |
| 진단 이력의 등기부등본 수동 확인 상태 | `GET/PUT /api/rent-risk-diagnoses/{diagnosisId}/registry-document-confirmation` | `RentRiskDiagnosisController` | [API_CALL_FLOW.md](API_CALL_FLOW.md) |
| 지역·유형 과거 지표 분석 | `POST /api/regional-indicator-analyses` | `RegionalIndicatorAnalysisController` | [PUBLIC_API_STRATEGY.md](PUBLIC_API_STRATEGY.md) |
| Juso 주소 검색/팝업 | `GET /api/address-search/juso`, `GET /api/address-search/juso-popup` | `JusoAddressSearchController`, `JusoAddressPopupController` | [EXTERNAL_API_CONFIGURATION.md](EXTERNAL_API_CONFIGURATION.md) |
| 진단 지도 맥락 | `GET /api/map/diagnosis-context` | `MapController` | [MAP_DIAGNOSIS_UX_PLAN.md](/docs/frontend/MAP_DIAGNOSIS_UX_PLAN.md) |
| 진단 지도 현장 확인 기록 | `GET/PUT /api/map/field-checks` | `MapController` | [MAP_DIAGNOSIS_UX_PLAN.md](/docs/frontend/MAP_DIAGNOSIS_UX_PLAN.md) |
| 관리자 외부 API 상태 | `GET /api/admin/external-api-health`, `GET /api/admin/external-data-status` | `AdminExternalApiHealthController`, `AdminExternalDataStatusController` | [EXTERNAL_DATA_SCHEDULER.md](/docs/operations/EXTERNAL_DATA_SCHEDULER.md) |
| 관리자 감사 로그 | `GET /api/admin/audit-logs` | `AdminActionAuditLogController` | [ROLE_DEPARTMENT_AUTHORIZATION.md](/docs/architecture/security/ROLE_DEPARTMENT_AUTHORIZATION.md) |

세부 request/response field, 인증 요구사항, 오류 응답은 실행 중인 Swagger UI와 [OpenAPI/Swagger 가이드](OPENAPI_SWAGGER_GUIDE.md)를 함께 확인한다.
