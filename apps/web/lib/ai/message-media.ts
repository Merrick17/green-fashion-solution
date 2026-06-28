import type { UIMessage } from "ai";

export function messagesContainImages(messages: unknown[]): boolean {
  for (const msg of messages as UIMessage[]) {
    if (msg.role !== "user") continue;
    for (const part of msg.parts ?? []) {
      if (part.type === "file" && "mediaType" in part && String(part.mediaType).startsWith("image/")) {
        return true;
      }
    }
  }
  return false;
}

export function resolveMoodboardAgentMode(
  messages: unknown[],
  explicit?: "design" | "parse",
): "design" | "parse" {
  if (explicit === "parse" || explicit === "design") return explicit;
  if (!messagesContainImages(messages)) return "design";

  const lastUser = [...(messages as UIMessage[])].reverse().find((m) => m.role === "user");
  const text =
    lastUser?.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join(" ")
      .toLowerCase() ?? "";

  if (/parse|extract|analyze|identify|break down|elements from/.test(text)) {
    return "parse";
  }
  return "design";
}
