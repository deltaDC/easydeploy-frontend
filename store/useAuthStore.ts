import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types/user.type";
import { normalizeRoles } from "@/utils/auth";

type AuthState = {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	setUser: (user: User | null) => void;
	setToken: (token: string | null) => void;
	setLoading: (loading: boolean) => void;
	login: (user: User, token: string) => void;
	logout: () => void;
	hasRole: (role: UserRole) => boolean;
	isAdmin: () => boolean;
	isUser: () => boolean;
};

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			token: null,
			isAuthenticated: false,
			isLoading: false,
			
			setUser: (user) => set({ 
				user, 
				isAuthenticated: !!user 
			}),
			
			setToken: (token) => set({ token }),
			
			setLoading: (isLoading) => set({ isLoading }),
			
			login: (user, token) => {
				set({ 
					user, 
					token, 
					isAuthenticated: true,
					isLoading: false 
				});
			},
			
			logout: () => set({ 
				user: null, 
				token: null, 
				isAuthenticated: false,
				isLoading: false 
			}),
			
			hasRole: (role) => {
				const { user } = get();
				if (!user?.roles) return false;
				const roles = normalizeRoles(user.roles);
				return roles.has(role);
			},
			
			isAdmin: () => {
				const { user } = get();
				if (!user?.roles) return false;
				const roles = normalizeRoles(user.roles);
				return roles.has('ADMIN');
			},
			
			isUser: () => {
				const { user } = get();
				if (!user?.roles) return false;
				const roles = normalizeRoles(user.roles);
				return roles.has('DEVELOPER');
			},
		}),
		{
			name: 'auth-storage',
			partialize: (state) => ({ 
				user: state.user ? {
					...state.user,
					roles: Array.from(state.user.roles)
				} : null, 
				token: state.token,
				isAuthenticated: state.isAuthenticated 
			}),
		}
	)
);
