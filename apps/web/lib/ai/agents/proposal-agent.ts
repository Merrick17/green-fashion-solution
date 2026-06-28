import type { ToolSet } from "ai";
import type { AgentContext } from "@repo/types";
import { UserRole } from "@repo/types";
import { PROPOSAL_ASSISTANT_PROMPT } from "../system-prompts";
import { withSkill } from "../skills";
import { serializeAgentContextForPrompt } from "../context/proposal-context";
import { buildAdminTools } from "../tools/registry";
import { runAgent, type StreamTextReturn } from "../agent-engine";
import type { OrchestrationOverrides } from "../orchestration";
import { wrapToolsWithRouter } from "../orchestration/tool-router";

export interface ProposalAgentRunInput {
  messages: unknown[];
  modelId?: string;
  accessToken: string;
  projectId: string;
  proposalId?: string;
  agentContext?: AgentContext;
  revisionMode?: boolean;
  ragContext?: string;
  abortSignal?: AbortSignal;
  orchestration?: OrchestrationOverrides;
}

export async function runProposalAgent(input: ProposalAgentRunInput): Promise<StreamTextReturn> {
  let cachedContext: AgentContext | null = input.agentContext ?? null;

  const tools = wrapToolsWithRouter(
    buildAdminTools({
      accessToken: input.accessToken,
      projectId: input.projectId,
      proposalId: input.proposalId,
      revisionMode: input.revisionMode,
      getContext: () => cachedContext,
      setContext: (ctx) => {
        cachedContext = ctx;
      },
    }),
    {
      role: UserRole.ADMIN,
      enabled: process.env.AI_TOOL_INSTRUMENTATION === "true",
    },
  );

  const contextMessages: Array<{ role: "system"; content: string }> = [];
  if (cachedContext) {
    contextMessages.push({
      role: "system",
      content: `Pre-loaded project agent context:\n${serializeAgentContextForPrompt(cachedContext)}`,
    });
  } else {
    contextMessages.push({
      role: "system",
      content: `Project ID: ${input.projectId}. Call loadProjectContext before selecting assets.`,
    });
  }

  if (input.revisionMode) {
    contextMessages.push({
      role: "system",
      content:
        "Revision mode: prior proposals and customer inspiration selections (if any) are included. Address CHANGES_REQUESTED feedback.",
    });
  }

  if (input.ragContext) {
    contextMessages.push({
      role: "system",
      content: input.ragContext,
    });
  }

  const purpose =
    process.env.FIREWORKS_MODEL_CUSTOM && !input.modelId ? ("custom" as const) : ("chat" as const);

  return runAgent({
    system: withSkill(withSkill(PROPOSAL_ASSISTANT_PROMPT, "proposal-export"), "collection-strategy"),
    contextMessages,
    messages: input.messages,
    tools: tools as ToolSet,
    modelId: input.modelId,
    maxSteps: 20,
    purpose,
    abortSignal: input.abortSignal,
    orchestration: input.orchestration,
  });
}
