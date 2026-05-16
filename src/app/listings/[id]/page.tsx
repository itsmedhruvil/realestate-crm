"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Building2, MapPin, Bed, Maximize2, ChevronLeft, ChevronRight, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface PropertyDetail {
  id: string;
  name: string;
  location: string;
  price: string;
  type: string;
  status: string;
  beds: number;
  baths: number;
  sqft: number;
  agent: string;
  description: string;
  images: string[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  available: { label: "Available", className: "text-background bg-foreground" },
  reserved: { label: "Reserved", className: "text-background bg-foreground/70" },
  sold: { label: "Sold", className: "text-background bg-muted-foreground/50" },
};

export default function PropertyDetailPage() {
  const params = useParams();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`/api/properties?id=${params.id}`);
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data[0] : json.data;
        if (data) {
          setProperty({
            id: data._id || data.id,
            name: data.name,
            location: data.location || "",
            price: data.price || "",
            type: data.type || "",
            status: data.status,
            beds: data.beds,
            baths: data.baths,
            sqft: data.sqft,
            agent: data.agent || "",
            description: data.description || "",
            images: data.images || [],
          });
        }
      } catch (err) {
        console.error("Failed to load property", err);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchProperty();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    try {
      setSending(true);
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
          propertyId: params.id,
          propertyName: property?.name,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
      toast.success("Inquiry submitted! We'll get back to you shortly.");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="w-5 h-5 animate-pulse" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Building2 className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Property not found</p>
        <Link href="/listings" className="text-sm font-medium text-foreground underline underline-offset-4">
          Browse all listings
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/listings" className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="flex h-7 w-7 items-center justify-center rounded bg-foreground text-background">
                  <Building2 className="h-3.5 w-3.5" />
                </span>
                PropDesk Listings
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 lg:px-6 py-8">
        {/* Back link */}
        <Link
          href="/listings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Left: Property details */}
          <div>
            {/* Image gallery */}
            <div className="relative rounded-xl overflow-hidden bg-muted border border-border">
              {property.images && property.images.length > 0 ? (
                <>
                  <img
                    src={property.images[activeImageIndex]}
                    alt={property.name}
                    className="w-full h-72 lg:h-96 object-cover"
                  />
                  {property.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveImageIndex((prev) => (prev + 1) % property.images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-72 lg:h-96 flex flex-col items-center justify-center">
                  <Building2 className="w-16 h-16 text-foreground/20" />
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[property.status]?.className || "text-background bg-foreground"}`}>
                  {statusConfig[property.status]?.label || property.status}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {property.images && property.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border shrink-0 ${
                      activeImageIndex === i ? "border-foreground" : "border-border"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Details */}
            <div className="mt-6 space-y-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">{property.name}</h1>
                {property.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {property.location}
                  </p>
                )}
              </div>

              <p className="text-3xl font-bold text-foreground">{property.price || "Price on request"}</p>

              <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">{property.beds ?? "-"}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Bedrooms</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">{property.baths ?? "-"}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Bathrooms</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">{property.sqft?.toLocaleString() ?? "-"}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Sq. Ft.</p>
                </div>
              </div>

              {property.description && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
                </div>
              )}

              {property.agent && (
                <div className="text-xs text-muted-foreground">
                  Listed by: <span className="font-medium text-foreground">{property.agent}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Inquiry form */}
          <div>
            <div className="sticky top-8">
              {submitted ? (
                <div className="bg-card border border-border rounded-xl p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-foreground mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-foreground">Inquiry Sent!</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Thank you for your interest in <strong>{property.name}</strong>. Our team will reach out to you shortly.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setShowForm(false); setForm({ name: "", email: "", phone: "", message: "" }); }}
                    className="mt-5 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                  >
                    Browse other properties
                  </button>
                </div>
              ) : showForm ? (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-base font-semibold text-foreground">Interested in this property?</h3>
                  <p className="text-sm text-muted-foreground mt-1">Fill in your details and we'll get back to you.</p>

                  <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                      <input
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Your name *"
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="Your email *"
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
                      />
                    </div>
                    <div>
                      <input
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="Phone number"
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
                      />
                    </div>
                    <div>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        placeholder="Your message (optional)"
                        rows={3}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {sending ? "Sending..." : "Send Inquiry"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl p-6 text-center">
                  <h3 className="text-base font-semibold text-foreground">Interested?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Submit an inquiry and our team will get back to you.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-5 w-full flex items-center justify-center gap-2 bg-foreground text-background py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <Send className="w-4 h-4" /> Inquire Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-6xl px-4 lg:px-6 py-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} PropDesk. All rights reserved.
        </div>
      </footer>
    </main>
  );
}