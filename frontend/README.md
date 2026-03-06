## AI Code Reviewer Frontend

React + TypeScript + Vite frontend for the AI Code Reviewer. Paste source code, select a language and receive a structured review (summary, security, performance, style, suggestions).

### Features

- Code input with language selection (Python, TypeScript, JavaScript, Go, Rust, Java, C#, C++, C, PHP, Ruby, Bash).
- Sends requests to the backend `/analyze/` endpoint.
- Displays review results in a structured layout.

### Requirements

- Node.js 18+ and npm/pnpm.

### Installation

```bash
yarn install
```

### Running the dev server

```bash
yarn run dev
```

The Vite dev server proxies `/analyse/` and `/analyze/` to `http://localhost:8000`. Ensure the backend is running.

### Build

```bash
yarn run build
```
