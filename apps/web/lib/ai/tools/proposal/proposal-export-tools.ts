import { tool } from "ai";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import type { AgentContext } from "@repo/types";
import { ProposalStatus } from "@repo/types";
import { buildProposalSlides, type ProposalSlide } from "@repo/utils";
import {
  createProposal,
  downloadProposalPdf,
  downloadProposalPptx,
  fetchProposal,
  updateProposal,
} from "../../server/nest-client";

export interface ExportToolsContext {
  client: AxiosInstance;
  projectId: string;
  proposalId?: string;
  getContext: () => AgentContext | null;
}

export function createExportTools(ctx: ExportToolsContext) {
  const previewProposalDeck = tool({
    description:
      "Preview slide outline for a proposal draft or saved proposal. Returns slide titles and asset names.",
    inputSchema: z.object({
      proposalId: z.string().optional(),
      title: z.string().optional(),
      season: z.string().optional(),
      styleSummary: z.string().optional(),
      sections: z
        .array(
          z.object({
            title: z.string(),
            description: z.string().optional(),
            items: z.array(
              z.object({
                fabricAssetId: z.string().optional(),
                productAssetId: z.string().optional(),
                notes: z.string().optional(),
              }),
            ),
          }),
        )
        .optional(),
    }),
    execute: async (input) => {
      const id = input.proposalId ?? ctx.proposalId;
      if (id) {
        const proposal = await fetchProposal(ctx.client, id);
        const slides = buildProposalSlides(proposal);
        return {
          slideCount: slides.length,
          slides: slides.map((s: ProposalSlide) => ({ type: s.type, title: s.title, subtitle: s.subtitle })),
        };
      }

      const agentCtx = ctx.getContext();
      const assetMap = new Map<string, { name: string }>();
      if (agentCtx) {
        for (const f of agentCtx.assets.fabrics) assetMap.set(f.id, { name: f.name });
        for (const p of agentCtx.assets.products) assetMap.set(p.id, { name: p.name });
      }

      const sections = (input.sections ?? []).map((sec, si) => ({
        title: sec.title,
        description: sec.description,
        position: si,
        items: sec.items.map((it, ii) => {
          const assetId = it.fabricAssetId ?? it.productAssetId ?? "";
          const name = assetMap.get(assetId)?.name ?? assetId;
          return {
            notes: it.notes,
            position: ii,
            fabricAsset: it.fabricAssetId
              ? { id: it.fabricAssetId, name, imageUrl: "", keywords: [] }
              : null,
            productAsset: it.productAssetId
              ? { id: it.productAssetId, name, imageUrl: "", keywords: [] }
              : null,
          };
        }),
      }));

      const slides = buildProposalSlides({
        title: input.title,
        season: input.season,
        styleSummary: input.styleSummary,
        sections,
      });

      return {
        slideCount: slides.length,
        slides: slides.map((s: ProposalSlide) => ({ type: s.type, title: s.title, subtitle: s.subtitle })),
      };
    },
  });

  const exportProposalDocument = tool({
    description:
      "Export a saved DRAFT proposal as PDF or PPTX. Does not change status or notify customer.",
    inputSchema: z.object({
      proposalId: z.string(),
      format: z.enum(["pdf", "pptx"]),
    }),
    execute: async ({ proposalId, format }) => {
      const proposal = await fetchProposal(ctx.client, proposalId);
      if (proposal.status !== ProposalStatus.DRAFT && proposal.status !== ProposalStatus.SENT) {
        return {
          ok: false,
          error: "Export only available for DRAFT or SENT proposals",
        };
      }

      const slides = buildProposalSlides(proposal);
      const filename = `proposal-${proposalId.slice(0, 8)}.${format}`;
      const downloadPath = `/proposals/${proposalId}/${format}`;

      if (format === "pdf") {
        await downloadProposalPdf(ctx.client, proposalId);
      } else {
        await downloadProposalPptx(ctx.client, proposalId);
      }

      return {
        ok: true,
        proposalId,
        format,
        filename,
        downloadPath,
        slideCount: slides.length,
      };
    },
  });

  const saveProposalDraft = tool({
    description:
      "Save or update a proposal as DRAFT only. Admin must review before sending to customer.",
    inputSchema: z.object({
      proposalId: z.string().optional(),
      title: z.string().optional(),
      season: z.string().optional(),
      styleSummary: z.string().optional(),
      sections: z.array(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          position: z.number().optional(),
          items: z.array(
            z.object({
              fabricAssetId: z.string().optional(),
              productAssetId: z.string().optional(),
              notes: z.string().optional(),
              position: z.number().optional(),
            }),
          ),
        }),
      ),
    }),
    execute: async (input) => {
      const sections = input.sections.map((sec, i) => ({
        title: sec.title,
        description: sec.description,
        position: sec.position ?? i,
        items: sec.items.map((it, j) => ({
          fabricAssetId: it.fabricAssetId,
          productAssetId: it.productAssetId,
          notes: it.notes,
          position: it.position ?? j,
        })),
      }));

      const id = input.proposalId ?? ctx.proposalId;
      if (id) {
        const updated = await updateProposal(ctx.client, id, {
          title: input.title,
          season: input.season,
          styleSummary: input.styleSummary,
          sections,
          status: ProposalStatus.DRAFT,
        });
        return { id: updated.id, status: updated.status, saved: true };
      }

      const created = await createProposal(ctx.client, {
        projectId: ctx.projectId,
        title: input.title,
        season: input.season,
        styleSummary: input.styleSummary,
        sections,
        status: ProposalStatus.DRAFT,
      });
      return { id: created.id, status: created.status, saved: true };
    },
  });

  return { previewProposalDeck, exportProposalDocument, saveProposalDraft };
}
