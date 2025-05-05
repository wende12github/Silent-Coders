"use client";

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
  Bubbles,
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
    {
      name: "User Chat",
      href: "/dashboard/chat",
      icon: Bubbles,
    },
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
        " border-r border-border bg-background md:block xsm:w-64 w-50 md:flex-shrink-0 min-h-full md:max-h-screen md:sticky md:top-0",
        visible ? "" : "hidden"
      )}
    >
      <div className="flex h-screen flex-col">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link to="/" className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">TimeBank</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t border-border p-4">
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
