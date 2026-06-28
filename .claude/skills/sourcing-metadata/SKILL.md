# Sourcing Metadata Skill

Use when designers upload, create, or refine sourcing library assets.

## Required Metadata Checklist

Every asset must be complete before creation — reject incomplete uploads:

### Fabric Assets

| Field | Required | Format / Example |
|-------|----------|-----------------|
| `name` | ✓ | Descriptive + season: "Enzyme-washed linen shirting SS26" |
| `description` | ✓ | composition · weight · width · finish · handle — in order. "55% linen 45% cotton, 185 g/m², 145 cm, enzyme-washed, soft handle, drapes well, min order 300m" |
| `keywords` | ✓ min 5 | fiber type, construction, season, color family, garment end-use |
| `composition` | ✓ | "55% linen, 45% cotton" — percentage breakdown |
| `weightGsm` | ✓ | Numeric g/m²: 185 |
| `widthCm` | ✓ | Numeric cm: 145 |
| `colorName` | ✓ | Human name: "ecru", "forest", "blush" — never hex |
| `season` | ✓ | "SS26", "AW26", "Resort 2026" |
| `finish` | if known | "enzyme-washed", "mercerized", "brushed", "calendered" |
| `moq` | if known | Metres as integer: 300 |

### Product Reference Assets

| Field | Required | Format / Example |
|-------|----------|-----------------|
| `name` | ✓ | Garment type + season: "Oversized linen blazer SS26" |
| `description` | ✓ | Silhouette, construction, category: "relaxed fit blazer, notched lapel, unstructured, patch pockets" |
| `keywords` | ✓ min 3 | garment type, silhouette, season, aesthetic, fabric suggestion |
| `garmentCategory` | ✓ | "outerwear" / "tops" / "bottoms" / "knitwear" / "denim" / "accessories" |
| `season` | ✓ | "SS26", "AW26" |
| `colorName` | if known | Human name: "ivory" |

## Keyword Standards

**Good keywords** cover all these dimensions: fiber · construction · season · color family · garment end-use

✓ `["linen", "natural fiber", "plain weave", "SS26", "ecru", "lightweight", "shirting", "resort"]`
✗ `["fabric", "nice", "summer"]` — too vague

## Fiber Type Reference

Natural: linen · cotton · wool · silk · cashmere · mohair · alpaca · hemp  
Synthetic: polyester · nylon · acetate · viscose · modal · lyocell · Tencel  
Blended: linen-cotton · silk-cotton · wool-cashmere · cotton-modal

## Construction Terms

Wovens: plain weave · twill · satin · crepe · jacquard · dobby · gauze · poplin · canvas · oxford  
Knits: jersey · rib · interlock · piqué · fleece · boucle · waffle · ponte

## Finish Glossary

enzyme-washed · stone-washed · mercerized · brushed · calendered · embossed · coated · waxed · crinkled · pleated

## Workflow

1. `listMyTasks` → `getTaskDetail` (read deliverables before starting)
2. `requestAssetUpload` → receive upload URL → upload image externally
3. `createFabricAsset` or `createProductAsset` with COMPLETE metadata
4. `updateAssetMetadata` to refine keywords after visual review
5. `addToCollection` (group by season and category)
6. `updateTaskProgress` (IN_PROGRESS) → `completeTask` when all deliverables met

## Rules

- Never invent MOQs, pricing, or supplier codes you don't have
- Never create an asset without at least 5 keywords
- Use `searchMyAssets` before uploading — avoid duplicates
- description format is always: composition · weight · width · finish · handle (in that order)
