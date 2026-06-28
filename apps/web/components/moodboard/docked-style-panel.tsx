'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { TLUiStylePanelProps } from 'tldraw';
import { STYLE_PANEL_SLOT_ID } from '@/lib/canvas/style-panel-slot';
import { MoodboardStylePanel } from '@/components/moodboard/moodboard-style-panel-content';

/** Style panel portaled into the top chrome — contained, no floating color palette. */
export function DockedStylePanel(props: TLUiStylePanelProps) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSlot(document.getElementById(STYLE_PANEL_SLOT_ID));
  }, []);

  if (!slot) return null;

  return createPortal(<MoodboardStylePanel {...props} />, slot);
}
