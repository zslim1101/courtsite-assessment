# URL Shortener

A simple URL shortening service to generate unique and trackable URLs that can be shared.

## Programming Language

I decided to go with my most familiar language and stack (Node with TS) in order to not waste too much time setting up development environment for this project

## Libraries and Packages

1. `yarn` as package manager
2. `Fastify` as server
3. `Redis` for in-memory storage
4. `nanoid` for key generation
5. `Typebox` for JSON Schema and also Typescript-typed

## Prerequisites

Before running this project, ensure you have the following installed:

- **[Node.js](https://nodejs.org/)** (v22.19.0 in use)
- **[Yarn](https://yarnpkg.com/)**
- **[Redis](https://redis.io/download)** server running locally on default port `6379`, installed via Memurai on Windows, for macOS or Linux, just use `homebrew`

## Getting Started

### 1. Install Dependencies

```bash
yarn install
```

### 2. Start Redis Server

Make sure your Redis server is running. On Windows, you can use [WSL](https://docs.microsoft.com/en-us/windows/wsl/install) or [Memurai](https://www.memurai.com/).

```bash
# On Linux/macOS
homebrew install redis
homebrew services start redis
```

### 3. Run the Development Server

```bash
yarn start
```

The server will start on `http://localhost:3000`. There is also a sample page ready at the base URL for testing the URL shortener directly in your browser.
