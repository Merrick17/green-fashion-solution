'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { LANDING_MEDIA } from '@/lib/landing-media';
import { SectionHeader } from './section-header';
import { PilotWaitlistForm } from './pilot-waitlist-form';
import { Button } from '@/components/ui/button';

const highlights = [
  {
    label: 'Scope',
    value: '14 styles',
    detail: 'Contemporary capsule across tops, bottoms, and outerwear',
  },
  {
    label: 'Timeline',
    value: '8 weeks',
    detail: 'From signed brief to approved sourcing proposal',
  },
  {
    label: 'Materials',
    value: '62% lower impact',
    detail: 'Traceable cotton blends and recycled synthetics vs. baseline',
  },
  {
    label: 'Outcome',
    value: '3× faster',
    detail: "Sampling decisions vs. the brand's previous sourcing cycle",
  },
] as const;

const phases = [
  {
    step: '01',
    title: 'The brief',
    body: 'A European contemporary brand needed a cohesive 14-piece capsule with measurable sustainability targets, without sacrificing hand-feel or lead times.',
  },
  {
    step: '02',
    title: 'Research & curation',
    body: 'Our team sourced traceable cotton blends, low-impact dyes, and garment references across Portugal, Turkey, and Tunisia. Every option was documented for client review.',
  },
  {
    step: '03',
    title: 'Proposal & sampling',
    body: 'A presentation-ready proposal landed in eight weeks. The brand approved six hero fabrics, requested two revisions, and moved into physical sampling within days.',
  },
  {
    step: '04',
    title: 'Production handoff',
    body: 'Approved samples moved into production tracking with milestone visibility. One admin point of contact from first cut to delivery.',
  },
] as const;

export function PilotProject() {
  const reduce = useReducedMotion();

  return (
    <section
      id="pilot-project"
      className="border-y border-border bg-surface py-28 lg:py-36"
    >
      <div className="mx-auto max-w-[88rem] px-6 sm:px-10 lg:px-16">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <SectionHeader
            label="Meet our pilot project"
            title="A sustainable capsule, sourced, proposed, and delivered in weeks."
            description="This pilot paired a contemporary fashion brand with our end-to-end sourcing workflow: structured brief, curated materials, a client-ready proposal, and production visibility through to delivery."
          />
          <motion.div
            className="relative aspect-[4/3] overflow-hidden bg-muted"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={LANDING_MEDIA.expertise.craft}
              alt="Curated fabric and garment references for a sustainable capsule collection"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 44vw"
            />
          </motion.div>
        </div>

        <div className="mt-20 grid gap-px bg-border md:grid-cols-2 lg:mt-24 lg:grid-cols-4">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="bg-background px-7 py-10 md:px-9 md:py-12"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                {item.label}
              </p>
              <p className="mt-4 font-serif text-3xl tracking-tight">
                {item.value}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 lg:mt-24">
          <h3 className="font-serif text-2xl tracking-tight sm:text-3xl">
            How the project unfolded
          </h3>
          <div className="mt-10 grid gap-10 md:grid-cols-2 lg:gap-12">
            {phases.map((phase, index) => (
              <motion.article
                key={phase.step}
                className="border-l-2 border-accent/40 pl-6"
                initial={reduce ? false : { opacity: 0, x: -12 }}
                whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  {phase.step}
                </p>
                <h4 className="mt-3 font-serif text-xl tracking-tight">
                  {phase.title}
                </h4>
                <p className="mt-3 text-sm leading-[1.7] text-muted-foreground">
                  {phase.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" variant="brand" className="h-12 px-8">
            <Link href="/register">Start your project</Link>
          </Button>
          <Button asChild size="lg" variant="brandOutline" className="h-12 px-8">
            <a href="#contact">Book consultation</a>
          </Button>
        </div>

        <div className="mt-16 lg:mt-20">
          <PilotWaitlistForm />
        </div>
      </div>
    </section>
  );
}
