export { UserRole, type User, type CreateUserDto, type RegisterDto, type UpdateUserDto, type AdminCreateUserDto, type UpdateUserRoleDto } from './user';
export { DesignerApplicationStatus, type DesignerApplication, type CreateDesignerApplicationDto, type ApproveDesignerApplicationDto } from './designer-application';
export { ProjectStatus, type Project, type CreateProjectDto, type UpdateProjectDto } from './project';
export { ProposalStatus, type Proposal, type ProposalItem, type ProposalSection, type ProposalChangeRequest, type CreateProposalDto, type UpdateProposalDto, type CreateChangeRequestDto, type ProposalBudgetSummary, type ProposalBudgetSection } from './proposal';
export { type FabricAsset, type ProductAsset, type CreateFabricAssetDto, type CreateProductAssetDto } from './asset';
export { type Moodboard, type CreateMoodboardDto, type UpdateMoodboardDto, type GenerateMoodboardDto, type MoodboardStyle } from './moodboard';
export { type MoodboardSnapshot, type MoodboardSnapshotDocument, type CreateMoodboardSnapshotDto } from './moodboard-snapshot';
export {
  MoodItemType,
  type MoodItem,
  type MoodItemContent,
  type ImageContent,
  type TextContent,
  type ColorContent,
  type LinkContent,
  type AIGeneratedContent,
  type MoodItemStyle,
  type CreateMoodItemDto,
  type UpdateMoodItemDto,
  type BatchUpdateItem,
  type BatchUpdateMoodItemsDto,
  type ReorderMoodItemsDto,
  type CanvasViewport,
} from './mood-item';
export { MeetingStatus, type Meeting, type CreateMeetingDto, type UpdateMeetingDto } from './meeting';
export { TaskStatus, BriefType, BriefPriority, type Task, type CreateTaskDto, type UpdateTaskDto, type TaskListParams } from './task';
export { type PaginationParams, type PaginatedMeta, type PaginatedResponse, buildPaginatedMeta } from './pagination';
export { NotificationType, type Notification } from './notification';
export {
  type Collection,
  type CollectionItem,
  type CreateCollectionDto,
  type UpdateCollectionDto,
  type AddCollectionItemDto,
} from './collection';
export {
  type Message,
  type MessageThread,
  type CreateMessageThreadDto,
  type SendMessageDto,
} from './message';
export { type LoginDto, type AuthResponse, type RefreshTokenResponse, type JwtPayload } from './auth';
export { ProjectType, BudgetRange, LeadStatus, type CreateLeadDto, type UpdateLeadDto, type Lead } from './lead';
export { type CreateWaitlistDto, type WaitlistEntry } from './waitlist';
export { FileType, type FileRecord, type CreateFileDto, type PresignedUploadResponse, type StorageUploadTarget, type StorageUploadMethod } from './file';
export { type Milestone, type CreateMilestoneDto, type UpdateMilestoneDto } from './milestone';
export { InspirationAction, type InspirationSelection, type CreateInspirationSelectionDto, type CuratedAsset } from './inspiration';
export { type CalendarEvent, type CalendarResponse } from './calendar';
export { AuditAction, type AuditLog } from './audit';
export {
  type AdminOverview,
  type AdminMoodboard,
  type AdminFile,
  type AdminInspiration,
  type AdminNotification,
  type AdminAuditLog,
} from './admin';
export {
  BriefOptionType,
  type BriefOption,
  type CreateBriefOptionDto,
  type UpdateBriefOptionDto,
  type ListBriefOptionsParams,
} from './brief-option';
export { type AiSession, type UpsertAiSessionDto } from './ai-session';
export {
  type AiEmbeddingChunk,
  type UpsertAiEmbeddingChunkDto,
  type RagSearchResult,
} from './ai-embedding-chunk';
export {
  type AgentContext,
  type AgentContextProject,
  type AgentContextMoodboard,
  type AgentContextTask,
  type AgentContextAsset,
  type AgentContextProposal,
  type AgentContextInspirationSelection,
  type ProposalDraft,
  type ProposalDraftItem,
  type ProposalDraftSection,
  type ProposalAiSession,
  type UpsertProposalAiSessionDto,
} from './agent-context';

export { WS_EVENTS, REVISION_MODE_PARAM, type WsEventName } from './constants';
export { type AssetKind, type AssetTab, type LogLevel, type SortOrder } from './common';
