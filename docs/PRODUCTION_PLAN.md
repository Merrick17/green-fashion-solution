# Production Readiness Plan — Global Fashion Solution Platform

> Full-stack audit findings + prioritised execution roadmap.
> Work through milestones top-to-bottom. Each task is self-contained and includes the exact files to touch.

---

## Current State Summary

**What's solid (do not refactor):**
- 54 frontend routes across 4 portals (public, customer, designer, admin)
- 127 components — all within 150-line limit, cleanly split
- 31 domain hooks — one per resource, React Query v5, no raw `useEffect` for data
- 25 NestJS backend modules — clean module isolation, no cross-module DB queries
- Prisma schema with 49 models and 13 applied migrations
- Dual-agent AI architecture (Cerebras chat + Ollama vision/RAG/image)
- JWT auth with HttpOnly refresh cookies + Redis token store
- Tailwind v4 CSS-only config, luxury sage/cream design system
- Docker Compose for PostgreSQL + Redis
- Swagger docs at `/api/docs`
- Audit logging on all mutations
- WebSocket notifications gateway

**What's broken or missing (this plan fixes everything):**
| # | Gap | Severity |
|---|-----|----------|
| 1 | No admin proposal edit page — admin can't edit an existing proposal | **P0 Blocker** |
| 2 | `AdminEntityRow` has no Edit link — delete-only in list views | **P0 Blocker** |
| 3 | Proposal builder sends directly as `SENT` — no "Save draft" path | **P0 Blocker** |
| 4 | Missing shadcn components: `table`, `tooltip`, `progress`, `popover`, `command`, `scroll-area`, `radio-group` | **P1 High** |
| 5 | Email templates are inline `<p>` strings — not production-grade | **P1 High** |
| 6 | Zero tests — no unit, no e2e, no API integration tests | **P1 High** |
| 7 | No CI/CD pipeline (GitHub Actions) | **P1 High** |
| 8 | No database seed — can't demo or dev without manual data entry | **P1 High** |
| 9 | CORS accepts only one origin — breaks staging + production setup | **P2 Medium** |
| 10 | No Helmet middleware — missing basic HTTP security headers | **P2 Medium** |
| 11 | Rate limiting is global-only — auth endpoints need stricter limits | **P2 Medium** |
| 12 | No env variable validation — silent misconfiguration in production | **P2 Medium** |
| 13 | Audit logs may capture sensitive fields (passwords in DTOs) | **P2 Medium** |
| 14 | WebSocket reconnection has no exponential backoff | **P2 Medium** |
| 15 | No page-level metadata (`<title>`, `<meta description>`) on portal pages | **P3 Low** |
| 16 | Dark mode toggle not wired in designer and customer portals | **P3 Low** |
| 17 | No Sentry or error monitoring integration | **P3 Low** |

---

## Milestone 1 — Core Functional Blockers
**Goal:** Every role can complete their full workflow without dead ends.
**Effort:** ~1 day

### Task 1.1 — Admin Proposal Edit Page

**Problem:** `/admin/proposals/page.tsx` renders `AdminEntityRow` with a Delete button but no Edit link. Admin cannot edit a proposal after creation.

**Create file:** `apps/web/app/admin/proposals/[id]/page.tsx`

Pattern: copy the shape from `apps/web/app/admin/projects/[id]/page.tsx`.

```tsx
// apps/web/app/admin/proposals/[id]/page.tsx
"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { RouteSkeleton } from "@/components/shared/route-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { AssetPickerGrid } from "@/components/admin/asset-picker-grid";
import { ProposalAgentPanel } from "@/components/ai-assistant/proposal-agent-panel";
import { useProposal, useUpdateProposal, useDeleteProposal } from "@/hooks/use-proposals";
import { useProjectAgentContext } from "@/hooks/use-project-agent-context";
import { useBriefSeasons } from "@/hooks/use-brief-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProposalStatus } from "@repo/types";
import { proposalDisplayTitle } from "@repo/utils";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";

export default function AdminProposalEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: proposal, isLoading } = useProposal(id);
  const updateProposal = useUpdateProposal();
  const deleteProposal = useDeleteProposal();
  const { data: seasons = [] } = useBriefSeasons();

  const [title, setTitle] = useState("");
  const [season, setSeason] = useState("");
  const [styleSummary, setStyleSummary] = useState("");
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const initialized = useRef(false);

  const { data: ctx } = useProjectAgentContext(proposal?.projectId ?? "", false);

  useEffect(() => {
    if (!proposal || initialized.current) return;
    setTitle(proposal.title ?? "");
    setSeason(proposal.season ?? "");
    setStyleSummary(proposal.styleSummary ?? "");
    const fabricIds = proposal.sections?.flatMap(s =>
      s.items?.filter(i => i.fabricAssetId).map(i => i.fabricAssetId!) ?? []
    ) ?? [];
    const productIds = proposal.sections?.flatMap(s =>
      s.items?.filter(i => i.productAssetId).map(i => i.productAssetId!) ?? []
    ) ?? [];
    setSelectedFabrics(fabricIds);
    setSelectedProducts(productIds);
    initialized.current = true;
  }, [proposal]);

  const fabrics = ctx?.assets.fabrics ?? [];
  const products = ctx?.assets.products ?? [];

  const toggleFabric = (id: string) =>
    setSelectedFabrics(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleProduct = (id: string) =>
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const save = (status?: ProposalStatus) => {
    const items = [
      ...selectedFabrics.map(fabricAssetId => ({ fabricAssetId })),
      ...selectedProducts.map(productAssetId => ({ productAssetId })),
    ];
    updateProposal.mutate(
      { id, dto: { title, season, styleSummary, sections: [{ title: "Sourcing Assets", items }], ...(status ? { status } : {}) } },
      { onSuccess: () => toast.success("Proposal saved") }
    );
  };

  const handleDelete = () => {
    deleteProposal.mutate(id, { onSuccess: () => router.push("/admin/proposals") });
  };

  if (isLoading) return <RouteSkeleton variant="detail" />;
  if (!proposal) return <p className="page-shell">Proposal not found.</p>;

  const displayTitle = proposalDisplayTitle(proposal);

  return (
    <div className="flex min-h-[calc(100dvh-var(--header-h))]">
      <div className="page-shell max-w-2xl flex-1 space-y-4">
        <Breadcrumb items={[{ label: "Proposals", href: "/admin/proposals" }, { label: displayTitle }]} />
        <PageHeader
          title={displayTitle}
          description={`v${proposal.version ?? 1} · ${proposal.project?.title ?? ""}`}
          actions={<StatusBadge status={proposal.status} />}
        />

        <SectionCard title="Details">
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div>
              <Label>Season</Label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger><SelectValue placeholder="Select season" /></SelectTrigger>
                <SelectContent>{seasons.map(s => <SelectItem key={s.id} value={s.value}>{s.value}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Style summary</Label><Textarea rows={3} value={styleSummary} onChange={e => setStyleSummary(e.target.value)} /></div>
          </div>
        </SectionCard>

        <SectionCard title="Fabrics">
          <AssetPickerGrid type="fabric" assets={fabrics} selected={selectedFabrics} onToggle={toggleFabric} />
        </SectionCard>

        <SectionCard title="Products">
          <AssetPickerGrid type="product" assets={products} selected={selectedProducts} onToggle={toggleProduct} />
        </SectionCard>

        <div className="flex flex-wrap gap-3 pb-8">
          <Button onClick={() => save()} disabled={updateProposal.isPending} variant="outline">Save draft</Button>
          <Button onClick={() => save(ProposalStatus.SENT)} disabled={updateProposal.isPending}>Send to client</Button>
          <Button variant="destructive" onClick={handleDelete} className="ml-auto">Delete proposal</Button>
        </div>
      </div>

      <aside className="hidden xl:flex xl:w-96 xl:shrink-0 border-l flex-col">
        <ProposalAgentPanel projectId={proposal.projectId} />
      </aside>
    </div>
  );
}
```

**Also update `apps/web/app/admin/proposals/page.tsx`** — add `href` to `AdminEntityRow` so every row is clickable:

In the `renderItem` callback, add:
```tsx
href={`/admin/proposals/${p.id}`}
```

**Also update `apps/web/components/admin/admin-entity-row.tsx`** — add optional `href` prop:
```tsx
interface AdminEntityRowProps {
  href?: string;
  // ... existing props
}
```
Wrap the title in `<Link href={href}>` when `href` is provided.

---

### Task 1.2 — Proposal Builder: Save as Draft

**Problem:** `new-proposal-content.tsx` always submits with `status: ProposalStatus.SENT`. There is no "Save draft" option.

**File:** `apps/web/app/admin/proposals/new/new-proposal-content.tsx`

Find the `handleSubmit` function and split into two actions:

```tsx
const handleSubmit = (e: React.FormEvent, asDraft = false) => {
  e.preventDefault();
  const status = asDraft ? ProposalStatus.DRAFT : ProposalStatus.SENT;
  // ... rest of mutation
  createProposal.mutate({ ..., status }, { onSuccess: () => router.push("/admin/proposals") });
};
```

Replace the single submit button with two buttons:
```tsx
<div className="flex gap-2">
  <Button type="button" variant="outline" onClick={e => handleSubmit(e as any, true)} disabled={createProposal.isPending}>
    Save draft
  </Button>
  <Button type="submit" disabled={createProposal.isPending}>
    Send to client
  </Button>
</div>
```

---

### Task 1.3 — Missing `useDeleteProposal` Hook

**Problem:** The new proposal edit page (Task 1.1) needs a delete mutation. Check if it already exists in `apps/web/hooks/use-proposals.ts`. If not, add it:

```ts
export function useDeleteProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proposalsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.proposals.all }),
  });
}
```

Verify `proposalsApi.remove` exists in `apps/web/lib/api/proposals.api.ts`. If not, add:
```ts
remove: (id: string) => apiClient.delete(`/proposals/${id}`).then(r => r.data),
```

---

## Milestone 2 — Missing shadcn/ui Components
**Goal:** All list pages use the `Table` component. Tooltips on icon-only buttons. Progress bars on brief completeness.
**Effort:** ~half a day

Install the missing components with:
```bash
cd apps/web
pnpm dlx shadcn@latest add table tooltip progress popover command scroll-area radio-group
```

### Task 2.1 — Table Component on Admin List Pages

These admin pages use a custom `AdminEntityRow` div-based list. Replace with the `Table` component where the data has fixed columns (better scannability):

Pages to update:
- `apps/web/app/admin/users/page.tsx` — columns: Name, Email, Role, Joined
- `apps/web/app/admin/leads/page.tsx` — columns: Brand, Name, Email, Project Type, Budget, Date
- `apps/web/app/admin/waitlist/page.tsx` — columns: Email, Submitted
- `apps/web/app/admin/audit/page.tsx` — columns: Action, Entity, Actor, Timestamp
- `apps/web/app/admin/designer-applications/page.tsx` — columns: Name, Email, Portfolio, Status, Actions

Pattern for each page:
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      {/* ... */}
    </TableRow>
  </TableHeader>
  <TableBody>
    {rows.map(row => (
      <TableRow key={row.id}>
        <TableCell>{row.name}</TableCell>
        {/* ... */}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Task 2.2 — Tooltips on Icon-Only Buttons

Any `<Button size="icon">` or icon-only action (delete, approve, etc.) must have a `Tooltip` so the action is discoverable.

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4" /></Button>
    </TooltipTrigger>
    <TooltipContent>Delete proposal</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

Audit all icon-only buttons. Key locations:
- `components/admin/admin-entity-row.tsx` — delete button
- `components/shared/notification-bell.tsx`
- `components/moodboard/item-toolbar.tsx`
- `components/moodboard/item-context-menu.tsx`

### Task 2.3 — Progress Bar on Brief Completeness Meter

`apps/web/components/customer/brief/brief-completeness-meter.tsx` likely renders a custom div width bar. Replace it with the shadcn `Progress` component:

```tsx
import { Progress } from "@/components/ui/progress";

<Progress value={completeness} className="h-2" />
```

---

## Milestone 3 — Email Templates
**Goal:** Every transactional email has a properly structured HTML template — not inline `<p>` tags.
**Effort:** ~half a day

### Task 3.1 — Create Email Template Module

**File:** `apps/api/src/email/email-templates.ts`

Create typed template functions that return HTML strings. Style with inline CSS (required for email clients):

```ts
export const emailTemplates = {
  proposalReady: (customerName: string, projectTitle: string, proposalUrl: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Proposal Ready</title></head>
<body style="font-family:sans-serif;background:#f5f2ed;margin:0;padding:32px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:40px;border:1px solid #ddd8d0">
    <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#787671;margin:0 0 24px">Global Fashion Solution</p>
    <h1 style="font-size:24px;color:#404040;margin:0 0 16px">Your sourcing proposal is ready</h1>
    <p style="color:#787671;line-height:1.6;margin:0 0 24px">Hi ${customerName}, a new sourcing proposal has been prepared for <strong>${projectTitle}</strong>. Log in to review and respond.</p>
    <a href="${proposalUrl}" style="display:inline-block;background:#5f6f64;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px">Review Proposal</a>
    <hr style="border:none;border-top:1px solid #ddd8d0;margin:32px 0">
    <p style="font-size:12px;color:#a8a49c;margin:0">You received this because you have an active project with Global Fashion Solution.</p>
  </div>
</body>
</html>`,

  taskAssigned: (designerName: string, taskTitle: string, projectTitle: string) => `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f5f2ed;margin:0;padding:32px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:40px;border:1px solid #ddd8d0">
    <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#787671;margin:0 0 24px">Global Fashion Solution</p>
    <h1 style="font-size:24px;color:#404040;margin:0 0 16px">New task assigned</h1>
    <p style="color:#787671;line-height:1.6;margin:0 0 8px">Hi ${designerName},</p>
    <p style="color:#787671;line-height:1.6;margin:0 0 24px">You have been assigned: <strong>${taskTitle}</strong> on project <strong>${projectTitle}</strong>. Log in to view the brief and upload your sourcing assets.</p>
    <hr style="border:none;border-top:1px solid #ddd8d0;margin:32px 0">
    <p style="font-size:12px;color:#a8a49c;margin:0">Global Fashion Solution internal team notification.</p>
  </div>
</body>
</html>`,

  meetingRequested: (adminName: string, customerName: string, proposedDate: string) => `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f5f2ed;margin:0;padding:32px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:40px;border:1px solid #ddd8d0">
    <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#787671;margin:0 0 24px">Global Fashion Solution</p>
    <h1 style="font-size:24px;color:#404040;margin:0 0 16px">Meeting requested</h1>
    <p style="color:#787671;line-height:1.6">Hi ${adminName}, <strong>${customerName}</strong> has requested a meeting on <strong>${proposedDate}</strong>. Log in to approve or reschedule.</p>
  </div>
</body>
</html>`,

  meetingApproved: (customerName: string, date: string, teamsLink?: string) => `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f5f2ed;margin:0;padding:32px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:40px;border:1px solid #ddd8d0">
    <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#787671;margin:0 0 24px">Global Fashion Solution</p>
    <h1 style="font-size:24px;color:#404040;margin:0 0 16px">Meeting confirmed</h1>
    <p style="color:#787671;line-height:1.6;margin:0 0 24px">Hi ${customerName}, your meeting has been confirmed for <strong>${date}</strong>.</p>
    ${teamsLink ? `<a href="${teamsLink}" style="display:inline-block;background:#5f6f64;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px">Join Teams meeting</a>` : ""}
  </div>
</body>
</html>`,
};
```

### Task 3.2 — Wire Templates into EventsService

**File:** `apps/api/src/events/events.service.ts`

Replace the inline `html` parameter in every `dispatch` call with the appropriate `emailTemplates.*` call. Import from `../email/email-templates`. Update the `dispatch` private method signature to accept a `htmlBody` string instead of building it inline.

Key changes:
- `notifyProposalReady` → use `emailTemplates.proposalReady(customer.name, project.title, url)`
- `notifyTaskAssigned` → use `emailTemplates.taskAssigned(designer.name, title, project.title)`
- `notifyMeetingRequested` → use `emailTemplates.meetingRequested(admin.name, customer.name, proposedDate)`
- `notifyMeetingApproved` → use `emailTemplates.meetingApproved(customer.name, date, teamsLink)`

For `proposalReady`, derive the URL as `${process.env.WEB_URL}/customer/proposals/${proposalId}`. Add `WEB_URL` to `.env.example`.

---

## Milestone 4 — Database Seed
**Goal:** Run `npm run db:seed` and get a fully-populated dev database with all 3 roles ready to use.
**Effort:** ~half a day

### Task 4.1 — Create Prisma Seed Script

**File:** `apps/api/prisma/seed.ts`

```ts
import { PrismaClient, UserRole, ProjectStatus, ProposalStatus, TaskStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = (p: string) => bcrypt.hash(p, 10);

  // Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@gfs.com" },
    update: {},
    create: { email: "admin@gfs.com", name: "GFS Admin", passwordHash: await hash("admin123"), role: UserRole.ADMIN, emailNotifications: true },
  });

  const customer = await prisma.user.upsert({
    where: { email: "brand@example.com" },
    update: {},
    create: { email: "brand@example.com", name: "Maison Lumière", passwordHash: await hash("brand123"), role: UserRole.CUSTOMER, emailNotifications: true },
  });

  const designer = await prisma.user.upsert({
    where: { email: "designer@gfs.com" },
    update: {},
    create: { email: "designer@gfs.com", name: "Amina Sourcing", passwordHash: await hash("design123"), role: UserRole.DESIGNER, emailNotifications: true },
  });

  // Brief Options
  const seasons = ["SS25", "FW25", "SS26", "FW26"];
  const categories = ["Knitwear", "Woven Tops", "Denim", "Outerwear", "Accessories"];
  for (const value of seasons) {
    await prisma.briefOption.upsert({ where: { type_value: { type: "SEASON", value } }, update: {}, create: { type: "SEASON", value } });
  }
  for (const value of categories) {
    await prisma.briefOption.upsert({ where: { type_value: { type: "CATEGORY", value } }, update: {}, create: { type: "CATEGORY", value } });
  }

  // Fabric Assets
  const fabric1 = await prisma.fabricAsset.create({
    data: {
      name: "Organic Linen — Natural",
      description: "100% GOTS-certified organic linen in natural undyed colourway",
      composition: "100% Linen",
      weight: "185gsm",
      colorName: "Natural",
      keywords: ["linen", "organic", "natural", "sustainable", "ss25"],
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      uploadedById: designer.id,
    },
  });

  const fabric2 = await prisma.fabricAsset.create({
    data: {
      name: "Washed Denim — Indigo",
      description: "Pre-washed 12oz selvedge denim with vintage indigo finish",
      composition: "98% Cotton 2% Elastane",
      weight: "340gsm",
      colorName: "Indigo",
      keywords: ["denim", "indigo", "washed", "selvedge"],
      imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
      uploadedById: designer.id,
    },
  });

  // Product Assets
  const product1 = await prisma.productAsset.create({
    data: {
      name: "Oversized Linen Shirt",
      description: "Relaxed-fit shirt with drop shoulders and patch pocket",
      category: "Woven Tops",
      keywords: ["shirt", "linen", "oversized", "ss25"],
      imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
      uploadedById: designer.id,
    },
  });

  // Collection
  const collection = await prisma.collection.create({
    data: {
      name: "SS25 Essentials",
      description: "Core sourcing picks for Spring/Summer 2025",
      designerId: designer.id,
      items: {
        create: [
          { fabricAssetId: fabric1.id, position: 0 },
          { fabricAssetId: fabric2.id, position: 1 },
          { productAssetId: product1.id, position: 2 },
        ],
      },
    },
  });

  // Project
  const project = await prisma.project.create({
    data: {
      title: "Maison Lumière — SS25 Collection",
      description: "30-piece capsule collection focused on sustainable natural fibres",
      customerId: customer.id,
      status: ProjectStatus.IN_SOURCING,
      brief: {
        season: "SS25",
        category: "Woven Tops",
        budget: 50000,
        quantity: 500,
        deliveryDate: "2025-03-01",
        notes: "Focus on GOTS-certified materials, minimal packaging, natural dyes only.",
      },
    },
  });

  // Moodboard
  const moodboard = await prisma.moodboard.create({
    data: {
      title: "SS25 Vision Board",
      projectId: project.id,
      ownerId: customer.id,
    },
  });

  // Task
  await prisma.task.create({
    data: {
      title: "Source organic linen fabrics — min 3 options",
      description: "Customer wants GOTS-certified linen in natural, sage and clay colourways. Upload technical sheets.",
      projectId: project.id,
      assignedToId: designer.id,
      status: TaskStatus.IN_PROGRESS,
      priority: "HIGH",
      dueDate: new Date("2025-01-15"),
    },
  });

  // Proposal
  await prisma.proposal.create({
    data: {
      projectId: project.id,
      title: "SS25 Sourcing Proposal — Draft",
      season: "SS25",
      styleSummary: "Effortless linen-led silhouettes with artisanal denim accents. Natural textures, muted palette.",
      status: ProposalStatus.DRAFT,
      sections: {
        create: [{
          title: "Sourcing Assets",
          position: 0,
          items: {
            create: [
              { fabricAssetId: fabric1.id, position: 0, notes: "Primary fabric — natural undyed" },
              { fabricAssetId: fabric2.id, position: 1, notes: "Accent denim for accessories line" },
              { productAssetId: product1.id, position: 2, notes: "Hero style for lookbook" },
            ],
          },
        }],
      },
    },
  });

  console.log("Seed complete.");
  console.log("Admin:    admin@gfs.com    / admin123");
  console.log("Customer: brand@example.com / brand123");
  console.log("Designer: designer@gfs.com  / design123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

### Task 4.2 — Wire Seed into package.json

**File:** `apps/api/package.json` — add to `scripts`:
```json
"db:seed": "ts-node -r tsconfig-paths/register prisma/seed.ts"
```

**File:** `package.json` (root) — add:
```json
"db:seed": "npm run db:seed --workspace=apps/api"
```

---

## Milestone 5 — Security Hardening
**Goal:** Production-grade HTTP security, proper rate limits, env validation, CORS.
**Effort:** ~half a day

### Task 5.1 — Helmet Middleware

**File:** `apps/api/src/main.ts`

```bash
cd apps/api && npm install helmet
```

```ts
import helmet from "helmet";
// Inside bootstrap(), after app.enableCors():
app.use(helmet({
  contentSecurityPolicy: false, // Next.js handles its own CSP
}));
```

### Task 5.2 — Per-Endpoint Rate Limiting

**File:** `apps/api/src/app.module.ts`

The current global throttler allows 30 requests per minute for all routes. Auth endpoints should be much stricter.

```ts
ThrottlerModule.forRoot([
  { name: "short",  ttl: 60000,  limit: 10 },   // auth routes
  { name: "medium", ttl: 60000,  limit: 60 },   // standard API
  { name: "long",   ttl: 3600000, limit: 1000 }, // burst protection
]),
```

Then in `apps/api/src/auth/auth.controller.ts` apply the strict throttler on login and register:
```ts
@Throttle({ short: { ttl: 60000, limit: 5 } })
@Post("login")
login(@Body() dto: LoginDto) { ... }

@Throttle({ short: { ttl: 60000, limit: 3 } })
@Post("register")
register(@Body() dto: RegisterDto) { ... }
```

### Task 5.3 — Multi-Origin CORS

**File:** `apps/api/src/main.ts`

Replace single-origin CORS with allowlist support:
```ts
const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3001").split(",").map(o => o.trim());

app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
});
```

Add `CORS_ORIGINS=http://localhost:3001,https://app.yourdomain.com` to `.env.example`.

### Task 5.4 — Environment Variable Validation

**File:** `apps/api/src/config/env.validation.ts` (create new file)

```bash
cd apps/api && npm install @nestjs/config zod
```

```ts
import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  REDIS_URL: z.string().url().optional(),
  CORS_ORIGINS: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  WEB_URL: z.string().url().default("http://localhost:3001"),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.format());
    process.exit(1);
  }
  return result.data;
}
```

**File:** `apps/api/src/app.module.ts` — add to imports:
```ts
ConfigModule.forRoot({ validate: validateEnv, isGlobal: true }),
```

### Task 5.5 — Redact Sensitive Fields from Audit Logs

**File:** `apps/api/src/audit/audit.interceptor.ts`

Ensure password fields are never logged in `before`/`after` snapshots:
```ts
const REDACTED_KEYS = ["password", "passwordHash", "refreshToken", "token", "secret"];

function redact(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return obj;
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
      k,
      REDACTED_KEYS.some(r => k.toLowerCase().includes(r)) ? "[REDACTED]" : redact(v),
    ])
  );
}
```
Apply `redact()` to both `before` and `after` snapshots before writing to the audit log.

---

## Milestone 6 — Backend Tests
**Goal:** Critical backend paths are test-covered. No regressions on auth, proposals, events.
**Effort:** ~2–3 days

### Task 6.1 — Auth Unit Tests

**File:** `apps/api/src/auth/auth.service.spec.ts`

Tests to write:
- `login` with valid credentials → returns access + refresh tokens
- `login` with wrong password → throws `UnauthorizedException`
- `login` with unknown email → throws `UnauthorizedException`
- `refresh` with valid token → returns new access token
- `refresh` with revoked token → throws `UnauthorizedException`
- `logout` → clears Redis refresh token

Use `jest.mock` for PrismaService and RedisService. Mock `bcrypt.compare`.

### Task 6.2 — ProposalsService Unit Tests

**File:** `apps/api/src/proposals/proposals.service.spec.ts`

Tests to write:
- `create` with `status: SENT` → fires `notifyProposalReady`
- `create` with `status: DRAFT` → does NOT fire notify
- `findAll` for CUSTOMER role → returns only proposals for own projects
- `findAll` for ADMIN role → returns all proposals
- `update` changing status to `SENT` → fires notify
- `remove` non-existent id → throws `NotFoundException`

### Task 6.3 — EventsService Unit Tests

**File:** `apps/api/src/events/events.service.spec.ts`

Tests to write:
- `notifyProposalReady` → creates DB notification + emits WS event + sends email (when `emailNotifications: true`)
- `notifyProposalReady` → sends no email (when `emailNotifications: false`)
- `notifyTaskAssigned` → creates notification with `TASK_ASSIGNED` type
- `getAdminIds` → returns only users with ADMIN role

### Task 6.4 — Projects State Machine Tests

**File:** `apps/api/src/projects/project-status.machine.spec.ts`

Tests to write:
- Valid transitions: DRAFT→IN_REVIEW, IN_REVIEW→IN_SOURCING, IN_SOURCING→SAMPLING, SAMPLING→PRODUCTION, PRODUCTION→COMPLETED
- Invalid transition: COMPLETED→DRAFT → throws
- Each valid transition emits the correct status-changed notification

### Task 6.5 — API Integration Tests (e2e)

**File:** `apps/api/test/app.e2e-spec.ts`

Replace the placeholder spec. Use a test database (or mock Prisma with `prisma-mock`).

Critical e2e flows:
1. `POST /api/auth/login` → 200 with tokens
2. `POST /api/auth/login` with wrong password → 401
3. `GET /api/projects` without auth → 401
4. `GET /api/projects` as CUSTOMER → 200, only own projects
5. `POST /api/proposals` as ADMIN → 201
6. `PATCH /api/proposals/:id` as CUSTOMER → 403

---

## Milestone 7 — Frontend Tests (Playwright e2e)
**Goal:** Full smoke tests covering the 3-role golden paths.
**Effort:** ~2 days

### Task 7.1 — Setup Playwright

```bash
cd apps/web && pnpm dlx playwright install --with-deps
```

**File:** `apps/web/playwright.config.ts`

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev --workspace=apps/web",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
  },
});
```

### Task 7.2 — Auth Flows

**File:** `apps/web/e2e/auth.spec.ts`

```ts
import { test, expect } from "@playwright/test";

test("login as admin", async ({ page }) => {
  await page.goto("/login");
  await page.fill('[name="email"]', "admin@gfs.com");
  await page.fill('[name="password"]', "admin123");
  await page.click('[type="submit"]');
  await expect(page).toHaveURL("/admin/dashboard");
});

test("login as customer", async ({ page }) => {
  await page.goto("/login");
  await page.fill('[name="email"]', "brand@example.com");
  await page.fill('[name="password"]', "brand123");
  await page.click('[type="submit"]');
  await expect(page).toHaveURL("/customer/dashboard");
});

test("wrong password shows error", async ({ page }) => {
  await page.goto("/login");
  await page.fill('[name="email"]', "admin@gfs.com");
  await page.fill('[name="password"]', "wrongpassword");
  await page.click('[type="submit"]');
  await expect(page.locator('[role="alert"], .text-destructive')).toBeVisible();
});

test("protected route redirects to login", async ({ page }) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL("/login");
});
```

### Task 7.3 — Customer Golden Path

**File:** `apps/web/e2e/customer.spec.ts`

```ts
test("customer can create a project", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.fill('[name="email"]', "brand@example.com");
  await page.fill('[name="password"]', "brand123");
  await page.click('[type="submit"]');
  await page.waitForURL("/customer/dashboard");

  // Navigate to new project
  await page.goto("/customer/projects/new");
  await page.fill('[name="title"]', "E2E Test Project");
  await page.click('[type="submit"]');
  await expect(page.locator("text=E2E Test Project")).toBeVisible();
});

test("customer can view proposal", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.fill('[name="email"]', "brand@example.com");
  await page.fill('[name="password"]', "brand123");
  await page.click('[type="submit"]');

  await page.goto("/customer/proposals");
  await expect(page.locator("h1, h2")).toContainText(["Proposal", "proposal"]);
});
```

### Task 7.4 — Admin Golden Path

**File:** `apps/web/e2e/admin.spec.ts`

```ts
test("admin can view dashboard metrics", async ({ page }) => {
  await page.goto("/login");
  await page.fill('[name="email"]', "admin@gfs.com");
  await page.fill('[name="password"]', "admin123");
  await page.click('[type="submit"]');
  await page.waitForURL("/admin/dashboard");
  await expect(page.locator("h1")).toContainText("Sourcing operations");
});

test("admin can navigate to proposal builder", async ({ page }) => {
  // Login as admin
  await page.goto("/login");
  await page.fill('[name="email"]', "admin@gfs.com");
  await page.fill('[name="password"]', "admin123");
  await page.click('[type="submit"]');

  await page.goto("/admin/proposals/new");
  await expect(page.locator("h1")).toContainText("Build sourcing proposal");
});
```

---

## Milestone 8 — CI/CD Pipeline
**Goal:** Every pull request is linted, type-checked, and tested automatically.
**Effort:** ~half a day

### Task 8.1 — GitHub Actions Workflow

**File:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --build --noEmit

  api-tests:
    name: API Unit Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_USER: gfs
          POSTGRES_PASSWORD: gfs_dev
          POSTGRES_DB: gfs_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
    env:
      DATABASE_URL: postgresql://gfs:gfs_dev@localhost:5432/gfs_test
      JWT_SECRET: test-secret-must-be-32-chars-long-x
      JWT_REFRESH_SECRET: test-refresh-secret-32-chars-xxxx
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run db:generate --workspace=apps/api
      - run: npm run db:migrate --workspace=apps/api
        env:
          DATABASE_URL: postgresql://gfs:gfs_dev@localhost:5432/gfs_test
      - run: npm test --workspace=apps/api

  web-build:
    name: Next.js Build Check
    runs-on: ubuntu-latest
    env:
      NEXT_PUBLIC_API_URL: http://localhost:3000/api
      JWT_SECRET: test-secret-must-be-32-chars-long-x
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build --workspace=apps/web
```

### Task 8.2 — Add Missing npm Scripts

**File:** `apps/api/package.json` — ensure these scripts exist:
```json
"db:generate": "prisma generate",
"db:migrate": "prisma migrate deploy",
"db:seed": "ts-node -r tsconfig-paths/register prisma/seed.ts",
"test:e2e": "jest --config test/jest-e2e.json"
```

**File:** `package.json` (root):
```json
"test": "turbo run test",
"test:e2e": "turbo run test:e2e"
```

---

## Milestone 9 — UX Polish & Accessibility
**Goal:** The UI is trustworthy, consistent, and accessible before handing to real users.
**Effort:** ~1–2 days

### Task 9.1 — Page Metadata (SEO + Browser Title)

Every portal page shows a generic title from the root layout: "Green Fashion Solution". Each page should export its own metadata or use `generateMetadata`.

**Pattern to apply to all portal pages:**

Customer portal pages — in each `page.tsx`, add at the top (server component pattern) or use `useEffect` on the client:
```tsx
// For server pages (no "use client"):
export const metadata = { title: "My Projects — GFS" };

// For client pages:
import { useEffect } from "react";
useEffect(() => { document.title = "Proposals — GFS" }, []);
```

Priority pages to update:
- `app/admin/dashboard/page.tsx` → "Dashboard — GFS Admin"
- `app/admin/proposals/page.tsx` → "Proposal Builder — GFS Admin"
- `app/customer/proposals/page.tsx` → "My Proposals — GFS"
- `app/customer/projects/page.tsx` → "My Projects — GFS"
- `app/designer/assets/fabrics/page.tsx` → "Fabrics Library — GFS Designer"
- `app/(public)/page.tsx` → already has root metadata — verify it matches the brand

### Task 9.2 — Loading Skeleton Audit

Every data-fetching page must show a skeleton while loading. Audit all 54 routes:

1. Every route that calls a data hook must have `if (isLoading) return <RouteSkeleton variant="..." />` as the first return.
2. The `variant` should match the page shape (`"dashboard"`, `"list"`, `"detail"`, `"form"`).
3. Pages that currently return `null` while loading must be updated — a blank white screen during load is a UX regression.

Run through every `page.tsx` and check for this pattern. Prioritise: admin dashboard, customer proposals, designer assets.

### Task 9.3 — Empty State Audit

Every list page must have a meaningful empty state with a call-to-action, not just "No items found".

| Page | Empty state message | CTA |
|------|-------------------|-----|
| `/admin/proposals` | "No proposals yet. Start by selecting assets from the sourcing library." | "Build proposal" → `/admin/proposals/new` |
| `/admin/tasks` | "No tasks assigned. Create a sourcing brief to assign research tasks to your designers." | "Assign task" |
| `/customer/proposals` | "No proposals ready yet. Your sourcing team is working on your collection." | "View project" |
| `/designer/assets/fabrics` | "No fabrics uploaded yet. Start building your sourcing library." | "Upload fabric" |
| `/admin/leads` | "No leads yet. Your landing page lead form will populate this list." | null |

Check `components/shared/empty-state.tsx` — if the component supports `emptyActionHref` and `emptyActionLabel`, ensure all list pages pass them.

### Task 9.4 — WebSocket Reconnection

**File:** `apps/web/components/shared/notifications-socket-provider.tsx`

Add exponential backoff on disconnect. The socket.io client supports this natively:

```ts
const socket = io(WS_URL, {
  auth: { token: accessToken },
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  randomizationFactor: 0.5,
});
```

Ensure the `accessToken` is refreshed before reconnection attempts when a 401 is the disconnect cause.

### Task 9.5 — Mobile Responsiveness Audit

All portals must be fully usable on a 375px viewport (iPhone SE). Walk through:

1. **Sidebar nav** — must collapse to a hamburger on mobile. Check `apps/web/components/shell/sidebar-nav.tsx`. If it's always visible, add a `Sheet` from shadcn/ui for mobile.
2. **Proposal builder** — the 2-column layout (`flex min-h-full` with an `xl:flex` aside) collapses correctly at <xl. Verify the aside (AI agent panel) doesn't break layout on tablet.
3. **Moodboard canvas** — pan and zoom must work with touch events. Check `use-canvas-keyboard.ts` and the canvas component for pointer event support.
4. **Admin tables** (after Milestone 2) — add `overflow-x-auto` wrapper around all `<Table>` components.

### Task 9.6 — Dark Mode Toggle in All Portals

`ThemeProvider` is wired in `providers.tsx` with `attribute="class"`. A toggle exists as `components/shared/theme-toggle` (if it exists — check). Ensure it's surfaced in the header/avatar menu of all 3 portals (customer, designer, admin).

If `theme-toggle.tsx` doesn't exist, create it:
```tsx
"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
```

Add `<ThemeToggle />` to the portal header component (`components/shell/portal-header.tsx`).

---

## Milestone 10 — Pre-Launch Checklist
**Goal:** Nothing left that blocks a real user from completing their workflow.
**Effort:** ~half a day

### Task 10.1 — Verify All API Endpoints Exist

Run through every API call in `apps/web/lib/api/` and confirm the corresponding NestJS route exists and returns the expected shape. Key ones to verify:

- `PATCH /api/proposals/:id` — accepts `sections` array (for Task 1.1 edit page)
- `GET /api/projects/:id/agent-context` — returns fabrics, products, inspirationSelections
- `DELETE /api/proposals/:id` — exists and is ADMIN-only
- `GET /api/brief-options?type=SEASON` — returns list of brief option values
- `POST /api/meetings` (customer creates) vs `PATCH /api/meetings/:id` (admin approves)

### Task 10.2 — Swagger Documentation Review

Visit `http://localhost:3000/api/docs` after seeding. Verify:
- All 25 modules appear
- Auth endpoints are marked as `@Public()` or have bearer auth
- DTO schemas show correct field types
- No `any` types in the Swagger output

### Task 10.3 — Environment Variables Cross-Check

Compare `.env.example` against every `process.env.*` reference in both apps. Add any missing vars to `.env.example` with comments.

Critical vars that must be in `.env.example`:
```
# API
DATABASE_URL=postgresql://gfs:gfs_dev@localhost:5433/gfs
DIRECT_URL=postgresql://gfs:gfs_dev@localhost:5433/gfs
JWT_SECRET=                         # min 32 chars — generate with: openssl rand -hex 32
JWT_REFRESH_SECRET=                  # min 32 chars
REDIS_URL=redis://localhost:6379
CORS_ORIGINS=http://localhost:3001
WEB_URL=http://localhost:3001        # used in email links
RESEND_API_KEY=                      # from https://resend.com
EMAIL_FROM=noreply@yourdomain.com
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
AZURE_TENANT_ID=                     # optional — Teams meeting links
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=

# Web
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=http://localhost:3000
JWT_SECRET=                          # must match API
CEREBRAS_API_KEY=                    # from https://cloud.cerebras.ai
CEREBRAS_MODEL_CHAT=moonshotai/Kimi-K2.6
OLLAMA_API_KEY=                      # from https://ollama.com
OLLAMA_HOST=https://ollama.com
OLLAMA_MODEL_VISION=qwen3-vl:8b
OLLAMA_MODEL_EMBED=embeddinggemma
OLLAMA_MODEL_IMAGE=x/z-image-turbo
```

### Task 10.4 — Smoke Test All Three Portals

Follow `docs/SMOKE_TEST.md`. If that doc is outdated, update it with:

**Customer flow:**
1. Register as customer
2. Create project (fill brief)
3. View inspiration assets
4. Create moodboard + add items via AI chat
5. View proposal (once admin creates one)
6. Approve or request changes
7. Request meeting

**Designer flow:**
1. Login as designer
2. Upload fabric (with image + keywords)
3. Upload product reference
4. Create a collection
5. View and accept a task

**Admin flow:**
1. Login as admin
2. View dashboard overview
3. Assign task to designer on a project
4. Build new proposal: select project, pick fabrics + products, write style summary
5. Send proposal to client
6. Edit proposal after sending (Milestone 1.1)
7. Approve a meeting request
8. Review audit logs

### Task 10.5 — Final Build Verification

```bash
# From repo root
docker-compose up -d
cd apps/api && npm run db:migrate && npm run db:seed
npm run build
```

Both `apps/api` and `apps/web` must build with zero TypeScript errors. No `console.error` output during build.

---

## Execution Order Summary

| Milestone | Description | Priority | Effort |
|-----------|-------------|----------|--------|
| **1** | Core functional blockers (proposal edit page, draft mode) | P0 | 1 day |
| **4** | Database seed | P1 | 0.5 day |
| **2** | Missing shadcn components | P1 | 0.5 day |
| **3** | Email templates | P1 | 0.5 day |
| **5** | Security hardening | P2 | 0.5 day |
| **9** | UX polish & accessibility | P2 | 1.5 days |
| **6** | Backend unit tests | P1 | 2 days |
| **7** | Playwright e2e tests | P1 | 2 days |
| **8** | CI/CD pipeline | P1 | 0.5 day |
| **10** | Pre-launch checklist | P0 | 0.5 day |

**Total estimated effort: ~9–10 days of focused development.**

After completing all milestones, the platform is production-ready for real customer and designer onboarding.
