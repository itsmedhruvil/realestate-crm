"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  TrendingUp,
  Users,
  Calendar,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";

interface Lead {
  id: string;
  name: string;
  interest?: string;
  budget?: string;
  score: number;
  stage: string;
  createdAt?: string;
}

interface Property {
  id: string;
  name: string;
  type?: string;
  status?: string;
}

interface SiteVisit {
  id: string;
  property?: string;
  client?: string;
  agent?: string;
  date?: string;
  time?: string;
  status: string;
}

interface Payment {
  id: string;
  client?: string;
  property?: string;
  amount?: number;
  dueDate?: string;
  status?: string;
}

const stageColors: Record<string, string> = {
  Hot: "text-foreground bg-muted",
  Warm: "text-foreground bg-muted/80",
  Cold: "text-muted-foreground bg-muted/60",
  New: "text-foreground bg-muted/90",
  Negotiating: "text-foreground bg-muted/70",
};

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const chartColors = ["#22c55e", "#2563eb", "#fb923c", "#ea580c", "#8b5cf6"];

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (6 - day));
  d.setHours(23, 59, 59, 999);
  return d;
}

function parseDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatAmount(amount?: number) {
  if (amount == null) return "-";
  return `₹${amount.toLocaleString()}`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 text-xs">
        <p className="text-muted-foreground mb-1">{label}</p>
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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [leadsRes, propertiesRes, visitsRes, paymentsRes] = await Promise.all([
          fetch("/api/leads"),
          fetch("/api/properties"),
          fetch("/api/visits"),
          fetch("/api/payments"),
        ]);

        const leadsJson = await leadsRes.json();
        const propertiesJson = await propertiesRes.json();
        const visitsJson = await visitsRes.json();
        const paymentsJson = await paymentsRes.json();

        setLeads(leadsJson.data || []);
        setProperties(propertiesJson.data || []);
        setVisits(visitsJson.data || []);
        setPayments(paymentsJson.data || []);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        toast.error("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalRevenue = useMemo(() => payments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0), [payments]);

  const overduePayments = useMemo(() => payments.filter((payment) => payment.status === "overdue"), [payments]);

  const visitsThisWeek = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now);
    const end = endOfWeek(now);
    return visits.filter((visit) => {
      const visitDate = parseDate(visit.date);
      return visitDate ? visitDate >= start && visitDate <= end : false;
    }).length;
  }, [visits]);

  const activeListings = properties.length;
  const hotLeads = leads.filter((lead) => lead.stage === "Hot").length;

  const revenuePipeline = useMemo(() => {
    const currentDate = new Date();
    const startMonth = currentDate.getMonth();
    const startYear = currentDate.getFullYear();

    return Array.from({ length: 6 }).map((_, index) => {
      const monthIndex = (startMonth - 5 + index + 12) % 12;
      const yearOffset = Math.floor((startMonth - 5 + index) / 12);
      const year = startYear + yearOffset;
      const label = monthLabels[monthIndex];

      const monthTotal = payments.reduce((sum, payment) => {
        const paymentDate = parseDate(payment.dueDate);
        if (!paymentDate) return sum;
        if (paymentDate.getMonth() === monthIndex && paymentDate.getFullYear() === year) {
          return sum + (payment.amount ?? 0);
        }
        return sum;
      }, 0);

      return {
        month: label,
        revenue: Number((monthTotal / 100000).toFixed(1)),
        target: Number((monthTotal / 100000 + 10).toFixed(1)),
      };
    });
  }, [payments]);

  const dealTypeData = useMemo(() => {
    const counts = properties.reduce<Record<string, number>>((acc, property) => {
      const key = property.type || "Other";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      color: chartColors[index % chartColors.length],
    }));
  }, [properties]);

  const upcomingVisits = useMemo(() => {
    const now = new Date();
    return visits
      .map((visit) => ({ ...visit, dateObj: parseDate(visit.date) }))
      .filter((visit) => visit.dateObj && visit.dateObj >= now)
      .sort((a, b) => (a.dateObj!.getTime() - b.dateObj!.getTime()));
  }, [visits]);

  const recentLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      const aDate = parseDate(a.createdAt) ?? new Date(0);
      const bDate = parseDate(b.createdAt) ?? new Date(0);
      return bDate.getTime() - aDate.getTime();
    });
  }, [leads]);

  const statCards = [
    {
      label: "Total Revenue",
      value: loading ? "..." : formatAmount(totalRevenue),
      change: loading ? "..." : `${totalRevenue > 0 ? "+12.4%" : "0%"}`,
      up: totalRevenue >= 0,
      icon: TrendingUp,
    },
    {
      label: "Active Listings",
      value: loading ? "..." : activeListings.toString(),
      change: loading ? "..." : "+3 this week",
      up: true,
      icon: Building2,
    },
    {
      label: "Hot Leads",
      value: loading ? "..." : hotLeads.toString(),
      change: loading ? "..." : leads.length > 0 ? "-2 from last week" : "0%",
      up: hotLeads >= 0,
      icon: Users,
    },
    {
      label: "Visits This Week",
      value: loading ? "..." : visitsThisWeek.toString(),
      change: loading ? "..." : "+5 scheduled",
      up: true,
      icon: Calendar,
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl lg:text-3xl font-medium tracking-tight text-foreground">{stat.value}</p>
            <div className="flex items-center gap-1 mt-2">
              {stat.up ? <ArrowUpRight className="w-3 h-3 text-foreground" /> : <ArrowDownRight className="w-3 h-3 text-foreground" />}
              <span className="text-xs text-foreground">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

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
            <AreaChart data={revenuePipeline}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="target" stroke="hsl(var(--foreground))" strokeWidth={1.5} fill="none" strokeDasharray="4 4" name="Target" />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
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
                {dealTypeData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {dealTypeData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-muted-foreground flex-1">{d.name}</span>
                <span className="text-xs font-medium text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-sm font-medium text-foreground">Recent Leads</h3>
            <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
                  {lead.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{lead.interest} · {lead.budget}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                    style={{
                      background: lead.score >= 80 ? "hsl(var(--grey-800))" : lead.score >= 60 ? "hsl(var(--grey-700))" : "hsl(var(--grey-600))",
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

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-sm font-medium text-foreground">Upcoming Visits</h3>
            <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
          <div className="p-4 space-y-3">
            {upcomingVisits.map((visit) => (
              <div key={visit.id} className="flex items-center gap-3 bg-muted/40 border border-border rounded-lg p-3 hover:bg-muted/60 transition-colors cursor-pointer">
                <div className="text-xs text-muted-foreground w-20 shrink-0 font-medium">
                  {visit.time || (visit.date ? new Date(visit.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{visit.property || "Unknown property"}</p>
                  <p className="text-xs text-muted-foreground">{visit.client}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${visit.status === "confirmed" ? "text-foreground bg-muted" : "text-muted-foreground bg-muted/60"}`}>
                  {visit.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">Overdue Payments</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-foreground bg-muted">{overduePayments.length} overdue</span>
          </div>
          <AlertCircle className="w-4 h-4 text-foreground" />
        </div>
        <div className="divide-y divide-border">
          {overduePayments.map((payment) => (
            <div key={payment.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{payment.property || "Unknown property"}</p>
                <p className="text-xs text-muted-foreground">Client: {payment.client || "-"}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-foreground">{formatAmount(payment.amount)}</p>
                <p className="text-xs text-muted-foreground">Due: {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : "-"}</p>
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
