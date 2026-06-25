---
title: testcontainers-colima-socket
created: 2026-06-26T05:00:07+09:00
updated: 2026-06-26T05:00:07+09:00
purpose: operations-skill
status: active
code_sync_required: false
related_area: testcontainers, colima, docker, macos
read_when: 
do_not_use_as: 
  - macOS Colima 환경에서 Testcontainers가 Docker daemon을 찾지 못할 때
  - CI 환경 설정 명세
  - repository 코드 구현 명세
---

# Testcontainers Colima Socket

macOS에서 Docker Desktop 없이 Colima를 사용할 때 Testcontainers가 Docker daemon을 찾지 못하는 문제를 해결한다.
대표 증상은 `Could not find a valid Docker environment`, `/var/run/docker.sock` 없음, 또는 Docker API client version 오류다.
이 문서는 ZIP:ON backend integration test와 Testcontainers MySQL 실행에 한정한다.

> Status: Implemented

## Trigger Signals

- `./mvnw test` or `./mvnw -Dtest=ZipOnApplicationTests test` fails.
- Log contains `Could not find a valid Docker environment`.
- Log contains `NoSuchFileException (/var/run/docker.sock)`.
- `docker context ls` shows `colima *`.
- Testcontainers logs do not show `Resolved dockerHost=unix://.../.colima/default/docker.sock`.

## Required Scan

```bash
java -version
docker context ls
docker info --format '{{.ServerVersion}} {{.OperatingSystem}}'
docker compose version
ls -la ~/.colima/default/docker.sock /var/run/docker.sock 2>&1 || true
[ -f ~/.testcontainers.properties ] && cat ~/.testcontainers.properties || true
```

## Same-Issue Criteria

- macOS local development.
- Docker Desktop is not the active runtime.
- Colima socket exists under `~/.colima/default/docker.sock`.
- Maven test profile uses Testcontainers MySQL through `application-test.yml`.

## Fix Steps

```bash
brew install colima docker docker-compose
colima start --cpu 2 --memory 4 --disk 20
docker context use colima
printf 'docker.host=unix://%s/.colima/default/docker.sock\n' "$HOME" > ~/.testcontainers.properties
grep -qxF 'export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE="/var/run/docker.sock"' ~/.zprofile || echo 'export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE="/var/run/docker.sock"' >> ~/.zprofile
grep -qxF 'export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE="/var/run/docker.sock"' ~/.zshrc || echo 'export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE="/var/run/docker.sock"' >> ~/.zshrc
```

If `docker compose version` cannot find the Compose plugin, merge this into `~/.docker/config.json`.

```json
{
  "cliPluginsExtraDirs": [
    "/opt/homebrew/lib/docker/cli-plugins"
  ]
}
```

If logs show Docker API minimum-version errors, verify the Testcontainers BOM and artifact names.

```bash
cd backend
./mvnw dependency:tree -Dincludes=org.testcontainers,com.github.docker-java -DskipTests
```

Expected ZIP:ON baseline:

```text
org.testcontainers:testcontainers-*:2.0.5
com.github.docker-java:docker-java-api:3.7.1
```

## Verification

```bash
cd backend
./mvnw -Dtest=ZipOnApplicationTests test
./mvnw test
```

Passing logs should include:

```text
Resolved dockerHost=unix:///Users/<user>/.colima/default/docker.sock
Connected to docker
Successfully applied 19 migrations
```

## Do Not

- Do not add Docker socket paths to repository source files with a user-specific absolute path.
- Do not disable Ryuk as the first fix.
- Do not switch tests back to H2 to avoid Docker.
- Do not add JPA/Hibernate dependencies while fixing MyBatis/Testcontainers failures.

## Related Docs

- [Local setup](../LOCAL_SETUP.md)
- [Docker MySQL Redis](../DOCKER_MYSQL_REDIS.md)
- [Repeated Work Skills](README.md)
