---
title: git-conflict-clean-worktree-push
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-28T05:00:06+09:00
purpose: operations-skill
status: active
code_sync_required: false
related_area: git, branch, conflict, push
read_when: 
do_not_use_as: 
  - dirty worktree, branch mismatch, MR conflict 상태에서 안전하게 push 준비가 필요할 때
  - 현재 브랜치 상태의 증거
  - destructive cleanup 허가
---

# Git Conflict Clean Worktree Push

현재 작업트리에 다른 기능 변경, 미해결 충돌, 브랜치 불일치가 섞여 있을 때 기능 단위 커밋과 푸시를 안전하게 분리하는 절차다.
증상은 `git switch`가 untracked/modified 파일 때문에 막히거나, MR에서 conflict가 나거나, 원래 의도와 다른 브랜치에 변경이 올라갈 위험이 보일 때다.
핵심은 사용자 작업을 건드리지 않고 별도 clean worktree에서 필요한 변경만 재현하거나 가져와 검증한 뒤 푸시하는 것이다.

> Status: Implemented

현재 ZIP:ON repository에서는 Bash를 기본 shell로 사용한다. 아래 PowerShell 예시는 Windows 작업 기록을 포함하므로, macOS/Linux 또는 Codex 기본 작업에서는 같은 의미의 Bash 명령으로 바꾸어 실행한다.

## Trigger Signals

- User asks: "충돌 해결하고 다시 푸시", "푸시", "MR conflict".
- `git status --short` shows `UU`, many unrelated modified files, or untracked files that belong to another task.
- `git switch <branch>` fails with:
  - `Your local changes ... would be overwritten by checkout`
  - `untracked working tree files would be overwritten by checkout`
- Current branch name does not match the task being pushed.
- A branch already contains unrelated commits, so pushing more work there would mix feature scopes.
- A patch file created through PowerShell loses line breaks or gains BOM, causing `git apply` errors such as `No valid patches in input` or `corrupt patch`.

## Required Scan

```powershell
git branch --show-current
git status --short
git remote -v
git log --oneline --decorate --max-count=8
git branch --all --list "*<keyword>*"
git diff --name-only
```

When an MR says it conflicts with `master`:

```powershell
git fetch origin
git status -sb
git log --oneline origin/master..HEAD
git log --oneline HEAD..origin/master
```

Before committing secrets/config work:

```powershell
rg -n "devU01|VITE_JUSO|OPENAI_API_KEY=.*[^=]|SERVICE_KEY=.*[^=]" .env.example README.md backend frontend docs -S
git status --short --ignored .env
```

## Same-Issue Criteria

Treat as this same workflow when all are true:

- The requested change is small or feature-scoped.
- The current workspace has unrelated changes, conflicts, or branch mismatch.
- The user wants a push/MR-ready branch, not just local experimentation.
- The safe action is to protect existing user work and prepare a clean branch elsewhere.

## Fix Steps

1. Identify the intended scope and branch.

```powershell
git branch --show-current
git status --short
```

If the current branch is wrong or dirty, do not use destructive cleanup. Do not run `git reset --hard`.

2. Create a clean worktree from the real target base.

```powershell
git fetch origin
$worktree = "C:\SSAFY\joseph\workspaces\zipon-<task>-push"
git worktree add -b codex/<task-branch> $worktree origin/master
```

Use a new branch when the existing remote branch already contains unrelated commits.

3. Reapply only the intended change.

Preferred options:

- Recreate the small change manually with `apply_patch`.
- Cherry-pick a known clean commit.
- Use `git diff -- <specific-files>` only when the source worktree contains no unrelated hunks in those files.

Avoid saving patch output with PowerShell `Set-Content` unless you preserve line breaks and encoding carefully. Bad patch files may collapse diff lines and fail with `No valid patches in input`.

4. If reusing an existing branch, rebase onto latest master.

```powershell
git fetch origin
git rebase origin/master
```

Resolve conflicts by preserving both current master behavior and the task-specific change. Then:

```powershell
rg -n "<<<<<<<|=======|>>>>>>>" <conflicted-files>
git add <resolved-files>
git rebase --continue
```

If the rebase drops the commit because the change is already in `origin/master`, check:

```powershell
git diff --stat origin/master..HEAD
git status -sb
```

Do not push an empty MR branch unless the goal is only to close/refresh the stale conflict state.

5. Verify from the clean worktree.

Run the smallest checks for the touched behavior:

```powershell
cd backend
.\mvnw.cmd "-Dtest=<FocusedTest1>,<FocusedTest2>" test
```

For frontend behavior:

```powershell
cd frontend
npm ci
npm run build
```

Run a final secret scan for config work:

```powershell
rg -n "<real-secret-prefix>|VITE_<removed-secret>|SERVICE_KEY=.*[^=]" .env.example README.md backend frontend docs -S
```

6. Commit only the clean worktree changes.

```powershell
git status --short
git diff --check
git add <intended-files>
git diff --cached --stat
git commit -m "config: move Juso keys to backend"
```

7. Push.

For a new branch:

```powershell
git push -u origin codex/<task-branch>
```

For a rebased existing branch:

```powershell
git push --force-with-lease origin codex/<task-branch>
```

Use `--force-with-lease`, not plain `--force`.

## Verification

- `git status --short` is clean in the push worktree.
- `git status -sb` shows no unexpected behind/ahead state after push.
- `git diff --stat origin/master..HEAD` contains only the intended scope.
- Focused backend/frontend checks pass.
- Secret scan finds no real keys in committed files.
- The original dirty/conflicted workspace still has the user's work intact.

## Do Not

- Do not run `git reset --hard` in the user's dirty workspace.
- Do not delete or move untracked files from another task to make branch switching easier.
- Do not commit `.env` or real API keys.
- Do not mix unrelated docs, backend, frontend, migration, and feature changes just because they are in the same working tree.
- Do not push to a branch that already contains unrelated commits when a clean branch is cheaper.
- Do not assume `git rebase` succeeded just because conflicts are gone; inspect `git log`, `git status -sb`, and `git diff origin/master..HEAD`.

## Related Docs

- [Repeated Work Skills](README.md)
- [Operations Docs](../README.md)
- [Root AGENTS.md](../../../AGENTS.md)
- [docs/AGENTS.md](../../AGENTS.md)
