import Link from "next/link";
import { connection } from "next/server";
import { asList, portalCall } from "@/features/portal/api";
import { fillTemplate, portalCopy, type PortalCopy } from "@/features/portal/portal-copy";
import { readOnboarding } from "@/features/portal/session";
import type { NamedRecord, OwnerDashboard, PortalProfile } from "@/features/portal/types";
import { PortalIcon, type IconName } from "./icons";
import { ProfilePhoto } from "./loader";
import { Chip, MoneyCard, PageTitle, RecordLink, Screen, StatRow } from "./ui";

export async function HomeScreen({ profile }: { profile: PortalProfile }) {
  await connection();
  const { language } = await readOnboarding();
  const copy = portalCopy(language);
  if (profile.activeRole === "TENANT") return <TenantHome profile={profile} copy={copy} language={language} />;
  if (profile.activeRole === "MANAGER") return <ManagerHome profile={profile} copy={copy} language={language} />;
  return <OwnerHome profile={profile} copy={copy} language={language} />;
}

async function OwnerHome({ profile, copy, language }: { profile: PortalProfile; copy: PortalCopy; language: string }) {
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
        title: propertyRows.find((item) => item.id === row.propertyId)?.name ?? copy.rent,
        subtitle: rentSubtitle(row, copy),
        amount: money(row.amount),
        status: String(row.status ?? ""),
      })),
    ...billRows
      .filter((row) => ["DUE", "ISSUED", "OVERDUE", "PARTIAL"].includes(String(row.status)))
      .slice(0, 3)
      .map((row) => ({
        href: `/portal/bills/${row.id}`,
        mark: String(row.category ?? "B").slice(0, 1),
        title: label(String(row.category ?? copy.bills)),
        subtitle: row.dueDate ? fillTemplate(copy.dueOn, { date: row.dueDate }) : copy.bills,
        amount: money(row.amount),
        status: String(row.status ?? "DUE"),
      })),
  ].slice(0, 4);

  return (
    <Screen>
      <Greeting profile={profile} copy={copy} language={language} />
      {!dashboard.ok ? <p className="mb-3 text-sm text-[#9f1239]">{dashboard.message}</p> : null}
      <div className="grid items-stretch gap-4 lg:grid-cols-[1.4fr_1fr]">
      <MoneyCard
        label={copy.rentCollection}
        amount={money(collected || billed)}
        detail={billed ? fillTemplate(copy.collectedLine, { collected: money(collected), billed: money(billed), outstanding: money(Math.max(billed - collected, 0)) }) : copy.approvedAppear}
      />
      <StatRow
        className="lg:mt-0 lg:content-center"
        items={[
          { label: copy.totalUnits, value: stats.properties },
          { label: copy.rented, value: stats.rented },
          { label: copy.vacant, value: stats.vacant },
        ]}
      />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Quick href="/portal/properties/new" label={copy.addProperty} icon="properties" />
        <Quick href="/portal/invitations" label={copy.inviteTenant} icon="invitations" />
        <Quick href="/portal/managers" label={copy.assignManager} icon="managers" />
        <Quick href="/portal/repairs" label={copy.repairRequests} icon="repairs" />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy">{copy.needsAttention}</h2>
        <Link href="/portal/rent" className="text-sm font-medium text-accent">
          {copy.seeAll}
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
          <li className="rounded-[22px] bg-white px-4 py-4 text-sm text-muted">{copy.nothingWaiting}</li>
        )}
      </ul>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm lg:grid-cols-4">
        <Mini label={copy.rentProofs} value={fillTemplate(copy.toApprove, { n: stats.pendingProofs })} href="/portal/rent" />
        <Mini label={copy.repairs} value={fillTemplate(copy.openCount, { n: stats.openMaintenance })} href="/portal/repairs" />
        <Mini label={copy.agreements} value={fillTemplate(copy.activeCount, { n: stats.activeTenancies })} href="/portal/agreements" />
        <Mini label={copy.bills} value={copy.reviewAndPay} href="/portal/bills" />
      </div>
    </Screen>
  );
}

async function TenantHome({ profile, copy, language }: { profile: PortalProfile; copy: PortalCopy; language: string }) {
  const [dashboard, rent, bills] = await Promise.all([
    portalCall<{ rentedProperties: number; tenancies: number; unreadMessages: number; unreadNotifications: number }>("/dashboards/tenant"),
    portalCall<unknown>("/rent/obligations"),
    portalCall<unknown>("/bills"),
  ]);
  const rentRows = asList<NamedRecord>(rent.ok ? rent.data : []);
  const due = rentRows.find((row) => row.status !== "PAID") ?? rentRows[0];
  return (
    <Screen>
      <Greeting profile={profile} copy={copy} language={language} />
      <MoneyCard
        label={copy.rentDue}
        amount={due ? money(due.remaining || due.amount) : money(0)}
        detail={due ? fillTemplate(copy.dueLine, { date: due.dueDate ?? "", status: label(String(due.status ?? "")) }) : copy.noRent}
      />
      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Quick href={due ? `/portal/rent/${due.id}` : "/portal/rent"} label={copy.uploadProof} icon="rent" />
        <Quick href="/portal/bills" label={copy.bills} icon="bills" />
        <Quick href="/portal/repairs/new" label={copy.reportIssue} icon="repairs" />
        <Quick href="/portal/agreements" label={copy.viewAgreement} icon="agreements" />
      </div>
      <ul className="mt-5 grid gap-3">
        <li className="rounded-[22px] bg-white p-4 text-sm text-navy">
          {dashboard.ok
            ? fillTemplate(copy.tenantSummary, {
                tenancies: dashboard.data.tenancies,
                messages: dashboard.data.unreadMessages,
                alerts: dashboard.data.unreadNotifications,
              })
            : dashboard.message}
        </li>
        {asList<NamedRecord>(bills.ok ? bills.data : []).slice(0, 3).map((bill) => (
          <li key={bill.id}>
            <RecordLink
              href={`/portal/bills/${bill.id}`}
              mark={String(bill.category ?? "B")}
              title={label(String(bill.category ?? copy.bills))}
              subtitle={bill.dueDate ? fillTemplate(copy.dueOn, { date: bill.dueDate }) : undefined}
              amount={money(bill.amount)}
              status={String(bill.status ?? "")}
            />
          </li>
        ))}
      </ul>
    </Screen>
  );
}

async function ManagerHome({ profile, copy, language }: { profile: PortalProfile; copy: PortalCopy; language: string }) {
  const [dashboard, repairs] = await Promise.all([
    portalCall<{ assignedProperties: number; activeAssignments: number; unreadNotifications: number }>("/dashboards/manager"),
    portalCall<unknown>("/maintenance"),
  ]);
  const tasks = asList<NamedRecord>(repairs.ok ? repairs.data : []);
  return (
    <Screen>
      <Greeting profile={profile} copy={copy} language={language} />
      <StatRow
        items={[
          { label: copy.assigned, value: dashboard.ok ? dashboard.data.assignedProperties : 0 },
          { label: copy.active, value: dashboard.ok ? dashboard.data.activeAssignments : 0 },
          { label: copy.alerts, value: dashboard.ok ? dashboard.data.unreadNotifications : 0 },
        ]}
      />
      <PageTitle title={copy.tasks} />
      <ul className="grid gap-3">
        {tasks.length ? (
          tasks.map((task) => (
            <li key={task.id}>
              <RecordLink
                href={`/portal/repairs/${task.id}`}
                mark={String(task.category ?? "T")}
                title={task.description?.slice(0, 48) || copy.repairs}
                subtitle={label(String(task.status ?? "NEW"))}
                status={String(task.status ?? "NEW")}
              />
            </li>
          ))
        ) : (
          <li className="rounded-[22px] bg-white px-4 py-4 text-sm text-muted">{copy.noTasks}</li>
        )}
      </ul>
    </Screen>
  );
}

function Greeting({ profile, copy, language }: { profile: PortalProfile; copy: PortalCopy; language: string }) {
  const now = new Date();
  const hour = now.getHours();
  const hello = hour < 12 ? copy.morning : hour < 17 ? copy.afternoon : copy.evening;
  const month = now.toLocaleString(language === "ur-Latn" ? "ur" : language, { month: "short" }).toUpperCase();
  return (
    <header className="mb-5 flex items-start justify-between">
      <div className="flex items-center gap-3">
        <ProfilePhoto name={`${profile.firstName} ${profile.lastName}`} src={profile.avatarStamp ? `/portal/files/users/me/avatar?v=${profile.avatarStamp}` : "/portal/files/users/me/avatar"} large />
        <div>
          <p className="text-sm text-muted">{hello}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-navy">
            {profile.firstName} {profile.lastName}
          </h1>
        </div>
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

function rentSubtitle(row: NamedRecord, copy: PortalCopy) {
  if (row.status === "OVERDUE") return fillTemplate(copy.rentOverdue, { date: row.dueDate ?? "" }).trim();
  if (row.status === "PROOF_SUBMITTED" || row.status === "UNDER_REVIEW") return copy.proofToReview;
  if (row.status === "DUE") return fillTemplate(copy.dueOn, { date: row.dueDate ?? "" }).trim();
  return label(String(row.status ?? copy.rent));
}

function label(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}
