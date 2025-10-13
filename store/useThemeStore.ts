import { create } from "zustand";

type Theme = "light" | "dark";

type ThemeState = {
	theme: Theme;
	setTheme: (t: Theme) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
	theme: "dark",
	setTheme: (theme) => set({ theme }),
}));
