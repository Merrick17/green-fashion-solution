'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function NavigationProgress() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setShow(true);
    setKey((k) => k + 1);
    const t = setTimeout(() => setShow(false), 400);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!show) return null;

  return (
    <div
      key={key}
      className="nav-progress-bar fixed top-0 left-0 right-0 z-[9999] h-[2px] bg-[--portal-accent]"
      aria-hidden="true"
    />
  );
}
