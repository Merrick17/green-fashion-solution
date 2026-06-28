import { tool } from "ai";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import {
  createMoodboardSnapshot,
  listMoodboardSnapshots,
} from "../server/nest-client";

export interface SnapshotToolsContext {
  client: AxiosInstance;
  moodboardId: string;
}

export function createSnapshotTools(ctx: SnapshotToolsContext) {
  const saveMoodboardSnapshot = tool({
    description: "Save a version snapshot of the current moodboard before major changes.",
    inputSchema: z.object({
      aiSummary: z.string().optional(),
    }),
    execute: async ({ aiSummary }) => {
      try {
        const snap = await createMoodboardSnapshot(ctx.client, ctx.moodboardId, {
          aiSummary,
        });
        return { id: snap.id, aiSummary: snap.aiSummary, createdAt: snap.createdAt };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Failed to save snapshot",
          hint: "Check API logs or network tab for POST /moodboards/.../snapshots",
        };
      }
    },
  });

  const listMoodboardSnapshotsTool = tool({
    description: "List saved moodboard version snapshots.",
    inputSchema: z.object({}),
    execute: async () => {
      const snaps = await listMoodboardSnapshots(ctx.client, ctx.moodboardId);
      return {
        count: snaps.length,
        snapshots: snaps.map((s) => ({
          id: s.id,
          aiSummary: s.aiSummary,
          createdAt: s.createdAt,
        })),
      };
    },
  });

  const exportMoodboardDeck = tool({
    description:
      "Signal that the moodboard is ready for export. Returns export hint — customer uses Download in the moodboard toolbar.",
    inputSchema: z.object({
      format: z.enum(["png", "pdf", "svg"]).optional(),
    }),
    execute: async ({ format }) => ({
      ready: true,
      format: format ?? "pdf",
      hint: "Use the Export button in the moodboard toolbar to download the deck.",
    }),
  });

  return {
    saveMoodboardSnapshot,
    listMoodboardSnapshots: listMoodboardSnapshotsTool,
    exportMoodboardDeck,
  };
}
