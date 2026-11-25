"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Plug,
  Droplet,
  DoorClosed,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Vendor, Product, VendorRating } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import { KovaHeader } from "./KovaHeader";
import { KovaFooter } from "./KovaFooter";
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

  useEffect(() => {
    router.prefetch(backHref);
  }, [router, backHref]);

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      document.referrer &&
      new URL(document.referrer).origin === window.location.origin &&
      new URL(document.referrer).pathname === "/"
    ) {
      e.preventDefault();
      router.back();
    }
  };

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
      <KovaHeader />

      {/* Restored Original Back to Showroom Position on Product Details */}
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
          {/* 1. Product / Property Media (Playable Video or Image) */}
          <div className="ref-detail-hero">
            {product.isVideo && product.videoUrl ? (
              <video
                src={product.videoUrl}
                poster={product.images[0] || "/listings/flat-exterior.jpg"}
                controls
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={`${product.name} product video`}
              />
            ) : (
              <img
                src={product.images[0] || "/listings/flat-exterior.jpg"}
                alt={product.name}
                decoding="async"
              />
            )}
          </div>

          {/* Focused Product / Property Information (No Seller Profile, No Stats, No Status, No Chat) */}
          <div className="ref-detail-sheet">
            <div className="ref-detail-sheet__inner">
              {/* 2. Product / Property Title */}
              <h1 className="ref-detail-title">{product.name}</h1>

              {/* Clear Visual Divider Between Product Name and Price */}
              <hr className="ref-detail-title-divider" />

              {/* 3. Price / Rental Amount */}
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

              {/* 4. Location */}
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

              {/* 5. Description */}
              <div className="ref-desc-block">
                <h2 className="ref-desc-heading">Description</h2>
                <p className="ref-desc-text">{product.description}</p>
              </div>

              {/* 6. Other Relevant Product / Property Details */}
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

              {/* Amenities (for properties) */}
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

      <KovaFooter vendor={vendor} />

      <PaymentOptionsModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        product={product}
        maxQuantity={effectiveRemaining}
      />
    </>
  );
}
