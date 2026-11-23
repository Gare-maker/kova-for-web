"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ReceiptText,
  Download,
  ExternalLink,
  LogOut,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import type { Receipt, UserAccount } from "@/lib/types";
import { formatNaira, formatDateTime } from "@/lib/format";
import { downloadReceiptPdf } from "@/lib/pdfReceipt";
import { KovaHeader } from "@/components/KovaHeader";
import { KovaFooter } from "@/components/KovaFooter";

export default function AccountReceiptsPage() {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
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
    loadSession();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/account/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to retrieve your receipt history.");
        return;
      }
      setUser(data.user);
      setReceipts(data.receipts ?? []);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/account/session", { method: "DELETE" });
    setUser(null);
    setReceipts([]);
  };

  return (
    <>
      <KovaHeader />

      <main id="main" className="storefront-main">
        <div className="container" style={{ maxWidth: 880 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <h1 className="display display--md" style={{ color: "var(--ink-strong)" }}>
                My Receipts &amp; Payment History
              </h1>
              <p style={{ color: "var(--muted)", margin: "0.25rem 0 0" }}>
                Access your verified Kova transactions and re-download PDF
                receipts anytime.
              </p>
            </div>
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
            <div className="surface-card">Loading your account...</div>
          ) : !user ? (
            <div className="surface-card" style={{ maxWidth: 520 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  background: "var(--brand-soft)",
                  color: "var(--forest)",
                  padding: "0.35rem 0.7rem",
                  borderRadius: 999,
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  marginBottom: "0.85rem",
                }}
              >
                <ShieldCheck size={14} />
                Protected Account Access
              </div>
              <h2 className="display display--sm" style={{ marginBottom: "0.4rem" }}>
                Retrieve Your Receipts
              </h2>
              <p style={{ color: "var(--muted)", fontSize: "0.92rem", marginTop: 0 }}>
                Enter the email address and phone number you used during checkout
                to view and re-download your receipts.
              </p>

              {error && (
                <div
                  style={{
                    background: "var(--danger-soft)",
                    color: "var(--danger)",
                    padding: "0.75rem 0.9rem",
                    borderRadius: 8,
                    fontSize: "0.86rem",
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                  }}
                >
                  <AlertCircle size={16} />
                  {error}
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
                  <label className="form-label" htmlFor="acc-phone">
                    Phone Number
                  </label>
                  <input
                    id="acc-phone"
                    className="form-input"
                    placeholder="e.g. 0803 456 7890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn--brand"
                  style={{ width: "100%" }}
                  disabled={submitting}
                >
                  {submitting ? "Verifying..." : "View My Receipts"}
                </button>
              </form>
            </div>
          ) : receipts.length === 0 ? (
            <div className="empty-state">
              <ReceiptText size={32} style={{ marginInline: "auto" }} />
              <h3>No completed transactions yet</h3>
              <p>
                Once you complete a verified Paystack purchase, your receipt will
                be saved here permanently.
              </p>
              <Link href="/store/Freddy" className="btn btn--brand btn--sm">
                Browse Products
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {receipts.map((r) => (
                <article
                  key={r.id}
                  className="surface-card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1rem",
                    padding: "1.15rem 1.35rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <img
                      src={r.productImage || "/products/desk.svg"}
                      alt={r.productName}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 10,
                        objectFit: "cover",
                        background: "var(--paper-deep)",
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--ink-strong)" }}>
                        {r.productName} (x{r.quantity})
                      </div>
                      <div style={{ fontSize: "0.84rem", color: "var(--muted)" }}>
                        {r.receiptNumber} · {formatDateTime(r.paidAt)}
                      </div>
                      <div
                        style={{
                          fontSize: "0.84rem",
                          fontWeight: 700,
                          color: "var(--brand-dark)",
                          marginTop: "0.15rem",
                        }}
                      >
                        {formatNaira(r.totalPaid)} · {r.paymentStatus}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap" }}>
                    <Link
                      href={`/receipt/${r.id}?token=${r.accessToken}`}
                      className="btn btn--outline btn--sm"
                    >
                      <ExternalLink size={14} />
                      View Receipt
                    </Link>
                    <button
                      type="button"
                      className="btn btn--brand btn--sm"
                      onClick={() => downloadReceiptPdf(r)}
                    >
                      <Download size={14} />
                      Download PDF
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <KovaFooter />
    </>
  );
}

