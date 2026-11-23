import { NextResponse } from "next/server";
import { markOrderPaidAndGenerateReceipt, readDb } from "@/lib/db";
import { ACCOUNT_COOKIE_NAME, signUserId } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reference = String(body.reference ?? "").trim();
    const paymentMethod = String(
      body.paymentMethod ?? "Paystack (Card / Bank Transfer)"
    ).trim();

    if (!reference) {
      return NextResponse.json(
        { error: "Missing transaction reference." },
        { status: 400 }
      );
    }

    const db = readDb();
    const existingOrder = db.orders.find(
      (o) => o.transactionReference === reference
    );
    if (!existingOrder) {
      return NextResponse.json(
        { error: "Transaction reference not found." },
        { status: 404 }
      );
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (paystackSecret) {
      const verifyRes = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecret}`,
          },
          cache: "no-store",
        }
      );
      const verifyData = await verifyRes.json();
      if (
        !verifyRes.ok ||
        !verifyData.status ||
        verifyData.data?.status !== "success" ||
        Number(verifyData.data?.amount) < Math.round(existingOrder.totalPaid * 100)
      ) {
        return NextResponse.json(
          {
            status: "failed",
            error: "Your payment could not be completed. Please try again.",
          },
          { status: 402 }
        );
      }
    }

    const result = markOrderPaidAndGenerateReceipt(reference, paymentMethod);
    if (result.error || !result.order || !result.receipt) {
      return NextResponse.json(
        { error: result.error ?? "Unable to verify payment." },
        { status: 400 }
      );
    }

    const res = NextResponse.json({
      status: "paid",
      alreadyProcessed: result.alreadyProcessed ?? false,
      order: result.order,
      receiptId: result.receipt.id,
      receiptToken: result.receipt.accessToken,
      receiptUrl: `/receipt/${result.receipt.id}?token=${result.receipt.accessToken}`,
    });

    // Permanently associate this receipt with the customer's signed account session
    res.cookies.set(ACCOUNT_COOKIE_NAME, signUserId(result.order.userId), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch {
    return NextResponse.json(
      { error: "Payment verification failed." },
      { status: 500 }
    );
  }
}
