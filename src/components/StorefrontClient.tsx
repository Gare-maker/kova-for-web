"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Star,
  Share2,
  Bell,
  Check,
  ShoppingBag,
} from "lucide-react";
import type { Vendor, Product } from "@/lib/types";
import { formatNaira, getInitials } from "@/lib/format";
import { KovaHeader } from "./KovaHeader";
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

function VerifiedSeal({ size = 22, color = "#1D9BF0" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label="Verified">
      <path
        d="M12 1.75l2.37 1.72 2.9-.31 1.18 2.68 2.68 1.18-.31 2.9L22.25 12l-1.72 2.37.31 2.9-2.68 1.18-1.18 2.68-2.9-.31L12 22.25l-2.37-1.72-2.9.31-1.18-2.68-2.68-1.18.31-2.9L1.75 12l1.72-2.37-.31-2.9 2.68-1.18 1.18-2.68 2.9.31L12 1.75z"
        fill={color}
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
  const [following, setFollowing] = useState(true);
  const [followerCount, setFollowerCount] = useState(vendor.stats.followers);
  const [copied, setCopied] = useState(false);
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

  const handleToggleFollow = () => {
    setFollowing((prev) => {
      setFollowerCount((c) => (prev ? Math.max(0, c - 1) : c + 1));
      return !prev;
    });
  };

  const handleShareShowroom = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `@${vendor.username} Showroom · Kova`,
          text: `Explore ${vendor.fullName}'s Showroom on Kova`,
          url,
        });
        return;
      } catch {
        // fallback
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const formattedFollowers =
    followerCount >= 1000
      ? `${(followerCount / 1000).toFixed(followerCount % 1000 === 0 ? 0 : 1)}k`
      : String(followerCount);

  return (
    <>
      <KovaHeader />

      <main id="main" className="ref-storefront">
        {/* Showroom Sub-bar matching Reference Images 2 & 5 */}
        <div className="kova-subbar">
          <div className="container kova-subbar__inner">
            <span className="kova-subbar__left">Showroom</span>
            <div className="kova-subbar__actions">
              <button
                type="button"
                className="kova-icon-btn"
                onClick={handleShareShowroom}
                aria-label="Share showroom"
                title={copied ? "Link copied!" : "Share showroom"}
              >
                {copied ? <Check size={19} color="var(--brand)" /> : <Share2 size={19} />}
              </button>
              <button
                type="button"
                className="kova-icon-btn"
                onClick={() => setChatPromptOpen(true)}
                aria-label="Notifications and messages"
                title="Download Kova app for instant alerts & chat"
              >
                <Bell size={19} />
              </button>
            </div>
          </div>
        </div>

        {/* Green Cover Banner matching Reference Image 3 */}
        <section className="kova-cover-banner" aria-label="Vendor cover banner">
          {vendor.coverImage && (
            <img
              src={vendor.coverImage}
              alt=""
              className="kova-cover-banner__bg"
              aria-hidden="true"
            />
          )}
          <div className="kova-cover-banner__tint" aria-hidden="true" />
          <div className="container kova-cover-banner__content">
            <button
              type="button"
              className="kova-cover-banner__id"
              onClick={() => setProfileOpen(true)}
              title="Open user profile details"
            >
              <div className="kova-cover-avatar">
                <div className="kova-cover-avatar__ring">
                  {vendor.avatarUrl ? (
                    <img src={vendor.avatarUrl} alt={vendor.fullName} />
                  ) : (
                    getInitials(vendor.fullName)
                  )}
                </div>
                {vendor.verificationStatus === "verified" && (
                  <span className="ref-verified-seal">
                    <VerifiedSeal size={24} color="#1D9BF0" />
                  </span>
                )}
              </div>

              <div>
                <h1 className="kova-cover-handle">@{vendor.username}</h1>
                <p className="kova-cover-subtitle">
                  {vendor.categoryBadge || vendor.role}
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* Showroom Profile Identity, Stats & Action Pills matching Reference Image 2 */}
        <section className="ref-profile-wrap" aria-label="Vendor profile summary">
          <div className="container">
            <div className="ref-profile-header">
              <button
                type="button"
                className="ref-profile-trigger"
                onClick={() => setProfileOpen(true)}
                title="View full user details"
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
                      <VerifiedSeal size={20} color="#EAB308" />
                    </span>
                  )}
                </div>

                <div>
                  <div className="ref-profile-handle">@{vendor.username}</div>
                  <p className="ref-profile-fullname">{vendor.fullName}</p>
                </div>
              </button>

              <button
                type="button"
                className="kova-role-badge"
                onClick={() => setProfileOpen(true)}
              >
                {vendor.categoryBadge || "Agent"}
              </button>
            </div>

            <dl className="ref-stats-row">
              <div>
                <dd className="ref-stat-val">{vendor.stats.posts}</dd>
                <dt className="ref-stat-label">Posts</dt>
              </div>
              <div>
                <dd className="ref-stat-val">{formattedFollowers}</dd>
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
                  title="Click to rate this user"
                >
                  <dd className="ref-stat-val">
                    {liveRating.toFixed(1)}
                    <Star
                      size={16}
                      fill="#FACC15"
                      color="#FACC15"
                      aria-hidden="true"
                    />
                  </dd>
                  <dt className="ref-stat-label">Rating</dt>
                </button>
              </div>
            </dl>

            {/* Two Side-by-Side Showroom Action Pills (Reviews & Follow/Following) */}
            <div className="kova-showroom-actions">
              <button
                type="button"
                className="kova-pill-action"
                onClick={() => setRateOpen(true)}
              >
                Reviews
              </button>
              <button
                type="button"
                className={`kova-pill-action ${
                  following ? "" : "kova-pill-action--solid"
                }`}
                onClick={handleToggleFollow}
              >
                {following ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        </section>

        <div className="kova-section-divider" aria-hidden="true" />

        {/* Search & Category Browsing + Listing Grid matching Images 2 & 5 */}
        <section className="container ref-search-section">
          <div className="ref-search-pill" style={{ borderRadius: 12 }}>
            <Search size={19} color="#71717A" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name or property type"
              aria-label="Search product name or property type"
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

          {/* Category Pills always accessible for browsing categories */}
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
                              width: 44,
                              height: 44,
                              borderRadius: "50%",
                              background: "rgba(20, 20, 26, 0.45)",
                              backdropFilter: "blur(6px)",
                              border: "1.5px solid rgba(255,255,255,0.8)",
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
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
