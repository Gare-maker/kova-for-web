"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
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
import { UserProfileModal } from "./UserProfileModal";
import { PaymentOptionsModal } from "./PaymentOptionsModal";

interface ProductDetailClientProps {
  product: Product;
  vendor: Vendor;
  effectiveAvailable: boolean;
  effectiveRemaining: number;
  unavailableReason: string | null;
  initialReviews?: VendorRating[];
  isAuthenticated: boolean;
}

function VerifiedSealSmall({ color = "#1D9BF0" }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-label="Verified">
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

export function ProductDetailClient({
  product,
  vendor,
  effectiveAvailable,
  effectiveRemaining,
  unavailableReason,
  isAuthenticated,
}: ProductDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profileOpen, setProfileOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

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

  const isProperty =
    product.category.toLowerCase().includes("propert") ||
    product.category.toLowerCase().includes("apartment");

  const handlePaymentClick = () => {
    if (!isAuthenticated) {
      const next = encodeURIComponent(`/product/${product.id}?pay=1`);
      router.push(`/register?next=${next}`);
      return;
    }
    setPaymentModalOpen(true);
  };

  return (
    <>
      <KovaHeader backHref={backHref} />

      <main id="main" className="ref-detail-page">
        <div className="ref-detail-shell">
          {/* 1. Product Image (uncropped, aspect-preserved) */}
          <div className="ref-detail-hero">
            <img
              src={product.images[0] || "/listings/flat-exterior.jpg"}
              alt={product.name}
              decoding="async"
            />
          </div>

          {/* Focused, Uncluttered Product Information */}
          <div className="ref-detail-sheet">
            <div className="ref-detail-sheet__inner">
              {/* 2. Product Title (Prominent H1) */}
              <h1 className="ref-detail-title">{product.name}</h1>

              {/* 3. Seller / Business Profile Information with Actual Profile Picture */}
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="detail-seller-inline"
                title={`View ${vendor.fullName}'s profile`}
              >
                <div className="detail-seller-inline__avatar">
                  <div className="detail-seller-inline__ring">
                    {vendor.avatarUrl ? (
                      <img src={vendor.avatarUrl} alt={vendor.fullName} />
                    ) : (
                      getInitials(vendor.fullName)
                    )}
                  </div>
                  {vendor.verificationStatus === "verified" && (
                    <span className="detail-seller-inline__seal">
                      <VerifiedSealSmall />
                    </span>
                  )}
                </div>
                <div className="detail-seller-inline__text">
                  <span className="detail-seller-inline__name">
                    @{vendor.username}
                  </span>
                  <span className="detail-seller-inline__sub">
                    {vendor.fullName}
                    {vendor.categoryBadge ? ` · ${vendor.categoryBadge}` : ""}
                  </span>
                </div>
              </button>

              {/* 4. Product Price & Location */}
              <div className="ref-detail-price">
                <span>
                  {formatNaira(product.price)}
                  {product.pricePeriod ? (
                    <span
                      style={{
                        color: "var(--muted)",
                        fontWeight: 400,
                        fontSize: "0.84rem",
                      }}
                    >
                      {" "}
                      / {product.pricePeriod.replace(/^Per\s+/i, "")}
                    </span>
                  ) : null}
                </span>

                {!isProperty && effectiveAvailable && (
                  <span className="kova-stock-pill">
                    {effectiveRemaining} in stock
                  </span>
                )}
              </div>
              <span className="ref-detail-loc">{product.location}</span>

              {!effectiveAvailable && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.58rem 0.75rem",
                    borderRadius: 8,
                    background: "var(--danger-soft)",
                    color: "var(--danger)",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                  }}
                >
                  {unavailableReason ||
                    "Sorry, this item is currently unavailable."}
                </div>
              )}

              {/* 5. Product Description */}
              <div className="ref-desc-block">
                <h2 className="ref-desc-heading">Description</h2>
                <p className="ref-desc-text">{product.description}</p>
              </div>

              {/* 6. Other Relevant Product / Property Info (No Status, No Views/Ratings/Deals) */}
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

              {/* Property Amenities */}
              {product.amenities && product.amenities.length > 0 && (
                <div className="kova-amenities-block">
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

              {/* 7. Primary Action: Make Payment */}
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
        rating={vendor.rating}
        listingsCount={vendor.stats.posts}
      />
    </>
  );
}
