import type { BookingField } from "./types";

export type BookingInput = {
  name: string;
  phone: string;
  city: string;
  moveInDate: string;
  months: string;
  propertySlug: string;
  notes: string;
};

const fieldNames: BookingField[] = [
  "name",
  "phone",
  "city",
  "moveInDate",
  "months",
  "propertySlug",
  "notes",
];

export function readBookingInput(formData: FormData): BookingInput {
  return {
    name: readText(formData, "name"),
    phone: readText(formData, "phone"),
    city: readText(formData, "city"),
    moveInDate: readText(formData, "moveInDate"),
    months: readText(formData, "months"),
    propertySlug: readText(formData, "propertySlug"),
    notes: readText(formData, "notes"),
  };
}

export function validateBooking(
  input: BookingInput,
  today: string,
  propertyExists: boolean,
): Partial<Record<BookingField, string>> {
  const fieldErrors: Partial<Record<BookingField, string>> = {};

  if (input.name.length < 2 || input.name.length > 80) {
    fieldErrors.name = "Enter a name between 2 and 80 characters.";
  }

  const digits = input.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    fieldErrors.phone = "Enter a phone number with 10 to 15 digits.";
  }

  if (input.city.length < 2) {
    fieldErrors.city = "Choose the city for this tenancy.";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.moveInDate)) {
    fieldErrors.moveInDate = "Choose a move-in date.";
  } else if (input.moveInDate < today) {
    fieldErrors.moveInDate = "Move-in date cannot be in the past.";
  }

  const months = Number(input.months);
  if (!Number.isInteger(months) || months < 1 || months > 36) {
    fieldErrors.months = "Tenancy length must be a whole number of months from 1 to 36.";
  }

  if (!input.propertySlug) {
    fieldErrors.propertySlug = "Choose a property.";
  } else if (!propertyExists) {
    fieldErrors.propertySlug = "That property is no longer listed.";
  }

  if (input.notes.length > 500) {
    fieldErrors.notes = "Keep notes under 500 characters.";
  }

  return fieldErrors;
}

function readText(formData: FormData, field: BookingField) {
  if (!fieldNames.includes(field)) {
    return "";
  }

  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}
