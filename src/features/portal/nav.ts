import type { IconName } from "./components/icons";
import type { PortalRole } from "./types";

export const roleMeta: Record<PortalRole, { title: string; body: string }> = {
  OWNER: {
    title: "Landlord / Owner",
    body: "List properties, invite tenants, and follow rent, bills, and repairs.",
  },
  TENANT: {
    title: "Tenant",
    body: "Accept a tenancy, pay rent, and report something that needs repair.",
  },
  MANAGER: {
    title: "Manager",
    body: "Look after the properties an owner or a tenant assigns to you.",
  },
};

export const propertyTypeOptions = [
  { value: "HSE", label: "House", blurb: "A standalone home." },
  { value: "APT", label: "Apartment", blurb: "A flat in a residential building." },
  { value: "SHP", label: "Shop", blurb: "A street shop for a retail tenant." },
  { value: "FLR", label: "Floor", blurb: "A whole floor of a building." },
  { value: "ROM", label: "Room", blurb: "A single room inside a larger property." },
  { value: "OFC", label: "Office", blurb: "A fitted office for a business tenancy." },
  { value: "WRH", label: "Warehouse", blurb: "Storage with its own tenancy record." },
  { value: "PLT", label: "Plot", blurb: "Open land let on a monthly tenancy." },
] as const;

export type MoreLink = {
  href: string;
  label: string;
  hint: string;
  icon: IconName;
  roles: PortalRole[];
};

export const moreLinks: MoreLink[] = [
  { href: "/portal/repairs", label: "Repairs", hint: "Report and manage repairs", icon: "repairs", roles: ["OWNER", "TENANT", "MANAGER"] },
  { href: "/portal/chat", label: "Tenancy chat", hint: "Messages on a tenancy", icon: "chat", roles: ["OWNER", "TENANT", "MANAGER"] },
  { href: "/portal/accounts", label: "Accounts", hint: "Income, expenses, and statements", icon: "accounts", roles: ["OWNER"] },
  { href: "/portal/inspections", label: "Inspections", hint: "Dated inspection history", icon: "inspections", roles: ["OWNER", "TENANT", "MANAGER"] },
  { href: "/portal/handover", label: "Handover", hint: "Move-in and move-out record", icon: "handover", roles: ["OWNER", "TENANT", "MANAGER"] },
  { href: "/portal/deposit", label: "Deposit", hint: "Settle the security deposit", icon: "deposit", roles: ["OWNER", "TENANT"] },
  { href: "/portal/documents", label: "Documents", hint: "Uploads and expiry alerts", icon: "documents", roles: ["OWNER", "TENANT", "MANAGER"] },
  { href: "/portal/insurance", label: "Insurance", hint: "Add a policy and the requirement", icon: "insurance", roles: ["OWNER", "TENANT"] },
  { href: "/portal/managers", label: "Managers", hint: "Assign someone to a property", icon: "managers", roles: ["OWNER", "TENANT"] },
  { href: "/portal/invitations", label: "Invitations", hint: "Invite a new or existing tenant", icon: "invitations", roles: ["OWNER"] },
  { href: "/portal/agreements", label: "Agreements", hint: "Renew or adjust the rent", icon: "agreements", roles: ["OWNER", "TENANT"] },
  { href: "/portal/notifications", label: "Notifications", hint: "Alerts for your role", icon: "notifications", roles: ["OWNER", "TENANT", "MANAGER"] },
  { href: "/portal/activity", label: "Activity log", hint: "Events that cannot be edited", icon: "activity", roles: ["OWNER", "TENANT", "MANAGER"] },
  { href: "/portal/assistant", label: "AI assistant", hint: "Ask about your own properties", icon: "assistant", roles: ["OWNER", "TENANT", "MANAGER"] },
  { href: "/portal/subscription", label: "Subscription", hint: "Plan, billing, and invoices", icon: "subscription", roles: ["OWNER"] },
  { href: "/portal/reminders", label: "Reminder settings", hint: "When rent and bill alerts go out", icon: "reminders", roles: ["OWNER"] },
  { href: "/portal/organization", label: "Organization", hint: "Business account and members", icon: "organization", roles: ["OWNER"] },
  { href: "/portal/support", label: "Support", hint: "Open a ticket for the platform team", icon: "support", roles: ["OWNER", "TENANT", "MANAGER"] },
  { href: "/portal/settings", label: "Settings", hint: "Profile, sessions, and sign out", icon: "settings", roles: ["OWNER", "TENANT", "MANAGER"] },
];

export function linksFor(role: PortalRole) {
  return moreLinks.filter((item) => item.roles.includes(role));
}

export const tabs: Record<PortalRole, { href: string; label: string; icon: IconName; exact?: boolean }[]> = {
  OWNER: [
    { href: "/portal/home", label: "Home", icon: "home", exact: true },
    { href: "/portal/properties", label: "Properties", icon: "properties" },
    { href: "/portal/rent", label: "Rent", icon: "rent" },
    { href: "/portal/bills", label: "Bills", icon: "bills" },
    { href: "/portal/more", label: "More", icon: "more", exact: true },
  ],
  TENANT: [
    { href: "/portal/home", label: "Home", icon: "home", exact: true },
    { href: "/portal/rent", label: "Pay", icon: "rent" },
    { href: "/portal/bills", label: "Bills", icon: "bills" },
    { href: "/portal/repairs", label: "Repairs", icon: "repairs" },
    { href: "/portal/more", label: "More", icon: "more", exact: true },
  ],
  MANAGER: [
    { href: "/portal/home", label: "Home", icon: "home", exact: true },
    { href: "/portal/properties", label: "Properties", icon: "properties" },
    { href: "/portal/repairs", label: "Tasks", icon: "repairs" },
    { href: "/portal/more", label: "More", icon: "more", exact: true },
  ],
};
