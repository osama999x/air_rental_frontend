"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { openInvite } from "@/features/portal/actions";
import { Button } from "@/components/ui/button";
import { Field, fieldClass } from "./ui";

export function InviteShare({ url, expiresAt }: { url: string; expiresAt?: string }) {
  const [src, setSrc] = useState("");
  const [copied, setCopied] = useState(false);
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, { margin: 1, width: 220 }).then((value) => {
      if (!cancelled) setSrc(value);
    }).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [url]);
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setRemaining(countdown(expiresAt));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);
  return (
    <div className="rounded-[22px] bg-card p-4">
      <p className="text-sm font-semibold text-navy">Share this invite</p>
      <p className="mt-2 break-all text-sm text-muted">{url}</p>
      {remaining ? <p className="mt-2 text-sm font-medium text-accent-ink">{remaining}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
          }}
        >
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
      {src ? <img src={src} alt="Invitation QR code" className="mt-4 h-40 w-40 rounded-2xl bg-card" /> : null}
    </div>
  );
}

export function OpenInviteForm({ compact = false }: { compact?: boolean }) {
  return (
    <form action={openInvite} className="grid gap-3">
      <Field label={compact ? "Invite link or code" : "Open an invite link"}>
        <input name="invite" required placeholder="Paste a link or code" className={fieldClass} />
      </Field>
      <Button type="submit" variant={compact ? "secondary" : "primary"}>
        Open invite
      </Button>
    </form>
  );
}

function countdown(expiresAt: string) {
  const end = new Date(expiresAt).getTime();
  const delta = end - Date.now();
  if (Number.isNaN(end)) return "";
  if (delta <= 0) return "This link has expired";
  const total = Math.floor(delta / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const clock = [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
  return days > 0 ? `Expires in ${days}d ${clock}` : `Expires in ${clock}`;
}
