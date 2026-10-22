export const propertyTypes = [
  {
    value: "house",
    label: "House",
    blurb: "Standalone homes let on a monthly tenancy.",
  },
  {
    value: "apartment",
    label: "Apartment",
    blurb: "Flats in a residential building, rented by the month.",
  },
  {
    value: "shop",
    label: "Shop",
    blurb: "Street shops for a retail tenant.",
  },
  {
    value: "office",
    label: "Office",
    blurb: "Fitted offices for a business tenancy.",
  },
  {
    value: "room",
    label: "Room",
    blurb: "A single room inside a larger property.",
  },
  {
    value: "warehouse",
    label: "Warehouse",
    blurb: "Storage space with its own tenancy record.",
  },
] as const;

export type PropertyType = (typeof propertyTypes)[number]["value"];

export type RentalProperty = {
  slug: string;
  name: string;
  type: PropertyType;
  city: string;
  area: string;
  monthlyRent: number;
  sizeLabel: string;
  summary: string;
  features: string[];
  featured: boolean;
};

export function isPropertyType(value: string | undefined): value is PropertyType {
  return propertyTypes.some((type) => type.value === value);
}

export function propertyTypeLabel(value: PropertyType) {
  return propertyTypes.find((type) => type.value === value)?.label ?? value;
}
