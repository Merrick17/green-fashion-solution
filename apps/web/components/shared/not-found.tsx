import Link from 'next/link';
import { Button } from '@/components/ui/button';
interface NotFoundViewProps {
  basePath?: string;
  title?: string;
  description?: string;
}
export function NotFoundView({
  basePath = '/',
  title = 'Page not found',
  description = 'The page you are looking for does not exist or has been moved.',
}: NotFoundViewProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-6xl font-serif font-semibold text-muted-foreground/40">
        404
      </p>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      <Button asChild className="mt-6">
        <Link
          href={
            basePath === '/' || basePath === ''
              ? '/'
              : `${basePath}/dashboard`
          }
        >
          {basePath === '/' || basePath === ''
            ? 'Back to home'
            : 'Back to dashboard'}
        </Link>
      </Button>
    </div>
  );
}
