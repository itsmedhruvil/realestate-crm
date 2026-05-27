"use client";

import { useMemo, useState, type ElementType, FormEvent } from "react";
import { AlertCircle, Clock, CheckCircle2, Bell, Plus, Download, X, TrendingUp, DollarSign, CreditCard, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { usePayments, useClients } from "@/lib/hooks/useData";
import { useUser } from "@clerk/nextjs";
import { isAdminRole } from "@/lib/auth/roles";

interface Payment {
  id: string;
  client?: string;
  property?: string;
  amount?: number;
  dueDate?: string;
  type?: string;
  status: string;
}

interface Spend {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
}

const statusConfig: Record<string, { icon: ElementType; label: string; badge: string; bg: string }> = {
  overdue: { icon: AlertCircle, label: "Overdue", badge: "text-foreground bg-muted", bg: "bg-muted" },
  pending: { icon: Clock, label: "Pending", badge: "text-foreground bg-muted", bg: "bg-muted" },
  completed: { icon: CheckCircle2, label: "Completed", badge: "text-foreground bg-muted", bg: "bg-muted" },
  scheduled: { icon: Clock, label: "Scheduled", badge: "text-foreground bg-muted", bg: "bg-muted" },
};

const spendCategories = [
  "Marketing",
  "Office Rent",
  "Utilities",
  "Salaries",
  "Transport",
  "Legal Fees",
  "Maintenance",
  "Other",
];

export default function PaymentsPage() {
  const { user } = useUser();
  const isAdmin = useMemo(() => isAdminRole(user?.unsafeMetadata?.role), [user]);

  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"payments" | "spends">("payments");
  const [showSpendModal, setShowSpendModal] = useState(false);
  const [spends, setSpends] = useState<Spend[]>([]);

  const [formData, setFormData] = useState({
    id: "",
    client: "",
    property: "",
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    type: "Down Payment",
    status: "pending"
  });

  const [spendForm, setSpendForm] = useState({
    description: "",
    category: "Other",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: "",
  });

  const [spendEditId, setSpendEditId] = useState<string | null>(null);

  const { data: payments = [], isLoading: loading, mutate } = usePayments<Payment[]>();
  const { data: clients = [] } = useClients<any[]>();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      id: formData.id,
      client: formData.client,
      property: formData.property,
      amount: formData.amount,
      dueDate: formData.dueDate,
      type: formData.type,
      status: formData.status,
    };

    try {
      const res = await fetch("/api/payments", {
        method: editMode && formData.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to save payment reminder");
      }

      toast.success(editMode ? "Payment updated!" : "Payment reminder added!");
      setShowAddModal(false);
      setEditMode(false);
      setFormData({
        id: "",
        client: "",
        property: "",
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        type: "Down Payment",
        status: "pending"
      });
      mutate();
    } catch (error: any) {
      toast.error(error.message || "Failed to save payment reminder");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment reminder?")) return;

    try {
      const res = await fetch(`/api/payments?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || "Failed to delete payment reminder");
      toast.success("Payment reminder deleted");
      mutate();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete payment reminder");
    }
  };

  const handleAddSpend = () => {
    if (!spendForm.description || !spendForm.amount || !spendForm.date) {
      toast.error("Description, amount, and date are required");
      return;
    }

    if (spendEditId) {
      setSpends(prev => prev.map(s => s.id === spendEditId ? {
        ...s,
        description: spendForm.description,
        category: spendForm.category,
        amount: spendForm.amount,
        date: spendForm.date,
        notes: spendForm.notes,
      } : s));
      toast.success("Spend updated!");
    } else {
      const newSpend: Spend = {
        id: Date.now().toString(),
        description: spendForm.description,
        category: spendForm.category,
        amount: spendForm.amount,
        date: spendForm.date,
        notes: spendForm.notes,
      };
      setSpends(prev => [newSpend, ...prev]);
      toast.success("Spend added!");
    }

    setShowSpendModal(false);
    setSpendEditId(null);
    setSpendForm({
      description: "",
      category: "Other",
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      notes: "",
    });
  };

  const handleDeleteSpend = (id: string) => {
    if (!confirm("Delete this spend entry?")) return;
    setSpends(prev => prev.filter(s => s.id !== id));
    toast.success("Spend deleted");
  };

  const handleEditSpend = (spend: Spend) => {
    setSpendEditId(spend.id);
    setSpendForm({
      description: spend.description,
      category: spend.category,
      amount: spend.amount,
      date: spend.date,
      notes: spend.notes || "",
    });
    setShowSpendModal(true);
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

    const totalSpends = spends.reduce((sum, s) => sum + s.amount, 0);
    const netRevenue = collected.reduce((sum, payment) => sum + (payment.amount ?? 0), 0) - totalSpends;

    return {
      totalReceivable,
      overdueCount: overdue.length,
      overdueAmount: overdue.reduce((sum, payment) => sum + (payment.amount ?? 0), 0),
      dueThisMonth: upcoming.reduce((sum, payment) => sum + (payment.amount ?? 0), 0),
      collected,
      totalSpends,
      netRevenue,
    };
  }, [payments, spends]);

  const spendByCategory = useMemo(() => {
    const catMap: Record<string, number> = {};
    spends.forEach(s => {
      catMap[s.category] = (catMap[s.category] || 0) + s.amount;
    });
    return Object.entries(catMap).map(([name, amount]) => ({ name, amount }));
  }, [spends]);

  const chartData = useMemo(() => {
    type Bucket = {
      label: string;
      monthIdx: number;
      year: number;
      collected: number;
      target: number;
      spends: number;
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
        target: 0,
        spends: 0,
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

    spends.forEach(s => {
      const date = new Date(s.date);
      const bucket = last6.find(b => b.monthIdx === date.getMonth() && b.year === date.getFullYear());
      if (bucket) {
        bucket.spends += s.amount / 100000;
      }
    });

    return last6.map(b => ({ 
      month: b.label, 
      collected: Number(b.collected.toFixed(1)), 
      target: Number(b.target.toFixed(1)),
      spends: Number(b.spends.toFixed(1)),
    }));
  }, [payments, spends]);

  const maxChartValue = useMemo(() => Math.max(...chartData.map(d => Math.max(d.collected, d.target, d.spends)), 1), [chartData]);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab("payments")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "payments" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
        >
          <CreditCard className="w-4 h-4" /> Payments & Reminders
        </button>
        <button
          onClick={() => setActiveTab("spends")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "spends" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
        >
          <TrendingUp className="w-4 h-4" /> Spends & Expenses
        </button>
      </div>

      {activeTab === "payments" ? (
        <>
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
            <div className="space-y-2.5">
              {chartData.map((item) => (
                <div key={item.month}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.month}</span>
                    <span className="text-foreground font-medium">₹{item.collected}L / ₹{item.target}L</span>
                  </div>
                  <div className="flex gap-1.5 h-2">
                    <div className="flex-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-foreground/20 rounded-full transition-all"
                        style={{ width: `${(item.target / maxChartValue) * 100}%` }}
                      />
                    </div>
                    <div className="flex-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-foreground/60 rounded-full transition-all"
                        style={{ width: `${(item.collected / maxChartValue) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                    <button
                      className="shrink-0 p-2 bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                      title="Send reminder"
                    >
                      <Bell className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditMode(true);
                        setFormData({
                          id: payment.id,
                          client: payment.client || "",
                          property: payment.property || "",
                          amount: payment.amount ?? 0,
                          dueDate: payment.dueDate ? payment.dueDate.split('T')[0] : new Date().toISOString().split('T')[0],
                          type: payment.type || "Down Payment",
                          status: payment.status,
                        });
                        setShowAddModal(true);
                      }}
                      className="shrink-0 p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit payment"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePayment(payment.id);
                      }}
                      className="shrink-0 p-2 bg-card border border-border rounded-lg text-red-600 hover:text-red-800 transition-colors"
                      title="Delete payment"
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Spends & Expenses Tab */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: "Total Spends",
                value: `₹${(stats.totalSpends / 100000).toFixed(1)}L`,
                sub: `${spends.length} entries`,
              },
              {
                label: "Collected",
                value: `₹${(stats.collected.reduce((sum, p) => sum + (p.amount ?? 0), 0) / 100000).toFixed(1)}L`,
                sub: `${stats.collected.length} completed`,
              },
              {
                label: "Net Revenue",
                value: `₹${(stats.netRevenue / 100000).toFixed(1)}L`,
                sub: stats.netRevenue >= 0 ? "Positive" : "Negative",
              },
              {
                label: "Avg Spend/Entry",
                value: spends.length > 0 ? `₹${(stats.totalSpends / spends.length / 1000).toFixed(1)}K` : "₹0",
                sub: `${spendByCategory.length} categories`,
              },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{s.label}</p>
                <p className="text-2xl font-medium tracking-tight text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Revenue vs Spends Chart */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Revenue vs Spends</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md">in Lakhs ₹</span>
            </div>
            <div className="space-y-2.5">
              {chartData.map((item) => (
                <div key={item.month}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.month}</span>
                    <span className="text-foreground font-medium">₹{item.collected}L / ₹{item.spends}L</span>
                  </div>
                  <div className="flex gap-1.5 h-2">
                    <div className="flex-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-foreground/60 rounded-full transition-all"
                        style={{ width: `${(item.collected / maxChartValue) * 100}%` }}
                      />
                    </div>
                    <div className="flex-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500/40 rounded-full transition-all"
                        style={{ width: `${(item.spends / maxChartValue) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spend Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-foreground mb-4">Spends by Category</h3>
              <div className="space-y-2">
                {spendByCategory.length > 0 ? (
                  spendByCategory.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{cat.name}</span>
                      <span className="text-foreground font-medium">₹{(cat.amount / 1000).toFixed(1)}K</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-6">No spends recorded yet</p>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="text-sm font-medium text-foreground">Spend Entries</h3>
                <button
                  onClick={() => {
                    setSpendEditId(null);
                    setSpendForm({
                      description: "",
                      category: "Other",
                      amount: 0,
                      date: new Date().toISOString().split('T')[0],
                      notes: "",
                    });
                    setShowSpendModal(true);
                  }}
                  className="flex items-center gap-1.5 text-xs bg-foreground text-background px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-3 h-3" /> Add Spend
                </button>
              </div>
              <div className="divide-y divide-border">
                {spends.length > 0 ? (
                  spends.map((spend) => (
                    <div key={spend.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-medium text-foreground">
                        {spend.category.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{spend.description}</p>
                        <p className="text-xs text-muted-foreground">{spend.category} · {new Date(spend.date).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground shrink-0">₹{spend.amount.toLocaleString()}</p>
                      {isAdmin && (
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => handleEditSpend(spend)} className="p-1.5 text-xs text-muted-foreground hover:text-foreground">Edit</button>
                          <button onClick={() => handleDeleteSpend(spend.id)} className="p-1.5 text-xs text-red-500 hover:text-red-700">Del</button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-8 text-center text-xs text-muted-foreground">
                    No spend entries. Click "Add Spend" to record an expense.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setEditMode(false); }}>
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium text-foreground">
                {editMode ? "Edit Payment Reminder" : "Add Payment Reminder"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditMode(false);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form autoComplete="off" onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Client</label>
                <input
                  list="payment-client-list"
                  required
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="Search or select existing client"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                />
                <datalist id="payment-client-list">
                  {clients.map((client: any) => (
                    <option key={client.id} value={client.name} />
                  ))}
                </datalist>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Type</label>
                  <input
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="Payment type"
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                  >
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full mt-5 bg-foreground text-background py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                {submitting ? (editMode ? "Saving..." : "Adding...") : editMode ? "Save Changes" : "Add Reminder"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Spend Modal */}
      {showSpendModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => { setShowSpendModal(false); setSpendEditId(null); }}>
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium text-foreground">
                {spendEditId ? "Edit Spend" : "Add Spend Entry"}
              </h2>
              <button onClick={() => { setShowSpendModal(false); setSpendEditId(null); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Description</label>
                <input
                  value={spendForm.description}
                  onChange={(e) => setSpendForm({ ...spendForm, description: e.target.value })}
                  placeholder="e.g. Office supplies"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={spendForm.category}
                    onChange={(e) => setSpendForm({ ...spendForm, category: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                  >
                    {spendCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Amount (₹)</label>
                  <input
                    type="number"
                    value={spendForm.amount}
                    onChange={(e) => setSpendForm({ ...spendForm, amount: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Date</label>
                <input
                  type="date"
                  value={spendForm.date}
                  onChange={(e) => setSpendForm({ ...spendForm, date: e.target.value })}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Notes (optional)</label>
                <input
                  value={spendForm.notes}
                  onChange={(e) => setSpendForm({ ...spendForm, notes: e.target.value })}
                  placeholder="Any additional details"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
              <button onClick={handleAddSpend} className="w-full mt-5 bg-foreground text-background py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                {spendEditId ? "Save Changes" : "Add Spend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}