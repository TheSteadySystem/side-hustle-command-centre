import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy · Side Hustle Command Centre",
};

const INK = "#1E1E24";
const STONE = "#E8E4DC";
const BRONZE = "#7f6720";
const SURFACE_HI = "#FBF7EC";
const BORDER = "rgba(30,30,36,0.10)";
const TEXT_BODY = "#3A3A44";
const TEXT_MUTED = "#6B6A75";
const TEXT_SUBTLE = "#908F99";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: STONE, color: INK }}>
      <nav
        className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BRONZE }} />
          <span className="font-semibold text-sm tracking-tight">Side Hustle Command Centre</span>
        </Link>
        <Link href="/" className="text-sm" style={{ color: TEXT_MUTED }}>
          ← Home
        </Link>
      </nav>

      <main className="px-6 py-16 max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: BRONZE }}>
          Privacy
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">Privacy Policy</h1>
        <div
          className="px-5 py-4 mb-10 rounded-xl text-sm"
          style={{ backgroundColor: SURFACE_HI, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${BRONZE}`, color: TEXT_BODY }}
        >
          <p>
            <strong>Last updated 2026-04-21.</strong> This policy is under legal review. If you have
            questions before it's finalized, email{" "}
            <a href="mailto:hello@thesteadysystem.com" style={{ color: BRONZE }} className="underline">
              hello@thesteadysystem.com
            </a>{" "}
            and I'll answer personally.
          </p>
        </div>

        <div className="space-y-8 text-base leading-relaxed" style={{ color: TEXT_BODY }}>
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: INK }}>
              Who I am
            </h2>
            <p>
              Side Hustle Command Centre is built and operated by Carley Bowyer (The Steady System),
              a sole proprietor based in Canada. You can reach me at{" "}
              <a href="mailto:hello@thesteadysystem.com" style={{ color: BRONZE }} className="underline">
                hello@thesteadysystem.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: INK }}>
              What I collect
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <strong>Your intake answers</strong> (business name, category, platforms, audience,
                goals, budget, launch date, experience level, brand color). You provide these on the
                intake form after purchase.
              </li>
              <li>
                <strong>Your email and name</strong>, so I can send your private workspace link and
                respond if you reply.
              </li>
              <li>
                <strong>Your payment identifier</strong> (Gumroad sale ID or Stripe session ID). I do
                not see or store your card details — those stay with the payment processor.
              </li>
              <li>
                <strong>Your workspace activity</strong> (tasks you complete, revenue entries you log,
                AI coach messages you send). This is what makes the product useful to you; it's stored
                so you can come back to it.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: INK }}>
              Who processes your data
            </h2>
            <p className="mb-3">
              I use a small set of trusted third-party services to run Side Hustle Command Centre.
              Your data may be processed by:
            </p>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <strong>Supabase</strong> — database hosting (your workspace lives here).
              </li>
              <li>
                <strong>Vercel</strong> — application hosting.
              </li>
              <li>
                <strong>Anthropic (Claude API)</strong> — the AI coach and content generator. Your
                business details and coach messages are sent to Anthropic to generate personalized
                responses. Anthropic does not use API inputs to train their models.
              </li>
              <li>
                <strong>Resend</strong> — transactional email delivery.
              </li>
              <li>
                <strong>Gumroad</strong> — primary payment processor.
              </li>
              <li>
                <strong>Stripe</strong> — alternate payment processor (used only for friends-and-family
                access).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: INK }}>
              How I use your data
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>To build and deliver your personalized command centre.</li>
              <li>To send you the welcome email and any transactional follow-ups.</li>
              <li>To respond to you when you reply or email me directly.</li>
              <li>
                To improve the product (in aggregate, and never by reading your data unless you
                explicitly ask me to help troubleshoot).
              </li>
            </ul>
            <p className="mt-3">I do not sell your data. I do not share it with advertisers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: INK }}>
              How long I keep it
            </h2>
            <p>
              Your workspace is yours as long as you want it. If you'd like me to delete your data,
              email me and I'll remove your workspace from the database within 7 days. Some records
              (payment confirmations, basic logs) may be retained for accounting and tax purposes as
              required by Canadian law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: INK }}>
              Your rights
            </h2>
            <p>
              You can request a copy of the data I hold about you, correct it, or have it deleted, at
              any time. Email{" "}
              <a href="mailto:hello@thesteadysystem.com" style={{ color: BRONZE }} className="underline">
                hello@thesteadysystem.com
              </a>{" "}
              with the subject line "Data request" and I'll respond within 7 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: INK }}>
              Cookies and tracking
            </h2>
            <p>
              Side Hustle Command Centre does not use advertising cookies or third-party analytics
              trackers. Your workspace uses a single access token stored in your browser so you can
              return without logging in.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: INK }}>
              Changes
            </h2>
            <p>
              If this policy changes materially, I'll update the date at the top and notify active
              buyers by email.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8" style={{ borderTop: `1px solid ${BORDER}` }}>
          <p className="text-xs" style={{ color: TEXT_SUBTLE }}>
            Side Hustle Command Centre by The Steady System.{" "}
            <Link href="/terms" className="hover:underline" style={{ color: TEXT_MUTED }}>
              Terms
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
