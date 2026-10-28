import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, cookieBase, PROFILE_COOKIE, REFRESH_COOKIE, REFRESH_GUARD_COOKIE } from "@/features/portal/session";

const API_URL = process.env.API_URL ?? "http://localhost:3000/api/v1";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const role = request.cookies.get(PROFILE_COOKIE)?.value;
  if (token) {
    const headers = new Headers({ Authorization: `Bearer ${token}` });
    try {
      const profile = role ? (JSON.parse(role) as { activeRole?: string }) : null;
      if (profile?.activeRole) headers.set("X-Portal-Role", profile.activeRole);
      headers.set("Content-Type", "application/json");
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers,
        body: "{}",
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      // The browser session still has to end when the API is restarting.
    }
  }

  const response = NextResponse.redirect(new URL("/portal/login", request.url));
  const expired = cookieBase(0);
  response.cookies.set(ACCESS_COOKIE, "", expired);
  response.cookies.set(REFRESH_COOKIE, "", expired);
  response.cookies.set(PROFILE_COOKIE, "", expired);
  response.cookies.set(REFRESH_GUARD_COOKIE, "", expired);
  return response;
}
