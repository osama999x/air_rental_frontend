import type { Metadata } from "next";
import { Suspense } from "react";
import { OrganizationScreen } from "@/features/portal/screens/catalog";

export const instant = false;

export const metadata: Metadata = { title: "Organization" };

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading organization…</p>}>
      <OrganizationScreen />
    </Suspense>
  );
}
