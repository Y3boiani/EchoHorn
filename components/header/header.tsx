// File: app/components/header/Header.tsx

"use client";
import { FaCircleArrowRight } from "react-icons/fa6";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Product", href: "/product" },
  { name: "Vision", href: "/vision" },
  { name: "Features", href: "/features" },
  { name: "About", href: "/about" },
];

const Header = () => (
  <header className="fixed top-0 left-0 w-full bg-black/30 backdrop-blur-sm border-b border-white/10 z-50">
    <nav className="container mx-auto flex items-center justify-between h-24 px-8">
      {/* Left side: Logo and Navigation */}
      <div className="flex items-center gap-16">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Echohorn logo"
            width={150}
            height={40}
            priority
          />
        </Link>

        <ul className="flex gap-10">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className={`
                  relative inline-block px-1 text-white font-medium text-base capitalize
                  transition-colors duration-300
                  before:content-['']
                  before:absolute before:left-0 before:-bottom-1
                  before:rounded before:w-0 before:h-1
                  before:bg-yellow-400
                  before:transition-all before:duration-500
                  hover:text-yellow-400
                  hover:before:w-full
                `}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Right side: Book a Trial Button */}
      <Link
        href="/reservation"
        className="
          relative group overflow-hidden /* 1. Added relative, group, and overflow-hidden */
          flex items-center justify-center gap-2
          bg-[#ffe000] text-black font-bold
          py-2.5 px-8
          rounded-full 
          shadow-lg shadow-yellow-500/20
          transition-colors duration-300
          outline-none
        "
      >
        {/* 2. Added a new span for the circular hover effect */}
        <span
          className="
            absolute inset-0 w-full h-full 
            bg-[#FF6347] /* The final hover color */
            rounded-full 
            scale-0 /* Start scaled down to nothing */
            group-hover:scale-150 /* On parent hover, scale up to cover the button */
            transition-transform duration-300 ease-in-out /* Smooth animation */
          "
        />
        {/* 3. The text and icon are now in a relative container to stay on top */}
        <span className="relative z-10 flex items-center gap-2">
          Book A Trial
          <FaCircleArrowRight />
        </span>
      </Link>
    </nav>
  </header>
);

export default Header;