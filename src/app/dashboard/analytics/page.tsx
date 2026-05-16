"use client";

import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
} from "recharts";
import {
  Building2, Users, UserCheck, CreditCard, Calendar, TrendingUp,
  DollarSign, Phone, Target, ArrowUpRight,
} from "lucide-react";
import { useProperties, useLeads, useClients, usePayments, useVisits, useTeam } from "@/lib/hooks/useData";

const COLORS = ["hsl(var(--foreground))", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(217, 91%, 60%)", "hsl(271, 91%, 65%)"];

const priceBuckets = [
  { range: "<50L", min: 0, max: 50 },
  { range: "50-1Cr", min: 50, max: 100 },
  { range: "1-2Cr", min: 100, max: 200 },
  { range: "2-3Cr", min: 200, max: 300 },
  { range: "3-5Cr", min: 300, max: 500 },
  { range: "5Cr+", min: 500, max: Infinity },
];

function parsePriceValue(price?: string) {
  if (!price) return 0;
  const cleaned = price.replace(/,/g, "").replace(/₹/g, "").trim();
  const value = parseFloat(cleaned) || 0;
  if (/cr/i.test(cleaned)) return value * 100;
  return value;
}

function formatCurrency(value: number) {
  if (value >= 100) return `₹${(value / 100).toFixed(1)}Cr`;
  if (value >= 1) return `₹${value.toFixed(1)}L`;
  return `₹${(value * 100).toFixed(0)}K`;
}

export default function AnalyticsPage() {
  const { data: rawProperties = [], isLoading: loadingProps } = useProperties<any[]>();
  const { data: rawLeads = [], isLoading: loadingLeads } = useLeads<any[]>();
  const { data: rawClients = [], isLoading: loadingClients } = useClients<any[]>();
  const { data: rawPayments = [], isLoading: loadingPayments } = usePayments<any[]>();
  const { data: rawVisits = [], isLoading: loadingVisits } = useVisits<any[]>();
  const { data: rawTeam = [], isLoading: loadingTeam } = useTeam<any[]>();

  const loading = loadingProps || loadingLeads || loadingClients || loadingPayments || loadingVisits || loadingTeam;

  const properties = useMemo(() => (rawProperties || []).map((p: any) => ({
    ...p, id: p._id?.toString() || p.id || "",
  })), [rawProperties]);

  const leads = useMemo(() => (rawLeads || []).map((l: any) => ({
    ...l, id: l._id?.toString() || l.id || "",
  })), [rawLeads]);

  const clients = useMemo(() => (rawClients || []).map((c: any) => ({
    ...c, id: c._id?.toString() || c.id || "",
  })), [rawClients]);

  const payments = useMemo(() => (rawPayments || []).map((p: any) => ({
    ...p, id: p._id?.toString() || p.id || "",
    amount: typeof p.amount === 'number' ? p.amount : parseFloat(p.amount) || 0,
  })), [rawPayments]);

  const visits = useMemo(() => (rawVisits || []).map((v: any) => ({
    ...v, id: v._id?.toString() || v.id || "",
  })), [rawVisits]);

  const team = useMemo(() => (rawTeam || []).map((t: any) => ({
    ...t, id: t._id?.toString() || t.id || "",
  })), [rawTeam]);

  // Property Stats
  const propertyStats = useMemo(() => ({
    total: properties.length,
    available: properties.filter((p) => p.status === "available").length,
    reserved: properties.filter((p) => p.status === "reserved").length,
    sold: properties.filter((p) => p.status === "sold").length,
  }), [properties]);

  // Price range data
  const priceRangeData = useMemo(() =>
    priceBuckets.map((bucket) => ({
      range: bucket.range,
      count: properties.filter((p) => {
        const value = parsePriceValue(p.price);
        return value >= bucket.min && value < bucket.max;
      }).length,
    })),
    [properties]
  );

  // Property type distribution
  const propertyTypeData = useMemo(() => {
    const typeMap: Record<string, number> = {};
    properties.forEach((p) => {
      const type = p.type || "Other";
      typeMap[type] = (typeMap[type] || 0) + 1;
    });
    return Object.entries(typeMap).map(([name, value]) => ({ name, value }));
  }, [properties]);

  // Lead Stats
  const leadStats = useMemo(() => ({
    total: leads.length,
    new: leads.filter((l) => (l.stage || "New") === "New").length,
    contacted: leads.filter((l) => l.stage === "Contacted").length,
    qualified: leads.filter((l) => l.stage === "Qualified" || l.stage === "Proposal").length,
    converted: leads.filter((l) => l.stage === "Converted" || l.stage === "Closed").length,
  }), [leads]);

  // Lead by stage
  const leadStageData = useMemo(() => {
    const stageMap: Record<string, number> = {};
    leads.forEach((l) => {
      const stage = l.stage || "New";
      stageMap[stage] = (stageMap[stage] || 0) + 1;
    });
    return Object.entries(stageMap).map(([name, value]) => ({ name, value }));
  }, [leads]);

  // Lead by source
  const leadSourceData = useMemo(() => {
    const sourceMap: Record<string, number> = {};
    leads.forEach((l) => {
      const source = l.source || "Other";
      sourceMap[source] = (sourceMap[source] || 0) + 1;
    });
    return Object.entries(sourceMap).map(([name, value]) => ({ name, value }));
  }, [leads]);

  // Client Stats
  const clientStats = useMemo(() => ({
    total: clients.length,
    active: clients.filter((c) => (c.status || "Active") === "Active").length,
    inactive: clients.filter((c) => c.status === "Inactive").length,
    converted: clients.filter((c) => c.status === "Converted" || c.status === "Closed").length,
  }), [clients]);

  // Client budget ranges
  const clientBudgetData = useMemo(() =>
    priceBuckets.map((bucket) => ({
      range: bucket.range,
      count: clients.filter((c) => {
        const value = parsePriceValue(c.budget);
        return value >= bucket.min && value < bucket.max;
      }).length,
    })),
    [clients]
  );

  // Payment Stats
  const paymentStats = useMemo(() => ({
    total: payments.length,
    collected: payments.filter((p) => p.status === "collected" || p.status === "paid").length,
    pending: payments.filter((p) => p.status === "scheduled" || p.status === "pending").length,
    overdue: payments.filter((p) => p.status === "overdue").length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    collectedAmount: payments.filter((p) => p.status === "collected" || p.status === "paid").reduce((sum, p) => sum + p.amount, 0),
  }), [payments]);

  // Payment by status
  const paymentStatusData = useMemo(() => {
    const statusMap: Record<string, number> = {};
    payments.forEach((p) => {
      const status = p.status || "scheduled";
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    return Object.entries(statusMap).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [payments]);

  // Visit Stats
  const visitStats = useMemo(() => ({
    total: visits.length,
    scheduled: visits.filter((v) => (v.status || "scheduled") === "scheduled").length,
    completed: visits.filter((v) => v.status === "completed" || v.status === "done").length,
    cancelled: visits.filter((v) => v.status === "cancelled").length,
  }), [visits]);

  // Visit by status
  const visitStatusData = useMemo(() => {
    const statusMap: Record<string, number> = {};
    visits.forEach((v) => {
      const status = v.status || "scheduled";
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    return Object.entries(statusMap).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [visits]);

  // Team performance
  const topPerformers = useMemo(() => {
    const agentPerformance: Record<string, { properties: number; leads: number; closed: number; revenue: number }> = {};
    
    team.forEach((t: any) => {
      agentPerformance[t.name] = {
        properties: 0,
        leads: 0,
        closed: t.closed || 0,
        revenue: parsePriceValue(t.revenue || "0"),
      };
    });
    
    properties.forEach((p) => {
      if (p.agent && agentPerformance[p.agent]) {
        agentPerformance[p.agent].properties += 1;
        if (p.status === "sold") {
          agentPerformance[p.agent].closed += 1;
        }
      }
    });
    
    leads.forEach((l) => {
      if (l.agent && agentPerformance[l.agent]) {
        agentPerformance[l.agent].leads += 1;
      }
    });

    return Object.entries(agentPerformance)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.closed - a.closed)
      .slice(0, 5);
  }, [team, properties, leads]);

  // Agent property distribution
  const agentPropertyData = useMemo(() => {
    const agentMap: Record<string, number> = {};
    properties.forEach((p) => {
      const agent = p.agent || "Unassigned";
      agentMap[agent] = (agentMap[agent] || 0) + 1;
    });
    return Object.entries(agentMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [properties]);

  const keyMetrics = [
    { label: "Properties", value: propertyStats.total, icon: Building2, sub: `${propertyStats.available} available` },
    { label: "Leads", value: leadStats.total, icon: UserCheck, sub: `${leadStats.new} new` },
    { label: "Clients", value: clientStats.total, icon: Users, sub: `${clientStats.active} active` },
    { label: "Payments", value: paymentStats.total, icon: CreditCard, sub: paymentStats.totalAmount > 0 ? `₹${(paymentStats.collectedAmount / 100).toFixed(1)}Cr collected` : "No payments" },
    { label: "Site Visits", value: visitStats.total, icon: Calendar, sub: `${visitStats.scheduled} scheduled` },
    { label: "Team", value: team.length, icon: Users, sub: `${topPerformers.length} active agents` },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {keyMetrics.map((metric) => (
          <div key={metric.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{metric.label}</p>
              <metric.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold text-foreground">{loading ? "..." : metric.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{metric.sub}</p>
          </div>
        ))}
      </div>

      {/* First Row: Property Stats + Lead Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Property Status Cards */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Property Status Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Available", value: propertyStats.available, color: "text-foreground" },
              { label: "Reserved", value: propertyStats.reserved, color: "text-amber-500" },
              { label: "Sold", value: propertyStats.sold, color: "text-green-500" },
              { label: "Total Value", value: propertyStats.total, color: "text-blue-500" },
            ].map((s) => (
              <div key={s.label} className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-xl font-semibold mt-1 ${s.color}`}>{loading ? "..." : s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Funnel */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">Lead Funnel</h3>
            <Target className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {[
              { label: "New Leads", value: leadStats.new, total: leadStats.total || 1 },
              { label: "Contacted", value: leadStats.contacted, total: leadStats.total || 1 },
              { label: "Qualified", value: leadStats.qualified, total: leadStats.total || 1 },
              { label: "Converted", value: leadStats.converted, total: leadStats.total || 1 },
            ].map((stage) => (
              <div key={stage.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground">{stage.label}</span>
                  <span className="text-muted-foreground">{stage.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground rounded-full transition-all"
                    style={{ width: `${(stage.value / stage.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Price Range + Lead by Stage + Lead by Source */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Listings by Price Range */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Listings by Price Range</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={priceRangeData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }} />
              <Bar dataKey="count" fill="hsl(var(--foreground))" fillOpacity={0.15} radius={[4, 4, 0, 0]} name="Properties" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leads by Stage */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Leads by Stage</h3>
          {leadStageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={leadStageData} cx="50%" cy="50%" outerRadius={60} innerRadius={35} dataKey="value" paddingAngle={3}>
                  {leadStageData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} fillOpacity={0.7} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-xs text-muted-foreground">No leads data</div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {leadStageData.slice(0, 5).map((entry, i) => (
              <span key={entry.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {entry.name}: {entry.value}
              </span>
            ))}
          </div>
        </div>

        {/* Leads by Source */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Leads by Source</h3>
          {leadSourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={leadSourceData} cx="50%" cy="50%" outerRadius={60} innerRadius={35} dataKey="value" paddingAngle={3}>
                  {leadSourceData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} fillOpacity={0.7} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-xs text-muted-foreground">No source data</div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {leadSourceData.slice(0, 5).map((entry, i) => (
              <span key={entry.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[(i + 2) % COLORS.length] }} />
                {entry.name}: {entry.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Third Row: Client Budget + Payment Status + Visit Status + Property Types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Client Budget Ranges */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-foreground mb-3">Client Budgets</h3>
          <div className="space-y-2">
            {clientBudgetData.filter(b => b.count > 0).slice(0, 5).map((b) => (
              <div key={b.range} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{b.range}</span>
                <span className="text-foreground font-medium">{b.count}</span>
              </div>
            ))}
            {clientBudgetData.filter(b => b.count > 0).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No client budget data</p>
            )}
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-foreground mb-3">Payment Status</h3>
          {paymentStatusData.length > 0 ? (
            <div className="space-y-2">
              {paymentStatusData.map((ps, i) => (
                <div key={ps.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{ps.name}</span>
                  </div>
                  <span className="text-foreground font-medium">{ps.value}</span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total Collected</span>
                  <span className="text-green-500 font-medium">{paymentStats.collectedAmount > 0 ? `₹${(paymentStats.collectedAmount / 100).toFixed(1)}Cr` : "₹0"}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">No payment data</p>
          )}
        </div>

        {/* Visit Status */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-foreground mb-3">Site Visits</h3>
          <div className="space-y-3">
            {visitStatusData.map((vs, i) => (
              <div key={vs.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{vs.name}</span>
                  <span className="text-foreground font-medium">{vs.value}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(vs.value / Math.max(visitStats.total, 1)) * 100}%`, background: COLORS[i % COLORS.length] }} />
                </div>
              </div>
            ))}
            {visitStatusData.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No visit data</p>
            )}
          </div>
        </div>

        {/* Property Types */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-foreground mb-3">Property Types</h3>
          <div className="space-y-2">
            {propertyTypeData.slice(0, 5).map((pt, i) => (
              <div key={pt.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{pt.name}</span>
                </div>
                <span className="text-foreground font-medium">{pt.value}</span>
              </div>
            ))}
            {propertyTypeData.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No property type data</p>
            )}
          </div>
        </div>
      </div>

      {/* Fourth Row: Team Performance + Agent Property Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Performers */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">Top Performing Agents</h3>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          {topPerformers.length > 0 ? (
            <div className="space-y-3">
              {topPerformers.map((agent, i) => (
                <div key={agent.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-medium text-foreground">
                    {agent.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.properties} properties · {agent.leads} leads</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-500">{agent.closed} closed</p>
                    <p className="text-xs text-muted-foreground">{agent.revenue > 0 ? `₹${(agent.revenue / 100).toFixed(1)}Cr` : "₹0"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">No team performance data</p>
          )}
        </div>

        {/* Agent Property Distribution */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Properties by Agent</h3>
          {agentPropertyData.length > 0 ? (
            <div className="space-y-2">
              {agentPropertyData.slice(0, 8).map((agent) => (
                <div key={agent.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground truncate mr-2">{agent.name}</span>
                    <span className="text-muted-foreground shrink-0">{agent.count}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground/20 rounded-full"
                      style={{ width: `${(agent.count / Math.max(...agentPropertyData.map(a => a.count), 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">No property assignment data</p>
          )}
        </div>
      </div>

      {/* Conversion Rate Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpRight className="w-4 h-4 text-green-500" />
            <h3 className="text-sm font-medium text-foreground">Lead-to-Client Rate</h3>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {loading ? "..." : leadStats.total > 0 ? `${((clientStats.total / leadStats.total) * 100).toFixed(1)}%` : "N/A"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{clientStats.total} clients from {leadStats.total} leads</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-green-500" />
            <h3 className="text-sm font-medium text-foreground">Collection Rate</h3>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {loading ? "..." : paymentStats.totalAmount > 0 ? `${((paymentStats.collectedAmount / paymentStats.totalAmount) * 100).toFixed(1)}%` : "N/A"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Collected vs total payments</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-medium text-foreground">Visit Completion Rate</h3>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {loading ? "..." : visitStats.total > 0 ? `${((visitStats.completed / visitStats.total) * 100).toFixed(1)}%` : "N/A"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{visitStats.completed} completed of {visitStats.total} visits</p>
        </div>
      </div>
    </div>
  );
}