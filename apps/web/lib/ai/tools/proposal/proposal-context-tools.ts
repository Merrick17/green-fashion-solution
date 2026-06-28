import { tool } from "ai";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import type { AgentContext } from "@repo/types";
import {
  fetchAgentContext,
  fetchProposal,
} from "../../server/nest-client";

export function createReadBriefTool(ctx: {
  client: AxiosInstance;
  projectId: string;
  revisionMode?: boolean;
  getContext: () => AgentContext | null;
  setContext: (ctx: AgentContext) => void;
}) {
  return tool({
    description: "Read focused project brief and change-request summary for proposal revision.",
    inputSchema: z.object({}),
    execute: async () => {
      let agentCtx = ctx.getContext();
      if (!agentCtx) {
        agentCtx = await fetchAgentContext(ctx.client, ctx.projectId, ctx.revisionMode);
        ctx.setContext(agentCtx);
      }
      const changeRequests = agentCtx.priorProposals
        .filter((p) => p.status === "CHANGES_REQUESTED")
        .map((p) => ({ proposalId: p.id, status: p.status }));

      return {
        project: agentCtx.project,
        moodboardCount: agentCtx.moodboards.length,
        inspirationCount: agentCtx.inspirationSelections?.length ?? 0,
        changeRequests,
      };
    },
  });
}

export function createReadChangeRequestsTool(ctx: {
  client: AxiosInstance;
  projectId: string;
  getContext: () => AgentContext | null;
  setContext: (ctx: AgentContext) => void;
  revisionMode?: boolean;
}) {
  return tool({
    description: "Read customer change requests on prior proposals.",
    inputSchema: z.object({ proposalId: z.string().optional() }),
    execute: async ({ proposalId }) => {
      let agentCtx = ctx.getContext();
      if (!agentCtx) {
        agentCtx = await fetchAgentContext(ctx.client, ctx.projectId, ctx.revisionMode);
        ctx.setContext(agentCtx);
      }

      if (proposalId) {
        const proposal = await fetchProposal(ctx.client, proposalId);
        return {
          proposalId: proposal.id,
          status: proposal.status,
          changeRequests: (proposal.changeRequests ?? []).map((cr) => ({
            id: cr.id,
            message: cr.message,
            sectionId: cr.sectionId,
            createdAt: cr.createdAt,
          })),
        };
      }

      return {
        proposalsWithChanges: agentCtx.priorProposals.filter(
          (p) => p.status === "CHANGES_REQUESTED",
        ),
      };
    },
  });
}
