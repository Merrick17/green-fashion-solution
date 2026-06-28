// Targeted prompts for in-canvas AI context menu actions.

import { extractItemPrompt } from '@/lib/canvas/mood-item-prompt';
import type { MoodItem } from '@repo/types';

export { extractItemPrompt };

export function buildRegenerateItemPrompt(
  itemId: string,
  originalPrompt: string | null,
  position?: { x: number; y: number },
): string {
  const promptRef = originalPrompt
    ? `original prompt: "${originalPrompt}"`
    : 'no stored prompt — infer direction from the selected image';
  const placement = position
    ? `Place the replacement at x=${Math.round(position.x)}, y=${Math.round(position.y)}.`
    : 'Place the replacement at the same position as the deleted item.';

  return [
    `Regenerate canvas item "${itemId}" — ${promptRef}.`,
    `Required: deleteItem id "${itemId}", then generateImage with a fresh composition preserving the same fashion direction.`,
    placement,
  ].join(' ');
}

export function buildVariationItemPrompt(
  itemId: string,
  originalPrompt: string | null,
  position?: { x: number; y: number; width: number },
): string {
  const base = originalPrompt?.trim() || 'selected fashion reference image';
  const placement = position
    ? `Place new items starting at x=${Math.round(position.x + position.width + 40)}, y=${Math.round(position.y)}.`
    : 'Place new items to the right of the selected item.';

  return [
    `Create 3 style variations beside item "${itemId}" — original prompt: "${base}".`,
    `Required: call generateVariations with basePrompt from the original and variations: ['minimalist', 'editorial', 'avant-garde'].`,
    `Do not modify or delete item "${itemId}". ${placement}`,
  ].join(' ');
}

export function buildContextMenuPrompt(
  action: 'regenerate' | 'variations',
  item: MoodItem,
): string {
  const prompt = extractItemPrompt(item);
  const position = { x: item.x, y: item.y, width: item.width };
  return action === 'regenerate'
    ? buildRegenerateItemPrompt(item.id, prompt, position)
    : buildVariationItemPrompt(item.id, prompt, position);
}
