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
  BadgeCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Vendor, Product } from "@/lib/types";
import { formatNaira, getInitials } from "@/lib/format";
import { KovaHeader } from "./KovaHeader";
import { KovaFooter } from "./KovaFooter";
import { ChatDrawer } from "./ChatDrawer";
import { UserProfileModal } from "./UserProfileModal";

interface ProductDetailClientProps {
  product: Product;
  vendor: Vendor;
  effectiveAvailable: boolean;
  effectiveRemaining: number;
  unavailableReason: string | null;
}

export function ProductDetailClient({
  product,
  vendor,
  effectiveAvailable,
  effectiveRemaining,
  unavailableReason,
}: ProductDetailClientProps) {
  const searchParams = useSearchParams();
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [readMoreDesc, setReadMoreDesc] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    product.options?.[0] ?? ""
  );

  // Preserve browsing search/category state when navigating back
  const qs = searchParams.toString();
  const backHref = qs
    ? `/store/${vendor.username}?${qs}`
    : `/store/${vendor.username}`;

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

  const descPreview =
    product.description.length > 110 && !readMoreDesc
      ? product.description.slice(0, 110).trimEnd() + "..."
      : product.description;

  return (
    <>
      <KovaHeader />

      <main id="main" className="storefront-main">
        <div className="container" style={{ maxWidth: 780 }}>
          {/* Reference Image 1 & 2 Layout: Hero Media + Overlapping Bottom-Sheet Details Card */}
          <div
            style={{
              background: "var(--paper-warm)",
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            {/* Hero Image with Back Arrow */}
            <div
              style={{
                position: "relative",
                background: "var(--paper-deep)",
                aspectRatio: "16 / 11",
                maxHeight: 440,
                width: "100%",
              }}
            >
              <img
                src={product.images[0] || "/products/desk.svg"}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <Link
                href={backHref}
                style={{
                  position: "absolute",
                  top: "1rem",
                  left: "1rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  background: "rgba(18, 18, 31, 0.56)",
                  backdropFilter: "blur(8px)",
                  color: "#fff",
                  padding: "0.45rem 0.85rem",
                  borderRadius: 999,
                  fontSize: "0.86rem",
                  fontWeight: 700,
                }}
              >
                <ArrowLeft size={16} />
                Product Details
              </Link>
            </div>

            {/* Bottom Sheet Card */}
            <div
              style={{
                background: "var(--paper-warm)",
                borderRadius: "24px 24px 0 0",
                marginTop: -22,
                position: "relative",
                padding: "0.75rem clamp(1.25rem, 3vw, 2rem) 1.75rem",
              }}
            >
              {/* Drag Handle */}
              <div
                style={{
                  width: 44,
                  height: 4,
                  borderRadius: 999,
                  background: "var(--line-strong)",
                  margin: "0 auto 1.15rem",
                }}
              />

              {/* Top Info Row: Title/Location/Price on Left, Clickable Seller Avatar + Rating on Right */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1rem",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h1
                    className="display"
                    style={{
                      fontSize: "clamp(1.25rem, 2.2vw, 1.55rem)",
                      color: "var(--ink-strong)",
                      margin: 0,
                    }}
                  >
                    {product.name}
                  </h1>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      marginTop: "0.35rem",
                    }}
                  >
                    <span style={{ fontSize: "0.88rem", color: "var(--muted)" }}>
                      {product.location}
                    </span>
                    <span
                      style={{
                        background: "var(--brand-soft)",
                        color: "var(--brand-dark)",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        padding: "0.18rem 0.55rem",
                        borderRadius: 6,
                      }}
                    >
                      {product.waybillLabel ||
                        (product.deliveryFee === 0
                          ? "Free waybill"
                          : `Delivery ${formatNaira(product.deliveryFee)}`)}
                    </span>
                  </div>

                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.35rem",
                      fontWeight: 800,
                      color: "var(--ink-strong)",
                      marginTop: "0.55rem",
                    }}
                  >
                    {formatNaira(product.price)}
                    {product.pricePeriod ? (
                      <span
                        style={{
                          fontWeight: 500,
                          fontSize: "0.95rem",
                          color: "var(--muted)",
                        }}
                      >
                        {" "}
                        - {product.pricePeriod}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Clickable Seller Avatar & Rating (opens User Details Modal) */}
                <button
                  type="button"
                  onClick={() => setProfileOpen(true)}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.35rem",
                    flex: "none",
                  }}
                  title={`View ${vendor.fullName} profile`}
                >
                  <div style={{ position: "relative", width: 48, height: 48 }}>
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
                        fontWeight: 800,
                      }}
                    >
                      {vendor.avatarUrl ? (
                        <img
                          src={vendor.avatarUrl}
                          alt={vendor.fullName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        getInitials(vendor.fullName)
                      )}
                    </div>
                    {vendor.verificationStatus === "verified" && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: -2,
                          right: -2,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "#2563eb",
                          color: "#fff",
                          display: "grid",
                          placeItems: "center",
                          border: "2px solid #fff",
                        }}
                      >
                        <BadgeCheck size={10} />
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "var(--ink-strong)",
                    }}
                  >
                    {vendor.rating.toFixed(1)}
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                  </span>
                </button>
              </div>

              {/* Options / Variations if applicable */}
              {product.options && product.options.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Available Options
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                    {product.options.map((opt) => {
                      const active = selectedOption === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedOption(opt)}
                          style={{
                            padding: "0.38rem 0.8rem",
                            borderRadius: 8,
                            border: active
                              ? "1.5px solid var(--brand)"
                              : "1px solid var(--line-strong)",
                            background: active
                              ? "var(--brand-soft)"
                              : "var(--paper)",
                            color: active
                              ? "var(--forest)"
                              : "var(--ink-soft)",
                            fontSize: "0.84rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!effectiveAvailable && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.8rem 1rem",
                    borderRadius: 10,
                    background: "var(--danger-soft)",
                    color: "var(--danger)",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                  }}
                >
                  {unavailableReason ||
                    "Sorry, this product is currently unavailable."}
                </div>
              )}

              {/* Primary CTA: Make Payment (matching Image 1 & 2) */}
              <div style={{ marginTop: "1.15rem" }}>
                {effectiveAvailable ? (
                  <Link
                    href={checkoutHref}
                    className="btn btn--brand"
                    style={{ width: "100%", fontSize: "0.95rem" }}
                  >
                    Make Payment
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="btn btn--brand"
                    disabled
                    style={{ width: "100%", fontSize: "0.95rem" }}
                  >
                    Currently Unavailable
                  </button>
                )}
              </div>

              {/* View More Details Toggle (matching Image 2 -> expands to Image 1) */}
              <div style={{ textAlign: "center", marginTop: "0.85rem" }}>
                <button
                  type="button"
                  onClick={() => setShowMoreDetails((v) => !v)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--brand)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  {showMoreDetails ? "Hide Details" : "View More Details"}
                  {showMoreDetails ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              </div>

              {/* Expanded Details Section (matching Image 1) */}
              {showMoreDetails && (
                <div
                  style={{
                    marginTop: "1.15rem",
                    paddingTop: "1.15rem",
                    borderTop: "1px solid var(--line)",
                  }}
                >
                  {/* 2-Column Detail Row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "1rem",
                      paddingBottom: "1rem",
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                        Condition &amp; Stock
                      </div>
                      <div style={{ fontWeight: 800, color: "var(--ink-strong)" }}>
                        {product.condition} ·{" "}
                        {effectiveAvailable
                          ? `${effectiveRemaining} left`
                          : "Unavailable"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                        Delivery / Waybill
                      </div>
                      <div style={{ fontWeight: 800, color: "var(--ink-strong)" }}>
                        {product.deliveryFee === 0
                          ? "Free"
                          : formatNaira(product.deliveryFee)}
                      </div>
                    </div>
                  </div>

                  {/* Description with Read More... toggle */}
                  <div style={{ marginTop: "1rem" }}>
                    <h2
                      className="display"
                      style={{
                        fontSize: "1rem",
                        color: "var(--ink-strong)",
                        margin: "0 0 0.45rem",
                      }}
                    >
                      Description
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--ink-soft)",
                        fontSize: "0.93rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {descPreview}{" "}
                      {product.description.length > 110 && (
                        <button
                          type="button"
                          onClick={() => setReadMoreDesc((r) => !r)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--brand)",
                            fontWeight: 700,
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          {readMoreDesc ? "Show Less" : "Read More..."}
                        </button>
                      )}
                    </p>
                  </div>

                  {/* Secondary Actions */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.65rem",
                      marginTop: "1.25rem",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      onClick={() => setChatOpen(true)}
                      style={{ flex: 1 }}
                    >
                      <MessageCircle size={15} />
                      Chat with Seller
                    </button>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      onClick={handleShareProduct}
                    >
                      {copied ? (
                        <>
                          <Check size={15} />
                          Link Copied
                        </>
                      ) : (
                        <>
                          <Share2 size={15} />
                          Share Product
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <KovaFooter />

      <UserProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        vendor={vendor}
        onStartChat={() => setChatOpen(true)}
      />

      <ChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        vendor={vendor}
        product={product}
      />
    </>
  );
}
