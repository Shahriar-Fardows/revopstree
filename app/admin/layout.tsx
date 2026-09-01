import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Console | RevopsTree",
  robots: { index: false, follow: false },
};

/* Deliberately does no auth work: /admin/login lives under this segment too,
   and checking the session here would redirect the login page to itself.
   The authenticated shell is the (console) route group below. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin">{children}</div>;
}
