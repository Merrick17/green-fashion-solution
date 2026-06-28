import type {
  AIGeneratedContent,
  ColorContent,
  ImageContent,
  LinkContent,
  MoodItem,
  TextContent,
} from "@repo/types";
import { toAbsoluteStorageUrl } from "@/lib/storage/storage-url";

/** Pure helpers shared by AI context (server) and tldraw sync (client). No tldraw imports. */

export function shapeIdToMoodItemId(shapeId: string): string | null {
  const prefix = "shape:";
  if (!shapeId.startsWith(prefix)) return null;
  return shapeId.slice(prefix.length);
}

export function getImageSrc(item: MoodItem, resolvedUrls: Record<string, string>): string | null {
  const content = item.content as ImageContent & AIGeneratedContent;
  if (content.src?.startsWith("http") || content.src?.startsWith("data:")) {
    return content.src;
  }
  if (content.src?.startsWith("/uploads/")) {
    return toAbsoluteStorageUrl(content.src);
  }
  if (content.key) {
    const resolved = resolvedUrls[item.id];
    if (resolved) return resolved;
  }
  return null;
}

export function summarizeItemContent(item: MoodItem): Record<string, unknown> {
  switch (item.type) {
    case "TEXT":
      return { text: (item.content as TextContent).text };
    case "COLOR": {
      const c = item.content as ColorContent;
      return { hex: c.hex, name: c.name };
    }
    case "LINK": {
      const c = item.content as LinkContent;
      return { url: c.url, title: c.title };
    }
    case "IMAGE":
    case "AI_GENERATED": {
      const c = item.content as ImageContent & AIGeneratedContent;
      return { alt: c.alt, prompt: c.prompt, hasSrc: Boolean(c.src || c.key) };
    }
    default:
      return {};
  }
}
