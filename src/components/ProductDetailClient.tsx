"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  MessageSquareText,
  Share2,
  Heart,
  Flag,
  Check,
  Star,
  Plug,
  Droplet,
  DoorClosed,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Vendor, Product, VendorRating } from "@/lib/types";
import { formatNaira, getInitials } from "@/lib/format";
import { KovaHeader } from "./KovaHeader";
import { KovaFooter } from "./KovaFooter";
import { DownloadChatModal } from "./DownloadChatModal";
import { RateVendorModal } from "./RateVendorModal";
import { UserProfileModal } from "./UserProfileModal";

interface ProductDetailClientProps {
  product: Product;
  vendor: Vendor;
  effectiveAvailable: boolean;
  effectiveRemaining: number;
  unavailableReason: string | null;
}

function VerifiedSealSmall({ color = "#EAB308" }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-label="Verified">
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

function AmenityIcon({ label }: { label: string }) {
  const lower = label.toLowerCase();
  if (lower.includes("electric") || lower.includes("power")) {
    return <Plug size={20} strokeWidth={1.6} color="#52525B" />;
  }
  if (lower.includes("water")) {
    return <Droplet size={20} strokeWidth={1.6} color="#52525B" />;
  }
  if (lower.includes("wardrobe")) {
    return <DoorClosed size={20} strokeWidth={1.6} color="#52525B" />;
  }
  if (lower.includes("security")) {
    return <ShieldCheck size={20} strokeWidth={1.6} color="#52525B" />;
  }
  return <Sparkles size={20} strokeWidth={1.6} color="#52525B" />;
}

export function ProductDetailClient({
  product,
  vendor,
  effectiveAvailable,
  effectiveRemaining,
  unavailableReason,
}: ProductDetailClientProps) {
  const searchParams = useSearchParams();
  const [chatPromptOpen, setChatPromptOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [liveRating, setLiveRating] = useState(vendor.rating);
  const [liveRatingCount, setLiveRatingCount] = useState(
    vendor.ratingCount ?? 120
  );
  const [reviews, setReviews] = useState<VendorRating[]>([]);
  const [liked, setLiked] = useState(false);
  const [reported, setReported] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(true);
  const [readMoreDesc, setReadMoreDesc] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    product.options?.[0] ?? ""
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/vendors/${encodeURIComponent(vendor.username)}/rate`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          setReviews(data.ratings ?? []);
        }
      } catch {
        // ignore
      }
    })();
  }, [vendor.username, liveRatingCount]);

  const qs = searchParams.toString();
  const backHref = qs ? `/?${qs}` : `/`;

  const checkoutHref = selectedOption
    ? `/checkout/${product.id}?option=${encodeURIComponent(selectedOption)}`
    : `/checkout/${product.id}`;

  const handleShareProduct = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} · ${formatNaira(product.price)} on Kova`,
          text: `Check out ${product.name} from ${vendor.fullName} on Kova`,
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

  const isProperty =
    product.category.toLowerCase().includes("propert") ||
    product.category.toLowerCase().includes("apartment");

  const isLongDesc = product.description.length > 130;
  const displayedDesc =
    isLongDesc && !readMoreDesc
      ? product.description.slice(0, 130).trimEnd() + "..."
      : product.description;

  return (
    <>
      <KovaHeader />

      {/* Reference Images 1 & 4 White Sub-bar with Back Arrow + Share, Heart, Report */}
      <div className="kova-subbar">
        <div className="container kova-subbar__inner">
          <Link href={backHref} className="kova-subbar__left">
            <ArrowLeft size={20} />
            {isProperty ? "Property Details" : "Product Details"}
          </Link>
          <div className="kova-subbar__actions">
            <button
              type="button"
              className="kova-icon-btn"
              onClick={handleShareProduct}
              aria-label="Share"
              title={copied ? "Link copied!" : "Share"}
            >
              {copied ? (
                <Check size={19} color="var(--brand)" />
              ) : (
                <Share2 size={19} />
              )}
            </button>
            <button
              type="button"
              className={`kova-icon-btn ${liked ? "kova-icon-btn--active" : ""}`}
              onClick={() => setLiked((v) => !v)}
              aria-label={liked ? "Remove from saved" : "Save item"}
            >
              <Heart size={19} fill={liked ? "#ef4444" : "none"} />
            </button>
            <button
              type="button"
              className="kova-icon-btn"
              onClick={() => setReported(true)}
              aria-label="Report listing"
              title={reported ? "Report submitted" : "Report listing"}
            >
              <Flag size={18} color={reported ? "#ef4444" : "currentColor"} />
            </button>
          </div>
        </div>
      </div>

      <main id="main" className="ref-detail-page">
        <div className="ref-detail-shell">
          {/* Left / Top Hero Media */}
          <div
            className={`ref-detail-hero ${
              showMoreDetails ? "ref-detail-hero--expanded" : ""
            }`}
          >
            <img
              src={product.images[0] || "/listings/flat-exterior.jpg"}
              alt={product.name}
            />
          </div>

          {/* Right / Bottom White Sheet */}
          <div className="ref-detail-sheet">
            <div className="ref-detail-sheet__inner">
              <button
                type="button"
                className="ref-drag-handle"
                onClick={() => setShowMoreDetails((v) => !v)}
                aria-label={
                  showMoreDetails ? "Collapse details" : "Expand details"
                }
              />

              {/* Header Row: Title, Location, Price/Stock + Seller Avatar & Rating */}
              <div className="ref-detail-header-row">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h1 className="ref-detail-title">{product.name}</h1>

                  <div className="ref-detail-loc-row">
                    <span className="ref-detail-loc">{product.location}</span>
                  </div>

                  <div
                    className="ref-detail-price"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "0.55rem",
                    }}
                  >
                    <span>
                      <strong
                        style={{
                          fontWeight: 600,
                          color: "var(--ink-strong)",
                          fontSize: "1.15rem",
                        }}
                      >
                        {formatNaira(product.price)}
                      </strong>
                      {product.pricePeriod ? (
                        <span
                          style={{
                            color: "var(--muted)",
                            fontWeight: 400,
                            fontSize: "0.92rem",
                          }}
                        >
                          {" "}
                          - {product.pricePeriod}
                        </span>
                      ) : null}
                    </span>

                    {!isProperty && effectiveAvailable && (
                      <span className="kova-stock-pill">
                        {effectiveRemaining} in stock
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.3rem",
                    flex: "none",
                  }}
                >
                  <button
                    type="button"
                    className="ref-seller-badge-btn"
                    onClick={() => setProfileOpen(true)}
                    title={`View ${vendor.fullName}'s profile`}
                  >
                    <div className="ref-avatar ref-avatar--sm">
                      <div
                        className="ref-avatar__circle"
                        style={{ fontSize: "0.95rem" }}
                      >
                        {vendor.avatarUrl ? (
                          <img src={vendor.avatarUrl} alt={vendor.fullName} />
                        ) : (
                          getInitials(vendor.fullName)
                        )}
                      </div>
                      {vendor.verificationStatus === "verified" && (
                        <span className="ref-verified-seal">
                          <VerifiedSealSmall color="#EAB308" />
                        </span>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRateOpen(true)}
                    className="ref-seller-rating"
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                    title="Click to rate seller"
                  >
                    {liveRating.toFixed(1)}
                    <Star size={14} fill="#FACC15" color="#FACC15" />
                  </button>
                </div>
              </div>

              {!effectiveAvailable && (
                <div
                  style={{
                    marginTop: "0.9rem",
                    padding: "0.75rem 0.9rem",
                    borderRadius: 10,
                    background: "var(--danger-soft)",
                    color: "var(--danger)",
                    fontSize: "0.86rem",
                    fontWeight: 500,
                  }}
                >
                  {unavailableReason ||
                    "Sorry, this product is currently unavailable."}
                </div>
              )}

              {/* Primary Payment CTA + Reference Chat With Agent / Seller CTA */}
              {effectiveAvailable ? (
                <Link href={checkoutHref} className="ref-make-payment-btn">
                  Make Payment
                </Link>
              ) : (
                <button
                  type="button"
                  className="ref-make-payment-btn"
                  disabled
                >
                  Currently Unavailable
                </button>
              )}

              <button
                type="button"
                className="kova-chat-cta-btn"
                onClick={() => setChatPromptOpen(true)}
              >
                {isProperty ? "Chat With Agent" : "Chat With Seller"}
                <MessageSquareText size={18} />
              </button>

              {/* Expandable Details Area */}
              {showMoreDetails && (
                <>
                  {/* 3-Column Fee Row (Properties: Image 1) OR Delivery/Condition Row (Products) */}
                  {isProperty ? (
                    <div className="kova-three-fees">
                      <div>
                        <div className="ref-fee-label">Inspection</div>
                        <div className="ref-fee-val">
                          {product.inspectionFee === 0
                            ? "Free"
                            : formatNaira(product.inspectionFee ?? 10000)}
                        </div>
                      </div>
                      <div>
                        <div className="ref-fee-label">Caution fee</div>
                        <div className="ref-fee-val">
                          {formatNaira(product.cautionFee ?? 0)}
                        </div>
                      </div>
                      <div>
                        <div className="ref-fee-label">Agent fee</div>
                        <div className="ref-fee-val">
                          {formatNaira(product.agentFee ?? 17000)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="kova-three-fees">
                      <div>
                        <div className="ref-fee-label">Condition</div>
                        <div className="ref-fee-val">{product.condition}</div>
                      </div>
                      <div>
                        <div className="ref-fee-label">Delivery</div>
                        <div className="ref-fee-val">
                          {product.deliveryFee === 0
                            ? "Free"
                            : formatNaira(product.deliveryFee)}
                        </div>
                      </div>
                      <div>
                        <div className="ref-fee-label">Status</div>
                        <div className="ref-fee-val">
                          {effectiveAvailable ? "Available" : "Sold Out"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Options / Variations Selector */}
                  {product.options && product.options.length > 0 && (
                    <div
                      style={{
                        paddingBottom: "1rem",
                        borderBottom: "1px solid var(--line)",
                      }}
                    >
                      <div className="ref-fee-label">Available Options</div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.45rem",
                        }}
                      >
                        {product.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setSelectedOption(opt)}
                            className={`ref-cat-chip ${
                              selectedOption === opt
                                ? "ref-cat-chip--active"
                                : ""
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description Section */}
                  <div className="ref-desc-block">
                    <h2 className="ref-desc-heading">Description</h2>
                    <p className="ref-desc-text">
                      {displayedDesc}{" "}
                      {isLongDesc && (
                        <button
                          type="button"
                          className="ref-read-more-btn"
                          onClick={() => setReadMoreDesc((r) => !r)}
                        >
                          {readMoreDesc ? "Show Less" : "Read More..."}
                        </button>
                      )}
                    </p>
                  </div>

                  {/* Amenities Section (matching Image 1) */}
                  {product.amenities && product.amenities.length > 0 && (
                    <div
                      style={{
                        marginTop: "1.25rem",
                        paddingTop: "1.25rem",
                        borderTop: "6px solid #f5f6f8",
                      }}
                    >
                      <h2 className="ref-desc-heading">Amenities</h2>
                      <div className="kova-amenities-list">
                        {product.amenities.map((item) => (
                          <div key={item} className="kova-amenity-row">
                            <AmenityIcon label={item} />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Seller Spotlight Card (matching Image 4) */}
                  <div
                    style={{
                      marginTop: "1.25rem",
                      paddingTop: "0.35rem",
                      borderTop: "6px solid #f5f6f8",
                    }}
                  >
                    <div className="kova-seller-spotlight">
                      <button
                        type="button"
                        onClick={() => setProfileOpen(true)}
                        className="kova-seller-spotlight__left"
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                        }}
                      >
                        <div className="kova-seller-spotlight__avatar">
                          {vendor.avatarUrl ? (
                            <img src={vendor.avatarUrl} alt={vendor.fullName} />
                          ) : (
                            getInitials(vendor.fullName)
                          )}
                        </div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.96rem",
                            color: "var(--ink-strong)",
                          }}
                        >
                          @{vendor.username}
                        </div>
                        <span className="kova-role-badge">
                          {vendor.categoryBadge || vendor.role}
                        </span>
                      </button>

                      <div className="kova-seller-spotlight__stats">
                        <div className="kova-spotlight-stat">
                          <div className="kova-spotlight-stat__val">
                            {vendor.stats.deals}
                          </div>
                          <div className="kova-spotlight-stat__label">Deals</div>
                        </div>
                        <div className="kova-spotlight-stat">
                          <button
                            type="button"
                            onClick={() => setRateOpen(true)}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <div className="kova-spotlight-stat__val">
                              {liveRating.toFixed(1)}
                              <Star size={15} fill="#FACC15" color="#FACC15" />
                            </div>
                            <div className="kova-spotlight-stat__label">
                              Rating
                            </div>
                          </button>
                        </div>
                        <div className="kova-spotlight-stat">
                          <div className="kova-spotlight-stat__val">
                            {vendor.stats.posts}
                          </div>
                          <div className="kova-spotlight-stat__label">Posts</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Reviews Section (matching Image 4 bottom) */}
                  <div
                    style={{
                      marginTop: "0.75rem",
                      paddingTop: "1.25rem",
                      borderTop: "6px solid #f5f6f8",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.75rem",
                        marginBottom: "0.85rem",
                      }}
                    >
                      <h2 className="ref-desc-heading" style={{ margin: 0 }}>
                        {product.name} Reviews
                      </h2>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        style={{ fontWeight: 500 }}
                        onClick={() => setRateOpen(true)}
                      >
                        <Star size={14} fill="#FACC15" color="#FACC15" />
                        Rate &amp; Review
                      </button>
                    </div>

                    {reviews.length === 0 ? (
                      <p
                        style={{
                          color: "var(--muted)",
                          fontSize: "0.88rem",
                          margin: 0,
                        }}
                      >
                        No reviews yet. Be the first to rate this user.
                      </p>
                    ) : (
                      <div style={{ display: "grid", gap: "0.65rem" }}>
                        {reviews.slice(0, 3).map((r) => (
                          <div
                            key={r.id}
                            style={{
                              background: "var(--paper-subtle)",
                              borderRadius: 10,
                              padding: "0.75rem 0.9rem",
                              fontSize: "0.88rem",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: "var(--ink-strong)",
                                }}
                              >
                                {r.reviewerName}
                              </span>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 3,
                                }}
                              >
                                {r.stars}
                                <Star size={12} fill="#FACC15" color="#FACC15" />
                              </span>
                            </div>
                            {r.comment && (
                              <p
                                style={{
                                  margin: "0.3rem 0 0",
                                  color: "var(--muted)",
                                  lineHeight: 1.45,
                                }}
                              >
                                {r.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              className="ref-view-more-bar"
              onClick={() => setShowMoreDetails((v) => !v)}
            >
              {showMoreDetails ? "Show Less Details" : "View More Details"}
            </button>
          </div>
        </div>
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
        product={product}
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
