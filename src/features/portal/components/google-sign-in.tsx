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

export function GoogleSignIn({ copy }: { copy: AuthCopy }) {
  const host = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);
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
    };

    if (window.google?.accounts?.id) {
      render();
      return () => {
        cancelled = true;
      };
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-google-gsi="1"]');
    if (existing) {
      existing.addEventListener("load", render);
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
    script.onload = () => render();
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
      <BusyOverlay show={pending} label={copy.signingIn} />
      <input type="hidden" name="idToken" />
      <Notice message={loadError ? copy.googleError : state.message} />
      <div ref={host} className={`google-signin-host ${pending ? "pointer-events-none opacity-60" : ""}`} />
      <div className="flex items-center gap-3 text-xs font-medium text-muted">
        <span className="h-px flex-1 bg-line" />
        {copy.or}
        <span className="h-px flex-1 bg-line" />
      </div>
    </form>
  );
}
