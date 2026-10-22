import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { HomeScreen } from "@/features/portal/components/home-screen";
import { readPortalProfile } from "@/features/portal/session";

export const instant = false;

export const metadata: Metadata = { title: "Home" };

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading home…</p>}>
      <Panel />
    </Suspense>
  );
}

async function Panel() {
  const profile = await readPortalProfile();
  if (!profile) redirect("/portal/login");
  return <HomeScreen profile={profile} />;
}
