import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/config/site";
import { PropertyCard } from "@/features/catalog/components/property-card";
import { listFeaturedProperties } from "@/features/catalog/queries";
import { propertyTypes } from "@/features/catalog/types";
import { formatPkr } from "@/lib/format";

const roles = [
  {
    title: "Owner",
    body: "List a property, invite a tenant, and follow rent, bills, and maintenance.",
  },
  {
    title: "Tenant",
    body: "Accept the tenancy, see what is due, and raise a request when something needs repair.",
  },
  {
    title: "Manager",
    body: "Look after properties assigned by an owner or a tenant.",
  },
];

const steps = [
  {
    title: "List the property",
    body: "Add the house, apartment, shop, or office, with the city and the monthly rent.",
  },
  {
    title: "Invite the tenant",
    body: "Send a tenancy invite. The tenant accepts before the agreement becomes active.",
  },
  {
    title: "Run the tenancy",
    body: "Track rent, utility bills, inspections, and maintenance until the tenancy ends.",
  },
];

const tenancyNotes = [
  { label: "Rent", value: "Due on the 5th" },
  { label: "Bills", value: "Kept with the property" },
  { label: "Upkeep", value: "Maintenance requests" },
];

export async function HomePage() {
  const featured = await listFeaturedProperties();

  return (
    <>
      <section>
        <Container className="grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="rise-in">
            <p className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-accent shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Property tenancy
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-navy sm:text-6xl sm:leading-[1.05]">
              Homes and shops, rented by the month.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-muted">{site.description}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {site.serviceAreas.map((city) => (
                <li key={city} className="rounded-full bg-[#e8f0ff] px-3 py-1 text-sm font-medium text-accent">
                  {city}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/portal">Open the app</ButtonLink>
              <ButtonLink href="/properties" variant="secondary">
                Browse properties
              </ButtonLink>
            </div>
          </div>
          <aside className="surface-card float-card rise-in delay-2 overflow-hidden">
            <div className="bg-gradient-to-br from-accent to-navy p-6 text-white">
              <p className="text-xs font-semibold tracking-[0.16em] text-white/80">EXAMPLE TENANCY</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight">{formatPkr(180000)}</p>
              <p className="mt-2 text-sm text-white/85">per month · 3-bed house in DHA, Karachi</p>
            </div>
            <ul className="grid gap-3 p-5">
              {tenancyNotes.map((note) => (
                <li key={note.label} className="flex items-center justify-between rounded-2xl bg-[#f4f7fb] px-4 py-3">
                  <span className="text-sm text-muted">{note.label}</span>
                  <span className="text-sm font-semibold text-navy">{note.value}</span>
                </li>
              ))}
            </ul>
          </aside>
        </Container>
      </section>

      <section className="pb-4">
        <Container>
          <div className="rise-in">
            <p className="text-xs font-semibold tracking-[0.16em] text-accent">ROLES</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">Who uses a tenancy</h2>
          </div>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {roles.map((role, index) => (
              <li key={role.title} className={`surface-card hover-lift rise-in p-6 delay-${index + 1}`}>
                <h3 className="text-lg font-semibold text-navy">{role.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{role.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="rise-in">
            <p className="text-xs font-semibold tracking-[0.16em] text-accent">PROPERTIES</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">What you can rent</h2>
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {propertyTypes.map((type, index) => (
              <li key={type.value} className={`rise-in delay-${Math.min(index + 1, 4)}`}>
                <Link
                  href={`/properties?type=${type.value}`}
                  className="surface-card hover-lift flex h-full flex-col p-5"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e8f0ff] text-sm font-semibold text-accent">
                    {type.label.slice(0, 1)}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-navy">{type.label}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted">{type.blurb}</p>
                  <span className="mt-4 text-sm font-medium text-accent">See properties</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="pb-12">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-accent">VACANT</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">Open for a tenant</h2>
            </div>
            <ButtonLink href="/properties" variant="secondary">
              See all
            </ButtonLink>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {featured.map((property, index) => (
              <div key={property.slug} className={`rise-in delay-${index + 1}`}>
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <p className="text-xs font-semibold tracking-[0.16em] text-accent">FLOW</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">How a tenancy starts</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className={`surface-card hover-lift rise-in p-6 delay-${index + 1}`}>
                <p className="grid h-10 w-10 place-items-center rounded-2xl bg-accent text-sm font-semibold text-accent-foreground shadow-[0_8px_18px_rgba(47,107,255,0.28)]">
                  {index + 1}
                </p>
                <h3 className="mt-4 text-lg font-semibold text-navy">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
