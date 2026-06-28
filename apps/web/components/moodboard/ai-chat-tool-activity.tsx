'use client';
import { useState } from 'react';
import { AlertCircle, Check, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { ProposalDeckPreviewStrip } from '@/components/ai-assistant/proposal-deck-preview-strip';
import type { ProposalSlide } from '@repo/utils';
import {
  getMessageToolParts,
  getToolPartError,
  getToolPartName,
  humanizeToolName,
  isToolPartComplete,
  isToolPartFailed,
  isToolPartRunning,
} from '@/lib/ai/chat-ui';

type SlidePreview = Pick<ProposalSlide, 'type' | 'title' | 'subtitle'>;
type ToolPart = ReturnType<typeof getMessageToolParts>[number];

function extractResultPreview(
  toolName: string,
  result: unknown,
): { text?: string; imageUrl?: string; slides?: SlidePreview[] } | null {
  if (!result || typeof result !== 'object') return null;
  const r = result as Record<string, unknown>;

  if (toolName === 'generateImage') {
    const content = r.content as Record<string, unknown> | undefined;
    const src = content?.src ?? content?.key ?? r.imageUrl ?? r.src;
    if (typeof src === 'string' && src) return { imageUrl: src };
    if (typeof r.error === 'string') return { text: r.error };
    if (typeof r.notice === 'string') return { text: r.notice };
  }
  if (toolName === 'generateMoodboardConcept') {
    const parts = [
      typeof r.theme === 'string' ? r.theme : null,
      typeof r.mood === 'string' ? r.mood : null,
      Array.isArray(r.palette) ? `${(r.palette as string[]).join(' · ')}` : null,
    ].filter(Boolean);
    if (parts.length > 0) return { text: parts.join(' — ') };
  }
  if (toolName === 'generateTldrawMoodboard') {
    if (typeof r.message === 'string') return { text: r.message };
    const created = typeof r.created === 'number' ? r.created : null;
    const images = typeof r.images === 'number' ? r.images : null;
    if (created != null) return { text: `${created} items${images != null ? `, ${images} images` : ''}` };
    if (typeof r.theme === 'string') return { text: r.theme };
  }
  if (toolName === 'saveMoodboardSnapshot') {
    if (typeof r.id === 'string') return { text: `Snapshot ${r.id.slice(0, 6)}` };
    if (typeof r.aiSummary === 'string') return { text: r.aiSummary };
  }
  if (toolName === 'setMoodboardMetadata') {
    const mood = typeof r.mood === 'string' ? r.mood : null;
    const style = typeof r.styleDirection === 'string' ? r.styleDirection : null;
    if (mood || style) return { text: [style, mood].filter(Boolean).join(' — ') };
  }
  if (toolName === 'buildProposalSections') {
    const sections = Array.isArray(r.sections) ? r.sections : [];
    if (sections.length > 0) {
      const titles = sections.slice(0, 3).map((s: unknown) => (s as Record<string, unknown>)?.title ?? '').filter(Boolean).join(', ');
      return { text: `${sections.length} sections: ${titles}` };
    }
  }
  if (toolName === 'previewProposalDeck') {
    const slides = Array.isArray(r.slides) ? r.slides : [];
    if (slides.length > 0) return { text: `${slides.length} slides`, slides: slides as SlidePreview[] };
  }
  if (toolName === 'rankAssets') {
    const assets = Array.isArray(r.assets) ? r.assets : [];
    const name = (assets[0] as Record<string, unknown> | undefined)?.name ?? (assets[0] as Record<string, unknown> | undefined)?.assetName;
    if (typeof name === 'string') return { text: `Top: ${name}` };
  }
  if (toolName === 'createFabricAsset' || toolName === 'createProductAsset') {
    if (typeof r.name === 'string') return { text: r.name };
  }
  if (toolName === 'bulkCreateItems') {
    if (typeof r.created === 'number') return { text: `${r.created} items` };
  }
  if (toolName === 'materializeRefinement') {
    const applied = typeof r.applied === 'number' ? r.applied : 0;
    const created = typeof r.created === 'number' ? r.created : 0;
    return { text: `${applied} edited, ${created} added` };
  }
  if (typeof r.message === 'string' && r.message) return { text: r.message };
  return null;
}

function formatInputPreview(input: unknown): string {
  if (!input || typeof input !== 'object') return String(input ?? '');
  return Object.entries(input as Record<string, unknown>)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .slice(0, 4)
    .map(([k, v]) => {
      const val = typeof v === 'string'
        ? (v.length > 60 ? v.slice(0, 57) + '…' : v)
        : JSON.stringify(v).slice(0, 60);
      return `${k}: ${val}`;
    })
    .join('\n');
}

function formatDetails(tool: ToolPart, errorMessage: string | null): string {
  const inv = tool as { input?: unknown; output?: unknown; errorText?: string };
  return [
    errorMessage ? `Error: ${errorMessage}` : null,
    inv.errorText && inv.errorText !== errorMessage ? `Stream: ${inv.errorText}` : null,
    inv.input ? `Input:\n${formatInputPreview(inv.input)}` : null,
    inv.output ? `Output:\n${JSON.stringify(inv.output, null, 2)}` : null,
  ].filter(Boolean).join('\n\n');
}

function ToolCard({ tool, isLast }: { tool: ToolPart; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const toolName = getToolPartName(tool);
  const label = humanizeToolName(toolName);
  const failed = isToolPartFailed(tool.state);
  const running = isToolPartRunning(tool.state);
  const done = isToolPartComplete(tool.state);
  const inv = tool as { state: string; errorText?: string; input?: unknown; output?: unknown };
  const resolvedError = getToolPartError(tool);
  const errorText = failed ? (resolvedError ?? inv.errorText) : undefined;
  const outputError =
    done && inv.output && typeof inv.output === 'object' && 'error' in inv.output
      ? getToolPartError(tool)
      : undefined;
  const displayError = errorText || outputError || null;
  const details = displayError ? formatDetails(tool, displayError) : null;
  const resultPreview = done && !displayError ? extractResultPreview(toolName, inv.output) : null;

  const accentColor =
    failed || displayError
      ? 'border-l-destructive'
      : running
        ? 'border-l-portal-accent'
        : 'border-l-portal-border';

  return (
    <>
      <div className={`flex flex-col gap-1.5 border-l-2 py-2 pl-3 ${accentColor}`}>
        <div className="flex items-center gap-1.5">
          {running && <Loader2 className="h-3 w-3 shrink-0 animate-spin text-portal-accent" />}
          {done && !displayError && <Check className="h-3 w-3 shrink-0 text-portal-accent" />}
          {displayError && <AlertCircle className="h-3 w-3 shrink-0 text-destructive" />}
          <span className="text-[11px] font-medium text-foreground">{label}</span>
          {running && (
            <span className="ml-auto text-[10px] uppercase tracking-wide text-portal-accent">
              Running
            </span>
          )}
        </div>

        {done && resultPreview?.text && !resultPreview.slides && (
          <p className="text-[10px] leading-snug text-portal-muted">{resultPreview.text}</p>
        )}
        {done && resultPreview?.slides && resultPreview.slides.length > 0 && (
          <ProposalDeckPreviewStrip slides={resultPreview.slides} maxSlides={8} className="mt-0.5" />
        )}
        {done && resultPreview?.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resultPreview.imageUrl}
            alt="Generated"
            className="mt-0.5 h-14 w-14 border border-portal-border object-cover"
          />
        )}

        {displayError && (
          <div className="space-y-1">
            <p className="text-[10px] leading-snug text-destructive">{displayError}</p>
            {details && (
              <button
                type="button"
                className="flex items-center gap-1 text-[10px] text-portal-muted transition-colors hover:text-foreground"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
                {expanded ? 'Hide details' : 'Show details'}
              </button>
            )}
            {expanded && details && (
              <pre className="max-h-28 overflow-y-auto whitespace-pre-wrap break-all bg-destructive/5 p-2 font-mono text-[9px] text-portal-muted">
                {details}
              </pre>
            )}
          </div>
        )}
      </div>
      {!isLast && <div className="border-t border-portal-border" />}
    </>
  );
}

export function AiChatToolActivity({ tools }: { tools: ToolPart[] }) {
  if (tools.length === 0) return null;
  return (
    <div className="mb-3 flex flex-col border border-portal-border bg-portal-surface">
      <div className="flex items-center gap-1.5 border-b border-portal-border px-3 py-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-portal-muted">
          Actions
        </span>
        <span className="ml-auto text-[9px] text-portal-muted">{tools.length}</span>
      </div>
      <div className="flex flex-col px-1 py-1">
        {tools.map((tool, i) => (
          <ToolCard key={tool.toolCallId} tool={tool} isLast={i === tools.length - 1} />
        ))}
      </div>
    </div>
  );
}
