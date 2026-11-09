import { PropertyArt } from "@/components/brand/property-art";
import { FlipCard } from "@/components/motion/flip-card";
import { ButtonLink } from "@/components/ui/button";
import { formatPkr } from "@/lib/format";
import { propertyTypeLabel, type RentalProperty } from "../types";

export function PropertyCard({ property }: { property: RentalProperty }) {
  return (
    <FlipCard
      back={
        <div className="flex h-full flex-col justify-between bg-card p-5">
          <div>
            <p className="text-xs text-muted">Monthly rent</p>
            <p className="mt-1 text-2xl font-semibold text-navy">{formatPkr(property.monthlyRent)}</p>
            <p className="mt-4 text-sm font-semibold text-navy">{property.sizeLabel}</p>
            <p className="mt-1 text-sm text-muted">
              {property.area}, {property.city}
            </p>
          </div>
          <ButtonLink href={`/properties/${property.slug}`}>View property</ButtonLink>
        </div>
      }
    >
    <article className="flex h-full flex-col overflow-hidden bg-card">
      <PropertyArt label={propertyTypeLabel(property.type)} />
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-semibold tracking-tight text-navy">{property.name}</h2>
        <p className="mt-1 text-sm text-muted">
          {property.area}, {property.city}
        </p>
        <p className="mt-2 flex-1 text-sm leading-6 text-muted">{property.summary}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted">Monthly rent</p>
            <p className="text-xl font-semibold text-navy">{formatPkr(property.monthlyRent)}</p>
          </div>
          <p className="rounded-full bg-wash px-3 py-1 text-sm font-medium whitespace-nowrap text-navy">{property.sizeLabel}</p>
        </div>
        <ButtonLink href={`/properties/${property.slug}`} className="mt-5">
          View property
        </ButtonLink>
      </div>
    </article>
    </FlipCard>
  );
}
