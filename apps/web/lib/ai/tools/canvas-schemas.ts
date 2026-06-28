import { z } from "zod";
import type { AxiosInstance } from "axios";

export interface CanvasToolContext {
  moodboardId: string;
  client: AxiosInstance;
  projectId?: string;
  enableImage?: boolean;
}

export const imageContent = z.object({
  src: z.string().optional(),
  key: z.string().optional(),
  prompt: z.string().optional(),
  alt: z.string().optional(),
});

export const textContent = z.object({ text: z.string() });

export const colorContent = z.object({
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color — must be #RRGGBB"),
  name: z.string().optional(),
});

export const linkContent = z.object({
  url: z.string().url("Must be a valid URL"),
  label: z.string().optional(),
});

export const styleSchema = z.object({
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  fontWeight: z.string().optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  opacity: z.number().min(0).max(1).optional(),
  zIndex: z.number().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.number().optional(),
  backgroundColor: z.string().optional(),
  color: z.string().optional(),
  borderRadius: z.number().optional(),
}).optional();

/** Loose update content: covers all item types without requiring `type`. */
export const updateContent = z.object({
  src: z.string().optional(),
  key: z.string().optional(),
  prompt: z.string().optional(),
  alt: z.string().optional(),
  text: z.string().optional(),
  hex: z.string().optional(),
  name: z.string().optional(),
  url: z.string().optional(),
  label: z.string().optional(),
}).optional();
