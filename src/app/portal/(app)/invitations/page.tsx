import type { Metadata } from "next";
import { Suspense } from "react";
import { InvitationsScreen } from "@/features/portal/screens/catalog";
import { readParam } from "@/lib/format";

export const instant = false;

export const metadata: Metadata = { title: "Invitations" };

export default function Page({ searchParams }: { searchParams: Promise<{ error?: string | string[] }> }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading invitations…</p>}>
      <Panel searchParams={searchParams} />
    </Suspense>
  );
}

async function Panel({ searchParams }: { searchParams: Promise<{ error?: string | string[] }> }) {
  return <InvitationsScreen notice={readParam((await searchParams).error)} />;
}
