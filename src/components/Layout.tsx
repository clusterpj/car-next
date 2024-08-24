// File: src/components/Layout.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();

  const isActive = (pathname: string) => router.pathname === pathname;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-blue-600">
            LuxeDrive
          </Link>
          <div className="space-x-6">
            <Link
              href="/fleet"
              className={`${
                isActive('/fleet') ? 'text-blue-600' : 'text-gray-600'
              } hover:text-blue-600 transition`}
            >
              Our Fleet
            </Link>
            <Link
              href="/locations"
              className={`${
                isActive('/locations') ? 'text-blue-600' : 'text-gray-600'
              } hover:text-blue-600 transition`}
            >
              Locations
            </Link>
            <Link
              href="/about"
              className={`${
                isActive('/about') ? 'text-blue-600' : 'text-gray-600'
              } hover:text-blue-600 transition`}
            >
              About Us
            </Link>
            <Link
              href="/booking"
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
            >
              Book Now
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow">{children}</main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="text-2xl font-bold mb-4 md:mb-0">LuxeDrive</div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-4">
              <Link href="/terms" className="hover:text-blue-400 transition">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-blue-400 transition">
                Privacy Policy
              </Link>
              <Link href="/contact" className="hover:text-blue-400 transition">
                Contact Us
              </Link>
              <Link href="/faq" className="hover:text-blue-400 transition">
                FAQ
              </Link>
            </div>
          </div>
          <div className="flex justify-center space-x-6 mb-8">
            {/* Social media icons */}
            {/* ... (social media SVG icons) ... */}
          </div>
          <div className="text-center text-gray-400">
            &copy; {new Date().getFullYear()} LuxeDrive Rentals. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;