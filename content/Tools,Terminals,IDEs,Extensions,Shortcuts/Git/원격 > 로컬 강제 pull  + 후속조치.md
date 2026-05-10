#### 1. 강제 pull
```bash
git fetch --all #원격의 모든 내용 업데이트. pull 아님. 실제 내 작업 파일을 바꾸지 않음. 원격의 브랜치정보(추가,삭제,변경,등)도 업데이트 됨.
git reset --hard origin/main #현재 로컬 브랜치를 원격 main(본인선택) 브랜치 상태로 강제로 맞춤. 커밋되지 않은 로컬 변경사항은 사라짐.
```
* *참고
	* *git fetch는 어떤 브랜치에서 해도 동일합니다.
	* *git reset --hard origin/main 에서 origin과 main이 뭔가요
		* *origin: 당신이 터미널에서 등록한 원격 레포의 별명 (clone하면 기본은 origin, 확인하려면 git remote -v)
		  main: 원격 저장소의 브랜치 이름.
	* *git pull 안하나요?
		* 위 두개 명령어를 하면 이미 로컬 브랜치가 origin/main 과 동일해짐.  따라서 바로 뒤에 git pull은 필요 없습니다. 
		 - git pull은 대략 fetch + merge/rebase 의 내용을 수행하기 때문입니다.

#### 2. 강제 pull했으면 내 로컬의 다른 내용들 지우기
- 강제 pull한 이유가 아마 로컬의 정보를 모두 덮어 씌우고 싶어서 일것 같습니다. 
-  `reset --hard`는 Git이 추적 중인 파일만 되돌리기 때문에 새로 만든 로컬 파일들은 삭제가 안됩니다. 
- 원격과 일치하지 않는 내용들 모두 삭제가 필요하면 아래처럼 하시면 돼요.
```bash
git clean -fdxn # 삭제할 항목 미리보기 (실제 삭제 X)
git clean -fd  # 삭제하기 (git이 추적하지 않는 파일과 폴더를 삭제함)
```
##### 2-1. 작업 폴더를 원격 저장소에서 막 clone한 것처럼 깨끗하게 만들고 싶을 때 (주의)
- - `.gitignore`에 등록된 파일까지 모두 삭제한다.  
- `node_modules`, `dist`, `build`, `.env` , 개인 설정 파일(`application-local.yml`류), 로컬 DB 파일, 업로드 테스트 파일, 직접 만든 임시 자료같은 파일도 삭제될 수 있으므로 매우 신중히 사용해야 함.

1. 빌드 결과물, 캐시, 의존성 파일 때문에 프로젝트가 꼬였을 때
2. node_modules, dist, target 등을 싹 지우고 처음부터 다시 설치/빌드하고 싶을 때
3. 다른 브랜치로 이동했는데 이전 브랜치의 생성 파일이 남아서 오류가 날 때
4. CI/CD 환경처럼 매번 깨끗한 상태에서 빌드해야 할 때
	
>	![info] 삭제될 내용 예시
>	node_modules/  
>	dist/  
>	build/  
>	target/  
>	.env  
>	*.log  
>	.idea/  
>	.DS_Store
 
```bash
- git clean -fdx
```
