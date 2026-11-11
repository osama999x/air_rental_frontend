import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { HomeScreen } from "@/features/portal/components/home-screen";
import { readPortalProfile } from "@/features/portal/session";
import { readParam } from "@/lib/format";

export const instant = false;

export const metadata: Metadata = { title: "Home" };

export default function Page({ searchParams }: { searchParams: Promise<{ error?: string | string[]; reviewed?: string | string[] }> }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading home…</p>}>
      <Panel searchParams={searchParams} />
    </Suspense>
  );
}

async function Panel({ searchParams }: { searchParams: Promise<{ error?: string | string[]; reviewed?: string | string[] }> }) {
  const profile = await readPortalProfile();
  if (!profile) redirect("/portal/login");
  const query = await searchParams;
  const error = readParam(query.error);
  const reviewed = readParam(query.reviewed) === "1";
  return <HomeScreen profile={profile} notice={error || (reviewed ? "The owner has your note. This invitation stays open." : undefined)} />;
}
