import axios from "axios";
import { apiBaseUrl } from "@/lib/api/defaults";

/** Axios client for NestJS auth endpoints (no Next.js BFF). */
export const authClient = axios.create({
  baseURL: apiBaseUrl(),
  withCredentials: true,
});