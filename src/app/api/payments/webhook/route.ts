import { NextResponse } from "next/server";
import crypto from "crypto";
import { markOrderPaidAndGenerateReceipt } from "@/lib/db";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

  if (paystackSecret) {
    const signature = req.headers.get("x-paystack-signature") || "";
    const expected = crypto
      .createHmac("sha512", paystackSecret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expected) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  try {
    const event = JSON.parse(rawBody);
    if (event.event === "charge.success" && event.data?.reference) {
      markOrderPaidAndGenerateReceipt(
        String(event.data.reference),
        `Paystack (${event.data.channel || "card"})`
      );
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}
