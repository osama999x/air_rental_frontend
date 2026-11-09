"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitGoogle } from "@/features/portal/actions";
import type { AuthCopy } from "@/features/portal/i18n";
import { idleForm } from "@/features/portal/types";
import { BusyOverlay } from "./loader";
import { Notice } from "./ui";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type GoogleId = {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
    auto_select?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

export function GoogleSignIn({ copy, invite }: { copy: AuthCopy; invite?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [painted, setPainted] = useState(false);
  const [state, action, pending] = useActionState(submitGoogle, idleForm);

  useEffect(() => {
    if (!CLIENT_ID || !host.current) return;
    let cancelled = false;

    const render = () => {
      const node = host.current;
      const googleId = window.google?.accounts?.id;
      if (cancelled || !node || !googleId) return;
      googleId.initialize({
        client_id: CLIENT_ID,
        auto_select: false,
        callback: (response) => {
          const form = node.closest("form");
          const input = form?.querySelector<HTMLInputElement>('input[name="idToken"]');
          if (!form || !input || !response.credential) return;
          input.value = response.credential;
          form.requestSubmit();
        },
      });
      node.replaceChildren();
      const width = Math.min(400, Math.max(240, Math.floor(node.clientWidth || 320)));
      googleId.renderButton(node, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width,
        logo_alignment: "left",
      });
      window.requestAnimationFrame(() => {
        const frame = node.querySelector("iframe");
        if (!cancelled && frame && frame.getBoundingClientRect().height > 20) setPainted(true);
      });
    };

    if (window.google?.accounts?.id) {
      render();
      return () => {
        cancelled = true;
      };
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-google-gsi="1"]');
    if (existing) {
      if (window.google?.accounts?.id || existing.dataset.loaded === "1") render();
      else existing.addEventListener("load", render, { once: true });
      return () => {
        cancelled = true;
        existing.removeEventListener("load", render);
      };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleGsi = "1";
    script.onload = () => {
      script.dataset.loaded = "1";
      render();
    };
    script.onerror = () => {
      if (!cancelled) setLoadError(true);
    };
    document.head.appendChild(script);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!CLIENT_ID) return null;

  return (
    <form action={action} className="grid gap-4">
      <style>{".portal-auth-card{container-type:normal !important}.google-signin-host{display:flex;justify-content:center;min-height:44px}.google-signin-host iframe{display:block !important;width:100% !important;max-width:400px;height:44px !important}"}</style>
      <BusyOverlay show={pending} label={copy.signingIn} />
      <input type="hidden" name="idToken" />
      {invite ? <input type="hidden" name="invite" value={invite} /> : null}
      <Notice message={loadError ? copy.googleError : state.message} />
      {painted ? null : (
        <button
          type="button"
          className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-line bg-white text-sm font-semibold text-navy"
          onClick={() => {
            const target = host.current?.querySelector<HTMLElement>('[role="button"]');
            if (target) target.click();
            else setLoadError(true);
          }}
        >
          <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
          </svg>
          Continue with Google
        </button>
      )}
      <div ref={host} className={`google-signin-host ${pending ? "pointer-events-none opacity-60" : ""}`} style={{ display: "flex", justifyContent: "center", minHeight: 44 }} />
      <div className="flex items-center gap-3 text-xs font-medium text-muted">
        <span className="h-px flex-1 bg-line" />
        {copy.or}
        <span className="h-px flex-1 bg-line" />
      </div>
    </form>
  );
}
