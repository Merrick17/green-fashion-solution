'use client';
import { Check, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { AgentContextAsset } from '@repo/types';
type ItemNotes = Record<string, string>;
interface AssetPickerGridProps {
  fabrics: AgentContextAsset[];
  products: AgentContextAsset[];
  selectedFabrics: string[];
  selectedProducts: string[];
  itemNotes: ItemNotes;
  onToggleFabric: (id: string) => void;
  onToggleProduct: (id: string) => void;
  onNoteChange: (key: string, value: string) => void;
}
function VisualTile({
  asset,
  selected,
  note,
  onToggle,
  onNoteChange,
}: {
  asset: AgentContextAsset;
  selected: boolean;
  note: string;
  onToggle: () => void;
  onNoteChange: (value: string) => void;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden border bg-portal-surface',
        selected
          ? 'border-portal-accent ring-1 ring-portal-accent/30'
          : 'border-portal-border',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="group relative block w-full text-left"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-portal-surface-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.imageUrl}
            alt={asset.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center border border-portal-border bg-portal-surface">
            {selected ? (
              <Check className="h-3.5 w-3.5 text-portal-accent" />
            ) : (
              <Plus className="h-3.5 w-3.5 text-foreground" />
            )}
          </span>
        </div>
        <div className="p-2.5">
          <p className="truncate text-xs font-medium text-foreground">
            {asset.name}
          </p>
        </div>
      </button>
      {selected && (
        <div className="px-2.5 pb-2.5">
          <Input
            className="text-xs"
            placeholder="Per-item notes…"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
export function AssetPickerGrid({
  fabrics,
  products,
  selectedFabrics,
  selectedProducts,
  itemNotes,
  onToggleFabric,
  onToggleProduct,
  onNoteChange,
}: AssetPickerGridProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Fabrics</h3>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {fabrics.map((f) => (
            <VisualTile
              key={f.id}
              asset={f}
              selected={selectedFabrics.includes(f.id)}
              note={itemNotes[`fabric:${f.id}`] ?? ''}
              onToggle={() => onToggleFabric(f.id)}
              onNoteChange={(v) => onNoteChange(`fabric:${f.id}`, v)}
            />
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">References</h3>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {products.map((p) => (
            <VisualTile
              key={p.id}
              asset={p}
              selected={selectedProducts.includes(p.id)}
              note={itemNotes[`product:${p.id}`] ?? ''}
              onToggle={() => onToggleProduct(p.id)}
              onNoteChange={(v) => onNoteChange(`product:${p.id}`, v)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
