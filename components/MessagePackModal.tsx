"use client";

import { useState } from "react";
import { X, Zap } from "lucide-react";

interface Props {
  token: string;
  onClose: () => void;
}

export default function MessagePackModal({ token, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: token }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError("Couldn't start checkout. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(12, 11, 10, 0.85)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 space-y-5"
        style={{ backgroundColor: "#141312", border: "1px solid #2A2825" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--brand-color-20)" }}
          >
            <Zap size={20} style={{ color: "var(--brand-color)" }} />
          </div>
          <button
            onClick={onClose}
            className="text-text-subtle hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <h3 className="text-text-primary text-lg font-bold">
            You&apos;ve used all 50 messages
          </h3>
          <p className="text-text-muted text-sm leading-relaxed">
            Your AI coach still knows everything about your business. Get 50
            more messages and keep the momentum going.
          </p>
        </div>

        {/* Pricing */}
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{ backgroundColor: "#1A1918", border: "1px solid #2A2825" }}
        >
          <div>
            <p className="text-text-primary font-semibold">50 AI Messages</p>
            <p className="text-text-subtle text-xs mt-0.5">One-time, no subscription</p>
          </div>
          <span className="text-2xl font-bold" style={{ color: "var(--brand-color)" }}>
            $5
          </span>
        </div>

        {error && (
          <p className="text-xs text-center" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleBuy}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--brand-color)", color: "#0C0B0A" }}
          >
            {loading ? "Opening checkout..." : "Buy Messages — $5"}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
