/**
 * safeAxios — axios wrapper with optional timeout and retry on transient failures.
 *
 * Mirrors the former safeFetch contract: retries 5xx responses and network errors
 * (when retryOn allows), with deterministic exponential backoff.
 */

import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  isAxiosError,
} from 'axios';

export interface SafeAxiosOptions {
  timeoutMs?: number;
  retries?: number;
  retryOn?: (error: unknown, attempt: number) => boolean;
}

const DEFAULT_RETRY_ON = (error: unknown): boolean => {
  if (isAxiosError(error)) {
    if (!error.response) return true;
    return error.response.status >= 500;
  }
  if (error instanceof Error) {
    return error.name === 'AbortError' || error.name === 'CanceledError';
  }
  return false;
};

function backoffMs(attempt: number): number {
  return 100 * 2 ** attempt;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function safeAxiosRequest<T = unknown>(
  config: AxiosRequestConfig,
  options: SafeAxiosOptions = {},
): Promise<AxiosResponse<T>> {
  const { timeoutMs, retries = 0, retryOn = DEFAULT_RETRY_ON } = options;
  const maxAttempts = retries + 1;

  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await axios.request<T>({
        ...config,
        timeout: timeoutMs ?? config.timeout,
        validateStatus: () => true,
      });

      if (response.status >= 500 && attempt < retries) {
        await sleep(backoffMs(attempt));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < retries && retryOn(error, attempt)) {
        await sleep(backoffMs(attempt));
        continue;
      }
      throw error;
    }
  }

  throw lastError ?? new Error('safeAxiosRequest exhausted retries');
}

export const safeAxios = {
  get: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
    options?: SafeAxiosOptions,
  ) => safeAxiosRequest<T>({ ...config, method: 'GET', url }, options),

  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
    options?: SafeAxiosOptions,
  ) => safeAxiosRequest<T>({ ...config, method: 'POST', url, data }, options),
};
