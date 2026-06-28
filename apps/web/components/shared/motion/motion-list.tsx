'use client';
import { motion, useReducedMotion } from 'motion/react';
import { listItem } from './variants';
export function MotionList({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : listItem.initial}
      animate={reduce ? undefined : listItem.animate}
      transition={reduce ? undefined : { staggerChildren: 0.05 }}
    >
      {children}
    </motion.div>
  );
}
