"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Store, ReceiptText } from "lucide-react";

interface KovaHeaderProps {
  brandName?: string;
}

export function KovaHeader({ brandName = "Zara Blue" }: KovaHeaderProps = {}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isReceiptsActive = Boolean(
    pathname?.startsWith("/account/receipts") || pathname?.startsWith("/receipt/")
  );
  const isShowroomActive = Boolean(
    pathname === "/" ||
      pathname?.startsWith("/store/") ||
      pathname?.startsWith("/product/")
  );

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
          {/* Top-left Storefront Branding: Zara Blue */}
          <Link href="/" className="header-brand-name" aria-label={brandName}>
            {brandName}
          </Link>

          {/* Desktop Navigation: Showroom & My Receipts */}
          <nav className="nav__links" aria-label="Primary navigation">
            <Link
              className={`nav__link ${
                isShowroomActive ? "nav__link--active" : ""
              }`}
              href="/"
              aria-current={isShowroomActive ? "page" : undefined}
            >
              <Store size={14} />
              <span>Showroom</span>
            </Link>
            <Link
              className={`nav__link ${
                isReceiptsActive ? "nav__link--active" : ""
              }`}
              href="/account/receipts"
              aria-current={isReceiptsActive ? "page" : undefined}
            >
              <ReceiptText size={14} />
              <span>My Receipts</span>
            </Link>
          </nav>

          {/* Mobile Only: Existing Icon-Only Menu Trigger */}
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

      {/* Mobile Menu Dropdown containing BOTH Showroom and My Receipts */}
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
            aria-label="Mobile navigation menu"
          >
            <Link
              className={`nav-dropdown-item ${
                isShowroomActive ? "nav-dropdown-item--active" : ""
              }`}
              href="/"
              aria-current={isShowroomActive ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              <Store size={14} />
              <span>Showroom</span>
            </Link>
            <Link
              className={`nav-dropdown-item ${
                isReceiptsActive ? "nav-dropdown-item--active" : ""
              }`}
              href="/account/receipts"
              aria-current={isReceiptsActive ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              <ReceiptText size={14} />
              <span>My Receipts</span>
            </Link>
          </nav>
        </>
      )}
    </>
  );
}
