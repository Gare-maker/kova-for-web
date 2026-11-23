import { NextResponse } from "next/server";
import { createOrderAndReservation } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productId = String(body.productId ?? "").trim();
    const quantity = Number(body.quantity ?? 1);
    const selectedOption = body.selectedOption
      ? String(body.selectedOption).trim()
      : undefined;
    const name = String(body.customer?.name ?? "").trim();
    const phone = String(body.customer?.phone ?? "").trim();
    const email = String(body.customer?.email ?? "").trim();
    const currentLocation = String(body.customer?.currentLocation ?? "").trim();
    const deliveryAddress = String(body.customer?.deliveryAddress ?? "").trim();
    const deliveryNotes = body.customer?.deliveryNotes
      ? String(body.customer.deliveryNotes).trim()
      : undefined;

    if (!productId || !name || !phone || !email || !currentLocation || !deliveryAddress) {
      return NextResponse.json(
        {
          error:
            "Please provide your full name, phone number, email, current location, and delivery address.",
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const { error, order, reservationId } = createOrderAndReservation({
      productId,
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      selectedOption,
      customer: {
        name,
        phone,
        email,
        currentLocation,
        deliveryAddress,
        deliveryNotes,
      },
    });

    if (error || !order) {
      return NextResponse.json(
        { error: error ?? "Unable to initialize order." },
        { status: 409 }
      );
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    if (paystackSecret) {
      const psRes = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: order.customer.email,
          amount: Math.round(order.totalPaid * 100),
          reference: order.transactionReference,
          callback_url: `${origin}/checkout/${order.productId}?verify=${order.transactionReference}`,
          metadata: {
            orderId: order.id,
            orderReference: order.orderReference,
            vendorId: order.vendorId,
            productId: order.productId,
            source: "public_website",
          },
        }),
      });

      const psData = await psRes.json();
      if (!psRes.ok || !psData.status) {
        return NextResponse.json(
          { error: psData.message || "Paystack initialization failed." },
          { status: 502 }
        );
      }

      return NextResponse.json({
        mode: "paystack_live",
        authorizationUrl: psData.data.authorization_url,
        reference: order.transactionReference,
        order,
        reservationId,
      });
    }

    return NextResponse.json({
      mode: "paystack_simulator",
      reference: order.transactionReference,
      order,
      reservationId,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid payment initialization request." },
      { status: 400 }
    );
  }
}
