"use client";

import { useState } from "react";
import type { PaginationParams } from "@repo/types";

export function usePagination(limit = 20) {
  const [page, setPage] = useState(1);
  const params: PaginationParams = { page, limit };
  return { page, limit, setPage, params };
}
