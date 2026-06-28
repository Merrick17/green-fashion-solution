"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { HeroVideo } from "@/components/landing/hero-video";
import { Logo } from "@/components/design-system/logo";
import { HERO_MEDIA } from "@/lib/landing-media";
import { LANDING_BRAND } from "@/lib/landing-brand";
import { motion as motionTokens } from "@/lib/design-tokens";

const fadeUp = (delay: number, reduce: boolean | null) =>
  reduce
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: {
          delay,
          duration: 0.65,
          ease: motionTokens.ease,
        },
      };

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative min-h-[100dvh] overflow-hidden border-b border-border bg-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto grid min-h-[100dvh] max-w-[var(--content-wide)] lg:grid-cols-[1fr_1.05fr]">
        <div className="flex flex-col justify-center px-6 py-24 sm:px-10 lg:px-16 lg:py-28">
          <motion.p
            {...fadeUp(0.05, reduce)}
            className="mb-6 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent"
          >
            {LANDING_BRAND.tagline}
          </motion.p>

          <motion.h1
            {...fadeUp(0.12, reduce)}
            className="max-w-xl text-balance text-[2rem] font-medium leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[3.25rem]"
          >
            {LANDING_BRAND.headline}
          </motion.h1>

          <motion.p
            {...fadeUp(0.2, reduce)}
            className="mt-6 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {LANDING_BRAND.subheadline}
          </motion.p>

          <motion.div
            {...fadeUp(0.28, reduce)}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href="/register"
              className="bg-foreground px-8 py-3 text-center text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Start a sourcing project
            </Link>
            <a
              href="#contact"
              className="border border-border bg-card px-8 py-3 text-center text-sm font-medium text-foreground transition-colors hover:border-accent/40"
            >
              Book consultation
            </a>
          </motion.div>

          <motion.dl
            {...fadeUp(0.36, reduce)}
            className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8"
          >
            {[
              { label: "Sourcing hubs", value: "4" },
              { label: "Supplier markets", value: "12+" },
              { label: "Chain oversight", value: "End-to-end" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="mt-2 text-2xl font-medium tracking-tight">{stat.value}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          className="relative flex min-h-[52vh] flex-col border-t border-border lg:min-h-0 lg:border-l lg:border-t-0"
          {...fadeUp(0.18, reduce)}
        >
          <div className="relative min-h-[52vh] flex-1 lg:min-h-0">
            <HeroVideo
              posterSrc={HERO_MEDIA.poster}
              videoSrc={HERO_MEDIA.video}
              variant="contained"
              className="h-full min-h-[52vh] lg:min-h-full"
            />
            <div
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
              aria-hidden
            >
              <Logo
                variant="light"
                height={140}
                className="opacity-[0.18] sm:opacity-20"
              />
            </div>
          </div>
          <div className="border-t border-border bg-background px-6 py-5 sm:px-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
              Sourcing deliverable
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              A presentation-ready sourcing proposal — curated fabrics, vetted
              suppliers, cost context, and a clear path from approval to
              production.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
