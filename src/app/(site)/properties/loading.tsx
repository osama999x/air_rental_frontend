import { Container } from "@/components/layout/container";
import { UnitGridSkeleton } from "@/features/catalog/components/unit-grid-skeleton";

export default function PropertiesLoading() {
  return (
    <Container className="py-12">
      <div className="h-4 w-28 animate-pulse rounded-full bg-line" />
      <div className="mt-3 h-10 w-56 animate-pulse rounded-full bg-line" />
      <UnitGridSkeleton />
    </Container>
  );
}
