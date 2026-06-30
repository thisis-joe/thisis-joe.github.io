---
title: juso-popup-return-url-protocol
created: 2026-07-01T00:06:00+09:00
updated: 2026-07-01T00:06:00+09:00
purpose: operations-skill
status: active
code_sync_required: true
related_area: juso, address-search, popup, callback
related_code: 
read_when: 
update_when: 
  - backend/src/main/java/com/zipon/controller/JusoAddressPopupController.java
  - backend/src/main/java/com/zipon/service/JusoAddressPopupPageRenderer.java
  - backend/src/main/java/com/zipon/config/JusoAddressProperties.java
  - frontend/src/utils/jusoAddressSearch.js
  - .env.example
  - Juso 팝업 returnUrl, callback, 0x16 0x03 Tomcat 오류를 해결할 때
  - Juso popup endpoint, callback URL 생성, 환경변수 이름이 바뀔 때
---

# Juso Popup Return URL Protocol

Juso 주소 팝업에서 주소를 선택한 직후 Tomcat이 `Invalid character found in method name [0x16...]` 오류를 내는 문제를 판별하고 복구한다.
이 증상은 CORS 오류처럼 보일 수 있지만, 대표 원인은 HTTPS 요청이 TLS가 설정되지 않은 HTTP-only Spring Boot 포트로 들어오는 프로토콜 불일치다.
이 문서는 ZIP:ON의 `JusoAddressPopupController`, `JusoAddressPopupPageRenderer`, 로컬 Vite/Spring Boot 개발 환경에 한정한다.

> Status: Implemented

## Trigger Signals

- Browser address popup opens, but selecting an address fails.
- Backend log contains:

```text
Error parsing HTTP request header
java.lang.IllegalArgumentException: Invalid character found in method name [0x160x030x01...
HTTP method names must be tokens
```

- The broken callback URL points to `https://localhost:8082/...`.
- Spring Boot is running with the normal local command:

```bash
cd backend
./mvnw spring-boot:run
```

- No `server.ssl.*` local TLS settings or HTTPS reverse proxy/tunnel is active for backend port `8082`.

## Required Scan

```bash
git status --short --branch
rg -n "juso-popup|returnUrl|scheme\\(\"https\"\\)|JUSO_|server.ssl|forward-headers|X-Forwarded" backend frontend docs .env.example
sed -n '1,120p' backend/src/main/java/com/zipon/controller/JusoAddressPopupController.java
sed -n '1,120p' backend/src/main/java/com/zipon/service/JusoAddressPopupPageRenderer.java
sed -n '1,120p' frontend/src/utils/jusoAddressSearch.js
```

If the backend is running, inspect the generated launch page without exposing keys in chat or docs:

```bash
curl -s 'http://localhost:8082/api/address-search/juso-popup?targetOrigin=http://localhost:5173&requestId=debug' \
  | rg 'returnUrl|addrLinkUrl'
```

Expected local HTTP-only callback:

```text
returnUrl value="http://localhost:8082/api/address-search/juso-popup/callback?targetOrigin=http://localhost:5173..."
```

Expected HTTPS proxy/tunnel callback:

```text
returnUrl value="https://<public-or-local-https-host>/api/address-search/juso-popup/callback?targetOrigin=..."
```

## Same-Issue Criteria

- Error bytes start with `0x16 0x03`, or the compact escaped form `0x160x030x01`.
- The callback request reaches Tomcat before controller code runs.
- Browser or Juso is calling an `https://...:8082` URL.
- Port `8082` is configured as plain HTTP, not HTTPS.
- The issue happens after address selection, not while opening ZIP:ON's first popup URL.

## Current Implementation

- `JusoAddressPopupController.openPopup(...)` calls `buildReturnUrl(...)`.
- Default behavior: build `returnUrl` from `request.getRequestURL()` plus `/callback`.
- Local default result: `http://localhost:8082/api/address-search/juso-popup/callback?...`.
- Optional override: `JusoAddressProperties.popupReturnOrigin`.
- Spring property: `zipon.external.juso.popup-return-origin`.
- Environment variable: `JUSO_POPUP_RETURN_ORIGIN`.
- `.env.example` keeps `JUSO_POPUP_RETURN_ORIGIN=` empty so local HTTP callbacks remain the default.
- If `popupReturnOrigin` is set, the controller uses that origin and replaces the path with the current request URI plus `/callback`.
- Tests:
  - `JusoAddressPopupControllerTest.openPopupUsesBackendConfiguredConfirmKeyAndRequestUrlAsDefaultReturnUrl`
  - `JusoAddressPopupControllerTest.openPopupUsesConfiguredReturnOriginWhenHttpsProxyOrTunnelIsReady`
  - `JusoAddressPropertiesTest.bindsJusoKeysOnBackendOnly`

## Fix Steps

1. Classify the protocol.
   - `0x16 0x03` means TLS handshake bytes reached an HTTP parser.
   - This is not fixed by adding CORS origins.
   - This is not fixed by changing only `targetOrigin`; `targetOrigin` is for `postMessage`, not for Juso's backend callback.

2. For normal local development, keep Juso `returnUrl` HTTP.
   - Do not hardcode `.scheme("https")` in `JusoAddressPopupController`.
   - Build `returnUrl` from the actual backend request URL.
   - Local callback should remain `http://localhost:8082/api/address-search/juso-popup/callback...`.

3. For HTTPS callback testing, make HTTPS real before generating an HTTPS URL.
   - Use a reverse proxy, tunnel, or Spring Boot `server.ssl.*`.
   - Verify the callback origin opens in the browser before using it with Juso.

```bash
curl -k -I https://localhost:8082/api/address-search/juso-popup
```

4. If a public HTTPS callback is needed while the local backend stays HTTP, use the explicit backend-owned return-origin property instead of forcing HTTPS globally.
   - Spring property: `zipon.external.juso.popup-return-origin=https://<tunnel-host>`
   - Environment variable: `JUSO_POPUP_RETURN_ORIGIN=https://<tunnel-host>`
   - Use this origin only when it is configured and reachable.
   - Keep the default empty so local HTTP works without TLS.
   - Do not set it to `https://localhost:8082` unless Spring Boot is actually serving TLS on port `8082`.

5. Keep the responsibilities separate.
   - `frontend/src/utils/jusoAddressSearch.js` opens ZIP:ON backend popup endpoint.
   - `JusoAddressPopupController` creates Juso `returnUrl`.
   - `JusoAddressPopupPageRenderer` posts selected address back to `targetOrigin`.
   - `targetOrigin=http://localhost:5173` can be correct even when the Juso `returnUrl` is HTTPS.

## Verification

Focused backend tests:

```bash
cd backend
./mvnw -Dtest=JusoAddressPropertiesTest,JusoAddressPopupControllerTest,JusoAddressPopupPageRendererTest,CorsIntegrationTest test
```

Full backend check after changing web configuration:

```bash
cd backend
./mvnw test
```

Manual local smoke:

```bash
curl -s 'http://localhost:8082/api/address-search/juso-popup?targetOrigin=http://localhost:5173&requestId=debug' \
  | rg 'returnUrl'
```

Manual HTTPS smoke, only when HTTPS is intentionally configured:

```bash
curl -k -I 'https://localhost:8082/api/address-search/juso-popup/callback?targetOrigin=http://localhost:5173&requestId=debug'
```

When using `JUSO_POPUP_RETURN_ORIGIN`, verify both the generated launch HTML and the configured origin:

```bash
JUSO_POPUP_RETURN_ORIGIN='https://zipon-local-tunnel.example.test'
curl -I "$JUSO_POPUP_RETURN_ORIGIN/api/address-search/juso-popup/callback"
curl -s 'http://localhost:8082/api/address-search/juso-popup?targetOrigin=http://localhost:5173&requestId=debug' \
  | rg 'returnUrl'
```

## Do Not

- Do not assume `https://localhost:8082` works just because `returnUrl` contains `https`.
- Do not fix `0x16 0x03` Tomcat parser errors by changing only CORS settings.
- Do not expose `JUSO_ADDRESS_CONFIRM_KEY` or `JUSO_ADDRESS_SEARCH_KEY` in docs, screenshots, curl output, or committed `.env`.
- Do not move Juso approval keys to the frontend.
- Do not treat Juso popup callback HTML as persisted address data; selected addresses are only submitted later through the risk diagnosis request.
- Do not make HTTPS the default `returnUrl` scheme without adding real backend TLS or a reachable HTTPS proxy.

## Related Docs

- [Detailed Juso CORS popup callback troubleshooting](../troubleshooting/juso-cors-popup-callback.md)
- [External API configuration](../../api/EXTERNAL_API_CONFIGURATION.md)
- [Juso address search API spec](../../api/external-api/specs/juso-address-search-api.md)
- [Address code flow](../../api/external-api/ADDRESS_CODE_FLOW.md)
- [Repeated Work Skills](Blog/posts/Projects/ZIP.ON/docs/operations/skills/README.md)
