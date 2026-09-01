"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { createStaff, updateStaff } from "../../../actions";
import { FieldError, FormError, SubmitButton } from "../../../_components/ui";
import StatusBadge from "../../../_components/StatusBadge";
import { IDLE_STATE, type Staff } from "@/lib/types";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function AddStaffForm({ onAdded }: { onAdded: () => void }) {
  const [state, formAction] = useActionState(createStaff, IDLE_STATE);
  const errors = state.ok ? undefined : state.fieldErrors;
  const ids = useId();

  /* IDLE_STATE is also { ok: true }, so only close once the action has
     actually produced a fresh success. */
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (submitted && state.ok) onAdded();
  }, [state, submitted, onAdded]);

  return (
    <form action={formAction} onSubmit={() => setSubmitted(true)} noValidate>
      <FormError message={state.ok ? undefined : state.formError} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
        <div className="a-field">
          <label className="a-label" htmlFor={`${ids}-name`}>
            Name
          </label>
          <input
            className="a-input"
            id={`${ids}-name`}
            name="name"
            required
            aria-invalid={Boolean(errors?.name)}
            aria-describedby={errors?.name ? `${ids}-name-error` : undefined}
          />
          <FieldError id={`${ids}-name-error`} message={errors?.name} />
        </div>

        <div className="a-field">
          <label className="a-label" htmlFor={`${ids}-email`}>
            Email
          </label>
          <input
            className="a-input"
            id={`${ids}-email`}
            name="email"
            type="email"
            autoComplete="off"
            required
            aria-invalid={Boolean(errors?.email)}
            aria-describedby={errors?.email ? `${ids}-email-error` : undefined}
          />
          <FieldError id={`${ids}-email-error`} message={errors?.email} />
        </div>

        <div className="a-field">
          <label className="a-label" htmlFor={`${ids}-role`}>
            Role
          </label>
          <select className="a-select" id={`${ids}-role`} name="role" defaultValue="editor">
            <option value="editor">Editor — writes posts</option>
            <option value="admin">Admin — writes posts and manages staff</option>
          </select>
        </div>

        <div className="a-field">
          <label className="a-label" htmlFor={`${ids}-password`}>
            Temporary password
          </label>
          <input
            className="a-input"
            id={`${ids}-password`}
            name="password"
            type="password"
            autoComplete="new-password"
            required
            aria-invalid={Boolean(errors?.password)}
            aria-describedby={errors?.password ? `${ids}-password-error` : `${ids}-password-help`}
          />
          <FieldError id={`${ids}-password-error`} message={errors?.password} />
          {!errors?.password && (
            <p className="a-help" id={`${ids}-password-help`}>
              At least 10 characters. Share it with them directly.
            </p>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <SubmitButton pendingLabel="Adding…">
          <UserPlus size={14} strokeWidth={1.75} aria-hidden="true" />
          Add staff member
        </SubmitButton>
        <button className="a-btn a-btn-secondary" type="button" onClick={onAdded}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function StaffRow({ member, isSelf }: { member: Staff; isSelf: boolean }) {
  const [state, formAction] = useActionState(updateStaff, IDLE_STATE);

  return (
    <>
      <tr>
        <td data-label="Name">
          <strong style={{ fontWeight: 500 }}>{member.name}</strong>
          {isSelf && <span className="a-cell-meta"> — you</span>}
        </td>
        <td data-label="Email" className="a-cell-meta">
          {member.email}
        </td>
        <td data-label="Status">
          <StatusBadge status={member.status} />
        </td>
        <td data-label="Last login" className="a-cell-meta">
          {member.lastLoginAt ? dateFormat.format(member.lastLoginAt) : "never"}
        </td>
        <td data-label="Access">
          <form action={formAction} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="hidden" name="staffId" value={member.id} />
            <select
              className="a-select"
              name="role"
              defaultValue={member.role}
              disabled={isSelf}
              aria-label={`Role for ${member.name}`}
              style={{ width: "auto", minWidth: 92 }}
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <select
              className="a-select"
              name="status"
              defaultValue={member.status}
              disabled={isSelf}
              aria-label={`Status for ${member.name}`}
              style={{ width: "auto", minWidth: 92 }}
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
            {!isSelf && (
              <SubmitButton variant="secondary" pendingLabel="Saving…">
                Save
              </SubmitButton>
            )}
          </form>
        </td>
      </tr>
      {!state.ok && state.formError && (
        <tr>
          <td colSpan={5} style={{ paddingTop: 0 }}>
            <p className="a-error" role="alert">
              {state.formError}
            </p>
          </td>
        </tr>
      )}
    </>
  );
}

export default function StaffManager({
  staff,
  currentStaffId,
}: {
  staff: Staff[];
  currentStaffId: string;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <>
      <div className="a-toolbar" style={{ justifyContent: "flex-end" }}>
        {!adding && (
          <button className="a-btn a-btn-primary" type="button" onClick={() => setAdding(true)}>
            <Plus size={14} strokeWidth={1.75} aria-hidden="true" />
            Add staff
          </button>
        )}
      </div>

      {adding && (
        <>
          <h2 className="a-section-title" style={{ marginTop: 0 }}>
            New staff member
          </h2>
          <div className="a-panel" style={{ marginBottom: 28 }}>
            <AddStaffForm onAdded={() => setAdding(false)} />
          </div>
        </>
      )}

      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Status</th>
              <th scope="col">Last login</th>
              <th scope="col">Access</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <StaffRow
                key={member.id}
                member={member}
                isSelf={member.id === currentStaffId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
