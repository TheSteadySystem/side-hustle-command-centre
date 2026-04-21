import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("business_name, tagline")
    .eq("slug", params.slug)
    .single();

  if (!workspace) return {};

  return {
    title: `${workspace.business_name} · Side Hustle Command Centre`,
    description: workspace.tagline ?? "Built with Side Hustle Command Centre",
    openGraph: {
      title: workspace.business_name,
      description: workspace.tagline ?? "Built with Side Hustle Command Centre",
      images: ["/og-default.png"],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("business_name, tagline, business_type, platforms, brand_color, offer_card")
    .eq("slug", params.slug)
    .single();

  if (!workspace) notFound();

  const offerCard = workspace.offer_card ?? {};
  const platforms = workspace.platforms ?? [];
  const brandColor = workspace.brand_color ?? "#7f6720";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ backgroundColor: "#E8E4DC" }}
    >
      {/* Offer Card */}
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#F4F0E7",
          border: `1px solid ${brandColor}40`,
        }}
      >
        {/* Header bar */}
        <div style={{ backgroundColor: brandColor, height: "6px" }} />

        <div className="p-8 space-y-6">
          {/* Business name */}
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: "#1E1E24" }}
            >
              {offerCard.headline ?? workspace.business_name}
            </h1>
            <p className="mt-2 text-lg" style={{ color: "#3A3A44" }}>
              {offerCard.tagline ?? workspace.tagline}
            </p>
          </div>

          <hr style={{ borderColor: "#D8D4C8" }} />

          {/* Details */}
          <div className="space-y-3">
            <div>
              <span className="text-xs uppercase tracking-widest" style={{ color: "#6B6A75" }}>
                What we do
              </span>
              <p className="mt-1" style={{ color: "#3A3A44" }}>
                {offerCard.what ?? workspace.business_type}
              </p>
            </div>
            {platforms.length > 0 && (
              <div>
                <span className="text-xs uppercase tracking-widest" style={{ color: "#6B6A75" }}>
                  Find us on
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {platforms.map((p: string) => (
                    <span
                      key={p}
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${brandColor}20`,
                        color: brandColor,
                        border: `1px solid ${brandColor}40`,
                      }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <hr style={{ borderColor: "#D8D4C8" }} />

          {/* Watermark */}
          <p className="text-xs text-center" style={{ color: "#B0AFB8" }}>
            Built with Side Hustle Command Centre
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center space-y-3">
        <p style={{ color: "#6B6A75" }} className="text-sm">
          Want a personalized command centre like this?
        </p>
        <Link
          href={process.env.NEXT_PUBLIC_APP_URL ?? "https://sidehustlecommandcentre.com"}
          className="inline-block px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: brandColor, color: "#E8E4DC" }}
        >
          Get Your Command Centre · $117
        </Link>
      </div>
    </div>
  );
}
