"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ShoppingBag } from "lucide-react";
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

function VerifiedSeal({ size = 18 }: { size?: number }) {
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

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [searchActive, setSearchActive] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [liveRating, setLiveRating] = useState(vendor.rating);
  const [liveRatingCount, setLiveRatingCount] = useState(
    vendor.ratingCount ?? 120
  );

  // Sync URL query silently without Next.js RSC round-trips
  useEffect(() => {
    if (typeof window === "undefined") return;
    const trimmed = searchQuery.trim();
    const nextUrl = trimmed
      ? `${routePath}?q=${encodeURIComponent(trimmed)}`
      : routePath;
    if (window.location.pathname + window.location.search !== nextUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [searchQuery, routePath]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const currentSearchQs = useMemo(() => {
    const q = searchQuery.trim();
    return q ? `?q=${encodeURIComponent(q)}` : "";
  }, [searchQuery]);

  const handleCancelSearch = () => {
    setSearchQuery("");
    setSearchActive(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const showCancel = searchActive || searchQuery.length > 0;

  return (
    <>
      <KovaHeader />

      <main id="main" className="ref-storefront">
        {/* Clean White Centered Business Profile Section */}
        <section className="showroom-profile" aria-label="Business profile">
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
                    <VerifiedSeal size={17} />
                  </span>
                )}
              </div>

              <h1 className="showroom-profile__name">@{vendor.username}</h1>
              <p className="showroom-profile__category">
                {vendor.categoryBadge || vendor.role}
              </p>
            </button>
          </div>
        </section>

        {/* Compact Rounded Search Bar & Listing Grid */}
        <section className="container ref-search-section">
          <div className="ref-search-row">
            <div className="ref-search-pill">
              <Search size={14} color="#787885" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setSearchActive(true)}
                onBlur={() => {
                  if (!searchQuery.trim()) {
                    setSearchActive(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    handleCancelSearch();
                  }
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or properties..."
                aria-label="Search Showroom listings"
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

          {products.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={26} style={{ marginInline: "auto" }} />
              <h3>This Showroom has no listings yet.</h3>
              <p>Check back soon for new products and properties.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <Search size={26} style={{ marginInline: "auto" }} />
              <h3>No listings found matching your search.</h3>
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
                const isProp = product.category.toLowerCase() === "properties";
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
                      {!isProp && (
                        <span className="kova-cond-badge">
                          {product.condition}
                        </span>
                      )}
                      {product.isVideo && (
                        <div className="ref-play-overlay" aria-hidden="true">
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: "rgba(20, 20, 26, 0.44)",
                              backdropFilter: "blur(6px)",
                              border: "1.5px solid rgba(255,255,255,0.8)",
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                      {!product.effectiveAvailable && (
                        <span className="ref-sold-tag">Unavailable</span>
                      )}
                    </div>

                    <div className="ref-listing-card__meta">
                      <h2 className="ref-listing-card__title">{product.name}</h2>
                      <span className="ref-listing-card__loc">
                        {product.location}
                      </span>
                      <div className="ref-listing-card__price">
                        {formatNaira(product.price)}
                        {product.pricePeriod ? (
                          <span className="ref-listing-card__period">
                            {" "}
                            / {product.pricePeriod.replace(/^Per\s+/i, "")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <KovaFooter />

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
