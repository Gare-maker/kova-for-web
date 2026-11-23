"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Product, Vendor, Order } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import { KovaHeader } from "./KovaHeader";
import { KovaFooter } from "./KovaFooter";

interface CheckoutClientProps {
  product: Product;
  vendor: Vendor;
  effectiveAvailable: boolean;
  effectiveRemaining: number;
}

export function CheckoutClient({
  product,
  vendor,
  effectiveAvailable,
  effectiveRemaining,
}: CheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyRef = searchParams.get("verify");
  const selectedOption = searchParams.get("option") ?? product.options?.[0] ?? "";

  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [step, setStep] = useState<"form" | "review" | "paystack" | "verifying">(
    verifyRef ? "verifying" : "form"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [paymentChannel, setPaymentChannel] = useState<
    "Paystack (Card)" | "Paystack (Bank Transfer)"
  >("Paystack (Card)");

  useEffect(() => {
    if (!verifyRef) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: verifyRef }),
        });
        const data = await res.json();
        if (!active) return;
        if (res.ok && data.receiptUrl) {
          router.replace(data.receiptUrl);
        } else {
          setError(
            data.error ||
              "Your payment could not be completed. Please try again."
          );
          setStep("form");
        }
      } catch {
        if (active) {
          setError("We're confirming your payment. Please check back shortly.");
          setStep("form");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [verifyRef, router]);

  const subtotal = product.price * quantity;
  const totalPayable = subtotal + product.deliveryFee;

  const handleContinueToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !currentLocation.trim() ||
      !deliveryAddress.trim()
    ) {
      setError(
        "Please fill in your full name, phone number, email, current location, and delivery address."
      );
      return;
    }
    setStep("review");
  };

  const handleInitializePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          selectedOption: selectedOption || undefined,
          customer: {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            currentLocation: currentLocation.trim(),
            deliveryAddress: deliveryAddress.trim(),
            deliveryNotes: deliveryNotes.trim() || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to initialize payment.");
        return;
      }

      if (data.mode === "paystack_live" && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }

      setPendingOrder(data.order);
      setStep("paystack");
    } catch {
      setError("Network error while initializing payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSimulatorPayment = async () => {
    if (!pendingOrder) return;
    setLoading(true);
    setError(null);
    setStep("verifying");
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: pendingOrder.transactionReference,
          paymentMethod: paymentChannel,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.receiptUrl) {
        setError(
          data.error || "Your payment could not be completed. Please try again."
        );
        setStep("paystack");
        return;
      }
      router.push(data.receiptUrl);
    } catch {
      setError("Your payment could not be completed. Please try again.");
      setStep("paystack");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <KovaHeader />

      <main id="main" className="storefront-main">
        <div className="container">
          <div style={{ marginBottom: "1.25rem" }}>
            <Link
              href={`/product/${product.id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--muted)",
              }}
            >
              <ArrowLeft size={15} />
              Back to Product
            </Link>
          </div>

          <h1
            className="display display--md"
            style={{ color: "var(--ink-strong)", marginBottom: "0.35rem" }}
          >
            Checkout
          </h1>
          <p style={{ color: "var(--muted)", marginTop: 0, marginBottom: "1.5rem" }}>
            Complete your purchase from <strong>{vendor.fullName}</strong> without
            installing the Kova app.
          </p>

          {!effectiveAvailable && step === "form" && (
            <div className="empty-state">
              <AlertCircle size={32} color="var(--danger)" style={{ marginInline: "auto" }} />
              <h3>Sorry, this product is currently unavailable.</h3>
              <p>It may have just been purchased or reserved by another buyer.</p>
              <Link
                href={`/store/${vendor.username}`}
                className="btn btn--brand btn--sm"
              >
                Browse Other Products
              </Link>
            </div>
          )}

          {(effectiveAvailable || step !== "form") && (
            <div className="checkout-grid">
              <div className="surface-card">
                {error && (
                  <div
                    style={{
                      background: "var(--danger-soft)",
                      color: "var(--danger)",
                      padding: "0.85rem 1rem",
                      borderRadius: 10,
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      marginBottom: "1.15rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                {step === "form" && (
                  <form onSubmit={handleContinueToReview}>
                    <h2
                      className="display display--sm"
                      style={{ marginBottom: "1rem" }}
                    >
                      1. Customer &amp; Delivery Information
                    </h2>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-name">
                        Full Name *
                      </label>
                      <input
                        id="cust-name"
                        className="form-input"
                        placeholder="e.g. Chinedu Okeke"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-phone">
                        Phone Number *
                      </label>
                      <input
                        id="cust-phone"
                        className="form-input"
                        placeholder="e.g. 0803 456 7890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-email">
                        Email Address * (links your receipt history)
                      </label>
                      <input
                        id="cust-email"
                        type="email"
                        className="form-input"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-current-loc">
                        Current Location *
                      </label>
                      <input
                        id="cust-current-loc"
                        className="form-input"
                        placeholder="e.g. Auchi Polytechnic Campus, Edo State"
                        value={currentLocation}
                        onChange={(e) => setCurrentLocation(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-address">
                        Delivery Location / Address *
                      </label>
                      <input
                        id="cust-address"
                        className="form-input"
                        placeholder="e.g. Block C, Room 14, Sabo, Auchi"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-notes">
                        Delivery Instructions (Optional)
                      </label>
                      <input
                        id="cust-notes"
                        className="form-input"
                        placeholder="e.g. Call me at the gate"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                      />
                    </div>

                    {effectiveRemaining > 1 && (
                      <div className="form-group">
                        <label className="form-label" htmlFor="cust-qty">
                          Quantity (Max {effectiveRemaining})
                        </label>
                        <input
                          id="cust-qty"
                          type="number"
                          min={1}
                          max={effectiveRemaining}
                          className="form-input"
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(
                              Math.min(
                                effectiveRemaining,
                                Math.max(1, Number(e.target.value) || 1)
                              )
                            )
                          }
                          style={{ maxWidth: 120 }}
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn btn--brand"
                      style={{ width: "100%", marginTop: "0.5rem" }}
                    >
                      Review Order &amp; Continue
                    </button>
                  </form>
                )}

                {step === "review" && (
                  <div>
                    <h2
                      className="display display--sm"
                      style={{ marginBottom: "1rem" }}
                    >
                      2. Review Information &amp; Pay
                    </h2>

                    <div
                      style={{
                        background: "var(--paper)",
                        border: "1px solid var(--line)",
                        borderRadius: 12,
                        padding: "1rem",
                        marginBottom: "1.25rem",
                        fontSize: "0.92rem",
                        display: "grid",
                        gap: "0.35rem",
                      }}
                    >
                      <div>
                        <strong>Full Name:</strong> {name}
                      </div>
                      <div>
                        <strong>Phone Number:</strong> {phone}
                      </div>
                      <div>
                        <strong>Email:</strong> {email}
                      </div>
                      <div>
                        <strong>Current Location:</strong> {currentLocation}
                      </div>
                      <div>
                        <strong>Delivery Address:</strong> {deliveryAddress}
                      </div>
                      {deliveryNotes && (
                        <div>
                          <strong>Notes:</strong> {deliveryNotes}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        className="btn btn--outline"
                        onClick={() => setStep("form")}
                        disabled={loading}
                      >
                        Edit Information
                      </button>
                      <button
                        type="button"
                        className="btn btn--brand"
                        style={{ flex: 1 }}
                        onClick={handleInitializePayment}
                        disabled={loading}
                      >
                        <Lock size={15} />
                        {loading
                          ? "Initializing Paystack..."
                          : `Pay ${formatNaira(totalPayable)} with Paystack`}
                      </button>
                    </div>
                  </div>
                )}

                {step === "paystack" && pendingOrder && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingBottom: "0.9rem",
                        borderBottom: "1px solid var(--line)",
                        marginBottom: "1.1rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "var(--muted)",
                            fontWeight: 800,
                          }}
                        >
                          Paystack Secure Checkout
                        </div>
                        <div
                          className="display display--sm"
                          style={{ color: "var(--brand-dark)" }}
                        >
                          {formatNaira(pendingOrder.totalPaid)}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          background: "var(--brand-soft)",
                          color: "var(--forest)",
                          padding: "0.3rem 0.65rem",
                          borderRadius: 999,
                          fontWeight: 700,
                        }}
                      >
                        Ref: {pendingOrder.transactionReference}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "0.86rem",
                        color: "var(--muted)",
                        marginTop: 0,
                      }}
                    >
                      Select a payment channel to complete your verified
                      Paystack transaction:
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.75rem",
                        marginBottom: "1.25rem",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setPaymentChannel("Paystack (Card)")}
                        className="btn btn--outline"
                        style={{
                          borderColor:
                            paymentChannel === "Paystack (Card)"
                              ? "var(--brand)"
                              : undefined,
                          background:
                            paymentChannel === "Paystack (Card)"
                              ? "var(--brand-soft)"
                              : undefined,
                        }}
                      >
                        <CreditCard size={16} />
                        Debit Card
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPaymentChannel("Paystack (Bank Transfer)")
                        }
                        className="btn btn--outline"
                        style={{
                          borderColor:
                            paymentChannel === "Paystack (Bank Transfer)"
                              ? "var(--brand)"
                              : undefined,
                          background:
                            paymentChannel === "Paystack (Bank Transfer)"
                              ? "var(--brand-soft)"
                              : undefined,
                        }}
                      >
                        <Building2 size={16} />
                        Bank Transfer
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn--brand"
                      style={{ width: "100%" }}
                      onClick={handleConfirmSimulatorPayment}
                      disabled={loading}
                    >
                      <CheckCircle2 size={16} />
                      {loading
                        ? "Verifying with Paystack..."
                        : `Authorize & Pay ${formatNaira(pendingOrder.totalPaid)}`}
                    </button>
                  </div>
                )}

                {step === "verifying" && (
                  <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                    <h2 className="display display--sm">
                      Confirming your payment...
                    </h2>
                    <p style={{ color: "var(--muted)" }}>
                      We&apos;re verifying your transaction with Paystack and
                      generating your receipt.
                    </p>
                  </div>
                )}
              </div>

              <aside className="surface-card">
                <h2
                  className="display display--sm"
                  style={{ marginBottom: "1rem" }}
                >
                  Order Summary
                </h2>

                <div
                  style={{
                    display: "flex",
                    gap: "0.9rem",
                    alignItems: "center",
                    paddingBottom: "1rem",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <img
                    src={product.images[0] || "/products/desk.svg"}
                    alt={product.name}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 10,
                      objectFit: "cover",
                      background: "var(--paper-deep)",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        color: "var(--ink-strong)",
                        lineHeight: 1.3,
                      }}
                    >
                      {product.name}
                    </div>
                    {selectedOption && (
                      <div style={{ fontSize: "0.8rem", color: "var(--brand-dark)", fontWeight: 700 }}>
                        Option: {selectedOption}
                      </div>
                    )}
                    <div style={{ fontSize: "0.84rem", color: "var(--muted)" }}>
                      Sold by {vendor.fullName} (@{vendor.username})
                    </div>
                    <div style={{ fontSize: "0.84rem", fontWeight: 700 }}>
                      Qty: {quantity}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                    paddingBlock: "1rem",
                    borderBottom: "1px solid var(--line)",
                    fontSize: "0.94rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: "var(--muted)" }}>
                      Product Price ({quantity}x)
                    </span>
                    <strong>{formatNaira(subtotal)}</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: "var(--muted)" }}>
                      Delivery Charge
                    </span>
                    <strong>
                      {product.deliveryFee === 0
                        ? "Free"
                        : formatNaira(product.deliveryFee)}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "1rem",
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: "1rem" }}>
                    Total Payable
                  </span>
                  <span
                    className="display display--sm"
                    style={{ color: "var(--brand-dark)" }}
                  >
                    {formatNaira(totalPayable)}
                  </span>
                </div>

                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    fontSize: "0.78rem",
                    color: "var(--muted)",
                    marginTop: "1.1rem",
                    marginBottom: 0,
                  }}
                >
                  <ShieldCheck size={15} color="var(--brand)" />
                  Server-verified Paystack payment with instant PDF receipt.
                </p>
              </aside>
            </div>
          )}
        </div>
      </main>

      <KovaFooter />
    </>
  );
}
