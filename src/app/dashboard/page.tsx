"use client";

import { useState } from "react";
import {
  Building2, TrendingUp, Users, Calendar, CreditCard, ArrowUpRight,
  ArrowDownRight, Home, Layers, Eye, ChevronRight, AlertCircle
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const revenueData = [
  { month: "Oct", revenue: 85, target: 90 },
  { month: "Nov", revenue: 112, target: 100 },
  { month: "Dec", revenue: 145, target: 120 },
  { month: "Jan", revenue: 98, target: 110 },
  { month: "Feb", revenue: 128, target: 115 },
  { month: "Mar", revenue: 163, target: 130 },
];

const dealTypeData = [
  { name: "Residential", value: 45, color: "#f5f5f5" },
  { name: "Commercial", value: 20, color: "#555" },
  { name: "Villa", value: 25, color: "#888" },
  { name: "Plot", value: 10, color: "#333" },
];

const leads = [
  { name: "Priya Sharma", interest: "3 BHK Residential", budget: "₹1.2Cr", stage: "Hot", score: 92 },
  { name: "Kavita Joshi", interest: "Luxury Villa", budget: "₹3.1Cr", stage: "Hot", score: 88 },
  { name: "Rahul Mehta", interest: "2 BHK Apartment", budget: "₹85L", stage: "Warm", score: 74 },
  { name: "Pooja Nair", interest: "4 BHK Row House", budget: "₹1.8Cr", stage: "Negotiating", score: 81 },
  { name: "Ravi Malhotra", interest: "2.5 BHK", budget: "₹95L", stage: "Warm", score: 71 },
];

const visits = [
  { time: "9:00 AM", property: "Prestige Skyline", client: "Priya Sharma", status: "confirmed" },
  { time: "11:30 AM", property: "Green Valley Villa", client: "Rahul Mehta", status: "pending" },
  { time: "2:00 PM", property: "Horizon Residency", client: "Kavita Joshi", status: "confirmed" },
];

const payments = [
  { client: "Priya Sharma", property: "Prestige Skyline", amount: "₹24,00,000", due: "Mar 15", daysOverdue: 14 },
  { client: "Kavita Joshi", property: "The Grand Palms", amount: "₹52,00,000", due: "Mar 20", daysOverdue: 9 },
  { client: "Pooja Nair", property: "Green Valley Villa", amount: "₹38,00,000", due: "Mar 28", daysOverdue: 1 },
];

const stageColors: Record<string, string> = {
  Hot: "text-foreground bg-muted",
  Warm: "text-foreground bg-muted/80",
  Cold: "text-muted-foreground bg-muted/60",
  New: "text-foreground bg-muted/90",
  Negotiating: "text-foreground bg-muted/70",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs">
        <p className="text-zinc-400 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: ₹{p.value}L
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { label: "Total Revenue", value: "₹4.2Cr", change: "+12.4%", up: true, icon: TrendingUp },
          { label: "Active Listings", value: "24", change: "+3 this week", up: true, icon: Building2 },
          { label: "Hot Leads", value: "8", change: "-2 from last week", up: false, icon: Users },
          { label: "Visits This Week", value: "17", change: "+5 scheduled", up: true, icon: Calendar },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl lg:text-3xl font-medium tracking-tight text-foreground">{stat.value}</p>
            <div className="flex items-center gap-1 mt-2">
              {stat.up ? (
                <ArrowUpRight className="w-3 h-3 text-foreground" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-foreground" />
              )}
              <span className={`text-xs ${stat.up ? "text-foreground" : "text-foreground"}`}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-medium text-foreground">Revenue Pipeline</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Last 6 months vs target</p>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md">in Lakhs ₹</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f5f5f5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f5f5f5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="month" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="target" stroke="#444" strokeWidth={1.5} fill="none" strokeDasharray="4 4" name="Target" />
              <Area type="monotone" dataKey="revenue" stroke="#e8e8e8" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="mb-5">
            <h3 className="text-sm font-medium text-foreground">Deals by Type</h3>
            <p className="text-xs text-muted-foreground mt-0.5">FY 2025–26</p>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={dealTypeData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                {dealTypeData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [`${v}%`, ""]} contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {dealTypeData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-muted-foreground flex-1">{d.name}</span>
                <span className="text-xs font-medium text-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Leads */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-sm font-medium text-foreground">Recent Leads</h3>
            <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {leads.map((lead) => (
              <div key={lead.name} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
                  {lead.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{lead.interest} · {lead.budget}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{
                      background: lead.score >= 80 ? "hsl(var(--grey-800))" : lead.score >= 60 ? "hsl(var(--grey-700))" : "hsl(var(--grey-600))",
                      color: "hsl(var(--foreground))",
                    }}
                  >
                    {lead.score}
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stageColors[lead.stage]}`}>
                    {lead.stage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Visits */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-sm font-medium text-foreground">Today&apos;s Visits</h3>
            <span className="text-xs text-muted-foreground">Mar 29, 2026</span>
          </div>
          <div className="p-4 space-y-3">
            {visits.map((v) => (
              <div key={v.time} className="flex items-center gap-3 bg-muted/40 border border-border rounded-lg p-3 hover:bg-muted/60 transition-colors cursor-pointer">
                <div className="text-xs text-muted-foreground w-20 shrink-0 font-medium">{v.time}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{v.property}</p>
                  <p className="text-xs text-muted-foreground">{v.client}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${v.status === "confirmed" ? "text-foreground bg-muted" : "text-muted-foreground bg-muted/60"}`}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Reminders */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">Overdue Payments</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-foreground bg-muted">3 overdue</span>
          </div>
          <AlertCircle className="w-4 h-4 text-foreground" />
        </div>
        <div className="divide-y divide-border">
          {payments.map((p) => (
            <div key={p.client} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{p.client}</p>
                <p className="text-xs text-muted-foreground">{p.property}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-foreground">{p.amount}</p>
                <p className="text-xs text-muted-foreground">Due: {p.due} · {p.daysOverdue}d overdue</p>
              </div>
              <button className="text-xs bg-foreground text-background px-3 py-1.5 rounded-md hover:opacity-80 transition-opacity font-medium shrink-0">
                Remind
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
