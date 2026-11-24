"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, Home, Minus, Plus, CheckCircle2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatNaira } from "@/lib/format";

interface PaymentOptionsModalProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  maxQuantity: number;
}

export function PaymentOptionsModal({
  open,
  onClose,
  product,
  maxQuantity,
}: PaymentOptionsModalProps) {
  const router = useRouter();
  const isPropertyDefault =
    product.category.toLowerCase().includes("propert") ||
    product.category.toLowerCase().includes("apartment");

  const [paymentMode, setPaymentMode] = useState<"product" | "property">(
    isPropertyDefault ? "property" : "product"
  );
  const [quantity, setQuantity] = useState(1);
  const [propertyFeeType, setPropertyFeeType] = useState<"inspection" | "agent">(
    "inspection"
  );

  if (!open) return null;

  const safeMax = Math.max(1, maxQuantity);
  const inspectionAmount =
    product.inspectionFee && product.inspectionFee > 0
      ? product.inspectionFee
      : 10000;
  const agentAmount =
    product.agentFee && product.agentFee > 0 ? product.agentFee : 17000;

  const productSubtotal = product.price * quantity;
  const productTotal = productSubtotal + product.deliveryFee;
  const propertyTotal =
    propertyFeeType === "inspection" ? inspectionAmount : agentAmount;

  const handleProceed = () => {
    if (paymentMode === "product") {
      router.push(
        `/checkout/${product.id}?type=product&qty=${quantity}`
      );
    } else {
      router.push(
        `/checkout/${product.id}?type=property&feeType=${propertyFeeType}`
      );
    }
    onClose();
  };

  return (
    <div
      className="chat-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Choose Payment Option"
      onClick={onClose}
      style={{ alignItems: "center", justifyContent: "center", padding: "1rem" }}
    >
      <div
        className="surface-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(480px, 100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close payment options"
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
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

        <h2
          className="display display--sm"
          style={{ color: "var(--ink-strong)", marginBottom: "0.25rem" }}
        >
          Select Payment Type
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "0.88rem", margin: "0 0 1rem" }}>
          Choose how you would like to pay for <strong>{product.name}</strong>.
        </p>

        {/* Two Distinct Payment Type Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.65rem",
            marginBottom: "1.15rem",
          }}
        >
          <button
            type="button"
            onClick={() => setPaymentMode("product")}
            style={{
              padding: "0.8rem 0.75rem",
              borderRadius: 12,
              border:
                paymentMode === "product"
                  ? "1.5px solid var(--brand)"
                  : "1px solid var(--line-strong)",
              background:
                paymentMode === "product" ? "var(--brand-soft)" : "#ffffff",
              color:
                paymentMode === "product"
                  ? "var(--forest)"
                  : "var(--ink-soft)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.35rem",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.88rem",
            }}
          >
            <ShoppingBag size={18} />
            Product Payment
          </button>

          <button
            type="button"
            onClick={() => setPaymentMode("property")}
            style={{
              padding: "0.8rem 0.75rem",
              borderRadius: 12,
              border:
                paymentMode === "property"
                  ? "1.5px solid var(--brand)"
                  : "1px solid var(--line-strong)",
              background:
                paymentMode === "property" ? "var(--brand-soft)" : "#ffffff",
              color:
                paymentMode === "property"
                  ? "var(--forest)"
                  : "var(--ink-soft)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.35rem",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.88rem",
            }}
          >
            <Home size={18} />
            Property Payment
          </button>
        </div>

        {/* Option 1: Product Payment with Quantity Selector */}
        {paymentMode === "product" ? (
          <div
            style={{
              background: "var(--paper-subtle)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "1rem",
              marginBottom: "1.15rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.9rem",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>
                  Quantity
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  {formatNaira(product.price)} each · {safeMax} available
                </div>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  background: "#ffffff",
                  border: "1px solid var(--line-strong)",
                  borderRadius: 10,
                  padding: "0.25rem 0.4rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 7,
                    border: "none",
                    background: "var(--paper-subtle)",
                    display: "grid",
                    placeItems: "center",
                    cursor: quantity <= 1 ? "not-allowed" : "pointer",
                  }}
                >
                  <Minus size={15} />
                </button>
                <span
                  style={{
                    minWidth: 24,
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "0.96rem",
                  }}
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(safeMax, q + 1))}
                  disabled={quantity >= safeMax}
                  aria-label="Increase quantity"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 7,
                    border: "none",
                    background: "var(--paper-subtle)",
                    display: "grid",
                    placeItems: "center",
                    cursor: quantity >= safeMax ? "not-allowed" : "pointer",
                  }}
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid var(--line)",
                paddingTop: "0.75rem",
                display: "grid",
                gap: "0.35rem",
                fontSize: "0.88rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>
                  Subtotal ({quantity} &times; {formatNaira(product.price)})
                </span>
                <span>{formatNaira(productSubtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Delivery</span>
                <span>
                  {product.deliveryFee === 0
                    ? "Free"
                    : formatNaira(product.deliveryFee)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "0.4rem",
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "var(--ink-strong)",
                }}
              >
                <span>Total</span>
                <span style={{ color: "var(--brand)" }}>
                  {formatNaira(productTotal)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Option 2: Property Payment (Inspection Fee or Agent Fee) */
          <div style={{ display: "grid", gap: "0.65rem", marginBottom: "1.15rem" }}>
            <button
              type="button"
              onClick={() => setPropertyFeeType("inspection")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.95rem 1rem",
                borderRadius: 12,
                border:
                  propertyFeeType === "inspection"
                    ? "1.5px solid var(--brand)"
                    : "1px solid var(--line-strong)",
                background:
                  propertyFeeType === "inspection"
                    ? "var(--brand-soft)"
                    : "#ffffff",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: "var(--ink-strong)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  {propertyFeeType === "inspection" && (
                    <CheckCircle2 size={16} color="var(--brand)" />
                  )}
                  Inspection Fee
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                  Book a verified physical inspection of this property
                </div>
              </div>
              <div style={{ fontWeight: 600, color: "var(--brand-dark)" }}>
                {formatNaira(inspectionAmount)}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPropertyFeeType("agent")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.95rem 1rem",
                borderRadius: 12,
                border:
                  propertyFeeType === "agent"
                    ? "1.5px solid var(--brand)"
                    : "1px solid var(--line-strong)",
                background:
                  propertyFeeType === "agent" ? "var(--brand-soft)" : "#ffffff",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: "var(--ink-strong)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  {propertyFeeType === "agent" && (
                    <CheckCircle2 size={16} color="var(--brand)" />
                  )}
                  Agent Fee
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                  Pay the official property agent commission via Kova
                </div>
              </div>
              <div style={{ fontWeight: 600, color: "var(--brand-dark)" }}>
                {formatNaira(agentAmount)}
              </div>
            </button>
          </div>
        )}

        <button
          type="button"
          className="ref-make-payment-btn"
          style={{ marginTop: 0 }}
          onClick={handleProceed}
        >
          Continue to Checkout (
          {formatNaira(paymentMode === "product" ? productTotal : propertyTotal)}
          )
        </button>
      </div>
    </div>
  );
}

