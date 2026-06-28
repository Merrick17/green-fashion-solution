import { createFireworks } from "@ai-sdk/fireworks";
import type { FireworksProvider } from "@ai-sdk/fireworks";
import { getFireworksConfig } from "../fireworks/client";

let cachedProvider: FireworksProvider | null = null;

export function getFireworksProvider(): FireworksProvider {
  if (!cachedProvider) {
    const { apiKey } = getFireworksConfig();
    cachedProvider = createFireworks({ apiKey });
  }
  return cachedProvider;
}
