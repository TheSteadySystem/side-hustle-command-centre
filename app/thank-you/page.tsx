import { stripe } from "@/lib/stripe";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import IntakeForm from "@/components/IntakeForm";

export const dynamic = "force-dynamic";

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
    };
  } catch {
    return { paid: false, email: null, name: null };
  }
}

export default async function ThankYouPage({ searchParams }: Props) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    return (
      <ErrorState message="No session ID found. If you just purchased, check your email for the link or contact hello@thesteadysystem.com." />
    );
  }

  const { paid, email, name } = await verifyPayment(sessionId);

  if (!paid) {
    return (
      <ErrorState message="We couldn't verify your payment. If you were charged, please email hello@thesteadysystem.com and we'll get you set up right away." />
    );
  }

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
      <section className="px-6 pt-12 pb-6 max-w-2xl mx-auto text-center">
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
          One more step: answer a few quick questions about your business so we
          can build your personalized command centre. Takes about 3 minutes.
        </p>
      </section>

      {/* Custom intake form (replaces Tally iframe) */}
      <section className="px-4 pb-20 max-w-2xl mx-auto">
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            backgroundColor: "#141312",
            border: "1px solid #1F1E1C",
          }}
        >
          <IntakeForm
            sessionId={sessionId}
            defaultEmail={email ?? ""}
            defaultName={name ?? ""}
          />
        </div>
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
