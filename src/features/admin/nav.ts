export const adminNav = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/organizations", label: "Organizations" },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/providers", label: "Providers" },
  { href: "/admin/integrations", label: "Integrations" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/audit", label: "Audit" },
  { href: "/admin/settings", label: "Settings" },
] as const;
