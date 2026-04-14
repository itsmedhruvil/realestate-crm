"use client";

import { FormEvent, useState } from "react";
import { Plus, Phone, Mail, Filter, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { useLeads } from "@/lib/hooks/useData";

const stageOrder = ["New", "Cold", "Warm", "Hot", "Negotiating", "Closed"];
const stageColors: Record<string, string> = {
  Hot: "text-foreground bg-muted",
  Warm: "text-foreground bg-muted/80",
  Cold: "text-muted-foreground bg-muted/60",
  New: "text-foreground bg-muted/90",
  Negotiating: "text-foreground bg-muted/70",
  Closed: "text-foreground bg-muted/50",
};

const scoreColor = (n: number) =>
  n >= 80 ? { bg: "hsl(var(--grey-800))", color: "#ffffff" } : n >= 60 ? { bg: "hsl(var(--grey-700))", color: "#ffffff" } : { bg: "hsl(var(--grey-600))", color: "#ffffff" };

interface Lead {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  budget?: string;
  interest?: string;
  stage: string;
  score: number;
  agent?: string;
  source?: string;
  notes?: string;
}

export default function LeadsPage() {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    budget: "",
    interest: "",
    stage: "New",
    score: 50,
    agent: "",
    source: "",
    notes: ""
  });

  const { data: leads, isLoading: loading, mutate } = useLeads<Lead[]>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || 'Failed to create lead');

      toast.success('Lead added successfully!');
      setShowAddModal(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        budget: "",
        interest: "",
        stage: "New",
        score: 50,
        agent: "",
        source: "",
        notes: "",
      });
      mutate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add lead');
      console.error(error);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const res = await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || 'Failed to delete lead');
      toast.success('Lead deleted successfully!');
      setSelected(null);
      mutate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete lead');
      console.error(error);
    }
  };


  const leadsByStageData = stageOrder.slice(0, 5).map((s) => ({
    stage: s,
    count: (leads || []).filter((l) => l.stage === s).length,
  }));

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Stats + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-3 gap-3">
          {[
            { label: "Total Leads", value: (leads?.length || 0).toString() },
            { label: "Hot Leads", value: (leads || []).filter((l) => l.stage === "Hot").length.toString() },
            {
              label: "Avg Score",
              value: leads?.length ? Math.round(leads.reduce((a, l) => a + l.score, 0) / leads.length).toString() : "0",
            },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{s.label}</p>
              <p className="text-2xl font-medium tracking-tight text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Pipeline Distribution</p>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={leadsByStageData} barSize={20}>
              <XAxis dataKey="stage" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }} />
              <Bar dataKey="count" fill="hsl(var(--foreground))" fillOpacity={0.2} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-card border border-border rounded-lg p-1 gap-1">
          {(["list", "kanban"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${view === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
              {v === "list" ? "List View" : "Pipeline"}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border px-3 py-2 rounded-lg hover:text-foreground transition-colors">
          <Filter className="w-3 h-3" /> Filter
        </button>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity ml-auto">
          <Plus className="w-3.5 h-3.5" /> Add Lead
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-background border border-border rounded-3xl w-full max-w-3xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground mb-2">New Lead</p>
                <h2 className="text-2xl font-semibold text-foreground">Create a qualified lead profile</h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                  Capture the client details, source, budget, and status in one place. This form is built for sales ops and keeps the lead record complete.
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground text-2xl leading-none">×</button>
            </div>

            <form autoComplete="off" onSubmit={(e: FormEvent<HTMLFormElement>) => handleSubmit(e)} className="grid gap-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</span>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Client name"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</span>
                  <input
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    type="email"
                    placeholder="client@example.com"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</span>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Budget</span>
                  <input
                    value={formData.budget}
                    onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
                    placeholder="₹45,00,000"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <label className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Interest</span>
                  <input
                    value={formData.interest}
                    onChange={(e) => setFormData((prev) => ({ ...prev, interest: e.target.value }))}
                    placeholder="Residential / Commercial"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Stage</span>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData((prev) => ({ ...prev, stage: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                  >
                    {stageOrder.map((stage) => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lead Score</span>
                  <input
                    value={formData.score}
                    onChange={(e) => setFormData((prev) => ({ ...prev, score: Number(e.target.value) }))}
                    type="range"
                    min={0}
                    max={100}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>{formData.score}</span>
                    <span>100</span>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agent</span>
                  <input
                    value={formData.agent}
                    onChange={(e) => setFormData((prev) => ({ ...prev, agent: e.target.value }))}
                    placeholder="Assigned agent"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</span>
                  <input
                    value={formData.source}
                    onChange={(e) => setFormData((prev) => ({ ...prev, source: e.target.value }))}
                    placeholder="Referral, Website, Walk-in"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                  />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</span>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any context for the client, follow-up reminders, or campaign details."
                  rows={4}
                  className="w-full rounded-2xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground resize-none"
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setShowAddModal(false)} className="w-full sm:w-auto px-4 py-3 rounded-xl border border-border text-sm font-medium text-foreground bg-background hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit" className="w-full sm:w-auto px-4 py-3 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity">
                  Add Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Client", "Interest", "Budget", "Stage", "Score", "Agent", "Source", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(leads || []).map((lead) => {
                  const sc = scoreColor(lead.score);
                  return (
                    <tr key={lead.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelected(lead)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
                            {lead.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">{lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{lead.interest}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{lead.budget}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageColors[lead.stage]}`}>{lead.stage}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ background: sc.bg }}>
                          {lead.score}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{lead.agent}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{lead.source}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stageOrder.map((stage) => {
            const stageLeads = (leads || []).filter((l) => l.stage === stage);
            return (
              <div key={stage} className="flex-shrink-0 w-64 bg-card border border-border rounded-xl flex flex-col" style={{ maxHeight: "calc(100vh - 300px)" }}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                  <span className="text-sm font-medium text-foreground">{stage}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${stageColors[stage]}`}>{stageLeads.length}</span>
                </div>
                <div className="p-3 flex-1 overflow-y-auto space-y-2">
                  {stageLeads.map((l) => {
                    const sc = scoreColor(l.score);
                    return (
                      <div key={l.id} className="bg-muted/40 border border-border rounded-lg p-3 cursor-pointer hover:bg-muted/60 transition-colors" onClick={() => setSelected(l)}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-foreground">{l.name}</p>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ background: sc.bg }}>{l.score}</div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{l.interest}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground">{l.budget}</span>
                          <span className="text-xs text-muted-foreground">{l.agent}</span>
                        </div>
                      </div>
                    );
                  })}
                  {stageLeads.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No leads</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium text-foreground">Lead Details</h2>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-xl">×</button>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-foreground">
                {selected.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">{selected.name}</p>
                <p className="text-sm text-muted-foreground">{selected.email}</p>
              </div>
              <span className={`ml-auto text-xs px-2 py-1 rounded-full font-medium ${stageColors[selected.stage]}`}>{selected.stage}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[["Budget", selected.budget], ["Interest", selected.interest], ["Agent", selected.agent], ["Source", selected.source]].map(([k, v]) => (
                <div key={k} className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{k}</p>
                  <p className="text-sm font-medium text-foreground">{v}</p>
                </div>
              ))}
            </div>
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Lead Score</span>
                <span className="font-medium text-foreground">{selected.score}/100</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${selected.score}%`, background: "hsl(var(--foreground))" }} />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                <Phone className="w-3.5 h-3.5" /> Call
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Visit
              </button>
            </div>
            <div className="mt-4 flex justify-between gap-2">
              <button
                onClick={() => handleDeleteLead(selected.id)}
                className="flex-1 bg-red-600 text-background py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Delete Lead
              </button>
              <button
                onClick={() => setSelected(null)}
                className="flex-1 bg-muted text-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
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
