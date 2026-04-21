import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { anthropic, AI_COACH_MODEL } from "@/lib/claude";
import { resend } from "@/lib/resend";
import { stripe } from "@/lib/stripe";
import { verifyGumroadSale } from "@/lib/gumroad";
import { generateSlug, generateToken, resolveColor } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Tally field extractor
// Tally payload: { data: { fields: [{ key, label, value, options? }] } }
//
// Dropdowns and multi-selects send:
//   value: string[]  , array of selected option IDs
//   options: { id: string; text: string }[]  , all available options
//
// Plain text/number/date/email fields send value as a scalar.
// ---------------------------------------------------------------------------
interface TallyField {
  label: string;
  value: unknown;
  options?: { id: string; text: string }[];
}

function resolveOptions(f: TallyField): string[] {
  if (!f.options?.length) return [];
  const selected = Array.isArray(f.value) ? (f.value as string[]) : [String(f.value)];
  return selected
    .map((id) => f.options!.find((o) => o.id === id)?.text ?? "")
    .filter(Boolean);
}

function extract(fields: TallyField[], ...keywords: string[]): string {
  const f = fields.find((f) =>
    keywords.some((kw) => f.label?.toLowerCase().includes(kw.toLowerCase()))
  );
  if (!f || f.value === null || f.value === undefined) return "";
  // Dropdown / single-select , resolve option text
  if (f.options?.length) return resolveOptions(f)[0] ?? "";
  if (Array.isArray(f.value)) return f.value.join(", ");
  return String(f.value);
}

function extractArray(fields: TallyField[], ...keywords: string[]): string[] {
  const f = fields.find((f) =>
    keywords.some((kw) => f.label?.toLowerCase().includes(kw.toLowerCase()))
  );
  if (!f || !f.value) return [];
  // Multi-select , resolve all selected option texts
  if (f.options?.length) return resolveOptions(f);
  if (Array.isArray(f.value)) return f.value.map(String);
  return [String(f.value)];
}

function extractNumber(fields: TallyField[], ...keywords: string[]): number | null {
  const raw = extract(fields, ...keywords);
  const n = parseFloat(raw.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? null : n;
}

// ---------------------------------------------------------------------------
// Claude content generation prompt
// ---------------------------------------------------------------------------
function buildPrompt(intake: Record<string, unknown>): string {
  return `You are generating personalized business launch content. Output ONLY valid JSON , no markdown, no preamble, no explanation.

The business:
- Name: ${intake.business_name}
- Type: ${intake.business_type}
- Tagline: ${intake.tagline}
- Platforms: ${(intake.platforms as string[]).join(", ")}
- Revenue model: ${intake.revenue_model}
- Target audience: ${intake.target_audience}
- Launch date: ${intake.launch_date}
- Monthly goal: $${intake.monthly_revenue_goal}
- Startup budget: $${intake.startup_budget}
- Experience level: ${intake.experience_level}

Generate a JSON object with these exact keys:

1. "runway" , array of exactly 4 phase objects:
   Each: { "name": string, "items": string[] (3-5 items) }
   Phases must be named: Foundation, Build, Pre-Launch, Launch Week
   Tasks must be SPECIFIC to this business type, not generic advice.

2. "content_prompts" , array of exactly 30 objects:
   Each: { "day": number, "prompt": string, "platform": string, "type": "Reel"|"Story"|"Carousel"|"Photo"|"Video"|"Post" }
   Prompts must reference the business name, specific products/services, and target audience.
   Distribute evenly across the buyer's selected platforms.

3. "offer_card" , object:
   { "headline": string, "tagline": string, "what": string, "platforms": string }

4. "pricing_guide" , array of exactly 3 objects:
   Each: { "tier": "Entry"|"Core"|"Premium", "range": string, "description": string }
   Price ranges must be realistic for this specific business type.

5. "startup_costs" , array of 5-7 objects:
   Each: { "name": string, "amount": number }
   Categories must be specific to this business type.
   Amounts should sum to approximately $${intake.startup_budget ?? 500}.`;
}

// ---------------------------------------------------------------------------
// Welcome email HTML
// ---------------------------------------------------------------------------
// Plain-text email (better deliverability , skips Gmail Promotions tab).
// Rules: short, conversational, no marketing language, plain text link,
// no images, no big buttons, no emojis, no hyped CTA.
function buildEmailText(intake: Record<string, unknown>, workspaceUrl: string): string {
  return `Hi ${intake.buyer_name},

Your command centre for ${intake.business_name} is ready. Here's your private link:

${workspaceUrl}

Bookmark it. That's where everything lives (your runway, content calendar, AI coach).

When you open it the first time, tap "Generate My Runway" on the Launch Runway tab to build your personalized plan. It takes about 30 seconds. Then the AI coach (50 included messages) will know your business and can guide you from there.

If the email landed in your Promotions or Spam folder, drag it to Primary so you can find it later.

Reply to this email any time. I read every one.

Carley
The Steady System`;
}

function buildEmailHtml(intake: Record<string, unknown>, workspaceUrl: string): string {
  // Minimal HTML mirroring the plain text , no styles, no layout, no tracking pixels.
  // Keeps the email lightweight and deliverability-friendly.
  const safeBusiness = String(intake.business_name ?? "your business")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const safeName = String(intake.buyer_name ?? "")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<p>Hi ${safeName},</p>
<p>Your command centre for ${safeBusiness} is ready. Here's your private link:</p>
<p><a href="${workspaceUrl}">${workspaceUrl}</a></p>
<p>Bookmark it. That's where everything lives (your runway, content calendar, AI coach).</p>
<p>When you open it the first time, tap "Generate My Runway" on the Launch Runway tab to build your personalized plan. It takes about 30 seconds. Then the AI coach (50 included messages) will know your business and can guide you from there.</p>
<p>If the email landed in your Promotions or Spam folder, drag it to Primary so you can find it later.</p>
<p>Reply to this email any time. I read every one.</p>
<p>Carley<br>The Steady System</p>`;
}

// ---------------------------------------------------------------------------
// Route handler , creates workspace instantly, NO Claude call here.
// Claude content is generated lazily when the user opens their workspace.
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    console.log("INTAKE: received request");
    const body = await req.json();

    const fields: TallyField[] =
      body?.data?.fields ?? body?.fields ?? [];

    console.log("INTAKE: parsed fields", fields.length);

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields received" }, { status: 400 });
    }

    // 0. Verify payment , accepts EITHER a Stripe session_id OR a Gumroad sale_id.
    // Exactly one must be present and verified as paid.
    const sessionId = extract(fields, "session_id");
    const gumroadSaleId = extract(fields, "gumroad_sale_id");

    if (!sessionId && !gumroadSaleId) {
      // Someone hit /api/intake without going through the paid checkout flow.
      // Most likely: a stale Tally submission, a bookmarked old link, or a
      // fraudster. Send a friendly email redirecting them to the real buy
      // page, but only if we recovered an email from the submission.
      const recoveredEmail = extract(fields, "email");
      const recoveredName = extract(fields, "first name", "your name");
      console.error(
        "INTAKE: missing payment identifier , redirecting",
        recoveredEmail || "(no email)"
      );

      if (recoveredEmail) {
        try {
          const fromEmail =
            process.env.RESEND_FROM_EMAIL ??
            "Carley (Side Hustle Command Centre) <hello@thesteadysystem.com>";
          const buyUrl =
            process.env.NEXT_PUBLIC_GUMROAD_URL ??
            "https://steadysoul7.gumroad.com/l/gyzjep";
          const greeting = recoveredName ? `Hi ${recoveredName},` : "Hi,";

          await resend.emails.send({
            from: fromEmail,
            to: recoveredEmail,
            reply_to: "hello@thesteadysystem.com",
            subject: "Quick note about your Side Hustle Command Centre",
            text: `${greeting}

Thanks for filling out the Side Hustle Command Centre quiz! I noticed your submission came in through an older form that's no longer connected to the purchase flow, so your workspace wasn't built automatically.

To get your personalized command centre, grab it here:

${buyUrl}

After checkout you'll answer the same questions again (about 3 minutes) and your system is built and emailed to you instantly.

If you already paid and something went wrong, just reply to this email and I'll sort it out personally.

Carley
The Steady System`,
          });
        } catch (err) {
          console.error("INTAKE: recovery email failed", err);
        }
      }

      return NextResponse.json(
        { error: "Payment not verified, missing session or sale ID" },
        { status: 402 }
      );
    }

    if (sessionId) {
      // Stripe flow
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== "paid") {
          console.error("INTAKE: stripe session not paid:", session.payment_status);
          return NextResponse.json(
            { error: "Payment not completed" },
            { status: 402 }
          );
        }
        console.log("INTAKE: stripe session verified paid:", sessionId);
      } catch (err) {
        console.error("INTAKE: stripe verification failed:", err);
        return NextResponse.json(
          { error: "Payment verification failed" },
          { status: 402 }
        );
      }
    } else {
      // Gumroad flow
      try {
        const sale = await verifyGumroadSale(gumroadSaleId);
        if (!sale.paid) {
          console.error("INTAKE: gumroad sale not paid:", gumroadSaleId);
          return NextResponse.json(
            { error: "Payment not completed" },
            { status: 402 }
          );
        }
        console.log("INTAKE: gumroad sale verified paid:", gumroadSaleId);
      } catch (err) {
        console.error("INTAKE: gumroad verification failed:", err);
        return NextResponse.json(
          { error: "Payment verification failed" },
          { status: 402 }
        );
      }
    }

    // Idempotency: bail if a workspace already exists for this payment ID.
    // Prevents double-submits from creating duplicate workspaces.
    const idCol = sessionId ? "stripe_session_id" : "gumroad_sale_id";
    const idVal = sessionId || gumroadSaleId;
    const { data: existing } = await supabase
      .from("workspaces")
      .select("slug, access_token")
      .eq(idCol, idVal)
      .maybeSingle();

    if (existing) {
      console.log("INTAKE: workspace already exists for", idCol, "=", idVal);
      return NextResponse.json({ success: true, slug: existing.slug, duplicate: true });
    }

    // 1. Extract all 13 intake fields
    const intake = {
      buyer_name:           extract(fields, "first name", "your name"),
      buyer_email:          extract(fields, "email"),
      business_name:        extract(fields, "business name", "calling it"),
      tagline:              extract(fields, "one sentence", "tagline", "what does your business do"),
      business_type:        extract(fields, "category", "describes your business"),
      platforms:            extractArray(fields, "sell", "find customers", "platforms"),
      revenue_model:        extract(fields, "make money", "revenue model"),
      target_audience:      extract(fields, "ideal customer", "target audience"),
      launch_date:          extract(fields, "launch"),
      monthly_revenue_goal: extractNumber(fields, "monthly revenue goal", "revenue goal"),
      startup_budget:       extractNumber(fields, "invest", "budget"),
      experience_level:     extract(fields, "experience"),
      brand_color:          extract(fields, "brand color", "colour", "color"),
    };

    // 2. Generate slug, token, brand color
    const slug         = generateSlug(intake.business_name || "my-biz");
    const access_token = generateToken(64);
    const brand_color  = resolveColor(intake.brand_color, intake.business_type);

    // 3. Insert workspace into Supabase with empty content (retry on slug collision)
    // Content will be generated lazily via GET /api/workspace/[token]
    console.log("INTAKE: inserting into Supabase");
    let workspace = null;
    let dbError = null;
    let finalSlug = slug;

    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, error } = await supabase
        .from("workspaces")
        .insert({
          slug: finalSlug,
          access_token,
          buyer_name:           intake.buyer_name,
          buyer_email:          intake.buyer_email,
          business_name:        intake.business_name,
          business_type:        intake.business_type,
          tagline:              intake.tagline || null,
          platforms:            intake.platforms,
          revenue_model:        intake.revenue_model || null,
          target_audience:      intake.target_audience || null,
          launch_date:          intake.launch_date || null,
          monthly_revenue_goal: intake.monthly_revenue_goal,
          startup_budget:       intake.startup_budget,
          brand_color,
          experience_level:     intake.experience_level || null,
          runway_state:         { needs_generation: true },
          content_state:        { needs_generation: true },
          offer_card:           {},
          milestones:           ["system_activated"],
          ai_messages_remaining: 50,
          stripe_session_id:    sessionId || null,
          gumroad_sale_id:      gumroadSaleId || null,
        })
        .select("id")
        .single();

      if (!error) {
        workspace = data;
        dbError = null;
        break;
      }

      if (error.code === "23505" && error.message.includes("slug")) {
        console.log(`INTAKE: slug collision on "${finalSlug}", retrying...`);
        finalSlug = generateSlug(intake.business_name || "my-biz");
        dbError = error;
        continue;
      }

      dbError = error;
      break;
    }

    if (dbError || !workspace) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 });
    }
    console.log("INTAKE: workspace created:", finalSlug);

    // 4. Send welcome email via Resend
    const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? "https://sidehustlecommandcentre.com";
    const workspaceUrl = `${appUrl}/${finalSlug}?t=${access_token}`;
    const fromEmail    = process.env.RESEND_FROM_EMAIL ?? "Carley <hello@thesteadysystem.com>";

    console.log("INTAKE: sending email from:", fromEmail, "to:", intake.buyer_email);

    const emailPayload = {
      ...intake,
      business_name: intake.business_name,
      platforms: intake.platforms,
    };

    const emailResult = await resend.emails.send({
      from:     fromEmail,
      to:       intake.buyer_email,
      reply_to: "hello@thesteadysystem.com",
      subject:  `Your link for ${intake.business_name}`,
      text:     buildEmailText(emailPayload, workspaceUrl),
      html:     buildEmailHtml(emailPayload, workspaceUrl),
    });
    console.log("INTAKE: email result:", JSON.stringify(emailResult));

    return NextResponse.json({ success: true, slug: finalSlug });

  } catch (err) {
    console.error("Intake route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
