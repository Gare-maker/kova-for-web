"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ShoppingBag, MapPin } from "lucide-react";
import type { Vendor, Product } from "@/lib/types";
import { formatNaira, getInitials } from "@/lib/format";
import { KovaHeader } from "./KovaHeader";
import { KovaFooter } from "./KovaFooter";
import { RateVendorModal } from "./RateVendorModal";
import { UserProfileModal } from "./UserProfileModal";

export interface StorefrontProduct extends Product {
  effectiveAvailable: boolean;
  effectiveRemaining: number;
}

interface StorefrontClientProps {
  vendor: Vendor;
  products: StorefrontProduct[];
  basePath?: string;
}

function VerifiedSeal({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label="Verified">
      <path
        d="M12 1.75l2.37 1.72 2.9-.31 1.18 2.68 2.68 1.18-.31 2.9L22.25 12l-1.72 2.37.31 2.9-2.68 1.18-1.18 2.68-2.9-.31L12 22.25l-2.37-1.72-2.9.31-1.18-2.68-2.68-1.18.31-2.9L1.75 12l1.72-2.37-.31-2.9 2.68-1.18 1.18-2.68 2.9.31L12 1.75z"
        fill="#1D9BF0"
        stroke="#FFFFFF"
        strokeWidth="1.5"
      />
      <path
        d="M8.6 12.2l2.2 2.2 4.6-4.8"
        stroke="#FFFFFF"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StorefrontClient({
  vendor,
  products,
  basePath,
}: StorefrontClientProps) {
  const searchParams = useSearchParams();
  const routePath = basePath ?? `/store/${encodeURIComponent(vendor.username)}`;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const didMountRef = useRef(false);

  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") ?? ""
  );
  // Search bar does NOT stick on normal scroll — ONLY sticks at the top when clicked/activated
  const [searchPinned, setSearchPinned] = useState(
    () => Boolean((searchParams.get("q") ?? "").trim())
  );
  const [profileOpen, setProfileOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [liveRating, setLiveRating] = useState(vendor.rating);
  const [liveRatingCount, setLiveRatingCount] = useState(
    vendor.ratingCount ?? 120
  );

  // Debounced URL query sync preserving Next.js history state
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (typeof window === "undefined") return;
    const timer = window.setTimeout(() => {
      const trimmed = searchQuery.trim();
      const nextUrl = trimmed
        ? `${routePath}?q=${encodeURIComponent(trimmed)}`
        : routePath;
      if (window.location.pathname + window.location.search !== nextUrl) {
        window.history.replaceState(window.history.state, "", nextUrl);
      }
    }, 260);
    return () => window.clearTimeout(timer);
  }, [searchQuery, routePath]);

  // Multi-word tokenized search across product & property fields
  const filteredProducts = useMemo(() => {
    const cleaned = searchQuery.trim().toLowerCase();
    if (!cleaned) return products;
    const tokens = cleaned.split(/\s+/).filter(Boolean);
    return products.filter((p) => {
      const haystack = [
        p.name,
        p.description,
        p.category,
        p.location,
        p.condition,
        String(p.price),
        p.pricePeriod ?? "",
        ...(p.options ?? []),
        ...(p.amenities ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return tokens.every((tok) => haystack.includes(tok));
    });
  }, [products, searchQuery]);

  const currentSearchQs = useMemo(() => {
    const q = searchQuery.trim();
    return q ? `?q=${encodeURIComponent(q)}` : "";
  }, [searchQuery]);

  // Clicking the search bar pins it to the top beneath the header and smoothly scrolls the hero upwards
  const handleActivateSearch = () => {
    setSearchPinned(true);
    if (typeof window !== "undefined" && heroSectionRef.current) {
      const pinnedBarHeight = 72;
      const targetTop = Math.max(
        0,
        heroSectionRef.current.offsetHeight - pinnedBarHeight
      );
      if (window.scrollY < targetTop - 4) {
        window.scrollTo({ top: targetTop, behavior: "smooth" });
      }
    }
  };

  const handleCancelSearch = () => {
    setSearchQuery("");
    setSearchPinned(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    if (
      typeof document !== "undefined" &&
      document.activeElement instanceof HTMLElement
    ) {
      document.activeElement.blur();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchInputRef.current?.blur();
  };

  const showCancel = searchPinned || searchQuery.length > 0;
  const trimmedQuery = searchQuery.trim();

  return (
    <>
      <KovaHeader brandName={vendor.fullName} />

      <main id="main" className="ref-storefront">
        {/* Unified Profile Header + Search Section with Full-Bleed 30% Opacity Background Image */}
        <section
          ref={heroSectionRef}
          className="showroom-hero-green"
          aria-label="Business profile"
        >
          {vendor.avatarUrl && (
            <div
              className="showroom-hero-green__bg"
              style={{ backgroundImage: `url(${vendor.avatarUrl})` }}
              aria-hidden="true"
            />
          )}
          <div className="showroom-hero-green__scrim" aria-hidden="true" />

          <div className="container showroom-profile__inner">
            <button
              type="button"
              className="showroom-profile__trigger"
              onClick={() => setProfileOpen(true)}
              title="View business profile details"
            >
              <div className="showroom-avatar">
                <div className="showroom-avatar__ring">
                  {vendor.avatarUrl ? (
                    <img src={vendor.avatarUrl} alt={vendor.fullName} />
                  ) : (
                    getInitials(vendor.fullName)
                  )}
                </div>
                {vendor.verificationStatus === "verified" && (
                  <span className="showroom-avatar__seal">
                    <VerifiedSeal size={20} />
                  </span>
                )}
              </div>

              <h1 className="showroom-profile__name">{vendor.fullName}</h1>
              <p className="showroom-profile__category">
                {vendor.categoryBadge || vendor.role}
              </p>
            </button>

            {/* Search bar sits inside hero normally (non-sticky on scroll); pins to top ONLY when clicked */}
            <div
              className={`showroom-search-slot ${
                searchPinned ? "showroom-search-slot--placeholder" : ""
              }`}
            >
              <div
                className={`showroom-search-wrap ${
                  searchPinned ? "showroom-search-wrap--pinned" : ""
                }`}
              >
                <div className={searchPinned ? "container" : undefined}>
                  <form
                    role="search"
                    onSubmit={handleSearchSubmit}
                    className="ref-search-form"
                  >
                    <div className="ref-search-row">
                      <div
                        className="ref-search-pill"
                        onClick={() => {
                          searchInputRef.current?.focus();
                          handleActivateSearch();
                        }}
                      >
                        <Search size={16} color="#6E6981" aria-hidden="true" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onFocus={handleActivateSearch}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              e.preventDefault();
                              handleCancelSearch();
                            }
                          }}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search products or properties..."
                          aria-label="Search Showroom listings"
                          autoComplete="off"
                          enterKeyHint="search"
                        />
                      </div>

                      {showCancel && (
                        <button
                          type="button"
                          className="ref-search-cancel"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={handleCancelSearch}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Spacious Product & Property Listing Grid */}
        <section className="container ref-listings-section">
          {trimmedQuery && (
            <div className="ref-search-status" role="status" aria-live="polite">
              <span>
                Showing <strong>{filteredProducts.length}</strong>{" "}
                {filteredProducts.length === 1 ? "result" : "results"} for &ldquo;
                {trimmedQuery}&rdquo;
              </span>
              <button
                type="button"
                className="ref-search-status__clear"
                onClick={handleCancelSearch}
              >
                Clear search
              </button>
            </div>
          )}

          {products.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={26} style={{ marginInline: "auto" }} />
              <h3>This Showroom has no listings yet.</h3>
              <p>Check back soon for new products and properties.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <Search size={26} style={{ marginInline: "auto" }} />
              <h3>No listings found matching &ldquo;{trimmedQuery}&rdquo;.</h3>
              <p>
                Try another keyword or{" "}
                <button
                  type="button"
                  onClick={handleCancelSearch}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--brand)",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  clear search
                </button>
                .
              </p>
            </div>
          ) : (
            <div className="ref-listing-grid">
              {filteredProducts.map((product) => {
                const isProp =
                  product.category.toLowerCase().includes("propert") ||
                  product.category.toLowerCase().includes("apartment");
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}${currentSearchQs}`}
                    className="ref-listing-card"
                  >
                    <div className="ref-listing-card__media">
                      <img
                        src={product.images[0] || "/listings/smartphone.jpg"}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                      />
                      {isProp ? (
                        <span className="kova-prop-badge">Property</span>
                      ) : (
                        <span className="kova-cond-badge">
                          {product.condition}
                        </span>
                      )}
                      {product.isVideo && (
                        <>
                          <span className="ref-video-play-dot" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                          <span className="ref-video-pill" aria-label="Video listing">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            Video
                          </span>
                        </>
                      )}
                      {!product.effectiveAvailable && (
                        <span className="ref-sold-tag">Unavailable</span>
                      )}
                    </div>

                    <div className="ref-listing-card__meta">
                      <h2 className="ref-listing-card__title" title={product.name}>
                        {product.name}
                      </h2>
                      <div className="ref-listing-card__price">
                        {formatNaira(product.price)}
                        {product.pricePeriod ? (
                          <span className="ref-listing-card__period">
                            {" "}
                            / {product.pricePeriod.replace(/^Per\s+/i, "")}
                          </span>
                        ) : null}
                      </div>
                      {isProp ? (
                        <div className="ref-listing-card__prop-loc">
                          <MapPin size={11} aria-hidden="true" />
                          <span>{product.location}</span>
                        </div>
                      ) : (
                        <p className="ref-listing-card__desc">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <KovaFooter vendor={vendor} />

      <UserProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        vendor={vendor}
        rating={liveRating}
        listingsCount={vendor.stats.posts}
        onRateUser={() => setRateOpen(true)}
      />

      <RateVendorModal
        open={rateOpen}
        onClose={() => setRateOpen(false)}
        vendor={vendor}
        currentRating={liveRating}
        currentRatingCount={liveRatingCount}
        onRated={(nextRating, nextCount) => {
          setLiveRating(nextRating);
          setLiveRatingCount(nextCount);
        }}
      />
    </>
  );
}
