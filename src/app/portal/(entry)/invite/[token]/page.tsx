import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFrame } from "@/features/portal/components/auth-flow";
import { InviteCard, type InvitePreview } from "@/features/portal/components/invite-card";
import { Notice } from "@/features/portal/components/ui";
import { portalCall } from "@/features/portal/api";
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
  const closed = Boolean(invite?.status && invite.status !== "PENDING");
  const next = `/portal/login?invite=${encodeURIComponent(token)}`;
  const signup = `/portal/signup?invite=${encodeURIComponent(token)}`;
  return (
    <AuthFrame title="Invitation">
      {error ? <Notice message={error} /> : null}
      {!preview.ok || !invite ? <Notice message={preview.ok ? "This invitation could not be opened." : preview.message} /> : (
        <InviteCard
          token={token}
          invite={invite}
          signedIn={Boolean(profile)}
          closed={closed}
          closedNote={closed ? closedMessage(invite.status) : undefined}
          loginHref={next}
          signupHref={signup}
        />
      )}
    </AuthFrame>
  );
}

function closedMessage(status?: string | null) {
  if (status === "EXPIRED") return "This invitation has expired.";
  if (status === "ACCEPTED") return "This invitation was already used.";
  if (status === "DECLINED") return "This invitation was declined.";
  if (status === "REVOKED") return "This invitation was revoked.";
  return "This invitation is closed.";
}
