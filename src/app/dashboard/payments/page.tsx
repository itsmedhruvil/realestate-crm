"use client";

import { useMemo, useState, type ElementType, FormEvent } from "react";
import { AlertCircle, Clock, CheckCircle2, Bell, Plus, Download, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { usePayments } from "@/lib/hooks/useData";

interface Payment {
  id: string;
  client?: string;
  property?: string;
  amount?: number;
  dueDate?: string;
  type?: string;
  status: string;
}

const statusConfig: Record<string, { icon: ElementType; label: string; badge: string; bg: string }> = {
  overdue: { icon: AlertCircle, label: "Overdue", badge: "text-foreground bg-muted", bg: "bg-muted" },
  pending: { icon: Clock, label: "Pending", badge: "text-foreground bg-muted", bg: "bg-muted" },
  completed: { icon: CheckCircle2, label: "Completed", badge: "text-foreground bg-muted", bg: "bg-muted" },
  scheduled: { icon: Clock, label: "Scheduled", badge: "text-foreground bg-muted", bg: "bg-muted" },
};

export default function PaymentsPage() {
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    client: "",
    property: "",
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    type: "Down Payment",
    status: "pending"
  });

  const { data: payments = [], isLoading: loading, mutate } = usePayments<Payment[]>();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to add payment reminder");
      toast.success("Payment reminder added!");
      setShowAddModal(false);
      mutate();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(
    () => (filter === "all" ? payments : payments.filter((p) => p.status === filter)),
    [payments, filter]
  );

  const stats = useMemo(() => {
    const totalReceivable = payments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
    const overdue = payments.filter((payment) => payment.status === "overdue");
    const upcoming = payments.filter((payment) => payment.status === "pending" || payment.status === "scheduled");
    const collected = payments.filter((payment) => payment.status === "completed");

    return {
      totalReceivable,
      overdueCount: overdue.length,
      overdueAmount: overdue.reduce((sum, payment) => sum + (payment.amount ?? 0), 0),
      dueThisMonth: upcoming.reduce((sum, payment) => sum + (payment.amount ?? 0), 0),
      collected,
    };
  }, [payments]);

  const chartData = useMemo(() => {
    type Bucket = {
      label: string;
      monthIdx: number;
      year: number;
      collected: number;
      target: number;
    };

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const last6: Bucket[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6.push({
        label: months[d.getMonth()],
        monthIdx: d.getMonth(),
        year: d.getFullYear(),
        collected: 0,
        target: 0
      });
    }

    payments.forEach(p => {
      if (!p.dueDate || !p.amount) return;
      const date = new Date(p.dueDate);
      const bucket = last6.find(b => b.monthIdx === date.getMonth() && b.year === date.getFullYear());
      if (bucket) {
        const amt = p.amount / 100000;
        bucket.target += amt;
        if (p.status === "completed") bucket.collected += amt;
      }
    });

    return last6.map(b => ({ month: b.label, collected: Number(b.collected.toFixed(1)), target: Number(b.target.toFixed(1)) }));
  }, [payments]);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total Receivable",
            value: loading ? "..." : `₹${(stats.totalReceivable / 100000).toFixed(1)}L`,
            sub: `${payments.length} payments pending`,
          },
          {
            label: "Overdue",
            value: loading ? "..." : `₹${(stats.overdueAmount / 100000).toFixed(1)}L`,
            sub: `${stats.overdueCount} overdue payments`,
          },
          {
            label: "Due This Month",
            value: loading ? "..." : `₹${(stats.dueThisMonth / 100000).toFixed(1)}L`,
            sub: "Next 30 days",
          },
          {
            label: "Collected",
            value: loading ? "..." : `₹${(stats.collected.reduce((sum, payment) => sum + (payment.amount ?? 0), 0) / 100000).toFixed(1)}L`,
            sub: `${stats.collected.length} completed`,
          },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{s.label}</p>
            <p className="text-2xl font-medium tracking-tight text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Collection vs Target</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md">in Lakhs ₹</span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
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
            <Bar dataKey="target" fill="hsl(var(--foreground))" fillOpacity={0.08} radius={[3, 3, 0, 0]} name="Target" />
            <Bar dataKey="collected" fill="hsl(var(--foreground))" fillOpacity={0.5} radius={[3, 3, 0, 0]} name="Collected" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium text-foreground flex-1">Payment Reminders</h3>
          <div className="flex gap-2 flex-wrap">
            {["all", "overdue", "pending", "scheduled", "completed"].map((s) => (
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
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 text-xs bg-foreground text-background px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-3 h-3" /> Add Reminder
          </button>
        </div>
        <div className="divide-y divide-border">
          {filtered.map((payment) => {
            const cfg = statusConfig[payment.status] || statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <div key={payment.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors cursor-pointer">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <Icon className="w-4 h-4 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{payment.client || payment.property || "Unknown"}</p>
                    <span className="text-xs text-muted-foreground">—</span>
                    <p className="text-xs text-muted-foreground">{payment.type}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Property: {payment.property || "-"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-foreground">{payment.amount != null ? `₹${payment.amount.toLocaleString()}` : "-"}</p>
                  <p className="text-xs mt-0.5 text-muted-foreground">
                    Due: {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : "-"}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge} shrink-0`}>{cfg.label}</span>
                <button className="shrink-0 p-2 bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="Send reminder">
                  <Bell className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium text-foreground">Add Payment Reminder</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form autoComplete="off" onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Client</label>
                <input
                  required
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="Client name"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Property</label>
                <input
                  value={formData.property}
                  onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                  placeholder="Property name"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Amount (₹)</label>
                  <input
                    required
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Due Date</label>
                  <input
                    required
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full mt-5 bg-foreground text-background py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                {submitting ? "Adding..." : "Add Reminder"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
