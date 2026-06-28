'use client';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFabrics, useProducts } from '@/hooks/use-assets';
import { useAddCollectionItem } from '@/hooks/use-collections';
import { AssetImage } from './asset-image';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
interface CollectionAssetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  existingIds: Set<string>;
} /** * Searchable visual asset picker in a right-side sheet. Fabrics/Products tabs, * a live search filter, and a scrollable grid of asset tiles (replacing the * old limit:100 wall-of-buttons). Already-added assets are dimmed/disabled. */
export function CollectionAssetPicker({
  open,
  onOpenChange,
  collectionId,
  existingIds,
}: CollectionAssetPickerProps) {
  const [tab, setTab] = useState<'fabric' | 'product'>('fabric');
  const [query, setQuery] = useState('');
  const fabrics = useFabrics({ page: 1, limit: 100 });
  const products = useProducts({ page: 1, limit: 100 });
  const addItem = useAddCollectionItem();
  const list =
    tab === 'fabric' ? (fabrics.data?.data ?? []) : (products.data?.data ?? []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.keywords?.some((k) => k.includes(q)),
    );
  }, [list, query]);
  const add = (assetId: string) => {
    const dto =
      tab === 'fabric'
        ? { fabricAssetId: assetId }
        : { productAssetId: assetId };
    addItem.mutate(
      { id: collectionId, dto },
      {
        onSuccess: () => toast.success('Added to collection'),
        onError: () => toast.error('Could not add asset'),
      },
    );
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add assets</SheetTitle>
        </SheetHeader>
        <div className="space-y-3 px-4">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as 'fabric' | 'product')}
          >
            <TabsList className="w-full">
              <TabsTrigger value="fabric" className="flex-1">
                Fabrics
              </TabsTrigger>
              <TabsTrigger value="product" className="flex-1">
                Products
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or keyword…"
              className="pl-9"
            />
          </div>
          <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto pb-4">
            {filtered.map((a) => {
              const added = existingIds.has(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  disabled={added || addItem.isPending}
                  onClick={() => add(a.id)}
                  className={cn(
                    'border border-border bg-card overflow-hidden text-left transition-opacity hover:ring-1 hover:ring-accent',
                    added && 'pointer-events-none opacity-50',
                  )}
                >
                  <AssetImage
                    src={a.imageUrl}
                    alt={a.name}
                    className="aspect-square w-full object-cover"
                  />
                  <p className="line-clamp-1 p-2 text-xs font-medium">
                    {added ? 'Added' : a.name}
                  </p>
                </button>
              );
            })}
            {!filtered.length && (
              <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">
                No matches
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
