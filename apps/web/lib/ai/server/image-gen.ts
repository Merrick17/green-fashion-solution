/** Generate fashion moodboard images via Fireworks AI; persist to object storage when possible. */
import type { AxiosInstance } from "axios";
import { generateFireworksImage } from "../fireworks/images";
import { isFireworksConfigured } from "../fireworks/client";
import { uploadMoodboardBuffer } from "./nest-client";
import { getCachedImage, setCachedImage } from "../image-cache";

export interface GenerateFashionImageOptions {
  client?: AxiosInstance;
  moodboardId?: string;
}

/** SVG placeholder tiles — used when image generation is disabled or fails. */
const PLACEHOLDER_SVGS = [
  { bg: "#1a1a1a", accent: "#333333" },
  { bg: "#0f1117", accent: "#2a2a2a" },
  { bg: "#111214", accent: "#2e2e2e" },
  { bg: "#13100e", accent: "#2c2520" },
  { bg: "#0e1110", accent: "#1e2820" },
  { bg: "#12100f", accent: "#302820" },
  { bg: "#0d0d12", accent: "#22203a" },
  { bg: "#111010", accent: "#2a2020" },
] as const;

function makePlaceholderSvg(bg: string, accent: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900"><rect width="900" height="900" fill="${bg}"/><rect x="350" y="260" width="200" height="160" rx="0" fill="none" stroke="${accent}" stroke-width="2"/><line x1="350" y1="260" x2="450" y2="360" stroke="${accent}" stroke-width="1.5"/><line x1="550" y1="260" x2="450" y2="360" stroke="${accent}" stroke-width="1.5"/><circle cx="460" cy="310" r="16" fill="none" stroke="${accent}" stroke-width="2"/><text x="450" y="530" text-anchor="middle" font-family="sans-serif" font-size="11" fill="${accent}" letter-spacing="4">IMAGE UNAVAILABLE</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const PLACEHOLDER_DATA_URIS = PLACEHOLDER_SVGS.map(({ bg, accent }) =>
  makePlaceholderSvg(bg, accent),
);

function editorialFallbackUrl(prompt: string): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = (hash * 31 + prompt.charCodeAt(i)) >>> 0;
  }
  return PLACEHOLDER_DATA_URIS[hash % PLACEHOLDER_DATA_URIS.length]!;
}

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; contentType: string } {
  const [meta, base64] = dataUrl.split(",");
  const contentType = meta?.match(/data:([^;]+)/)?.[1] ?? "image/png";
  return { buffer: Buffer.from(base64 ?? "", "base64"), contentType };
}

function extensionForContentType(contentType: string): string {
  const mime = contentType.split(";")[0]?.trim() ?? "image/png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "png";
}

export async function generateFashionImage(
  prompt: string,
  options?: GenerateFashionImageOptions,
): Promise<string> {
  if (process.env.AI_ENABLE_IMAGE_GEN === "false") {
    return editorialFallbackUrl(prompt);
  }

  if (!isFireworksConfigured()) {
    console.error("Fireworks image generation skipped: FIREWORKS_API_KEY not set");
    return editorialFallbackUrl(prompt);
  }

  const cached = getCachedImage(prompt);
  if (cached !== undefined) return cached;

  try {
    const { dataUrl } = await generateFireworksImage({ prompt });
    const { buffer, contentType } = dataUrlToBuffer(dataUrl);

    if (!options?.client || !options?.moodboardId) {
      throw new Error("moodboardId and authenticated client are required to persist generated images");
    }

    const ext = extensionForContentType(contentType);
    const key = await uploadMoodboardBuffer(
      options.client,
      options.moodboardId,
      buffer,
      contentType,
      `ai-generated.${ext}`,
    );
    setCachedImage(prompt, key);
    return key;
  } catch (error) {
    console.error("Fireworks image generation failed:", error);
    const fallback = editorialFallbackUrl(prompt);
    setCachedImage(prompt, fallback);
    return fallback;
  }
}
