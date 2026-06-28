import type { PaginationParams } from "@repo/types";

export function toPaginationQuery(
  params?: Record<string, string | number | undefined>,
): Record<string, string | number> {
  if (!params) return {};
  const query: Record<string, string | number> = {};
  if (params.page != null) query.page = params.page;
  if (params.limit != null) query.limit = params.limit;
  if (params.sortBy) query.sortBy = params.sortBy;
  if (params.sortOrder) query.sortOrder = params.sortOrder;
  for (const [key, value] of Object.entries(params)) {
    if (["page", "limit", "sortBy", "sortOrder"].includes(key)) continue;
    if (value != null && value !== "") query[key] = value;
  }
  return query;
}
