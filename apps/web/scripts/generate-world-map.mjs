import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const geojson = JSON.parse(
  readFileSync(join(__dirname, "../data/ne_110m_land.geojson"), "utf8")
);

const W = 1000;
const H = 500;

function project(lng, lat) {
  return [((lng + 180) / 360) * W, ((90 - lat) / 180) * H];
}

function ringToPath(ring) {
  return (
    ring
      .map(([lng, lat], i) => {
        const [x, y] = project(lng, lat);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join("") + "Z"
  );
}

function geometryToPaths(geometry) {
  if (geometry.type === "Polygon") {
    return [ringToPath(geometry.coordinates[0])];
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.map((poly) => ringToPath(poly[0]));
  }
  return [];
}

const paths = geojson.features.flatMap((f) => geometryToPaths(f.geometry));

const out = `/** Auto-generated from Natural Earth 110m land (public domain). Run: node scripts/generate-world-map.mjs */

export const MAP_VIEWBOX = { w: ${W}, h: ${H} } as const;

export const WORLD_LAND_PATHS = ${JSON.stringify(paths)} as const;
`;

writeFileSync(join(__dirname, "../components/landing/world-map-paths.ts"), out);
console.log(`Generated ${paths.length} land paths`);
