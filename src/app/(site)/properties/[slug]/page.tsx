import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PropertyArt } from "@/components/brand/property-art";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { getProperty, listProperties } from "@/features/catalog/queries";
import { propertyTypeLabel } from "@/features/catalog/types";
import { formatPkr } from "@/lib/format";

type PropertyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const properties = await listProperties();
  return properties.map((property) => ({ slug: property.slug }));
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);

  if (!property) {
    return { title: "Property not found" };
  }

  return {
    title: property.name,
    description: property.summary,
  };
}

export default function PropertyPage({ params }: PropertyPageProps) {
  return (
    <Suspense fallback={<PropertyDetailFallback />}>
      <PropertyDetail params={params} />
    </Suspense>
  );
}

function PropertyDetailFallback() {
  return (
    <Container className="py-12">
      <div className="h-4 w-24 animate-pulse rounded-full bg-line" />
      <div className="mt-4 h-10 w-72 max-w-full animate-pulse rounded-full bg-line" />
      <div className="mt-8 h-40 animate-pulse rounded-2xl bg-line" />
    </Container>
  );
}

async function PropertyDetail({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = await getProperty(slug);

  if (!property) {
    notFound();
  }

  return (
    <Container className="rise-in py-12">
      <div className="surface-card overflow-hidden">
        <PropertyArt label={propertyTypeLabel(property.type)} />
        <div className="p-6 sm:p-8">
          <p className="text-sm font-semibold text-accent">{propertyTypeLabel(property.type)}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-navy">{property.name}</h1>
          <p className="mt-2 text-sm font-medium text-muted">
            {property.area}, {property.city}
          </p>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{property.summary}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="surface-card p-5">
          <dt className="text-sm text-muted">Monthly rent</dt>
          <dd className="mt-1 text-2xl font-semibold text-navy">{formatPkr(property.monthlyRent)}</dd>
        </div>
        <div className="surface-card p-5">
          <dt className="text-sm text-muted">Size</dt>
          <dd className="mt-1 text-2xl font-semibold text-navy">{property.sizeLabel}</dd>
        </div>
        <div className="surface-card p-5">
          <dt className="text-sm text-muted">City</dt>
          <dd className="mt-1 text-2xl font-semibold text-navy">{property.city}</dd>
        </div>
      </dl>

      <h2 className="mt-10 text-lg font-semibold text-navy">On the tenancy</h2>
      <ul className="mt-3 grid gap-2 text-sm text-muted">
        {property.features.map((feature) => (
          <li key={feature} className="surface-card px-4 py-3">
            {feature}
          </li>
        ))}
      </ul>

      <ButtonLink href={`/apply?property=${property.slug}`} className="mt-8">
        Apply for this property
      </ButtonLink>
    </Container>
  );
}
