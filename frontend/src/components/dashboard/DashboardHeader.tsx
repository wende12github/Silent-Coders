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

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <span className="w-5 h-5 rounded-full">
        {theme === "dark" ? <Moon /> : <Sun />}
      </span>
    </Button>
  );
};

const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle mobile navigation"
      >
        <Menu />
      </button>

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
  const { user, logout } = useAuthStore();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex min-h-14 items-center gap-4 border-b border-border bg-white px-4 sm:px-6 ">
      <MobileNav />
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="default" className="h-8 w-8 p-0">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <button className="relative rounded-full p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 cursor-pointer">
              <Avatar
                src={user.profile_picture}
                alt={user.name}
                fallback={user.name || "John Doe"}
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
