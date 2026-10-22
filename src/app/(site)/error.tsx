"use client";

import { useEffect } from "react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-navy">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted">
        The page did not finish loading. Try again, or come back in a moment.
      </p>
      <Button type="button" onClick={() => retry()} className="mt-6">
        Try again
      </Button>
    </Container>
  );
}
