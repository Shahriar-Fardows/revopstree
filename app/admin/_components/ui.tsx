"use client";

import { useFormStatus } from "react-dom";
import { TriangleAlert } from "lucide-react";

/* Small shared pieces used across console pages. Kept in one file rather than
   one file each — they are a few lines apiece and always used together
   (12 §11: don't over-componentise). */

export function SubmitButton({
  children,
  variant = "primary",
  name,
  value,
  pendingLabel,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  name?: string;
  value?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      className={`a-btn a-btn-${variant}`}
      type="submit"
      name={name}
      value={value}
      disabled={pending}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="a-form-error" role="alert">
      <TriangleAlert size={15} strokeWidth={1.75} aria-hidden="true" />
      {message}
    </p>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p className="a-error" id={id} role="alert">
      {message}
    </p>
  );
}
