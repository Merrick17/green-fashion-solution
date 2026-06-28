import { ProposalSlideshow } from '@/components/proposals/proposal-slideshow';
import type { ProposalDeckInput } from '@repo/utils';

const SAMPLE_PROPOSAL: ProposalDeckInput = {
  title: 'SS26 Linen Collection — Sample Proposal',
  season: 'SS26',
  styleSummary:
    'A minimal, coastal-inspired collection anchored in natural linen textures, soft earth tones, and fluid silhouettes. Designed for the contemporary lifestyle brand targeting a discerning 28–40 demographic.',
  sections: [
    {
      title: 'Outerwear Fabrics',
      description: 'Lightweight linen-cotton blends for shirts and light jackets.',
      position: 0,
      items: [
        {
          notes: 'Natural linen blend, 180gsm, suitable for unlined blazers.',
          position: 0,
          fabricAsset: {
            id: 'f1',
            name: 'Ecru Linen Blend',
            imageUrl: '',
            keywords: ['linen', 'natural', 'lightweight'],
          },
          productAsset: null,
        },
      ],
    },
    {
      title: 'Tops & Shirting',
      description: 'Easy-wear shirt fabrics with a natural drape.',
      position: 1,
      items: [
        {
          notes: 'Washed linen, preshrunk, available in 6 colorways.',
          position: 0,
          fabricAsset: {
            id: 'f2',
            name: 'Washed Linen Shirting',
            imageUrl: '',
            keywords: ['linen', 'washed', 'shirt'],
          },
          productAsset: null,
        },
      ],
    },
  ],
};

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[--portal-muted]">
        Sample Proposal
      </p>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        What a sourcing proposal looks like
      </h1>
      <ProposalSlideshow
        proposal={SAMPLE_PROPOSAL as ProposalDeckInput & { id?: string }}
        showDownloads={false}
      />
    </div>
  );
}
