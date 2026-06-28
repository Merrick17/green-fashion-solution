'use client';

import {
  DefaultStylePanel,
  StylePanelDashPicker,
  StylePanelFontPicker,
  StylePanelLabelAlignPicker,
  StylePanelSection,
  StylePanelSizePicker,
  StylePanelTextAlignPicker,
  type TLUiStylePanelProps,
} from 'tldraw';

/** Inline-only style controls — no color palette grid or floating popover pickers. */
export function MoodboardStylePanelContent() {
  return (
    <>
      <StylePanelSection>
        <StylePanelFontPicker />
        <StylePanelTextAlignPicker />
        <StylePanelLabelAlignPicker />
      </StylePanelSection>
      <StylePanelSection>
        <StylePanelSizePicker />
        <StylePanelDashPicker />
      </StylePanelSection>
    </>
  );
}

export function MoodboardStylePanel(props: TLUiStylePanelProps) {
  return (
    <DefaultStylePanel {...props}>
      <MoodboardStylePanelContent />
    </DefaultStylePanel>
  );
}
