---
title: windows-maven-incremental-test-compile
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-29T05:00:06+09:00
purpose: operations-skill
status: active
code_sync_required: false
related_area: windows, maven, test, troubleshooting
read_when: 
do_not_use_as: 
  - Windows에서 Maven testCompile 또는 classpath 증상이 불안정할 때
  - macOS/Linux 기본 검증 명령
  - 현재 코드 컴파일 실패의 유일한 원인
---

# Windows Maven Incremental Test Compile

Windows 로컬 Maven에서 `compile`은 성공했는데 `testCompile` 또는 전체 테스트 중 main/test class를 대량으로 못 찾는 증상을 다룬다.
특히 `cannot find symbol`, `NoClassDefFoundError`, `Unable to find a @SpringBootConfiguration`가 한꺼번에 터지면 실제 코드 누락보다 Maven compiler incremental cache/classpath 흔들림일 수 있다.
이 문서는 ZIP:ON backend 테스트 검증 중 같은 증상을 빠르게 분리하고 우회하기 위한 절차다.

> Status: Implemented

## Trigger Signals

- `cd backend && ./mvnw test` or `.\mvnw.cmd test` fails after main `compile` reports success.
- `target/classes` contains the missing class, but `testCompile` says `cannot find symbol`.
- Many unrelated tests fail with `NoClassDefFoundError`.
- Spring tests report `Unable to find a @SpringBootConfiguration` even though `com.zipon.ZipOnApplication.class` exists.
- Re-running a focused test sometimes passes, but full suite fails inconsistently on Windows.

## Required Scan

```bash
git status --short
cd backend && ./mvnw -v
```

Windows PowerShell class existence check:

```powershell
Test-Path backend\target\classes\com\zipon\ZipOnApplication.class
Test-Path backend\target\classes\com\zipon\domain\User.class
```

Check whether the failure is real code breakage first:

```powershell
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
Set-Location backend
.\mvnw.cmd "-Dtest=<FocusedTestClass>" test
```

## Same-Issue Criteria

- At least one missing class exists under `backend/target/classes`.
- The missing symbols span many unrelated packages.
- A prior run compiled the module or focused tests successfully.
- Adding `-Dmaven.compiler.useIncrementalCompilation=false` changes the result from classpath-like failure to pass or a real single assertion failure.

## Fix Steps

Use the non-incremental compiler flag for verification:

```powershell
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
Set-Location backend
.\mvnw.cmd "-Dmaven.compiler.useIncrementalCompilation=false" test
```

For a full clean verification:

```powershell
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
Set-Location backend
.\mvnw.cmd clean "-Dmaven.compiler.useIncrementalCompilation=false" test
```

If the non-incremental run still fails with a small, coherent set of assertion failures, treat those as real test failures and fix normally.

## Verification

- `.\mvnw.cmd "-Dmaven.compiler.useIncrementalCompilation=false" test`
- Confirm output ends with `Tests run: <n>, Failures: 0, Errors: 0, Skipped: 0`.
- If Flyway migrations are involved, confirm logs include `Successfully validated` and schema version reaches the latest migration.

## Do Not

- Do not delete or regenerate source files just because `testCompile` says symbols are missing.
- Do not assume the first massive `NoClassDefFoundError` burst is a code regression.
- Do not mark tests as passed unless the non-incremental run succeeds.
- Do not commit local `target/` output.

## Related Docs

- [Windows PowerShell UTF-8 output scan](windows-powershell-utf8-output.md)
- [Testcontainers Colima socket](testcontainers-colima-socket.md)
- [Operations index](../README.md)
