export enum MoodItemType {
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
  COLOR = 'COLOR',
  LINK = 'LINK',
  AI_GENERATED = 'AI_GENERATED',
}

export interface ImageContent {
  src?: string;
  key?: string;
  alt?: string;
}

export interface TextContent {
  text: string;
  fontSize?: number;
  fontFamily?: string;
}

export interface ColorContent {
  hex: string;
  name?: string;
}

export interface LinkContent {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
}

export interface AIGeneratedContent {
  prompt: string;
  src?: string;
  key?: string;
  alt?: string;
}

export type MoodItemContent =
  | ImageContent
  | TextContent
  | ColorContent
  | LinkContent
  | AIGeneratedContent;

export interface MoodItemStyle {
  opacity?: number;
  borderWidth?: number;
  borderRadius?: number;
  borderColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: string;
}

export interface MoodItem {
  id: string;
  moodboardId: string;
  type: MoodItemType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  content: MoodItemContent;
  style?: MoodItemStyle;
  locked: boolean;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMoodItemDto {
  moodboardId: string;
  type: MoodItemType;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
  content: MoodItemContent;
  style?: MoodItemStyle;
  locked?: boolean;
  groupId?: string;
}

export interface UpdateMoodItemDto {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
  content?: MoodItemContent;
  style?: MoodItemStyle;
  locked?: boolean;
  groupId?: string | null;
}

export interface BatchUpdateItem {
  id: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
}

export interface BatchUpdateMoodItemsDto {
  updates: BatchUpdateItem[];
}

export interface ReorderMoodItemsDto {
  itemIds: string[];
}

export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}