import type { Metadata } from "next";
import { Suspense } from "react";
import { ManagersScreen } from "@/features/portal/screens/catalog";
import { readParam } from "@/lib/format";

export const instant = false;

export const metadata: Metadata = { title: "Managers" };

export default function Page({ searchParams }: { searchParams: Promise<{ error?: string | string[] }> }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading managers…</p>}>
      <Panel searchParams={searchParams} />
    </Suspense>
  );
}

async function Panel({ searchParams }: { searchParams: Promise<{ error?: string | string[] }> }) {
  return <ManagersScreen notice={readParam((await searchParams).error)} />;
}
