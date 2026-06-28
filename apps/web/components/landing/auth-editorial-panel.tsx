import Image from 'next/image';
import { Logo } from '@/components/design-system/logo';
import { LANDING_MEDIA } from '@/lib/landing-media';
import { LANDING_BRAND } from "@/lib/landing-brand";
type AuthPanelProps = { title: string; body: string };
export function AuthEditorialPanel({ title, body }: AuthPanelProps) {
  return (
    <div className="relative hidden min-h-dvh flex-col justify-between overflow-hidden lg:flex">
      <Image
        src={LANDING_MEDIA.cta}
        alt=""
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
      <div className="relative z-10 flex flex-1 flex-col justify-between p-12">
        <Logo variant="light" height={28} />
        <div>
          <h2 className="max-w-md font-serif text-[length:var(--text-display-sm)] leading-[var(--leading-heading)] tracking-[var(--tracking-display)] text-white">
            {title}
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/70">
            {body}
          </p>
        </div>
        <p className="text-xs text-white/40">{LANDING_BRAND.tagline}</p>
      </div>
    </div>
  );
}
