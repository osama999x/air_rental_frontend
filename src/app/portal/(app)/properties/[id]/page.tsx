import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader } from "@/features/portal/components/loader";
import { PropertyDetailScreen } from "@/features/portal/screens/catalog";
import { readParam } from "@/lib/format";

export const instant = false;

export const metadata: Metadata = { title: "Property" };

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<Loader label="Loading property…" />}>
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
  const { id } = await params;
  const notice = readParam((await searchParams).error);
  return <PropertyDetailScreen id={id} notice={notice} />;
}
