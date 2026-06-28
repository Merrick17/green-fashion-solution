'use client';
import { useMemo, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { AgentContextAsset, AgentContextMoodboard, AssetKind, AssetTab } from '@repo/types';
import { ProposalMoodboardSummary } from '@/components/admin/proposal-moodboard-summary';
import { AssetSourceTile } from './asset-source-tile';
interface AssetSourcePanelProps {
  fabrics: AgentContextAsset[];
  products: AgentContextAsset[];
  moodboards: AgentContextMoodboard[];
  placedAssetIds: Set<string>;
  onAdd: (assetId: string, kind: AssetKind) => void;
  className?: string;
  projectId?: string;
}
type Tab = AssetTab;
const TAB_LABEL: Record<Tab, string> = {
  all: 'All',
  fabric: 'Fabrics',
  product: 'References',
};

function scoreMoodboardMatch(asset: AgentContextAsset, moodboardKeywords: string[]): number {
  if (!moodboardKeywords.length) return 0;
  return asset.keywords.filter((k) => moodboardKeywords.includes(k.toLowerCase())).length;
}

export function AssetSourcePanel({
  fabrics,
  products,
  moodboards,
  placedAssetIds,
  onAdd,
  className,
  projectId: _projectId,
}: AssetSourcePanelProps) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [matchBrief, setMatchBrief] = useState(false);

  const moodboardKeywords = useMemo(
    () =>
      moodboards
        .flatMap((m) => [...(m.fabricSuggestions ?? []), ...(m.colorPalette ?? [])])
        .map((k) => k.toLowerCase()),
    [moodboards],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (a: AgentContextAsset) =>
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.keywords.some((k) => k.toLowerCase().includes(q));
    let fab = fabrics
      .filter(matches)
      .map((a) => ({ asset: a, kind: 'fabric' as AssetKind }));
    let prod = products
      .filter(matches)
      .map((a) => ({ asset: a, kind: 'product' as AssetKind }));

    if (matchBrief && moodboardKeywords.length > 0) {
      fab = [...fab].sort(
        (a, b) =>
          scoreMoodboardMatch(b.asset, moodboardKeywords) -
          scoreMoodboardMatch(a.asset, moodboardKeywords),
      );
      prod = [...prod].sort(
        (a, b) =>
          scoreMoodboardMatch(b.asset, moodboardKeywords) -
          scoreMoodboardMatch(a.asset, moodboardKeywords),
      );
    }

    if (tab === 'fabric') return fab;
    if (tab === 'product') return prod;
    return [...fab, ...prod];
  }, [fabrics, products, query, tab, matchBrief, moodboardKeywords]);

  const hasUnavailableAssets = useMemo(() => {
    const allAssets = [...fabrics, ...products];
    return allAssets.some(
      (a) =>
        placedAssetIds.has(a.id) &&
        (a as { availabilityStatus?: string }).availabilityStatus &&
        (a as { availabilityStatus?: string }).availabilityStatus !== 'AVAILABLE',
    );
  }, [fabrics, products, placedAssetIds]);

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div className="space-y-3 overflow-y-auto border-b border-portal-border p-3">
        {moodboards.length > 0 && (
          <ProposalMoodboardSummary moodboards={moodboards} />
        )}
        {moodboards.length > 0 && (
          <button
            type="button"
            onClick={() => setMatchBrief((v) => !v)}
            className={cn(
              'flex w-full items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition',
              matchBrief
                ? 'bg-[--portal-accent] text-white'
                : 'border border-portal-border text-portal-muted hover:text-foreground',
            )}
          >
            <Sparkles className="h-3 w-3" />
            {matchBrief ? 'Matching brief' : 'Match to brief'}
          </button>
        )}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-portal-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fabrics & references"
            className="h-8 pl-8 text-sm"
          />
        </div>
        <div className="flex gap-1">
          {(Object.keys(TAB_LABEL) as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                ' px-2.5 py-1 text-xs font-medium transition',
                tab === t
                  ? 'bg-portal-surface-muted text-foreground'
                  : 'text-portal-muted hover:text-foreground',
              )}
            >
              {TAB_LABEL[t]}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-xs text-portal-muted">
            No assets match your search.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map(({ asset, kind }) => (
              <AssetSourceTile
                key={asset.id}
                asset={asset}
                placed={placedAssetIds.has(asset.id)}
                onAdd={() => onAdd(asset.id, kind)}
              />
            ))}
          </div>
        )}
      </div>
      {hasUnavailableAssets && (
        <p className="border-t border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          ⚠ Some selected assets may be unavailable.
        </p>
      )}
    </div>
  );
}
