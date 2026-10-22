import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { navItems, site } from "@/config/site";
import { Container } from "./container";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-card">
      <Container className="grid gap-8 py-10 sm:grid-cols-[1.3fr_1fr_0.7fr]">
        <div>
          <BrandMark />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
            Monthly tenancies for homes, shops, and offices. Rent, bills, and maintenance stay with the property.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted">CITIES</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {site.serviceAreas.map((city) => (
              <li key={city} className="rounded-full bg-[#eef3fb] px-3 py-1.5 text-sm font-medium text-navy">
                {city}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted">VISIT</p>
          <ul className="mt-3 grid gap-2 text-sm font-medium">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-navy hover:text-accent">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
