import type { ToolSet } from "ai";
import { UserRole } from "@repo/types";
import { MOODBOARD_ASSISTANT_PROMPT, MOODBOARD_PARSE_PROMPT } from "../system-prompts";
import { buildCustomerTools } from "../tools/registry";
import { buildMoodboardContextMessages, buildCanvasContextPayload, type MoodboardAgentContextInput } from "../context/moodboard-context";
import { runAgent, type StreamTextReturn } from "../agent-engine";
import type { OrchestrationOverrides } from "../orchestration";
import { wrapToolsWithRouter } from "../orchestration/tool-router";

export type MoodboardAgentMode = "design" | "parse";

export interface MoodboardAgentRunInput {
  messages: unknown[];
  mode?: MoodboardAgentMode;
  hasImages?: boolean;
  modelId?: string;
  enableImage?: boolean;
  accessToken: string;
  moodboardId: string;
  projectId?: string;
  context?: MoodboardAgentContextInput;
  abortSignal?: AbortSignal;
  orchestration?: OrchestrationOverrides;
}

const SPATIAL_MOODBOARD_SYSTEM_RULES = `
CANVAS RULES (non-negotiable):
- New board: generateMoodboardConcept → setMoodboardMetadata → generateTldrawMoodboard — in order, no skipping, no additional createItem calls
- Pass the full concept object to generateTldrawMoodboard (theme, mood, palette, colorNames, styleKeywords, fabricDirections, season, layoutSuggestion, imagePrompts, imageStyles)
- Refinement: refineMoodboard (plan) → materializeRefinement (apply) — always paired, immediate, no manual loops
- Batch items: bulkCreateItems for 3+ TEXT/COLOR items — never loop createItem
- Images: generateImage with a style enum — omit to auto-detect; generateVariations for comparisons
- autoLayout: only on explicit user request — never as a cleanup step after generation
- saveMoodboardSnapshot before any destructive operation (full rebuild, applyGlobalVibe on a non-empty board)
`;

const IMAGE_CONTEXT_RULES = `
The user attached reference images. Extract palette, silhouettes, textures, and mood.
Use bulkCreateItems / createItem for swatches and notes; registerUploadedFile for uploaded files.
Use generateImage only for new AI visuals not present in the attachments.
`;

export function buildMoodboardAgentTools(options: {
  moodboardId: string;
  accessToken: string;
  projectId?: string;
  enableImage?: boolean;
}): ToolSet {
  return buildCustomerTools(
    {
      moodboardId: options.moodboardId,
      accessToken: options.accessToken,
      projectId: options.projectId,
    },
    { enableImage: options.enableImage },
  );
}

export async function runMoodboardAgent(
  input: MoodboardAgentRunInput,
): Promise<StreamTextReturn> {
  const canvasContext = input.context
    ? buildCanvasContextPayload(input.context)
    : undefined;

  const tools = wrapToolsWithRouter(
    buildMoodboardAgentTools({
      moodboardId: input.moodboardId,
      accessToken: input.accessToken,
      projectId: input.projectId ?? input.context?.projectId,
      enableImage: input.enableImage,
    }),
    {
      role: UserRole.CUSTOMER,
      enabled: process.env.AI_TOOL_INSTRUMENTATION === "true",
    },
  );

  const system =
    (input.mode === "parse" ? MOODBOARD_PARSE_PROMPT : MOODBOARD_ASSISTANT_PROMPT) +
    "\n\n" +
    SPATIAL_MOODBOARD_SYSTEM_RULES;

  const imageContext =
    input.hasImages && input.mode !== "parse"
      ? [{ role: "system" as const, content: IMAGE_CONTEXT_RULES }]
      : [];

  return runAgent({
    system,
    contextMessages: [...imageContext, ...buildMoodboardContextMessages(canvasContext)],
    messages: input.messages,
    tools,
    modelId: input.modelId,
    maxSteps: input.mode === "parse" ? 20 : 25,
    purpose: input.hasImages || input.mode === "parse" ? "vision" : "chat",
    abortSignal: input.abortSignal,
    orchestration: input.orchestration,
  });
}
