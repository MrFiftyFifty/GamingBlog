import type { PaginatedResponse } from "./types";

export function paginatedItems<T>(page?: PaginatedResponse<T> | null): T[] {
  return page?.results ?? page?.data ?? [];
}

export function paginatedTotal<T>(
  page?: PaginatedResponse<T> | null,
  fallback = 0
): number {
  return page?.count ?? page?.total ?? fallback;
}
