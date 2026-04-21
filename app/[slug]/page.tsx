"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Workspace } from "@/lib/types";
import WelcomeScreen from "@/components/WelcomeScreen";
import Navigation from "@/components/Navigation";
import MessagePackModal from "@/components/MessagePackModal";
import Dashboard from "@/components/Dashboard";
import LaunchRunway from "@/components/LaunchRunway";
import MoneyTracker from "@/components/MoneyTracker";
import ContentEngine from "@/components/ContentEngine";
import OfferBuilder from "@/components/OfferBuilder";
import AICoach from "@/components/AICoach";
import FirstCustomers from "@/components/FirstCustomers";
import FloatingCoach from "@/components/FloatingCoach";

type Tab =
  | "dashboard"
  | "runway"
  | "customers"
  | "money"
  | "content"
  | "offer"
  | "coach";

const TOKEN_KEY = "shcc_token";

export default function WorkspacePage({
  params,
}: {
  params: { slug: string };
}) {
  const searchParams = useSearchParams();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [showWelcome, setShowWelcome] = useState(false);
  const [messagePackOpen, setMessagePackOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const setBrandColors = useCallback((brandColor: string) => {
    const hex = (brandColor ?? "#7f6720").replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    document.documentElement.style.setProperty("--brand-color", brandColor);
    document.documentElement.style.setProperty("--brand-color-10", `rgba(${r}, ${g}, ${b}, 0.1)`);
    document.documentElement.style.setProperty("--brand-color-20", `rgba(${r}, ${g}, ${b}, 0.2)`);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    document.documentElement.style.setProperty("--brand-text-on-brand", luminance > 0.5 ? "#1E1E24" : "#E8E4DC");
  }, []);

  const runGeneration = useCallback(async (token: string) => {
    setGenerating(true);
    setGenerationError(null);
    try {
      const genRes = await fetch("/api/workspace/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: token }),
      });
      const genData = await genRes.json();

      if (!genRes.ok || !genData.success) {
        throw new Error(
          genData.error ??
            "Couldn't generate your plan. Tap Generate to try again."
        );
      }

      setWorkspace((prev) =>
        prev
          ? {
              ...prev,
              runway_state: genData.runway_state ?? prev.runway_state,
              content_state: genData.content_state ?? prev.content_state,
              offer_card: genData.offer_card ?? prev.offer_card,
            }
          : prev
      );
    } catch (err) {
      setGenerationError(
        err instanceof Error
          ? err.message
          : "Generation failed. Tap Generate to try again."
      );
    } finally {
      setGenerating(false);
    }
  }, []);

  const generateContent = useCallback(async () => {
    const token =
      searchParams.get("t") ?? localStorage.getItem(TOKEN_KEY) ?? "";
    if (!token) return;
    await runGeneration(token);
  }, [searchParams, runGeneration]);

  const fetchWorkspace = useCallback(
    async (token: string) => {
      try {
        const res = await fetch(`/api/workspace/${token}`);
        if (!res.ok) throw new Error("Workspace not found");
        const data: Workspace = await res.json();
        setWorkspace(data);
        setBrandColors(data.brand_color ?? "#7f6720");

        // Auto-trigger generation on first load if needed
        if (data.runway_state?.needs_generation) {
          await runGeneration(token);
        }
      } catch {
        setError("We couldn't find your workspace. Please check your link.");
      } finally {
        setLoading(false);
      }
    },
    [setBrandColors, runGeneration]
  );

  useEffect(() => {
    // Get token from URL param or localStorage
    const urlToken = searchParams.get("t");
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const token = urlToken ?? storedToken;

    if (!token) {
      setError("No access token found. Please use the link from your email.");
      setLoading(false);
      return;
    }

    // Persist token for bookmark-without-param access
    if (urlToken) {
      localStorage.setItem(TOKEN_KEY, urlToken);
    }

    fetchWorkspace(token);

    // Show welcome screen on first visit
    const visitKey = `shcc_visited_${params.slug}`;
    if (!localStorage.getItem(visitKey)) {
      setShowWelcome(true);
      localStorage.setItem(visitKey, "1");
    }
  }, [searchParams, params.slug, fetchWorkspace]);

  // Handle refilled=true param from Stripe success
  useEffect(() => {
    if (searchParams.get("refilled") === "true") {
      const token = searchParams.get("t") ?? localStorage.getItem(TOKEN_KEY);
      if (token) fetchWorkspace(token);
    }
  }, [searchParams, fetchWorkspace]);

  const updateWorkspace = useCallback(
    async (field: string, value: unknown) => {
      const token =
        searchParams.get("t") ?? localStorage.getItem(TOKEN_KEY) ?? "";
      const res = await fetch("/api/workspace/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: token, field, value }),
      });
      if (res.ok && workspace) {
        setWorkspace({ ...workspace, [field]: value });
      }
    },
    [workspace, searchParams]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto"
            style={{ borderColor: "var(--brand-color)", borderTopColor: "transparent" }}
          />
          <p className="text-text-muted text-sm">Loading your command centre...</p>
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-text-primary text-lg font-medium">
            {error ?? "Something went wrong."}
          </p>
          <p className="text-text-muted text-sm">
            Check the link in your welcome email, or contact{" "}
            <a
              href="mailto:hello@sidehustlecommandcentre.com"
              className="underline brand-text"
            >
              hello@sidehustlecommandcentre.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  const token =
    searchParams.get("t") ?? localStorage.getItem(TOKEN_KEY) ?? "";

  return (
    <>
      {showWelcome && (
        <WelcomeScreen
          workspace={workspace}
          onDismiss={() => setShowWelcome(false)}
        />
      )}

      <div className="min-h-screen flex flex-col">
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          businessName={workspace.business_name}
        />

        {generating && <GeneratingBanner />}

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto w-full">
          {activeTab === "dashboard" && (
            <Dashboard workspace={workspace} onTabChange={setActiveTab} />
          )}
          {activeTab === "runway" && (
            <LaunchRunway
              workspace={workspace}
              updateWorkspace={updateWorkspace}
              onGenerate={generateContent}
              isGenerating={generating}
              generationError={generationError}
            />
          )}
          {activeTab === "customers" && (
            <FirstCustomers
              workspace={workspace}
              updateWorkspace={updateWorkspace}
              onGenerate={generateContent}
              isGenerating={generating}
              generationError={generationError}
            />
          )}
          {activeTab === "money" && (
            <MoneyTracker
              workspace={workspace}
              updateWorkspace={updateWorkspace}
            />
          )}
          {activeTab === "content" && (
            <ContentEngine
              workspace={workspace}
              updateWorkspace={updateWorkspace}
              onGenerate={generateContent}
              isGenerating={generating}
              generationError={generationError}
            />
          )}
          {activeTab === "offer" && (
            <OfferBuilder workspace={workspace} updateWorkspace={updateWorkspace} />
          )}
          {activeTab === "coach" && (
            <AICoach
              workspace={workspace}
              token={token}
              onOpenMessagePack={() => setMessagePackOpen(true)}
            />
          )}
        </main>

        <footer
          className="px-4 sm:px-6 lg:px-8 py-6 text-center"
          style={{ borderTop: "1px solid var(--border, rgba(30,30,36,0.10))" }}
        >
          <p className="text-[11px] leading-relaxed text-text-subtle max-w-2xl mx-auto">
            Content in this workspace is AI-generated and may contain errors. Review everything
            before publishing or acting on it. Not a substitute for legal, financial, or tax
            advice. See{" "}
            <a href="/terms" target="_blank" rel="noopener" className="underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" target="_blank" rel="noopener" className="underline">
              Privacy
            </a>
            .
          </p>
        </footer>
      </div>

      {messagePackOpen && (
        <MessagePackModal
          token={token}
          onClose={() => setMessagePackOpen(false)}
        />
      )}

      <FloatingCoach
        workspace={workspace}
        token={token}
        onOpenMessagePack={() => setMessagePackOpen(true)}
        tabContext={TAB_LABELS[activeTab]}
        hidden={activeTab === "coach"}
      />
    </>
  );
}

const TAB_LABELS: Record<Tab, string> = {
  dashboard: "Dashboard: your overall progress and focus items",
  runway: "Launch Runway: the 4-phase launch plan",
  customers: "First 10 Customers: specific outreach steps",
  money: "Money Tracker: revenue and startup costs",
  content: "Content Engine: 30-day content calendar",
  offer: "Offer Builder: shareable business card and pricing",
  coach: "AI Coach",
};

// ---------------------------------------------------------------------------
// Banner shown at top of workspace while content generates in the background
// ---------------------------------------------------------------------------
const GENERATING_MESSAGES = [
  "Building your launch runway...",
  "Creating your 30-day content plan...",
  "Finding your first 10 customers...",
  "Setting up your pricing guide...",
  "Preparing your weekly plan...",
  "Almost ready...",
];

function GeneratingBanner() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % GENERATING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="px-4 py-3 flex items-center justify-center gap-3"
      style={{ backgroundColor: "var(--brand-color-10)", borderBottom: "1px solid var(--brand-color)" }}
    >
      <div
        className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0"
        style={{ borderColor: "var(--brand-color)", borderTopColor: "transparent" }}
      />
      <p className="text-sm font-medium" style={{ color: "var(--brand-color)" }} key={msgIndex}>
        {GENERATING_MESSAGES[msgIndex]}
      </p>
    </div>
  );
}
