"use client";

import Image from "next/image";
import { LANDING_MEDIA } from "@/lib/landing-media";

function PartnerLogo({ name, src }: { name: string; src: string }) {
  return (
    <div className="relative flex h-11 w-32 shrink-0 items-center justify-center opacity-45 grayscale transition-all duration-300 hover:opacity-90 hover:grayscale-0 sm:h-12 sm:w-36">
      <Image
        src={src}
        alt={name}
        fill
        sizes="144px"
        className="object-contain object-center"
      />
    </div>
  );
}

export function Partners() {
  const logos = LANDING_MEDIA.partnerLogos;
  const track = [...logos, ...logos];

  return (
    <div className="mt-16 border-t border-border pt-12">
      <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Partner brands
      </p>
      <div className="relative mt-8 w-full overflow-hidden" aria-label="Partner brand logos">
        <div className="animate-marquee flex w-max items-center gap-14 px-7 motion-reduce:animate-none sm:gap-20">
          {track.map((partner, index) => (
            <PartnerLogo
              key={`${partner.name}-${index}`}
              name={partner.name}
              src={partner.src}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
