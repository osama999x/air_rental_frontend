import { redirect } from "next/navigation";
import { portalCall } from "@/features/portal/api";
import { clearPortalSession, readPortalProfile, readRefreshToken, storePortalSession } from "@/features/portal/session";
import type { PortalUser } from "@/features/portal/types";

export async function GET() {
  const refreshToken = await readRefreshToken();
  const current = await readPortalProfile();
  if (!refreshToken) {
    await clearPortalSession();
    redirect("/portal/login?expired=1");
  }

  const result = await portalCall<{ accessToken: string; refreshToken: string; user: PortalUser }>(
    "/auth/refresh",
    { method: "POST", auth: false, body: { refreshToken } },
  );
  if (!result.ok) {
    await clearPortalSession();
    redirect("/portal/login?expired=1");
  }

  await storePortalSession({
    accessToken: result.data.accessToken,
    refreshToken: result.data.refreshToken,
    user: result.data.user,
    roles: current?.roles,
    activeRole: current?.activeRole ?? result.data.user.preferredPortalRole ?? undefined,
  });
  redirect("/portal/home");
}
