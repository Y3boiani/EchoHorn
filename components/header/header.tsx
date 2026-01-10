"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCircleArrowRight, FaChevronDown, FaTruck, FaUser, FaIdCard, FaMapLocationDot } from "react-icons/fa6";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface ServiceItem {
  name: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ServiceCategory {
  title: string;
  items: ServiceItem[];
}

const serviceCategories: ServiceCategory[] = [
  {
    title: "Customer Services",
    items: [
      {
        name: "Book a Trip",
        href: "/book-trip",
        description: "Book your intercity travel with our fleet",
        icon: FaMapLocationDot,
      },
      {
        name: "Customer Dashboard",
        href: "/portal/customer",
        description: "Track trips, view billing & manage bookings",
        icon: FaUser,
      },
    ],
  },
  {
    title: "Driver & Fleet Services",
    items: [
      {
        name: "Driver Portal",
        href: "/portal/driver",
        description: "Access your driver dashboard & trip assignments",
        icon: FaTruck,
      },
      {
        name: "Fleet Registration",
        href: "/driver-register",
        description: "Register as a driver or fleet owner",
        icon: FaIdCard,
      },
    ],
  },
];

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "#", hasDropdown: true },
  { name: "About", href: "/about" },
];

const Header = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsServicesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsServicesOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsServicesOpen(false);
    }, 150);
  };

  const isServiceActive = pathname.startsWith('/portal') || 
                          pathname === '/book-trip' || 
                          pathname === '/driver-register' ||
                          pathname === '/dashboard';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 w-full ${
        scrolled ? "bg-black/80" : "bg-black/30"
      } backdrop-blur-md border-b border-white/10 z-50 transition-all duration-300`}
    >
      <nav className="container mx-auto flex items-center justify-between h-20 px-6 lg:px-8">
        {/* Left side: Logo */}
        <Link href="/" data-testid="header-logo-link">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Image
              src="/logo.png"
              alt="Echohorn logo"
              width={140}
              height={36}
              priority
            />
          </motion.div>
        </Link>

        {/* Center: Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            
            if (link.hasDropdown) {
              return (
                <div
                  key={link.name}
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={() => setIsServicesOpen(!isServicesOpen)}
                    data-testid="services-dropdown-trigger"
                    className={`flex items-center gap-1.5 px-1 font-medium text-base transition-colors duration-300 ${
                      isServicesOpen || isServiceActive ? "text-yellow-400" : "text-white hover:text-yellow-400"
                    }`}
                  >
                    {link.name}
                    <motion.div
                      animate={{ rotate: isServicesOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FaChevronDown className="w-3 h-3" />
                    </motion.div>
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isServicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[500px] bg-black/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
                        data-testid="services-dropdown"
                      >
                        {/* Arrow */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/95 border-l border-t border-white/10 rotate-45" />
                        
                        <div className="relative grid grid-cols-2 gap-0 p-2">
                          {serviceCategories.map((category, idx) => (
                            <div key={category.title} className={`p-4 ${idx === 0 ? 'border-r border-white/10' : ''}`}>
                              <h3 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-3">
                                {category.title}
                              </h3>
                              <div className="space-y-1">
                                {category.items.map((item) => (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsServicesOpen(false)}
                                    data-testid={`service-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="group flex items-start gap-3 p-3 rounded-xl hover:bg-yellow-400/10 transition-all duration-200"
                                  >
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-400/10 flex items-center justify-center group-hover:bg-yellow-400/20 transition-colors">
                                      <item.icon className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white font-medium group-hover:text-yellow-400 transition-colors">
                                        {item.name}
                                      </p>
                                      <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">
                                        {item.description}
                                      </p>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href}
                data-testid={`nav-link-${link.name.toLowerCase()}`}
                className="relative px-1 font-medium text-base transition-colors duration-300 group"
              >
                <span className={isActive ? "text-yellow-400" : "text-white group-hover:text-yellow-400"}>
                  {link.name}
                </span>
                <motion.div
                  className="absolute left-0 -bottom-1 h-0.5 bg-yellow-400 rounded"
                  initial={false}
                  animate={{ width: isActive ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            );
          })}
        </div>

        {/* Right side: CTA Button */}
        <Link href="/book-trip" data-testid="book-trip-button">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group overflow-hidden flex items-center justify-center gap-2 bg-yellow-400 text-black font-bold py-2.5 px-6 rounded-full shadow-lg shadow-yellow-500/20 transition-colors duration-300"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300 ease-in-out" />
            <span className="relative z-10 flex items-center gap-2 text-sm">
              Book A Trip
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <FaCircleArrowRight />
              </motion.div>
            </span>
          </motion.div>
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white p-2"
          data-testid="mobile-menu-button"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 border-t border-white/10"
          >
            <div className="container mx-auto px-6 py-4 space-y-4">
              <Link href="/" className="block text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <div className="space-y-2">
                <p className="text-yellow-400 text-sm font-semibold uppercase">Services</p>
                {serviceCategories.map((category) =>
                  category.items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block text-gray-300 py-2 pl-4 hover:text-yellow-400"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))
                )}
              </div>
              <Link href="/about" className="block text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
