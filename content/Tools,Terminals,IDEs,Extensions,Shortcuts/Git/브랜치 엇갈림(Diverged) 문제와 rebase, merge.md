---
title: 브랜치 엇갈림(Diverged) 문제와 rebase, merge
created: 2026-05-11T02:02:29+09:00
updated: 2026-05-11T02:02:29+09:00
---

### Diverged?
- 먼저, git은 브랜치별로 히스토리를 관리한다고 볼 수 있다. 
- 그런데, 같은 브랜치에 대해서 로컬 브랜치와 원격 브랜치가 서로 다른 새 커밋을 가지고 있어 히스토리가 갈라진 상태를 말한다.   

- 예시
	- 누군가 main에서 커밋해버렸을 때 상황.
```text  
              B     ← origin/main, 1번 local main (1번 사람이 main 수정 후 커밋. push까지 함.)
            /   
A(원격 main) - C     ← local/main (2번사람이 main 수정 후 커밋함.)
            \  
              A     ← local main (3번은 main 안 건듬)
``` 
- 1번은 push가 문제 없이 됨.
- 2번은 push 할 때 오류남.  (원격에는 이미 B가 있는데, 2번 로컬에는 B가 없기 때문)
```bash
! [rejected] main -> main (fetch first)  
error: failed to push some refs  
hint: Updates were rejected because the remote contains work that you do not have locally.
```
- 2번은 곤란해졌다. 본인 코드/파일도 살려야 한다. 
  
  원격 변경사항 B를 가져와서 자기 커밋 C와 합쳐야 하는데, 어떻게 해야 할까?
   2가지 방법이 있다. rebase, merge.
	- **방법 1. rebase**
		- rebase 는 A - B - C' 순서대로 히스토리를 정렬하는 것이다.
			- 커밋 C를 잠시 떼어내고,  원격 커밋 B를 먼저 가져온 뒤,  B 뒤에 커밋 C를 다시 적용한다. (C'는 새 커밋임.)
		- 상황
			- 커밋 이후 수정한 것이 없을 때. (커밋하지 않은 수정사항이 남아 있으면 rebase가 막힐 수 있다.)
			- 또는 커밋 B와 커밋 C 가 서로 다른 파일/코드만 수정했을때. 
		```bash
			git pull --rebase origin main # 원격 커밋 뒤에 내 커밋을 일렬로 재배치
			git push origin main
		```
		- 상황
			- 커밋하지 않은 수정사항이 있을 때 (커밋하긴 애매한 작업 상태인데 rebase는 해야할 때)
		```bash
			git stash                     # 내 로컬의 아직 커밋 하지 않은 작업 파일 변경사항을 잠깐 치워둠.
			git pull --rebase origin main # 원격 커밋 뒤에 내 커밋을 일렬로 재배치
			git stash pop                 # 임시 저장한 수정사항 다시 적용
			git push origin main
		```
		- 상황 
			- rebase 명령어 실행 후 충돌이 발생했을 때.
		```bash
			# 충돌 파일 직접 수정  
			git add .  
			git rebase --continue
		```
		- 결과 
			- rebase 후 git에서 바라보는 커밋 히스토리 형태
		```
			 A - B - C'
		```
	- **방법 2. merge**
		- merge를하면, 2번은 B 커밋과 C 커밋을 **합친 새 커밋을 만들게 된다**.
		- 상황 
			- 충돌이 없을 때 : merge commit이 자동 생성되므로  바로 push 
		```bash
			git pull --no-rebase origin main
			git push
		```
		- 상황 
			- 충돌이 있다면 해결 후 push 
		```bash
			git pull --no-rebase origin main
			# 충돒 파일 수정
			git add .  
			git commit -m "merge 햇어요"
			git push
		```
		- 결과 : merge 후 git에서 바라보는 커밋 히스토리 형태
		```
				 B
			   /   \
			  A     D
			   \   / 
				 C
		```
