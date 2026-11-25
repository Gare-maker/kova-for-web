"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ReceiptText,
  Download,
  LogOut,
  ShieldCheck,
  AlertCircle,
  X,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import type { Receipt, UserAccount } from "@/lib/types";
import { formatNaira, formatDateTime } from "@/lib/format";
import { downloadReceiptPdf } from "@/lib/pdfReceipt";
import { KovaHeader } from "@/components/KovaHeader";
import { KovaFooter } from "@/components/KovaFooter";

export default function AccountReceiptsPage() {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendPreviewUrl, setResendPreviewUrl] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadSession = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/account/session", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setReceipts(data.receipts ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    loadSession();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);
    setResendMessage(null);
    setResendPreviewUrl(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.status === 403 && data.needsVerification) {
        setUnverifiedEmail(email.trim());
        setError(
          data.error || "Please verify your email address before signing in."
        );
        return;
      }
      if (!res.ok) {
        setError(data.error || "Invalid email address or password.");
        return;
      }
      await loadSession();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: unverifiedEmail,
          next: "/account/receipts",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendMessage(
          data.message || `Verification link resent to ${unverifiedEmail}.`
        );
        setResendPreviewUrl(data.verificationPreviewUrl ?? null);
      } else {
        setError(data.error || "Unable to resend verification email.");
      }
    } finally {
      setResending(false);
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/account/session", { method: "DELETE" });
    setUser(null);
    setReceipts([]);
    setSelectedReceipt(null);
  };

  const getReceiptItemTitle = (r: Receipt) => {
    if (r.paymentLabel && r.paymentLabel !== "Product Payment") {
      return `${r.productName} — ${r.paymentLabel}`;
    }
    return `${r.productName} (x${r.quantity})`;
  };

  return (
    <>
      <KovaHeader />
      <main id="main" className="storefront-main">
        <div className="container" style={{ maxWidth: 760 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem",
              marginBottom: "1.1rem",
            }}
          >
            <h1
              className="display display--md"
              style={{ color: "var(--ink-strong)" }}
            >
              My Receipts
            </h1>
            {user && (
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={handleSignOut}
              >
                <LogOut size={14} />
                Sign Out ({user.name})
              </button>
            )}
          </div>

          {loading ? (
            <div className="surface-card" style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
              Loading your receipts...
            </div>
          ) : !user ? (
            <div className="auth-card" style={{ maxWidth: 430 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.32rem",
                  background: "var(--brand-soft)",
                  color: "var(--forest)",
                  padding: "0.2rem 0.54rem",
                  borderRadius: 999,
                  fontSize: "0.69rem",
                  fontWeight: 600,
                  marginBottom: "0.6rem",
                }}
              >
                <ShieldCheck size={12} />
                Buyer Account
              </div>
              <h2 className="auth-card__title">
                Sign In to View Receipts
              </h2>
              <p className="auth-card__desc">
                Enter your Buyer email and password to access saved payments.
              </p>

              {error && (
                <div
                  style={{
                    background: "var(--danger-soft)",
                    color: "var(--danger)",
                    padding: "0.6rem 0.75rem",
                    borderRadius: 8,
                    fontSize: "0.76rem",
                    marginBottom: "0.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.45rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.38rem" }}>
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                  {unverifiedEmail && (
                    <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={handleResendVerification}
                        disabled={resending}
                      >
                        {resending ? "Sending..." : "Resend Verification Email"}
                      </button>
                      {resendPreviewUrl && (
                        <Link
                          href={resendPreviewUrl}
                          className="btn btn--brand btn--sm"
                        >
                          Verify Email Now
                        </Link>
                      )}
                    </div>
                  )}
                  {resendMessage && (
                    <div style={{ color: "var(--forest)", fontWeight: 500 }}>
                      {resendMessage}
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSignIn}>
                <div className="form-group">
                  <label className="form-label" htmlFor="acc-email">
                    Email Address
                  </label>
                  <input
                    id="acc-email"
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="acc-pass">
                    Password
                  </label>
                  <input
                    id="acc-pass"
                    type="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="ref-make-payment-btn"
                  style={{ marginTop: "0.7rem" }}
                  disabled={submitting}
                >
                  {submitting ? "Signing In..." : "Sign In"}
                </button>
              </form>

              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.76rem",
                  color: "var(--muted)",
                  marginTop: "0.85rem",
                  marginBottom: 0,
                }}
              >
                New to Kova?{" "}
                <Link
                  href="/register?next=/account/receipts"
                  style={{ color: "var(--brand)", fontWeight: 600 }}
                >
                  Create a Buyer Account
                </Link>
              </p>
            </div>
          ) : receipts.length === 0 ? (
            <div className="empty-state">
              <ReceiptText size={26} style={{ marginInline: "auto" }} />
              <h3>No completed transactions yet</h3>
              <p>
                Once you complete a verified Paystack payment, your receipt will
                appear here permanently.
              </p>
              <Link href="/" className="btn btn--brand btn--sm">
                Browse Showroom
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "0.65rem" }}>
              {receipts.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedReceipt(r)}
                  className="surface-card"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.8rem",
                    padding: "0.8rem 1rem",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "border-color 0.18s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <img
                      src={r.productImage || "/listings/smartphone.jpg"}
                      alt={r.productName}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        objectFit: "cover",
                        background: "var(--paper-deep)",
                        flex: "none",
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.86rem",
                          color: "var(--ink-strong)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {getReceiptItemTitle(r)}
                      </div>
                      <div
                        style={{
                          fontSize: "0.74rem",
                          color: "var(--muted)",
                          marginTop: "0.1rem",
                        }}
                      >
                        {formatDateTime(r.paidAt)}
                      </div>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          marginTop: "0.24rem",
                          background: "var(--brand-soft)",
                          color: "var(--brand-dark)",
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          padding: "0.1rem 0.45rem",
                          borderRadius: 999,
                        }}
                      >
                        <CheckCircle2 size={11} />
                        {r.paymentStatus} · Completed
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      flex: "none",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        color: "var(--ink-strong)",
                      }}
                    >
                      {formatNaira(r.totalPaid)}
                    </div>
                    <ChevronRight size={15} color="var(--muted)" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detailed Receipt View Modal (On Click) */}
      {selectedReceipt && (
        <div
          className="chat-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Receipt ${selectedReceipt.receiptNumber}`}
          onClick={() => setSelectedReceipt(null)}
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            className="surface-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(460px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedReceipt(null)}
              aria-label="Close receipt details"
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                background: "var(--paper-deep)",
                border: "none",
                borderRadius: "50%",
                width: 28,
                height: 28,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                color: "var(--ink-strong)",
              }}
            >
              <X size={15} />
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.55rem",
                marginBottom: "0.85rem",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "var(--brand-soft)",
                  color: "var(--brand)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h2
                  className="display display--sm"
                  style={{ color: "var(--ink-strong)" }}
                >
                  Payment Receipt
                </h2>
                <div style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                  {selectedReceipt.receiptNumber} ·{" "}
                  {selectedReceipt.paymentStatus}
                </div>
              </div>
            </div>

            <div
              style={{
                background: "var(--paper-subtle)",
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: "0.8rem",
                marginBottom: "0.85rem",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: "var(--ink-strong)",
                  marginBottom: "0.35rem",
                }}
              >
                {getReceiptItemTitle(selectedReceipt)}
              </div>
              <div
                style={{
                  display: "grid",
                  gap: "0.28rem",
                  fontSize: "0.8rem",
                  color: "var(--ink-soft)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>
                    {selectedReceipt.paymentLabel &&
                    selectedReceipt.paymentLabel !== "Product Payment"
                      ? selectedReceipt.paymentLabel
                      : `Unit Price (${selectedReceipt.quantity}x)`}
                  </span>
                  <span>
                    {formatNaira(
                      selectedReceipt.unitPrice * selectedReceipt.quantity
                    )}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: "0.38rem",
                    borderTop: "1px solid var(--line)",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color: "var(--ink-strong)",
                  }}
                >
                  <span>Total Amount Paid</span>
                  <span style={{ color: "var(--brand-dark)" }}>
                    {formatNaira(selectedReceipt.totalPaid)}
                  </span>
                </div>
              </div>
            </div>

            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "0.65rem",
                fontSize: "0.78rem",
                margin: "0 0 1rem",
              }}
            >
              <div>
                <dt style={{ color: "var(--muted)", fontSize: "0.7rem" }}>
                  Transaction Reference
                </dt>
                <dd style={{ margin: "0.12rem 0 0", fontWeight: 600 }}>
                  {selectedReceipt.transactionReference}
                </dd>
              </div>
              <div>
                <dt style={{ color: "var(--muted)", fontSize: "0.7rem" }}>
                  Payment Method
                </dt>
                <dd style={{ margin: "0.12rem 0 0", fontWeight: 600 }}>
                  {selectedReceipt.paymentMethod}
                </dd>
              </div>
              <div>
                <dt style={{ color: "var(--muted)", fontSize: "0.7rem" }}>
                  Buyer Details
                </dt>
                <dd style={{ margin: "0.12rem 0 0", fontWeight: 600 }}>
                  {selectedReceipt.customerName} · {selectedReceipt.customerPhone}
                </dd>
              </div>
              <div>
                <dt style={{ color: "var(--muted)", fontSize: "0.7rem" }}>
                  Seller / Showroom
                </dt>
                <dd style={{ margin: "0.12rem 0 0", fontWeight: 600 }}>
                  {selectedReceipt.vendorName} (@{selectedReceipt.vendorUsername})
                </dd>
              </div>
              <div>
                <dt style={{ color: "var(--muted)", fontSize: "0.7rem" }}>
                  Delivery Address
                </dt>
                <dd style={{ margin: "0.12rem 0 0", fontWeight: 600 }}>
                  {selectedReceipt.deliveryAddress}
                </dd>
              </div>
              <div>
                <dt style={{ color: "var(--muted)", fontSize: "0.7rem" }}>
                  Date &amp; Timestamp
                </dt>
                <dd style={{ margin: "0.12rem 0 0", fontWeight: 600 }}>
                  {formatDateTime(selectedReceipt.paidAt)}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              className="ref-make-payment-btn"
              style={{ marginTop: 0, gap: "0.4rem" }}
              onClick={() => downloadReceiptPdf(selectedReceipt)}
            >
              <Download size={14} />
              Download Receipt (PDF)
            </button>
          </div>
        </div>
      )}
      <KovaFooter />
    </>
  );
}
