"use client";

import { useState } from "react";
import Link from "next/link";
import { respondToInvite } from "@/features/portal/actions";
import { Notice } from "./ui";

const typeLabels: Record<string, string> = {
  HSE: "House",
  APT: "Apartment",
  SHP: "Shop",
  FLR: "Floor",
  ROM: "Room",
  OFC: "Office",
  WRH: "Warehouse",
  PLT: "Plot",
};

export type InvitePreview = {
  propertyName?: string | null;
  propertyCode?: string | null;
  propertyType?: string | null;
  propertyUnit?: string | null;
  propertyAddress?: string | null;
  propertyCity?: string | null;
  propertyPhotoUrl?: string | null;
  rent?: string | null;
  notes?: string | null;
  invitedBy?: string | null;
  invitedByPhone?: string | null;
  invitedByPhotoUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
};

export function InviteCard({
  token,
  invite,
  signedIn,
  closed,
  closedNote,
  loginHref,
  signupHref,
}: {
  token: string;
  invite: InvitePreview;
  signedIn: boolean;
  closed: boolean;
  closedNote?: string;
  loginHref: string;
  signupHref: string;
}) {
  const [step, setStep] = useState<"cover" | "detail">(closed ? "detail" : "cover");
  const owner = invite.invitedBy || "The property owner";
  const property = invite.propertyName || "Property";
  const address = [invite.propertyAddress, invite.propertyCity].filter(Boolean).join(", ");
  return (
    <div>
      {step === "cover" ? (
        <article className="overflow-hidden rounded-[28px] border border-line bg-card shadow-[0_16px_40px_rgba(18,48,92,0.08)]">
          <div className="h-1.5 bg-accent" />
          <div className="px-5 pb-6 pt-6 text-center">
            <h2 className="text-2xl font-semibold leading-tight text-navy">
              You have been invited
              <span className="block">as Tenant</span>
            </h2>
            <OwnerMark name={owner} photoUrl={invite.invitedByPhotoUrl} />
            <p className="mt-4 text-base font-semibold text-navy">{owner}</p>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted">
              Has invited you to join a property on Air Rental as a tenant
            </p>
            <PropertyRow name={property} code={invite.propertyCode} photoUrl={invite.propertyPhotoUrl} />
            <button
              type="button"
              onClick={() => setStep("detail")}
              className="mt-5 h-12 w-full rounded-full bg-accent text-sm font-medium text-white"
            >
              View Invitation
            </button>
            <Link
              href="/"
              className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#3a3a3a] text-sm font-medium text-white"
            >
              May Be Later
            </Link>
          </div>
          <EnvelopeFold />
        </article>
      ) : (
        <article className="rounded-[28px] border border-line bg-card p-4">
          <PropertyRow name={property} code={invite.propertyCode} photoUrl={invite.propertyPhotoUrl} />
          <dl id="invitation-facts" className="mt-4">
            <Fact label="Property type" value={invite.propertyType ? typeLabels[invite.propertyType] || invite.propertyType : ""} />
            <Fact label="Unit" value={invite.propertyUnit || ""} />
            <Fact label="Address" value={address} />
            <Fact label="Lease start date" value={formatLeaseDate(invite.startDate)} />
            <Fact label="Lease end date" value={formatLeaseDate(invite.endDate)} />
            <Fact label="Monthly rent" value={invite.rent ? formatRent(invite.rent) : ""} />
            <Fact label="Additional notes" value={invite.notes || ""} />
            <Fact label="Owner phone" value={invite.invitedByPhone || ""} />
          </dl>
          {closedNote ? <div className="mt-4"><Notice message={closedNote} /></div> : null}
          {!closed && signedIn ? (
            <form action={respondToInvite} className="mt-6 grid gap-3">
              <input type="hidden" name="token" value={token} />
              <button name="intent" value="accept" className="h-12 rounded-full bg-accent text-sm font-medium text-white">
                Accept Invitation
              </button>
              <a href="#invitation-facts" className="inline-flex h-12 items-center justify-center rounded-full bg-[#3a3a3a] text-sm font-medium text-white">
                Review
              </a>
              <button name="intent" value="decline" className="h-12 rounded-full bg-[#3a3a3a] text-sm font-medium text-white">
                Decline
              </button>
            </form>
          ) : null}
          {!closed && !signedIn ? (
            <div className="mt-6 grid gap-3">
              <Link href={loginHref} className="inline-flex h-12 items-center justify-center rounded-full bg-accent text-sm font-medium text-white">
                Accept Invitation
              </Link>
              <a href="#invitation-facts" className="inline-flex h-12 items-center justify-center rounded-full bg-[#3a3a3a] text-sm font-medium text-white">
                Review
              </a>
              <Link href={loginHref} className="inline-flex h-12 items-center justify-center rounded-full bg-[#3a3a3a] text-sm font-medium text-white">
                Decline
              </Link>
              <Link href={signupHref} className="text-center text-sm font-semibold text-accent-ink">
                Create an account
              </Link>
            </div>
          ) : null}
          {!closed ? (
            <button type="button" onClick={() => setStep("cover")} className="mt-4 text-sm font-semibold text-accent-ink">
              Back
            </button>
          ) : null}
        </article>
      )}
    </div>
  );
}

function OwnerMark({ name, photoUrl }: { name: string; photoUrl?: string | null }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="mx-auto mt-5 grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-[#e7eefb] text-3xl font-semibold text-accent">
      {photoUrl && !failed ? (
        <img src={photoUrl} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        initials(name)
      )}
    </div>
  );
}

function PropertyRow({ name, code, photoUrl }: { name: string; code?: string | null; photoUrl?: string | null }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="mt-5 flex items-center gap-3 rounded-2xl border border-line bg-card p-3 text-left">
      <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#d9dde3] text-[#8b93a0]">
        {photoUrl && !failed ? (
          <img src={photoUrl} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
        ) : (
          <PhotoMark />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-navy">{name}</p>
        <p className="mt-1 text-sm text-muted">{code || "—"}</p>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-3 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="max-w-[60%] text-right font-semibold text-navy">{value || "N/A"}</dd>
    </div>
  );
}

function EnvelopeFold() {
  return (
    <div className="relative h-28 bg-accent" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-16 bg-card [clip-path:polygon(0_0,50%_100%,100%_0)]" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-[#1d4ed8] [clip-path:polygon(0_100%,50%_0,100%_100%)]" />
    </div>
  );
}

function PhotoMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 15l2.5-2.5L14 16l2-2 2 2" />
      <circle cx="9" cy="9" r="1" />
    </svg>
  );
}

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean).slice(0, 2);
  const letters = parts.map((part) => part[0]?.toUpperCase() || "").join("");
  return letters || "AR";
}

function formatLeaseDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  const day = date.getDate();
  const suffix = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
  const month = date.toLocaleDateString("en-GB", { month: "short" });
  return `${day}${suffix} ${month} ${date.getFullYear()}`;
}

function formatRent(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(amount);
}
