import { tool } from "ai";
import { z } from "zod";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function createFetchReferenceUrlTool() {
  return tool({
    description:
      "Validate a reference image URL and return metadata for moodboard or file registration.",
    inputSchema: z.object({
      url: z.string().url(),
    }),
    execute: async ({ url }) => {
      const res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        return { ok: false, error: `URL returned ${res.status}` };
      }

      const contentType = res.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
      const isImage = ALLOWED_IMAGE_TYPES.has(contentType);

      return {
        ok: true,
        url,
        contentType,
        isImage,
        hint: isImage
          ? "Download or upload the image to project files via registerUploadedFile. Do not pass raw URLs to createItem."
          : "Not an image — describe the reference in chat instead.",
      };
    },
  });
}
