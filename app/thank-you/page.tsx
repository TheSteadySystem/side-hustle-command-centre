import { stripe } from "@/lib/stripe";
import { verifyGumroadSale } from "@/lib/gumroad";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import IntakeForm from "@/components/IntakeForm";

export const dynamic = "force-dynamic";

interface Props {
  // Stripe flow: ?session_id=cs_xxx
  // Gumroad flow: ?sale_id=xxx (Gumroad's default redirect param)
  //              OR ?gumroad_sale_id=xxx (for manual testing)
  searchParams: {
    session_id?: string;
    sale_id?: string;
    gumroad_sale_id?: string;
  };
}

type Verification = {
  paid: boolean;
  email: string | null;
  name: string | null;
  stripeSessionId?: string;
  gumroadSaleId?: string;
};

async function verifyPayment(
  params: Props["searchParams"]
): Promise<Verification | null> {
  // Prefer Stripe if both somehow present (unlikely)
  if (params.session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(params.session_id);
      return {
        paid: session.payment_status === "paid",
        email: session.customer_details?.email ?? null,
        name: session.customer_details?.name ?? null,
        stripeSessionId: params.session_id,
      };
    } catch {
      return null;
    }
  }

  const saleId = params.sale_id || params.gumroad_sale_id;
  if (saleId) {
    try {
      const sale = await verifyGumroadSale(saleId);
      return {
        paid: sale.paid,
        email: sale.email,
        name: sale.name,
        gumroadSaleId: saleId,
      };
    } catch {
      return null;
    }
  }

  return null;
}

export default async function ThankYouPage({ searchParams }: Props) {
  const verification = await verifyPayment(searchParams);

  if (!verification) {
    return (
      <ErrorState message="No payment found. If you just purchased, check your email for the link or contact hello@thesteadysystem.com." />
    );
  }

  if (!verification.paid) {
    return (
      <ErrorState message="We couldn't verify your payment. If you were charged, please email hello@thesteadysystem.com and we'll get you set up right away." />
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#E8E4DC", color: "#1E1E24" }}
    >
      {/* Header */}
      <header
        className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto"
        style={{ borderBottom: "1px solid #D8D4C8" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#7f6720" }}
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
          style={{ backgroundColor: "rgba(127, 103, 32,0.15)" }}
        >
          <CheckCircle size={26} style={{ color: "#7f6720" }} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
          Payment received
          {verification.name ? `, ${verification.name.split(" ")[0]}` : ""}.
        </h1>
        <p
          className="mt-4 text-base sm:text-lg leading-relaxed max-w-xl mx-auto"
          style={{ color: "#3A3A44" }}
        >
          One more step: answer a few quick questions about your business so we
          can build your personalized command centre. Takes about 3 minutes.
        </p>
      </section>

      {/* Intake form */}
      <section className="px-4 pb-20 max-w-2xl mx-auto">
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            backgroundColor: "#F4F0E7",
            border: "1px solid #D8D4C8",
          }}
        >
          <IntakeForm
            stripeSessionId={verification.stripeSessionId}
            gumroadSaleId={verification.gumroadSaleId}
            defaultEmail={verification.email ?? ""}
            defaultName={verification.name ?? ""}
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
      style={{ backgroundColor: "#E8E4DC", color: "#1E1E24" }}
    >
      <div className="max-w-md text-center space-y-5">
        <h1 className="text-2xl font-bold">Hmm, something went wrong.</h1>
        <p style={{ color: "#6B6A75" }} className="leading-relaxed">
          {message}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
          style={{ backgroundColor: "#7f6720", color: "#E8E4DC" }}
        >
          Back to home
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
