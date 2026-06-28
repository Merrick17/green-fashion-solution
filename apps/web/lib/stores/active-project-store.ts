import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ActiveProjectState {
  projectId: string | null;
  setProjectId: (projectId: string | null) => void;
}

export const useActiveProjectStore = create<ActiveProjectState>()(
  persist(
    (set) => ({
      projectId: null,
      setProjectId: (projectId) => set({ projectId }),
    }),
    {
      name: "gfs-active-project",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
