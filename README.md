# IDICorp Service Console

A React and Vite frontend implementation for the IDICorp frontend challenge.

## Overview

This application provides a web interface for interacting with the challenge services, including authentication, task management, calculator WebSocket operations, and text Echo WebSocket testing.

## Features

- Login flow with CAPTCHA support.
- Task listing, searching, completion filtering, and task CRUD operations.
- Calculator WebSocket client.
- Text Echo WebSocket client with connection status and message handling.
- Configurable API base URL.
- Responsive interface and language support.

## Technology Stack

- React
- JavaScript
- Vite
- npm
- WebSocket API

Check package.json for the exact dependency versions.

## Requirements

- Node.js and npm compatible with the installed Vite version.
- Network access to the IDICorp challenge services.

## Setup

1. Install dependencies:

   npm install

2. Create a local environment file from the example:

   PowerShell: Copy-Item .env.example .env

3. Review the environment configuration:

   VITE_API_BASE_URL=/

4. Start the development server:

   npm run dev

Open the local URL printed by Vite in the terminal.

## Available Scripts

- npm run dev — start the development server.
- npm run build — create the production build.
- npm run preview — preview the production build locally.
- npm run lint — run Oxlint.

## API and Service Configuration

The HTTP API base URL is configured through VITE_API_BASE_URL. During local development, Vite proxies /api requests to https://ts.idicorp.ir.

The challenge WebSocket endpoints are:

- Calculator: wss://ts.idicorp.ir/ws/calculator
- Text Echo: wss://ts.idicorp.ir/ws/echo

Do not commit .env files, access tokens, session cookies, passwords, or other credentials.

## Validation and Test Notes

The following results were observed during development:

- Production build: successful.
- Lint: completed with two React set-state-in-effect warnings and no reported lint errors.
- Authentication and CAPTCHA flow: tested successfully.
- Task listing, searching, completion filtering, and CRUD operations: tested successfully.
- Calculator WebSocket: received the ready message after authentication.
- Text Echo WebSocket: a direct browser test failed before the open event and subsequently reported close code 1006.

The Echo result is an observed connection failure, not proof of a specific root cause. The server, deployment, reverse-proxy routing, Origin restrictions, and client environment may require further investigation. Record the corresponding issue in the original challenge repository and include its link in the final test report.

These notes describe tests performed during development and do not mean that every possible scenario has been tested.

The Echo WebSocket connection issue has been reported in the original challenge repository: [Issue #8 — WebSocket Echo endpoint fails to establish a connection](https://github.com/mtrshirazi21/idicorp-frontend-challenge/issues/8).

## Known Limitations

- The Text Echo WebSocket connection issue remains unresolved.
- The two lint warnings should be reviewed separately from functional test results.
- Streaming Echo testing should only be reported as completed if a successful test and its result are documented.

## Submission Notes

This repository contains the frontend source code and project configuration. The dist directory and node_modules are intentionally excluded. Evaluators should install dependencies and build the project from source.

Additional submission documentation should cover implementation decisions, detailed test evidence, the Echo issue investigation, and the developer introduction.

## License

No license has been added unless required by the challenge instructions.