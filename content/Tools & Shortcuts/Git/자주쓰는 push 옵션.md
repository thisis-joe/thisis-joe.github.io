---
title: "자주쓰는 push 옵션"
created: 2026-05-11T01:18:20+09:00
updated: 2026-05-14T00:02:29+09:00
---

### -u
```bash
git push -u repoNickname branchName 
```
-   `--set-upstream`과 같음

### --force-with-lease
```bash
git push --force-with-lease origin feature/login
```
- 강제 push이긴 하지만, 원격 브랜치가 내가 마지막으로 본 상태와 같을 때만 덮어씀.  
- 다른 사람이 그 사이에 push한 내용이 있으면 실패함. ( `--force`보다 안전)

### --delete
```bash
git checkout main
git pull origin main

git push --delete origin feature/login
git branch -d feature/login # d 는 branch의 옵션
```
- 원격 브랜치 삭제 (push의 옵션임.)
- 팀 규칙에 따라 마음대로 원격 브랜치를 삭제하면 안될 때도 있음.
- 설명
	- 하나의 브랜치 작업이 끝나고 main에 merge됐다면 해당 브랜치 역할은 끝난 것이다.
	- 다른 사람이 그 브랜치를 이어 작업할 일 이 없으면 정리해도 된다.
	- 이때, 브랜치는 같은 이름이라도 로컬과 원격에 각각 존재하는 것이라서 각각 지워줘야 한다.
	- 현재 사용 중인 브랜치는 제거 못하므로 main과 같은 다른 브랜치에서 진행