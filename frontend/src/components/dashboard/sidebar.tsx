import { Link, useLocation } from "react-router-dom";
import {
  Clock,
  LayoutDashboard,
  Calendar,
  Award,
  Settings,
  LogOut,
  BookOpen,
  Wallet,
  Bell,
} from "lucide-react";
import Button from "../ui/Button";
import clsx from "clsx";
import { useLogout } from "../../hooks/hooks";

export default function DashboardSidebar({ visible }: { visible?: boolean }) {
  const location = useLocation();
  const { logout } = useLogout();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Skills",
      href: "/dashboard/myskills",
      icon: BookOpen,
    },
    {
      name: "Sessions",
      href: "/dashboard/sessions",
      icon: Calendar,
    },
    {
      name: "Time Wallet",
      href: "/dashboard/wallet",
      icon: Wallet,
    },
    {
      name: "Leaderboard",
      href: "/dashboard/leaderboard",
      icon: Award,
    },
    // Removed User Chat as Bubbles icon is not standard LucideReact
    // {
    //   name: "User Chat",
    //   href: "/dashboard/chat",
    //   icon: Bubbles,
    // },
    {
      name: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <div
      className={clsx(
        "border-r md:block xsm:w-64 w-50 md:flex-shrink-0 min-h-full md:max-h-screen md:sticky md:top-0",
        "border-border bg-background text-foreground dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark",
        visible ? "" : "hidden"
      )}
    >
      <div className="flex h-screen flex-col">
        <div className="flex h-14 items-center border-b px-4 border-border dark:border-border-dark">
          <Link to="/" className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary dark:text-primary-dark" />
            <span className="text-lg font-bold text-foreground dark:text-foreground-dark">
              TimeBank
            </span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all
                  ${
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground dark:bg-primary-dark dark:text-primary-foreground-dark"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground dark:text-muted-foreground-dark dark:hover:bg-muted-dark dark:hover:text-foreground-dark"
                  }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t p-4 border-border dark:border-border-dark">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
