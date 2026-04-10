import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const accessToken = session.metadata?.workspace_access_token;

    if (!accessToken) {
      return NextResponse.json({ error: "No token in metadata" }, { status: 400 });
    }

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id, ai_messages_remaining")
      .eq("access_token", accessToken)
      .single();

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Add 50 messages
    await supabase
      .from("workspaces")
      .update({
        ai_messages_remaining: (workspace.ai_messages_remaining ?? 0) + 50,
      })
      .eq("id", workspace.id);

    // Log purchase
    await supabase.from("message_pack_purchases").insert({
      workspace_id: workspace.id,
      stripe_payment_id: session.payment_intent as string,
      messages_added: 50,
      amount_cents: 500,
    });
  }

  return NextResponse.json({ received: true });
}
