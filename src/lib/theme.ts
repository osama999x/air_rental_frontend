export const themeCookie = "air-theme";

export type ThemeChoice = "light" | "dark" | "system";

export function parseTheme(value: string | undefined | null): ThemeChoice {
  if (value === "light" || value === "dark" || value === "system") return value;
  return "system";
}
