"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FilePicker, ProfilePhoto } from "@/features/portal/components/loader";
import { portalLanguages } from "@/features/portal/i18n";
import {
  addExpense,
  addInsurance,
  adjustRent,
  askAssistant,
  assignManager,
  createBill,
  createProperty,
  createRepair,
  createTenancyInvite,
  recordRentPayment,
  renewAgreement,
  saveHandover,
  saveInspection,
  sendChat,
  settleDeposit,
  updateReminders,
  updateSettings,
} from "@/features/portal/actions";
import { propertyTypeOptions } from "@/features/portal/nav";
import { idleForm, type NamedRecord, type PortalProfile } from "@/features/portal/types";
import { Field, Notice, fieldClass } from "./ui";

export function PropertyForm({
  countries,
  cities,
  units,
  currencies,
  organizations,
  pakistanId,
}: {
  countries: NamedRecord[];
  cities: NamedRecord[];
  units: NamedRecord[];
  currencies: NamedRecord[];
  organizations: NamedRecord[];
  pakistanId?: string;
}) {
  const [state, action, pending] = useActionState(createProperty, idleForm);
  const [countryId, setCountryId] = useState(pakistanId ?? "");
  const [cityRows, setCityRows] = useState(cities);
  useEffect(() => {
    if (!countryId) return;
    let cancelled = false;
    fetch(`/portal/geo/cities?countryId=${countryId}`)
      .then((response) => response.json())
      .then((payload: { data?: NamedRecord[] }) => {
        if (!cancelled) setCityRows(Array.isArray(payload.data) ? payload.data : []);
      })
      .catch(() => {
        if (!cancelled) setCityRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [countryId]);
  return (
    <form action={action} className="grid gap-4">
      <Notice message={state.message} />
      <Field label="Property type">
        <select name="propertyType" className={fieldClass} defaultValue="APT">
          {propertyTypeOptions.map((type) => (
            <option key={type.value} value={type.value}>
              {type.value} · {type.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Name">
        <input name="name" required placeholder="DHA Phase 5" className={fieldClass} />
      </Field>
      <Field label="Country">
        <select name="countryId" required className={fieldClass} value={countryId} onChange={(event) => setCountryId(event.target.value)}>
          <option value="" disabled>
            Choose a country
          </option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {String(country.name ?? country.code ?? country.id)}
            </option>
          ))}
        </select>
      </Field>
      {countryId ? (
        <Field label="City">
          <select name="cityId" className={fieldClass} defaultValue="">
            <option value="">Optional</option>
            {cityRows.map((city) => (
              <option key={city.id} value={city.id}>
                {String(city.name ?? city.id)}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
      <Field label="Area">
        <input name="area" placeholder="DHA, Gulberg, Blue Area" className={fieldClass} />
      </Field>
      <Field label="Address">
        <input name="addressLine" required className={fieldClass} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Size">
          <input name="sizeValue" inputMode="decimal" className={fieldClass} />
        </Field>
        <Field label="Unit">
          <select name="measurementUnitCode" className={fieldClass} defaultValue="">
            <option value="">Optional</option>
            {units.map((unit) => (
              <option key={String(unit.code ?? unit.id)} value={String(unit.code ?? unit.id)}>
                {String(unit.name ?? unit.code ?? unit.id)}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Currency">
        <select name="currencyCode" className={fieldClass} defaultValue="PKR">
          {(currencies.length ? currencies : [{ id: "PKR", code: "PKR", name: "Pakistani Rupee" }]).map((currency) => (
            <option key={String(currency.code ?? currency.id)} value={String(currency.code ?? currency.id)}>
              {String(currency.code ?? currency.name ?? currency.id)}
            </option>
          ))}
        </select>
      </Field>
      {organizations.length ? (
        <Field label="Organization">
          <select name="organizationId" className={fieldClass} defaultValue="">
            <option value="">Personal property</option>
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {String(organization.name ?? organization.id)}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
      <label className="flex items-center gap-2 text-sm text-navy">
        <input name="tenantInsuranceRequired" type="checkbox" />
        Tenant insurance required
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add property"}
      </Button>
    </form>
  );
}

export function InviteForm({ properties }: { properties: NamedRecord[] }) {
  const [state, action, pending] = useActionState(createTenancyInvite, idleForm);
  return (
    <form action={action} className="grid gap-4">
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <PropertySelect properties={properties} />
      <Field label="Start date">
        <input name="startDate" type="date" required className={fieldClass} />
      </Field>
      <Field label="End date">
        <input name="endDate" type="date" className={fieldClass} />
      </Field>
      <Field label="Tenant email">
        <input name="email" type="email" className={fieldClass} placeholder="Existing or new tenant" />
      </Field>
      <Field label="Or phone">
        <input name="phone" className={fieldClass} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send invitation"}
      </Button>
    </form>
  );
}

export function BillForm({ properties, providers }: { properties: NamedRecord[]; providers: NamedRecord[] }) {
  const [state, action, pending] = useActionState(createBill, idleForm);
  return (
    <div className="grid gap-8">
      <form action={action} className="grid gap-4">
        <h2 className="text-lg font-semibold text-navy">Fetch a bill</h2>
        <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
        <PropertySelect properties={properties} />
        <Field label="Provider">
          <select name="providerId" className={fieldClass} defaultValue="">
            <option value="">Choose a provider</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {String(provider.name ?? provider.id)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Consumer number">
          <input name="consumerNumber" className={fieldClass} />
        </Field>
        <Button type="submit" name="intent" value="fetch" variant="secondary" disabled={pending}>
          Fetch bill
        </Button>
      </form>
      <form action={action} className="grid gap-4">
        <h2 className="text-lg font-semibold text-navy">Or enter it yourself</h2>
        <PropertySelect properties={properties} />
        <Field label="Category">
          <select name="category" className={fieldClass} defaultValue="ELECTRICITY">
            {["ELECTRICITY", "GAS", "WATER", "INTERNET", "MAINTENANCE", "TAX", "CHALLAN", "OTHER"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Amount">
          <input name="amount" inputMode="decimal" required className={fieldClass} />
        </Field>
        <Field label="Due date">
          <input name="dueDate" type="date" className={fieldClass} />
        </Field>
        <Field label="Who pays">
          <select name="responsibilityMode" className={fieldClass} defaultValue="TENANT">
            {["TENANT", "OWNER", "MANAGER", "SHARED"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Button type="submit" name="intent" value="manual" disabled={pending}>
          {pending ? "Saving…" : "Save bill"}
        </Button>
      </form>
    </div>
  );
}

export function RepairForm({ properties }: { properties: NamedRecord[] }) {
  const [state, action, pending] = useActionState(createRepair, idleForm);
  return (
    <form action={action} className="grid gap-4">
      <Notice message={state.message} />
      <PropertySelect properties={properties} />
      <Field label="Category">
        <input name="category" defaultValue="Plumbing" className={fieldClass} />
      </Field>
      <Field label="What needs repair">
        <textarea name="description" required className={`${fieldClass} h-28 py-3`} />
      </Field>
      <Field label="Priority">
        <select name="priority" className={fieldClass} defaultValue="NORMAL">
          <option>LOW</option>
          <option>NORMAL</option>
          <option>HIGH</option>
        </select>
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Report issue"}
      </Button>
    </form>
  );
}

export function PaymentForm({ id, remaining }: { id: string; remaining?: string }) {
  const [state, action, pending] = useActionState(recordRentPayment, idleForm);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="id" value={id} />
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <Field label="Amount">
        <input name="amount" defaultValue={remaining} required className={fieldClass} />
      </Field>
      <Field label="Method">
        <input name="method" defaultValue="BANK_TRANSFER" className={fieldClass} />
      </Field>
      <Field label="Reference">
        <input name="reference" className={fieldClass} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Record payment"}
      </Button>
    </form>
  );
}

export function SettingsForm({
  profile,
  phone,
  language = "en",
  avatarSrc,
  displayName = "",
  currentAddress = "",
  emergencyContactName = "",
  emergencyContactPhone = "",
}: {
  profile: PortalProfile;
  phone?: string;
  language?: string;
  avatarSrc?: string | null;
  displayName?: string;
  currentAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}) {
  const [state, action, pending] = useActionState(updateSettings, idleForm);
  const name = `${profile.firstName} ${profile.lastName}`.trim();
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="activeRole" value={profile.activeRole} />
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <div className="flex items-center gap-4">
        <ProfilePhoto name={name} src={avatarSrc} large />
        <div>
          <p className="font-semibold text-navy">{name}</p>
          <p className="text-sm text-muted">{profile.email}</p>
        </div>
      </div>
      <Field label="Profile photo">
        <FilePicker name="file" accept="image/jpeg,image/png,image/webp" />
      </Field>
      <Field label="First name">
        <input name="firstName" defaultValue={profile.firstName} required className={fieldClass} />
      </Field>
      <Field label="Last name">
        <input name="lastName" defaultValue={profile.lastName} required className={fieldClass} />
      </Field>
      <Field label="Phone">
        <input name="phone" defaultValue={phone} className={fieldClass} />
      </Field>
      <Field label="Display name">
        <input name="displayName" defaultValue={displayName} className={fieldClass} />
      </Field>
      {profile.activeRole === "TENANT" ? (
        <>
          <Field label="Current address">
            <input name="currentAddress" defaultValue={currentAddress} className={fieldClass} />
          </Field>
          <Field label="Emergency contact">
            <input name="emergencyContactName" defaultValue={emergencyContactName} className={fieldClass} />
          </Field>
          <Field label="Emergency phone">
            <input name="emergencyContactPhone" defaultValue={emergencyContactPhone} className={fieldClass} />
          </Field>
        </>
      ) : null}
      <Field label="Language">
        <select name="preferredLanguage" defaultValue={language} className={fieldClass}>
          {portalLanguages.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}

export function ReminderForm({ preferences }: { preferences: NamedRecord | null }) {
  const [state, action, pending] = useActionState(updateReminders, idleForm);
  return (
    <form action={action} className="grid gap-4">
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <Check name="emailEnabled" label="Email" defaultChecked={preferences?.emailEnabled !== false} />
      <Check name="pushEnabled" label="Push" defaultChecked={Boolean(preferences?.pushEnabled)} />
      <Check name="smsEnabled" label="SMS" defaultChecked={Boolean(preferences?.smsEnabled)} />
      <Check name="autoRemind" label="Automatic reminders" defaultChecked={preferences?.autoRemind !== false} />
      <Field label="Rent reminder, days before">
        <input name="rentReminderDays" type="number" min={0} max={30} defaultValue={String(preferences?.rentReminderDays ?? 3)} className={fieldClass} />
      </Field>
      <Field label="Bill reminder, days before">
        <input name="billReminderDays" type="number" min={0} max={30} defaultValue={String(preferences?.billReminderDays ?? 3)} className={fieldClass} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save reminders"}
      </Button>
    </form>
  );
}

export function ExpenseForm({ properties }: { properties: NamedRecord[] }) {
  const [state, action, pending] = useActionState(addExpense, idleForm);
  return (
    <form action={action} className="mt-4 grid gap-4">
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <PropertySelect properties={properties} />
      <Field label="Category">
        <input name="category" defaultValue="REPAIR" className={fieldClass} />
      </Field>
      <Field label="Amount">
        <input name="amount" required className={fieldClass} />
      </Field>
      <Field label="Date">
        <input name="incurredOn" type="date" required className={fieldClass} />
      </Field>
      <Field label="Note">
        <input name="note" className={fieldClass} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add expense"}
      </Button>
    </form>
  );
}

export function InsuranceForm({ properties }: { properties: NamedRecord[] }) {
  const [state, action, pending] = useActionState(addInsurance, idleForm);
  return (
    <form action={action} className="grid gap-4">
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <PropertySelect properties={properties} />
      <Field label="Holder">
        <select name="holderRole" className={fieldClass} defaultValue="TENANT">
          <option>TENANT</option>
          <option>OWNER</option>
        </select>
      </Field>
      <Field label="Provider">
        <input name="providerName" required className={fieldClass} />
      </Field>
      <Field label="Policy number">
        <input name="policyNumber" required className={fieldClass} />
      </Field>
      <Field label="Start">
        <input name="startDate" type="date" required className={fieldClass} />
      </Field>
      <Field label="End">
        <input name="endDate" type="date" required className={fieldClass} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save insurance"}
      </Button>
    </form>
  );
}

export function ManagerForm({ properties }: { properties: NamedRecord[] }) {
  const [state, action, pending] = useActionState(assignManager, idleForm);
  return (
    <form action={action} className="grid gap-4">
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <PropertySelect properties={properties} />
      <Field label="Manager email">
        <input name="email" type="email" required className={fieldClass} />
      </Field>
      <Field label="Assigned by">
        <select name="side" className={fieldClass} defaultValue="OWNER">
          <option value="OWNER">Owner</option>
          <option value="TENANT">Tenant</option>
        </select>
      </Field>
      <fieldset className="grid gap-2 text-sm text-navy">
        <legend className="font-medium">Permissions</legend>
        {["PROPERTY_VIEW", "RENT_VIEW", "BILL_VIEW", "MAINTENANCE_CREATE", "INSPECTION_MANAGE", "CHAT", "DOCUMENT_VIEW"].map((permission) => (
          <label key={permission} className="flex items-center gap-2">
            <input type="checkbox" name="permissions" value={permission} defaultChecked={permission === "PROPERTY_VIEW"} />
            {permission.replaceAll("_", " ").toLowerCase()}
          </label>
        ))}
      </fieldset>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Assign manager"}
      </Button>
    </form>
  );
}

export function AgreementForms({ agreements }: { agreements: NamedRecord[] }) {
  const [renewState, renew, renewing] = useActionState(renewAgreement, idleForm);
  const [adjustState, adjust, adjusting] = useActionState(adjustRent, idleForm);
  return (
    <div className="grid gap-8">
      <form action={renew} className="grid gap-4">
        <h2 className="text-lg font-semibold text-navy">Renew</h2>
        <Notice message={renewState.message} tone={renewState.status === "success" ? "ok" : "error"} />
        <AgreementSelect agreements={agreements} />
        <Field label="Term">
          <select name="years" className={fieldClass} defaultValue="1">
            {Array.from({ length: 30 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1} year{index ? "s" : ""}
              </option>
            ))}
            <option value="custom">Custom end date</option>
          </select>
        </Field>
        <Field label="Custom end date">
          <input name="customEndDate" type="date" className={fieldClass} />
        </Field>
        <Button type="submit" disabled={renewing}>
          {renewing ? "Renewing…" : "Renew agreement"}
        </Button>
      </form>
      <form action={adjust} className="grid gap-4">
        <h2 className="text-lg font-semibold text-navy">Early rent increase</h2>
        <Notice message={adjustState.message} tone={adjustState.status === "success" ? "ok" : "error"} />
        <AgreementSelect agreements={agreements} />
        <Field label="New monthly rent">
          <input name="monthlyRent" required className={fieldClass} />
        </Field>
        <Field label="Effective date">
          <input name="effectiveDate" type="date" required className={fieldClass} />
        </Field>
        <Field label="Reason">
          <input name="reason" required className={fieldClass} />
        </Field>
        <Button type="submit" variant="secondary" disabled={adjusting}>
          {adjusting ? "Saving…" : "Record increase"}
        </Button>
      </form>
    </div>
  );
}

export function AssistantForm() {
  const [state, action, pending] = useActionState(askAssistant, idleForm);
  return (
    <form action={action} className="grid gap-4">
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <Field label="Ask about a property you can read">
        <textarea name="question" required className={`${fieldClass} h-28 py-3`} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Asking…" : "Ask"}
      </Button>
    </form>
  );
}

export function ChatForm({ threadId }: { threadId: string }) {
  const [state, action, pending] = useActionState(sendChat, idleForm);
  return (
    <form action={action} className="mt-4 grid gap-3">
      <input type="hidden" name="threadId" value={threadId} />
      <Notice message={state.message} />
      <Field label="Message">
        <input name="body" required className={fieldClass} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send"}
      </Button>
    </form>
  );
}

export function InspectionForm({ properties }: { properties: NamedRecord[] }) {
  const [state, action, pending] = useActionState(saveInspection, idleForm);
  return (
    <form action={action} className="mt-4 grid gap-4">
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <PropertySelect properties={properties} />
      <Field label="Scheduled at">
        <input name="scheduledAt" type="datetime-local" required className={fieldClass} />
      </Field>
      <Field label="Notes">
        <textarea name="notes" className={`${fieldClass} h-24 py-3`} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Schedule inspection"}
      </Button>
    </form>
  );
}

export function HandoverForm({ tenancies }: { tenancies: NamedRecord[] }) {
  const [state, action, pending] = useActionState(saveHandover, idleForm);
  return (
    <form action={action} className="mt-4 grid gap-4">
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <TenancySelect tenancies={tenancies} />
      <Field label="Record">
        <select name="kind" className={fieldClass} defaultValue="MOVE_IN">
          <option value="MOVE_IN">Move-in</option>
          <option value="MOVE_OUT">Move-out</option>
        </select>
      </Field>
      <Field label="Condition">
        <textarea name="notes" className={`${fieldClass} h-24 py-3`} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save handover"}
      </Button>
    </form>
  );
}

export function DepositForm({ tenancies }: { tenancies: NamedRecord[] }) {
  const [state, action, pending] = useActionState(settleDeposit, idleForm);
  return (
    <form action={action} className="mt-4 grid gap-4">
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <TenancySelect tenancies={tenancies} />
      <Field label="Deposit received">
        <input name="depositReceived" required className={fieldClass} />
      </Field>
      <Field label="Approved deductions">
        <input name="deductions" defaultValue="0" className={fieldClass} />
      </Field>
      <Field label="Reason">
        <input name="notes" className={fieldClass} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Settle deposit"}
      </Button>
    </form>
  );
}

function PropertySelect({ properties }: { properties: NamedRecord[] }) {
  return (
    <Field label="Property">
      <select name="propertyId" required className={fieldClass} defaultValue="">
        <option value="" disabled>
          Choose a property
        </option>
        {properties.map((property) => (
          <option key={property.id} value={property.id}>
            {String(property.visibleCode ?? "")} {String(property.name ?? property.id)}
          </option>
        ))}
      </select>
    </Field>
  );
}

function TenancySelect({ tenancies }: { tenancies: NamedRecord[] }) {
  return (
    <Field label="Tenancy">
      <select name="tenancyId" required className={fieldClass} defaultValue="">
        <option value="" disabled>
          Choose a tenancy
        </option>
        {tenancies.map((tenancy) => (
          <option key={tenancy.id} value={tenancy.id}>
            {String(tenancy.id)}
          </option>
        ))}
      </select>
    </Field>
  );
}

function AgreementSelect({ agreements }: { agreements: NamedRecord[] }) {
  return (
    <Field label="Agreement">
      <select name="id" required className={fieldClass} defaultValue="">
        <option value="" disabled>
          Choose an agreement
        </option>
        {agreements.map((agreement) => (
          <option key={agreement.id} value={agreement.id}>
            {String(agreement.id)} · {String(agreement.status ?? "")}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-navy">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}
