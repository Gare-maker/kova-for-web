"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  Copy,
  Check,
  Store,
  MailCheck,
  ShieldCheck,
} from "lucide-react";
import type { Receipt } from "@/lib/types";
import { formatNaira, formatDateTime } from "@/lib/format";
import { downloadReceiptPdf } from "@/lib/pdfReceipt";
import { KovaFooter } from "./KovaFooter";

export function ReceiptClient({ receipt }: { receipt: Receipt }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // ignore
    }
  };

  const vendorBackHref =
    receipt.vendorUsername.toLowerCase() === "zarablue"
      ? "/"
      : `/store/${encodeURIComponent(receipt.vendorUsername)}`;

  return (
    <>
      <main id="main" className="storefront-main">
        <div className="container" style={{ maxWidth: 680 }}>
          <div className="surface-card">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                paddingBottom: "1.1rem",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--brand-soft)",
                  color: "var(--brand)",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: "0.6rem",
                }}
              >
                <CheckCircle2 size={26} />
              </div>

              <h1
                className="display display--md"
                style={{ color: "var(--ink-strong)" }}
              >
                Payment Successful!
              </h1>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.84rem",
                  margin: "0.3rem 0 0",
                }}
              >
                Your payment to <strong>{receipt.vendorName}</strong> has been
                verified.
              </p>

              <div className="kova-receipt-email-pill">
                <MailCheck size={14} aria-hidden="true" />
                <span>
                  A copy of this PDF receipt has been sent to{" "}
                  <strong>{receipt.customerEmail}</strong>
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.55rem",
                  marginTop: "0.95rem",
                  justifyContent: "center",
                }}
              >
                <button
                  type="button"
                  className="btn btn--brand"
                  onClick={() => downloadReceiptPdf(receipt)}
                >
                  <Download size={15} />
                  Download Receipt (PDF)
                </button>

                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      Receipt Link Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy Receipt Link
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Item / Service Paid For */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                paddingBlock: "0.95rem",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <img
                src={receipt.productImage || "/listings/smartphone.jpg"}
                alt={receipt.productName}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  objectFit: "cover",
                  background: "var(--paper-deep)",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    color: "var(--ink-strong)",
                  }}
                >
                  {receipt.paymentLabel &&
                  receipt.paymentLabel !== "Product Payment"
                    ? `${receipt.productName} — ${receipt.paymentLabel}`
                    : receipt.productName}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                  Qty: {receipt.quantity} &times; {formatNaira(receipt.unitPrice)}
                </div>
                <div style={{ fontSize: "0.76rem", color: "var(--muted)" }}>
                  Business: {receipt.vendorName} (@{receipt.vendorUsername})
                  {receipt.vendorLocation ? ` · ${receipt.vendorLocation}` : ""}
                </div>
              </div>
              <div
                className="display display--sm"
                style={{ color: "var(--brand-dark)", flex: "none" }}
              >
                {formatNaira(receipt.totalPaid)}
              </div>
            </div>

            {/* Complete Receipt Metadata */}
            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))",
                gap: "0.78rem",
                marginBlock: "1rem",
                fontSize: "0.8rem",
              }}
            >
              <div>
                <dt
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--muted)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Receipt Number
                </dt>
                <dd style={{ margin: "0.15rem 0 0", fontWeight: 600 }}>
                  {receipt.receiptNumber}
                </dd>
              </div>
              <div>
                <dt
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--muted)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Transaction Reference
                </dt>
                <dd style={{ margin: "0.15rem 0 0", fontWeight: 600 }}>
                  {receipt.transactionReference}
                </dd>
              </div>
              <div>
                <dt
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--muted)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Customer Name
                </dt>
                <dd style={{ margin: "0.15rem 0 0", fontWeight: 600 }}>
                  {receipt.customerName}
                </dd>
              </div>
              <div>
                <dt
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--muted)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Email Address
                </dt>
                <dd style={{ margin: "0.15rem 0 0", fontWeight: 600 }}>
                  {receipt.customerEmail}
                </dd>
              </div>
              <div>
                <dt
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--muted)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Phone Number
                </dt>
                <dd style={{ margin: "0.15rem 0 0", fontWeight: 600 }}>
                  {receipt.customerPhone}
                </dd>
              </div>
              <div>
                <dt
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--muted)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Location
                </dt>
                <dd style={{ margin: "0.15rem 0 0", fontWeight: 600 }}>
                  {receipt.currentLocation || "—"}
                </dd>
              </div>
              {receipt.deliveryAddress && (
                <div>
                  <dt
                    style={{
                      fontSize: "0.68rem",
                      color: "var(--muted)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    Delivery Address
                  </dt>
                  <dd style={{ margin: "0.15rem 0 0", fontWeight: 600 }}>
                    {receipt.deliveryAddress}
                  </dd>
                </div>
              )}
              <div>
                <dt
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--muted)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Payment Date &amp; Time
                </dt>
                <dd style={{ margin: "0.15rem 0 0", fontWeight: 600 }}>
                  {formatDateTime(receipt.paidAt)}
                </dd>
              </div>
              <div>
                <dt
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--muted)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Payment Status
                </dt>
                <dd
                  style={{
                    margin: "0.15rem 0 0",
                    fontWeight: 600,
                    color: "var(--brand-dark)",
                  }}
                >
                  {receipt.paymentStatus} ({receipt.paymentMethod})
                </dd>
              </div>
            </dl>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.65rem",
                paddingTop: "0.85rem",
                borderTop: "1px solid var(--line)",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.38rem",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                }}
              >
                <ShieldCheck size={14} color="var(--brand)" />
                Download your PDF now or check your email inbox anytime.
              </span>
              <Link href={vendorBackHref} className="btn btn--outline btn--sm">
                <Store size={13} />
                Back to Showroom
              </Link>
            </div>
          </div>
        </div>
      </main>

      <KovaFooter
        vendor={{
          username: receipt.vendorUsername,
          fullName: receipt.vendorName,
          categoryBadge: receipt.vendorCategory,
          role: "",
          bio: "",
        }}
      />
    </>
  );
}
