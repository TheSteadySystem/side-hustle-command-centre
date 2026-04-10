import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const AI_COACH_MODEL =
  process.env.AI_COACH_MODEL ?? "claude-sonnet-4-6";
