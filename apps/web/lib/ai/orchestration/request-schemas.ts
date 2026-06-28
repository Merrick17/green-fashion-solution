import { z } from "zod";

/**
 * Zod request schemas for the AI v1 route handlers. These mirror the hand-written
 * `AiChatRequestBody` / `AiProposalRequestBody` types in `lib/ai/types.ts`.
 *
 * `canvasContext` is intentionally `unknown` (its nested shape is rich and the
 * agent coerces it defensively) so valid requests are never rejected by an
 * over-strict schema. The only hard requirements mirror what the routes already
 * enforce: a non-empty `messages` array and the required id field.
 */
export const aiChatBodySchema = z.object({
  messages: z.array(z.unknown()).min(1),
  moodboardId: z.string().min(1),
  projectId: z.string().optional(),
  canvasContext: z.unknown().optional(),
  modelId: z.string().optional(),
  enableImage: z.boolean().optional(),
  mode: z.enum(["design", "parse"]).optional(),
});

export const aiProposalBodySchema = z.object({
  messages: z.array(z.unknown()).min(1),
  projectId: z.string().min(1),
  proposalId: z.string().optional(),
  moodboardIds: z.array(z.string()).optional(),
  modelId: z.string().optional(),
  revisionMode: z.boolean().optional(),
  enableRag: z.boolean().optional(),
});

export const aiSourcingBodySchema = z.object({
  messages: z.array(z.unknown()).min(1),
  modelId: z.string().optional(),
});

export type ValidateOk<T> = { ok: true; data: T };
export type ValidateErr = { ok: false; error: string };
export type ValidateResult<T> = ValidateOk<T> | ValidateErr;

export function validateBody<T>(
  schema: z.ZodType<T>,
  body: unknown,
): ValidateResult<T> {
  const result = schema.safeParse(body);
  if (result.success) return { ok: true, data: result.data };
  const error = result.error.issues
    .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
    .join("; ");
  return { ok: false, error };
}