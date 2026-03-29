"use client";

import { useState } from "react";
import { CreditCard, AlertCircle, Clock, CheckCircle2, Bell, Plus, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const payments = [
  { id: 1, client: "Priya Sharma", property: "Prestige Skyline", amount: "₹24,00,000", rawAmount: 2400000, due: "Mar 15, 2026", status: "overdue", type: "Token Amount", daysOverdue: 14 },
  { id: 2, client: "Kavita Joshi", property: "The Grand Palms", amount: "₹52,00,000", rawAmount: 5200000, due: "Mar 20, 2026", status: "overdue", type: "1st Instalment", daysOverdue: 9 },
  { id: 3, client: "Pooja Nair", property: "Green Valley Villa", amount: "₹38,00,000", rawAmount: 3800000, due: "Mar 28, 2026", status: "overdue", type: "Booking Amount", daysOverdue: 1 },
  { id: 4, client: "Deepak Gupta", property: "Sunrise Heights", amount: "₹6,50,000", rawAmount: 650000, due: "Apr 5, 2026", status: "upcoming", type: "Token Amount", daysOverdue: -7 },
  { id: 5, client: "Rahul Mehta", property: "Horizon Residency", amount: "₹16,00,000", rawAmount: 1600000, due: "Apr 10, 2026", status: "upcoming", type: "Registration Fee", daysOverdue: -12 },
  { id: 6, client: "Amit Verma", property: "Metro Suites", amount: "₹4,50,000", rawAmount: 450000, due: "Apr 15, 2026", status: "scheduled", type: "Agreement Amount", daysOverdue: -17 },
  { id: 7, client: "Sunita Patel", property: "Commercial Space", amount: "₹1,20,000", rawAmount: 120000, due: "Apr 20, 2026", status: "scheduled", type: "Consultation Fee", daysOverdue: -22 },
  { id: 8, client: "Ravi Malhotra", property: "Prestige Skyline", amount: "₹12,00,000", rawAmount: 1200000, due: "Apr 25, 2026", status: "scheduled", type: "2nd Instalment", daysOverdue: -27 },
];

const collectionData = [
  { month: "Oct", collected: 42, target: 50 },
  { month: "Nov", collected: 58, target: 55 },
  { month: "Dec", collected: 75, target: 65 },
  { month: "Jan", collected: 48, target: 60 },
  { month: "Feb", collected: 52, target: 58 },
  { month: "Mar", collected: 62, target: 65 },
];

const statusConfig: Record<string, { icon: React.ElementType; className: string; bgClassName: string; label: string }> = {
  overdue: { icon: AlertCircle, className: "text-red-400 bg-red-950/50", bgClassName: "bg-red-950/30", label: "Overdue" },
  upcoming: { icon: Clock, className: "text-amber-400 bg-amber-950/50", bgClassName: "bg-amber-950/20", label: "Due Soon" },
  scheduled: { icon: CheckCircle2, className: "text-blue-400 bg-blue-950/50", bgClassName: "bg-blue-950/20", label: "Upcoming" },
};

export default function PaymentsPage() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? payments : payments.filter((p) => p.status === filter);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Receivable", value: "₹1.8Cr", sub: "12 payments pending" },
          { label: "Overdue", value: "₹34L", sub: "3 overdue payments", className: "text-red-400" },
          { label: "Due This Month", value: "₹1.14Cr", sub: "Next 30 days", className: "text-amber-400" },
          { label: "Collected (Mar)", value: "₹62L", sub: "+18% vs last month", className: "text-green-400" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-2xl font-medium tracking-tight ${s.className || "text-foreground"}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Collection vs Target</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md">in Lakhs ₹</span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={collectionData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="month" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="target" fill="rgba(255,255,255,0.08)" radius={[3, 3, 0, 0]} name="Target" />
            <Bar dataKey="collected" fill="rgba(255,255,255,0.5)" radius={[3, 3, 0, 0]} name="Collected" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Payment List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium text-foreground flex-1">Payment Reminders</h3>
          <div className="flex gap-2 flex-wrap">
            {["all", "overdue", "upcoming", "scheduled"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all capitalize ${filter === s ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                {s === "all" ? "All" : statusConfig[s]?.label || s}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg hover:text-foreground transition-colors">
            <Download className="w-3 h-3" /> Export
          </button>
          <button className="flex items-center gap-1.5 text-xs bg-foreground text-background px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-3 h-3" /> Add Reminder
          </button>
        </div>
        <div className="divide-y divide-border">
          {filtered.map((p) => {
            const cfg = statusConfig[p.status];
            const Icon = cfg.icon;
            return (
              <div key={p.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors cursor-pointer`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bgClassName}`}>
                  <Icon className={`w-4 h-4 ${cfg.className.split(" ")[0]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{p.client}</p>
                    <span className="text-xs text-muted-foreground">—</span>
                    <p className="text-xs text-muted-foreground">{p.type}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.property}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-foreground">{p.amount}</p>
                  <p className={`text-xs mt-0.5 ${p.status === "overdue" ? "text-red-400" : p.status === "upcoming" ? "text-amber-400" : "text-muted-foreground"}`}>
                    Due: {p.due}
                    {p.status === "overdue" && ` · ${p.daysOverdue}d overdue`}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.className} shrink-0`}>
                  {cfg.label}
                </span>
                <button className="shrink-0 p-2 bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="Send reminder">
                  <Bell className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
