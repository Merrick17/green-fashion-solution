import type { LanguageModel } from "ai";

export type SupportedProvider = "fireworks";

export type AiModelPurpose = "chat" | "vision" | "custom" | "reasoning";

export interface ProviderResolutionResult {
  providerName: SupportedProvider;
  getModelHandle: (modelId: string) => LanguageModel;
  providerModelId: string;
  purpose?: AiModelPurpose;
}
