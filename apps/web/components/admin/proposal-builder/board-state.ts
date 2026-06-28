import type {
  AgentContextAsset,
  AgentContextInspirationSelection,
  Proposal,
  ProposalDraft,
  AssetKind,
} from '@repo/types';

export type { AssetKind };

export type BoardItem = {
  key: string;
  kind: AssetKind;
  assetId: string;
  notes: string;
  position: number;
};

export type BoardSection = {
  id: string;
  isNew: boolean;
  title: string;
  description?: string;
  adminNotes?: string;
  position: number;
  items: BoardItem[];
};

export type SaveItem = {
  fabricAssetId?: string;
  productAssetId?: string;
  notes?: string;
  position: number;
};

export type SaveSection = {
  id?: string;
  title: string;
  description?: string;
  adminNotes?: string;
  position: number;
  items: SaveItem[];
};

let seq = 0;
export const uid = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${(seq += 1)}`;

export function buildAssetMap(
  fabrics: AgentContextAsset[],
  products: AgentContextAsset[],
): Map<string, AgentContextAsset> {
  const map = new Map<string, AgentContextAsset>();
  for (const f of fabrics) map.set(f.id, f);
  for (const p of products) map.set(p.id, p);
  return map;
}

export function emptyBoard(title = 'Sourcing Assets'): BoardSection[] {
  return [{ id: uid('sec'), isNew: true, title, position: 0, items: [] }];
}

export function boardFromProposal(proposal: Proposal): BoardSection[] {
  const sections = [...(proposal.sections ?? [])].sort(
    (a, b) => a.position - b.position,
  );
  if (!sections.length) return emptyBoard();
  return sections.map((s) => ({
    id: s.id,
    isNew: false,
    title: s.title,
    description: s.description ?? undefined,
    adminNotes: s.adminNotes ?? undefined,
    position: s.position,
    items: [...s.items]
      .sort((a, b) => a.position - b.position)
      .map((i) => ({
        key: uid('it'),
        kind: (i.fabricAssetId ? 'fabric' : 'product') as AssetKind,
        assetId: (i.fabricAssetId ?? i.productAssetId ?? '') as string,
        notes: i.notes ?? '',
        position: i.position,
      })),
  }));
}

export function boardFromSelections(
  selections: AgentContextInspirationSelection[] | undefined,
  title = 'Sourcing Assets',
): BoardSection[] {
  const picked = (selections ?? []).filter((s) => s.action === 'SELECTED');
  const items: BoardItem[] = [];
  for (const s of picked) {
    if (s.fabricAssetId) {
      items.push({
        key: uid('it'),
        kind: 'fabric',
        assetId: s.fabricAssetId,
        notes: '',
        position: items.length,
      });
    } else if (s.productAssetId) {
      items.push({
        key: uid('it'),
        kind: 'product',
        assetId: s.productAssetId,
        notes: '',
        position: items.length,
      });
    }
  }
  return [{ id: uid('sec'), isNew: true, title, position: 0, items }];
}

export function boardFromDraft(
  draft: ProposalDraft,
  assetMap: Map<string, AgentContextAsset>,
  fallbackTitle = 'Sourcing Assets',
): BoardSection[] {
  if (!draft.sections?.length) {
    return emptyBoard(draft.title ?? fallbackTitle);
  }
  return draft.sections.map((sec, si) => ({
    id: uid('sec'),
    isNew: true,
    title: sec.title,
    description: sec.description ?? undefined,
    position: si,
    items: sec.items
      .map((it, ii) => {
        const assetId = it.fabricAssetId ?? it.productAssetId ?? '';
        if (!assetId || !assetMap.has(assetId)) return null;
        return {
          key: uid('it'),
          kind: (it.fabricAssetId ? 'fabric' : 'product') as AssetKind,
          assetId,
          notes: it.notes ?? '',
          position: ii,
        };
      })
      .filter((it): it is BoardItem => it !== null),
  }));
}

export function toSaveSections(sections: BoardSection[]): SaveSection[] {
  return [...sections]
    .sort((a, b) => a.position - b.position)
    .map((s, sIdx) => {
      const out: SaveSection = {
        title: s.title.trim() || 'Untitled section',
        description: s.description,
        adminNotes: s.adminNotes || undefined,
        position: sIdx,
        items: [...s.items]
          .sort((a, b) => a.position - b.position)
          .map((it, iIdx) => ({
            ...(it.kind === 'fabric'
              ? { fabricAssetId: it.assetId }
              : { productAssetId: it.assetId }),
            notes: it.notes.trim() || undefined,
            position: iIdx,
          })),
      };
      if (!s.isNew) out.id = s.id;
      return out;
    });
}

const byPos = (a: BoardItem, b: BoardItem) => a.position - b.position;

export function reindexItems(items: BoardItem[]): BoardItem[] {
  return items.map((it, i) => ({ ...it, position: i }));
}

export function reorderItemsPure(
  items: BoardItem[],
  activeKey: string,
  overKey: string,
): BoardItem[] {
  const sorted = [...items].sort(byPos);
  const from = sorted.findIndex((it) => it.key === activeKey);
  const to = sorted.findIndex((it) => it.key === overKey);
  if (from < 0 || to < 0 || from === to) return items;
  const [moved] = sorted.splice(from, 1);
  if (!moved) return items;
  sorted.splice(to, 0, moved);
  return reindexItems(sorted);
}

export function insertItemPure(
  items: BoardItem[],
  moved: BoardItem,
  overKey: string | null,
): BoardItem[] {
  const sorted = [...items].sort(byPos);
  const pos = overKey
    ? sorted.findIndex((it) => it.key === overKey)
    : sorted.length;
  const insertAt = pos < 0 ? sorted.length : pos;
  const next = [...sorted];
  next.splice(insertAt, 0, { ...moved, position: insertAt });
  return reindexItems(next);
}
