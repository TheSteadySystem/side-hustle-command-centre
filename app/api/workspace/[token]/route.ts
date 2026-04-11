import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { anthropic } from "@/lib/claude";

// ---------------------------------------------------------------------------
// Claude prompt for lazy content generation (same as was in intake)
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
   Amounts should sum to approximately $${w.startup_budget ?? 500}.`;
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
  // generate it now on first load. The user sees a loading screen while this runs.
  if (workspace.runway_state?.needs_generation) {
    console.log("GENERATE: generating content for", workspace.slug);
    try {
      const claudeResponse = await anthropic.messages.create({
        model: process.env.INTAKE_MODEL ?? "claude-haiku-4-5-20251001",
        max_tokens: 4096,
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
      } = {};

      try {
        const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        generated = JSON.parse(cleaned);
      } catch {
        console.error("GENERATE: Claude JSON parse failed:", rawText.substring(0, 200));
      }

      const runway_state = {
        phases:        generated.runway        ?? [],
        pricing_guide: generated.pricing_guide ?? [],
        startup_costs: generated.startup_costs ?? [],
      };

      const content_state = {
        prompts: generated.content_prompts ?? [],
      };

      const offer_card = generated.offer_card ?? workspace.offer_card ?? {};

      await supabase
        .from("workspaces")
        .update({ runway_state, content_state, offer_card })
        .eq("id", workspace.id);

      console.log("GENERATE: content saved for", workspace.slug);

      // Return the updated workspace
      workspace.runway_state = runway_state;
      workspace.content_state = content_state;
      workspace.offer_card = offer_card;
    } catch (err) {
      console.error("GENERATE: error generating content:", err);
      // Return workspace anyway — they'll see empty states with "generating..." messages
    }
  }

  return NextResponse.json(workspace);
}
