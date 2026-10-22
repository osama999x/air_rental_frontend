import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { BookingForm } from "@/features/booking/components/booking-form";
import { listProperties } from "@/features/catalog/queries";
import { readParam } from "@/lib/format";

export const metadata: Metadata = {
  title: "Apply",
  description: "Request a monthly tenancy for a vacant property.",
};

export default function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string | string[] }>;
}) {
  return (
    <Container className="rise-in grid items-start gap-8 py-12 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="surface-card overflow-hidden">
        <div className="bg-gradient-to-br from-accent to-navy p-6 text-white">
          <p className="text-xs font-semibold tracking-[0.16em] text-white/80">TENANCY</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Apply for a tenancy</h1>
        </div>
        <div className="grid gap-4 p-6 text-sm leading-6 text-muted">
          <p>
            This sends a request only. The owner confirms the property, the rent, and the move-in
            date before the tenancy is active.
          </p>
          <ul className="grid gap-2">
            <li className="rounded-2xl bg-[#f4f7fb] px-4 py-3 font-medium text-navy">Property and city</li>
            <li className="rounded-2xl bg-[#f4f7fb] px-4 py-3 font-medium text-navy">Move-in date and months</li>
            <li className="rounded-2xl bg-[#f4f7fb] px-4 py-3 font-medium text-navy">Owner confirms the agreement</li>
          </ul>
        </div>
      </div>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-line" />}>
        <TenancyRequest searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function TenancyRequest({
  searchParams,
}: {
  searchParams: Promise<{ property?: string | string[] }>;
}) {
  const properties = await listProperties();
  const selectedSlug = readParam((await searchParams).property);

  return (
    <BookingForm
      properties={properties.map((property) => ({
        slug: property.slug,
        name: property.name,
        city: property.city,
      }))}
      selectedSlug={selectedSlug}
    />
  );
}
