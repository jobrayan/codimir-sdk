# Codimir SDK  
[![NPM Version](https://img.shields.io/npm/v/codimir-sdk?color=blue)](https://www.npmjs.com/package/codimir-sdk)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Build](https://github.com/jobrayan/codimir-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/jobrayan/codimir-sdk/actions)
[![Docs](https://img.shields.io/badge/docs-available-brightgreen.svg)](./docs)

Codimir SDK is an **open-source TypeScript library** that allows you to integrate with the [Codimir Work Management Platform](https://codimir.com) to create, manage, and track tickets.  
It is designed for developers building integrations with **AI-assisted workflows**, **AI IDEs**, **Cascade ticketing**, and tools like VS Code, CLI, and Slack.

---

## 🚀 What Can You Do with Codimir SDK?

- **Create & Manage Tickets** — Generate tickets from your app, CLI, or IDE with references like `tck_<id>`.
- **AI Integration** — Collaborate with Codimir’s AI to refine requirements, track progress, and suggest solutions.
- **Cascade Support** — Automatically link tickets created in Cascade to Codimir’s backend.
- **Authentication** — Works with the Codimir web app’s authentication (Next.js `/web` full-stack backend).
- **Cross-Platform Integrations** — Works in VS Code extensions, CLI tools, Slack bots, or any Node.js service.
- **Extensible Architecture** — Add your own automation and integrations.

---

## 📦 Installation

```bash
# Using npm
npm install codimir-sdk

# Using pnpm
pnpm add codimir-sdk

# Using yarn
yarn add codimir-sdk
```

---

## 🔑 Quick Start

```ts
import { CodimirClient } from "codimir-sdk";

const client = new CodimirClient({
  apiKey: process.env.CODIMIR_API_KEY,
});

// Create a ticket
const ticket = await client.tickets.create({
  title: "Fix login error",
  description: "Users cannot log in after password reset",
  priority: "High",
});

console.log("Ticket created:", ticket.id);
```

---

## 🧩 Example Integrations

| Integration  | Description |
|--------------|-------------|
| **VS Code Extension** | Create tickets directly from your code editor. |
| **CLI Tool** | `codimir create-ticket` command to quickly log issues. |
| **Slack Bot** | Create & assign tickets from Slack messages. |
| **Cascade AI IDE** | AI-suggested tickets with `tck_` references auto-linked. |

---

## 📚 Documentation

### 📖 **Getting Started**
- **[Installation Guide](./docs/INSTALL.md)** - Complete setup instructions
- **[Usage Examples](./docs/USAGE.md)** - Code examples and common patterns
- **[Environment Setup](./docs/ENVIRONMENT.md)** - Configuration and environment variables

### 🏗️ **Architecture & Design**  
- **[SDK Foundation](./docs/sdk-foundation.md)** - Core architecture and design principles
- **[System Architecture](./docs/ARCHITECTURE.md)** - Overall system design
- **[Features Overview](./docs/FEATURES.md)** - Detailed feature documentation

### 🔧 **Development**
- **[Contributing Guide](./docs/CONTRIBUTING.md)** - How to contribute to the project
- **[Scripts & Commands](./docs/SCRIPTS.md)** - Available development scripts
- **[Security Guidelines](./docs/SECURITY.md)** - Security best practices

### 📋 **Reference**
- **[Changelog](./docs/CHANGELOG.md)** - Version history and updates  
- **[Roadmap](./docs/ROADMAP.md)** - Future development plans
- **[Glossary](./docs/GLOSSARY.md)** - Terms and definitions
- **[Goal & Vision](./docs/GOAL.md)** - Project goals and vision

---

## 🤝 Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](./docs/CONTRIBUTING.md) before submitting a PR.

---

## 📄 License
This project is licensed under the [AGPL-3.0 License](LICENSE).
