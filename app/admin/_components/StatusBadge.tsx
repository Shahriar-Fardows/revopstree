/* Status is never carried by colour alone — the dot is paired with a text
   label so it survives colour-blindness and greyscale (13 §32). */

const TONE: Record<string, string> = {
  published: "a-badge-success",
  active: "a-badge-success",
  draft: "a-badge-warning",
  disabled: "a-badge-muted",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`a-badge ${TONE[status] ?? ""}`}>
      <i aria-hidden="true" />
      {status}
    </span>
  );
}
