import axios from "axios";

/** Axios client for third-party APIs (no auth interceptors). */
export const externalHttpClient = axios.create({
  timeout: 15_000,
});
