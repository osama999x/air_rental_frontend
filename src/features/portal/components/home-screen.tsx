import Link from "next/link";
import { connection } from "next/server";
import { asList, portalCall } from "@/features/portal/api";
import type { NamedRecord, OwnerDashboard, PortalProfile } from "@/features/portal/types";
import { PortalIcon, type IconName } from "./icons";
import { Chip, MoneyCard, PageTitle, RecordLink, Screen, StatRow } from "./ui";

export async function HomeScreen({ profile }: { profile: PortalProfile }) {
  await connection();
  if (profile.activeRole === "TENANT") return <TenantHome profile={profile} />;
  if (profile.activeRole === "MANAGER") return <ManagerHome profile={profile} />;
  return <OwnerHome profile={profile} />;
}

async function OwnerHome({ profile }: { profile: PortalProfile }) {
  const [dashboard, properties, rent, bills] = await Promise.all([
    portalCall<OwnerDashboard>("/dashboards/owner"),
    portalCall<unknown>("/properties"),
    portalCall<unknown>("/rent/obligations"),
    portalCall<unknown>("/bills"),
  ]);
  const stats = dashboard.ok
    ? dashboard.data
    : { properties: 0, rented: 0, vacant: 0, activeTenancies: 0, overdueRent: 0, pendingProofs: 0, openMaintenance: 0 };
  const propertyRows = asList<NamedRecord>(properties.ok ? properties.data : []);
  const rentRows = asList<NamedRecord>(rent.ok ? rent.data : []);
  const billRows = asList<NamedRecord>(bills.ok ? bills.data : []);
  const billed = rentRows.reduce((sum, row) => sum + amountOf(row.amount), 0);
  const collected = rentRows.reduce((sum, row) => sum + amountOf(row.confirmedAmount), 0);
  const attention = [
    ...rentRows
      .filter((row) => ["OVERDUE", "PROOF_SUBMITTED", "UNDER_REVIEW", "DUE"].includes(String(row.status)))
      .map((row) => ({
        href: `/portal/rent/${row.id}`,
        mark: codeOf(propertyRows.find((item) => item.id === row.propertyId) ?? row),
        title: propertyRows.find((item) => item.id === row.propertyId)?.name ?? "Rent",
        subtitle: rentSubtitle(row),
        amount: money(row.amount),
        status: String(row.status ?? ""),
      })),
    ...billRows
      .filter((row) => ["DUE", "ISSUED", "OVERDUE", "PARTIAL"].includes(String(row.status)))
      .slice(0, 3)
      .map((row) => ({
        href: `/portal/bills/${row.id}`,
        mark: String(row.category ?? "B").slice(0, 1),
        title: label(String(row.category ?? "Bill")),
        subtitle: row.dueDate ? `Due ${row.dueDate}` : "Bill",
        amount: money(row.amount),
        status: String(row.status ?? "DUE"),
      })),
  ].slice(0, 4);

  return (
    <Screen>
      <Greeting profile={profile} />
      {!dashboard.ok ? <p className="mb-3 text-sm text-[#9f1239]">{dashboard.message}</p> : null}
      <div className="grid items-stretch gap-4 lg:grid-cols-[1.4fr_1fr]">
      <MoneyCard
        label="Rent collection"
        amount={money(collected || billed)}
        detail={billed ? `${money(collected)} of ${money(billed)} collected · ${money(Math.max(billed - collected, 0))} outstanding` : "Approved payments appear here"}
      />
      <StatRow
        className="lg:mt-0 lg:content-center"
        items={[
          { label: "Total units", value: stats.properties },
          { label: "Rented", value: stats.rented },
          { label: "Vacant", value: stats.vacant },
        ]}
      />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Quick href="/portal/properties/new" label="Add property" icon="properties" />
        <Quick href="/portal/invitations" label="Invite tenant" icon="invitations" />
        <Quick href="/portal/managers" label="Assign manager" icon="managers" />
        <Quick href="/portal/repairs" label="Repair requests" icon="repairs" />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy">Needs attention</h2>
        <Link href="/portal/rent" className="text-sm font-medium text-accent">
          See all
        </Link>
      </div>
      <ul className="mt-3 grid gap-3">
        {attention.length ? (
          attention.map((item) => (
            <li key={item.href + item.title}>
              <RecordLink {...item} />
            </li>
          ))
        ) : (
          <li className="rounded-[22px] bg-white px-4 py-4 text-sm text-muted">Nothing is waiting on you.</li>
        )}
      </ul>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm lg:grid-cols-4">
        <Mini label="Rent proofs" value={`${stats.pendingProofs} to approve`} href="/portal/rent" />
        <Mini label="Repairs" value={`${stats.openMaintenance} open`} href="/portal/repairs" />
        <Mini label="Agreements" value={`${stats.activeTenancies} active`} href="/portal/agreements" />
        <Mini label="Bills" value="Review and pay" href="/portal/bills" />
      </div>
    </Screen>
  );
}

async function TenantHome({ profile }: { profile: PortalProfile }) {
  const [dashboard, rent, bills] = await Promise.all([
    portalCall<{ rentedProperties: number; tenancies: number; unreadMessages: number; unreadNotifications: number }>("/dashboards/tenant"),
    portalCall<unknown>("/rent/obligations"),
    portalCall<unknown>("/bills"),
  ]);
  const rentRows = asList<NamedRecord>(rent.ok ? rent.data : []);
  const due = rentRows.find((row) => row.status !== "PAID") ?? rentRows[0];
  return (
    <Screen>
      <Greeting profile={profile} />
      <MoneyCard
        label="Rent due"
        amount={due ? money(due.remaining || due.amount) : money(0)}
        detail={due ? `Due ${due.dueDate ?? "this period"} · ${label(String(due.status ?? "upcoming"))}` : "No rent obligation yet"}
      />
      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Quick href={due ? `/portal/rent/${due.id}` : "/portal/rent"} label="Upload proof" icon="rent" />
        <Quick href="/portal/bills" label="Bills" icon="bills" />
        <Quick href="/portal/repairs/new" label="Report an issue" icon="repairs" />
        <Quick href="/portal/agreements" label="View agreement" icon="agreements" />
      </div>
      <ul className="mt-5 grid gap-3">
        <li className="rounded-[22px] bg-white p-4 text-sm text-navy">
          {dashboard.ok
            ? `${dashboard.data.tenancies} tenancies · ${dashboard.data.unreadMessages} unread messages · ${dashboard.data.unreadNotifications} alerts`
            : dashboard.message}
        </li>
        {asList<NamedRecord>(bills.ok ? bills.data : []).slice(0, 3).map((bill) => (
          <li key={bill.id}>
            <RecordLink
              href={`/portal/bills/${bill.id}`}
              mark={String(bill.category ?? "B")}
              title={label(String(bill.category ?? "Bill"))}
              subtitle={bill.dueDate ? `Due ${bill.dueDate}` : undefined}
              amount={money(bill.amount)}
              status={String(bill.status ?? "")}
            />
          </li>
        ))}
      </ul>
    </Screen>
  );
}

async function ManagerHome({ profile }: { profile: PortalProfile }) {
  const [dashboard, repairs] = await Promise.all([
    portalCall<{ assignedProperties: number; activeAssignments: number; unreadNotifications: number }>("/dashboards/manager"),
    portalCall<unknown>("/maintenance"),
  ]);
  const tasks = asList<NamedRecord>(repairs.ok ? repairs.data : []);
  return (
    <Screen>
      <Greeting profile={profile} />
      <StatRow
        items={[
          { label: "Assigned", value: dashboard.ok ? dashboard.data.assignedProperties : 0 },
          { label: "Active", value: dashboard.ok ? dashboard.data.activeAssignments : 0 },
          { label: "Alerts", value: dashboard.ok ? dashboard.data.unreadNotifications : 0 },
        ]}
      />
      <PageTitle title="Tasks" />
      <ul className="grid gap-3">
        {tasks.length ? (
          tasks.map((task) => (
            <li key={task.id}>
              <RecordLink
                href={`/portal/repairs/${task.id}`}
                mark={String(task.category ?? "T")}
                title={task.description?.slice(0, 48) || "Repair"}
                subtitle={label(String(task.status ?? "NEW"))}
                status={String(task.status ?? "NEW")}
              />
            </li>
          ))
        ) : (
          <li className="rounded-[22px] bg-white px-4 py-4 text-sm text-muted">No assigned tasks yet.</li>
        )}
      </ul>
    </Screen>
  );
}

function Greeting({ profile }: { profile: PortalProfile }) {
  const now = new Date();
  const hour = now.getHours();
  const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const month = now.toLocaleString("en", { month: "short" }).toUpperCase();
  return (
    <header className="mb-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-muted">{hello}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">
          {profile.firstName} {profile.lastName}
        </h1>
      </div>
      <div className="text-right">
        <Chip tone="due">PAK · PKR</Chip>
        <p className="mt-2 text-xs font-semibold tracking-[0.14em] text-muted">
          {month}, {now.getFullYear()}
        </p>
      </div>
    </header>
  );
}

function Quick({ href, label, icon }: { href: string; label: string; icon: IconName }) {
  return (
    <Link href={href} className="flex min-h-[104px] flex-col justify-between rounded-[20px] bg-white px-4 py-4 text-sm font-semibold text-navy shadow-[0_8px_24px_rgba(18,48,92,0.05)]">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e8f0ff] text-accent">
        <PortalIcon name={icon} />
      </span>
      <span className="mt-3 leading-5">{label}</span>
    </Link>
  );
}

function Mini({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <Link href={href} className="rounded-[20px] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(18,48,92,0.05)]">
      <span className="block text-xs text-muted">{label}</span>
      <span className="mt-1 block font-semibold text-navy">{value}</span>
    </Link>
  );
}

function amountOf(value?: string) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

export function money(value?: string | number) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(
    Number.isFinite(amount) ? amount : 0,
  );
}

function codeOf(row: NamedRecord) {
  return String(row.visibleCode ?? row.propertyType ?? row.name ?? "P");
}

function rentSubtitle(row: NamedRecord) {
  if (row.status === "OVERDUE") return `Rent overdue · due ${row.dueDate ?? ""}`.trim();
  if (row.status === "PROOF_SUBMITTED" || row.status === "UNDER_REVIEW") return "Payment proof to review";
  if (row.status === "DUE") return `Due ${row.dueDate ?? ""}`.trim();
  return label(String(row.status ?? "Rent"));
}

function label(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}
