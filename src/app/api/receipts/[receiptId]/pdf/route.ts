import { NextResponse } from "next/server";
import { getReceiptByIdAndToken } from "@/lib/db";
import { generateReceiptPdfBuffer } from "@/lib/pdfReceipt";

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
      { error: "Receipt unavailable or invalid link." },
      { status: 403 }
    );
  }

  const pdfBuffer = generateReceiptPdfBuffer(receipt);
  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${receipt.receiptNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}

