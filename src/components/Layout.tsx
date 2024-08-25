import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import {
  ShieldCheckIcon,
  SunIcon,
  MoonIcon,
  GlobeAltIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'LuxeDrive Car Rentals',
  description = 'Premium car rentals in the Dominican Republic',
}) => {
  const router = useRouter()
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'guest'
  const { theme, setTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isActive = (pathname: string): boolean => router.pathname === pathname

  const navItems = [
    { href: '/fleet', label: 'Our Fleet' },
    { href: '/locations', label: 'Locations' },
    { href: '/about', label: 'About Us' },
  ]

  const handleSignIn = () => {
    router.push('/login')
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const changeLanguage = (lang: string) => {
    router.push(router.pathname, router.asPath, { locale: lang })
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-card text-card-foreground shadow-md">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Left section - Logo */}
            <Link
              href="/"
              className="text-3xl font-bold text-white"
              aria-label="LuxeDrive Home"
            >
              LuxeDrive
            </Link>

            {/* Center section - Main navigation (hidden on mobile) */}
            <div className="hidden lg:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'text-white font-semibold'
                      : 'text-blue-100 hover:text-white'
                  } transition duration-300`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right section - Theme toggle, language, user menu, and mobile menu button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-blue-700 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <MoonIcon className="h-6 w-6 text-white" />
                ) : (
                  <SunIcon className="h-6 w-6 text-white" />
                )}
              </button>
              <button
                onClick={() =>
                  changeLanguage(router.locale === 'en' ? 'es' : 'en')
                }
                className="p-2 rounded-full hover:bg-blue-700 dark:hover:bg-gray-700"
                aria-label="Change language"
              >
                <GlobeAltIcon className="h-6 w-6 text-white" />
              </button>
              {session ? (
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-blue-700 dark:hover:bg-gray-700"
                  >
                    <UserIcon className="h-6 w-6 text-white" />
                    <span className="hidden lg:inline text-white">
                      {session.user.name}
                    </span>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-semibold">{session.user.name}</p>
                        <p className="text-xs flex items-center">
                          <ShieldCheckIcon className="h-4 w-4 mr-1" />
                          {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Profile
                      </Link>
                      {userRole === 'admin' && (
                        <Link
                          href="/admin/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="p-2 text-white hover:text-blue-200"
                >
                  Log In
                </button>
              )}
              <button
                className="lg:hidden p-2 rounded-full hover:bg-blue-700 dark:hover:bg-gray-700"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6 text-white" />
                ) : (
                  <Bars3Icon className="h-6 w-6 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div
            className={`lg:hidden mt-4 ${isMobileMenuOpen ? 'block' : 'hidden'}`}
          >
            <ul className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block py-2 ${
                      isActive(item.href)
                        ? 'text-white font-semibold'
                        : 'text-blue-100 hover:text-white'
                    } transition duration-300`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/booking"
                  className="inline-block mt-2 px-6 py-2 bg-white text-blue-600 rounded-full hover:bg-blue-100 transition duration-300"
                >
                  Book Now
                </Link>
              </li>
              {session && (
                <>
                  <li className="text-sm text-blue-200">
                    <span className="flex items-center">
                      <ShieldCheckIcon className="h-4 w-4 mr-1" />
                      Role:{' '}
                      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </span>
                  </li>
                  {userRole === 'admin' && (
                    <li>
                      <Link
                        href="/admin"
                        className="block py-2 text-blue-100 hover:text-white transition duration-300"
                      >
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 text-blue-100 hover:text-white"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span>Sign out</span>
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </nav>
      </header>

      <main className="flex-grow dark:bg-gray-900 dark:text-white">
        {children}
      </main>

      <footer className="bg-card text-card-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">LuxeDrive</h3>
              <p className="mb-4">
                Premium car rentals in the Dominican Republic
              </p>
              <div className="flex space-x-4">
                {['facebook', 'twitter', 'instagram'].map((social) => (
                  <a
                    key={social}
                    href={`https://www.${social}.com/luxedrive`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition duration-300"
                    aria-label={`Follow us on ${social}`}
                  >
                    <Image
                      src={`/images/${social}-icon.svg`}
                      alt={`${social} icon`}
                      width={24}
                      height={24}
                    />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="hover:text-blue-400 transition duration-300"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Contact Us</h4>
              <address className="not-italic">
                <p>123 Main St, Santo Domingo</p>
                <p>Dominican Republic</p>
                <p className="mt-2">Phone: +1 (809) 555-1234</p>
                <p>Email: info@luxedrive.com</p>
              </address>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-700 text-center text-gray-400">
            &copy; {new Date().getFullYear()} LuxeDrive Rentals. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
