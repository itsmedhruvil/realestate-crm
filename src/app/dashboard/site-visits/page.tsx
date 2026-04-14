"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { Plus, ChevronLeft, ChevronRight, MapPin, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { useVisits, useClients } from "@/lib/hooks/useData";

interface SiteVisit {
  id: string;
  client?: string;
  property?: string;
  agent?: string;
  date?: string;
  time?: string;
  status: string;
  notes?: string;
}

export default function SiteVisitsPage() {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    client: "",
    property: "",
    date: "2026-03-29",
    time: "9:00 AM",
    agent: "",
    notes: "",
    status: "pending"
  });

  const { data: visits = [], isLoading: loading, mutate } = useVisits<SiteVisit[]>();
  const { data: clients = [] } = useClients<any[]>();

  useEffect(() => {
    if (visits.length > 0 && visits[0].date) {
      setSelectedDay(new Date(visits[0].date).getDate());
    }
  }, [visits]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to schedule visit");

      toast.success("Site visit scheduled!");
      setShowModal(false);
      mutate();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const visitDays = useMemo(() => new Set(visits.map((visit) => visit.date ? new Date(visit.date).getDate() : null).filter((day): day is number => day !== null)), [visits]);
  const dayVisits = useMemo(() => visits.filter((visit) => visit.date ? new Date(visit.date).getDate() === selectedDay : false), [visits, selectedDay]);

  const stats = useMemo(() => {
    const confirmed = visits.filter((visit) => visit.status === "confirmed").length;
    const pending = visits.filter((visit) => visit.status === "pending").length;
    return {
      total: visits.length,
      confirmed,
      pending,
      completed: visits.filter((visit) => visit.status === "completed").length,
    };
  }, [visits]);

  const daysInMonth = 31;
  const startDay = 0;
  const days: (number | null)[] = [...Array(startDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "This Month", value: loading ? "..." : stats.total.toString() },
          { label: "Confirmed", value: loading ? "..." : stats.confirmed.toString() },
          { label: "Pending", value: loading ? "..." : stats.pending.toString() },
          { label: "Completed", value: loading ? "..." : stats.completed.toString() },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-2xl font-medium tracking-tight text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">March 2026</h3>
            <div className="flex gap-1">
              <button className="w-7 h-7 bg-muted rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="w-7 h-7 bg-muted rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-center text-xs text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) return <div key={index} />;
              const isSelected = day === selectedDay;
              const hasVisit = visitDays.has(day);
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDay(day)}
                  className={`relative aspect-square flex items-center justify-center text-xs rounded-lg transition-all ${
                    isSelected ? "bg-muted text-foreground font-medium ring-1 ring-border" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {day}
                  {hasVisit && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-muted border border-foreground rounded-full" />}
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-muted border border-foreground inline-block" />
              Visits scheduled
              <span className="ml-auto">{visits.length} total this month</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="text-sm font-medium text-foreground">{`Mar ${selectedDay}`} — Visits</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{dayVisits.length} scheduled</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-foreground text-background px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3 h-3" /> Schedule
            </button>
          </div>
          <div className="p-4 space-y-3">
            {dayVisits.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">No visits scheduled for this day</div>
            ) : (
              dayVisits.map((visit) => (
                <div key={visit.id} className="bg-muted/30 border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{visit.property || "Unknown property"}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {visit.client || "Unknown client"}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${visit.status === "confirmed" ? "text-foreground bg-muted" : "text-muted-foreground bg-muted"}`}>
                      {visit.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {visit.time || (visit.date ? new Date(visit.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-")}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> Agent: {visit.agent || "-"}</span>
                  </div>
                  {visit.notes && <p className="text-xs text-muted-foreground mt-2 italic">{visit.notes}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium text-foreground">Schedule Site Visit</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground text-xl">×</button>
            </div>
            <form autoComplete="off" onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Client</label>
                <input
                  list="visit-client-list"
                  required
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="Search or select existing client"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                />
                <datalist id="visit-client-list">
                  {clients.map((client: any) => (
                    <option key={client.id} value={client.name} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Property</label>
                <input
                  required
                  value={formData.property}
                  onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                  placeholder="Property"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Date</label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Time</label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                  >
                    {['9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Assigned Agent</label>
                <input
                  value={formData.agent}
                  onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
                  placeholder="Agent"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special instructions..."
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground resize-none"
                />
              </div>
              <button type="submit" disabled={submitting} className="w-full mt-5 bg-foreground text-background py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                {submitting ? "Scheduling..." : "Schedule Visit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
