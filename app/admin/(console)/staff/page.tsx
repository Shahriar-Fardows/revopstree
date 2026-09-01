import Link from "next/link";
import { ShieldX } from "lucide-react";
import { getCurrentStaff, listStaff, requireAdmin } from "@/lib/dal";
import StaffManager from "./_components/StaffManager";

export default async function StaffPage() {
  const admin = await requireAdmin();

  /* Editors reach a 403, not a redirect — being told "you are signed in but
     this is not yours" is clearer than bouncing them somewhere else.
     The matching check also runs inside createStaff/updateStaff, so hiding
     this page is presentation, not protection (FR-2.3, FR-2.4). */
  if (!admin) {
    return (
      <div className="a-page">
        <div className="a-forbidden">
          <ShieldX size={22} strokeWidth={1.5} aria-hidden="true" />
          <h1>Staff management is admin-only</h1>
          <p>
            Your account has the editor role, which covers writing and publishing posts. Ask an
            admin if you need access here.
          </p>
          <Link className="a-btn a-btn-secondary" href="/admin">
            Back to overview
          </Link>
        </div>
      </div>
    );
  }

  const [staff, current] = await Promise.all([listStaff(), getCurrentStaff()]);

  return (
    <div className="a-page">
      <header className="a-page-head">
        <div>
          <span className="a-eyebrow">Manage</span>
          <h1 className="a-title">Staff</h1>
          <p className="a-desc">
            Admins manage staff and posts. Editors write and publish posts only. Accounts are
            disabled rather than deleted so their posts keep the right byline.
          </p>
        </div>
      </header>

      <StaffManager staff={staff} currentStaffId={current.id} />
    </div>
  );
}
