import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader } from "@/features/portal/components/loader";
import { PropertyDetailScreen } from "@/features/portal/screens/catalog";

export const instant = false;

export const metadata: Metadata = { title: "Property" };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Loader label="Loading property…" />}>
      <Panel params={params} />
    </Suspense>
  );
}

async function Panel({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PropertyDetailScreen id={id} />;
}
