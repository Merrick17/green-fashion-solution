"use client";

import { LANDING_MEDIA } from "@/lib/landing-media";
import { SectionHeader } from "./section-header";
import { ParallaxImage } from "./parallax-image";
import { MotionReveal } from "@/components/design-system/motion-reveal";
import { motion, useReducedMotion } from "motion/react";

const chapters = [
  {
    id: "brief",
    step: "01",
    title: "Sourcing brief & requirements",
    body: "Your brand defines the collection — materials, cost targets, sustainability goals, and timeline. We translate that into a structured sourcing mandate.",
    image: LANDING_MEDIA.expertise.intake,
  },
  {
    id: "research",
    step: "02",
    title: "Global material research",
    body: "Our hubs research fabrics, trims, and garment references across 12+ supplier markets. Every option is documented with cost, lead time, and compliance context.",
    image: LANDING_MEDIA.expertise.materials,
  },
  {
    id: "proposal",
    step: "03",
    title: "Sourcing proposal delivery",
    body: "We assemble a presentation-ready proposal — shortlisted suppliers, material selections, and style direction. You approve, revise, or advance to sampling.",
    image: LANDING_MEDIA.expertise.craft,
  },
  {
    id: "execution",
    step: "04",
    title: "Supply chain through delivery",
    body: "After approval, we manage sampling, bulk production, and logistics milestones. One team oversees the chain from lab dip to final delivery.",
    image: LANDING_MEDIA.expertise.production,
  },
] as const;

export function StoryJourney() {
  const reduce = useReducedMotion();

  return (
    <section id="story" className="border-t border-border">
      <div className="border-b border-border px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
        <MotionReveal>
          <SectionHeader
            label="Process"
            title="How we run your supply chain"
            description="From the first brief to final delivery — a proven sourcing process built on decades of fashion supply chain experience."
            className="mx-auto max-w-2xl text-center"
            align="center"
          />
        </MotionReveal>
      </div>

      {chapters.map((chapter, index) => (
        <div
          key={chapter.id}
          className={index % 2 === 1 ? "bg-muted/30" : "bg-background"}
        >
          <div
            className={`mx-auto grid max-w-[88rem] items-stretch md:grid-cols-2 ${index % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
          >
            <ParallaxImage
              src={chapter.image}
              className="min-h-[18rem] md:min-h-[26rem]"
            />
            <motion.div
              className="flex flex-col justify-center border-t border-border px-6 py-12 md:border-t-0 md:px-14 lg:px-20"
              initial={reduce ? false : { opacity: 0, x: index % 2 === 0 ? 24 : -24 }}
              whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <p className="font-mono text-[11px] tracking-[0.12em] text-accent">
                {chapter.step}
              </p>
              <h3 className="mt-4 text-2xl font-medium tracking-tight text-balance sm:text-3xl">
                {chapter.title}
              </h3>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
                {chapter.body}
              </p>
            </motion.div>
          </div>
        </div>
      ))}
    </section>
  );
}
