export const LANDING_MEDIA = {
  logo: "/gfs-logo.svg",
  hero: {
    poster: "/images/sections/hero/poster.jpg",
    video: "/videos/hero-video.mp4",
  },
  benefits: [
    "/images/sections/benefits/innovation.webp",
    "/images/sections/benefits/sustainability.jpg",
    "/images/sections/benefits/supply-chain.jpg",
  ],
  leadership: {
    founder: "/images/founder-photo.webp",
    dubaiHq: "/images/sections/leadership/dubai-hq.jpg",
  },
  services: "/images/sections/services/sourcing.jpg",
  expertise: {
    intake: "/images/sections/expertise/process/intake.jpg",
    materials: "/images/sections/expertise/process/materials.jpg",
    craft: "/images/sections/expertise/process/craft.jpg",
    production: "/images/sections/expertise/process/production.jpg",
  },
  platform: {
    dashboard: "/images/sections/platform/dashboard.jpg",
    workflow: "/images/sections/platform/workflow.jpg",
  },
  cta: "/images/sections/cta/collaborate.jpg",
  partnerLogos: [
    { name: "Marc O'Polo", src: "/images/logos/marc-opolo.webp" },
    { name: "Mey", src: "/images/logos/mey.webp" },
    { name: "MUSTANG", src: "/images/logos/mustang.png" },
    { name: "Palmers", src: "/images/logos/palmers.svg" },
    { name: "Smith & Soul", src: "/images/logos/smith-soul.webp" },
    { name: "Hiltl", src: "/images/logos/hiltl.webp" },
    { name: "Calvin Klein", src: "/images/logos/calvin-klein.webp" },
    { name: "Tommy Hilfiger", src: "/images/logos/tommy-hilfiger.webp" },
    { name: "s.Oliver", src: "/images/logos/s-oliver.webp" },
  ],
  testimonialPhotos: {
    "Susanne Schwenger": "/images/testimonials/susanne-schwenger.webp",
    "Florian Mey": "/images/testimonials/florian-mey.webp",
    "Signe Oepen": "/images/testimonials/signe-oepen.webp",
    "Patrick Barth": "/images/testimonials/patrick-barth.webp",
    "Semih Simsek": "/images/testimonials/semih-simsek.webp",
  },
} as const;

/** @deprecated Use LANDING_MEDIA.hero */
export const HERO_MEDIA = LANDING_MEDIA.hero;

/** @deprecated Use LANDING_MEDIA.leadership / LANDING_MEDIA.services */
export const CRAFT_MEDIA = {
  poster: LANDING_MEDIA.leadership.founder,
  image: LANDING_MEDIA.services,
} as const;
