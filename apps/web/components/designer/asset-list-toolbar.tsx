'use client';
import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
interface AssetListToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  /** Flat list of keyword arrays from the current page of assets. */ keywords: string[][];
  activeKeyword: string | null;
  onKeywordChange: (k: string | null) => void;
  placeholder?: string;
} /** * Search input (server-side via the `search` query param) plus keyword chips * derived from the current page for quick client-side filtering. */
export function AssetListToolbar({
  search,
  onSearchChange,
  keywords,
  activeKeyword,
  onKeywordChange,
  placeholder,
}: AssetListToolbarProps) {
  const chips = useMemo(
    () =>
      [...new Set(keywords.flat().map((k) => k.toLowerCase()))]
        .sort()
        .slice(0, 12),
    [keywords],
  );
  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder ?? 'Search by name or keyword…'}
          className="pl-9"
        />
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Chip
            active={activeKeyword === null}
            onClick={() => onKeywordChange(null)}
          >
            All
          </Chip>
          {chips.map((k) => (
            <Chip
              key={k}
              active={activeKeyword === k}
              onClick={() => onKeywordChange(activeKeyword === k ? null : k)}
            >
              {k}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'border px-3 py-1 text-xs transition-colors',
        active
          ? 'border-portal-accent bg-portal-accent-soft text-portal-accent'
          : 'border-portal-border bg-portal-surface text-portal-muted hover:border-portal-accent/40 hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
