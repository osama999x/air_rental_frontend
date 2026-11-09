import { NextResponse } from "next/server";
import { clearAdminSession } from "@/features/admin/session";

export async function GET(request: Request) {
  await clearAdminSession();
  const response = NextResponse.redirect(new URL("/admin/login?expired=1", request.url), 303);
  response.headers.set("Location", "/admin/login?expired=1");
  return response;
}
