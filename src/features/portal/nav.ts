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
  roles: PortalRole[];
};

export const moreLinks: MoreLink[] = [
  { href: "/portal/repairs", label: "Repairs", hint: "Report and manage repairs", roles: ["OWNER", "TENANT", "MANAGER"] },
  { href: "/portal/chat", label: "Tenancy chat", hint: "Messages on a tenancy", roles: ["OWNER", "TENANT", "MANAGER"] },
  { href: "/portal/accounts", label: "Accounts", hint: "Income, expenses, and statements", roles: ["OWNER"] },
  { href: "/portal/inspections", label: "Inspections", hint: "Dated inspection history", roles: ["OWNER", "TENANT", "MANAGER"] },
  { href: "/portal/handover", label: "Handover", hint: "Move-in and move-out record", roles: ["OWNER", "TENANT", "MANAGER"] },
  { href: "/portal/deposit", label: "Deposit", hint: "Settle the security deposit", roles: ["OWNER", "TENANT"] },
  { href: "/portal/documents", label: "Documents", hint: "Uploads and expiry alerts", roles: ["OWNER", "TENANT", "MANAGER"] },
  { href: "/portal/insurance", label: "Insurance", hint: "Add a policy and the requirement", roles: ["OWNER", "TENANT"] },
  { href: "/portal/managers", label: "Managers", hint: "Assign someone to a property", roles: ["OWNER", "TENANT"] },
  { href: "/portal/invitations", label: "Invitations", hint: "Invite a new or existing tenant", roles: ["OWNER"] },
  { href: "/portal/agreements", label: "Agreements", hint: "Renew or adjust the rent", roles: ["OWNER", "TENANT"] },
  { href: "/portal/notifications", label: "Notifications", hint: "Alerts for your role", roles: ["OWNER", "TENANT", "MANAGER"] },
  { href: "/portal/activity", label: "Activity log", hint: "Events that cannot be edited", roles: ["OWNER", "TENANT", "MANAGER"] },
  { href: "/portal/assistant", label: "AI assistant", hint: "Ask about your own properties", roles: ["OWNER", "TENANT", "MANAGER"] },
  { href: "/portal/subscription", label: "Subscription", hint: "Plan, billing, and invoices", roles: ["OWNER"] },
  { href: "/portal/reminders", label: "Reminder settings", hint: "When rent and bill alerts go out", roles: ["OWNER"] },
  { href: "/portal/organization", label: "Organization", hint: "Business account and members", roles: ["OWNER"] },
  { href: "/portal/support", label: "Support", hint: "Open a ticket for the platform team", roles: ["OWNER", "TENANT", "MANAGER"] },
  { href: "/portal/settings", label: "Settings", hint: "Profile, sessions, and sign out", roles: ["OWNER", "TENANT", "MANAGER"] },
];

export function linksFor(role: PortalRole) {
  return moreLinks.filter((item) => item.roles.includes(role));
}

export const tabs: Record<PortalRole, { href: string; label: string; exact?: boolean }[]> = {
  OWNER: [
    { href: "/portal/home", label: "Home", exact: true },
    { href: "/portal/properties", label: "Properties" },
    { href: "/portal/rent", label: "Rent" },
    { href: "/portal/bills", label: "Bills" },
    { href: "/portal/more", label: "More", exact: true },
  ],
  TENANT: [
    { href: "/portal/home", label: "Home", exact: true },
    { href: "/portal/rent", label: "Pay" },
    { href: "/portal/bills", label: "Bills" },
    { href: "/portal/repairs", label: "Repairs" },
    { href: "/portal/more", label: "More", exact: true },
  ],
  MANAGER: [
    { href: "/portal/home", label: "Home", exact: true },
    { href: "/portal/properties", label: "Properties" },
    { href: "/portal/repairs", label: "Tasks" },
    { href: "/portal/more", label: "More", exact: true },
  ],
};
