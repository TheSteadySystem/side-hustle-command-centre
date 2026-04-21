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
      style={{ backgroundColor: "#E8E4DC", color: "#1E1E24" }}
    >
      <div className="max-w-md text-center space-y-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: "rgba(127, 103, 32,0.15)" }}
        >
          <MailCheck size={32} style={{ color: "#7f6720" }} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Your command centre is ready.</h1>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "#3A3A44" }}>
            Check your inbox. We just sent you a private link from{" "}
            <span style={{ color: "#7f6720" }}>hello@thesteadysystem.com</span>.
          </p>
          <p className="mt-3 text-sm" style={{ color: "#6B6A75" }}>
            Don&apos;t see it? Check your Promotions or Spam folder and drag it
            to Primary so you can always find it.
          </p>
        </div>

        {slug && (
          <div
            className="p-4 rounded-xl text-left"
            style={{
              backgroundColor: "#F4F0E7",
              border: "1px solid #D8D4C8",
            }}
          >
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#908F99" }}>
              Your workspace ID
            </p>
            <p className="font-mono text-sm" style={{ color: "#3A3A44" }}>
              {slug}
            </p>
          </div>
        )}

        <p className="text-xs" style={{ color: "#B0AFB8" }}>
          Having trouble? Email{" "}
          <a
            href="mailto:hello@thesteadysystem.com"
            style={{ color: "#7f6720" }}
            className="hover:underline"
          >
            hello@thesteadysystem.com
          </a>{" "}
          and we&apos;ll fix it within a few hours.
        </p>

        <Link
          href="/"
          className="inline-block text-xs"
          style={{ color: "#908F99" }}
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
