import type { Metadata } from "next";
import { Suspense } from "react";
import { NewPropertyScreen } from "@/features/portal/screens/catalog";

export const instant = false;

export const metadata: Metadata = { title: "Add property" };

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading the form…</p>}>
      <NewPropertyScreen />
    </Suspense>
  );
}
