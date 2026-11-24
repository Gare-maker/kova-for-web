"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  Copy,
  Check,
  Store,
  ShieldCheck,
  ReceiptText,
} from "lucide-react";
import type { Receipt } from "@/lib/types";
import { formatNaira, formatDateTime } from "@/lib/format";
import { downloadReceiptPdf } from "@/lib/pdfReceipt";
import { KovaHeader } from "./KovaHeader";
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

  return (
    <>
      <KovaHeader />

      <main id="main" className="storefront-main">
        <div className="container" style={{ maxWidth: 680 }}>
          <div className="surface-card">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                paddingBottom: "1.05rem",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "var(--brand-soft)",
                  color: "var(--brand)",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: "0.55rem",
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <h1
                className="display display--md"
                style={{ color: "var(--ink-strong)" }}
              >
                Payment Successful!
              </h1>
              <p style={{ color: "var(--muted)", fontSize: "0.82rem", margin: "0.25rem 0 0" }}>
                Your payment has been received successfully.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginTop: "0.95rem",
                  justifyContent: "center",
                }}
              >
                <button
                  type="button"
                  className="btn btn--brand btn--sm"
                  onClick={() => downloadReceiptPdf(receipt)}
                >
                  <Download size={14} />
                  Download Receipt
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

                <Link href="/account/receipts" className="btn btn--outline btn--sm">
                  <ReceiptText size={14} />
                  Receipt History
                </Link>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                paddingBlock: "1.25rem",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <img
                src={receipt.productImage || "/products/desk.svg"}
                alt={receipt.productName}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 12,
                  objectFit: "cover",
                  background: "var(--paper-deep)",
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "1.02rem",
                    color: "var(--ink-strong)",
                  }}
                >
                  {receipt.paymentLabel && receipt.paymentLabel !== "Product Payment"
                    ? `${receipt.productName} — ${receipt.paymentLabel}`
                    : receipt.productName}
                </div>
                <div style={{ fontSize: "0.88rem", color: "var(--muted)" }}>
                  Qty: {receipt.quantity} &times; {formatNaira(receipt.unitPrice)}
                </div>
                <div style={{ fontSize: "0.86rem", color: "var(--muted)" }}>
                  Vendor: {receipt.vendorName} (@{receipt.vendorUsername})
                </div>
              </div>
              <div
                className="display display--sm"
                style={{ color: "var(--brand-dark)" }}
              >
                {formatNaira(receipt.totalPaid)}
              </div>
            </div>

            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
                marginBlock: "1.25rem",
              }}
            >
              <div>
                <dt style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
                  Receipt Number
                </dt>
                <dd style={{ margin: "0.2rem 0 0", fontWeight: 700 }}>
                  {receipt.receiptNumber}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
                  Transaction Reference
                </dt>
                <dd style={{ margin: "0.2rem 0 0", fontWeight: 700 }}>
                  {receipt.transactionReference}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
                  Customer Name
                </dt>
                <dd style={{ margin: "0.2rem 0 0", fontWeight: 700 }}>
                  {receipt.customerName}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
                  Phone Number
                </dt>
                <dd style={{ margin: "0.2rem 0 0", fontWeight: 700 }}>
                  {receipt.customerPhone}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
                  Current Location
                </dt>
                <dd style={{ margin: "0.2rem 0 0", fontWeight: 700 }}>
                  {receipt.currentLocation || "—"}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
                  Delivery Address
                </dt>
                <dd style={{ margin: "0.2rem 0 0", fontWeight: 700 }}>
                  {receipt.deliveryAddress}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
                  Payment Date &amp; Time
                </dt>
                <dd style={{ margin: "0.2rem 0 0", fontWeight: 700 }}>
                  {formatDateTime(receipt.paidAt)}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
                  Payment Status
                </dt>
                <dd
                  style={{
                    margin: "0.2rem 0 0",
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
                gap: "0.75rem",
                paddingTop: "1rem",
                borderTop: "1px solid var(--line)",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.82rem",
                  color: "var(--muted)",
                }}
              >
                <ShieldCheck size={15} color="var(--brand)" />
                This receipt is saved to your Kova account history for future
                re-downloads.
              </span>
              <Link
                href="/"
                className="btn btn--outline btn--sm"
              >
                <Store size={14} />
                Back to Showroom
              </Link>
            </div>
          </div>
        </div>
      </main>

      <KovaFooter />
    </>
  );
}
