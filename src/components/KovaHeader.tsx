"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, ReceiptText } from "lucide-react";

export function KovaHeader() {
  const pathname = usePathname();

  const isReceiptsActive = Boolean(
    pathname?.startsWith("/account/receipts") || pathname?.startsWith("/receipt/")
  );
  const isShowroomActive = Boolean(
    pathname === "/" ||
      pathname?.startsWith("/store/") ||
      pathname?.startsWith("/product/")
  );

  return (
    <header className="site-header">
      <div className="container nav">
        {/* Reduced, subtle top-left Powered by Kova branding */}
        <Link href="/" className="header-powered" aria-label="Powered by Kova">
          <span>Powered by</span>
          <img
            src="/brand/kova-logo-main.svg"
            alt="Kova"
            width={44}
            height={11}
          />
        </Link>

        {/* Clear, directly tappable Showroom & My Receipts navigation on desktop and mobile */}
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
      </div>
    </header>
  );
}
