export const FIREWORKS_MODELS = {
  chat: process.env.FIREWORKS_MODEL_CHAT ?? "accounts/fireworks/models/kimi-k2p6",
  reasoning:
    process.env.FIREWORKS_MODEL_REASONING ??
    process.env.FIREWORKS_MODEL_CHAT ??
    "accounts/fireworks/models/kimi-k2-thinking",
  vision:
    process.env.FIREWORKS_MODEL_VISION ??
    "accounts/fireworks/models/qwen2-vl-72b-instruct",
  embed:
    process.env.FIREWORKS_MODEL_EMBED ?? "nomic-ai/nomic-embed-text-v1.5",
  image:
    process.env.FIREWORKS_MODEL_IMAGE ?? "accounts/fireworks/models/flux-1-schnell-fp8",
  custom: process.env.FIREWORKS_MODEL_CUSTOM ?? "",
} as const;

export type FireworksModelRole = keyof typeof FIREWORKS_MODELS;

export function resolveFireworksModel(
  role: "chat" | "reasoning" | "vision" | "embed" | "image" | "custom",
  override?: string | null,
): string {
  if (override?.trim()) return override.trim();
  if (role === "custom" && FIREWORKS_MODELS.custom) return FIREWORKS_MODELS.custom;
  if (role === "custom") return FIREWORKS_MODELS.chat;
  return FIREWORKS_MODELS[role];
}
