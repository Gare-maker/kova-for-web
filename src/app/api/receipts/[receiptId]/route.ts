import { NextResponse } from "next/server";
import { getReceiptByIdAndToken } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/session";

export async function GET(
  req: Request,
  context: { params: Promise<{ receiptId: string }> }
) {
  const { receiptId } = await context.params;
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const sessionUserId = await getAuthenticatedUserId();

  const receipt = getReceiptByIdAndToken(receiptId, token, sessionUserId);
  if (!receipt) {
    return NextResponse.json(
      { error: "We couldn't retrieve your receipt. Please try again." },
      { status: 403 }
    );
  }

  return NextResponse.json({ receipt });
}
