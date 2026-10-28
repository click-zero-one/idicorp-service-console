# Test Report — IDICorp Service Console



## 1. Purpose



This document summarizes the implementation checks and service tests performed during development of the IDICorp frontend challenge.



It distinguishes observed results from assumptions. A successful test of one endpoint does not establish that every endpoint or scenario works correctly.



## 2. Frontend Build and Static Checks



### Production build



**Result: Passed**



The Vite production build completed successfully.



Observed output:

- Vite build completed without a reported build error.

- 36 modules transformed.

- A production `dist` output was generated.



### Lint



**Result: Completed with warnings**



Oxlint completed with no reported lint errors and two React warnings related to `set-state-in-effect`:



- `src/components/LoginForm/LoginForm.jsx`: CAPTCHA loading effect.

- `src/components/TaskManager/TaskManager.jsx`: task loading effect.



These warnings should be reviewed separately. They are not, by themselves, evidence of a runtime failure.



## 3. Authentication and Task Management



The following behavior was exercised during development:



| Area | Observed result |

|---|---|

| Login and CAPTCHA flow | Tested successfully |

| Task listing | Tested successfully |

| Task search | Tested successfully |

| Completion-status filtering | Tested successfully |

| Task CRUD operations | Tested successfully |



These observations reflect the scenarios exercised during development; they do not imply exhaustive coverage of every input, error response, or session state.



## 4. Calculator WebSocket



**Result: Connection readiness confirmed**



The Calculator WebSocket endpoint was tested using a valid access token. The server returned:



`{"type":"ready"}`



This confirms that the connection reached the ready state in that test. It does not, by itself, prove that all arithmetic operations, invalid inputs, timeouts, and reconnect scenarios were exhaustively tested.



Endpoint:



`wss://ts.idicorp.ir/ws/calculator`



## 5. Text Echo WebSocket



**Result: Failed to establish a connection in the observed browser test**



Endpoint:



`wss://ts.idicorp.ir/ws/echo`



### Expected behavior



According to the challenge specification, a successful connection should send a ready message, after which text messages should be echoed on the same connection.



### Observed behavior



During a direct browser test outside the React interface:



- The WebSocket failed before the `open` event.

- The browser subsequently reported close code `1006`.

- No successful Echo message exchange could be performed in that test because the connection was not established.



The failure was therefore not limited to the React component in that test.



### Comparison with Calculator



The Calculator WebSocket reached the ready state when tested with a valid access token. The documented Echo flow does not specify the same authentication message.



This difference is useful evidence for investigation, but it does not establish the cause of the Echo failure.



### Potential investigation areas



The following are hypotheses to investigate, not confirmed causes:



- Echo service availability or server-side handshake handling.

- Reverse-proxy or WebSocket upgrade routing.

- Origin restrictions or deployment configuration.

- Network path or browser environment.

- Any undocumented endpoint requirements.



### Current status



**Unresolved.**



The observed close code and failed handshake do not independently prove that the backend is defective. Further investigation using server logs and deployment configuration is required.



A corresponding issue should be filed in the original challenge repository. Add its URL here after the issue is created.



## 6. Streaming Echo



**Status: Not confirmed by the available test record.**



This report does not claim that the authenticated HTTP Streaming Echo endpoint passed or failed. Add a result only after running a test and recording the observed response.



## 7. Recommended Follow-up Tests



- Retest Echo and capture the browser console and Network/WebSocket handshake details.

- Verify whether the Echo server sends the documented ready message after a successful handshake.

- Test multiple Echo messages on one established connection.

- Test Calculator arithmetic operations and invalid requests independently.

- Test relevant HTTP error cases and session-expiration behavior.

- Test the production build in a deployment-like environment.

- Record the exact environment and outcomes for any additional tests.



## 8. Summary



The production build succeeded, lint completed with two warnings, and the exercised authentication, task-management, and Calculator readiness scenarios were successful.



The direct browser test of the Text Echo WebSocket failed before connection establishment and remains unresolved. The root cause has not been confirmed.



This report records observed results rather than asserting that all requirements have been exhaustively tested.



## Related Issue

The Echo WebSocket connection issue has been reported in the original repository:

- [Issue #8 — WebSocket Echo endpoint fails to establish a connection](https://github.com/mtrshirazi21/idicorp-frontend-challenge/issues/8)