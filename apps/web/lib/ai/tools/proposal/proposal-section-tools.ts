import { tool } from "ai";
import { z } from "zod";
import type { ProposalDraft } from "@repo/types";

export function createBuildProposalSectionsTool() {
  return tool({
    description:
      "Build a structured sourcing proposal draft for admin review. Use ONLY real asset IDs from the catalog. Always include all standard sections.",
    inputSchema: z.object({
      title: z.string().describe("Proposal title e.g. 'SS26 Linen Collection — Sourcing Proposal for [Brand]'"),
      season: z.string().describe("Season code e.g. 'SS26', 'AW26', 'Resort 2026'"),
      styleSummary: z.string().min(80).describe(
        "2-3 sentence creative narrative: overall direction, color story, key fabric families, intended aesthetic"
      ),
      sections: z.array(
        z.object({
          title: z.string().describe("Section name e.g. 'Outerwear Fabrics', 'Tops & Shirting', 'Creative Direction'"),
          category: z.enum([
            "cover", "creative-direction", "outerwear", "tops", "bottoms",
            "knitwear", "denim", "accessories", "other",
          ]).optional(),
          description: z.string().optional().describe("Section narrative: why these choices for this category"),
          items: z.array(
            z.object({
              fabricAssetId: z.string().optional().describe("Real fabric asset ID from catalog — never invented"),
              productAssetId: z.string().optional().describe("Real product asset ID from catalog — never invented"),
              notes: z.string().min(15).describe("Sourcing rationale: composition, colorway, why it fits the brief"),
              colorway: z.string().optional().describe("Color name e.g. 'ecru', 'forest'"),
              positionInSection: z.enum(["hero", "secondary", "accent"]).optional(),
            }),
          ),
        }),
      ).min(2).max(8),
      unmetRequirements: z.array(z.string()).optional().describe(
        "Materials or silhouettes needed but not yet in the library — flags missing research tasks"
      ),
    }),
    execute: async (params): Promise<ProposalDraft> => params,
  });
}
