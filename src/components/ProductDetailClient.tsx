"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
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
import { RateVendorModal } from "./RateVendorModal";
import { UserProfileModal } from "./UserProfileModal";
import { PaymentOptionsModal } from "./PaymentOptionsModal";

interface ProductDetailClientProps {
  product: Product;
  vendor: Vendor;
  effectiveAvailable: boolean;
  effectiveRemaining: number;
  unavailableReason: string | null;
  initialReviews: VendorRating[];
  isAuthenticated: boolean;
}

function VerifiedSealSmall({ color = "#1D9BF0" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-label="Verified">
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
    return <Plug size={14} strokeWidth={1.7} color="#52525B" />;
  }
  if (lower.includes("water")) {
    return <Droplet size={14} strokeWidth={1.7} color="#52525B" />;
  }
  if (lower.includes("wardrobe")) {
    return <DoorClosed size={14} strokeWidth={1.7} color="#52525B" />;
  }
  if (lower.includes("security")) {
    return <ShieldCheck size={14} strokeWidth={1.7} color="#52525B" />;
  }
  return <Sparkles size={14} strokeWidth={1.7} color="#52525B" />;
}

function formatCompactCount(count: number): string {
  if (count >= 1000) {
    const k = count / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return String(count);
}

export function ProductDetailClient({
  product,
  vendor,
  effectiveAvailable,
  effectiveRemaining,
  unavailableReason,
  initialReviews,
  isAuthenticated,
}: ProductDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profileOpen, setProfileOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [liveRating, setLiveRating] = useState(vendor.rating);
  const [liveRatingCount, setLiveRatingCount] = useState(
    vendor.ratingCount ?? 120
  );
  const [reviews, setReviews] = useState<VendorRating[]>(initialReviews);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [product.id]);

  useEffect(() => {
    if (isAuthenticated && searchParams.get("pay") === "1") {
      setPaymentModalOpen(true);
    }
  }, [isAuthenticated, searchParams]);

  const q = searchParams.get("q");
  const backHref = q ? `/?q=${encodeURIComponent(q)}` : `/`;

  useEffect(() => {
    router.prefetch(backHref);
  }, [router, backHref]);

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      document.referrer &&
      new URL(document.referrer).origin === window.location.origin
    ) {
      e.preventDefault();
      router.back();
    }
  };

  const isProperty =
    product.category.toLowerCase().includes("propert") ||
    product.category.toLowerCase().includes("apartment");

  const viewCount = vendor.stats.views ?? 4800;

  const handlePaymentClick = () => {
    if (!isAuthenticated) {
      const next = encodeURIComponent(`/product/${product.id}?pay=1`);
      router.push(`/register?next=${next}`);
      return;
    }
    setPaymentModalOpen(true);
  };

  const refreshReviews = async () => {
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
  };

  return (
    <>
      <KovaHeader />

      {/* Minimal Sub-bar */}
      <div className="kova-subbar">
        <div className="container kova-subbar__inner">
          <Link
            href={backHref}
            prefetch={true}
            onClick={handleBack}
            className="kova-subbar__left"
          >
            <ArrowLeft size={15} />
            Back to Showroom
          </Link>
        </div>
      </div>

      <main id="main" className="ref-detail-page">
        <div className="ref-detail-shell">
          {/* Uncropped Product Media */}
          <div className="ref-detail-hero">
            <img
              src={product.images[0] || "/listings/flat-exterior.jpg"}
              alt={product.name}
              decoding="async"
            />
          </div>

          {/* Clean, Compact, Scannable Product Details */}
          <div className="ref-detail-sheet">
            <div className="ref-detail-sheet__inner">
              <div>
                <h1 className="ref-detail-title">{product.name}</h1>
                <span className="ref-detail-loc">{product.location}</span>

                <div className="ref-detail-price">
                  <span>
                    {formatNaira(product.price)}
                    {product.pricePeriod ? (
                      <span
                        style={{
                          color: "var(--muted)",
                          fontWeight: 400,
                          fontSize: "0.78rem",
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

              {!effectiveAvailable && (
                <div
                  style={{
                    marginTop: "0.65rem",
                    padding: "0.55rem 0.7rem",
                    borderRadius: 8,
                    background: "var(--danger-soft)",
                    color: "var(--danger)",
                    fontSize: "0.76rem",
                    fontWeight: 500,
                  }}
                >
                  {unavailableReason ||
                    "Sorry, this item is currently unavailable."}
                </div>
              )}

              {/* Primary Action: Make Payment */}
              {effectiveAvailable ? (
                <button
                  type="button"
                  onClick={handlePaymentClick}
                  className="ref-make-payment-btn"
                >
                  Make Payment
                </button>
              ) : (
                <button
                  type="button"
                  className="ref-make-payment-btn"
                  disabled
                >
                  Currently Unavailable
                </button>
              )}

              {/* Product / Property Key Info (No Status label or badge anywhere) */}
              {isProperty ? (
                <div className="kova-info-grid kova-info-grid--three">
                  <div>
                    <div className="ref-fee-label">Inspection</div>
                    <div className="ref-fee-val">
                      {formatNaira(
                        product.inspectionFee && product.inspectionFee > 0
                          ? product.inspectionFee
                          : 10000
                      )}
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
                <div className="kova-info-grid">
                  <div>
                    <div className="ref-fee-label">Condition</div>
                    <div className="ref-fee-val">{product.condition}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="ref-fee-label">Category</div>
                    <div className="ref-fee-val">{product.category}</div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="ref-desc-block">
                <h2 className="ref-desc-heading">Description</h2>
                <p className="ref-desc-text">{product.description}</p>
              </div>

              {/* Amenities (for properties) */}
              {product.amenities && product.amenities.length > 0 && (
                <div
                  style={{
                    marginTop: "0.85rem",
                    paddingTop: "0.8rem",
                    borderTop: "1px solid var(--line)",
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

              {/* Restored Centered Seller Profile Information with Views & Rating */}
              <section
                className="detail-profile-card"
                aria-label="Seller profile information"
              >
                <button
                  type="button"
                  onClick={() => setProfileOpen(true)}
                  className="detail-profile-trigger"
                  title={`View ${vendor.fullName}'s profile`}
                >
                  <div className="detail-profile-avatar">
                    <div className="detail-profile-avatar__ring">
                      {vendor.avatarUrl ? (
                        <img src={vendor.avatarUrl} alt={vendor.fullName} />
                      ) : (
                        getInitials(vendor.fullName)
                      )}
                    </div>
                    {vendor.verificationStatus === "verified" && (
                      <span className="showroom-avatar__seal">
                        <VerifiedSealSmall />
                      </span>
                    )}
                  </div>

                  <div className="detail-profile-name">@{vendor.username}</div>
                  <div className="detail-profile-sub">{vendor.fullName}</div>
                  <span className="kova-role-badge">
                    {vendor.categoryBadge || vendor.role}
                  </span>
                </button>

                <dl className="detail-profile-stats">
                  <div>
                    <dd className="detail-profile-stat__val">
                      {formatCompactCount(viewCount)}
                    </dd>
                    <dt className="detail-profile-stat__label">Views</dt>
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
                      title="Rate this seller"
                    >
                      <dd className="detail-profile-stat__val">
                        {liveRating.toFixed(1)}
                        <Star size={11} fill="#FACC15" color="#FACC15" />
                      </dd>
                      <dt className="detail-profile-stat__label">Rating</dt>
                    </button>
                  </div>
                  <div>
                    <dd className="detail-profile-stat__val">
                      {vendor.stats.deals}
                    </dd>
                    <dt className="detail-profile-stat__label">Deals</dt>
                  </div>
                </dl>
              </section>

              {/* Compact Reviews Section */}
              <div
                style={{
                  marginTop: "0.9rem",
                  paddingTop: "0.85rem",
                  borderTop: "1px solid var(--line)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                    marginBottom: "0.55rem",
                  }}
                >
                  <h2 className="ref-desc-heading" style={{ margin: 0 }}>
                    Reviews
                  </h2>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => setRateOpen(true)}
                  >
                    <Star size={11} fill="#FACC15" color="#FACC15" />
                    Rate
                  </button>
                </div>

                {reviews.length === 0 ? (
                  <p
                    style={{
                      color: "var(--muted)",
                      fontSize: "0.76rem",
                      margin: 0,
                    }}
                  >
                    No reviews yet. Be the first to rate this seller.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: "0.4rem" }}>
                    {reviews.slice(0, 3).map((r) => (
                      <div
                        key={r.id}
                        style={{
                          background: "var(--paper-subtle)",
                          borderRadius: 8,
                          padding: "0.5rem 0.65rem",
                          fontSize: "0.76rem",
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
                              gap: 2,
                              color: "var(--ink-soft)",
                            }}
                          >
                            {r.stars}
                            <Star size={10} fill="#FACC15" color="#FACC15" />
                          </span>
                        </div>
                        {r.comment && (
                          <p
                            style={{
                              margin: "0.18rem 0 0",
                              color: "var(--muted)",
                              lineHeight: 1.4,
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
            </div>
          </div>
        </div>
      </main>

      <KovaFooter />

      <PaymentOptionsModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        product={product}
        maxQuantity={effectiveRemaining}
      />

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
          refreshReviews();
        }}
      />
    </>
  );
}
