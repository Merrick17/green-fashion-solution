import { Logo } from "@/components/design-system/logo";
import { LANDING_BRAND } from "@/lib/landing-brand";

export function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="mx-auto flex max-w-[88rem] flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
        <div>
          <Logo href="/" height={22} variant="light" />
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-primary-foreground/45">
            {LANDING_BRAND.footerTagline}
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground/50">
          © {new Date().getFullYear()} {LANDING_BRAND.name}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary-foreground/40">
          Dubai · Guangzhou · Bangalore · Lahore
        </p>
      </div>
    </footer>
  );
}
