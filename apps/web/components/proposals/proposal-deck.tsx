'use client';

import type { Proposal } from '@repo/types';
import { ProposalSlideshow } from './proposal-slideshow';

type Props = {
  proposal: Proposal;
  immersive?: boolean;
};

/** PowerPoint-style deck viewer — mirrors pptxgenjs export slides. */
export function ProposalDeck({ proposal, immersive = false }: Props) {
  return (
    <ProposalSlideshow proposal={proposal} immersive={immersive} showDownloads />
  );
}
