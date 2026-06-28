import type { CanvasViewport } from "@repo/types";

/** Convert screen coordinates to canvas coordinates */
export function screenToCanvas(
  screenX: number,
  screenY: number,
  viewport: CanvasViewport,
  containerRect: DOMRect,
): { x: number; y: number } {
  const x = (screenX - containerRect.left - viewport.x) / viewport.zoom;
  const y = (screenY - containerRect.top - viewport.y) / viewport.zoom;
  return { x, y };
}

/** Convert canvas coordinates to screen coordinates */
export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  viewport: CanvasViewport,
  containerRect: DOMRect,
): { x: number; y: number } {
  const x = canvasX * viewport.zoom + viewport.x + containerRect.left;
  const y = canvasY * viewport.zoom + viewport.y + containerRect.top;
  return { x, y };
}

/** Clamp a zoom value within allowed bounds */
export function clampZoom(zoom: number, min = 0.1, max = 5): number {
  return Math.min(max, Math.max(min, zoom));
}

/** Calculate a viewport that fits all items within the visible area */
export function fitToContent(
  items: Array<{ x: number; y: number; width: number; height: number }>,
  containerWidth: number,
  containerHeight: number,
  padding = 60,
): CanvasViewport {
  if (items.length === 0) return { x: 0, y: 0, zoom: 1 };

  const minX = Math.min(...items.map((i) => i.x));
  const minY = Math.min(...items.map((i) => i.y));
  const maxX = Math.max(...items.map((i) => i.x + i.width));
  const maxY = Math.max(...items.map((i) => i.y + i.height));

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  const availableWidth = containerWidth - padding * 2;
  const availableHeight = containerHeight - padding * 2;

  const zoom = Math.min(
    availableWidth / contentWidth,
    availableHeight / contentHeight,
    1,
  );

  const x = (containerWidth - contentWidth * zoom) / 2 - minX * zoom;
  const y = (containerHeight - contentHeight * zoom) / 2 - minY * zoom;

  return { x, y, zoom };
}

/** Snap a value to the nearest grid point */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}