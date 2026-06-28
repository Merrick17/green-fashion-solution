import type { PaginatedMeta, PaginatedResponse } from '@repo/types';

export function resolvePagination(query: {
  page?: number;
  limit?: number;
}): { page: number; limit: number; skip: number } {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPaginatedMeta(
  total: number,
  page: number,
  limit: number,
): PaginatedMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  return { data, meta: buildPaginatedMeta(total, page, limit) };
}

export function paginateArray<T>(
  items: T[],
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const skip = (page - 1) * limit;
  return paginated(items.slice(skip, skip + limit), items.length, page, limit);
}
