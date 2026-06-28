"use client";

import { motion, useReducedMotion } from "motion/react";
import { GLOBAL_HUBS } from "./global-hubs";
import { GlobalMap } from "./global-map";
import { SectionHeader } from "./section-header";
import { MotionReveal } from "@/components/design-system/motion-reveal";

export function GlobalPresence() {
  const reduce = useReducedMotion();

  return (
    <section id="network" className="border-t border-border bg-muted/20 py-24 lg:py-32">
      <div className="mx-auto max-w-[88rem] px-6 sm:px-10 lg:px-16">
        <MotionReveal>
          <SectionHeader
            label="Global network"
            title="On-the-ground sourcing across four continents"
            description="Regional hubs give direct access to fabric mills, garment manufacturers, and trim suppliers — coordinated from Dubai with one quality and compliance standard."
          />
        </MotionReveal>

        <MotionReveal delay={0.08}>
          <div className="mt-14 border border-border bg-background p-4 sm:p-6 lg:p-8">
            <GlobalMap />
          </div>
        </MotionReveal>

        <div className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2">
          {GLOBAL_HUBS.map((hub, index) => (
            <motion.article
              key={hub.id}
              className="bg-background px-7 py-8 lg:px-9 lg:py-10"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.5 }}
              whileHover={reduce ? undefined : { y: -4 }}
            >
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-mono text-[11px] tracking-[0.12em] text-accent">
                  {hub.isHq ? "Headquarters" : hub.label}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {hub.timezone}
                </p>
              </div>
              <h3 className="mt-4 text-xl font-medium tracking-tight">
                {hub.city}, {hub.country}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{hub.title}</p>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {hub.markets.join(" · ")}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
