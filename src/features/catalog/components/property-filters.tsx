import Link from "next/link";
import { propertyTypes, type PropertyType } from "../types";

export function PropertyFilters({ active }: { active?: PropertyType }) {
  const options: { href: string; label: string; value?: PropertyType }[] = [
    { href: "/properties", label: "All" },
    ...propertyTypes.map((type) => ({
      href: `/properties?type=${type.value}`,
      label: type.label,
      value: type.value,
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.value === active;

        return (
          <Link
            key={option.label}
            href={option.href}
            aria-current={selected ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              selected
                ? "bg-accent text-accent-foreground"
                : "bg-card text-navy shadow-sm hover:-translate-y-0.5"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
