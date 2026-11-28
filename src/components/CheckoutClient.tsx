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
  Minus,
  Plus,
  Mail,
} from "lucide-react";
import type { Product, Vendor, Order, PaymentCategory } from "@/lib/types";
import { formatNaira } from "@/lib/format";
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

  const isProperty =
    product.category.toLowerCase().includes("propert") ||
    product.category.toLowerCase().includes("apartment");

  const initialMode: "product" | "property" =
    searchParams.get("type") === "property" || (isProperty && !searchParams.get("type"))
      ? "property"
      : "product";
  const initialFee: "inspection" | "agent" =
    searchParams.get("feeType") === "agent" ? "agent" : "inspection";
  const initialQty = Math.min(
    Math.max(1, effectiveRemaining),
    Math.max(1, Number(searchParams.get("qty")) || 1)
  );

  const [paymentMode, setPaymentMode] = useState<"product" | "property">(
    initialMode
  );
  const [propertyFeeType, setPropertyFeeType] = useState<"inspection" | "agent">(
    initialFee
  );
  const [quantity, setQuantity] = useState(initialQty);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [step, setStep] = useState<"form" | "paystack" | "verifying">(
    verifyRef ? "verifying" : "form"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [paymentChannel, setPaymentChannel] = useState<
    "Paystack (Card)" | "Paystack (Bank Transfer)"
  >("Paystack (Card)");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    router.prefetch(`/product/${product.id}`);
  }, [router, product.id]);

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

  const inspectionAmount =
    product.inspectionFee && product.inspectionFee > 0
      ? product.inspectionFee
      : 10000;
  const agentAmount =
    product.agentFee && product.agentFee > 0 ? product.agentFee : 17000;

  const paymentCategory: PaymentCategory =
    paymentMode === "product"
      ? "product"
      : propertyFeeType === "inspection"
      ? "property_inspection"
      : "property_agent";

  const activeUnitPrice =
    paymentMode === "product"
      ? product.price
      : propertyFeeType === "inspection"
      ? inspectionAmount
      : agentAmount;

  const activeQty = paymentMode === "product" ? quantity : 1;
  const subtotal = activeUnitPrice * activeQty;
  const totalPayable = subtotal;

  const paymentLabel =
    paymentMode === "product"
      ? "Product Payment"
      : propertyFeeType === "inspection"
      ? "Property Inspection Fee"
      : "Property Agent Fee";

  const handleInitializePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !phone.trim() || !location.trim()) {
      setError(
        "Please fill in your full name, email address, phone number, and location."
      );
      return;
    }

    if (paymentMode === "product" && !deliveryAddress.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: activeQty,
          paymentCategory,
          customer: {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            location: location.trim(),
            currentLocation: location.trim(),
            deliveryAddress: deliveryAddress.trim() || location.trim(),
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

  const safeMax = Math.max(1, effectiveRemaining);

  const handleBack = () => {
    if (step === "paystack") {
      setStep("form");
      return;
    }
    router.push(`/product/${product.id}`);
  };

  return (
    <>
      <main id="main" className="storefront-main">
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "0.2rem",
            }}
          >
            <h1
              className="display display--md"
              style={{ color: "var(--ink-strong)" }}
            >
              Make Payment
            </h1>
            <button
              type="button"
              onClick={handleBack}
              className="btn btn--ghost btn--sm"
            >
              <ArrowLeft size={14} />
              {step === "form" ? "Back to Product" : "Back"}
            </button>
          </div>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.78rem",
              marginTop: 0,
              marginBottom: "1rem",
            }}
          >
            {paymentLabel} · Sold by <strong>{vendor.fullName}</strong>
          </p>

          {!effectiveAvailable && paymentMode === "product" && step === "form" ? (
            <div className="empty-state">
              <AlertCircle
                size={32}
                color="var(--danger)"
                style={{ marginInline: "auto" }}
              />
              <h3>Sorry, this item is currently unavailable.</h3>
              <p>It may have just been purchased or reserved by another buyer.</p>
              <Link href="/" className="btn btn--brand btn--sm">
                Browse Other Listings
              </Link>
            </div>
          ) : (
            <div className="checkout-grid">
              <div className="surface-card">
                {error && (
                  <div className="kova-sheet-error" role="alert">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                {step === "form" && (
                  <form onSubmit={handleInitializePayment}>
                    <h2
                      className="display display--sm"
                      style={{ marginBottom: "1rem" }}
                    >
                      Payment Details
                    </h2>

                    {isProperty ? (
                      <div className="kova-sheet-fee-row" style={{ marginBottom: "1rem" }}>
                        <button
                          type="button"
                          className={`kova-sheet-choice ${
                            paymentMode === "property" &&
                            propertyFeeType === "inspection"
                              ? "kova-sheet-choice--active"
                              : ""
                          }`}
                          onClick={() => {
                            setPaymentMode("property");
                            setPropertyFeeType("inspection");
                          }}
                        >
                          <span>Inspection Fee</span>
                          <strong>{formatNaira(inspectionAmount)}</strong>
                        </button>
                        <button
                          type="button"
                          className={`kova-sheet-choice ${
                            paymentMode === "property" &&
                            propertyFeeType === "agent"
                              ? "kova-sheet-choice--active"
                              : ""
                          }`}
                          onClick={() => {
                            setPaymentMode("property");
                            setPropertyFeeType("agent");
                          }}
                        >
                          <span>Agent Fee</span>
                          <strong>{formatNaira(agentAmount)}</strong>
                        </button>
                        <button
                          type="button"
                          className={`kova-sheet-choice ${
                            paymentMode === "product"
                              ? "kova-sheet-choice--active"
                              : ""
                          }`}
                          onClick={() => setPaymentMode("product")}
                        >
                          <span>Full Amount</span>
                          <strong>{formatNaira(product.price)}</strong>
                        </button>
                      </div>
                    ) : (
                      <div
                        className="kova-sheet-qty-row"
                        style={{ marginBottom: "1rem" }}
                      >
                        <div>
                          <div className="kova-sheet-qty-row__label">
                            Quantity
                          </div>
                          <div className="kova-sheet-qty-row__sub">
                            {formatNaira(product.price)} &times; {quantity} ={" "}
                            {formatNaira(subtotal)}
                          </div>
                        </div>
                        <div className="kova-sheet-qty-ctrl">
                          <button
                            type="button"
                            onClick={() =>
                              setQuantity((q) => Math.max(1, q - 1))
                            }
                            disabled={quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span>{quantity}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setQuantity((q) => Math.min(safeMax, q + 1))
                            }
                            disabled={quantity >= safeMax}
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    )}

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
                        autoComplete="name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-email">
                        Email Address *
                      </label>
                      <input
                        id="cust-email"
                        type="email"
                        className="form-input"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-phone">
                        Phone Number *
                      </label>
                      <input
                        id="cust-phone"
                        type="tel"
                        className="form-input"
                        placeholder="e.g. 0803 456 7890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-location">
                        Location *
                      </label>
                      <input
                        id="cust-location"
                        className="form-input"
                        placeholder="e.g. Lekki, Lagos State"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-address">
                        {paymentMode === "product"
                          ? "Delivery Address *"
                          : "Street Address / Landmark (Optional)"}
                      </label>
                      <input
                        id="cust-address"
                        className="form-input"
                        placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        autoComplete="street-address"
                        required={paymentMode === "product"}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-notes">
                        Notes (Optional)
                      </label>
                      <input
                        id="cust-notes"
                        className="form-input"
                        placeholder="e.g. Call me upon arrival"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                      />
                    </div>

                    <div className="kova-sheet-email-note" style={{ marginBottom: "0.85rem" }}>
                      <Mail size={13} aria-hidden="true" />
                      <span>
                        No account required. Your official PDF receipt will be
                        available immediately and emailed automatically.
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="btn btn--brand"
                      style={{ width: "100%" }}
                      disabled={loading}
                    >
                      <Lock size={14} />
                      {loading
                        ? "Connecting to Paystack..."
                        : `Pay ${formatNaira(totalPayable)} with Paystack`}
                    </button>
                  </form>
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
                            fontWeight: 600,
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
                          fontWeight: 600,
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

                    <div className="kova-sheet-channels" style={{ marginBottom: "1.1rem" }}>
                      <button
                        type="button"
                        onClick={() => setPaymentChannel("Paystack (Card)")}
                        className={`kova-sheet-channel ${
                          paymentChannel === "Paystack (Card)"
                            ? "kova-sheet-channel--active"
                            : ""
                        }`}
                      >
                        <CreditCard size={16} />
                        <span>Debit Card</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPaymentChannel("Paystack (Bank Transfer)")
                        }
                        className={`kova-sheet-channel ${
                          paymentChannel === "Paystack (Bank Transfer)"
                            ? "kova-sheet-channel--active"
                            : ""
                        }`}
                      >
                        <Building2 size={16} />
                        <span>Bank Transfer</span>
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
                        : `Authorize & Pay ${formatNaira(
                            pendingOrder.totalPaid
                          )}`}
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
                      sending your receipt.
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
                    gap: "0.75rem",
                    alignItems: "center",
                    paddingBottom: "0.8rem",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <img
                    src={product.images[0] || "/listings/smartphone.jpg"}
                    alt={product.name}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 9,
                      objectFit: "cover",
                      background: "var(--paper-deep)",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.84rem",
                        color: "var(--ink-strong)",
                        lineHeight: 1.3,
                      }}
                    >
                      {product.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.74rem",
                        color: "var(--brand-dark)",
                        fontWeight: 600,
                      }}
                    >
                      {paymentLabel}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                      Sold by {vendor.fullName} (@{vendor.username})
                    </div>
                    {paymentMode === "product" && (
                      <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                        Qty: {activeQty}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.45rem",
                    paddingBlock: "0.8rem",
                    borderBottom: "1px solid var(--line)",
                    fontSize: "0.82rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: "var(--muted)" }}>
                      {paymentMode === "product"
                        ? `Product Price (${activeQty}x)`
                        : paymentLabel}
                    </span>
                    <strong>{formatNaira(subtotal)}</strong>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "0.8rem",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "0.86rem" }}>
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
                    gap: "0.4rem",
                    fontSize: "0.74rem",
                    color: "var(--muted)",
                    marginTop: "0.85rem",
                    marginBottom: 0,
                  }}
                >
                  <ShieldCheck size={14} color="var(--brand)" />
                  Server-verified Paystack payment with instant PDF receipt &amp;
                  email copy.
                </p>
              </aside>
            </div>
          )}
        </div>
      </main>

      <KovaFooter vendor={vendor} />
    </>
  );
}
