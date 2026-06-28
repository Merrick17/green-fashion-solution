'use client';
import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/shared/section-card';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { CollectionSortableItem } from './collection-sortable-item';
import { CollectionAssetPicker } from './collection-asset-picker';
import {
  useReorderCollectionItems,
  useRemoveCollectionItem,
  useUpdateCollection,
} from '@/hooks/use-collections';
import type { Collection } from '@repo/types';
interface CollectionBoardProps {
  collection: Collection;
} /** * Visual curation board: drag-to-reorder tiles, a searchable asset picker * (sheet), cover selection, and confirm-before-remove. Reorder and cover * are persisted via the collection update/reorder APIs. */
export function CollectionBoard({ collection }: CollectionBoardProps) {
  const items = collection.items ?? [];
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const reorder = useReorderCollectionItems();
  const removeItem = useRemoveCollectionItem();
  const updateCollection = useUpdateCollection();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const existingIds = new Set([
    ...(items.map((i) => i.fabricAssetId).filter(Boolean) as string[]),
    ...(items.map((i) => i.productAssetId).filter(Boolean) as string[]),
  ]);
  const coverItemId = collection.coverItemId ?? items[0]?.id ?? null;
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const ids = items.map((i) => i.id);
    const from = ids.indexOf(e.active.id as string);
    const to = ids.indexOf(e.over.id as string);
    if (from === -1 || to === -1) return;
    reorder.mutate({ id: collection.id, itemIds: arrayMove(ids, from, to) });
  };
  const confirmRemoveItem = () => {
    if (!confirmRemove) return;
    removeItem.mutate({ collectionId: collection.id, itemId: confirmRemove });
    setConfirmRemove(null);
  };
  const setCover = (itemId: string) =>
    updateCollection.mutate({
      id: collection.id,
      dto: { coverItemId: itemId },
    });
  return (
    <>
      <SectionCard
        title={`Items (${items.length})`}
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPickerOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" /> Add assets
          </Button>
        }
      >
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No items yet. Click “Add assets” to curate this collection.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={rectSortingStrategy}
            >
              <div className="columns-2 gap-4 sm:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
                {items.map((item) => (
                  <CollectionSortableItem
                    key={item.id}
                    item={item}
                    isCover={coverItemId === item.id}
                    onSetCover={() => setCover(item.id)}
                    onRemove={() => setConfirmRemove(item.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </SectionCard>
      <CollectionAssetPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        collectionId={collection.id}
        existingIds={existingIds}
      />
      <ConfirmDialog
        open={!!confirmRemove}
        onOpenChange={(o) => !o && setConfirmRemove(null)}
        title="Remove from collection?"
        description="This removes the item from the collection. The asset itself is not deleted."
        confirmLabel="Remove"
        destructive
        onConfirm={confirmRemoveItem}
      />
    </>
  );
}
