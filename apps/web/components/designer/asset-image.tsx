'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssetImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function AssetImage({ src, alt, className }: AssetImageProps) {
  const [errored, setErrored] = useState(false);

  if (errored || !src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted/40 text-muted-foreground',
          className,
        )}
      >
        <ImageIcon className="h-6 w-6 opacity-40" />
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
    />
  );
}
