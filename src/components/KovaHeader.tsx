"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ReceiptText } from "lucide-react";

export function KovaHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isReceiptsActive = Boolean(pathname?.startsWith("/account/receipts"));

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
          {/* Top-left subtle Powered by Kova (no fill, border, or stroke) */}
          <Link href="/" className="header-powered" aria-label="Powered by Kova">
            <span>Powered by</span>
            <img
              src="/brand/kova-logo-main.svg"
              alt="Kova"
              width={56}
              height={14}
            />
          </Link>

          {/* Simplified Desktop Navigation: My Receipts only */}
          <nav className="nav__links" aria-label="Primary">
            <Link
              className={`nav__link ${
                isReceiptsActive ? "nav__link--active" : ""
              }`}
              href="/account/receipts"
            >
              <ReceiptText size={14} />
              My Receipts
            </Link>
          </nav>

          {/* Mobile Icon-Only Menu Trigger */}
          <div className="nav__mobile-actions">
            <button
              ref={triggerRef}
              type="button"
              className="nav__menu-btn"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="kova-nav-dropdown"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Compact Floating Downward Dropdown: My Receipts only */}
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
                isReceiptsActive ? "nav-dropdown-item--active" : ""
              }`}
              href="/account/receipts"
              onClick={() => setMenuOpen(false)}
            >
              <ReceiptText size={14} />
              My Receipts
            </Link>
          </nav>
        </>
      )}
    </>
  );
}
