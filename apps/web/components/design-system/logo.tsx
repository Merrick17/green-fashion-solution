import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
type LogoVariant = 'light' | 'dark' | 'auto';
type LogoProps = {
  variant?: LogoVariant;
  className?: string;
  href?: string;
  height?: number;
};
export function Logo({
  variant = 'auto',
  className,
  href,
  height = 28,
}: LogoProps) {
  const img = (
    <Image
      src="/gfs-logo.svg"
      alt="Green Fashion Solution"
      width={Math.round(height * 2.53)}
      height={height}
      className={cn(
        'h-auto w-auto object-contain',
        variant === 'light' && 'brightness-0 invert',
        variant === 'dark' && 'brightness-0',
        className,
      )}
      priority
    />
  );
  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
        {img}
      </Link>
    );
  }
  return img;
}
