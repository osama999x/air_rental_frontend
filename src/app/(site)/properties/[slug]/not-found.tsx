import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";

export default function PropertyNotFound() {
  return (
    <Container className="py-20">
      <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy">Property not found</h1>
      <p className="mt-3 max-w-md text-muted">That property is not in the vacant list.</p>
      <ButtonLink href="/properties" className="mt-6">
        Browse properties
      </ButtonLink>
    </Container>
  );
}
