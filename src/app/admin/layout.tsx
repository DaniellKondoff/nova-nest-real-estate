"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Home, 
  MessageSquare, 
  Star,
  LogOut,
  Loader2 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Skip auth check for login page (handle both with and without trailing slash)
  const isLoginPage = pathname === "/admin/login" || pathname === "/admin/login/";

  useEffect(() => {
    if (!loading && !isLoginPage) {
      if (!user || !isAdmin) {
        router.push("/admin/login/");
      }
    }
  }, [user, isAdmin, loading, router, isLoginPage]);

  const handleLogout = async () => {
    const success = await signOut();
    if (success) {
      router.push("/admin/login/");
    }
  };

  // For login page, just render children without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading during auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#d4af37]" />
          <p className="mt-2 text-gray-600">Проверка на достъпа...</p>
        </div>
      </div>
    );
  }

  // Don't render layout if not admin (will redirect)
  if (!user || !isAdmin) {
    return null;
  }

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard/",
      icon: LayoutDashboard,
    },
    {
      name: "Імоти",
      href: "/admin/properties/",
      icon: Home,
    },
    {
      name: "Запитвания",
      href: "/admin/inquiries/",
      icon: MessageSquare,
    },
    {
      name: "Отзиви",
      href: "/admin/testimonials/",
      icon: Star,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-full bg-[#1a2642] shadow-lg z-30">
        <div className="p-6">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/admin/dashboard/" className="text-white text-xl font-bold">
              Nova Nest Admin
            </Link>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-[#d4af37] text-white' 
                      : 'text-gray-300 hover:text-[#d4af37] hover:bg-white/10'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-[#d4af37] hover:bg-white/10 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Изход</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="fixed top-0 left-64 right-0 h-16 bg-white shadow-sm border-b border-gray-200 z-20">
        <div className="h-full flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Административен панел
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Здравейте, {user.email}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="ml-64 mt-16 p-6">
        {children}
      </main>
    </div>
  );
}
