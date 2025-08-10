"use client";

import React, { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import {
  Home,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Menu,
  Table,
  Plus,
  LogOut,
  Calendar,
  Percent,
  UtensilsCrossed,
  X,
  Layout,
} from "lucide-react";
import { PrintBridgeProvider } from "@/contexts/PrintBridgeContext";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/lib/use-auth";
import {
  getAccessibleNavigation,
  hasPageAccess,
  getDefaultPageForRole,
  UserRole,
} from "@/lib/role-permissions";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, logout } = useAuth();

  // Get JWT token and user role from localStorage
  useEffect(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("bossToken");
    const userData = localStorage.getItem("user");

    if (token) {
      setJwtToken(token);
    }

    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role || "");
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("🔐 User not authenticated, redirecting to login");
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Check page access and redirect if user doesn't have permission
  useEffect(() => {
    if (userRole && !hasPageAccess(userRole, pathname)) {
      const defaultPage = getDefaultPageForRole(userRole);
      console.log(
        `🚫 Access denied for role ${userRole} to ${pathname}, redirecting to ${defaultPage}`
      );
      router.push(defaultPage);
    }
  }, [userRole, pathname, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Check if a link is active
  const isActiveLink = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const getNavLinkClasses = (isActive: boolean) => {
    const baseClasses =
      "flex flex-col items-center justify-center px-2 py-3 md:px-3 transition-colors text-xs min-w-max whitespace-nowrap";
    const activeClasses = isActive
      ? "bg-gray-800 text-white rounded-lg"
      : "text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg";

    return `${baseClasses} ${activeClasses}`;
  };

  const getMobileNavItemClasses = (isActive: boolean) => {
    const baseClasses =
      "flex flex-col items-center justify-center p-4 rounded-2xl transition-colors text-center min-h-[100px]";
    const activeClasses = isActive
      ? "bg-blue-50 text-blue-600 border-2 border-blue-200"
      : "text-gray-600 hover:bg-gray-50 border-2 border-transparent";

    return `${baseClasses} ${activeClasses}`;
  };

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const icons: {
      [key: string]: React.ComponentType<{ className?: string }>;
    } = {
      Home,
      BarChart3,
      UtensilsCrossed,
      ShoppingCart,
      Plus,
      Menu,
      Table,
      Layout,
      Users,
      Calendar,
      Percent,
      Settings,
    };
    return icons[iconName] || Home;
  };

  // Get accessible navigation items for current user role
  const accessibleNavigation = userRole
    ? getAccessibleNavigation(userRole as UserRole)
    : [];

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <PrintBridgeProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Left Sidebar - Thin sidebar with status indicators */}
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col">
          <DashboardHeader jwtToken={jwtToken} userRole={userRole} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto bg-gray-50">{children}</main>

          {/* Desktop Navigation - Hidden on Mobile */}
          <nav className="hidden md:block bg-black border-t border-gray-800">
            <div className="flex items-center justify-around max-w-screen-xl mx-auto px-4 py-2">
              {accessibleNavigation.map((navItem) => {
                const IconComponent = getIconComponent(navItem.icon);
                return (
                  <Link
                    key={navItem.id}
                    href={navItem.href}
                    className={getNavLinkClasses(isActiveLink(navItem.href))}
                    title={navItem.title}
                  >
                    <IconComponent className="w-5 h-5 mb-1" />
                    <span className="font-medium">{navItem.title}</span>
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                className={getNavLinkClasses(false)}
                title="Logout"
              >
                <LogOut className="w-5 h-5 mb-1" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </nav>

          {/* Mobile Navigation - Menu Button */}
          <div className="md:hidden bg-black border-t border-gray-800 px-4 py-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
              <span className="font-medium">Menu</span>
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 md:hidden max-h-[80vh] overflow-y-auto animate-slide-up shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Navigation
                </h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {accessibleNavigation.map((navItem) => {
                    const IconComponent = getIconComponent(navItem.icon);
                    return (
                      <Link
                        key={navItem.id}
                        href={navItem.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={getMobileNavItemClasses(
                          isActiveLink(navItem.href)
                        )}
                      >
                        <IconComponent className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">
                          {navItem.title}
                        </span>
                      </Link>
                    );
                  })}

                  {/* Logout always visible */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className={getMobileNavItemClasses(false)}
                  >
                    <LogOut className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>

              {/* Handle for dragging */}
              <div className="flex justify-center pb-4">
                <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </>
        )}
      </div>
    </PrintBridgeProvider>
  );
}
