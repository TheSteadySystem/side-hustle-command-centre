import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { anthropic } from "@/lib/claude";

// ---------------------------------------------------------------------------
// Claude prompt for lazy content generation
// Generates 8 items: runway, content, offer card, pricing, costs,
// first customers, weekly plan, ready checklist
// ---------------------------------------------------------------------------
function buildPrompt(w: Record<string, unknown>): string {
  return `You are generating personalized business launch content. Output ONLY valid JSON — no markdown, no preamble, no explanation.

The business:
- Name: ${w.business_name}
- Type: ${w.business_type}
- Tagline: ${w.tagline}
- Platforms: ${Array.isArray(w.platforms) ? (w.platforms as string[]).join(", ") : w.platforms}
- Revenue model: ${w.revenue_model}
- Target audience: ${w.target_audience}
- Launch date: ${w.launch_date}
- Monthly goal: $${w.monthly_revenue_goal}
- Startup budget: $${w.startup_budget}
- Experience level: ${w.experience_level}

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
   Amounts should sum to approximately $${w.startup_budget ?? 500}.

6. "first_customers" — array of exactly 10 objects:
   Each: { "step": number, "action": string, "detail": string, "platform": string }
   These must be SPECIFIC, actionable steps to get the first 10 paying customers.
   Steps should be ordered from easiest/fastest to more advanced.
   Reference the specific platforms they selected, their target audience, and their business type.
   Examples of good actions: "Post in 3 Facebook groups where ${w.target_audience} hangs out", "DM 5 people who commented on similar ${w.business_type} posts on Instagram", "Offer a founding customer discount to your existing network"
   Do NOT include generic advice like "build a website" or "create social media accounts" — those are in the runway.
   Focus on outreach, conversations, and closing the first sale.

7. "weekly_plan" — object:
   { "suggested_hours": number, "blocks": [ { "day": string, "task": string, "minutes": number, "category": "build"|"content"|"outreach"|"admin" } ] }
   Based on their experience level, suggest a realistic weekly hour commitment:
   - "Total beginner": 5 hours/week
   - "Some experience": 7 hours/week
   - "Been doing this a while": 10 hours/week
   Create 5-7 time blocks spread across the week (not all on one day).
   Tasks should be specific to their business and current runway phase.
   Categories help them understand what type of work each block is.

8. "ready_checklist" — array of exactly 6-8 objects:
   Each: { "item": string, "category": "product"|"brand"|"sales"|"legal" }
   These are the minimum requirements to start taking money.
   Must be specific to their business type and platforms.
   Examples for a handmade business on Etsy: "Listed at least 5 products with photos and descriptions", "Set up Etsy payment processing", "Created a shop banner and profile"
   Examples for a service business on Instagram: "Published your offer with clear pricing", "Created a booking/inquiry link", "Posted 3 pieces of content showing your work"
   Do NOT include aspirational items like "build email list" — focus on the minimum viable sales setup.`;
}

export const maxDuration = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("access_token", token)
    .single();

  if (error || !workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  // Update last_active_at
  await supabase
    .from("workspaces")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", workspace.id);

  // Lazy content generation: if workspace was created without Claude content,
  // generate it now on first load.
  if (workspace.runway_state?.needs_generation) {
    console.log("GENERATE: generating content for", workspace.slug);
    try {
      const claudeResponse = await anthropic.messages.create({
        model: process.env.INTAKE_MODEL ?? "claude-sonnet-4-6",
        max_tokens: 6000,
        messages: [{ role: "user", content: buildPrompt(workspace) }],
      });

      const rawText =
        claudeResponse.content[0].type === "text" ? claudeResponse.content[0].text : "{}";

      let generated: {
        runway?: { name: string; items: string[] }[];
        content_prompts?: object[];
        offer_card?: object;
        pricing_guide?: object[];
        startup_costs?: object[];
        first_customers?: { step: number; action: string; detail: string; platform: string }[];
        weekly_plan?: { suggested_hours: number; blocks: object[] };
        ready_checklist?: { item: string; category: string }[];
      } = {};

      try {
        const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        generated = JSON.parse(cleaned);
      } catch {
        console.error("GENERATE: Claude JSON parse failed:", rawText.substring(0, 300));
      }

      const runway_state = {
        phases:          generated.runway          ?? [],
        pricing_guide:   generated.pricing_guide   ?? [],
        startup_costs:   generated.startup_costs   ?? [],
        first_customers: generated.first_customers ?? [],
        ready_checklist: generated.ready_checklist ?? [],
      };

      const content_state = {
        prompts:     generated.content_prompts ?? [],
        weekly_plan: generated.weekly_plan     ?? null,
      };

      const offer_card = generated.offer_card ?? workspace.offer_card ?? {};

      await supabase
        .from("workspaces")
        .update({ runway_state, content_state, offer_card })
        .eq("id", workspace.id);

      console.log("GENERATE: content saved for", workspace.slug);

      workspace.runway_state = runway_state;
      workspace.content_state = content_state;
      workspace.offer_card = offer_card;
    } catch (err) {
      console.error("GENERATE: error generating content:", err);
    }
  }

  return NextResponse.json(workspace);
}
