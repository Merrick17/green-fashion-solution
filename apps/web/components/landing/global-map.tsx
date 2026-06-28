'use client';
import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { GLOBAL_HUBS, HUB_CONNECTIONS, type GlobalHub } from './global-hubs';
import { HubCallout } from './hub-map-callout';
import { MapHubPins } from './map-hub-pins';
import { MAP_VIEWBOX, WORLD_LAND_PATHS } from './world-map-paths';
function hubById(id: string) {
  return GLOBAL_HUBS.find((h) => h.id === id)!;
}
function connectionPath(from: GlobalHub, to: GlobalHub, w: number, h: number) {
  const x1 = (from.mapX / 100) * w;
  const y1 = (from.mapY / 100) * h;
  const x2 = (to.mapX / 100) * w;
  const y2 = (to.mapY / 100) * h;
  const mx = (x1 + x2) / 2;
  const my = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.1 - 22;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}
export function GlobalMap() {
  const [activeHubId, setActiveHubId] = useState<string | null>(null);
  const prefersReduced = useReducedMotion();
  const { w, h } = MAP_VIEWBOX;
  return (
    <motion.div
      className="relative w-full"
      initial={prefersReduced ? false : { opacity: 0, y: 24 }}
      whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full"
        aria-label="Green Fashion Solution global sourcing and supply chain network"
        role="img"
      >
        <defs>
          <pattern
            id="world-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="var(--map-land-stroke)"
              strokeWidth="0.4"
              opacity="0.55"
            />
          </pattern>
          <filter id="pin-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" /> <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width={w} height={h} fill="var(--map-land)" />
        <rect width={w} height={h} fill="url(#world-grid)" />
        {/* Equator & prime meridian */}
        <line
          x1={0}
          y1={h / 2}
          x2={w}
          y2={h / 2}
          stroke="var(--map-land-stroke)"
          strokeWidth="0.75"
          opacity="0.45"
        />
        <line
          x1={w / 2}
          y1={0}
          x2={w / 2}
          y2={h}
          stroke="var(--map-land-stroke)"
          strokeWidth="0.75"
          opacity="0.45"
        />
        <g fill="var(--map-hub)" opacity={0.42}>
          {WORLD_LAND_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        {HUB_CONNECTIONS.map(([a, b]) => {
          const from = hubById(a);
          const to = hubById(b);
          const lit = !activeHubId || activeHubId === a || activeHubId === b;
          return (
            <motion.path
              key={`${a}-${b}`}
              d={connectionPath(from, to, w, h)}
              fill="none"
              stroke="var(--map-arc)"
              strokeWidth="1.25"
              strokeDasharray="4 6"
              initial={prefersReduced ? false : { pathLength: 0, opacity: 0 }}
              whileInView={
                prefersReduced
                  ? undefined
                  : { pathLength: 1, opacity: lit ? 0.4 : 0.1 }
              }
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut' }}
              animate={{ opacity: lit ? 0.4 : 0.08 }}
            />
          );
        })}
        {GLOBAL_HUBS.map((hub) => {
          const x = (hub.mapX / 100) * w;
          const y = (hub.mapY / 100) * h;
          const active = activeHubId === hub.id;
          const dimmed = activeHubId !== null && !active;
          return (
            <HubCallout
              key={`callout-${hub.id}`}
              hub={hub}
              x={x}
              y={y}
              active={active}
              dimmed={dimmed}
            />
          );
        })}
        <MapHubPins
          w={w}
          h={h}
          activeHubId={activeHubId}
          setActiveHubId={setActiveHubId}
        />
      </svg>
      <p className="mt-5 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        4 hubs · 12+ sourcing markets · Dubai HQ
      </p>
    </motion.div>
  );
}
