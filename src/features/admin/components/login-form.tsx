"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { submitAdminLogin } from "@/features/admin/actions";
import type { LoginState } from "@/features/admin/types";

const initialState: LoginState = { step: "credentials", status: "idle", message: "" };

export function LoginForm({ expired }: { expired: boolean }) {
  const [state, action, pending] = useActionState(submitAdminLogin, initialState);

  return (
    <div className="portal-auth admin-shell">
      <aside className="portal-auth-panel">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-white/80">AIR RENTAL</p>
          <h2 className="mt-6 max-w-md text-4xl font-semibold tracking-tight">Operator console</h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/80">
            Platform staff review users, properties, subscriptions, and support. Owner and tenant accounts stay on the portal.
          </p>
        </div>
      </aside>
      <section className="portal-auth-main">
      <div className="admin-card w-full max-w-md p-6 sm:p-8">
        <p className="text-sm font-bold tracking-[0.18em] text-navy">AIR RENTAL</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-navy">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Platform operators sign in here. Owner, tenant, and manager accounts use the portal.
        </p>
        {expired && state.status === "idle" ? (
          <p className="mt-4 text-sm text-red-700" role="alert">
            Your session expired. Sign in again.
          </p>
        ) : null}
        {state.message ? (
          <p className={`mt-4 text-sm ${state.status === "error" ? "text-red-700" : "text-muted"}`} role="status">
            {state.message}
          </p>
        ) : null}
        {state.step === "mfa" ? (
          <form action={action} className="mt-6 grid gap-4">
            {state.otpauthUrl ? (
              <p className="rounded-2xl bg-background px-3 py-3 text-sm break-all">
                <a className="text-accent underline" href={state.otpauthUrl}>
                  Open authenticator setup
                </a>
              </p>
            ) : null}
            <label className="grid gap-1 text-sm font-medium">
              Authentication code
              <input
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                required
                className="h-12 rounded-2xl border border-line bg-[#f4f7fb] px-3 outline-none focus:border-accent"
              />
            </label>
            <Button type="submit" name="intent" value="mfa" disabled={pending}>
              {pending ? "Checking…" : "Verify"}
            </Button>
            <Button type="submit" name="intent" value="restart" variant="secondary" formNoValidate disabled={pending}>
              Use a different account
            </Button>
          </form>
        ) : (
          <form action={action} className="mt-6 grid gap-4">
            <label className="grid gap-1 text-sm font-medium">
              Email
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
                className="h-12 rounded-2xl border border-line bg-[#f4f7fb] px-3 outline-none focus:border-accent"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="h-12 rounded-2xl border border-line bg-[#f4f7fb] px-3 outline-none focus:border-accent"
              />
            </label>
            <Button type="submit" disabled={pending}>
              {pending ? "Signing in…" : "Continue"}
            </Button>
          </form>
        )}
      </div>
      </section>
    </div>
  );
}
