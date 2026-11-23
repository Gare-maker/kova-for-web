"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  MessageCircle,
  Share2,
  Check,
  Star,
  Pause,
  Play,
} from "lucide-react";
import type { Vendor, Product } from "@/lib/types";
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

function VerifiedSealSmall() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-label="Verified">
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
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [readMoreDesc, setReadMoreDesc] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedOption, setSelectedOption] = useState(
    product.options?.[0] ?? ""
  );

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

  const isLongDesc = product.description.length > 120;
  const displayedDesc =
    isLongDesc && !readMoreDesc
      ? product.description.slice(0, 120).trimEnd()
      : product.description;

  const isProperty =
    product.category.toLowerCase().includes("apartment") ||
    product.category.toLowerCase().includes("property");

  return (
    <>
      <KovaHeader />

      <main id="main" className="ref-detail-page">
        <div className="ref-detail-shell">
          <div
            className={`ref-detail-hero ${
              expanded ? "ref-detail-hero--expanded" : ""
            }`}
          >
            <img
              src={product.images[0] || "/listings/flat-exterior.jpg"}
              alt={product.name}
            />
            <div className="ref-detail-hero__scrim" aria-hidden="true" />
            <Link href={backHref} className="ref-detail-back">
              <ArrowLeft size={20} />
              {isProperty ? "Property Details" : "Product Details"}
            </Link>

            {product.isVideo && !expanded && (
              <button
                type="button"
                className="ref-detail-media-btn"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? "Pause preview" : "Play preview"}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
            )}
          </div>

          <div className="ref-detail-sheet">
            <div className="ref-detail-sheet__inner">
              <button
                type="button"
                className="ref-drag-handle"
                onClick={() => setExpanded((v) => !v)}
                aria-label={expanded ? "Collapse details" : "Expand details"}
              />

              <div className="ref-detail-header-row">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h1 className="ref-detail-title">{product.name}</h1>

                  <div className="ref-detail-loc-row">
                    <span className="ref-detail-loc">{product.location}</span>
                    {!expanded && (
                      <span className="ref-waybill-pill">
                        {product.waybillLabel ||
                          (product.deliveryFee === 0
                            ? "Free waybill"
                            : `Delivery ${formatNaira(product.deliveryFee)}`)}
                      </span>
                    )}
                  </div>

                  <div className="ref-detail-price">
                    {formatNaira(product.price)}
                    {product.pricePeriod ? (
                      <span> - {product.pricePeriod}</span>
                    ) : null}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.32rem",
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
                          <VerifiedSealSmall />
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
                    title="Rate this seller"
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

              {expanded && (
                <div>
                  <div className="ref-fees-row">
                    <div>
                      <div className="ref-fee-label">
                        {isProperty ? "Inspection" : "Waybill / Delivery"}
                      </div>
                      <div className="ref-fee-val">
                        {isProperty
                          ? product.inspectionLabel || "Free"
                          : product.deliveryFee === 0
                          ? "Free"
                          : formatNaira(product.deliveryFee)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="ref-fee-label">
                        {isProperty ? "Agent fee" : "Condition"}
                      </div>
                      <div className="ref-fee-val">
                        {isProperty
                          ? formatNaira(product.agentFee ?? 17000)
                          : `${product.condition} · ${effectiveRemaining} left`}
                      </div>
                    </div>
                  </div>

                  {product.options && product.options.length > 0 && (
                    <div style={{ paddingTop: "1rem" }}>
                      <div className="ref-fee-label">Available Options</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
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

                  <div
                    style={{
                      display: "flex",
                      gap: "0.6rem",
                      marginTop: "1.25rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      style={{ flex: 1, fontWeight: 500 }}
                      onClick={() => setChatPromptOpen(true)}
                    >
                      <MessageCircle size={15} />
                      Chat with Seller
                    </button>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      style={{ fontWeight: 500 }}
                      onClick={() => setRateOpen(true)}
                    >
                      <Star size={15} fill="#FACC15" color="#FACC15" />
                      Rate Seller
                    </button>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      style={{ fontWeight: 500 }}
                      onClick={handleShareProduct}
                    >
                      {copied ? (
                        <>
                          <Check size={15} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Share2 size={15} />
                          Share
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className="ref-view-more-bar"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Show Less Details" : "View More Details"}
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
