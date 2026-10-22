import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { RepairDetailScreen } from "@/features/portal/screens/catalog";
import { readPortalProfile } from "@/features/portal/session";

export const instant = false;

export const metadata: Metadata = { title: "Repair" };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading repair…</p>}>
      <Panel params={params} />
    </Suspense>
  );
}

async function Panel({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, profile] = await Promise.all([params, readPortalProfile()]);
  if (!profile) redirect("/portal/login");
  return <RepairDetailScreen id={id} role={profile.activeRole} />;
}
