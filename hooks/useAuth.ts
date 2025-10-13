import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import AuthService from "@/services/auth.service";

export function useAuth() {
	const user = useAuthStore((s) => s.user);
	const setUser = useAuthStore((s) => s.setUser);

	useEffect(() => {
		if (!user) {
			AuthService.me()
				.then((res) => setUser(res.data))
				.catch(() => void 0);
		}
	}, [user, setUser]);

	return { user };
}
