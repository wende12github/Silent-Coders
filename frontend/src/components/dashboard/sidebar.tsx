"use client"

import { Link, useLocation } from "react-router-dom" 
import { Clock, LayoutDashboard, Calendar, Users, Award, Settings, LogOut, BookOpen, Wallet } from "lucide-react"
import Button from "../ui/Button"
import { useAuthStore } from "../../store/authStore"

export default function DashboardSidebar() {
  const location = useLocation()
  const { logout } = useAuthStore()

  const isActive = (path: string) => {
    return location.pathname === path
  }

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
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="hidden border-r border-border bg-background md:block md:w-64 md:flex-shrink-0 max-h-screen">
      <div className="flex h-full flex-col">
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
          <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
