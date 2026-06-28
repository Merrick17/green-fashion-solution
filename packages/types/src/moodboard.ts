import type { MoodItem, CanvasViewport } from './mood-item';

export interface Moodboard {
  id: string;
  projectId: string;
  styleDirection: string;
  colorPalette: string[];
  fabricSuggestions: string[];
  mood: string;
  canvasViewport?: CanvasViewport | null;
  generatedAt: string;
  updatedAt: string;
  items?: MoodItem[];
}

export interface CreateMoodboardDto {
  projectId: string;
  styleDirection: string;
  colorPalette: string[];
  fabricSuggestions: string[];
  mood: string;
}

export interface UpdateMoodboardDto {
  styleDirection?: string;
  colorPalette?: string[];
  fabricSuggestions?: string[];
  mood?: string;
  canvasViewport?: CanvasViewport;
}

export interface GenerateMoodboardDto {
  prompt: string;
  images?: string[];
  projectId: string;
}

export interface MoodboardStyle {
  styleDirection: string;
  colorPalette: string[];
  fabricSuggestions: string[];
  mood: string;
}