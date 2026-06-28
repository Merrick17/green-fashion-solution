import { getFireworksProvider } from "./fireworks-cloud";
import { resolveFireworksModel } from "../fireworks/models";
import { isFireworksConfigured } from "../fireworks/client";
import type { ProviderResolutionResult, AiModelPurpose } from "./provider.types";

function resolveFireworksChat(
  modelId: string,
  purpose: AiModelPurpose = "chat",
): ProviderResolutionResult {
  const fireworks = getFireworksProvider();
  return {
    providerName: "fireworks",
    getModelHandle: (id: string) => fireworks(id),
    providerModelId: modelId,
    purpose,
  };
}

export async function resolveAiProvider(
  modelId?: string | null,
  purpose: AiModelPurpose = "chat",
): Promise<ProviderResolutionResult> {
  if (!isFireworksConfigured()) {
    throw new Error(
      "FIREWORKS_API_KEY is required. Create a key at https://fireworks.ai",
    );
  }

  let providerModelId: string;
  if (modelId?.trim()) {
    providerModelId = modelId.trim();
  } else {
    switch (purpose) {
      case "vision":
        providerModelId = resolveFireworksModel("vision");
        break;
      case "custom":
        providerModelId = resolveFireworksModel("custom");
        break;
      case "reasoning":
        providerModelId = resolveFireworksModel("reasoning");
        break;
      default:
        providerModelId =
          process.env.AI_DEFAULT_MODEL?.trim() || resolveFireworksModel("chat");
        break;
    }
  }

  return resolveFireworksChat(providerModelId, purpose);
}
