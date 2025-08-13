# Codimir – Features

## 🚀 Core Features (MVP)

- **User Authentication**
  - Secure login/signup with NextAuth.js (Email and Google)
  - Role-based access control (Admin, Editor, Viewer)

- **Project Management**
  - Create, edit, archive, and delete projects
  - Organize test suites and cases under projects

- **Test Suite Management**
  - Create, rename, and delete test suites within projects
  - Suites can be grouped by feature, module, or workflow

- **Test Case Management**
  - Full CRUD (create, edit, duplicate, delete) for test cases
  - Steps and expected results written in Markdown
  - Status and priority indicators for each test case
  - Tags for categorization and easy filtering

- **Documentation**
  - Markdown-based documentation linked to projects, suites, and cases
  - Central knowledge base for test process and product context

- **Dashboard & Analytics**
  - Visual summary of test case status, project coverage, and recent activity
  - Graphs for pass/fail/inactive counts, historical trends

- **User Management**
  - Admins can invite/remove users and assign roles
  - Manage account settings and password resets

- **Modern UI**
  - Clean, accessible interface using shadcn/ui and Tailwind CSS
  - Responsive design for desktop and mobile

---

## 🛠️ Post-MVP / Planned Features

- **Attachments**
  - Add screenshots and files to test cases

- **Advanced Search & Filtering**
  - Search across all projects, suites, and cases
  - Filter by tags, status, priority, and assignee

- **Audit Logs**
  - Track changes and history on projects, suites, and test cases

- **API Documentation**
  - REST API docs for all core endpoints

- **Notification Integrations**
  - Slack and email notifications for assigned test runs or failed tests

- **Import/Export**
  - Import test cases from CSV, export to CSV/JSON

- **Automation Integration**
  - Sync results from automation runners (Playwright, Cypress, etc.)

---

## 🌱 Future/Long-term Features

- **Single Sign-On (SSO) & SAML**
  - Enterprise-ready authentication options

- **Custom Workflows**
  - Define custom statuses, fields, and approval steps

- **Plugin/Extension Support**
  - Allow teams to add custom UI and integrations

- **Multi-Tenancy**
  - Support multiple organizations or workspaces in a single deployment

- **Time Tracking & Metrics**
  - Track execution time and flakiness per test case

---

## 📚 Feature Map

| Area              | MVP         | Post-MVP    | Future     |
|-------------------|-------------|-------------|------------|
| User Auth         | ✅          |             | SSO, SAML  |
| RBAC              | ✅          |             |            |
| Projects          | ✅          |             |            |
| Suites            | ✅          |             | Custom fields |
| Cases             | ✅          | Attachments | Custom fields/workflows |
| Docs/KB           | ✅          |             |            |
| Analytics         | ✅          |             | Time tracking |
| User Mgmt         | ✅          | Audit Logs  | Multi-Tenancy |
| API               |             | REST Docs   | Plugin API  |
| Notifications     |             | Slack/Email |            |
| Automation        |             | Runner Sync |            |

---

