import { create } from "zustand";

interface ThemeState {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const initialTheme =
    (typeof window !== "undefined" && localStorage.getItem("theme")) ||
    "light";

  if (typeof window !== "undefined") {
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }

  return {
    theme: initialTheme as "light" | "dark",
    toggleTheme: () =>
      set((state) => {
        const newTheme = state.theme === "light" ? "dark" : "light";
        localStorage.setItem("theme", newTheme);

        if (typeof window !== "undefined") {
          document.documentElement.classList.toggle("dark", newTheme === "dark");
        }

        return { theme: newTheme };
      }),
  };
});
