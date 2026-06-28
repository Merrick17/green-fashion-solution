export type ProposalAssetLike = {
  id: string;
  name: string;
  description?: string | null;
  imageUrl: string;
  keywords?: string[];
};

export type ProposalItemLike = {
  notes?: string | null;
  position?: number;
  fabricAsset?: ProposalAssetLike | null;
  productAsset?: ProposalAssetLike | null;
};

export type ProposalSectionLike = {
  title: string;
  description?: string | null;
  position: number;
  items: ProposalItemLike[];
};

export function sortProposalSections<T extends ProposalSectionLike>(sections: T[]): T[] {
  return [...sections].sort((a, b) => a.position - b.position);
}

export function flattenProposalItems(sections: ProposalSectionLike[]): ProposalItemLike[] {
  return sortProposalSections(sections).flatMap((section) =>
    [...section.items].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
  );
}

export function countProposalAssets(sections: ProposalSectionLike[]): number {
  return flattenProposalItems(sections).length;
}

export function proposalDisplayTitle(proposal: {
  title?: string | null;
  project?: { title?: string } | null;
  id: string;
}): string {
  return proposal.title || proposal.project?.title || `Proposal ${proposal.id.slice(0, 8)}`;
}
