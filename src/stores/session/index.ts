import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UseSession } from "./types";

export const useSession = create<UseSession>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      createSession: (session, user) => set({ session, user }),
      destroySession: () => set({ session: null, user: null }),
    }),
    {
      name: "session-user",
      // só `user` persiste — acess_token fica apenas em memória
      partialize: (state) => ({ user: state.user }),
    }
  )
);