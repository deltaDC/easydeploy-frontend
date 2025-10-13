import { create } from "zustand";

type AuthUser = {
	id: string;
	name: string;
	email: string;
	avatarUrl?: string;
};

type AuthState = {
	user: AuthUser | null;
	setUser: (user: AuthUser | null) => void;
	logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	setUser: (user) => set({ user }),
	logout: () => set({ user: null }),
}));
