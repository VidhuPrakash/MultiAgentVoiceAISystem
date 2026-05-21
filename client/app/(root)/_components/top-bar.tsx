import { useAuthStore, useIsAdmin, useUser } from "@/store/auth-store";
import { Bell, Menu, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { adminNav, getInitials, userNav } from "../layout";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();
  const user = useUser();
  const logout = useAuthStore((s) => s.logout);
  const allNav = [...adminNav, ...userNav];
  const current = allNav.find(
    (n) => pathname === n.href || pathname.startsWith(n.href + "/"),
  );
  const pageTitle = current?.label ?? "Dashboard";
  const initials = getInitials(user?.name);

  return (
    <header className="topbar">
      {/* Left */}
      <div className="topbar__left">
        <button
          className="topbar__menu-btn"
          onClick={onMenuClick}
          suppressHydrationWarning
        >
          <Menu size={16} />
        </button>
        <div className="topbar__title-block">
          <h1 className="topbar__title">{pageTitle}</h1>
        </div>
      </div>

      {/* Right */}
      <div className="topbar__right">
        <button
          className="avatar avatar--topbar"
          title="Sign out"
          onClick={() => logout()}
          suppressHydrationWarning
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
