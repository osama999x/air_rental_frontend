"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

const storageKey = "air-theme";
const themeEvent = "air-theme";

export function ThemeBoot() {
  useLayoutEffect(() => {
    applyTheme(storedTheme());
  }, []);
  return null;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const dark = useSyncExternalStore(subscribe, themeIsDark, () => false);
  const nextDark = !dark;

  return (
    <button
      type="button"
      aria-pressed={dark}
      aria-label={nextDark ? "Use dark theme" : "Use light theme"}
      onClick={() => applyTheme(nextDark ? "dark" : "light")}
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-card text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(themeEvent, onStoreChange);
  return () => window.removeEventListener(themeEvent, onStoreChange);
}

function themeIsDark() {
  return document.documentElement.dataset.theme === "dark";
}

function applyTheme(theme: "light" | "dark") {
  if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    /* private browsing can block storage */
  }
  window.dispatchEvent(new Event(themeEvent));
}

function storedTheme() {
  try {
    return localStorage.getItem(storageKey) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
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
