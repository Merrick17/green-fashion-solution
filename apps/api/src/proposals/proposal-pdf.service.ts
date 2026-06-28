import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { buildProposalSlides, type ProposalDeckInput, type ProposalSlide } from '@repo/utils';
import { StorageService } from '../files/storage.service';
import { BRAND } from '../config/brand';
import { fetchProposalImage } from './proposal-export.util';

type PdfDoc = InstanceType<typeof PDFDocument>;

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const SAGE = '#8B9A7B';
const STONE = '#F5F0E8';
const INK = '#1A1A1A';
const MUTED = '#6B6560';

@Injectable()
export class ProposalPdfService {
  constructor(private readonly storage: StorageService) {}

  async generate(proposal: ProposalDeckInput & { createdAt: Date }): Promise<Buffer> {
    const slides = buildProposalSlides({ ...proposal, createdAt: proposal.createdAt });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: false });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      void this.renderSlides(doc, slides)
        .then(() => doc.end())
        .catch(reject);
    });
  }

  private async renderSlides(doc: PdfDoc, slides: ProposalSlide[]) {
    for (const slide of slides) {
      switch (slide.type) {
        case 'cover':
          this.coverPage(doc, slide);
          break;
        case 'style':
          this.stylePage(doc, slide.body ?? '');
          break;
        case 'sectionDivider':
          this.sectionPage(doc, slide.title ?? '');
          break;
        case 'sectionIntro':
          this.sectionIntroPage(doc, slide.body ?? '');
          break;
        case 'asset':
          await this.assetPage(doc, slide);
          break;
        case 'closing':
          this.closingPage(doc);
          break;
      }
    }
  }

  private coverPage(doc: PdfDoc, slide: ProposalSlide) {
    doc.addPage({ size: 'A4', margin: 0 });
    doc.rect(0, 0, PAGE_W, PAGE_H).fill(STONE);
    doc.rect(0, PAGE_H * 0.62, PAGE_W, 4).fill(SAGE);
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(11).text('GREEN FASHION SOLUTION', MARGIN, MARGIN, {
      characterSpacing: 2,
    });
    doc.fontSize(36).text(slide.title ?? '', MARGIN, PAGE_H * 0.28, { width: PAGE_W - MARGIN * 2 });
    if (slide.subtitle) {
      doc.font('Helvetica').fontSize(14).fillColor(MUTED).text(slide.subtitle, MARGIN, doc.y + 12);
    }
    if (slide.version && slide.version > 1) {
      doc.fontSize(11).fillColor(INK).text(`Version ${slide.version}`, MARGIN, doc.y + 8);
    }
    doc.fontSize(9).fillColor(MUTED).text('Sourcing & Product Development Proposal', MARGIN, PAGE_H - MARGIN - 16);
  }

  private stylePage(doc: PdfDoc, summary: string) {
    doc.addPage({ size: 'A4', margin: 0 });
    doc.rect(0, 0, 8, PAGE_H).fill(SAGE);
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(22).text('Style Direction', MARGIN + 16, MARGIN + 24);
    doc.font('Helvetica').fontSize(12).fillColor(MUTED)
      .text(summary, MARGIN + 16, MARGIN + 72, { width: PAGE_W - MARGIN * 2 - 16, lineGap: 6 });
  }

  private sectionPage(doc: PdfDoc, label: string) {
    doc.addPage({ size: 'A4', margin: 0 });
    doc.rect(0, 0, PAGE_W, PAGE_H).fill(INK);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(28)
      .text(label, MARGIN, PAGE_H / 2 - 20, { width: PAGE_W - MARGIN * 2, align: 'center' });
  }

  private sectionIntroPage(doc: PdfDoc, description: string) {
    doc.addPage({ size: 'A4', margin: 0 });
    doc.fillColor(MUTED).font('Helvetica').fontSize(12)
      .text(description, MARGIN, MARGIN + 40, { width: PAGE_W - MARGIN * 2, lineGap: 6 });
  }

  private async assetPage(doc: PdfDoc, slide: ProposalSlide) {
    doc.addPage({ size: 'A4', margin: 0 });
    const imgTop = MARGIN;
    const imgH = PAGE_H * 0.58;
    const imgW = PAGE_W - MARGIN * 2;
    const kind = slide.assetKind ?? 'Asset';

    if (slide.imageUrl) {
      const buf = await fetchProposalImage(this.storage, slide.imageUrl);
      if (buf) {
        doc.image(buf, MARGIN, imgTop, { width: imgW, height: imgH, fit: [imgW, imgH], align: 'center', valign: 'center' });
      } else {
        doc.rect(MARGIN, imgTop, imgW, imgH).fill('#E8E4DE');
      }
    }

    const textY = imgTop + imgH + 28;
    doc.fillColor(SAGE).font('Helvetica-Bold').fontSize(10).text(kind.toUpperCase(), MARGIN, textY, { characterSpacing: 1.5 });
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(20).text(slide.assetName ?? slide.title ?? '', MARGIN, doc.y + 8, { width: imgW });
    if (slide.body) {
      doc.font('Helvetica').fontSize(11).fillColor(MUTED).text(slide.body, MARGIN, doc.y + 10, { width: imgW, lineGap: 4 });
    }
    if (slide.keywords?.length) {
      doc.font('Helvetica').fontSize(9).fillColor(SAGE).text(slide.keywords.join('  ·  '), MARGIN, doc.y + 12, { width: imgW });
    }
    if (slide.notes) {
      doc.font('Helvetica-Oblique').fontSize(10).fillColor(INK).text(slide.notes, MARGIN, doc.y + 14, { width: imgW, lineGap: 3 });
    }
  }

  private closingPage(doc: PdfDoc) {
    doc.addPage({ size: 'A4', margin: 0 });
    doc.rect(0, 0, PAGE_W, PAGE_H).fill(STONE);
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(18)
      .text('Thank you', MARGIN, PAGE_H / 2 - 40, { width: PAGE_W - MARGIN * 2, align: 'center' });
    doc.font('Helvetica').fontSize(11).fillColor(MUTED)
      .text(`${BRAND.NAME} — ${BRAND.TAGLINE}`, MARGIN, doc.y + 16, { width: PAGE_W - MARGIN * 2, align: 'center', lineGap: 4 });
  }
}
