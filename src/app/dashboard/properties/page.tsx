"use client";

import { useState } from "react";
import { Building2, Bed, Maximize2, MapPin, Plus, Search, Filter, Eye, Edit2, Trash2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const priceRangeData = [
  { range: "<50L", count: 2 }, { range: "50-1Cr", count: 5 }, { range: "1-2Cr", count: 8 },
  { range: "2-3Cr", count: 4 }, { range: "3-5Cr", count: 3 }, { range: "5Cr+", count: 2 },
];

const properties = [
  { id: 1, name: "Prestige Skyline", location: "Bandra West, Mumbai", price: "₹2.4Cr", type: "3 BHK Apartment", status: "available", beds: 3, baths: 3, sqft: 1850, agent: "Arjun K", bg: "#0d1520" },
  { id: 2, name: "Green Valley Villa", location: "Whitefield, Bengaluru", price: "₹3.8Cr", type: "4 BHK Villa", status: "reserved", beds: 4, baths: 4, sqft: 3200, agent: "Nisha P", bg: "#0d200d" },
  { id: 3, name: "Sunrise Heights", location: "Andheri East, Mumbai", price: "₹85L", type: "2 BHK Apartment", status: "available", beds: 2, baths: 2, sqft: 1100, agent: "Vikram S", bg: "#1a100a" },
  { id: 4, name: "Metro Suites", location: "Koramangala, Bengaluru", price: "₹1.1Cr", type: "2.5 BHK", status: "sold", beds: 3, baths: 2, sqft: 1450, agent: "Meera R", bg: "#100d1a" },
  { id: 5, name: "Horizon Residency", location: "Powai, Mumbai", price: "₹1.6Cr", type: "3 BHK Penthouse", status: "available", beds: 3, baths: 3, sqft: 2100, agent: "Arjun K", bg: "#0a101a" },
  { id: 6, name: "The Grand Palms", location: "Sarjapur, Bengaluru", price: "₹5.2Cr", type: "5 BHK Luxury Villa", status: "available", beds: 5, baths: 5, sqft: 5800, agent: "Nisha P", bg: "#100d0a" },
  { id: 7, name: "Serene Enclave", location: "Hebbal, Bengaluru", price: "₹72L", type: "2 BHK Apartment", status: "available", beds: 2, baths: 2, sqft: 980, agent: "Karan D", bg: "#0d1a1a" },
  { id: 8, name: "Silver Oak Residency", location: "Thane, Mumbai", price: "₹1.3Cr", type: "3 BHK", status: "reserved", beds: 3, baths: 2, sqft: 1620, agent: "Sneha K", bg: "#1a1505" },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  available: { label: "Available", className: "text-green-400 bg-green-950/50" },
  reserved: { label: "Reserved", className: "text-amber-400 bg-amber-950/50" },
  sold: { label: "Sold", className: "text-zinc-400 bg-zinc-800" },
};

export default function PropertiesPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = properties.filter((p) => {
    const matchStatus = filter === "all" || p.status === filter;
    const matchSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Listings", value: "24" },
          { label: "Available", value: "16", className: "text-green-400" },
          { label: "Reserved", value: "5", className: "text-amber-400" },
          { label: "Sold (This FY)", value: "3", className: "text-zinc-400" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-2xl font-medium tracking-tight ${s.className || "text-foreground"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Listings by Price Range</h3>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={priceRangeData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="range" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" fill="rgba(245,245,245,0.15)" radius={[4, 4, 0, 0]} name="Properties" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:border-zinc-600 placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "available", "reserved", "sold"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all capitalize ${filter === s ? "bg-foreground text-background" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
            >
              {s === "all" ? `All (${properties.length})` : s}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity ml-auto"
        >
          <Plus className="w-4 h-4" /> Add Property
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-zinc-600 transition-colors cursor-pointer group">
            <div className="h-40 flex items-center justify-center relative" style={{ background: p.bg }}>
              <Building2 className="w-12 h-12 text-white/10" />
              <div className="absolute top-3 left-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[p.status].className}`}>
                  {statusConfig[p.status].label}
                </span>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button className="w-7 h-7 bg-black/60 rounded-md flex items-center justify-center"><Eye className="w-3 h-3 text-white" /></button>
                <button className="w-7 h-7 bg-black/60 rounded-md flex items-center justify-center"><Edit2 className="w-3 h-3 text-white" /></button>
              </div>
            </div>
            <div className="p-4">
              <p className="text-lg font-semibold text-foreground tracking-tight">{p.price}</p>
              <p className="text-sm font-medium text-foreground/80 mt-0.5">{p.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {p.location}
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{p.beds} Beds</span>
                <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3" />{p.sqft.toLocaleString()} sqft</span>
                <span className="ml-auto">{p.agent}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground text-sm">
            No properties found
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium text-foreground">Add New Property</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
            </div>
            <div className="space-y-3">
              {[["Property Name", "e.g. Prestige Skyline"], ["Location", "City, Area"], ["Price", "e.g. ₹1.2Cr"]].map(([label, placeholder]) => (
                <div key={label}>
                  <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
                  <input placeholder={placeholder} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
                </div>
              ))}
              <div className="grid grid-cols-3 gap-3">
                {[["Bedrooms", "3"], ["Bathrooms", "2"], ["Sq. ft.", "1500"]].map(([label, placeholder]) => (
                  <div key={label}>
                    <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
                    <input placeholder={placeholder} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Status</label>
                <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none">
                  <option>Available</option><option>Reserved</option><option>Sold</option>
                </select>
              </div>
            </div>
            <button onClick={() => setShowModal(false)} className="w-full mt-5 bg-foreground text-background py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Add Property
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
