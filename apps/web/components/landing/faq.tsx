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
    id: "deliverable",
    question: "What does your sourcing team deliver?",
    answer:
      "A presentation-ready sourcing proposal: curated fabrics, vetted suppliers, cost and lead-time context, and style direction. After approval, we manage sampling and production through to delivery.",
  },
  {
    id: "expertise",
    question: "What supply chain capabilities do you cover?",
    answer:
      "Material research, supplier vetting and negotiation, quality control, sampling coordination, bulk production oversight, and logistics — end-to-end, with one dedicated contact for your brand.",
  },
  {
    id: "network",
    question: "Where is your sourcing network based?",
    answer:
      "Four hub offices — Dubai (HQ), Guangzhou, Bangalore, and Lahore — giving direct access to supplier markets across Eastern Europe, South Asia, East Asia, and North Africa.",
  },
  {
    id: "timeline",
    question: "How quickly can we receive a sourcing proposal?",
    answer:
      "Timelines depend on collection scope and research depth. Most brands move from signed brief to first proposal review in days to weeks — significantly faster than managing sourcing internally.",
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
