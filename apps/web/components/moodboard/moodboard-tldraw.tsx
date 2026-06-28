'use client';

import {
  useEditor,
  DefaultContextMenu,
  DefaultContextMenuContent,
  TldrawUiMenuGroup,
  TldrawUiMenuItem,
  type TLComponents,
  type TLUiContextMenuProps,
} from 'tldraw';
import { useCanvasStore } from '@/lib/canvas/canvas-store';
import { shapeIdToMoodItemId } from '@/lib/canvas/moodboard-item-utils';
import { buildContextMenuPrompt } from '@/lib/ai/context-menu-prompts';
import { DockedStylePanel } from '@/components/moodboard/docked-style-panel';

function AgentActivityOverlay() {
  const aiLoading = useCanvasStore((s) => s.aiLoading);
  if (!aiLoading) return null;
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[4.5rem] z-[48] flex -translate-x-1/2 items-center gap-2 border border-portal-border bg-[var(--canvas-chrome-bg)] px-3.5 py-1.5 text-[11px] font-medium text-foreground backdrop-blur-[10px] whitespace-nowrap"
      aria-live="polite"
      role="status"
    >
      <span
        className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-portal-accent"
        aria-hidden="true"
      />
      Agent placing items…
    </div>
  );
}

function AiContextMenu({ children, disabled }: TLUiContextMenuProps) {
  const editor = useEditor();
  const queueAgentPrompt = useCanvasStore((s) => s.queueAgentPrompt);
  const setAiPanelOpen = useCanvasStore((s) => s.setAiPanelOpen);
  const moodItemsById = useCanvasStore((s) => s.moodItemsById);

  const selectedIds = editor.getSelectedShapeIds();
  const firstShape = selectedIds.length > 0 ? editor.getShape(selectedIds[0]!) : null;
  const isImageShape = firstShape?.type === 'image';
  const moodItemId = firstShape ? shapeIdToMoodItemId(firstShape.id) : null;
  const moodItem = moodItemId ? moodItemsById[moodItemId] : null;

  const dispatch = (prompt: string) => {
    queueAgentPrompt(prompt);
    setAiPanelOpen(true);
  };

  const dispatchAction = (action: 'regenerate' | 'variations') => {
    if (!moodItem) return;
    dispatch(buildContextMenuPrompt(action, moodItem));
  };

  return (
    <DefaultContextMenu disabled={disabled}>
      <DefaultContextMenuContent />
      {children}
      {isImageShape && moodItem && (
        <TldrawUiMenuGroup id="ai-actions">
          <TldrawUiMenuItem
            id="ai-regenerate"
            label="Regenerate with AI"
            onSelect={() => dispatchAction('regenerate')}
          />
          <TldrawUiMenuItem
            id="ai-variation"
            label="Replace with variation"
            onSelect={() => dispatchAction('variations')}
          />
        </TldrawUiMenuGroup>
      )}
    </DefaultContextMenu>
  );
}

export const MoodboardTldrawComponents = {
  HelpMenu: null,
  MenuPanel: null,
  HelperButtons: null,
  StylePanel: DockedStylePanel,
  RichTextToolbar: null,
  ImageToolbar: null,
  VideoToolbar: null,
  InFrontOfTheCanvas: AgentActivityOverlay,
  ContextMenu: AiContextMenu,
} satisfies TLComponents;
