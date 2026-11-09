import { Container } from "@/components/layout/container";
import { UnitGridSkeleton } from "@/features/catalog/components/unit-grid-skeleton";

export default function PropertiesLoading() {
  return (
    <Container className="py-12">
      <div className="skeleton h-4 w-28 rounded-full" />
      <div className="skeleton mt-3 h-10 w-56 rounded-full" />
      <UnitGridSkeleton />
    </Container>
  );
}
