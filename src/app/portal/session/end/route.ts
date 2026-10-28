import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  cookieBase,
  parsePortalProfile,
  PROFILE_COOKIE,
  REFRESH_COOKIE,
  REFRESH_GUARD_COOKIE,
} from "@/features/portal/session";
import type { PortalRole, PortalUser } from "@/features/portal/types";

const API_URL = process.env.API_URL ?? "http://localhost:3000/api/v1";

export async function GET(request: NextRequest) {
  const login = new URL("/portal/login?expired=1", request.url);
  if (request.cookies.get(REFRESH_GUARD_COOKIE)?.value === "1") {
    return expire(login);
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return expire(login);

  let renewed: { accessToken: string; refreshToken: string; user: PortalUser } | null = null;
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    const payload = (await response.json()) as { data?: { accessToken?: string; refreshToken?: string; user?: PortalUser } };
    const data = payload.data;
    if (response.ok && data?.accessToken && data.refreshToken && data.user?.id) {
      renewed = { accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user };
    }
  } catch {
    renewed = null;
  }
  if (!renewed) return expire(login);

  const current = parsePortalProfile(request.cookies.get(PROFILE_COOKIE)?.value);
  const user = renewed.user;
  const activeRole = heldRole(current?.activeRole ?? user.preferredPortalRole);
  const roles = current?.roles?.length ? current.roles : [activeRole];
  const profile = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: roles.includes(activeRole) ? roles : [...roles, activeRole],
    activeRole,
  };
  const response = NextResponse.redirect(new URL("/portal/home", request.url));
  response.cookies.set(ACCESS_COOKIE, renewed.accessToken, cookieBase(60 * 15));
  response.cookies.set(REFRESH_COOKIE, renewed.refreshToken, cookieBase(60 * 60 * 24 * 30));
  response.cookies.set(PROFILE_COOKIE, JSON.stringify(profile), cookieBase(60 * 60 * 24 * 30));
  response.cookies.set(REFRESH_GUARD_COOKIE, "1", cookieBase(15));
  return response;
}

function expire(login: URL) {
  const response = NextResponse.redirect(login);
  const expired = cookieBase(0);
  response.cookies.set(ACCESS_COOKIE, "", expired);
  response.cookies.set(REFRESH_COOKIE, "", expired);
  response.cookies.set(PROFILE_COOKIE, "", expired);
  response.cookies.set(REFRESH_GUARD_COOKIE, "", expired);
  return response;
}

function heldRole(value: unknown): PortalRole {
  return value === "OWNER" || value === "TENANT" || value === "MANAGER" ? value : "OWNER";
}
