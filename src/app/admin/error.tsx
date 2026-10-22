"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({
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
    <div className="rounded-2xl border border-line bg-card p-6">
      <h1 className="text-xl font-semibold tracking-tight">This page did not load</h1>
      <p className="mt-2 text-sm text-muted">Try again. If the session expired, sign in once more.</p>
      <Button type="button" onClick={() => retry()} className="mt-4">
        Try again
      </Button>
    </div>
  );
}
