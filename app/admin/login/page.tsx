"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { FieldError, FormError, SubmitButton } from "../_components/ui";
import { IDLE_STATE } from "@/lib/types";

export default function LoginPage() {
  const [state, formAction] = useActionState(login, IDLE_STATE);
  const errors = state.ok ? undefined : state.fieldErrors;

  return (
    <div className="a-login">
      <div className="a-login-box">
        <div className="a-login-brand">
          <span className="a-brand-mark" aria-hidden="true">
            R
          </span>
          <span>
            RevOps<em style={{ fontStyle: "normal", color: "var(--a-text-3)" }}>Tree</em>
          </span>
        </div>

        <h1>Sign in to the console</h1>
        <p className="a-login-sub">Staff access only.</p>

        <form action={formAction} noValidate>
          <FormError message={state.ok ? undefined : state.formError} />

          <div className="a-field">
            <label className="a-label" htmlFor="email">
              Email
            </label>
            <input
              className="a-input"
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              autoFocus
              aria-invalid={Boolean(errors?.email)}
              aria-describedby={errors?.email ? "email-error" : undefined}
            />
            <FieldError id="email-error" message={errors?.email} />
          </div>

          <div className="a-field">
            <label className="a-label" htmlFor="password">
              Password
            </label>
            <input
              className="a-input"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-invalid={Boolean(errors?.password)}
              aria-describedby={errors?.password ? "password-error" : undefined}
            />
            <FieldError id="password-error" message={errors?.password} />
          </div>

          <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
        </form>
      </div>
    </div>
  );
}
