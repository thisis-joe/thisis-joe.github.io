---
title: V-World 공시가격 적재 구조를 바꾼 이유
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
---

이번 문제의 핵심은 단순히 “V-World API를 호출해서 공시가격을 저장하자”가 아니었다.

진짜 질문은 이것이었다.

> ZIP:ON은 어떤 부동산을 공시가격 조회 대상으로 판단해야 하는가?

V-World 공시가격은 보통 `PNU`가 있어야 안정적으로 조회할 수 있다.  
그런데 ZIP:ON이 가진 데이터에는 항상 PNU가 없다. 사용자 입력 주소, 관심 부동산, 실거래가 row, 건축물대장, JUSO 주소검색 결과는 모두 부동산 관련 정보지만, 모두가 곧바로 “정확한 필지”를 의미하지는 않는다.

## 문제

처음 생각할 수 있는 방식은 간단하다.

```
사용자가 주소 입력
-> PNU 생성
-> V-World 조회
-> public_price_snapshots 저장
```

하지만 이렇게 하면 `public_price_snapshots`가 사용자 요청 캐시처럼 작아진다.  
반대로 전국 모든 PNU를 무작정 호출하면 API 호출량, 실패 처리, 운영 통제 문제가 생긴다.

그래서 둘 다 답이 아니었다.

## 해결 원리

구조를 이렇게 나눴다.

```
원천 데이터
-> PNU 후보 universe 생성
-> V-World sync target table 저장
-> 호출 가능한 target만 선별
-> V-World API 호출
-> public_price_snapshots 저장
-> coverage metric 기록
```

중요한 점은 이것이다.

```
PNU 후보가 있다
```

와

```
V-World API를 호출해도 된다
```

는 다르다.

후보는 넓게 만든다.  
하지만 API 호출은 신뢰도 기준을 통과한 것만 한다.

## PNU 후보 source

이번 구조에서는 최소한 아래 source에서 PNU 후보를 만든다.

```
사용자 진단 주소
관심 부동산
건축물대장 조회 결과
JUSO 주소검색 결과
실거래가 row
운영자 seed 대상
서비스 대상 법정동 bulk 대상
```

특히 실거래가 row는 중요하다. 대량 적재가 가능하기 때문이다.

실거래가에는 보통 `시군구코드`, `법정동명`, `지번`, `단지명`, `전용면적`, `층`, `계약일`이 있다.  
여기서 `legal_dong_codes` 보조 테이블로 법정동코드 10자리를 확정하고, 본번/부번을 조합해 PNU 후보를 만든다.

단, 법정동명이 여러 코드와 매칭되면 확정하지 않고 보류한다.

## 상태를 나눈 이유

PNU 매칭은 성공/실패로만 나누기 어렵다.  
그래서 상태를 나눴다.

```
EXACT_PNU
DERIVED_FROM_BUILDING_LEDGER
DERIVED_FROM_JUSO
DERIVED_FROM_TRANSACTION
MULTIPLE_CANDIDATES
REGION_ONLY
UNRESOLVED
```

V-World API는 아래 상태만 호출한다.

```
EXACT_PNU
DERIVED_FROM_BUILDING_LEDGER
DERIVED_FROM_JUSO
신뢰도 기준을 통과한 DERIVED_FROM_TRANSACTION
```

반대로 아래 상태는 호출하지 않는다.

```
MULTIPLE_CANDIDATES
REGION_ONLY
UNRESOLVED
```

이렇게 하면 PNU가 없더라도 서비스가 멈추지 않는다.  
정확한 공시가격은 못 보더라도, 지역 통계나 실거래가 유사 사례는 계속 사용할 수 있다.

## 추가한 테이블

이번에 핵심적으로 추가한 테이블은 세 개다.

```
vworld_public_price_admin_seed_targets
vworld_public_price_sync_targets
vworld_public_price_coverage_metrics
```

`vworld_public_price_admin_seed_targets`는 운영자가 직접 조사 대상을 넣는 원본 테이블이다.

`vworld_public_price_sync_targets`는 실제 V-World 호출 후보를 관리하는 테이블이다.  
여기에 `pnu`, `source_type`, `confidence_score`, `match_status`, `sync_status`, `failure_reason` 등을 저장한다.

`vworld_public_price_coverage_metrics`는 운영자가 coverage를 확인하기 위한 집계 테이블이다.

예를 들어 이런 숫자를 남긴다.

```
전체 실거래가 row 수
PNU 후보 생성 성공 수
전체 sync target 수
호출 가능한 target 수
V-World 성공/실패/HOLD 수
공시가격 snapshot 수
```

## 실제 확인 결과

로컬 DB 기준으로 실거래가 fact는 146,415건이었다.  
샘플 materialize 실행으로 V-World sync target 500개를 만들었다.

```
READY 27
HOLD 472
FAILED 1
```

1건은 실제 V-World 호출까지 시도했지만 응답이 `ERROR`로 기록되어 snapshot은 아직 0건이다.  
즉, 호출 구조와 실패 기록 구조는 동작했고, 외부 API 응답 실패는 DB에 남았다.

Redis는 사용하지 않았다.  
이번 데이터는 장기 fact와 운영 기록이므로 DB에 저장하는 것이 맞다.

## demo user 처리

초기 요구였던 demo user도 재시드했다.

```
admin 유지
기존 demo_user_* 삭제
36개 케이스 생성
각 케이스 100명
총 demo user 3,600명
```

결과는 다음과 같다.

```
전체 users: 3601
admin: 1
demo users: 3600
```

## 검증

전체 backend 테스트를 실행했다.

```
cd backend && ./mvnw test
```

결과는 다음과 같다.

```
Tests run: 461
Failures: 0
Errors: 0
Skipped: 0
```

## 정리

이번 작업의 핵심은 API 호출이 아니라 식별자 신뢰도 관리다.

```
후보는 넓게 만든다.
호출은 신뢰 가능한 것만 한다.
보류와 실패도 데이터로 남긴다.
coverage를 숫자로 확인한다.
```

이 구조 덕분에 ZIP:ON은 사용자 요청 캐시에 머물지 않고, 보유한 공공데이터를 기반으로 더 넓은 공시가격 fact coverage를 만들어갈 수 있다.