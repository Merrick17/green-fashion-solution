// Structured user-message prompts injected into the moodboard agent chat.

export function buildGenerateMoodboardPrompt(input: string): string {
  const vibe = input.trim();

  return [
    `Create a full moodboard direction for: "${vibe}"`,
    ``,
    `Execute in this exact order:`,
    `1. generateMoodboardConcept — output theme, mood, palette (hex, up to 7), styleKeywords, layoutSuggestion: "editorial-grid", imagePrompts (8–10)`,
    `2. setMoodboardMetadata — persist theme, mood, palette, fabricSuggestions from the concept`,
    `3. generateTldrawMoodboard — pass the **same concept object** from step 1. Layout is a scrapbook editorial grid: vertical title rail, top image strip, hero + tagline, palette row, accent tiles.`,
    ``,
    `Do NOT call createItem, bulkCreateItems, or generateImage for this full build.`,
    `Confirm with one sentence after all three tools succeed.`,
  ].join("\n");
}

export function buildRefinePrompt(input: string): string {
  const instruction = input.trim();

  return [
    `Refine the existing moodboard (do NOT rebuild from scratch): "${instruction}"`,
    ``,
    `Preferred flow:`,
    `1. refineMoodboard — plan targeted edits using existing item ids`,
    `2. materializeRefinement — apply the plan in one step`,
    ``,
    `Fallback (small tweaks only): updateItem, moveItem, generateImage for a single missing visual.`,
    `Preserve positions and hierarchy unless the user asks for a full relayout.`,
  ].join("\n");
}
