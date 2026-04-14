"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Bed, Maximize2, MapPin, Plus, Search, Eye, Edit2, Upload, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CldUploadButton } from 'next-cloudinary';
import { toast } from "sonner";

interface Property {
  id: string;
  name: string;
  location?: string;
  price?: string;
  type?: string;
  status: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  agent?: string;
  images?: string[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  available: { label: "Available", className: "text-foreground bg-muted" },
  reserved: { label: "Reserved", className: "text-foreground bg-muted" },
  sold: { label: "Sold", className: "text-muted-foreground bg-muted" },
};

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

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    location: "",
    price: "",
    beds: "",
    baths: "",
    sqft: "",
    status: "available",
    images: [] as string[]
  });
  const [editMode, setEditMode] = useState(false);
  const [viewProperty, setViewProperty] = useState<Property | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/properties");
      const json = await res.json();
      if (json.data) {
        setProperties(json.data as Property[]);
      }
    } catch (error) {
      console.error("Failed to load properties:", error);
      toast.error("Could not load properties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSaveProperty = async () => {
    if (!formData.name.trim()) {
      toast.error("Property name is required");
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        name: formData.name,
        location: formData.location,
        price: formData.price,
        beds: formData.beds ? parseInt(formData.beds) : null,
        baths: formData.baths ? parseInt(formData.baths) : null,
        sqft: formData.sqft ? parseInt(formData.sqft) : null,
        status: formData.status.toLowerCase(),
        images: formData.images
      };

      let res;
      if (editMode && formData.id) {
        // Update existing property
        res = await fetch("/api/properties", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: formData.id,
            ...payload
          })
        });
      } else {
        // Create new property
        res = await fetch("/api/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error("Failed to save property");
      
      if (!editMode) {
        const json = await res.json();
        setProperties(prev => [json.data, ...prev]);
      } else {
        // Refresh list after update
        await fetchProperties();
      }
      
      setShowModal(false);
      setEditMode(false);
      setFormData({
        id: "",
        name: "",
        location: "",
        price: "",
        beds: "",
        baths: "",
        sqft: "",
        status: "available",
        images: []
      });
      toast.success(editMode ? "Property updated successfully!" : "Property added successfully!");
    } catch (error) {
      console.error("Error saving property:", error);
      toast.error("Failed to save property");
    } finally {
      setSaving(false);
    }
  };

  const handleEditProperty = (property: Property) => {
    setEditMode(true);
    setFormData({
      id: property.id,
      name: property.name,
      location: property.location || "",
      price: property.price || "",
      beds: property.beds?.toString() || "",
      baths: property.baths?.toString() || "",
      sqft: property.sqft?.toString() || "",
      status: property.status,
      images: property.images || []
    });
    setShowModal(true);
  };

  const handleViewProperty = (property: Property) => {
    setViewProperty(property);
  };

  const filtered = useMemo(
    () =>
      properties.filter((p) => {
        const matchStatus = filter === "all" || p.status === filter;
        const lowerSearch = search.toLowerCase();
        return (
          matchStatus &&
          (search === "" ||
            p.name?.toLowerCase().includes(lowerSearch) ||
            p.location?.toLowerCase().includes(lowerSearch) ||
            p.type?.toLowerCase().includes(lowerSearch))
        );
      }),
    [properties, filter, search]
  );

  const stats = useMemo(
    () => ({
      total: properties.length,
      available: properties.filter((p) => p.status === "available").length,
      reserved: properties.filter((p) => p.status === "reserved").length,
      sold: properties.filter((p) => p.status === "sold").length,
    }),
    [properties]
  );

  const priceRangeData = useMemo(
    () =>
      priceBuckets.map((bucket) => ({
        range: bucket.range,
        count: properties.filter((p) => {
          const value = parsePriceValue(p.price);
          return value >= bucket.min && value < bucket.max;
        }).length,
      })),
    [properties]
  );

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Listings", value: loading ? "..." : stats.total.toString() },
          { label: "Available", value: loading ? "..." : stats.available.toString() },
          { label: "Reserved", value: loading ? "..." : stats.reserved.toString() },
          { label: "Sold (This FY)", value: loading ? "..." : stats.sold.toString() },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{s.label}</p>
            <p className="text-2xl font-medium tracking-tight text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Listings by Price Range</h3>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={priceRangeData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
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
            <Bar dataKey="count" fill="hsl(var(--foreground))" fillOpacity={0.15} radius={[4, 4, 0, 0]} name="Properties" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:border-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'available', 'reserved', 'sold'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all capitalize ${filter === s ? "bg-foreground text-background" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
            >
              {s === 'all' ? `All (${properties.length})` : s}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-foreground/50 transition-colors cursor-pointer group">
            <div className="h-40 relative border-b border-border overflow-hidden">
              {p.images && p.images.length > 0 ? (
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Building2 className="w-12 h-12 text-foreground/20" />
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[p.status]?.className || "text-muted-foreground bg-muted"}`}>
                  {statusConfig[p.status]?.label || p.status}
                </span>
              </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleViewProperty(p); }}
                  className="w-7 h-7 bg-foreground/70 rounded-md flex items-center justify-center hover:bg-foreground transition-colors"
                >
                  <Eye className="w-3 h-3 text-background" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleEditProperty(p); }}
                  className="w-7 h-7 bg-foreground/70 rounded-md flex items-center justify-center hover:bg-foreground transition-colors"
                >
                  <Edit2 className="w-3 h-3 text-background" />
                </button>
            </div>
            </div>
            <div className="p-4">
              <p className="text-lg font-semibold text-foreground tracking-tight">{p.price || "-"}</p>
              <p className="text-sm font-medium text-foreground/80 mt-0.5">{p.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {p.location || "Unknown location"}
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{p.beds ?? "-"} Beds</span>
                <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3" />{p.sqft?.toLocaleString() ?? "-"} sqft</span>
                <span className="ml-auto">{p.agent || "-"}</span>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium text-foreground">{editMode ? "Edit Property" : "Add New Property"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
            </div>
            <div className="space-y-3">
              {[["Property Name", "name", "e.g. Prestige Skyline"], ["Location", "location", "City, Area"], ["Price", "price", "e.g. ₹1.2Cr"]].map(([label, name, placeholder]) => (
                <div key={label}>
                  <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
                  <input 
                    name={name}
                    value={formData[name as keyof typeof formData]}
                    onChange={handleInputChange}
                    placeholder={placeholder} 
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground" 
                  />
                </div>
              ))}
              <div className="grid grid-cols-3 gap-3">
                {[["Bedrooms", "beds", "3"], ["Bathrooms", "baths", "2"], ["Sq. ft.", "sqft", "1500"]].map(([label, name, placeholder]) => (
                  <div key={label}>
                    <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
                    <input 
                      name={name}
                      type="number"
                      value={formData[name as keyof typeof formData]}
                      onChange={handleInputChange}
                      placeholder={placeholder} 
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground" 
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Status</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Property Images</label>
                <CldUploadButton 
                  uploadPreset="ml_default" 
                  onUpload={(result: any) => {
                    if (result.info.secure_url) {
                      setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, result.info.secure_url]
                      }));
                      toast.success("Image uploaded!");
                    }
                  }}
                  className="w-full mt-1 bg-muted border-2 border-dashed border-border rounded-lg px-4 py-3 text-sm text-muted-foreground hover:border-foreground/50 hover:text-foreground transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Upload Images
                </CldUploadButton>
                
                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, idx) => idx !== i)
                          }))}
                          className="absolute top-0 right-0 bg-black/60 text-white p-0.5 rounded-bl"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={handleSaveProperty} 
              disabled={saving}
              className="w-full mt-5 bg-foreground text-background py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? (editMode ? "Saving..." : "Adding...") : (editMode ? "Save Changes" : "Add Property")}
            </button>
          </div>
        </div>
      )}

      {viewProperty && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setViewProperty(null)}>
          <div className="bg-background border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              {viewProperty.images && viewProperty.images.length > 0 ? (
                <img src={viewProperty.images[0]} alt={viewProperty.name} className="w-full h-56 object-cover rounded-t-2xl" />
              ) : (
                <div className="w-full h-56 flex flex-col items-center justify-center bg-muted rounded-t-2xl">
                  <Building2 className="w-16 h-16 text-foreground/20" />
                </div>
              )}
              <button onClick={() => setViewProperty(null)} className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <span className={`absolute top-3 left-3 text-xs px-3 py-1 rounded-full font-medium ${statusConfig[viewProperty.status]?.className || "text-muted-foreground bg-muted"}`}>
                {statusConfig[viewProperty.status]?.label || viewProperty.status}
              </span>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{viewProperty.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {viewProperty.location || "Unknown location"}
                  </p>
                </div>
                <p className="text-2xl font-bold text-foreground">{viewProperty.price || "-"}</p>
              </div>

              {viewProperty.images && viewProperty.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {viewProperty.images.map((img, i) => (
                    <img 
                      key={i} 
                      src={img} 
                      alt="" 
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity border-2 border-transparent"
                    />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">{viewProperty.beds ?? "-"}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Bedrooms</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">{viewProperty.baths ?? "-"}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Bathrooms</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">{viewProperty.sqft?.toLocaleString() ?? "-"}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Square Feet</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => { setViewProperty(null); handleEditProperty(viewProperty); }}
                  className="flex-1 bg-foreground text-background py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Edit Property
                </button>
                <button 
                  onClick={() => setViewProperty(null)}
                  className="flex-1 bg-muted text-foreground py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
