import type { ReactNode } from "react";

type AuthSplitLayoutProps = {
  panel: ReactNode;
  children: ReactNode;
};

export function AuthSplitLayout({ panel, children }: AuthSplitLayoutProps) {
  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-2">
      <div className="hidden lg:block">{panel}</div>
      <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        {children}
      </div>
    </div>
  );
}
