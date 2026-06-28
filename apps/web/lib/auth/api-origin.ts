import { DEFAULT_API_BASE_URL } from "@/lib/api/defaults";

export function getNestApiOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL;
  return configured.replace(/\/api\/?$/, "");
}

export function getNestAuthUrl(path: string): string {
  return `${getNestApiOrigin()}/api/auth${path}`;
}