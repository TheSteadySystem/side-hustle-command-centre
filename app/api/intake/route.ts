import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { anthropic, AI_COACH_MODEL } from "@/lib/claude";
import { resend } from "@/lib/resend";
import { generateSlug, generateToken, getBrandColorFromBusinessType } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Tally field extractor
// Tally payload: { data: { fields: [{ key, label, value, options? }] } }
//
// Dropdowns and multi-selects send:
//   value: string[]  — array of selected option IDs
//   options: { id: string; text: string }[]  — all available options
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
  // Dropdown / single-select — resolve option text
  if (f.options?.length) return resolveOptions(f)[0] ?? "";
  if (Array.isArray(f.value)) return f.value.join(", ");
  return String(f.value);
}

function extractArray(fields: TallyField[], ...keywords: string[]): string[] {
  const f = fields.find((f) =>
    keywords.some((kw) => f.label?.toLowerCase().includes(kw.toLowerCase()))
  );
  if (!f || !f.value) return [];
  // Multi-select — resolve all selected option texts
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
  return `You are generating personalized business launch content. Output ONLY valid JSON — no markdown, no preamble, no explanation.

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

1. "runway" — array of exactly 4 phase objects:
   Each: { "name": string, "items": string[] (3-5 items) }
   Phases must be named: Foundation, Build, Pre-Launch, Launch Week
   Tasks must be SPECIFIC to this business type, not generic advice.

2. "content_prompts" — array of exactly 30 objects:
   Each: { "day": number, "prompt": string, "platform": string, "type": "Reel"|"Story"|"Carousel"|"Photo"|"Video"|"Post" }
   Prompts must reference the business name, specific products/services, and target audience.
   Distribute evenly across the buyer's selected platforms.

3. "offer_card" — object:
   { "headline": string, "tagline": string, "what": string, "platforms": string }

4. "pricing_guide" — array of exactly 3 objects:
   Each: { "tier": "Entry"|"Core"|"Premium", "range": string, "description": string }
   Price ranges must be realistic for this specific business type.

5. "startup_costs" — array of 5-7 objects:
   Each: { "name": string, "amount": number }
   Categories must be specific to this business type.
   Amounts should sum to approximately $${intake.startup_budget ?? 500}.`;
}

// ---------------------------------------------------------------------------
// Welcome email HTML
// ---------------------------------------------------------------------------
function buildEmailHtml(intake: Record<string, unknown>, workspaceUrl: string, brandColor: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: 'DM Sans', system-ui, sans-serif; background: #0C0B0A; color: #F5F0E8; margin: 0; padding: 0; }
  .wrap { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
  .label { color: ${brandColor}; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
  h1 { font-size: 26px; font-weight: 700; line-height: 1.3; margin: 14px 0 8px; }
  .accent { color: ${brandColor}; }
  p { color: #8A8478; font-size: 15px; line-height: 1.7; margin: 0 0 20px; }
  .btn { display: inline-block; background: ${brandColor}; color: #0C0B0A; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; text-decoration: none; }
  hr { border: none; border-top: 1px solid #1F1E1C; margin: 28px 0; }
  ul { color: #D4CFC6; font-size: 14px; line-height: 1.9; padding-left: 20px; }
  .footer { color: #4A4540; font-size: 12px; line-height: 1.6; margin-top: 32px; }
  .link { color: ${brandColor}; word-break: break-all; }
</style>
</head>
<body>
<div class="wrap">
  <p class="label">Side Hustle Command Centre</p>
  <h1>Your command centre for<br><span class="accent">${intake.business_name}</span> is ready.</h1>
  <p>Everything has been built around your answers — your launch runway, 30-day content calendar, pricing guide, and AI business coach are all set up and waiting.</p>
  <a href="${workspaceUrl}" class="btn">Open Your Command Centre &rarr;</a>
  <hr>
  <p style="color:#D4CFC6; margin-bottom:8px;">What&apos;s inside:</p>
  <ul>
    <li>✅ Personalized launch runway — 4 phases, specific to your business</li>
    <li>📱 30-day content calendar for ${(intake.platforms as string[]).join(", ")}</li>
    <li>💰 Money tracker with your startup cost breakdown</li>
    <li>⚡ Offer card + 3-tier pricing guide</li>
    <li>🤖 AI coach with 50 free messages (already knows your business)</li>
  </ul>
  <hr>
  <p>Your private link — bookmark this, it&apos;s your business HQ:<br>
  <a href="${workspaceUrl}" class="link">${workspaceUrl}</a></p>
  <p class="footer">— The Steady System<br>
  Questions? Reply to this email or contact hello@sidehustlecommandcentre.com</p>
</div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    console.log("INTAKE: received request");
    const body = await req.json();

    // Tally wraps fields under data.fields
    const fields: TallyField[] =
      body?.data?.fields ?? body?.fields ?? [];

    console.log("INTAKE: parsed fields", fields.length);

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields received" }, { status: 400 });
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
    const brand_color  = /^#[0-9A-Fa-f]{6}$/.test(intake.brand_color)
      ? intake.brand_color
      : getBrandColorFromBusinessType(intake.business_type);

    // 3. Call Claude to generate personalized content
    console.log("INTAKE: calling Claude API");
    const claudeResponse = await anthropic.messages.create({
      model: AI_COACH_MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: buildPrompt({ ...intake, brand_color }) }],
    });

    console.log("INTAKE: Claude returned content");
    const rawText =
      claudeResponse.content[0].type === "text" ? claudeResponse.content[0].text : "{}";

    let generated: {
      runway?: { name: string; items: string[] }[];
      content_prompts?: object[];
      offer_card?: object;
      pricing_guide?: object[];
      startup_costs?: object[];
    } = {};
    try {
      const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      generated = JSON.parse(cleaned);
    } catch {
      // Claude returned invalid JSON — continue with empty content rather than failing
      console.error("Claude JSON parse failed:", rawText.substring(0, 200));
    }

    const runway_state = {
      phases:        generated.runway        ?? [],
      pricing_guide: generated.pricing_guide ?? [],
      startup_costs: generated.startup_costs ?? [],
    };

    const content_state = {
      prompts: generated.content_prompts ?? [],
    };

    const offer_card = generated.offer_card ?? {};

    // 4. Insert workspace into Supabase
    console.log("INTAKE: inserting into Supabase");
    const { data: workspace, error: dbError } = await supabase
      .from("workspaces")
      .insert({
        slug,
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
        runway_state,
        content_state,
        offer_card,
        milestones:           ["system_activated"],
        ai_messages_remaining: 50,
      })
      .select("id")
      .single();

    console.log("INTAKE: Supabase insert done");

    if (dbError || !workspace) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 });
    }

    // 5. Send welcome email via Resend
    console.log("INTAKE: sending email");
    const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.sidehustlecommandcentre.com";
    const workspaceUrl = `${appUrl}/${slug}?t=${access_token}`;

    await resend.emails.send({
      from:    process.env.RESEND_FROM_EMAIL ?? "hello@sidehustlecommandcentre.com",
      to:      intake.buyer_email,
      subject: `Your Side Hustle Command Centre is ready, ${intake.buyer_name}!`,
      html:    buildEmailHtml({ ...intake, business_name: intake.business_name, platforms: intake.platforms }, workspaceUrl, brand_color),
    });
    console.log("INTAKE: email sent");

    return NextResponse.json({ success: true, slug });

  } catch (err) {
    console.error("Intake route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
