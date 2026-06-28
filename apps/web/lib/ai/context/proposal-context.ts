import type { AgentContext } from "@repo/types";

export function serializeAgentContextForPrompt(ctx: AgentContext): string {
  return JSON.stringify(
    {
      project: ctx.project,
      moodboards: ctx.moodboards.map((m) => ({
        id: m.id,
        styleDirection: m.styleDirection,
        colorPalette: m.colorPalette,
        fabricSuggestions: m.fabricSuggestions,
        mood: m.mood,
        itemCount: m.items.length,
        items: m.items.slice(0, 20),
      })),
      tasks: ctx.tasks,
      assets: {
        fabrics: ctx.assets.fabrics.map((f) => ({
          id: f.id,
          title: f.name,
          description: f.description,
          imageUrl: f.imageUrl,
          keywords: f.keywords,
          designerId: f.designerId,
        })),
        products: ctx.assets.products.map((p) => ({
          id: p.id,
          title: p.name,
          description: p.description,
          imageUrl: p.imageUrl,
          keywords: p.keywords,
          designerId: p.designerId,
        })),
      },
      priorProposals: ctx.priorProposals,
      inspirationSelections: ctx.inspirationSelections,
    },
    null,
    2,
  );
}
