'use client';
import { GLOBAL_HUBS } from './global-hubs';
type MapHubPinsProps = {
  w: number;
  h: number;
  activeHubId: string | null;
  setActiveHubId: (id: string | null) => void;
};
export function MapHubPins({
  w,
  h,
  activeHubId,
  setActiveHubId,
}: MapHubPinsProps) {
  return (
    <>
      {GLOBAL_HUBS.map((hub) => {
        const x = (hub.mapX / 100) * w;
        const y = (hub.mapY / 100) * h;
        const active = activeHubId === hub.id;
        const dimmed = activeHubId !== null && !active;
        return (
          <g
            key={hub.id}
            onMouseEnter={() => setActiveHubId(hub.id)}
            onMouseLeave={() => setActiveHubId(null)}
            onFocus={() => setActiveHubId(hub.id)}
            onBlur={() => setActiveHubId(null)}
            tabIndex={0}
            role="button"
            aria-label={`${hub.city}, ${hub.title}`}
            className="cursor-pointer outline-none"
            style={{ opacity: dimmed ? 0.45 : 1 }}
          >
            {hub.isHq && (
              <circle
                cx={x}
                cy={y}
                r={active ? 18 : 13}
                fill="var(--map-hub)"
                opacity={active ? 0.22 : 0.1}
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={hub.isHq ? 6.5 : 5}
              fill={hub.isHq ? 'var(--map-hub-active)' : 'var(--map-hub)'}
              filter={active ? 'url(#pin-glow)' : undefined}
            />
            <circle
              cx={x}
              cy={y}
              r={hub.isHq ? 2.5 : 2}
              fill="var(--map-callout-bg)"
            />
          </g>
        );
      })}
    </>
  );
}
