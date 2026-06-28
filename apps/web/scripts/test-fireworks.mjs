import { generateText } from "ai";
import { createFireworks } from "@ai-sdk/fireworks";

const apiKey = process.env.FIREWORKS_API_KEY;
if (!apiKey) {
  console.error("FIREWORKS_API_KEY missing — run: node --env-file=.env.local scripts/test-fireworks.mjs");
  process.exit(1);
}

const fireworks = createFireworks({ apiKey });
const modelId = process.env.FIREWORKS_MODEL_CHAT ?? "accounts/fireworks/models/kimi-k2p6";

try {
  const { text } = await generateText({
      model: fireworks(modelId),
    prompt: "Reply with exactly: Fireworks AI OK",
    maxOutputTokens: 32,
  });
  console.log("Model:", modelId);
  console.log("Response:", text.trim());
} catch (error) {
  console.error("Fireworks AI test failed:", error);
  process.exit(1);
}
