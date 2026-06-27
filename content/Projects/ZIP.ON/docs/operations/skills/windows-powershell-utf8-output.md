---
title: windows-powershell-utf8-output
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
purpose: operations-skill
status: active
code_sync_required: false
related_area: windows, powershell, utf8, korean-output
read_when: 
do_not_use_as: 
  - PowerShell 출력에서 한글이 깨져 보일 때
  - 파일 인코딩이 실제로 손상됐다는 증거
  - macOS/Linux 기본 shell 지침
---

# Windows PowerShell UTF-8 Output Scan

PowerShell에서 한글이 깨져 보이면 파일을 수정하기 전에 콘솔 출력 문제인지 실제 파일 인코딩 문제인지 먼저 판별합니다.
`Get-Content -Encoding UTF8`, `rg`, `git diff`로 같은 문제인지 스캔하고, 파일이 정상 UTF-8이면 저장하지 말고 콘솔 세션/명령 인코딩만 조정합니다.

> Status: Implemented

## Trigger Signals

- Korean text appears as `?`, mojibake, or mixed broken characters in PowerShell output.
- `Get-Content` output looks broken, but `rg` or `git diff` shows readable Korean.
- Docs or Java tests contain Korean user-facing text.
- Current task is tempted to "fix" Korean strings after seeing console output only.

## Required Scan

Run the scan before editing files:

```powershell
rg -n "PowerShell|UTF8|Encoding|한글|깨짐|mojibake" docs AGENTS.md
git status --short
git diff --name-only
git diff --check
Get-Content -Encoding UTF8 -Path <path>
```

Optional line-safe read:

```powershell
$path = "<path>"
$lines = Get-Content -Encoding UTF8 -Path $path
1..40 | ForEach-Object { "{0}: {1}" -f $_, $lines[$_ - 1] }
```

## Same-Issue Criteria

Treat as the same issue when:

- PowerShell display is broken but repository files are expected to be UTF-8,
- `rg`/`git diff` output is readable or at least differs from `Get-Content` display,
- no actual source change explains the broken Korean,
- the fix needed is console/session encoding, not text replacement.

## Fix Steps

Set the current PowerShell session to UTF-8:

```powershell
chcp 65001
[Console]::InputEncoding = [System.Text.UTF8Encoding]::new()
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()
```

Then read files with explicit UTF-8:

```powershell
Get-Content -Encoding UTF8 -Path docs/README.md
Get-Content -Encoding UTF8 -Path /docs/operations/skills/README.md
```

Use `apply_patch` for intentional file edits. Do not use `Set-Content` or shell redirection to "repair" Korean unless the file is proven corrupted.

## Verification

```powershell
git diff --check
git diff -- /docs/operations/skills docs/README.md /docs/README.md AGENTS.md docs/AGENTS.md
rg -n "반복 작업 스킬|Repeated Work Skill|PowerShell UTF-8" /docs/operations/skills docs/README.md /docs/README.md AGENTS.md docs/AGENTS.md
```

Expected result:

- no unintended Korean replacement,
- diff shows only intentional docs changes,
- skill links point to `/docs/operations/skills`.

## Do Not

- Do not edit Korean text based only on broken terminal display.
- Do not replace readable Korean with mojibake or `?` characters.
- Do not save UTF-8 markdown through commands that may change encoding.
- Do not move user-facing Korean messages to English just to avoid encoding checks.

## Related Docs

- [Repeated Work Skills](README.md)
- [Legacy PowerShell note](/docs/skills/README.md)
- [docs/AGENTS.md](../../AGENTS.md)
- [Root AGENTS.md](../../../AGENTS.md)
