# Codimir SDK: Theoretical Foundation & Architecture

## Executive Summary

The **Codimir SDK** is the universal connecting layer between the Codimir backend API and all client tools:

- 🌐 **Web App** (Next.js) - User interface and dashboard
- 🔧 **CLI** - Command-line automation and scripting  
- 🎨 **VSCode Extension** - IDE integration and workflows
- 🔗 **Third-party Integrations** - Partner tools and services

**Key Principle**: The SDK is NOT the backend - it's a stateless, typed, framework-agnostic client library that handles transport, validation, and error normalization.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   VSCode Ext    │    │    CLI Tool     │    │   Web App       │
│                 │    │                 │    │   (Next.js)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                      ┌─────────┴───────┐
                      │  Codimir SDK    │
                      │                 │
                      │ • Transport     │
                      │ • Types         │
                      │ • Validation    │
                      │ • Auth          │
                      │ • Realtime      │
                      └─────────┬───────┘
                                │
                      ┌─────────┴───────┐
                      │ Codimir Backend │
                      │   (Next.js API) │
                      │                 │
                      │ • API Routes    │
                      │ • Server Actions│
                      │ • Database      │
                      │ • Auth          │
                      └─────────────────┘
```

## Core Components

### 1. Transport Layer
**Responsibility**: HTTP communication with backend API

```typescript
interface TransportOptions {
  baseUrl: string
  getToken?: () => Promise<string | undefined> | string | undefined
  fetch?: FetchLike
  timeoutMs?: number
  retry?: { attempts: number; minDelayMs: number; factor: number }
}
```

**Features**:
- Configurable base URL (supports local dev, staging, prod)
- Pluggable authentication via `getToken()` injection
- Automatic retry with exponential backoff (GET/HEAD only)
- Timeout handling via AbortController
- Normalized error responses

### 2. Type System & Schemas
**Responsibility**: Runtime-safe data contracts

```typescript
// Core domain types
export type ProjectId = string & { __brand: "ProjectId" }
export type TaskId = string & { __brand: "TaskId" }
export type WorkspaceId = string & { __brand: "WorkspaceId" }

// Runtime validation with Zod
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  workspaceId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
})
```

**Benefits**:
- TypeScript compile-time safety
- Runtime validation prevents silent failures
- Single source of truth for data shapes
- Breaking changes surface immediately

### 3. Authentication Strategy
**Multi-environment auth handling**:

| Environment | Auth Method | Implementation |
|-------------|-------------|----------------|
| **Browser** | HTTP-only cookies | No token in JS bundle |
| **Node.js/CLI** | API key or session token | Environment variables |
| **VSCode** | OAuth flow | Secure storage API |
| **Server-side** | Service account | Internal auth |

```typescript
// Web app (server-side)
const client = new CodimirClient({
  baseUrl: process.env.CODIMIR_API_URL,
  getToken: () => cookies().get("auth_token")?.value
})

// CLI tool
const client = new CodimirClient({
  baseUrl: "https://api.codimir.dev",
  getToken: () => process.env.CODIMIR_API_KEY
})

// VSCode extension
const client = new CodimirClient({
  baseUrl: "https://api.codimir.dev",
  getToken: async () => await vscode.authentication.getToken()
})
```

## API Endpoint Mapping

Based on current backend structure, the SDK will provide these domain APIs:

### Projects API
```typescript
class ProjectsApi {
  async create(input: ProjectInput): Promise<Project>
  async get(id: ProjectId): Promise<Project>
  async list(params?: ListProjectsParams): Promise<Page<Project>>
  async update(id: ProjectId, patch: Partial<ProjectInput>): Promise<Project>
  async delete(id: ProjectId): Promise<void>
}
```

**Backend Routes → SDK Methods**:
- `POST /api/projects` → `projects.create()`
- `GET /api/projects` → `projects.list()`
- `GET /api/project/[id]` → `projects.get()`
- `PATCH /api/project/[id]` → `projects.update()`
- `DELETE /api/project/[id]` → `projects.delete()`

### Auth & User API
```typescript
class AuthApi {
  async getCurrentUser(): Promise<User>
  async updateProfile(patch: Partial<UserInput>): Promise<User>
  async getApiKeys(): Promise<ApiKey[]>
  async createApiKey(input: ApiKeyInput): Promise<ApiKey>
  async revokeApiKey(id: string): Promise<void>
}
```

### Organizations & Teams API
```typescript
class OrganizationsApi {
  async list(): Promise<Organization[]>
  async get(id: string): Promise<Organization>
  async getMembers(id: string): Promise<Member[]>
  async invite(orgId: string, input: InviteInput): Promise<Invite>
}
```

### Workspaces API
```typescript
class WorkspacesApi {
  async list(orgId?: string): Promise<Workspace[]>
  async get(id: WorkspaceId): Promise<Workspace>
  async create(input: WorkspaceInput): Promise<Workspace>
  async update(id: WorkspaceId, patch: Partial<WorkspaceInput>): Promise<Workspace>
}
```

### Events & Realtime API
```typescript
class EventsApi {
  async subscribe(options: SSEOptions): Promise<() => void>
  async getNotifications(params?: PaginationParams): Promise<Page<Notification>>
  async markAsRead(notificationIds: string[]): Promise<void>
}
```

## Client Integration Patterns

### 1. Web App Integration (Next.js)
```typescript
// lib/codimir.ts
export function codimirServer() {
  return new CodimirClient({
    baseUrl: process.env.CODIMIR_API_URL!,
    getToken: () => cookies().get("auth_token")?.value
  })
}

export function codimirPublic() {
  return new CodimirClient({
    baseUrl: process.env.NEXT_PUBLIC_CODIMIR_API_URL!
  })
}

// Server actions
export async function createProjectAction(input: ProjectInput) {
  const client = codimirServer()
  return await client.projects.create(input)
}

// Client components with SWR
function ProjectList() {
  const { data, error } = useSWR('projects', () => 
    codimirPublic().projects.list()
  )
  // ...
}
```

### 2. CLI Integration
```typescript
// cli/src/commands/project.ts
import { CodimirClient } from '@codimir/sdk'

const client = new CodimirClient({
  baseUrl: config.apiUrl,
  getToken: () => config.apiKey
})

export async function listProjects() {
  try {
    const projects = await client.projects.list()
    console.table(projects.items)
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`API Error: ${error.message} (${error.status})`)
    }
  }
}
```

### 3. VSCode Extension Integration
```typescript
// vscode/src/api.ts
import * as vscode from 'vscode'
import { CodimirClient } from '@codimir/sdk'

class CodimirService {
  private client: CodimirClient

  constructor() {
    this.client = new CodimirClient({
      baseUrl: 'https://api.codimir.dev',
      getToken: this.getAuthToken.bind(this)
    })
  }

  private async getAuthToken(): Promise<string | undefined> {
    const session = await vscode.authentication.getSession('codimir', ['read', 'write'])
    return session?.accessToken
  }

  async getProjects() {
    return this.client.projects.list()
  }
}
```

## Security & Best Practices

### 🔐 Never Expose Secrets in Browser
- Use HTTP-only cookies for web apps
- Proxy sensitive API calls through your backend
- Use environment variables for server-side clients

### 🛡️ Runtime Validation
- All API responses validated with Zod schemas
- Graceful error handling with normalized ApiError
- Type-safe inputs prevent invalid requests

### 🚀 Performance Optimizations
- Tree-shakeable exports (ESM + CJS)
- Minimal bundle size (no React dependencies in core)
- Connection pooling and request deduplication
- Intelligent caching strategies

### 📦 Versioning Strategy
- Semantic versioning aligned with backend API
- Backward compatibility guarantees
- Clear migration guides for breaking changes
- Deprecation warnings with transition periods

## Development Workflow

### 1. Backend-First Development
1. Define new API endpoint in NestJS backend
2. Update OpenAPI/Swagger documentation
3. Generate TypeScript types and Zod schemas
4. Implement SDK method with tests
5. Update integration examples

### 2. Multi-Package Testing
```bash
# Test SDK against local backend
pnpm --filter @codimir/sdk test

# Test CLI using local SDK
pnpm --filter @codimir/cli test

# Test web app integration
pnpm --filter @codimir/web test
```

### 3. Documentation-Driven Design
- Every SDK method has TSDoc comments
- Auto-generate API reference from TypeScript
- Runnable examples for each integration pattern
- Migration guides for breaking changes

## Package Structure
```
packages/sdk/
├── package.json           # Dependencies, exports, scripts
├── tsconfig.json         # TypeScript configuration
├── tsup.config.ts        # Build configuration (ESM + CJS)
├── src/
│   ├── index.ts          # Public API exports
│   ├── client.ts         # Main CodimirClient class
│   ├── transport.ts      # HTTP transport layer
│   ├── errors.ts         # Normalized error types
│   ├── types.ts          # Core domain types
│   ├── schemas.ts        # Zod validation schemas
│   ├── endpoints/
│   │   ├── projects.ts   # Projects API
│   │   ├── auth.ts       # Authentication API
│   │   ├── orgs.ts       # Organizations API
│   │   └── events.ts     # Events & realtime API
│   ├── realtime/
│   │   ├── sse.ts        # Server-sent events
│   │   └── ws.ts         # WebSocket client
│   └── utils/
│       ├── pagination.ts # Cursor-based pagination
│       ├── retry.ts      # Exponential backoff
│       └── validation.ts # Schema helpers
└── dist/                 # Built artifacts (ESM + CJS + types)
```

## Success Metrics

### Developer Experience
- ✅ Zero-config setup for each client type
- ✅ IntelliSense and autocomplete everywhere
- ✅ Runtime errors surface at development time
- ✅ Consistent patterns across all integrations

### Maintainability
- ✅ Single source of truth for API contracts
- ✅ Automated breaking change detection
- ✅ Comprehensive test coverage (>90%)
- ✅ Clear upgrade paths for major versions

### Performance
- ✅ Bundle size <50KB gzipped for browser usage
- ✅ Sub-100ms request latency (excluding network)
- ✅ Efficient connection reuse and pooling
- ✅ Optional request deduplication and caching

## Next Steps

1. **Map Complete API Surface** - Document all existing backend endpoints
2. **Define Core Types** - Create TypeScript interfaces for all domain objects  
3. **Build Transport Layer** - Implement fetch-based HTTP client with retry/timeout
4. **Create Domain APIs** - Build typed methods for projects, auth, orgs, etc.
5. **Integration Patterns** - Document and test VSCode, CLI, and web app usage
6. **Documentation Site** - Auto-generate API docs and integration guides
7. **OSS Preparation** - Finalize licensing, contribution guidelines, and release process

---

*This foundation document will evolve as we implement the SDK. It serves as our north star for architectural decisions and integration patterns.*
