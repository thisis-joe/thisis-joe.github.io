---
title: "로컬에서 merge하는 경우"
created: 2026-05-11T01:18:20+09:00
updated: 2026-05-14T00:02:29+09:00
---

### 1. 개인 프로젝트에서 기능 브랜치를 main에 합칠 때
```bash
git checkout main
git merge feature/login
git push origin main
```
- 협업에서 `main/master`에 직접 merge해서 원격에 push하는 일은 없지만,
  로컬에선 혼자 작업하는 프로젝트면 PR 없이 로컬에서 합쳐도 됨
---
### 2. 작업 브랜치에 최신 main 내용을 가져올 때
```bash
git checkout feature/login
git fetch origin
git merge origin/main
```
- 내 작업 브랜치에 최신 main을 가져오는 merge
---
### 3. 충돌을 미리 해결해보기 위해
```bash
git checkout feature/login
git merge origin/main
```
- PR 올리기 전에 내 브랜치가 최신 `main`과 충돌나는지 확인할 수 있음.
- 충돌이 나면 로컬에서 해결하고 커밋한 뒤 다시 push.

```bash
git add .
git commit -m "Resolve merge conflict with main"
git push
```
-  PR에서 충돌이 줄어들어서 좋음!
---
### 4. 테스트용 브랜치끼리 합칠 때
```bash
git checkout test/integration
git merge feature/login
git merge feature/payment
```
- 예를 들어 `feature/login`과 `feature/payment`을 같이 붙여서 테스트하고 싶을 때.
- **임시 브랜치** 만들어서 하고 **꼭 지우자!**