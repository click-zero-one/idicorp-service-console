# Test Report â€” IDICorp Service Console
## Evidence-Based Implementation and Echo WebSocket Investigation

- **Project:** IDICorp Service Console
- **Report type:** Implementation verification and diagnostic investigation
- **Primary issue:** Echo WebSocket connection failure
- **Status:** Echo handshake failure reproduced; root cause not confirmed
**Repository issue:** [Issue #8 â€” WebSocket Echo endpoint fails to establish a connection](https://github.com/mtrshirazi21/idicorp-frontend-challenge/issues/8)

---

## 1. Executive Summary

This report documents the implementation checks and diagnostic investigation performed for the IDICorp frontend challenge, with particular emphasis on the Text Echo WebSocket endpoint.

The investigation was extended beyond the React interface to distinguish a frontend-specific failure from a failure occurring during the WebSocket connection handshake.

The key observed results are:

- The Vite production build completed successfully.
- Oxlint completed without reported lint errors in the previously recorded run, although warnings remained.
- The documented authentication, task-management, and Calculator readiness scenarios were reported as successfully exercised.
- A direct browser test of the Echo WebSocket failed before the `open` event and subsequently reported close code `1006`.
- A direct Node.js WebSocket test against Echo also failed.
- A raw TLS-based HTTP Upgrade request to `/ws/echo`, without an `Origin` header, received `HTTP/1.1 403 Forbidden` from a response identifying `nginx` as the server.
- The same raw handshake technique against `/ws/calculator` received `HTTP/1.1 101 Switching Protocols`.

The Echo-versus-Calculator comparison is the strongest diagnostic finding currently available. It demonstrates that the two paths behaved differently under the recorded handshake tests.

It does **not** identify the exact configuration, access rule, upstream service, or application condition responsible for the Echo rejection. Server-side logs and deployment configuration are not available in the current test record.

The implementation and report therefore distinguish verified observations from hypotheses. No specific root cause is claimed as confirmed.

## 2. Scope and Objectives

The investigation covered:

1. Production build verification.
2. Static lint checks.
3. Previously exercised authentication and task-management flows.
4. Calculator WebSocket connection readiness.
5. Echo WebSocket connection establishment.
6. Direct testing outside the React interface.
7. Comparison of HTTP Upgrade responses from Echo and Calculator.
8. Documentation of remaining uncertainty and recommended follow-up actions.

The purpose was to continue implementation as requested by the challenge maintainer, investigate the Echo failure further, and prepare a technically defensible final submission.

### Out of scope

The available test record does not establish:

- Access to the production Nginx configuration.
- Access to Echo or Calculator backend logs.
- Access to infrastructure or reverse-proxy deployment settings.
- Exhaustive testing of all API inputs, authorization states, or network environments.
- Successful end-to-end Echo message exchange.
- A confirmed root cause for the Echo failure.

## 3. Environment and Test Methodology

The recorded direct diagnostic tests used Node.js on Windows PowerShell.

Recorded Node.js environment check:

```powershell
node -e "console.log('Node:', process.version); try { console.log('WebSocket:', typeof WebSocket) } catch (e) { console.log(e.message) }"
```

Observed output:

```text
Node: v26.2.0
WebSocket: function
```

This confirms that the runtime provided a built-in WebSocket implementation for direct testing.

The investigation used two different testing approaches:

- A WebSocket client test to observe connection events.
- A raw TLS socket that manually sent an HTTP WebSocket Upgrade request and printed the server's initial HTTP response.

The raw handshake tests used the same hostname, TLS port, and Upgrade headers for both endpoints. Neither raw handshake included an `Origin` header.

This comparison controls for several client-side variables, but it does not guarantee that all server-side conditions were identical. For example, the endpoints may have different routing, authorization, or backend policies.

## 4. Production Build and Static Analysis

### 4.1 Final production build

**Result: Passed**

The final production build was rerun after the latest source and lint-script changes.

Recorded output:

vite v8.3.5 building client environment for production...
36 modules transformed.
computing gzip size...
dist/index.html                   0.47 kB â”‚ gzip:  0.30 kB
dist/assets/index-BOkgafo-.css   22.84 kB â”‚ gzip:  4.42 kB
dist/assets/index-CIPuzdG_.js   250.49 kB â”‚ gzip: 77.41 kB
built in 161ms

The build completed without reported build errors. This verifies production compilation, but does not establish that external services or every runtime flow work correctly.

### 4.2 Final lint check

**Result: Completed with warnings; zero errors**

The final lint command is configured as:

```powershell
npm run lint
```

The `package.json` script invokes Oxlint against the main application source:

```json
"lint": "oxlint src"
```

The latest recorded run finished with **2 warnings and 0 errors**, scanning 15 files.

The remaining warnings are both `react(set-state-in-effect)` warnings:

- `src/components/LoginForm/LoginForm.jsx`: `loadCaptcha()` is called from a `useEffect`.
- `src/components/TaskManager/TaskManager.jsx`: `loadTasks()` is called from a `useEffect`.

The previous EchoPanel dependency warning no longer appears in the latest lint output. Backup files are no longer included in this lint run because the lint script targets `src`.

These warnings have not been suppressed. Their impact should be assessed against the actual CAPTCHA and task-loading behavior before making further code changes.

The successful build and zero-error lint result do not resolve the external Echo WebSocket failure documented in the following sections.

## 5. Authentication and Task Management

The existing report records the following scenarios as exercised successfully during development:

| Area | Recorded result |
|---|---|
| Login and CAPTCHA flow | Tested successfully |
| Task listing | Tested successfully |
| Task search | Tested successfully |
| Completion-status filtering | Tested successfully |
| Task CRUD operations | Tested successfully |

These entries reflect the previously documented development tests. The current report does not include complete request/response logs or exhaustive test cases for these flows.

They should therefore be interpreted as recorded scenario outcomes, not a claim of complete functional or security coverage.

## 6. Calculator WebSocket

**Recorded result: Connection readiness confirmed in a prior test**

Endpoint:

```text
wss://ts.idicorp.ir/ws/calculator
```

The existing test report records that a connection using a valid access token reached the ready state and received:

```json
{"type":"ready"}
```

A separate raw handshake test was later performed without an `Origin` header.

### Raw handshake request

The following Node.js code was used to send an HTTP Upgrade request over TLS:

```javascript
const tls = require("node:tls");
const crypto = require("node:crypto");

const socket = tls.connect(443, "ts.idicorp.ir", () => {
  const key = crypto.randomBytes(16).toString("base64");

  socket.write(
    "GET /ws/calculator HTTP/1.1\r\n" +
    "Host: ts.idicorp.ir\r\n" +
    "Upgrade: websocket\r\n" +
    "Connection: Upgrade\r\n" +
    `Sec-WebSocket-Key: ${key}\r\n` +
    "Sec-WebSocket-Version: 13\r\n\r\n"
  );
});

socket.setTimeout(8000);
socket.on("data", (data) => {
  console.log(data.toString("utf8"));
  socket.destroy();
});
socket.on("timeout", () => {
  console.log("TIMEOUT");
  socket.destroy();
});
socket.on("error", (err) => console.log("TLS ERROR:", err.message));
```

### Observed response

```text
HTTP/1.1 101 Switching Protocols
Server: nginx
Connection: upgrade
Upgrade: websocket
Sec-WebSocket-Accept: WyjtuyIiocCMOK3hZA6lSrKIEi0=
```

Other security-related response headers were also returned.

### Interpretation

`101 Switching Protocols` is the expected HTTP status for a successful WebSocket protocol upgrade. This confirms that the Calculator path accepted this handshake request.

The raw handshake test did not send an authentication token and did not verify Calculator message processing. The separate earlier test with a valid token is the evidence for the recorded ready message.

The raw handshake and authenticated readiness test establish different things and should not be conflated.

## 7. Text Echo WebSocket

**Current diagnostic status: Handshake rejection reproduced; root cause unresolved**

Endpoint:

```text
wss://ts.idicorp.ir/ws/echo
```

### 7.1 Expected behavior

According to the challenge specification recorded during implementation, a successful Echo connection should send a ready message and then echo text messages on the same connection.

A complete functional test would need to verify:

1. The connection opens.
2. The server sends its expected ready message.
3. A client sends a text message.
4. The server returns the expected echoed message.
5. Multiple messages can be exchanged on the same connection.
6. Error and reconnect behavior are handled appropriately.

The current evidence does not establish that these Echo behaviors were reached successfully.

### 7.2 Browser test

The recorded direct browser test, performed outside the React interface, showed:

- The WebSocket failed before the `open` event.
- The browser subsequently reported close code `1006`.
- No successful Echo message exchange was performed.

Close code `1006` is a local abnormal-closure indication. It does not, by itself, identify the underlying reason the connection failed.

This test showed that the failure was not limited to the React component in that environment.

### 7.3 Direct Node.js WebSocket test

A direct Node.js WebSocket test against Echo also failed. The recorded result was an error followed by:

```text
CLOSE: 1006 (no reason) clean:false
```

The corresponding direct Calculator WebSocket test reached the `open` event.

This independently reproduced the different connection outcomes outside the React interface.

The Node.js WebSocket client's failure event does not expose the full HTTP response in every case. For that reason, the raw handshake tests below were used to obtain the initial HTTP status directly.

## 8. Raw HTTP Upgrade Handshake Investigation

### 8.1 Purpose

The raw handshake tests were designed to obtain the HTTP status returned when requesting a WebSocket upgrade, rather than relying solely on a browser's generic connection error or abnormal-close code.

Both tests used:

- TLS to `ts.idicorp.ir` on port `443`.
- HTTP method `GET`.
- The endpoint path under investigation.
- `Upgrade: websocket`.
- `Connection: Upgrade`.
- A newly generated `Sec-WebSocket-Key`.
- `Sec-WebSocket-Version: 13`.
- No `Origin` header.

### 8.2 Echo request

The test used the following PowerShell invocation:

```powershell
@'
const tls = require("node:tls");
const crypto = require("node:crypto");

const socket = tls.connect(443, "ts.idicorp.ir", () => {
  const key = crypto.randomBytes(16).toString("base64");

  socket.write(
    "GET /ws/echo HTTP/1.1\r\n" +
    "Host: ts.idicorp.ir\r\n" +
    "Upgrade: websocket\r\n" +
    "Connection: Upgrade\r\n" +
    `Sec-WebSocket-Key: ${key}\r\n` +
    "Sec-WebSocket-Version: 13\r\n" +
    "\r\n"
  );
});

socket.setTimeout(8000);

socket.on("data", (data) => {
  console.log(data.toString("utf8"));
  socket.end();
});

socket.on("timeout", () => {
  console.log("TIMEOUT: no handshake response within 8 seconds");
  socket.destroy();
});

socket.on("error", (err) => {
  console.log("TLS ERROR:", err.message);
});
'@ | node
```

### 8.3 Echo response

Observed response:

```text
HTTP/1.1 403 Forbidden
Server: nginx
Content-Type: text/plain; charset=utf-8
Content-Length: 0
Connection: keep-alive
```

The response also included common security headers, including HSTS and frame/content-type protection headers.

The recorded server date was:

```text
Thu, 29 Oct 2026 16:03:52 GMT
```

### 8.4 Calculator request

The same technique was used with the path changed to `/ws/calculator`:

```powershell
@'
const tls = require("node:tls");
const crypto = require("node:crypto");

const socket = tls.connect(443, "ts.idicorp.ir", () => {
  const key = crypto.randomBytes(16).toString("base64");

  socket.write(
    "GET /ws/calculator HTTP/1.1\r\n" +
    "Host: ts.idicorp.ir\r\n" +
    "Upgrade: websocket\r\n" +
    "Connection: Upgrade\r\n" +
    `Sec-WebSocket-Key: ${key}\r\n` +
    "Sec-WebSocket-Version: 13\r\n\r\n"
  );
});

socket.setTimeout(8000);
socket.on("data", (data) => {
  console.log(data.toString("utf8"));
  socket.destroy();
});
socket.on("timeout", () => {
  console.log("TIMEOUT");
  socket.destroy();
});
socket.on("error", (err) => console.log("TLS ERROR:", err.message));
'@ | node
```

### 8.5 Calculator response

Observed response:

```text
HTTP/1.1 101 Switching Protocols
Server: nginx
Connection: upgrade
Upgrade: websocket
Sec-WebSocket-Accept: WyjtuyIiocCMOK3hZA6lSrKIEi0=
```

The recorded server date was:

```text
Thu, 29 Oct 2026 16:05:24 GMT
```

### 8.6 Direct comparison

| Property | Echo | Calculator |
|---|---|---|
| Host | `ts.idicorp.ir` | `ts.idicorp.ir` |
| Port | 443 over TLS | 443 over TLS |
| Requested path | `/ws/echo` | `/ws/calculator` |
| HTTP method | GET | GET |
| WebSocket Upgrade headers | Present | Present |
| `Origin` header | Absent | Absent |
| Response server header | `nginx` | `nginx` |
| HTTP status | `403 Forbidden` | `101 Switching Protocols` |
| Upgrade accepted | No | Yes |

The comparison provides direct evidence that the tested endpoints responded differently to equivalent raw handshake methods.

It does not establish whether the difference originates in Nginx routing, an access-control rule, an upstream service, application middleware, or another endpoint-specific condition.

### 8.7 Protocol limitation

The raw test manually sends an HTTP Upgrade request and prints the initial response. It is useful for determining the initial HTTP status.

It is not a complete WebSocket protocol client: it does not validate `Sec-WebSocket-Accept`, maintain the upgraded connection, decode WebSocket frames, or exchange application messages.

Consequently, the `101` result establishes that the Calculator handshake was accepted, but the raw test itself does not establish that the Calculator application protocol works after the upgrade. Likewise, the `403` result establishes rejection of the Echo handshake request, but does not identify the component or rule that made the rejection decision.

## 9. Earlier HTTP Checks and Their Limitations

Earlier investigation included these additional checks:

### 9.1 Plain HTTP GET to the Echo path

A normal HTTP GET to:

```text
https://ts.idicorp.ir/ws/echo
```

returned:

```text
404 Not Found
```

This was not a WebSocket Upgrade request. A normal HTTP GET is not equivalent to a WebSocket handshake, so this response does not establish that the WebSocket endpoint itself is unavailable.

### 9.2 Simulated `curl` Upgrade requests

Earlier simulated Upgrade requests using `curl` returned HTTP `403` with both of these Origin values:

```text
http://localhost:5173
https://ts.idicorp.ir
```

Those requests were not full WebSocket-client tests. They provide supplementary evidence that the simulated requests were rejected, but should not be used alone to draw conclusions about browser Origin validation or WebSocket protocol behavior.

### 9.3 Artificial CORS preflight

An earlier artificial OPTIONS preflight using WebSocket-related headers returned a `400` response referring to disallowed CORS headers.

A WebSocket handshake is not equivalent to a standard browser CORS preflight. This artificial preflight does not establish that CORS is the cause of the Echo failure.

### 9.4 Authenticated HTTP streaming endpoint

An earlier unauthenticated request to:

```text
POST https://ts.idicorp.ir/api/echo/stream
```

returned:

```text
401 Unauthorized
```

This is a separate HTTP streaming endpoint. Its authorization behavior cannot be treated as proof that the WebSocket endpoint `/ws/echo` requires the same authentication or fails for the same reason.

These results are retained as context, but the direct Echo-versus-Calculator Upgrade comparison is the more relevant evidence for the current WebSocket investigation.

## 10. Root-Cause Assessment

### 10.1 Confirmed observations

The following conclusions are directly supported by the recorded tests:

1. The Echo WebSocket failed to open in a browser test.
2. A direct Node.js WebSocket test against Echo also failed.
3. The raw Echo handshake received HTTP `403 Forbidden`.
4. The raw Calculator handshake received HTTP `101 Switching Protocols`.
5. Both raw requests targeted the same hostname and TLS port and used the same essential Upgrade headers.
6. Neither raw handshake included an `Origin` header.
7. The responses identified Nginx as the server.
8. No successful Echo ready message or echoed text response was recorded.

### 10.2 Most defensible interpretation

The Echo failure is not explained solely by the React component, because it was reproduced with direct clients outside the interface.

The raw handshake result narrows the observed failure to the point where the Echo upgrade request is rejected. The difference between Echo and Calculator makes an endpoint-specific routing, access, or backend-handling difference a reasonable area for further investigation.

The response's `Server: nginx` header identifies the server software reported in the HTTP response. It does not prove that Nginx itself generated the rejection; a reverse proxy can also forward a response from an upstream application.

### 10.3 Hypotheses that remain unconfirmed

| Hypothesis | Why it is worth checking | Evidence still needed |
|---|---|---|
| Echo-specific Nginx location or proxy configuration | The two paths produce different handshake statuses | Effective Nginx configuration and access/error logs |
| Endpoint-specific access policy | Echo returns `403` while Calculator upgrades successfully | Applicable authorization or access-control rules |
| Upstream Echo service behavior | A proxy may forward a backend rejection | Upstream response logs and service health |
| Different authentication requirements | Other service flows may use tokens | Explicit Echo authentication specification or server logs |
| Routing or deployment mismatch | Endpoint paths may be routed differently | Route definitions and deployment configuration |
| Network or client restrictions | Browser and Node tests can have different environments | Reproduction from another controlled client or network |

These are investigation hypotheses, not established causes.

### 10.4 Why the root cause cannot yet be declared

The available client-side tests show the HTTP response and connection behavior, but do not reveal the server-side decision path.

Without access to the relevant logs or configuration, it is not possible to determine whether the rejection is generated by Nginx, an upstream service, an access rule, or another layer.

The technically accurate conclusion is therefore:

**The Echo WebSocket handshake rejection has been reproduced and compared against a successful Calculator handshake. The exact root cause remains unconfirmed.**

## 11. Frontend Implementation Considerations

The Echo frontend should continue to handle connection failure safely and clearly.

The current implementation should be reviewed to ensure that it:

- Does not allow message submission unless the socket is open.
- Displays connection and error states accurately.
- Ignores events from obsolete sockets after reconnecting.
- Cleans up the socket when the component unmounts.
- Avoids displaying a successful connection state before the socket's `open` event or documented ready message.
- Preserves both Persian and English translations.
- Does not repeatedly reconnect in a tight loop when the server consistently rejects the handshake.

Frontend changes cannot make a server-side `403` response succeed unless the request is missing a required, documented condition that the client is authorized to provide. No such condition has been established by the current evidence.

## 12. Recommended Server-Side Follow-up

The next diagnostic steps require cooperation from someone with access to the service configuration.

1. Inspect the Nginx access log for requests to `/ws/echo` at the recorded test times.
2. Inspect the corresponding Nginx error log and upstream status, if available.
3. Compare the effective `/ws/echo` and `/ws/calculator` location and proxy configurations.
4. Determine whether the `403` is generated by Nginx or returned by an upstream service.
5. Verify the intended authentication and access policy for the Echo WebSocket.
6. Confirm that the Echo upstream is healthy and mapped to the expected route.
7. If the endpoint is expected to accept the recorded request, repeat the handshake test after any server-side correction.
8. After a successful upgrade, verify the ready message and at least two Echo message exchanges.
9. Record the test environment, timestamps, request conditions, status codes, and final outcome.

These checks should be performed by an authorized maintainer. The present investigation does not assume access to production server logs or permission to alter server configuration.

## 13. Final Verification Checklist

The following checklist distinguishes completed diagnostic evidence from remaining work.

| Check | Current status |
|---|---|
| Production build | Passed in final recorded run; see Section 4 |
| Lint | Completed: 2 warnings, 0 errors; see Section 4 |
| Login/CAPTCHA scenarios | Reported as tested successfully |
| Task-management scenarios | Reported as tested successfully |
| Calculator ready message | Recorded in prior authenticated test |
| Direct browser Echo connection | Failed before open |
| Direct Node.js Echo connection | Failed |
| Raw Echo handshake | HTTP 403 observed |
| Raw Calculator handshake | HTTP 101 observed |
| Echo ready message | Not observed |
| Echo message round-trip | Not verified |
| Server-side root cause | Not confirmed |
| Final post-investigation build/lint | Completed; see Section 4 |

Build and lint statuses above reflect the final recorded runs described in Section 4. Other statuses distinguish previously recorded functional tests from checks that remain unverified.

## 14. Conclusion

The frontend production build was successful in the recorded run, and the available report documents successful execution of selected authentication, task-management, and Calculator readiness scenarios.

The Echo WebSocket failure was reproduced outside the React interface and investigated with a raw TLS-based HTTP Upgrade request. The request to `/ws/echo` received `403 Forbidden`, while the comparable request to `/ws/calculator` received `101 Switching Protocols`.

This comparison narrows the observed failure to the Echo handshake path or a condition specific to that request. It does not establish the exact root cause.

The implementation report therefore records the failure transparently, avoids unsupported claims about backend responsibility, and identifies the server-side evidence needed to complete the investigation.

The final recorded production build and lint results are documented in Section 4. The Echo server-side root cause remains unconfirmed and requires further investigation using server-side logs and configuration.

## Related Issue

The Echo WebSocket connection issue has been reported in the original challenge repository:

[Issue #8 â€” WebSocket Echo endpoint fails to establish a connection](https://github.com/mtrshirazi21/idicorp-frontend-challenge/issues/8)
