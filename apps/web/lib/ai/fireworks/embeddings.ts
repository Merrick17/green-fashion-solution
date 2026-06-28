import "server-only";

import { embed, embedMany } from "ai";
import { getFireworksProvider } from "../providers/fireworks-cloud";
import { resolveFireworksModel } from "./models";

export interface EmbedResult {
  model: string;
  embeddings: number[][];
}

export async function embedTexts(
  input: string | string[],
  modelId?: string,
): Promise<EmbedResult> {
  const modelName = resolveFireworksModel("embed", modelId);
  const model = getFireworksProvider().embeddingModel(modelName);

  if (typeof input === "string") {
    const { embedding } = await embed({ model, value: input });
    return { model: modelName, embeddings: [embedding] };
  }

  const { embeddings } = await embedMany({ model, values: input });
  return { model: modelName, embeddings };
}

export async function embedText(text: string, modelId?: string): Promise<number[]> {
  const result = await embedTexts(text, modelId);
  const vector = result.embeddings[0];
  if (!vector?.length) throw new Error("Empty embedding returned from Fireworks AI");
  return vector;
}
