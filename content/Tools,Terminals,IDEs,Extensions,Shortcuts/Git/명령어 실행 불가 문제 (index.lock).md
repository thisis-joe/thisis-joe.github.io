---
title: "명령어 실행 불가 문제 (index.lock)"
created: 2026-05-11T00:18:17+09:00
updated: 2026-05-11T03:26:56+09:00
---

#### 원인
- Git 명령어가 비정상적으로 종료되거나 강제 실행하려고 할때, `.git/index.lock` 파일이 남아 있을 수 있음.
- 이 상태에서는 Git이 아직 작업 중이라고 판단해서 `commit`, `pull`, `reset` 같은 명령어가 실패할 수 있음.

#### 에러
```bash
fatal: Unable to create '.git/index.lock': File exists.  
  
Another git process seems to be running in this repository,  
e.g. an editor opened by 'git commit'. Please make sure all processes  
are terminated then try again. If it still fails, a git process  
may have crashed in this repository earlier:  
remove the file manually to continue.
```

#### 해결
- 해당 파일을 지우면 됨. 단, **현재 다른 Git 명령어가 실행 중이지 않은 것이 확실할 때만** 삭제해야 함.
- 에디터의 Git 기능, SourceTree, GitHub Desktop, VS Code의 소스 제어 기능이 아직 작업 중일 수도 있으므로 확인 후 진행
```bash
rm -f .git/index.lock
```