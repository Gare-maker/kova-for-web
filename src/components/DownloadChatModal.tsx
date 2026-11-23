"use client";

import React from "react";
import { X, MessageCircle, Smartphone } from "lucide-react";
import type { Vendor, Product } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import { getAppStoreUrl } from "./KovaHeader";

interface DownloadChatModalProps {
  open: boolean;
  onClose: () => void;
  vendor: Vendor;
  product?: Product | null;
}

export function DownloadChatModal({
  open,
  onClose,
  vendor,
  product,
}: DownloadChatModalProps) {
  if (!open) return null;

  const handleDownload = () => {
    window.open(getAppStoreUrl(), "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="chat-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Download Kova App to message ${vendor.fullName}`}
      onClick={onClose}
      style={{ alignItems: "center", justifyContent: "center", padding: "1rem" }}
    >
      <div
        className="surface-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(430px, 100%)",
          position: "relative",
          textAlign: "center",
          padding: "1.85rem 1.5rem 1.5rem",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close popup"
          style={{
            position: "absolute",
            top: "0.95rem",
            right: "0.95rem",
            background: "var(--paper-deep)",
            border: "none",
            borderRadius: "50%",
            width: 34,
            height: 34,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            color: "var(--ink-strong)",
          }}
        >
          <X size={17} />
        </button>

        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--brand-soft)",
            color: "var(--brand)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 1rem",
          }}
        >
          <MessageCircle size={26} />
        </div>

        <h2
          className="display display--sm"
          style={{ color: "var(--ink-strong)", marginBottom: "0.45rem" }}
        >
          Download the Kova App to Chat
        </h2>

        <p
          style={{
            color: "var(--muted)",
            fontSize: "0.93rem",
            margin: "0 0 1.15rem",
            lineHeight: 1.55,
          }}
        >
          To message <strong>@{vendor.username}</strong> ({vendor.fullName})
          directly and get instant replies, download the Kova mobile app.
        </p>

        {product && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              textAlign: "left",
              background: "var(--paper-subtle)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "0.65rem 0.8rem",
              marginBottom: "1.2rem",
            }}
          >
            <img
              src={product.images[0] || "/listings/flat-exterior.jpg"}
              alt={product.name}
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                objectFit: "cover",
                flex: "none",
              }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  color: "var(--ink-strong)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {product.name}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--brand)" }}>
                {formatNaira(product.price)}
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          className="ref-make-payment-btn"
          style={{ marginTop: 0, gap: "0.5rem" }}
          onClick={handleDownload}
        >
          <Smartphone size={17} />
          Download Kova App
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.65rem",
            marginTop: "0.75rem",
          }}
        >
          <a
            href="https://play.google.com/store/apps/details?id=com.kovamarketplace.app"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--outline btn--sm"
            style={{ flex: 1, fontWeight: 500 }}
          >
            Google Play
          </a>
          <a
            href="https://apps.apple.com/app/kova"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--outline btn--sm"
            style={{ flex: 1, fontWeight: 500 }}
          >
            App Store
          </a>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: "0.95rem",
            background: "none",
            border: "none",
            color: "var(--muted)",
            fontSize: "0.86rem",
            cursor: "pointer",
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

