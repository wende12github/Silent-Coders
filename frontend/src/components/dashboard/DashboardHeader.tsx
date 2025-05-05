import React, { useState } from "react";
import { Bell, Menu, Moon, Sun } from "lucide-react";
import Button from "../ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";
import Sidebar from "./sidebar";
import { AnimatePresence, motion } from "framer-motion";
import Avatar from "../ui/Avatar";
import { useAuthStore } from "../../store/authStore";

import { useThemeStore } from "../../store/themeStore";
import { useLogout } from "../../hooks/hooks";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Moon /> : <Sun />}
    </Button>
  );
};

const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        size="icon"
        variant="ghost"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle mobile navigation"
      >
        <Menu />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="fixed left-0 top-0 z-50 h-full bg-white md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Sidebar visible />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
export default function DashboardHeader() {
  const { user } = useAuthStore();

  if (!user) return null;
  const { logout } = useLogout();

  return (
    <header className="sticky top-0 z-30 flex min-h-14 items-center gap-4 border-b border-border bg-white px-4 sm:px-6 ">
      <MobileNav />
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <button className="relative rounded-full p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 cursor-pointer">
              <Avatar
                src={user.profile_picture}
                alt={user.first_name || "U"}
                fallback={user.first_name || "John Doe"}
                className=""
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => console.log("Profile clicked")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Settings clicked")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
