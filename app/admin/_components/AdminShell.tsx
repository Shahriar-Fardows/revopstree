"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutGrid, LogOut, Menu, Users, X } from "lucide-react";
import { logout } from "../actions";
import type { Staff } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
  icon: typeof FileText;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

export default function AdminShell({
  staff,
  children,
}: {
  staff: Staff;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const groups: NavGroup[] = [
    {
      label: "Content",
      items: [
        { href: "/admin", label: "Overview", icon: LayoutGrid },
        { href: "/admin/posts", label: "Posts", icon: FileText },
      ],
    },
  ];

  if (staff.role === "admin") {
    groups.push({
      label: "Manage",
      items: [{ href: "/admin/staff", label: "Staff", icon: Users }],
    });
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="a-shell" data-menu={menuOpen ? "open" : "closed"}>
      <aside className="a-sidebar">
        <Link className="a-brand" href="/admin" onClick={() => setMenuOpen(false)}>
          <span className="a-brand-mark" aria-hidden="true">
            R
          </span>
          <span>
            RevOps<em>Tree</em>
          </span>
        </Link>

        <nav className="a-nav" aria-label="Console">
          {groups.map((group) => (
            <div key={group.label}>
              <span className="a-nav-group">{group.label}</span>
              {group.items.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  className="a-nav-item"
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="a-sidebar-foot">
          <div className="a-who">
            <strong>{staff.name}</strong>
            <span>{staff.role}</span>
          </div>
          <form action={logout}>
            <button className="a-btn a-btn-secondary a-btn-sm" type="submit">
              <LogOut size={14} strokeWidth={1.75} aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="a-backdrop"
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="a-main">
        <div className="a-topbar">
          <button
            className="a-btn a-btn-ghost"
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X size={16} strokeWidth={1.75} />
            ) : (
              <Menu size={16} strokeWidth={1.75} />
            )}
          </button>
          <span className="a-brand" style={{ height: "auto", padding: 0, border: 0 }}>
            <span className="a-brand-mark" aria-hidden="true">
              R
            </span>
            <span>
              RevOps<em>Tree</em>
            </span>
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
