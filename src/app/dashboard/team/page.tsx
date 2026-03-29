"use client";

import { Phone, Mail, TrendingUp, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer as RC2 } from "recharts";

const team = [
  { id: 1, name: "Arjun Kapoor", role: "Senior Agent", initials: "AK", leads: 28, closed: 7, revenue: "₹1.4Cr", revenueNum: 140, phone: "+91 98765 43210", email: "arjun@estateos.in", bg: "#0d1520", joined: "Jan 2023", rating: 4.8 },
  { id: 2, name: "Nisha Patel", role: "Property Consultant", initials: "NP", leads: 22, closed: 5, revenue: "₹98L", revenueNum: 98, phone: "+91 87654 32109", email: "nisha@estateos.in", bg: "#0d200d", joined: "Mar 2023", rating: 4.6 },
  { id: 3, name: "Vikram Singh", role: "Sales Executive", initials: "VS", leads: 18, closed: 4, revenue: "₹72L", revenueNum: 72, phone: "+91 76543 21098", email: "vikram@estateos.in", bg: "#1a0d0d", joined: "Jun 2023", rating: 4.2 },
  { id: 4, name: "Meera Rao", role: "Senior Consultant", initials: "MR", leads: 24, closed: 6, revenue: "₹1.1Cr", revenueNum: 110, phone: "+91 65432 10987", email: "meera@estateos.in", bg: "#1a1505", joined: "Feb 2023", rating: 4.7 },
  { id: 5, name: "Karan Desai", role: "Property Executive", initials: "KD", leads: 14, closed: 3, revenue: "₹54L", revenueNum: 54, phone: "+91 54321 09876", email: "karan@estateos.in", bg: "#0d1020", joined: "Sep 2023", rating: 4.1 },
  { id: 6, name: "Sneha Kulkarni", role: "Sales Executive", initials: "SK", leads: 11, closed: 2, revenue: "₹38L", revenueNum: 38, phone: "+91 43210 98765", email: "sneha@estateos.in", bg: "#0d2018", joined: "Nov 2023", rating: 3.9 },
];

const performanceData = team.map((m) => ({
  name: m.initials,
  revenue: m.revenueNum,
  leads: m.leads,
  closed: m.closed,
}));

export default function TeamPage() {
  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Agents", value: "12" },
          { label: "Avg Deal Size", value: "₹48L" },
          { label: "Leads Handled", value: "94" },
          { label: "Conversion Rate", value: "23%", className: "text-green-400" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-2xl font-medium tracking-tight ${s.className || "text-foreground"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Team Performance</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md">Revenue in Lakhs ₹</span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={performanceData} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="name" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="revenue" fill="rgba(245,245,245,0.2)" radius={[4, 4, 0, 0]} name="Revenue (L)" />
            <Bar dataKey="leads" fill="rgba(245,245,245,0.08)" radius={[4, 4, 0, 0]} name="Leads" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Team Members</h3>
        <button className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-3.5 h-3.5" /> Add Member
        </button>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((m) => {
          const convRate = Math.round((m.closed / m.leads) * 100);
          return (
            <div key={m.id} className="bg-card border border-border rounded-xl p-5 hover:border-zinc-600 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center text-base font-semibold text-foreground shrink-0"
                  style={{ background: m.bg }}
                >
                  {m.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-amber-400" />
                    <span className="text-xs font-medium text-amber-400">{m.rating}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Leads", value: m.leads },
                  { label: "Closed", value: m.closed, className: "text-green-400" },
                  { label: "Revenue", value: m.revenue },
                ].map((s) => (
                  <div key={s.label} className="bg-muted/50 rounded-lg p-2.5 text-center">
                    <p className={`text-sm font-medium ${s.className || "text-foreground"}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Conversion</span>
                  <span className="font-medium text-foreground">{convRate}%</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-foreground/70 rounded-full" style={{ width: `${convRate}%` }} />
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground py-2 rounded-lg transition-colors">
                  <Phone className="w-3 h-3" /> Call
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground py-2 rounded-lg transition-colors">
                  <Mail className="w-3 h-3" /> Email
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
