"use client";

import Link from "next/link";
import { SectionHeader } from "./section-header";

const MOCK_SECTIONS = [
  {
    id: "s1",
    label: "01 — Outerwear Fabrics",
    items: [
      {
        id: "f1",
        type: "fabric",
        name: "Linen Dobby",
        sub: "Okayama Mills · 180 g/m²",
        accent: "#C4B49A",
        tag: "SS26",
      },
      {
        id: "f2",
        type: "fabric",
        name: "Organic Cotton Twill",
        sub: "Boras Wäfveri · 260 g/m²",
        accent: "#D4C8B6",
        tag: "AW26",
      },
      {
        id: "f3",
        type: "fabric",
        name: "Linen-Viscose Blend",
        sub: "Albini Group · 145 g/m²",
        accent: "#BFB3A2",
        tag: "SS26",
      },
    ],
  },
  {
    id: "s2",
    label: "02 — Product References",
    items: [
      {
        id: "p1",
        type: "product",
        name: "Boxy Overshirt",
        sub: "Factory ref. TW-224 · MOQ 300",
        accent: "#9EA8A0",
        tag: "Tops",
      },
      {
        id: "p2",
        type: "product",
        name: "Wide Leg Trouser",
        sub: "Factory ref. TR-118 · MOQ 200",
        accent: "#A8A09E",
        tag: "Bottoms",
      },
      {
        id: "p3",
        type: "product",
        name: "Unstructured Blazer",
        sub: "Factory ref. JK-091 · MOQ 150",
        accent: "#B0A89A",
        tag: "Outerwear",
      },
    ],
  },
];

const STYLE_NOTES = [
  { label: "Direction", value: "Coastal minimal, structured silhouettes" },
  { label: "Palette", value: "Raw linen · Warm slate · Undyed cotton" },
  { label: "Season", value: "SS26 — early delivery March" },
  { label: "MOQ target", value: "150–300 units per style" },
];

function MockAssetCard({
  name,
  sub,
  accent,
  tag,
}: {
  name: string;
  sub: string;
  accent: string;
  tag: string;
}) {
  return (
    <div className="group flex flex-col border border-border bg-background">
      <div
        className="aspect-[4/3] w-full"
        style={{ background: `linear-gradient(135deg, ${accent}55 0%, ${accent}22 100%)` }}
      />
      <div className="flex flex-col gap-0.5 border-t border-border px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-semibold leading-snug text-foreground">
            {name}
          </span>
          <span className="mt-0.5 shrink-0 border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            {tag}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}

export function ProposalShowcase() {
  return (
    <section
      id="proposal-showcase"
      className="border-t border-border py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[88rem] px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-16 lg:flex-row lg:gap-20">
          {/* Left — header + style notes */}
          <div className="lg:w-80 lg:shrink-0">
            <SectionHeader
              label="Proposal Builder"
              title="What you receive when the work is done"
              description="Every sourcing project ends with a curated proposal — fabrics, product references, style direction, and collection structure, ready to present or export."
            />

            <div className="mt-10 flex flex-col gap-0 border border-border">
              {STYLE_NOTES.map((note, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-0.5 border-b border-border px-4 py-3 last:border-b-0"
                >
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {note.label}
                  </span>
                  <span className="text-sm text-foreground">{note.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/customer/demo"
                className="inline-flex items-center justify-center border border-foreground bg-foreground px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-background hover:text-foreground"
              >
                See a full sample proposal
              </Link>
              <Link
                href="#lead-form"
                className="inline-flex items-center justify-center border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground"
              >
                Start a project
              </Link>
            </div>
          </div>

          {/* Right — mock proposal sections */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-8">
              {MOCK_SECTIONS.map((section) => (
                <div key={section.id} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {section.label}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {section.items.map((item) => (
                      <MockAssetCard
                        key={item.id}
                        name={item.name}
                        sub={item.sub}
                        accent={item.accent}
                        tag={item.tag}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Proposal footer strip */}
              <div className="flex items-center justify-between border border-border bg-muted/20 px-5 py-3.5">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    SS26 Collection
                  </span>
                  <span className="h-3 w-px bg-border" />
                  <span className="text-xs text-muted-foreground">
                    6 references · 2 sections
                  </span>
                </div>
                <span className="border border-border px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Draft v1
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
