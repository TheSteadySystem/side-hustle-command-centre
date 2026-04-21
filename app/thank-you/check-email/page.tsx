import Link from "next/link";
import { MailCheck } from "lucide-react";

interface Props {
  searchParams: { slug?: string };
}

export default function CheckEmailPage({ searchParams }: Props) {
  const slug = searchParams.slug;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#0C0B0A", color: "#F5F0E8" }}
    >
      <div className="max-w-md text-center space-y-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: "rgba(184,134,11,0.15)" }}
        >
          <MailCheck size={32} style={{ color: "#B8860B" }} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Your command centre is ready.</h1>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "#D4CFC6" }}>
            Check your inbox. We just sent you a private link from{" "}
            <span style={{ color: "#B8860B" }}>hello@thesteadysystem.com</span>.
          </p>
          <p className="mt-3 text-sm" style={{ color: "#8A8478" }}>
            Don&apos;t see it? Check your Promotions or Spam folder and drag it
            to Primary so you can always find it.
          </p>
        </div>

        {slug && (
          <div
            className="p-4 rounded-xl text-left"
            style={{
              backgroundColor: "#141312",
              border: "1px solid #1F1E1C",
            }}
          >
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#6B6560" }}>
              Your workspace ID
            </p>
            <p className="font-mono text-sm" style={{ color: "#D4CFC6" }}>
              {slug}
            </p>
          </div>
        )}

        <p className="text-xs" style={{ color: "#4A4540" }}>
          Having trouble? Email{" "}
          <a
            href="mailto:hello@thesteadysystem.com"
            style={{ color: "#B8860B" }}
            className="hover:underline"
          >
            hello@thesteadysystem.com
          </a>{" "}
          and we&apos;ll fix it within a few hours.
        </p>

        <Link
          href="/"
          className="inline-block text-xs"
          style={{ color: "#6B6560" }}
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
