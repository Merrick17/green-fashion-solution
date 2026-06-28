'use client';

import type { Proposal } from '@repo/types';
import { ProposalSlideshow } from '@/components/proposals/proposal-slideshow';

type Props = {
  proposal: Proposal;
  immersive?: boolean;
};

export function ProposalDocumentView({ proposal, immersive = false }: Props) {
  return <ProposalSlideshow proposal={proposal} immersive={immersive} showDownloads />;
}
