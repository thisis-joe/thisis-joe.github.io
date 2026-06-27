---
title: 04-troubleshooting-learning-template
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
---

# 트러블 슈팅 학습 템플릿

## 목적

문제를 해결한 뒤 지나가버리지 않고, 다음에 같은 문제를 더 빨리 해결하도록 기록하는 양식이다.

## 기본 템플릿

```text
문제:

상황:

내가 기대한 동작:

실제 동작:

확인한 명령 또는 파일:

원인:

해결:

다음에 같은 문제가 생기면:

관련 공식 문서:
```

## 좋은 기록 예시

```text
문제:
Spring Boot 서버가 ZIP:ON 기본 포트 8082에서 실행되지 않았다.

상황:
이미 다른 Java 프로세스가 8082를 사용하고 있었다.

해결:
ZIP:ON backend의 현재 기본 포트가 8082인지 확인하고, 점유 중인 프로세스를 종료한 뒤 다시 실행했다.

다음에 같은 문제가 생기면:
먼저 포트 사용 여부를 확인하고, 프로젝트별 개발 포트를 README에 기록한다.
```

## 작은 문제도 기록해야 하는 이유

작은 문제는 반복해서 시간을 빼앗는다.

```text
경로 이름 오타
포트 충돌
CORS origin 불일치
package 위치 오류
Controller와 Service method 이름 불일치
문서 링크 경로 변경
빌드 산출물에 예전 이름이 남음
```

이런 기록은 팀 전체의 속도를 올린다.

## 실습 미션

```text
1. 오늘 자신이 헷갈린 개념 하나를 문제로 적는다.
2. 해결하지 못한 것도 "미해결"로 기록한다.
3. 공식 문서 링크를 하나 이상 붙인다.
```

## 공식 출처

- [Spring Boot Reference Documentation](https://docs.spring.io/spring-boot/reference/index.html)
- [MDN - Overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)
