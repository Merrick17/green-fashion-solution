'use client';
import { useEffect } from 'react';
import { scrollToHash } from '@/lib/smooth-scroll';
export function SmoothScroll() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const anchor = (event.target as Element | null)?.closest(
        "a[href^='#']",
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;
      const id = hash.slice(1);
      if (!document.getElementById(id)) return;
      event.preventDefault();
      scrollToHash(hash);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  return null;
}
