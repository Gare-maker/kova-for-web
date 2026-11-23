"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  MessageCircle,
  Package,
  Shield,
  Send,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import type {
  Vendor,
  Product,
  Order,
  VendorNotification,
  ChatConversation,
  ChatMessage,
  VerificationStatus,
} from "@/lib/types";
import { formatNaira, formatDateTime } from "@/lib/format";
import { KovaHeader } from "@/components/KovaHeader";
import { KovaFooter } from "@/components/KovaFooter";

interface SyncState {
  vendors: Vendor[];
  products: Product[];
  orders: Order[];
  notifications: VendorNotification[];
  conversations: ChatConversation[];
  messages: ChatMessage[];
}

export default function VendorConsolePage() {
  const [data, setData] = useState<SyncState | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const fetchSync = async () => {
    try {
      const res = await fetch("/api/sync", { cache: "no-store" });
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchSync();
    const timer = setInterval(fetchSync, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleVerificationChange = async (
    vendorId: string,
    status: VerificationStatus
  ) => {
    await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_verification", vendorId, status }),
    });
    fetchSync();
  };

  const handleToggleProduct = async (product: Product) => {
    const nextAvail =
      product.availability === "available" ? "unavailable" : "available";
    await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "set_product_availability",
        productId: product.id,
        availability: nextAvail,
        quantity: nextAvail === "available" && product.quantity === 0 ? 1 : product.quantity,
      }),
    });
    fetchSync();
  };

  const handleVendorReply = async (conv: ChatConversation) => {
    const text = (replyDrafts[conv.id] || "").trim();
    if (!text) return;
    const vendor = data?.vendors.find((v) => v.id === conv.vendorId);
    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: conv.id,
        senderType: "vendor",
        senderName: vendor?.fullName || "Vendor",
        text,
      }),
    });
    setReplyDrafts((prev) => ({ ...prev, [conv.id]: "" }));
    fetchSync();
  };

  return (
    <>
      <KovaHeader />

      <main id="main" className="storefront-main">
        <div className="container">
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
              <h1 className="display display--md">
                Kova App &amp; Backend Sync Console
              </h1>
              <p style={{ color: "var(--muted)", margin: "0.25rem 0 0" }}>
                One connected ecosystem: inspect website orders (4.9%
                commission), payment notifications, live customer chat, and
                vendor verification sync.
              </p>
            </div>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={fetchSync}
            >
              <RefreshCw size={14} />
              Refresh Sync
            </button>
          </div>

          {!data ? (
            <div className="surface-card">Loading Kova ecosystem state...</div>
          ) : (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {/* Notifications */}
              <section className="surface-card">
                <h2
                  className="display display--sm"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <Bell size={20} color="var(--brand)" />
                  Vendor Payment Notifications ({data.notifications.length})
                </h2>

                {data.notifications.length === 0 ? (
                  <p style={{ color: "var(--muted)", margin: 0 }}>
                    No payment notifications yet. Complete a purchase on any
                    storefront to trigger an instant vendor notification.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: "0.75rem" }}>
                    {data.notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: "0.9rem 1rem",
                          borderRadius: 12,
                          background: "var(--brand-soft)",
                          border: "1px solid var(--line)",
                          display: "flex",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                        }}
                      >
                        <div>
                          <strong style={{ color: "var(--forest)" }}>
                            {n.title}
                          </strong>{" "}
                          <span>{n.message}</span>
                          <div
                            style={{
                              fontSize: "0.82rem",
                              color: "var(--ink-soft)",
                              marginTop: "0.2rem",
                            }}
                          >
                            Buyer: {n.customerName} · Order {n.orderReference} ·{" "}
                            {formatDateTime(n.createdAt)}
                          </div>
                        </div>
                        <div
                          style={{
                            fontWeight: 800,
                            color: "var(--forest)",
                          }}
                        >
                          {formatNaira(n.amountPaid)} · {n.paymentStatus}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Orders & 4.9% Commission */}
              <section className="surface-card">
                <h2
                  className="display display--sm"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <Package size={20} color="var(--brand)" />
                  Website Orders &amp; 4.9% Commission ({data.orders.length})
                </h2>

                {data.orders.length === 0 ? (
                  <p style={{ color: "var(--muted)", margin: 0 }}>
                    No website orders yet.
                  </p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.88rem",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            textAlign: "left",
                            borderBottom: "1px solid var(--line)",
                            color: "var(--muted)",
                          }}
                        >
                          <th style={{ padding: "0.6rem" }}>Order Ref</th>
                          <th style={{ padding: "0.6rem" }}>Product</th>
                          <th style={{ padding: "0.6rem" }}>Customer</th>
                          <th style={{ padding: "0.6rem" }}>Total Paid</th>
                          <th style={{ padding: "0.6rem" }}>Kova 4.9%</th>
                          <th style={{ padding: "0.6rem" }}>Vendor Balance</th>
                          <th style={{ padding: "0.6rem" }}>Status</th>
                          <th style={{ padding: "0.6rem" }}>Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.orders.map((o) => (
                          <tr
                            key={o.id}
                            style={{ borderBottom: "1px solid var(--line)" }}
                          >
                            <td style={{ padding: "0.6rem", fontWeight: 700 }}>
                              {o.orderReference}
                              <div style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                                Source: Public Website
                              </div>
                            </td>
                            <td style={{ padding: "0.6rem" }}>
                              {o.productName} (x{o.quantity})
                            </td>
                            <td style={{ padding: "0.6rem" }}>
                              {o.customer.name}
                            </td>
                            <td style={{ padding: "0.6rem", fontWeight: 700 }}>
                              {formatNaira(o.totalPaid)}
                            </td>
                            <td style={{ padding: "0.6rem" }}>
                              {formatNaira(o.kovaCommission)}
                            </td>
                            <td
                              style={{
                                padding: "0.6rem",
                                fontWeight: 800,
                                color: "var(--brand-dark)",
                              }}
                            >
                              {formatNaira(o.vendorBalance)}
                            </td>
                            <td style={{ padding: "0.6rem", fontWeight: 700 }}>
                              {o.paymentStatus.toUpperCase()}
                            </td>
                            <td style={{ padding: "0.6rem" }}>
                              {o.receiptId && o.receiptToken ? (
                                <Link
                                  href={`/receipt/${o.receiptId}?token=${o.receiptToken}`}
                                  style={{
                                    color: "var(--brand-dark)",
                                    fontWeight: 700,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 3,
                                  }}
                                >
                                  View
                                  <ArrowUpRight size={13} />
                                </Link>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Vendor Chat Inbox */}
              <section className="surface-card">
                <h2
                  className="display display--sm"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <MessageCircle size={20} color="var(--brand)" />
                  Vendor App Chat Inbox ({data.conversations.length})
                </h2>

                {data.conversations.length === 0 ? (
                  <p style={{ color: "var(--muted)", margin: 0 }}>
                    No customer chats yet. Open a storefront or product and
                    start a chat to see it appear here.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {data.conversations.map((conv) => {
                      const msgs = data.messages.filter(
                        (m) => m.conversationId === conv.id
                      );
                      return (
                        <div
                          key={conv.id}
                          style={{
                            border: "1px solid var(--line)",
                            borderRadius: 12,
                            padding: "1rem",
                            background: "var(--paper)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "0.5rem",
                              flexWrap: "wrap",
                              gap: "0.5rem",
                            }}
                          >
                            <strong>
                              {conv.customerName} ({conv.customerPhone})
                            </strong>
                            {conv.productName && (
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  background: "var(--brand-soft)",
                                  color: "var(--forest)",
                                  padding: "0.2rem 0.6rem",
                                  borderRadius: 999,
                                  fontWeight: 700,
                                }}
                              >
                                Product: {conv.productName}
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.4rem",
                              marginBottom: "0.75rem",
                              maxHeight: 180,
                              overflowY: "auto",
                            }}
                          >
                            {msgs.map((m) => (
                              <div
                                key={m.id}
                                style={{
                                  fontSize: "0.86rem",
                                  padding: "0.45rem 0.7rem",
                                  borderRadius: 8,
                                  background:
                                    m.senderType === "vendor"
                                      ? "var(--forest)"
                                      : "#fff",
                                  color:
                                    m.senderType === "vendor"
                                      ? "#fff"
                                      : "var(--ink)",
                                  alignSelf:
                                    m.senderType === "vendor"
                                      ? "flex-end"
                                      : "flex-start",
                                  border: "1px solid var(--line)",
                                }}
                              >
                                <strong>{m.senderName}:</strong> {m.text}
                              </div>
                            ))}
                          </div>

                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <input
                              className="form-input"
                              placeholder="Reply as vendor..."
                              value={replyDrafts[conv.id] || ""}
                              onChange={(e) =>
                                setReplyDrafts((prev) => ({
                                  ...prev,
                                  [conv.id]: e.target.value,
                                }))
                              }
                            />
                            <button
                              type="button"
                              className="btn btn--brand btn--sm"
                              onClick={() => handleVendorReply(conv)}
                            >
                              <Send size={14} />
                              Reply
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Verification & Inventory Sync */}
              <section className="surface-card">
                <h2
                  className="display display--sm"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <Shield size={20} color="var(--brand)" />
                  Verification &amp; Product Availability Sync
                </h2>

                <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  {data.vendors.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                        padding: "0.75rem 1rem",
                        background: "var(--paper)",
                        borderRadius: 10,
                        border: "1px solid var(--line)",
                      }}
                    >
                      <div>
                        <strong>{v.fullName}</strong> (@{v.username}) ·{" "}
                        <Link
                          href={`/store/${v.username}`}
                          style={{ color: "var(--brand-dark)", fontWeight: 700 }}
                        >
                          View Storefront
                        </Link>
                      </div>
                      <select
                        className="form-input"
                        style={{ width: "auto" }}
                        value={v.verificationStatus}
                        onChange={(e) =>
                          handleVerificationChange(
                            v.id,
                            e.target.value as VerificationStatus
                          )
                        }
                      >
                        <option value="verified">verified</option>
                        <option value="pending">pending</option>
                        <option value="unverified">unverified</option>
                        <option value="rejected">rejected</option>
                        <option value="suspended">suspended</option>
                      </select>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gap: "0.6rem" }}>
                  {data.products.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                        padding: "0.7rem 1rem",
                        background: "var(--paper)",
                        borderRadius: 10,
                        border: "1px solid var(--line)",
                      }}
                    >
                      <div>
                        <strong>{p.name}</strong> · {formatNaira(p.price)} · Qty:{" "}
                        {p.quantity} ({p.availability})
                      </div>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => handleToggleProduct(p)}
                      >
                        {p.availability === "available"
                          ? "Mark Unavailable"
                          : "Mark Available"}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      <KovaFooter />
    </>
  );
}

