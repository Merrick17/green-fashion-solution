import {
  getToolOrDynamicToolName,
  isDynamicToolUIPart,
  isReasoningUIPart,
  type UIMessage,
} from "ai";

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function getMessageToolParts(message: UIMessage) {
  return message.parts.filter(isDynamicToolUIPart);
}

export function getMessageReasoningParts(message: UIMessage) {
  return message.parts.filter(isReasoningUIPart);
}

export function getToolPartName(part: ReturnType<typeof getMessageToolParts>[number]): string {
  return getToolOrDynamicToolName(part);
}

export function isToolPartComplete(state: string): boolean {
  return state === "output-available";
}

export function isToolPartFailed(state: string): boolean {
  return state === "output-error";
}

export function isToolPartRunning(state: string): boolean {
  return state === "input-streaming" || state === "input-available";
}

export function countMessageTools(message: UIMessage) {
  const tools = getMessageToolParts(message);
  return {
    total: tools.length,
    complete: tools.filter((t) => isToolPartComplete(t.state)).length,
    failed: tools.filter((t) => isToolPartFailed(t.state)).length,
    running: tools.filter((t) => isToolPartRunning(t.state)).length,
  };
}

export function isChatLoading(status: string): boolean {
  return status === "submitted" || status === "streaming";
}

/** Returns the name of the first currently-running tool, if any. */
export function getRunningToolName(messages: UIMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (!msg || msg.role !== "assistant") break;
    for (const tool of getMessageToolParts(msg)) {
      if (isToolPartRunning(tool.state)) return getToolOrDynamicToolName(tool);
    }
  }
  return null;
}

const TOOL_LABELS: Record<string, string> = {
  // Canvas tools
  createItem: "Add item",
  bulkCreateItems: "Add items",
  updateItem: "Update item",
  deleteItem: "Remove item",
  moveItem: "Move item",
  groupItems: "Group items",
  autoLayout: "Apply layout",
  analyzeBoard: "Analyze board",
  generateImage: "Generate image",
  generateVariations: "Generate variations",
  setMoodboardMetadata: "Set mood",
  convertSketchToAsset: "Convert sketch",
  applyGlobalVibe: "Apply vibe",
  // Concept tools
  generateMoodboardConcept: "Generate concept",
  generateTldrawMoodboard: "Build moodboard",
  refineMoodboard: "Plan refinement",
  materializeRefinement: "Apply refinement",
  suggestAdditions: "Suggest additions",
  // Proposal tools
  buildProposalSections: "Build sections",
  rankAssets: "Rank assets",
  loadProjectContext: "Load context",
  // Sourcing tools
  createFabricAsset: "Save fabric",
  createProductAsset: "Save product",
  listMyTasks: "Load tasks",
  getTaskDetail: "Load task",
  updateTaskProgress: "Update task",
  completeTask: "Complete task",
  searchMyAssets: "Search assets",
  requestAssetUpload: "Request upload",
  deleteAsset: "Delete asset",
  updateAssetMetadata: "Update metadata",
  addToCollection: "Add to collection",
  listCollections: "List collections",
  createCollection: "Create collection",
  reorderCollectionItems: "Reorder collection",
  // Intake tools
  readProjectBrief: "Read brief",
  listBriefOptions: "List options",
  updateProjectBrief: "Update brief",
  submitProjectForReview: "Submit project",
  listProjectFiles: "List files",
  selectInspirationAsset: "Save inspiration",
  browseInspirationAssets: "Browse inspiration",
  registerUploadedFile: "Register file",
  fetchReferenceUrl: "Validate URL",
  requestMeeting: "Request meeting",
  getCalendarEvents: "Load calendar",
  saveMoodboardSnapshot: "Save snapshot",
  listMoodboardSnapshots: "List snapshots",
  exportMoodboardDeck: "Export deck",
  webSearch: "Web search",
  // Proposal tools (extended)
  previewProposalDeck: "Preview deck",
  saveProposalDraft: "Save draft",
  exportProposalDocument: "Export document",
  searchSourcingLibrary: "Search library",
  searchProjectRag: "Search context",
  indexProjectRag: "Index context",
  assignSourcingTask: "Assign task",
  listProjectTasks: "List tasks",
  updateTaskStatus: "Update task status",
  readChangeRequests: "Read changes",
  listMeetings: "List meetings",
  approveMeeting: "Approve meeting",
  createMilestone: "Create milestone",
};

export function humanizeToolName(name: string): string {
  return TOOL_LABELS[name] ?? name.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

type ToolPart = ReturnType<typeof getMessageToolParts>[number];

/** Extract the best available error message from a tool UI part. */
export function getToolPartError(part: ToolPart): string | null {
  const inv = part as {
    state: string;
    errorText?: string;
    output?: unknown;
  };

  if (isToolPartFailed(inv.state) && inv.errorText && inv.errorText !== "An error occurred.") {
    return inv.errorText;
  }
  if (isToolPartFailed(inv.state) && inv.errorText) {
    return inv.errorText;
  }

  if (inv.output && typeof inv.output === "object") {
    const out = inv.output as { error?: unknown; hint?: unknown; message?: unknown };
    if (typeof out.error === "string" && out.error) {
      const hint = typeof out.hint === "string" && out.hint ? ` — ${out.hint}` : "";
      return `${out.error}${hint}`;
    }
  }

  return null;
}

export function getMessageFileParts(message: UIMessage) {
  return message.parts.filter(
    (part): part is Extract<typeof part, { type: "file" }> =>
      part.type === "file" && "mediaType" in part && String(part.mediaType).startsWith("image/"),
  );
}
