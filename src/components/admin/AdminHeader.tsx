"use client";

import { useAuth } from "@/hooks/useAuth";

interface AdminHeaderProps {
  pageTitle: string;
}

export function AdminHeader({ pageTitle }: AdminHeaderProps) {
  const { user, adminRole } = useAuth();

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
        <div className="flex items-center space-x-3">
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
        </div>
      </div>
    </header>
  );
}
