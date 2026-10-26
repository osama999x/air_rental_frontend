export type IconName =
  | "home"
  | "properties"
  | "rent"
  | "bills"
  | "more"
  | "repairs"
  | "chat"
  | "accounts"
  | "inspections"
  | "handover"
  | "deposit"
  | "documents"
  | "insurance"
  | "managers"
  | "invitations"
  | "agreements"
  | "notifications"
  | "activity"
  | "assistant"
  | "subscription"
  | "reminders"
  | "organization"
  | "support"
  | "settings"
  | "chevron";

export function PortalIcon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    className,
    fill: "none",
    "aria-hidden": true as const,
  };
  const stroke = {
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M4 11.2 12 4l8 7.2" {...stroke} />
          <path d="M7 10.5V20h10v-9.5" {...stroke} />
        </svg>
      );
    case "properties":
      return (
        <svg {...common}>
          <path d="M4 20V8.5L12 4l8 4.5V20" {...stroke} />
          <path d="M9 20v-5h6v5" {...stroke} />
        </svg>
      );
    case "rent":
      return (
        <svg {...common}>
          <rect x="3.5" y="6" width="17" height="12" rx="2.5" {...stroke} />
          <path d="M3.5 10h17M8 14.5h3" {...stroke} />
        </svg>
      );
    case "bills":
      return (
        <svg {...common}>
          <path d="M7 3.5h8l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-10.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z" {...stroke} />
          <path d="M15 3.8V8h4.2M8.5 12h7M8.5 16h5" {...stroke} />
        </svg>
      );
    case "more":
      return (
        <svg {...common}>
          <circle cx="6" cy="12" r="1.4" fill="currentColor" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" />
          <circle cx="18" cy="12" r="1.4" fill="currentColor" />
        </svg>
      );
    case "repairs":
      return (
        <svg {...common}>
          <path d="M14.5 6.5 17.5 3.5l3 3-3 3" {...stroke} />
          <path d="M13.2 7.8 4.8 16.2 4 20l3.8-.8 8.4-8.4" {...stroke} />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M5 16.5 4 20l3.8-1.2A8.5 8.5 0 1 0 5 16.5Z" {...stroke} />
        </svg>
      );
    case "accounts":
      return (
        <svg {...common}>
          <path d="M4 18V6M4 18h16" {...stroke} />
          <path d="M8 14v-3M12 14V8M16 14v-5" {...stroke} />
        </svg>
      );
    case "inspections":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6" {...stroke} />
          <path d="m16 16 4 4" {...stroke} />
        </svg>
      );
    case "handover":
      return (
        <svg {...common}>
          <path d="M8 7h8v10H8z" {...stroke} />
          <path d="M10 7V5h4v2M10 12h4" {...stroke} />
        </svg>
      );
    case "deposit":
      return (
        <svg {...common}>
          <path d="M12 4v12" {...stroke} />
          <path d="m8 12 4 4 4-4" {...stroke} />
          <path d="M5 20h14" {...stroke} />
        </svg>
      );
    case "documents":
      return (
        <svg {...common}>
          <path d="M7 3.5h7l4 4V20H7z" {...stroke} />
          <path d="M14 3.8V8h4" {...stroke} />
        </svg>
      );
    case "insurance":
      return (
        <svg {...common}>
          <path d="M12 3.5 19 6.5v5.2c0 4.2-2.8 7.2-7 8.8-4.2-1.6-7-4.6-7-8.8V6.5L12 3.5Z" {...stroke} />
        </svg>
      );
    case "managers":
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="2.4" {...stroke} />
          <circle cx="16" cy="10" r="2" {...stroke} />
          <path d="M4.5 18.5c.6-2.4 2.4-3.6 4.5-3.6s3.9 1.2 4.5 3.6M14 15.2c1.4-.3 2.8.2 3.8 1.6" {...stroke} />
        </svg>
      );
    case "invitations":
      return (
        <svg {...common}>
          <path d="M4 7h16v10H4z" {...stroke} />
          <path d="m4 8 8 5 8-5" {...stroke} />
        </svg>
      );
    case "agreements":
      return (
        <svg {...common}>
          <path d="M8 4h8v16H8z" {...stroke} />
          <path d="M10.5 8h3M10.5 12h3M10.5 16h2" {...stroke} />
        </svg>
      );
    case "notifications":
      return (
        <svg {...common}>
          <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16Z" {...stroke} />
          <path d="M10 19a2 2 0 0 0 4 0" {...stroke} />
        </svg>
      );
    case "activity":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" {...stroke} />
          <path d="M12 8v4.5l3 2" {...stroke} />
        </svg>
      );
    case "assistant":
      return (
        <svg {...common}>
          <path d="M12 3.5 13.6 8 18 9.5 13.6 11 12 15.5 10.4 11 6 9.5 10.4 8 12 3.5Z" {...stroke} />
          <path d="M17.5 14.5 18.2 16.5 20.2 17.2 18.2 17.9 17.5 19.9 16.8 17.9 14.8 17.2 16.8 16.5 17.5 14.5Z" {...stroke} />
        </svg>
      );
    case "subscription":
      return (
        <svg {...common}>
          <rect x="3.5" y="6" width="17" height="12" rx="2" {...stroke} />
          <path d="M3.5 10h17" {...stroke} />
        </svg>
      );
    case "reminders":
      return (
        <svg {...common}>
          <path d="M12 4.5a6 6 0 0 1 6 6v4l1.2 2H4.8L6 14.5v-4a6 6 0 0 1 6-6Z" {...stroke} />
          <path d="M10 18.5a2 2 0 0 0 4 0" {...stroke} />
        </svg>
      );
    case "organization":
      return (
        <svg {...common}>
          <path d="M4 20V9h6v11M10 20V4h10v16" {...stroke} />
          <path d="M13 8h4M13 12h4M13 16h4" {...stroke} />
        </svg>
      );
    case "support":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" {...stroke} />
          <path d="M9.5 10a2.5 2.5 0 1 1 4.2 1.8c-.7.6-1.2 1-1.2 1.9" {...stroke} />
          <path d="M12 17h.01" {...stroke} />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" {...stroke} />
          <path d="M12 3.5v2.2M12 18.3v2.2M4.8 6.8l1.6 1.6M17.6 15.6l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.8 17.2l1.6-1.6M17.6 8.4l1.6-1.6" {...stroke} />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 6 6 6-6 6" {...stroke} />
        </svg>
      );
  }
}
