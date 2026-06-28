'use client';
import { motion, useReducedMotion } from 'motion/react';
import { WorkflowNode } from './workflow-node';
export function PlatformAutomationIllustration() {
  const prefersReduced = useReducedMotion();
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <svg
        viewBox="0 0 480 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-auto w-full"
        role="img"
        aria-label="Fashion sourcing and supply chain workflow from brief to production"
      >
        {/* Flow paths */}
        <motion.path
          d="M120 88 C120 140, 240 140, 240 168"
          className="stroke-accent/40"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          initial={prefersReduced ? false : { pathLength: 0, opacity: 0.4 }}
          whileInView={
            prefersReduced ? undefined : { pathLength: 1, opacity: 1 }
          }
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <motion.path
          d="M360 88 C360 140, 240 140, 240 168"
          className="stroke-accent/40"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          initial={prefersReduced ? false : { pathLength: 0, opacity: 0.4 }}
          whileInView={
            prefersReduced ? undefined : { pathLength: 1, opacity: 1 }
          }
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.15, ease: 'easeOut' }}
        />
        <motion.path
          d="M240 252 C240 300, 120 300, 120 332"
          className="stroke-accent/40"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          initial={prefersReduced ? false : { pathLength: 0, opacity: 0.4 }}
          whileInView={
            prefersReduced ? undefined : { pathLength: 1, opacity: 1 }
          }
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        />
        <motion.path
          d="M240 252 C240 300, 360 300, 360 332"
          className="stroke-accent/40"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          initial={prefersReduced ? false : { pathLength: 0, opacity: 0.4 }}
          whileInView={
            prefersReduced ? undefined : { pathLength: 1, opacity: 1 }
          }
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.45, ease: 'easeOut' }}
        />
        {/* Input nodes */}
        <WorkflowNode
          x={120}
          y={64}
          label="Brand brief"
          sublabel="Collection requirements"
        />
        <WorkflowNode x={360} y={64} label="Material research" sublabel="Fabrics · Trims" />
        {/* Hub — automation core */}
        <g transform="translate(240 210)">
          <circle r="56" className="fill-card stroke-border" strokeWidth="1" />
          <circle
            r="44"
            className="fill-secondary/80 stroke-accent/30"
            strokeWidth="1"
          />
          <circle r="6" cx="0" cy="0" className="fill-accent" />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <line
              key={deg}
              x1="0"
              y1="0"
              x2={Math.cos((deg * Math.PI) / 180) * 28}
              y2={Math.sin((deg * Math.PI) / 180) * 28}
              className="stroke-accent/35"
              strokeWidth="1"
            />
          ))}
          <text
            y="-4"
            textAnchor="middle"
            className="fill-foreground"
            fontSize="11"
            fontWeight="600"
            fontFamily="var(--font-geist-sans)"
          >
            SOURCING
          </text>
          <text
            y="12"
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize="8"
            letterSpacing="0.12em"
          >
            DUBAI HQ
          </text>
        </g>
        {/* Output nodes */}
        <WorkflowNode
          x={120}
          y={356}
          label="Sourcing proposal"
          sublabel="Brand review"
        />
        <WorkflowNode
          x={360}
          y={356}
          label="Production"
          sublabel="Sampling · Delivery"
        />
        <motion.circle
          r="56"
          cx="240"
          cy="210"
          className="stroke-accent/20"
          strokeWidth="1"
          fill="none"
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '240px 210px' }}
        />
      </svg>
    </div>
  );
}
