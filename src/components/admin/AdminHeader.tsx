"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AdminHeaderProps {
  pageTitle: string;
}

export function AdminHeader({ pageTitle }: AdminHeaderProps) {
  const { user, adminRole, signOut } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get user initials from email or name
  const getUserInitials = () => {
    if (!user?.email) return "U";
    
    // Try to get name from email (before @)
    const emailName = user.email.split("@")[0];
    
    // If email has dots, use first letter of each part
    if (emailName.includes(".")) {
      return emailName
        .split(".")
        .map(part => part.charAt(0).toUpperCase())
        .join("")
        .slice(0, 2);
    }
    
    // Otherwise use first two characters
    return emailName.slice(0, 2).toUpperCase();
  };

  // Get role display name in Bulgarian
  const getRoleDisplayName = () => {
    switch (adminRole) {
      case "admin":
        return "Администратор";
      case "agent":
        return "Агент";
      case "manager":
        return "Мениджър";
      default:
        return "Потребител";
    }
  };

  // Get display name (use email for now, can be extended with profile data later)
  const getDisplayName = () => {
    if (!user?.email) return "Потребител";
    
    // Extract name from email (before @)
    const emailName = user.email.split("@")[0];
    
    // Convert dots to spaces and capitalize
    return emailName
      .split(".")
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isDropdownOpen]);

  // Handle logout
  const handleLogout = async () => {
    const success = await signOut();
    if (success) {
      router.push("/admin/login");
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-gray-200">
      <div className="flex justify-between items-center px-6 h-full">
        {/* Page Title */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {pageTitle}
          </h1>
        </div>

        {/* User Profile Section */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors duration-200"
          >
            {/* Avatar */}
            <div className="w-8 h-8 bg-[#d4af37] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {getUserInitials()}
              </span>
            </div>

            {/* User Info */}
            <div className="text-sm">
              <span className="text-[#2d3748] font-medium">
                {getDisplayName()} | {getRoleDisplayName()}
              </span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white shadow-lg rounded-lg py-2 z-50">
              {/* Profile Info Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="text-sm font-medium text-gray-900">
                  {getDisplayName()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {user?.email}
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#d4af37] text-white">
                    {getRoleDisplayName()}
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // router.push("/admin/profile"); // Uncomment when profile page is ready
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  disabled
                >
                  <User className="h-4 w-4 mr-3" />
                  Моят профил
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push("/admin/settings");
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Настройки
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-1"></div>

              {/* Logout */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Изход
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
