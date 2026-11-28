import { NextResponse } from "next/server";
import { markOrderPaidAndGenerateReceipt, readDb } from "@/lib/db";
import { sendReceiptEmail } from "@/lib/emailReceipt";

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

    // Automatically email receipt PDF to the customer after verified payment
    let emailSent = Boolean(result.receipt.emailSent);
    if (!result.alreadyProcessed || !emailSent) {
      const origin =
        req.headers.get("origin") ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";
      const dispatch = await sendReceiptEmail(result.receipt, origin);
      emailSent = dispatch.sent;
    }

    return NextResponse.json({
      status: "paid",
      alreadyProcessed: result.alreadyProcessed ?? false,
      order: result.order,
      receiptId: result.receipt.id,
      receiptToken: result.receipt.accessToken,
      receiptUrl: `/receipt/${result.receipt.id}?token=${result.receipt.accessToken}`,
      pdfUrl: `/api/receipts/${result.receipt.id}/pdf?token=${result.receipt.accessToken}`,
      emailSent,
      customerEmail: result.receipt.customerEmail,
    });
  } catch {
    return NextResponse.json(
      { error: "Payment verification failed." },
      { status: 500 }
    );
  }
}
