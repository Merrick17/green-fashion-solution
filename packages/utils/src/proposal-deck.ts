import {
  sortProposalSections,
  type ProposalItemLike,
  type ProposalSectionLike,
} from "./proposal";

export type ProposalSlideType =
  | "cover"
  | "style"
  | "sectionDivider"
  | "sectionIntro"
  | "asset"
  | "closing";

export interface ProposalSlide {
  type: ProposalSlideType;
  title?: string;
  subtitle?: string;
  body?: string;
  assetKind?: "Fabric" | "Reference";
  assetName?: string;
  sectionTitle?: string;
  imageUrl?: string;
  keywords?: string[];
  notes?: string | null;
  version?: number;
}

export type ProposalDeckInput = {
  title?: string | null;
  season?: string | null;
  styleSummary?: string | null;
  version?: number;
  createdAt?: string | Date;
  project?: {
    title?: string;
    customer?: { name?: string };
  };
  sections: ProposalSectionLike[];
};

function assetFromItem(item: ProposalItemLike) {
  const fabric = item.fabricAsset;
  const product = item.productAsset;
  const asset = fabric ?? product;
  if (!asset) return null;
  return {
    kind: (fabric ? "Fabric" : "Reference") as "Fabric" | "Reference",
    name: asset.name,
    description: asset.description,
    imageUrl: asset.imageUrl,
    keywords: asset.keywords,
    notes: item.notes,
  };
}

export function buildProposalSlides(proposal: ProposalDeckInput): ProposalSlide[] {
  const sections = sortProposalSections(proposal.sections ?? []);
  const title = proposal.title || proposal.project?.title || "Collection Proposal";
  const season = proposal.season || "";
  const client = proposal.project?.customer?.name || "Confidential";
  const date =
    proposal.createdAt instanceof Date
      ? proposal.createdAt.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
      : proposal.createdAt
        ? new Date(proposal.createdAt).toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric",
          })
        : "";

  const slides: ProposalSlide[] = [
    {
      type: "cover",
      title,
      subtitle: [season, client, date].filter(Boolean).join(" · "),
      version: proposal.version,
    },
  ];

  if (proposal.styleSummary?.trim()) {
    slides.push({
      type: "style",
      title: "Style direction",
      body: proposal.styleSummary.trim(),
    });
  }

  for (const section of sections) {
    const items = [...section.items].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    if (!items.length) continue;

    slides.push({
      type: "sectionDivider",
      title: section.title,
      sectionTitle: section.title,
    });

    if (section.description?.trim()) {
      slides.push({
        type: "sectionIntro",
        title: section.title,
        body: section.description.trim(),
        sectionTitle: section.title,
      });
    }

    for (const item of items) {
      const row = assetFromItem(item);
      if (!row) continue;
      slides.push({
        type: "asset",
        title: row.name,
        subtitle: row.notes?.trim() || undefined,
        assetKind: row.kind,
        assetName: row.name,
        sectionTitle: section.title,
        body: row.description ?? undefined,
        imageUrl: row.imageUrl,
        keywords: row.keywords,
        notes: row.notes,
      });
    }
  }

  slides.push({ type: "closing", title: "Thank you" });
  return slides;
}

export function imageDataUri(buffer: Buffer, imageUrl: string): string {
  const lower = imageUrl.toLowerCase();
  if (lower.endsWith(".png")) return `image/png;base64,${buffer.toString("base64")}`;
  if (lower.endsWith(".webp")) return `image/webp;base64,${buffer.toString("base64")}`;
  if (lower.endsWith(".gif")) return `image/gif;base64,${buffer.toString("base64")}`;
  return `image/jpeg;base64,${buffer.toString("base64")}`;
}
