import { tool } from "ai";
import { z } from "zod";
import { MoodItemType, type CreateMoodItemDto } from "@repo/types";
import { createMoodItem, deleteMoodItem, updateMoodItem } from "../server/nest-client";
import {
  imageContent,
  textContent,
  colorContent,
  linkContent,
  styleSchema,
  updateContent,
  type CanvasToolContext,
} from "./canvas-schemas";

export function createCanvasItemTools(ctx: CanvasToolContext) {
  const { moodboardId, client } = ctx;

  const createItemTool = tool({
    description: "Create a new mood item on the canvas.",
    inputSchema: z.discriminatedUnion("type", [
      z.object({ type: z.literal("IMAGE"),        x: z.number().default(0), y: z.number().default(0), width: z.number().default(200), height: z.number().default(200), content: imageContent,  style: styleSchema }),
      z.object({ type: z.literal("AI_GENERATED"), x: z.number().default(0), y: z.number().default(0), width: z.number().default(200), height: z.number().default(200), content: imageContent,  style: styleSchema }),
      z.object({ type: z.literal("TEXT"),         x: z.number().default(0), y: z.number().default(0), width: z.number().default(200), height: z.number().default(200), content: textContent,   style: styleSchema }),
      z.object({ type: z.literal("COLOR"),        x: z.number().default(0), y: z.number().default(0), width: z.number().default(120), height: z.number().default(120), content: colorContent,  style: styleSchema }),
      z.object({ type: z.literal("LINK"),         x: z.number().default(0), y: z.number().default(0), width: z.number().default(200), height: z.number().default(60),  content: linkContent,   style: styleSchema }),
    ]),
    execute: async (params) => {
      const content = params.content as { src?: string; key?: string };
      if (params.type === "IMAGE" || params.type === "AI_GENERATED") {
        if (content.src?.startsWith("http") && !content.key) {
          return { error: "External image URLs are not allowed. Use generateImage to create visuals on the board." };
        }
        if (!content.src && !content.key) {
          return { error: "IMAGE items require generateImage. Do not create empty image placeholders with createItem." };
        }
      }
      const dto = {
        type: params.type as MoodItemType,
        x: params.x,
        y: params.y,
        width: params.width,
        height: params.height,
        content: params.content as Record<string, unknown>,
        style: params.style as Record<string, unknown> | undefined,
      };
      return createMoodItem(client, moodboardId, dto as unknown as CreateMoodItemDto);
    },
  });

  const updateItemTool = tool({
    description: "Update an existing mood item's position, size, rotation, or content.",
    inputSchema: z.object({
      id: z.string(),
      x: z.number().optional(),
      y: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      rotation: z.number().optional(),
      content: updateContent,
      style: styleSchema,
    }),
    execute: async (params) => {
      const { id, ...dto } = params;
      const updateDto: Record<string, unknown> = {};
      if (dto.x !== undefined) updateDto.x = dto.x;
      if (dto.y !== undefined) updateDto.y = dto.y;
      if (dto.width !== undefined) updateDto.width = dto.width;
      if (dto.height !== undefined) updateDto.height = dto.height;
      if (dto.rotation !== undefined) updateDto.rotation = dto.rotation;
      if (dto.content !== undefined) updateDto.content = dto.content;
      if (dto.style !== undefined) updateDto.style = dto.style;
      return updateMoodItem(client, moodboardId, id, updateDto);
    },
  });

  const deleteItemTool = tool({
    description: "Remove an item from the canvas.",
    inputSchema: z.object({ id: z.string() }),
    execute: async ({ id }) => {
      await deleteMoodItem(client, moodboardId, id);
      return { deleted: id };
    },
  });

  const moveItemTool = tool({
    description: "Move an item to a new position on the canvas.",
    inputSchema: z.object({ id: z.string(), x: z.number(), y: z.number() }),
    execute: async ({ id, x, y }) => updateMoodItem(client, moodboardId, id, { x, y }),
  });

  const groupItemsTool = tool({
    description: "Group multiple items together with a shared groupId.",
    inputSchema: z.object({
      itemIds: z.array(z.string()),
      groupId: z.string().optional(),
    }),
    execute: async ({ itemIds, groupId }) => {
      const gid = groupId ?? `group-${Date.now()}`;
      const results = await Promise.all(
        itemIds.map((id) => updateMoodItem(client, moodboardId, id, { groupId: gid })),
      );
      return { groupId: gid, items: results.length };
    },
  });

  return {
    createItem: createItemTool,
    updateItem: updateItemTool,
    deleteItem: deleteItemTool,
    moveItem: moveItemTool,
    groupItems: groupItemsTool,
  };
}
