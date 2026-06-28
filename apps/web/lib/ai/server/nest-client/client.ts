import axios, { type AxiosInstance } from "axios";
import { apiBaseUrl } from "@/lib/api/defaults";

export function createNestClient(accessToken: string): AxiosInstance {
  return axios.create({
    baseURL: apiBaseUrl(),
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
