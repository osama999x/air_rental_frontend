import { NextResponse } from "next/server";
import { clearAdminSession } from "@/features/admin/session";

export async function GET(request: Request) {
  await clearAdminSession();
  return NextResponse.redirect(new URL("/admin/login?expired=1", request.url));
}
