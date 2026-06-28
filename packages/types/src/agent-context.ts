export interface AgentContextProject {
  id: string;
  title: string;
  description: string;
  status: string;
}

export interface AgentContextMoodboardItem {
  id: string;
  type: string;
  content: unknown;
}

export interface AgentContextMoodboard {
  id: string;
  styleDirection: string;
  colorPalette: string[];
  fabricSuggestions: string[];
  mood: string;
  items: AgentContextMoodboardItem[];
}

export interface AgentContextTask {
  id: string;
  briefType: string;
  deliverables: string | null;
  designerId: string;
  status: string;
}

export interface AgentContextAsset {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string;
  keywords: string[];
  designerId: string;
  metadata?: unknown;
}

export interface AgentContextProposalItem {
  id: string;
  fabricAssetId: string | null;
  productAssetId: string | null;
  notes: string | null;
}

export interface AgentContextProposal {
  id: string;
  status: string;
  items: AgentContextProposalItem[];
}

export interface AgentContextInspirationSelection {
  id: string;
  action: string;
  fabricAssetId: string | null;
  productAssetId: string | null;
}

export interface AgentContext {
  project: AgentContextProject;
  moodboards: AgentContextMoodboard[];
  tasks: AgentContextTask[];
  assets: {
    fabrics: AgentContextAsset[];
    products: AgentContextAsset[];
  };
  priorProposals: AgentContextProposal[];
  inspirationSelections?: AgentContextInspirationSelection[];
}

export interface ProposalDraftItem {
  fabricAssetId?: string;
  productAssetId?: string;
  notes: string;
}

export interface ProposalDraftSection {
  title: string;
  description?: string;
  items: ProposalDraftItem[];
}

export interface ProposalDraft {
  title?: string;
  season?: string;
  styleSummary: string;
  sections: ProposalDraftSection[];
  unmetRequirements?: string[];
}

export interface UpsertProposalAiSessionDto {
  messages: unknown[];
  modelId?: string;
  settings?: Record<string, unknown>;
}

export interface ProposalAiSession {
  id: string;
  projectId: string;
  userId: string;
  messages: unknown[];
  modelId?: string | null;
  settings?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
