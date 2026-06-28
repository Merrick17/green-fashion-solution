import { UserRole } from "@repo/types";
import type { AgentRole } from "./types";

const ROLE_TOOLS: Record<AgentRole, Set<string>> = {
  [UserRole.CUSTOMER]: new Set([
    "createItem", "bulkCreateItems", "updateItem", "deleteItem", "moveItem", "groupItems", "autoLayout",
    "analyzeBoard", "generateImage", "setMoodboardMetadata", "generateVariations",
    "convertSketchToAsset", "applyGlobalVibe", "generateMoodboardConcept",
    "generateTldrawMoodboard", "refineMoodboard", "materializeRefinement", "suggestAdditions", "webSearch",
    "readProjectBrief", "listBriefOptions", "updateProjectBrief", "submitProjectForReview",
    "listProjectFiles", "registerUploadedFile", "browseInspirationAssets",
    "selectInspirationAsset", "saveMoodboardSnapshot", "listMoodboardSnapshots",
    "exportMoodboardDeck", "fetchReferenceUrl", "requestMeeting", "getCalendarEvents",
  ]),
  [UserRole.ADMIN]: new Set([
    "loadProjectContext", "readProjectBrief",
    "findAssets", "rankAssets", "searchSourcingLibrary", "searchProjectRag",
    "buildProposalSections", "previewProposalDeck", "saveProposalDraft",
    "exportProposalDocument", "assignSourcingTask", "listProjectTasks", "updateTaskStatus",
    "indexProjectRag", "readChangeRequests", "listMeetings",
    "approveMeeting", "createMilestone", "getCalendarEvents",
  ]),
  [UserRole.DESIGNER]: new Set([
    "listMyTasks", "getTaskDetail", "updateTaskProgress", "completeTask",
    "createFabricAsset", "createProductAsset", "searchMyAssets", "requestAssetUpload",
    "deleteAsset", "updateAssetMetadata", "listCollections", "createCollection",
    "addToCollection", "reorderCollectionItems",
  ]),
};

export function assertToolAllowed(role: AgentRole, toolName: string): void {
  const allowed = ROLE_TOOLS[role];
  if (!allowed?.has(toolName)) {
    throw new Error(`Tool "${toolName}" is not allowed for role ${role}`);
  }
}

export function isRagEnabled(): boolean {
  return process.env.AI_ENABLE_RAG !== "false";
}

export function isImageGenEnabled(): boolean {
  return process.env.AI_ENABLE_IMAGE_GEN !== "false";
}
