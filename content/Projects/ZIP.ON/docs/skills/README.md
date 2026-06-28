---
title: README
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-29T05:00:06+09:00
---

# 작업 스킬

> Status: Implemented

`docs/skills/`는 과거 작업 스킬 문서가 남아 있는 legacy 경로다. 반복 작업, 문제 해결 절차, 환경 복구 절차는 기본적으로 [/docs/operations/skills/README.md](/docs/operations/skills/README.md)를 따른다. 다만 MR/PR 설명 작성 규칙은 사용자가 명시적으로 이 경로를 지정했으므로 아래 문서를 의도적 예외로 유지한다.

## 현재 문서

| 문서 | 용도 |
| --- | --- |
| [MR_MESSAGE_GUIDE.md](/docs/skills/MR_MESSAGE_GUIDE.md) | `git push`, MR/PR, 커밋 요약, 작업 완료 보고 시 상세 MR 메시지를 작성하는 규칙 |
| [PowerShell 한글 깨짐 대응](/docs/operations/skills/windows-powershell-utf8-output.md) | Windows PowerShell 출력 인코딩 문제 대응 절차 |

## 사용 규칙

- push/MR/PR/작업 완료 보고와 관련된 응답을 작성하기 전에는 [MR 메시지 작성 가이드](/docs/skills/MR_MESSAGE_GUIDE.md)를 먼저 읽는다.
- 일반적인 반복 작업 skill은 새로 이 경로에 만들지 말고 [/docs/operations/skills/](/docs/operations/skills/README.md)에 추가한다.
- 이 경로에 문서를 추가해야 하는 명시 요청이 있으면, 새 문서가 orphan이 되지 않도록 이 README에 링크한다.

## Historical note

> Canonical location: [/docs/operations/skills/windows-powershell-utf8-output.md](/docs/operations/skills/windows-powershell-utf8-output.md).
> Add new repeated-work skill docs under `/docs/operations/skills/`, not this legacy path.

이 문서는 Windows PowerShell에서 ZIP:ON 문서나 Java 테스트 파일의 한글이 `?ㅽ뵾?ㅽ뀛`, `嫄댁텞...`처럼 깨져 보일 때 사용하는 작업 절차를 정리한다.

중요한 원칙은 먼저 파일이 실제로 깨졌는지와 콘솔 출력만 깨졌는지를 구분하는 것이다. ZIP:ON의 문서와 소스 파일은 UTF-8 기준으로 관리하므로, PowerShell 기본 출력이 잘못 해석한 화면만 보고 파일을 다시 저장하거나 문자열을 고치면 정상 파일을 오히려 망가뜨릴 수 있다.

## Goal

- PowerShell 출력에서 한글이 깨져 보여도 파일 내용을 성급히 수정하지 않는다.
- UTF-8로 다시 읽어 실제 파일 내용이 정상인지 확인한다.
- 반복 작업에서는 PowerShell 세션과 명령을 UTF-8 기준으로 맞춘다.

## 빠른 해결

파일 내용을 확인할 때는 `Get-Content`에 `-Encoding UTF8`을 붙인다.

```powershell
Get-Content -Encoding UTF8 -Path docs/README.md
Get-Content -Encoding UTF8 -Path backend/src/test/java/com/zipon/service/LeaseRiskDiagnosisPropertyIdentityServiceTest.java
```

긴 파일에서 일부 줄만 볼 때도 먼저 UTF-8로 읽은 뒤 줄을 자른다.

```powershell
$path = "/docs/api/API_CALL_FLOW.md"
$lines = Get-Content -Encoding UTF8 -Path $path
60..90 | ForEach-Object { "{0}: {1}" -f $_, $lines[$_ - 1] }
```

현재 세션 전체를 UTF-8 쪽으로 맞추고 싶으면 다음을 실행한다.

```powershell
chcp 65001
[Console]::InputEncoding = [System.Text.UTF8Encoding]::new()
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()
```

위 설정 뒤에도 특정 명령이 깨져 보이면, 파일 확인 명령에는 여전히 `-Encoding UTF8`을 명시한다. 특히 Windows PowerShell 5.x와 일부 외부 프로그램 출력은 세션 설정만으로 완전히 해결되지 않을 수 있다.

## 판단 순서

1. 깨진 출력이 보이면 파일을 바로 수정하지 않는다.
2. 같은 파일을 `Get-Content -Encoding UTF8`로 다시 읽는다.
3. UTF-8로 정상 출력되면 파일은 정상이고 콘솔 출력 문제로 판단한다.
4. `git diff`에서 한글이 정상인지 확인한다.
5. 그래도 실제 파일이 깨진 경우에만 `apply_patch`로 문자열을 복구한다.

## 자주 쓰는 확인 명령

현재 Git 변경이 실제로 깨졌는지 볼 때:

```powershell
git diff -- docs/operations/skills/README.md
git diff --check
```

문서에서 특정 한글 또는 클래스명을 찾을 때:

```powershell
rg -n "PowerShell|한글|UTF8|LeaseRiskDiagnosisPropertyIdentityService" docs
```

문서 일부를 안전하게 읽을 때:

```powershell
$path = "docs/operations/skills/README.md"
$lines = Get-Content -Encoding UTF8 -Path $path
1..40 | ForEach-Object { "{0}: {1}" -f $_, $lines[$_ - 1] }
```

## 하지 말아야 할 것

- 깨진 콘솔 출력만 보고 정상 한글 문자열을 `?`나 mojibake 문자열 기준으로 바꾸지 않는다.
- `Set-Content`나 리다이렉션으로 파일을 덮어쓰지 않는다. 이 저장소에서는 수동 파일 편집에 `apply_patch`를 사용한다.
- 인코딩 문제 해결을 위해 소스 코드의 한글 메시지를 영어로 바꾸지 않는다. 사용자에게 보이는 진단 문장은 한국어가 제품 기준이다.
- 테스트 기대값을 깨진 출력 문자열에 맞추지 않는다. 기대값은 UTF-8로 정상 표시되는 실제 사용자 문장을 기준으로 둔다.

## 왜 이런 문제가 생기는가

Windows PowerShell, 콘솔 코드 페이지, 외부 명령 출력 인코딩, 파일 저장 인코딩이 서로 다를 수 있다. 파일은 UTF-8인데 콘솔이 다른 코드 페이지로 바이트를 해석하면 파일 자체는 정상이어도 화면에는 깨진 글자가 보인다.

ZIP:ON 문서는 한글 설명이 많고, 백엔드 테스트도 사용자-facing 문장을 검증한다. 따라서 인코딩 문제를 파일 내용 문제로 오해하면 문서와 테스트를 동시에 망가뜨릴 수 있다.

## 이 저장소에서의 기준

- 문서 파일: UTF-8 Markdown
- Java 소스와 테스트: UTF-8
- 문서 작성 언어: 한국어
- 코드 식별자: 영어
- 파일 편집 도구: `apply_patch`
- 확인 우선순위: `Get-Content -Encoding UTF8` -> `git diff` -> focused test

## Related documents

- [Docs index](../README.md)
- [docs/AGENTS.md](../AGENTS.md)
- [관례와 표현](/docs/architecture/CONVENTIONS.md)

## Learning path

1. First read: this document
2. Then inspect: `docs/AGENTS.md`
3. Then run: `Get-Content -Encoding UTF8 -Path docs/README.md`
4. Then debug: 깨진 출력이 파일 문제인지 콘솔 문제인지 `git diff`와 UTF-8 재조회로 비교
5. Key concept to understand: 파일 인코딩과 터미널 출력 인코딩은 같은 문제가 아니다
