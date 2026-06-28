"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { LANDING_MEDIA } from "@/lib/landing-media";
import { Partners } from "./partners";
import { SectionHeader } from "./section-header";
import { MotionReveal } from "@/components/design-system/motion-reveal";

const testimonials = [
  {
    quote:
      "Deep end-to-end understanding of product development, procurement, and global supplier markets.",
    name: "Signe Oepen",
    role: "COO, MUSTANG",
  },
  {
    quote:
      "Exceptional commitment and deep understanding of global sourcing markets — our supply chain became more robust and flexible.",
    name: "Susanne Schwenger",
    role: "CPO, Marc O'Polo",
  },
] as const;

export function TrustSection() {
  const reduce = useReducedMotion();

  return (
    <section id="trust" className="border-t border-border py-24 lg:py-32">
      <div className="mx-auto max-w-[88rem] px-6 sm:px-10 lg:px-16">
        <MotionReveal>
          <SectionHeader
            label="Clients"
            title="Trusted by brands that depend on supply chain excellence"
            description="International fashion companies rely on our sourcing expertise — from material selection to production delivery."
            className="mx-auto max-w-2xl text-center"
            align="center"
          />
        </MotionReveal>

        <motion.figure
          className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-[auto_1fr]"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative mx-auto h-28 w-28 overflow-hidden border border-border md:mx-0">
            <Image
              src={LANDING_MEDIA.leadership.founder}
              alt="Geworg Ambarzumian"
              fill
              className="object-cover"
              sizes="112px"
            />
          </div>
          <blockquote className="border-l-2 border-accent pl-8">
            <p className="text-xl font-medium leading-relaxed tracking-tight text-balance sm:text-2xl">
              &ldquo;We solve complex sourcing challenges with the discipline of a
              fashion house and the reach of a global supply chain network.&rdquo;
            </p>
            <figcaption className="mt-6 text-sm text-muted-foreground">
              Geworg Ambarzumian · Founder
            </figcaption>
          </blockquote>
        </motion.figure>

        <div className="mt-16 grid gap-8 border-t border-border pt-16 md:grid-cols-2">
          {testimonials.map((item, index) => (
            <motion.blockquote
              key={item.name}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <p className="text-sm leading-relaxed text-muted-foreground">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="mt-4 text-sm font-medium text-foreground">
                {item.name}
                <span className="font-normal text-muted-foreground">
                  {" "}
                  · {item.role}
                </span>
              </footer>
            </motion.blockquote>
          ))}
        </div>

        <Partners />
      </div>
    </section>
  );
}
