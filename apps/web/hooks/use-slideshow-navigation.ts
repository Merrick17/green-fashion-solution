'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useSlideshowNavigation(slideCount: number) {
  const [index, setIndex] = useState(0);
  const [filmstripOpen, setFilmstripOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (next: number) => {
      if (!slideCount) return;
      setIndex(Math.max(0, Math.min(slideCount - 1, next)));
    },
    [slideCount],
  );

  const prev = useCallback(() => go(index - 1), [go, index]);
  const next = useCallback(() => go(index + 1), [go, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Home') go(0);
      if (e.key === 'End') go(slideCount - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, next, prev, slideCount]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleFullscreen = async () => {
    const el = rootRef.current;
    if (!el) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await el.requestFullscreen();
  };

  return { index, go, prev, next, filmstripOpen, setFilmstripOpen, isFullscreen, toggleFullscreen, rootRef };
}
