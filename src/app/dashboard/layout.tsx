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
              <Link
                href="/dashboard/analytics"
                className={getNavLinkClasses(
                  isActiveLink("/dashboard/analytics")
                )}
                title="Analytics"
              >
                <BarChart3 className="w-5 h-5 mb-1" />
                <span className="font-medium">Analytics</span>
              </Link>

              <Link
                href="/dashboard/kds"
                className={getNavLinkClasses(isActiveLink("/dashboard/kds"))}
                title="Chef's Screen"
              >
                <UtensilsCrossed className="w-5 h-5 mb-1" />
                <span className="font-medium">Chef&apos;s Screen</span>
              </Link>

              <Link
                href="/dashboard"
                className={getNavLinkClasses(isActiveLink("/dashboard"))}
                title="Dashboard"
              >
                <Home className="w-5 h-5 mb-1" />
                <span className="font-medium">Dashboard</span>
              </Link>

              <Link
                href="/dashboard/layout"
                className={getNavLinkClasses(isActiveLink("/dashboard/layout"))}
                title="Layout Builder"
              >
                <Layout className="w-5 h-5 mb-1" />
                <span className="font-medium">Layout</span>
              </Link>

              <Link
                href="/dashboard/menu"
                className={getNavLinkClasses(isActiveLink("/dashboard/menu"))}
                title="Menu"
              >
                <Menu className="w-5 h-5 mb-1" />
                <span className="font-medium">Menu</span>
              </Link>

              <Link
                href="/dashboard/orders"
                className={getNavLinkClasses(isActiveLink("/dashboard/orders"))}
                title="Orders"
              >
                <ShoppingCart className="w-5 h-5 mb-1" />
                <span className="font-medium">Orders</span>
              </Link>

              <Link
                href="/dashboard/promotions"
                className={getNavLinkClasses(
                  isActiveLink("/dashboard/promotions")
                )}
                title="Promotions"
              >
                <Percent className="w-5 h-5 mb-1" />
                <span className="font-medium">Promotions</span>
              </Link>

              <Link
                href="/dashboard/rota"
                className={getNavLinkClasses(isActiveLink("/dashboard/rota"))}
                title="Rota"
              >
                <Calendar className="w-5 h-5 mb-1" />
                <span className="font-medium">Rota</span>
              </Link>

              <Link
                href="/dashboard/settings"
                className={getNavLinkClasses(
                  isActiveLink("/dashboard/settings")
                )}
                title="Settings"
              >
                <Settings className="w-5 h-5 mb-1" />
                <span className="font-medium">Settings</span>
              </Link>

              <Link
                href="/dashboard/staff"
                className={getNavLinkClasses(isActiveLink("/dashboard/staff"))}
                title="Staff"
              >
                <Users className="w-5 h-5 mb-1" />
                <span className="font-medium">Staff</span>
              </Link>

              <Link
                href="/dashboard/tables"
                className={getNavLinkClasses(isActiveLink("/dashboard/tables"))}
                title="Tables"
              >
                <Table className="w-5 h-5 mb-1" />
                <span className="font-medium">Tables</span>
              </Link>

              <Link
                href="/dashboard/order-taking"
                className={getNavLinkClasses(
                  isActiveLink("/dashboard/order-taking")
                )}
                title="Take Orders"
              >
                <Plus className="w-5 h-5 mb-1" />
                <span className="font-medium">Take Orders</span>
              </Link>

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
                  {/* Row 1 */}
                  <Link
                    href="/dashboard/analytics"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={getMobileNavItemClasses(
                      isActiveLink("/dashboard/analytics")
                    )}
                  >
                    <BarChart3 className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Analytics</span>
                  </Link>

                  <Link
                    href="/dashboard/kds"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={getMobileNavItemClasses(
                      isActiveLink("/dashboard/kds")
                    )}
                  >
                    <UtensilsCrossed className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">
                      Chef&apos;s Screen
                    </span>
                  </Link>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={getMobileNavItemClasses(
                      isActiveLink("/dashboard")
                    )}
                  >
                    <Home className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </Link>

                  {/* Row 2 */}
                  <Link
                    href="/dashboard/layout"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={getMobileNavItemClasses(
                      isActiveLink("/dashboard/layout")
                    )}
                  >
                    <Layout className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Layout</span>
                  </Link>

                  <Link
                    href="/dashboard/menu"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={getMobileNavItemClasses(
                      isActiveLink("/dashboard/menu")
                    )}
                  >
                    <Menu className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Menu</span>
                  </Link>

                  <Link
                    href="/dashboard/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={getMobileNavItemClasses(
                      isActiveLink("/dashboard/orders")
                    )}
                  >
                    <ShoppingCart className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Orders</span>
                  </Link>

                  {/* Row 3 */}
                  <Link
                    href="/dashboard/promotions"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={getMobileNavItemClasses(
                      isActiveLink("/dashboard/promotions")
                    )}
                  >
                    <Percent className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Promotions</span>
                  </Link>

                  <Link
                    href="/dashboard/rota"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={getMobileNavItemClasses(
                      isActiveLink("/dashboard/rota")
                    )}
                  >
                    <Calendar className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Rota</span>
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={getMobileNavItemClasses(
                      isActiveLink("/dashboard/settings")
                    )}
                  >
                    <Settings className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Settings</span>
                  </Link>

                  {/* Row 4 */}
                  <Link
                    href="/dashboard/staff"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={getMobileNavItemClasses(
                      isActiveLink("/dashboard/staff")
                    )}
                  >
                    <Users className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Staff</span>
                  </Link>

                  <Link
                    href="/dashboard/tables"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={getMobileNavItemClasses(
                      isActiveLink("/dashboard/tables")
                    )}
                  >
                    <Table className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Tables</span>
                  </Link>

                  <Link
                    href="/dashboard/order-taking"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={getMobileNavItemClasses(
                      isActiveLink("/dashboard/order-taking")
                    )}
                  >
                    <Plus className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Take Orders</span>
                  </Link>

                  {/* Row 5 - Logout stays last */}
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
