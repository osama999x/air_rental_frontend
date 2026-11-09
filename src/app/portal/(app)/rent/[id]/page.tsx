import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { RentDetailScreen } from "@/features/portal/screens/catalog";
import { readPortalProfile } from "@/features/portal/session";
import { readParam } from "@/lib/format";

export const instant = false;

export const metadata: Metadata = { title: "Rent transaction" };

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading rent…</p>}>
      <Panel params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Panel({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const [{ id }, profile, query] = await Promise.all([params, readPortalProfile(), searchParams]);
  if (!profile) redirect("/portal/login");
  return <RentDetailScreen id={id} role={profile.activeRole} notice={readParam(query.error)} />;
}
