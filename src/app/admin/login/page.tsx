import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/features/admin/components/login-form";
import { readAdminProfile } from "@/features/admin/session";
import { readParam } from "@/lib/format";

export const metadata: Metadata = {
  title: "Admin sign in",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<div className="admin-shell min-h-full flex-1" />}>
      <LoginScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginScreen({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string | string[] }>;
}) {
  const profile = await readAdminProfile();
  if (profile) redirect("/admin");
  const expired = readParam((await searchParams).expired) === "1";
  return <LoginForm expired={expired} />;
}
