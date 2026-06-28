'use client';
import { useMemo } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AgentContextAsset, ProposalChangeRequest, ProposalBudgetSection } from '@repo/types';
import type { UseProposalBoard } from './use-proposal-board';
import { ProposalSectionCard } from './proposal-section-card';
interface ProposalBoardProps {
  board: UseProposalBoard;
  assetMap: Map<string, AgentContextAsset>;
  onSuggest: () => void;
  changeRequests?: ProposalChangeRequest[];
  budgetPerSection?: ProposalBudgetSection[];
}
export function ProposalBoard({
  board,
  assetMap,
  onSuggest,
  changeRequests = [],
  budgetPerSection = [],
}: ProposalBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );
  const sorted = useMemo(
    () => [...board.sections].sort((a, b) => a.position - b.position),
    [board.sections],
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;
    if (activeType === 'section') {
      const targetSectionId =
        overType === 'item'
          ? (over.data.current?.sectionId as string)
          : String(over.id);
      board.reorderSections(String(active.id), targetSectionId);
      return;
    }
    if (activeType === 'item') {
      const fromSectionId = active.data.current?.sectionId as string;
      const toSectionId =
        overType === 'item'
          ? (over.data.current?.sectionId as string)
          : String(over.id);
      if (fromSectionId === toSectionId) {
        board.reorderItems(fromSectionId, String(active.id), String(over.id));
      } else {
        board.moveItem(
          fromSectionId,
          toSectionId,
          String(active.id),
          overType === 'item' ? String(over.id) : null,
        );
      }
    }
  };
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-3 p-4">
        <SortableContext
          items={sorted.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sorted.map((s) => (
            <ProposalSectionCard
              key={s.id}
              section={s}
              active={board.activeSectionId === s.id}
              assetMap={assetMap}
              changeRequests={changeRequests.filter((cr) => cr.sectionId === s.id)}
              sectionBudget={budgetPerSection.find((b) => b.sectionId === s.id)}
              onActivate={() => board.setActiveSection(s.id)}
              onRename={(t) => board.renameSection(s.id, t)}
              onRemove={() => board.removeSection(s.id)}
              onSuggest={onSuggest}
              onRemoveItem={(key) => board.removeItem(s.id, key)}
              onNotesChange={(key, v) => board.updateItemNotes(s.id, key, v)}
              onUpdateAdminNotes={(v) => board.updateSectionAdminNotes(s.id, v)}
            />
          ))}
        </SortableContext>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-dashed"
          onClick={board.addSection}
        >
          <Plus className="h-3.5 w-3.5" /> Add section
        </Button>
      </div>
    </DndContext>
  );
}
