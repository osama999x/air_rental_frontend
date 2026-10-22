import { Container } from "@/components/layout/container";

export default function Loading() {
  return (
    <Container className="py-16">
      <div className="h-8 w-48 animate-pulse rounded-full bg-line" />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="h-48 animate-pulse rounded-2xl bg-line" />
        <div className="h-48 animate-pulse rounded-2xl bg-line" />
        <div className="h-48 animate-pulse rounded-2xl bg-line" />
      </div>
    </Container>
  );
}
