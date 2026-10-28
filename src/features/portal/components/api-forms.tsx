"use client";

import { useActionState } from "react";
import { FilePicker } from "./loader";
import { Button } from "@/components/ui/button";
import {
  addHandoverItem,
  addInspectionItem,
  addOrganizationMember,
  completeInspection,
  createAgreement,
  createOrganization,
  createSupportTicket,
  deactivateAccount,
  editChatMessage,
  generateRent,
  payBill,
  sendPhoneCode,
  submitBillProof,
  submitRentProof,
  deleteProperty,
  transferProperty,
  updateProperty,
  uploadDocument,
  uploadPropertyMedia,
  uploadRepairFile,
  verifyPhoneCode,
} from "@/features/portal/actions";
import { propertyTypeOptions } from "@/features/portal/nav";
import { idleForm, type NamedRecord } from "@/features/portal/types";
import { Field, Notice, fieldClass } from "./ui";

const fileAccept = "image/jpeg,image/png,image/webp,application/pdf,audio/mpeg,audio/mp4,audio/wav,audio/webm,video/mp4,video/webm";

export function RentProofForm({ id, remaining }: { id: string; remaining?: string }) {
  const [state, action, pending] = useActionState(submitRentProof, idleForm);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="id" value={id} />
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <Field label="Amount on the receipt">
        <input name="amount" defaultValue={remaining} required className={fieldClass} />
      </Field>
      <Field label="Receipt photo, PDF, or clip">
        <FilePicker name="file" accept={fileAccept} required />
      </Field>
      <Button type="submit" disabled={pending}>{pending ? "Uploading…" : "Submit proof"}</Button>
    </form>
  );
}

export function BillProofForm({ id, amount }: { id: string; amount?: string }) {
  const [state, action, pending] = useActionState(submitBillProof, idleForm);
  return (
    <form action={action} className="mt-4 grid gap-3">
      <input type="hidden" name="id" value={id} />
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <Field label="Amount">
        <input name="amount" defaultValue={amount} required className={fieldClass} />
      </Field>
      <FilePicker name="file" accept={fileAccept} required />
      <Button type="submit" disabled={pending}>{pending ? "Uploading…" : "Upload bill proof"}</Button>
    </form>
  );
}

export function BillPayForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(payBill, idleForm);
  return (
    <form action={action} className="mt-4 grid gap-3">
      <input type="hidden" name="id" value={id} />
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <p className="text-sm text-muted">This opens a payment intent and settles it in the sandbox. A live charge waits for the provider webhook.</p>
      <Button type="submit" disabled={pending}>{pending ? "Paying…" : "Pay this bill"}</Button>
    </form>
  );
}

export function RepairFileForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(uploadRepairFile, idleForm);
  return (
    <form action={action} className="mt-4 grid gap-3">
      <input type="hidden" name="id" value={id} />
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <Field label="Photo, video, or voice note">
        <FilePicker name="file" accept={fileAccept} required />
      </Field>
      <Button type="submit" disabled={pending}>{pending ? "Uploading…" : "Add attachment"}</Button>
    </form>
  );
}

export function DocumentForm({ properties }: { properties: NamedRecord[] }) {
  const [state, action, pending] = useActionState(uploadDocument, idleForm);
  return (
    <form action={action} className="mt-4 grid gap-3">
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <Field label="Property">
        <select name="propertyId" required className={fieldClass} defaultValue="">
          <option value="" disabled>Choose a property</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>{String(property.visibleCode ?? "")} {String(property.name ?? property.id)}</option>
          ))}
        </select>
      </Field>
      <Field label="Title">
        <input name="title" required className={fieldClass} />
      </Field>
      <Field label="Category">
        <input name="category" defaultValue="AGREEMENT" className={fieldClass} />
      </Field>
      <Field label="Expires">
        <input name="expiresAt" type="date" className={fieldClass} />
      </Field>
      <FilePicker name="file" accept={fileAccept} required />
      <Button type="submit" disabled={pending}>{pending ? "Uploading…" : "Upload document"}</Button>
    </form>
  );
}

export function PropertyMediaForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(uploadPropertyMedia, idleForm);
  return (
    <form action={action} className="form-stack mt-4 grid gap-3">
      <input type="hidden" name="id" value={id} />
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <Field label="Kind">
        <select name="kind" className={fieldClass} defaultValue="PHOTO">
          <option value="PHOTO">Photo</option>
          <option value="DOCUMENT">Document</option>
        </select>
      </Field>
      <FilePicker name="file" accept={fileAccept} required />
      <Button type="submit" disabled={pending}>{pending ? "Uploading…" : "Add media"}</Button>
    </form>
  );
}

export function PropertyEditForm({ property }: { property: NamedRecord }) {
  const [state, action, pending] = useActionState(updateProperty, idleForm);
  return (
    <form action={action} className="mt-6 grid gap-3">
      <h2 className="text-lg font-semibold text-navy">Edit property</h2>
      <input type="hidden" name="id" value={property.id} />
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <Field label="Type">
        <select name="propertyType" className={fieldClass} defaultValue={String(property.propertyType ?? "APT")}>
          {propertyTypeOptions.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
        </select>
      </Field>
      <Field label="Name"><input name="name" required defaultValue={String(property.name ?? "")} className={fieldClass} /></Field>
      <input type="hidden" name="countryId" value={String(property.countryId ?? "")} />
      <Field label="Address"><input name="addressLine" required defaultValue={String(property.addressLine ?? "")} className={fieldClass} /></Field>
      <Field label="Area"><input name="area" defaultValue={String(property.area ?? "")} className={fieldClass} /></Field>
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save property"}</Button>
    </form>
  );
}

export function DeletePropertyForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deleteProperty, idleForm);
  return (
    <form action={action} className="mt-6 grid gap-3">
      <h2 className="text-lg font-semibold text-navy">Delete property</h2>
      <p className="text-sm text-muted">The property leaves your list. An active tenancy must be ended first. Type DELETE to confirm.</p>
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <input type="hidden" name="id" value={id} />
      <Field label="Confirm">
        <input name="confirm" required className={fieldClass} placeholder="DELETE" />
      </Field>
      <Button type="submit" variant="secondary" disabled={pending}>{pending ? "Deleting…" : "Delete property"}</Button>
    </form>
  );
}

export function TransferForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(transferProperty, idleForm);
  return (
    <form action={action} className="mt-6 grid gap-3">
      <h2 className="text-lg font-semibold text-navy">Transfer ownership</h2>
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <input type="hidden" name="id" value={id} />
      <Field label="New owner user id">
        <input name="newOwnerUserId" required className={fieldClass} />
      </Field>
      <Button type="submit" variant="secondary" disabled={pending}>{pending ? "Transferring…" : "Transfer"}</Button>
    </form>
  );
}

export function AgreementCreateForm({ tenancies }: { tenancies: NamedRecord[] }) {
  const [state, action, pending] = useActionState(createAgreement, idleForm);
  return (
    <form action={action} className="mb-8 grid gap-3">
      <h2 className="text-lg font-semibold text-navy">New agreement</h2>
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <Field label="Tenancy">
        <select name="tenancyId" required className={fieldClass} defaultValue="">
          <option value="" disabled>Choose a tenancy</option>
          {tenancies.map((tenancy) => (
            <option key={tenancy.id} value={tenancy.id}>{String(tenancy.status ?? "Tenancy")} · {String(tenancy.startDate ?? tenancy.id)}</option>
          ))}
        </select>
      </Field>
      <Field label="Start"><input name="startDate" type="date" required className={fieldClass} /></Field>
      <Field label="Expiry"><input name="expiryDate" type="date" required className={fieldClass} /></Field>
      <Field label="Monthly rent"><input name="monthlyRent" required className={fieldClass} /></Field>
      <Field label="Security deposit"><input name="securityDeposit" defaultValue="0" className={fieldClass} /></Field>
      <Field label="Rent due day (1–28)"><input name="rentDueDay" type="number" min={1} max={28} defaultValue={5} className={fieldClass} /></Field>
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Create agreement"}</Button>
    </form>
  );
}

export function RentGenerateForm({ tenancies }: { tenancies: NamedRecord[] }) {
  const [state, action, pending] = useActionState(generateRent, idleForm);
  return (
    <form action={action} className="mb-6 grid gap-3">
      <h2 className="text-lg font-semibold text-navy">Generate a schedule</h2>
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <Field label="Tenancy">
        <select name="tenancyId" required className={fieldClass} defaultValue="">
          <option value="" disabled>Choose a tenancy</option>
          {tenancies.map((tenancy) => <option key={tenancy.id} value={tenancy.id}>{String(tenancy.startDate ?? tenancy.id)}</option>)}
        </select>
      </Field>
      <Field label="From"><input name="from" type="date" required className={fieldClass} /></Field>
      <Field label="To"><input name="to" type="date" required className={fieldClass} /></Field>
      <Button type="submit" variant="secondary" disabled={pending}>{pending ? "Generating…" : "Generate rent"}</Button>
    </form>
  );
}

export function InspectionExtraForms({ inspections }: { inspections: NamedRecord[] }) {
  const [itemState, addItem, adding] = useActionState(addInspectionItem, idleForm);
  const [doneState, complete, completing] = useActionState(completeInspection, idleForm);
  return (
    <div className="mt-6 grid gap-8">
      <form action={addItem} className="grid gap-3">
        <h2 className="text-lg font-semibold text-navy">Add an item</h2>
        <Notice message={itemState.message} tone={itemState.status === "success" ? "ok" : "error"} />
        <InspectionSelect inspections={inspections} />
        <Field label="Label"><input name="label" required className={fieldClass} /></Field>
        <Field label="Note"><input name="valueText" className={fieldClass} /></Field>
        <Button type="submit" disabled={adding}>{adding ? "Saving…" : "Add item"}</Button>
      </form>
      <form action={complete} className="grid gap-3">
        <h2 className="text-lg font-semibold text-navy">Complete</h2>
        <Notice message={doneState.message} tone={doneState.status === "success" ? "ok" : "error"} />
        <InspectionSelect inspections={inspections} />
        <Field label="General condition"><input name="generalCondition" required className={fieldClass} /></Field>
        <Field label="Comments"><input name="comments" className={fieldClass} /></Field>
        <Button type="submit" disabled={completing}>{completing ? "Saving…" : "Mark complete"}</Button>
      </form>
    </div>
  );
}

export function HandoverItemForm({ handovers }: { handovers: NamedRecord[] }) {
  const [state, action, pending] = useActionState(addHandoverItem, idleForm);
  return (
    <form action={action} className="mt-6 grid gap-3">
      <h2 className="text-lg font-semibold text-navy">Meter or condition</h2>
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <Field label="Handover">
        <select name="id" required className={fieldClass} defaultValue="">
          <option value="" disabled>Choose a handover</option>
          {handovers.map((row) => <option key={row.id} value={row.id}>{String(row.type ?? row.status ?? row.id)}</option>)}
        </select>
      </Field>
      <Field label="Label"><input name="label" required placeholder="Electricity meter" className={fieldClass} /></Field>
      <Field label="Reading"><input name="numericValue" className={fieldClass} /></Field>
      <Field label="Unit"><input name="unit" placeholder="kWh" className={fieldClass} /></Field>
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Add item"}</Button>
    </form>
  );
}

export function ChatEditForm({ id, body }: { id: string; body: string }) {
  const [state, action, pending] = useActionState(editChatMessage, idleForm);
  return (
    <form action={action} className="mt-2 flex gap-2">
      <input type="hidden" name="id" value={id} />
      <input name="body" defaultValue={body} className="h-10 flex-1 rounded-2xl border border-line px-3 text-sm" />
      <button className="text-sm font-semibold text-accent" disabled={pending}>{pending ? "…" : "Edit"}</button>
      {state.message ? <span className="sr-only">{state.message}</span> : null}
    </form>
  );
}

export function SupportForm() {
  const [state, action, pending] = useActionState(createSupportTicket, idleForm);
  return (
    <form action={action} className="grid gap-3">
      <Notice message={state.message} tone={state.status === "success" ? "ok" : "error"} />
      <Field label="Subject"><input name="subject" required minLength={3} className={fieldClass} /></Field>
      <Field label="What happened"><textarea name="body" required minLength={3} className={`${fieldClass} h-28 py-3`} /></Field>
      <Button type="submit" disabled={pending}>{pending ? "Sending…" : "Open ticket"}</Button>
    </form>
  );
}

export function OrganizationForms({ organizations }: { organizations: NamedRecord[] }) {
  const [createState, create, creating] = useActionState(createOrganization, idleForm);
  const [memberState, addMember, adding] = useActionState(addOrganizationMember, idleForm);
  return (
    <div className="grid gap-8">
      <form action={create} className="grid gap-3">
        <Notice message={createState.message} tone={createState.status === "success" ? "ok" : "error"} />
        <Field label="Name"><input name="name" required className={fieldClass} /></Field>
        <Field label="Email"><input name="email" type="email" className={fieldClass} /></Field>
        <Field label="Phone"><input name="phone" className={fieldClass} /></Field>
        <Field label="Address"><input name="addressLine" className={fieldClass} /></Field>
        <Button type="submit" disabled={creating}>{creating ? "Saving…" : "Create organization"}</Button>
      </form>
      {organizations.length ? (
        <form action={addMember} className="grid gap-3">
          <h2 className="text-lg font-semibold text-navy">Add a member</h2>
          <Notice message={memberState.message} tone={memberState.status === "success" ? "ok" : "error"} />
          <Field label="Organization">
            <select name="id" required className={fieldClass} defaultValue={organizations[0]?.id}>
              {organizations.map((organization) => <option key={organization.id} value={organization.id}>{String(organization.name ?? organization.id)}</option>)}
            </select>
          </Field>
          <Field label="User id"><input name="userId" required className={fieldClass} /></Field>
          <Field label="Role">
            <select name="memberRole" className={fieldClass} defaultValue="MEMBER">
              {["OWNER", "ADMIN", "MEMBER", "BILLING"].map((role) => <option key={role}>{role}</option>)}
            </select>
          </Field>
          <Button type="submit" variant="secondary" disabled={adding}>{adding ? "Adding…" : "Add member"}</Button>
        </form>
      ) : null}
    </div>
  );
}

export function PhoneForms() {
  const [sendState, send, sending] = useActionState(sendPhoneCode, idleForm);
  const [verifyState, verify, verifying] = useActionState(verifyPhoneCode, idleForm);
  return (
    <div className="mt-8 grid gap-6">
      <form action={send} className="grid gap-3">
        <h2 className="text-lg font-semibold text-navy">Phone verification</h2>
        <Notice message={sendState.message} tone={sendState.status === "success" ? "ok" : "error"} />
        <Field label="Phone"><input name="phone" required className={fieldClass} /></Field>
        <Button type="submit" variant="secondary" disabled={sending}>{sending ? "Sending…" : "Send code"}</Button>
      </form>
      <form action={verify} className="grid gap-3">
        <Notice message={verifyState.message} tone={verifyState.status === "success" ? "ok" : "error"} />
        <Field label="Same phone"><input name="phone" required className={fieldClass} /></Field>
        <Field label="6-digit code"><input name="code" inputMode="numeric" maxLength={6} required className={fieldClass} /></Field>
        <Button type="submit" disabled={verifying}>{verifying ? "Checking…" : "Verify phone"}</Button>
      </form>
    </div>
  );
}

export function DeactivateForm() {
  const [state, action, pending] = useActionState(deactivateAccount, idleForm);
  return (
    <form action={action} className="mt-8 grid gap-3">
      <h2 className="text-lg font-semibold text-navy">Deactivate account</h2>
      <Notice message={state.message} />
      <Field label="Type DEACTIVATE">
        <input name="confirm" className={fieldClass} />
      </Field>
      <Button type="submit" variant="secondary" disabled={pending}>{pending ? "Closing…" : "Deactivate"}</Button>
    </form>
  );
}

function InspectionSelect({ inspections }: { inspections: NamedRecord[] }) {
  return (
    <Field label="Inspection">
      <select name="id" required className={fieldClass} defaultValue="">
        <option value="" disabled>Choose an inspection</option>
        {inspections.map((row) => <option key={row.id} value={row.id}>{String(row.scheduledAt ?? row.id)}</option>)}
      </select>
    </Field>
  );
}
