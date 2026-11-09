"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { parseTheme, themeCookie, type ThemeChoice } from "@/lib/theme";

const themeEvent = "air-theme-change";
const ThemeContext = createContext<ThemeChoice>("system");

export function ThemeProvider({
  initial,
  children,
}: {
  initial: ThemeChoice;
  children: ReactNode;
}) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const notify = () => window.dispatchEvent(new Event(themeEvent));
    media.addEventListener("change", notify);
    return () => media.removeEventListener("change", notify);
  }, []);

  return <ThemeContext.Provider value={initial}>{children}</ThemeContext.Provider>;
}

export function ThemeChoiceControl() {
  const choice = useThemeChoice();
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Theme">
      {(["light", "dark", "system"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={choice === option}
          onClick={() => applyTheme(option)}
          className={`h-10 rounded-full border px-4 text-sm font-medium ${
            choice === option ? "border-accent bg-accent text-accent-foreground" : "border-line bg-card text-navy"
          }`}
        >
          {option === "light" ? "Light" : option === "dark" ? "Dark" : "System"}
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const dark = useResolvedDark();
  const next = dark ? "light" : "dark";
  return (
    <button
      type="button"
      aria-pressed={dark}
      aria-label={dark ? "Use light theme" : "Use dark theme"}
      onClick={() => applyTheme(next)}
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-card text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function useThemeChoice() {
  const initial = useContext(ThemeContext);
  return useSyncExternalStore(subscribe, readChoice, () => initial);
}

function useResolvedDark() {
  const initial = useContext(ThemeContext);
  return useSyncExternalStore(subscribe, resolvedDark, () => initial === "dark");
}

let systemSettled = false;

function subscribe(onStoreChange: () => void) {
  const notify = () => {
    systemSettled = true;
    onStoreChange();
  };
  window.addEventListener(themeEvent, notify);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", notify);
  const frame = window.setTimeout(notify, 0);
  return () => {
    window.clearTimeout(frame);
    window.removeEventListener(themeEvent, notify);
    media.removeEventListener("change", notify);
  };
}

function readChoice(): ThemeChoice {
  return parseTheme(document.documentElement.dataset.theme);
}

function resolvedDark() {
  const choice = readChoice();
  if (choice === "dark") return true;
  if (choice === "light") return false;
  if (!systemSettled) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyTheme(choice: ThemeChoice) {
  const run = () => {
    document.documentElement.dataset.theme = choice;
    document.cookie = `${themeCookie}=${choice}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.dispatchEvent(new Event(themeEvent));
  };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof document.startViewTransition !== "function") {
    run();
    return;
  }
  document.startViewTransition(run);
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
      <path
        d="M16.5 13.2A6.2 6.2 0 0 1 10.8 5 6.4 6.4 0 1 0 19 15.2a6.2 6.2 0 0 1-2.5-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 3.5v1.8M12 18.7v1.8M3.5 12h1.8M18.7 12h1.8M6 6l1.3 1.3M16.7 16.7 18 18M18 6l-1.3 1.3M7.3 16.7 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
