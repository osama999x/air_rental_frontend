export function PropertyArt({ label }: { label: string }) {
  return (
    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-accent to-navy">
      <div className="absolute -top-10 -right-8 h-32 w-32 rounded-full bg-white/15" />
      <div className="absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-white/10" />
      <svg viewBox="0 0 160 90" className="absolute right-3 bottom-0 h-24 w-36 text-white" aria-hidden="true">
        <path d="M18 78V38L52 16l34 22v40" fill="currentColor" />
        <rect x="86" y="34" width="52" height="44" rx="4" fill="currentColor" opacity="0.85" />
        <rect x="34" y="50" width="14" height="12" rx="2" fill="#12305c" opacity="0.28" />
        <rect x="98" y="46" width="10" height="8" rx="1.5" fill="#e8f0ff" />
        <rect x="114" y="46" width="10" height="8" rx="1.5" fill="#e8f0ff" />
        <rect x="106" y="60" width="12" height="18" rx="1.5" fill="#12305c" opacity="0.25" />
      </svg>
      <span className="absolute top-3 left-3 rounded-full bg-[#e7f8ef] px-2.5 py-1 text-xs font-semibold text-[#157a45]">
        Vacant
      </span>
      <p className="absolute bottom-3 left-4 text-sm font-semibold text-white">{label}</p>
    </div>
  );
}
