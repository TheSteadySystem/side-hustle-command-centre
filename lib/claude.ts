/* eslint-disable @typescript-eslint/no-explicit-any */
import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY env var missing");
    _anthropic = new Anthropic({ apiKey: key });
  }
  return _anthropic;
}

export const anthropic = new Proxy({} as Anthropic, {
  get(_, prop) {
    return (getAnthropic() as any)[prop];
  },
});

export const AI_COACH_MODEL =
  process.env.AI_COACH_MODEL ?? "claude-sonnet-4-6";
