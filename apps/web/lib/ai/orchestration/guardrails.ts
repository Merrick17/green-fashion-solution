/**
 * Input guardrails for AI runs. OFF by default.
 *
 * `mode: "advisory"` (default when enabled) -> logs and proceeds (non-blocking).
 * `mode: "block"`                       -> throws GuardrailError on violation.
 *
 * Only input-side checks are enforced here. Output/stream guardrails require
 * buffering the live stream and are intentionally out of scope.
 */
export interface GuardrailInput {
  system?: string;
  messages?: unknown[];
}

export interface GuardrailResult {
  ok: boolean;
  reason?: string;
}

/** Conservative cap; protects against pathologically large prompts. */
const MAX_INPUT_CHARS = 500_000;

/** Estimated token cap (4 chars ≈ 1 token, 8k token budget). */
const MAX_ESTIMATED_TOKENS = 8_000;

/** Prompt injection marker patterns that should never appear in raw user content. */
const INJECTION_PATTERNS = [
  /<system>/i,
  /<\/s>/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /<\|system\|>/i,
  /<\|end_of_text\|>/i,
];

/** Max tool calls in a single assistant message before treating it as a runaway loop. */
const MAX_TOOLS_PER_TURN = 10;

export class GuardrailError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "GuardrailError";
  }
}

function detectInjectionInUserMessages(messages: unknown[]): boolean {
  for (const msg of messages) {
    if (typeof msg !== "object" || msg === null) continue;
    const m = msg as { role?: unknown; content?: unknown };
    if (m.role !== "user") continue;
    const text =
      typeof m.content === "string"
        ? m.content
        : (() => { try { return JSON.stringify(m.content); } catch { return ""; } })();
    if (INJECTION_PATTERNS.some((p) => p.test(text))) return true;
  }
  return false;
}

function countToolCallsInMessage(content: unknown): number {
  if (typeof content === "string") {
    return (content.match(/"type"\s*:\s*"tool-call"/g) ?? []).length;
  }
  if (Array.isArray(content)) {
    return content.filter(
      (part) =>
        typeof part === "object" &&
        part !== null &&
        (part as { type?: unknown }).type === "tool-call",
    ).length;
  }
  return 0;
}

function detectToolAbuse(messages: unknown[]): boolean {
  const assistantMessages = messages
    .filter(
      (m): m is { role: string; content: unknown } =>
        typeof m === "object" &&
        m !== null &&
        (m as { role?: unknown }).role === "assistant",
    )
    .slice(-3);

  return assistantMessages.some(
    (msg) => countToolCallsInMessage(msg.content) >= MAX_TOOLS_PER_TURN,
  );
}

export function runInputGuardrails(input: GuardrailInput): GuardrailResult {
  const messages = input.messages ?? [];

  // 1. Raw character size check
  const messagesSize = (() => {
    try { return JSON.stringify(messages).length; }
    catch { return 0; }
  })();
  const totalChars = (input.system?.length ?? 0) + messagesSize;
  if (totalChars > MAX_INPUT_CHARS) {
    return { ok: false, reason: "Input exceeds maximum allowed size" };
  }

  // 2. Estimated token budget check (~4 chars per token)
  if (Math.round(totalChars / 4) > MAX_ESTIMATED_TOKENS) {
    return { ok: false, reason: "Input exceeds estimated token budget (8k)" };
  }

  // 3. Prompt injection pattern detection in user messages
  if (detectInjectionInUserMessages(messages)) {
    return { ok: false, reason: "Potential prompt injection detected in user input" };
  }

  // 4. Tool abuse detection (runaway agent loop signal)
  if (detectToolAbuse(messages)) {
    return { ok: false, reason: "Tool abuse detected: excessive tool calls in recent turns" };
  }

  return { ok: true };
}