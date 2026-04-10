import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { access_token } = body;

  if (!access_token) {
    return NextResponse.json({ error: "access_token required" }, { status: 400 });
  }

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("id, slug, stripe_customer_id, buyer_email, buyer_name")
    .eq("access_token", access_token)
    .single();

  if (error || !workspace) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.sidehustlecommandcentre.com";
  const workspaceUrl = `${appUrl}/${workspace.slug}?t=${access_token}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: workspace.buyer_email,
    line_items: [
      {
        price: process.env.STRIPE_MESSAGE_PACK_PRICE_ID!,
        quantity: 1,
      },
    ],
    metadata: {
      workspace_access_token: access_token,
      workspace_id: workspace.id,
    },
    success_url: `${workspaceUrl}&refilled=true`,
    cancel_url: workspaceUrl,
  });

  return NextResponse.json({ url: session.url });
}
