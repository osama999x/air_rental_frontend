const pkr = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

export function formatPkr(amount: number) {
  return pkr.format(amount);
}

export function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
