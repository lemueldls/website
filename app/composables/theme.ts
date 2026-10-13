import { createSharedComposable } from "@vueuse/core";

export type ThemeName = "dark" | "light" | "system";

const STORAGE_KEY = "x-theme";

interface ThemeState {
  stored: Ref<ThemeName | null>;
  resolvedTheme: ComputedRef<"dark" | "light">;
  setTheme: (next: ThemeName) => void;
  toggleTheme: () => void;
}

const useSharedTheme = createSharedComposable(() => {
  const stored = useCookie<ThemeName | null>(STORAGE_KEY, {
    default: () => null,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  });

  const prefersLight = ref(false);

  if (import.meta.client) {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    prefersLight.value = mq.matches;
    mq.addEventListener("change", (e) => {
      prefersLight.value = e.matches;
    });
  }

  const resolvedTheme = computed<"dark" | "light">(() => {
    const pref = stored.value ?? "dark";
    if (pref === "system") return prefersLight.value ? "light" : "dark";
    return pref;
  });

  function setTheme(next: ThemeName) {
    stored.value = next;
  }

  function toggleTheme() {
    stored.value = resolvedTheme.value === "dark" ? "light" : "dark";
  }

  return { stored, resolvedTheme, setTheme, toggleTheme };
});

export const useTheme: () => ThemeState = useSharedTheme;
