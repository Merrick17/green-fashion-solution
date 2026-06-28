'use client';
import { motion, useReducedMotion } from 'motion/react';
import { sectionRise } from './variants';
export function MotionSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      className={className}
      initial={reduce ? false : sectionRise.initial}
      whileInView={reduce ? undefined : sectionRise.whileInView}
      viewport={sectionRise.viewport}
      transition={sectionRise.transition}
    >
      {children}
    </motion.section>
  );
}
