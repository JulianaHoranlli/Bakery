"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { FaStore } from "react-icons/fa";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "New Order" },
    { href: "/all-orders", label: "All Orders" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-pink-400 shadow-md border-b border-pink-500">
      <div className="max-w-5xl mx-auto flex justify-between items-center h-14 px-4">
        {/* Logo majtas */}
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <FaStore className="w-6 h-6" />
          <span>My Shop</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                pathname === link.href
                  ? "bg-white text-pink-600 shadow-md"
                  : "text-white hover:bg-pink-400"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-pink-400 border-t border-pink-500 shadow-md animate-slide-down">
          <div className="flex flex-col p-4 gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname === link.href
                    ? "bg-white text-pink-600 shadow-md"
                    : "text-white hover:bg-pink-400"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-slide-down {
          animation: slideDown 0.25s ease-out forwards;
        }
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  );
}