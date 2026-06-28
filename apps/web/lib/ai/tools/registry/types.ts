import { UserRole } from "@repo/types";

export type AgentRole = UserRole.CUSTOMER | UserRole.ADMIN | UserRole.DESIGNER;

export type ToolCategory =
  | "canvas"
  | "intake"
  | "inspiration"
  | "proposal"
  | "orchestration"
  | "export"
  | "sourcing"
  | "search";

export interface ToolBuildOptions {
  enableImage?: boolean;
  enableRag?: boolean;
  enableWebSearch?: boolean;
  enableExport?: boolean;
}

export interface CustomerToolContext {
  moodboardId: string;
  projectId?: string;
  accessToken: string;
}

export interface AdminToolContext {
  projectId: string;
  accessToken: string;
  revisionMode?: boolean;
  proposalId?: string;
  getContext: () => import("@repo/types").AgentContext | null;
  setContext: (ctx: import("@repo/types").AgentContext) => void;
}

export interface DesignerToolContext {
  accessToken: string;
}
