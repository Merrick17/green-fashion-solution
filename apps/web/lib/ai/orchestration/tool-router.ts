import type { ToolSet } from "ai";
import { assertToolAllowed } from "../tools/registry/guards";
import type { AgentRole } from "../tools/registry/types";

/**
 * Wraps a ToolSet so each tool's `execute` records call outcomes and validates
 * role access before running when `role` is provided.
 */
export interface ToolRouterOptions {
  enabled?: boolean;
  role?: AgentRole;
  onCall?: (name: string, ok: boolean) => void;
}

type AnyExecute = (args: any, options: any) => Promise<any>;

export function wrapToolsWithRouter(
  tools: ToolSet,
  options: ToolRouterOptions = {},
): ToolSet {
  const shouldWrap = options.enabled || options.role;
  if (!shouldWrap) return tools;

  const wrapped: ToolSet = {} as ToolSet;
  for (const [name, tool] of Object.entries(tools)) {
    const original = (tool as { execute?: AnyExecute }).execute;
    if (typeof original !== "function") {
      wrapped[name as keyof ToolSet] = tool;
      continue;
    }

    const instrumented: AnyExecute = async (args, execOptions) => {
      if (options.role) assertToolAllowed(options.role, name);
      try {
        const out = await original(args, execOptions);
        options.onCall?.(name, true);
        return out;
      } catch (error) {
        options.onCall?.(name, false);
        throw error;
      }
    };

    wrapped[name as keyof ToolSet] = { ...tool, execute: instrumented } as ToolSet[string];
  }
  return wrapped;
}
