"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ReceiptText } from "lucide-react";

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
            width={110}
            height={25}
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
                width={100}
                height={23}
              />
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
                My Receipts &amp; History
              </Link>
              <a
                className="ref-download-btn"
                style={{ marginTop: "0.5rem" }}
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
    </header>
  );
}
