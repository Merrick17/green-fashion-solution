"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type PillarCardProps = {
  index: number;
  number: string;
  title: string;
  description: string;
  tag: string;
  children?: ReactNode;
};

export function PillarCard({
  index,
  number,
  title,
  description,
  tag,
}: PillarCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      className="group relative flex flex-col bg-background px-7 py-8 lg:px-8 lg:py-10"
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        delay: index * 0.08,
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={
        reduce
          ? undefined
          : {
              y: -6,
              rotateX: 4,
              rotateY: index % 2 === 0 ? -3 : 3,
            }
      }
      style={{ transformStyle: "preserve-3d" }}
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-accent/0 transition-colors duration-300 group-hover:bg-accent"
        layout
      />
      <p className="font-mono text-[11px] tracking-[0.12em] text-accent">{number}</p>
      <h3 className="mt-4 text-lg font-medium tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
        {tag}
      </p>
    </motion.article>
  );
}
