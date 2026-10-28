"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { portalCall } from "./api";
import {
  clearPortalSession,
  readOnboarding,
  readPortalProfile,
  storePortalSession,
  storePreference,
  updatePortalProfile,
} from "./session";
import { authCopy, normalizeLanguage } from "./i18n";
import type { FormState, PortalRole, SessionPayload } from "./types";
import { idleForm } from "./types";

export async function chooseLanguage(_previous: FormState, formData: FormData): Promise<FormState> {
  const language = String(formData.get("language") ?? "en");
  await storePreference("language", language);
  redirect("/portal/role");
}

export async function chooseRole(_previous: FormState, formData: FormData): Promise<FormState> {
  const role = String(formData.get("role") ?? "");
  if (!isRole(role)) return { status: "error", message: (await messages()).roleError };
  await storePreference("role", role);
  redirect("/portal/account");
}

export async function chooseAccount(_previous: FormState, formData: FormData): Promise<FormState> {
  const account = String(formData.get("account") ?? "");
  if (account !== "INDIVIDUAL" && account !== "BUSINESS") {
    return { status: "error", message: (await messages()).accountError };
  }
  await storePreference("account", account);
  redirect("/portal/signup");
}

export async function submitSignup(_previous: FormState, formData: FormData): Promise<FormState> {
  const firstName = text(formData, "firstName");
  const lastName = text(formData, "lastName");
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const phone = text(formData, "phone");
  if (!firstName || !lastName || !email || password.length < 10) {
    return { status: "error", message: (await messages()).signupInvalid };
  }
  const onboarding = await readOnboarding();
  const result = await portalCall<{ userId: string }>("/auth/register", {
    method: "POST",
    auth: false,
    body: {
      email,
      password,
      firstName,
      lastName,
      phone: phone || undefined,
      preferredLanguage: onboarding.language,
      timezone: "Asia/Karachi",
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  redirect(`/portal/verify?email=${encodeURIComponent(email)}`);
}

export async function submitVerify(_previous: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email").toLowerCase();
  const code = text(formData, "code");
  if (!email || code.length !== 6) return { status: "error", message: (await messages()).verifyInvalid };
  const result = await portalCall<SessionPayload>("/auth/verify-email", {
    method: "POST",
    auth: false,
    body: { email, code },
  });
  if (!result.ok) return { status: "error", message: result.message };
  await finishSignIn(result.data);
  redirect("/portal/home");
}

export async function submitResendCode(_previous: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email").toLowerCase();
  const copy = await messages();
  if (!email) return { status: "error", message: copy.forgotInvalid };
  const result = await portalCall("/auth/resend-verification", { method: "POST", auth: false, body: { email } });
  if (!result.ok) return { status: "error", message: result.message };
  return { status: "success", message: copy.resendOk };
}

export async function submitLogin(_previous: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { status: "error", message: (await messages()).loginInvalid };
  const result = await portalCall<SessionPayload>("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password, deviceName: "Web portal", platform: "web" },
  });
  if (!result.ok) {
    if (/verify your email/i.test(result.message)) {
      redirect(`/portal/verify?email=${encodeURIComponent(email)}&resent=1`);
    }
    return { status: "error", message: result.message };
  }
  await finishSignIn(result.data);
  redirect("/portal/home");
}

export async function submitForgot(_previous: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email").toLowerCase();
  if (!email) return { status: "error", message: (await messages()).forgotInvalid };
  const result = await portalCall("/auth/forgot-password", { method: "POST", auth: false, body: { email } });
  if (!result.ok) return { status: "error", message: result.message };
  redirect(`/portal/reset?email=${encodeURIComponent(email)}`);
}

export async function submitReset(_previous: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email").toLowerCase();
  const code = text(formData, "code");
  const password = String(formData.get("password") ?? "");
  if (!email || code.length !== 6 || password.length < 10) {
    return { status: "error", message: (await messages()).resetInvalid };
  }
  const result = await portalCall("/auth/reset-password", {
    method: "POST",
    auth: false,
    body: { email, code, password },
  });
  if (!result.ok) return { status: "error", message: result.message };
  redirect("/portal/login?reset=1");
}

export async function switchRole(formData: FormData) {
  const role = String(formData.get("role") ?? "");
  if (!isRole(role)) return;
  const profile = await readPortalProfile();
  if (!profile) redirect("/portal/login");
  if (!profile.roles.includes(role)) {
    await portalCall("/users/me/roles", { method: "POST", body: { role } });
  }
  const result = await portalCall("/auth/active-role", { method: "POST", body: { role } });
  if (!result.ok) return;
  const roles = profile.roles.includes(role) ? profile.roles : [...profile.roles, role];
  await updatePortalProfile({ ...profile, roles, activeRole: role });
  await applyAccountCategory(role);
  redirect("/portal/home");
}

export async function signOut() {
  await portalCall("/auth/logout", { method: "POST", body: {}, onUnauthorized: "return" });
  await clearPortalSession();
  redirect("/portal/login");
}

export async function updateSettings(_previous: FormState, formData: FormData): Promise<FormState> {
  const profile = await readPortalProfile();
  const body = new FormData();
  body.set("firstName", text(formData, "firstName"));
  body.set("lastName", text(formData, "lastName"));
  body.set("phone", text(formData, "phone"));
  body.set("preferredLanguage", text(formData, "preferredLanguage") || "en");
  body.set("timezone", "Asia/Karachi");
  const displayName = text(formData, "displayName");
  if (displayName) body.set("displayName", displayName);
  if (profile?.activeRole === "TENANT") {
    const address = text(formData, "currentAddress");
    const contact = text(formData, "emergencyContactName");
    const contactPhone = text(formData, "emergencyContactPhone");
    if (address) body.set("currentAddress", address);
    if (contact) body.set("emergencyContactName", contact);
    if (contactPhone) body.set("emergencyContactPhone", contactPhone);
  }
  const file = formData.get("file");
  const hasPhoto = file instanceof Blob && file.size > 0;
  if (hasPhoto) body.set("file", file, file instanceof File && file.name ? file.name : "profile.jpg");
  const result = await portalCall("/users/me", { method: "PATCH", form: body });
  if (!result.ok) return { status: "error", message: result.message };
  const language = text(formData, "preferredLanguage");
  if (language) await storePreference("language", language);
  if (profile) {
    await updatePortalProfile({
      ...profile,
      firstName: text(formData, "firstName") || profile.firstName,
      lastName: text(formData, "lastName") || profile.lastName,
      avatarStamp: hasPhoto ? String(Date.now()) : profile.avatarStamp,
    });
  }
  revalidatePath("/portal", "layout");
  revalidatePath("/portal/settings");
  revalidatePath("/portal/home");
  return { status: "success", message: "Settings saved." };
}

export async function updateReminders(_previous: FormState, formData: FormData): Promise<FormState> {
  const result = await portalCall("/notifications/preferences", {
    method: "PATCH",
    body: {
      emailEnabled: formData.get("emailEnabled") === "on",
      pushEnabled: formData.get("pushEnabled") === "on",
      smsEnabled: formData.get("smsEnabled") === "on",
      inAppEnabled: true,
      autoRemind: formData.get("autoRemind") === "on",
      rentReminderDays: numberOr(formData, "rentReminderDays", 3),
      billReminderDays: numberOr(formData, "billReminderDays", 3),
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/reminders");
  return { status: "success", message: "Reminder settings saved." };
}

export async function createProperty(_previous: FormState, formData: FormData): Promise<FormState> {
  const result = await portalCall<{ id: string }>("/properties", {
    method: "POST",
    body: {
      name: text(formData, "name"),
      propertyType: text(formData, "propertyType"),
      countryId: text(formData, "countryId"),
      cityId: text(formData, "cityId") || undefined,
      area: text(formData, "area") || undefined,
      addressLine: text(formData, "addressLine"),
      sizeValue: text(formData, "sizeValue") || undefined,
      measurementUnitCode: text(formData, "measurementUnitCode") || undefined,
      currencyCode: text(formData, "currencyCode") || "PKR",
      timezone: "Asia/Karachi",
      organizationId: text(formData, "organizationId") || undefined,
      tenantInsuranceRequired: formData.get("tenantInsuranceRequired") === "on",
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/properties");
  redirect(`/portal/properties/${result.data.id}`);
}

export async function createTenancyInvite(_previous: FormState, formData: FormData): Promise<FormState> {
  const created = await portalCall<{ id: string }>("/tenancies", {
    method: "POST",
    body: {
      propertyId: text(formData, "propertyId"),
      startDate: text(formData, "startDate"),
      endDate: text(formData, "endDate") || undefined,
      currencyCode: "PKR",
    },
  });
  if (!created.ok) return { status: "error", message: created.message };
  const invite = await portalCall<{ url?: string }>(`/tenancies/${created.data.id}/invitations`, {
    method: "POST",
    body: { email: text(formData, "email") || undefined, phone: text(formData, "phone") || undefined },
  });
  if (!invite.ok) return { status: "error", message: invite.message };
  revalidatePath("/portal/invitations");
  const token = invite.data.url?.split("/").filter(Boolean).pop();
  const link = token ? `/portal/invite/${token}` : "";
  return {
    status: "success",
    message: link
      ? `Invitation ready. Share ${link}. An expired or used invite cannot be accepted again.`
      : "Invitation sent. The tenant accepts before the agreement becomes active.",
  };
}

export async function respondToInvite(formData: FormData) {
  const token = text(formData, "token");
  const accept = formData.get("intent") !== "decline";
  const result = await portalCall(accept ? "/invitations/accept" : "/invitations/decline", {
    method: "POST",
    body: { token },
  });
  if (!result.ok) redirect(`/portal/invite/${encodeURIComponent(token)}?error=${encodeURIComponent(result.message)}`);
  redirect(accept ? "/portal/home" : "/portal/invitations");
}

export async function remindRent(formData: FormData) {
  const id = text(formData, "id");
  await portalCall(`/rent/obligations/${id}/remind`, { method: "POST", body: {} });
  revalidatePath(`/portal/rent/${id}`);
}

export async function decideProof(formData: FormData) {
  const id = text(formData, "proofId");
  const obligationId = text(formData, "obligationId");
  const approve = formData.get("intent") === "approve";
  const notes = text(formData, "notes");
  if (!approve && !notes) return;
  await portalCall(`/rent/proofs/${id}/${approve ? "approve" : "reject"}`, {
    method: "POST",
    body: { notes: notes || undefined },
  });
  revalidatePath(`/portal/rent/${obligationId}`);
}

export async function recordRentPayment(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  const result = await portalCall(`/rent/obligations/${id}/payments`, {
    method: "POST",
    body: {
      amount: text(formData, "amount"),
      method: text(formData, "method") || "BANK_TRANSFER",
      reference: text(formData, "reference") || undefined,
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath(`/portal/rent/${id}`);
  return { status: "success", message: "Payment recorded." };
}

export async function createBill(_previous: FormState, formData: FormData): Promise<FormState> {
  const intent = String(formData.get("intent") ?? "manual");
  if (intent === "fetch") {
    const result = await portalCall("/bills/fetch", {
      method: "POST",
      body: {
        propertyId: text(formData, "propertyId"),
        providerId: text(formData, "providerId"),
        consumerNumber: text(formData, "consumerNumber"),
      },
    });
    if (!result.ok) return { status: "error", message: result.message };
    revalidatePath("/portal/bills");
    return { status: "success", message: "Bill fetch requested. Review the extracted bill before anyone pays it." };
  }
  const result = await portalCall<{ id: string }>("/bills", {
    method: "POST",
    body: {
      propertyId: text(formData, "propertyId"),
      category: text(formData, "category"),
      amount: text(formData, "amount"),
      currencyCode: "PKR",
      consumerNumber: text(formData, "consumerNumber") || undefined,
      dueDate: text(formData, "dueDate") || undefined,
      responsibilityMode: text(formData, "responsibilityMode") || "TENANT",
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/bills");
  redirect(`/portal/bills/${result.data.id}`);
}

export async function createRepair(_previous: FormState, formData: FormData): Promise<FormState> {
  const result = await portalCall<{ id: string }>("/maintenance", {
    method: "POST",
    body: {
      propertyId: text(formData, "propertyId"),
      description: text(formData, "description"),
      category: text(formData, "category") || "GENERAL",
      priority: text(formData, "priority") || "NORMAL",
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/repairs");
  redirect(`/portal/repairs/${result.data.id}`);
}

export async function transitionRepair(formData: FormData) {
  const id = text(formData, "id");
  await portalCall(`/maintenance/${id}/status`, {
    method: "POST",
    body: { status: text(formData, "status"), note: text(formData, "note") || undefined },
  });
  revalidatePath(`/portal/repairs/${id}`);
}

export async function sendChat(_previous: FormState, formData: FormData): Promise<FormState> {
  const threadId = text(formData, "threadId");
  const result = await portalCall(`/chat/threads/${threadId}/messages`, {
    method: "POST",
    body: { body: text(formData, "body") },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/chat");
  return idleForm;
}

export async function addExpense(_previous: FormState, formData: FormData): Promise<FormState> {
  const result = await portalCall("/finances/expenses", {
    method: "POST",
    body: {
      propertyId: text(formData, "propertyId"),
      amount: text(formData, "amount"),
      category: text(formData, "category") || "OTHER",
      currencyCode: "PKR",
      incurredOn: text(formData, "incurredOn"),
      description: text(formData, "note") || undefined,
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/accounts");
  return { status: "success", message: "Expense added." };
}

export async function addInsurance(_previous: FormState, formData: FormData): Promise<FormState> {
  const result = await portalCall("/insurance", {
    method: "POST",
    body: {
      holderRole: text(formData, "holderRole") || "TENANT",
      propertyId: text(formData, "propertyId"),
      providerName: text(formData, "providerName"),
      policyNumber: text(formData, "policyNumber"),
      startDate: text(formData, "startDate"),
      endDate: text(formData, "endDate"),
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/insurance");
  return { status: "success", message: "Insurance saved. Expiry reminders use the policy end date." };
}

export async function assignManager(_previous: FormState, formData: FormData): Promise<FormState> {
  const permissions = formData.getAll("permissions").map(String).filter(Boolean);
  const result = await portalCall("/managers/assignments", {
    method: "POST",
    body: {
      managerEmail: text(formData, "email"),
      side: text(formData, "side") || "OWNER",
      propertyIds: [text(formData, "propertyId")],
      permissions: permissions.length ? permissions : ["PROPERTY_VIEW", "RENT_VIEW", "MAINTENANCE_CREATE", "CHAT"],
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/managers");
  return { status: "success", message: "Manager assignment sent." };
}

export async function renewAgreement(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  const years = text(formData, "years");
  const result = await portalCall(`/agreements/${id}/renew`, {
    method: "POST",
    body: years === "custom" ? { customEndDate: text(formData, "customEndDate") } : { years: Number(years || 1) },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/agreements");
  return { status: "success", message: "Agreement renewed. The previous term stays in the history." };
}

export async function adjustRent(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  const result = await portalCall(`/agreements/${id}/rent-adjustment`, {
    method: "POST",
    body: {
      monthlyRent: text(formData, "monthlyRent"),
      effectiveDate: text(formData, "effectiveDate"),
      reason: text(formData, "reason"),
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/agreements");
  return { status: "success", message: "Rent adjustment recorded." };
}

export async function askAssistant(_previous: FormState, formData: FormData): Promise<FormState> {
  const result = await portalCall<{ answer?: string | null; note?: string }>("/ai/ask", {
    method: "POST",
    body: { question: text(formData, "question") },
  });
  if (!result.ok) return { status: "error", message: result.message };
  return {
    status: "success",
    message: result.data.answer || result.data.note || "The assistant stayed inside the properties you can read.",
  };
}

export async function saveInspection(_previous: FormState, formData: FormData): Promise<FormState> {
  const result = await portalCall("/inspections", {
    method: "POST",
    body: {
      propertyId: text(formData, "propertyId"),
      tenancyId: text(formData, "tenancyId") || undefined,
      scheduledAt: toIso(text(formData, "scheduledAt")),
      comments: text(formData, "notes") || undefined,
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/inspections");
  return { status: "success", message: "Inspection saved." };
}

export async function saveHandover(_previous: FormState, formData: FormData): Promise<FormState> {
  const result = await portalCall("/handovers", {
    method: "POST",
    body: {
      tenancyId: text(formData, "tenancyId"),
      type: text(formData, "kind") || "MOVE_OUT",
      conditionSummary: text(formData, "notes") || undefined,
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/handover");
  return { status: "success", message: "Handover record saved." };
}

export async function settleDeposit(_previous: FormState, formData: FormData): Promise<FormState> {
  const tenancyId = text(formData, "tenancyId");
  const result = await portalCall(`/tenancies/${tenancyId}/deposit-settlement`, {
    method: "POST",
    body: {
      depositReceived: text(formData, "depositReceived"),
      approvedDeductions: text(formData, "deductions") || "0",
      deductionReason: text(formData, "notes") || undefined,
      currencyCode: "PKR",
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/deposit");
  return { status: "success", message: "Deposit settlement recorded." };
}

export async function submitRentProof(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  const result = await upload(`/rent/obligations/${id}/proofs`, formData, { amount: text(formData, "amount") });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath(`/portal/rent/${id}`);
  return { status: "success", message: "Proof submitted. The owner reviews it before it counts as paid." };
}

export async function submitBillProof(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  const result = await upload(`/bills/${id}/proofs`, formData, { amount: text(formData, "amount") });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath(`/portal/bills/${id}`);
  return { status: "success", message: "Bill proof submitted." };
}

export async function decideBillProof(formData: FormData) {
  const id = text(formData, "proofId");
  const billId = text(formData, "billId");
  const approve = formData.get("intent") === "approve";
  const notes = text(formData, "notes");
  if (!approve && !notes) return;
  await portalCall(`/bills/proofs/${id}/${approve ? "approve" : "reject"}`, {
    method: "POST",
    body: { notes: notes || undefined },
  });
  revalidatePath(`/portal/bills/${billId}`);
}

export async function payBill(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  const intent = await portalCall<{ id: string }>("/payments/intents", {
    method: "POST",
    body: { billId: id, idempotencyKey: crypto.randomUUID() },
  });
  if (!intent.ok) return { status: "error", message: intent.message };
  const settled = await portalCall(`/payments/sandbox/settle/${intent.data.id}`, { method: "POST", body: {} });
  if (!settled.ok) return { status: "error", message: settled.message };
  revalidatePath(`/portal/bills/${id}`);
  return { status: "success", message: "Sandbox payment settled. A live gateway still needs a verified webhook." };
}

export async function uploadRepairFile(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  const result = await upload(`/maintenance/${id}/attachments`, formData);
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath(`/portal/repairs/${id}`);
  return { status: "success", message: "Attachment stored." };
}

export async function uploadDocument(_previous: FormState, formData: FormData): Promise<FormState> {
  const result = await upload("/documents", formData, {
    propertyId: text(formData, "propertyId"),
    category: text(formData, "category") || "GENERAL",
    title: text(formData, "title"),
    expiresAt: text(formData, "expiresAt") || undefined,
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/documents");
  return { status: "success", message: "Document stored." };
}

export async function extractDocument(formData: FormData) {
  const id = text(formData, "id");
  await portalCall("/ai/extract", { method: "POST", body: { documentId: id } });
  revalidatePath("/portal/documents");
}

export async function uploadPropertyMedia(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  const result = await upload(`/properties/${id}/media`, formData, { kind: text(formData, "kind") || "PHOTO" });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath(`/portal/properties/${id}`);
  return { status: "success", message: "Photo stored." };
}

export async function updateProperty(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  const result = await portalCall(`/properties/${id}`, {
    method: "PATCH",
    body: {
      name: text(formData, "name"),
      propertyType: text(formData, "propertyType"),
      countryId: text(formData, "countryId"),
      cityId: text(formData, "cityId") || undefined,
      area: text(formData, "area") || undefined,
      addressLine: text(formData, "addressLine"),
      sizeValue: text(formData, "sizeValue") || undefined,
      measurementUnitCode: text(formData, "measurementUnitCode") || undefined,
      currencyCode: text(formData, "currencyCode") || "PKR",
      timezone: "Asia/Karachi",
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath(`/portal/properties/${id}`);
  return { status: "success", message: "Property updated." };
}

export async function deleteProperty(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  if (text(formData, "confirm") !== "DELETE") {
    return { status: "error", message: "Type DELETE to remove this property." };
  }
  const result = await portalCall(`/properties/${id}`, { method: "DELETE" });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/properties");
  redirect("/portal/properties");
}

export async function transferProperty(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  const result = await portalCall(`/properties/${id}/transfer`, {
    method: "POST",
    body: { newOwnerUserId: text(formData, "newOwnerUserId") },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/properties");
  return { status: "success", message: "Ownership transferred. The previous owner stays in the history." };
}

export async function createAgreement(_previous: FormState, formData: FormData): Promise<FormState> {
  const tenancyId = text(formData, "tenancyId");
  const result = await portalCall(`/tenancies/${tenancyId}/agreements`, {
    method: "POST",
    body: {
      startDate: text(formData, "startDate"),
      expiryDate: text(formData, "expiryDate"),
      monthlyRent: text(formData, "monthlyRent"),
      currencyCode: "PKR",
      securityDeposit: text(formData, "securityDeposit") || "0",
      rentDueDay: Number(text(formData, "rentDueDay") || 5),
      renewalTerms: text(formData, "renewalTerms") || undefined,
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/agreements");
  return { status: "success", message: "Agreement created. The previous version stays in the history when you renew." };
}

export async function generateRent(_previous: FormState, formData: FormData): Promise<FormState> {
  const result = await portalCall("/rent/obligations/generate", {
    method: "POST",
    body: {
      tenancyId: text(formData, "tenancyId"),
      from: text(formData, "from"),
      to: text(formData, "to"),
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/rent");
  return { status: "success", message: "Rent schedule generated from the active agreement." };
}

export async function changeTenancy(formData: FormData) {
  const id = text(formData, "id");
  const intent = text(formData, "intent");
  const path =
    intent === "terminate" ? "terminate" : intent === "complete" ? "complete" : "activate";
  await portalCall(`/tenancies/${id}/${path}`, { method: "POST", body: {} });
  revalidatePath("/portal/invitations");
  revalidatePath("/portal/properties");
}

export async function addInspectionItem(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  const result = await portalCall(`/inspections/${id}/items`, {
    method: "POST",
    body: {
      kind: text(formData, "kind") || "NOTE",
      label: text(formData, "label"),
      valueText: text(formData, "valueText") || undefined,
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/inspections");
  return { status: "success", message: "Inspection item added." };
}

export async function completeInspection(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  const result = await portalCall(`/inspections/${id}/complete`, {
    method: "POST",
    body: {
      generalCondition: text(formData, "generalCondition"),
      comments: text(formData, "comments") || undefined,
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/inspections");
  return { status: "success", message: "Inspection completed." };
}

export async function addHandoverItem(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  const result = await portalCall(`/handovers/${id}/items`, {
    method: "POST",
    body: {
      kind: text(formData, "kind") || "METER",
      label: text(formData, "label"),
      valueText: text(formData, "valueText") || undefined,
      numericValue: text(formData, "numericValue") || undefined,
      unit: text(formData, "unit") || undefined,
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/handover");
  return { status: "success", message: "Handover item added." };
}

export async function confirmHandover(formData: FormData) {
  const id = text(formData, "id");
  await portalCall(`/handovers/${id}/confirm`, { method: "POST", body: {} });
  revalidatePath("/portal/handover");
}

export async function respondAssignment(formData: FormData) {
  const id = text(formData, "id");
  const intent = text(formData, "intent");
  const path = intent === "accept" ? "accept" : intent === "decline" ? "decline" : "revoke";
  await portalCall(`/managers/assignments/${id}/${path}`, { method: "POST", body: {} });
  revalidatePath("/portal/managers");
}

export async function markNotificationRead(formData: FormData) {
  await portalCall(`/notifications/${text(formData, "id")}/read`, { method: "PATCH" });
  revalidatePath("/portal/notifications");
}

export async function markChatRead(formData: FormData) {
  await portalCall(`/chat/messages/${text(formData, "id")}/read`, { method: "POST", body: {} });
  revalidatePath("/portal/chat");
}

export async function editChatMessage(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  const result = await portalCall(`/chat/messages/${id}`, {
    method: "PATCH",
    body: { body: text(formData, "body") },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/chat");
  return idleForm;
}

export async function deleteChatMessage(formData: FormData) {
  await portalCall(`/chat/messages/${text(formData, "id")}`, { method: "DELETE" });
  revalidatePath("/portal/chat");
}

export async function recalculateSubscription() {
  await portalCall("/subscriptions/recalculate", { method: "POST", body: {} });
  revalidatePath("/portal/subscription");
}

export async function openSubscriptionInvoice() {
  await portalCall("/subscriptions/invoices", { method: "POST", body: {} });
  revalidatePath("/portal/subscription");
}

export async function createSupportTicket(_previous: FormState, formData: FormData): Promise<FormState> {
  const result = await portalCall("/support/tickets", {
    method: "POST",
    body: { subject: text(formData, "subject"), body: text(formData, "body") },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/support");
  return { status: "success", message: "Support ticket opened." };
}

export async function createOrganization(_previous: FormState, formData: FormData): Promise<FormState> {
  const result = await portalCall("/organizations", {
    method: "POST",
    body: {
      name: text(formData, "name"),
      organizationType: text(formData, "organizationType") || "BUSINESS",
      email: text(formData, "email") || undefined,
      phone: text(formData, "phone") || undefined,
      addressLine: text(formData, "addressLine") || undefined,
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/organization");
  return { status: "success", message: "Organization created." };
}

export async function addOrganizationMember(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  const result = await portalCall(`/organizations/${id}/members`, {
    method: "POST",
    body: { userId: text(formData, "userId"), memberRole: text(formData, "memberRole") || "MEMBER" },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/organization");
  return { status: "success", message: "Member added." };
}

export async function sendPhoneCode(_previous: FormState, formData: FormData): Promise<FormState> {
  const result = await portalCall<{ reason?: string; sent?: boolean }>("/auth/phone/send", {
    method: "POST",
    body: { phone: text(formData, "phone") },
  });
  if (!result.ok) return { status: "error", message: result.message };
  if (result.data.sent === false) {
    return { status: "error", message: result.data.reason === "SMS_NOT_CONFIGURED" ? "SMS is not configured, so the code was not delivered." : "The phone code was not delivered." };
  }
  return { status: "success", message: "Verification code sent." };
}

export async function verifyPhoneCode(_previous: FormState, formData: FormData): Promise<FormState> {
  const result = await portalCall("/auth/phone/verify", {
    method: "POST",
    body: { phone: text(formData, "phone"), code: text(formData, "code") },
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/portal/settings");
  return { status: "success", message: "Phone verified." };
}

export async function revokeSession(formData: FormData) {
  await portalCall(`/auth/sessions/${text(formData, "id")}`, { method: "DELETE" });
  revalidatePath("/portal/settings");
}

export async function logoutAll() {
  await portalCall("/auth/logout-all", { method: "POST", body: {}, onUnauthorized: "return" });
  await clearPortalSession();
  redirect("/portal/login");
}

export async function deactivateAccount(_previous: FormState, formData: FormData): Promise<FormState> {
  if (text(formData, "confirm") !== "DEACTIVATE") {
    return { status: "error", message: "Type DEACTIVATE to confirm." };
  }
  const result = await portalCall("/users/me/deactivate", { method: "POST", body: {} });
  if (!result.ok) return { status: "error", message: result.message };
  await clearPortalSession();
  redirect("/portal/login");
}

async function finishSignIn(session: SessionPayload) {
  const savedLanguage = normalizeLanguage(session.user.preferredLanguage);
  if (savedLanguage) await storePreference("language", savedLanguage);
  const onboarding = await readOnboarding();
  const roles = session.roles ?? [];
  await storePortalSession({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user: session.user,
    roles,
    activeRole: session.user.preferredPortalRole ?? onboarding.role ?? roles[0],
  });
  const role = onboarding.role;
  if (role && !roles.includes(role)) {
    await portalCall("/users/me/roles", { method: "POST", body: { role } });
  }
  const active = role ?? session.user.preferredPortalRole ?? roles[0];
  if (active && isRole(active)) {
    await portalCall("/auth/active-role", { method: "POST", body: { role: active } });
    const profile = await readPortalProfile();
    if (profile) {
      const nextRoles = profile.roles.includes(active) ? profile.roles : [...profile.roles, active];
      await updatePortalProfile({ ...profile, roles: nextRoles, activeRole: active });
    }
    await applyAccountCategory(active);
  }
}

async function applyAccountCategory(role: PortalRole) {
  const onboarding = await readOnboarding();
  if (!onboarding.account || role === "MANAGER") return;
  const path = role === "TENANT" ? "/users/me/tenant-profile" : "/users/me/owner-profile";
  if (onboarding.account === "BUSINESS" && role === "OWNER") {
    const me = await portalCall<{ ownerProfile?: { organizationId?: string | null } }>("/users/me");
    let organizationId = me.ok ? me.data.ownerProfile?.organizationId ?? undefined : undefined;
    if (!organizationId) {
      const profile = await readPortalProfile();
      const org = await portalCall<{ id: string }>("/organizations", {
        method: "POST",
        body: { name: `${profile?.firstName ?? "Owner"} organization`, organizationType: "BUSINESS" },
      });
      if (!org.ok) return;
      organizationId = org.data.id;
    }
    await portalCall(path, { method: "PATCH", body: { category: "BUSINESS", organizationId } });
    return;
  }
  await portalCall(path, { method: "PATCH", body: { category: onboarding.account } });
}

async function upload(path: string, formData: FormData, fields: Record<string, string | undefined> = {}) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, status: 400, message: "Choose a file. Photos, PDF, audio, and video are accepted." };
  }
  const body = new FormData();
  body.append("file", file, file.name);
  for (const [key, value] of Object.entries(fields)) {
    if (value) body.append(key, value);
  }
  return portalCall(path, { method: "POST", form: body });
}

function toIso(value: string) {
  if (!value) return value;
  if (value.length === 16) return `${value}:00.000Z`;
  return value;
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberOr(formData: FormData, key: string, fallback: number) {
  const value = Number(text(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

async function messages() {
  const { language } = await readOnboarding();
  return authCopy(language);
}

function isRole(value: string): value is PortalRole {
  return value === "OWNER" || value === "TENANT" || value === "MANAGER";
}
