import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { respondToInvite } from "@/features/portal/actions";
import { portalCall } from "@/features/portal/api";
import { AuthFrame } from "@/features/portal/components/auth-flow";
import { Notice } from "@/features/portal/components/ui";
import { readPortalProfile } from "@/features/portal/session";
import { readParam } from "@/lib/format";

export const metadata: Metadata = { title: "Invitation" };

export default function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading invitation…</p>}>
      <InviteScreen params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function InviteScreen({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { token } = await params;
  const error = readParam((await searchParams).error);
  const preview = await portalCall<Record<string, unknown>>(`/invitations/${token}`, { auth: false });
  const profile = await readPortalProfile();
  return (
    <AuthFrame title="Tenancy invitation" lede="Accepting makes you the tenant. A used or expired invite cannot be accepted again.">
      {error ? <Notice message={error} /> : null}
      {!preview.ok ? <Notice message={preview.message} /> : (
        <pre className="mb-4 overflow-auto rounded-[22px] bg-white p-4 text-xs text-navy">{JSON.stringify(preview.data, null, 2)}</pre>
      )}
      {profile ? (
        <form action={respondToInvite} className="grid gap-3">
          <input type="hidden" name="token" value={token} />
          <button name="intent" value="accept" className="h-12 rounded-full bg-accent text-sm font-medium text-white">Accept</button>
          <button name="intent" value="decline" className="h-12 rounded-full border border-line bg-white text-sm font-medium text-navy">Decline</button>
        </form>
      ) : (
        <Link href="/portal/login" className="inline-flex h-12 items-center justify-center rounded-full bg-accent text-sm font-medium text-white">
          Sign in to respond
        </Link>
      )}
    </AuthFrame>
  );
}
