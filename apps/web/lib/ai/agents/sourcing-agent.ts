import type { ToolSet } from "ai";
import { UserRole } from "@repo/types";
import { SOURCING_ASSISTANT_PROMPT } from "../system-prompts";
import { withSkill } from "../skills";
import { buildDesignerTools } from "../tools/registry";
import { runAgent, type StreamTextReturn } from "../agent-engine";
import type { OrchestrationOverrides } from "../orchestration";
import { wrapToolsWithRouter } from "../orchestration/tool-router";

export interface SourcingAgentRunInput {
  messages: unknown[];
  modelId?: string;
  accessToken: string;
  contextMessages?: Array<{ role: "system"; content: string }>;
  abortSignal?: AbortSignal;
  orchestration?: OrchestrationOverrides;
}

export async function runSourcingAgent(
  input: SourcingAgentRunInput,
): Promise<StreamTextReturn> {
  const tools = wrapToolsWithRouter(
    buildDesignerTools({ accessToken: input.accessToken }),
    {
      role: UserRole.DESIGNER,
      enabled: process.env.AI_TOOL_INSTRUMENTATION === "true",
    },
  );

  return runAgent({
    system: withSkill(SOURCING_ASSISTANT_PROMPT, "sourcing-metadata"),
    contextMessages: input.contextMessages,
    messages: input.messages,
    tools,
    modelId: input.modelId,
    maxSteps: 12,
    purpose: "chat",
    abortSignal: input.abortSignal,
    orchestration: input.orchestration,
  });
}
