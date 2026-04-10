import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Side Hustle Command Centre",
  description:
    "Your personalized AI-powered business launch system. Built around your business, your goals, your timeline.",
  openGraph: {
    title: "Side Hustle Command Centre",
    description:
      "Your personalized AI-powered business launch system. Built around your business, your goals, your timeline.",
    images: ["/og-default.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Side Hustle Command Centre",
    description: "Your personalized AI-powered business launch system.",
    images: ["/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg-primary text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
