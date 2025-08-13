# Codimir Architecture

## Overview

Codimir uses a modern, serverless-first tech stack for scalability, extensibility, and rapid development. The system is modular, leveraging Next.js 15 (App Router), shadcn/ui, Prisma, and PostgreSQL.

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend/API:** Next.js API routes (can be migrated to NestJS microservices if needed)
- **Database:** PostgreSQL (via Prisma ORM)
- **Authentication:** NextAuth.js (JWT sessions, email/Google)
- **Charts & Analytics:** Recharts
- **Deployment:** Vercel (default) or Docker

---

## High-Level Structure

- `/app`: All pages/routes, including API endpoints
- `/components`: Shared React/UI components
- `/lib`: Prisma client, business logic
- `/prisma`: Schema and migration files
- `/docs`: Project and internal documentation
- `/public`: Static assets (logos, images)

---

## Key Modules

- **User & Auth:** Centralized auth using NextAuth.js, RBAC enforced throughout app and API.
- **Project Management:** Projects own suites and cases, all actions tracked and validated by role.
- **Test Suites & Cases:** CRUD with Markdown editing, tags, attachments (post-MVP), status, and priority.
- **Docs & Knowledge Base:** Markdown-powered docs linked to any project, suite, or case.
- **Analytics:** Dashboard aggregates test statuses, trends, coverage, and activity history.

---

## Extensibility

- **API-first:** All business logic is available through secured API endpoints.
- **Frontend Components:** Built as isolated, reusable React components (shadcn/ui).
- **Rules & Policies:** Windsurf IDE reads `/docs/rules` for coding, SSR, and environment policy.

---

## Security & Best Practices

- All sensitive actions require authentication and role verification.
- JWT tokens with httpOnly cookies for SSR-friendly, secure sessions.
- Input validation and markdown sanitization for all user input.

---

## Diagram

![architecture-diagram](./assets/architecture-diagram.png)
*(Diagram placeholder — update after first milestone)*
