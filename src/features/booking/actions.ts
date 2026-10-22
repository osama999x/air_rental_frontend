"use server";

import { getProperty } from "@/features/catalog/queries";
import type { BookingState } from "./types";
import { readBookingInput, validateBooking } from "./validation";

export async function submitBookingRequest(
  _previous: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const input = readBookingInput(formData);
  const property = input.propertySlug ? await getProperty(input.propertySlug) : undefined;
  const fieldErrors = validateBooking(input, todayInKarachi(), Boolean(property));

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  return {
    status: "success",
    message: `Tenancy request received for ${property?.name}. The owner confirms the agreement before it starts.`,
    fieldErrors: {},
    reference: crypto.randomUUID().slice(0, 8).toUpperCase(),
  };
}

function todayInKarachi() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
