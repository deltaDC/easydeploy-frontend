import api from "./api";
import type { 
	LoginRequest, 
	RegisterRequest, 
	AuthResponse
} from "@/types/user.type";

export const AuthService = {
	/**
	 * Đăng nhập với email và password
	 */
	login: async (payload: LoginRequest): Promise<AuthResponse> => {
		const response = await api.post<AuthResponse>("/auth/login", payload);
		return response.data;
	},

	/**
	 * Đăng ký tài khoản mới
	 */
	register: async (payload: RegisterRequest): Promise<AuthResponse> => {
		const response = await api.post<AuthResponse>("/auth/register", payload);
		return response.data;
	},

	/**
	 * Đăng xuất
	 * 
	 * Note: Token cleanup is handled by Zustand store's logout() method
	 * which automatically clears the persisted localStorage data.
	 * The legacy localStorage keys (auth_token, refresh_token) are cleaned
	 * here for backward compatibility.
	 */
	logout: async (): Promise<void> => {
		const token = localStorage.getItem("auth_token");
		if (token) {
			await api.post("/auth/logout", {}, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
		}
		
		// Clear legacy storage keys (backward compatibility)
		if (typeof window !== "undefined") {
			localStorage.removeItem("auth_token");
			localStorage.removeItem("refresh_token");
		}
	},
};

export default AuthService;
