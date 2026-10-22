import { BrandMark } from "@/components/brand/brand-mark";
import { Container } from "./container";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-card/80 backdrop-blur-md">
      <Container className="flex h-[4.25rem] items-center justify-between gap-3">
        <BrandMark />
        <NavLinks />
      </Container>
    </header>
  );
}
