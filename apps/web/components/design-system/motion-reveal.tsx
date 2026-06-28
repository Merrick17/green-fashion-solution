'use client';
import { motion, useReducedMotion } from 'motion/react';
import { motion as motionTokens } from '@/lib/design-tokens';
import type { ReactNode } from 'react';
type MotionRevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};
export function MotionReveal({
  children,
  delay = 0,
  className,
}: MotionRevealProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: motionTokens.base / 1000,
        delay,
        ease: motionTokens.ease,
      }}
    >
      {children}
    </motion.div>
  );
}
