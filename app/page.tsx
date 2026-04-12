import type { Metadata } from "next";
import { CheckCircle, Zap, BarChart2, Calendar, MessageCircle, Layout, Star } from "lucide-react";
import BuyButton from "@/components/BuyButton";

export const metadata: Metadata = {
  title: "Side Hustle Command Centre — Your AI-Powered Business Launch System",
  description:
    "Stop using generic templates. Get a fully personalized business launch system built around your idea, your goals, and your timeline — in minutes.",
};

const MODULES = [
  {
    icon: Layout,
    name: "CEO Dashboard",
    desc: "Your launch countdown, runway progress, revenue goal, and content streak — all in one place.",
  },
  {
    icon: CheckCircle,
    name: "Launch Runway",
    desc: "A 4-phase, personalized checklist of everything you need to do to launch — specific to your business type.",
  },
  {
    icon: BarChart2,
    name: "Money Tracker",
    desc: "Track income and expenses, see your startup cost breakdown, and watch your progress toward your goal.",
  },
  {
    icon: Calendar,
    name: "Content Engine",
    desc: "30 days of content prompts written specifically for your business, your products, and your platforms.",
  },
  {
    icon: Zap,
    name: "Offer Builder",
    desc: "A shareable offer card and 3-tier pricing guide built for your business type.",
  },
  {
    icon: MessageCircle,
    name: "AI Business Coach",
    desc: "50 messages with an AI coach that already knows your business, goals, audience, and launch plan.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Answer 13 questions",
    desc: "Tell us about your business, your platforms, your target customer, and your goals. Takes 3 minutes.",
  },
  {
    step: "02",
    title: "We build your system",
    desc: "Our AI generates your personalized launch runway, 30-day content plan, pricing guide, and more — instantly.",
  },
  {
    step: "03",
    title: "Get your private link",
    desc: "Your command centre is emailed to you. Bookmark it. It's your new business HQ — ready to use today.",
  },
];

const WHATS_DIFFERENT = [
  "Built around YOUR business, not a generic \"candle business\"",
  "Content prompts that mention your actual products and audience",
  "A launch runway tuned to your experience level and timeline",
  "Pricing recommendations specific to your business category",
  "An AI coach that skips the generic advice — it knows your context",
  "One link, always accessible — no app to install, no account to manage",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0C0B0A", color: "#F5F0E8" }}>
      {/* Nav */}
      <nav
        className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto"
        style={{ borderBottom: "1px solid #1F1E1C" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#B8860B" }} />
          <span className="font-semibold text-sm tracking-tight">Side Hustle Command Centre</span>
        </div>
        <BuyButton
          showArrow={false}
          className="text-sm font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#B8860B", color: "#0C0B0A" }}
        >
          Get Access — $275
        </BuyButton>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 sm:py-28 max-w-4xl mx-auto text-center">
        <p
          className="text-xs uppercase tracking-widest mb-4 font-medium"
          style={{ color: "#B8860B" }}
        >
          Stop starting over. Start with a system.
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight text-balance">
          Your personalized business
          <br />
          <span style={{ color: "#B8860B" }}>command centre</span>
          <br />
          built in minutes.
        </h1>
        <p
          className="mt-6 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto"
          style={{ color: "#D4CFC6" }}
        >
          Answer 13 questions about your side hustle. Get a fully customized
          launch system — runway checklist, 30-day content plan, pricing guide,
          money tracker, and an AI coach that knows your business.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <BuyButton
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#B8860B", color: "#0C0B0A" }}
          >
            Build My Command Centre
          </BuyButton>
          <p style={{ color: "#6B6560" }} className="text-sm">
            $275 one-time · No subscription · Private link delivered by email
          </p>
        </div>
      </section>

      {/* Social proof strip */}
      <div
        className="px-6 py-5"
        style={{ backgroundColor: "#141312", borderTop: "1px solid #1F1E1C", borderBottom: "1px solid #1F1E1C" }}
      >
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-center">
          {[
            { value: "50", label: "Free AI coach messages" },
            { value: "30", label: "Days of content prompts" },
            { value: "4", label: "Phase launch runway" },
            { value: "$0", label: "Monthly fees, ever" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold" style={{ color: "#B8860B" }}>
                {value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#6B6560" }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* What's different */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#B8860B" }}>
          Why it works
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold mb-10">
          Not a template. Not a course.
          <br />A system built{" "}
          <span style={{ color: "#B8860B" }}>around you.</span>
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {WHATS_DIFFERENT.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{ backgroundColor: "#141312", border: "1px solid #1F1E1C" }}
            >
              <CheckCircle
                size={16}
                className="flex-shrink-0 mt-0.5"
                style={{ color: "#B8860B" }}
              />
              <span style={{ color: "#D4CFC6" }} className="text-sm leading-relaxed">
                {item}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        className="px-6 py-20"
        style={{ backgroundColor: "#141312", borderTop: "1px solid #1F1E1C", borderBottom: "1px solid #1F1E1C" }}
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest mb-3 text-center" style={{ color: "#B8860B" }}>
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Three steps to your system
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="space-y-3">
                <p
                  className="text-5xl font-bold"
                  style={{ color: "#B8860B", opacity: 0.4 }}
                >
                  {step}
                </p>
                <h3 className="text-lg font-semibold" style={{ color: "#F5F0E8" }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8A8478" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's inside */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#B8860B" }}>
          What you get
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold mb-10">
          Six modules. One system.
          <br />
          <span style={{ color: "#B8860B" }}>All personalized.</span>
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {MODULES.map(({ icon: Icon, name, desc }) => (
            <div
              key={name}
              className="flex gap-4 p-5 rounded-xl"
              style={{ backgroundColor: "#141312", border: "1px solid #1F1E1C" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(184,134,11,0.15)" }}
              >
                <Icon size={18} style={{ color: "#B8860B" }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "#F5F0E8" }}>
                  {name}
                </p>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: "#8A8478" }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section
        className="px-6 py-20"
        style={{ backgroundColor: "#141312", borderTop: "1px solid #1F1E1C", borderBottom: "1px solid #1F1E1C" }}
      >
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#B8860B" }}>
            Pricing
          </p>
          <h2 className="text-3xl font-bold mb-2">One price. Everything included.</h2>
          <p className="text-sm mb-8" style={{ color: "#6B6560" }}>
            No monthly fees. No upsells. No templates to fill in yourself.
          </p>

          <div
            className="rounded-2xl p-8 text-center"
            style={{ border: "1px solid #B8860B", backgroundColor: "#0F0E0D" }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "rgba(184,134,11,0.15)" }}
            >
              <Star size={28} style={{ color: "#B8860B" }} />
            </div>
            <p className="text-5xl font-bold mb-1" style={{ color: "#F5F0E8" }}>
              $275
            </p>
            <p className="text-sm mb-6" style={{ color: "#6B6560" }}>
              One-time payment
            </p>
            <ul className="space-y-3 text-left mb-8">
              {[
                "Personalized command centre (private link, forever)",
                "4-phase launch runway for your business type",
                "30-day content calendar for your platforms",
                "AI money tracker + startup cost breakdown",
                "Offer card + 3-tier pricing guide",
                "50 AI coach messages (knows your full context)",
                "Get 50 more for $5 any time you need them",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle
                    size={15}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: "#B8860B" }}
                  />
                  <span className="text-sm" style={{ color: "#D4CFC6" }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            <BuyButton
              showArrow={false}
              className="block w-full py-4 rounded-xl font-bold text-base transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#B8860B", color: "#0C0B0A" }}
            >
              Build My Command Centre →
            </BuyButton>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "How long does it take to get my command centre?",
              a: "You fill in the intake form (3 minutes), then your personalized system is generated and emailed to you within a few minutes. No waiting — it's automated.",
            },
            {
              q: "What if my business isn't started yet?",
              a: "This is built for that. The launch runway is designed to take you from zero to launch — the earlier you start using it, the more value you'll get.",
            },
            {
              q: "Is this a monthly subscription?",
              a: "No. $275 once. Your command centre link is yours forever. AI message packs are optional and cost $5 for 50 messages when you want them.",
            },
            {
              q: "What kind of businesses is this for?",
              a: "Handmade products, digital products, services, coaching, food & beverage, fashion, health & wellness, creative services — if you're building a side hustle, this is for you.",
            },
            {
              q: "What makes the AI coach different from ChatGPT?",
              a: "It already knows your business. Your business name, products, target audience, goals, and launch plan are baked into every response. You skip all the context-setting and get straight to useful advice.",
            },
            {
              q: "Can I share my offer card?",
              a: "Yes. Your offer builder includes a public share link — great for Instagram bios, DMs, or anywhere you want to show what you do.",
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              className="rounded-xl p-5 space-y-2"
              style={{ backgroundColor: "#141312", border: "1px solid #1F1E1C" }}
            >
              <p className="font-semibold text-sm" style={{ color: "#F5F0E8" }}>
                {q}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "#8A8478" }}>
                {a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="px-6 py-20 text-center"
        style={{ backgroundColor: "#141312", borderTop: "1px solid #1F1E1C" }}
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
            Your business deserves
            <br />
            <span style={{ color: "#B8860B" }}>a real system.</span>
          </h2>
          <p className="text-lg" style={{ color: "#8A8478" }}>
            Not another PDF. Not another course. A working command centre that
            knows your business and grows with you.
          </p>
          <BuyButton
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#B8860B", color: "#0C0B0A" }}
          >
            Build My Command Centre — $275
          </BuyButton>
          <p className="text-xs" style={{ color: "#4A4540" }}>
            Delivered by email · Private link · Works on any device
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-8"
        style={{ borderTop: "1px solid #1F1E1C" }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#B8860B" }} />
            <span className="text-xs" style={{ color: "#6B6560" }}>
              Side Hustle Command Centre by{" "}
              <a
                href="https://thesteadysystem.com"
                className="hover:underline"
                style={{ color: "#8A8478" }}
              >
                The Steady System
              </a>
            </span>
          </div>
          <div className="flex gap-6">
            <a href="/privacy" className="text-xs hover:underline" style={{ color: "#4A4540" }}>
              Privacy
            </a>
            <a href="/terms" className="text-xs hover:underline" style={{ color: "#4A4540" }}>
              Terms
            </a>
            <a
              href="mailto:hello@sidehustlecommandcentre.com"
              className="text-xs hover:underline"
              style={{ color: "#4A4540" }}
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
