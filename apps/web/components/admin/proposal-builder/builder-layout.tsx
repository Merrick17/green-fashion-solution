'use client';
import { useState, type ReactNode } from 'react';
import { Eye, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
interface BuilderLayoutProps {
  sourcePanel: ReactNode;
  board: ReactNode;
  preview: ReactNode;
  toolbarExtras: ReactNode;
  agentPanel: ReactNode;
}
export function BuilderLayout({
  sourcePanel,
  board,
  preview,
  toolbarExtras,
  agentPanel,
}: BuilderLayoutProps) {
  const [libOpen, setLibOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {/* Source library — inline column at xl */}
      <div className="hidden xl:flex xl:w-80 xl:shrink-0 flex-col border-r border-portal-border overflow-hidden">
        {sourcePanel}
      </div>
      {/* Board — always visible */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-2 border-b border-portal-border bg-portal-surface px-3 py-2">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Deck canvas</span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 xl:hidden"
              onClick={() => setLibOpen(true)}
            >
              <Library className="h-3.5 w-3.5" /> Library
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 xl:hidden"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="h-3.5 w-3.5" /> Preview
            </Button>
            {toolbarExtras}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">{board}</div>
      </div>
      {/* Preview — inline column at xl */}
      <div className="hidden xl:flex xl:w-96 xl:shrink-0 flex-col border-l border-portal-border overflow-hidden">
        <div className="border-b border-portal-border bg-portal-surface px-3 py-2">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Presentation preview</span>
        </div>
        {preview}
      </div>
      {/* AI panel — responsive aside (lg+) or Sheet (below lg) */}
      {agentPanel}
      {/* Narrow-screen sheets */}
      <Sheet open={libOpen} onOpenChange={setLibOpen}>
        <SheetContent side="left" className="w-full p-0 sm:max-w-md">
          <SheetHeader className="border-b border-portal-border">
            <SheetTitle>Source library</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-hidden">{sourcePanel}</div>
        </SheetContent>
      </Sheet>
      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-md">
          <SheetHeader className="border-b border-portal-border">
            <SheetTitle>Client preview</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">{preview}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
