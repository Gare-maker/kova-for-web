"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Star,
  BadgeCheck,
  MessageCircle,
  Share2,
  Check,
  ShoppingBag,
} from "lucide-react";
import type { Vendor, Product } from "@/lib/types";
import { formatNaira, getInitials } from "@/lib/format";
import { KovaHeader, getAppStoreUrl } from "./KovaHeader";
import { KovaFooter } from "./KovaFooter";
import { ChatDrawer } from "./ChatDrawer";
import { UserProfileModal } from "./UserProfileModal";

export interface StorefrontProduct extends Product {
  effectiveAvailable: boolean;
  effectiveRemaining: number;
}

interface StorefrontClientProps {
  vendor: Vendor;
  products: StorefrontProduct[];
}

export function StorefrontClient({ vendor, products }: StorefrontClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") ?? "All"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    for (const p of products) {
      if (p.category) set.add(p.category);
    }
    return Array.from(set);
  }, [products]);

  // Persist search & category in URL so navigating back preserves browsing state
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    const qs = params.toString();
    router.replace(qs ? `/store/${vendor.username}?${qs}` : `/store/${vendor.username}`, {
      scroll: false,
    });
  }, [searchQuery, selectedCategory, vendor.username, router]);

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

  const handleShareStorefront = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${vendor.fullName} (@${vendor.username}) · Kova Storefront`,
          text: `Browse products from ${vendor.fullName} on Kova`,
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
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore
    }
  };

  const currentSearchQs = useMemo(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [searchQuery, selectedCategory]);

  return (
    <>
      <KovaHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search products from this vendor..."
      />

      <main id="main" className="storefront-main">
        <div className="container" style={{ maxWidth: 960 }}>
          {/* Reference Image 3 Profile Header Card */}
          <section
            className="surface-card"
            aria-labelledby="storefront-vendor-name"
            style={{ padding: "clamp(1.15rem, 2.5vw, 1.75rem)" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textAlign: "left",
                }}
                title="View vendor details"
              >
                <div style={{ position: "relative", width: 58, height: 58, flex: "none" }}>
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "var(--forest)",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: "1.2rem",
                    }}
                  >
                    {vendor.avatarUrl ? (
                      <img
                        src={vendor.avatarUrl}
                        alt={vendor.fullName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      getInitials(vendor.fullName)
                    )}
                  </div>
                  {vendor.verificationStatus === "verified" && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: -1,
                        right: -1,
                        width: 21,
                        height: 21,
                        borderRadius: "50%",
                        background: "#2563eb",
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                        border: "2px solid #fff",
                      }}
                    >
                      <BadgeCheck size={12} />
                    </span>
                  )}
                </div>

                <div>
                  <h1
                    id="storefront-vendor-name"
                    className="display"
                    style={{
                      fontSize: "1.12rem",
                      color: "var(--ink-strong)",
                      margin: 0,
                    }}
                  >
                    @{vendor.username}
                  </h1>
                  <div
                    style={{
                      color: "var(--muted)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                    }}
                  >
                    {vendor.fullName}
                  </div>
                </div>
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => setChatOpen(true)}
                  aria-label="Chat with vendor"
                >
                  <MessageCircle size={15} />
                  Chat
                </button>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={handleShareStorefront}
                  aria-label="Share storefront"
                >
                  {copied ? <Check size={15} /> : <Share2 size={15} />}
                </button>
                <a
                  href={getAppStoreUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--brand btn--sm"
                >
                  Download app
                </a>
              </div>
            </div>

            {/* 4-Column Stats Row matching Image 3 */}
            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: "0.5rem",
                textAlign: "center",
                margin: "1.35rem 0 0",
                paddingTop: "1.1rem",
                borderTop: "1px solid var(--line)",
              }}
            >
              <div>
                <dd
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "1.3rem",
                    color: "var(--ink-strong)",
                  }}
                >
                  {products.length}
                </dd>
                <dt style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  Posts
                </dt>
              </div>
              <div>
                <dd
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "1.3rem",
                    color: "var(--ink-strong)",
                  }}
                >
                  {vendor.stats.followers >= 1000
                    ? `${(vendor.stats.followers / 1000).toFixed(0)}k`
                    : vendor.stats.followers}
                </dd>
                <dt style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  Followers
                </dt>
              </div>
              <div>
                <dd
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "1.3rem",
                    color: "var(--ink-strong)",
                  }}
                >
                  {vendor.stats.deals}
                </dd>
                <dt style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  Deals
                </dt>
              </div>
              <div>
                <dd
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "1.3rem",
                    color: "var(--ink-strong)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {vendor.rating.toFixed(1)}
                  <Star size={16} fill="#f59e0b" color="#f59e0b" />
                </dd>
                <dt style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  Rating
                </dt>
              </div>
            </dl>
          </section>

          {/* Rounded Pill Search Bar + Filter Toggle matching Image 3 */}
          <div style={{ marginTop: "1.25rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "var(--paper-warm)",
                border: "1px solid var(--line-strong)",
                borderRadius: 999,
                padding: "0.3rem 0.5rem 0.3rem 1rem",
                gap: "0.5rem",
              }}
            >
              <Search size={18} color="var(--muted)" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                aria-label="Search products from this vendor"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "0.95rem",
                  color: "var(--ink)",
                  paddingBlock: "0.45rem",
                }}
              />
              <button
                type="button"
                onClick={() => setShowFilters((s) => !s)}
                aria-label="Filter by category"
                aria-expanded={showFilters}
                style={{
                  background: showFilters ? "var(--brand-soft)" : "transparent",
                  color: showFilters ? "var(--forest)" : "var(--ink-soft)",
                  border: "none",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <SlidersHorizontal size={17} />
              </button>
            </div>

            {/* Category Filter Pills */}
            {(showFilters || selectedCategory !== "All") && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.45rem",
                  marginTop: "0.75rem",
                }}
              >
                {categories.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: "0.35rem 0.85rem",
                        borderRadius: 999,
                        border: active
                          ? "1px solid var(--brand)"
                          : "1px solid var(--line-strong)",
                        background: active ? "var(--brand)" : "var(--paper-warm)",
                        color: active ? "#fff" : "var(--ink-soft)",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2-Column Mobile / Multi-Column Desktop Product Grid matching Image 3 */}
          {products.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={32} style={{ marginInline: "auto" }} />
              <h3>This vendor hasn&apos;t listed any products yet.</h3>
              <p>Check back soon or message the vendor directly.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <Search size={32} style={{ marginInline: "auto" }} />
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
                    color: "var(--brand-dark)",
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  reset filters
                </button>
                .
              </p>
            </div>
          ) : (
            <div className="product-grid" style={{ marginTop: "1.25rem" }}>
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}${currentSearchQs}`}
                  className="product-card"
                  style={{ borderRadius: 16 }}
                >
                  <div className="product-card__media" style={{ aspectRatio: "1 / 0.92" }}>
                    <img
                      src={product.images[0] || "/products/desk.svg"}
                      alt={product.name}
                      className="product-card__img"
                    />
                    <span
                      className={`product-card__status ${
                        product.effectiveAvailable
                          ? "product-card__status--available"
                          : "product-card__status--unavailable"
                      }`}
                    >
                      {product.effectiveAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  <div className="product-card__body" style={{ padding: "0.75rem 0.85rem 0.9rem" }}>
                    <h3 className="product-card__title" style={{ fontSize: "0.94rem" }}>
                      {product.name}
                    </h3>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {product.location}
                    </div>
                    <div
                      className="product-card__price"
                      style={{
                        color: "var(--ink-strong)",
                        fontSize: "0.98rem",
                        marginTop: "0.15rem",
                      }}
                    >
                      {formatNaira(product.price)}
                      {product.pricePeriod ? ` - ${product.pricePeriod}` : ""}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <KovaFooter />

      <UserProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        vendor={vendor}
        listingsCount={products.length}
        onStartChat={() => setChatOpen(true)}
      />

      <ChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        vendor={vendor}
      />
    </>
  );
}
