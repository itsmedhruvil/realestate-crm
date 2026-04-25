"use client";

import { useEffect, useMemo, useState } from "react";
import { Phone, Mail, TrendingUp, Plus, Eye, Edit2, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";
import AddTeamMemberModal from "@/components/AddTeamMemberModal";
import { useTeam } from "@/lib/hooks/useData";
import { isAdminRole } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  revenue?: string;
  leads?: number;
  closed?: number;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const { data: team = [], isLoading: loading, mutate } = useTeam<TeamMember[]>();

  useEffect(() => {
    let cancelled = false;

    const loadRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!cancelled) {
        setIsAdmin(isAdminRole(user?.user_metadata?.role));
      }
    };

    loadRole();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDeleteTeamMember = async (id: string) => {
    if (!isAdmin) {
      toast.error("Only administrators can delete team members");
      return;
    }

    if (!confirm('Are you sure you want to delete this team member?')) return;

    try {
      const res = await fetch(`/api/team?id=${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || 'Failed to delete team member');
      toast.success('Team member deleted');
      mutate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete team member');
    }
  };

  const openTeamMemberDetails = (member: TeamMember) => {
    setSelectedMember(member);
  };

  const openEditTeamMember = (member: TeamMember) => {
    if (!isAdmin) {
      toast.error("Only administrators can edit team members");
      return;
    }

    setMemberToEdit(member);
    setIsModalOpen(true);
  };

  const closeMemberModal = () => {
    setMemberToEdit(null);
    setIsModalOpen(false);
  };

  const handleSaveTeamMember = async (member: Omit<TeamMember, "id" | "joinedDate">) => {
    if (!isAdmin) {
      throw new Error("Only administrators can manage team members");
    }

    const method = memberToEdit ? 'PUT' : 'POST';
    const body = memberToEdit ? { ...member, id: memberToEdit.id } : member;
    const res = await fetch('/api/team', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result?.error || 'Failed to save team member');
    }

    await mutate();
  };

  const stats = useMemo(() => {
    const totalAgents = team.length;
    const leadsHandled = team.reduce((sum, m) => sum + (m.leads || 0), 0);
    const closedDeals = team.reduce((sum, m) => sum + (m.closed || 0), 0);
    const avgDealSize = totalAgents > 0 ? `₹${(team.reduce((sum, member) => sum + parseRevenueValue(member.revenue), 0) / totalAgents).toFixed(0)}L` : "-";
    const conversionRate = totalAgents > 0 ? `${Math.round((closedDeals / leadsHandled) * 100)}%` : "-";

    return { totalAgents, avgDealSize, leadsHandled, conversionRate };
  }, [team]);

  const performanceData = useMemo(
    () => team.map((member) => ({
      name: member.name.split(" ")[0],
      revenue: parseRevenueValue(member.revenue),
      leads: member.leads || 0,
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
        {isAdmin && (
          <button
            onClick={() => {
              setMemberToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" /> Add Member
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => {
          const leads = member.leads || 0;
          const closed = member.closed || 0;
          const convRate = leads > 0 ? Math.round((closed / leads) * 100) : 0;
          
          return (
            <div key={member.id} className="bg-card border border-border rounded-xl p-5 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-base font-semibold text-foreground shrink-0">
                    {member.name.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openTeamMemberDetails(member)}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => openEditTeamMember(member)}
                      className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                      title="Edit member"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
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

              <div className="flex gap-2 flex-wrap">
                <button className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground py-2 rounded-lg transition-colors">
                  <Phone className="w-3 h-3" /> Call
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground py-2 rounded-lg transition-colors">
                  <Mail className="w-3 h-3" /> Email
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDeleteTeamMember(member.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-background py-2 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AddTeamMemberModal
        isOpen={isModalOpen}
        onClose={closeMemberModal}
        onSave={handleSaveTeamMember}
        member={memberToEdit}
      />

      {selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedMember(null)}>
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-[0.2em] mb-2">Team Member</p>
                <h2 className="text-2xl font-semibold text-foreground">{selectedMember.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedMember.role}</p>
              </div>
              <button onClick={() => setSelectedMember(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-5">
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Email</p>
                <p className="text-sm text-foreground">{selectedMember.email || "Not provided"}</p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Phone</p>
                <p className="text-sm text-foreground">{selectedMember.phone || "Not provided"}</p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Revenue</p>
                <p className="text-sm text-foreground">{selectedMember.revenue || "N/A"}</p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Joined</p>
                <p className="text-sm text-foreground">{selectedMember.joinedDate || "N/A"}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setMemberToEdit(selectedMember);
                  setIsModalOpen(true);
                  setSelectedMember(null);
                }}
                className="flex-1 bg-foreground text-background py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Edit Member
              </button>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="flex-1 bg-muted text-foreground py-3 rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
