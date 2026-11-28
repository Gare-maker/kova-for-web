import { NextResponse } from "next/server";
import { getReceiptByIdAndToken } from "@/lib/db";

export async function GET(
  req: Request,
  context: { params: Promise<{ receiptId: string }> }
) {
  const { receiptId } = await context.params;
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const receipt = getReceiptByIdAndToken(receiptId, token);
  if (!receipt) {
    return NextResponse.json(
      { error: "We couldn't retrieve your receipt. Please try again." },
      { status: 403 }
    );
  }

  return NextResponse.json({ receipt });
}
