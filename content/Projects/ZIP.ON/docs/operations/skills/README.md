---
title: README
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-30T05:00:06+09:00
purpose: operations-skill-index
status: active
code_sync_required: false
related_area: agent-workflow, repeated-work, troubleshooting
read_when: 
update_when: 
  - 반복 작업 skill 문서를 찾거나 새로 만들 때
  - 같은 문제인지 판별하는 pre-scan 규칙이 필요할 때
  - docs/operations/skills 아래 skill 문서가 추가, 제거, 이동될 때
---

# Repeated Work Skills

반복 작업 스킬은 같은 문제를 다시 만났을 때 원인 탐색을 처음부터 반복하지 않기 위한 짧은 실행 문서입니다.
먼저 증상과 오류 문구를 스캔해 기존 스킬과 같은 문제인지 판별하고, 같다면 해당 스킬의 해결 절차를 우선 적용합니다.
각 스킬은 작업별로 분리하며 본문은 LLM이 빠르게 읽을 수 있는 영어 체크리스트 형식으로 작성합니다.

> Status: Implemented

## Purpose

`/docs/operations/skills/` stores reusable task runbooks for repeated repository work.

Use this directory to reduce future token cost:

- avoid rediscovering known fixes,
- preserve exact scan/fix/verify commands,
- make repeated branch/worktree/documentation problems portable across `dev` and active work branches,
- keep long learning docs separate from compact agent execution memory.

## Required Pre-Scan

Before broad investigation, scan for a reusable skill when any symptom looks familiar.

```bash
rg -n "<symptom>|<error>|<command>|<class-or-file>" docs/operations/skills AGENTS.md docs/AGENTS.md
git status --short
git diff --name-only
```

Scan inputs:

- exact error text or broken output,
- command that failed or produced suspicious output,
- affected file path/class/test name,
- branch/worktree context,
- recent changed files,
- prior docs references.

## Same-Issue Decision

Treat it as the same issue when two or more signals match:

- same command or tool,
- same error/symptom shape,
- same file family or module,
- same OS/profile/runtime context,
- same fix verification command,
- existing skill names the current risk.

If same issue is likely:

1. Follow the matching skill first.
2. Investigate only gaps not covered by the skill.
3. Update the skill if any step was stale, missing, or misleading.

If no match:

1. Solve normally.
2. If this is the second occurrence of that task/problem, add a new skill doc.

## File Contract

Create one file per repeated task:

```text
/docs/operations/skills/<kebab-case-task>.md
```

Required structure:

```md
# <Task Name>

<1-5 Korean sentences: purpose, symptoms, scope.>

> Status: Implemented | Proposed | Deprecated

## Trigger Signals
## Required Scan
## Same-Issue Criteria
## Fix Steps
## Verification
## Do Not
## Related Docs
```

Writing rules:

- Body language: English or compact machine-readable checklist.
- Prefer commands, paths, decision criteria, and concrete warnings.
- Keep theory out unless it prevents repeated mistakes.
- Link the new file from this README and a parent index.

## Skills

- [Git conflict clean worktree push](git-conflict-clean-worktree-push.md)
- [Juso popup return URL protocol](juso-popup-return-url-protocol.md)
- [MVP pre-expansion regression test runbook](mvp-pre-expansion-regression-tests.md)
- [OpenAI risk one-run verification](openai-risk-one-run-verification.md)
- [Testcontainers Colima socket](testcontainers-colima-socket.md)
- [Windows Maven incremental test compile](windows-maven-incremental-test-compile.md)
- [Windows PowerShell UTF-8 output scan](windows-powershell-utf8-output.md)

## Branch Portability

Skill docs must avoid branch-specific assumptions.

When this rule or a skill needs to apply to `dev` and unfinished branches:

1. Keep the change docs-only.
2. Avoid mixing it with feature, backend, frontend, or migration edits.
3. Prefer a small commit or patch that can be merged/cherry-picked cleanly.
4. If the current branch has unrelated uncommitted work, do not switch branches until that work is protected.
5. After applying to another branch, run `rg -n "/docs/operations/skills|Repeated-work" AGENTS.md docs/AGENTS.md docs` to confirm the rule exists there.

## Legacy Location

- Historical MR-message material still exists at [legacy docs/skills/README.md](/docs/skills/README.md).
- Do not add new reusable skills there.
- Migrate old material into task-specific files under this directory when it is touched again.

## Related Docs

- [Root README](/README.md)
- [Operations index](../README.md)
- [Root AGENTS.md](../../../AGENTS.md)
- [docs/AGENTS.md](../../AGENTS.md)
