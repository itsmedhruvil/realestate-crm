"use client";

import { Phone, Home, FileText, DollarSign, UserPlus, Calendar, CheckCircle2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const activityData = [
  { day: "Mon", activities: 12 }, { day: "Tue", activities: 18 }, { day: "Wed", activities: 15 },
  { day: "Thu", activities: 22 }, { day: "Fri", activities: 19 }, { day: "Sat", activities: 8 }, { day: "Sun", activities: 14 },
];

const actTypeData = [
  { type: "Calls", count: 34 }, { type: "Visits", count: 18 }, { type: "Notes", count: 27 },
  { type: "Deals", count: 8 }, { type: "Payments", count: 13 },
];

const activityFeed = [
  { id: 1, text: "Called Priya Sharma re: Prestige Skyline viewing", agent: "Arjun K", time: "2 hours ago", icon: Phone, iconBg: "bg-blue-950/50", iconColor: "text-blue-400" },
  { id: 2, text: "Site visit completed — Green Valley Villa with Rahul Mehta", agent: "Nisha P", time: "4 hours ago", icon: Home, iconBg: "bg-green-950/50", iconColor: "text-green-400" },
  { id: 3, text: "Follow-up note added for Kavita Joshi — prefers ground floor villa", agent: "Meera R", time: "5 hours ago", icon: FileText, iconBg: "bg-zinc-800", iconColor: "text-zinc-400" },
  { id: 4, text: "Deal closed! Metro Suites — Ravi Malhotra ₹1.1Cr", agent: "Vikram S", time: "Yesterday", icon: CheckCircle2, iconBg: "bg-green-950/50", iconColor: "text-green-400" },
  { id: 5, text: "New lead assigned — Ravi Malhotra (2.5 BHK, ₹95L)", agent: "Arjun K", time: "Yesterday", icon: UserPlus, iconBg: "bg-blue-950/50", iconColor: "text-blue-400" },
  { id: 6, text: "Payment reminder sent to Deepak Gupta — ₹6.5L due Apr 5", agent: "Nisha P", time: "2 days ago", icon: DollarSign, iconBg: "bg-amber-950/50", iconColor: "text-amber-400" },
  { id: 7, text: "Site visit scheduled — Horizon Residency with Pooja Nair", agent: "Arjun K", time: "2 days ago", icon: Calendar, iconBg: "bg-purple-950/50", iconColor: "text-purple-400" },
  { id: 8, text: "Follow-up call — Amit Verma, interested in studio apartment", agent: "Nisha P", time: "3 days ago", icon: Phone, iconBg: "bg-blue-950/50", iconColor: "text-blue-400" },
];

export default function ActivitiesPage() {
  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "This Week", value: "108" },
          { label: "Calls Made", value: "34", className: "text-blue-400" },
          { label: "Visits Done", value: "18", className: "text-green-400" },
          { label: "Deals Closed", value: "3", className: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-2xl font-medium tracking-tight ${s.className || "text-foreground"}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Activity This Week</h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="day" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="activities" stroke="#e8e8e8" strokeWidth={2} dot={{ fill: "#e8e8e8", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Activity by Type</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={actTypeData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis type="number" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="type" type="category" tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="rgba(245,245,245,0.2)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">Recent Activity</h3>
        </div>
        <div className="divide-y divide-border">
          {activityFeed.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors cursor-pointer">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${a.iconBg}`}>
                  <Icon className={`w-4 h-4 ${a.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{a.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.agent}</p>
                </div>
                <p className="text-xs text-muted-foreground shrink-0">{a.time}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
