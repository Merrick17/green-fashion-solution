import { createCanvasItemTools } from "./canvas-item-tools";
import { createCanvasGenerationTools } from "./canvas-generation-tools";
import { createCanvasLayoutTools } from "./canvas-layout-tools";

export type { CanvasToolContext } from "./canvas-schemas";

export function createCanvasTools(ctx: Parameters<typeof createCanvasItemTools>[0]) {
  return {
    ...createCanvasItemTools(ctx),
    ...createCanvasGenerationTools(ctx),
    ...createCanvasLayoutTools(ctx),
  };
}
