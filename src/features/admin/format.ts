export function formatWhen(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

export function pageCount(total: number, pageSize: number) {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

export function readPage(value: string | undefined) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

const propertyTypes: Record<string, string> = {
  HSE: "House",
  APT: "Apartment",
  SHP: "Shop",
  FLR: "Floor",
  ROM: "Room",
  OFC: "Office",
  WRH: "Warehouse",
  PLT: "Plot",
};

export function propertyTypeLabel(code?: string | null) {
  if (!code) return "—";
  return propertyTypes[code] ?? code;
}

export function prettyLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function shortId(value?: string | null) {
  if (!value) return "—";
  return value.length > 12 ? `${value.slice(0, 8)}…` : value;
}

export function yesNo(value?: boolean | null) {
  if (value === null || value === undefined) return "—";
  return value ? "Yes" : "No";
}
