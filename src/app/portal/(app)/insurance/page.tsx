import type { Metadata } from "next";
import { Suspense } from "react";
import { InsuranceScreen } from "@/features/portal/screens/catalog";

export const instant = false;

export const metadata: Metadata = { title: "Insurance" };

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading insurance…</p>}>
      <InsuranceScreen />
    </Suspense>
  );
}
