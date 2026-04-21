"use client";

import { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";

interface Props {
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
  showArrow?: boolean;
}

// Primary buy button: routes the buyer to the Gumroad product page.
// Gumroad handles payment, sends a Ping webhook to /api/gumroad/webhook,
// and our webhook emails the buyer a magic link to /thank-you where they
// fill the intake form and their workspace is built.
const GUMROAD_URL =
  process.env.NEXT_PUBLIC_GUMROAD_URL ??
  "https://steadysoul7.gumroad.com/l/gyzjep";

export default function BuyButton({
  className = "",
  style,
  children,
  showArrow = true,
}: Props) {
  return (
    <a
      href={GUMROAD_URL}
      className={className}
      style={style}
      rel="noopener"
    >
      {children}
      {showArrow && <ArrowRight size={18} />}
    </a>
  );
}
