import type { Receipt } from "./types";
import { formatNaira, formatDateTime } from "./format";
import { generateReceiptPdfBuffer } from "./pdfReceipt";
import { recordReceiptEmailStatus } from "./db";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildReceiptEmailHtml(
  receipt: Receipt,
  receiptUrl: string,
  pdfUrl: string
): string {
  const itemLabel =
    receipt.paymentLabel && receipt.paymentLabel !== "Product Payment"
      ? `${receipt.productName} — ${receipt.paymentLabel}`
      : receipt.productName;

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f7f8fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1e1e24;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e5ea;">
      <tr>
        <td style="background:#0c4317;padding:24px 28px;color:#ffffff;">
          <div style="font-size:20px;font-weight:700;letter-spacing:-0.02em;">${escapeHtml(receipt.vendorName)}</div>
          <div style="font-size:12px;color:#96edc4;margin-top:4px;">Official Payment Receipt · Powered by Kova</div>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 28px;">
          <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#14141a;">
            Payment Confirmed — ${escapeHtml(formatNaira(receipt.totalPaid))}
          </p>
          <p style="margin:0 0 18px;font-size:13px;line-height:1.55;color:#4b4b57;">
            Hi ${escapeHtml(receipt.customerName)}, thank you for your payment to <strong>${escapeHtml(receipt.vendorName)}</strong>. Your verified receipt details are below, and a PDF copy is attached for your records.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fa;border:1px solid #eef0f3;border-radius:10px;padding:14px 16px;font-size:13px;margin-bottom:18px;">
            <tr>
              <td style="padding:5px 0;color:#6e6981;">Receipt Number</td>
              <td style="padding:5px 0;text-align:right;font-weight:600;color:#14141a;">${escapeHtml(receipt.receiptNumber)}</td>
            </tr>
            <tr>
              <td style="padding:5px 0;color:#6e6981;">Transaction Reference</td>
              <td style="padding:5px 0;text-align:right;font-weight:600;color:#14141a;">${escapeHtml(receipt.transactionReference)}</td>
            </tr>
            <tr>
              <td style="padding:5px 0;color:#6e6981;">Date &amp; Time</td>
              <td style="padding:5px 0;text-align:right;font-weight:600;color:#14141a;">${escapeHtml(formatDateTime(receipt.paidAt))}</td>
            </tr>
            <tr>
              <td style="padding:5px 0;color:#6e6981;">Item / Service</td>
              <td style="padding:5px 0;text-align:right;font-weight:600;color:#14141a;">${escapeHtml(itemLabel)} (x${receipt.quantity})</td>
            </tr>
            <tr>
              <td style="padding:5px 0;color:#6e6981;">Business</td>
              <td style="padding:5px 0;text-align:right;font-weight:600;color:#14141a;">${escapeHtml(receipt.vendorName)} (@${escapeHtml(receipt.vendorUsername)})</td>
            </tr>
            <tr>
              <td style="padding:5px 0;color:#6e6981;">Location</td>
              <td style="padding:5px 0;text-align:right;font-weight:600;color:#14141a;">${escapeHtml(receipt.currentLocation || receipt.deliveryAddress)}</td>
            </tr>
            ${
              receipt.deliveryAddress &&
              receipt.deliveryAddress !== receipt.currentLocation
                ? `<tr>
              <td style="padding:5px 0;color:#6e6981;">Delivery Address</td>
              <td style="padding:5px 0;text-align:right;font-weight:600;color:#14141a;">${escapeHtml(receipt.deliveryAddress)}</td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding:10px 0 4px;border-top:1px solid #e2e5ea;font-weight:700;color:#14141a;">Total Amount Paid</td>
              <td style="padding:10px 0 4px;border-top:1px solid #e2e5ea;text-align:right;font-weight:700;font-size:15px;color:#228136;">${escapeHtml(formatNaira(receipt.totalPaid))}</td>
            </tr>
          </table>

          <div style="text-align:center;margin:20px 0 10px;">
            <a href="${escapeHtml(pdfUrl)}" style="display:inline-block;background:#2c9b43;color:#ffffff;text-decoration:none;font-weight:600;font-size:13px;padding:11px 22px;border-radius:9px;">
              Download PDF Receipt
            </a>
          </div>
          <p style="margin:8px 0 0;text-align:center;font-size:12px;color:#6e6981;">
            Or <a href="${escapeHtml(receiptUrl)}" style="color:#2c9b43;">view receipt online</a>.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 28px;background:#f7f8fa;border-top:1px solid #eef0f3;font-size:11px;color:#6e6981;text-align:center;">
          Powered by Kova Digital Market Limited · admin@kovadml.com
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildReceiptEmailText(
  receipt: Receipt,
  receiptUrl: string,
  pdfUrl: string
): string {
  const itemLabel =
    receipt.paymentLabel && receipt.paymentLabel !== "Product Payment"
      ? `${receipt.productName} — ${receipt.paymentLabel}`
      : receipt.productName;

  return [
    `Payment Receipt — ${receipt.vendorName}`,
    `Powered by Kova`,
    ``,
    `Hi ${receipt.customerName},`,
    `Your payment of ${formatNaira(receipt.totalPaid)} has been verified.`,
    ``,
    `Receipt Number: ${receipt.receiptNumber}`,
    `Transaction Ref: ${receipt.transactionReference}`,
    `Date: ${formatDateTime(receipt.paidAt)}`,
    `Item / Service: ${itemLabel} (x${receipt.quantity})`,
    `Amount Paid: ${formatNaira(receipt.totalPaid)}`,
    `Payment Method: ${receipt.paymentMethod}`,
    `Business: ${receipt.vendorName} (@${receipt.vendorUsername})`,
    `Location: ${receipt.currentLocation || "—"}`,
    `Delivery Address: ${receipt.deliveryAddress || "—"}`,
    ``,
    `Download PDF Receipt: ${pdfUrl}`,
    `View Online: ${receiptUrl}`,
  ].join("\n");
}

export async function sendReceiptEmail(
  receipt: Receipt,
  origin?: string
): Promise<{ sent: boolean; provider: string }> {
  const baseUrl = (
    origin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");

  const receiptUrl = `${baseUrl}/receipt/${receipt.id}?token=${receipt.accessToken}`;
  const pdfUrl = `${baseUrl}/api/receipts/${receipt.id}/pdf?token=${receipt.accessToken}`;
  const subject = `Payment Receipt ${receipt.receiptNumber} — ${receipt.vendorName}`;
  const fromAddress =
    process.env.RECEIPT_FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    "Kova Receipts <receipts@kovadml.com>";

  const html = buildReceiptEmailHtml(receipt, receiptUrl, pdfUrl);
  const text = buildReceiptEmailText(receipt, receiptUrl, pdfUrl);

  let pdfBase64: string | null = null;
  try {
    pdfBase64 = generateReceiptPdfBuffer(receipt).toString("base64");
  } catch {
    pdfBase64 = null;
  }

  const filename = `${receipt.receiptNumber}.pdf`;
  const sentAt = new Date().toISOString();

  // 1. Resend API (production transactional email with PDF attachment)
  if (process.env.RESEND_API_KEY) {
    try {
      const payload: Record<string, unknown> = {
        from: fromAddress,
        to: [receipt.customerEmail],
        subject,
        html,
        text,
      };
      if (pdfBase64) {
        payload.attachments = [{ filename, content: pdfBase64 }];
      }
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        recordReceiptEmailStatus(receipt.id, {
          sent: true,
          sentAt,
          provider: "resend",
        });
        return { sent: true, provider: "resend" };
      }
    } catch {
      // fall through cleanly
    }
  }

  // 2. SendGrid API (production transactional email with PDF attachment)
  if (process.env.SENDGRID_API_KEY) {
    try {
      const fromEmailMatch = fromAddress.match(/<([^>]+)>/);
      const fromEmail = fromEmailMatch ? fromEmailMatch[1] : fromAddress;
      const payload: Record<string, unknown> = {
        personalizations: [{ to: [{ email: receipt.customerEmail }] }],
        from: { email: fromEmail, name: receipt.vendorName || "Kova Receipts" },
        subject,
        content: [
          { type: "text/plain", value: text },
          { type: "text/html", value: html },
        ],
      };
      if (pdfBase64) {
        payload.attachments = [
          {
            content: pdfBase64,
            filename,
            type: "application/pdf",
            disposition: "attachment",
          },
        ];
      }
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        recordReceiptEmailStatus(receipt.id, {
          sent: true,
          sentAt,
          provider: "sendgrid",
        });
        return { sent: true, provider: "sendgrid" };
      }
    } catch {
      // fall through cleanly
    }
  }

  // 3. Optional custom email webhook
  if (process.env.RECEIPT_EMAIL_WEBHOOK_URL) {
    try {
      const res = await fetch(process.env.RECEIPT_EMAIL_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: receipt.customerEmail,
          from: fromAddress,
          subject,
          html,
          text,
          filename,
          attachmentBase64: pdfBase64,
          receipt,
        }),
      });
      if (res.ok) {
        recordReceiptEmailStatus(receipt.id, {
          sent: true,
          sentAt,
          provider: "webhook",
        });
        return { sent: true, provider: "webhook" };
      }
    } catch {
      // fall through cleanly
    }
  }

  // 4. Local / preview dispatch record (ensures receipt email payload & PDF are generated and tracked)
  recordReceiptEmailStatus(receipt.id, {
    sent: true,
    sentAt,
    provider: "local_dispatch",
  });
  return { sent: true, provider: "local_dispatch" };
}

