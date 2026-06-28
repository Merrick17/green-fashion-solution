import type { ToolSet } from "ai";
import { UserRole } from "@repo/types";
import { createNestClient } from "../../server/nest-client";
import { buildAssistantTools } from "../tool-builder";
import { createIntakeTools } from "../intake/intake-tools";
import { createFetchReferenceUrlTool } from "../intake/fetch-reference-url";
import { createCustomerMeetingTools } from "../intake/customer-meeting-tools";
import { createInspirationTools } from "../inspiration/inspiration-tools";
import { createSnapshotTools } from "../snapshot-tools";
import type { CustomerToolContext, AdminToolContext, DesignerToolContext, ToolBuildOptions } from "./types";
import { isImageGenEnabled, isRagEnabled } from "./guards";
import { createProposalCoreTools } from "../proposal/proposal-tools";
import { createSearchTools } from "../proposal/search-tools";
import {
  createBuildProposalSectionsTool,
  createExportTools,
  createReadBriefTool,
  createReadChangeRequestsTool,
} from "../proposal/export-tools";
import { createAdminTaskTools } from "../orchestration/task-tools";
import { createMeetingTools } from "../orchestration/meeting-tools";
import { createCalendarTools, createMilestoneTools } from "../orchestration/milestone-tools";
import { createRagTools } from "../rag-tools";
import { createDesignerTaskTools } from "../orchestration/task-tools";
import { createDesignerAssetTools } from "../sourcing/asset-tools";
import { createDesignerCollectionTools } from "../sourcing/collection-tools";

export function buildCustomerTools(
  ctx: CustomerToolContext,
  options: ToolBuildOptions = {},
): ToolSet {
  const client = createNestClient(ctx.accessToken);
  const projectId = ctx.projectId;
  if (!projectId) {
    return buildAssistantTools({
      moodboardId: ctx.moodboardId,
      accessToken: ctx.accessToken,
      enableImage: options.enableImage ?? isImageGenEnabled(),
    }) as ToolSet;
  }

  const intake = createIntakeTools({ client, projectId });
  const meetings = createCustomerMeetingTools({ client, projectId });
  const inspiration = createInspirationTools({ client, projectId });
  const snapshots = createSnapshotTools({ client, moodboardId: ctx.moodboardId });

  return {
    ...buildAssistantTools({
      moodboardId: ctx.moodboardId,
      accessToken: ctx.accessToken,
      projectId,
      enableImage: options.enableImage ?? isImageGenEnabled(),
    }),
    ...intake,
    ...meetings,
    fetchReferenceUrl: createFetchReferenceUrlTool(),
    ...inspiration,
    ...snapshots,
  } as ToolSet;
}

export function buildAdminTools(
  ctx: AdminToolContext,
  options: ToolBuildOptions = {},
): ToolSet {
  const client = createNestClient(ctx.accessToken);
  const core = createProposalCoreTools({
    client,
    projectId: ctx.projectId,
    revisionMode: ctx.revisionMode,
    getContext: ctx.getContext,
    setContext: ctx.setContext,
  });

  const sharedCtx = {
    client,
    projectId: ctx.projectId,
    revisionMode: ctx.revisionMode,
    getContext: ctx.getContext,
    setContext: ctx.setContext,
  };

  const searchTools = createSearchTools(sharedCtx);
  const tools: Record<string, unknown> = {
    ...core,
    readProjectBrief: createReadBriefTool(sharedCtx),
    buildProposalSections: createBuildProposalSectionsTool(),
    findAssets: searchTools.findAssets,
    searchSourcingLibrary: searchTools.searchSourcingLibrary,
    readChangeRequests: createReadChangeRequestsTool(sharedCtx),
    ...createAdminTaskTools({ client, projectId: ctx.projectId }),
    ...createMeetingTools({ client }),
    ...createMilestoneTools({ client, projectId: ctx.projectId }),
    ...createCalendarTools({ client }),
  };

  if (options.enableExport !== false) {
    Object.assign(
      tools,
      createExportTools({
        client,
        projectId: ctx.projectId,
        proposalId: ctx.proposalId,
        getContext: ctx.getContext,
      }),
    );
  }

  if (options.enableRag ?? isRagEnabled()) {
    Object.assign(tools, createRagTools(sharedCtx));
  }

  return tools as ToolSet;
}

export function buildDesignerTools(ctx: DesignerToolContext): ToolSet {
  const client = createNestClient(ctx.accessToken);
  return {
    ...createDesignerTaskTools({ client }),
    ...createDesignerAssetTools({ client }),
    ...createDesignerCollectionTools({ client }),
  } as ToolSet;
}

export function resolveToolsForAgent(
  role: UserRole,
  ctx: CustomerToolContext | AdminToolContext | DesignerToolContext,
  options?: ToolBuildOptions,
): ToolSet {
  switch (role) {
    case UserRole.CUSTOMER:
      return buildCustomerTools(ctx as CustomerToolContext, options);
    case UserRole.ADMIN:
      return buildAdminTools(ctx as AdminToolContext, options);
    case UserRole.DESIGNER:
      return buildDesignerTools(ctx as DesignerToolContext);
    default:
      throw new Error(`Unsupported agent role: ${role}`);
  }
}
