import { cookies } from "next/headers";
import type { AdminProfile } from "./types";

export const ACCESS_COOKIE = "admin_access_token";
export const PROFILE_COOKIE = "admin_profile";
export const MFA_COOKIE = "admin_mfa_token";
export const MFA_URL_COOKIE = "admin_mfa_otpauth";

const ACCESS_MAX_AGE = 60 * 15;
const MFA_MAX_AGE = 60 * 10;

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

export async function readAdminProfile(): Promise<AdminProfile | null> {
  const raw = (await cookies()).get(PROFILE_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AdminProfile>;
    if (!parsed.id || !parsed.email || !parsed.displayName) return null;
    return { id: parsed.id, email: parsed.email, displayName: parsed.displayName };
  } catch {
    return null;
  }
}

export async function readMfaChallenge() {
  const store = await cookies();
  return {
    token: store.get(MFA_COOKIE)?.value,
    otpauthUrl: store.get(MFA_URL_COOKIE)?.value,
  };
}

export async function storeMfaChallenge(token: string, otpauthUrl?: string) {
  const store = await cookies();
  store.set(MFA_COOKIE, token, cookieBase(MFA_MAX_AGE));
  if (otpauthUrl) {
    store.set(MFA_URL_COOKIE, otpauthUrl, cookieBase(MFA_MAX_AGE));
  } else {
    store.delete(MFA_URL_COOKIE);
  }
}

export async function storeAdminSession(accessToken: string, admin: AdminProfile) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, cookieBase(ACCESS_MAX_AGE));
  store.set(PROFILE_COOKIE, JSON.stringify(admin), cookieBase(ACCESS_MAX_AGE));
  store.delete(MFA_COOKIE);
  store.delete(MFA_URL_COOKIE);
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(PROFILE_COOKIE);
  store.delete(MFA_COOKIE);
  store.delete(MFA_URL_COOKIE);
}
