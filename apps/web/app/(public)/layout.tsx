import { SmoothScroll } from '@/components/landing/smooth-scroll';
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SmoothScroll /> {children}
    </>
  );
}
