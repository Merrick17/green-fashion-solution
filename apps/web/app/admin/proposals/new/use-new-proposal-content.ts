'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useCreateProposal } from '@/hooks/use-proposals';
import { useProjectAgentContext } from '@/hooks/use-project-agent-context';
import { useProjects } from '@/hooks/use-projects';
import { useBriefSeasons } from '@/hooks/use-brief-options';
import { useProposalBoard } from '@/components/admin/proposal-builder/use-proposal-board';
import {
  boardFromSelections,
  boardFromDraft,
  buildAssetMap,
  emptyBoard,
  toSaveSections,
} from '@/components/admin/proposal-builder/board-state';
import { ProposalStatus, type ProposalDraft } from '@repo/types';

const dropdownParams = { page: 1, limit: 100 };

export function useNewProposalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultProject = searchParams.get('projectId') ?? '';
  const { data: projectsData } = useProjects(dropdownParams);
  const { data: seasons = [] } = useBriefSeasons();
  const createProposal = useCreateProposal();
  const [projectId, setProjectId] = useState(defaultProject);
  const [title, setTitle] = useState('');
  const [season, setSeason] = useState('');
  const [styleSummary, setStyleSummary] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const prefillDone = useRef(false);
  const { data: ctx } = useProjectAgentContext(projectId, false);
  const board = useProposalBoard(emptyBoard());
  const { reset } = board;
  const projects = projectsData?.data ?? [];
  const fabrics = ctx?.assets.fabrics ?? [];
  const products = ctx?.assets.products ?? [];

  useEffect(() => {
    if (!ctx?.inspirationSelections?.length || prefillDone.current) return;
    const selected = ctx.inspirationSelections.filter(
      (s) => s.action === 'SELECTED',
    );
    if (selected.length === 0) return;
    prefillDone.current = true;
    reset(boardFromSelections(ctx.inspirationSelections));
  }, [ctx?.inspirationSelections, reset]);

  const assetMap = buildAssetMap(fabrics, products);
  const placedIds = new Set<string>();
  for (const s of board.sections)
    for (const it of s.items) placedIds.add(it.assetId);

  const handleDraft = (draft: ProposalDraft) => {
    if (draft.title) setTitle(draft.title);
    if (draft.season) setSeason(draft.season);
    if (draft.styleSummary) setStyleSummary(draft.styleSummary);
    if (draft.sections?.length) {
      reset(boardFromDraft(draft, assetMap));
      toast.success('AI draft applied to proposal board');
    }
  };

  const handleSaved = ({ id: savedId }: { id?: string }) => {
    if (savedId) {
      toast.success('Draft saved');
      router.push(`/admin/proposals/${savedId}`);
    }
  };

  const save = (status: ProposalStatus) => {
    createProposal.mutate(
      {
        projectId,
        title: title || undefined,
        season: season || undefined,
        styleSummary: styleSummary || undefined,
        sections: toSaveSections(board.sections),
        status,
      },
      {
        onSuccess: () => {
          toast.success(
            status === ProposalStatus.SENT ? 'Proposal sent' : 'Draft saved',
          );
          router.push('/admin/proposals');
        },
      },
    );
  };

  return {
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
    moodboards: ctx?.moodboards ?? [],
    projects: projects.map((p) => ({ id: p.id, title: p.title })),
    seasons,
    createProposal,
    handleDraft,
    handleSaved,
    save,
  };
}
