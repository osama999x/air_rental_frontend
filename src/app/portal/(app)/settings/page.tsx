import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SettingsScreen } from "@/features/portal/screens/catalog";
import { readPortalProfile } from "@/features/portal/session";

export const instant = false;

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading settings…</p>}>
      <Panel />
    </Suspense>
  );
}

async function Panel() {
  const profile = await readPortalProfile();
  if (!profile) redirect("/portal/login");
  return <SettingsScreen profile={profile} />;
}
