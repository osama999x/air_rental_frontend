import type { Metadata } from "next";
import { Suspense } from "react";
import { HandoverScreen } from "@/features/portal/screens/catalog";

export const instant = false;

export const metadata: Metadata = { title: "Handover" };

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading handover…</p>}>
      <HandoverScreen />
    </Suspense>
  );
}
