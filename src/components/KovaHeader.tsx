"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ReceiptText, UserCheck, Store } from "lucide-react";

interface KovaHeaderProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export function KovaHeader(_props: KovaHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="site-header">
        <div className="container nav">
          <Link
            className="powered-brand"
            href="/"
            aria-label="Powered by Kova Showroom"
          >
            <span>Powered by</span>
            <img
              src="/brand/kova-logo-main.svg"
              alt="Kova"
              width={62}
              height={15}
            />
          </Link>

          <nav className="nav__links" aria-label="Primary">
            <Link
              className={`nav__link ${pathname === "/" ? "nav__link--active" : ""}`}
              href="/"
            >
              Showroom
            </Link>
            <Link
              className={`nav__link ${
                pathname?.startsWith("/account/receipts")
                  ? "nav__link--active"
                  : ""
              }`}
              href="/account/receipts"
            >
              <ReceiptText size={14} />
              My Receipts
            </Link>
            <Link
              className={`nav__link ${
                pathname?.startsWith("/register") ? "nav__link--active" : ""
              }`}
              href="/register"
            >
              <UserCheck size={14} />
              Buyer Account
            </Link>
          </nav>

          <div className="nav__right">
            <button
              ref={triggerRef}
              type="button"
              className="nav__menu-btn"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="kova-nav-dropdown"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {menuOpen ? <X size={15} /> : <Menu size={15} />}
              <span>Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Compact Floating Downward Dropdown with Subtle Blurred Backdrop */}
      {menuOpen && (
        <>
          <div
            className="nav-dropdown-backdrop"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            ref={menuRef}
            id="kova-nav-dropdown"
            className="nav-dropdown-menu"
            aria-label="Navigation menu"
          >
            <Link
              className={`nav-dropdown-item ${
                pathname === "/" ? "nav-dropdown-item--active" : ""
              }`}
              href="/"
              onClick={() => setMenuOpen(false)}
            >
              <Store size={15} />
              Showroom
            </Link>
            <Link
              className={`nav-dropdown-item ${
                pathname?.startsWith("/account/receipts")
                  ? "nav-dropdown-item--active"
                  : ""
              }`}
              href="/account/receipts"
              onClick={() => setMenuOpen(false)}
            >
              <ReceiptText size={15} />
              My Receipts
            </Link>
            <Link
              className={`nav-dropdown-item ${
                pathname?.startsWith("/register")
                  ? "nav-dropdown-item--active"
                  : ""
              }`}
              href="/register"
              onClick={() => setMenuOpen(false)}
            >
              <UserCheck size={15} />
              Buyer Account
            </Link>
          </nav>
        </>
      )}
    </>
  );
}
