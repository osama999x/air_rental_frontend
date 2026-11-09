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
  const preview = await portalCall<InvitePreview>(`/invitations/${token}`, { auth: false });
  const profile = await readPortalProfile();
  const invite = preview.ok ? preview.data : null;
  const closed = invite && invite.status && invite.status !== "PENDING";
  const next = `/portal/login?invite=${encodeURIComponent(token)}`;
  const signup = `/portal/signup?invite=${encodeURIComponent(token)}`;
  return (
    <AuthFrame title="Tenancy invitation" lede="Accepting adds the tenant role and marks the tenancy accepted. The property becomes rented when the owner activates it.">
      {error ? <Notice message={error} /> : null}
      {!preview.ok ? <Notice message={preview.message} /> : (
        <div className="mb-4 rounded-[22px] bg-white p-4 text-sm text-navy">
          <p className="text-lg font-semibold">{invite?.propertyName || "Property"}</p>
          <p className="mt-1 text-muted">{[invite?.propertyCode, invite?.tenantName].filter(Boolean).join(" · ")}</p>
          <dl className="mt-3 grid gap-2">
            <Row label="Status" value={label(invite?.status)} />
            <Row label="Dates" value={[invite?.startDate, invite?.endDate].filter(Boolean).join(" → ") || "—"} />
            <Row label="Expires" value={invite?.expiresAt || "—"} />
            <Row label="Account" value={invite?.accountExists ? "An account already uses this contact" : "A new account can accept this link"} />
          </dl>
        </div>
      )}
      {closed ? <Notice message={closedMessage(invite?.status)} /> : null}
      {profile && !closed ? (
        <form action={respondToInvite} className="grid gap-3">
          <input type="hidden" name="token" value={token} />
          <button name="intent" value="accept" className="h-12 rounded-full bg-accent text-sm font-medium text-white">Accept</button>
          <button name="intent" value="decline" className="h-12 rounded-full border border-line bg-white text-sm font-medium text-navy">Decline</button>
        </form>
      ) : null}
      {!profile && !closed ? (
        <div className="grid gap-3">
          <Link href={next} className="inline-flex h-12 items-center justify-center rounded-full bg-accent text-sm font-medium text-white">
            Sign in to respond
          </Link>
          <Link href={signup} className="inline-flex h-12 items-center justify-center rounded-full border border-line bg-white text-sm font-medium text-navy">
            Create an account
          </Link>
        </div>
      ) : null}
    </AuthFrame>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function label(value?: string) {
  return (value ?? "Unknown").replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}

function closedMessage(status?: string) {
  if (status === "EXPIRED") return "This invitation has expired.";
  if (status === "ACCEPTED") return "This invitation was already used.";
  if (status === "DECLINED") return "This invitation was declined.";
  if (status === "REVOKED") return "This invitation was revoked.";
  return "This invitation is closed.";
}

type InvitePreview = {
  propertyName?: string;
  propertyCode?: string;
  tenantName?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  expiresAt?: string;
  accountExists?: boolean;
};
