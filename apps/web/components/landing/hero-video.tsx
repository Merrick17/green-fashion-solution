'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { landingAccentStrip } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

type HeroVideoProps = {
  posterSrc: string;
  videoSrc: string;
  variant?: 'full' | 'contained';
  className?: string;
};

function HeroVideoOverlay({ variant }: { variant: 'full' | 'contained' }) {
  return (
    <>
      <div
        className={cn(
          'absolute inset-0 bg-background/40',
          variant === 'full' && 'bg-background/55',
        )}
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 flex h-1"
        aria-hidden
      >
        {landingAccentStrip.map((color) => (
          <span
            key={color}
            className="flex-1"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </>
  );
}

export function HeroVideo({
  posterSrc,
  videoSrc,
  variant = 'full',
  className,
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [useVideo, setUseVideo] = useState(true);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      setUseVideo(false);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const playVideo = async () => {
      try {
        await video.play();
      } catch {
        setUseVideo(false);
      }
    };

    void playVideo();
  }, []);

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden',
        variant === 'full' && 'absolute inset-0',
        className,
      )}
    >
      <Image
        src={posterSrc}
        alt=""
        fill
        priority
        sizes={
          variant === 'contained' ? '(max-width: 1024px) 100vw, 42vw' : '100vw'
        }
        className={cn(
          'object-cover transition-opacity duration-1000',
          isReady && useVideo ? 'opacity-0' : 'opacity-100',
        )}
      />

      {useVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterSrc}
          aria-hidden
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-1000',
            isReady ? 'opacity-100' : 'opacity-0',
          )}
          onCanPlay={() => setIsReady(true)}
          onError={() => setUseVideo(false)}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      <HeroVideoOverlay variant={variant} />
    </div>
  );
}
