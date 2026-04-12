import { stripe } from "@/lib/stripe";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

// Tally intake form — pre-fills buyer_email and carries session_id
// through to /api/intake so we can verify payment server-side.
const TALLY_FORM_ID = "rjd0lv";

interface Props {
  searchParams: { session_id?: string };
}

async function verifyPayment(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      paid: session.payment_status === "paid",
      email: session.customer_details?.email ?? null,
      name: session.customer_details?.name ?? null,
      sessionId,
    };
  } catch {
    return { paid: false, email: null, name: null, sessionId };
  }
}

export default async function ThankYouPage({ searchParams }: Props) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    return (
      <ErrorState
        message="No session ID found. If you just purchased, check your email for the link."
      />
    );
  }

  const { paid, email, name } = await verifyPayment(sessionId);

  if (!paid) {
    return (
      <ErrorState
        message="We couldn't verify your payment. If you were charged, please email hello@thesteadysystem.com and we'll get you set up right away."
      />
    );
  }

  // Build Tally URL with session_id + email pre-filled.
  // Tally accepts query params matching field labels.
  const tallyUrl = new URL(`https://tally.so/r/${TALLY_FORM_ID}`);
  tallyUrl.searchParams.set("session_id", sessionId);
  if (email) tallyUrl.searchParams.set("email", email);
  if (name) tallyUrl.searchParams.set("name", name);
  // Transparent header + alignLeft for cleaner embed
  tallyUrl.searchParams.set("transparentBackground", "1");
  tallyUrl.searchParams.set("hideTitle", "1");

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0C0B0A", color: "#F5F0E8" }}
    >
      {/* Header */}
      <header
        className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto"
        style={{ borderBottom: "1px solid #1F1E1C" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#B8860B" }}
          />
          <span className="font-semibold text-sm tracking-tight">
            Side Hustle Command Centre
          </span>
        </div>
      </header>

      {/* Confirmation banner */}
      <section className="px-6 py-12 max-w-2xl mx-auto text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: "rgba(184,134,11,0.15)" }}
        >
          <CheckCircle size={26} style={{ color: "#B8860B" }} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
          Payment received{name ? `, ${name.split(" ")[0]}` : ""}.
        </h1>
        <p
          className="mt-4 text-base sm:text-lg leading-relaxed max-w-xl mx-auto"
          style={{ color: "#D4CFC6" }}
        >
          One more step: answer 13 quick questions about your business so we
          can build your personalized command centre. Takes about 3 minutes.
        </p>
        <p
          className="mt-2 text-sm"
          style={{ color: "#6B6560" }}
        >
          Your command centre will be emailed to{" "}
          <span style={{ color: "#B8860B" }}>{email}</span>{" "}
          the moment you finish.
        </p>
      </section>

      {/* Embedded Tally form */}
      <section className="px-4 pb-20 max-w-3xl mx-auto">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "#141312",
            border: "1px solid #1F1E1C",
          }}
        >
          <iframe
            src={tallyUrl.toString()}
            width="100%"
            height="900"
            frameBorder="0"
            title="Side Hustle Command Centre — Intake"
            style={{ backgroundColor: "transparent" }}
          />
        </div>
      </section>

      {/* Fallback link */}
      <section className="px-6 pb-16 text-center">
        <p className="text-xs" style={{ color: "#4A4540" }}>
          Having trouble with the form?{" "}
          <a
            href={tallyUrl.toString()}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#B8860B" }}
            className="hover:underline"
          >
            Open it in a new tab →
          </a>
        </p>
      </section>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#0C0B0A", color: "#F5F0E8" }}
    >
      <div className="max-w-md text-center space-y-5">
        <h1 className="text-2xl font-bold">Hmm, something went wrong.</h1>
        <p style={{ color: "#8A8478" }} className="leading-relaxed">
          {message}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
          style={{ backgroundColor: "#B8860B", color: "#0C0B0A" }}
        >
          Back to home
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
