import { NextResponse } from "next/server";
import { getOrCreateConversation, readDb } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const guestSessionId = searchParams.get("guestSessionId");
  const vendorId = searchParams.get("vendorId");

  const db = readDb();
  let conversations = db.conversations;
  if (guestSessionId) {
    conversations = conversations.filter(
      (c) => c.guestSessionId === guestSessionId
    );
  }
  if (vendorId) {
    conversations = conversations.filter((c) => c.vendorId === vendorId);
  }

  return NextResponse.json({ conversations });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const vendorId = String(body.vendorId ?? "").trim();
    const productId = body.productId ? String(body.productId).trim() : null;
    const guestSessionId = String(body.guestSessionId ?? "").trim();
    const customerName = String(body.customerName ?? "").trim();
    const customerPhone = String(body.customerPhone ?? "").trim();
    const kovaUserId = body.kovaUserId ? String(body.kovaUserId).trim() : null;

    if (!vendorId || !guestSessionId || !customerName || !customerPhone) {
      return NextResponse.json(
        { error: "Please provide your name and phone number to start chatting." },
        { status: 400 }
      );
    }

    const db = readDb();
    const vendor = db.vendors.find((v) => v.id === vendorId && v.eligible);
    if (!vendor || vendor.verificationStatus === "suspended") {
      return NextResponse.json(
        { error: "This seller is currently unavailable. Please try again later." },
        { status: 404 }
      );
    }

    const conversation = getOrCreateConversation({
      vendorId,
      productId,
      guestSessionId,
      customerName,
      customerPhone,
      kovaUserId,
    });

    const messages = db.messages.filter(
      (m) => m.conversationId === conversation.id
    );

    return NextResponse.json({ conversation, messages });
  } catch {
    return NextResponse.json(
      { error: "Unable to start conversation." },
      { status: 400 }
    );
  }
}
