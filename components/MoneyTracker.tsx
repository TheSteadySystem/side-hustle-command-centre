"use client";

import { useState } from "react";
import { Workspace, RevenueEntry, StartupCost } from "@/lib/types";
import {
  formatCurrency,
  getTotalRevenue,
  getTotalExpenses,
} from "@/lib/utils";
import { Plus, TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  workspace: Workspace;
  updateWorkspace: (field: string, value: unknown) => Promise<void>;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4 space-y-2"
      style={{
        backgroundColor: "#141312",
        border: accent ? "1px solid var(--brand-color)" : "1px solid #1F1E1C",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-text-subtle text-xs uppercase tracking-widest">{label}</span>
        <Icon
          size={15}
          style={{ color: accent ? "var(--brand-color)" : "#6B6560" }}
        />
      </div>
      <p
        className="text-xl font-bold"
        style={{ color: accent ? "var(--brand-color)" : "#F5F0E8" }}
      >
        {value}
      </p>
      {sub && <p className="text-text-subtle text-xs">{sub}</p>}
    </div>
  );
}

export default function MoneyTracker({ workspace, updateWorkspace }: Props) {
  const entries: RevenueEntry[] = workspace.revenue_entries ?? [];
  const startupCosts: StartupCost[] =
    (workspace.runway_state?.startup_costs as StartupCost[]) ?? [];

  const totalRevenue = getTotalRevenue(entries);
  const totalExpenses = getTotalExpenses(entries);
  const budget = workspace.startup_budget ?? 0;
  const goal = workspace.monthly_revenue_goal ?? 0;

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "income" as "income" | "expense",
  });
  const [saving, setSaving] = useState(false);

  const addEntry = async () => {
    if (!form.description || !form.amount) return;
    setSaving(true);
    const newEntry: RevenueEntry = {
      id: Math.random().toString(36).substring(2),
      date: form.date,
      description: form.description,
      amount: parseFloat(form.amount),
      type: form.type,
    };
    const newEntries = [...entries, newEntry];
    await updateWorkspace("revenue_entries", newEntries);

    // Check first sale milestone
    if (
      form.type === "income" &&
      !workspace.milestones?.includes("first_sale")
    ) {
      const milestones = [...(workspace.milestones ?? []), "first_sale"];
      await updateWorkspace("milestones", milestones);
    }
    // Check goal hit
    const newRevenue = getTotalRevenue(newEntries);
    if (newRevenue >= goal && !workspace.milestones?.includes("goal_hit")) {
      const milestones = [...(workspace.milestones ?? []), "goal_hit"];
      await updateWorkspace("milestones", milestones);
    }

    setForm({
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      type: "income",
    });
    setShowForm(false);
    setSaving(false);
  };

  // Build chart data: group entries by month
  const chartData = buildChartData(entries, goal);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-text-primary text-xl font-bold">Money Tracker</h2>
        <p className="text-text-muted text-sm mt-1">
          Revenue, expenses, and progress toward your goal
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Revenue"
          value={formatCurrency(totalRevenue)}
          sub={`Goal: ${formatCurrency(goal)}`}
          icon={TrendingUp}
          accent
        />
        <StatCard
          label="Expenses"
          value={formatCurrency(totalExpenses)}
          sub="total spent"
          icon={TrendingDown}
        />
        <StatCard
          label="Startup Budget"
          value={formatCurrency(budget)}
          sub={`${formatCurrency(Math.max(0, budget - totalExpenses))} remaining`}
          icon={DollarSign}
        />
        <StatCard
          label="Monthly Goal"
          value={`${goal > 0 ? Math.round((totalRevenue / goal) * 100) : 0}%`}
          sub={formatCurrency(goal)}
          icon={Target}
        />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: "#141312", border: "1px solid #1F1E1C" }}
        >
          <p className="text-text-muted text-xs uppercase tracking-widest mb-4">
            Revenue vs Goal
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barGap={4}>
              <XAxis
                dataKey="month"
                tick={{ fill: "#6B6560", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1918",
                  border: "1px solid #2A2825",
                  borderRadius: "8px",
                  color: "#F5F0E8",
                  fontSize: "12px",
                }}
                formatter={(v) => formatCurrency(Number(v))}
              />
              <Bar dataKey="revenue" fill="var(--brand-color)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="goal" fill="#2A2825" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Startup cost breakdown */}
      {startupCosts.length > 0 && (
        <div
          className="rounded-xl p-5 space-y-3"
          style={{ backgroundColor: "#141312", border: "1px solid #1F1E1C" }}
        >
          <p className="text-text-muted text-xs uppercase tracking-widest">
            Startup Cost Breakdown
          </p>
          {startupCosts.map((cost, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">{cost.name}</span>
              <span className="text-text-primary text-sm font-medium">
                {formatCurrency(cost.amount)}
              </span>
            </div>
          ))}
          <div
            className="flex items-center justify-between pt-2"
            style={{ borderTop: "1px solid #1F1E1C" }}
          >
            <span className="text-text-muted text-sm font-medium">Total</span>
            <span className="font-bold" style={{ color: "var(--brand-color)" }}>
              {formatCurrency(
                startupCosts.reduce((s, c) => s + (c.amount ?? 0), 0)
              )}
            </span>
          </div>
        </div>
      )}

      {/* Revenue entries */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: "#141312", border: "1px solid #1F1E1C" }}
      >
        <div className="px-5 py-4 flex items-center justify-between">
          <p className="text-text-muted text-xs uppercase tracking-widest">
            Transactions
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--brand-color-20)",
              color: "var(--brand-color)",
              border: "1px solid var(--brand-color)",
            }}
          >
            <Plus size={12} />
            Add entry
          </button>
        </div>

        {showForm && (
          <div
            className="px-5 pb-4 space-y-3"
            style={{ borderTop: "1px solid #1F1E1C" }}
          >
            <div className="pt-3 grid grid-cols-2 gap-3">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="col-span-1 px-3 py-2 rounded-lg text-sm text-text-primary"
                style={{ backgroundColor: "#1A1918", border: "1px solid #2A2825" }}
              />
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as "income" | "expense" })
                }
                className="col-span-1 px-3 py-2 rounded-lg text-sm text-text-primary"
                style={{ backgroundColor: "#1A1918", border: "1px solid #2A2825" }}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm text-text-primary placeholder:text-text-ghost"
              style={{ backgroundColor: "#1A1918", border: "1px solid #2A2825" }}
            />
            <input
              type="number"
              placeholder="Amount (e.g. 150)"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm text-text-primary placeholder:text-text-ghost"
              style={{ backgroundColor: "#1A1918", border: "1px solid #2A2825" }}
            />
            <div className="flex gap-2">
              <button
                onClick={addEntry}
                disabled={saving || !form.description || !form.amount}
                className="flex-1 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: "var(--brand-color)", color: "#0C0B0A" }}
              >
                {saving ? "Saving..." : "Save Entry"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="px-5 pb-6 text-center">
            <p className="text-text-subtle text-sm">
              Your first sale will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#1F1E1C" }}>
            {[...entries]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((entry) => (
                <div key={entry.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">{entry.description}</p>
                    <p className="text-text-subtle text-xs mt-0.5">{entry.date}</p>
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color:
                        entry.type === "income" ? "var(--brand-color)" : "#8A8478",
                    }}
                  >
                    {entry.type === "income" ? "+" : "-"}
                    {formatCurrency(entry.amount)}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function buildChartData(entries: RevenueEntry[], goal: number) {
  const byMonth: Record<string, number> = {};
  entries
    .filter((e) => e.type === "income")
    .forEach((e) => {
      const month = e.date.substring(0, 7); // "2025-01"
      byMonth[month] = (byMonth[month] ?? 0) + e.amount;
    });
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", {
        month: "short",
      }),
      revenue,
      goal,
    }));
}
