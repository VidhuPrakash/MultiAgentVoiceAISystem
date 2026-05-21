import { useIsAdmin, useUser } from "@/store/auth-store";
import { ChevronLeft, ChevronRight, X, Zap } from "lucide-react";
import { NavLink } from "./nav-link";
import { UserMenu } from "./user-menu";
import { adminNav, getInitials, userNav } from "../layout";

export function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const isAdmin = useIsAdmin();
  const user = useUser();
  const nav = isAdmin ? adminNav : userNav;
  const initials = getInitials(user?.name);
  const displayName = user?.name ?? "User";
  const subtitle = isAdmin ? "Administrator" : (user?.email ?? "Member");

  const content = (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      {/* Logo row */}
      <div className="sidebar__logo">
        <div className="w-7 h-7 rounded-[6px] flex items-center justify-center flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" />
          </svg>
        </div>
        {!collapsed && (
          <span
            className="text-[13px] font-medium tracking-[0.5px]"
            style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}
          >
            Multi<span style={{ color: "var(--text-2)" }}>AgentVoice</span>
          </span>
        )}
        {!collapsed && (
          <button
            className="sidebar__collapse-btn"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Nav section */}
      <nav className="sidebar__nav">
        {!collapsed && (
          <span className="sidebar__section-label">
            {isAdmin ? "Administration" : "Navigation"}
          </span>
        )}
        {nav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar__bottom">
        {collapsed && (
          <button
            className="sidebar__expand-btn"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
          >
            <ChevronRight size={14} />
          </button>
        )}
        <UserMenu
          collapsed={collapsed}
          name={displayName}
          subtitle={subtitle}
          initials={initials}
        />
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop — sticky */}
      <div className="sidebar-desktop">{content}</div>

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? "sidebar-overlay--open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <div
        className={`sidebar-drawer ${mobileOpen ? "sidebar-drawer--open" : ""}`}
      >
        {content}
        <button
          className="sidebar-drawer__close"
          onClick={() => setMobileOpen(false)}
        >
          <X size={15} />
        </button>
      </div>
    </>
  );
}
