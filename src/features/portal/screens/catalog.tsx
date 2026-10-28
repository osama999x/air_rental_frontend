import Link from "next/link";
import { connection } from "next/server";
import {
  changeTenancy,
  confirmHandover,
  decideBillProof,
  decideProof,
  deleteChatMessage,
  extractDocument,
  logoutAll,
  markChatRead,
  markNotificationRead,
  openSubscriptionInvoice,
  recalculateSubscription,
  remindRent,
  respondAssignment,
  revokeSession,
  signOut,
  transitionRepair,
} from "@/features/portal/actions";
import { asList, portalCall } from "@/features/portal/api";
import { PortalIcon } from "@/features/portal/components/icons";
import { linksFor } from "@/features/portal/nav";
import { portalCopy } from "@/features/portal/portal-copy";
import { readOnboarding } from "@/features/portal/session";
import type { NamedRecord, PortalProfile } from "@/features/portal/types";
import {
  AgreementCreateForm,
  BillPayForm,
  BillProofForm,
  ChatEditForm,
  DeactivateForm,
  DocumentForm,
  HandoverItemForm,
  InspectionExtraForms,
  OrganizationForms,
  PhoneForms,
  DeletePropertyForm,
  PropertyEditForm,
  PropertyMediaForm,
  RentGenerateForm,
  RentProofForm,
  RepairFileForm,
  SupportForm,
  TransferForm,
} from "../components/api-forms";
import {
  AgreementForms,
  AssistantForm,
  BillForm,
  ChatForm,
  DepositForm,
  ExpenseForm,
  HandoverForm,
  InspectionForm,
  InsuranceForm,
  InviteForm,
  ManagerForm,
  PaymentForm,
  PropertyForm,
  ReminderForm,
  RepairForm,
  SettingsForm,
} from "../components/work-forms";
import { money } from "../components/home-screen";
import { PropertyPhoto } from "../components/loader";
import { BackLink, Chip, EmptyState, Notice, PageTitle, RecordLink, Screen, labelize, statusTone } from "../components/ui";

export async function PropertiesScreen() {
  const result = await portalCall<unknown>("/properties");
  const rows = asList<NamedRecord>(result.ok ? result.data : []);
  return (
    <Screen>
      <PageTitle
        kicker="PROPERTIES"
        title="Your properties"
        action={
          <Link href="/portal/properties/new" className="text-sm font-semibold text-accent">
            Add
          </Link>
        }
      />
      {!result.ok ? <Notice message={result.message} /> : null}
      {rows.length ? (
        <ul className="grid gap-3">
          {rows.map((property) => (
            <li key={property.id}>
              <RecordLink
                href={`/portal/properties/${property.id}`}
                mark={String(property.propertyType ?? property.visibleCode ?? "P")}
                title={`${property.visibleCode ?? ""} ${property.name ?? "Property"}`.trim()}
                subtitle={[placeName(property.city), placeName(property.country), property.area, property.addressLine].filter(Boolean).join(" · ")}
                status={String(property.status ?? "")}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No properties yet" body="Add a house, apartment, shop, or office. The visible code, such as APT-1, is assigned when it is saved." href="/portal/properties/new" label="Add property" />
      )}
    </Screen>
  );
}

export async function NewPropertyScreen() {
  const [countries, units, currencies, organizations] = await Promise.all([
    portalCall<unknown>("/countries", { auth: false }),
    portalCall<unknown>("/measurement-units"),
    portalCall<unknown>("/currencies"),
    portalCall<unknown>("/organizations"),
  ]);
  const countryRows = asList<NamedRecord>(countries.ok ? countries.data : []);
  const pakistan = countryRows.find(
    (country) => String(country.iso2 ?? "") === "PK" || String(country.name ?? "").toLowerCase() === "pakistan",
  );
  const cities = pakistan
    ? await portalCall<unknown>(`/countries/${pakistan.id}/cities`, { auth: false })
    : { ok: true as const, data: [] };
  return (
    <Screen>
      <BackLink href="/portal/properties" />
      <PageTitle kicker="STEP 1 OF 3" title="Add property" />
      <p className="mb-4 text-sm leading-6 text-muted">
        Choose the type, then the country, city, and local size. The permanent id stays hidden. The visible code is generated for you.
      </p>
      {!countries.ok ? <Notice message={countries.message} /> : null}
      <PropertyForm
        countries={countryRows}
        cities={asList<NamedRecord>(cities.ok ? cities.data : [])}
        units={asList<NamedRecord>(units.ok ? units.data : [])}
        currencies={asList<NamedRecord>(currencies.ok ? currencies.data : [])}
        organizations={asList<NamedRecord>(organizations.ok ? organizations.data : [])}
        pakistanId={pakistan?.id}
      />
    </Screen>
  );
}

export async function PropertyDetailScreen({ id }: { id: string }) {
  const [property, tenancies] = await Promise.all([
    portalCall<NamedRecord>(`/properties/${id}`),
    portalCall<unknown>("/tenancies"),
  ]);
  if (!property.ok) {
    return (
      <Screen>
        <BackLink href="/portal/properties" />
        <Notice message={property.message} />
      </Screen>
    );
  }
  const item = property.data;
  const related = asList<NamedRecord>(tenancies.ok ? tenancies.data : []).filter((row) => row.propertyId === id);
  return (
    <Screen>
      <BackLink href="/portal/properties" />
      <p className="text-xs font-semibold tracking-[0.16em] text-accent">{String(item.visibleCode ?? item.propertyType ?? "")}</p>
      <h1 className="mt-1 text-2xl font-semibold text-navy">{String(item.name ?? "Property")}</h1>
      <div className="mt-3">
        <Chip tone={statusTone(String(item.status ?? ""))}>{labelize(String(item.status ?? "vacant"))}</Chip>
      </div>
      <dl className="mt-5 grid gap-3 rounded-[24px] bg-white p-4 text-sm">
        <Fact label="Country" value={placeName(item.country) || "—"} />
        <Fact label="City" value={placeName(item.city) || "—"} />
        <Fact label="Address" value={String(item.addressLine ?? "")} />
        <Fact label="Area" value={String(item.area ?? item.region ?? "—")} />
        <Fact label="Size" value={[item.sizeValue, item.measurementUnitCode].filter(Boolean).join(" ") || "—"} />
        <Fact label="Insurance required" value={item.tenantInsuranceRequired ? "On" : "Off"} />
      </dl>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-semibold lg:grid-cols-4">
        <Link className="rounded-2xl bg-white px-4 py-3 text-navy" href="/portal/invitations">Invite tenant</Link>
        <Link className="rounded-2xl bg-white px-4 py-3 text-navy" href="/portal/rent">Rent</Link>
        <Link className="rounded-2xl bg-white px-4 py-3 text-navy" href="/portal/bills">Bills</Link>
        <Link className="rounded-2xl bg-white px-4 py-3 text-navy" href="/portal/repairs/new">Report a repair</Link>
      </div>
      <PropertyPhotos media={item.media} />
      <PropertyMediaForm id={id} />
      <PropertyEditForm property={item} />
      <TransferForm id={id} />
      <DeletePropertyForm id={id} />
      <h2 className="mt-6 text-lg font-semibold text-navy">Tenancies</h2>
      <ul className="mt-3 grid gap-2">
        {related.length ? related.map((tenancy) => (
          <li key={tenancy.id} className="rounded-2xl bg-white px-4 py-3 text-sm">
            <RecordLink href="/portal/agreements" mark="T" title={String(tenancy.status ?? "Tenancy")} subtitle={String(tenancy.startDate ?? tenancy.id)} status={String(tenancy.status ?? "")} />
            <TenancyButtons id={tenancy.id} />
          </li>
        )) : <li className="text-sm text-muted">No tenancy on this property yet.</li>}
      </ul>
    </Screen>
  );
}

export async function RentScreen() {
  await connection();
  const [rent, properties, tenancies] = await Promise.all([
    portalCall<unknown>("/rent/obligations"),
    portalCall<unknown>("/properties"),
    portalCall<unknown>("/tenancies"),
  ]);
  const propertiesById = new Map(asList<NamedRecord>(properties.ok ? properties.data : []).map((item) => [item.id, item]));
  const rows = asList<NamedRecord>(rent.ok ? rent.data : []);
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = `${today.slice(0, 8)}01`;
  return (
    <Screen>
      <PageTitle
        kicker="RENT"
        title="Rent"
        action={
          <a className="text-sm font-semibold text-accent" href={`/portal/export/statement?from=${monthStart}&to=${today}&format=csv`}>
            Export
          </a>
        }
      />
      {!rent.ok ? <Notice message={rent.message} /> : null}
      <RentGenerateForm tenancies={asList(tenancies.ok ? tenancies.data : [])} />
      <div className="mb-4 flex gap-2 text-xs font-semibold">
        <a className="rounded-full bg-white px-3 py-2 text-navy" href={`/portal/export/statement?from=${monthStart}&to=${today}&format=pdf`}>PDF</a>
        <a className="rounded-full bg-white px-3 py-2 text-navy" href={`/portal/export/statement?from=${monthStart}&to=${today}&format=xls`}>Excel</a>
        <a className="rounded-full bg-white px-3 py-2 text-navy" href={`/portal/export/statement?from=${monthStart}&to=${today}&format=csv`}>CSV</a>
      </div>
      {rows.length ? (
        <ul className="grid gap-3">
          {rows.map((row) => {
            const property = propertiesById.get(String(row.propertyId));
            return (
              <li key={row.id}>
                <RecordLink
                  href={`/portal/rent/${row.id}`}
                  mark={String(property?.propertyType ?? "R")}
                  title={`${property?.visibleCode ?? ""} ${property?.name ?? "Rent"}`.trim()}
                  subtitle={`${monthName(row.periodMonth)} ${row.periodYear ?? ""} · due ${row.dueDate ?? ""}`.trim()}
                  amount={money(row.amount)}
                  status={String(row.status ?? "")}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title="No rent periods" body="Rent periods appear after a tenancy is active and a schedule is generated." />
      )}
    </Screen>
  );
}

export async function RentDetailScreen({ id, role }: { id: string; role: PortalProfile["activeRole"] }) {
  const result = await portalCall<unknown>("/rent/obligations");
  const row = asList<NamedRecord>(result.ok ? result.data : []).find((item) => item.id === id);
  if (!result.ok || !row) {
    return (
      <Screen>
        <BackLink href="/portal/rent" />
        <Notice message={result.ok ? "That rent period was not found." : result.message} />
      </Screen>
    );
  }
  const transactions = Array.isArray(row.transactions) ? (row.transactions as NamedRecord[]) : [];
  return (
    <Screen>
      <BackLink href="/portal/rent" />
      <PageTitle title="Rent transaction" kicker={`${monthName(row.periodMonth)} ${row.periodYear ?? ""}`} />
      <div className="rounded-[24px] bg-white p-4">
        <p className="text-3xl font-semibold text-navy">{money(row.amount)}</p>
        <p className="mt-1 text-sm text-muted">Remaining {money(row.remaining)} · due {String(row.dueDate ?? "")}</p>
        <div className="mt-3">
          <Chip tone={statusTone(String(row.status ?? ""))}>{labelize(String(row.status ?? ""))}</Chip>
        </div>
      </div>
      {role === "OWNER" ? (
        <form action={remindRent} className="mt-4">
          <input type="hidden" name="id" value={id} />
          <button className="h-11 rounded-full bg-accent px-5 text-sm font-medium text-white">Send reminder</button>
        </form>
      ) : null}
      <h2 className="mt-6 text-lg font-semibold text-navy">Payments and proofs</h2>
      <ul className="mt-3 grid gap-3">
        {transactions.length ? transactions.map((transaction) => {
          const proof = transaction.proof && typeof transaction.proof === "object" ? (transaction.proof as NamedRecord) : null;
          return (
            <li key={String(transaction.id)} className="rounded-[22px] bg-white p-4 text-sm">
              <p className="font-semibold text-navy">{money(String(transaction.amount ?? ""))} · {String(transaction.method ?? "")}</p>
              <p className="mt-1 text-muted">{labelize(String(transaction.status ?? ""))}</p>
              {proof && role === "OWNER" ? (
                <form action={decideProof} className="mt-3 grid gap-2">
                  <input type="hidden" name="proofId" value={String(proof.id)} />
                  <input type="hidden" name="obligationId" value={id} />
                  <input name="notes" placeholder="Note for the tenant" className="h-11 rounded-2xl border border-line px-3" />
                  <div className="flex gap-2">
                    <button name="intent" value="approve" className="h-10 rounded-full bg-accent px-4 text-white">Approve</button>
                    <button name="intent" value="reject" className="h-10 rounded-full bg-[#ffe8ea] px-4 text-[#9f1239]">Reject</button>
                  </div>
                </form>
              ) : null}
            </li>
          );
        }) : <li className="text-sm text-muted">No payment has been recorded for this period.</li>}
      </ul>
      <div className="mt-6 grid gap-6">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-navy">Upload proof</h2>
          <RentProofForm id={id} remaining={String(row.remaining ?? row.amount ?? "")} />
        </div>
        {role !== "TENANT" ? (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-navy">Record a confirmed payment</h2>
            <PaymentForm id={id} remaining={String(row.remaining ?? row.amount ?? "")} />
          </div>
        ) : null}
      </div>
    </Screen>
  );
}

export async function BillsScreen() {
  const result = await portalCall<unknown>("/bills");
  const rows = asList<NamedRecord>(result.ok ? result.data : []);
  return (
    <Screen>
      <PageTitle kicker="BILLS" title="Bills" action={<Link href="/portal/bills/new" className="text-sm font-semibold text-accent">Add</Link>} />
      {!result.ok ? <Notice message={result.message} /> : null}
      {rows.length ? (
        <ul className="grid gap-3">
          {rows.map((bill) => (
            <li key={bill.id}>
              <RecordLink
                href={`/portal/bills/${bill.id}`}
                mark={String(bill.category ?? "B")}
                title={labelize(String(bill.category ?? "Bill"))}
                subtitle={bill.dueDate ? `Due ${bill.dueDate}` : String(bill.consumerNumber ?? "")}
                amount={money(bill.amount)}
                status={String(bill.status ?? "")}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No bills" body="Fetch a utility bill or enter one. Fetching and paying stay separate." href="/portal/bills/new" label="Add a bill" />
      )}
    </Screen>
  );
}

export async function NewBillScreen() {
  const [properties, providers] = await Promise.all([
    portalCall<unknown>("/properties"),
    portalCall<unknown>("/utility-providers"),
  ]);
  return (
    <Screen>
      <BackLink href="/portal/bills" />
      <PageTitle title="Add a bill" />
      <BillForm properties={asList(properties.ok ? properties.data : [])} providers={asList(providers.ok ? providers.data : [])} />
    </Screen>
  );
}

export async function BillDetailScreen({ id, role }: { id: string; role: PortalProfile["activeRole"] }) {
  const [result, paymentStatus] = await Promise.all([
    portalCall<NamedRecord>(`/bills/${id}`),
    portalCall<{ provider?: string; live?: boolean; message?: string }>("/payments/status", { auth: false }),
  ]);
  if (!result.ok) {
    return <Screen><BackLink href="/portal/bills" /><Notice message={result.message} /></Screen>;
  }
  const bill = result.data;
  const proofs = Array.isArray(bill.proofs) ? (bill.proofs as NamedRecord[]) : [];
  return (
    <Screen>
      <BackLink href="/portal/bills" />
      <PageTitle title={labelize(String(bill.category ?? "Bill"))} />
      <div className="rounded-[24px] bg-white p-4">
        <p className="text-3xl font-semibold text-navy">{money(bill.amount)}</p>
        <p className="mt-2 text-sm text-muted">Due {String(bill.dueDate ?? "—")} · {String(bill.consumerNumber ?? "No consumer number")}</p>
        <div className="mt-3"><Chip tone={statusTone(String(bill.status ?? ""))}>{labelize(String(bill.status ?? "issued"))}</Chip></div>
      </div>
      {paymentStatus.ok ? <p className="mt-4 text-sm leading-6 text-muted">{paymentStatus.data.message}</p> : null}
      <BillPayForm id={id} />
      <h2 className="mt-6 text-lg font-semibold text-navy">Proofs</h2>
      <ul className="mt-3 grid gap-3">
        {proofs.map((proof) => (
          <li key={proof.id} className="rounded-[22px] bg-white p-4 text-sm">
            <a className="font-semibold text-accent" href={`/portal/files/bills/proofs/${proof.id}/download`}>Download proof</a>
            <p className="mt-1 text-muted">{labelize(String(proof.status ?? ""))}</p>
            {role === "OWNER" ? (
              <form action={decideBillProof} className="mt-3 grid gap-2">
                <input type="hidden" name="proofId" value={proof.id} />
                <input type="hidden" name="billId" value={id} />
                <input name="notes" placeholder="Required when rejecting" className="h-11 rounded-2xl border border-line px-3" />
                <div className="flex gap-2">
                  <button name="intent" value="approve" className="h-10 rounded-full bg-accent px-4 text-white">Approve</button>
                  <button name="intent" value="reject" className="h-10 rounded-full bg-[#ffe8ea] px-4 text-[#9f1239]">Reject</button>
                </div>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
      <BillProofForm id={id} amount={String(bill.amount ?? "")} />
    </Screen>
  );
}

export async function RepairsScreen() {
  const result = await portalCall<unknown>("/maintenance");
  const rows = asList<NamedRecord>(result.ok ? result.data : []);
  return (
    <Screen>
      <PageTitle kicker="REPAIRS" title="Repairs" action={<Link href="/portal/repairs/new" className="text-sm font-semibold text-accent">Report</Link>} />
      {!result.ok ? <Notice message={result.message} /> : null}
      {rows.length ? (
        <ul className="grid gap-3">
          {rows.map((row) => (
            <li key={row.id}>
              <RecordLink href={`/portal/repairs/${row.id}`} mark={String(row.category ?? "R")} title={String(row.description ?? "Repair").slice(0, 72)} subtitle={labelize(String(row.category ?? ""))} status={String(row.status ?? "NEW")} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No repairs" body="A tenant report moves from New to Approved, Assigned, In progress, and Completed." href="/portal/repairs/new" label="Report an issue" />
      )}
    </Screen>
  );
}

export async function NewRepairScreen() {
  const properties = await portalCall<unknown>("/properties");
  return (
    <Screen>
      <BackLink href="/portal/repairs" />
      <PageTitle title="Report an issue" />
      <RepairForm properties={asList(properties.ok ? properties.data : [])} />
    </Screen>
  );
}

export async function RepairDetailScreen({ id, role }: { id: string; role: PortalProfile["activeRole"] }) {
  const result = await portalCall<NamedRecord>(`/maintenance/${id}`);
  if (!result.ok) return <Screen><BackLink href="/portal/repairs" /><Notice message={result.message} /></Screen>;
  const item = result.data;
  const next = ["NEW", "APPROVED", "ASSIGNED", "IN_PROGRESS", "COMPLETED"];
  return (
    <Screen>
      <BackLink href="/portal/repairs" />
      <PageTitle title="Repair detail" />
      <p className="text-sm leading-6 text-navy">{String(item.description ?? "")}</p>
      <div className="mt-3"><Chip tone={statusTone(String(item.status ?? ""))}>{labelize(String(item.status ?? "NEW"))}</Chip></div>
      {Array.isArray(item.attachments) ? (
        <ul className="mt-4 grid gap-2">
          {(item.attachments as NamedRecord[]).map((file) => (
            <li key={file.id}>
              <a className="text-sm font-semibold text-accent" href={`/portal/files/maintenance/attachments/${file.id}/download`}>
                {String(file.originalName ?? "Attachment")}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      <RepairFileForm id={id} />
      {role === "OWNER" ? (
        <form action={transitionRepair} className="mt-5 grid gap-3">
          <input type="hidden" name="id" value={id} />
          <label className="grid gap-1 text-sm font-medium text-navy">
            Move to
            <select name="status" className="h-12 rounded-2xl border border-line bg-white px-3" defaultValue={String(item.status ?? "NEW")}>
              {next.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </label>
          <input name="note" placeholder="Note" className="h-12 rounded-2xl border border-line bg-white px-3" />
          <button className="h-11 rounded-full bg-accent text-sm font-medium text-white">Update status</button>
        </form>
      ) : null}
    </Screen>
  );
}

export async function MoreScreen({ profile }: { profile: PortalProfile }) {
  const { language } = await readOnboarding();
  const copy = portalCopy(language);
  return (
    <Screen>
      <PageTitle kicker={profile.activeRole} title={copy.more} />
      <ul className="grid gap-2">
        {linksFor(profile.activeRole).map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="flex items-center gap-3 rounded-[22px] bg-white px-4 py-3.5 shadow-[0_8px_24px_rgba(18,48,92,0.05)]">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e8f0ff] text-accent">
                <PortalIcon name={link.icon} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-navy">{copy.links[link.href]?.label ?? link.label}</span>
                <span className="mt-0.5 block truncate text-sm text-muted">{copy.links[link.href]?.hint ?? link.hint}</span>
              </span>
              <PortalIcon name="chevron" className="h-4 w-4 shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </Screen>
  );
}

export async function SimpleListScreen({
  title,
  kicker,
  path,
  empty,
  hrefFor,
}: {
  title: string;
  kicker: string;
  path: string;
  empty: string;
  hrefFor?: (row: NamedRecord) => string;
}) {
  const result = await portalCall<unknown>(path);
  const rows = asList<NamedRecord>(result.ok ? result.data : []);
  return (
    <Screen>
      <PageTitle kicker={kicker} title={title} />
      {!result.ok ? <Notice message={result.message} /> : null}
      {rows.length ? (
        <ul className="grid gap-3">
          {rows.map((row) => (
            <li key={row.id}>
              <RecordLink
                href={hrefFor ? hrefFor(row) : "/portal/more"}
                mark={String(row.name ?? row.title ?? row.category ?? row.status ?? "•")}
                title={String(row.name ?? row.title ?? row.description ?? row.body ?? row.question ?? row.id)}
                subtitle={String(row.status ?? row.createdAt ?? row.email ?? "")}
                status={row.status ? String(row.status) : undefined}
              />
            </li>
          ))}
        </ul>
      ) : result.ok ? <EmptyState title={`No ${title.toLowerCase()}`} body={empty} /> : null}
    </Screen>
  );
}

export async function InvitationsScreen() {
  const [tenancies, properties] = await Promise.all([portalCall<unknown>("/tenancies"), portalCall<unknown>("/properties")]);
  return (
    <Screen>
      <PageTitle kicker="TENANT" title="Invitations" />
      <p className="mb-4 text-sm leading-6 text-muted">An existing tenant and a new tenant both receive an invite. An expired or used invite cannot be accepted again.</p>
      {!tenancies.ok ? <Notice message={tenancies.message} /> : null}
      <InviteForm properties={asList(properties.ok ? properties.data : [])} />
      <ul className="mt-6 grid gap-2">
        {asList<NamedRecord>(tenancies.ok ? tenancies.data : []).map((tenancy) => (
          <li key={tenancy.id} className="rounded-2xl bg-white px-4 py-3 text-sm">
            <span className="font-semibold text-navy">{labelize(String(tenancy.status ?? "proposed"))}</span>
            <span className="mt-1 block text-muted">{String(tenancy.startDate ?? tenancy.id)}</span>
            <TenancyButtons id={tenancy.id} />
          </li>
        ))}
      </ul>
    </Screen>
  );
}

export async function AgreementsScreen() {
  const tenancies = await portalCall<unknown>("/tenancies");
  const rows = asList<NamedRecord>(tenancies.ok ? tenancies.data : []);
  const agreements: NamedRecord[] = [];
  for (const tenancy of rows.slice(0, 8)) {
    const result = await portalCall<unknown>(`/tenancies/${tenancy.id}/agreements`);
    agreements.push(...asList<NamedRecord>(result.ok ? result.data : []));
  }
  return (
    <Screen>
      <PageTitle kicker="AGREEMENT" title="Agreements" />
      {!tenancies.ok ? <Notice message={tenancies.message} /> : null}
      <AgreementCreateForm tenancies={rows} />
      <ul className="mb-6 grid gap-2">
        {agreements.map((agreement) => (
          <li key={agreement.id} className="rounded-2xl bg-white px-4 py-3 text-sm">
            <span className="font-semibold text-navy">{money(agreement.monthlyRent)} / month</span>
            <span className="mt-1 block text-muted">Ends {String(agreement.expiryDate ?? "—")} · {labelize(String(agreement.status ?? ""))}</span>
          </li>
        ))}
      </ul>
      <AgreementForms agreements={agreements} />
    </Screen>
  );
}

export async function AccountsScreen() {
  const properties = await portalCall<unknown>("/properties");
  const rows = asList<NamedRecord>(properties.ok ? properties.data : []);
  const first = rows[0];
  const summary = first ? await portalCall<NamedRecord>(`/finances/properties/${first.id}`) : null;
  return (
    <Screen>
      <PageTitle kicker="ACCOUNTS" title="Accounts" />
      {summary && !summary.ok ? <Notice message={summary.message} /> : null}
      {summary && summary.ok ? (
        <dl className="mb-4 grid gap-3 rounded-[24px] bg-white p-4 text-sm">
          <Fact label="Confirmed rent" value={money(String(summary.data.confirmedRentIncome ?? ""))} />
          <Fact label="Expenses" value={money(String(summary.data.expenses ?? ""))} />
          <Fact label="Net" value={money(String(summary.data.netIncome ?? ""))} />
          <Fact label="Formula" value={String(summary.data.formula ?? "")} />
        </dl>
      ) : null}
      <h2 className="text-lg font-semibold text-navy">Add expense</h2>
      <ExpenseForm properties={rows} />
    </Screen>
  );
}

export async function ChatScreen() {
  const tenancies = await portalCall<unknown>("/tenancies");
  const first = asList<NamedRecord>(tenancies.ok ? tenancies.data : [])[0];
  const thread = first ? await portalCall<NamedRecord>(`/chat/tenancies/${first.id}`) : null;
  const threadId = thread && thread.ok ? String((thread.data.id ?? (thread.data as { thread?: { id?: string } }).thread?.id) ?? "") : "";
  const messages = threadId ? await portalCall<unknown>(`/chat/threads/${threadId}/messages`) : null;
  return (
    <Screen>
      <PageTitle kicker="CHAT" title="Tenancy chat" />
      {!tenancies.ok ? <Notice message={tenancies.message} /> : null}
      {thread && !thread.ok ? <Notice message={thread.message} /> : null}
      {!first ? <EmptyState title="No tenancy chat" body="Chat opens once a tenancy exists." /> : null}
      <ul className="grid gap-2">
        {asList<NamedRecord>(messages && messages.ok ? messages.data : []).map((message) => (
          <li key={message.id} className="rounded-2xl bg-white px-4 py-3 text-sm text-navy">
            <p>{String(message.body ?? message.id)}</p>
            <div className="mt-2 flex gap-3 text-xs font-semibold">
              <form action={markChatRead}><input type="hidden" name="id" value={message.id} /><button className="text-accent">Mark read</button></form>
              <form action={deleteChatMessage}><input type="hidden" name="id" value={message.id} /><button className="text-[#9f1239]">Delete</button></form>
            </div>
            <ChatEditForm id={message.id} body={String(message.body ?? "")} />
          </li>
        ))}
      </ul>
      {threadId ? <ChatForm threadId={threadId} /> : null}
    </Screen>
  );
}

export async function SettingsScreen({ profile }: { profile: PortalProfile }) {
  const [me, sessions] = await Promise.all([
    portalCall<{ user?: NamedRecord }>("/users/me"),
    portalCall<unknown>("/auth/sessions"),
  ]);
  const phone = me.ok ? String(me.data.user?.phone ?? "") : "";
  const language = me.ok ? String(me.data.user?.preferredLanguage ?? "en") : "en";
  return (
    <Screen>
      <PageTitle title="Settings" />
      {!me.ok ? <Notice message={me.message} /> : null}
      <SettingsForm
        phone={phone}
        language={language}
        profile={{ ...profile, firstName: String(me.ok ? me.data.user?.firstName ?? profile.firstName : profile.firstName), lastName: String(me.ok ? me.data.user?.lastName ?? profile.lastName : profile.lastName) }}
      />
      {phone ? <p className="mt-3 text-sm text-muted">Phone on file: {phone}</p> : null}
      <PhoneForms />
      <h2 className="mt-8 text-lg font-semibold text-navy">Sessions</h2>
      <ul className="mt-3 grid gap-2">
        {asList<NamedRecord>(sessions.ok ? sessions.data : []).map((session) => (
          <li key={session.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm">
            <span className="text-navy">{String(session.deviceName ?? "Device")} · {String(session.platform ?? "")}</span>
            {session.revokedAt ? <span className="text-muted">Revoked</span> : (
              <form action={revokeSession}>
                <input type="hidden" name="id" value={session.id} />
                <button className="font-semibold text-accent">Revoke</button>
              </form>
            )}
          </li>
        ))}
      </ul>
      <form action={logoutAll} className="mt-4">
        <button className="h-11 rounded-full border border-line bg-white px-5 text-sm font-medium text-navy">Sign out of every device</button>
      </form>
      <form action={signOut} className="mt-3">
        <button className="h-11 rounded-full border border-line bg-white px-5 text-sm font-medium text-navy">Sign out</button>
      </form>
      <DeactivateForm />
    </Screen>
  );
}

export async function RemindersScreen() {
  const result = await portalCall<NamedRecord>("/notifications/preferences");
  return (
    <Screen>
      <PageTitle title="Reminder settings" />
      {!result.ok ? <Notice message={result.message} /> : null}
      <ReminderForm preferences={result.ok ? result.data : null} />
    </Screen>
  );
}

export async function AssistantScreen() {
  const status = await portalCall<{ configured?: boolean; message?: string }>("/ai/status", { auth: false });
  return (
    <Screen>
      <PageTitle kicker="AI" title="Assistant" />
      <p className="mb-4 text-sm leading-6 text-muted">Answers stay inside the properties your role can read.</p>
      {status.ok && status.data.configured === false ? <Notice message="The AI provider is not configured yet. A question returns that configuration state instead of a made-up answer." /> : null}
      <AssistantForm />
    </Screen>
  );
}

export async function SubscriptionScreen() {
  const [me, invoices] = await Promise.all([portalCall<NamedRecord>("/subscriptions/me"), portalCall<unknown>("/subscriptions/invoices")]);
  return (
    <Screen>
      <PageTitle kicker="SUBSCRIPTION" title="Plan and billing" />
      {!me.ok ? <Notice message={me.message} /> : (
        <dl className="grid gap-3 rounded-[24px] bg-white p-4 text-sm">
          <Fact label="Status" value={labelize(String((me.data.subscription as NamedRecord | undefined)?.status ?? me.data.status ?? ""))} />
          <Fact label="Plan" value={String((me.data.subscription as NamedRecord | undefined)?.planCode ?? "—")} />
          <Fact label="Active units" value={String((me.data.subscription as NamedRecord | undefined)?.activeUnitCount ?? "0")} />
        </dl>
      )}
      <div className="mt-4 flex gap-2">
        <form action={recalculateSubscription}><button className="h-11 rounded-full bg-accent px-4 text-sm font-medium text-white">Recalculate</button></form>
        <form action={openSubscriptionInvoice}><button className="h-11 rounded-full bg-white px-4 text-sm font-medium text-navy">Open invoice</button></form>
      </div>
      <h2 className="mt-5 text-lg font-semibold text-navy">Invoices</h2>
      <ul className="mt-3 grid gap-2">
        {asList<NamedRecord>(invoices.ok ? invoices.data : []).map((invoice) => (
          <li key={invoice.id} className="rounded-2xl bg-white px-4 py-3 text-sm text-navy">{money(invoice.amount)} · {labelize(String(invoice.status ?? ""))}</li>
        ))}
      </ul>
    </Screen>
  );
}

export async function DocumentsScreen() {
  const properties = await portalCall<unknown>("/properties");
  const propertyRows = asList<NamedRecord>(properties.ok ? properties.data : []);
  const documents: NamedRecord[] = [];
  for (const property of propertyRows.slice(0, 12)) {
    const result = await portalCall<unknown>(`/documents?propertyId=${property.id}`);
    if (result.ok) documents.push(...asList<NamedRecord>(result.data));
  }
  return (
    <Screen>
      <PageTitle kicker="DOCUMENTS" title="Documents" />
      <p className="mb-4 text-sm text-muted">PDF and image uploads keep an expiry date so a reminder can go out before a document lapses.</p>
      {!properties.ok ? <Notice message={properties.message} /> : null}
      <ul className="grid gap-2">
        {documents.map((doc) => (
          <li key={doc.id} className="rounded-2xl bg-white px-4 py-3 text-sm">
            <a className="font-semibold text-accent" href={`/portal/files/documents/${doc.id}/download`}>{String(doc.title ?? doc.category ?? "Document")}</a>
            <span className="mt-1 block text-muted">{doc.expiresAt ? `Expires ${String(doc.expiresAt)}` : "No expiry"}</span>
            <form action={extractDocument} className="mt-2">
              <input type="hidden" name="id" value={doc.id} />
              <button className="text-sm font-semibold text-navy">Extract with AI</button>
            </form>
          </li>
        ))}
      </ul>
      <DocumentForm properties={propertyRows} />
    </Screen>
  );
}

export async function InsuranceScreen() {
  const properties = await portalCall<unknown>("/properties");
  const propertyRows = asList<NamedRecord>(properties.ok ? properties.data : []);
  const policies: NamedRecord[] = [];
  for (const property of propertyRows.slice(0, 12)) {
    const result = await portalCall<{ policies?: NamedRecord[] }>(`/insurance?propertyId=${property.id}`);
    if (result.ok && Array.isArray(result.data.policies)) policies.push(...result.data.policies);
  }
  return (
    <Screen>
      <PageTitle title="Insurance" />
      {!properties.ok ? <Notice message={properties.message} /> : null}
      <ul className="mb-4 grid gap-2">
        {policies.map((policy) => (
          <li key={policy.id} className="rounded-2xl bg-white px-4 py-3 text-sm text-navy">
            {String(policy.providerName ?? "Policy")} · {String(policy.policyNumber ?? "")}
            <span className="mt-1 block text-muted">Ends {String(policy.endDate ?? "—")}</span>
          </li>
        ))}
      </ul>
      <InsuranceForm properties={propertyRows} />
    </Screen>
  );
}

export async function ManagersScreen() {
  const [assignments, properties] = await Promise.all([portalCall<unknown>("/managers/assignments"), portalCall<unknown>("/properties")]);
  return (
    <Screen>
      <PageTitle title="Managers" />
      {!assignments.ok ? <Notice message={assignments.message} /> : null}
      <ul className="mb-4 grid gap-2">
        {asList<NamedRecord>(assignments.ok ? assignments.data : []).map((row) => (
          <li key={row.id} className="rounded-2xl bg-white px-4 py-3 text-sm text-navy">
            {labelize(String(row.status ?? "pending"))}
            <form action={respondAssignment} className="mt-2 flex gap-2">
              <input type="hidden" name="id" value={row.id} />
              <button name="intent" value="accept" className="font-semibold text-accent">Accept</button>
              <button name="intent" value="decline" className="font-semibold text-navy">Decline</button>
              <button name="intent" value="revoke" className="font-semibold text-[#9f1239]">Revoke</button>
            </form>
          </li>
        ))}
      </ul>
      <ManagerForm properties={asList(properties.ok ? properties.data : [])} />
    </Screen>
  );
}

export async function InspectionsScreen() {
  const properties = await portalCall<unknown>("/properties");
  const propertyRows = asList<NamedRecord>(properties.ok ? properties.data : []);
  const rows: NamedRecord[] = [];
  for (const property of propertyRows.slice(0, 12)) {
    const result = await portalCall<unknown>(`/inspections?propertyId=${property.id}`);
    if (result.ok) rows.push(...asList<NamedRecord>(result.data));
  }
  return (
    <Screen>
      <PageTitle title="Inspection history" />
      {!properties.ok ? <Notice message={properties.message} /> : null}
      <ul className="grid gap-2">
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl bg-white px-4 py-3 text-sm text-navy">{String(row.scheduledAt ?? row.createdAt ?? row.id)} · {labelize(String(row.status ?? "scheduled"))}</li>
        ))}
      </ul>
      <InspectionForm properties={propertyRows} />
      <InspectionExtraForms inspections={rows} />
    </Screen>
  );
}

export async function HandoverScreen() {
  const tenancies = await portalCall<unknown>("/tenancies");
  const tenancyRows = asList<NamedRecord>(tenancies.ok ? tenancies.data : []);
  const rows: NamedRecord[] = [];
  for (const tenancy of tenancyRows.slice(0, 12)) {
    const result = await portalCall<unknown>(`/handovers?tenancyId=${tenancy.id}`);
    if (result.ok) rows.push(...asList<NamedRecord>(result.data));
  }
  return (
    <Screen>
      <PageTitle title="Handover" />
      {!tenancies.ok ? <Notice message={tenancies.message} /> : null}
      <ul className="grid gap-2">
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl bg-white px-4 py-3 text-sm text-navy">
            {labelize(String(row.type ?? "handover"))} · {labelize(String(row.status ?? ""))}
            <form action={confirmHandover} className="mt-2">
              <input type="hidden" name="id" value={row.id} />
              <button className="font-semibold text-accent">Confirm</button>
            </form>
          </li>
        ))}
      </ul>
      <HandoverForm tenancies={tenancyRows} />
      <HandoverItemForm handovers={rows} />
    </Screen>
  );
}

export async function DepositScreen() {
  const tenancies = await portalCall<unknown>("/tenancies");
  return (
    <Screen>
      <PageTitle title="Deposit settlement" />
      <p className="mb-2 text-sm text-muted">Record what was received, the approved deductions, and the reason.</p>
      <DepositForm tenancies={asList(tenancies.ok ? tenancies.data : [])} />
    </Screen>
  );
}

export async function NotificationsScreen() {
  const result = await portalCall<unknown>("/notifications");
  const rows = asList<NamedRecord>(result.ok ? result.data : []);
  return (
    <Screen>
      <PageTitle kicker="ALERTS" title="Notifications" />
      {!result.ok ? <Notice message={result.message} /> : null}
      {rows.length ? (
        <ul className="grid gap-3">
          {rows.map((row) => (
            <li key={row.id} className="rounded-[22px] bg-white px-4 py-4">
              <p className="font-semibold text-navy">{String(row.title ?? "Alert")}</p>
              <p className="mt-1 text-sm text-muted">{String(row.body ?? "")}</p>
              {row.readAt ? null : (
                <form action={markNotificationRead} className="mt-2">
                  <input type="hidden" name="id" value={row.id} />
                  <button className="text-sm font-semibold text-accent">Mark read</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      ) : result.ok ? <EmptyState title="No notifications" body="Alerts for your role and responsibilities show up here." /> : null}
    </Screen>
  );
}

export async function SupportScreen() {
  const result = await portalCall<unknown>("/support/tickets");
  return (
    <Screen>
      <PageTitle title="Support" />
      {!result.ok ? <Notice message={result.message} /> : null}
      <ul className="mb-6 grid gap-2">
        {asList<NamedRecord>(result.ok ? result.data : []).map((ticket) => (
          <li key={ticket.id} className="rounded-2xl bg-white px-4 py-3 text-sm">
            <span className="font-semibold text-navy">{String(ticket.subject ?? "Ticket")}</span>
            <span className="mt-1 block text-muted">{labelize(String(ticket.status ?? "open"))}</span>
          </li>
        ))}
      </ul>
      <SupportForm />
    </Screen>
  );
}

export async function OrganizationScreen() {
  const result = await portalCall<unknown>("/organizations");
  const rows = asList<NamedRecord>(result.ok ? result.data : []);
  return (
    <Screen>
      <PageTitle title="Organization" />
      {!result.ok ? <Notice message={result.message} /> : null}
      <ul className="mb-6 grid gap-2">
        {rows.map((organization) => (
          <li key={organization.id} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-navy">{String(organization.name ?? organization.id)}</li>
        ))}
      </ul>
      <OrganizationForms organizations={rows} />
    </Screen>
  );
}

function TenancyButtons({ id }: { id: string }) {
  return (
    <form action={changeTenancy} className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
      <input type="hidden" name="id" value={id} />
      <button name="intent" value="activate" className="rounded-full bg-accent px-3 py-2 text-white">Activate</button>
      <button name="intent" value="terminate" className="rounded-full bg-white px-3 py-2 text-navy">Terminate</button>
      <button name="intent" value="complete" className="rounded-full bg-white px-3 py-2 text-navy">Complete</button>
    </form>
  );
}

function placeName(value: unknown) {
  if (value && typeof value === "object" && "name" in value) return String((value as { name?: unknown }).name ?? "");
  return "";
}

function PropertyPhotos({ media }: { media: unknown }) {
  const files = Array.isArray(media) ? media : [];
  if (!files.length) return null;
  return (
    <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {files.map((file) => {
        const row = file as { id?: string; mimeType?: string; originalName?: string; kind?: string };
        if (!row.id) return null;
        const href = `/portal/files/properties/media/${row.id}/download`;
        const image = String(row.mimeType ?? "").startsWith("image/");
        return (
          <li key={row.id} className="overflow-hidden rounded-[22px] bg-white">
            {image ? (
              <a href={href}>
                <PropertyPhoto src={href} alt={row.originalName || "Property photo"} />
              </a>
            ) : (
              <a href={href} className="block px-4 py-4 text-sm font-semibold text-navy">
                {row.originalName || row.kind || "Document"}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-navy">{value}</dd>
    </div>
  );
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthName(month?: number) {
  if (!month) return "";
  return monthNames[month - 1] ?? "";
}
