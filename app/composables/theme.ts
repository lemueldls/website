import { createSharedComposable } from "@vueuse/core";

export type ThemeName = "ink" | "paper" | "system";

const STORAGE_KEY = "x-theme";

interface ThemeState {
  stored: Ref<ThemeName | null>;
  resolvedTheme: ComputedRef<"ink" | "paper">;
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

  const prefersPaper = ref(false);

  if (import.meta.client) {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    prefersPaper.value = mq.matches;
    mq.addEventListener("change", (e) => {
      prefersPaper.value = e.matches;
    });
  }

  const resolvedTheme = computed<"ink" | "paper">(() => {
    const pref = stored.value ?? "ink";
    if (pref === "system") return prefersPaper.value ? "paper" : "ink";
    return pref;
  });

  function setTheme(next: ThemeName) {
    stored.value = next;
  }

  function toggleTheme() {
    stored.value = resolvedTheme.value === "ink" ? "paper" : "ink";
  }

  return { stored, resolvedTheme, setTheme, toggleTheme };
});

export const useTheme: () => ThemeState = useSharedTheme;
