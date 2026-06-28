'use client';
import { useSortable } from '@dnd-kit/sortable';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Sparkles, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { AgentContextAsset, ProposalChangeRequest, ProposalBudgetSection } from '@repo/types';
import type { BoardSection } from './board-state';
import { PlacedAssetTile } from './placed-asset-tile';
interface ProposalSectionCardProps {
  section: BoardSection;
  active: boolean;
  assetMap: Map<string, AgentContextAsset>;
  changeRequests?: ProposalChangeRequest[];
  sectionBudget?: ProposalBudgetSection;
  onActivate: () => void;
  onRename: (title: string) => void;
  onRemove: () => void;
  onSuggest: () => void;
  onRemoveItem: (itemKey: string) => void;
  onNotesChange: (itemKey: string, notes: string) => void;
  onUpdateAdminNotes: (notes: string) => void;
}
export function ProposalSectionCard({
  section,
  active,
  assetMap,
  changeRequests = [],
  sectionBudget,
  onActivate,
  onRename,
  onRemove,
  onSuggest,
  onRemoveItem,
  onNotesChange,
  onUpdateAdminNotes,
}: ProposalSectionCardProps) {
  const hasChangeRequests = changeRequests.length > 0;
  const subtotalMillimes = sectionBudget?.totalMillimes ?? 0;
  const subtotalDisplay = subtotalMillimes > 0
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(subtotalMillimes / 1000)
    : null;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, data: { type: 'section' } });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const sorted = [...section.items].sort((a, b) => a.position - b.position);
  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onActivate}
      className={cn(
        'border bg-portal-surface p-3 transition',
        isDragging
          ? 'opacity-60 ring-1 ring-portal-accent'
          : hasChangeRequests
            ? 'border-l-2 border-l-amber-500 border-portal-border'
            : 'border-portal-border',
        active &&
          !isDragging &&
          'border-portal-border-strong ring-1 ring-portal-accent/30',
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag section"
          className="cursor-grab touch-none text-portal-muted hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <Input
          value={section.title}
          onChange={(e) => onRename(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          aria-label="Section title"
          className="h-7 flex-1 border-transparent bg-transparent px-1 font-serif text-base"
        />
        <span className="shrink-0 text-[10px] tabular-nums text-portal-muted">
          {sorted.length}
        </span>
        {subtotalDisplay && (
          <span className="shrink-0 text-[10px] tabular-nums text-portal-muted">
            {subtotalDisplay}
          </span>
        )}
        {hasChangeRequests && (
          <span className="shrink-0 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
            {changeRequests.length} change{changeRequests.length > 1 ? 's' : ''}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove section"
          className="shrink-0 p-1 text-portal-muted hover:bg-portal-surface-muted hover:text-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <SortableContext
        items={sorted.map((it) => it.key)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {sorted.map((it) => (
            <PlacedAssetTile
              key={it.key}
              itemKey={it.key}
              sectionId={section.id}
              asset={assetMap.get(it.assetId)}
              kind={it.kind}
              notes={it.notes}
              onRemove={() => onRemoveItem(it.key)}
              onNotesChange={(v) => onNotesChange(it.key, v)}
            />
          ))}
        </div>
      </SortableContext>
      {sorted.length === 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSuggest();
          }}
          className="flex w-full items-center justify-center gap-1.5 border border-dashed border-portal-border py-3 text-xs text-portal-muted transition hover:text-foreground"
        >
          <Sparkles className="h-3.5 w-3.5" /> Suggest from moodboard
        </button>
      )}
      <details className="mt-2" onClick={(e) => e.stopPropagation()}>
        <summary className="cursor-pointer select-none text-[10px] text-portal-muted">
          Internal notes
        </summary>
        <textarea
          className="mt-1 w-full resize-none border border-border bg-transparent p-2 text-xs"
          placeholder="Notes for your team — not visible to client"
          value={section.adminNotes ?? ''}
          onChange={(e) => onUpdateAdminNotes(e.target.value)}
          rows={2}
        />
      </details>
    </div>
  );
}
