export const SOURCING_EXPERTISE_PILLARS = [
  {
    number: "01",
    title: "Sourcing strategy",
    description:
      "Translate collection goals into a structured brief — target markets, materials, cost architecture, sustainability requirements, and lead-time constraints.",
    tag: "Brief · Markets · Cost targets",
  },
  {
    number: "02",
    title: "Material & fabric research",
    description:
      "Identify, test, and document fabrics, trims, and product references across our global supplier network — with hand-feel and compliance validated early.",
    tag: "Fabrics · Trims · Lab dips",
  },
  {
    number: "03",
    title: "Supplier curation",
    description:
      "Shortlist vetted manufacturers and material suppliers matched to your quality standards, capacity needs, and regional sourcing strategy.",
    tag: "Vetting · Negotiation · Compliance",
  },
  {
    number: "04",
    title: "Supply chain execution",
    description:
      "Move from approved proposal through sampling, bulk production, and delivery — with milestone visibility and a single point of contact throughout.",
    tag: "Sampling · Production · Logistics",
  },
] as const;

/** @deprecated Use SOURCING_EXPERTISE_PILLARS */
export const PLATFORM_PILLARS = SOURCING_EXPERTISE_PILLARS;
