import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UseSession } from "./types";

export const useSession = create<UseSession>()(
  persist(
    (set) => ({
      session: null,
      createSession: (session) => set({ session }),
      destroySession: () => set({ session: null }),
    }),
    {
      name: "session-storage",
    }
  )
);
