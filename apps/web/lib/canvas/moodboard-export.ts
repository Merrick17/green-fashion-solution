"use client";

import type { Editor } from "tldraw";
import { exportAs } from "tldraw";
import type { MoodboardExportFormat } from "./moodboard-export.types";

export type { MoodboardExportFormat } from "./moodboard-export.types";

export function sanitizeExportFileName(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.slice(0, 80) || "moodboard";
}

export async function exportMoodboardCanvas(
  editor: Editor,
  format: MoodboardExportFormat,
  title: string,
): Promise<void> {
  const shapeIds = [...editor.getCurrentPageShapeIds()];
  if (shapeIds.length === 0) {
    throw new Error("Nothing on the canvas to export yet.");
  }

  const name = sanitizeExportFileName(title);
  editor.selectNone();
  await editor.zoomToFit({ animation: { duration: 200 } });

  if (format === "pdf") {
    const { exportMoodboardPdf } = await import("./moodboard-export-pdf.client");
    await exportMoodboardPdf(editor, shapeIds, name);
    return;
  }

  await exportAs(editor, shapeIds, {
    format,
    name,
    scale: format === "png" ? 2 : 1,
    background: true,
  });
}
