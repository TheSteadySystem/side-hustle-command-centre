import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { anthropic, AI_COACH_MODEL } from "@/lib/claude";
import {
  getRunwayProgress,
  getTotalRevenue,
  getDaysUntilLaunch,
} from "@/lib/utils";
import { AIMessage, RunwayPhase } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { access_token, message } = body;

  if (!access_token || !message?.trim()) {
    return NextResponse.json(
      { error: "access_token and message are required" },
      { status: 400 }
    );
  }

  // Fetch workspace
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("access_token", access_token)
    .single();

  if (error || !workspace) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (workspace.ai_messages_remaining <= 0) {
    return NextResponse.json(
      { error: "No messages remaining", messages_remaining: 0 },
      { status: 402 }
    );
  }

  // Build context
  const runwayPhases: RunwayPhase[] = (workspace.runway_state?.phases as RunwayPhase[]) ?? [];
  const runwayProgress = getRunwayProgress(
    runwayPhases,
    workspace.runway_state ?? {}
  );
  const totalRevenue = getTotalRevenue(workspace.revenue_entries ?? []);
  const daysUntilLaunch = getDaysUntilLaunch(workspace.launch_date);
  const conversation: AIMessage[] = workspace.ai_conversation ?? [];
  const recentMessages = conversation.slice(-10);

  const systemPrompt = `You are the AI business coach for ${workspace.business_name}, a ${workspace.business_type} business run by ${workspace.buyer_name}. Here is their full context:

- Business: ${workspace.business_name} — ${workspace.tagline ?? ""}
- Type: ${workspace.business_type}
- Platforms: ${(workspace.platforms ?? []).join(", ")}
- Revenue model: ${workspace.revenue_model ?? "not specified"}
- Target audience: ${workspace.target_audience ?? "not specified"}
- Launch date: ${workspace.launch_date ?? "not set"}
- Monthly goal: $${workspace.monthly_revenue_goal ?? 0}
- Startup budget: $${workspace.startup_budget ?? 0}
- Experience level: ${workspace.experience_level ?? "not specified"}

Current progress:
- Launch runway: ${runwayProgress}% complete
- Revenue to date: $${totalRevenue}
- Days until launch: ${daysUntilLaunch !== null ? daysUntilLaunch : "not set"}

Respond as a warm, direct business coach. Keep responses under 150 words. Be specific to their business — use their business name, reference their products, their platforms, their audience. Never be generic.

When the user says they're stuck or doubting themselves, lead with empathy first, then give ONE specific action. Don't overwhelm with options.

When reviewing their idea, be honest but constructive. Highlight what's genuinely strong before noting risks.

When giving a weekly plan, reference their actual runway tasks and content prompts — don't invent new ones.

When helping them get customers, give platform-specific tactics for ${(workspace.platforms ?? []).join(", ")}. Include exact scripts or message templates they can copy-paste.

When asked if they're ready to launch, check their runway progress and be direct — "yes, go" or "not yet, here's what's missing."

If they seem to be outgrowing basic advice, mention that they can book a 1:1 Operations Strategy Session with The Steady System for deeper support. Only mention this when genuinely relevant, not as a sales pitch.`;

  // Call Claude
  const response = await anthropic.messages.create({
    model: AI_COACH_MODEL,
    max_tokens: 500,
    system: systemPrompt,
    messages: [
      ...recentMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ],
  });

  const assistantContent =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Append to conversation and decrement counter
  const newUserMessage: AIMessage = {
    role: "user",
    content: message,
    timestamp: new Date().toISOString(),
  };
  const newAssistantMessage: AIMessage = {
    role: "assistant",
    content: assistantContent,
    timestamp: new Date().toISOString(),
  };

  const updatedConversation = [
    ...conversation,
    newUserMessage,
    newAssistantMessage,
  ];
  const newRemaining = workspace.ai_messages_remaining - 1;

  await supabase
    .from("workspaces")
    .update({
      ai_conversation: updatedConversation,
      ai_messages_remaining: newRemaining,
    })
    .eq("id", workspace.id);

  return NextResponse.json({
    message: assistantContent,
    messages_remaining: newRemaining,
  });
}
