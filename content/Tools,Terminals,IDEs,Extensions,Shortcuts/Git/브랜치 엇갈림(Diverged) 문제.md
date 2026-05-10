### Diverged?
- 먼저, git은 브랜치별로 히스토리를 관리한다고 볼 수 있다. 
- 그런데, 같은 브랜치에 대해서 로컬 브랜치와 원격 브랜치가 서로 다른 새 커밋을 가지고 있어 히스토리가 갈라진 상태를 말한다.  
- 

- 예시
	- 누군가 main에서 커밋해버렸을 때 상황.
```text  
              B     ← origin/main  (1번사람이 main 수정 후 커밋. push까지 함.)
            /   
A(원격 main) - C     ← origin/main (2번사람이 main 수정 후 커밋함.)
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
	- 원격 변경사항 B를 가져와서 자기 커밋 C와 합쳐야 하는데, 어떻게 해야 할까?
	- 2가지 방법이 있다. rebase, merge
	- 방법 1. rebase
		- rebase 하면  A - B - C' 순서대로 정렬된다.
		- 커밋 C를 잠시 떼어내고,  원격 커밋 B를 먼저 가져온 뒤,  B 뒤에 커밋 C를 다시 적용한다. (C'는 새 커밋임.)
		```bash
			git pull --rebase origin main
			git push origin main
		```
		- 커밋 B와 커밋 C 가 서로 다른 ㅍ
- 방법 2. merge

```
git pull --no-rebase origin main
```

결과:


```

### 해결
- **임시 저장:** `git stash` (내 로컬의 커밋들을 잠시 치워둠)
- **강제 병합:** `git pull --rebase origin main` (원격 커밋 뒤에 내 커밋을 일렬로 재배치)
- **작업 복구:** `git stash pop` (치워뒀던 코드를 다시 가져와 작업 재개)

#### **`stash pop`에서 충돌이 났다면?**
###### **1. 충돌이 안 나는 경우**
- **원격(Remote)에서 받아온 코드**와 **내가 수정 중이던 코드**가 서로 **다른 줄(Line)**을 건드렸을 때.
- Git이 알아서 "아, 여기는 원격 코드를 넣고 저기는 네 코드를 넣으면 되겠네!" 하고 자동으로 합쳐줍니다.
    
###### **2. 충돌이 나는 경우**
- **원격에서 받아온 코드**와 **내가 수정 중이던 코드**가 **같은 위치(같은 줄)**를 수정했을 때.
- Git은 어느 쪽 코드가 맞는지 판단할 수 없으므로 `CONFLICT` 메시지를 띄우며 멈춥니다.

당황하지 마시고 아래 순서로 해결하세요.
1. **파일 열기:** IDE(VS Code 등)에서 해당 파일을 열면 `<<<<HEAD`와 `====`, `>>>>` 표시가 보입니다.
2. **코드 선택:** 내가 쓴 코드와 원격에서 온 코드 중 남길 것을 선택하고 특수 기호(`<<<<`, `====` 등)를 지웁니다.
3. **마무리:** git add . # (이미 rebase가 끝난 상태라면 여기서 다시 커밋하거나 계속 작업하면 됩니다)