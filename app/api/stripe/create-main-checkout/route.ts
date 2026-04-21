import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

// Creates a Stripe Checkout session for the main $67 purchase.
// Called from the landing page CTAs.
//
// Success → /thank-you?session_id={CHECKOUT_SESSION_ID}
//   (which then shows the Tally intake form with the session_id
//    pre-filled so we can verify payment on webhook)
export async function POST() {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.sidehustlecommandcentre.com";
  const priceId = process.env.STRIPE_MAIN_PRICE_ID;

  if (!priceId) {
    return NextResponse.json(
      { error: "STRIPE_MAIN_PRICE_ID not configured" },
      { status: 500 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    // Capture email on Stripe so we can pre-fill the intake form
    billing_address_collection: "auto",
    allow_promotion_codes: true,
    metadata: {
      purchase_type: "main",
    },
    success_url: `${appUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
