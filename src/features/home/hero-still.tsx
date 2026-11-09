export function HeroStill() {
  return (
    <svg viewBox="0 0 160 160" className="h-full w-full text-navy" aria-hidden="true">
      <g fill="currentColor">
        <rect x="28" y="78" width="28" height="52" rx="3" opacity="0.85" />
        <rect x="62" y="48" width="26" height="82" rx="3" className="text-accent" fill="var(--accent)" />
        <rect x="94" y="90" width="32" height="40" rx="3" opacity="0.7" />
      </g>
      <g fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinejoin="round">
        <circle cx="48" cy="40" r="12" />
        <path d="M58 48 96 86" />
        <path d="M88 86h16M96 78v16" />
      </g>
    </svg>
  );
}
