"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCircleArrowRight } from "react-icons/fa6";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Product", href: "/product" },
  { name: "Vision", href: "/vision" },
  { name: "Features", href: "/features" },
  { name: "About", href: "/about" },
];

const Header = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 w-full ${
        scrolled ? "bg-black/50" : "bg-black/30"
      } backdrop-blur-sm border-b border-white/10 z-50 transition-all duration-300`}
    >
      <nav className="container mx-auto flex items-center justify-between h-24 px-8">
        {/* Left side: Logo and Navigation */}
        <div className="flex items-center gap-16">
          <Link href="/" data-testid="header-logo-link">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Image
                src="/logo.png"
                alt="Echohorn logo"
                width={150}
                height={40}
                priority
              />
            </motion.div>
          </Link>

          <ul className="flex gap-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    data-testid={`nav-link-${link.name.toLowerCase()}`}
                    className="relative inline-block px-1 text-white font-medium text-base capitalize transition-colors duration-300 group"
                  >
                    <motion.span
                      className={isActive ? "text-yellow-400" : "group-hover:text-yellow-400"}
                    >
                      {link.name}
                    </motion.span>
                    <motion.div
                      className="absolute left-0 -bottom-1 h-1 bg-yellow-400 rounded"
                      initial={false}
                      animate={{
                        width: isActive ? "100%" : "0%",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div
                      className="absolute left-0 -bottom-1 h-1 bg-yellow-400 rounded opacity-0 group-hover:opacity-100"
                      initial={{ width: "0%" }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right side: Book a Trial Button */}
        <Link href="/reservation" data-testid="book-trial-button">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group overflow-hidden flex items-center justify-center gap-2 bg-[#ffe000] text-black font-bold py-2.5 px-8 rounded-full shadow-lg shadow-yellow-500/20 transition-colors duration-300 outline-none"
          >
            <span className="absolute inset-0 w-full h-full bg-[#FF6347] rounded-full scale-0 group-hover:scale-150 transition-transform duration-300 ease-in-out" />
            <span className="relative z-10 flex items-center gap-2">
              Book A Trial
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <FaCircleArrowRight />
              </motion.div>
            </span>
          </motion.div>
        </Link>
      </nav>
    </motion.header>
  );
};

export default Header;