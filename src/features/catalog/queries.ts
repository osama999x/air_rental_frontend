import { cacheLife } from "next/cache";
import { properties } from "./data";
import type { PropertyType, RentalProperty } from "./types";

/**
 * Property reads. Pages and actions should use these functions only.
 * Replace the bodies with API calls when a public listing endpoint is ready.
 */
export async function listProperties(type?: PropertyType): Promise<RentalProperty[]> {
  "use cache";
  cacheLife("hours");

  if (!type) {
    return properties;
  }

  return properties.filter((property) => property.type === type);
}

export async function listFeaturedProperties(): Promise<RentalProperty[]> {
  "use cache";
  cacheLife("hours");
  return properties.filter((property) => property.featured);
}

export async function getProperty(slug: string): Promise<RentalProperty | undefined> {
  "use cache";
  cacheLife("hours");
  return properties.find((property) => property.slug === slug);
}
