export type AssetSearchKind = "fabric" | "product";

export interface AssetSearchDocumentInput {
  kind: AssetSearchKind;
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  keywords?: string[];
}

/** Normalize comma- or newline-separated keyword input from forms. */
export function parseKeywordsInput(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[,;\n]+/)
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

/** Dense text document for embedding / RAG / lexical ranking. */
export function formatAssetSearchDocument(input: AssetSearchDocumentInput): string {
  const keywords = (input.keywords ?? []).filter(Boolean);
  const parts = [
    `[${input.kind}]`,
    `id=${input.id}`,
    `title="${input.title}"`,
    input.description?.trim() ? `description="${input.description.trim()}"` : null,
    input.imageUrl?.trim() ? `imageUrl=${input.imageUrl.trim()}` : null,
    keywords.length ? `keywords=${keywords.join(", ")}` : null,
  ].filter(Boolean);

  return parts.join(" ");
}

export function assetSearchText(
  asset: Pick<AssetSearchDocumentInput, "title" | "description" | "imageUrl" | "keywords">,
): string {
  return [
    asset.title,
    asset.description ?? "",
    asset.imageUrl ?? "",
    ...(asset.keywords ?? []),
  ]
    .join(" ")
    .toLowerCase();
}
