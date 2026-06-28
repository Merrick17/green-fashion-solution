// Web search tool (Tavily) — OFF by default.
//
// The tool is only merged into the moodboard toolset when TAVILY_API_KEY is set
// (see tool-builder.ts, mirroring the enableImage conditional-omit pattern). When
// the key is absent the tool does not exist, so the agent never knows about it
// and behaviour is byte-identical to before.
//
// The tool NEVER throws: on missing key, HTTP error, or network failure it
// returns a structured "unavailable" result so the agent can proceed without web
// context (web search is supporting, never required). Output is structured
// (never free-text), per CLAUDE.md.

import { tool } from "ai";
import { z } from "zod";
import axios from "axios";
import { externalHttpClient } from "@/lib/http/external-client";

const TAVILY_ENDPOINT = "https://api.tavily.com/search";
const DEFAULT_MAX_RESULTS = 5;

export interface WebSearchToolOptions {
  apiKey?: string;
}

export function isWebSearchEnabled(options?: WebSearchToolOptions): boolean {
  return !!(options?.apiKey ?? process.env.TAVILY_API_KEY);
}

const webSearchInput = z.object({
  query: z.string().min(1).describe("The web search query"),
  maxResults: z
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .describe(`Max results to return (default ${DEFAULT_MAX_RESULTS})`),
});

export interface WebSearchResultItem {
  index: number;
  title: string;
  url: string;
  snippet: string;
}

export interface WebSearchOutput {
  available: boolean;
  results: WebSearchResultItem[];
  reason: string | null;
}

async function callTavily(
  apiKey: string,
  query: string,
  maxResults: number,
): Promise<WebSearchOutput> {
  try {
    const res = await externalHttpClient.post<{
      results?: Array<{ title?: string; url?: string; content?: string }>;
    }>(
      TAVILY_ENDPOINT,
      { api_key: apiKey, query, max_results: maxResults },
      { headers: { "content-type": "application/json" } },
    );
    const results: WebSearchResultItem[] = (res.data.results ?? [])
      .slice(0, maxResults)
      .map((r, i) => ({
        index: i,
        title: r.title ?? "",
        url: r.url ?? "",
        snippet: (r.content ?? "").slice(0, 500),
      }));
    return { available: true, results, reason: results.length ? null : "No results" };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        available: true,
        results: [],
        reason: `Tavily returned HTTP ${error.response.status}`,
      };
    }
    return {
      available: true,
      results: [],
      reason: error instanceof Error ? error.message : "Web search request failed",
    };
  }
}

export function createWebSearchTool(options?: WebSearchToolOptions) {
  const apiKey = options?.apiKey ?? process.env.TAVILY_API_KEY;
  return tool({
    description:
      "Search the web for current fashion trends, fabric references, designer references, or sourcing-relevant context. Returns structured results (title, url, snippet). Use sparingly to ground suggestions in real, current references. Never use it for customer PII or internal project data. If unavailable, proceed without web context.",
    inputSchema: webSearchInput,
    execute: async ({ query, maxResults }): Promise<WebSearchOutput> => {
      const limit = maxResults ?? DEFAULT_MAX_RESULTS;
      if (!apiKey) {
        return {
          available: false,
          results: [],
          reason: "Web search is not configured (TAVILY_API_KEY missing).",
        };
      }
      return callTavily(apiKey, query, limit);
    },
  });
}