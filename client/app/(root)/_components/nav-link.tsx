import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export function NavLink({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={[
        "nav-link",
        active ? "nav-link--active" : "nav-link--idle",
        collapsed ? "nav-link--collapsed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {active && <span className="nav-link__bar" />}
      <Icon
        size={15}
        strokeWidth={active ? 2.2 : 1.7}
        className="nav-link__icon"
      />
      {!collapsed && <span className="nav-link__label">{item.label}</span>}
    </Link>
  );
}
