"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminCall } from "./api";
import { clearAdminSession, readMfaChallenge, storeAdminSession, storeMfaChallenge } from "./session";
import type { AdminSessionPayload, FormState, LoginChallenge, LoginState, UserStatus } from "./types";
import { userStatuses } from "./types";

const idleLogin: LoginState = { step: "credentials", status: "idle", message: "" };

export async function submitAdminLogin(previous: LoginState, formData: FormData): Promise<LoginState> {
  const intent = String(formData.get("intent") ?? "");
  if (intent === "restart") return restartAdminLogin();
  if (intent === "mfa" || previous.step === "mfa") return confirmAdminMfa(previous, formData);
  return startAdminLogin(previous, formData);
}

async function startAdminLogin(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { step: "credentials", status: "error", message: "Enter your email and password." };
  }

  const result = await adminCall<LoginChallenge>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  if (!result.ok) {
    return { step: "credentials", status: "error", message: result.message };
  }

  if ("mfaSetupRequired" in result.data && result.data.mfaSetupRequired) {
    await storeMfaChallenge(result.data.setupToken, result.data.otpauthUrl);
    return {
      step: "mfa",
      status: "idle",
      message: "Add this account in your authenticator app, then enter the 6-digit code.",
      otpauthUrl: result.data.otpauthUrl,
    };
  }

  if ("mfaRequired" in result.data && result.data.mfaRequired) {
    await storeMfaChallenge(result.data.mfaToken);
    return {
      step: "mfa",
      status: "idle",
      message: "Enter the 6-digit code from your authenticator app.",
    };
  }

  return { step: "credentials", status: "error", message: "The admin API did not start a sign-in." };
}

async function confirmAdminMfa(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const code = String(formData.get("code") ?? "").trim();
  const challenge = await readMfaChallenge();
  if (!challenge.token) {
    return { ...idleLogin, status: "error", message: "Sign in again. The verification step expired." };
  }
  if (!/^\d{6}$/.test(code)) {
    return {
      step: "mfa",
      status: "error",
      message: "Enter the 6-digit code.",
      otpauthUrl: challenge.otpauthUrl,
    };
  }

  const result = await adminCall<AdminSessionPayload>("/auth/mfa", {
    method: "POST",
    body: { token: challenge.token, code },
    auth: false,
  });
  if (!result.ok) {
    return {
      step: "mfa",
      status: "error",
      message: result.message,
      otpauthUrl: challenge.otpauthUrl,
    };
  }

  await storeAdminSession(result.data.accessToken, result.data.admin);
  redirect("/admin");
}

async function restartAdminLogin(): Promise<LoginState> {
  await clearAdminSession();
  return idleLogin;
}

export async function signOutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function updateUserStatus(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!id || !userStatuses.includes(status as UserStatus)) {
    return { status: "error", message: "Choose a valid status." };
  }
  if (reason.length < 3) {
    return { status: "error", message: "Add a reason of at least 3 characters." };
  }

  const result = await adminCall(`/users/${id}/status`, {
    method: "PATCH",
    body: { status, reason },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/admin/users");
  return { status: "success", message: "User status updated." };
}

export async function updateSetting(_previous: FormState, formData: FormData): Promise<FormState> {
  const key = String(formData.get("key") ?? "").trim();
  const raw = String(formData.get("value") ?? "").trim();
  if (!key) return { status: "error", message: "Enter a setting key." };
  if (!raw) return { status: "error", message: "Enter a setting value." };

  const result = await adminCall("/settings", {
    method: "PATCH",
    body: { key, value: parseSettingValue(raw) },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/admin/settings");
  return { status: "success", message: "Setting updated." };
}

function parseSettingValue(raw: string): string | number | boolean {
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  return raw;
}
