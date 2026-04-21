import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";

// Gumroad Ping webhook , fires on every sale.
//
// Configure in Gumroad Advanced settings:
//   URL: https://www.sidehustlecommandcentre.com/api/gumroad/webhook?key=SECRET
//
// Gumroad POSTs form-urlencoded data with fields:
//   sale_id, product_id, product_name, permalink, email, full_name,
//   price, currency, test, etc.
//
// We verify authenticity via the `key` query param (Gumroad doesn't
// sign pings, so a secret in the URL is the standard approach).
//
// On verified sale, we send the buyer a welcome email with a magic
// link to our /thank-you?sale_id=xxx page where they fill the intake
// form and get their command centre.

export async function POST(req: NextRequest) {
  // 1. Verify the shared secret
  const url = new URL(req.url);
  const providedKey = url.searchParams.get("key");
  const expectedKey = process.env.GUMROAD_PING_SECRET;

  if (!expectedKey) {
    console.error("GUMROAD WEBHOOK: GUMROAD_PING_SECRET env missing");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  if (providedKey !== expectedKey) {
    console.warn("GUMROAD WEBHOOK: invalid key", providedKey?.slice(0, 8));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse form-urlencoded body
  const contentType = req.headers.get("content-type") ?? "";
  let data: Record<string, string> = {};

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    params.forEach((value, key) => {
      data[key] = value;
    });
  } else if (contentType.includes("application/json")) {
    data = await req.json();
  } else {
    console.error("GUMROAD WEBHOOK: unknown content-type", contentType);
    return NextResponse.json({ error: "Bad content type" }, { status: 400 });
  }

  const saleId = data.sale_id;
  const email = data.email;
  const fullName = data.full_name ?? "";
  const productName = data.product_name ?? "";
  const isTest = data.test === "true";

  if (!saleId || !email) {
    console.error("GUMROAD WEBHOOK: missing sale_id or email", { saleId, email });
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  console.log(
    "GUMROAD WEBHOOK: received sale",
    saleId,
    "for",
    email,
    isTest ? "(TEST)" : ""
  );

  // 3. Send magic-link email via Resend
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.sidehustlecommandcentre.com";
  const intakeUrl = `${appUrl}/thank-you?sale_id=${encodeURIComponent(saleId)}`;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ??
    "Carley (Side Hustle Command Centre) <hello@thesteadysystem.com>";

  const firstName = fullName.split(" ")[0] || "";
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";

  const text = `${greeting}

Thanks for your order of ${productName || "Side Hustle Command Centre"}!

One more step to build your personalized command centre. Answer 13 quick questions about your business:

${intakeUrl}

It takes about 3 minutes. The AI will build your launch runway, 30-day content plan, and everything else based on your answers.

If this email landed in Promotions or Spam, drag it to Primary so you can find it later.

Any questions? Reply to this email and I'll answer personally.

Carley
The Steady System`;

  const safeName = firstName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `<p>${safeName ? `Hi ${safeName},` : "Hi,"}</p>
<p>Thanks for your order of ${productName.replace(/</g, "&lt;")}!</p>
<p>One more step to build your personalized command centre. Answer 13 quick questions about your business:</p>
<p><a href="${intakeUrl}">${intakeUrl}</a></p>
<p>It takes about 3 minutes. The AI will build your launch runway, 30-day content plan, and everything else based on your answers.</p>
<p>If this email landed in Promotions or Spam, drag it to Primary so you can find it later.</p>
<p>Any questions? Reply to this email and I'll answer personally.</p>
<p>Carley<br>The Steady System</p>`;

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      reply_to: "hello@thesteadysystem.com",
      subject: isTest
        ? `[TEST] Next step for your ${productName || "command centre"}`
        : `Next step for your ${productName || "command centre"}`,
      text,
      html,
    });
    console.log("GUMROAD WEBHOOK: email queued", result);
  } catch (err) {
    console.error("GUMROAD WEBHOOK: email send failed", err);
    // Return 200 anyway , Gumroad will retry failed webhooks and we
    // don't want a duplicate email if our Resend hiccupped.
  }

  return NextResponse.json({ received: true });
}
