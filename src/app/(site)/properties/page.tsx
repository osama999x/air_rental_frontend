import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { PropertyCard } from "@/features/catalog/components/property-card";
import { PropertyFilters } from "@/features/catalog/components/property-filters";
import { UnitGridSkeleton } from "@/features/catalog/components/unit-grid-skeleton";
import { listProperties } from "@/features/catalog/queries";
import { isPropertyType } from "@/features/catalog/types";
import { readParam } from "@/lib/format";

export const metadata: Metadata = {
  title: "Properties",
  description: "Browse vacant houses, apartments, shops, and offices for a monthly tenancy.",
};

export default function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string | string[] }>;
}) {
  return (
    <Container className="rise-in py-12">
      <p className="text-xs font-semibold tracking-[0.16em] text-accent">PROPERTIES</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-navy">Properties</h1>
      <p className="mt-3 max-w-xl text-lg leading-8 text-muted">
        Vacant places with a monthly rent. A tenancy starts when the owner and tenant both accept.
      </p>
      <Suspense fallback={<UnitGridSkeleton />}>
        <PropertyResults searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function PropertyResults({
  searchParams,
}: {
  searchParams: Promise<{ type?: string | string[] }>;
}) {
  const typeParam = readParam((await searchParams).type);
  const type = isPropertyType(typeParam) ? typeParam : undefined;
  const properties = await listProperties(type);

  return (
    <>
      <div className="mt-6">
        <PropertyFilters active={type} />
      </div>
      {properties.length === 0 ? (
        <p className="mt-8 text-muted">No properties of that type are vacant right now.</p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.slug} property={property} />
          ))}
        </div>
      )}
    </>
  );
}
