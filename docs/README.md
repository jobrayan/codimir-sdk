# Codimir – Modern Test Management Platform

Codimir is a scalable, developer-friendly alternative to TestRail—built with Next.js, shadcn/ui, Tailwind CSS, and Prisma ORM.  
It empowers teams to manage test cases, document QA processes, track results, and gain real-time insights—**all with beautiful, customizable UI and extensible architecture.**

---

## ✅ Core Features

| Module       | Description                                                         |
|--------------|---------------------------------------------------------------------|
| Projects     | Group related test suites and test cases.                           |
| Test Suites  | Collections of test cases organized by feature or module.           |
| Test Cases   | Steps, expected results, priority, tags, markdown editing.          |
| Test Runs    | Execute test cases under specific runs (regression, smoke, etc).    |
| Test Results | Status (passed, failed, blocked), comments, historical tracking.    |
| User Roles   | Admins, Testers, Viewers with RBAC (role-based access control).     |
| Dashboard    | Visual overview: coverage, run status, failed cases, analytics.     |
| Docs         | Markdown-based knowledge base for projects, suites, and cases.      |
| Attachments  | (Planned) Add screenshots and files to test cases.                  |
| Automation   | (Planned) Playwright/Cypress result sync via API.                   |

---

## 💡 Tech Stack

| Layer      | Technology                                                   |
|------------|-------------------------------------------------------------|
| Frontend   | Next.js 15 (App Router), TailwindCSS, shadcn/ui             |
| State      | Zustand or React Context                                    |
| Auth       | NextAuth.js (email, Google)                                 |
| Backend    | Next.js API routes (optionally: NestJS microservices)       |
| Database   | PostgreSQL (Prisma ORM)                                     |
| Charts     | Recharts                                                    |
| CI/CD      | GitHub Actions, Vercel, or your choice                      |
| Automation | (Optional) Playwright/Cypress integration                   |

## ✨ Advanced & Optional Features

- **API endpoints:** Playwright/Cypress result uploads
- **Recharts:** Test coverage charts
- **Execution time tracking:** Flakiness analysis
- **Attachments:** Screenshots, logs (planned)
- **Search & filtering:** Tagging, search for test cases
- **Audit logs:** Edits and results
- **Integrations & Tooling:**
  - **Automation Sync:** GitHub Actions, Playwright Reporter
  - **Test Case Import:** CSV Upload Tool
  - **Notification:** Slack or Email (planned)
  - **AI Assistance:** GPT integration (planned)

## 🏁 Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install` (or `npm install`)
3. Setup environment variables: See [ENVIRONMENT.md](./ENVIRONMENT.md)
4. Run migrations: `pnpm prisma migrate dev`
5. Start the dev server: `pnpm dev`
6. Login and start adding your projects and test cases!

For detailed installation and usage, see [docs](./docs).

## 📚 Learn More

- [Features](./docs/FEATURES.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Roadmap](./docs/ROADMAP.md)
- [Docs Entry](./docs/WINDDOCS.md)

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License
MIT

## 🧱 Example Prisma Schema

<details>
<summary>Click to expand schema</summary>

```prisma
model Project {
  id          String    @id @default(cuid())
  name        String
  description String?
  testSuites  TestSuite[]
}

model TestSuite {
  id        String     @id @default(cuid())
  title     String
  project   Project    @relation(fields: [projectId], references: [id])
  projectId String
  testCases TestCase[]
}

model TestCase {
  id           String   @id @default(cuid())
  title        String
  description  String?
  steps        String
  expected     String
  priority     String
  suite        TestSuite @relation(fields: [suiteId], references: [id])
  suiteId      String
}

model TestRun {
  id        String     @id @default(cuid())
  suite     TestSuite  @relation(fields: [suiteId], references: [id])
  suiteId   String
  startedAt DateTime   @default(now())
  results   TestResult[]
}

model TestResult {
  id        String   @id @default(cuid())
  testCase  TestCase @relation(fields: [testCaseId], references: [id])
  testCaseId String
  testRun    TestRun  @relation(fields: [testRunId], references: [id])
  testRunId  String
  status     String   // e.g. passed, failed, blocked
  comment    String?
  createdAt  DateTime @default(now())
}
</details>
