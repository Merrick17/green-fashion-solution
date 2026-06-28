export interface CanvasContextPayload {
  items: Array<{
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    zIndex?: number;
    content?: Record<string, unknown>;
  }>;
  viewport?: { x: number; y: number; zoom: number };
  styleDirection?: string;
  colorPalette?: string[];
  fabricSuggestions?: string[];
  mood?: string;
  selectedItemIds?: string[];
  projectId?: string;
}

export interface AiChatRequestBody {
  messages: unknown[];
  moodboardId: string;
  projectId?: string;
  canvasContext?: CanvasContextPayload;
  modelId?: string;
  enableImage?: boolean;
  mode?: "design" | "parse";
}

export interface AiProposalRequestBody {
  messages: unknown[];
  projectId: string;
  proposalId?: string;
  moodboardIds?: string[];
  modelId?: string;
  revisionMode?: boolean;
  enableRag?: boolean;
}
