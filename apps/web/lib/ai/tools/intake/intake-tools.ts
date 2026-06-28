import { tool } from "ai";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import {
  fetchProject,
  listBriefOptions,
  listProjectFiles,
  registerProjectFile,
  submitProject,
  updateProject,
} from "../../server/nest-client";

export interface IntakeToolsContext {
  client: AxiosInstance;
  projectId: string;
}

export function createIntakeTools(ctx: IntakeToolsContext) {
  const readProjectBrief = tool({
    description: "Read the customer's project brief fields (title, description, status, structured brief).",
    inputSchema: z.object({}),
    execute: async () => {
      const project = await fetchProject(ctx.client, ctx.projectId);
      return {
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        season: project.season,
        category: project.category,
        budgetBand: project.budgetBand,
        targetDelivery: project.targetDelivery,
        moq: project.moq,
        garmentCategories: project.garmentCategories,
        targetPricePointMillimes: project.targetPricePointMillimes,
        sustainabilityRequirements: project.sustainabilityRequirements,
        briefSubmittedAt: project.briefSubmittedAt,
      };
    },
  });

  const listBriefOptionsTool = tool({
    description: "List available brief option values (seasons, categories, etc.) for guided intake.",
    inputSchema: z.object({}),
    execute: async () => {
      const options = await listBriefOptions(ctx.client);
      return { count: options.length, options: options.slice(0, 50) };
    },
  });

  const updateProjectBrief = tool({
    description:
      "Update project brief fields. Use for guided co-editing with the customer. Price values are millimes (integer, not float).",
    inputSchema: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      season: z.string().optional(),
      category: z.string().optional(),
      budgetBand: z.string().optional(),
      targetDelivery: z.string().optional(),
      moq: z.number().int().optional(),
      garmentCategories: z
        .array(z.string())
        .optional()
        .describe("Garment categories e.g. ['tops', 'outerwear', 'dresses']"),
      targetPricePointMillimes: z
        .number()
        .int()
        .optional()
        .describe("Target retail price in millimes (integer, e.g. 89000 = 89.000 TND)"),
      sustainabilityRequirements: z
        .string()
        .optional()
        .describe("Sustainability constraints e.g. 'GOTS certified cotton only'"),
    }),
    execute: async (dto) => {
      const updated = await updateProject(ctx.client, ctx.projectId, dto);
      return {
        id: updated.id,
        title: updated.title,
        status: updated.status,
        garmentCategories: updated.garmentCategories,
        targetPricePointMillimes: updated.targetPricePointMillimes,
        sustainabilityRequirements: updated.sustainabilityRequirements,
      };
    },
  });

  const submitProjectForReview = tool({
    description: "Submit the project for admin review after moodboard and brief are ready.",
    inputSchema: z.object({}),
    execute: async () => {
      const project = await submitProject(ctx.client, ctx.projectId);
      return { id: project.id, status: project.status, submitted: true };
    },
  });

  const listProjectFilesTool = tool({
    description: "List files uploaded to this project (inspiration images, references).",
    inputSchema: z.object({}),
    execute: async () => {
      const files = await listProjectFiles(ctx.client, ctx.projectId);
      return {
        count: files.length,
        files: files.map((f) => ({ id: f.id, type: f.type, url: f.url, createdAt: f.createdAt })),
      };
    },
  });

  const registerUploadedFile = tool({
    description: "Register a file URL with the project after customer upload.",
    inputSchema: z.object({
      url: z.string().url(),
      type: z.string().optional(),
    }),
    execute: async ({ url, type }) => {
      const file = await registerProjectFile(ctx.client, ctx.projectId, url, type ?? "IMAGE");
      return { ok: true, url, type: type ?? "IMAGE", file };
    },
  });

  return {
    readProjectBrief,
    listBriefOptions: listBriefOptionsTool,
    updateProjectBrief,
    submitProjectForReview,
    listProjectFiles: listProjectFilesTool,
    registerUploadedFile,
  };
}
