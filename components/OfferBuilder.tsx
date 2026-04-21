"use client";

import { useState } from "react";
import { Workspace, OfferCard, PricingTier, ReadyChecklistItem } from "@/lib/types";
import { Share2, Copy, Check } from "lucide-react";

interface Props {
  workspace: Workspace;
  updateWorkspace: (field: string, value: unknown) => Promise<void>;
}

export default function OfferBuilder({ workspace, updateWorkspace }: Props) {
  const existing = workspace.offer_card ?? {};
  const pricingGuide: PricingTier[] =
    (workspace.runway_state?.pricing_guide as PricingTier[]) ?? [];
  const readyChecklist: ReadyChecklistItem[] =
    (workspace.runway_state?.ready_checklist as ReadyChecklistItem[]) ?? [];
  const brandColor = workspace.brand_color ?? "#7f6720";

  const [card, setCard] = useState<OfferCard>({
    headline: existing.headline ?? workspace.business_name,
    tagline: existing.tagline ?? workspace.tagline ?? "",
    what: existing.what ?? workspace.business_type,
    platforms: existing.platforms ?? (workspace.platforms ?? []).join(", "),
  });
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const saveCard = async () => {
    await updateWorkspace("offer_card", card);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const shareLink = `${
    process.env.NEXT_PUBLIC_APP_URL ?? "https://app.sidehustlecommandcentre.com"
  }/share/${workspace.slug}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TIER_COLORS: Record<string, string> = {
    Entry: "#908F99",
    Core: "var(--brand-color)",
    Premium: "#1E1E24",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-text-primary text-xl font-bold">Offer Builder</h2>
        <p className="text-text-muted text-sm mt-1">
          Your shareable business card and pricing guide
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ backgroundColor: "#F4F0E7", border: "1px solid #D8D4C8" }}
        >
          <p className="text-text-muted text-xs uppercase tracking-widest">
            Edit Your Card
          </p>

          {(
            [
              { key: "headline", label: "Headline (Business Name)" },
              { key: "tagline", label: "Tagline" },
              { key: "what", label: "What You Do" },
              { key: "platforms", label: "Where to Find You" },
            ] as const
          ).map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-text-subtle text-xs">{label}</label>
              <input
                type="text"
                value={card[key] ?? ""}
                onChange={(e) => setCard({ ...card, [key]: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm text-text-primary placeholder:text-text-ghost"
                style={{ backgroundColor: "#EDE8DC", border: "1px solid #C4C1BB" }}
              />
            </div>
          ))}

          <button
            onClick={saveCard}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: "var(--brand-color)", color: "#E8E4DC" }}
          >
            {saved ? "Saved!" : "Save Card"}
          </button>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          {/* Card preview */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${brandColor}40` }}
          >
            <div style={{ backgroundColor: brandColor, height: "5px" }} />
            <div
              className="p-6 space-y-4"
              style={{ backgroundColor: "#F4F0E7" }}
            >
              <div>
                <h3
                  className="text-2xl font-bold"
                  style={{ color: "#1E1E24" }}
                >
                  {card.headline || workspace.business_name}
                </h3>
                <p className="mt-1 text-base" style={{ color: "#3A3A44" }}>
                  {card.tagline || workspace.tagline}
                </p>
              </div>

              <hr style={{ borderColor: "#D8D4C8" }} />

              <div className="space-y-2">
                {card.what && (
                  <div>
                    <p className="text-xs uppercase tracking-widest" style={{ color: "#6B6A75" }}>
                      What we do
                    </p>
                    <p className="text-sm mt-0.5" style={{ color: "#3A3A44" }}>
                      {card.what}
                    </p>
                  </div>
                )}
                {card.platforms && (
                  <div>
                    <p className="text-xs uppercase tracking-widest" style={{ color: "#6B6A75" }}>
                      Find us on
                    </p>
                    <p className="text-sm mt-0.5" style={{ color: brandColor }}>
                      {card.platforms}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-xs text-center" style={{ color: "#AFADA8" }}>
                Built with Side Hustle Command Centre
              </p>
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex gap-2">
            <button
              onClick={copyShareLink}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: "var(--brand-color-20)",
                color: "var(--brand-color)",
                border: "1px solid var(--brand-color)",
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy Share Link"}
            </button>
            <a
              href={shareLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: "#F4F0E7",
                color: "#6B6A75",
                border: "1px solid #D8D4C8",
              }}
            >
              <Share2 size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Pricing guide */}
      {pricingGuide.length > 0 && (
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ backgroundColor: "#F4F0E7", border: "1px solid #D8D4C8" }}
        >
          <p className="text-text-muted text-xs uppercase tracking-widest">
            Pricing Guide
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {pricingGuide.map((tier) => (
              <div
                key={tier.tier}
                className="rounded-xl p-4 space-y-2"
                style={{
                  backgroundColor: "#EDE8DC",
                  border:
                    tier.tier === "Core"
                      ? "1px solid var(--brand-color)"
                      : "1px solid #C4C1BB",
                }}
              >
                <div className="flex items-center justify-between">
                  <p
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: TIER_COLORS[tier.tier] ?? "#6B6A75" }}
                  >
                    {tier.tier}
                  </p>
                  {tier.tier === "Core" && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "var(--brand-color-20)",
                        color: "var(--brand-color)",
                      }}
                    >
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-text-primary font-bold text-lg">{tier.range}</p>
                <p className="text-text-subtle text-xs leading-relaxed">
                  {tier.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ready to Sell Checklist */}
      {readyChecklist.length > 0 && (
        <ReadyToSell
          items={readyChecklist}
          state={workspace.runway_state ?? {}}
          updateWorkspace={updateWorkspace}
          milestones={workspace.milestones ?? []}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ready to Sell sub-component
// ---------------------------------------------------------------------------
const CATEGORY_BADGE: Record<string, { color: string; label: string }> = {
  product: { color: "#3B82F6", label: "Product" },
  brand: { color: "#A855F7", label: "Brand" },
  sales: { color: "#10B981", label: "Sales" },
  legal: { color: "#6B7280", label: "Legal" },
};

function ReadyToSell({
  items,
  state,
  updateWorkspace,
  milestones,
}: {
  items: ReadyChecklistItem[];
  state: Record<string, unknown>;
  updateWorkspace: (field: string, value: unknown) => Promise<void>;
  milestones: string[];
}) {
  const doneCount = items.filter((_, i) => !!state[`rc_${i}`]).length;

  const toggle = async (index: number) => {
    const key = `rc_${index}`;
    const newState = { ...state, [key]: !state[key] };
    await updateWorkspace("runway_state", newState);

    const newDone = items.filter((_, i) => !!newState[`rc_${i}`]).length;
    if (newDone === items.length && items.length > 0 && !milestones.includes("ready_to_sell")) {
      const newMilestones = [...milestones, "ready_to_sell"];
      await updateWorkspace("milestones", newMilestones);
    }
  };

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{ backgroundColor: "#F4F0E7", border: "1px solid #D8D4C8" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-text-muted text-xs uppercase tracking-widest">
          Ready to Sell?
        </p>
        <span className="text-xs font-medium" style={{ color: "var(--brand-color)" }}>
          {doneCount}/{items.length}
        </span>
      </div>
      <p className="text-text-subtle text-xs">
        Complete these to start taking money
      </p>

      <div className="space-y-2">
        {items.map((item, i) => {
          const isDone = !!state[`rc_${i}`];
          const badge = CATEGORY_BADGE[item.category] ?? CATEGORY_BADGE.product;

          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-bg-cardHover transition-colors text-left"
            >
              <div
                className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-all"
                style={{
                  backgroundColor: isDone ? "var(--brand-color)" : "transparent",
                  borderColor: isDone ? "var(--brand-color)" : "#C4C1BB",
                }}
              >
                {isDone && <Check size={11} style={{ color: "var(--brand-text-on-brand)" }} />}
              </div>
              <span
                className="text-sm flex-1"
                style={{
                  color: isDone ? "#B0AFB8" : "#3A3A44",
                  textDecoration: isDone ? "line-through" : "none",
                }}
              >
                {item.item}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ backgroundColor: `${badge.color}20`, color: badge.color }}
              >
                {badge.label}
              </span>
            </button>
          );
        })}
      </div>

      {doneCount === items.length && items.length > 0 && (
        <p className="text-center text-sm font-medium" style={{ color: "var(--brand-color)" }}>
          You&apos;re ready. Go get your first customer!
        </p>
      )}
    </div>
  );
}
