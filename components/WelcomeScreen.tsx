"use client";

import { useEffect, useState } from "react";
import { Workspace } from "@/lib/types";

interface Props {
  workspace: Workspace;
  onDismiss: () => void;
}

export default function WelcomeScreen({ workspace, onDismiss }: Props) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1600);
    const t3 = setTimeout(() => setPhase(3), 2600);
    const t4 = setTimeout(() => onDismiss(), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
      style={{ backgroundColor: "#0C0B0A" }}
      onClick={onDismiss}
    >
      <div className="text-center space-y-4 px-6">
        <p
          className="text-text-muted text-sm tracking-widest uppercase transition-all duration-700"
          style={{ opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "translateY(0)" : "translateY(8px)" }}
        >
          Your command centre is ready
        </p>

        <h1
          className="text-4xl sm:text-5xl font-bold tracking-tight text-text-primary transition-all duration-700"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(8px)",
            color: "var(--brand-color)",
          }}
        >
          {workspace.business_name}
        </h1>

        <p
          className="text-text-secondary text-lg transition-all duration-700"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? "translateY(0)" : "translateY(8px)",
          }}
        >
          {workspace.tagline}
        </p>
      </div>

      <p
        className="absolute bottom-8 text-text-subtle text-xs transition-all duration-700"
        style={{ opacity: phase >= 3 ? 1 : 0 }}
      >
        Tap anywhere to continue
      </p>
    </div>
  );
}
