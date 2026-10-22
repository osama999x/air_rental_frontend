import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { MoreScreen } from "@/features/portal/screens/catalog";
import { readPortalProfile } from "@/features/portal/session";

export const instant = false;

export const metadata: Metadata = { title: "More" };

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading…</p>}>
      <Panel />
    </Suspense>
  );
}

async function Panel() {
  const profile = await readPortalProfile();
  if (!profile) redirect("/portal/login");
  return <MoreScreen profile={profile} />;
}
