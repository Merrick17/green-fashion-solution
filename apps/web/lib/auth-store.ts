import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  getAccessToken: () => string | null;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  setAccessToken: (token: string) => set({ accessToken: token }),
  getAccessToken: () => get().accessToken,
  clearAuth: () => set({ accessToken: null }),
}));