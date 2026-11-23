"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Star,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";
import type { Vendor, Product } from "@/lib/types";
import { formatNaira, getInitials } from "@/lib/format";
import { KovaHeader, getAppStoreUrl } from "./KovaHeader";
import { KovaFooter } from "./KovaFooter";
import { DownloadChatModal } from "./DownloadChatModal";
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

function VerifiedSeal({ size = 21 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Verified"
    >
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const routePath = basePath ?? `/store/${encodeURIComponent(vendor.username)}`;

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") ?? "All"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [chatPromptOpen, setChatPromptOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [liveRating, setLiveRating] = useState(vendor.rating);
  const [liveRatingCount, setLiveRatingCount] = useState(
    vendor.ratingCount ?? 120
  );

  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    for (const p of products) {
      if (p.category) set.add(p.category);
    }
    return Array.from(set);
  }, [products]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    const qs = params.toString();
    router.replace(qs ? `${routePath}?${qs}` : routePath, { scroll: false });
  }, [searchQuery, selectedCategory, routePath, router]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCat =
        selectedCategory === "All" || p.category === selectedCategory;
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const currentSearchQs = useMemo(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [searchQuery, selectedCategory]);

  return (
    <>
      <KovaHeader />

      <main id="main" className="ref-storefront">
        <section className="ref-profile-wrap" aria-labelledby="vendor-handle">
          <div className="container">
            <div className="ref-profile-header">
              <button
                type="button"
                className="ref-profile-trigger"
                onClick={() => setProfileOpen(true)}
                title="View user profile details"
              >
                <div className="ref-avatar">
                  <div className="ref-avatar__circle">
                    {vendor.avatarUrl ? (
                      <img src={vendor.avatarUrl} alt={vendor.fullName} />
                    ) : (
                      getInitials(vendor.fullName)
                    )}
                  </div>
                  {vendor.verificationStatus === "verified" && (
                    <span className="ref-verified-seal">
                      <VerifiedSeal size={22} />
                    </span>
                  )}
                </div>

                <div>
                  <h1 id="vendor-handle" className="ref-profile-handle">
                    @{vendor.username}
                  </h1>
                  <p className="ref-profile-fullname">{vendor.fullName}</p>
                </div>
              </button>

              <div className="ref-profile-actions">
                <button
                  type="button"
                  className="btn btn--outline btn--sm ref-chat-desktop-btn"
                  style={{ fontWeight: 500 }}
                  onClick={() => setChatPromptOpen(true)}
                >
                  <MessageCircle size={15} />
                  Message
                </button>
                <a
                  href={getAppStoreUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ref-download-btn"
                >
                  Download app
                </a>
              </div>
            </div>

            <dl className="ref-stats-row">
              <div>
                <dd className="ref-stat-val">{vendor.stats.posts}</dd>
                <dt className="ref-stat-label">Posts</dt>
              </div>
              <div>
                <dd className="ref-stat-val">
                  {vendor.stats.followers >= 1000
                    ? `${(vendor.stats.followers / 1000).toFixed(0)}k`
                    : vendor.stats.followers}
                </dd>
                <dt className="ref-stat-label">Followers</dt>
              </div>
              <div>
                <dd className="ref-stat-val">{vendor.stats.deals}</dd>
                <dt className="ref-stat-label">Deals</dt>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setRateOpen(true)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    width: "100%",
                  }}
                  title="Tap to rate this user"
                >
                  <dd className="ref-stat-val">
                    {liveRating.toFixed(1)}
                    <Star
                      size={17}
                      fill="#FACC15"
                      color="#FACC15"
                      aria-hidden="true"
                    />
                  </dd>
                  <dt className="ref-stat-label">Rating</dt>
                </button>
              </div>
            </dl>
          </div>
        </section>

        <section className="container ref-search-section">
          <div className="ref-search-pill">
            <Search size={19} color="#52525B" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search products"
            />
            <button
              type="button"
              onClick={() => setShowFilters((s) => !s)}
              className={`ref-filter-btn ${
                showFilters || selectedCategory !== "All"
                  ? "ref-filter-btn--active"
                  : ""
              }`}
              aria-label="Filter by category"
              aria-expanded={showFilters}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {(showFilters || selectedCategory !== "All") && (
            <div className="ref-category-bar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`ref-cat-chip ${
                    selectedCategory === cat ? "ref-cat-chip--active" : ""
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {products.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={30} style={{ marginInline: "auto" }} />
              <h3>This vendor hasn&apos;t listed any products yet.</h3>
              <p>Check back soon or message the vendor on the Kova app.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <Search size={30} style={{ marginInline: "auto" }} />
              <h3>No products found matching your search.</h3>
              <p>
                Try another keyword or{" "}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--brand)",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  clear filters
                </button>
                .
              </p>
            </div>
          ) : (
            <div className="ref-listing-grid">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}${currentSearchQs}`}
                  className="ref-listing-card"
                >
                  <div className="ref-listing-card__media">
                    <img
                      src={product.images[0] || "/listings/living-room-cozy.jpg"}
                      alt={product.name}
                    />
                    {product.isVideo && (
                      <div className="ref-play-overlay" aria-hidden="true">
                        <svg width="38" height="38" viewBox="0 0 36 36" fill="none">
                          <path
                            d="M11 8.5C11 7.1 12.5 6.2 13.7 6.9L28.5 16.4C29.6 17.1 29.6 18.9 28.5 19.6L13.7 29.1C12.5 29.8 11 28.9 11 27.5V8.5Z"
                            fill="rgba(255,255,255,0.92)"
                          />
                        </svg>
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
                          - {product.pricePeriod}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
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
        onStartChat={() => setChatPromptOpen(true)}
        onRateUser={() => setRateOpen(true)}
      />

      <DownloadChatModal
        open={chatPromptOpen}
        onClose={() => setChatPromptOpen(false)}
        vendor={vendor}
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
