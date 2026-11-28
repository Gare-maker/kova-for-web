import { jsPDF } from "jspdf";
import type { Receipt } from "./types";
import { formatDateTime } from "./format";

export function buildReceiptPdf(receipt: Receipt): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 44;
  const colRightX = pageW / 2 + 12;
  const colWidth = pageW / 2 - margin - 20;

  // Header band in Kova Forest Green
  doc.setFillColor(12, 67, 23);
  doc.rect(0, 0, pageW, 96, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(receipt.vendorName || "KOVA", margin, 44);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(150, 237, 196);
  doc.text("Official Payment Receipt · Powered by Kova", margin, 64);

  // Paid Badge
  doc.setFillColor(44, 155, 67);
  doc.roundedRect(pageW - 124, 32, 80, 28, 6, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("PAID", pageW - 98, 50);

  // Receipt Metadata
  let y = 132;
  doc.setTextColor(24, 24, 32);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Receipt Number: ${receipt.receiptNumber}`, margin, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110, 105, 129);
  doc.text(`Date: ${formatDateTime(receipt.paidAt)}`, pageW - margin, y, {
    align: "right",
  });

  y += 20;
  doc.text(`Transaction Ref: ${receipt.transactionReference}`, margin, y);
  doc.text(`Order Ref: ${receipt.orderReference}`, pageW - margin, y, {
    align: "right",
  });

  // Divider
  y += 18;
  doc.setDrawColor(225, 228, 232);
  doc.line(margin, y, pageW - margin, y);

  // Customer & Business columns
  y += 26;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(110, 105, 129);
  doc.text("CUSTOMER DETAILS", margin, y);
  doc.text("BUSINESS INFORMATION", colRightX, y);

  let leftY = y + 18;
  let rightY = y + 18;

  // Left column: Customer
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(18, 18, 31);
  doc.text(receipt.customerName, margin, leftY);
  leftY += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(61, 58, 77);
  doc.text(receipt.customerEmail, margin, leftY);
  leftY += 15;
  doc.text(receipt.customerPhone, margin, leftY);
  leftY += 15;

  if (receipt.currentLocation) {
    const locLines = doc.splitTextToSize(
      `Location: ${receipt.currentLocation}`,
      colWidth
    ) as string[];
    doc.text(locLines, margin, leftY);
    leftY += locLines.length * 14 + 2;
  }
  if (
    receipt.deliveryAddress &&
    receipt.deliveryAddress !== receipt.currentLocation
  ) {
    const addrLines = doc.splitTextToSize(
      `Address: ${receipt.deliveryAddress}`,
      colWidth
    ) as string[];
    doc.text(addrLines, margin, leftY);
    leftY += addrLines.length * 14 + 2;
  }
  if (receipt.deliveryNotes) {
    const noteLines = doc.splitTextToSize(
      `Notes: ${receipt.deliveryNotes}`,
      colWidth
    ) as string[];
    doc.text(noteLines, margin, leftY);
    leftY += noteLines.length * 14 + 2;
  }

  // Right column: Business
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(18, 18, 31);
  doc.text(receipt.vendorName, colRightX, rightY);
  rightY += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(61, 58, 77);
  doc.text(`@${receipt.vendorUsername}`, colRightX, rightY);
  rightY += 15;

  if (receipt.vendorCategory) {
    doc.text(receipt.vendorCategory, colRightX, rightY);
    rightY += 15;
  }
  if (receipt.vendorLocation) {
    const vLocLines = doc.splitTextToSize(
      receipt.vendorLocation,
      colWidth
    ) as string[];
    doc.text(vLocLines, colRightX, rightY);
    rightY += vLocLines.length * 14 + 2;
  } else {
    doc.text("Verified Kova Business", colRightX, rightY);
    rightY += 15;
  }

  // Itemization Table
  y = Math.max(leftY, rightY) + 22;
  doc.setFillColor(247, 248, 249);
  doc.rect(margin, y, pageW - margin * 2, 28, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(18, 18, 31);
  doc.text("ITEM / SERVICE", margin + 10, y + 18);
  doc.text("QTY", pageW - 190, y + 18);
  doc.text("AMOUNT", pageW - margin - 10, y + 18, { align: "right" });

  y += 46;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  const itemLabel =
    receipt.paymentLabel && receipt.paymentLabel !== "Product Payment"
      ? `${receipt.productName} — ${receipt.paymentLabel}`
      : receipt.productName;
  const itemLines = doc.splitTextToSize(itemLabel, pageW - 280) as string[];
  doc.text(itemLines, margin + 10, y);

  doc.setFont("helvetica", "normal");
  doc.text(String(receipt.quantity), pageW - 185, y);
  doc.text(
    `NGN ${(receipt.unitPrice * receipt.quantity).toLocaleString("en-NG")}`,
    pageW - margin - 10,
    y,
    { align: "right" }
  );

  y += Math.max(18, itemLines.length * 15);
  doc.setFontSize(9);
  doc.setTextColor(110, 105, 129);
  doc.text(
    `Unit Price: NGN ${receipt.unitPrice.toLocaleString("en-NG")} · Ref ID: ${receipt.productId}`,
    margin + 10,
    y
  );

  // Totals
  y += 26;
  doc.setDrawColor(225, 228, 232);
  doc.line(margin, y, pageW - margin, y);

  y += 22;
  doc.setFontSize(10);
  doc.setTextColor(61, 58, 77);
  doc.text("Payment Method", margin + 10, y);
  doc.text(receipt.paymentMethod, pageW - margin - 10, y, { align: "right" });

  y += 18;
  doc.text("Payment Status", margin + 10, y);
  doc.setTextColor(44, 155, 67);
  doc.setFont("helvetica", "bold");
  doc.text("Paid (Verified via Paystack)", pageW - margin - 10, y, {
    align: "right",
  });

  y += 26;
  doc.setFillColor(232, 255, 232);
  doc.roundedRect(margin, y, pageW - margin * 2, 42, 8, 8, "F");
  doc.setTextColor(12, 67, 23);
  doc.setFontSize(13);
  doc.text("Total Amount Paid", margin + 14, y + 26);
  doc.text(
    `NGN ${receipt.totalPaid.toLocaleString("en-NG")}`,
    pageW - margin - 14,
    y + 26,
    { align: "right" }
  );

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 105, 129);
  doc.text(
    "Thank you for your payment. Keep this official receipt for your records.",
    pageW / 2,
    780,
    { align: "center" }
  );
  doc.text("Powered by Kova · admin@kovadml.com · https://www.kovadml.com", pageW / 2, 795, {
    align: "center",
  });

  return doc;
}

export function downloadReceiptPdf(receipt: Receipt): void {
  const doc = buildReceiptPdf(receipt);
  doc.save(`${receipt.receiptNumber}.pdf`);
}

export function generateReceiptPdfBuffer(receipt: Receipt): Buffer {
  const doc = buildReceiptPdf(receipt);
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
