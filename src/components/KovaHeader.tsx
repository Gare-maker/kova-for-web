"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ReceiptText,
  History,
  UserCheck,
  Store,
  ArrowLeft,
} from "lucide-react";

interface KovaHeaderProps {
  backHref?: string;
  onBack?: () => void;
}

export function KovaHeader({ backHref = "/", onBack }: KovaHeaderProps = {}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHistoryQuery, setIsHistoryQuery] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isHome = pathname === "/";
  const isReceiptsBase = pathname?.startsWith("/account/receipts");
  const isHistoryView = Boolean(isReceiptsBase && isHistoryQuery);
  const isReceiptsView = Boolean(isReceiptsBase && !isHistoryQuery);

  useEffect(() => {
    setMenuOpen(false);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setIsHistoryQuery(params.get("view") === "history");
    }
  }, [pathname]);

  useEffect(() => {
    if (!isHome) {
      router.prefetch(backHref);
    }
  }, [isHome, router, backHref]);

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

  const handleBackToShowroom = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false);
    if (onBack) {
      e.preventDefault();
      onBack();
      return;
    }
    if (
      typeof window !== "undefined" &&
      backHref === "/" &&
      window.history.length > 1 &&
      document.referrer &&
      new URL(document.referrer).origin === window.location.origin &&
      new URL(document.referrer).pathname === "/"
    ) {
      e.preventDefault();
      router.back();
    }
  };

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

          {/* Desktop Navigation: Back to Showroom, My Receipts, History, Buyer Account */}
          <nav className="nav__links" aria-label="Primary">
            {isHome ? (
              <Link className="nav__link nav__link--active" href="/">
                <Store size={14} />
                Showroom
              </Link>
            ) : (
              <Link
                href={backHref}
                prefetch={true}
                onClick={handleBackToShowroom}
                className="nav__link"
              >
                <ArrowLeft size={14} />
                Back to Showroom
              </Link>
            )}

            <Link
              className={`nav__link ${isReceiptsView ? "nav__link--active" : ""}`}
              href="/account/receipts"
              onClick={() => {
                setIsHistoryQuery(false);
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("kova:receiptsview", { detail: "receipts" }));
                }
              }}
            >
              <ReceiptText size={14} />
              My Receipts
            </Link>

            <Link
              className={`nav__link ${isHistoryView ? "nav__link--active" : ""}`}
              href="/account/receipts?view=history"
              onClick={() => {
                setIsHistoryQuery(true);
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("kova:receiptsview", { detail: "history" }));
                }
              }}
            >
              <History size={14} />
              History
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

          {/* Mobile Actions: Back to Showroom on subpages + Icon-only menu trigger */}
          <div className="nav__mobile-actions">
            {!isHome && (
              <Link
                href={backHref}
                prefetch={true}
                onClick={handleBackToShowroom}
                className="nav__mobile-back"
              >
                <ArrowLeft size={13} />
                Back to Showroom
              </Link>
            )}
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
            {isHome ? (
              <Link
                className="nav-dropdown-item nav-dropdown-item--active"
                href="/"
                onClick={() => setMenuOpen(false)}
              >
                <Store size={14} />
                Showroom
              </Link>
            ) : (
              <Link
                className="nav-dropdown-item"
                href={backHref}
                prefetch={true}
                onClick={handleBackToShowroom}
              >
                <ArrowLeft size={14} />
                Back to Showroom
              </Link>
            )}
            <Link
              className={`nav-dropdown-item ${
                isReceiptsView ? "nav-dropdown-item--active" : ""
              }`}
              href="/account/receipts"
              onClick={() => {
                setIsHistoryQuery(false);
                setMenuOpen(false);
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("kova:receiptsview", { detail: "receipts" }));
                }
              }}
            >
              <ReceiptText size={14} />
              My Receipts
            </Link>
            <Link
              className={`nav-dropdown-item ${
                isHistoryView ? "nav-dropdown-item--active" : ""
              }`}
              href="/account/receipts?view=history"
              onClick={() => {
                setIsHistoryQuery(true);
                setMenuOpen(false);
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("kova:receiptsview", { detail: "history" }));
                }
              }}
            >
              <History size={14} />
              History
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
              <UserCheck size={14} />
              Buyer Account
            </Link>
          </nav>
        </>
      )}
    </>
  );
}
