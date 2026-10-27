# Implementation Report — IDICorp Service Console



## 1. Project Overview



This project is a React-based frontend implementation for the IDICorp frontend challenge. It uses Vite for local development and production builds.



The goal was to implement the required service-console functionality, organize the source code into maintainable components, and document the implementation and observed test results.



## 2. Development Environment



- **Frontend framework:** React

- **Build tool and development server:** Vite

- **Language:** JavaScript with JSX

- **Package manager:** npm

- **Static checks:** Oxlint

- **Backend base URL:** Configurable through `VITE_API_BASE_URL`



The local project was developed on Windows using PowerShell and a local Node.js/npm environment.



## 3. Implementation Approach



The work was organized into incremental steps:



1. Inspect the project structure and establish the local development environment.

2. Configure the application and its API proxy for local development.

3. Implement the user interface and reusable React components.

4. Connect the frontend to the available authentication and task-management services.

5. Exercise the implemented user flows and investigate service connectivity.

6. Run production-build and lint checks.

7. Document observed results, known limitations, and follow-up recommendations.

8. Prepare the source code and documentation for submission through a private GitHub repository.



This sequence describes the overall workflow; it does not imply that every possible application scenario or backend behavior was exhaustively tested.



## 4. Application Structure and Technical Decisions



The application uses React components to separate interface responsibilities. The source code is organized under `src/`, with component and internationalization-related code kept in dedicated areas.



Vite provides the development server and production build pipeline.



A development proxy is configured for `/api` requests and forwards them to `https://ts.idicorp.ir`. This allows the frontend to use a local API path during development.



The `.env.example` file documents the frontend environment variable without containing credentials. The local `.env` file is excluded from version control.



The `.gitignore` file excludes generated build output, installed dependencies, and local environment files while allowing `.env.example` to be submitted.



## 5. Verification Performed



The following checks were performed during development:



- The production build completed successfully.

- Oxlint completed without reported errors and produced two React warnings related to `set-state-in-effect`.

- The login and CAPTCHA flow was exercised.

- Task listing, search, completed-task filtering, and CRUD operations were exercised.

- The Calculator WebSocket endpoint returned a `ready` message when tested with a valid access token.

- The Echo WebSocket endpoint was tested directly in the browser, but the connection failed before the `open` event and subsequently closed with code `1006`.



These results reflect the observed tests only. They should not be interpreted as proof that every feature, edge case, browser, or deployment environment has been validated.



## 6. Known Issues and Limitations



### Echo WebSocket



The Echo endpoint did not establish a connection during the recorded direct-browser test. Because the connection was not established, message echo behavior could not be verified.



The root cause remains undetermined. Possible areas for investigation include the server-side handshake, deployment or reverse-proxy configuration, Origin restrictions, and the client environment.



### React lint warnings



Two `set-state-in-effect` warnings remain in the login/CAPTCHA and task-loading components. They should be reviewed to determine whether the relevant effects can be refactored without changing behavior.



### Additional coverage



The available test record does not establish exhaustive coverage of all API responses, WebSocket message scenarios, error states, or cross-browser behavior. Further testing is recommended before production use.



## 7. Submission and Reproducibility



The submission should include the application source code, `package.json`, `package-lock.json`, configuration files, and the accompanying documentation.



To install dependencies and run the application from the project root:



```bash

npm install

npm run dev

```



To run the production build:



```bash

npm run build

```



To run lint checks:



```bash

npm run lint

```



The `.env.example` file should be reviewed when configuring the environment. Actual credentials, session cookies, access tokens, and other secrets must not be committed.



## 8. Conclusion



The frontend implementation has a successful production build and has undergone functional checks of the primary login and task-management flows. The Calculator WebSocket readiness response was observed, while the Echo WebSocket connection issue remains unresolved.



The implementation and test reports document the observed behavior separately from assumptions, providing a basis for review and further investigation.







