"use client";

import { useState, CSSProperties } from "react";
import { ArrowRight } from "lucide-react";

interface Props {
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
  showArrow?: boolean;
}

export default function BuyButton({
  className = "",
  style,
  children,
  showArrow = true,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-main-checkout", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(
          "Sorry, we couldn't start checkout. Please try again or email hello@thesteadysystem.com."
        );
        setLoading(false);
      }
    } catch {
      alert("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
      style={{ cursor: loading ? "wait" : "pointer", ...style }}
    >
      {loading ? "Loading…" : children}
      {showArrow && !loading && <ArrowRight size={18} />}
    </button>
  );
}
