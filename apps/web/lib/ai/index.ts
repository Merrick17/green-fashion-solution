export { resolveAiProvider } from "./providers/provider.service";
export type { SupportedProvider, ProviderResolutionResult, AiModelPurpose } from "./providers/provider.types";
export { MOODBOARD_ASSISTANT_PROMPT, MOODBOARD_PARSE_PROMPT, MOODBOARD_STRUCTURE_PROMPT, PROPOSAL_ASSISTANT_PROMPT, SOURCING_ASSISTANT_PROMPT } from "./system-prompts";
export { buildAssistantTools } from "./tools/tool-builder";
export { createCanvasTools } from "./tools/canvas-tools";
export { getAccessTokenFromRequest, verifyAccessToken } from "./server/auth";
export {
  createNestClient,
  fetchAgentContext,
  persistRagChunks,
  searchRagChunks,
} from "./server/nest-client";
export type { RagChunkRecord, RagSearchHit } from "./server/nest-client";
export { runAgent } from "./agent-engine";
export { runMoodboardAgent, buildMoodboardAgentTools } from "./agents/moodboard-agent";
export { runProposalAgent } from "./agents/proposal-agent";
export { runSourcingAgent } from "./agents/sourcing-agent";
export { buildCustomerTools, buildAdminTools, buildDesignerTools } from "./tools/registry";
export { buildMoodboardContextMessages, buildCanvasContextPayload } from "./context/moodboard-context";
export { serializeAgentContextForPrompt } from "./context/proposal-context";
export { FIREWORKS_MODELS, resolveFireworksModel, isFireworksConfigured } from "./fireworks";
export {
  agentContextToChunks,
  buildRagContextFromAgentContext,
  embedChunks,
  indexAgentContextToDb,
} from "./rag/rag-service";
export { resolveRagEnabled, safeBuildRagContext } from "./rag/rag-toggle";
export type { CanvasContextPayload, AiChatRequestBody, AiProposalRequestBody } from "./types";

/** @deprecated use buildMoodboardContextMessages */
export function buildCanvasContextMessage(canvasContext?: import("./types").CanvasContextPayload): string {
  if (!canvasContext?.items?.length && !canvasContext?.styleDirection) {
    return "The canvas is currently empty.";
  }
  return JSON.stringify(canvasContext);
}
