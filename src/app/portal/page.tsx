import { redirect } from "next/navigation";
import { readPortalProfile } from "@/features/portal/session";

export const instant = false;

export default async function PortalIndex() {
  const profile = await readPortalProfile();
  redirect(profile ? "/portal/home" : "/portal/welcome");
}
