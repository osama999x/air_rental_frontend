export const site = {
  name: "Air Rental",
  description:
    "Owners, tenants, and managers run a property tenancy together: the agreement, monthly rent, bills, and maintenance.",
  serviceAreas: ["Karachi", "Lahore", "Islamabad", "Rawalpindi"],
} as const;

export const navItems = [
  { href: "/properties", label: "Properties" },
  { href: "/apply", label: "Apply" },
  { href: "/portal", label: "Sign in" },
] as const;
