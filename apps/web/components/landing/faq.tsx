"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeader } from "./section-header";
import { MotionReveal } from "@/components/design-system/motion-reveal";

const faqs = [
  {
    id: "process",
    question: "How does the sourcing proposal process work?",
    answer:
      "You submit a project brief with your inspiration, requirements, and timeline. Our team conducts internal sourcing research — fabric selection, product references, style direction — then builds a structured proposal for your review. You can approve, request changes, or reject directly in the platform.",
  },
  {
    id: "timeline",
    question: "How long does it take to receive a proposal?",
    answer:
      "Most proposals are delivered within 5 to 10 business days, depending on collection complexity. Rush timelines can be arranged during consultation.",
  },
  {
    id: "revisions",
    question: "Can we request revisions to a proposal?",
    answer:
      "Yes. You can request changes per section or for the entire proposal. Our team revises and resubmits — all tracked with version history in the platform.",
  },
  {
    id: "designers",
    question: "Who are the designers in your network?",
    answer:
      "Experienced sourcing professionals specializing in fabrics, materials, and garment references across key global production hubs including Turkey, Portugal, Italy, and Asia.",
  },
  {
    id: "project-types",
    question: "What project types do you handle?",
    answer:
      "Spring/Summer and Fall/Winter collections, capsule ranges, resort and pre-fall drops, private label development, and fabric library builds.",
  },
  {
    id: "pricing",
    question: "How is pricing structured?",
    answer:
      "Project-based and agreed upfront. Details are discussed during your initial consultation before any sourcing work begins.",
  },
  {
    id: "confidentiality",
    question: "Is my design data kept confidential?",
    answer:
      "Strictly. All projects are covered by NDA. Client briefs, moodboards, and proposals are never shared across accounts.",
  },
] as const;

export function Faq() {
  return (
    <section id="faq" className="border-t border-border py-24 lg:py-32">
      <div className="mx-auto max-w-[88rem] px-6 sm:px-10 lg:px-16">
        <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <MotionReveal>
            <SectionHeader
              label="FAQ"
              title="Sourcing & supply chain questions"
              description="Straight answers about how we work with fashion brands on sourcing and production."
              className="lg:sticky lg:top-24 lg:self-start"
            />
          </MotionReveal>

          <MotionReveal delay={0.08}>
            <Accordion type="single" collapsible className="border-t border-border">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="border-b border-border"
                >
                  <AccordionTrigger className="py-6 text-left hover:no-underline">
                    <span className="text-base font-medium tracking-tight sm:text-lg">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </MotionReveal>
        </div>
      </div>
    </section>
  );
}
