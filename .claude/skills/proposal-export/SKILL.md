# Proposal Export Skill

Use when admin builds, previews, saves, or exports a sourcing proposal.

## Proposal Structure (5 Sections)

Every proposal follows this exact order:

| # | Section | category field |
|---|---------|---------------|
| 1 | Cover — title, season, brand, styleSummary (2-3 sentence creative narrative) | `cover` |
| 2 | Creative Direction — mood, color story, silhouette language, key fabric families | `creative-direction` |
| 3 | Fabric Proposals — grouped by garment category | `outerwear` / `tops` / `bottoms` / `knitwear` / `other` |
| 4 | Product References — silhouette references per category with construction notes | `other` |
| 5 | Next Steps — unmet requirements, sampling timeline, open tasks | `other` |

Sections 3 and 4 may be split by garment category (e.g. "Outerwear Fabrics", "Tops & Shirting") — max 8 sections total.

## Asset Hierarchy within a section

Each section's items follow visual weight order:
- `hero` — lead fabric or garment, most story-carrying
- `secondary` — supporting options
- `accent` — finishing detail or contrast element

## Workflow

1. `loadProjectContext` — always first
2. `findAssets` (once per section category, e.g. focus="fabric", category="outerwear")
3. `listProjectTasks` — check open research tasks before building
4. `buildProposalSections` — real asset IDs only, styleSummary min 80 chars
5. `previewProposalDeck` — confirm section titles and slide count
6. `saveProposalDraft` — DRAFT status, never auto-send
7. `exportProposalDocument` (pdf or pptx) — only after saveProposalDraft returns a proposalId

## Rules

- **findAssets** is the primary search tool — do not call rankAssets + searchSourcingLibrary separately
- `positionInSection` should be set for every item (hero/secondary/accent)
- `notes` must be at least 15 characters — explain the sourcing rationale, not just the name
- `styleSummary` is the creative narrative — not a bullet list
- `unmetRequirements[]` is not a failure — it flags what still needs to be commissioned
- Export requires a saved proposalId; exportProposalDocument without it will fail
