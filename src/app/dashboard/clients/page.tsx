"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Phone,
  Mail,
  Filter,
  X,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  UserPlus,
  Search,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import AddClientModal from "../AddClientModal";
import { useClients } from "@/lib/hooks/useData";

interface Client {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  budget?: string;
  propertyInterest?: string;
  status: string;
  assignedAgent?: string;
  notes?: string;
}

const statusColors: Record<string, string> = {
  Active: "text-emerald-700 bg-emerald-50 border-emerald-100",
  "Follow Up": "text-amber-700 bg-amber-50 border-amber-100",
  Closed: "text-blue-700 bg-blue-50 border-blue-100",
  Inactive: "text-slate-500 bg-slate-50 border-slate-100",
};

const statusOptions = ["All", "Active", "Follow Up", "Closed", "Inactive"];

export default function ClientsPage() {
  const [view, setView] = useState<"list" | "grid">("list");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const { data: clients = [], isLoading: loading, mutate } = useClients<Client[]>();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;

    try {
      const res = await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || "Delete failed");
      toast.success("Client deleted");
      setSelected(null);
      setClientToEdit(null);
      await mutate();
    } catch (error: any) {
      console.error("Delete client error", error);
      toast.error(error.message || "Failed to delete client. Please try again.");
    }
  };

  const handleClientAdd = async () => {
    await mutate();
  };

  const handleClientSave = async (clientData: any) => {
    const method = clientToEdit ? "PUT" : "POST";
    const url = "/api/clients";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientToEdit ? { ...clientData, id: clientToEdit.id } : clientData),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result?.error || "Failed to save client");
    }

    setClientToEdit(null);
    await mutate();
  };

  const openEditClient = (client: Client) => {
    setSelected(null);
    setClientToEdit(client);
    setShowAddModal(true);
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.phone?.toLowerCase().includes(query) ||
        client.propertyInterest?.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "All" || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter((c) => c.status === "Active").length;
    const closed = clients.filter((c) => c.status === "Closed").length;
    const now = new Date();
    const newThisMonth = clients.filter((client) => {
      const created = new Date(client.createdAt);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    return [
      { label: "Total Clients", value: total.toString() },
      { label: "Active Clients", value: active.toString() },
      { label: "New This Month", value: newThisMonth.toString() },
      { label: "Closed Deals", value: closed.toString() },
    ];
  }, [clients]);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_auto] items-center">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              suppressHydrationWarning
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients, email, phone or interest"
              className="w-full rounded-xl border border-border bg-input px-10 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border px-3 py-2 rounded-lg hover:text-foreground transition-colors">
              <Filter className="w-3 h-3" /> Filter
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-end">
          <div className="flex bg-card border border-border rounded-lg p-1 gap-1">
            {(["list", "grid"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${view === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >
                {v === "list" ? "List View" : "Card View"}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setClientToEdit(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" /> Add Client
          </button>
        </div>
      </div>

      <AddClientModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setClientToEdit(null);
        }}
        onSave={handleClientSave}
        client={clientToEdit}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card border border-border border-dashed rounded-3xl">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-4" />
          <p className="text-sm text-muted-foreground font-medium">Fetching your client database...</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card border border-border border-dashed rounded-3xl text-center px-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
            <UserPlus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Build your client list</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-8">
            Start by adding potential buyers or tenants to track their interests and budgets.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-foreground/10"
          >
            <Plus className="w-4 h-4" /> Add Your First Client
          </button>
        </div>
      ) : (
        <> 
          {view === "list" ? (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {[
                        "Client",
                        "Contact",
                        "Budget",
                        "Interest",
                        "Status",
                        "Agent",
                        "Date",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <tr
                          key={client.id}
                          className="group hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => setSelected(client)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
                                {client.name
                                  .split(" ")
                                  .map((w) => w[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{client.name}</p>
                                <p className="text-xs text-muted-foreground">{client.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{client.phone || "-"}</td>
                          <td className="px-4 py-3 text-sm font-medium text-foreground">{client.budget || "-"}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{client.propertyInterest || "-"}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight border ${
                                statusColors[client.status] || "text-muted-foreground bg-muted border-border"
                              }`}
                            >
                              {client.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{client.assignedAgent || "-"}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {new Date(client.createdAt).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                })}
                              </span>
                              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                          No clients match your current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="group bg-card border border-border rounded-2xl p-5 hover:border-foreground/20 hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => setSelected(client)}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-foreground shrink-0">
                      {client.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{client.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight border ${
                        statusColors[client.status] || "text-muted-foreground bg-muted border-border"
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-medium">{client.budget || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interest</span>
                      <span>{client.propertyInterest || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Agent</span>
                      <span>{client.assignedAgent || "-"}</span>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      Joined {new Date(client.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </span>
                    <div className="p-1.5 rounded-lg bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-3.5 h-3.5 text-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-lg my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium text-foreground">Client Details</h2>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-xl">×</button>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-foreground">
                {selected.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-foreground">{selected.name}</p>
                <p className="text-sm text-muted-foreground">{selected.email}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <span className="text-foreground">{selected.phone || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="text-foreground">{selected.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4 shrink-0" />
                <span className="text-foreground">{selected.budget || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <FileText className="w-4 h-4 shrink-0" />
                <span className="text-foreground">{selected.propertyInterest || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="text-foreground">
                  Joined {new Date(selected.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</p>
              <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">{selected.notes || "No notes available."}</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleDelete(selected.id)}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <button
                onClick={() => openEditClient(selected)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg"
              >
                <Edit className="w-4 h-4" /> Edit Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
