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

interface User {
  id: string;
  name: string;
  username: string;
  profile_picture?: string;
}

const useAuth = () => {
  const user: User | null = {
    id: "user-123",
    name: "John Doe",
    username: "johndoe",
    profile_picture: "https://placehold.co/100x100/4f46e5/ffffff?text=JD",
  };

  const logout = () => {
    console.log("Mock logout called");
  };

  return { user, logout };
};

const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  return (
    <button
      className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 cursor-pointer"
      onClick={() => setIsDarkMode(!isDarkMode)}
      aria-label="Toggle theme"
    >
      <span
      className="w-5 h-5 rounded-full" 
      >
        {isDarkMode ? <Moon /> : <Sun />}
      </span>
    </button>
  );
};

const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button
        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle mobile navigation"
      >
        <Menu/>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div className="w-64 bg-white h-full p-4">
            <p className="text-gray-900">Mobile Menu</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  className?: string;
  fallbackClassName?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  className,
  fallbackClassName,
}) => (
  <div
    className={`relative flex shrink-0 overflow-hidden rounded-full h-10 w-10 ${
      className || ""
    }`}
  >
    {src ? (
      <img
        src={src}
        alt={alt}
        className="aspect-square h-full w-full object-cover"
      />
    ) : (
      <div
        className={`flex items-center justify-center h-full w-full bg-gray-200 text-sm font-semibold text-gray-700 ${
          fallbackClassName || ""
        }`}
      >
        {fallback.charAt(0)}
      </div>
    )}
  </div>
);

export default function DashboardHeader() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-white px-4 sm:px-6 ">
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
                fallback={user.name}
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
