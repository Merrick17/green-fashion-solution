import Image from 'next/image';
import { cn } from '@/lib/utils';
type ImageFrameProps = {
  src: string;
  alt: string;
  aspect?: 'square' | 'portrait' | 'landscape' | 'wide' | 'auto';
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
};
const aspectClass = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9]',
  auto: '',
} as const;
export function ImageFrame({
  src,
  alt,
  aspect = 'landscape',
  className,
  priority,
  fill = true,
  sizes = '(max-width: 768px) 100vw, 50vw',
}: ImageFrameProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        aspect !== 'auto' && aspectClass[aspect],
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill={fill}
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
    </div>
  );
}
