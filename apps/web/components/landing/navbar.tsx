"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Logo } from "@/components/design-system/logo";
import { LANDING_NAV_LINKS } from "@/lib/landing-nav";
import { ThemeToggle } from "@/components/shell/theme-toggle";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-[88rem] items-center justify-between gap-4 px-6 sm:px-10 lg:px-16">
        <Logo href="/" height={24} variant="dark" />

        {isHome && (
          <nav className="hidden items-center gap-8 md:flex">
            {LANDING_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="bg-foreground px-5 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-background transition-colors hover:bg-foreground/90"
          >
            Start a project
          </Link>
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            className="inline-flex h-10 w-10 items-center justify-center text-foreground md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" strokeWidth={1.25} />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 border-0">
            <nav className="mt-10 flex flex-col gap-6">
              {isHome &&
                LANDING_NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              <ThemeToggle />
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="border border-border bg-card py-3 text-center text-[11px] font-medium uppercase tracking-[0.14em]"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="bg-foreground py-3 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-background"
              >
                Start a project
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
