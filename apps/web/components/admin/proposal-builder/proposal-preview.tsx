'use client';

import { useMemo } from 'react';
import type { AgentContextAsset } from '@repo/types';
import type { ProposalDeckInput } from '@repo/utils';
import type { BoardSection } from './board-state';
import { ProposalSlideshow } from '@/components/proposals/proposal-slideshow';

interface ProposalPreviewProps {
  title: string;
  season: string;
  styleSummary: string;
  clientName?: string;
  sections: BoardSection[];
  assetMap: Map<string, AgentContextAsset>;
}

function toDeckInput({
  title,
  season,
  styleSummary,
  clientName,
  sections,
  assetMap,
}: ProposalPreviewProps): ProposalDeckInput {
  return {
    title,
    season,
    styleSummary,
    project: clientName ? { customer: { name: clientName } } : undefined,
    sections: [...sections]
      .sort((a, b) => a.position - b.position)
      .map((section) => ({
        title: section.title,
        description: section.description,
        position: section.position,
        items: [...section.items]
          .sort((a, b) => a.position - b.position)
          .map((item) => {
            const asset = assetMap.get(item.assetId);
            const row = asset
              ? {
                  id: asset.id,
                  name: asset.name,
                  description: asset.description,
                  imageUrl: asset.imageUrl,
                  keywords: asset.keywords,
                }
              : null;
            return {
              position: item.position,
              notes: item.notes,
              fabricAsset: item.kind === 'fabric' ? row : undefined,
              productAsset: item.kind === 'product' ? row : undefined,
            };
          }),
      })),
  };
}

export function ProposalPreview(props: ProposalPreviewProps) {
  const { title, season, styleSummary, clientName, sections, assetMap } = props;
  const deck = useMemo(
    () => toDeckInput({ title, season, styleSummary, clientName, sections, assetMap }),
    [title, season, styleSummary, clientName, sections, assetMap],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#111]">
      <ProposalSlideshow proposal={deck} showDownloads={false} immersive />
    </div>
  );
}
