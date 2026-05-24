import { useUser } from "@/store/auth-store";
import { Menu } from "lucide-react";
import { getInitials } from "../layout";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const user = useUser();
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
      </div>

      {/* Right */}
      <div className="topbar__right">
        <button
          className="avatar avatar--topbar"
          title="Sign out"
          suppressHydrationWarning
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
