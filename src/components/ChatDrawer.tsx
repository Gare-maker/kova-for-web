"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, Send, MessageCircle, ShieldCheck } from "lucide-react";
import type { Vendor, Product, ChatConversation, ChatMessage } from "@/lib/types";
import { formatNaira, getInitials } from "@/lib/format";

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
  vendor: Vendor;
  product?: Product | null;
}

const GUEST_SESSION_KEY = "kova_guest_session";

function getOrCreateGuestSession(): {
  sessionId: string;
  name?: string;
  phone?: string;
} {
  if (typeof window === "undefined") {
    return { sessionId: "ssr-guest" };
  }
  try {
    const raw = localStorage.getItem(GUEST_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  const fresh = {
    sessionId: `guest_${Math.random().toString(36).slice(2)}_${Date.now()}`,
  };
  localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(fresh));
  return fresh;
}

export function ChatDrawer({ open, onClose, vendor, product }: ChatDrawerProps) {
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [conversation, setConversation] = useState<ChatConversation | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const saved = getOrCreateGuestSession();
    setSessionId(saved.sessionId);
    if (saved.name) setGuestName(saved.name);
    if (saved.phone) setGuestPhone(saved.phone);

    // If guest already onboarded, auto-resume conversation
    if (saved.name && saved.phone) {
      startOrResume(saved.sessionId, saved.name, saved.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vendor.id, product?.id]);

  // Poll for vendor responses every 2.5 seconds
  useEffect(() => {
    if (!open || !conversation) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/chat/messages?conversationId=${encodeURIComponent(conversation.id)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages ?? []);
        }
      } catch {
        // silent retry
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [open, conversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function startOrResume(
    sid: string,
    name: string,
    phone: string
  ) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          productId: product?.id ?? null,
          guestSessionId: sid,
          customerName: name,
          customerPhone: phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error ||
            "This seller is currently unavailable. Please try again later."
        );
        return;
      }
      localStorage.setItem(
        GUEST_SESSION_KEY,
        JSON.stringify({ sessionId: sid, name, phone })
      );
      setConversation(data.conversation);
      setMessages(data.messages ?? []);
    } catch {
      setError("This seller is currently unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      setError("Please enter your name and phone number to start chatting.");
      return;
    }
    startOrResume(sessionId, guestName.trim(), guestPhone.trim());
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversation || !draft.trim()) return;
    const text = draft.trim();
    setDraft("");

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.id,
          senderType: "customer",
          senderName: conversation.customerName,
          text,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
      }
    } catch {
      setError("Failed to send message. Please try again.");
    }
  };

  if (!open) return null;

  return (
    <div
      className="chat-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Chat with ${vendor.fullName}`}
      onClick={onClose}
    >
      <div className="chat-panel" onClick={(e) => e.stopPropagation()}>
        <div className="chat-panel__header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                overflow: "hidden",
                background: "var(--forest-soft)",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
              }}
            >
              {vendor.avatarUrl ? (
                <img
                  src={vendor.avatarUrl}
                  alt={vendor.fullName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                getInitials(vendor.fullName)
              )}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                {vendor.fullName}
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                @{vendor.username} · Synced with Kova App
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {product && (
          <div className="chat-panel__product-bar">
            <img
              src={product.images[0] || "/products/desk.svg"}
              alt={product.name}
              style={{
                width: 38,
                height: 38,
                borderRadius: 6,
                objectFit: "cover",
                background: "#fff",
              }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontWeight: 700,
                  color: "var(--ink-strong)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {product.name}
              </div>
              <div style={{ color: "var(--brand-dark)", fontWeight: 800 }}>
                {formatNaira(product.price)}
              </div>
            </div>
          </div>
        )}

        {!conversation ? (
          <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                background: "var(--brand-soft)",
                color: "var(--forest)",
                padding: "0.35rem 0.7rem",
                borderRadius: 999,
                fontSize: "0.75rem",
                fontWeight: 700,
                marginBottom: "0.85rem",
              }}
            >
              <MessageCircle size={14} />
              No app download required
            </div>
            <h3 className="display display--sm" style={{ marginBottom: "0.4rem" }}>
              Message {vendor.fullName}
            </h3>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: 0 }}>
              Enter your name and phone number so the vendor can reply directly
              from their Kova app.
            </p>

            {error && (
              <div
                style={{
                  background: "var(--danger-soft)",
                  color: "var(--danger)",
                  padding: "0.7rem 0.9rem",
                  borderRadius: 8,
                  fontSize: "0.85rem",
                  marginBottom: "1rem",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleOnboardSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="chat-guest-name">
                  Your Name
                </label>
                <input
                  id="chat-guest-name"
                  className="form-input"
                  placeholder="e.g. Tunde Adebayo"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="chat-guest-phone">
                  Phone Number
                </label>
                <input
                  id="chat-guest-phone"
                  className="form-input"
                  placeholder="e.g. 0803 123 4567"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn--brand"
                style={{ width: "100%" }}
                disabled={loading}
              >
                {loading ? "Starting chat..." : "Start Chat"}
              </button>
            </form>

            <p
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.76rem",
                color: "var(--muted)",
                marginTop: "1rem",
              }}
            >
              <ShieldCheck size={14} color="var(--brand)" />
              Your session is protected and synced with Kova.
            </p>
          </div>
        ) : (
          <>
            <div className="chat-panel__messages">
              {messages.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: "0.88rem",
                    marginTop: "2rem",
                  }}
                >
                  Say hello to {vendor.fullName}! Your message will appear in
                  their Kova app immediately.
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`chat-bubble ${
                      m.senderType === "customer"
                        ? "chat-bubble--customer"
                        : "chat-bubble--vendor"
                    }`}
                  >
                    <div>{m.text}</div>
                    <span className="chat-bubble__time">
                      {m.senderName} ·{" "}
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <form className="chat-panel__composer" onSubmit={handleSend}>
              <input
                type="text"
                className="form-input"
                placeholder="Type a message..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className="btn btn--brand btn--sm"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
