export type GlobalHub = {
  id: string;
  label: string;
  city: string;
  country: string;
  title: string;
  markets: string[];
  contact: string;
  timezone: string;
  isHq?: boolean;
  /** Equirectangular world position (0–100) */
  mapX: number;
  mapY: number;
  lat: number;
  lng: number;
  /** Callout box offset from pin (viewBox units) */
  callout: { dx: number; dy: number; width: number };
};

/** Full world equirectangular: lng −180…180 · lat 90…−90 */
function toWorldPos(lng: number, lat: number) {
  return {
    mapX: ((lng + 180) / 360) * 100,
    mapY: ((90 - lat) / 180) * 100,
  };
}

export const GLOBAL_HUBS: GlobalHub[] = [
  {
    id: 'guangzhou',
    label: 'Hub 01',
    city: 'Guangzhou',
    country: 'China',
    title: 'East Asia Hub',
    markets: ['China', 'Vietnam', 'Cambodia', 'Indonesia'],
    contact: 'Jessi / Semih',
    timezone: 'UTC+8',
    callout: { dx: 20, dy: -72, width: 148 },
    lat: 23.13,
    lng: 113.26,
    ...toWorldPos(113.26, 23.13),
  },
  {
    id: 'bangalore',
    label: 'Hub 02',
    city: 'Bangalore',
    country: 'India',
    title: 'South Asia Hub',
    markets: ['Bangladesh', 'India', 'Sri Lanka'],
    contact: 'Mythili',
    timezone: 'UTC+5:30',
    callout: { dx: 42, dy: 36, width: 142 },
    lat: 12.97,
    lng: 77.59,
    ...toWorldPos(77.59, 12.97),
  },
  {
    id: 'lahore',
    label: 'Hub 03',
    city: 'Lahore',
    country: 'Pakistan',
    title: 'West Asia & Africa Hub',
    markets: ['Pakistan', 'Egypt', 'Tunisia'],
    contact: 'Muhammad',
    timezone: 'UTC+5',
    callout: { dx: -152, dy: -72, width: 148 },
    lat: 31.55,
    lng: 74.34,
    ...toWorldPos(74.34, 31.55),
  },
  {
    id: 'dubai',
    label: 'HQ',
    city: 'Dubai',
    country: 'UAE',
    title: 'Global Headquarters',
    markets: ['Romania', 'Ukraine', 'Türkiye'],
    contact: 'Geworg',
    timezone: 'UTC+4',
    isHq: true,
    callout: { dx: -158, dy: 28, width: 152 },
    lat: 25.2,
    lng: 55.27,
    ...toWorldPos(55.27, 25.2),
  },
];

export const HUB_CONNECTIONS: [string, string][] = [
  ['dubai', 'lahore'],
  ['dubai', 'bangalore'],
  ['dubai', 'guangzhou'],
  ['lahore', 'bangalore'],
  ['bangalore', 'guangzhou'],
];
