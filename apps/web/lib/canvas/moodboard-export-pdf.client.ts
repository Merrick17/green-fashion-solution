"use client";

import type { Editor } from "tldraw";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read image"));
    reader.readAsDataURL(blob);
  });
}

export async function exportMoodboardPdf(
  editor: Editor,
  shapeIds: Parameters<Editor["toImage"]>[0],
  name: string,
): Promise<void> {
  const result = await editor.toImage(shapeIds, {
    format: "png",
    scale: 2,
    background: true,
  });

  const dataUrl = await blobToDataUrl(result.blob);
  const { jsPDF } = await import("jspdf/dist/jspdf.es.min.js");

  const orientation = result.width >= result.height ? "landscape" : "portrait";
  const pdf = new jsPDF({
    orientation,
    unit: "px",
    format: [result.width, result.height],
    hotfixes: ["px_scaling"],
  });

  pdf.addImage(dataUrl, "PNG", 0, 0, result.width, result.height);
  pdf.save(`${name}.pdf`);
}
