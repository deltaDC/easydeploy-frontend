import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types/user.type";
import { normalizeRoles } from "@/utils/auth";

/**
 * Authentication State Management with Zustand
 * 
 * This store manages all authentication-related state including user info, JWT token,
 * and authentication status. The state is automatically persisted to localStorage
 * using Zustand's persist middleware.
 * 
 * Storage Location: localStorage with key "auth-storage"
 * 
 * Structure in localStorage:
 * {
 *   "state": {
 *     "user": { id, email, roles, ... },
 *     "token": "eyJhbGc...",
 *     "isAuthenticated": true
 *   },
 *   "version": 0
 * }
 * 
 * See /docs/JWT_STORAGE_STRATEGY.md for complete documentation
 */

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
				console.log("Auth store login called with token:", token ? token.substring(0, 20) + "..." : "null");
				set({ 
					user, 
					token, 
					isAuthenticated: true,
					isLoading: false 
				});
				console.log("Auth store state updated, token saved:", token ? "yes" : "no");
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
			name: 'auth-storage', // localStorage key
			skipHydration: true, // Prevent SSR hydration issues with Next.js
			partialize: (state) => ({ 
				// Only persist these fields (exclude isLoading)
				user: state.user ? {
					...state.user,
					roles: Array.from(state.user.roles) // Convert Set to Array for JSON serialization
				} : null, 
				token: state.token,
				isAuthenticated: state.isAuthenticated 
			}),
		}
	)
);
