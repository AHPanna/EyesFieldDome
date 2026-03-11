import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/lib/types";

interface AuthState {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    setUser: (user: User) => void;
    logout: () => void;
    isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            setAuth: (user, token) => {
                if (typeof window !== "undefined") {
                    localStorage.setItem("access_token", token);
                }
                set({ user, token });
            },
            setUser: (user) => {
                set({ user });
            },
            logout: () => {
                if (typeof window !== "undefined") {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("user");
                }
                set({ user: null, token: null });
            },
            isAdmin: () => get().user?.role === "admin",
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({ user: state.user, token: state.token }),
        }
    )
);
