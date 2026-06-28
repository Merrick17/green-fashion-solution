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
    id: 'istanbul',
    label: 'Hub 01',
    city: 'Istanbul',
    country: 'Turkey',
    title: 'Knitwear & Denim',
    markets: ['Knitwear', 'Denim', 'Sportswear manufacturing at scale'],
    contact: '',
    timezone: 'UTC+3',
    callout: { dx: 20, dy: -72, width: 160 },
    lat: 41.01,
    lng: 28.97,
    ...toWorldPos(28.97, 41.01),
  },
  {
    id: 'porto',
    label: 'Hub 02',
    city: 'Porto',
    country: 'Portugal',
    title: 'Premium Garments',
    markets: ['Premium garments', 'Sustainable fabrics', 'Tailoring'],
    contact: '',
    timezone: 'UTC+0',
    callout: { dx: 20, dy: -72, width: 152 },
    lat: 41.15,
    lng: -8.61,
    ...toWorldPos(-8.61, 41.15),
  },
  {
    id: 'milan',
    label: 'Hub 03',
    city: 'Milan & Como',
    country: 'Italy',
    title: 'Luxury Fabrics',
    markets: ['Luxury fabrics', 'Silk', 'Jacquards', 'Leather'],
    contact: '',
    timezone: 'UTC+1',
    callout: { dx: 20, dy: -72, width: 152 },
    lat: 45.46,
    lng: 9.19,
    ...toWorldPos(9.19, 45.46),
  },
  {
    id: 'shanghai',
    label: 'Hub 04',
    city: 'Shanghai & Guangzhou',
    country: 'China',
    title: 'Technical Fabrics',
    markets: ['Technical fabrics', 'High-volume production'],
    contact: '',
    timezone: 'UTC+8',
    callout: { dx: 20, dy: -72, width: 160 },
    lat: 31.23,
    lng: 121.47,
    ...toWorldPos(121.47, 31.23),
  },
  {
    id: 'jaipur',
    label: 'Hub 05',
    city: 'Jaipur & Ahmedabad',
    country: 'India',
    title: 'Natural Fibers & Craft',
    markets: ['Natural fibers', 'Handcraft', 'Embroidery', 'Prints'],
    contact: '',
    timezone: 'UTC+5:30',
    callout: { dx: 20, dy: 36, width: 152 },
    lat: 26.91,
    lng: 75.79,
    ...toWorldPos(75.79, 26.91),
  },
  {
    id: 'casablanca',
    label: 'Hub 06',
    city: 'Casablanca',
    country: 'Morocco',
    title: 'Leather & Artisanal',
    markets: ['Leather goods', 'Artisanal work', 'Nearshore production'],
    contact: '',
    timezone: 'UTC+1',
    callout: { dx: -158, dy: 28, width: 152 },
    lat: 33.59,
    lng: -7.62,
    ...toWorldPos(-7.62, 33.59),
  },
];

export const HUB_CONNECTIONS: [string, string][] = [
  ['istanbul', 'milan'],
  ['milan', 'porto'],
  ['istanbul', 'jaipur'],
  ['jaipur', 'shanghai'],
  ['jaipur', 'casablanca'],
  ['istanbul', 'casablanca'],
];
