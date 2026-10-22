import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="py-20">
      <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy">Page not found</h1>
      <p className="mt-3 max-w-md text-muted">
        That address is not part of the tenancy site.
      </p>
      <ButtonLink href="/properties" className="mt-6">
        Browse properties
      </ButtonLink>
    </Container>
  );
}
