import "server-only";

import { generateImage } from "ai";
import { getFireworksProvider } from "../providers/fireworks-cloud";
import { resolveFireworksModel } from "./models";

export interface GenerateImageOptions {
  prompt: string;
  modelId?: string;
}

export interface GenerateImageResult {
  model: string;
  /** data:image/png;base64,... */
  dataUrl: string;
}

export async function generateFireworksImage(
  options: GenerateImageOptions,
): Promise<GenerateImageResult> {
  const model = resolveFireworksModel("image", options.modelId);
  const fireworks = getFireworksProvider();

  const fashionPrompt = [
    "High-end fashion editorial reference photograph for a luxury sourcing moodboard.",
    options.prompt,
    "Photorealistic, professional studio lighting, lookbook quality, no text overlays.",
  ].join(" ");

  const result = await generateImage({
    model: fireworks.image(model),
    prompt: fashionPrompt,
    aspectRatio: "1:1",
    maxRetries: 0,
  });

  const file = result.image;
  if (!file?.base64) {
    throw new Error("Fireworks AI returned no image payload");
  }

  const mediaType = file.mediaType || "image/png";
  const dataUrl = `data:${mediaType};base64,${file.base64}`;

  return { model, dataUrl };
}
