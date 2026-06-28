'use client';
import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { useDownloadProposalExport } from '@/hooks/use-download-proposal-pptx';
import { RouteSkeleton } from '@/components/shared/route-skeleton';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { StatusBadge } from '@/components/shared/status-badge';
import { PanelErrorBoundary } from '@/components/shared/error-boundary-wrap';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useProposal,
  useUpdateProposal,
  useDeleteProposal,
} from '@/hooks/use-proposals';
import { useProjectAgentContext } from '@/hooks/use-project-agent-context';
import { useBriefSeasons } from '@/hooks/use-brief-options';
import { ProposalStatus, type ProposalDraft } from '@repo/types';
import { proposalDisplayTitle } from '@repo/utils';
import { BuilderLayout } from '@/components/admin/proposal-builder/builder-layout';
import { AssetSourcePanel } from '@/components/admin/proposal-builder/asset-source-panel';
import { ProposalPreview } from '@/components/admin/proposal-builder/proposal-preview';
import { ProposalEditorColumn } from '@/components/admin/proposal-builder/proposal-editor-column';
import { AgentPanelResponsive } from '@/components/admin/proposal-builder/agent-panel-responsive';
import { useProposalBoard } from '@/components/admin/proposal-builder/use-proposal-board';
import {
  boardFromProposal,
  boardFromDraft,
  buildAssetMap,
  emptyBoard,
  toSaveSections,
} from '@/components/admin/proposal-builder/board-state';
import { SamplingBoard } from '@/components/admin/sampling-board';
export default function AdminProposalEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const downloadExport = useDownloadProposalExport();
  const { data: proposal, isLoading, refetch } = useProposal(id);
  const updateProposal = useUpdateProposal();
  const deleteProposal = useDeleteProposal();
  const { data: seasons = [] } = useBriefSeasons();
  const { data: ctx } = useProjectAgentContext(
    proposal?.projectId ?? '',
    false,
  );
  const [title, setTitle] = useState('');
  const [season, setSeason] = useState('');
  const [styleSummary, setStyleSummary] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const seeded = useRef(false);
  const board = useProposalBoard(emptyBoard());
  const { reset } = board;
  useEffect(() => {
    if (!proposal || seeded.current) return;
    seeded.current = true;
    setTitle(proposal.title ?? '');
    setSeason(proposal.season ?? '');
    setStyleSummary(proposal.styleSummary ?? '');
    reset(boardFromProposal(proposal));
  }, [proposal, reset]);
  if (isLoading) return <RouteSkeleton variant="detail" />;
  if (!proposal) return <p className="mx-auto flex w-full max-w-[var(--content-wide)] min-h-0 flex-1 flex-col gap-8 p-6">Proposal not found.</p>;
  const fabrics = ctx?.assets.fabrics ?? [];
  const products = ctx?.assets.products ?? [];
  const assetMap = buildAssetMap(fabrics, products);
  const placedIds = new Set<string>();
  for (const s of board.sections)
    for (const it of s.items) placedIds.add(it.assetId);
  const clientName = proposal.project?.customer?.name;
  const handleDraft = (draft: ProposalDraft) => {
    if (draft.title) setTitle(draft.title);
    if (draft.season) setSeason(draft.season);
    if (draft.styleSummary) setStyleSummary(draft.styleSummary);
    if (draft.sections?.length) {
      reset(boardFromDraft(draft, assetMap));
      toast.success('AI draft applied to proposal board');
    }
  };
  const handleSaved = async ({ id: savedId }: { id?: string }) => {
    if (!savedId) return;
    const { data: fresh } = await refetch();
    if (fresh) {
      setTitle(fresh.title ?? '');
      setSeason(fresh.season ?? '');
      setStyleSummary(fresh.styleSummary ?? '');
      reset(boardFromProposal(fresh));
      toast.success('AI draft saved — board refreshed');
    }
  };
  const save = (status?: ProposalStatus) => {
    updateProposal.mutate(
      {
        id,
        dto: {
          title,
          season,
          styleSummary,
          sections: toSaveSections(board.sections),
          ...(status ? { status } : {}),
        },
      },
      {
        onSuccess: () =>
          toast.success(
            status === ProposalStatus.SENT ? 'Proposal sent' : 'Draft saved',
          ),
      },
    );
  };
  const handleDelete = () =>
    deleteProposal.mutate(id, {
      onSuccess: () => router.push('/admin/proposals'),
    });
  const aiTrigger = (
    <Button
      variant={aiOpen ? 'secondary' : 'outline'}
      size="sm"
      className="gap-1.5"
      onClick={() => setAiOpen((v) => !v)}
    >
      <Sparkles className="h-3.5 w-3.5" />
      {aiOpen ? 'Hide AI' : 'AI assist'}
    </Button>
  );
  const isApproved = proposal.status === ProposalStatus.APPROVED;
  const allItems = proposal.sections.flatMap((s) => s.items);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-portal-border bg-portal-surface px-4 py-2.5">
        <Breadcrumb
          items={[
            { label: 'Proposals', href: '/admin/proposals' },
            { label: proposalDisplayTitle(proposal) },
          ]}
        />
        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">v{proposal.version}</span>
          <StatusBadge status={proposal.status} />
        </div>
      </div>
      {isApproved ? (
        <Tabs defaultValue="builder" className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="border-b border-portal-border bg-portal-surface px-4">
            <TabsList className="h-9 gap-0 bg-transparent p-0">
              <TabsTrigger
                value="builder"
                className="h-9 rounded-none border-b-2 border-transparent px-4 text-xs font-medium data-[state=active]:border-foreground data-[state=active]:bg-transparent"
              >
                Builder
              </TabsTrigger>
              <TabsTrigger
                value="sampling"
                className="h-9 rounded-none border-b-2 border-transparent px-4 text-xs font-medium data-[state=active]:border-foreground data-[state=active]:bg-transparent"
              >
                Sampling
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="builder" className="flex min-h-0 flex-1 flex-col overflow-hidden mt-0">
            <BuilderLayout
              toolbarExtras={aiTrigger}
              sourcePanel={
                <AssetSourcePanel
                  fabrics={fabrics}
                  products={products}
                  moodboards={ctx?.moodboards ?? []}
                  placedAssetIds={placedIds}
                  onAdd={(assetId, kind) => board.addItem(assetId, kind)}
                />
              }
              board={
                <ProposalEditorColumn
                  board={board}
                  assetMap={assetMap}
                  onSuggest={() => setAiOpen(true)}
                  changeRequests={proposal.changeRequests ?? []}
                  budgetPerSection={proposal.budgetSummary?.perSection ?? []}
                  title={title}
                  onTitle={setTitle}
                  season={season}
                  onSeason={setSeason}
                  styleSummary={styleSummary}
                  onStyleSummary={setStyleSummary}
                  seasons={seasons}
                  clientName={clientName}
                  saving={updateProposal.isPending}
                  deleting={deleteProposal.isPending}
                  proposalId={id}
                  onDownloadPptx={() =>
                    void downloadExport(id, 'pptx', title || undefined).catch(() =>
                      toast.error('PPTX download failed'),
                    )
                  }
                  onDownloadPdf={() =>
                    void downloadExport(id, 'pdf', title || undefined).catch(() =>
                      toast.error('PDF download failed'),
                    )
                  }
                  onSaveDraft={() => save()}
                  onSend={() => save(ProposalStatus.SENT)}
                  onDelete={handleDelete}
                />
              }
              preview={
                <ProposalPreview
                  title={title}
                  season={season}
                  styleSummary={styleSummary}
                  clientName={clientName}
                  sections={board.sections}
                  assetMap={assetMap}
                />
              }
              agentPanel={
                <PanelErrorBoundary>
                  <AgentPanelResponsive
                    projectId={proposal.projectId}
                    proposalId={id}
                    onDraft={handleDraft}
                    onSaved={handleSaved}
                    open={aiOpen}
                    onOpenChange={setAiOpen}
                  />
                </PanelErrorBoundary>
              }
            />
          </TabsContent>
          <TabsContent value="sampling" className="min-h-0 flex-1 overflow-y-auto p-6 mt-0">
            <div className="mx-auto max-w-5xl">
              <p className="mb-6 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Sampling tracker — {allItems.length} item{allItems.length !== 1 ? 's' : ''}
              </p>
              <SamplingBoard proposalId={id} items={allItems} />
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <BuilderLayout
          toolbarExtras={aiTrigger}
          sourcePanel={
            <AssetSourcePanel
              fabrics={fabrics}
              products={products}
              moodboards={ctx?.moodboards ?? []}
              placedAssetIds={placedIds}
              onAdd={(assetId, kind) => board.addItem(assetId, kind)}
            />
          }
          board={
            <ProposalEditorColumn
              board={board}
              assetMap={assetMap}
              onSuggest={() => setAiOpen(true)}
              changeRequests={proposal.changeRequests ?? []}
              budgetPerSection={proposal.budgetSummary?.perSection ?? []}
              title={title}
              onTitle={setTitle}
              season={season}
              onSeason={setSeason}
              styleSummary={styleSummary}
              onStyleSummary={setStyleSummary}
              seasons={seasons}
              clientName={clientName}
              saving={updateProposal.isPending}
              deleting={deleteProposal.isPending}
              proposalId={id}
              onDownloadPptx={() =>
                void downloadExport(id, 'pptx', title || undefined).catch(() =>
                  toast.error('PPTX download failed'),
                )
              }
              onDownloadPdf={() =>
                void downloadExport(id, 'pdf', title || undefined).catch(() =>
                  toast.error('PDF download failed'),
                )
              }
              onSaveDraft={() => save()}
              onSend={() => save(ProposalStatus.SENT)}
              onDelete={handleDelete}
            />
          }
          preview={
            <ProposalPreview
              title={title}
              season={season}
              styleSummary={styleSummary}
              clientName={clientName}
              sections={board.sections}
              assetMap={assetMap}
            />
          }
          agentPanel={
            <PanelErrorBoundary>
              <AgentPanelResponsive
                projectId={proposal.projectId}
                proposalId={id}
                onDraft={handleDraft}
                onSaved={handleSaved}
                open={aiOpen}
                onOpenChange={setAiOpen}
              />
            </PanelErrorBoundary>
          }
        />
      )}
    </div>
  );
}
