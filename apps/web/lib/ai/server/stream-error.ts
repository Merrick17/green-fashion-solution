import axios from "axios";

/** Unmask tool/stream errors for the chat UI (AI SDK defaults to "An error occurred."). */
export function formatAiStreamError(error: unknown): string {
  if (error == null) return "Unknown error";
  if (typeof error === "string") return error;

  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string" && message.trim()) return message;
    const status = error.response?.status;
    if (status) return `API ${status}: ${error.message}`;
    return error.message;
  }

  if (error instanceof Error) {
    return error.message.trim() || error.name;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
