import { Container } from "@/components/layout/container";

export default function Loading() {
  return (
    <Container className="py-16">
      <div className="skeleton h-8 w-48 rounded-full" />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    </Container>
  );
}
