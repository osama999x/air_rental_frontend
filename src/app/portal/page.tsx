import { redirect } from "next/navigation";
import { readAccessToken, readPortalProfile } from "@/features/portal/session";

export const instant = false;

export default async function PortalIndex() {
  const [profile, token] = await Promise.all([readPortalProfile(), readAccessToken()]);
  redirect(profile && token ? "/portal/home" : profile || token ? "/portal/session/end" : "/portal/welcome");
}
