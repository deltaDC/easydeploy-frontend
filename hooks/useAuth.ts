import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import AuthService from "@/services/auth.service";
import type { UserRole, User } from "@/types/user.type";
import { normalizeRoles } from "@/utils/auth";

export function useAuth() {
	const { 
		user, 
		token, 
		isAuthenticated, 
		isLoading, 
		setUser, 
		setToken, 
		setLoading, 
		login, 
		logout,
		hasRole,
		isAdmin,
		isUser 
	} = useAuthStore();

	const handleLogin = async (email: string, password: string) => {
		setLoading(true);
		try {
			const response = await AuthService.login({ email, password });
			
			// Convert backend response to frontend user format
			const roles = normalizeRoles(response.roles);
			
			const user: User = {
				id: response.userId,
				email: response.email,
				githubUsername: response.githubUsername,
				avatarUrl: response.avatarUrl,
				roles: roles,
				isActive: true
			};
			
			login(user, response.token);
			
			// Store tokens
			if (typeof window !== "undefined") {
				localStorage.setItem("auth_token", response.token);
			}
			
			// Redirect based on role
			if (typeof window !== "undefined") {
				if (roles.has('ADMIN')) {
					window.location.href = "/admin";
				} else {
					window.location.href = "/profile";
				}
			}
			
			return response;
		} catch (error) {
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const handleRegister = async (email: string, password: string) => {
		setLoading(true);
		try {
			const response = await AuthService.register({ email, password });
			
			// Convert backend response to frontend user format
			const roles = normalizeRoles(response.roles);
			
			const user: User = {
				id: response.userId,
				email: response.email,
				githubUsername: response.githubUsername,
				avatarUrl: response.avatarUrl,
				roles: roles,
				isActive: true
			};
			
			login(user, response.token);
			
			// Store tokens
			if (typeof window !== "undefined") {
				localStorage.setItem("auth_token", response.token);
			}
			
			// Redirect based on role
			if (typeof window !== "undefined") {
				if (roles.has('ADMIN')) {
					window.location.href = "/admin";
				} else {
					window.location.href = "/profile";
				}
			}
			
			return response;
		} catch (error) {
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		setLoading(true);
		try {
			await AuthService.logout();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			logout();
			setLoading(false);
			
			// Redirect to login page
			if (typeof window !== "undefined") {
				window.location.href = "/login";
			}
		}
	};

	return { 
		user, 
		token,
		isAuthenticated, 
		isLoading,
		login: handleLogin,
		register: handleRegister,
		logout: handleLogout,
		hasRole,
		isAdmin,
		isUser,
		// Helper functions
		canAccess: (requiredRole: UserRole) => {
			if (!isAuthenticated) return false;
			if (requiredRole === 'ADMIN') return isAdmin();
			if (requiredRole === 'DEVELOPER') return isUser();
			return false;
		}
	};
}
