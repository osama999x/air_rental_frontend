"use client";

import { useActionState, type ComponentProps } from "react";
import { site } from "@/config/site";
import { Button } from "@/components/ui/button";
import type { RentalProperty } from "@/features/catalog/types";
import { submitBookingRequest } from "../actions";
import { initialBookingState, type BookingField } from "../types";

export function BookingForm({
  properties,
  selectedSlug,
}: {
  properties: Pick<RentalProperty, "slug" | "name" | "city">[];
  selectedSlug?: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitBookingRequest,
    initialBookingState,
  );

  if (state.status === "success") {
    return (
      <div className="surface-card p-6" role="status">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
          Reference {state.reference}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy">Request sent</h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="surface-card grid gap-5 p-6" noValidate>
      {state.status === "error" ? (
        <p className="text-sm text-red-700" role="alert">
          {state.message}
        </p>
      ) : null}

      <Field label="Name" name="name" error={state.fieldErrors.name} autoComplete="name" required />
      <Field
        label="Phone"
        name="phone"
        error={state.fieldErrors.phone}
        autoComplete="tel"
        inputMode="tel"
        required
      />
      <label className="grid gap-2 text-sm font-medium">
        City
        <select
          name="city"
          defaultValue=""
          required
          aria-invalid={Boolean(state.fieldErrors.city)}
          aria-describedby={state.fieldErrors.city ? "city-error" : undefined}
          className={inputClass}
        >
          <option value="" disabled>
            Select a city
          </option>
          {site.serviceAreas.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <FieldError id="city-error" message={state.fieldErrors.city} />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Property
        <select
          name="propertySlug"
          defaultValue={selectedSlug ?? ""}
          required
          aria-invalid={Boolean(state.fieldErrors.propertySlug)}
          aria-describedby={state.fieldErrors.propertySlug ? "propertySlug-error" : undefined}
          className={inputClass}
        >
          <option value="" disabled>
            Select a property
          </option>
          {properties.map((property) => (
            <option key={property.slug} value={property.slug}>
              {property.name} · {property.city}
            </option>
          ))}
        </select>
        <FieldError id="propertySlug-error" message={state.fieldErrors.propertySlug} />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Move-in date"
          name="moveInDate"
          type="date"
          error={state.fieldErrors.moveInDate}
          required
        />
        <Field
          label="Months"
          name="months"
          type="number"
          min={1}
          max={36}
          defaultValue="12"
          error={state.fieldErrors.months}
          required
        />
      </div>
      <label className="grid gap-2 text-sm font-medium">
        Notes
        <textarea
          name="notes"
          rows={4}
          maxLength={500}
          aria-invalid={Boolean(state.fieldErrors.notes)}
          aria-describedby={state.fieldErrors.notes ? "notes-error" : undefined}
          className={inputClass}
        />
        <FieldError id="notes-error" message={state.fieldErrors.notes} />
      </label>
      <Button type="submit" disabled={pending} className="sm:w-fit">
        {pending ? "Sending…" : "Request this tenancy"}
      </Button>
    </form>
  );
}

const inputClass =
  "w-full rounded-2xl border border-line bg-[#f4f7fb] px-3 py-3 text-sm font-normal text-foreground outline-none transition focus:border-accent";

function Field({
  label,
  name,
  error,
  ...props
}: {
  label: string;
  name: BookingField;
  error?: string;
} & ComponentProps<"input">) {
  const errorId = `${name}-error`;

  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={inputClass}
        {...props}
      />
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <span id={id} className="text-sm font-normal text-red-700">
      {message}
    </span>
  );
}
