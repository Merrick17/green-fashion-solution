'use client';
import { motion, useReducedMotion } from 'motion/react';
import { pageTransition } from './variants';
export function MotionPage({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : pageTransition.initial}
      animate={reduce ? undefined : pageTransition.animate}
      exit={reduce ? undefined : pageTransition.exit}
      transition={reduce ? undefined : pageTransition.transition}
    >
      {children}
    </motion.div>
  );
}
