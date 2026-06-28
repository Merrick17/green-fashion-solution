import { apiBaseUrl } from "@/lib/api/defaults";

/** API origin without the `/api` suffix — static files live here in local dev. */
export function apiOrigin(): string {
  return apiBaseUrl().replace(/\/api\/?$/, "");
}

/** Turn storage keys or API-relative `/uploads/...` paths into browser-loadable URLs. */
export function toAbsoluteStorageUrl(url: string): string {
  if (!url) return url;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${apiOrigin()}${url}`;
  }
  return `${apiOrigin()}/uploads/${url}`;
}
