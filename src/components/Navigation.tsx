'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User, Shield, ChevronDown } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token') || localStorage.getItem('bossToken');
    if (token) {
      setIsAuthenticated(true);
      // Try to get user role from stored user data
      const userData = localStorage.getItem('user') || localStorage.getItem('bossUser');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserRole(user.role);
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
  }, []);

  const navItems = [
    { name: 'Solutions', href: '/solutions' },
    { name: 'PrintBridge', href: '/printbridge' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const featuresItems = [
    { name: 'QR Code Ordering', href: '/features/qr-ordering' },
    { name: 'Chef\'s Screen', href: '/features/chefs-screen' },
    { name: 'Smart Rota System', href: '/features/rota' },
  ];

  const bossItems = [
    { name: 'Boss Panel', href: '/bossdashboard', icon: Shield }
  ];

  return (
    <nav className="bg-black text-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image 
              src="/logo.png" 
              alt="TapTab POS Logo" 
              width={100} 
              height={40}
              className="rounded-lg"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Features Dropdown */}
            <div className="relative">
              <button
                onClick={() => setFeaturesDropdownOpen(!featuresDropdownOpen)}
                className="text-white hover:text-gray-300 transition-colors duration-150 flex items-center space-x-1"
              >
                <span>Features</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${featuresDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {featuresDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {featuresItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-2 text-black hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => setFeaturesDropdownOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-gray-300 transition-colors duration-150"
              >
                {item.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {userRole === 'SUPER_ADMIN' ? (
                  bossItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-white hover:text-gray-300 transition-colors duration-150 flex items-center space-x-1"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))
                ) : (
                  <Link
                    href="/dashboard"
                    className="text-white hover:text-gray-300 transition-colors duration-150 flex items-center space-x-1"
                  >
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-full hover:shadow-md transition-all duration-150 text-sm"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gray-300 transition-colors duration-150"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black border-t border-gray-700">
              {/* Features Dropdown for Mobile */}
              <div>
                <button
                  onClick={() => setFeaturesDropdownOpen(!featuresDropdownOpen)}
                  className="w-full text-left px-3 py-2 text-white hover:text-gray-300 transition-colors duration-150 flex items-center justify-between"
                >
                  <span>Features</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${featuresDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {featuresDropdownOpen && (
                  <div className="pl-4 space-y-1">
                    {featuresItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-150"
                        onClick={() => {
                          setIsOpen(false);
                          setFeaturesDropdownOpen(false);
                        }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-white hover:text-gray-300 transition-colors duration-150"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <>
                  {userRole === 'SUPER_ADMIN' ? (
                    bossItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-3 py-2 text-white hover:text-gray-300 transition-colors duration-150 flex items-center space-x-2"
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    ))
                  ) : (
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-white hover:text-gray-300 transition-colors duration-150 flex items-center space-x-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="block px-3 py-2 bg-white hover:bg-gray-100 text-black rounded-lg mx-3 mt-4 text-center text-sm transition-all duration-150"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 