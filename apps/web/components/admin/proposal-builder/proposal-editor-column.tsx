'use client';
import type { AgentContextAsset, ProposalChangeRequest, ProposalBudgetSection } from '@repo/types';
import { ProposalDetailsForm } from './proposal-details-form';
import { ProposalBoard } from './proposal-board';
import { ProposalActions } from './proposal-actions';
import type { UseProposalBoard } from './use-proposal-board';
interface ProjectOption {
  id: string;
  title: string;
}
interface SeasonOption {
  id: string;
  label: string;
}
interface ProposalEditorColumnProps {
  board: UseProposalBoard;
  assetMap: Map<string, AgentContextAsset>;
  onSuggest: () => void;
  changeRequests?: ProposalChangeRequest[];
  budgetPerSection?: ProposalBudgetSection[];
  title: string;
  onTitle: (v: string) => void;
  season: string;
  onSeason: (v: string) => void;
  styleSummary: string;
  onStyleSummary: (v: string) => void;
  seasons: SeasonOption[];
  projectId?: string;
  onProjectId?: (v: string) => void;
  projects?: ProjectOption[];
  clientName?: string;
  saving: boolean;
  deleting?: boolean;
  canSave?: boolean;
  proposalId?: string;
  onDownloadPptx?: () => void;
  onDownloadPdf?: () => void;
  onSaveDraft: () => void;
  onSend: () => void;
  onDelete?: () => void;
}
export function ProposalEditorColumn({
  board,
  assetMap,
  onSuggest,
  changeRequests,
  budgetPerSection,
  title,
  onTitle,
  season,
  onSeason,
  styleSummary,
  onStyleSummary,
  seasons,
  projectId,
  onProjectId,
  projects,
  clientName,
  saving,
  deleting,
  canSave,
  proposalId,
  onDownloadPptx,
  onDownloadPdf,
  onSaveDraft,
  onSend,
  onDelete,
}: ProposalEditorColumnProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <ProposalDetailsForm
        title={title}
        onTitle={onTitle}
        season={season}
        onSeason={onSeason}
        styleSummary={styleSummary}
        onStyleSummary={onStyleSummary}
        seasons={seasons}
        projectId={projectId}
        onProjectId={onProjectId}
        projects={projects}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ProposalBoard
          board={board}
          assetMap={assetMap}
          onSuggest={onSuggest}
          changeRequests={changeRequests}
          budgetPerSection={budgetPerSection}
        />
      </div>
      <div className="border-t border-portal-border bg-portal-surface p-3">
        <ProposalActions
          clientName={clientName}
          saving={saving}
          deleting={deleting}
          canSave={canSave}
          proposalId={proposalId}
          onDownloadPptx={onDownloadPptx}
          onDownloadPdf={onDownloadPdf}
          onSaveDraft={onSaveDraft}
          onSend={onSend}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
