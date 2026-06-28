"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { SOURCING_EXPERTISE_PILLARS } from "./platform-pillars";
import { SectionHeader } from "./section-header";
import { PillarCard } from "./pillar-card";
import { PlatformAutomationIllustration } from "./platform-automation-illustration";
import { MotionReveal } from "@/components/design-system/motion-reveal";

export function Services() {
  const reduce = useReducedMotion();

  return (
    <section id="expertise" className="border-t border-border py-24 lg:py-32">
      <div className="mx-auto max-w-[88rem] px-6 sm:px-10 lg:px-16">
        <MotionReveal>
          <SectionHeader
            label="Expertise"
            title="Four disciplines. One supply chain standard."
            description="Strategy, material research, supplier curation, and execution — the full sourcing capability fashion brands need, delivered by a team with deep supply chain experience."
          />
        </MotionReveal>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div
            className="grid gap-px border border-border bg-border sm:grid-cols-2"
            style={{ perspective: 1200 }}
          >
            {SOURCING_EXPERTISE_PILLARS.map((pillar, index) => (
              <PillarCard
                key={pillar.number}
                index={index}
                number={pillar.number}
                title={pillar.title}
                description={pillar.description}
                tag={pillar.tag}
              />
            ))}
          </div>

          <motion.div
            className="border border-border bg-muted/30 p-6 sm:p-10"
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Global sourcing network
            </p>
            <PlatformAutomationIllustration />
          </motion.div>
        </div>

        <MotionReveal delay={0.1}>
          <p className="mt-12 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Our team combines on-the-ground supplier relationships with structured
            proposal delivery — so your brand gets vetted options, negotiated terms,
            and production visibility without managing the supply chain alone.
          </p>
          <Link
            href="#contact"
            className="mt-8 inline-block border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/40"
          >
            Discuss your sourcing needs
          </Link>
        </MotionReveal>
      </div>
    </section>
  );
}
