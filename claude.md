# Fashion Sourcing Platform — CLAUDE.md

> Authoritative development guide for Claude Code. Read fully before touching any file.

---

## What This Is

The operating system for a **fashion sourcing company**. The business acts as a bridge between fashion brands and manufacturing execution.

**The deliverable sold to clients is NOT a dashboard, moodboard, or messaging platform.**

**The real deliverable is: sourced collection proposals** (presentation-ready PDFs built from curated fabrics, product references, and style direction).

The platform optimizes everything leading to proposal creation — then tracks execution through sampling and production.

**Full lifecycle:**
Project intake → internal sourcing research → asset curation → **Proposal Builder** → client review → sampling → production

---

## Product Architecture — Four Pillars

Everything must support one of these pillars. Challenge any feature that does not.

| Pillar | Purpose |
|--------|---------|
| **1. Project Intake** | Customer briefs, inspiration, requirements, moodboards |
| **2. Sourcing Library** | Internal fabrics, references, collections — designer-managed |
| **3. Proposal Builder** | **Core product.** Admin curates assets → exports client proposals |
| **4. Execution Tracking** | Sampling, production, delivery after proposal approval |

**Development priority:** (1) Proposal Builder → (2) Sourcing Library → (3) Project Intake → (4) Execution Tracking → (5) AI moodboards (supporting only)

---

## Non-Negotiable System Rules

These are architectural constraints. Never violate them under any framing.

- **Customer ↔ Designer communication is FORBIDDEN.** Admin is the only bridge.
- **Designers never see customer data.** Customers never see the designer workspace.
- **No marketplace, no supplier browsing, no public listings.**
- **Everything is project-based.** No free-floating actions outside a project context.
- **AI is a supporting tool, NOT the product.** AI helps customers develop moodboard inspiration only. AI may pre-fill proposal drafts for admin — admin always curates and submits. Never automate sourcing decisions or auto-send proposals.

---

## Core Business Flow

```
Customer submits inspiration, moodboards, requirements
  ↓
Admin reviews project
  ↓
Admin requests sourcing research (tasks to designers)
  ↓
Designer uploads sourcing assets (fabrics, product references)
  ↓
Admin curates selections in Sourcing Library
  ↓
Admin builds proposal in Proposal Builder
  ↓
Customer reviews proposal (approve / reject / request changes)
  ↓
Sampling → Production → Project complete
(Optional: meeting via Calendar to refine proposal)
```

---

## Monorepo Structure

```
apps/
  web/          # Next.js (App Router) — all portals
  api/          # NestJS backend

packages/
  types/        # Shared TypeScript types ONLY
  utils/        # Pure utility functions ONLY
```

### Hard Rules for `packages/`

`packages/` contains **only** shared types and pure utilities. The following are strictly forbidden there:

- UI components
- Database logic
- Business logic
- API clients or services
- Auth logic

If it has a side effect or imports a framework, it does not belong in `packages/`.

---

## Frontend (`apps/web`)

**Stack:** Next.js (latest, App Router) · TypeScript strict mode · Tailwind CSS v4 · shadcn/ui (latest) · Radix UI · Framer Motion

### Route Groups

```
app/
  (public)/         # landing page + auth
  (customer)/       # customer portal
  (designer)/       # designer portal
  (admin)/          # admin portal
```

### Tailwind v4 Rules

Config lives entirely in `app/globals.css` via `@import "tailwindcss"`. There is no `tailwind.config.ts`.

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-brand: #1a1a1a;
  --color-surface: #fafafa;
  --font-sans: "Inter", sans-serif;
  --radius-card: 0.75rem;
}
```

- All design tokens defined as CSS custom properties inside `@theme {}`
- Never hardcode colors, spacing, or radii inline — reference a `@theme` token or a shadcn CSS variable (`--background`, `--foreground`, `--primary`, etc.)
- **Flat design is global:** all `--radius-*` tokens are `0`; no decorative `shadow-*` or `rounded-*` in new code — enforced app-wide in `globals.css`
- Do not use `tailwind.config.ts` or `@apply` — both are legacy patterns in v4

### shadcn/ui Rules

- Install with `pnpm dlx shadcn@latest add <component>` — never copy-paste component source manually
- Components land in `components/ui/` — do not modify them; compose or wrap instead
- Theme driven by CSS variables in `globals.css` under `:root` and `.dark` — edit tokens there, not inside component files

### Design Principles

Luxury SaaS aesthetic. **Flat surfaces everywhere** — zero border radius, no elevation shadows, color contrast instead of bordered cards. Minimal but high-density information UI. Visual-first inspiration boards. Mobile-first. Fast project navigation. No bloated sidebars or heavy chrome.

---

## Data Fetching — React Query + Axios

All client-side data fetching goes through **TanStack React Query v5** + a typed **Axios** instance. No raw `fetch`, no `useEffect` for data loading, no ad-hoc API calls in components.

### Axios Client (`apps/web/lib/api/client.ts`)

One instance only. Interceptors handle auth token injection and 401 auto-refresh. Nothing else lives in this file.

```ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // sends HttpOnly refresh cookie
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken(); // from in-memory store / zustand — never localStorage
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const token = await refreshAccessToken(); // POST /auth/refresh
      setAccessToken(token);
      error.config.headers.Authorization = `Bearer ${token}`;
      return apiClient(error.config);
    }
    return Promise.reject(error);
  }
);
```

### API Layer — One File Per Domain (`apps/web/lib/api/`)

Each file exports typed async functions only. No business logic, no React inside these files.

```
lib/api/
  client.ts           # Axios instance
  projects.api.ts
  proposals.api.ts
  assets.api.ts
  tasks.api.ts
  meetings.api.ts
  auth.api.ts
```

Example:

```ts
// lib/api/projects.api.ts
import { apiClient } from "./client";
import type { Project, CreateProjectDto } from "@repo/types";

export const projectsApi = {
  getAll: () =>
    apiClient.get<Project[]>("/projects").then((r) => r.data),
  getById: (id: string) =>
    apiClient.get<Project>(`/projects/${id}`).then((r) => r.data),
  create: (dto: CreateProjectDto) =>
    apiClient.post<Project>("/projects", dto).then((r) => r.data),
  update: (id: string, dto: Partial<CreateProjectDto>) =>
    apiClient.patch<Project>(`/projects/${id}`, dto).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete(`/projects/${id}`).then((r) => r.data),
};
```

### Query Keys — One File (`apps/web/lib/query-keys.ts`)

Centralised. Never write inline string arrays as query keys in components or hooks.

```ts
export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    lists: () => [...queryKeys.projects.all, "list"] as const,
    detail: (id: string) => [...queryKeys.projects.all, id] as const,
  },
  proposals: {
    all: ["proposals"] as const,
    byProject: (projectId: string) =>
      [...queryKeys.proposals.all, projectId] as const,
  },
  assets: {
    fabrics: ["assets", "fabrics"] as const,
    products: ["assets", "products"] as const,
  },
  meetings: {
    all: ["meetings"] as const,
    detail: (id: string) => [...queryKeys.meetings.all, id] as const,
  },
} as const;
```

### Custom Hooks — One File Per Domain (`apps/web/hooks/`)

Each hook wraps one React Query call. Components never call `useQuery` / `useMutation` directly.

```
hooks/
  use-projects.ts
  use-proposals.ts
  use-assets.ts
  use-tasks.ts
  use-meetings.ts
```

Example:

```ts
// hooks/use-projects.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api/projects.api";
import { queryKeys } from "@/lib/query-keys";
import type { CreateProjectDto } from "@repo/types";

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.lists(),
    queryFn: projectsApi.getAll,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProjectDto) => projectsApi.create(dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.projects.lists() }),
  });
}
```

### Component Rules

- Components call domain hooks only — never `apiClient` directly
- `QueryClientProvider` lives in `app/providers.tsx` — not scattered across layouts
- Server Components fetch data server-side via direct `apiClient` calls (no React Query on the server)
- Shared UI patterns (empty states, skeletons, error boundaries) live in `components/shared/` — never duplicated inline

### DRY & File Size Rules

- **No god files.** Hard limit: ~150 lines per file. Split by concern when exceeded.
- **No god hooks.** One hook = one resource or one mutation.
- **No god components.** Extract sub-components when JSX exceeds ~80 lines.
- API functions, query keys, and hooks are always in separate files — never inlined into components.

---

## Backend (`apps/api`)

**Stack:** NestJS (latest) · Prisma ORM · PostgreSQL · Redis

### Module Structure

One domain per module. No cross-module database queries — always go through the owning module's service.

```
AuthModule
UsersModule
ProjectsModule
AssetsModule
ProposalModule
CalendarModule
MeetingModule
NotificationModule
FileModule
```

---

## Database (Prisma)

Core models:

```
User            Project         Moodboard
FabricAsset     ProductAsset    Proposal
ProposalItem    Task            Milestone
Meeting         File            Notification
```

Store monetary values as **millimes** (integers). Never floats.

---

## User Roles & Portal Boundaries

### Customer (Fashion Brand)
- Create projects (brief, inspiration, requirements)
- Develop moodboards (design assist — supporting tool)
- Review and respond to **sourcing proposals** (core deliverable)
- Select preferred inspirations for proposal curation
- Track project progress through sampling and production
- Request meetings via Calendar
- **No access to designer workspace or internal sourcing data**
- **No direct communication with designers**

### Designer (Sourcing Contributor — internal only)
- Upload fabrics, product references, and sourcing assets
- Organize collections in the **Sourcing Library**
- Respond to admin sourcing requests (tasks/briefs)
- **Not a client-facing role**
- **No customer visibility, no messaging, no project control, no proposal approval**

### Admin (Orchestrator — only bridge to customers)
- Manage projects and customers
- Assign sourcing tasks to designers
- Curate assets in Sourcing Library
- **Build proposals in Proposal Builder** (core product module)
- Manage meetings and production tracking
- **Only role that communicates with customers**

---

## Landing Page (`(public)/`)

The landing page sells **outcomes**, not features. Do not sell dashboards, AI, or project management.

**Headline:** "From inspiration to sourcing proposal in days, not weeks."

**Subheadline:** "Centralize client briefs, sourcing research, proposal creation, and production tracking in a single workspace built for fashion sourcing teams."

**Sell:**
- Faster sourcing decisions
- Centralized collection development
- Structured proposal creation
- End-to-end sourcing visibility

**Do NOT sell:**
- AI moodboards, dashboards, notifications, generic project workflows

**CTAs:** Start Project · Book Consultation

**Platform section:** Four pillars — Project Intake, Sourcing Library, Proposal Builder, Execution Tracking

**Lead form:** Name, Brand, Email, Project type, Budget range → `LeadModule` API

---

## Modules

### Proposal System

Admin builds structured proposals from designer assets including selected fabrics, product references, style direction, and collection structure.

Customer actions: Approve · Reject · Request changes · Select inspiration assets

### Inspiration Selection

Customer browses curated designer assets (fabrics, garment references, product samples).
Actions: Like · Save · Select for proposal

### AI Agents (Dual-Agent Architecture)

Two purpose-built workflow agents share `apps/web/lib/ai/agent-engine.ts` — not generic chat wrappers.

| Agent | Portal | Route | Purpose |
|---|---|---|---|
| **Moodboard Agent** | Customer | `POST /api/ai/v1/chat` | Co-design canvas — create/layout items, parse uploads, generate images |
| **Proposal Agent** | Admin only | `POST /api/ai/v1/proposal` | Pre-fill proposal builder from moodboards + designer assets |

**Non-negotiables:**
- Customer agent: customer portal + own project moodboards only
- Proposal agent: **admin portal only** — never expose to designer/customer
- Admin always reviews and submits proposals manually (`buildProposalDraft` pre-fills; no auto-send)
- No customer ↔ designer messaging via AI
- Structured outputs via Vercel AI SDK `tool()` + Zod — never parse free-text for drafts

**Module layout (`apps/web/lib/ai/`):**

```
lib/ai/
  agent-engine.ts       # runAgent — streamText via Vercel AI SDK + Fireworks AI
  fireworks/             # chat, vision, embeddings, image gen (@ai-sdk/fireworks)
  rag/                  # embed + cosine retrieval (Fireworks embeddings)
  agents/
    moodboard-agent.ts  # design | parse (vision model for parse)
    proposal-agent.ts   # RAG-augmented proposal draft
  context/
  tools/
  server/
  providers/            # resolveAiProvider — Fireworks AI (single provider)
```

**Fireworks AI model stack** ([`@ai-sdk/fireworks`](https://ai-sdk.dev/providers/ai-sdk-providers/fireworks)):

| Capability | Default model | API |
|---|---|---|
| Text + tool calling | `accounts/fireworks/models/kimi-k2p6` | `fireworks(modelId)` |
| Reasoning | `accounts/fireworks/models/kimi-k2-thinking` | `fireworks(modelId)` |
| Vision / parse uploads | `accounts/fireworks/models/qwen2-vl-72b-instruct` | `fireworks(modelId)` |
| Embeddings + RAG | `nomic-ai/nomic-embed-text-v1.5` | `fireworks.embeddingModel()` |
| Image generation | `accounts/fireworks/models/flux-1-schnell-fp8` | `fireworks.image()` + `generateImage` |

**NestJS grounding:**
- `GET /moodboards/:id/ai-session` — moodboard agent session persistence
- `GET /projects/:projectId/agent-context` — admin-only read model
- `GET /projects/:projectId/proposal-ai-session` — proposal agent session persistence
- `POST /projects/:projectId/rag/index` — persist embedding chunks for RAG
- `POST /projects/:projectId/rag/search` — cosine search over stored chunks

**Moodboard agent tools:** `createItem`, `updateItem`, `deleteItem`, `moveItem`, `groupItems`, `autoLayout`, `analyzeBoard`, `generateImage`, `setMoodboardMetadata`

**Proposal agent tools:** `loadProjectContext`, `rankAssets`, `buildProposalDraft`

**Additional AI routes:**
- `POST /api/ai/v1/embed` — admin embedding utility

**Client hooks (domain only — never `useChat` in components):**
- `useMoodboardAi` → `/api/ai/v1/chat`
- `useProposalAi` → `/api/ai/v1/proposal`

**Legacy routes** delegate to `/api/ai/v1/*` — do not duplicate logic.

**Required env vars (web `.env.local`):**

```
FIREWORKS_API_KEY=              # from https://fireworks.ai — required
FIREWORKS_MODEL_CHAT=accounts/fireworks/models/kimi-k2p6
FIREWORKS_MODEL_REASONING=accounts/fireworks/models/kimi-k2-thinking
FIREWORKS_MODEL_VISION=accounts/fireworks/models/qwen2-vl-72b-instruct
FIREWORKS_MODEL_EMBED=nomic-ai/nomic-embed-text-v1.5
FIREWORKS_MODEL_IMAGE=accounts/fireworks/models/flux-1-schnell-fp8
FIREWORKS_MODEL_CUSTOM=         # optional override for proposal agent
AI_DEFAULT_MODEL=accounts/fireworks/models/kimi-k2p6
AI_ENABLE_IMAGE_GEN=true
AI_ENABLE_RAG=true
JWT_SECRET=                    # must match API
```


### Meeting System (Microsoft Teams Integration)

Customers request meetings with admin inside the platform. Admin approves or reschedules. System creates a calendar event and generates a Teams meeting link via Microsoft Graph API.

**Flow:**
```
Customer submits meeting request
  → Admin approves or reschedules
  → Calendar event created
  → Microsoft Teams link generated via Graph API
  → Both parties notified (in-app + email)
```

**Meeting statuses:** `Requested → Approved → Scheduled → Completed → Archived`

**Graph API scope required:** `OnlineMeetings.ReadWrite`, `Calendars.ReadWrite`

### Calendar System

Unified calendar covering meetings, project milestones, sampling dates, and production deadlines.
Views: Day · Week · Month

### File System

Supports: images, PDFs, technical sheets, references.
Features: versioning, secure access control (signed S3/R2 URLs), project grouping.

### Notifications

Events: new proposal ready, task assigned, meeting requested, meeting approved, status changes.
Channels: in-app + email.

### Realtime (WebSockets)

WebSocket events for: notifications, proposal updates, meeting updates, project status changes.

---

## Auth (Simple JWT)

No NextAuth. Auth is handled with plain JWT — issued by NestJS, verified in Next.js middleware.

**Endpoints:**
```
POST /auth/login    →  { accessToken, refreshToken }
POST /auth/refresh  →  { accessToken }
POST /auth/logout   →  clears refresh token
```

**Tokens:**
- Access token: 15m lifetime, sent as `Authorization: Bearer <token>`
- Refresh token: 7d lifetime, stored in `HttpOnly` cookie, rotated on use, persisted in Redis per `userId` for revocation

**NestJS guard:**
```ts
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
// Applied globally; use @Public() decorator to opt out on public routes
```

**Next.js middleware:**
```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    const res = NextResponse.next();
    res.headers.set("x-user-role", payload.role as string);
    return res;
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/(customer)/:path*", "/(admin)/:path*", "/(designer)/:path*"],
};
```

Role is derived from the verified JWT payload only — never trusted from client state.

**Required env vars:**
```
JWT_SECRET=
JWT_REFRESH_SECRET=
```

---

## Security Model

- RBAC enforced at the API level on every endpoint
- Project-level permissions — users access only their own projects
- Signed file URLs (S3/R2) — no direct file access
- Audit logs on all state-changing operations
- Request validation (`class-validator`) on all DTOs
- Rate limiting on auth and public endpoints

---

## MVP Success Criteria

The build is complete when all three roles can execute their full core workflow end-to-end:

**Customer:** create project → AI Assistant co-designs moodboard → upload inspiration → review proposal → select assets → request meeting

**Designer:** upload fabrics → upload product references → manage collections → complete assigned tasks

**Admin:** assign tasks → build proposals → communicate with customer → approve meeting → track project to completion

---

## Tooling

| Concern | Tool |
|---|---|
| Package manager | npm |
| ORM | Prisma |
| Auth | Simple JWT (`@nestjs/jwt` + `jose`) |
| AI SDK | Vercel AI SDK v6 (`ai`, `@ai-sdk/react`, `@ai-sdk/fireworks`) |
| AI architecture | OpenChat-inspired modules in `apps/web/lib/ai/` |
| Data fetching | TanStack React Query v5 + Axios |
| Styling | Tailwind CSS v4 (CSS-only config) |
| Components | shadcn/ui latest |
| Meetings | Microsoft Graph API |
| AI provider | Fireworks AI (`FIREWORKS_API_KEY`) — chat, vision, embeddings, image gen |
| Embeddings / RAG | Fireworks AI embeddings + `AiEmbeddingChunk` store |

---

## What Claude Must Never Do

### Architecture
- Add chat between customers and designers under any framing
- Move business logic, DB queries, or API clients into `packages/`
- Create cross-module DB queries — always go through the owning module's service
- Create a marketplace, supplier portal, or public listing

### Auth
- Introduce NextAuth or any third-party auth provider
- Trust role from client state — always derive from verified JWT payload
- Store access tokens in `localStorage` — use in-memory store only

### AI
- Expose the **moodboard agent** in designer portal or to customers outside their project moodboards
- Expose the **proposal agent** to designer or customer portals (admin portal only)
- Auto-send proposals or mutate proposal state without admin review
- Let AI override admin decisions, designer task assignment, or meeting approval
- Parse AI responses as free-text strings for structured output — always use `tool()` with Zod
- Call AI route handlers directly from components — use `useMoodboardAi`, `useProposalAi`, or domain hooks
- Duplicate AI logic across `/api/moodboard*` routes — use `lib/ai/` and `/api/ai/v1/*`

### Styling
- Use `tailwind.config.ts` or `@apply` — Tailwind v4 uses `@theme {}` in CSS only
- Hardcode colors, spacing, or radii inline — reference `@theme` tokens or shadcn CSS variables
- Modify files in `components/ui/` — compose or wrap instead

### Data Fetching
- Call `apiClient` directly inside components — always go through a typed domain hook
- Write inline query key arrays — use `queryKeys.*` from `lib/query-keys.ts`
- Use `useEffect` for data fetching — React Query owns all async data lifecycle

### Code Quality
- Create god files — hard limit ~150 lines per file
- Create god hooks — one hook per resource or mutation
- Create god components — extract sub-components when JSX exceeds ~80 lines
- Duplicate shared UI patterns — use `components/shared/`
- Use floats for monetary values — use millimes (integers)