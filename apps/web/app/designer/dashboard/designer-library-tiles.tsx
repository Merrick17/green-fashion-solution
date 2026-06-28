'use client';
import Link from 'next/link';
import { Layers, Shirt } from 'lucide-react';
interface DesignerLibraryTilesProps {
  fabricCount: number;
  productCount: number;
}
export function DesignerLibraryTiles({
  fabricCount,
  productCount,
}: DesignerLibraryTilesProps) {
  return (
    <section className="shrink-0">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Library</h3>
      <div className="grid gap-6 grid-cols-2">
        <Link
          href="/designer/assets/fabrics"
          className="group flex flex-col gap-3 border border-portal-border bg-portal-surface p-[var(--spacing-card-pad)] transition-all"
        >
          <div className="flex h-9 w-9 items-center justify-center bg-secondary text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Fabrics</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {fabricCount} assets
            </p>
          </div>
        </Link>
        <Link
          href="/designer/assets/products"
          className="group flex flex-col gap-3 border border-portal-border bg-portal-surface p-[var(--spacing-card-pad)] transition-all"
        >
          <div className="flex h-9 w-9 items-center justify-center bg-secondary text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <Shirt className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Products</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {productCount} refs
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
