export interface FireworksClientConfig {
  apiKey: string;
}

export function isFireworksConfigured(): boolean {
  return Boolean(process.env.FIREWORKS_API_KEY?.trim());
}

export function getFireworksConfig(): FireworksClientConfig {
  const apiKey = process.env.FIREWORKS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "FIREWORKS_API_KEY is required. Create a key at https://fireworks.ai",
    );
  }
  return { apiKey };
}
