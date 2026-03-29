"use client";

import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, MapPin, Clock, User } from "lucide-react";

const visits = [
  { id: 1, time: "9:00 AM", property: "Prestige Skyline", location: "Bandra West, Mumbai", client: "Priya Sharma", agent: "Arjun K", status: "confirmed", day: 29, notes: "Client interested in sea view units" },
  { id: 2, time: "11:30 AM", property: "Green Valley Villa", location: "Whitefield, Bengaluru", client: "Rahul Mehta", agent: "Nisha P", status: "pending", day: 29, notes: "" },
  { id: 3, time: "2:00 PM", property: "Horizon Residency", location: "Powai, Mumbai", client: "Kavita Joshi", agent: "Arjun K", status: "confirmed", day: 29, notes: "Looking for 3 BHK units" },
  { id: 4, time: "4:30 PM", property: "The Grand Palms", location: "Sarjapur, Bengaluru", client: "Pooja Nair", agent: "Vikram S", status: "pending", day: 30, notes: "" },
  { id: 5, time: "10:00 AM", property: "Metro Suites", location: "Koramangala, Bengaluru", client: "Ravi Malhotra", agent: "Meera R", status: "confirmed", day: 31, notes: "Budget up to ₹95L" },
  { id: 6, time: "3:00 PM", property: "Sunrise Heights", location: "Andheri East, Mumbai", client: "Amit Verma", agent: "Nisha P", status: "pending", day: 31, notes: "" },
  { id: 7, time: "11:00 AM", property: "Serene Enclave", location: "Hebbal, Bengaluru", client: "Deepak Gupta", agent: "Arjun K", status: "confirmed", day: 2, notes: "" },
];

const visitDays = new Set(visits.map((v) => v.day));

export default function SiteVisitsPage() {
  const [selectedDay, setSelectedDay] = useState(29);
  const [showModal, setShowModal] = useState(false);

  const dayVisits = visits.filter((v) => v.day === selectedDay);

  // March 2026 - starts on Sunday
  const daysInMonth = 31;
  const startDay = 0;
  const days: (number | null)[] = [...Array(startDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "This Month", value: "24" },
          { label: "Confirmed", value: "16", className: "text-green-400" },
          { label: "Pending", value: "8", className: "text-amber-400" },
          { label: "Completed", value: "41" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-2xl font-medium tracking-tight ${s.className || "text-foreground"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Calendar */}
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
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-center text-xs text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              if (!d) return <div key={i} />;
              const isToday = d === 29;
              const isSelected = d === selectedDay;
              const hasVisit = visitDays.has(d);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(d)}
                  className={`relative aspect-square flex items-center justify-center text-xs rounded-lg transition-all ${
                    isToday && !isSelected ? "bg-foreground text-background font-semibold"
                    : isSelected ? "bg-zinc-700 text-foreground font-medium ring-1 ring-zinc-500"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {d}
                  {hasVisit && !isToday && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              Visits scheduled
              <span className="ml-auto">{visits.length} total this month</span>
            </div>
          </div>
        </div>

        {/* Visit List */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                {selectedDay === 29 ? "Today" : `Mar ${selectedDay}`} — Visits
              </h3>
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
              dayVisits.map((v) => (
                <div key={v.id} className="bg-muted/30 border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{v.property}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {v.location}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.status === "confirmed" ? "text-green-400 bg-green-950/50" : "text-amber-400 bg-amber-950/50"}`}>
                      {v.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {v.time}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {v.client}</span>
                    <span className="ml-auto">{v.agent}</span>
                  </div>
                  {v.notes && <p className="text-xs text-muted-foreground mt-2 pl-0 italic">{v.notes}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium">Schedule Site Visit</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground text-xl">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Client</label>
                <input placeholder="Search or enter client name" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Property</label>
                <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none">
                  <option>Prestige Skyline</option>
                  <option>Green Valley Villa</option>
                  <option>Horizon Residency</option>
                  <option>The Grand Palms</option>
                  <option>Sunrise Heights</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Date</label>
                  <input type="date" defaultValue="2026-03-29" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-zinc-500" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Time</label>
                  <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none">
                    {["9:00 AM","10:00 AM","11:00 AM","12:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Assigned Agent</label>
                <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none">
                  {["Arjun Kapoor","Nisha Patel","Vikram Singh","Meera Rao","Karan Desai"].map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Notes</label>
                <textarea rows={3} placeholder="Any special instructions..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 resize-none" />
              </div>
            </div>
            <button onClick={() => setShowModal(false)} className="w-full mt-5 bg-foreground text-background py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Schedule Visit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
