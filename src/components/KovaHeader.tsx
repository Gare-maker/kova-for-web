"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ReceiptText, UserPlus } from "lucide-react";

interface KovaHeaderProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export function getAppStoreUrl(): string {
  if (typeof navigator === "undefined") {
    return "https://www.kovadml.com/#download";
  }
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) {
    return "https://play.google.com/store/apps/details?id=com.kovamarketplace.app";
  }
  if (/iPad|iPhone|iPod/.test(ua)) {
    return "https://apps.apple.com/app/kova";
  }
  return "https://www.kovadml.com/#download";
}

export function KovaHeader(_props: KovaHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer automatically whenever route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent background scroll while mobile menu is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const handleDownloadClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const url = getAppStoreUrl();
    if (url !== "https://www.kovadml.com/#download") {
      e.preventDefault();
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <header className="site-header">
        <div className="container nav">
          <Link className="nav__brand" href="/" aria-label="Kova home">
            <img
              src="/brand/kova-logo-main.svg"
              alt="Kova"
              width={92}
              height={21}
            />
          </Link>

          <nav className="nav__links" aria-label="Primary">
            <Link className="nav__link" href="/">
              Storefront
            </Link>
            <Link
              className="nav__link"
              href="/account/receipts"
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <ReceiptText size={15} />
              My Receipts
            </Link>
            <Link
              className="nav__link"
              href="/register"
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <UserPlus size={15} />
              Buyer Account
            </Link>
          </nav>

          <div className="nav__right">
            <a
              className="ref-download-btn nav__desktop-cta"
              href="https://www.kovadml.com/#download"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDownloadClick}
            >
              Download app
            </a>

            <button
              type="button"
              className="nav__menu-btn"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={19} />
            </button>
          </div>
        </div>
      </header>

      {/* Rendered outside <header> so backdrop-filter never traps position: fixed */}
      {mobileOpen && (
        <div
          className="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="mobile-drawer__panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-drawer__top">
              <Link
                href="/"
                aria-label="Kova home"
                onClick={() => setMobileOpen(false)}
              >
                <img
                  src="/brand/kova-logo-main.svg"
                  alt="Kova"
                  width={88}
                  height={20}
                />
              </Link>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <nav className="mobile-drawer__links" aria-label="Mobile">
              <Link
                className="mobile-drawer__link"
                href="/"
                onClick={() => setMobileOpen(false)}
              >
                Storefront
              </Link>
              <Link
                className="mobile-drawer__link"
                href="/account/receipts"
                onClick={() => setMobileOpen(false)}
              >
                My Receipts
              </Link>
              <Link
                className="mobile-drawer__link"
                href="/register"
                onClick={() => setMobileOpen(false)}
              >
                Buyer Sign Up / Sign In
              </Link>
              <a
                className="ref-download-btn"
                style={{ marginTop: "0.65rem" }}
                href="https://www.kovadml.com/#download"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDownloadClick}
              >
                Download app
              </a>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
