import { createNestClient } from "../server/nest-client";
import { createCanvasTools, type CanvasToolContext } from "./canvas-tools";
import { createConceptTools } from "./moodboard-concept-tools";
import { createWebSearchTool, isWebSearchEnabled } from "./web-search-tool";

export interface BuildToolsOptions {
  moodboardId: string;
  accessToken: string;
  projectId?: string;
  enableImage?: boolean;
}

export function buildAssistantTools(options: BuildToolsOptions) {
  const client = createNestClient(options.accessToken);
  const ctx: CanvasToolContext = {
    moodboardId: options.moodboardId,
    client,
    projectId: options.projectId,
    enableImage: options.enableImage,
  };
  // Layered (non-breaking): the concept/refine/suggest tools are planners/read-only —
  // they merge alongside the 12 existing item tools. createCanvasTools is untouched.
  // Phase 3 (non-breaking): webSearch is merged ONLY when TAVILY_API_KEY is set;
  // absent -> the spread is empty and the toolset is byte-identical to before.
  const tools = {
    ...createCanvasTools(ctx),
    ...createConceptTools(ctx),
    ...(isWebSearchEnabled() ? { webSearch: createWebSearchTool() } : {}),
  };

  if (options.enableImage === false) {
    const { generateImage: _ignored, ...rest } = tools;
    return rest;
  }

  return tools;
}
