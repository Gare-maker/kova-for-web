import { NextResponse } from "next/server";
import { addChatMessage, readDb } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json(
      { error: "conversationId is required" },
      { status: 400 }
    );
  }
  const db = readDb();
  const messages = db.messages.filter(
    (m) => m.conversationId === conversationId
  );
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const conversationId = String(body.conversationId ?? "").trim();
    const senderType =
      body.senderType === "vendor" ? "vendor" : "customer";
    const senderName = String(body.senderName ?? "Customer").trim();
    const text = String(body.text ?? "").trim();

    if (!conversationId || !text) {
      return NextResponse.json(
        { error: "Message text cannot be empty." },
        { status: 400 }
      );
    }

    if (text.length > 1200) {
      return NextResponse.json(
        { error: "Message is too long (max 1200 characters)." },
        { status: 400 }
      );
    }

    const message = addChatMessage({
      conversationId,
      senderType,
      senderName,
      text,
    });

    if (!message) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message });
  } catch {
    return NextResponse.json(
      { error: "Unable to send message." },
      { status: 400 }
    );
  }
}
