"use client";

import { LayoutDashboard, CheckSquare, DollarSign, Calendar, Zap, MessageCircle, Users } from "lucide-react";

type Tab = "dashboard" | "runway" | "customers" | "money" | "content" | "offer" | "coach";

const TABS: { id: Tab; label: string; icon: React.ElementType; shortLabel: string }[] = [
  { id: "dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { id: "runway", label: "Launch Runway", shortLabel: "Runway", icon: CheckSquare },
  { id: "customers", label: "First Customers", shortLabel: "Customers", icon: Users },
  { id: "money", label: "Money", shortLabel: "Money", icon: DollarSign },
  { id: "content", label: "Content Engine", shortLabel: "Content", icon: Calendar },
  { id: "offer", label: "Offer Builder", shortLabel: "Offer", icon: Zap },
  { id: "coach", label: "AI Coach", shortLabel: "Coach", icon: MessageCircle },
];

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  businessName: string;
}

export default function Navigation({ activeTab, onTabChange, businessName }: Props) {
  return (
    <header className="sticky top-0 z-40" style={{ backgroundColor: "#0F0E0D", borderBottom: "1px solid #1F1E1C" }}>
      {/* Top bar */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "var(--brand-color)" }}
          />
          <span className="text-text-primary font-semibold text-sm truncate max-w-[180px] sm:max-w-none">
            {businessName}
          </span>
        </div>
        <span className="text-text-subtle text-xs hidden sm:block">Side Hustle Command Centre</span>
      </div>

      {/* Tab bar */}
      <nav className="px-4 sm:px-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 max-w-5xl mx-auto min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap"
                style={{
                  color: isActive ? "var(--brand-color)" : "#6B6560",
                  borderBottom: isActive ? `2px solid var(--brand-color)` : "2px solid transparent",
                  backgroundColor: isActive ? "var(--brand-color-10)" : "transparent",
                }}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
