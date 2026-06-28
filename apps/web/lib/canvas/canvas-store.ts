import { create } from "zustand";
import type { CanvasViewport, MoodItem } from "@repo/types";

interface DragState {
  itemId: string;
  startX: number;
  startY: number;
  itemStartX: number;
  itemStartY: number;
}

interface ResizeState {
  itemId: string;
  handle: string;
  startX: number;
  startY: number;
  itemStartX: number;
  itemStartY: number;
  itemStartW: number;
  itemStartH: number;
}

interface HistoryEntry {
  items: MoodItem[];
  timestamp: number;
}

export type CanvasToolType = "select" | "pan" | "image" | "text" | "color" | "draw";

interface CanvasState {
  viewport: CanvasViewport;
  activeTool: CanvasToolType;
  selectedItemIds: string[];
  dragState: DragState | null;
  resizeState: ResizeState | null;
  isPanning: boolean;
  isDragging: boolean;
  aiPanelOpen: boolean;
  // Bumped each time the moodboard AI agent finishes a turn, so the canvas
  // can reframe to reveal agent-created/changed shapes.
  aiTurnCounter: number;
  // True while the AI agent is actively generating (set from onLoadingChange callback).
  aiLoading: boolean;
  // Prompt queued by in-canvas UI (e.g. tldraw context menu); consumed by canvas-page-content.
  queuedAgentPrompt: string | null;
  moodItemsById: Record<string, MoodItem>;
  exportCanvas: ((format: "pdf" | "png" | "svg") => Promise<void>) | null;
  // Undo/redo
  history: HistoryEntry[];
  historyIndex: number;
}

interface CanvasActions {
  setViewport: (viewport: Partial<CanvasViewport>) => void;
  setActiveTool: (tool: CanvasToolType) => void;
  zoomTo: (zoom: number, center?: { x: number; y: number }) => void;
  selectItems: (ids: string[]) => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  selectAll: (allIds: string[]) => void;
  startDrag: (drag: DragState) => void;
  updateDrag: (x: number, y: number) => { itemId: string; newX: number; newY: number } | null;
  endDrag: () => void;
  startResize: (resize: ResizeState) => void;
  updateResize: (x: number, y: number) => { itemId: string; newX: number; newY: number; newW: number; newH: number } | null;
  endResize: () => void;
  startPanning: () => void;
  stopPanning: () => void;
  toggleAiPanel: () => void;
  setAiPanelOpen: (open: boolean) => void;
  setAiLoading: (loading: boolean) => void;
  queueAgentPrompt: (prompt: string) => void;
  clearQueuedPrompt: () => void;
  setMoodItems: (items: MoodItem[]) => void;
  bumpAiTurn: () => void;
  setExportCanvas: (
    fn: ((format: "pdf" | "png" | "svg") => Promise<void>) | null,
  ) => void;
  pushHistory: (items: MoodItem[]) => void;
  undo: () => HistoryEntry | undefined;
  redo: () => HistoryEntry | undefined;
  reset: () => void;
}

const INITIAL_VIEWPORT: CanvasViewport = { x: 0, y: 0, zoom: 1 };
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 5;
const ZOOM_STEP = 0.15;
const MAX_HISTORY = 50;

export const useCanvasStore = create<CanvasState & CanvasActions>((set, get) => ({
  viewport: { ...INITIAL_VIEWPORT },
  activeTool: "select",
  selectedItemIds: [],
  dragState: null,
  resizeState: null,
  isPanning: false,
  isDragging: false,
  aiPanelOpen: false,
  aiTurnCounter: 0,
  aiLoading: false,
  queuedAgentPrompt: null,
  moodItemsById: {},
  exportCanvas: null,
  history: [],
  historyIndex: -1,

  setViewport: (partial) =>
    set((s) => ({ viewport: { ...s.viewport, ...partial } })),

  setActiveTool: (tool) => set({ activeTool: tool }),

  zoomTo: (zoom, center) => {
    const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom));
    if (center) {
      const { viewport } = get();
      const scale = clamped / viewport.zoom;
      const newX = center.x - (center.x - viewport.x) * scale;
      const newY = center.y - (center.y - viewport.y) * scale;
      set({ viewport: { x: newX, y: newY, zoom: clamped } });
    } else {
      set((s) => ({ viewport: { ...s.viewport, zoom: clamped } }));
    }
  },

  selectItems: (ids) => set({ selectedItemIds: ids }),
  toggleSelect: (id) =>
    set((s) => ({
      selectedItemIds: s.selectedItemIds.includes(id)
        ? s.selectedItemIds.filter((i) => i !== id)
        : [...s.selectedItemIds, id],
    })),
  clearSelection: () => set({ selectedItemIds: [] }),
  selectAll: (allIds) => set({ selectedItemIds: allIds }),

  startDrag: (drag) => set({ dragState: drag, isDragging: true }),
  updateDrag: (x, y) => {
    const { dragState } = get();
    if (!dragState) return null;
    const newX = dragState.itemStartX + (x - dragState.startX);
    const newY = dragState.itemStartY + (y - dragState.startY);
    return { itemId: dragState.itemId, newX, newY };
  },
  endDrag: () => set({ dragState: null, isDragging: false }),

  startResize: (resize) => set({ resizeState: resize, isDragging: true }),
  updateResize: (x, y) => {
    const { resizeState } = get();
    if (!resizeState) return null;
    const dx = x - resizeState.startX;
    const dy = y - resizeState.startY;
    let newX = resizeState.itemStartX;
    let newY = resizeState.itemStartY;
    let newW = resizeState.itemStartW;
    let newH = resizeState.itemStartH;
    const handle = resizeState.handle;
    if (handle.includes("e")) newW = Math.max(50, resizeState.itemStartW + dx);
    if (handle.includes("w")) { newX = resizeState.itemStartX + dx; newW = Math.max(50, resizeState.itemStartW - dx); }
    if (handle.includes("s")) newH = Math.max(50, resizeState.itemStartH + dy);
    if (handle.includes("n")) { newY = resizeState.itemStartY + dy; newH = Math.max(50, resizeState.itemStartH - dy); }
    return { itemId: resizeState.itemId, newX, newY, newW, newH };
  },
  endResize: () => set({ resizeState: null, isDragging: false }),

  startPanning: () => set({ isPanning: true }),
  stopPanning: () => set({ isPanning: false }),

  toggleAiPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),
  setAiPanelOpen: (open) => set({ aiPanelOpen: open }),
  setAiLoading: (aiLoading) => set({ aiLoading }),
  queueAgentPrompt: (prompt) => set({ queuedAgentPrompt: prompt }),
  clearQueuedPrompt: () => set({ queuedAgentPrompt: null }),
  setMoodItems: (items) =>
    set({
      moodItemsById: Object.fromEntries(items.map((item) => [item.id, item])),
    }),
  bumpAiTurn: () => set((s) => ({ aiTurnCounter: s.aiTurnCounter + 1 })),
  setExportCanvas: (exportCanvas) => set({ exportCanvas }),

  pushHistory: (items) => set((s) => {
    const newHistory = s.history.slice(0, s.historyIndex + 1);
    newHistory.push({ items: JSON.parse(JSON.stringify(items)), timestamp: Date.now() });
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    return { history: newHistory, historyIndex: newHistory.length - 1 };
  }),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return undefined;
    const newIndex = historyIndex - 1;
    set({ historyIndex: newIndex });
    return history[newIndex];
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return undefined;
    const newIndex = historyIndex + 1;
    set({ historyIndex: newIndex });
    return history[newIndex];
  },

  reset: () =>
    set({
      viewport: { ...INITIAL_VIEWPORT },
      selectedItemIds: [],
      dragState: null,
      resizeState: null,
      isPanning: false,
      isDragging: false,
      exportCanvas: null,
    }),
}));

export const ZOOM_LIMITS = { min: ZOOM_MIN, max: ZOOM_MAX, step: ZOOM_STEP } as const;