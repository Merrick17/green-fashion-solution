import type { MoodItem, CanvasViewport } from './mood-item';

// Point-in-time capture of a moodboard's state. `document` holds the moodboard
// metadata + items + viewport at capture time. It is READ-ONLY relative to the
// live canvas — MoodItem rows remain the source of truth, and a snapshot is
// never written back. A tldraw view is reconstructable from `document.items`
// via the existing TldrawSync mapping.
export interface MoodboardSnapshotDocument {
  capturedAt: string;
  moodboard: {
    styleDirection: string;
    colorPalette: string[];
    fabricSuggestions: string[];
    mood: string;
    canvasViewport?: CanvasViewport | null;
  };
  items: MoodItem[];
}

export interface MoodboardSnapshot {
  id: string;
  moodboardId: string;
  document: MoodboardSnapshotDocument;
  aiSummary?: string | null;
  createdAt: string;
}

export interface CreateMoodboardSnapshotDto {
  aiSummary?: string;
}