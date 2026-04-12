"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  // Exactly one of these two should be present
  stripeSessionId?: string;
  gumroadSaleId?: string;
  defaultEmail?: string;
  defaultName?: string;
}

const CATEGORIES = [
  "Handmade",
  "Digital Products",
  "Service-Based",
  "Food & Beverage",
  "Fashion & Accessories",
  "Health & Wellness",
  "Creative & Design",
  "Other",
];

const PLATFORMS = [
  "Instagram",
  "TikTok",
  "Etsy",
  "Shopify",
  "Facebook",
  "Pinterest",
  "Local/In-Person",
  "Other",
];

const REVENUE_MODELS = [
  "Selling physical products",
  "Selling services",
  "Digital downloads",
  "Subscriptions",
  "Coaching or consulting",
  "Other",
];

const EXPERIENCE_LEVELS = [
  "Total beginner — this is brand new",
  "Some experience — I've dabbled",
  "Been doing this a while — ready to level up",
];

interface FormState {
  buyer_name: string;
  buyer_email: string;
  business_name: string;
  tagline: string;
  category: string;
  platforms: string[];
  revenue_model: string;
  ideal_customer: string;
  monthly_revenue_goal: string;
  startup_budget: string;
  launch_date: string;
  experience: string;
  brand_color: string;
}

export default function IntakeForm({
  stripeSessionId,
  gumroadSaleId,
  defaultEmail = "",
  defaultName = "",
}: Props) {
  const [form, setForm] = useState<FormState>({
    buyer_name: defaultName,
    buyer_email: defaultEmail,
    business_name: "",
    tagline: "",
    category: "",
    platforms: [],
    revenue_model: "",
    ideal_customer: "",
    monthly_revenue_goal: "",
    startup_budget: "",
    launch_date: "",
    experience: "",
    brand_color: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const togglePlatform = (platform: string) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(platform)
        ? f.platforms.filter((p) => p !== platform)
        : [...f.platforms, platform],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // Client-side validation
    const required: (keyof FormState)[] = [
      "buyer_name",
      "buyer_email",
      "business_name",
      "tagline",
      "category",
      "revenue_model",
      "ideal_customer",
      "monthly_revenue_goal",
      "startup_budget",
      "launch_date",
      "experience",
    ];
    for (const field of required) {
      if (!form[field] || (Array.isArray(form[field]) && (form[field] as string[]).length === 0)) {
        setError(`Please fill out: ${field.replace(/_/g, " ")}`);
        return;
      }
    }
    if (form.platforms.length === 0) {
      setError("Please select at least one platform");
      return;
    }

    setError(null);
    setSubmitting(true);

    // Shape the payload to match the Tally format /api/intake already parses.
    // Include whichever payment ID we were constructed with.
    const paymentFields: { label: string; value: unknown }[] = [];
    if (stripeSessionId) {
      paymentFields.push({ label: "session_id", value: stripeSessionId });
    }
    if (gumroadSaleId) {
      paymentFields.push({ label: "gumroad_sale_id", value: gumroadSaleId });
    }

    const payload = {
      data: {
        fields: [
          ...paymentFields,
          { label: "first name", value: form.buyer_name },
          { label: "email", value: form.buyer_email },
          { label: "business name", value: form.business_name },
          { label: "one sentence tagline", value: form.tagline },
          { label: "category", value: form.category },
          {
            label: "sell",
            value: form.platforms,
          },
          { label: "make money", value: form.revenue_model },
          { label: "ideal customer", value: form.ideal_customer },
          { label: "monthly revenue goal", value: Number(form.monthly_revenue_goal) },
          { label: "invest", value: Number(form.startup_budget) },
          { label: "launch", value: form.launch_date },
          { label: "experience", value: form.experience },
          { label: "brand color", value: form.brand_color },
        ],
      },
    };

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      // Success — redirect to a holding page that tells them to check email
      window.location.href = `/thank-you/check-email?slug=${data.slug}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Row 1: Name + Email */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Your first name">
          <input
            type="text"
            required
            value={form.buyer_name}
            onChange={(e) => update("buyer_name", e.target.value)}
            placeholder="Carley"
            className="input"
          />
        </Field>
        <Field label="Email for your command centre">
          <input
            type="email"
            required
            value={form.buyer_email}
            onChange={(e) => update("buyer_email", e.target.value)}
            placeholder="you@example.com"
            className="input"
          />
        </Field>
      </div>

      {/* Row 2: Business name */}
      <Field label="What are you calling your business?">
        <input
          type="text"
          required
          value={form.business_name}
          onChange={(e) => update("business_name", e.target.value)}
          placeholder="Steady Candles"
          className="input"
        />
      </Field>

      {/* Row 3: Tagline */}
      <Field label="Describe it in one sentence">
        <input
          type="text"
          required
          value={form.tagline}
          onChange={(e) => update("tagline", e.target.value)}
          placeholder="Hand-poured soy candles for cozy homes"
          className="input"
        />
      </Field>

      {/* Row 4: Category */}
      <Field label="Which category best describes your business?">
        <select
          required
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
          className="input"
        >
          <option value="">Choose one…</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </Field>

      {/* Row 5: Platforms (multi-select chips) */}
      <Field label="Where will you sell or find customers? (select all)">
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => {
            const active = form.platforms.includes(p);
            return (
              <button
                type="button"
                key={p}
                onClick={() => togglePlatform(p)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: active ? "#B8860B" : "#1A1918",
                  color: active ? "#0C0B0A" : "#D4CFC6",
                  border: active ? "1px solid #B8860B" : "1px solid #2A2825",
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
      </Field>

      {/* Row 6: Revenue model */}
      <Field label="How will you make money?">
        <select
          required
          value={form.revenue_model}
          onChange={(e) => update("revenue_model", e.target.value)}
          className="input"
        >
          <option value="">Choose one…</option>
          {REVENUE_MODELS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </Field>

      {/* Row 7: Ideal customer */}
      <Field label="Describe your ideal customer in a few words">
        <input
          type="text"
          required
          value={form.ideal_customer}
          onChange={(e) => update("ideal_customer", e.target.value)}
          placeholder="Busy moms who love cozy home decor"
          className="input"
        />
      </Field>

      {/* Row 8: Revenue goal + budget */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Monthly revenue goal ($)">
          <input
            type="number"
            min="0"
            required
            value={form.monthly_revenue_goal}
            onChange={(e) => update("monthly_revenue_goal", e.target.value)}
            placeholder="3000"
            className="input"
          />
        </Field>
        <Field label="Startup budget ($)">
          <input
            type="number"
            min="0"
            required
            value={form.startup_budget}
            onChange={(e) => update("startup_budget", e.target.value)}
            placeholder="500"
            className="input"
          />
        </Field>
      </div>

      {/* Row 9: Launch date + experience */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Target launch date">
          <input
            type="date"
            required
            value={form.launch_date}
            onChange={(e) => update("launch_date", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Your experience level">
          <select
            required
            value={form.experience}
            onChange={(e) => update("experience", e.target.value)}
            className="input"
          >
            <option value="">Choose one…</option>
            {EXPERIENCE_LEVELS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Row 10: Brand color */}
      <Field label="Brand color (optional)">
        <input
          type="text"
          value={form.brand_color}
          onChange={(e) => update("brand_color", e.target.value)}
          placeholder="pink, #B8860B, navy, etc."
          className="input"
        />
      </Field>

      {error && (
        <div
          className="px-4 py-3 rounded-lg text-sm"
          style={{
            backgroundColor: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 rounded-xl text-base font-bold transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ backgroundColor: "#B8860B", color: "#0C0B0A" }}
      >
        {submitting && <Loader2 size={18} className="animate-spin" />}
        {submitting ? "Building your command centre…" : "Build my command centre →"}
      </button>

      <p className="text-xs text-center" style={{ color: "#4A4540" }}>
        Takes about 30 seconds. You&apos;ll get a private link by email.
      </p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span
        className="block text-sm font-medium mb-2"
        style={{ color: "#D4CFC6" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
