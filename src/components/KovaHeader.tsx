"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, ArrowUpRight, ReceiptText } from "lucide-react";

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

export function KovaHeader({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search products from this vendor...",
}: KovaHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDownloadClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const url = getAppStoreUrl();
    if (url !== "https://www.kovadml.com/#download") {
      e.preventDefault();
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <header className="site-header">
      <div className="container nav">
        <Link className="nav__brand" href="/" aria-label="Kova home">
          <img
            src="/brand/kova-logo-main.svg"
            alt="Kova"
            width={118}
            height={27}
          />
        </Link>

        {typeof onSearchChange === "function" && (
          <div className="nav__search">
            <Search size={16} className="nav__search-icon" aria-hidden="true" />
            <input
              type="search"
              className="nav__search-input"
              placeholder={searchPlaceholder}
              value={searchQuery ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label={searchPlaceholder}
            />
          </div>
        )}

        <nav className="nav__links" aria-label="Primary">
          <Link className="nav__link" href="/store/Freddy">
            Featured Storefront
          </Link>
          <Link
            className="nav__link"
            href="/account/receipts"
            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            <ReceiptText size={14} />
            My Receipts
          </Link>
          <Link className="nav__link" href="/vendor-console">
            Vendor Sync Console
          </Link>
        </nav>

        <div className="nav__right">
          <a
            className="btn btn--brand btn--sm"
            href="https://www.kovadml.com/#download"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDownloadClick}
          >
            Download Kova App
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>

          <button
            type="button"
            className="nav__menu-btn"
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

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
              <img
                src="/brand/kova-logo-main.svg"
                alt="Kova"
                width={105}
                height={24}
              />
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {typeof onSearchChange === "function" && (
              <div style={{ position: "relative" }}>
                <input
                  type="search"
                  className="form-input"
                  placeholder={searchPlaceholder}
                  value={searchQuery ?? ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            )}

            <nav className="mobile-drawer__links" aria-label="Mobile">
              <Link
                className="mobile-drawer__link"
                href="/"
                onClick={() => setMobileOpen(false)}
              >
                All Storefronts
              </Link>
              <Link
                className="mobile-drawer__link"
                href="/store/Freddy"
                onClick={() => setMobileOpen(false)}
              >
                Featured Storefront (@Freddy)
              </Link>
              <Link
                className="mobile-drawer__link"
                href="/account/receipts"
                onClick={() => setMobileOpen(false)}
              >
                My Receipts &amp; History
              </Link>
              <Link
                className="mobile-drawer__link"
                href="/vendor-console"
                onClick={() => setMobileOpen(false)}
              >
                Vendor Sync Console
              </Link>
              <a
                className="btn btn--brand"
                href="https://www.kovadml.com/#download"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDownloadClick}
              >
                Download Kova App
                <ArrowUpRight size={14} />
              </a>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
