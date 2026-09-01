import { getCurrentStaff } from "@/lib/dal";
import AdminShell from "../_components/AdminShell";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  /* The real authorisation boundary. Redirects when the session is missing,
     expired, or the account has since been disabled — proxy.ts only sniffs
     for the cookie's presence (architecture.md, Authentication Flow). */
  const staff = await getCurrentStaff();

  return <AdminShell staff={staff}>{children}</AdminShell>;
}
