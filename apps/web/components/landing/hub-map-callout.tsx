'use client';
import type { GlobalHub } from './global-hubs';
const CALLOUT_H = 112;
type HubCalloutProps = {
  hub: GlobalHub;
  x: number;
  y: number;
  active: boolean;
  dimmed: boolean;
};
function splitMarkets(markets: string[]): [string, string] {
  if (markets.length <= 1) return [markets.join(' · '), ''];
  const mid = Math.ceil(markets.length / 2);
  return [markets.slice(0, mid).join(' · '), markets.slice(mid).join(' · ')];
}
export function HubCallout({ hub, x, y, active, dimmed }: HubCalloutProps) {
  const { dx, dy, width } = hub.callout;
  const bx = x + dx;
  const by = y + dy;
  const left = dx < 0 ? bx - width : bx;
  const [marketsA, marketsB] = splitMarkets(hub.markets);
  return (
    <g style={{ opacity: dimmed ? 0.35 : 1 }} pointerEvents="none">
      <line
        x1={x}
        y1={y}
        x2={bx + (dx < 0 ? width : 0)}
        y2={by + CALLOUT_H / 2}
        stroke="var(--map-hub)"
        strokeWidth="1"
        opacity={active ? 0.7 : 0.4}
      />
      <rect
        x={left}
        y={by}
        width={width}
        height={CALLOUT_H}
        rx="2"
        fill="var(--map-callout-bg)"
        stroke={active ? 'var(--map-hub)' : 'var(--map-land-stroke)'}
        strokeWidth={active ? 1.25 : 1}
        opacity={active ? 1 : 0.92}
      />
      <text
        x={left + 10}
        y={by + 18}
        fill="var(--map-hub)"
        fontSize="12"
        letterSpacing="0.14em"
      >
        {hub.label.toUpperCase()} {hub.isHq ? ' · HQ' : ''}
      </text>
      <text
        x={left + 10}
        y={by + 38}
        fill="var(--map-callout-text)"
        fontSize="14"
        fontWeight="600"
        fontFamily="var(--font-geist-sans), ui-sans-serif, sans-serif"
      >
        {hub.city}
      </text>
      <text
        x={left + 10}
        y={by + 56}
        fill="var(--map-caption)"
        fontSize="12"
        letterSpacing="0.08em"
      >
        {hub.title.toUpperCase()}
      </text>
      {marketsA && (
        <text x={left + 10} y={by + 72} fill="var(--map-caption)" fontSize="12">
          {marketsA}
        </text>
      )}
      {marketsB && (
        <text x={left + 10} y={by + 86} fill="var(--map-caption)" fontSize="12">
          {marketsB}
        </text>
      )}
      <text
        x={left + 10}
        y={by + 102}
        fill="var(--map-callout-text)"
        fontSize="12"
        fontWeight="500"
      >
        {hub.contact} · {hub.timezone}
      </text>
    </g>
  );
}
