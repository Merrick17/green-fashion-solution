import { Injectable } from '@nestjs/common';
import PptxGenJS from 'pptxgenjs';
import { buildProposalSlides, type ProposalDeckInput } from '@repo/utils';
import { StorageService } from '../files/storage.service';
import { BRAND } from '../config/brand';
import { fetchProposalImage, toImageDataUri } from './proposal-export.util';

const SAGE = '8B9A7B';
const STONE = 'F5F0E8';
const INK = '1A1A1A';
const MUTED = '6B6560';

@Injectable()
export class ProposalPptxService {
  constructor(private readonly storage: StorageService) {}

  async generate(proposal: ProposalDeckInput & { createdAt: Date }): Promise<Buffer> {
    const slides = buildProposalSlides({ ...proposal, createdAt: proposal.createdAt });
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = BRAND.NAME;

    for (const slide of slides) {
      const s = pptx.addSlide();

      if (slide.type === 'cover') {
        s.background = { color: STONE };
        s.addShape(pptx.ShapeType.rect, { x: 0, y: 4.8, w: 13.33, h: 0.08, fill: { color: SAGE } });
        s.addText('GREEN FASHION SOLUTION', { x: 0.5, y: 0.4, w: 12, fontSize: 11, bold: true, color: INK, charSpacing: 2 });
        s.addText(slide.title ?? '', { x: 0.5, y: 1.8, w: 12, fontSize: 36, bold: true, color: INK });
        if (slide.subtitle) s.addText(slide.subtitle, { x: 0.5, y: 3.2, w: 12, fontSize: 14, color: MUTED });
        continue;
      }

      if (slide.type === 'style') {
        s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.15, h: 7.5, fill: { color: SAGE } });
        s.addText('Style Direction', { x: 0.6, y: 0.5, w: 12, fontSize: 24, bold: true, color: INK });
        s.addText(slide.body ?? '', { x: 0.6, y: 1.4, w: 12, fontSize: 12, color: MUTED });
        continue;
      }

      if (slide.type === 'sectionDivider') {
        s.background = { color: INK };
        s.addText(slide.title ?? '', { x: 0.5, y: 3, w: 12, fontSize: 28, bold: true, color: 'FFFFFF', align: 'center' });
        continue;
      }

      if (slide.type === 'sectionIntro') {
        s.addText(slide.body ?? '', { x: 0.6, y: 1, w: 12, fontSize: 12, color: MUTED });
        continue;
      }

      if (slide.type === 'asset') {
        if (slide.imageUrl) {
          const imgBuf = await fetchProposalImage(this.storage, slide.imageUrl);
          if (imgBuf) {
            s.addImage({
              data: toImageDataUri(imgBuf, slide.imageUrl),
              x: 0.5,
              y: 0.4,
              w: 12.3,
              h: 4.2,
              sizing: { type: 'contain', w: 12.3, h: 4.2 },
            });
          }
        }
        s.addText((slide.assetKind ?? 'ASSET').toUpperCase(), { x: 0.5, y: 4.75, w: 12, fontSize: 10, bold: true, color: SAGE, charSpacing: 1.5 });
        s.addText(slide.assetName ?? slide.title ?? '', { x: 0.5, y: 5.05, w: 12, fontSize: 20, bold: true, color: INK });
        if (slide.body) s.addText(slide.body, { x: 0.5, y: 5.55, w: 12, fontSize: 11, color: MUTED });
        if (slide.keywords?.length) {
          s.addText(slide.keywords.join('  ·  '), { x: 0.5, y: 6.0, w: 12, fontSize: 9, color: SAGE });
        }
        if (slide.notes) s.addText(slide.notes, { x: 0.5, y: 6.35, w: 12, fontSize: 10, italic: true, color: INK });
        continue;
      }

      if (slide.type === 'closing') {
        s.background = { color: STONE };
        s.addText('Thank you', { x: 0.5, y: 3, w: 12, fontSize: 22, bold: true, color: INK, align: 'center' });
        s.addText(`${BRAND.NAME} — ${BRAND.TAGLINE}`, { x: 0.5, y: 3.8, w: 12, fontSize: 11, color: MUTED, align: 'center' });
      }
    }

    const arrayBuffer = (await pptx.write({ outputType: 'arraybuffer' })) as ArrayBuffer;
    return Buffer.from(arrayBuffer);
  }
}
