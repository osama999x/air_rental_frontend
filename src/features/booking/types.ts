export type BookingField =
  | "name"
  | "phone"
  | "city"
  | "moveInDate"
  | "months"
  | "propertySlug"
  | "notes";

export type BookingState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors: Partial<Record<BookingField, string>>;
  reference?: string;
};

export const initialBookingState: BookingState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};
