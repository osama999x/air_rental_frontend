import { cookies } from "next/headers";
import type { PortalProfile, PortalRole, PortalUser } from "./types";

export const ACCESS_COOKIE = "portal_access_token";
export const REFRESH_COOKIE = "portal_refresh_token";
export const PROFILE_COOKIE = "portal_profile";
export const LANGUAGE_COOKIE = "portal_language";
export const ROLE_COOKIE = "portal_intended_role";
export const ACCOUNT_COOKIE = "portal_account_type";

const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;
const PREFERENCE_MAX_AGE = 60 * 60 * 24 * 30;

function cookieBase(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function readAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function readRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}

export async function readPortalProfile(): Promise<PortalProfile | null> {
  const raw = (await cookies()).get(PROFILE_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PortalProfile>;
    if (!parsed.id || !parsed.email || !parsed.firstName || !parsed.activeRole) return null;
    const roles = Array.isArray(parsed.roles) ? parsed.roles.filter(isRole) : [];
    if (!isRole(parsed.activeRole)) return null;
    return {
      id: parsed.id,
      email: parsed.email,
      firstName: parsed.firstName,
      lastName: parsed.lastName ?? "",
      roles: roles.length ? roles : [parsed.activeRole],
      activeRole: parsed.activeRole,
    };
  } catch {
    return null;
  }
}

export async function readOnboarding() {
  const store = await cookies();
  const role = store.get(ROLE_COOKIE)?.value;
  const account = store.get(ACCOUNT_COOKIE)?.value;
  return {
    language: store.get(LANGUAGE_COOKIE)?.value ?? "en",
    role: isRole(role) ? role : undefined,
    account: account === "BUSINESS" || account === "INDIVIDUAL" ? account : undefined,
  };
}

export async function storePreference(name: "language" | "role" | "account", value: string) {
  const key = name === "language" ? LANGUAGE_COOKIE : name === "role" ? ROLE_COOKIE : ACCOUNT_COOKIE;
  (await cookies()).set(key, value, cookieBase(PREFERENCE_MAX_AGE));
}

export async function storePortalSession(input: {
  accessToken: string;
  refreshToken?: string;
  user: PortalUser;
  roles?: PortalRole[];
  activeRole?: PortalRole;
}) {
  const store = await cookies();
  const onboarding = await readOnboarding();
  const roles = input.roles?.length ? input.roles : onboarding.role ? [onboarding.role] : [];
  const activeRole = input.activeRole ?? input.user.preferredPortalRole ?? roles[0] ?? onboarding.role ?? "OWNER";
  const profile: PortalProfile = {
    id: input.user.id,
    email: input.user.email,
    firstName: input.user.firstName,
    lastName: input.user.lastName,
    roles: roles.includes(activeRole) ? roles : [...roles, activeRole],
    activeRole,
  };
  store.set(ACCESS_COOKIE, input.accessToken, cookieBase(ACCESS_MAX_AGE));
  if (input.refreshToken) store.set(REFRESH_COOKIE, input.refreshToken, cookieBase(REFRESH_MAX_AGE));
  store.set(PROFILE_COOKIE, JSON.stringify(profile), cookieBase(REFRESH_MAX_AGE));
}

export async function updatePortalProfile(profile: PortalProfile) {
  (await cookies()).set(PROFILE_COOKIE, JSON.stringify(profile), cookieBase(REFRESH_MAX_AGE));
}

export async function clearPortalSession() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  store.delete(PROFILE_COOKIE);
}

function isRole(value: unknown): value is PortalRole {
  return value === "OWNER" || value === "TENANT" || value === "MANAGER";
}
