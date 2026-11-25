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
      <KovaHeader brandName={receipt.vendorName} />

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
                gap: "0.8rem",
                paddingBlock: "0.95rem",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <img
                src={receipt.productImage || "/products/desk.svg"}
                alt={receipt.productName}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  objectFit: "cover",
                  background: "var(--paper-deep)",
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    color: "var(--ink-strong)",
                  }}
                >
                  {receipt.paymentLabel && receipt.paymentLabel !== "Product Payment"
                    ? `${receipt.productName} — ${receipt.paymentLabel}`
                    : receipt.productName}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                  Qty: {receipt.quantity} &times; {formatNaira(receipt.unitPrice)}
                </div>
                <div style={{ fontSize: "0.76rem", color: "var(--muted)" }}>
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
                gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))",
                gap: "0.75rem",
                marginBlock: "1rem",
                fontSize: "0.8rem",
              }}
            >
              <div>
                <dt style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Receipt Number
                </dt>
                <dd style={{ margin: "0.15rem 0 0", fontWeight: 600 }}>
                  {receipt.receiptNumber}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Transaction Reference
                </dt>
                <dd style={{ margin: "0.15rem 0 0", fontWeight: 600 }}>
                  {receipt.transactionReference}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Customer Name
                </dt>
                <dd style={{ margin: "0.15rem 0 0", fontWeight: 600 }}>
                  {receipt.customerName}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Phone Number
                </dt>
                <dd style={{ margin: "0.15rem 0 0", fontWeight: 600 }}>
                  {receipt.customerPhone}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Current Location
                </dt>
                <dd style={{ margin: "0.15rem 0 0", fontWeight: 600 }}>
                  {receipt.currentLocation || "—"}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Delivery Address
                </dt>
                <dd style={{ margin: "0.15rem 0 0", fontWeight: 600 }}>
                  {receipt.deliveryAddress}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Payment Date &amp; Time
                </dt>
                <dd style={{ margin: "0.15rem 0 0", fontWeight: 600 }}>
                  {formatDateTime(receipt.paidAt)}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>
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
                This receipt is saved to your Kova account history for future
                re-downloads.
              </span>
              <Link
                href="/"
                className="btn btn--outline btn--sm"
              >
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
          role: "",
          bio: "",
        }}
      />
    </>
  );
}
