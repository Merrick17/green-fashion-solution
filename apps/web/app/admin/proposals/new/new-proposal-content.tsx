'use client';

import { Sparkles } from 'lucide-react';
import { PanelErrorBoundary } from '@/components/shared/error-boundary-wrap';
import { Button } from '@/components/ui/button';
import { ProposalStatus } from '@repo/types';
import { BuilderLayout } from '@/components/admin/proposal-builder/builder-layout';
import { AssetSourcePanel } from '@/components/admin/proposal-builder/asset-source-panel';
import { ProposalPreview } from '@/components/admin/proposal-builder/proposal-preview';
import { ProposalEditorColumn } from '@/components/admin/proposal-builder/proposal-editor-column';
import { AgentPanelResponsive } from '@/components/admin/proposal-builder/agent-panel-responsive';
import { useNewProposalContent } from './use-new-proposal-content';

export function NewProposalContent() {
  const {
    projectId,
    setProjectId,
    title,
    setTitle,
    season,
    setSeason,
    styleSummary,
    setStyleSummary,
    aiOpen,
    setAiOpen,
    board,
    assetMap,
    placedIds,
    fabrics,
    products,
    moodboards,
    projects,
    seasons,
    createProposal,
    handleDraft,
    handleSaved,
    save,
  } = useNewProposalContent();

  const aiTrigger = (
    <Button
      variant={aiOpen ? 'secondary' : 'outline'}
      size="sm"
      className="gap-1.5"
      onClick={() => setAiOpen((v) => !v)}
      disabled={!projectId}
    >
      <Sparkles className="h-3.5 w-3.5" />
      {aiOpen ? 'Hide AI' : 'AI assist'}
    </Button>
  );

  const sourcePanel = projectId ? (
    <AssetSourcePanel
      fabrics={fabrics}
      products={products}
      moodboards={moodboards}
      placedAssetIds={placedIds}
      onAdd={(assetId, kind) => board.addItem(assetId, kind)}
    />
  ) : (
    <div className="flex h-full items-center justify-center p-6 text-center">
      <p className="text-xs text-portal-muted">
        Select a project to load the sourcing library.
      </p>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <BuilderLayout
        toolbarExtras={aiTrigger}
        sourcePanel={sourcePanel}
        board={
          <ProposalEditorColumn
            board={board}
            assetMap={assetMap}
            onSuggest={() => setAiOpen(true)}
            title={title}
            onTitle={setTitle}
            season={season}
            onSeason={setSeason}
            styleSummary={styleSummary}
            onStyleSummary={setStyleSummary}
            seasons={seasons}
            projectId={projectId}
            onProjectId={setProjectId}
            projects={projects}
            saving={createProposal.isPending}
            canSave={!!projectId}
            onSaveDraft={() => save(ProposalStatus.DRAFT)}
            onSend={() => save(ProposalStatus.SENT)}
          />
        }
        preview={
          <ProposalPreview
            title={title}
            season={season}
            styleSummary={styleSummary}
            sections={board.sections}
            assetMap={assetMap}
          />
        }
        agentPanel={
          <PanelErrorBoundary>
            <AgentPanelResponsive
              projectId={projectId}
              onDraft={handleDraft}
              onSaved={handleSaved}
              open={aiOpen}
              onOpenChange={setAiOpen}
            />
          </PanelErrorBoundary>
        }
      />
    </div>
  );
}
