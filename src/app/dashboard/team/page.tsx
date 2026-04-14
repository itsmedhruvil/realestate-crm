"use client";

import { useEffect, useMemo, useState } from "react";
import { Phone, Mail, TrendingUp, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";
import AddTeamMemberModal from "@/components/AddTeamMemberModal";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  revenue?: string;
  joinedDate?: string;
}

function parseRevenueValue(revenue?: string) {
  if (!revenue) return 0;
  const cleaned = revenue.replace(/[^0-9.]/g, "").trim();
  const value = parseFloat(cleaned) || 0;
  if (/cr/i.test(revenue)) return value * 100;
  return value;
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/team");
        const json = await res.json();
        if (json.data) {
          setTeam(json.data as TeamMember[]);
        }
      } catch (error) {
        console.error("Failed to load team members:", error);
        toast.error("Could not load team members.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const stats = useMemo(() => {
    const totalAgents = team.length;
    const leadsHandled = totalAgents * 12;
    const closedDeals = totalAgents * 3;
    const avgDealSize = totalAgents > 0 ? `₹${(team.reduce((sum, member) => sum + parseRevenueValue(member.revenue), 0) / totalAgents).toFixed(0)}L` : "-";
    const conversionRate = totalAgents > 0 ? `${Math.round((closedDeals / leadsHandled) * 100)}%` : "-";

    return { totalAgents, avgDealSize, leadsHandled, conversionRate };
  }, [team]);

  const performanceData = useMemo(
    () => team.map((member) => ({
      name: member.name.split(" ")[0],
      revenue: parseRevenueValue(member.revenue),
      leads: 12,
    })),
    [team]
  );

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Agents", value: loading ? "..." : stats.totalAgents.toString() },
          { label: "Avg Deal Size", value: loading ? "..." : stats.avgDealSize },
          { label: "Leads Handled", value: loading ? "..." : stats.leadsHandled.toString() },
          { label: "Conversion Rate", value: loading ? "..." : stats.conversionRate },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-2xl font-medium tracking-tight text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Team Performance</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md">Revenue in Lakhs ₹</span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={performanceData} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
                color: "hsl(var(--foreground))",
              }}
            />
            <Bar dataKey="revenue" fill="hsl(var(--foreground))" fillOpacity={0.2} radius={[4, 4, 0, 0]} name="Revenue (L)" />
            <Bar dataKey="leads" fill="hsl(var(--foreground))" fillOpacity={0.08} radius={[4, 4, 0, 0]} name="Leads" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Team Members</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" /> Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => {
          const convRate = 25;
          return (
            <div key={member.id} className="bg-card border border-border rounded-xl p-5 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-base font-semibold text-foreground shrink-0">
                  {member.name.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-foreground" />
                    <span className="text-xs font-medium text-foreground">{member.revenue ? `${parseRevenueValue(member.revenue)}L` : "-"}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Email", value: member.email || "-" },
                  { label: "Phone", value: member.phone || "-" },
                  { label: "Joined", value: member.joinedDate || "-" },
                ].map((item) => (
                  <div key={item.label} className="bg-muted/50 rounded-lg p-2.5 text-center text-[10px] uppercase tracking-[0.18em]">
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="text-xs font-semibold text-foreground mt-1">{item.value}</p>
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

      <AddTeamMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMember={async (member) => {
          const res = await fetch("/api/team", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(member),
          });
          
          if (!res.ok) {
            throw new Error("Failed to add team member");
          }

          const json = await res.json();
          if (json.data) {
            setTeam(prev => [...prev, json.data]);
          }
        }}
      />
    </div>
  );
}