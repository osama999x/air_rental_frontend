"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  chooseAccount,
  chooseLanguage,
  chooseRole,
  submitForgot,
  submitLogin,
  submitReset,
  submitResendCode,
  submitSignup,
  submitVerify,
} from "@/features/portal/actions";
import { authCopy, type AuthCopy } from "@/features/portal/i18n";
import { idleForm } from "@/features/portal/types";
import { BusyOverlay } from "./loader";
import { Field, Notice, fieldClass } from "./ui";

export function AuthFrame({
  step,
  title,
  lede,
  children,
  copy,
}: {
  step?: { label: string; current: number; total: number };
  title: string;
  lede?: string;
  children: React.ReactNode;
  copy?: AuthCopy;
}) {
  const text = copy ?? authCopy("en");
  return (
    <div className="portal-auth">
      <aside className="portal-auth-panel">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-white/80">AIR RENTAL</p>
          <h2 className="mt-6 max-w-md text-4xl font-semibold tracking-tight">{text.panelTitle}</h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/80">{text.panelBody}</p>
        </div>
        <ul className="grid gap-3 text-sm">
          {text.points.map((item) => (
            <li key={item} className="rounded-2xl bg-white/10 px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
      </aside>
      <section className="portal-auth-main">
        <div className="portal-auth-card rise-in">
          <p className="text-xs font-semibold tracking-[0.18em] text-accent lg:hidden">AIR RENTAL</p>
          <StepProgress step={step} />
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{title}</h1>
          {lede ? <p className="mt-3 text-sm leading-6 text-muted">{lede}</p> : null}
          <div className="mt-6 flex flex-1 flex-col">{children}</div>
        </div>
      </section>
    </div>
  );
}

function StepProgress({ step }: { step?: { label: string; current: number; total: number } }) {
  if (!step) return null;
  const { current, total, label } = step;
  return (
    <div className="mt-8">
      <p className="text-sm font-medium text-muted">{label}</p>
      <ol className="mt-3 flex gap-2" aria-label="Registration progress">
        {Array.from({ length: total }, (_, index) => (
          <li key={index} className={`h-1.5 flex-1 rounded-full ${index < current ? "bg-accent" : "bg-line"}`} />
        ))}
      </ol>
    </div>
  );
}

export function LanguageForm({
  languages,
  selected,
  copy,
}: {
  languages: { code: string; name: string }[];
  selected?: string;
  copy: AuthCopy;
}) {
  const [state, action, pending] = useActionState(chooseLanguage, idleForm);
  return (
    <form action={action} className="grid gap-3">
      <BusyOverlay show={pending} label="Saving language…" />
      <Notice message={state.message} />
      <div className="grid gap-3 sm:grid-cols-2">
      {languages.map((language) => {
        const active = selected === language.code;
        return (
          <button
            key={language.code}
            name="language"
            value={language.code}
            disabled={pending}
            aria-pressed={active}
            className={`choice ${active ? "outline outline-2 outline-accent" : ""}`}
          >
            <span className="font-semibold text-navy">{language.name}</span>
            <span className="text-sm text-muted">{active ? copy.selected : language.code.toUpperCase()}</span>
          </button>
        );
      })}
      </div>
    </form>
  );
}

export function RoleForm({ copy }: { copy: AuthCopy }) {
  const [state, action, pending] = useActionState(chooseRole, idleForm);
  return (
    <form action={action} className="grid gap-3">
      <BusyOverlay show={pending} label="Saving role…" />
      <Notice message={state.message} />
      {(["OWNER", "TENANT", "MANAGER"] as const).map((role) => (
        <button key={role} name="role" value={role} disabled={pending} className="choice items-start">
          <span>
            <span className="block font-semibold text-navy">{copy.roles[role].title}</span>
            <span className="mt-1 block text-sm leading-5 text-muted">{copy.roles[role].body}</span>
          </span>
        </button>
      ))}
    </form>
  );
}

export function AccountForm({ copy }: { copy: AuthCopy }) {
  const [state, action, pending] = useActionState(chooseAccount, idleForm);
  const options = [
    { value: "INDIVIDUAL", title: copy.individual, body: copy.individualBody },
    { value: "BUSINESS", title: copy.business, body: copy.businessBody },
  ];
  return (
    <form action={action} className="grid gap-3">
      <BusyOverlay show={pending} label="Saving account…" />
      <Notice message={state.message} />
      {options.map((option) => (
        <button key={option.value} name="account" value={option.value} disabled={pending} className="choice items-start">
          <span>
            <span className="block font-semibold text-navy">{option.title}</span>
            <span className="mt-1 block text-sm text-muted">{option.body}</span>
          </span>
        </button>
      ))}
    </form>
  );
}

export function LoginForm({ reset, copy }: { reset?: boolean; copy: AuthCopy }) {
  const [state, action, pending] = useActionState(submitLogin, idleForm);
  return (
    <form action={action} className="grid gap-4">
      {reset ? <Notice message={copy.passwordUpdated} tone="ok" /> : null}
      <Notice message={state.message} />
      <Field label={copy.email}>
        <input name="email" type="email" autoComplete="username" required className={fieldClass} />
      </Field>
      <Field label={copy.password}>
        <input name="password" type="password" autoComplete="current-password" required className={fieldClass} />
      </Field>
      <Link href="/portal/forgot" className="text-sm font-medium text-accent">
        {copy.forgot}
      </Link>
      <Button type="submit" disabled={pending}>
        {pending ? copy.signingIn : copy.signIn}
      </Button>
      <p className="text-center text-sm text-muted">
        {copy.newHere}{" "}
        <Link href="/portal/language" className="font-medium text-accent">
          {copy.createAccount}
        </Link>
      </p>
    </form>
  );
}

export function SignupForm({ copy }: { copy: AuthCopy }) {
  const [state, action, pending] = useActionState(submitSignup, idleForm);
  return (
    <form action={action} className="grid gap-4">
      <Notice message={state.message} />
      <div className="name-grid">
        <Field label={copy.firstName}>
          <input name="firstName" required className={fieldClass} />
        </Field>
        <Field label={copy.lastName}>
          <input name="lastName" required className={fieldClass} />
        </Field>
      </div>
      <Field label={copy.email}>
        <input name="email" type="email" required className={fieldClass} />
      </Field>
      <Field label={copy.phone}>
        <input name="phone" className={fieldClass} />
      </Field>
      <Field label={copy.password}>
        <input name="password" type="password" minLength={10} required className={fieldClass} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? copy.creating : copy.createAccount}
      </Button>
      <Link href="/portal/login" className="text-center text-sm font-medium text-accent">
        {copy.alreadyAccount}
      </Link>
    </form>
  );
}

export function VerifyForm({ email, resent = false, copy }: { email: string; resent?: boolean; copy: AuthCopy }) {
  const [state, action, pending] = useActionState(submitVerify, idleForm);
  const [resend, resendAction, resending] = useActionState(submitResendCode, idleForm);
  const [emailValue, setEmailValue] = useState(email);
  return (
    <div className="grid gap-4">
      {resent ? <Notice message={copy.resentNotice} tone="ok" /> : null}
      <form action={action} className="grid gap-4">
        <Notice message={state.message} />
        <Field label={copy.email}>
          <input
            name="email"
            type="email"
            value={emailValue}
            onChange={(event) => setEmailValue(event.target.value)}
            required
            className={fieldClass}
          />
        </Field>
        <Field label={copy.code}>
          <input name="code" inputMode="numeric" pattern="\d{6}" maxLength={6} required className={`${fieldClass} tracking-[0.4em]`} />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? copy.checking : copy.verify}
        </Button>
      </form>
      <form action={resendAction} className="grid gap-2">
        <input type="hidden" name="email" value={emailValue} />
        <Notice message={resend.message} tone={resend.status === "success" ? "ok" : "error"} />
        <button type="submit" disabled={resending || !emailValue} className="text-sm font-medium text-accent disabled:opacity-60">
          {resending ? copy.sending : copy.sendAgain}
        </button>
      </form>
    </div>
  );
}

export function ForgotForm({ copy }: { copy: AuthCopy }) {
  const [state, action, pending] = useActionState(submitForgot, idleForm);
  return (
    <form action={action} className="grid gap-4">
      <Notice message={state.message} />
      <Field label={copy.email}>
        <input name="email" type="email" required className={fieldClass} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? copy.sending : copy.sendReset}
      </Button>
    </form>
  );
}

export function ResetForm({ email, copy }: { email: string; copy: AuthCopy }) {
  const [state, action, pending] = useActionState(submitReset, idleForm);
  return (
    <form action={action} className="grid gap-4">
      <Notice message={state.message} />
      <Field label={copy.email}>
        <input name="email" type="email" defaultValue={email} required className={fieldClass} />
      </Field>
      <Field label={copy.code}>
        <input name="code" inputMode="numeric" maxLength={6} required className={`${fieldClass} tracking-[0.4em]`} />
      </Field>
      <Field label={copy.newPassword}>
        <input name="password" type="password" minLength={10} required className={fieldClass} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? copy.updating : copy.updatePassword}
      </Button>
    </form>
  );
}
